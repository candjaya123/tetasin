# Schema Migration Plan — Full Rewrite
> Target file: `E:\tumbuhin\migration\full_schema_supabase.sql`
> Strategy: Complete DROP & recreate. No backward compat. Run on fresh Supabase project.

---

## Section 1 — ENUMs (all in one DO block)

| Enum | Values |
|---|---|
| `user_role` | `manager`, `kasir`, `stok` |
| `subscription_tier` | `free`, `pro`, `franchise` |
| `payment_method` | `cash`, `qris`, `transfer`, `card` |
| `pesanan_status` | `draft`, `confirmed`, `processing`, `ready`, `fulfilled`, `invoiced`, `paid`, `cancelled`, `voided` |
| `transaction_source` | `pos_sale`, `pos_void`, `expense`, `receipt_ocr`, `po_fulfillment`, `stock_adjustment`, `manual` |
| `journal_status` | `draft`, `posted`, `voided` |
| `hpp_mode` | `recipe`, `direct`, `none` |
| `industry_type` | `retail`, `fnb`, `grocery`, `pharmacy`, `electronics`, `manufacturing`, `service`, `hybrid`, `general` |
| `draft_status_enum` | `pending`, `approved`, `rejected` |

---

## Section 2 — Tables (creation order matters for FKs)

### 2.1 Core Multi-Tenant

**`tenants`**
```
id, name, account_type, tier subscription_tier,
subscription_status, subscription_end_date,
address, npwp, contact_phone, contact_email, website,
created_at
```

**`profiles`** (linked to auth.users)
```
id (FK auth.users), full_name, role user_role,
tenant_id FK tenants, account_type, avatar_url,
is_superadmin BOOL, ai_operation_mode,
created_at, updated_at
```

---

### 2.2 Chart of Accounts

**`chart_of_accounts`**
```
id, tenant_id FK, code TEXT, name TEXT,
type TEXT,   -- aset|kewajiban|ekuitas|pendapatan|beban
kategori TEXT CHECK IN (6 values),
normal_balance TEXT CHECK IN (debit|credit),
is_system BOOL DEFAULT FALSE,
parent_code TEXT,
created_at
UNIQUE(tenant_id, code)
CHECK kategori IN ('ASET','KEWAJIBAN','EKUITAS','PENDAPATAN','HPP / BIAYA LANGSUNG','BEBAN OPERASIONAL')
CHECK normal_balance IN ('debit','credit')
```
Indexes: `(tenant_id)`, `(tenant_id, code)`, `(tenant_id, kategori)`

---

### 2.3 Warehouses

**`warehouses`**
```
id, tenant_id FK, name, address, is_main BOOL, created_at
```

---

### 2.4 Inventory

**`raw_materials`** (Bahan Baku)
```
id, tenant_id FK, warehouse_id FK,
name, unit TEXT,
unit_price NUMERIC(15,4),      -- price per 1 unit
current_stock NUMERIC(15,3),
reorder_point NUMERIC(15,3),
last_purchase_price NUMERIC(15,4),
coa_account_id FK chart_of_accounts,  -- default 1-10500
created_at, updated_at
```
Indexes: `(tenant_id)`, `(warehouse_id)`

**`products`**
```
id, tenant_id FK, warehouse_id FK,
name, sku, barcode,
selling_price NUMERIC(15,2),
cost_price NUMERIC(15,2),      -- Direct HPP fallback
current_stock NUMERIC(15,3),
reorder_point NUMERIC(15,3),
unit TEXT,
category TEXT,
hpp_coa_id FK chart_of_accounts,  -- Direct mode Persediaan override (default 1-10503)
is_active BOOL,
created_at, updated_at
UNIQUE(tenant_id, sku), UNIQUE(tenant_id, barcode)
```
Indexes: `(tenant_id)`, `(barcode)`, `(tenant_id) WHERE is_active`

**`product_recipes`** (BOM — quantity per 1 unit sold)
```
id, tenant_id FK, product_id FK products,
raw_material_id FK raw_materials ON DELETE RESTRICT,
quantity_needed NUMERIC(15,4),
UNIQUE(product_id, raw_material_id)
```
Indexes: `(product_id)`, `(raw_material_id)`

**`product_variant_groups`**
```
id, tenant_id FK, product_id FK,
name, is_required BOOL, allow_multiple BOOL, display_order, created_at
```

