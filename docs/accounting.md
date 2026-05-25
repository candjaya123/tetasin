# Tetasin — Accounting Reference

> **Document Purpose:** The canonical reference for all accounting logic in Tetasin — Chart of Accounts template, automatic journal entry templates per transaction type, custom journal rules, and standard report generation formulas.
> **Who Should Read This:** Backend engineers (AccountingModule, SalesModule), frontend engineers (Accounting pages, Transaksi tab), QA, and AI coding assistants.
> **Why It Matters:** Every financial record in Tetasin flows through double-entry journal entries. This document is the single source of truth for which accounts are used, when, and why.

---

## 1. Chart of Accounts (COA) Template

### 1.1 Seeding Rule

Every new tenant receives a **full COA seed** during onboarding. The seed runs atomically inside the same DB transaction as tenant creation (`handle_new_user()` Supabase function → `onboarding.service.ts`).

- All 31 seed accounts are `is_system = TRUE` — they **cannot be deleted**
- System accounts **can be renamed** but their `code` and `kategori` are immutable
- Custom (user-added) accounts have `is_system = FALSE` and can be deleted if no journal lines reference them

### 1.2 Canonical Seed Accounts

| Kode | Nama Akun | Saldo Normal | Kategori |
|---|---|---|---|
| **1-10000** | Kas Tangan | Debit | ASET |
| **1-10002** | Kas Bank | Debit | ASET |
| **1-10003** | E-Wallet | Debit | ASET |
| **1-10100** | Biaya Dibayar di Muka | Debit | ASET |
| **1-10300** | Piutang Usaha | Debit | ASET |
| **1-10400** | Perlengkapan | Debit | ASET |
| **1-10500** | Persediaan Bahan Baku | Debit | ASET |
| **1-10501** | Persediaan Dalam Proses (WIP) | Debit | ASET |
| **1-10502** | Persediaan Barang Jadi | Debit | ASET |
| **1-10503** | Persediaan Barang Dagang | Debit | ASET |
| **1-15000** | Peralatan | Debit | ASET |
| **1-15900** | Akumulasi Penyusutan | Kredit ⚠️ kontra-aset | ASET |
| **2-20100** | Hutang Usaha | Kredit | KEWAJIBAN |
| **2-20400** | Hutang Bank | Kredit | KEWAJIBAN |
| **2-20600** | Pendapatan Diterima di Muka | Kredit | KEWAJIBAN |
| **3-30000** | Modal | Kredit | EKUITAS |
| **3-31000** | Prive | Debit ⚠️ pengurang modal | EKUITAS |
| **4-40000** | Penjualan Produk | Kredit | PENDAPATAN |
| **4-40001** | Penjualan Jasa | Kredit | PENDAPATAN |
| **4-40900** | Pendapatan Lain-lain | Kredit | PENDAPATAN |
| **4-41000** | Diskon Penjualan | Debit ⚠️ contra-revenue | PENDAPATAN |
| **4-41001** | Retur Penjualan | Debit ⚠️ contra-revenue | PENDAPATAN |
| **5-50000** | Harga Pokok Penjualan (HPP) | Debit | HPP / BIAYA LANGSUNG |
| **6-60000** | Biaya Admin | Debit | BEBAN OPERASIONAL |
| **6-60100** | Beban Gaji Karyawan | Debit | BEBAN OPERASIONAL |
| **6-60200** | Biaya Utility (Listrik, Air, dll) | Debit | BEBAN OPERASIONAL |
| **6-60300** | Biaya Marketing | Debit | BEBAN OPERASIONAL |
| **6-60400** | Beban Sewa | Debit | BEBAN OPERASIONAL |
| **6-60500** | Beban Penyusutan | Debit | BEBAN OPERASIONAL |
| **6-60600** | Biaya Distribusi | Debit | BEBAN OPERASIONAL |
| **6-60999** | Biaya Lain-lain | Debit | BEBAN OPERASIONAL |

### 1.3 Valid Kategori Values (6 canonical values)

