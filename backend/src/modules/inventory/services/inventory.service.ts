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

  async getProductById(tenantId: string, productId: string) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
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
      .eq('id', productId)
      .eq('tenant_id', tenantId)
      .single();
    if (error) throw error;
    if (!data) throw new Error('Produk tidak ditemukan');
    return data;
  }

  async getRawMaterialById(tenantId: string, id: string) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('raw_materials')
      .select(`
        *,
        product_recipes!raw_material_id (
          product_id,
          quantity_needed,
          products (name)
        )
      `)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();
    if (error) throw error;
    if (!data) throw new Error('Bahan baku tidak ditemukan');
    return data;
  }

  async getProductRecipes(tenantId: string, productId: string) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('product_recipes')
      .select('*, raw_materials(*)')
      .eq('product_id', productId)
      .eq('tenant_id', tenantId);
    if (error) throw error;
    return data || [];
  }

  async addProductRecipe(tenantId: string, productId: string, body: any) {
    const client = this.supabaseService.getClient();
    const { error } = await client
      .from('product_recipes')
      .insert({
        tenant_id: tenantId,
        product_id: productId,
        raw_material_id: body.raw_material_id,
        quantity_needed: body.quantity_needed,
      });
    if (error) throw error;
  }

  async updateProductRecipe(tenantId: string, productId: string, recipeId: string, body: any) {
    const client = this.supabaseService.getClient();
    const { error } = await client
      .from('product_recipes')
      .update({ quantity_needed: body.quantity_needed })
      .eq('id', recipeId)
      .eq('product_id', productId)
      .eq('tenant_id', tenantId);
    if (error) throw error;
  }

  async deleteProductRecipe(tenantId: string, productId: string, recipeId: string) {
    const client = this.supabaseService.getClient();
    const { error } = await client
      .from('product_recipes')
      .delete()
      .eq('id', recipeId)
      .eq('product_id', productId)
      .eq('tenant_id', tenantId);
    if (error) throw error;
  }

  async getHppPreview(tenantId: string, productId: string) {
    const client = this.supabaseService.getClient();
    const { data: product, error: pErr } = await client
      .from('products')
      .select('*')
      .eq('id', productId)
      .eq('tenant_id', tenantId)
      .single();
    if (pErr || !product) throw new Error('Produk tidak ditemukan');

    const { data: recipes, error: rErr } = await client
      .from('product_recipes')
      .select('quantity_needed, raw_materials(name, unit, unit_price)')
      .eq('product_id', productId)
      .eq('tenant_id', tenantId);
    if (rErr) throw rErr;

    if (recipes && recipes.length > 0) {
      const ingredients = recipes.map((r: any) => {
        const rm = r.raw_materials;
        const cost = Number(r.quantity_needed) * Number(rm.unit_price);
        return {
          name: rm.name,
          quantity_needed: r.quantity_needed,
          unit: rm.unit,
          unit_price: rm.unit_price,
          cost,
        };
      });
      const hppPerUnit = ingredients.reduce((sum: number, i: any) => sum + i.cost, 0);
      const grossMarginPct = product.selling_price > 0
        ? ((product.selling_price - hppPerUnit) / product.selling_price) * 100
        : 0;
      return {
        product_name: product.name,
        hpp_mode: 'recipe',
        hpp_per_unit: hppPerUnit,
        selling_price: product.selling_price,
        gross_margin_pct: parseFloat(grossMarginPct.toFixed(1)),
        ingredients,
      };
    }

    if (product.cost_price > 0) {
      const grossMarginPct = product.selling_price > 0
        ? ((product.selling_price - product.cost_price) / product.selling_price) * 100
        : 0;
      return {
        product_name: product.name,
        hpp_mode: 'direct',
        hpp_per_unit: product.cost_price,
        selling_price: product.selling_price,
        gross_margin_pct: parseFloat(grossMarginPct.toFixed(1)),
        ingredients: [],
      };
    }

    return {
      product_name: product.name,
      hpp_mode: 'none',
      hpp_per_unit: 0,
      selling_price: product.selling_price,
      gross_margin_pct: 0,
      ingredients: [],
    };
  }

  async stockAdjustment(tenantId: string, payload: any) {
    const client = this.supabaseService.getClient();
    const { product_id, warehouse_id, adjustment_qty, reason } = payload;
    const { data: product, error: pErr } = await client
      .from('products')
      .select('current_stock')
      .eq('id', product_id)
      .eq('tenant_id', tenantId)
      .single();
    if (pErr || !product) throw new Error('Produk tidak ditemukan');

    const newStock = Number(product.current_stock) + Number(adjustment_qty);
    const { error } = await client
      .from('products')
      .update({ current_stock: newStock, updated_at: new Date().toISOString() })
      .eq('id', product_id)
      .eq('tenant_id', tenantId);
    if (error) throw error;
    return { product_id, new_stock: newStock, reason };
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
        ),
        product_variant_groups (
          id,
          name,
          is_required,
          allow_multiple,
          display_order,
          product_variant_options (
            id,
            name,
            price_delta,
            cost_delta,
            sku_suffix,
            current_stock,
            display_order,
            is_active
          )
        ),
        product_addon_groups (
          id,
          name,
          is_required,
          min_selections,
          max_selections,
          is_promo_eligible,
          display_order,
          product_addons (
            id,
            name,
            price,
            cost_price,
            track_stock,
            current_stock,
            raw_material_id,
            display_order,
            is_active
          )
        )
      `)
      .eq('tenant_id', tenantId)
      .order('name', { ascending: true });

    if (search && search.trim() !== '') {
      query = query.ilike('name', `%${search.trim()}%`);
    }

    try {
      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn(`[InventoryService] Full product query failed (likely missing variant/addon tables), falling back: ${err.message}`);
      // Fallback: query without variant/addon joins
      const fallbackQuery = client
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
        fallbackQuery.ilike('name', `%${search.trim()}%`);
      }

      const { data, error } = await fallbackQuery;
      if (error) throw error;
      return data;
    }
  }

  async createProductWithRecipe(user: any, data: any) {
    const client = this.supabaseService.getClient();
    const { p_name, p_selling_price, p_recipe, p_barcode, p_image_url, p_stock } = data;
    const tenantId = user.tenant_id;

    const productPayload: any = {
      tenant_id: tenantId,
      name: p_name,
      selling_price: p_selling_price,
      barcode: p_barcode || null,
      image_url: p_image_url || null,
      current_stock: p_stock || 0,
    };

    if (data.p_sku !== undefined) productPayload.sku = data.p_sku || null;
    if (data.p_cost_price !== undefined) productPayload.cost_price = data.p_cost_price ?? 0;
    if (data.p_unit !== undefined) productPayload.unit = data.p_unit || 'pcs';
    if (data.p_category !== undefined) productPayload.category = data.p_category || null;
    if (data.p_reorder_point !== undefined) productPayload.reorder_point = data.p_reorder_point ?? 0;
    if (data.product_type !== undefined) productPayload.product_type = data.product_type;
    if (data.base_price_unit !== undefined) productPayload.base_price_unit = data.base_price_unit;
    if (data.track_stock !== undefined) productPayload.track_stock = data.track_stock;

    const { data: product, error: prodError } = await client
      .from('products')
      .insert(productPayload)
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

    if (data.product_type && data.product_type !== 'physical') {
      await this.setProductBehavior(tenantId, product.id, {
        product_type: data.product_type,
        metadata: data.behavior_metadata || {},
      });
    }
    
    return product.id;
  }

  async updateProductStock(productId: string, tenantId: string, newStock: number) {
    const client = this.supabaseService.getClient();
    const { error } = await client
      .from('products')
      .update({ current_stock: newStock, updated_at: new Date().toISOString() })
      .eq('id', productId)
      .eq('tenant_id', tenantId);

    if (error) throw error;
    return { productId, newStock, status: 'updated' };
  }

  async updateProductWithRecipe(productId: string, tenantId: string, data: any) {
    const client = this.supabaseService.getClient();
    const { p_name, p_selling_price, p_barcode, p_image_url, p_stock } = data;
     
    const updatePayload: any = {
      name: p_name,
      selling_price: p_selling_price,
      barcode: p_barcode || null,
      image_url: p_image_url || null,
      updated_at: new Date().toISOString(),
    };

    if (p_stock !== undefined) updatePayload.current_stock = p_stock;
    if (data.p_sku !== undefined) updatePayload.sku = data.p_sku || null;
    if (data.p_cost_price !== undefined) updatePayload.cost_price = data.p_cost_price ?? 0;
    if (data.p_unit !== undefined) updatePayload.unit = data.p_unit || 'pcs';
    if (data.p_category !== undefined) updatePayload.category = data.p_category || null;
    if (data.p_reorder_point !== undefined) updatePayload.reorder_point = data.p_reorder_point ?? 0;
    if (data.product_type !== undefined) updatePayload.product_type = data.product_type;
    if (data.base_price_unit !== undefined) updatePayload.base_price_unit = data.base_price_unit;
    if (data.track_stock !== undefined) updatePayload.track_stock = data.track_stock;

    const { error: prodError } = await client
      .from('products')
      .update(updatePayload)
      .eq('id', productId)
      .eq('tenant_id', tenantId);
    
    if (prodError) throw prodError;

    await client
      .from('product_recipes')
      .delete()
      .eq('product_id', productId)
      .eq('tenant_id', tenantId);

    const _recipe = data.p_recipe;
    if (_recipe && _recipe.length > 0) {
      const recipeData = _recipe.map((r: any) => ({
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

  async getProductBehavior(tenantId: string, productId: string) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('product_behaviors')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('product_id', productId)
      .maybeSingle();
    if (error) throw error;
    return { success: true, data };
  }

  async setProductBehavior(tenantId: string, productId: string, body: any) {
    const { product_type, metadata } = body;
    if (!product_type) throw new Error('product_type required');

    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('product_behaviors')
      .upsert({
        tenant_id: tenantId,
        product_id: productId,
        product_type,
        metadata: metadata || {},
      }, { onConflict: 'product_id' })
      .select()
      .single();
    if (error) throw error;

    await client
      .from('products')
      .update({ product_type, updated_at: new Date().toISOString() })
      .eq('id', productId)
      .eq('tenant_id', tenantId);

    return { success: true, data };
  }

  async deleteProductBehavior(tenantId: string, productId: string) {
    const client = this.supabaseService.getClient();
    const { error } = await client
      .from('product_behaviors')
      .delete()
      .eq('tenant_id', tenantId)
      .eq('product_id', productId);
    if (error) throw error;
    return { success: true };
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

  // ============================================================
  // Product Variants & Add-ons
  // ============================================================

  async getProductVariants(tenantId: string, productId: string) {
    const client = this.supabaseService.getClient();
    const { data: groups, error: gErr } = await client
      .from('product_variant_groups')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('product_id', productId)
      .order('display_order', { ascending: true });

    if (gErr) throw gErr;

    const { data: options, error: oErr } = await client
      .from('product_variant_options')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('product_id', productId)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (oErr) throw oErr;

    return {
      groups: groups || [],
      options: (options || []).map(o => ({ ...o, group_id: o.group_id })),
    };
  }

  async upsertVariantGroup(tenantId: string, productId: string, data: any) {
    const client = this.supabaseService.getClient();
    const payload = {
      tenant_id: tenantId,
      product_id: productId,
      name: data.name,
      is_required: data.is_required ?? true,
      allow_multiple: data.allow_multiple ?? false,
      display_order: data.display_order ?? 0,
    };
    if (data.id) {
      const { error } = await client.from('product_variant_groups').update(payload).eq('id', data.id).eq('tenant_id', tenantId);
      if (error) throw error;
      return { id: data.id };
    } else {
      const { data: created, error } = await client.from('product_variant_groups').insert(payload).select('id').single();
      if (error) throw error;
      return created;
    }
  }

  async deleteVariantGroup(tenantId: string, groupId: string) {
    const client = this.supabaseService.getClient();
    const { error } = await client.from('product_variant_groups').delete().eq('id', groupId).eq('tenant_id', tenantId);
    if (error) throw error;
    return { success: true };
  }

  async upsertVariantOption(tenantId: string, productId: string, groupId: string, data: any) {
    const client = this.supabaseService.getClient();
    const payload = {
      tenant_id: tenantId,
      product_id: productId,
      group_id: groupId,
      name: data.name,
      price_delta: data.price_delta ?? 0,
      cost_delta: data.cost_delta ?? 0,
      sku_suffix: data.sku_suffix || null,
      current_stock: data.current_stock ?? 0,
      display_order: data.display_order ?? 0,
      is_active: data.is_active ?? true,
    };
    if (data.id) {
      const { error } = await client.from('product_variant_options').update(payload).eq('id', data.id).eq('tenant_id', tenantId);
      if (error) throw error;
      return { id: data.id };
    } else {
      const { data: created, error } = await client.from('product_variant_options').insert(payload).select('id').single();
      if (error) throw error;
      return created;
    }
  }

  async deleteVariantOption(tenantId: string, optionId: string) {
    const client = this.supabaseService.getClient();
    const { error } = await client.from('product_variant_options').delete().eq('id', optionId).eq('tenant_id', tenantId);
    if (error) throw error;
    return { success: true };
  }

  async getProductAddons(tenantId: string, productId: string) {
    const client = this.supabaseService.getClient();
    const { data: groups, error: gErr } = await client
      .from('product_addon_groups')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('product_id', productId)
      .order('display_order', { ascending: true });

    if (gErr) throw gErr;

    const { data: addons, error: aErr } = await client
      .from('product_addons')
      .select('*, raw_materials(name, unit)')
      .eq('tenant_id', tenantId)
      .eq('product_id', productId)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (aErr) throw aErr;

    return {
      groups: groups || [],
      addons: addons || [],
    };
  }

  async upsertAddonGroup(tenantId: string, productId: string, data: any) {
    const client = this.supabaseService.getClient();
    const payload = {
      tenant_id: tenantId,
      product_id: productId,
      name: data.name,
      is_required: data.is_required ?? false,
      min_selections: data.min_selections ?? 0,
      max_selections: data.max_selections ?? 1,
      is_promo_eligible: data.is_promo_eligible ?? true,
      display_order: data.display_order ?? 0,
    };
    if (data.id) {
      const { error } = await client.from('product_addon_groups').update(payload).eq('id', data.id).eq('tenant_id', tenantId);
      if (error) throw error;
      return { id: data.id };
    } else {
      const { data: created, error } = await client.from('product_addon_groups').insert(payload).select('id').single();
      if (error) throw error;
      return created;
    }
  }

  async deleteAddonGroup(tenantId: string, groupId: string) {
    const client = this.supabaseService.getClient();
    const { error } = await client.from('product_addon_groups').delete().eq('id', groupId).eq('tenant_id', tenantId);
    if (error) throw error;
    return { success: true };
  }

  async upsertAddon(tenantId: string, productId: string, groupId: string, data: any) {
    const client = this.supabaseService.getClient();
    const payload = {
      tenant_id: tenantId,
      product_id: productId,
      group_id: groupId,
      name: data.name,
      price: data.price ?? 0,
      cost_price: data.cost_price ?? 0,
      track_stock: data.track_stock ?? false,
      current_stock: data.current_stock ?? 0,
      raw_material_id: data.raw_material_id || null,
      display_order: data.display_order ?? 0,
      is_active: data.is_active ?? true,
    };
    if (data.id) {
      const { error } = await client.from('product_addons').update(payload).eq('id', data.id).eq('tenant_id', tenantId);
      if (error) throw error;
      return { id: data.id };
    } else {
      const { data: created, error } = await client.from('product_addons').insert(payload).select('id').single();
      if (error) throw error;
      return created;
    }
  }

  async deleteAddon(tenantId: string, addonId: string) {
    const client = this.supabaseService.getClient();
    const { error } = await client.from('product_addons').delete().eq('id', addonId).eq('tenant_id', tenantId);
    if (error) throw error;
    return { success: true };
  }
}
