# Tumbuhin — Database Schema

> **Document Purpose:** Defines the ideal database structure — entities, relationships, normalization strategy, indexing, naming conventions, and scalability considerations.
> **Who Should Read This:** Backend engineers, DBAs, architects.
> **Why It Matters:** Database quality directly affects performance, scalability, data integrity, and audit trails. Poor schemas are the hardest technical debt to repay.

---

## 1. Current Problems

| Problem | Severity | Description |
|---|---|---|
| Subscription tier enum mismatch | 🔴 High | DB: `'free','business','ai'` vs Code: `STARTER, BUSINESS, PRO` |
| `journal_entries` schema is simplified | 🔴 High | Original schema uses `debit_account_id/credit_account_id` (2-account) instead of proper multi-line journal_lines |
| No composite index on `(tenant_id, created_at)` on high-traffic tables | 🟡 Medium | `transactions`, `journal_entries` will be slow at 100k+ rows per tenant |
| Soft delete not standardized | 🟡 Medium | Some tables use `status`, others have no delete tracking |
| `business_memory` is a general JSONB blob | 🟡 Medium | No schema enforcement — risks data corruption over time |
| Missing foreign key on `journal_lines.journal_entry_id` in some migrations | 🟡 Medium | Orphaned records risk |
| No audit column standardization (`created_by`, `updated_by`) | 🟠 Low | Can't trace who created/modified records |

---

## 2. Ideal Structure

### 2.1 Core Tenancy Tables