| Kategori | Saldo Normal Turunan | Kode Prefix |
|---|---|---|
| `ASET` | Debit (kecuali kontra-aset) | `1-xxxxx` |
| `KEWAJIBAN` | Kredit | `2-xxxxx` |
| `EKUITAS` | Kredit (kecuali Prive) | `3-xxxxx` |
| `PENDAPATAN` | Kredit (kecuali contra-revenue) | `4-xxxxx` |
| `HPP / BIAYA LANGSUNG` | Debit | `5-xxxxx` |
| `BEBAN OPERASIONAL` | Debit | `6-xxxxx` |

> ⚠️ **RULE:** These 6 values are the ONLY valid `kategori` for any account in `chart_of_accounts`. Custom accounts MUST use one of these 6 values — no others accepted. Validation enforced at `AccountingService.createAccount()`.

### 1.4 Seed SQL Block

```sql
-- Run atomically inside handle_new_user() or onboarding.service.ts
-- tenant_id is injected at runtime
INSERT INTO chart_of_accounts (tenant_id, code, name, type, kategori, normal_balance, is_system)
VALUES
  -- ASET
  (:tenant_id, '1-10000', 'Kas Tangan',                   'aset',       'ASET',                 'debit',  TRUE),
  (:tenant_id, '1-10002', 'Kas Bank',                      'aset',       'ASET',                 'debit',  TRUE),
  (:tenant_id, '1-10003', 'E-Wallet',                      'aset',       'ASET',                 'debit',  TRUE),
  (:tenant_id, '1-10100', 'Biaya Dibayar di Muka',         'aset',       'ASET',                 'debit',  TRUE),
  (:tenant_id, '1-10300', 'Piutang Usaha',                 'aset',       'ASET',                 'debit',  TRUE),
  (:tenant_id, '1-10400', 'Perlengkapan',                  'aset',       'ASET',                 'debit',  TRUE),
  (:tenant_id, '1-10500', 'Persediaan Bahan Baku',         'aset',       'ASET',                 'debit',  TRUE),
  (:tenant_id, '1-10501', 'Persediaan Dalam Proses (WIP)', 'aset',       'ASET',                 'debit',  TRUE),
  (:tenant_id, '1-10502', 'Persediaan Barang Jadi',        'aset',       'ASET',                 'debit',  TRUE),
  (:tenant_id, '1-10503', 'Persediaan Barang Dagang',      'aset',       'ASET',                 'debit',  TRUE),
  (:tenant_id, '1-15000', 'Peralatan',                     'aset',       'ASET',                 'debit',  TRUE),
  (:tenant_id, '1-15900', 'Akumulasi Penyusutan',          'aset',       'ASET',                 'credit', TRUE),
  -- KEWAJIBAN
  (:tenant_id, '2-20100', 'Hutang Usaha',                  'kewajiban',  'KEWAJIBAN',            'credit', TRUE),
  (:tenant_id, '2-20400', 'Hutang Bank',                   'kewajiban',  'KEWAJIBAN',            'credit', TRUE),
  (:tenant_id, '2-20600', 'Pendapatan Diterima di Muka',   'kewajiban',  'KEWAJIBAN',            'credit', TRUE),
  -- EKUITAS
  (:tenant_id, '3-30000', 'Modal',                         'ekuitas',    'EKUITAS',              'credit', TRUE),
  (:tenant_id, '3-31000', 'Prive',                         'ekuitas',    'EKUITAS',              'debit',  TRUE),
  -- PENDAPATAN
  (:tenant_id, '4-40000', 'Penjualan Produk',              'pendapatan', 'PENDAPATAN',           'credit', TRUE),
  (:tenant_id, '4-40001', 'Penjualan Jasa',                'pendapatan', 'PENDAPATAN',           'credit', TRUE),
  (:tenant_id, '4-40900', 'Pendapatan Lain-lain',          'pendapatan', 'PENDAPATAN',           'credit', TRUE),
  (:tenant_id, '4-41000', 'Diskon Penjualan',              'pendapatan', 'PENDAPATAN',           'debit',  TRUE),
  (:tenant_id, '4-41001', 'Retur Penjualan',               'pendapatan', 'PENDAPATAN',           'debit',  TRUE),
  -- HPP
  (:tenant_id, '5-50000', 'Harga Pokok Penjualan',         'beban',      'HPP / BIAYA LANGSUNG', 'debit',  TRUE),
  -- BEBAN OPERASIONAL
  (:tenant_id, '6-60000', 'Biaya Admin',                   'beban',      'BEBAN OPERASIONAL',    'debit',  TRUE),
  (:tenant_id, '6-60100', 'Beban Gaji Karyawan',           'beban',      'BEBAN OPERASIONAL',    'debit',  TRUE),
  (:tenant_id, '6-60200', 'Biaya Utility (Listrik, Air, dll)', 'beban',  'BEBAN OPERASIONAL',    'debit',  TRUE),
  (:tenant_id, '6-60300', 'Biaya Marketing',               'beban',      'BEBAN OPERASIONAL',    'debit',  TRUE),
  (:tenant_id, '6-60400', 'Beban Sewa',                    'beban',      'BEBAN OPERASIONAL',    'debit',  TRUE),
  (:tenant_id, '6-60500', 'Beban Penyusutan',              'beban',      'BEBAN OPERASIONAL',    'debit',  TRUE),
  (:tenant_id, '6-60600', 'Biaya Distribusi',              'beban',      'BEBAN OPERASIONAL',    'debit',  TRUE),
  (:tenant_id, '6-60999', 'Biaya Lain-lain',               'beban',      'BEBAN OPERASIONAL',    'debit',  TRUE);
```

