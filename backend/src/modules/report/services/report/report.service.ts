import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../../../shared/supabase.service';
import { AccountingRepository } from '../../../accounting/repositories/accounting.repository';

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly accountingRepository: AccountingRepository
  ) {}

  async getIncomeStatement(tenantId: string, startDate: string, endDate: string) {
    return await this.accountingRepository.getReportSummary(tenantId, startDate, endDate);
  }

  async getDashboardSummary(tenantId: string, startDate?: string, endDate?: string) {
    return await this.accountingRepository.getReportSummary(tenantId, startDate, endDate);
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
    let query = client
      .from('journal_entries')
      .select(`
        id,
        created_at,
        reference_doc,
        description,
        journal_lines!inner (
          debit,
          credit,
          accounts!inner (
            code
          )
        )
      `)
      .eq('tenant_id', tenantId)
      .eq('journal_lines.accounts.code', '4-40000')
      .order('created_at', { ascending: false });

    if (startDate) query = query.gte('created_at', startDate);
    if (endDate) query = query.lte('created_at', endDate);

    const { data, error } = await query;
    if (error) throw error;

    return data.map((entry: any) => {
      // Find the revenue line to get total amount
      const revenueLine = entry.journal_lines.find((l: any) => l.accounts?.code === '4-40000');
      return {
        id: entry.id,
        created_at: entry.created_at,
        order_number: entry.reference_doc || 'POS-SALE',
        customer_name: (entry.description || '').split(' - ')[1] || 'Pelanggan POS',
        total_amount: revenueLine ? Number(revenueLine.credit) : 0,
        status: 'completed'
      };
    });
  }
}
