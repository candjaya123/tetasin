import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../../shared/supabase.service';

@Injectable()
export class BudgetService {
  private readonly logger = new Logger(BudgetService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Deteksi nama tabel akun yang aktif di database (accounts vs chart_of_accounts)
   */
  private async detectAccountTable(): Promise<string> {
    const client = this.supabaseService.getClient();
    try {
      const { data, error } = await client.from('chart_of_accounts').select('id').limit(1);
      if (!error) return 'chart_of_accounts';
    } catch (_) {}
    return 'accounts';
  }

  /**
   * Deteksi kolom tanggal yang digunakan di journal_entries
   */
  private async detectDateColumn(): Promise<string> {
    const client = this.supabaseService.getClient();
    try {
      const { data } = await client.from('journal_entries').select('*').limit(1);
      if (data && data.length > 0) {
        if ('date' in data[0]) return 'date';
        if ('transaction_date' in data[0]) return 'transaction_date';
      }
    } catch (_) {}
    return 'date';
  }

  /**
   * Ambil daftar budget beserta realisasi pengeluaran untuk bulan tertentu
   */
  async getBudgets(tenantId: string, month: string) {
    const client = this.supabaseService.getClient();
    const accountTable = await this.detectAccountTable();
    const dateCol = await this.detectDateColumn();

    // 1. Ambil daftar anggaran bulan ini
    const { data: budgets, error: budgetError } = await client
      .from('budgets')
      .select(`
        *,
        ${accountTable} (
          name,
          code,
          type
        )
      `)
      .eq('tenant_id', tenantId)
      .eq('period_month', month);

    if (budgetError) {
      this.logger.error(`getBudgets error: ${budgetError.message}`);
      throw budgetError;
    }

    if (!budgets || budgets.length === 0) return [];

    // 2. Hitung realisasi pengeluaran per akun
    const start = `${month}-01`;
    const end = `${month}-31`;

    const results = await Promise.all((budgets as any[]).map(async (budget) => {
      let current_spent = 0;

      try {
        const { data: lines, error: lineError } = await client
          .from('journal_lines')
          .select(`
            debit,
            journal_entries!inner (
              ${dateCol},
              tenant_id
            )
          `)
          .eq('account_id', budget.account_id)
          .eq('journal_entries.tenant_id', tenantId)
          .gte(`journal_entries.${dateCol}`, start)
          .lte(`journal_entries.${dateCol}`, end);

        if (!lineError && lines) {
          current_spent = (lines as any[]).reduce((sum, line: any) => sum + (Number(line.debit) || 0), 0);
        }
      } catch (e) {
        this.logger.warn(`Failed to calculate spending for account ${budget.account_id}: ${e.message}`);
      }

      const limit = Number(budget.limit_amount) || 0;
      const percentage_used = limit > 0 ? (current_spent / limit) * 100 : 0;
      const accountData = budget[accountTable] || {};

      return {
        id: budget.id,
        account_id: budget.account_id,
        category_name: accountData.name || 'Kategori',
        category_code: accountData.code || '',
        limit_amount: limit,
        current_spent,
        remaining: Math.max(0, limit - current_spent),
        percentage_used: Math.round(percentage_used * 10) / 10,
        is_over_budget: current_spent > limit,
        period_month: budget.period_month,
      };
    }));

    return results;
  }

  /**
   * Ringkasan total anggaran vs total pengeluaran bulan ini
   */
  async getBudgetSummary(tenantId: string, month: string) {
    const budgets = await this.getBudgets(tenantId, month);

    const total_budget = budgets.reduce((sum, b) => sum + b.limit_amount, 0);
    const total_spent = budgets.reduce((sum, b) => sum + b.current_spent, 0);
    const over_budget_count = budgets.filter(b => b.is_over_budget).length;
    const efficiency = total_budget > 0 ? Math.round((1 - total_spent / total_budget) * 100) : 100;

    return {
      month,
      total_budget,
      total_spent,
      total_remaining: Math.max(0, total_budget - total_spent),
      overall_percentage: total_budget > 0 ? Math.round((total_spent / total_budget) * 100 * 10) / 10 : 0,
      efficiency: Math.max(0, efficiency),
      over_budget_count,
      budget_count: budgets.length,
    };
  }

  /**
   * Tambah atau update anggaran (upsert berdasarkan tenant_id + account_id + period_month)
   */
  async upsertBudget(tenantId: string, data: {
    account_id: string;
    limit_amount: number;
    period_month: string;
  }) {
    const client = this.supabaseService.getClient();

    const { error } = await client
      .from('budgets')
      .upsert({
        tenant_id: tenantId,
        account_id: data.account_id,
        limit_amount: data.limit_amount,
        period_month: data.period_month,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'tenant_id,account_id,period_month',
      });

    if (error) {
      this.logger.error(`upsertBudget error: ${error.message}`);
      throw error;
    }
    return { success: true };
  }

  /**
   * Hapus anggaran berdasarkan ID
   */
  async deleteBudget(tenantId: string, budgetId: string) {
    const client = this.supabaseService.getClient();

    const { error } = await client
      .from('budgets')
      .delete()
      .eq('id', budgetId)
      .eq('tenant_id', tenantId); // Security: pastikan hanya bisa hapus milik sendiri

    if (error) {
      this.logger.error(`deleteBudget error: ${error.message}`);
      throw error;
    }
    return { success: true };
  }

  /**
   * Cek dan buat notifikasi alert jika pengeluaran mendekati/melebihi batas
   */
  async checkBudgetAlerts(tenantId: string, accountId: string, month: string) {
    const client = this.supabaseService.getClient();
    const accountTable = await this.detectAccountTable();
    const dateCol = await this.detectDateColumn();

    const { data: budget, error: budgetError } = await client
      .from('budgets')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('account_id', accountId)
      .eq('period_month', month)
      .maybeSingle();

    if (budgetError || !budget) return;

    const start = `${month}-01`;
    const end = `${month}-31`;

    const { data: lines } = await client
      .from('journal_lines')
      .select(`
        debit,
        journal_entries!inner (${dateCol})
      `)
      .eq('account_id', accountId)
      .eq('journal_entries.tenant_id', tenantId)
      .gte(`journal_entries.${dateCol}`, start)
      .lte(`journal_entries.${dateCol}`, end);

    const current_spent = ((lines as any[]) || []).reduce((sum, line: any) => sum + (Number(line.debit) || 0), 0);
    const percentage = budget.limit_amount > 0 ? (current_spent / budget.limit_amount) * 100 : 0;

    if (percentage >= 80) {
      try {
        const { data: account } = await client
          .from(accountTable)
          .select('name')
          .eq('id', accountId)
          .single();

        const categoryName = account?.name || 'Kategori';

        const message = percentage >= 100
          ? `🚨 BAHAYA: Pengeluaran ${categoryName} telah MELEWATI batas anggaran (${percentage.toFixed(0)}%)!`
          : `⚠️ Peringatan: Pengeluaran ${categoryName} sudah mencapai ${percentage.toFixed(0)}% dari batas bulan ini.`;

        // Hindari duplikasi alert hari ini
        const { data: existingAlert } = await client
          .from('smart_alerts')
          .select('id')
          .eq('tenant_id', tenantId)
          .ilike('message', `%${categoryName}%`)
          .gte('created_at', new Date().toISOString().slice(0, 10))
          .limit(1);

        if (!existingAlert || existingAlert.length === 0) {
          await client.from('smart_alerts').insert({
            tenant_id: tenantId,
            alert_type: 'budget_alert',
            message,
            priority: percentage >= 100 ? 'high' : 'medium',
            is_read: false,
          });
        }
      } catch (alertErr) {
        this.logger.warn(`Failed to create budget alert: ${alertErr.message}`);
      }
    }
  }
}