---

## 2. Automatic Journal Templates per Transaction Type

Every financial event in Tetasin creates a `journal_entry` (header) and one or more `journal_lines` (debit/credit pairs). The table below defines which accounts are always used.

> **Invariant:** For every `journal_entry`, `Σ debit amounts = Σ credit amounts` (tolerance: < 0.01). If violated, the backend raises `JOURNAL_IMBALANCE (422)` and rolls back the entire transaction.

### 2.1 POS Sale Transactions

When a POS checkout is committed, the system creates **two journal entries** atomically:

#### Entry 1 — Revenue Recognition

| Payment Method | Debit | Kredit |
|---|---|---|
| `cash` | Kas Tangan · `1-10000` | Penjualan Produk · `4-40000` |
| `qris` | E-Wallet · `1-10003` | Penjualan Produk · `4-40000` |
| `transfer` | Kas Bank · `1-10002` | Penjualan Produk · `4-40000` |
| `card` | Kas Bank · `1-10002` | Penjualan Produk · `4-40000` |

Amount = `transaction.total_amount` (after discount)

> If the transaction contains **service items** (product_type = 'service'), use `Penjualan Jasa (4-40001)` instead of `Penjualan Produk (4-40000)`. For mixed carts, create separate credit lines per product type.

#### Entry 2 — HPP Recognition

The HPP journal entry is **always created** when `hpp_amount > 0`. The credit account depends on the **HPP mode** resolved by the HppEngine at sale time:

**Recipe Mode** (product has `product_recipes` rows):
| Debit | Credit |
|---|---|
| Harga Pokok Penjualan · `5-50000` | Persediaan Bahan Baku · `1-10500` (or `coa_account_id` of the bahan baku) |

> Also deducts `raw_materials.current_stock` by `(quantity_needed × qty_sold)` for each ingredient.

**Direct Mode** (no recipe, `product.cost_price > 0`):
| Debit | Credit |
|---|---|
| Harga Pokok Penjualan · `5-50000` | Persediaan Barang Dagang · `1-10503` (or `product.hpp_coa_id` if set) |

> No stock deduction for raw materials. `products.current_stock` is decremented instead.

**No HPP Mode** (no recipe AND `cost_price = 0`):
- No Entry 2 created. Gross Profit = Revenue (margin is assumed 100%).

> If a single cart has **both** recipe and direct-mode products, the system creates **two separate HPP credit lines** (one per `coa_account_id`) within the same `journal_entry`.

Amount = `Σ (item.hpp_per_unit × item.quantity)` across all items sharing the same credit account.

---

### 2.1b — HppEngine Calculation Logic

The `HppEngineService` runs **per sale item** before journal creation:

