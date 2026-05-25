# Tetasin — Database Schema

> **Document Purpose:** Defines the ideal database structure — entities, relationships, normalization strategy, indexing, naming conventions, and scalability considerations.
> **Who Should Read This:** Backend engineers, DBAs, architects.
> **Why It Matters:** Database quality directly affects performance, scalability, data integrity, and audit trails. Poor schemas are the hardest technical debt to repay.

---

## 1. Current Problems

| Problem | Severity | Status | Description |
|---|---|---|---|
| Subscription tier enum mismatch | 🔴 High | ✅ Fixed | Canonical values: `'free','premium','pro','franchise'` — never use old names |
| `transactions` missing `pesanan_id` FK | 🔴 High | ✅ Fixed | `pesanan_id UUID REFERENCES sales_orders(id) ON DELETE SET NULL` added |
| `transactions` missing `source_type` | 🔴 High | ✅ Fixed | `source_type transaction_source NOT NULL DEFAULT 'pos_sale'` added |
| `chart_of_accounts` missing `normal_balance` + `kategori` | 🔴 High | ✅ Fixed | Both columns added with CHECK constraints and 6 canonical values |
| `sales_orders` missing `pesanan_status` enum + division fields | 🔴 High | ✅ Fixed | 9-state `pesanan_status` enum, `division_notes`, `pesanan_number`, `source`, `transaction_id`, `fulfilled_at` added |
| `journal_lines` column model vs docs | 🔴 High | ✅ Aligned | SQL uses `debit/credit` split columns (not `type/amount`). Docs updated to match. |
| No composite index on `(tenant_id, created_at)` on high-traffic tables | 🟡 Medium | 🔄 Pending | Added on `transactions` and `journal_entries`; more tables need it |
| Soft delete not standardized | 🟡 Medium | 🔄 Pending | Still uses `status` on some tables; `deleted_at` not yet added |
| `business_memory` is a general JSONB blob | 🟡 Medium | 🔄 Pending | No schema enforcement — risks data corruption over time |
| Missing foreign key on `journal_lines.journal_entry_id` | 🟡 Medium | ✅ Fixed | `NOT NULL` + `ON DELETE CASCADE` enforced |
| No audit column standardization (`created_by`, `updated_by`) | 🟠 Low | 🔄 Partial | `created_by` added to `journal_entries`, `purchase_orders`, `sales_orders`; `updated_by` still missing |

---

## 2. Ideal Structure

### 2.1 Core Tenancy Tables

```sql
-- ENUM: Subscription Tier (CANONICAL — must match code)
-- Personal accounts: 'free' and 'premium' only
-- Business accounts: 'free', 'pro', and 'franchise'
-- ❌ NEVER assign 'premium' to business, or 'pro'/'franchise' to personal
CREATE TYPE subscription_tier AS ENUM ('free', 'premium', 'pro', 'franchise');
CREATE TYPE user_role AS ENUM ('manager', 'kasir', 'stok');
CREATE TYPE payment_method AS ENUM ('cash', 'qris', 'transfer', 'card');
CREATE TYPE order_status AS ENUM ('draft', 'pending', 'approved', 'fulfilled', 'cancelled');
CREATE TYPE journal_status AS ENUM ('draft', 'posted', 'voided');

-- Tenants: One per business
CREATE TABLE tenants (
    id                   UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name                 TEXT NOT NULL,
    account_type         TEXT NOT NULL DEFAULT 'business', -- 'business' | 'personal'
    tier                 subscription_tier NOT NULL DEFAULT 'free', -- 'franchise' only allowed when account_type='business'
    subscription_status  TEXT NOT NULL DEFAULT 'active',
    subscription_end_date TIMESTAMPTZ,
    address              TEXT,
    npwp                 TEXT,
    contact_phone        TEXT,
    contact_email        TEXT,
    website              TEXT,
    created_at           TIMESTAMPTZ DEFAULT NOW(),
    updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles: Users linked to Supabase Auth
CREATE TABLE profiles (
    id          UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    full_name   TEXT NOT NULL,
    role        user_role NOT NULL DEFAULT 'kasir',
    avatar_url  TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_profiles_tenant_id ON profiles(tenant_id);
```

### 2.2 Chart of Accounts (COA)