**`product_variant_options`**
```
id, tenant_id FK, group_id FK, product_id FK,
name, price_delta, cost_delta, sku_suffix,
current_stock NUMERIC(15,3) NOT NULL,
display_order, is_active, created_at
```

**`product_addon_groups`**
```
id, tenant_id FK, product_id FK,
name, is_required BOOL, min_selections, max_selections,
is_promo_eligible BOOL, display_order, created_at
```

**`product_addons`**
```
id, tenant_id FK, group_id FK, product_id FK,
name, price NUMERIC(15,2), cost_price NUMERIC(15,2),
track_stock BOOL, current_stock NUMERIC(15,3),
raw_material_id FK raw_materials,
display_order, is_active, created_at
```

**`stock_transfers`**
```
id, tenant_id FK, from_warehouse_id FK, to_warehouse_id FK,
reference_number, status, notes, created_by FK profiles, created_at
```

**`stock_transfer_items`**
```
id, transfer_id FK, raw_material_id FK raw_materials, quantity NUMERIC(15,3)
```

**`stock_opnames`**
```
id, tenant_id FK, warehouse_id FK,
reference_number, notes, created_by FK profiles, created_at
```

**`stock_opname_items`**
```
id, opname_id FK, raw_material_id FK raw_materials,
system_quantity, physical_quantity, difference NUMERIC(15,3)
```

---

### 2.5 Accounting

**`journal_entries`**
```
id, tenant_id FK, date TIMESTAMPTZ,
description TEXT, reference_type TEXT,  -- pos_sale|expense|void|manual|receipt_ocr|po_fulfillment
reference_id UUID,                       -- FK to the source record
status journal_status DEFAULT 'posted',
created_by FK profiles,
idempotency_key TEXT UNIQUE,
created_at
```
Indexes: `(tenant_id, date DESC)`, `(tenant_id, reference_type)`, `(reference_id)`

**`journal_lines`**
```
id, journal_entry_id FK journal_entries ON DELETE CASCADE,
account_id FK chart_of_accounts,
type TEXT CHECK IN ('debit','credit'),
amount NUMERIC(15,2) NOT NULL CHECK > 0,
description TEXT,
created_at
```
Index: `(journal_entry_id)`, `(account_id)`

---

### 2.6 Sales & Pesanan

**`customers`**
```
id, tenant_id FK, name, email, phone, address, created_at
```

**`sales_orders`** (Pesanan — cross-division coordination)
```
id, tenant_id FK,
pesanan_number TEXT NOT NULL,    -- 'ORD-2026-00041' (generated)
customer_name TEXT,
status pesanan_status DEFAULT 'draft',
source TEXT DEFAULT 'pos',       -- pos|b2b|online|manual
division_notes JSONB DEFAULT '{}', -- {kasir:"", stok:"", dapur:"", gudang:""}
transaction_id UUID,             -- back-link (set after payment)
total_amount NUMERIC(15,2),
notes TEXT,
created_by FK profiles,
fulfilled_at TIMESTAMPTZ,
created_at, updated_at
UNIQUE(tenant_id, pesanan_number)
```
Indexes: `(tenant_id, status)`, `(tenant_id, created_at DESC)`

**`transactions`** (Universal financial event log)
```
id, tenant_id FK,
cashier_id FK profiles,
pesanan_id FK sales_orders,      -- Always set for POS sales
journal_id FK journal_entries,   -- Set after journal created
source_type transaction_source NOT NULL DEFAULT 'pos_sale',
status TEXT DEFAULT 'committed', -- validating|committed|voided
payment_method payment_method DEFAULT 'cash',
subtotal NUMERIC(15,2),
discount_amount NUMERIC(15,2),
total_amount NUMERIC(15,2),
notes TEXT,
idempotency_key TEXT UNIQUE,
transaction_date TIMESTAMPTZ DEFAULT NOW(),
created_at
```
Indexes: `(tenant_id, transaction_date DESC)`, `(tenant_id, source_type)`, `(pesanan_id)`