```
HppEngine.calculate(product_id, quantity):

  Step 1: Load product_recipes WHERE product_id = X

  Step 2: If recipes.length > 0  →  RECIPE MODE
    For each recipe line:
      bahan = raw_materials[recipe.raw_material_id]
      cost  = recipe.quantity_needed × bahan.unit_price
    hpp_per_unit    = Σ cost
    hpp_amount      = hpp_per_unit × quantity
    persediaan_coa  = bahan.coa_account_id ?? '1-10500'
    stock_deductions = [{ bahan_id, qty: recipe.quantity_needed × quantity }]
    Check: bahan.current_stock >= deduction.qty  → else RAISE INSUFFICIENT_INGREDIENT

  Step 3: Else if product.cost_price > 0  →  DIRECT MODE
    hpp_per_unit    = product.cost_price
    hpp_amount      = cost_price × quantity
    persediaan_coa  = product.hpp_coa_id ?? '1-10503'
    stock_deductions = []  (no bahan baku consumed)

  Step 4: Else  →  NO HPP
    hpp_per_unit = 0, hpp_amount = 0
    No deductions, no journal line

  Return: { mode, hpp_per_unit, hpp_amount, persediaan_coa, stock_deductions }

Snapshot to sale_items:
  hpp_mode     = result.mode
  hpp_per_unit = result.hpp_per_unit   ← frozen at sale time, not recalculated
  hpp_amount   = result.hpp_amount
```

> **Why snapshot `hpp_per_unit`?** Bahan baku `unit_price` will change when new stock is purchased at different prices. Historical sale records must preserve the HPP at the time of sale for accurate historical P&L reporting.

#### Entry 3 — Discount (only if `discount_amount > 0`)

| Debit | Kredit |
|---|---|
| Diskon Penjualan · `4-41000` | [Same payment account as Entry 1] |

Amount = `transaction.discount_amount`

> This entry is ONLY created when a discount is applied. The payment account offset ensures the cash/e-wallet balance reflects the net amount actually received.

### 2.2 POS Void / Sales Return

When a committed transaction is voided, **full reversal journal entries** are created:

| Debit | Kredit |
|---|---|
| Penjualan Produk · `4-40000` | [Original payment account] |
| Persediaan Bahan Baku · `1-10500` | Harga Pokok Penjualan · `5-50000` |

> Voided journals have `reference_type = 'void'` and `reference_id` pointing to the original `transaction_id`. The original journal entry is NOT deleted — it is marked `status = 'voided'`.

### 2.3 Inventory / Procurement Transactions

| Event | Debit | Kredit |
|---|---|---|
| Stock Purchase — Cash | Persediaan Bahan Baku · `1-10500` | Kas Tangan · `1-10000` |
| Stock Purchase — Transfer | Persediaan Bahan Baku · `1-10500` | Kas Bank · `1-10002` |
| Stock Purchase — Credit (PO) | Persediaan Bahan Baku · `1-10500` | Hutang Usaha · `2-20100` |
| Bahan Baku Opening Stock | Persediaan Bahan Baku · `1-10500` | Modal · `3-30000` |
| Pay Hutang Usaha | Hutang Usaha · `2-20100` | Kas Tangan / Kas Bank |
| Stock Opname Gain (variance > 0) | Persediaan Bahan Baku · `1-10500` | Pendapatan Lain-lain · `4-40900` |
| Stock Opname Loss (variance < 0) | Biaya Lain-lain · `6-60999` | Persediaan Bahan Baku · `1-10500` |
| Stock Transfer (warehouse to warehouse) | Persediaan Bahan Baku · `1-10500` (dest) | Persediaan Bahan Baku · `1-10500` (src) |

> Stock transfer is an asset-to-asset transfer — no P&L impact.

### 2.4 Expense Transactions

| Expense Type | Debit | Kredit |
|---|---|---|
| Salary (Gaji Karyawan) | Beban Gaji Karyawan · `6-60100` | Kas Tangan / Kas Bank |
| Rent (Sewa) | Beban Sewa · `6-60400` | Kas Tangan / Kas Bank |
| Utility (Listrik, Air) | Biaya Utility · `6-60200` | Kas Tangan / Kas Bank |
| Marketing | Biaya Marketing · `6-60300` | Kas Tangan / Kas Bank |
| Admin | Biaya Admin · `6-60000` | Kas Tangan / Kas Bank |
| Distribution | Biaya Distribusi · `6-60600` | Kas Tangan / Kas Bank |
| General Expense | Biaya Lain-lain · `6-60999` | Kas Tangan / Kas Bank |

