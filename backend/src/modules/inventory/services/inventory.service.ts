import { Injectable, ForbiddenException } from '@nestjs/common';
import { InventoryRepository } from '../repositories/inventory.repository';
import { SupabaseService } from '../../../shared/supabase.service';
import { SubscriptionTier } from '../../../core/auth/tier.enum';

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

    console.log(`Fetching products for tenant ${tenantId} with search: ${search}`);
    const { data, error } = await query;
    if (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
    console.log(`Found ${data?.length || 0} products`);
    return data;
  }


  async createProductWithRecipe(user: any, data: any) {
    const client = this.supabaseService.getClient();
    const { p_name, p_selling_price, p_recipe, p_barcode, p_image_url, p_stock } = data;
    const tenantId = user.tenant_id;

    if (user.tier === SubscriptionTier.TRIAL) {
      const { count, error: countError } = await client
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId);
      
      if (countError) throw countError;
      if (count && count >= 150) {
        throw new ForbiddenException('Limit 150 produk tercapai untuk Tier FREE. Silakan upgrade ke Tier BUSINESS.');
      }
    }
    
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
    
    // 1. Update Product
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

    // 2. Delete existing recipe
    const { error: delError } = await client
      .from('product_recipes')
      .delete()
      .eq('product_id', productId)
      .eq('tenant_id', tenantId);
      
    if (delError) throw delError;

    // 3. Insert new recipe
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
    console.log(`Deleting product ${id} for tenant ${tenantId}`);
    const { error, count } = await client
      .from('products')
      .delete({ count: 'exact' })
      .eq('id', id)
      .eq('tenant_id', tenantId);
    
    if (error) throw error;
    if (count === 0) {
      console.error(`Product ${id} not found or doesn't belong to tenant ${tenantId}`);
      throw new Error('Produk tidak ditemukan atau Anda tidak memiliki akses.');
    }
    console.log(`Product ${id} deleted successfully`);
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
    // Assuming you have an RPC or table for stock transfers
    // For now we just insert into a `stock_transfers` log or update stock directly
    // This requires an RPC 'transfer_stock' on the database
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
    // Assuming an RPC 'stock_opname' to adjust physical vs system stock
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