**`sale_items`**
```
id, tenant_id FK, transaction_id FK transactions ON DELETE CASCADE,
product_id FK products,
quantity NUMERIC(15,3),
unit_price NUMERIC(15,2),
discount NUMERIC(15,2) DEFAULT 0,
hpp_mode TEXT DEFAULT 'none',      -- snapshot at sale time
hpp_per_unit NUMERIC(15,4) DEFAULT 0,  -- snapshot at sale time
hpp_amount NUMERIC(15,2) DEFAULT 0,    -- hpp_per_unit × quantity
total NUMERIC(15,2),
selected_variants JSONB DEFAULT '[]',
selected_addons   JSONB DEFAULT '[]'
```
Index: `(transaction_id)`

---

### 2.7 Procurement

**`purchase_orders`**
```
id, tenant_id FK, vendor_name,
reference_number, total_amount NUMERIC(15,2),
status TEXT DEFAULT 'draft',  -- draft|sent|received|cancelled
created_by FK profiles, created_at
```

**`purchase_order_items`**
```
id, po_id FK purchase_orders,
raw_material_id FK raw_materials,
quantity NUMERIC(15,3), unit_price NUMERIC(15,4),
received_qty NUMERIC(15,3) DEFAULT 0
```

---

### 2.8 Promotions

**`promotions`**
```
id, tenant_id FK, name, type,  -- discount|buy_x_get_y|bundle
rules JSONB, is_active BOOL, starts_at, ends_at, created_at
```

---

### 2.9 Receipt OCR (ADR-007)

**`receipt_scans`**
```
id, tenant_id FK, user_id FK profiles,
storage_path TEXT, status TEXT, -- processing|completed|failed
extracted_data JSONB, confidence_score NUMERIC(4,2),
error_message TEXT, created_at, updated_at
```

**`merchant_mappings`**
```
id, tenant_id FK, merchant_name TEXT,
suggested_category TEXT, suggested_account_id FK,
usage_count INT DEFAULT 1, last_used_at,
UNIQUE(tenant_id, merchant_name)
```

**`draft_transactions`**
```
id, tenant_id FK, scan_id FK receipt_scans,
merchant_name, transaction_date DATE,
total_amount NUMERIC(15,2),
suggested_debit_account_id FK, suggested_credit_account_id FK,
raw_lines JSONB, status draft_status_enum DEFAULT 'pending',
approved_by FK profiles, approved_at,
created_at, updated_at
```

---

### 2.10 Analytics & System

**`event_log`**
```
id UUID, tenant_id FK, trace_id, idempotency_key,
event_type, sequence_number BIGINT, version INT, payload JSONB,
created_at, PRIMARY KEY(id, created_at), UNIQUE(id)
```

**`processed_events`**
```
event_id PK FK event_log, processed_at, worker_id
```

**`dlq_events`**
```
id, event_id FK event_log, error_message, stack_trace, created_at
```

**`ledger_snapshots`**
```
id, tenant_id FK, account_id FK chart_of_accounts,
month INT, year INT, ending_balance NUMERIC,
created_at, UNIQUE(tenant_id, account_id, month, year)
```

**`tenant_metrics_cache`**
```
id, tenant_id FK, date DATE,
daily_revenue_json JSONB, top_products_json JSONB,
slow_moving_json JSONB, created_at
UNIQUE(tenant_id, date)
```

**`smart_alerts`**
```
id, tenant_id FK, alert_type, message, priority, is_read BOOL, created_at
```

**`tenant_notification_configs`**
```
id, tenant_id FK, role user_role,
notify_sale BOOL, notify_stock_update BOOL, notify_stock_low BOOL,
notify_bill_due BOOL, notify_staff_activity BOOL,
created_at, updated_at, UNIQUE(tenant_id, role)
```

**`tenant_balances`**
```
tenant_id PK FK tenants, balance_amount NUMERIC DEFAULT 0, updated_at
```

**`payout_requests`**
```
id, tenant_id FK, amount NUMERIC, bank_info,
status TEXT CHECK IN (pending|success|failed), created_at, updated_at
```

**`activity_logs`**
```
id, tenant_id FK, user_id FK auth.users,
action TEXT, details JSONB, created_at
```

**`assets`**
```
id, tenant_id FK, name, purchase_price, current_value,
purchase_date DATE, location, photo_url, coa_account_id FK,
depreciation_rate NUMERIC(5,2), created_at, updated_at
```