### 2.5 Bill Tracker Journal Templates

> Bill Tracker is available for **both** `account_type = 'personal'` and `account_type = 'business'`. The same `bills` table and journal templates apply. COA accounts differ by account_type (personal uses simplified accounts).

#### Hutang (Bills Payable — you owe money)

| Event | Debit | Credit | `reference_type` |
|---|---|---|---|
| Record new bill/debt (Business) | Beban Lain-lain · `6-60999` (or specific BEBAN) | Hutang Usaha · `2-20100` | `bill_created` |
| Record new bill/debt (Personal) | Pengeluaran Lain-lain · `6-60999` | Hutang/Cicilan · `2-20100` | `bill_created` |
| Pay a bill — cash (Business) | Hutang Usaha · `2-20100` | Kas Tangan · `1-10000` | `bill_paid` |
| Pay a bill — transfer (Business) | Hutang Usaha · `2-20100` | Kas Bank · `1-10002` | `bill_paid` |
| Pay a bill (Personal) | Hutang/Cicilan · `2-20100` | ASET (user-selected) | `bill_paid` |

#### Piutang (Bills Receivable — someone owes you)

| Event | Debit | Credit | `reference_type` |
|---|---|---|---|
| Record new receivable (Business) | Piutang Usaha · `1-10300` | Pendapatan Lain-lain · `4-40900` | `bill_created` |
| Record new receivable (Personal) | Dompet/Rekening Bank (ASET) | Pendapatan Lain-lain · `4-40900` | `bill_created` |
| Receive payment (Business) | Kas Tangan / Kas Bank | Piutang Usaha · `1-10300` | `bill_paid` |
| Receive payment (Personal) | ASET (user-selected cash/bank) | Pendapatan Lain-lain · `4-40900` | `bill_paid` |

> **Auto-journal on payment:** When `bills.status` is updated to `'paid'` via `PATCH /bills/:id/pay`, the backend atomically creates the appropriate journal entry. The `coa_account_id` stored on the bill determines which ledger account to credit/debit.

### 2.5 Asset & Equity Transactions

| Event | Debit | Kredit |
|---|---|---|
| Asset Purchase — Cash | Peralatan · `1-15000` | Kas Tangan / Kas Bank |
| Asset Purchase — Credit | Peralatan · `1-15000` | Hutang Usaha · `2-20100` |
| Monthly Depreciation | Beban Penyusutan · `6-60500` | Akumulasi Penyusutan · `1-15900` |
| Owner Capital Injection | Kas Tangan / Kas Bank | Modal · `3-30000` |
| Owner Withdrawal (Prive) | Prive · `3-31000` | Kas Tangan / Kas Bank |

### 2.6 Receipt OCR Approvals

When a draft transaction created from OCR is approved by the user, the `debit_account_id` and `credit_account_id` are user-selected from the COA. The system creates:

- `journal_entry` with `reference_type = 'receipt_ocr'`, `reference_id = draft.id`
- `journal_lines` exactly matching user's selected accounts
- Validates balance before posting

---

## 3. Custom Journal Entry Rules

Users with role `manager` can create manual journal entries via `/api/v1/accounting/journal-entries`.

### 3.1 Rules

1. **Account must exist** — Every `journal_line.account_id` must reference an account in `chart_of_accounts` for the tenant. `MISSING_ACCOUNT_MAPPING (422)` is raised otherwise.
2. **Kategori must be valid** — When creating a **new custom account**, the `kategori` field must be one of the 6 canonical values. `INVALID_ACCOUNT_KATEGORI (400)` is raised otherwise.
3. **Must balance** — `|Σ debit lines − Σ credit lines| < 0.01`. If not, `JOURNAL_IMBALANCE (422)`.
4. **Draft → Posted → Voided lifecycle** — New manual journals start as `draft`. User explicitly posts them. A posted journal can be voided (creates reversal entry), but cannot be edited.
5. **Audit trail** — `created_by UUID REFERENCES profiles(id)` is always recorded.
6. **Reference type** — Manual entries always have `reference_type = 'manual'`.

### 3.2 Normal Balance Direction for Custom Accounts

