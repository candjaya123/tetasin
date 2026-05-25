# ADR-004: Universal Product Engine

**Status:** Accepted
**Date:** 2026-05-12
**Authors:** Architecture Team
**Related:** ADR-005 (Industry Profiles), ADR-006 (Variants & Add-ons)

---

## Decision

Replace the single-type `products` table with a **Universal Product Engine** — a discriminated product model using `product_type` to dispatch behavior, supported by a `product_behaviors` table.

## Context

Tetasin serves 7 industry verticals (Retail, F&B, Grocery, Pharmacy, Electronics, Manufacturing, Service). Each industry has fundamentally different product behaviors:

| Behavior | Retail | F&B | Service | Pharmacy | Weighted |
|---|---|---|---|---|---|
| Fixed price | ✅ | ✅ | ✅ | ✅ | ❌ |
| Price by weight | ❌ | Sometimes | ❌ | ❌ | ✅ |
| BOM / recipe deduction | ❌ | ✅ | ❌ | ❌ | ❌ |
| Variants (size, color) | ✅ | ✅ | ❌ | ✅ | ❌ |
| Add-ons (toppings) | ❌ | ✅ | ❌ | ❌ | ❌ |
| No stock tracking | ❌ | ❌ | ✅ | ❌ | ❌ |
| Custom price at checkout | ❌ | ❌ | ✅ | ❌ | ✅ |

## Product Types

```typescript
type ProductType =
  | 'physical'      // Retail: fixed price, stock tracked
  | 'service'       // Service: no stock, price may be negotiated
  | 'digital'       // Digital: no stock, download/code delivery
  | 'weighted'      // Grocery: price × weight at checkout
  | 'composite'     // F&B: BOM/recipe deducts raw materials
  | 'custom_price'  // Repair/wholesale: price set at checkout
  | 'hybrid';       // F&B: base product + add-on groups
```

## Database Schema

### products (extended)

```sql
CREATE TABLE products (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    sku             TEXT,
    barcode         TEXT,
    product_type    TEXT NOT NULL DEFAULT 'physical',
    base_price      NUMERIC(15,2) NOT NULL DEFAULT 0,
    stock_unit      TEXT DEFAULT 'pcs',
    is_active       BOOLEAN DEFAULT TRUE,
    image_url       TEXT,
    description     TEXT,
    category        TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_products_tenant_sku UNIQUE (tenant_id, sku)
);
```

### product_behaviors

```sql
CREATE TABLE product_behaviors (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    behavior_key    TEXT NOT NULL,
    behavior_value  JSONB NOT NULL DEFAULT '{}',
    CONSTRAINT uq_product_behavior UNIQUE (product_id, behavior_key)
);

-- Examples:
-- behavior_key = 'track_stock'      → { enabled: true }
-- behavior_key = 'use_recipe'       → { enabled: true, yield_quantity: 1 }
-- behavior_key = 'price_by_weight'  → { unit: 'gram', price_per_unit: 50 }
-- behavior_key = 'allow_variants'   → { enabled: true }
-- behavior_key = 'allow_addons'     → { enabled: true }
-- behavior_key = 'custom_price'     → { enabled: true, min: 0, max: null }
-- behavior_key = 'expiry_tracking'  → { enabled: true }
-- behavior_key = 'batch_tracking'   → { enabled: true }
```

## Behavior Dispatch (Service Layer)

```typescript
// ProductBehaviorService resolves correct pipeline per product_type
@Injectable()
export class ProductBehaviorService {
  async resolveCheckoutBehavior(productId: string): Promise<CheckoutBehavior> {
    const behaviors = await this.behaviorRepo.findByProduct(productId);
    return {
      trackStock: behaviors.get('track_stock')?.enabled ?? true,
      useRecipe: behaviors.get('use_recipe')?.enabled ?? false,
      priceByWeight: behaviors.get('price_by_weight')?.enabled ?? false,
      allowCustomPrice: behaviors.get('custom_price')?.enabled ?? false,
    };
  }
}

// POS checkout pipeline dispatches based on resolved behaviors
async processItem(item: CartItem, client: SupabaseClient): Promise<void> {
  const behavior = await this.behaviorService.resolveCheckoutBehavior(item.product_id);

  if (behavior.useRecipe) await this.deductRecipeIngredients(item, client);
  else if (behavior.trackStock) await this.deductDirectStock(item, client);
  // Services: no stock deduction needed
}
```

## Industry Default Behaviors

```typescript
const INDUSTRY_DEFAULT_BEHAVIORS: Record<IndustryType, ProductType> = {
  retail:         'physical',
  fnb:            'composite',   // BOM deduction by default
  grocery:        'weighted',    // Price by weight
  pharmacy:       'physical',    // With expiry + batch tracking
  electronics:    'physical',    // With serial tracking
  manufacturing:  'composite',   // Recipe-based
  service:        'service',     // No stock
};
```

## Migration Path

Phase 1 (Complete): `product_type` column added to `products` with default `'physical'` — all existing products remain functional.

Phase 2 (In Progress): `product_behaviors` table created; behavior dispatching in `ProductBehaviorService`.

Phase 3 (Planned): F&B features use `composite` type with recipe deduction; Grocery uses `weighted`.
