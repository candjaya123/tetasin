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

```sql
-- Products: Items sold to customers
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

---

## 5. Long-Term Recommendations

| Recommendation | Rationale |
|---|---|
| Partition `transactions` and `journal_entries` by `tenant_id` | PostgreSQL table partitioning for multi-million row tables |
| Add `ledger_balances` Redis cache with TTL | Avoid expensive materialized view refresh on every report load |
| Implement DB migration tooling (Flyway or Liquibase) | Current ad-hoc SQL migrations are not reproducible |
| Enable pgAudit for compliance | Track all DML on financial tables |
| Schema versioning | Every schema change tracked with migration number and rollback script |
