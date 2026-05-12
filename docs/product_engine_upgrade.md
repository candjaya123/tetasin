# Tumbuhin — Universal Commerce Engine: Upgrade Plan

> **Document Purpose:** Planning-level upgrade roadmap to evolve the Tumbuhin POS product system into a modular universal commerce engine supporting multiple business industries.
> **Who Should Read This:** CTO, Product Lead, Backend Lead, Mobile Lead, QA Lead.
> **Why It Matters:** The current product system is optimized for a single industry profile. Supporting 8+ industries without this plan will result in hardcoded branches, duplicated flows, and unmaintainable technical debt.
> **Related ADRs:** ADR-001 (Modular Monolith), ADR-003 (Deterministic Core), ADR-004 (Universal Product Engine), ADR-005 (Industry Profile Config)

---

## 1. Executive Summary

Tumbuhin's current POS product system treats all products identically: fixed price, physical stock, simple BOM/recipe. This plan upgrades it into a **Universal Product Engine** — a modular, configurable, industry-agnostic commerce engine.

**Current System:**
```
products table → fixed behavior → SalesService.processSale() → stock deduct → journal
```

**Target System:**
```
products table + product_type + behaviors
        ↓
ProductBehaviorEngine (routes by type)
        ↓
PricingEngine (computes final price by type)
        ↓  
StockEngine (deducts correctly per type)
        ↓
JournalEngine (journals per behavior)
        ↓
ReceiptEngine (formats receipt per type)
```

---

## 2. Current State Analysis

### 2.1 What Exists Today

| Layer | Current State | Gap |
|---|---|---|
| `products` table | `id, name, selling_price, current_stock, sku, barcode, unit, category, is_active` | No `product_type`; no variant groups; no add-on groups |
| `product_recipes` | BOM for F&B raw material deduction | Only supports F&B scenario; not extensible |
| `SalesService.processSale()` | Deducts raw_material stock if recipe exists, else product stock | Cannot handle service, weighted, custom price; no variant/add-on resolution |
| Flutter `Product` model | `id, name, price, stock, skuCode, recipes` | No type discriminator; no variant/add-on fields |
| Web `AddProductModal` | Name, price, barcode, recipe items | No variant group builder; no add-on group builder |
| POS receipt | `qty × product.name = price × qty` | Cannot format weighted, service, variants, or add-on sub-lines |
| POS cart flow | Direct add-to-cart on product tap | No variant selection dialog; no add-on checklist dialog |

### 2.2 Technical Debt Introduced by Current Design

| Debt Item | Impact | Priority |
|---|---|---|
| No product type discriminator | All service/digital products incorrectly deduct stock | 🔴 Critical |
| `selling_price` single field | Cannot support weighted pricing (price/kg) | 🔴 Critical |
| No variant system | Cannot support retail size/color, F&B size upgrade, pharmacy dosage — each variant is a separate product record causing catalog bloat | 🔴 Critical |
| No add-on system | F&B toppings/modifiers must be added as separate cart products — breaks contextual selection, HPP calculation, and reporting | 🔴 Critical |
| Recipe-only BOM | Cannot support composite bundle products | 🟡 Medium |
| No batch/serial tracking | Cannot support pharmacy/electronics | 🟡 Medium |
| Hardcoded F&B assumptions in `processSale()` | Non-F&B businesses incorrectly trigger recipe deduction check | 🟡 Medium |
| `current_stock` on products (integer) | Weighted products need decimal stock in kg | 🟠 Low |

---

## 3. Target Architecture

### 3.1 Product Type Taxonomy

```
ProductType
├── physical        → Stock deducted per qty. Current default.
├── service         → No stock. Duration. Bookable.
├── digital         → No stock. Code/link delivered.
├── custom_price    → Price entered at POS time.
├── weighted        → Price = base_price × weight. Qty in decimal.
├── composite       → Bundle. Deducts child products.
└── hybrid          → Combination (e.g., device + installation service).
```

