import { Injectable, NotFoundException } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { SupabaseService } from '../../../shared/supabase.service';

const INDUSTRY_DEFAULT_PRODUCT_TYPES: Record<string, string> = {
  retail: 'physical',
  fnb: 'composite',
  grocery: 'weighted',
  pharmacy: 'physical',
  electronics: 'physical',
  manufacturing: 'physical',
  service: 'service',
  hybrid: 'hybrid',
  general: 'physical',
};

const INDUSTRY_FEATURE_FLAGS: Record<string, string[]> = {
  retail: ['addon_groups', 'serial_tracking'],
  fnb: ['recipe_based_stock', 'addon_groups', 'table_management'],
  grocery: ['weight_based_pricing', 'expiry_tracking', 'batch_numbers'],
  pharmacy: ['expiry_tracking', 'batch_numbers', 'serial_tracking'],
  electronics: ['serial_tracking', 'service_catalog'],
  manufacturing: ['recipe_based_stock', 'batch_numbers'],
  service: ['service_catalog', 'table_management'],
  hybrid: ['recipe_based_stock', 'weight_based_pricing', 'addon_groups', 'service_catalog'],
  general: ['addon_groups'],
};

@Injectable()
export class IndustryService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(IndustryService.name);
  }

  async getProfile(tenantId: string) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('tenant_industry_profiles')
      .select('*')
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async upsertProfile(tenantId: string, payload: {
    industry: string;
    features_config?: Record<string, boolean>;
    ui_config?: Record<string, any>;
  }) {
    const client = this.supabaseService.getClient();
    const industry = payload.industry || 'general';
    const defaultFeatures: Record<string, boolean> = {};
    const featureList = INDUSTRY_FEATURE_FLAGS[industry] || [];
    for (const f of featureList) {
      defaultFeatures[f] = true;
    }

    const featuresConfig = payload.features_config
      ? { ...defaultFeatures, ...payload.features_config }
      : defaultFeatures;

    const { data, error } = await client
      .from('tenant_industry_profiles')
      .upsert({
        tenant_id: tenantId,
        industry: industry as any,
        default_product_type: INDUSTRY_DEFAULT_PRODUCT_TYPES[industry] || 'physical',
        features_config: featuresConfig,
        ui_config: payload.ui_config || {},
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async isFeatureEnabled(tenantId: string, featureName: string): Promise<boolean> {
    const profile = await this.getProfile(tenantId);
    if (!profile) return false;
    const features = profile.features_config || {};
    return features[featureName] === true;
  }
}
