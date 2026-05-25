import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../../shared/supabase.service';
import { AccountingService } from '../../accounting/services/accounting.service';

@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly accountingService: AccountingService,
  ) {}

  async setupSystem(tenantId: string, input: { industry: string; scale: string; complexity: string }, userInfo?: any) {
    this.logger.log(`Starting deterministic onboarding setup for tenant: ${tenantId}`);

    const client = this.supabaseService.getClient();
    const accountType = userInfo?.account_type || userInfo?.user_metadata?.account_type || 'business';

    // 1. Initialize COA from Master Table via AccountingService
    await this.accountingService.initializeCOA(tenantId, input.industry, input.scale, accountType);

    // Map frontend industry input to DB enum valid values
    const industryMap: Record<string, string> = {
      'F&B': 'fnb',
      'Retail': 'retail',
      'Jasa': 'service',
      'Manufaktur': 'manufacturing',
      'Personal': 'general',
    };
    const dbIndustry = industryMap[input.industry] || 'general';

    // 2. Update Tenant metadata
    await client.from('tenants').update({ account_type: accountType }).eq('id', tenantId);

    // 3. Create or Update Tenant Industry Profile instead of trying to mutate non-existent columns in profiles
    const { error: profileError } = await client
      .from('tenant_industry_profiles')
      .upsert({
        tenant_id: tenantId,
        industry_type: dbIndustry,
        config: {
          business_scale: input.scale,
          financial_complexity: input.complexity,
          account_type: accountType,
          enabled_modules: accountType === 'personal' ? ['accounting'] : ['pos', 'inventory', 'accounting'],
          accounting_assumptions: {
            method: 'accrual',
            currency: 'IDR',
            is_ai_setup: false
          }
        }
      }, { onConflict: 'tenant_id' });

    // Also update the user's profile account_type just in case
    await client.from('profiles').update({ account_type: accountType }).eq('tenant_id', tenantId);

    if (profileError) {
      this.logger.error(`Failed to update profile: ${profileError.message}`);
      throw new Error(`Gagal memperbarui profil bisnis: ${profileError.message}`);
    }

    this.logger.log(`Onboarding setup (Deterministic) completed successfully for tenant: ${tenantId}`);
    return { success: true, template_used: 'standard' };
  }
}
