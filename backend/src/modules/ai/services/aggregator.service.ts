import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../../shared/supabase.service';

@Injectable()
export class AggregatorService {
  private readonly logger = new Logger(AggregatorService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Mengambil data Laba Rugi dan Neraca lalu merangkumnya ke dalam JSON deskriptif
   * agar bisa dikonsumsi oleh LLM tanpa harus membaca ribuan baris jurnal.
   */
  async getSemanticFinancialSummary(tenantId: string) {
    const client = this.supabaseService.getClient();

    let balances: any[] = [];

    try {
      // 1. Ambil Saldo dari View ledger_balances
      const { data, error } = await client
        .from('ledger_balances')
        .select('code, name, type, current_balance')
        .eq('tenant_id', tenantId);

      if (error) {
        this.logger.warn(`ledger_balances not available: ${error.message}. Using empty data.`);
      } else {
        balances = data || [];
      }
    } catch (e) {
      this.logger.warn(`Failed to fetch ledger balances: ${e.message}. Proceeding with empty data.`);
    }

    // 2. Kategorisasi Data (handles empty balances gracefully)
    const summary = {
      cash_on_hand: balances.filter(b => b.code?.startsWith('1-100')).reduce((sum, b) => sum + (b.current_balance || 0), 0),
      inventory_value: balances.filter(b => b.code === '1-10503').reduce((sum, b) => sum + (b.current_balance || 0), 0),
      total_revenue: balances.filter(b => b.type === 'revenue').reduce((sum, b) => sum + (b.current_balance || 0), 0),
      total_cogs: balances.filter(b => b.code === '5-50000').reduce((sum, b) => sum + (b.current_balance || 0), 0),
      total_expenses: balances.filter(b => b.type === 'expense' && b.code !== '5-50000').reduce((sum, b) => sum + (b.current_balance || 0), 0),
      timestamp: new Date().toISOString(),
    };

    // 3. Tambahkan Context Deskriptif
    return {
      metadata: {
        tenant_id: tenantId,
        currency: 'IDR',
        note: balances.length === 0 ? 'Data akuntansi belum tersedia. Mulai catat transaksi untuk mendapatkan insight.' : undefined,
      },
      pnl_snapshot: {
        revenue: summary.total_revenue,
        gross_profit: summary.total_revenue - summary.total_cogs,
        net_profit: summary.total_revenue - summary.total_cogs - summary.total_expenses,
      },
      liquidity_snapshot: {
        cash: summary.cash_on_hand,
        inventory: summary.inventory_value,
      }
    };
  }
}
