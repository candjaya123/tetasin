# Tetasin — API Contract

> **Document Purpose:** Defines backend/frontend communication standards — endpoint structure, request/response format, authentication, pagination, filtering, error standards, and versioning.
> **Who Should Read This:** All frontend and backend engineers, QA, and AI coding assistants.

---

## 1. Base URL

```
Production:  https://api.tetasin.com/api/v1
Staging:     https://staging-api.tetasin.com/api/v1
Local Dev:   http://localhost:3001/api/v1
```

---

## 2. Authentication

All authenticated endpoints require:

```http
Authorization: Bearer <supabase_jwt_token>
Content-Type: application/json
X-Trace-Id: <uuid>
```

Public endpoints are explicitly decorated with `@Public()` and require no token.

---

## 3. Standard Response Envelope

**Success:**
```json
{
  "success": true,
  "data": { },
  "meta": { "page": 1, "per_page": 20, "total": 150 },
  "timestamp": "2026-05-11T08:00:00Z"
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "Insufficient stock for product: Kopi Susu",
    "details": { "product_id": "uuid", "required": 5, "available": 2 }
  },
  "trace_id": "abc123"
}
```

All responses — success and error — are wrapped in this envelope. No endpoint returns a raw array or raw object.

---

## 4. HTTP Status Codes

| Status | When |
|---|---|
| `200 OK` | GET, successful PUT/PATCH |
| `201 Created` | POST that creates a resource |
| `204 No Content` | DELETE |
| `400 Bad Request` | Validation error |
| `401 Unauthorized` | Missing or invalid JWT |
| `403 Forbidden` | Wrong tier or role |
| `404 Not Found` | Non-existent resource |
| `409 Conflict` | Idempotency key reused |
| `422 Unprocessable Entity` | Business logic failure (insufficient stock, unbalanced journal) |
| `429 Too Many Requests` | Rate limit exceeded |
| `500 Internal Server Error` | Unhandled exception only |

---

## 5. Pagination

```
GET /api/v1/transactions?page=1&per_page=20&sort=created_at&order=desc
```

| Param | Default | Max |
|---|---|---|
| `page` | `1` | — |
| `per_page` | `20` | `100` |
| `sort` | `created_at` | — |
| `order` | `desc` | — |

---

## 6. Core Endpoints

### 6.1 Sales / POS

```
POST   /api/v1/sales                → Create sale (idempotent) — creates pesanan + transaction atomically
GET    /api/v1/sales                → List sales
GET    /api/v1/sales/:id            → Get single sale with journal lines
PATCH  /api/v1/sales/:id/void       → Void a sale → triggers reversal journal
```

**POST /api/v1/sales — Request:**
```json
{
  "items": [{ "product_id": "uuid", "quantity": 2, "unit_price": 15000 }],
  "payment_method": "cash",
  "discount_amount": 0,
  "customer_name": "Walk-in",
  "idempotency_key": "session-uuid-timestamp"
}
```

**POST /api/v1/sales — Response (201):**
```json
{
  "success": true,
  "data": {
    "transaction_id": "uuid",
    "pesanan_id": "uuid",
    "pesanan_number": "ORD-2026-00041",
    "journal_id": "uuid",
    "total_amount": 30000,
    "status": "committed"
  }
}
```

### 6.2 Inventory

```
# Products
GET    /api/v1/inventory/products
POST   /api/v1/inventory/products
GET    /api/v1/inventory/products/:id
PUT    /api/v1/inventory/products/:id
DELETE /api/v1/inventory/products/:id

# Bahan Baku (Raw Materials) — managed in Stok tab
GET    /api/v1/inventory/raw-materials              → List with stock + unit_price
POST   /api/v1/inventory/raw-materials              → Create bahan baku (opening stock creates journal)
GET    /api/v1/inventory/raw-materials/:id          → Detail + recipe usages
PATCH  /api/v1/inventory/raw-materials/:id          → Update name, unit_price, reorder_point
DELETE /api/v1/inventory/raw-materials/:id          → Blocked if used in any recipe (RAW_MATERIAL_IN_USE)

# Product Recipes (BOM per product)
GET    /api/v1/inventory/products/:id/recipes       → List recipe ingredients
POST   /api/v1/inventory/products/:id/recipes       → Add ingredient
PATCH  /api/v1/inventory/products/:id/recipes/:rid  → Update quantity_needed
DELETE /api/v1/inventory/products/:id/recipes/:rid  → Remove ingredient
GET    /api/v1/inventory/products/:id/hpp-preview   → Live HPP calculation from current recipe

# Stock
POST   /api/v1/inventory/stock-adjustment
```