Custom accounts inherit their expected normal balance from their `kategori`:

| Kategori | Normal Balance | Increases On | Decreases On |
|---|---|---|---|
| `ASET` | Debit | Debit | Credit |
| `KEWAJIBAN` | Credit | Credit | Debit |
| `EKUITAS` | Credit | Credit | Debit |
| `PENDAPATAN` | Credit | Credit | Debit |
| `HPP / BIAYA LANGSUNG` | Debit | Debit | Credit |
| `BEBAN OPERASIONAL` | Debit | Debit | Credit |

> UI should warn (not block) when a user enters a journal line that goes against the normal balance direction — e.g., crediting a `BEBAN OPERASIONAL` account is unusual but valid in reversal scenarios.

---

## 4. Transaksi — Universal Financial Event Log

The **Transaksi** screen in both the web dashboard and mobile app is a **unified read-only log** of every financial event in the system.

### 4.1 Source Types

Every record in `transactions` carries a `source_type` field that identifies its origin:

| `source_type` | Origin | Creates Journal? |
|---|---|---|
| `pos_sale` | POS checkout by Kasir | ✅ Always |
| `pos_void` | POS transaction voided | ✅ Reversal |
| `expense` | Manual expense entry | ✅ Always |
| `receipt_ocr` | Receipt OCR draft approved | ✅ On approval |
| `po_fulfillment` | Purchase Order fulfilled | ✅ Always |
| `stock_adjustment` | Stock opname / manual adjustment | ✅ Always |
| `manual` | Manual journal entry (no transaction record) | ✅ Journal only |

> Note: `manual` journal entries appear in the **journal ledger** (GET /accounting/journal-entries) but NOT in the transactions list, since they don't have a corresponding `transactions` table row.

### 4.2 What Each Transaksi Row Displays

```
┌─────────────────────────────────────────────────────────┐
│  [badge: POS Sale]   Pesanan #ORD-2026-00041            │
│  17 Mei 2026 · 14:32                                    │
│  Kasir: Budi                                            │
│  Payment: Cash                        Rp 87,500         │
│  Journal ID: je_xxxx  [▼ lihat jurnal]                  │
└─────────────────────────────────────────────────────────┘

Expanded journal lines:
  DEBIT  Kas Tangan (1-10000)            Rp 87,500
  CREDIT Penjualan Produk (4-40000)      Rp 87,500
  ---
  DEBIT  Harga Pokok Penjualan (5-50000) Rp 42,000
  CREDIT Persediaan Bahan Baku (1-10500) Rp 42,000
```

---

## 5. Standard Report Generation Logic

All financial reports in Tetasin use the following standard accountancy formulas. Reports only include journal entries with `status = 'posted'`.

### 5.1 Trial Balance (Neraca Saldo)

```
For each account in chart_of_accounts (tenant):
  total_debit  = Σ journal_lines WHERE type = 'debit'  AND account_id = X
  total_credit = Σ journal_lines WHERE type = 'credit' AND account_id = X

Grand total:
  Σ all debit columns = Σ all credit columns  ← MUST equal (double-entry invariant)
```

### 5.2 Income Statement (Laporan Laba Rugi)

```
Revenue (Pendapatan):
  = Σ PENDAPATAN accounts (credit normal) credit balance
  − Σ contra-revenue accounts (4-41000 Diskon, 4-41001 Retur) debit balance
  = Net Revenue

Gross Profit:
  = Net Revenue − Σ HPP / BIAYA LANGSUNG accounts (5-xxxxx) debit balance

Operating Expenses:
  = Σ BEBAN OPERASIONAL accounts (6-xxxxx) debit balance

Net Profit / Loss:
  = Gross Profit − Operating Expenses
  (Positive = Profit · Negative = Loss)
```

### 5.3 Balance Sheet (Neraca)

```
ASSETS (Aset):
  = Σ ASET debit balances − Akumulasi Penyusutan (1-15900) credit balance
  = Net Assets

LIABILITIES (Kewajiban):
  = Σ KEWAJIBAN accounts credit balance

EQUITY (Ekuitas):
  = Σ EKUITAS accounts credit balance − Prive (3-31000) debit balance
  + Net Profit from current period (closed to Retained Earnings)

VERIFICATION (must hold):
  Net Assets = Total Liabilities + Total Equity
```