**`bills`**
```
id, tenant_id FK, title, amount NUMERIC,
due_date DATE, type TEXT CHECK IN (hutang|piutang),
status TEXT CHECK IN (pending|paid),
coa_account_id FK, description, photo_url, created_at, updated_at
```

**`global_settings`**
```
id SERIAL PK, system_mode TEXT CHECK IN (NORMAL|DEGRADED|READ_ONLY|EMERGENCY), updated_at
```

---

## Section 3 — RLS Policy Map

| Table | Policy | Condition |
|---|---|---|
| `profiles` | ALL | `id = auth.uid() OR tenant_id = get_auth_tenant_id()` |
| `tenants` | SELECT | `id = get_auth_tenant_id() OR is_superadmin` |
| `tenants` | UPDATE | `id = get_auth_tenant_id() AND get_auth_role() = 'manager'` |
| `chart_of_accounts` | ALL | `tenant_id = get_auth_tenant_id()` |
| `raw_materials` | SELECT | `tenant_id = get_auth_tenant_id()` |
| `raw_materials` | INSERT/UPDATE/DELETE | `get_auth_role() IN ('manager','stok')` |
| `products` | SELECT | `tenant_id = get_auth_tenant_id()` |
| `products` | INSERT/UPDATE/DELETE | `get_auth_role() IN ('manager','stok')` |
| `product_recipes` | ALL | `tenant_id = get_auth_tenant_id()` |
| `journal_entries` | ALL | `tenant_id = get_auth_tenant_id()` |
| `journal_lines` | ALL | via journal_entries join |
| `sales_orders` | ALL | `tenant_id = get_auth_tenant_id()` |
| `transactions` | ALL | `tenant_id = get_auth_tenant_id()` |
| `sale_items` | ALL | `tenant_id = get_auth_tenant_id()` |
| `warehouses` | ALL | `tenant_id = get_auth_tenant_id()` |
| `purchase_orders` | ALL | `tenant_id = get_auth_tenant_id()` |
| `receipt_scans` | ALL | `tenant_id = get_auth_tenant_id()` |
| `draft_transactions` | ALL | `tenant_id = get_auth_tenant_id()` |
| `merchant_mappings` | ALL | `tenant_id = get_auth_tenant_id()` |
| `event_log` | ALL | `tenant_id = get_auth_tenant_id()` |
| `activity_logs` | SELECT | `tenant_id = get_auth_tenant_id() AND get_auth_role() = 'manager'` |
| `activity_logs` | INSERT | `user_id = auth.uid()` |
| `tenant_notification_configs` | ALL | `tenant_id = get_auth_tenant_id()` |
| `tenant_balances` | SELECT | `tenant_id = get_auth_tenant_id() OR is_superadmin` |
| `payout_requests` | ALL | `tenant_id = get_auth_tenant_id() OR is_superadmin` |
| `assets` | ALL | `tenant_id = get_auth_tenant_id()` |
| `bills` | ALL | `tenant_id = get_auth_tenant_id()` |
| `promotions` | ALL | `tenant_id = get_auth_tenant_id()` |
| `customers` | ALL | `tenant_id = get_auth_tenant_id()` |
| `smart_alerts` | ALL | `tenant_id = get_auth_tenant_id()` |
| `ledger_snapshots` | ALL | `tenant_id = get_auth_tenant_id()` |

---

## Section 4 — Functions

### 4.1 Security Helper Functions
```
get_auth_tenant_id() → UUID   SECURITY DEFINER
get_auth_role()      → user_role  SECURITY DEFINER
```

### 4.2 Onboarding: handle_new_user()
Triggered by `auth.users INSERT`. Atomically:
1. INSERT tenants (tier = 'free' always for new users)
2. INSERT profiles (role='manager')
3. INSERT chart_of_accounts — all 31 accounts from akun.csv (is_system=TRUE)
4. INSERT tenant_notification_configs for all 3 roles
5. INSERT tenant_balances (0)