**POST /api/v1/inventory/raw-materials — Request:**
```json
{
  "name": "Susu UHT Full Cream",
  "unit": "ml",
  "unit_price": 15.00,
  "current_stock": 10000,
  "reorder_point": 2000,
  "coa_account_id": "uuid-of-1-10500"
}
```

**POST /api/v1/inventory/products/:id/recipes — Request:**
```json
{
  "raw_material_id": "uuid-of-susu-uht",
  "quantity_needed": 200
}
```

**GET /api/v1/inventory/products/:id/hpp-preview — Response:**
```json
{
  "success": true,
  "data": {
    "product_name": "Es Kopi Susu",
    "hpp_mode": "recipe",
    "hpp_per_unit": 4900.00,
    "selling_price": 25000.00,
    "gross_margin_pct": 80.4,
    "ingredients": [
      { "name": "Susu UHT Full Cream", "quantity_needed": 200, "unit": "ml",   "unit_price": 15.00, "cost": 3000.00 },
      { "name": "Espresso Shot",       "quantity_needed": 30,  "unit": "ml",   "unit_price": 50.00, "cost": 1500.00 },
      { "name": "Gula Aren",           "quantity_needed": 20,  "unit": "gram", "unit_price": 20.00, "cost":  400.00 }
    ]
  }
}
```

### 6.2b Pesanan (Orders)

```
GET    /api/v1/orders                        → List pesanan (filterable by status, source)
POST   /api/v1/orders                        → Create pesanan manually (B2B / manual)
GET    /api/v1/orders/:id                    → Get pesanan detail + division_notes + linked transaction
PATCH  /api/v1/orders/:id/status             → Update pesanan status (role-gated)
PATCH  /api/v1/orders/:id/void               → Void pesanan → auto-creates reversal journal (manager only)
```

**PATCH /api/v1/orders/:id/status — Request:**
```json
{ "status": "processing", "division_note": "Sedang disiapkan di gudang" }
```

**Valid status transitions per role:**
```
kasir  : draft → confirmed, fulfilled → paid, any → cancelled
stok   : confirmed → processing → ready
dapur  : confirmed → processing → ready  (FnB industry)
manager: any transition + voided
```

### 6.2c Transaksi (Universal Financial Log)

```
GET    /api/v1/transactions                  → List ALL transactions across all source_types
GET    /api/v1/transactions/:id              → Get transaction detail + pesanan + journal + journal_lines
```

**GET /api/v1/transactions — Query params:**
```
?source_type=pos_sale        → filter by source_type
?from=2026-05-01             → date range start
?to=2026-05-31               → date range end
?page=1&per_page=20
?sort=transaction_date&order=desc
```

