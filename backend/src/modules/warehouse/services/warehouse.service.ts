import { Injectable, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../../../shared/supabase.service';

@Injectable()
export class WarehouseService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getWarehouses(tenantId: string) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('warehouses')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async createWarehouse(tenantId: string, data: any) {
    const client = this.supabaseService.getClient();
    const { data: result, error } = await client
      .from('warehouses')
      .insert({ ...data, tenant_id: tenantId })
      .select()
      .single();
    
    if (error) throw error;
    return result;
  }

  async updateWarehouse(id: string, tenantId: string, data: any) {
    const client = this.supabaseService.getClient();
    const { data: result, error } = await client
      .from('warehouses')
      .update(data)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single();
    
    if (error) throw error;
    return result;
  }

  async deleteWarehouse(id: string, tenantId: string) {
    const client = this.supabaseService.getClient();
    const { error } = await client
      .from('warehouses')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);
    
    if (error) throw error;
    return { success: true };
  }

  // Stock Transfer Logic
  async createStockTransfer(tenantId: string, userId: string, payload: any) {
    const client = this.supabaseService.getClient();
    const { from_warehouse_id, to_warehouse_id, items, notes } = payload;

    const { data: transfer, error: transferError } = await client
      .from('stock_transfers')
      .insert({
        tenant_id: tenantId,
        from_warehouse_id,
        to_warehouse_id,
        notes,
        created_by: userId,
        status: 'pending'
      })
      .select()
      .single();

    if (transferError) throw transferError;

    const transferItems = items.map((item: any) => ({
      transfer_id: transfer.id,
      raw_material_id: item.product_id,
      quantity: item.quantity
    }));

    const { error: itemsError } = await client
      .from('stock_transfer_items')
      .insert(transferItems);

    if (itemsError) throw itemsError;

    return transfer;
  }

  // Stock Opname Logic
  async createStockOpname(tenantId: string, userId: string, payload: any) {
    const client = this.supabaseService.getClient();
    const { warehouse_id, items, notes } = payload;

    const { data: opname, error: opnameError } = await client
      .from('stock_opnames')
      .insert({
        tenant_id: tenantId,
        warehouse_id,
        notes,
        created_by: userId
      })
      .select()
      .single();

    if (opnameError) throw opnameError;

    const opnameItems = items.map((item: any) => ({
      opname_id: opname.id,
      product_id: item.product_id,
      system_quantity: item.system_quantity,
      physical_quantity: item.physical_quantity,
      difference: item.physical_quantity - item.system_quantity
    }));

    const { error: itemsError } = await client
      .from('stock_opname_items')
      .insert(opnameItems);

    if (itemsError) throw itemsError;

    return opname;
  }
}
