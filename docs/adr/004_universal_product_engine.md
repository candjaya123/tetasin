# ADR-004: Universal Product Engine — Multi-Industry Product Type Architecture

**Status:** Proposed  
**Date:** 2026-05-12  
**Authors:** Platform Engineering Team  
**Reviewers:** CTO, Product Lead, Backend Lead  
**Supersedes:** N/A (extends existing `products` table design in `database_schema.md`)

---

## Context

Tumbuhin is a multi-tenant SaaS ERP targeting Indonesian SMEs across a wide variety of business types. The current product model (`products` table) assumes a single, uniform product behavior:

- One fixed selling price
- Physical stock deduction per unit sold
- Optional BOM/recipe for F&B-style deduction from raw materials
- Integer/decimal quantity with a single `unit` field

This works for simple retail and F&B scenarios. However, as Tumbuhin expands to serve **Retail, F&B, Grocery, Pharmacy, Electronics, Manufacturing, and Service** businesses, the current model creates hard limits:

| Current Limitation | Blocked Scenario |
|---|---|
| Single `selling_price` field | Cannot support weighted pricing (price/kg), custom-negotiated pricing, or tiered pricing |
| No product type discriminator | Cannot distinguish physical vs. service vs. digital — all trigger stock deduction |
| No variant/attribute system | Cannot support color/size variants for retail, IMEI for electronics |
| No serial/batch tracking | Cannot support pharmacy batch/expiry, electronics IMEI/warranty |
| No service duration/booking | Cannot support appointment-based service businesses |
| No composite product logic | Cannot support bundle products or production BOMs at the product level |
| `current_stock` on product | Misleading for weighted products (stock in kg, sold by 0.xxx kg per transaction) |

---

## Decision

We will introduce a **Universal Product Engine** — a backward-compatible extension to the product model that introduces:

1. **`product_type` discriminator field** on the `products` table
2. **`product_behaviors` JSONB extension table** for type-specific metadata (schema-validated per type)
3. **`product_variants` table** for serial/batch/IMEI tracking (pharmacy, electronics)
4. **`product_variant_groups` + `product_variant_options` tables** for selectable dimension variants (size, color, dosage) — see ADR-006
5. **`product_addon_groups` + `product_addons` tables** for POS-time selectable extras (toppings, warranty, extras) — see ADR-006
6. **A `ProductBehaviorEngine` service** on the backend that routes behavior (pricing, stock, receipt display) based on `product_type`
7. **A `VariantService` and `AddonService`** for CRUD and POS-time resolution of variants and add-ons
8. **Industry-level configuration** via `tenant_industry_profile` (soft config, not code forks)

This decision preserves **full backward compatibility** — all existing products are implicitly of type `physical` and continue to work without any migration of business logic.

---

## Product Type Taxonomy

```
ProductType (enum)
├── physical          ← Current behavior (default, no change)
├── service           ← No stock deduction, duration-based, bookable
├── digital           ← No stock deduction, delivery via code/link
├── custom_price      ← Price entered at POS time (e.g., service fee)
├── weighted          ← Price = unit_price × weight (kg/gram)
├── composite         ← Bundle: deducts child products on sale
└── hybrid            ← Physical + service (e.g., device + installation)
```

---

## Alternatives Considered

### Option A: Separate Tables Per Product Type (Rejected)

Create `physical_products`, `service_products`, `digital_products`, etc.

**Pros:**
- Perfect schema isolation per type
- No JSONB — fully typed columns

**Cons:**
- POS query must JOIN across 7+ tables — catastrophic for performance
- UI/API complexity: different endpoints per type
- Cannot show unified product catalog
- Impossible to build a universal POS that handles all types in one cart

**Verdict:** Rejected. A unified POS requires a unified product table.

### Option B: Fat JSONB Column on Existing `products` (Rejected)

Add a single `metadata JSONB` column to the existing `products` table.

**Pros:**
- Minimal schema change

**Cons:**
- No schema enforcement — data corruption risk
- Cannot index JSONB keys efficiently
- Violates the data integrity principle established in ADR-003

**Verdict:** Rejected. JSONB without schema validation contradicts our deterministic core principle.

### Option C: `product_type` + `product_behaviors` Extension Table (Chosen)

Add `product_type` discriminator to `products`. Add a separate `product_behaviors` table with JSONB that is **schema-validated in the application layer** per product type before insert.