```sql
-- Accounts: Standard double-entry COA
-- See docs/accounting.md §1 for full seed data (31 system accounts from akun.csv)
CREATE TABLE chart_of_accounts (
    id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id      UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    code           TEXT NOT NULL,           -- e.g. '1-10000'
    name           TEXT NOT NULL,           -- e.g. 'Kas Tangan'
    type           TEXT NOT NULL,           -- 'aset' | 'kewajiban' | 'ekuitas' | 'pendapatan' | 'beban'
    kategori       TEXT NOT NULL,           -- CANONICAL 6 values: 'ASET'|'KEWAJIBAN'|'EKUITAS'|'PENDAPATAN'|'HPP / BIAYA LANGSUNG'|'BEBAN OPERASIONAL'
    normal_balance TEXT NOT NULL DEFAULT 'debit', -- 'debit' | 'credit' — used for report sign logic
    is_system      BOOLEAN DEFAULT FALSE,   -- System accounts (seeded from akun.csv) cannot be deleted
    parent_code    TEXT,                    -- For hierarchical COA
    created_at     TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, code),
    CHECK (kategori IN ('ASET','KEWAJIBAN','EKUITAS','PENDAPATAN','HPP / BIAYA LANGSUNG','BEBAN OPERASIONAL')),
    CHECK (normal_balance IN ('debit','credit'))
);
CREATE INDEX idx_coa_tenant_id ON chart_of_accounts(tenant_id);
CREATE INDEX idx_coa_tenant_code ON chart_of_accounts(tenant_id, code);
CREATE INDEX idx_coa_tenant_kategori ON chart_of_accounts(tenant_id, kategori);
```

### 2.3 Products & Inventory

> **Status Note:** The base `products` table represents current production schema. The **Universal Product Engine** extension tables (`product_behaviors`, `product_variants`, `tenant_industry_profiles`) are **planned** — see `docs/product_engine_upgrade.md` and `docs/adr/004_universal_product_engine.md` for the full migration plan.

