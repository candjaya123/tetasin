import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../../shared/supabase.service';

@Injectable()
export class OrderService {
  constructor(private readonly supabaseService: SupabaseService) {}

  // ========== Customers ==========
  async getCustomers(tenantId: string) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('customers')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async createCustomer(tenantId: string, payload: any) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('customers')
      .insert({ ...payload, tenant_id: tenantId })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateCustomer(tenantId: string, id: string, payload: any) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('customers')
      .update(payload)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // ========== Purchase Orders ==========
  async getPurchaseOrders(tenantId: string) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('purchase_orders')
      .select(`
        *,
        purchase_order_items (*)
      `)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async createPurchaseOrder(tenantId: string, payload: any) {
    const client = this.supabaseService.getClient();
    const { vendor_name, reference_number, total_amount, items, status } = payload;

    const { data: po, error: poError } = await client
      .from('purchase_orders')
      .insert({
        tenant_id: tenantId,
        vendor_name,
        reference_number,
        total_amount,
        status: status || 'draft',
      })
      .select()
      .single();
    if (poError) throw poError;

    if (items && items.length > 0) {
      const { error: itemsError } = await client
        .from('purchase_order_items')
        .insert(items.map((item: any) => ({
          po_id: po.id,
          raw_material_id: item.raw_material_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          received_qty: 0,
        })));
      if (itemsError) throw itemsError;
    }

    return po;
  }

  async updatePurchaseOrder(tenantId: string, id: string, payload: any) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('purchase_orders')
      .update(payload)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async receivePurchaseOrder(tenantId: string, poId: string, items: Array<{ item_id: string; received_qty: number }>, userId: string) {
    const client = this.supabaseService.getClient();

    for (const item of items) {
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
      .eq('tenant_id', tenantId)
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await client.from('activity_logs').insert({
      tenant_id: tenantId,
      user_id: userId,
      action: 'po_received',
      details: { po_id: poId, status: newStatus },
    });

    return data;
  }

  // ========== Sales Orders (Pesanan) ==========
  async getSalesOrders(tenantId: string, status?: string, source?: string) {
    const client = this.supabaseService.getClient();
    let query = client
      .from('sales_orders')
      .select('*')
      .eq('tenant_id', tenantId);

    if (status) query = query.eq('status', status);
    if (source) query = query.eq('source', source);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async getSalesOrder(tenantId: string, id: string) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('sales_orders')
      .select(`
        *,
        transactions (*,
          sale_items (*)
        )
      `)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();
    if (error) throw error;
    if (!data) throw new NotFoundException('Pesanan tidak ditemukan');
    return data;
  }

  async getSalesOrderStatus(tenantId: string, id: string): Promise<string> {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('sales_orders')
      .select('status')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();
    if (error || !data) throw new NotFoundException('Pesanan tidak ditemukan');
    return data.status;
  }

  async createSalesOrder(tenantId: string, payload: any, userId: string) {
    const client = this.supabaseService.getClient();
    const pesananNumber = payload.pesanan_number ||
      `ORD-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`;

    const { data, error } = await client
      .from('sales_orders')
      .insert({
        tenant_id: tenantId,
        pesanan_number: pesananNumber,
        customer_name: payload.customer_name,
        status: payload.status || 'draft',
        source: payload.source || 'manual',
        division_notes: payload.division_notes || {},
        total_amount: payload.total_amount || 0,
        notes: payload.notes || null,
        created_by: userId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateSalesOrderStatus(
    tenantId: string, id: string, newStatus: string,
    divisionNote?: string, division?: string, userId?: string,
  ) {
    const client = this.supabaseService.getClient();

    const { data: order } = await client
      .from('sales_orders')
      .select('division_notes')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();

    if (!order) throw new NotFoundException('Pesanan tidak ditemukan');

    let divisionNotes = order.division_notes || {};
    if (division && divisionNote) {
      divisionNotes = { ...divisionNotes, [division]: divisionNote };
    }

    const updateData: Record<string, any> = {
      status: newStatus,
      division_notes: divisionNotes,
      updated_at: new Date().toISOString(),
    };

    if (newStatus === 'fulfilled') updateData.fulfilled_at = new Date().toISOString();

    const { data, error } = await client
      .from('sales_orders')
      .update(updateData)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    if (error) throw error;

    // Log activity
    if (userId) {
      await client.from('activity_logs').insert({
        tenant_id: tenantId,
        user_id: userId,
        action: `pesanan_${newStatus}`,
        details: { pesanan_id: id, status: newStatus },
      });
    }

    return data;
  }

  async updateSalesOrderDivisionNotes(
    tenantId: string,
    orderId: string,
    notes: { kasir?: string; stok?: string; dapur?: string },
  ) {
    const client = this.supabaseService.getClient();

    const { data: order, error: fetchError } = await client
      .from('sales_orders')
      .select('division_notes')
      .eq('tenant_id', tenantId)
      .eq('id', orderId)
      .single();

    if (fetchError || !order) {
      throw new NotFoundException('Pesanan tidak ditemukan');
    }

    const divisionNotes = {
      ...(order.division_notes || {}),
      ...notes,
    };

    const { data, error } = await client
      .from('sales_orders')
      .update({ division_notes: divisionNotes, updated_at: new Date().toISOString() })
      .eq('tenant_id', tenantId)
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