### 3.2 Core Engine Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                  UNIVERSAL COMMERCE ENGINE                       │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ProductBehaviorEngine                                   │   │
│  │  - routes all product operations by product_type         │   │
│  │  - registers behavior handlers per type                  │   │
│  │  - enforces behavior contract (interface)                │   │
│  └──────────────────────┬──────────────────────────────────┘   │
│                          │                                       │
│      ┌───────────────────┼───────────────────┐                  │
│      ▼                   ▼                   ▼                  │
│  ┌───────────┐   ┌───────────────┐   ┌───────────────┐         │
│  │ Pricing   │   │  Stock        │   │  Receipt      │         │
│  │ Engine    │   │  Engine       │   │  Engine       │         │
│  │           │   │               │   │               │         │
│  │ physical  │   │ deduct_stock  │   │ format_line   │         │
│  │ weighted  │   │ deduct_recipe │   │ format_weight │         │
│  │ custom    │   │ serial_assign │   │ format_service│         │
│  │ bundle    │   │ batch_consume │    │ format_bundle │         │
│  └───────────┘   └───────────────┘   └───────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 Industry → Product Type Mapping

| Industry | Supported Product Types | Variants | Add-ons | Special Capabilities |
|---|---|---|---|---|
| **Retail** | physical, composite | ✅ Size, Color | ❌ | SKU per variant, barcode scan |
| **F&B** | physical, composite, service | ✅ Size upgrade | ✅ Toppings, Milk, Shots | Recipe/BOM deduction, kitchen workflow |
| **Grocery** | physical, weighted | ❌ | ❌ | Decimal qty, expiry tracking |
| **Pharmacy** | physical, weighted | ✅ Dosage | ❌ | Batch tracking, expiry, compliance |
| **Electronics** | physical | ✅ Storage, Color | ✅ Warranty, Insurance | Serial/IMEI tracking |
| **Manufacturing** | physical, composite | ❌ | ❌ | Production BOM, work orders |
| **Service** | service, custom_price | ❌ | ✅ Priority, Gift wrap | Booking, duration, staff assignment |
| **Hybrid** | all types | ✅ | ✅ | Mix of any above |

---

## 4. Database Schema Changes

### 4.1 Products Table Extension

```sql
-- Add product_type discriminator (backward compatible: default = 'physical')
CREATE TYPE product_type AS ENUM (
  'physical', 'service', 'digital', 'custom_price', 
  'weighted', 'composite', 'hybrid'
);

ALTER TABLE products 
  ADD COLUMN product_type    product_type NOT NULL DEFAULT 'physical',
  ADD COLUMN base_price_unit TEXT,           -- 'per_kg', 'per_gram', 'per_hour', 'per_item'
  ADD COLUMN track_stock     BOOLEAN DEFAULT TRUE; -- FALSE for service/digital

-- Index for POS catalog filtering by type
CREATE INDEX idx_products_type_tenant ON products(tenant_id, product_type) WHERE is_active = TRUE;
```

### 4.2 Product Behaviors Extension Table

```sql
-- Type-specific metadata (validated at application layer, not DB level)
CREATE TABLE product_behaviors (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  product_id   UUID NOT NULL UNIQUE REFERENCES products(id) ON DELETE CASCADE,
  product_type product_type NOT NULL,
  metadata     JSONB NOT NULL DEFAULT '{}',
  -- Metadata schema validated in ProductBehaviorEngine per product_type
  -- physical:     {}
  -- service:      { duration_minutes: int, bookable: bool, requires_staff: bool }
  -- digital:      { delivery_method: 'code'|'link', download_limit: int|null }
  -- custom_price: { min_price: decimal, max_price: decimal|null }
  -- weighted:     { price_per_unit: decimal, weight_unit: 'kg'|'gram'|'liter' }
  -- composite:    { components: [{ product_id, quantity }] }
  -- hybrid:       { sub_types: string[] }
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_product_behaviors_tenant ON product_behaviors(tenant_id);
```

### 4.3 Product Variants Table

```sql
-- Variant tracking (retail SKU variants, electronics serials, pharmacy batches)
CREATE TABLE product_variants (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id      UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  product_id     UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_type   TEXT NOT NULL,  -- 'color_size', 'serial', 'batch', 'imei'
  sku            TEXT,
  attributes     JSONB NOT NULL DEFAULT '{}',
  -- color_size: { color: 'red', size: 'M', stock: 10 }
  -- serial:     { serial_number: 'SN-001', status: 'available'|'sold', sold_at: timestamp }
  -- batch:      { batch_number: 'B-2026-01', expiry_date: date, stock: 100 }
  -- imei:       { imei: '123456789012345', status: 'available'|'sold', warranty_until: date }
  current_stock  NUMERIC(15,3) DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_product_variants_product ON product_variants(product_id);
CREATE INDEX idx_product_variants_tenant ON product_variants(tenant_id);
```

