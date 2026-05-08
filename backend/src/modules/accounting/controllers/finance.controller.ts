import { Controller, Get, Post, Body, Request, UseGuards, Query, Put, Delete, Param } from '@nestjs/common';
import { SupabaseService } from '../../../shared/supabase.service';
import { JwtAuthGuard } from '../../business-profile/guards/jwt-auth.guard';
import { RequireTier } from '../../../core/auth/tier.decorator';
import { SubscriptionTier } from '../../../core/auth/tier.enum';

@Controller('api/v1/finance')
@UseGuards(JwtAuthGuard)
export class FinanceController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Get('coa')
  async getCOA(@Request() req: any) {
    const client = this.supabaseService.getClient();
    
    let tableName = 'accounts';
    const { error: testError } = await client.from('accounts').select('id').limit(1);
    if (testError) tableName = 'chart_of_accounts';

    const { data, error } = await client
      .from(tableName)
      .select('*')
      .eq('tenant_id', req.user.tenant_id)
      .order('code', { ascending: true });
    
    if (error) throw error;
    return data;
  }

  @Post('coa')
  @RequireTier(SubscriptionTier.FULL)
  async createAccount(@Request() req: any, @Body() body: any) {
    const client = this.supabaseService.getClient();
    const { error } = await client
      .from('chart_of_accounts')
      .insert({ ...body, tenant_id: req.user.tenant_id });
    
    if (error) throw error;
    return { success: true };
  }

  @Put('coa/:id')
  @RequireTier(SubscriptionTier.FULL)
  async updateAccount(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    const client = this.supabaseService.getClient();
    const { error } = await client
      .from('chart_of_accounts')
      .update(body)
      .eq('id', id)
      .eq('tenant_id', req.user.tenant_id);
    
    if (error) throw error;
    return { success: true };
  }

  @Delete('coa/:id')
  @RequireTier(SubscriptionTier.FULL)
  async deleteAccount(@Request() req: any, @Param('id') id: string) {
    const client = this.supabaseService.getClient();
    const { error } = await client
      .from('chart_of_accounts')
      .delete()
      .eq('id', id)
      .eq('tenant_id', req.user.tenant_id);
    
    if (error) throw error;
    return { success: true };
  }

  @Get('balance-sheet')
  @RequireTier(SubscriptionTier.FULL)
  async getBalanceSheet(@Request() req: any) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('ledger_balances')
      .select('*')
      .eq('tenant_id', req.user.tenant_id);
    
    if (error) throw error;
    return data;
  }

  @Get('cash-flow')
  @RequireTier(SubscriptionTier.FULL)
  async getCashFlow(
    @Request() req: any, 
    @Query('account_id') accountId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const client = this.supabaseService.getClient();
    let query = client
      .from('journal_lines')
      .select(`
        id,
        debit,
        credit,
        created_at,
        accounts:chart_of_accounts (
          name,
          code,
          type
        ),
        journal_entries!inner (
          description,
          reference_doc,
          tenant_id,
          date
        )
      `)
      .eq('journal_entries.tenant_id', req.user.tenant_id);
    
    if (accountId) {
      query = query.eq('account_id', accountId);
    } else {
      query = query.or('type.eq.asset,type.eq.liability,type.eq.aset,type.eq.kewajiban', { foreignTable: 'chart_of_accounts' });
    }

    if (startDate) query = query.gte('journal_entries.date', startDate);
    if (endDate) query = query.lte('journal_entries.date', endDate);

    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  @Get('ledger')
  @RequireTier(SubscriptionTier.FULL)
  async getLedger(
    @Request() req: any, 
    @Query('account_id') accountId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const client = this.supabaseService.getClient();
    let query = client
      .from('journal_lines')
      .select(`
        *,
        journal_entries!inner (
          description,
          reference_doc,
          date,
          tenant_id
        )
      `)
      .eq('journal_entries.tenant_id', req.user.tenant_id)
      .eq('account_id', accountId);
    
    if (startDate) query = query.gte('journal_entries.date', startDate);
    if (endDate) query = query.lte('journal_entries.date', endDate);

    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  @Get('transactions')
  async getTransactions(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('account_id') accountId?: string,
    @Query('type') type?: string,
  ) {
    const client = this.supabaseService.getClient();
    const tenantId = req.user.tenant_id;

    // Deteksi nama tabel akun
    let accountTable = 'chart_of_accounts';
    try {
      const { error: testErr } = await client.from('chart_of_accounts').select('id').limit(1);
      if (testErr) accountTable = 'accounts';
    } catch (e) {
      accountTable = 'accounts';
    }

    // Deteksi kolom yang tersedia di journal_entries
    let dateCol = 'date';
    let hasTotalAmount = false;
    try {
      const { data: cols, error: colErr } = await client.rpc('get_table_columns', { p_table_name: 'journal_entries' });
      if (!colErr && cols) {
        const colNames = cols.map((c: any) => c.column_name);
        if (!colNames.includes('date') && colNames.includes('transaction_date')) {
          dateCol = 'transaction_date';
        }
        hasTotalAmount = colNames.includes('total_amount');
      } else {
        // Fallback detection via select limit 1 if RPC fails
        const { data: testEntry } = await client.from('journal_entries').select('*').limit(1);
        if (testEntry && testEntry.length > 0) {
          const first = testEntry[0];
          if (!('date' in first) && 'transaction_date' in first) {
            dateCol = 'transaction_date';
          }
          hasTotalAmount = 'total_amount' in first;
        }
      }
    } catch (e) { /* use defaults */ }

    // Bangun query utama
    let selectQuery = `id, ${dateCol}, description, reference_doc, ${hasTotalAmount ? 'total_amount, ' : ''}created_at, journal_lines ( id, debit, credit, account_id, ${accountTable} ( name, code, type ) )`;

    try {
      let q = client
        .from('journal_entries')
        .select(selectQuery)
        .eq('tenant_id', tenantId);

      if (accountId) q = q.eq('journal_lines.account_id', accountId);
      if (startDate) q = q.gte(dateCol, startDate);
      if (endDate) q = q.lte(dateCol, endDate);

      const { data, error } = await q.order(dateCol, { ascending: false });

      if (error) {
        // Fallback: query tanpa join
        console.warn('[getTransactions] Join query failed, trying simple query. Error:', error.message);
        const { data: simpleData, error: simpleError } = await client
          .from('journal_entries')
          .select(`id, ${dateCol}, description, reference_doc, ${hasTotalAmount ? 'total_amount, ' : ''}created_at`)
          .eq('tenant_id', tenantId)
          .order(dateCol, { ascending: false });
        
        if (simpleError) throw simpleError;
        return (simpleData || []).map((e: any) => ({ 
          ...e, 
          date: e[dateCol], 
          total_amount: e.total_amount || 0,
          journal_lines: [] 
        }));
      }

      // Normalisasi key untuk frontend
      const normalized = (data || []).map((entry: any) => {
        // Hitung total_amount jika tidak ada di DB
        let totalAmount = entry.total_amount;
        if (!hasTotalAmount && entry.journal_lines) {
          totalAmount = entry.journal_lines.reduce((acc: number, line: any) => acc + Number(line.debit || 0), 0);
        }

        return {
          ...entry,
          date: entry[dateCol],
          total_amount: totalAmount || 0,
          journal_lines: (entry.journal_lines || []).map((line: any) => ({
            ...line,
            chart_of_accounts: line[accountTable] || line.chart_of_accounts || null,
          })),
        };
      });

      // Filter tipe jika diperlukan
      if (type === 'income') {
        return normalized.filter((e: any) =>
          e.journal_lines.some((l: any) =>
            ['income', 'pendapatan', 'revenue'].includes((l.chart_of_accounts?.type || '').toLowerCase())
          )
        );
      }
      if (type === 'expense') {
        return normalized.filter((e: any) =>
          e.journal_lines.some((l: any) =>
            ['expense', 'beban', 'cost of sales', 'hpp'].includes((l.chart_of_accounts?.type || '').toLowerCase())
          )
        );
      }

      return normalized;
    } catch (err: any) {
      console.error('[getTransactions] Fatal error:', err.message || err);
      throw err;
    }
  }
}
