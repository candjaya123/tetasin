# ADR-006: Product Variants & Add-ons Architecture

**Status:** Proposed  
**Date:** 2026-05-12  
**Authors:** Platform Engineering Team  
**Reviewers:** CTO, Product Lead, Backend Lead  
**Extends:** ADR-004 (Universal Product Engine)

---

## Context

The Universal Product Engine (ADR-004) introduced `product_type` and `product_behaviors` for modeling different product categories. However, two critical POS-time capabilities were left underspecified:

### The Variant Problem
A **variant** is a product dimension that creates distinct sellable SKUs from one base product:
- Clothing store: `T-Shirt` → `[Red+S]`, `[Red+M]`, `[Blue+L]` — each with its own stock
- Coffee shop: `Kopi Susu` → `[Small]`, `[Medium]`, `[Large]` — each with a different price
- Pharmacy: tablets in `30mg` vs `50mg` — different SKU, different price

The current `products` table has no variant concept. Each size/color/dosage becomes a separate product record — creating catalog bloat and making variant-level reporting impossible.

### The Add-on Problem
An **add-on** is an optional (or required) selectable extra that is chosen at POS time and adds to the line item total:
- F&B: Extra espresso shot (+Rp5k), Oat Milk (+Rp8k), Extra Topping (+Rp3k)
- Electronics: Extended warranty (+Rp150k), Device insurance (+Rp75k)
- Service: Priority handling (+Rp50k), Gift wrapping (+Rp15k)

Add-ons are **not separate products** — they live under a parent product, appear as a selection dialog in POS, and are line-level price modifiers, not standalone cart items.

### Distinction Between Variants and Add-ons

| Dimension | Variant | Add-on |
|---|---|---|
| **Selection mode** | Choose one per dimension (required) | Choose zero to many (optional or required) |
| **Own SKU** | Yes — each combination is a separate sellable unit | No — attached to parent product |
| **Own stock** | Optional (can track per variant or share parent stock) | Optional (most add-ons don't track stock) |
| **Price impact** | Price delta from base, or full override | Fixed additional price per add-on |
| **Appears on receipt** | Shown as variant name on the product line | Shown as sub-lines under the product |
| **Use case** | Retail size/color, Coffee size, Pharmacy dosage | F&B toppings, Electronics warranty, Service extras |

---

## Decision

We introduce two new sub-systems under the Universal Product Engine:

### Sub-system 1: Product Variant System

A **two-level hierarchy** per product:
1. **`product_variant_groups`** — defines a selectable dimension (e.g., "Size", "Color")
2. **`product_variant_options`** — defines the choices per group (e.g., "S", "M", "L")

Each option carries:
- A `price_delta` (±Rp) relative to the base product `selling_price`
- An optional independent `current_stock` (if tracking per variant)
- A `sku_suffix` (appended to parent SKU to form the variant SKU, e.g., `KAOS-001-RED-M`)

At POS, the cashier selects one option per required group. The `PricingEngine` sums all `price_delta` values to derive the final variant price.

### Sub-system 2: Product Add-on System

A **two-level hierarchy** per product:
1. **`product_addon_groups`** — a named bucket of related add-ons (e.g., "Extra Toppings", "Warranty Options")
2. **`product_addons`** — the individual selectable items per group

Each group has `min_selections` / `max_selections` to enforce required vs. optional selection. Each add-on has its own `price`, optional `cost_price`, and optional `raw_material_id` (for F&B ingredient deduction on add-ons).

At POS, the add-on selection dialog appears for products that have add-on groups defined. Selected add-ons are stored as a JSONB snapshot in `sale_items.selected_addons` — preserving the price at time of sale.

---

## Alternatives Considered

### Option A: Add-ons as Separate Products Added to Cart (Rejected)

Treat each add-on (e.g., "Extra Shot") as a standalone product that the cashier manually adds to the cart.

**Cons:**
- Breaks the relationship between add-on and parent product
- Cannot enforce "this add-on is only valid for this product"
- Cannot show add-on selection dialog contextually
- Cannot apply add-on-level promo logic
- Catalog becomes polluted with micro-products

**Verdict:** Rejected.

### Option B: Variants as Separate Product Records with `parent_id` FK (Rejected)

Each variant (Red+M) is its own `products` row with `parent_id` pointing to the base product.

**Pros:**
- Simple schema — no new tables

**Cons:**
- Cannot reconstruct the group structure (what dimensions exist, what options)
- Cannot query "show all variants of T-Shirt" efficiently
- Makes the product catalog API complex (always need to aggregate)
- Breaks POS search (separate records for each variant dilute catalog)

**Verdict:** Rejected.

### Option C: Variant Groups + Options + Add-on Groups + Add-ons (Chosen)

Four new tables forming two independent sub-systems. Both attach to `products` as the anchor.

**Pros:**
- Clean group→option hierarchy matches real-world mental model
- POS can render variant selector and add-on checklist naturally
- Variant pricing through `price_delta` avoids full price override complexity
- Add-ons stored as JSONB snapshot in `sale_items` — preserves historical pricing
- Both systems are opt-in per product — existing products unaffected

**Verdict:** Chosen.

---

## Tradeoffs

| Concern | Decision |
|---|---|
| **Variant combination explosion** | Max 3 variant groups per product enforced in `VariantService.validateGroups()` |
| **Add-on stock deduction** | Only add-ons with `track_stock = true` trigger `StockEngine.deductAddon()` |
| **Price history on add-ons** | `selected_addons` in `sale_items` stores price at time of sale — immune to future price changes |
| **F&B ingredient deduction on add-ons** | `product_addons.raw_material_id` links to `raw_materials` — deducted in `SalesService` alongside parent product recipe |
| **Variant stock vs parent stock** | If `product_variant_options.current_stock IS NULL` → shares `products.current_stock`; else deducts from variant stock |
| **Backward compatibility** | Products without variant groups or add-on groups behave exactly as today |

---

## Implementation Scope (Planning Only)

### Phase 4A — Variant System
- Add `product_variant_groups` and `product_variant_options` tables
- `VariantService` CRUD + validation
- POS UI: variant selection dialog before adding to cart
- `PricingEngine` extension: sum `price_delta` values
- `StockEngine` extension: deduct from variant stock if tracked
- Receipt: show variant name on product line (e.g., "Kopi Susu [Large]")

### Phase 4B — Add-on System
- Add `product_addon_groups` and `product_addons` tables
- `AddonService` CRUD + validation
- POS UI: add-on checklist dialog after variant selection
- Extend `sale_items` with `selected_addons` JSONB column
- `PricingEngine` extension: sum add-on prices into line total
- `StockEngine` extension: deduct `raw_material_id` if defined
- Receipt: show add-ons as sub-lines under product

---

## Long-Term Implications

- Variant Groups/Options are the foundation for a **product catalog configurator** in Year 2 (tenant can define their own attribute types)
- Add-on groups are the foundation for **modifier templates** — reusable add-on sets that can be attached to multiple products (e.g., a "Size Upgrade" group shared across all beverages)
- The F&B `raw_material_id` on add-ons enables full ingredient costing including toppings — critical for accurate HPP calculation
- Add-on pricing data in `sale_items.selected_addons` is the input for **add-on revenue analytics** (which toppings are most popular)

---

## Review Date

Re-evaluate this ADR when:
- A product requires more than 3 variant dimensions (consider a full attribute matrix)
- Add-on templates (shared across products) become a user request
- Variant combinations exceed 50 per product (consider pagination/search in POS variant selector)