### 4.4 Tenant Industry Profile Table

```sql
CREATE TYPE industry_type AS ENUM (
  'retail', 'fnb', 'grocery', 'pharmacy', 
  'electronics', 'manufacturing', 'service', 'hybrid', 'general'
);

CREATE TABLE tenant_industry_profiles (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id       UUID NOT NULL UNIQUE REFERENCES tenants(id) ON DELETE CASCADE,
  industry_type   industry_type NOT NULL DEFAULT 'general',
  sub_industries  TEXT[] DEFAULT '{}',
  config          JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.5 RLS Policies Required

```sql
-- All new tables follow standard tenant isolation pattern
ALTER TABLE product_behaviors ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_industry_profiles ENABLE ROW LEVEL SECURITY;

-- Standard policy pattern (same as all tenant-scoped tables):
CREATE POLICY "tenant_isolation" ON product_behaviors
  USING (tenant_id = auth.jwt()->>'tenant_id');
```

---

## 5. Backend Module Architecture

### 5.1 New Modules Required

```
backend/src/modules/
├── inventory/                           ← MODIFY (extend existing)
│   ├── domain/
│   │   ├── product-type.enum.ts         ← NEW: ProductType enum
│   │   ├── product-behavior.interface.ts ← NEW: IBehaviorHandler contract
│   │   └── product-behaviors/           ← NEW: per-type handlers
│   │       ├── physical.behavior.ts
│   │       ├── service.behavior.ts
│   │       ├── weighted.behavior.ts
│   │       ├── composite.behavior.ts
│   │       ├── custom-price.behavior.ts
│   │       └── digital.behavior.ts
│   ├── services/
│   │   ├── product-behavior-engine.service.ts ← NEW: routes by type
│   │   ├── pricing-engine.service.ts          ← NEW: computes price by type
│   │   ├── stock-engine.service.ts            ← NEW: deducts correctly by type
│   │   ├── variant.service.ts                 ← NEW: variant group/option CRUD
│   │   └── addon.service.ts                   ← NEW: addon group/item CRUD
│   └── repositories/
│       ├── product-variant.repository.ts      ← NEW (serial/batch/IMEI)
│       ├── variant-group.repository.ts        ← NEW (dimension variants)
│       ├── variant-option.repository.ts       ← NEW
│       ├── addon-group.repository.ts          ← NEW
│       └── addon.repository.ts                ← NEW
│
├── industry/                            ← NEW MODULE
│   ├── industry.module.ts
│   ├── services/
│   │   └── industry-flag.service.ts     ← reads flags from Redis/DB
│   └── repositories/
│       └── tenant-industry.repository.ts
│
└── sales/                               ← MODIFY (integrate engines)
    └── services/
        └── sales.service.ts             ← extend processSale() to use engines
```

### 5.2 ProductBehaviorEngine Interface Contract

```typescript
// Planning-level interface — not production code
interface IBehaviorHandler {
  validateBehaviorMetadata(metadata: unknown): void;
  computePrice(product: Product, posInput: PosLineInput): Decimal;
  computeStockDeduction(product: Product, posInput: PosLineInput): StockDeduction[];
  formatReceiptLine(product: Product, posInput: PosLineInput): ReceiptLine;
  generateJournalLines(product: Product, saleItem: SaleItem): JournalLineDto[];
}
```

### 5.3 Updated `processSale()` Flow

```
SalesService.processSale(dto)
  ├── For each line item in cart:
  │   ├── Fetch product + product_behavior
  │   │
  │   ├── [VARIANT RESOLUTION — Phase 4A]
  │   │   ├── Validate selected_variants against product_variant_groups
  │   │   ├── price_delta = SUM(selected_option.price_delta)
  │   │   └── variant_stock_deductions = StockEngine.resolveVariantStock()
  │   │
  │   ├── [ADDON RESOLUTION — Phase 4B]
  │   │   ├── Validate selected_addons: min/max per group enforced
  │   │   ├── addon_total = SUM(addon.price × addon_qty)
  │   │   └── addon_deductions = StockEngine.resolveAddonStock()
  │   │         (deducts raw_material if addon.raw_material_id set)
  │   │
  │   ├── handler = behaviorEngine.getHandler(product.product_type)
  │   ├── base_price = handler.computePrice(product, posInput)
  │   ├── line_total = base_price + price_delta + addon_total
  │   ├── deductions = handler.computeStockDeduction() + variant_deductions + addon_deductions
  │   ├── receiptLine = handler.formatReceiptLine() with variants + addons
  │   └── journalLines = handler.generateJournalLines()
  │
  ├── PricingEngine.applyPromotions(lines, promos)   ← existing
  ├── StockEngine.applyDeductions(all_deductions)     ← atomic
  ├── AccountingService.createJournalEntry(lines)     ← existing (unchanged)
  └── Return receipt with variants + add-ons displayed