```sql
-- Products: Items sold to customers
-- CURRENT PRODUCTION SCHEMA
CREATE TABLE products (
    id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id      UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    warehouse_id   UUID REFERENCES warehouses(id),
    name           TEXT NOT NULL,
    sku            TEXT,
    barcode        TEXT,
    selling_price  NUMERIC(15,2) NOT NULL DEFAULT 0,
    cost_price     NUMERIC(15,2) NOT NULL DEFAULT 0, -- Used as HPP fallback when no recipe exists (Direct Mode)
    current_stock  NUMERIC(15,3) NOT NULL DEFAULT 0,
    reorder_point  NUMERIC(15,3) DEFAULT 0,
    unit           TEXT DEFAULT 'pcs',
    category       TEXT,
    hpp_coa_id     UUID REFERENCES chart_of_accounts(id), -- Persediaan account for Direct HPP mode (default: 1-10503)
    is_active      BOOLEAN DEFAULT TRUE,
    created_at     TIMESTAMPTZ DEFAULT NOW(),
    updated_at     TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, sku),
    UNIQUE(tenant_id, barcode)
);
CREATE INDEX idx_products_tenant_id ON products(tenant_id);
CREATE INDEX idx_products_barcode ON products(barcode);

-- PLANNED: Universal Product Engine Extension (Phase 0 of upgrade)
-- Add product_type discriminator — backward compatible (default = 'physical')
CREATE TYPE product_type AS ENUM (
  'physical', 'service', 'digital', 'custom_price', 
  'weighted', 'composite', 'hybrid'
);
ALTER TABLE products 
  ADD COLUMN product_type    product_type NOT NULL DEFAULT 'physical',
  ADD COLUMN base_price_unit TEXT,           -- 'per_kg', 'per_gram', 'per_hour', 'per_item'
  ADD COLUMN track_stock     BOOLEAN DEFAULT TRUE;
CREATE INDEX idx_products_type_tenant ON products(tenant_id, product_type) WHERE is_active = TRUE;

-- PLANNED: Product Behaviors Extension Table
-- Type-specific metadata, schema-validated at application layer
CREATE TABLE product_behaviors (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  product_id   UUID NOT NULL UNIQUE REFERENCES products(id) ON DELETE CASCADE,
  product_type product_type NOT NULL,
  metadata     JSONB NOT NULL DEFAULT '{}',
  -- Schema per type (validated in ProductBehaviorEngine):
  -- physical:     {}
  -- service:      { duration_minutes: int, bookable: bool, requires_staff: bool }
  -- digital:      { delivery_method: 'code'|'link', download_limit: int|null }
  -- custom_price: { min_price: decimal, max_price: decimal|null }
  -- weighted:     { price_per_unit: decimal, weight_unit: 'kg'|'gram'|'liter' }
  -- composite:    { components: [{ product_id, quantity }] }
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_product_behaviors_tenant ON product_behaviors(tenant_id);

-- PLANNED: Product Variants Table (for serial/batch/IMEI tracking)
CREATE TABLE product_variants (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id      UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  product_id     UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_type   TEXT NOT NULL,  -- 'serial'|'batch'|'imei'
  sku            TEXT,
  attributes     JSONB NOT NULL DEFAULT '{}',
  -- serial:     { serial_number: 'SN-001', status: 'available'|'sold', sold_at: timestamp }
  -- batch:      { batch_number: 'B-2026-01', expiry_date: date, stock: 100 }
  -- imei:       { imei: '123456789012345', status: 'available'|'sold', warranty_until: date }
  current_stock  NUMERIC(15,3) DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_product_variants_product ON product_variants(product_id);
CREATE INDEX idx_product_variants_tenant ON product_variants(tenant_id);

-- PLANNED: Product Variant Groups (retail/FnB dimension variants — Size, Color, etc.)
-- See ADR-006
CREATE TABLE product_variant_groups (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id      UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  product_id     UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,           -- "Size", "Color", "Dosage"
  is_required    BOOLEAN DEFAULT TRUE,
  allow_multiple BOOLEAN DEFAULT FALSE,
  display_order  INTEGER DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_variant_groups_product ON product_variant_groups(product_id);

-- PLANNED: Product Variant Options (the selectable choices per group)
-- DECISION (2026-05-12): current_stock is ALWAYS independent per option (NOT NULL)
CREATE TABLE product_variant_options (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id      UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  group_id       UUID NOT NULL REFERENCES product_variant_groups(id) ON DELETE CASCADE,
  product_id     UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,           -- "S", "M", "L", "Red", "50mg"
  price_delta    NUMERIC(15,2) DEFAULT 0, -- +/- from base selling_price
  cost_delta     NUMERIC(15,2) DEFAULT 0,
  sku_suffix     TEXT,                    -- e.g. "RED-M"
  current_stock  NUMERIC(15,3) NOT NULL DEFAULT 0, -- ALWAYS independent; products.current_stock ignored
  display_order  INTEGER DEFAULT 0,
  is_active      BOOLEAN DEFAULT TRUE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_variant_options_group ON product_variant_options(group_id);
CREATE INDEX idx_variant_options_product ON product_variant_options(product_id);

-- PLANNED: Product Add-on Groups (named buckets of selectable extras)
-- DECISION (2026-05-12): per-product only — no shared addon_templates table
-- DECISION (2026-05-12): is_promo_eligible flag enables hybrid promo targeting
-- See ADR-006
CREATE TABLE product_addon_groups (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  product_id        UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,          -- "Extra Toppings", "Warranty Options"
  is_required       BOOLEAN DEFAULT FALSE,
  min_selections    INTEGER DEFAULT 0,
  max_selections    INTEGER DEFAULT 1,      -- 0 = unlimited
  is_promo_eligible BOOLEAN DEFAULT TRUE,   -- if false, promo engine skips this group
  display_order     INTEGER DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_addon_groups_product ON product_addon_groups(product_id);

-- PLANNED: Product Add-ons (individual selectable extras per group)
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

-- PLANNED: Extend sale_items to snapshot variant+addon selections at time of sale
-- DECISION: selected_addons includes promo_discount field for hybrid promo support
ALTER TABLE sale_items
  ADD COLUMN selected_variants JSONB DEFAULT '[]',
  -- [{ group_id, group_name, option_id, option_name, price_delta }]
  ADD COLUMN selected_addons   JSONB DEFAULT '[]';
  -- [{ addon_id, group_id, addon_name, qty, unit_price, total, raw_material_id?, promo_discount? }]


-- PLANNED: Tenant Industry Profile
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

-- Raw Materials (Bahan Baku): Ingredients / base components
-- Managed in Stok tab → Bahan Baku sub-tab
-- Each bahan baku has an exact price per unit and a unit (ml, gram, pcs, etc.)
CREATE TABLE raw_materials (
    id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    warehouse_id        UUID REFERENCES warehouses(id),
    name                TEXT NOT NULL,
    unit                TEXT NOT NULL,              -- 'ml', 'gram', 'liter', 'kg', 'pcs', 'lembar'
    unit_price          NUMERIC(15,4) NOT NULL DEFAULT 0, -- price per 1 unit (e.g. Rp 15.00 per ml)
    current_stock       NUMERIC(15,3) NOT NULL DEFAULT 0, -- in same unit as above
    reorder_point       NUMERIC(15,3) DEFAULT 0,
    last_purchase_price NUMERIC(15,4) DEFAULT 0,    -- updated on each stock restock (PO fulfillment)
    coa_account_id      UUID REFERENCES chart_of_accounts(id), -- Persediaan COA (default: 1-10500 Persediaan Bahan Baku)
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_raw_materials_tenant ON raw_materials(tenant_id);
CREATE INDEX idx_raw_materials_warehouse ON raw_materials(warehouse_id);

-- Product Recipes (BOM — Bill of Materials): Ingredients per product unit sold
-- quantity_needed = amount of raw_material consumed per 1 unit of the product sold
-- HPP per product unit = Σ (recipe.quantity_needed × bahan_baku.unit_price)
-- NOTE: In the Universal Product Engine, recipes migrate to product_behaviors
-- metadata for product_type='composite'. This table remains for backward compatibility.
CREATE TABLE product_recipes (
    id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    product_id        UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    raw_material_id   UUID NOT NULL REFERENCES raw_materials(id) ON DELETE RESTRICT,
    quantity_needed   NUMERIC(15,4) NOT NULL,  -- qty per 1 unit sold (e.g. 200 for 200ml susu per cup)
    UNIQUE(product_id, raw_material_id)
);
CREATE INDEX idx_product_recipes_product ON product_recipes(product_id);
CREATE INDEX idx_product_recipes_material ON product_recipes(raw_material_id);

-- Warehouses
CREATE TABLE warehouses (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    address     TEXT,
    is_default  BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### 2.4 Transactions & Sales

```sql
-- source_type: identifies the origin of every financial event in the Transaksi log
CREATE TYPE transaction_source AS ENUM (
  'pos_sale',        -- POS checkout
  'pos_void',        -- POS transaction voided
  'expense',         -- Manual expense entry
  'receipt_ocr',     -- Receipt OCR draft approved
  'po_fulfillment',  -- Purchase Order fulfilled
  'stock_adjustment',-- Stock opname / manual adjustment
  'manual'           -- Manual journal entry (no separate transaction row)
);

