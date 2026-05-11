import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SupabaseService } from '../../../shared/supabase.service';
import { ForecastingService } from '../../ai/services/forecasting.service';

@Injectable()
export class AutopilotService {
  private readonly logger = new Logger(AutopilotService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly forecastingService: ForecastingService,
  ) {}

  /**
   * Menjalankan pengecekan stok otomatis setiap tengah malam untuk seluruh pengguna Full Access.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async runInventoryAutopilot() {
    this.logger.log('Starting Inventory Autopilot check for all tenants (Full Access)...');
    const client = this.supabaseService.getClient();

    // 1. Ambil semua tenant (Autopilot kini untuk semua)
    const { data: tenants } = await client
      .from('tenants')
      .select('id');

    if (!tenants) return;

    for (const tenant of tenants) {
      try {
        await this.checkAndDraftPO(tenant.id);
      } catch (err) {
        this.logger.error(`Autopilot failed for tenant ${tenant.id}: ${err.message}`);
      }
    }
  }

  private async checkAndDraftPO(tenantId: string) {
    const client = this.supabaseService.getClient();

    // 1. Cari produk dengan stok rendah (< safety stock)
    // Di sini kita gunakan logika sederhana: stok < 10
    const { data: lowStockItems } = await client
      .from('inventory')
      .select('*, products(name)')
      .eq('tenant_id', tenantId)
      .lt('current_stock', 10);

    if (!lowStockItems || lowStockItems.length === 0) return;

    // 2. Buat Draft PO secara otomatis
    for (const item of lowStockItems) {
      this.logger.log(`Autopilot: Creating draft PO for ${item.products.name} (Tenant: ${tenantId})`);
      
      await client.from('procurement_drafts').insert({
        tenant_id: tenantId,
        product_id: item.product_id,
        suggested_qty: 50, // Default restock quantity
        status: 'ai_drafted',
        reason: 'Low stock detected by Autopilot Engine'
      });
    }
  }
}
