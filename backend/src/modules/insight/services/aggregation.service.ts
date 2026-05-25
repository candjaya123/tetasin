import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SupabaseService } from '../../../shared/supabase.service';

@Injectable()
export class AggregationService {
  private readonly logger = new Logger(AggregationService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  // Run every midnight
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyAggregation() {
    this.logger.log('Starting daily aggregation for all tenants...');
    const client = this.supabaseService.getClient();

    // 1. Get all active tenants
    const { data: tenants, error: tenantsError } = await client
      .from('tenants')
      .select('id');

    if (tenantsError) {
      this.logger.error(`Failed to fetch tenants: ${tenantsError.message}`);
      return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];

    for (const tenant of tenants) {
      try {
        await this.aggregateTenantData(tenant.id, dateStr);
      } catch (err) {
        this.logger.error(`Failed to aggregate data for tenant ${tenant.id}: ${err.message}`);
      }
    }

    this.logger.log('Daily aggregation completed.');
  }

  async aggregateTenantData(tenantId: string, date: string) {
    const client = this.supabaseService.getClient();

    // 1. Ambil Penjualan dari journal_entries & journal_lines
    const { data: entries, error: entriesError } = await client
      .from('journal_entries')
      .select('id, reference_doc')
      .eq('tenant_id', tenantId)
      .eq('date', date);

    if (entriesError) throw entriesError;

    const ids = entries.map((e: any) => e.id);
    let totalRevenue = 0;
    let totalCogs = 0;

    if (ids.length > 0) {
      const { data: lines, error: linesError } = await client
        .from('journal_lines')
        .select('debit, credit, chart_of_accounts!inner(code, type)')
        .in('entry_id', ids);

      if (linesError) throw linesError;

      for (const line of lines || []) {
        const acct = line.chart_of_accounts?.[0];
        if (acct?.type === 'revenue' || acct?.type === 'pendapatan') {
          totalRevenue += line.credit;
        }
        if (acct?.type === 'expense' && acct?.code === '5-50000') {
          totalCogs += line.debit;
        }
      }
    }

    // 2. Simpan ke Cache Metrik
    await client.from('tenant_metrics_cache').upsert({
      tenant_id: tenantId,
      date: date,
      daily_revenue_json: { total: totalRevenue, cogs: totalCogs, gross_profit: totalRevenue - totalCogs },
      created_at: new Date().toISOString()
    });

    // 3. Update Business Memory (Pattern Detection Sederhana)
    // Jika revenue hari ini > 20% dari rata-rata, tandai sebagai "High Demand Day"
    if (totalRevenue > 0) {
      await client.from('business_memory').upsert({
        tenant_id: tenantId,
        memory_type: 'sales_pattern',
        context_key: `sales_on_${date}`,
        memory_data: { 
          revenue: totalRevenue, 
          status: totalRevenue > 1000000 ? 'peak' : 'normal' 
        },
        importance_score: 0.8
      });
    }
  }
}