```


---

## 6. Pricing Engine Strategy

```
PricingEngine.computeFinalPrice(product, posInput, promos):
  
  switch product.product_type:
    'physical':     price = product.selling_price × qty
    'weighted':     price = behavior.price_per_unit × posInput.weight
    'custom_price': price = posInput.custom_price (validated min/max)
    'service':      price = product.selling_price (duration shown, not multiplied)
    'digital':      price = product.selling_price
    'composite':    price = SUM(child.computeFinalPrice()) per component
    'hybrid':       price = SUM(each sub-type price)
  
  → Apply promo discounts (existing PromoService)
  → Return: { base_price, discount, final_price, breakdown }
```

---

## 7. Inventory Abstraction Strategy

| Product Type | Stock Model | Deduction Trigger |
|---|---|---|
| `physical` | `products.current_stock` (pcs) | On sale commit |
| `weighted` | `products.current_stock` (kg/gram) | On sale commit, qty = weight |
| `service` | No stock | No deduction |
| `digital` | Optional download count limit | On sale commit |
| `composite` | Children's stock | Recursive deduction per component |
| `custom_price` | `products.current_stock` (if physical) | Conditional |
| `hybrid` | Per sub-type | Per sub-type handler |

**Batch/Serial tracking** (pharmacy/electronics):
- Deduction from `product_variants` table, FIFO for batch, specific record for serial
- `StockEngine.deductVariant(variantId, qty)` — atomic with FOR UPDATE lock

---

## 7A. Product Variant System

Variants model **distinct sellable dimensions** of one base product. A T-Shirt with sizes S/M/L and colors Red/Blue has 6 variant combinations, each with its own potential SKU and stock.

### Variant Data Model

```
product (base)
  └── product_variant_groups[]     ← dimensions: "Size", "Color"
        └── product_variant_options[]  ← choices: "S", "M", "L" / "Red", "Blue"
