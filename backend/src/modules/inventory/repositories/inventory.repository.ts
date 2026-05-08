import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../../shared/supabase.service';
import { PoolClient } from 'pg';

@Injectable()
export class InventoryRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getProductWithRecipe(productId: string, tenantId: string, dbClient?: PoolClient) {
    if (dbClient) {
      console.log(`[PG] Fetching product with recipe: ${productId}`);
      const res = await dbClient.query(`
        SELECT p.*, 
          (
            SELECT json_agg(json_build_object(
              'raw_material_id', r.raw_material_id,
              'quantity_needed', r.quantity_needed,
              'raw_materials', (
                SELECT json_build_object(
                  'name', m.name,
                  'unit_price', m.unit_price,
                  'current_stock', m.current_stock
                )
                FROM raw_materials m WHERE m.id = r.raw_material_id
              )
            )) 
            FROM product_recipes r WHERE r.product_id = p.id
          ) as product_recipes
        FROM products p 
        WHERE p.id = $1 AND p.tenant_id = $2
      `, [productId, tenantId]);
      console.log(`[PG] Found product: ${res.rows[0]?.name}`);
      return res.rows[0];
    }

    const client = this.supabaseService.getClient();
    // ... existing supabase client logic ...
    const { data, error } = await client
      .from('products')
      .select(`
        *,
        product_recipes (
          raw_material_id,
          quantity_needed,
          raw_materials (
            name,
            unit_price,
            current_stock
          )
        )
      `)
      .eq('id', productId)
      .eq('tenant_id', tenantId)
      .single();

    if (error) throw error;
    return data;
  }

  async deductStock(materialId: string, quantity: number, dbClient?: PoolClient) {
    if (dbClient) {
      console.log(`[PG] Deducting stock: ${materialId} - ${quantity}`);
      await dbClient.query('SELECT deduct_stock_simple($1, $2)', [materialId, quantity]);
      console.log(`[PG] Stock deducted successfully`);
      return;
    }

    const client = this.supabaseService.getClient();
    const { error } = await client.rpc('deduct_stock_simple', {
      p_material_id: materialId,
      p_quantity: quantity,
    });
    if (error) throw error;
  }
}
