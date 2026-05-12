import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../../shared/supabase.service';

@Injectable()
export class ReceiptRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  private get client() {
    return this.supabaseService.getClient();
  }

  async createScan(data: any) {
    const { data: scan, error } = await this.client
      .from('receipt_scans')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return scan;
  }

  async updateScan(id: string, data: any) {
    const { data: scan, error } = await this.client
      .from('receipt_scans')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return scan;
  }

  async getScan(id: string) {
    const { data: scan, error } = await this.client
      .from('receipt_scans')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return scan;
  }

  async createDraft(data: any) {
    const { data: draft, error } = await this.client
      .from('draft_transactions')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return draft;
  }

  async updateDraft(id: string, data: any) {
    const { data: draft, error } = await this.client
      .from('draft_transactions')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return draft;
  }

  async getDraft(id: string) {
    const { data: draft, error } = await this.client
      .from('draft_transactions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return draft;
  }

  async getDraftsByTenant(tenantId: string) {
    const { data, error } = await this.client
      .from('draft_transactions')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async getMerchantMapping(tenantId: string, merchantName: string) {
    const { data, error } = await this.client
      .from('merchant_mappings')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('merchant_name', merchantName.toLowerCase())
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async upsertMerchantMapping(data: any) {
    const { data: mapping, error } = await this.client
      .from('merchant_mappings')
      .upsert(data, { onConflict: 'tenant_id,merchant_name' })
      .select()
      .single();

    if (error) throw error;
    return mapping;
  }
}
