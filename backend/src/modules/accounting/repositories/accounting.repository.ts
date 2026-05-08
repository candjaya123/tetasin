import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../../shared/supabase.service';
import { PoolClient } from 'pg';

@Injectable()
export class AccountingRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  getClient() {
    return this.supabaseService.getClient();
  }

  async createTransactionWithLines(entry: any, lines: any[], dbClient?: PoolClient) {
    if (dbClient) {
      // 1. DYNAMIC INSERT: Check available columns first
      console.log('Detecting journal_entries columns...');
      const columnCheck = await dbClient.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'journal_entries'
      `);
      const cols = columnCheck.rows.map(r => r.column_name);
      
      const insertData = {
        tenant_id: entry.tenant_id,
        description: entry.description || entry.transaction_type,
        // Map date column
        [cols.includes('transaction_date') ? 'transaction_date' : 'date']: entry.date || new Date().toISOString(),
        // Map reference column
        [cols.includes('reference_doc_id') ? 'reference_doc_id' : 'reference_doc']: (entry.reference_number && entry.reference_number.length === 36) ? entry.reference_number : (cols.includes('reference_doc') ? entry.reference_number : null),
      };

      // Add debit/credit/amount if table is header-only (old schema)
      if (cols.includes('debit_account_id')) insertData['debit_account_id'] = lines.find(l => (l.debit || 0) > 0)?.account_id;
      if (cols.includes('credit_account_id')) insertData['credit_account_id'] = lines.find(l => (l.credit || 0) > 0)?.account_id;
      if (cols.includes('amount')) insertData['amount'] = lines.reduce((acc, l) => acc + (l.debit || 0), 0);

      const keys = Object.keys(insertData).filter(k => cols.includes(k));
      const values = keys.map(k => insertData[k]);
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

      console.log(`Inserting into journal_entries using columns: ${keys.join(', ')}`);
      const entryRes = await dbClient.query(`
        INSERT INTO journal_entries (${keys.join(', ')})
        VALUES (${placeholders})
        RETURNING *
      `, values);
      
      const journalEntry = entryRes.rows[0];
      console.log(`Journal entry inserted: ${journalEntry.id}.`);

      // 2. Insert Journal Lines via PG (Only if table exists)
      const tableCheck = await dbClient.query(`
        SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'journal_lines')
      `);
      
      if (tableCheck.rows[0].exists) {
        for (const line of lines) {
          await dbClient.query(`
            INSERT INTO journal_lines (entry_id, account_id, debit, credit)
            VALUES ($1, $2, $3, $4)
          `, [journalEntry.id, line.account_id, line.debit || 0, line.credit || 0]);
        }
        console.log('Journal lines inserted successfully.');
      }

      return journalEntry;
    }

    const client = this.supabaseService.getClient();
    
    // 1. Insert Journal Entry
    const { data: journalEntry, error: entryError } = await client
      .from('journal_entries')
      .insert({
        tenant_id: entry.tenant_id,
        reference_doc: entry.reference_number,
        description: entry.description || entry.transaction_type,
        date: entry.date || new Date().toISOString(),
      })
      .select()
      .single();

    if (entryError) {
      throw new Error(`Failed to create journal entry: ${entryError.message}`);
    }

    // 2. Insert Journal Lines
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

  async getJournalEntries(tenantId: string, startDate?: string, endDate?: string) {
    const client = this.supabaseService.getClient();
    // Try both table names
    let tableName = 'accounts';
    try {
      const { error: testError } = await client.from('accounts').select('id').limit(1);
      if (testError) tableName = 'chart_of_accounts';
    } catch (e) {
      tableName = 'chart_of_accounts';
    }

    let query = client
      .from('journal_entries')
      .select(`
        *,
        journal_lines (
          *,
          accounts:${tableName} (
            id,
            name,
            code,
            type
          )
        )
      `)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (startDate) query = query.gte('date', startDate);
    if (endDate) query = query.lte('date', endDate);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async getReportSummary(tenantId: string, startDate?: string, endDate?: string) {
    if (!tenantId) {
      console.warn('getReportSummary called without tenantId');
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
        console.warn(`getReportSummary query error (likely schema mismatch): ${error.message}`);
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
        console.warn('Failed to fetch low stock count:', stockErr.message);
      }

      return {
        revenue,
        expenses,
        net_profit: revenue - expenses,
        low_stock_count: lowStockCount,
        expense_ratio: revenue > 0 ? (expenses / revenue) : 0
      };
    } catch (globalErr) {
      console.error('Global error in getReportSummary:', globalErr.message);
      return { revenue: 0, expenses: 0, net_profit: 0, low_stock_count: 0, expense_ratio: 0 };
    }
  }
}