-- Transactions: Universal financial event header
-- EVERY financial event that moves money creates one row here
-- See docs/accounting.md §4 for Transaksi display logic
CREATE TABLE transactions (
    id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id        UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    cashier_id       UUID REFERENCES profiles(id),
    pesanan_id       UUID REFERENCES sales_orders(id),  -- Always set for POS sales (atomic)
    journal_id       UUID REFERENCES journal_entries(id), -- Always set after journal creation
    source_type      transaction_source NOT NULL DEFAULT 'pos_sale',
    status           TEXT NOT NULL DEFAULT 'committed',  -- 'validating' | 'committed' | 'voided'
    payment_method   payment_method NOT NULL DEFAULT 'cash',
    subtotal         NUMERIC(15,2) NOT NULL DEFAULT 0,
    discount_amount  NUMERIC(15,2) NOT NULL DEFAULT 0,
    total_amount     NUMERIC(15,2) NOT NULL DEFAULT 0,
    notes            TEXT,
    idempotency_key  TEXT UNIQUE,
    transaction_date TIMESTAMPTZ DEFAULT NOW(),
    created_at       TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_transactions_tenant_id_date ON transactions(tenant_id, transaction_date DESC);
CREATE INDEX idx_transactions_source_type ON transactions(tenant_id, source_type);
CREATE INDEX idx_transactions_pesanan_id ON transactions(pesanan_id);

-- Sale Items: Line items per transaction
-- hpp_per_unit and hpp_mode are SNAPSHOTTED at sale time (not recalculated later)
CREATE TABLE sale_items (
    id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id      UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    product_id     UUID NOT NULL REFERENCES products(id),
    quantity       NUMERIC(15,3) NOT NULL,
    unit_price     NUMERIC(15,2) NOT NULL,
    discount       NUMERIC(15,2) DEFAULT 0,
    hpp_mode       TEXT NOT NULL DEFAULT 'none', -- 'recipe' | 'direct' | 'none' (snapshot)
    hpp_per_unit   NUMERIC(15,4) NOT NULL DEFAULT 0, -- HPP per 1 unit at sale time (snapshot)
    hpp_amount     NUMERIC(15,2) DEFAULT 0,      -- hpp_per_unit × quantity
    total          NUMERIC(15,2) NOT NULL
);
CREATE INDEX idx_sale_items_transaction_id ON sale_items(transaction_id);
```

### 2.5 Accounting — Journal Entries (Proper Multi-Line)

```sql
-- Journal Entries: Header of each accounting entry
CREATE TABLE journal_entries (
    id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id        UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    reference_id     UUID,                           -- FK to transaction, PO, etc.
    reference_type   TEXT,                           -- 'sale' | 'purchase' | 'adjustment' | 'manual'
    status           journal_status DEFAULT 'posted',
    description      TEXT NOT NULL,
    transaction_date TIMESTAMPTZ DEFAULT NOW(),
    created_by       UUID REFERENCES profiles(id),
    idempotency_key  TEXT UNIQUE,
    total_amount     NUMERIC(15,2) DEFAULT 0,
    created_at       TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_journal_entries_tenant_date ON journal_entries(tenant_id, transaction_date DESC);

-- Journal Lines: Individual debit/credit lines (PROPER double-entry)
-- NOTE: Uses split debit/credit columns for backward compatibility with existing views.
CREATE TABLE journal_lines (
    id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    tenant_id        UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    account_id       UUID NOT NULL REFERENCES chart_of_accounts(id) ON DELETE RESTRICT,
    debit            NUMERIC(15,2) DEFAULT 0,
    credit           NUMERIC(15,2) DEFAULT 0,
    description      TEXT
);
CREATE INDEX idx_journal_lines_entry_id ON journal_lines(journal_entry_id);
CREATE INDEX idx_journal_lines_account_id ON journal_lines(account_id);
```

### 2.6 Procurement

```sql
-- Purchase Orders
CREATE TABLE purchase_orders (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    vendor_name     TEXT NOT NULL,
    status          order_status DEFAULT 'draft',
    total_amount    NUMERIC(15,2) DEFAULT 0,
    notes           TEXT,
    created_by      UUID REFERENCES profiles(id),
    approved_by     UUID REFERENCES profiles(id),
    approved_at     TIMESTAMPTZ,
    expected_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Pesanan Status: 9-state lifecycle for cross-division coordination
CREATE TYPE pesanan_status AS ENUM (
  'draft',       -- Created but not yet confirmed
  'confirmed',   -- Confirmed by cashier / order taker — triggers Stok notification
  'processing',  -- Being prepared (kitchen, warehouse picking)
  'ready',       -- Ready for handoff / pickup / delivery
  'fulfilled',   -- Goods or services delivered to customer
  'invoiced',    -- Invoice issued (B2B path)
  'paid',        -- Payment received and transaction committed
  'cancelled',   -- Cancelled before fulfillment
  'voided'       -- Post-payment reversal — triggers reversal journal entry
);

-- Sales Orders (Pesanan): Cross-division order communication record
-- Created atomically with every POS sale (source='pos') and B2B orders
-- See docs/accounting.md §4 and docs/business_flow.md Flow 2b for lifecycle
CREATE TABLE sales_orders (
    id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id        UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    pesanan_number   TEXT NOT NULL,           -- Human-readable: 'ORD-2026-00041' (generated)
    customer_name    TEXT,
    status           pesanan_status DEFAULT 'draft',
    source           TEXT NOT NULL DEFAULT 'pos', -- 'pos' | 'b2b' | 'online' | 'manual'
    division_notes   JSONB DEFAULT '{}',      -- { "kasir": "", "stok": "", "dapur": "", "gudang": "" }
    transaction_id   UUID REFERENCES transactions(id), -- Back-link set after payment committed
    total_amount     NUMERIC(15,2) DEFAULT 0,
    notes            TEXT,
    created_by       UUID REFERENCES profiles(id),
    fulfilled_at     TIMESTAMPTZ,
    created_at       TIMESTAMPTZ DEFAULT NOW(),
    updated_at       TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, pesanan_number)
);
CREATE INDEX idx_sales_orders_tenant_status ON sales_orders(tenant_id, status);
CREATE INDEX idx_sales_orders_tenant_date ON sales_orders(tenant_id, created_at DESC);
```

### 2.7 Analytics & Materialized Views

```sql
-- Ledger Balances: Pre-computed per account
CREATE MATERIALIZED VIEW ledger_balances AS
SELECT
    jl.tenant_id,
    jl.account_id,
    coa.code,
    coa.name,
    coa.type,
    SUM(jl.debit)  AS total_debit,
    SUM(jl.credit) AS total_credit,
    SUM(jl.debit - jl.credit) AS balance
FROM journal_lines jl
JOIN chart_of_accounts coa ON jl.account_id = coa.id
JOIN journal_entries je ON jl.journal_entry_id = je.id
WHERE je.status = 'posted'
GROUP BY jl.tenant_id, jl.account_id, coa.code, coa.name, coa.type;

CREATE UNIQUE INDEX idx_ledger_balances_unique ON ledger_balances(tenant_id, account_id);

-- Monthly Profit/Loss
CREATE MATERIALIZED VIEW monthly_profit_loss AS
SELECT
    jl.tenant_id,
    DATE_TRUNC('month', je.transaction_date) AS month,
    SUM(CASE WHEN coa.type = 'pendapatan' THEN jl.credit ELSE 0 END) AS total_revenue,
    SUM(CASE WHEN coa.type = 'beban'      THEN jl.debit  ELSE 0 END) AS total_expense,
    SUM(CASE WHEN coa.type = 'pendapatan' THEN jl.credit - jl.debit ELSE 0 END) AS net_profit
FROM journal_lines jl
JOIN chart_of_accounts coa ON jl.account_id = coa.id
JOIN journal_entries je ON jl.journal_entry_id = je.id
WHERE je.status = 'posted'
GROUP BY jl.tenant_id, DATE_TRUNC('month', je.transaction_date);
```

---

## 3. Indexing Strategy

| Table | Index | Purpose |
|---|---|---|
| `transactions` | `(tenant_id, transaction_date DESC)` | Dashboard queries, date-range reports |
| `journal_entries` | `(tenant_id, transaction_date DESC)` | Financial reports |
| `journal_lines` | `(journal_entry_id)`, `(account_id)` | Ledger lookups |
| `products` | `(tenant_id)`, `(barcode)` | POS product search |
| `chart_of_accounts` | `(tenant_id)`, `(tenant_id, code)` | COA lookups during journaling |
| `profiles` | `(tenant_id)` | Auth checks |

---

## 4. Refactor Direction

### ✅ Completed (2026-05-19)
1. **Tier enum:** Canonical values `'free'`, `'premium'`, `'pro'`, `'franchise'` enforced in code and DB.
2. **COA columns:** `kategori` + `normal_balance` added with CHECK constraints. 31 business + 12 personal accounts seeded in `handle_new_user()`.
3. **Transactions FK:** `pesanan_id` and `source_type` added to `transactions`.
4. **Pesanan lifecycle:** `pesanan_status` 9-state enum, `pesanan_number`, `source`, `division_notes`, `transaction_id`, `fulfilled_at` all added.
5. **journal_lines alignment:** Docs updated to match SQL's `debit/credit` split-column model (kept for backward compatibility).
6. **Missing indexes:** Added on `profiles`, variant/addon tables, `bills`, and `journal_lines`.
7. **Materialized views:** `ledger_balances` and `monthly_profit_loss` added to SQL, adapted for `debit/credit`.
8. **Universal Product Engine Phase 0:** `product_type`, `product_behaviors`, `product_variants`, `product_variant_groups`, `product_variant_options`, `product_addon_groups`, `product_addons`, and `tenant_industry_profiles` tables all present.
9. **Backend/Frontend API alignment:** Controller base paths fixed (`/accounting`, `/report`, `/promo`, `/orders`, `/transactions`). Frontend service paths aligned.
10. **Guard chain:** `AccountTypeGuard` registered globally. `@RequireAccountType` now functional.
11. **Response envelope:** Global `ResponseEnvelopeInterceptor` registered.

### 🔄 Remaining
12. **Standardize soft-delete:** Add `deleted_at TIMESTAMPTZ` to all core tables.
13. **Audit columns:** Add `updated_by` to `transactions`, `journal_entries`, `purchase_orders`.
14. **DB migration tooling:** Implement Flyway or Liquibase for reproducible migrations.
15. **pgAudit:** Enable for compliance on financial tables.

---

## 5. Long-Term Recommendations

| Recommendation | Rationale |
|---|---|
| Partition `transactions` and `journal_entries` by `tenant_id` | PostgreSQL table partitioning for multi-million row tables |
| Add `ledger_balances` Redis cache with TTL | Avoid expensive materialized view refresh on every report load |
| Implement DB migration tooling (Flyway or Liquibase) | Current ad-hoc SQL migrations are not reproducible |
| Enable pgAudit for compliance | Track all DML on financial tables |
| Schema versioning | Every schema change tracked with migration number and rollback script |
| Migrate `product_recipes` to `product_behaviors` composite type | Unify BOM/recipe under Universal Product Engine (Phase 5) |

---

## 6. Personal Account Tables

> These tables are **only queried** for `account_type = 'personal'` tenants. They share the same `tenant_id` FK and RLS policies as all other tables. Business accounts never read or write to these tables.

### 6.1 `personal_budgets`

```sql
CREATE TABLE public.personal_budgets (
    id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id      UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    account_id     UUID NOT NULL REFERENCES public.chart_of_accounts(id) ON DELETE CASCADE,
    -- Only BEBAN OPERASIONAL accounts are valid budget targets
    month          INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year           INTEGER NOT NULL,
    budget_amount  NUMERIC(15,2) NOT NULL DEFAULT 0,
    created_at     TIMESTAMPTZ DEFAULT NOW(),
    updated_at     TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, account_id, month, year)
);

ALTER TABLE public.personal_budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY personal_budgets_isolation ON public.personal_budgets
    FOR ALL USING (tenant_id = public.get_auth_tenant_id());

CREATE INDEX idx_personal_budgets_tenant_period ON public.personal_budgets(tenant_id, year, month);
```

**Tier gate:** Available on both `free` (max 3 categories) and `premium` (unlimited) personal tiers.

---

### 6.2 `financial_goals`

```sql
CREATE TABLE public.financial_goals (
    id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id           UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name                TEXT NOT NULL,
    goal_type           TEXT NOT NULL CHECK (goal_type IN ('savings','debt_payoff','investment','emergency_fund')),
    target_amount       NUMERIC(15,2) NOT NULL,
    current_amount      NUMERIC(15,2) NOT NULL DEFAULT 0,
    target_date         DATE,
    linked_account_id   UUID REFERENCES public.chart_of_accounts(id) ON DELETE SET NULL,
    -- e.g. link to '1-10200 Tabungan & Investasi' or '1-10100 Dana Darurat'
    notes               TEXT,
    status              TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','achieved','cancelled')),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.financial_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY financial_goals_isolation ON public.financial_goals
    FOR ALL USING (tenant_id = public.get_auth_tenant_id());

CREATE INDEX idx_financial_goals_tenant ON public.financial_goals(tenant_id, status);
```

**Tier gate:** `free` = max 2 active goals; `premium` = unlimited.

---

### 6.3 `recurring_transactions`

```sql
CREATE TABLE public.recurring_transactions (
    id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id           UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name                TEXT NOT NULL,             -- e.g. "Bayar Kos", "Gaji Bulanan"
    amount              NUMERIC(15,2) NOT NULL,
    direction           TEXT NOT NULL CHECK (direction IN ('income','expense')),
    debit_account_id    UUID NOT NULL REFERENCES public.chart_of_accounts(id) ON DELETE RESTRICT,
    credit_account_id   UUID NOT NULL REFERENCES public.chart_of_accounts(id) ON DELETE RESTRICT,
    frequency           TEXT NOT NULL CHECK (frequency IN ('daily','weekly','monthly','yearly')),
    day_of_period       INTEGER,                   -- day of month (1–31) or day of week (1–7)
    next_due_date       DATE NOT NULL,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    last_triggered_at   TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.recurring_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY recurring_transactions_isolation ON public.recurring_transactions
    FOR ALL USING (tenant_id = public.get_auth_tenant_id());

CREATE INDEX idx_recurring_transactions_due ON public.recurring_transactions(next_due_date) WHERE is_active = TRUE;
```

**Tier gate:** `premium` tier only. `free` personal users cannot create recurring transactions.

---

### 6.4 Personal COA Seed (12 Accounts)

When `account_type = 'personal'`, `handle_new_user()` seeds these 12 system accounts (instead of the business 31-account seed):

| Kode | Nama Akun | Normal Balance | Kategori |
|---|---|---|---|
| `1-10000` | Dompet / Kas Tunai | debit | ASET |
| `1-10002` | Rekening Bank | debit | ASET |
| `1-10003` | E-Wallet | debit | ASET |
| `1-10100` | Dana Darurat | debit | ASET |
| `1-10200` | Tabungan & Investasi | debit | ASET |
| `2-20100` | Hutang / Cicilan | credit | KEWAJIBAN |
| `3-30000` | Kekayaan Bersih (Modal) | credit | EKUITAS |
| `4-40000` | Gaji / Pendapatan Tetap | credit | PENDAPATAN |
| `4-40900` | Pendapatan Lain-lain | credit | PENDAPATAN |
| `6-60000` | Kebutuhan Pokok | debit | BEBAN OPERASIONAL |
| `6-60100` | Tagihan & Utilitas | debit | BEBAN OPERASIONAL |
| `6-60999` | Pengeluaran Lain-lain | debit | BEBAN OPERASIONAL |

> - All 12 are `is_system = TRUE` (cannot be deleted, code is immutable)
> - No `HPP / BIAYA LANGSUNG` accounts — personal accounts never sell products
> - User may add custom accounts (`is_system = FALSE`) using the same 6 canonical `kategori` values

---

## 7. Bill Tracker & Reminder Tables

> **Shared feature** — available for **both** `account_type = 'personal'` and `account_type = 'business'`. The same tables are used; journal templates differ based on account_type (see `docs/accounting.md §2.5`).

### 7.1 `bills`

```sql
CREATE TABLE public.bills (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id       UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

    -- Bill identity
    title           TEXT NOT NULL,                   -- e.g. "Tagihan PLN", "Pinjaman ke Budi"
    description     TEXT,
    contact_name    TEXT,                            -- Vendor (hutang) or debtor name (piutang)
    contact_phone   TEXT,

    -- Financial details
    amount          NUMERIC(15,2) NOT NULL,
    bill_type       TEXT NOT NULL CHECK (bill_type IN ('hutang', 'piutang')),
    -- hutang = you owe money (payable)
    -- piutang = someone owes you (receivable)

    -- COA linking
    coa_account_id  UUID REFERENCES public.chart_of_accounts(id) ON DELETE SET NULL,
    -- For hutang business: links to 2-20100 Hutang Usaha
    -- For hutang personal: links to 2-20100 Hutang/Cicilan
    -- For piutang business: links to 1-10300 Piutang Usaha
    -- For piutang personal: links to appropriate ASET account
    payment_account_id UUID REFERENCES public.chart_of_accounts(id) ON DELETE SET NULL,
    -- Cash/bank account used when paying/receiving

    -- Status lifecycle
    status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'partial', 'paid', 'overdue', 'cancelled')),
    amount_paid     NUMERIC(15,2) NOT NULL DEFAULT 0,
    -- amount_paid <= amount; when amount_paid = amount → status auto → 'paid'

    -- Due date & reminders
    due_date        DATE NOT NULL,
    reminder_days   INTEGER[] DEFAULT ARRAY[7, 3, 1],
    -- Days BEFORE due_date to send smart_alerts (e.g. [7,3,1] = remind 7, 3, 1 day before)
    last_reminded_at TIMESTAMPTZ,

    -- Attachment
    photo_url       TEXT,                            -- Receipt or agreement scan

    -- Journal link (set when bill is fully paid)
    journal_entry_id UUID REFERENCES public.journal_entries(id) ON DELETE SET NULL,

    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
CREATE POLICY bills_isolation ON public.bills
    FOR ALL USING (tenant_id = public.get_auth_tenant_id());

CREATE INDEX idx_bills_tenant_status  ON public.bills(tenant_id, status);
CREATE INDEX idx_bills_tenant_due     ON public.bills(tenant_id, due_date) WHERE status IN ('pending', 'partial', 'overdue');
```

---

### 7.2 `bill_payments`

Records partial or full payments against a bill. Each payment creates one journal entry.

```sql
CREATE TABLE public.bill_payments (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bill_id         UUID NOT NULL REFERENCES public.bills(id) ON DELETE CASCADE,
    tenant_id       UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

    amount          NUMERIC(15,2) NOT NULL,           -- Amount paid in this installment
    payment_date    DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_account_id UUID REFERENCES public.chart_of_accounts(id) ON DELETE SET NULL,
    notes           TEXT,

    -- Journal entry created for this payment
    journal_entry_id UUID REFERENCES public.journal_entries(id) ON DELETE SET NULL,

    created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.bill_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY bill_payments_isolation ON public.bill_payments
    FOR ALL USING (tenant_id = public.get_auth_tenant_id());

CREATE INDEX idx_bill_payments_bill ON public.bill_payments(bill_id);
```

---

### 7.3 Status Lifecycle

```
pending   → partial   (first partial payment recorded)
partial   → paid      (amount_paid = amount, final payment recorded)
pending   → paid      (single full payment)
pending   → overdue   (due_date passed, status auto-updated by cron)
partial   → overdue   (due_date passed with partial payment)
any       → cancelled (user manually cancels)
```

**Cron job (daily 01:00 WIB):**
```sql
-- Auto-mark overdue
UPDATE public.bills
SET status = 'overdue', updated_at = NOW()
WHERE due_date < CURRENT_DATE
  AND status IN ('pending', 'partial');

-- Send reminders based on reminder_days
-- For each bill WHERE due_date - CURRENT_DATE = ANY(reminder_days) AND status IN ('pending','partial'):
--   INSERT INTO smart_alerts (alert_type='bill_due', tenant_id, message, reference_id)
```

---

### 7.4 `bills` Tier Availability

| Feature | Personal Free | Personal Premium | Business Free | Business Pro | Franchise |
|---|---|---|---|---|---|
| Track bills | ✅ 10 active | ✅ Unlimited | ✅ 10 active | ✅ Unlimited | ✅ Unlimited |
| Partial payments | ✅ | ✅ | ✅ | ✅ | ✅ |
| Auto-journal on payment | ✅ | ✅ | ✅ | ✅ | ✅ |
| Reminder days config | ❌ (7 days only) | ✅ Custom | ❌ (7 days only) | ✅ Custom | ✅ Custom |
| Photo attachment | ❌ | ✅ | ❌ | ✅ | ✅ |

