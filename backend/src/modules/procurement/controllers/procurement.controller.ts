import { Controller, Get, Post, Body, Request, UseGuards } from '@nestjs/common';
import { SupabaseService } from '../../../shared/supabase.service';
import { JwtAuthGuard } from '../../business-profile/guards/jwt-auth.guard';
import { RequireTier } from '../../../core/auth/tier.decorator';
import { SubscriptionTier } from '../../../core/auth/tier.enum';

@Controller('api/v1/procurement')
@UseGuards(JwtAuthGuard)
export class ProcurementController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Get('drafts')
  @RequireTier(SubscriptionTier.FULL)
  async getDrafts(@Request() req: any) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('business_memory')
      .select('*')
      .eq('tenant_id', req.user.tenant_id)
      .eq('memory_type', 'procurement_draft')
      .order('created_at', { ascending: false });
    
    if (error) throw error;

    // Transform memory content ke format draft yang diharapkan frontend
    return (data || []).map(m => ({
      id: m.id,
      reference: `PO-AI-${m.id.split('-')[0].toUpperCase()}`,
      vendor_name: m.content.vendor || "Supplier Utama",
      items: m.content.items || [],
      created_at: m.created_at,
      status: 'DRAFT'
    }));
  }

  @Post('approve-draft')
  @RequireTier(SubscriptionTier.FULL)
  async approveDraft(@Request() req: any, @Body() payload: any) {
    const client = this.supabaseService.getClient();

    // 1. Create Real Purchase Order
    const { data: po, error: poError } = await client
      .from('purchase_orders')
      .insert({
        tenant_id: req.user.tenant_id,
        vendor_name: payload.vendor_name,
        reference_number: payload.reference,
        total_amount: payload.total_amount,
        status: 'sent'
      })
      .select()
      .single();

    if (poError) throw poError;

    // 2. Delete Draft from memory
    await client
      .from('business_memory')
      .delete()
      .eq('id', payload.id)
      .eq('tenant_id', req.user.tenant_id);

    return po;
  }
}
