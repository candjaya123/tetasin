import { Controller, Get, Post, Put, Param, Body, Request, UseGuards } from '@nestjs/common';
import { SupabaseService } from '../../../shared/supabase.service';
import { JwtAuthGuard } from '../../business-profile/guards/jwt-auth.guard';
import { RequireTier } from '../../../core/auth/tier.decorator';
import { SubscriptionTier } from '../../../core/constants/subscription-tier.enum';
import type { AuthenticatedRequest } from '../../../core/auth/authenticated-request.interface';

@Controller('api/v1/procurement')
@UseGuards(JwtAuthGuard)
@RequireTier(SubscriptionTier.PRO)
export class ProcurementController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Get('drafts')
  async getDrafts(@Request() req: AuthenticatedRequest) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('business_memory')
      .select('*')
      .eq('tenant_id', req.user.tenant_id)
      .eq('memory_type', 'procurement_draft')
      .order('created_at', { ascending: false });

    if (error) throw error;

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
  async approveDraft(@Request() req: AuthenticatedRequest, @Body() payload: any) {
    const client = this.supabaseService.getClient();

    const { data: po, error: poError } = await client
      .from('purchase_orders')
      .insert({
        tenant_id: req.user.tenant_id,
        vendor_name: payload.vendor_name,
        reference_number: payload.reference,
        total_amount: payload.total_amount,
        status: 'sent',
      })
      .select()
      .single();

    if (poError) throw poError;

    // Insert PO items if present
    if (payload.items && payload.items.length > 0) {
      const { error: itemsError } = await client
        .from('purchase_order_items')
        .insert(payload.items.map((item: any) => ({
          po_id: po.id,
          raw_material_id: item.raw_material_id || item.materialId,
          quantity: item.quantity,
          unit_price: item.unit_price || 0,
          received_qty: 0,
        })));
      if (itemsError) throw itemsError;
    }

    await client.from('activity_logs').insert({
      tenant_id: req.user.tenant_id,
      user_id: req.user.id,
      action: 'po_created_from_draft',
      details: { po_id: po.id, vendor: payload.vendor_name },
    });

    await client
      .from('business_memory')
      .delete()
      .eq('id', payload.id)
      .eq('tenant_id', req.user.tenant_id);

    return po;
  }

  @Put('purchase-orders/:id/receive')
  async receivePurchaseOrder(
    @Request() req: AuthenticatedRequest,
    @Param('id') poId: string,
    @Body() body: { items: Array<{ item_id: string; received_qty: number }> },
  ) {
    const client = this.supabaseService.getClient();

    for (const item of body.items) {
      const { error } = await client
        .from('purchase_order_items')
        .update({ received_qty: item.received_qty })
        .eq('id', item.item_id)
        .eq('po_id', poId);
      if (error) throw error;
    }

    const { data: poItems } = await client
      .from('purchase_order_items')
      .select('quantity, received_qty')
      .eq('po_id', poId);

    const allReceived = poItems?.every(i => Number(i.received_qty) >= Number(i.quantity));
    const anyReceived = poItems?.some(i => Number(i.received_qty) > 0);
    const newStatus = allReceived ? 'received' : anyReceived ? 'partially_received' : 'sent';

    const { data, error } = await client
      .from('purchase_orders')
      .update({ status: newStatus })
      .eq('id', poId)
      .eq('tenant_id', req.user.tenant_id)
      .select()
      .single();

    if (error) throw error;

    await client.from('activity_logs').insert({
      tenant_id: req.user.tenant_id,
      user_id: req.user.id,
      action: 'po_received',
      details: { po_id: poId, status: newStatus },
    });

    return data;
  }
}