```sql
-- ENUM: Subscription Tier (CANONICAL — match code)
CREATE TYPE subscription_tier AS ENUM ('starter', 'business', 'pro');
CREATE TYPE user_role AS ENUM ('manager', 'kasir', 'stok');
CREATE TYPE payment_method AS ENUM ('cash', 'qris', 'transfer', 'card');
CREATE TYPE order_status AS ENUM ('draft', 'pending', 'approved', 'fulfilled', 'cancelled');
CREATE TYPE journal_status AS ENUM ('draft', 'posted', 'voided');

-- Tenants: One per business
CREATE TABLE tenants (
    id                   UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name                 TEXT NOT NULL,
    account_type         TEXT NOT NULL DEFAULT 'business', -- 'business' | 'personal'
    tier                 subscription_tier NOT NULL DEFAULT 'starter',
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
CREATE TABLE chart_of_accounts (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    code        TEXT NOT NULL,        -- e.g. '1-10000'
    name        TEXT NOT NULL,        -- e.g. 'Kas Tunai'
    type        TEXT NOT NULL,        -- 'aset' | 'kewajiban' | 'ekuitas' | 'pendapatan' | 'beban'
    is_system   BOOLEAN DEFAULT FALSE, -- System accounts cannot be deleted
    parent_code TEXT,                 -- For hierarchical COA
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, code)
);
CREATE INDEX idx_coa_tenant_id ON chart_of_accounts(tenant_id);
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
    cost_price     NUMERIC(15,2) NOT NULL DEFAULT 0,
    current_stock  NUMERIC(15,3) NOT NULL DEFAULT 0,
    reorder_point  NUMERIC(15,3) DEFAULT 0,
    unit           TEXT DEFAULT 'pcs',
    category       TEXT,
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

-- Raw Materials: Ingredients / components
CREATE TABLE raw_materials (
    id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id      UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    warehouse_id   UUID REFERENCES warehouses(id),
    name           TEXT NOT NULL,
    unit           TEXT NOT NULL,
    unit_price     NUMERIC(15,2) NOT NULL DEFAULT 0,
    current_stock  NUMERIC(15,3) NOT NULL DEFAULT 0,
    reorder_point  NUMERIC(15,3) DEFAULT 0,
    created_at     TIMESTAMPTZ DEFAULT NOW(),
    updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Product Recipes: BOM (Bill of Materials)
-- NOTE: In the Universal Product Engine, recipes migrate to product_behaviors
-- metadata for product_type='composite'. This table remains for backward compatibility.
CREATE TABLE product_recipes (
    id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    product_id        UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    raw_material_id   UUID NOT NULL REFERENCES raw_materials(id) ON DELETE RESTRICT,
    quantity_needed   NUMERIC(15,3) NOT NULL,
    UNIQUE(product_id, raw_material_id)
);

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
-- Transactions: POS sales header
CREATE TABLE transactions (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    cashier_id      UUID REFERENCES profiles(id),
    journal_id      UUID REFERENCES journal_entries(id),
    status          TEXT NOT NULL DEFAULT 'committed', -- 'validating' | 'committed' | 'voided'
    payment_method  payment_method NOT NULL DEFAULT 'cash',
    subtotal        NUMERIC(15,2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
    total_amount    NUMERIC(15,2) NOT NULL DEFAULT 0,
    notes           TEXT,
    idempotency_key TEXT UNIQUE,
    transaction_date TIMESTAMPTZ DEFAULT NOW(),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_transactions_tenant_id_date ON transactions(tenant_id, transaction_date DESC);

-- Sale Items: Line items per transaction
CREATE TABLE sale_items (
    id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id      UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    product_id     UUID NOT NULL REFERENCES products(id),
    quantity       NUMERIC(15,3) NOT NULL,
    unit_price     NUMERIC(15,2) NOT NULL,
    discount       NUMERIC(15,2) DEFAULT 0,
    hpp_amount     NUMERIC(15,2) DEFAULT 0,
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
    created_at       TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_journal_entries_tenant_date ON journal_entries(tenant_id, transaction_date DESC);

-- Journal Lines: Individual debit/credit lines (PROPER double-entry)
CREATE TABLE journal_lines (
    id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    account_id       UUID NOT NULL REFERENCES chart_of_accounts(id),
    tenant_id        UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    type             TEXT NOT NULL CHECK (type IN ('debit', 'credit')),
    amount           NUMERIC(15,2) NOT NULL CHECK (amount > 0),
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

-- Sales Orders
CREATE TABLE sales_orders (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    customer_name   TEXT NOT NULL,
    status          order_status DEFAULT 'pending',
    total_amount    NUMERIC(15,2) DEFAULT 0,
    notes           TEXT,
    created_by      UUID REFERENCES profiles(id),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
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
    SUM(CASE WHEN jl.type = 'debit'  THEN jl.amount ELSE 0 END) AS total_debit,
    SUM(CASE WHEN jl.type = 'credit' THEN jl.amount ELSE 0 END) AS total_credit,
    SUM(CASE WHEN jl.type = 'debit'  THEN jl.amount ELSE -jl.amount END) AS balance
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
    SUM(CASE WHEN coa.type = 'pendapatan' THEN jl.amount ELSE 0 END) AS total_revenue,
    SUM(CASE WHEN coa.type = 'beban'      THEN jl.amount ELSE 0 END) AS total_expense,
    SUM(CASE WHEN coa.type = 'pendapatan' THEN jl.amount ELSE -jl.amount END) AS net_profit
FROM journal_lines jl
JOIN chart_of_accounts coa ON jl.account_id = coa.id
JOIN journal_entries je ON jl.journal_entry_id = je.id
WHERE je.status = 'posted' AND jl.type = 'credit'
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

1. **Fix enum:** Run migration to rename `'free'→'starter'` and `'ai'→'pro'` in DB
2. **Migrate to proper journal_lines:** Deprecate `debit_account_id/credit_account_id` on `journal_entries`, use normalized `journal_lines` table
3. **Add composite indexes** on all high-traffic tables
4. **Standardize soft-delete:** Add `deleted_at TIMESTAMPTZ` to all core tables, filter in queries
5. **Add `created_by` / `updated_by`** audit columns to `transactions`, `journal_entries`, `purchase_orders`
6. **Universal Product Engine Phase 0:** Add `product_type` column + `product_behaviors` + `product_variants` + `tenant_industry_profiles` tables (see `docs/product_engine_upgrade.md`)

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