> If `Net Assets ≠ Liabilities + Equity`, the system must surface a `BALANCE_SHEET_IMBALANCE` warning and prevent report export until the discrepancy is investigated.

### 5.4 Cash Flow (Arus Kas)

```
Cash Accounts:
  Kas Tangan (1-10000) + Kas Bank (1-10002) + E-Wallet (1-10003)

Opening Balance:
  = Σ debit lines − Σ credit lines on cash accounts up to period_start

Cash Inflows (Penerimaan):
  = Σ debit postings to cash accounts during period

Cash Outflows (Pengeluaran):
  = Σ credit postings to cash accounts during period

Closing Balance:
  = Opening Balance + Cash Inflows − Cash Outflows
```

> Cash flow is derived directly from `journal_lines` — no separate cash flow table needed.

### 5.5 Ledger per Account (Buku Besar)

```
For a selected account:
  date | description | debit | credit | running_balance

running_balance:
  If normal_balance = 'debit':  balance += debit − credit
  If normal_balance = 'credit': balance += credit − debit
  (balance starts from 0 for new tenants)
```

### 5.6 Sign Convention for Reports

| Kategori | Report Display | In DB |
|---|---|---|
| ASET | Positive (debit increases) | Debit lines add, Credit lines subtract |
| KEWAJIBAN | Positive (credit increases) | Credit lines add, Debit lines subtract |
| EKUITAS | Positive (credit increases) | Credit lines add, Debit lines subtract |
| PENDAPATAN | Positive (credit increases) | Credit lines add, Debit lines subtract |
| HPP | Positive (debit increases) | Debit lines add, Credit lines subtract |
| BEBAN OPERASIONAL | Positive (debit increases) | Debit lines add, Credit lines subtract |

> Reports NEVER show negative balances for well-managed accounts. A negative balance on a debit-normal account (e.g., negative Kas Tangan) indicates a data error or overdraft — the UI should highlight this in red.

---

## 6. Personal Account Accounting

> This section applies **only** to `account_type = 'personal'` tenants. All personal journals use the same `journal_entries` + `journal_lines` tables and the same double-entry invariant (`|Σdebit − Σcredit| < 0.01`).

### 6.1 Personal COA Seed (12 Accounts)

When `account_type = 'personal'`, `handle_new_user()` seeds these 12 accounts **instead of** the 31-account business seed. Both sets are mutually exclusive — a tenant receives exactly one seed.

```sql
-- Run atomically inside handle_new_user() when account_type = 'personal'
INSERT INTO chart_of_accounts (tenant_id, code, name, type, kategori, normal_balance, is_system)
VALUES
  -- ASET
  (:tid, '1-10000', 'Dompet / Kas Tunai',      'aset',      'ASET',               'debit',  TRUE),
  (:tid, '1-10002', 'Rekening Bank',            'aset',      'ASET',               'debit',  TRUE),
  (:tid, '1-10003', 'E-Wallet',                 'aset',      'ASET',               'debit',  TRUE),
  (:tid, '1-10100', 'Dana Darurat',             'aset',      'ASET',               'debit',  TRUE),
  (:tid, '1-10200', 'Tabungan & Investasi',     'aset',      'ASET',               'debit',  TRUE),
  -- KEWAJIBAN
  (:tid, '2-20100', 'Hutang / Cicilan',         'kewajiban', 'KEWAJIBAN',          'credit', TRUE),
  -- EKUITAS
  (:tid, '3-30000', 'Kekayaan Bersih (Modal)', 'ekuitas',   'EKUITAS',            'credit', TRUE),
  -- PENDAPATAN
  (:tid, '4-40000', 'Gaji / Pendapatan Tetap', 'pendapatan','PENDAPATAN',         'credit', TRUE),
  (:tid, '4-40900', 'Pendapatan Lain-lain',    'pendapatan','PENDAPATAN',         'credit', TRUE),
  -- BEBAN OPERASIONAL
  (:tid, '6-60000', 'Kebutuhan Pokok',         'beban',     'BEBAN OPERASIONAL',  'debit',  TRUE),
  (:tid, '6-60100', 'Tagihan & Utilitas',      'beban',     'BEBAN OPERASIONAL',  'debit',  TRUE),
  (:tid, '6-60999', 'Pengeluaran Lain-lain',   'beban',     'BEBAN OPERASIONAL',  'debit',  TRUE);
```