**Full COA seed** (31 rows, always same regardless of account_type):
```
1-10000 Kas Tangan          ASET  debit
1-10002 Kas Bank            ASET  debit
1-10003 E-Wallet            ASET  debit
1-10100 Biaya Dibayar di Muka ASET debit
1-10300 Piutang Usaha       ASET  debit
1-10400 Perlengkapan        ASET  debit
1-10500 Persediaan Bahan Baku ASET debit
1-10501 Persediaan Dalam Proses ASET debit
1-10502 Persediaan Barang Jadi ASET debit
1-10503 Persediaan Barang Dagang ASET debit
1-15000 Peralatan           ASET  debit
1-15900 Akumulasi Penyusutan ASET credit
2-20100 Hutang Usaha        KEWAJIBAN credit
2-20400 Hutang Bank         KEWAJIBAN credit
2-20600 Pendapatan Diterima di Muka KEWAJIBAN credit
3-30000 Modal               EKUITAS credit
3-31000 Prive               EKUITAS debit
4-40000 Penjualan Produk    PENDAPATAN credit
4-40001 Penjualan Jasa      PENDAPATAN credit
4-40900 Pendapatan Lain-lain PENDAPATAN credit
4-41000 Diskon Penjualan    PENDAPATAN debit
4-41001 Retur Penjualan     PENDAPATAN debit
5-50000 Harga Pokok Penjualan HPP/BIAYA LANGSUNG debit
6-60000 Biaya Admin         BEBAN OPERASIONAL debit
6-60100 Beban Gaji Karyawan BEBAN OPERASIONAL debit
6-60200 Biaya Utility       BEBAN OPERASIONAL debit
6-60300 Biaya Marketing     BEBAN OPERASIONAL debit
6-60400 Beban Sewa          BEBAN OPERASIONAL debit
6-60500 Beban Penyusutan    BEBAN OPERASIONAL debit
6-60600 Biaya Distribusi    BEBAN OPERASIONAL debit
6-60999 Biaya Lain-lain     BEBAN OPERASIONAL debit
```

### 4.3 Staff Management
```
register_staff_profile(p_user_id, p_full_name, p_role)
  → Only callable by manager
  → INSERT/UPSERT profile with same tenant_id
```

### 4.4 Product Helpers
```
create_product_with_recipe(p_name, p_selling_price, p_cost_price, p_barcode, p_hpp_coa_id, p_recipe JSONB)
  → INSERT product + recipe lines atomically

update_product_with_recipe(p_product_id, p_name, p_selling_price, p_cost_price, p_barcode, p_hpp_coa_id, p_recipe JSONB)
  → UPDATE product + hard-sync recipe

get_hpp_preview(p_product_id)
  → RETURNS JSON {hpp_mode, hpp_per_unit, selling_price, gross_margin_pct, ingredients[]}
```

### 4.5 POS Sale (process_pos_sale)
```
process_pos_sale(p_items JSONB, p_payment_method, p_discount_amount, p_customer_name, p_idempotency_key)
RETURNS JSON {transaction_id, pesanan_id, journal_id, status}

Steps:
1. Get tenant_id from auth.uid()
2. Generate pesanan_number ('ORD-YYYY-NNNNN' using sequence)
3. INSERT sales_orders (status='confirmed', source='pos')
4. INSERT transactions (status='validating', source_type='pos_sale', pesanan_id)
5. For each item:
   a. Load product_recipes → RECIPE MODE if exists
   b. Else use cost_price → DIRECT MODE
   c. Check ingredient stock (INSUFFICIENT_INGREDIENT if low)
   d. Deduct raw_material stock (FOR UPDATE)
   e. Calculate hpp_per_unit, hpp_amount
   f. INSERT sale_items (snapshot hpp_mode, hpp_per_unit, hpp_amount)
6. Resolve COA for payment_method:
   cash → 1-10000, qris → 1-10003, transfer/card → 1-10002
7. INSERT journal_entry (reference_type='pos_sale', reference_id=transaction.id)
8. INSERT journal_lines:
   Entry 1: DEBIT payment_account, CREDIT 4-40000 = total_amount
   Entry 2 (recipe): DEBIT 5-50000, CREDIT 1-10500 = Σ hpp_amount (recipe items)
   Entry 2b (direct): DEBIT 5-50000, CREDIT 1-10503 = Σ hpp_amount (direct items)
   Entry 3 (if discount>0): DEBIT 4-41000, CREDIT payment_account = discount_amount
9. Validate |Σdebit - Σcredit| < 0.01 → RAISE EXCEPTION if imbalanced
10. UPDATE transaction: status='committed', journal_id
11. UPDATE sales_orders: status='fulfilled', transaction_id
12. RETURN JSON
```

