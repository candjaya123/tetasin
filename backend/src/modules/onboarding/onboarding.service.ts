import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../shared/supabase.service';
import { AccountingService } from '../accounting/services/accounting.service';

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

    // 2. Update Profile & Tenant metadata
    await client.from('tenants').update({ account_type: accountType }).eq('id', tenantId);

    const { error: profileError } = await client
      .from('profiles')
      .update({
        industry: input.industry,
        business_scale: input.scale,
        financial_complexity: input.complexity,
        account_type: accountType,
        enabled_modules: accountType === 'personal' ? ['accounting'] : ['pos', 'inventory', 'accounting'],
        accounting_assumptions: {
          method: 'accrual',
          currency: 'IDR',
          is_ai_setup: false
        },
      })
      .eq('tenant_id', tenantId);

    if (profileError) {
      this.logger.error(`Failed to update profile: ${profileError.message}`);
      throw new Error(`Gagal memperbarui profil bisnis: ${profileError.message}`);
    }

    this.logger.log(`Onboarding setup (Deterministic) completed successfully for tenant: ${tenantId}`);
    return { success: true, template_used: 'standard' };
  }
}