**GET /api/v1/transactions/:id — Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "source_type": "pos_sale",
    "transaction_date": "2026-05-17T14:32:00Z",
    "total_amount": 87500,
    "payment_method": "cash",
    "status": "committed",
    "pesanan": {
      "id": "uuid",
      "pesanan_number": "ORD-2026-00041",
      "status": "paid",
      "customer_name": "Walk-in"
    },
    "journal": {
      "id": "uuid",
      "description": "POS Sale ORD-2026-00041",
      "lines": [
        { "type": "debit",  "account_code": "1-10000", "account_name": "Kas Tangan",              "amount": 87500 },
        { "type": "credit", "account_code": "4-40000", "account_name": "Penjualan Produk",        "amount": 87500 },
        { "type": "debit",  "account_code": "5-50000", "account_name": "Harga Pokok Penjualan",  "amount": 42000 },
        { "type": "credit", "account_code": "1-10500", "account_name": "Persediaan Bahan Baku",  "amount": 42000 }
      ]
    }
  }
}
```

### 6.3 Finance & Accounting

```
GET    /api/v1/accounting/journal-entries           → List posted journal entries
POST   /api/v1/accounting/journal-entries           → Create manual journal entry
GET    /api/v1/accounting/journal-entries/:id       → Get entry + all lines + account names
GET    /api/v1/accounting/coa                       → List tenant's Chart of Accounts
POST   /api/v1/accounting/coa                       → Create custom account (kategori required)
GET    /api/v1/accounting/coa/templates             → Return the 31 seed accounts from akun.csv
GET    /api/v1/finance/ledger
GET    /api/v1/finance/trial-balance
GET    /api/v1/finance/income-statement
GET    /api/v1/finance/balance-sheet                ← Pro tier only
GET    /api/v1/finance/cash-flow
```

**POST /api/v1/accounting/coa — Request (custom account):**
```json
{
  "code": "6-60700",
  "name": "Biaya Pengiriman Marketplace",
  "kategori": "BEBAN OPERASIONAL"
}
```
> `kategori` MUST be one of: `ASET`, `KEWAJIBAN`, `EKUITAS`, `PENDAPATAN`, `HPP / BIAYA LANGSUNG`, `BEBAN OPERASIONAL`

**POST /api/v1/accounting/journal-entries — Request (manual):**
```json
{
  "description": "Pembayaran sewa bulan Mei 2026",
  "lines": [
    { "account_id": "uuid-of-6-60400", "type": "debit",  "amount": 5000000 },
    { "account_id": "uuid-of-1-10000", "type": "credit", "amount": 5000000 }
  ]
}
```
> Validation: `|Σ debit − Σ credit| < 0.01` — raises `JOURNAL_IMBALANCE` if violated

### 6.4 AI

```
POST   /api/v1/ai/chat               ← Business tier+
GET    /api/v1/ai/insights
```

**POST /api/v1/ai/chat:**
```json
// Request
{ "prompt": "Bagaimana kondisi keuangan bulan ini?" }