**Pros:**
- Single `products` table — unified POS catalog query
- JSONB validated at service layer before insert (deterministic)
- No breaking change to existing `products` records
- ProductBehaviorEngine routes all type-specific logic centrally
- Extensible: new product types add new behavior schemas without DB migrations

**Cons:**
- JSONB still requires application-layer schema enforcement (not DB-level)
- New developers must understand the ProductBehaviorEngine routing pattern

**Verdict:** Chosen. Best balance of flexibility, integrity, and backward compatibility.

---

## Tradeoffs

| Concern | Decision |
|---|---|
| **Backward compatibility** | All existing `products` treated as `type = 'physical'` — zero migration needed |
| **JSONB data integrity** | Schema validated in `ProductBehaviorEngine.validateBehavior()` before every write |
| **POS performance** | Single catalog query on `products` — behavior fetched lazily when needed |
| **Industry specificity** | Industry config stored in `tenant_industry_profile`, not in product type logic |
| **Stock model** | `current_stock` remains on `products` for physical/weighted — services/digital have `null` stock |
| **Pricing engine** | PricingEngine reads `product_type` and behavior metadata to compute final line price |

---

## Implementation Scope (Planning Only)

### Phase 1 — Core Type Discriminator (Low Risk)
- Add `product_type` enum column to `products` (default `'physical'`)
- Add `product_behaviors` extension table
- Update `ProductBehaviorEngine` to route based on type
- Update `SalesService.processSale()` to call behavior engine per line item
- Backward compatible: physical products unaffected

### Phase 2 — Service & Custom Price Types
- Implement `service` type: no stock deduction, duration metadata
- Implement `custom_price` type: price entered at POS time
- Update POS UI (web + flutter) to show price input for custom_price items

### Phase 3 — Weighted Products
- Implement `weighted` type: quantity in decimal kg/gram, price = unit_price × weight
- Update POS UI to show weight input field for weighted items
- Update receipt to show "X.XX kg × Rp/kg = Rp total"

### Phase 4A — Dimension Variants (Retail / F&B / Pharmacy)
- Add `product_variant_groups` + `product_variant_options` tables (ADR-006)
- `VariantService`: CRUD, max-3-groups validation, option stock management
- POS UI: variant selector dialog before adding to cart
- `PricingEngine`: `final_price = base_price + SUM(option.price_delta)`
- `StockEngine`: deduct from option stock if tracked, else parent stock
- `sale_items.selected_variants` JSONB snapshot

### Phase 4B — Add-ons (F&B / Electronics / Service)
- Add `product_addon_groups` + `product_addons` tables (ADR-006)
- `AddonService`: CRUD, min/max selection enforcement
- POS UI: add-on checklist dialog (after variant selection)
- `PricingEngine`: add-on prices summed into line total
- `StockEngine`: deduct `raw_material_id` stock if set (F&B ingredient)
- `sale_items.selected_addons` JSONB snapshot

### Phase 4C — Serial / Batch Tracking
- `product_variants` table for serial/IMEI/batch records
- Implement serial tracking (electronics IMEI)
- Implement batch/expiry FIFO deduction (pharmacy)

### Phase 5 — Composite / Bundle
- Implement `composite` type: deducts child products from stock
- Update `SalesService` to recursively process composite items

---

## Long-Term Implications

- The `ProductBehaviorEngine` becomes the single source of truth for product behavior routing. All future product types (subscriptions, leases, consignments) must register behavior here.
- **Variant groups/options** are the foundation for a catalog configurator in Year 2 — tenants define their own dimension types.
- **Add-on groups** are the foundation for **modifier templates**: reusable add-on sets shared across multiple products (e.g., "Milk Type" group shared across all beverages).
- `raw_material_id` on `product_addons` enables full HPP costing including toppings — critical for accurate F&B margin reporting.
- Add-on revenue data in `sale_items.selected_addons` powers **add-on analytics** (top toppings, warranty attach rate).
- Industry-specific POS UI behaviors are added as **POS plugins** that activate based on `tenant_industry_profile.industry_type`.
- The `composite` product type is the foundation for the Manufacturing work order system in Year 3.

---

## Review Date

Re-evaluate this ADR when:
- More than 5 distinct product types are in production use
- A product type requires its own isolated transaction flow (candidate for microservice extraction)
- Pharmacy compliance requires DB-level batch tracking enforcement
- Add-on modifier templates become a common user request (candidate for dedicated `addon_templates` table)
