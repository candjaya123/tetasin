import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../../shared/supabase.service';

@Injectable()
export class RuleEngineService {
  private readonly logger = new Logger(RuleEngineService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  // Run every hour to check for critical alerts
  // @Cron(CronExpression.EVERY_HOUR)
  async checkRulesForAllTenants() {
    this.logger.log('Starting Rule Engine check...');
    const client = this.supabaseService.getClient();

    const { data: tenants, error } = await client.from('tenants').select('id');
    if (error) return;

    for (const tenant of tenants) {
      await this.runRulesForTenant(tenant.id);
    }
  }

  async runRulesForTenant(tenantId: string) {
    const client = this.supabaseService.getClient();

    // RULE 1: Low Stock Detection
    const { data: lowStockItems, error: stockError } = await client
      .from('products')
      .select('name, current_stock')
      .eq('tenant_id', tenantId)
      .lt('current_stock', 5);

    if (!stockError && lowStockItems) {
      for (const item of lowStockItems) {
        await this.createAlert(tenantId, 'low_stock', `Stok produk "${item.name}" menipis (Sisa: ${item.current_stock})`);
      }
    }

    // RULE 2: Revenue Drop Detection (Compare today with yesterday from cache)
    // ... (Logic to compare metrics)
  }

  private async createAlert(tenantId: string, type: string, message: string) {
    const client = this.supabaseService.getClient();
    
    // Check if same alert exists recently to avoid spam
    const { data: existing } = await client
      .from('smart_alerts')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('message', message)
      .eq('is_read', false)
      .limit(1);

    if (!existing || existing.length === 0) {
      await client.from('smart_alerts').insert({
        tenant_id: tenantId,
        alert_type: type,
        message: message,
        priority: 'medium'
      });
    }
  }
}