> - All 12 are `is_system = TRUE` — code is immutable, name can be renamed
> - **No `HPP / BIAYA LANGSUNG`** accounts — personal accounts never compute product cost
> - User may add custom accounts (`is_system = FALSE`) using the same 6 canonical `kategori` values

---

### 6.2 Personal Journal Templates

| Event | Debit Account | Credit Account | `reference_type` |
|---|---|---|---|
| Receive salary / income | ASET (user-selected cash/bank) | `4-40000` Gaji / Pendapatan Tetap | `personal_income` |
| Receive other income | ASET (user-selected) | `4-40900` Pendapatan Lain-lain | `personal_income` |
| Record expense | BEBAN (user-selected category) | ASET (user-selected payment source) | `personal_expense` |
| Transfer to savings | `1-10200` Tabungan & Investasi | `1-10002` Rekening Bank | `personal_transfer` |
| Build emergency fund | `1-10100` Dana Darurat | `1-10002` Rekening Bank | `personal_transfer` |
| Repay loan / cicilan | `2-20100` Hutang / Cicilan | ASET (user-selected) | `personal_expense` |
| Take new loan | ASET (user-selected) | `2-20100` Hutang / Cicilan | `personal_income` |
| Goal progress deposit | `goal.linked_account_id` (ASET) | ASET (user-selected source) | `personal_goal` |
| Recurring auto-entry | `recurring.debit_account_id` | `recurring.credit_account_id` | `personal_recurring` |
| Manual journal | User-defined | User-defined | `manual` |

> **Invariant:** For every personal journal, `Σ debit amounts = Σ credit amounts` (tolerance < 0.01). Violation raises `JOURNAL_IMBALANCE (422)` and rolls back.

---

### 6.3 Personal Finance Reports

Personal users see adapted report names and formulas in the Finance section.

#### Ringkasan Bulanan (Monthly Summary)
```
Pemasukan  = Σ credit lines on PENDAPATAN accounts (4-xxxxx) for the period
Pengeluaran = Σ debit lines on BEBAN OPERASIONAL accounts (6-xxxxx) for the period
Selisih    = Pemasukan − Pengeluaran
  Positive → surplus (saved money)
  Negative → deficit (spent more than earned)
```

#### Kekayaan Bersih (Net Worth)
```
Total Aset    = Σ running debit balances on ASET accounts (1-xxxxx)
Total Hutang  = Σ running credit balances on KEWAJIBAN accounts (2-xxxxx)
Kekayaan Bersih = Total Aset − Total Hutang
```
> Displayed as the primary KPI on the personal dashboard. Updated in real-time after every journal commit.

#### Anggaran vs. Aktual (Budget vs. Actual)
```
For each personal_budgets row in month M:
  actual_spent = Σ debit lines on account_id in period M
  remaining    = budget_amount − actual_spent
  pct_used     = (actual_spent / budget_amount) × 100

  Status:
    pct_used < 80   → 'on_track'    (green)
    80 ≤ pct_used < 100 → 'warning' (yellow, BUDGET_WARNING)
    pct_used ≥ 100  → 'over_budget' (red, BUDGET_EXCEEDED)
```

#### Progres Target Keuangan (Goal Progress)
```
pct_achieved       = (current_amount / target_amount) × 100
days_remaining     = target_date − today
monthly_needed     = (target_amount − current_amount) / months_remaining
  → shown as "Perlu menabung Rp X/bulan untuk mencapai target"
status transitions:
  'active' → 'achieved' when current_amount >= target_amount
  'active' → 'cancelled' on user request
```

#### Arus Kas (Cash Flow) — Same formula as business
```
Cash accounts for personal: 1-10000, 1-10002, 1-10003
Opening Balance = Σ(debit − credit) on cash accounts up to period_start
Cash Inflows    = Σ debit postings to cash accounts during period
Cash Outflows   = Σ credit postings to cash accounts during period
Closing Balance = Opening + Inflows − Outflows
```
