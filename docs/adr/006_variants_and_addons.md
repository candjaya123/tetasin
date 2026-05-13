# ADR-006: Product Variants and Add-ons

**Status:** Accepted
**Date:** 2026-05-12
**Authors:** Architecture Team
**Related:** ADR-004 (Universal Product Engine), ADR-005 (Industry Profiles)

---

## Decision

Implement **product variants** (size, color, flavor) and **product add-ons** (toppings, extras) as separate tables linked to `products`. Variants generate distinct SKUs with their own pricing and stock. Add-ons are optional selections at checkout that do not require stock tracking by default.

## Context

F&B and Retail industries require:
- **Variants:** "Kopi Susu" in sizes Small (Rp 15k), Medium (Rp 20k), Large (Rp 25k)
- **Add-ons:** "Extra shot espresso (+Rp 5k)", "Oat milk (+Rp 8k)", "Less sugar (free)"

These cannot be modeled as separate products because they share the same product identity and image, and variants must be selectable in a single POS interaction.

## Database Schema

### Variant Groups + Options

```sql
-- Variant dimension (e.g., "Size", "Color", "Flavor")
CREATE TABLE product_variant_groups (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,         -- 'Ukuran', 'Warna', 'Rasa'
    is_required BOOLEAN DEFAULT TRUE,
    sort_order  INTEGER DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Variant option (e.g., "Small", "Medium", "Large")
CREATE TABLE product_variant_options (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    variant_group_id UUID NOT NULL REFERENCES product_variant_groups(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,     -- 'Small', 'Medium', 'Large'
    sort_order      INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Variant SKU (combination of options → price + stock)
CREATE TABLE product_variants (
    id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    product_id          UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sku                 TEXT,
    barcode             TEXT,
    name                TEXT NOT NULL,              -- 'Kopi Susu - Large'
    price               NUMERIC(15,2) NOT NULL,
    stock               NUMERIC(15,3) NOT NULL DEFAULT 0,
    option_combination  JSONB NOT NULL DEFAULT '{}', -- { "size": "large", "color": "black" }
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_variants_product_sku UNIQUE (product_id, sku)
);

CREATE INDEX idx_product_variants_product ON product_variants(product_id);
```

### Add-on Groups + Options

```sql
-- Add-on group (e.g., "Topping", "Extra Shot", "Milk Type")
CREATE TABLE product_addon_groups (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,           -- 'Topping', 'Pilihan Susu'
    min_select  INTEGER DEFAULT 0,       -- 0 = optional
    max_select  INTEGER DEFAULT 1,       -- 1 = single select, N = multi-select
    sort_order  INTEGER DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Add-on option (e.g., "Boba +3k", "Oat Milk +8k")
CREATE TABLE product_addons (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    addon_group_id  UUID NOT NULL REFERENCES product_addon_groups(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,       -- 'Boba', 'Oat Milk', 'Extra Shot'
    price           NUMERIC(15,2) NOT NULL DEFAULT 0,
    is_active       BOOLEAN DEFAULT TRUE,
    sort_order      INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_product_addons_group ON product_addons(addon_group_id);
```

## POS Checkout: Variant + Add-on Selection

```typescript
// sale_items extended for variant + add-on capture
CREATE TABLE sale_items (
    ...existing columns...,
    variant_id   UUID REFERENCES product_variants(id),
    addons       JSONB DEFAULT '[]',
    -- addons: [{ addon_id, name, price }, ...]
);
```

```typescript
// POS service: resolves final price including variant + addons
async resolveItemPrice(item: CartItemInput): Promise<number> {
  let price = item.unit_price;

  if (item.variant_id) {
    const variant = await this.variantRepo.findById(item.variant_id);
    price = variant.price;
  }

  const addonTotal = (item.addons || []).reduce((sum, a) => sum + a.price, 0);
  return price + addonTotal;
}
```

## Stock Deduction Logic

| Item Type | Stock Deducted From |
|---|---|
| Product (no variant) | `raw_materials` via product recipe |
| Product variant | `product_variants.stock` (if `track_stock` behavior enabled) |
| Add-on | No stock deduction (add-ons are service items by default) |

## API

```
GET    /api/v1/inventory/products/:id/variants         ← List all variants
POST   /api/v1/inventory/products/:id/variants         ← Create variant
PUT    /api/v1/inventory/products/:id/variants/:vId    ← Update variant price/stock
GET    /api/v1/inventory/products/:id/addon-groups     ← List add-on groups
POST   /api/v1/inventory/products/:id/addon-groups     ← Create add-on group
POST   /api/v1/inventory/products/:id/addon-groups/:gId/addons ← Add option to group
```

## Enabling Per Product

Variants and add-ons are gated by `product_behaviors`:

```typescript
// Only 'hybrid' and 'physical' products support variants
// Only 'hybrid' and 'composite' products support add-ons

await this.behaviorRepo.set(productId, 'allow_variants', { enabled: true });
await this.behaviorRepo.set(productId, 'allow_addons', { enabled: true });
```
