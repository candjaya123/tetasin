import { Injectable } from '@nestjs/common';
import { InventoryRepository } from '../repositories/inventory.repository';
import { SupabaseService } from '../../../shared/supabase.service';

@Injectable()
export class InventoryService {
  constructor(
    private readonly inventoryRepository: InventoryRepository,
    private readonly supabaseService: SupabaseService,
  ) {}

  async uploadFile(tenantId: string, file: Express.Multer.File) {
    const client = this.supabaseService.getClient();
    const fileName = `inventory/${tenantId}/${Date.now()}-${file.originalname}`;
    
    const { data, error } = await client.storage
      .from('inventory-docs')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });
    
    if (error) throw error;

    const { data: { publicUrl } } = client.storage
      .from('inventory-docs')
      .getPublicUrl(fileName);
    
    return publicUrl;
  }

  async getRawMaterials(tenantId: string) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('raw_materials')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data;
  }

  async addRawMaterial(tenantId: string, data: any) {
    const client = this.supabaseService.getClient();
    const { error } = await client
      .from('raw_materials')
      .insert({ ...data, tenant_id: tenantId });
    
    if (error) throw error;
  }

  async updateRawMaterial(id: string, tenantId: string, data: any) {
    const client = this.supabaseService.getClient();
    const { error } = await client
      .from('raw_materials')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('tenant_id', tenantId);
    
    if (error) throw error;
  }

  async deleteRawMaterial(id: string, tenantId: string) {
    const client = this.supabaseService.getClient();
    const { error } = await client
      .from('raw_materials')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);
    
    if (error) throw error;
  }

  async getProducts(tenantId: string, search?: string) {
    const client = this.supabaseService.getClient();
    let query = client
      .from('products')
      .select(`
        *,
        product_recipes (
          raw_material_id,
          quantity_needed,
          raw_materials (
            name,
            unit,
            unit_price
          )
        )
      `)
      .eq('tenant_id', tenantId)
      .order('name', { ascending: true });

    if (search && search.trim() !== '') {
      query = query.ilike('name', `%${search.trim()}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async createProductWithRecipe(user: any, data: any) {
    const client = this.supabaseService.getClient();
    const { p_name, p_selling_price, p_recipe, p_barcode, p_image_url, p_stock } = data;
    const tenantId = user.tenant_id;

    const { data: product, error: prodError } = await client
      .from('products')
      .insert({
        tenant_id: tenantId,
        name: p_name,
        selling_price: p_selling_price,
        barcode: p_barcode,
        image_url: p_image_url,
        stock: p_stock || 0
      })
      .select('id')
      .single();
    
    if (prodError) throw prodError;

    if (p_recipe && p_recipe.length > 0) {
      const recipeData = p_recipe.map((r: any) => ({
        tenant_id: tenantId,
        product_id: product.id,
        raw_material_id: r.raw_material_id,
        quantity_needed: r.quantity_needed
      }));
      const { error: recipeError } = await client
        .from('product_recipes')
        .insert(recipeData);
      
      if (recipeError) throw recipeError;
    }
    
    return product.id;
  }

  async updateProductStock(productId: string, tenantId: string, newStock: number) {
    const client = this.supabaseService.getClient();
    const { error } = await client
      .from('products')
      .update({ stock: newStock, updated_at: new Date().toISOString() })
      .eq('id', productId)
      .eq('tenant_id', tenantId);

    if (error) throw error;
    return { productId, newStock, status: 'updated' };
  }

  async updateProductWithRecipe(productId: string, tenantId: string, data: any) {
    const client = this.supabaseService.getClient();
    const { p_name, p_selling_price, p_recipe, p_barcode, p_image_url, p_stock } = data;
    
    const { error: prodError } = await client
      .from('products')
      .update({
        name: p_name,
        selling_price: p_selling_price,
        barcode: p_barcode,
        image_url: p_image_url,
        stock: p_stock,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId)
      .eq('tenant_id', tenantId);
    
    if (prodError) throw prodError;

    await client
      .from('product_recipes')
      .delete()
      .eq('product_id', productId)
      .eq('tenant_id', tenantId);

    if (p_recipe && p_recipe.length > 0) {
      const recipeData = p_recipe.map((r: any) => ({
        tenant_id: tenantId,
        product_id: productId,
        raw_material_id: r.raw_material_id,
        quantity_needed: r.quantity_needed
      }));
      const { error: recipeError } = await client
        .from('product_recipes')
        .insert(recipeData);
        
      if (recipeError) throw recipeError;
    }
  }

  async deleteProduct(id: string, tenantId: string) {
    const client = this.supabaseService.getClient();
    const { error, count } = await client
      .from('products')
      .delete({ count: 'exact' })
      .eq('id', id)
      .eq('tenant_id', tenantId);
    
    if (error) throw error;
    if (count === 0) throw new Error('Produk tidak ditemukan atau Anda tidak memiliki akses.');
  }

  async getBills(tenantId: string) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('bills')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('due_date', { ascending: true });
    
    if (error) throw error;
    return data;
  }

  async addBill(tenantId: string, data: any) {
    const client = this.supabaseService.getClient();
    const { error } = await client
      .from('bills')
      .insert({ ...data, tenant_id: tenantId });
    
    if (error) throw error;
  }

  async updateBill(id: string, tenantId: string, data: any) {
    const client = this.supabaseService.getClient();
    const { error } = await client
      .from('bills')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('tenant_id', tenantId);
    
    if (error) throw error;
  }

  async deleteBill(id: string, tenantId: string) {
    const client = this.supabaseService.getClient();
    const { error } = await client
      .from('bills')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);
    
    if (error) throw error;
  }

  async getAssets(tenantId: string) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('assets')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async addAsset(tenantId: string, data: any) {
    const client = this.supabaseService.getClient();
    const { error } = await client
      .from('assets')
      .insert({ ...data, tenant_id: tenantId });
    
    if (error) throw error;
  }

  async updateAsset(id: string, tenantId: string, data: any) {
    const client = this.supabaseService.getClient();
    const { error } = await client
      .from('assets')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('tenant_id', tenantId);
    
    if (error) throw error;
  }

  async deleteAsset(id: string, tenantId: string) {
    const client = this.supabaseService.getClient();
    const { error } = await client
      .from('assets')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);
    
    if (error) throw error;
  }

  async getWarehouses(tenantId: string) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('warehouses')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data;
  }

  async stockTransfer(tenantId: string, payload: any) {
    const client = this.supabaseService.getClient();
    const { error } = await client.rpc('transfer_stock', {
      p_tenant_id: tenantId,
      p_from_warehouse: payload.from_warehouse_id,
      p_to_warehouse: payload.to_warehouse_id,
      p_product_id: payload.product_id,
      p_quantity: payload.quantity
    });
    
    if (error) throw error;
    return { success: true };
  }

  async stockOpname(tenantId: string, payload: any) {
    const client = this.supabaseService.getClient();
    const { error } = await client.rpc('stock_opname', {
      p_tenant_id: tenantId,
      p_warehouse_id: payload.warehouse_id,
      p_product_id: payload.product_id,
      p_actual_stock: payload.actual_stock,
      p_notes: payload.notes
    });

    if (error) throw error;
    return { success: true };
  }
}