```

### Database Schema (Planned)

```sql
-- Variant Group: one selectable dimension per product
CREATE TABLE product_variant_groups (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id      UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  product_id     UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,           -- e.g. "Size", "Color", "Dosage"
  is_required    BOOLEAN DEFAULT TRUE,    -- cashier must select one
  allow_multiple BOOLEAN DEFAULT FALSE,   -- can select >1 from this group
  display_order  INTEGER DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_variant_groups_product ON product_variant_groups(product_id);

-- Variant Option: individual choice per group
-- DECISION: current_stock is ALWAYS independent (NOT NULL)
-- Each option tracks its own stock — products.current_stock becomes unused for variant products
CREATE TABLE product_variant_options (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id      UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  group_id       UUID NOT NULL REFERENCES product_variant_groups(id) ON DELETE CASCADE,
  product_id     UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,           -- e.g. "Large", "Red", "50mg"
  price_delta    NUMERIC(15,2) DEFAULT 0, -- +/- from base selling_price
  cost_delta     NUMERIC(15,2) DEFAULT 0,
  sku_suffix     TEXT,                    -- appended to parent SKU: KAOS-001-RED-M
  current_stock  NUMERIC(15,3) NOT NULL DEFAULT 0, -- ALWAYS independent per option
  display_order  INTEGER DEFAULT 0,
  is_active      BOOLEAN DEFAULT TRUE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_variant_options_group ON product_variant_options(group_id);
CREATE INDEX idx_variant_options_product ON product_variant_options(product_id);
```

### Pricing Rule

```
PricingEngine (variant):
  final_price = product.selling_price + SUM(selected_option.price_delta)

Example: Kopi Susu (Rp 20,000) + Large (+Rp 5,000) = Rp 25,000
```

### Stock Rule

```
DECISION: Variant option stock is ALWAYS independent.

StockEngine (variant):
  → ALWAYS deduct from product_variant_options.current_stock
  → products.current_stock is set to NULL/0 and ignored for variant products
  → StockEngine.resolveVariantStock(selected_option_ids, quantities)
  → Each option deducted atomically with FOR UPDATE lock
```

### Receipt Format

```
Kopi Susu [Large, Oat]     Rp 25,000
  └── +Large: +Rp 5,000
  └── +Oat Milk: +Rp 8,000 (add-on, see below)
```

### Constraints
- Max **3 variant groups** per product (enforced in `VariantService.validateGroups()`)
- Max **50 options per group** (enforced in `VariantService.validateOptions()`)
- When a product has variant groups, `products.current_stock` is ignored — stock lives in `product_variant_options.current_stock`
- Variant options stored as JSONB snapshot in `sale_items.selected_variants` at time of sale

---

## 7B. Product Add-on System

Add-ons are **optional or required selectable extras** chosen at POS time. They are not separate cart products — they are sub-selections attached to a parent product line item.

**Use cases:**
- F&B: Extra shot (+Rp5k), Oat Milk (+Rp8k), Extra Topping (+Rp3k)
- Electronics: Extended warranty (+Rp150k), Insurance (+Rp75k)
- Service: Priority handling (+Rp50k), Gift wrap (+Rp15k)

### Add-on Data Model

```
product (base)
  └── product_addon_groups[]    ← DECISION: per-product only, no shared templates
        └── product_addons[]    ← items: "Extra Shot +Rp5k", "Oat Milk +Rp8k"
```

### Database Schema (Planned)

```sql
-- Add-on Group: named bucket of related add-ons (per-product only)
-- DECISION: no shared addon_templates — each product owns its groups
CREATE TABLE product_addon_groups (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,          -- "Extra Toppings", "Warranty Options"
  is_required     BOOLEAN DEFAULT FALSE,
  min_selections  INTEGER DEFAULT 0,
  max_selections  INTEGER DEFAULT 1,      -- 0 = unlimited
  is_promo_eligible BOOLEAN DEFAULT TRUE, -- DECISION: hybrid promo — can this group be targeted by promos?
  display_order   INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_addon_groups_product ON product_addon_groups(product_id);

-- Add-on Item: individual selectable extra
CREATE TABLE product_addons (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  group_id        UUID NOT NULL REFERENCES product_addon_groups(id) ON DELETE CASCADE,
  product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  price           NUMERIC(15,2) NOT NULL DEFAULT 0,
  cost_price      NUMERIC(15,2) DEFAULT 0,
  track_stock     BOOLEAN DEFAULT FALSE,
  current_stock   NUMERIC(15,3),
  raw_material_id UUID REFERENCES raw_materials(id), -- F&B: deducts ingredient stock
  display_order   INTEGER DEFAULT 0,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_addons_group ON product_addons(group_id);
CREATE INDEX idx_addons_product ON product_addons(product_id);

-- Extend sale_items
ALTER TABLE sale_items
  ADD COLUMN selected_variants JSONB DEFAULT '[]',
  -- [{ group_id, group_name, option_id, option_name, price_delta }]
  ADD COLUMN selected_addons   JSONB DEFAULT '[]';
  -- [{ addon_id, group_id, addon_name, qty, unit_price, total, raw_material_id?, promo_discount? }]
```

### Pricing Rule

```
PricingEngine (add-ons):
  addon_total = SUM(selected_addon.price × addon_qty)
  line_total  = variant_price + addon_total

Example:
  Kopi Susu [Large]            Rp 25,000
  + Extra Shot (×1)            Rp  5,000
  + Oat Milk (×1)              Rp  8,000
  ─────────────────────────────────────
  Line Total                   Rp 38,000
```

### Stock Rule

```
StockEngine (add-ons):
  IF addon.raw_material_id IS NOT NULL → deduct raw_material stock (F&B)
  IF addon.track_stock = true → deduct addon.current_stock
  ELSE → no deduction
```

### Add-on vs Variant — Summary

| | Variant | Add-on |
|---|---|---|
| Selection | Required (1 per group) | Optional / min-max |
| Pricing | price_delta from base | Fixed extra price |
| Own SKU | Yes (sku_suffix) | No |
| Own stock | Optional | Optional (track_stock) |
| Ingredient link | No | Yes (raw_material_id) |
| Receipt display | Shown on product line | Shown as sub-lines |

### RLS Policies

```sql
ALTER TABLE product_variant_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variant_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_addon_groups    ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_addons          ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON product_variant_groups
  USING (tenant_id = auth.jwt()->>'tenant_id');
-- same pattern for all 4 tables
```

---

## 8. Workflow Abstraction Strategy

| Workflow | Trigger | Handler |
|---|---|---|
| Standard POS checkout | All types | `SalesService.processSale()` |
| Kitchen ticket generation | F&B, `kitchenFlow` flag | `KitchenTicketService.emit()` (async, BullMQ) |
| Booking creation | Service type, `bookingFlow` flag | `BookingService.create()` |
| Work order generation | Manufacturing, `bomDeduction` flag | `WorkOrderService.create()` |
| Batch FIFO deduction | Pharmacy, `batchTracking` flag | `StockEngine.deductBatch()` |
| Serial assignment | Electronics, `serialTracking` flag | `StockEngine.assignSerial()` |

All workflows are **opt-in via feature flags** (ADR-005). Default behavior is unchanged.

---

## 9. Migration Strategy

### 9.1 Migration Phases

```
Phase 0 (Pre-work): All existing products treated as product_type = 'physical'
  → Zero code change required for existing functionality
  → Run after: ALTER TABLE products ADD COLUMN product_type ... DEFAULT 'physical'
  
Phase 1 (Additive): Add product_type column + product_behaviors table
  → No existing behavior changes
  → Existing API endpoints unchanged
  → New endpoints: POST /products with type; GET /products?type=
  
Phase 2 (New Type Support): Service, Custom Price types go live
  → Existing physical products: unaffected
  → POS UI: conditional fields based on product_type
  
Phase 3 (Weighted): Grocery/pharmacy weighted products
  → New weight input in POS
  → Existing products: unaffected
  
Phase 4 (Variants): Serial/batch tracking
  → New product_variants table populated going forward
  → Existing products: no variants (backward compatible)
```

### 9.2 Backward Compatibility Guarantees

| Contract | Guarantee |
|---|---|
| Existing `POST /api/v1/products` endpoint | No breaking changes — `product_type` defaults to `'physical'` if omitted |
| Existing `GET /api/v1/inventory/products` | Returns all products including `product_type` field (additive, not breaking) |
| Existing `POST /api/v1/sales` | Physical products process identically — behavior engine routes to same logic |
| Flutter `Product` model | `product_type` added as nullable field with default `'physical'` |
| Existing recipes/BOM | Migrated to `composite` type behavior metadata in Phase 3 |
| Journal entries | No change — same COA accounts, same debit/credit pattern |

---

## 10. Scalability Considerations

| Concern | Strategy |
|---|---|
| `product_behaviors` JOIN on every POS query | Cache product + behavior together in Redis (`product:{id}`, TTL: 15min) |
| Composite recursion depth | Max depth = 3 enforced in `CompositeHandler.validateBehavior()` |
| Variant table growth (serial/batch) | Index on `(product_id, variant_type)` + soft-delete sold variants |
| Industry flag lookup per request | Injected into `TenantContext` by `TierGuard` (Redis cached, 30min TTL) |
| Weighted calculation precision | Use `Decimal.js` (existing precision standard, ADR-003 compliant) |
| Variant group/option loading at POS | Cache all groups+options per product in Redis (`product-variants:{product_id}`, TTL: 15min); invalidate on option update |
| Add-on group loading at POS | Cache all addon groups+items per product in Redis (`product-addons:{product_id}`, TTL: 15min); invalidate on addon update |
| `sale_items.selected_variants` / `selected_addons` JSONB growth | JSONB is snapshotted — read-only after commit; index not needed on JSONB for analytics (use materialized view) |
| Max variant groups per product | Enforced at `VariantService.validateGroups()`: max 3 groups, max 50 options per group |
| Max add-on groups per product | Enforced at `AddonService.validateGroups()`: max 10 groups, max 30 items per group |

---

## 11. Technical Debt Analysis

### 11.1 Debt Introduced by This Upgrade

| Item | Debt Created | Mitigation |
|---|---|---|
| JSONB `metadata` in `product_behaviors` | No DB-level schema enforcement | Application-layer validation in `IBehaviorHandler.validateBehaviorMetadata()` |
| Composite recursion | Potential infinite loop if circular reference | Depth limit (3) + cycle detection in `CompositeHandler` |
| JSONB `attributes` in `product_variants` | Schema drift over time | Typed TypeScript interface per variant_type |
| JSONB `selected_variants` / `selected_addons` in `sale_items` | Historical snapshots not queryable via SQL easily | Dedicated analytics materialized view for add-on revenue |
| Add-on `raw_material_id` deduction path | Extra DB read per add-on with ingredient in `processSale()` | Batch-load all add-on raw materials in one query before processing |

### 11.2 Debt Resolved by This Upgrade

| Item | Resolution |
|---|---|
| F&B assumptions in `processSale()` | Extracted to `PhysicalBehaviorHandler` + `CompositeHandler` |
| Single `selling_price` field limitation | `PricingEngine` computes price from behavior + variant delta |
| No product type concept | `product_type` enum is now first-class citizen |
| Services incorrectly deducting stock | `ServiceBehaviorHandler.computeStockDeduction()` returns empty array |
| Variant-as-separate-product catalog bloat | `product_variant_groups` + `product_variant_options` unify under one product record |
| F&B toppings as disconnected cart items | `product_addons` + `selected_addons` snapshot provides full contextual add-on support |
| HPP calculation missing topping ingredient cost | `addon.raw_material_id` deduction included in `StockEngine` → captured in HPP journal |

---

## 12. Implementation Roadmap

| Phase | Duration | Effort | Risk | Deliverable |
|---|---|---|---|---|
| **Phase 0**: Schema migration (additive) | 1 week | Low | 🟢 Low | `product_type` column, `product_behaviors` table, `tenant_industry_profiles` table |
| **Phase 1**: ProductBehaviorEngine core | 2 weeks | Medium | 🟡 Medium | Engine + Physical handler (identical to current behavior) |
| **Phase 2**: Service + Custom Price | 1 week | Low | 🟢 Low | Two new product types live |
| **Phase 3**: Weighted + Grocery | 1 week | Medium | 🟡 Medium | Weight input in POS, weighted pricing |
| **Phase 4A**: Variant System | 2 weeks | Medium | 🟡 Medium | `product_variant_groups` + `product_variant_options`, POS variant selector, variant pricing/stock |
| **Phase 4B**: Add-on System | 2 weeks | Medium | 🟡 Medium | `product_addon_groups` + `product_addons`, POS add-on dialog, `sale_items.selected_addons`, F&B ingredient deduction on add-ons |
| **Phase 4C**: Serial/Batch Tracking | 1 week | Medium | 🟡 Medium | Electronics IMEI, Pharmacy batch/expiry via `product_variants` |
| **Phase 5**: Composite / Bundle | 2 weeks | High | 🟠 High | Bundle products, recursive stock deduction |
| **Phase 6**: Industry profile + flags | 1 week | Low | 🟢 Low | Onboarding industry selection, flag injection |
| **Phase 7**: Kitchen/Booking workflows | 3 weeks | High | 🟡 Medium | F&B kitchen ticket, Service booking |

**Total Estimated Effort:** 15 weeks (3.75 months)  
**Parallel with existing development:** Phases 0–2 are low-risk and can run in parallel.  
**Feature flag gate:** Each phase deployed behind `PRODUCT_ENGINE_V2=true` env flag until stable.

---

## 13. Open Questions / Decisions Needed

| Question | Decision |
|---|---|
| Should composite products deduct from product stock or raw_material stock? | ⬜ **Open** — Recommend: configurable per component |
| Should service booking be in-app or external calendar integration? | ⬜ **Open** — Recommend: in-app MVP, Google Calendar in Year 3 |
| How should weighted products handle scale hardware integration? | ⬜ **Open** — Recommend: manual input MVP, Bluetooth SDK for Grocery tier |
| Should variant tracking be mandatory for electronics or opt-in per product? | ⬜ **Open** — Recommend: optional per product |
| Where does manufacturing work order fit? | ⬜ **Open** — Recommend: separate Phase 8 |
| Should variant options support independent stock or always share parent? | ✅ **RESOLVED: Independent** — `product_variant_options.current_stock NOT NULL DEFAULT 0`; `products.current_stock` ignored for variant products |
| Should add-on groups be reusable templates across products? | ✅ **RESOLVED: Per-product only** — no `addon_templates` table; each product owns its add-on groups |
| Should promo engine be able to discount add-ons independently? | ✅ **RESOLVED: Hybrid** — PromoService can discount full line total OR target specific add-on groups via `is_promo_eligible` flag; line-level and add-on-level promos cannot stack (higher discount wins) |