// Response
{
  "success": true,
  "data": { "response": "Omset bulan ini Rp 15.2 juta..." }
}
```

### 6.5 Receipt OCR (ADR-007)

```
POST   /api/v1/receipt/scan                   ← Upload image, returns scan_id (Business+)
GET    /api/v1/receipt/scan/:id               ← Poll scan status + result
POST   /api/v1/receipt/drafts                 ← Create manual draft (no receipt)
GET    /api/v1/receipt/drafts                 ← List draft transactions
GET    /api/v1/receipt/drafts/:id             ← Get single draft with AI recommendations
PATCH  /api/v1/receipt/drafts/:id             ← Edit draft fields
POST   /api/v1/receipt/drafts/:id/approve     ← Approve → create real transaction + journal
POST   /api/v1/receipt/drafts/:id/reject      ← Reject draft
GET    /api/v1/receipt/merchants              ← List learned merchant mappings
```

### 6.6 Procurement

```
GET    /api/v1/procurement/purchase-orders
POST   /api/v1/procurement/purchase-orders
PATCH  /api/v1/procurement/purchase-orders/:id/approve
PATCH  /api/v1/procurement/purchase-orders/:id/fulfill
GET    /api/v1/procurement/drafts
GET    /api/v1/procurement/sales-orders
```

### 6.7 Other Modules

```
GET    /api/v1/promo
POST   /api/v1/promo
POST   /api/v1/promo/apply
GET    /api/v1/report/dashboard
GET    /api/v1/report/sales
GET    /api/v1/business-profile
GET    /api/v1/business-profile/staff
POST   /api/v1/business-profile/staff
POST   /api/v1/withdrawal/request
GET    /api/v1/withdrawal/balance
GET    /api/v1/health                         ← Public, no auth
```

---

## 7. Tier Rejection Response

```json
{
  "success": false,
  "error": {
    "code": "TIER_RESTRICTION",
    "message": "This feature requires Pro tier or higher",
    "required_tier": "pro",
    "current_tier": "free",
    "upgrade_url": "/subscription/upgrade"
  }
}
```

---

## 8. Idempotency

```http
POST /api/v1/sales
Idempotency-Key: <client-generated-uuid>
```

Implemented on `/api/v1/sales` and `/api/v1/journal` via `IdempotencyMiddleware`. 24-hour TTL. Returns `409 Conflict` on duplicate key with original response body.

---

## 9. Rate Limiting

| Endpoint Group | Limit |
|---|---|
| `POST /api/v1/receipt/scan` | 60 requests/hour per tenant |
| `POST /api/v1/ai/chat` | 60 requests/hour per tenant |
| `POST /api/v1/sales` | 300 requests/minute per tenant |
| `GET /api/v1/finance/*` | 30 requests/minute per tenant |
| All other | 300 requests/minute |

---

## 10. Error Codes Reference

| Code | HTTP | Description |
|---|---|---|
| `UNAUTHORIZED` | 401 | Invalid or expired JWT |
| `TIER_RESTRICTION` | 403 | Feature not available at current subscription tier |
| `ROLE_RESTRICTION` | 403 | User role insufficient |
| `INSUFFICIENT_STOCK` | 422 | Not enough product inventory |
| `INSUFFICIENT_INGREDIENT` | 422 | Not enough bahan baku stock to fulfill sale |
| `HPP_CALCULATION_FAILED` | 422 | HppEngine could not compute — missing unit_price on bahan baku |
| `RAW_MATERIAL_IN_USE` | 409 | Cannot delete bahan baku — referenced by active product recipe |
| `JOURNAL_IMBALANCE` | 422 | Debits ≠ Credits — transaction rolled back |
| `DUPLICATE_REQUEST` | 409 | Idempotency key already used |
| `TRANSACTION_LIMIT` | 422 | Monthly transaction limit reached (Free tier: 100/month) |
| `VALIDATION_ERROR` | 400 | DTO validation failed |
| `NOT_FOUND` | 404 | Resource does not exist |
| `AI_RATE_LIMIT` | 429 | Gemini API rate limit hit |
| `OCR_FAILED` | 422 | Receipt image could not be processed |
| `DRAFT_ALREADY_APPROVED` | 409 | Draft is already in approved state |
| `MISSING_ACCOUNT_MAPPING` | 422 | Journal line references non-existent COA account |
| `INVALID_ACCOUNT_KATEGORI` | 400 | Custom COA account uses unrecognized kategori value |
| `PESANAN_ALREADY_FULFILLED` | 409 | Cannot modify a fulfilled pesanan |
| `PESANAN_VOID_FAILED` | 422 | Void failed — reversal journal could not be created |
| `BALANCE_SHEET_IMBALANCE` | 500 | Assets ≠ Liabilities + Equity — data integrity error |
| `INTERNAL_ERROR` | 500 | Unhandled server error |
| `PERSONAL_ACCOUNT_ONLY` | 403 | Endpoint requires `account_type = 'personal'` |
| `BUSINESS_ACCOUNT_ONLY` | 403 | Endpoint requires `account_type = 'business'` |
| `ACCOUNT_TYPE_IMMUTABLE` | 409 | Attempt to change `account_type` after registration rejected |
| `ACCOUNT_TYPE_TIER_MISMATCH` | 403 | Tier not valid for this account_type (e.g. `premium` on business) |
| `BUDGET_EXCEEDED` | 200+warn | Expense exceeds monthly budget — non-blocking warning in response body |
| `BUDGET_WARNING` | 200+warn | Expense reaches 80% of budget — non-blocking warning in response body |
| `GOAL_ALREADY_ACHIEVED` | 409 | Cannot add progress to a goal already in `achieved` status |
| `RECURRING_PREMIUM_REQUIRED` | 403 | Recurring transactions require `premium` tier |
| `TIER_LIMIT_EXCEEDED` | 403 | Free-tier personal limit reached (goals, budget categories) |
| `BILL_ALREADY_SETTLED` | 409 | Cannot modify a bill that is already `paid` or `cancelled` |
| `OVERPAYMENT_ERROR` | 422 | Payment amount exceeds remaining bill balance |
| `PREMIUM_FEATURE_REQUIRED` | 403 | Feature requires `premium` (personal) or `pro` (business) tier |

---

## 11. Personal Finance API

```
Base: /api/v1/personal
Guards applied at module level: JwtAuthGuard → AccountTypeGuard('personal') → TierGuard

── Income & Expense ──
POST   /income             Record income entry (creates journal_entry + journal_lines)
POST   /expense            Record expense entry (creates journal_entry + journal_lines)
POST   /transfer           Transfer between personal ASET accounts

── Summary ──
GET    /summary?month=&year=   Monthly pemasukan / pengeluaran / selisih
GET    /net-worth               Current total aset − total hutang snapshot

── Budgets ──
GET    /budgets?month=&year=    List budgets with actual vs. planned per category
POST   /budgets                 Upsert budget (tenant + account + month + year)

── Goals ──
GET    /goals                   List all financial_goals with progress %
POST   /goals                   Create goal
GET    /goals/:id               Goal detail + progress history
PATCH  /goals/:id/progress      Add setoran (creates journal entry, updates current_amount)
PATCH  /goals/:id/cancel        Cancel an active goal

── Recurring [premium only] ──
GET    /recurring                List recurring_transactions
POST   /recurring                Create recurring transaction
PATCH  /recurring/:id            Update recurring config
PATCH  /recurring/:id/trigger    Manually trigger — creates journal, updates next_due_date
DELETE /recurring/:id            Soft-deactivate (is_active = false)
```

### Request / Response Examples

#### POST /personal/income
```json
// Request
{
  "amount": 5000000,
  "income_account_id": "uuid-of-4-40000",
  "destination_account_id": "uuid-of-1-10002",
  "date": "2026-05-18",
  "notes": "Gaji bulan Mei"
}

// Response 201
{
  "success": true,
  "data": {
    "journal_id": "uuid",
    "new_balance": 5000000
  }
}
```

#### POST /personal/expense (with budget warning)
```json
// Response 201 (non-blocking budget warning)
{
  "success": true,
  "data": {
    "journal_id": "uuid"
  },
  "warnings": [
    {
      "code": "BUDGET_EXCEEDED",
      "message": "Pengeluaran melebihi anggaran Kebutuhan Pokok bulan ini (115%)",
      "account_id": "uuid-of-6-60000",
      "pct_used": 115
    }
  ]
}
```

#### GET /personal/summary?month=5&year=2026
```json
{
  "success": true,
  "data": {
    "month": 5, "year": 2026,
    "pemasukan": 5000000,
    "pengeluaran": 3200000,
    "selisih": 1800000,
    "net_worth": 12500000,
    "budget_status": [
      { "account_id": "uuid", "name": "Kebutuhan Pokok",
        "budget": 2000000, "actual": 1800000, "pct_used": 90, "status": "warning" }
    ]
  }
}
```

---

## 12. Bill Tracker API

```
Base: /api/v1/bills
Guards: JwtAuthGuard → TierGuard
Available for BOTH account_type = 'personal' AND 'business'

── Bills CRUD ──
GET    /bills                    List bills (filterable by: status, bill_type, due_date range)
POST   /bills                    Create a new bill
GET    /bills/:id                Get bill detail + payment history
PATCH  /bills/:id                Update bill (title, due_date, reminder_days, contact)
DELETE /bills/:id                Soft-delete / cancel bill

── Payments ──
POST   /bills/:id/pay            Record a payment (partial or full) + creates journal entry
GET    /bills/:id/payments       List all bill_payments for a bill

── Actions ──
PATCH  /bills/:id/cancel         Cancel a pending/partial bill (voids bill_created journal)

── Summary ──
GET    /bills/summary            Total hutang outstanding + total piutang outstanding
```

### Query Filters

```
GET /bills?status=pending&bill_type=hutang&due_before=2026-06-01

Query params:
  status       = pending | partial | paid | overdue | cancelled (comma-separated ok)
  bill_type    = hutang | piutang
  due_before   = ISO date (show bills due before this date)
  due_after    = ISO date
  search       = string (searches title + contact_name)
  sort         = due_date | amount | created_at (default: due_date ASC)
```

### Request / Response Examples

#### POST /bills
```json
{
  "title": "Tagihan PLN Mei",
  "amount": 450000,
  "bill_type": "hutang",
  "due_date": "2026-05-25",
  "contact_name": "PLN UP3 Yogyakarta",
  "coa_account_id": "uuid-of-6-60200",
  "payment_account_id": "uuid-of-1-10002",
  "reminder_days": [7, 3, 1]
}
// Response 201
{
  "success": true,
  "data": { "bill_id": "uuid", "status": "pending", "due_date": "2026-05-25" }
}
```

#### POST /bills/:id/pay
```json
// Request (partial payment)
{ "amount": 200000, "payment_date": "2026-05-18", "payment_account_id": "uuid-of-1-10002" }

// Response 201
{
  "success": true,
  "data": {
    "bill_id": "uuid",
    "amount_paid": 200000,
    "remaining": 250000,
    "status": "partial",
    "journal_id": "uuid",
    "is_fully_paid": false
  }
}
```

#### GET /bills/summary
```json
{
  "success": true,
  "data": {
    "hutang": { "total": 3, "outstanding_amount": 1250000, "overdue_count": 1 },
    "piutang": { "total": 2, "outstanding_amount": 500000, "overdue_count": 0 }
  }
}
```
