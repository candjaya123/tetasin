import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../../shared/supabase.service';
import { PoolClient } from 'pg';

@Injectable()
export class AccountingRepository {
  private readonly logger = new Logger(AccountingRepository.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  getClient() {
    return this.supabaseService.getClient();
  }

  async createTransactionWithLines(entry: any, lines: any[], dbClient?: PoolClient) {
    if (dbClient) {
      const columnCheck = await dbClient.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'journal_entries'
      `);
      const cols = columnCheck.rows.map(r => r.column_name);

      const insertData: Record<string, any> = {
        tenant_id: entry.tenant_id,
        description: entry.description || entry.transaction_type,
        [cols.includes('transaction_date') ? 'transaction_date' : 'date']: entry.date || new Date().toISOString(),
      };

      // New canonical columns
      if (cols.includes('reference_type') && entry.reference_type) insertData.reference_type = entry.reference_type;
      if (cols.includes('reference_id') && entry.reference_id) insertData.reference_id = entry.reference_id;
      if (cols.includes('status')) insertData.status = entry.status || 'posted';
      if (cols.includes('idempotency_key') && entry.idempotency_key) insertData.idempotency_key = entry.idempotency_key;
      if (cols.includes('created_by') && entry.created_by) insertData.created_by = entry.created_by;

      // Legacy column fallback
      if (cols.includes('reference_doc') && !insertData.reference_type) insertData.reference_doc = entry.reference_number;
      if (cols.includes('debit_account_id')) insertData.debit_account_id = lines.find(l => (l.debit || 0) > 0)?.account_id;
      if (cols.includes('credit_account_id')) insertData.credit_account_id = lines.find(l => (l.credit || 0) > 0)?.account_id;
      if (cols.includes('amount')) insertData.amount = lines.reduce((acc, l) => acc + (l.debit || 0), 0);

      const keys = Object.keys(insertData).filter(k => cols.includes(k));
      const values = keys.map(k => insertData[k]);
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

      const entryRes = await dbClient.query(`
        INSERT INTO journal_entries (${keys.join(', ')})
        VALUES (${placeholders})
        RETURNING *
      `, values);

      const journalEntry = entryRes.rows[0];

      const tableCheck = await dbClient.query(`
        SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'journal_lines')
      `);

      if (tableCheck.rows[0].exists) {
        for (const line of lines) {
          const jlCols = await dbClient.query(`
            SELECT column_name FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'journal_lines'
          `);
          const jlNames = jlCols.rows.map(r => r.column_name);

          const jlData: Record<string, any> = {};

          // Support both new (journal_entry_id) and old (entry_id) FK column names
          if (jlNames.includes('journal_entry_id')) jlData.journal_entry_id = journalEntry.id;
          if (jlNames.includes('entry_id')) jlData.entry_id = journalEntry.id;

          jlData.account_id = line.account_id;
          jlData.debit = line.debit || 0;
          jlData.credit = line.credit || 0;

          const jlKeys = Object.keys(jlData).filter(k => jlNames.includes(k));
          const jlVals = jlKeys.map(k => jlData[k]);
          const jlPlaceholders = jlKeys.map((_, i) => `$${i + 1}`).join(', ');

          await dbClient.query(`
            INSERT INTO journal_lines (${jlKeys.join(', ')})
            VALUES (${jlPlaceholders})
          `, jlVals);
        }
      }

      return journalEntry;
    }

    const client = this.supabaseService.getClient();

    const insertPayload: Record<string, any> = {
      tenant_id: entry.tenant_id,
      description: entry.description || entry.transaction_type,
      date: entry.date || new Date().toISOString(),
    };

    // New fields (canonical)
    if (entry.reference_type) insertPayload.reference_type = entry.reference_type;
    if (entry.reference_id) insertPayload.reference_id = entry.reference_id;
    if (entry.status) insertPayload.status = entry.status;
    if (entry.idempotency_key) insertPayload.idempotency_key = entry.idempotency_key;
    if (entry.created_by) insertPayload.created_by = entry.created_by;

    // Legacy - handled by reference_type/reference_id above

    const { data: journalEntry, error: entryError } = await client
      .from('journal_entries')
      .insert(insertPayload)
      .select()
      .single();

    if (entryError) {
      throw new Error(`Failed to create journal entry: ${entryError.message}`);
    }

    const journalLines = lines.map(line => ({
      entry_id: journalEntry.id,
      account_id: line.account_id,
      debit: line.debit || 0,
      credit: line.credit || 0,
    }));

    const { error: linesError } = await client
      .from('journal_lines')
      .insert(journalLines);

    if (linesError) {
      throw new Error(`Failed to create journal lines: ${linesError.message}`);
    }

    return journalEntry;
  }

  async updateTransactionStatus(transactionId: string, status: string, dbClient?: PoolClient) {
    // Note: journal_entries doesn't have a status column in the new migration.
    // We could add it, but strategi.md says journal table is immutable.
    // For now, we'll just skip status updates for journal_entries or log them.
    this.supabaseService.getClient().from('business_events').insert({
      tenant_id: (await this.supabaseService.getClient().from('journal_entries').select('tenant_id').eq('id', transactionId).single()).data?.tenant_id,
      event_type: `journal_status_${status.toLowerCase()}`,
      payload: { journal_id: transactionId }
    });
  }

  async getAccountByCode(tenantId: string, code: string, dbClient?: PoolClient) {
    const tableNames = ['accounts', 'chart_of_accounts'];
    
    if (dbClient) {
      for (const tableName of tableNames) {
        try {
          const res = await dbClient.query(`SELECT id FROM ${tableName} WHERE tenant_id = $1 AND code = $2 LIMIT 1`, [tenantId, code]);
          if (res.rows[0]) return res.rows[0].id;
        } catch (e) {
          // Table might not exist, try next one
        }
      }
      return null;
    }
    
    const client = this.supabaseService.getClient();
    for (const tableName of tableNames) {
      const { data, error } = await client
        .from(tableName)
        .select('id')
        .eq('tenant_id', tenantId)
        .eq('code', code)
        .maybeSingle();
      if (data) return data.id;
    }
    return null;
  }

  async getAccountsByCodes(tenantId: string, codes: string[], dbClient?: PoolClient) {
    const tableNames = ['accounts', 'chart_of_accounts'];
    let foundAccounts = [];
    
    if (dbClient) {
      // 1. SAFE TABLE DETECTION: Find which table actually exists without triggering error
      const tableCheck = await dbClient.query(`
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = ANY($1)
      `, [tableNames]);
      
      const existingTables = tableCheck.rows.map(r => r.table_name);
      
      // 2. Query only the first existing table
      const tableName = tableNames.find(t => existingTables.includes(t));
      if (tableName) {
        const res = await dbClient.query(`SELECT * FROM ${tableName} WHERE tenant_id = $1 AND code = ANY($2)`, [tenantId, codes]);
        foundAccounts = res.rows;

        // 3. AUTO-SYNC if needed (same as before but safer)
        if (tableName === 'accounts' && existingTables.includes('chart_of_accounts')) {
          // Detect if normal_balance column exists in chart_of_accounts
          const colCheck = await dbClient.query(`
            SELECT column_name FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'chart_of_accounts' AND column_name = 'normal_balance'
          `);
          const hasNormalBalance = colCheck.rows.length > 0;

          for (const acc of foundAccounts) {
            const check = await dbClient.query('SELECT id FROM chart_of_accounts WHERE id = $1', [acc.id]);
            if (check.rows.length === 0) {
              const type = (acc.type || 'asset').toLowerCase();
              const normalBalance = (type.includes('aset') || type.includes('asset') || type.includes('beban') || type.includes('expense')) ? 'debit' : 'credit';
              
              const keys = ['id', 'tenant_id', 'code', 'name', 'type'];
              const vals = [acc.id, acc.tenant_id, acc.code, acc.name, acc.type || 'asset'];
              
              if (hasNormalBalance) {
                keys.push('normal_balance');
                vals.push(normalBalance);
              }

              const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
              await dbClient.query(`
                INSERT INTO chart_of_accounts (${keys.join(', ')})
                VALUES (${placeholders}) ON CONFLICT (id) DO NOTHING
              `, vals);
            }
          }
        }
      }
      
      return foundAccounts;
    }
    
    const client = this.supabaseService.getClient();
    for (const tableName of tableNames) {
      const { data } = await client.from(tableName).select('*').eq('tenant_id', tenantId).in('code', codes);
      if (data && data.length > 0) return data;
    }
    return [];
  }

  async getJournalEntryById(tenantId: string, id: string) {
    const client = this.supabaseService.getClient();
    const { data: entry, error } = await client
      .from('journal_entries')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();
    if (error || !entry) throw new Error('Journal entry not found');

    const { data: lines, error: linesError } = await client
      .from('journal_lines')
      .select('*, chart_of_accounts(*)')
      .eq('journal_entry_id', id);
    if (linesError) throw new Error(linesError.message);

    return { ...entry, journal_lines: lines || [] };
  }

  async getJournalEntries(tenantId: string, startDate?: string, endDate?: string) {
    const client = this.supabaseService.getClient();

    let dateCol = 'date';
    try {
      const { data: colData } = await client.from('journal_entries').select('*').limit(1);
      if (colData && colData.length > 0 && !('date' in colData[0]) && ('transaction_date' in colData[0])) {
        dateCol = 'transaction_date';
      }
    } catch (e) {
      // fallback: keep 'date' as default
    }

    let query = client
      .from('journal_entries')
      .select(`*`)
      .eq('tenant_id', tenantId)
      .order(dateCol, { ascending: false });

    if (startDate && startDate.length >= 10) query = query.gte(dateCol, startDate.slice(0, 10));
    if (endDate && endDate.length >= 10) query = query.lte(dateCol, endDate.slice(0, 10));

    const { data: entries, error } = await query;
    if (error) throw new Error(error.message);

    const ids = entries.map((e: any) => e.id);
    if (ids.length === 0) return [];

    const { data: lines, error: linesError } = await client
      .from('journal_lines')
      .select(`*, accounts:chart_of_accounts(id, name, code, type)`)
      .in('entry_id', ids);

    if (linesError) throw new Error(linesError.message);

    const linesByEntryId: Record<string, any[]> = {};
    for (const line of lines || []) {
      const key = line.entry_id || line.journal_entry_id;
      if (!linesByEntryId[key]) linesByEntryId[key] = [];
      linesByEntryId[key].push(line);
    }

    return entries.map((entry: any) => ({
      ...entry,
      date: entry[dateCol] || entry.date,
      journal_lines: linesByEntryId[entry.id] || [],
    }));
  }

  async getReportSummary(tenantId: string, startDate?: string, endDate?: string) {
    if (!tenantId) {
      this.logger.warn('getReportSummary called without tenantId');
      return { revenue: 0, expenses: 0, net_profit: 0, low_stock_count: 0, expense_ratio: 0 };
    }

    const client = this.supabaseService.getClient();
    
    try {
      // 1. Detect Table Names and Columns
      let tableName = 'accounts';
      const { error: testAccError } = await client.from('accounts').select('id').limit(1);
      if (testAccError) tableName = 'chart_of_accounts';

      // Detect date column name in journal_entries
      let dateCol = 'date';
      const { data: colData } = await client.from('journal_entries').select('*').limit(1);
      if (colData && colData.length > 0 && !('date' in colData[0]) && ('transaction_date' in colData[0])) {
        dateCol = 'transaction_date';
      }

      // 2. Query Journal Lines with Join
      let query = client
        .from('journal_lines')
        .select(`
          debit,
          credit,
          accounts:${tableName} (
            type
          ),
          entry:journal_entries!inner (
            tenant_id,
            ${dateCol}
          )
        `)
        .eq('entry.tenant_id', tenantId);

      if (startDate) query = query.gte(`entry.${dateCol}`, startDate);
      if (endDate) query = query.lte(`entry.${dateCol}`, endDate);

      const { data: lines, error } = await query;

      if (error) {
        this.logger.warn(`getReportSummary query error (likely schema mismatch): ${error.message}`);
        // Fallback: return zeroes instead of crashing dashboard
        return { revenue: 0, expenses: 0, net_profit: 0, low_stock_count: 0, expense_ratio: 0 };
      }

      let revenue = 0;
      let expenses = 0;

      lines?.forEach((line: any) => {
        const type = (line.accounts?.type || '').toLowerCase();
        const debit = Number(line.debit || 0);
        const credit = Number(line.credit || 0);
        
        if (type === 'revenue' || type === 'pendapatan') {
          revenue += (credit - debit);
        } else if (type === 'expense' || type === 'beban' || type === 'cost of sales' || type === 'hpp') {
          expenses += (debit - credit);
        }
      });

      // 3. Get low stock count from raw_materials
      let lowStockCount = 0;
      try {
        const { count } = await client
          .from('raw_materials')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', tenantId)
          .lt('current_stock', 10);
        lowStockCount = count || 0;
      } catch (stockErr) {
        this.logger.warn('Failed to fetch low stock count:', stockErr.message);
      }

      return {
        revenue,
        expenses,
        net_profit: revenue - expenses,
        low_stock_count: lowStockCount,
        expense_ratio: revenue > 0 ? expenses / revenue : 0
      };
    } catch (globalErr) {
      this.logger.error('Global error in getReportSummary:', globalErr.message);
      return { revenue: 0, expenses: 0, net_profit: 0, low_stock_count: 0, expense_ratio: 0 };
    }
  }

  async getAccountBalances(tenantId: string, startDate?: string, endDate?: string) {
    const pool = this.supabaseService.getPool();
    if (!pool) throw new Error('Database pool not available for aggregation');

    const query = `
      SELECT 
        a.id, a.code, a.name, a.type,
        SUM(jl.debit) as total_debit,
        SUM(jl.credit) as total_credit
      FROM chart_of_accounts a
      LEFT JOIN journal_lines jl ON a.id = jl.account_id
      LEFT JOIN journal_entries je ON jl.entry_id = je.id
      WHERE a.tenant_id = $1 
        AND (je.date >= $2 OR $2 IS NULL)
        AND (je.date <= $3 OR $3 IS NULL)
      GROUP BY a.id, a.code, a.name, a.type
      ORDER BY a.code ASC
    `;

    const res = await pool.query(query, [tenantId, startDate || null, endDate || null]);
    return res.rows.map(row => ({
      ...row,
      total_debit: row.total_debit || '0',
      total_credit: row.total_credit || '0'
    }));
  }

  async getAccountBalanceAtDate(tenantId: string, accountId: string, date: string) {
    const pool = this.supabaseService.getPool();
    if (!pool) throw new Error('Database pool not available');

    const query = `
      SELECT 
        SUM(jl.debit) - SUM(jl.credit) as balance
      FROM journal_lines jl
      JOIN journal_entries je ON jl.entry_id = je.id
      WHERE je.tenant_id = $1 
        AND jl.account_id = $2
        AND je.date < $3
    `;

    const res = await pool.query(query, [tenantId, accountId, date]);
    return res.rows[0]?.balance || 0;
  }

  async getAccountingAccounts(tenantId: string) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('chart_of_accounts')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('code', { ascending: true });

    if (error) throw error;
    return data;
  }

  async getSalesReport(tenantId: string, startDate?: string, endDate?: string) {
    const client = this.supabaseService.getClient();

    const { data: revenueAccounts, error: acctError } = await client
      .from('chart_of_accounts')
      .select('id')
      .eq('tenant_id', tenantId)
      .filter('code', 'ilike', '4%');

    if (acctError) throw new Error(acctError.message);
    if (!revenueAccounts || revenueAccounts.length === 0) return [];

    const accountIds = revenueAccounts.map((a: any) => a.id);

    let linesQuery = client
      .from('journal_lines')
      .select('debit, credit, entry_id')
      .in('account_id', accountIds)
      .not('entry_id', 'is', null);

    const { data: lines, error: linesError } = await linesQuery;
    if (linesError) throw new Error(linesError.message);

    if (!lines || lines.length === 0) return [];

    const entryIds = [...new Set(lines.map((l: any) => l.entry_id))];

    let entriesQuery = client
      .from('journal_entries')
      .select('*')
      .in('id', entryIds)
      .order('date', { ascending: false });

    if (startDate) entriesQuery = entriesQuery.gte('date', startDate);
    if (endDate) entriesQuery = entriesQuery.lte('date', endDate);

    const { data: entries, error: entriesError } = await entriesQuery;
    if (entriesError) throw new Error(entriesError.message);

    const linesByEntryId: Record<string, any[]> = {};
    for (const line of lines || []) {
      if (!linesByEntryId[line.entry_id]) linesByEntryId[line.entry_id] = [];
      linesByEntryId[line.entry_id].push(line);
    }

    return (entries || []).map((entry: any) => ({
      ...entry,
      journal_lines: linesByEntryId[entry.id] || [],
    }));
  }

  async getJournalEntriesWithLines(tenantId: string, startDate: string, endDate: string) {
    const client = this.supabaseService.getClient();

    const { data: entries, error: entriesError } = await client
      .from('journal_entries')
      .select('*')
      .eq('tenant_id', tenantId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (entriesError) throw entriesError;

    const ids = entries.map((e: any) => e.id);
    if (ids.length === 0) return [];

    const { data: lines, error: linesError } = await client
      .from('journal_lines')
      .select('*, chart_of_accounts(name, code)')
      .in('entry_id', ids);

    if (linesError) throw linesError;

    const linesByEntryId: Record<string, any[]> = {};
    for (const line of lines || []) {
      const key = line.entry_id;
      if (!linesByEntryId[key]) linesByEntryId[key] = [];
      linesByEntryId[key].push(line);
    }

    return entries.map((entry: any) => ({
      ...entry,
      journal_lines: linesByEntryId[entry.id] || [],
    }));
  }

  async getLedgerLines(tenantId: string, accountId: string, startDate: string, endDate: string) {
    const client = this.supabaseService.getClient();

    const { data: lines, error: linesError } = await client
      .from('journal_lines')
      .select('id, debit, credit, entry_id')
      .eq('account_id', accountId);

    if (linesError) throw linesError;
    if (!lines || lines.length === 0) return [];

    const entryIds = [...new Set(lines.map((l: any) => l.entry_id))];

    const { data: entries, error: entriesError } = await client
      .from('journal_entries')
      .select('*')
      .in('id', entryIds)
      .eq('tenant_id', tenantId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (entriesError) throw entriesError;

    const entriesById: Record<string, any> = {};
    for (const entry of entries || []) {
      entriesById[entry.id] = entry;
    }

    return lines
      .filter((l: any) => entriesById[l.entry_id])
      .map((l: any) => ({
        ...l,
        journal_entries: entriesById[l.entry_id],
      }));
  }

  async createAccount(tenantId: string, accountData: any) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('chart_of_accounts')
      .insert({ ...accountData, tenant_id: tenantId })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateAccount(tenantId: string, accountId: string, accountData: any) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('chart_of_accounts')
      .update(accountData)
      .eq('id', accountId)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteAccount(tenantId: string, accountId: string) {
    const client = this.supabaseService.getClient();
    const { error } = await client
      .from('chart_of_accounts')
      .delete()
      .eq('id', accountId)
      .eq('tenant_id', tenantId);

    if (error) throw error;
    return true;
  }
}