### 4.6 Void Sale
```
void_pos_sale(p_transaction_id UUID)
→ Only manager role
→ Sets transaction.status = 'voided'
→ Sets sales_orders.status = 'voided'
→ Creates reversal journal_entry (all lines debit↔credit swapped)
   reference_type = 'pos_void', reference_id = original transaction_id
```

### 4.7 Payout Helpers
```
increment_tenant_balance(p_tenant_id, p_amount)
approve_payout(p_payout_id)  → superadmin only
reject_payout(p_payout_id)   → superadmin only
```

### 4.8 Pesanan Status Update
```
update_pesanan_status(p_pesanan_id UUID, p_status pesanan_status, p_division_note TEXT, p_division TEXT)
→ Role-gated transitions (see business_flow.md Flow 2b)
→ Updates division_notes JSONB field for specific division
```

---

## Section 5 — Triggers

| Trigger | On | Function |
|---|---|---|
| `on_auth_user_created` | `AFTER INSERT ON auth.users` | `handle_new_user()` |
| `on_tenant_created_balance` | `AFTER INSERT ON tenants` | `handle_new_tenant_balance()` |

---

## Section 6 — Storage Buckets

| Bucket | Public |
|---|---|
| `avatars` | true |
| `inventory-docs` | true |
| `receipt-scans` | false (service role only) |

---

## Section 7 — Initial Data Seeds

```sql
-- Global settings
INSERT INTO global_settings (system_mode) VALUES ('NORMAL') ON CONFLICT DO NOTHING;
```

---

## Section 8 — Dropped / Removed From Old Schema

These old objects are NOT in the new schema:

- `master_chart_of_accounts` (replaced by seeded `chart_of_accounts` with `is_system=TRUE`)
- `entities`, `branches`, `business_profiles` tables (replaced by `tenants`)
- `journal_entries.debit_account_id`, `credit_account_id`, `amount` columns (replaced by `journal_lines`)
- `transactions.reference_number`, `transaction_type transaction_type_enum` (replaced by `source_type`)
- `sale_items.price`, `total_price` (renamed to `unit_price`, `total`)
- `sales_orders.customer_id FK customers`, `reference_number` (replaced by `pesanan_number`, `customer_name`)
- `order_status` enum (replaced by `pesanan_status`)
- `drafts` table (replaced by `draft_transactions`)
- `transaction_status_fsm` enum (replaced by simple TEXT status)
- `process_sale()` old function (replaced by `process_pos_sale()`)
- Old partial/duplicate COA INSERT blocks in `handle_new_user()` (replaced by full 31-account seed)
- `business_type` enum (not used in new schema)
- `account_balance_type` enum (merged into `normal_balance TEXT CHECK`)

---

## Implementation Order for SQL File

```
1. Extensions (uuid-ossp, pgcrypto)
2. All ENUMs (in one DO block)
3. tenants
4. profiles
5. chart_of_accounts
6. warehouses
7. raw_materials
8. products
9. product_recipes
10. product_variant_groups, product_variant_options
11. product_addon_groups, product_addons
12. journal_entries
13. journal_lines
14. customers
15. sales_orders
16. transactions
17. sale_items
18. purchase_orders, purchase_order_items
19. stock_transfers, stock_transfer_items
20. stock_opnames, stock_opname_items
21. promotions
22. receipt_scans, merchant_mappings, draft_transactions
23. event_log, processed_events, dlq_events
24. ledger_snapshots, tenant_metrics_cache, smart_alerts
25. tenant_notification_configs, tenant_balances, payout_requests
26. activity_logs, assets, bills, global_settings
27. All indexes
28. ENABLE ROW LEVEL SECURITY on all tables
29. get_auth_tenant_id(), get_auth_role() helper functions
30. All RLS policies (using helper functions, no recursive subqueries)
31. handle_new_tenant_balance() + trigger
32. handle_new_user() + trigger (with full 31-account COA seed)
33. register_staff_profile()
34. get_hpp_preview()
35. create_product_with_recipe(), update_product_with_recipe()
36. process_pos_sale()
37. void_pos_sale()
38. update_pesanan_status()
39. increment_tenant_balance(), approve_payout(), reject_payout()
40. Storage bucket inserts
41. Global settings seed
```
