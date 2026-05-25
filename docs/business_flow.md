# Tetasin — Business Flow

> **Document Purpose:** Defines core operational and domain workflows — transaction flows, inventory flows, accounting flows, approval flows, and synchronization logic.
> **Who Should Read This:** Backend engineers, QA, product managers, and business analysts.

---

## 1. Flow 1: User Registration & Onboarding

```
1. User signs up via Supabase Auth (email + password)
   → Supabase triggers handle_new_user() DB function

2. handle_new_user() atomically (single DB transaction):
   a. Creates tenant record (name, account_type, tier='free')
   b. Creates profile (linked to tenant_id, role='manager')
   c. Seeds COA — ALL 31 accounts from docs/accounting.md §1.4
      - All accounts are is_system = TRUE (cannot be deleted)
      - Includes: Kas Tangan, Kas Bank, E-Wallet, Persediaan,
        HPP, all BEBAN OPERASIONAL, PENDAPATAN, EKUITAS, KEWAJIBAN
      - Runs inside the same BEGIN/COMMIT as tenant creation
   d. Creates default notification configs

3. Frontend detects auth state change → redirects to /onboarding

4. OnboardingController receives business profile data
   → Updates tenant name, address, contact info

5. Tenant enters dashboard
   → Dashboard shows empty state with onboarding checklist
```

---

## 2. Flow 2: POS Sale (Critical Path) — Dual Record

> POS checkout **always** creates two records atomically: a **Pesanan** (sales_orders) AND a **Transaction** (transactions). These are linked via `transactions.pesanan_id`. See `docs/database_schema.md §2.4` and `docs/accounting.md §2.1` for schema and journal templates.

```
Cashier opens POS → selects products → checkout

1. Frontend: PromoService.applyPromotions(cart_items)
   → Calculates discounts deterministically
   → Returns adjusted prices

2. Cashier confirms payment method → POST /api/v1/sales

3. Backend SalesService.processSale():
   a. Check transaction limit (Free: 100/month · Pro/Franchise: unlimited)
   b. Begin UnitOfWork.runInTransaction() (BEGIN)

   c. Create sales_orders (Pesanan):
      - pesanan_number = auto-generated 'ORD-YYYY-NNNNN'
      - status = 'confirmed'
      - source = 'pos'
      - division_notes = {}

   d. Create transactions record:
      - status = 'validating'
      - pesanan_id = pesanan.id
      - source_type = 'pos_sale'
      - payment_method = dto.payment_method

   e. For each item:
      i.   Fetch product
      ii.  HppEngineService.calculate(product.id, quantity):
           A. Load product_recipes for this product
           B. If recipes exist (Recipe Mode):
              • hpp_per_unit = Σ (recipe.quantity_needed × bahan_baku.unit_price)
              • Check each bahan_baku.current_stock ≥ (qty_needed × qty_sold)
                → RAISE INSUFFICIENT_INGREDIENT if any ingredient low
              • Add deductions to stock_deduction_batch
              • persediaan_coa = bahan_baku.coa_account_id ?? '1-10500'
           C. Else if product.cost_price > 0 (Direct Mode):
              • hpp_per_unit = product.cost_price
              • persediaan_coa = product.hpp_coa_id ?? '1-10503'
           D. Else: hpp_per_unit = 0, no deductions
           E. Snapshot hpp_mode, hpp_per_unit, hpp_amount onto sale_item
      iii. Apply stock deductions from batch (FOR UPDATE lock on raw_materials)

   f. Lookup COA accounts by code (chart_of_accounts WHERE tenant_id)
      - Payment account resolved from payment_method:
        cash     → 1-10000 (Kas Tangan)
        qris     → 1-10003 (E-Wallet)
        transfer → 1-10002 (Kas Bank)
        card     → 1-10002 (Kas Bank)

   g. Assemble and create journal entries (see docs/accounting.md §2.1):

      Entry 1 — Revenue Recognition:
        DEBIT:  [payment account]            = total_amount
        CREDIT: Penjualan Produk (4-40000)   = total_amount

      Entry 2 — HPP Recognition:
        DEBIT:  Harga Pokok Penjualan (5-50000)     = Σ hpp_amount
        CREDIT: Persediaan Bahan Baku (1-10500)      = Σ hpp_amount

      Entry 3 — Discount (only if discount_amount > 0):
        DEBIT:  Diskon Penjualan (4-41000)   = discount_amount
        CREDIT: [payment account]            = discount_amount

   h. AccountingService.createJournalEntry()
      → Validate: |totalDebit - totalCredit| < 0.01
      → If imbalanced → ROLLBACK + raise JOURNAL_IMBALANCE

   i. Save sale_items
   j. Update transaction: status='committed', journal_id=journal.id
   k. Update pesanan: status='fulfilled', transaction_id=transaction.id
   l. COMMIT

4. EventBusService.emit('SaleCreated', { transactionId, pesananId, tenantId })
   → Persist to event_log → Push to BullMQ

5. Return { transaction_id, pesanan_id, journal_id, status: 'committed' }
```

**Edge Cases:**
- Insufficient stock mid-sale → Full ROLLBACK, no partial commits. Pesanan stays 'draft'.
- Duplicate checkout → Idempotency key returns original response (409)
- Network timeout → Client retries with same idempotency key → Original response

---

## 2b. Flow 2b: Pesanan Status Lifecycle (Cross-Division)

A Pesanan is a **cross-division coordination record** — it signals the state of an order to all relevant divisions (Kasir, Stok/Gudang, Dapur/Kitchen, Finance).

```
Status Transition Map:

[draft] → [confirmed] → [processing] → [ready] → [fulfilled] → [paid]
                                                        │
                                                   [invoiced] → [paid]  (B2B path)

[draft|confirmed|processing|ready] → [cancelled]   (before fulfillment)
[fulfilled|paid]                   → [voided]       (post-payment reversal)
```

**Status Definitions:**

| Status | Meaning | Who Sets It |
|---|---|---|
| `draft` | Order created, not confirmed | System (auto on POS init) |
| `confirmed` | Payment confirmed / order accepted | Kasir |
| `processing` | Being prepared (kitchen picking, warehouse) | Stok / Dapur |
| `ready` | Ready for pickup / delivery / handoff | Stok / Dapur |
| `fulfilled` | Goods or services delivered | Stok / Kasir |
| `invoiced` | Invoice issued to B2B customer | Manager / Finance |
| `paid` | Full payment received, transaction committed | System / Kasir |
| `cancelled` | Cancelled before fulfillment | Kasir / Manager |
| `voided` | Post-payment reversal | Manager only |

**Division Visibility:**
- **Kasir**: All statuses. Can confirm, mark paid, cancel.
- **Stok / Gudang**: `confirmed` → `processing` → `ready`. Updates division_notes.
- **Dapur** (FnB): Same as Stok for kitchen prep flow.
- **Manager**: All statuses. Can cancel + void. Void triggers reversal journal entry.

**Void Flow:**
```
1. Manager calls PATCH /api/v1/orders/:id/void
2. OrderService.voidPesanan():
   a. Check status = 'paid' (only paid orders can be voided)
   b. BEGIN UnitOfWork
   c. Set pesanan.status = 'voided'
   d. Set transaction.status = 'voided'
   e. AccountingService.createReversalJournalEntry()
      → Reversal of all original journal lines (debit↔credit swap)
      → reference_type = 'void', reference_id = original_transaction_id
   f. COMMIT
3. EventBusService.emit('PesananVoided', { pesananId, tenantId })
```

---

## 3. Flow 3: Inventory Management

```
Stock Addition (Restock Bahan Baku):
1. Stok manager opens Stok → Bahan Baku → Add Stock
2. POST /api/v1/inventory/stock-adjustment
   Body: { raw_material_id, qty_added, purchase_price, payment_method }
3. InventoryService:
   a. Update raw_materials.current_stock += qty_added
   b. Update raw_materials.last_purchase_price = purchase_price
   c. Create journal entry:
      DEBIT:  Persediaan Bahan Baku (raw_material.coa_account_id)
      CREDIT: Kas Tangan/Bank or Hutang Usaha (based on payment_method)
4. EventBusService.emit('StockAdded')

Bahan Baku CRUD (Stok Tab → Bahan Baku sub-tab):
1. Create: POST /api/v1/inventory/raw-materials
   Body: { name, unit, unit_price, current_stock, reorder_point, coa_account_id? }
   → If current_stock > 0 (opening balance): create opening stock journal entry
     DEBIT: Persediaan Bahan Baku (1-10500)   = unit_price × current_stock
     CREDIT: Modal (3-30000)                  = unit_price × current_stock
2. Update: PATCH /api/v1/inventory/raw-materials/:id
   → Updating unit_price ONLY affects future HPP calculations
   → Historical sale_items.hpp_per_unit is NEVER retroactively changed
3. Delete: DELETE /api/v1/inventory/raw-materials/:id
   → Blocked with RAW_MATERIAL_IN_USE (409) if any product_recipe references this bahan baku

Recipe Management (Product Form → Recipe tab):
1. Manager opens Produk → select product → Resep tab
2. Add ingredient: POST /api/v1/inventory/products/:id/recipes
   Body: { raw_material_id, quantity_needed }
   → quantity_needed = amount of bahan baku per 1 unit of product sold
3. View HPP preview: GET /api/v1/inventory/products/:id/hpp-preview
   → Returns live breakdown: per-ingredient cost + total HPP + gross margin %
4. Update: PATCH /api/v1/inventory/products/:id/recipes/:rid
5. Remove: DELETE /api/v1/inventory/products/:id/recipes/:rid

Stock Transfer (Multi-Warehouse):
1. POST /api/v1/warehouse/transfer
2. WarehouseService.runInTransaction():
   a. Validate source warehouse has sufficient stock
   b. Deduct from source warehouse
   c. Add to destination warehouse
   d. Create stock_transfer record
   e. Create journal entry (no P&L impact — asset transfer only)

Stock Opname:
1. POST /api/v1/warehouse/opname
2. WarehouseService:
   a. Record physical count vs system count
   b. Calculate variance
   c. If variance > 0 → Stock gain journal entry
   d. If variance < 0 → Stock loss journal entry
```

---

## 4. Flow 4: Receipt OCR (ADR-007)

```
Path A — Receipt Scan:
1. User uploads receipt image → POST /api/v1/receipt/scan
2. API:
   a. Validate image (format, size ≤ 10MB)
   b. Upload to Supabase Storage (receipt-scans/{tenant_id}/{scan_id}.jpg)
   c. Create receipt_scans record (status: 'processing')
   d. Enqueue BullMQ job 'process-scan'
   e. Return { scanId, status: 'processing' } immediately

3. BullMQ Worker processes:
   a. Send image to Gemini 2.0 Flash (multimodal)
   b. Parse structured JSON extraction
   c. Apply confidence scoring (high/medium/low)
   d. Check merchant_mappings for prior category/account
   e. Check duplicate detection (same merchant+amount+date within 24h)
   f. Update receipt_scans (status: 'completed', extracted_data)
   g. Create draft_transactions (status: 'ready')
   h. EventBusService.emit('ReceiptScanned')

4. Client polls GET /api/v1/receipt/scan/:id until status = 'completed'
   → Shows draft review form with confidence indicators

Path B — Manual Entry:
1. User opens manual entry form → POST /api/v1/receipt/drafts
2. Draft created immediately (status: 'ready')
3. User fills in all fields manually

Draft Approval:
1. User reviews draft → fills in debit_account_id + credit_account_id
2. POST /api/v1/receipt/drafts/:id/approve

3. DraftTransactionService.approveDraft():
   a. Validate debit + credit accounts are mapped
   b. Begin UnitOfWork.runInTransaction()
   c. AccountingService.createJournalEntry()
      → Validate: |totalDebit - totalCredit| < 0.01
   d. Update draft status → 'approved'
   e. Set resulting_journal_id
   f. MerchantMemoryService.learn() → upsert merchant_mappings
   g. COMMIT
   h. EventBusService.emit('DraftApproved')
```

---

## 5. Flow 5: Procurement (PO Lifecycle)

```
Automated Draft Generation (Midnight Cron):
1. ProcurementCronService scans all tenants
2. Finds products/raw_materials WHERE current_stock <= reorder_point
3. Generates draft PO with estimated quantities
4. Saves to procurement_drafts

Manual PO Creation:
1. POST /api/v1/procurement/purchase-orders
2. OrderService creates PO with status: 'draft'

PO Approval Flow:
1. Manager reviews draft
2. PATCH /api/v1/procurement/purchase-orders/:id/approve → status: 'approved'
3. Stock manager fulfills PO (goods received)
4. PATCH /api/v1/procurement/purchase-orders/:id/fulfill
   a. Update raw_materials stock (+ received quantities)
   b. Create journal entry:
      DEBIT:  Persediaan Bahan Baku (amount received)
      CREDIT: Utang Dagang (if credit) or Kas (if cash)
   c. Status → 'fulfilled'
```

---

## 6. Flow 6: Transaksi — Universal Financial Event Log

> The **Transaksi** tab/screen is the single unified view of **every financial event** that has occurred in the entire system for a tenant. Every event that moves money creates a row in `transactions` and a linked `journal_entry`. See `docs/accounting.md §4` for display logic.

```
Sources that write to the Transaksi log:
  • POS Sale           → source_type = 'pos_sale'         (Kasir)
  • POS Void           → source_type = 'pos_void'         (Manager)
  • Manual Expense     → source_type = 'expense'          (Manager/Kasir)
  • Receipt OCR        → source_type = 'receipt_ocr'      (Manager, Pro tier+)
  • PO Fulfillment     → source_type = 'po_fulfillment'   (Stok)
  • Stock Adjustment   → source_type = 'stock_adjustment' (Stok)
  • Manual Journal     → reference_type = 'manual' in journal_entries (no transaction row)
```

**Financial Report Generation (User-Triggered):**
```
1. User opens Keuangan → Balance Sheet / Laporan Laba Rugi
2. GET /api/v1/finance/balance-sheet  (Pro tier required)
3. FinanceController:
   a. Validate tier (Pro/Franchise required)
   b. Check Redis cache (balance-sheet:{tenantId})
   c. If miss → Query ledger_balances WHERE tenant_id = user.tenantId
   d. Apply report formulas from docs/accounting.md §5
   e. Cache result (1 hour TTL)
   f. Return structured response
```

**Financial Statement Mapping (standard accountancy):**
```
Income Statement (Laporan Laba Rugi):
  Net Revenue   = PENDAPATAN credits − contra-revenue (4-41000, 4-41001) debits
  Gross Profit  = Net Revenue − HPP / BIAYA LANGSUNG (5-xxxxx) debits
  Net Profit    = Gross Profit − BEBAN OPERASIONAL (6-xxxxx) debits

Balance Sheet (Neraca):
  Assets        = ASET debits − Akumulasi Penyusutan (1-15900) credit
  Liabilities   = KEWAJIBAN credits
  Equity        = EKUITAS credits − Prive (3-31000) debit
  Verify:         Assets = Liabilities + Equity  ← must hold

Cash Flow (Arus Kas):
  Cash accounts: 1-10000 (Kas Tangan) + 1-10002 (Kas Bank) + 1-10003 (E-Wallet)
  Δ balance = Opening + Σ debits to cash accounts − Σ credits to cash accounts

See docs/accounting.md §5 for full formulas and sign conventions.
```

**Analytics Refresh (Cron):**
```
Hourly:
1. AnalyticsCronService runs EVERY_HOUR
2. Calls refresh_ledger_analytics() PostgreSQL function
3. Materialized views updated:
   - ledger_balances (per account running balance)
   - monthly_profit_loss (P&L per month)
```

---

## 7. Flow 7: AI CFO Chat

```
User asks: "Bagaimana kondisi keuangan saya?"

1. POST /api/v1/ai/chat { prompt: "..." }
2. AiController → check tier (Business+ required)
3. AggregatorService.getSemanticFinancialSummary()
   → Query ledger_balances → JSON { revenue, gross_profit, net_profit, cash, inventory }
4. MemoryService.getRelevantMemories()
   → Query business_memory → historical patterns
5. Build CFO system prompt with context + tenant's COA + recent patterns
6. GeminiProvider.generateContent(prompt) (with 3x retry)
7. Save insight to business_memory (for future RAG context)
8. Return AI response to client
```

---

## 8. Flow 8: Subscription Upgrade

```
1. User clicks "Upgrade" → POST /api/v1/subscription/upgrade { target_tier: 'pro' }
2. BusinessProfileService:
   a. Create Midtrans payment order
   b. Return payment_url to frontend
3. User completes payment in Midtrans
4. Midtrans webhook → Supabase Edge Function
5. Edge Function → UPDATE tenants SET tier based on account_type:
     Personal: 'free' → 'premium'
     Business: 'free' → 'pro' → 'franchise'
6. TierGuard now allows unlocked features on next request

Tier availability (strict — immutable after registration):
  Personal account:  'free' | 'premium'
  Business account:  'free' | 'pro' | 'franchise'
  ❌ 'premium'   is ONLY valid for account_type = 'personal'
  ❌ 'pro'       is ONLY valid for account_type = 'business'
  ❌ 'franchise' is ONLY valid for account_type = 'business'
  ❌ account_type CANNOT be changed after signup → ACCOUNT_TYPE_IMMUTABLE (409)
```

---

## 10. Personal Account Flows (`account_type = 'personal'`)

> Personal accounts do **not** use POS, inventory, pesanan, procurement, or staff flows.
> All personal flows produce `journal_entries` + `journal_lines` using the same double-entry engine.

### Flow 10a — Income Entry (Catat Pemasukan)

```
1. User taps "Catat Pemasukan"
2. Form: amount, income_category (PENDAPATAN account), destination (ASET account), date, notes
3. POST /api/v1/personal/income

4. PersonalFinanceService.recordIncome():
   a. AccountTypeGuard → PERSONAL_ACCOUNT_ONLY (403) if account_type != 'personal'
   b. TierLimitService.check('income_entry') → TRANSACTION_LIMIT (422) if free tier >100/mo
   c. UnitOfWork.begin()
   d. INSERT journal_entry:
        reference_type = 'personal_income'
        description    = 'Pemasukan: [category name]'
   e. INSERT journal_lines:
        DEBIT  → destination_account_id  (ASET: e.g. 1-10002 Rekening Bank)
        CREDIT → income_category_id      (PENDAPATAN: e.g. 4-40000 Gaji)
   f. Validate |Σdebit − Σcredit| < 0.01 → JOURNAL_IMBALANCE (422) + rollback if fails
   g. UnitOfWork.commit()

5. Return: { journal_id, new_balance_of_destination_account }
```

### Flow 10b — Expense Entry (Catat Pengeluaran)

```
1. User taps "Catat Pengeluaran"
2. Form: amount, expense_category (BEBAN account), payment_source (ASET account), date, notes
         Optional: budget_id (link to personal_budgets row)
3. POST /api/v1/personal/expense

4. PersonalFinanceService.recordExpense():
   a. AccountTypeGuard → PERSONAL_ACCOUNT_ONLY (403)
   b. TierLimitService.check('expense_entry') → TRANSACTION_LIMIT if free tier >100/mo
   c. BudgetService.checkBudget(expense_category_id, amount, month, year):
        → if pct_used >= 100: append BUDGET_EXCEEDED warning in response (non-blocking)
        → if pct_used >= 80:  append BUDGET_WARNING in response (non-blocking)
   d. UnitOfWork.begin()
   e. INSERT journal_entry:
        reference_type = 'personal_expense'
   f. INSERT journal_lines:
        DEBIT  → expense_category_id   (BEBAN: e.g. 6-60000 Kebutuhan Pokok)
        CREDIT → payment_source_id     (ASET:  e.g. 1-10002 Rekening Bank)
   g. Validate balance → JOURNAL_IMBALANCE + rollback if fails
   h. UnitOfWork.commit()

5. Return: { journal_id, budget_status[] }
```

### Flow 10c — Goal Progress (Tambah Setoran ke Target)

```
1. User opens goal → taps "Tambah Setoran"
2. Form: amount, source_account_id (ASET account to debit from)
3. PATCH /api/v1/personal/goals/:id/progress

4. GoalService.addProgress():
   a. AccountTypeGuard → PERSONAL_ACCOUNT_ONLY (403)
   b. Load goal → check status != 'achieved' → GOAL_ALREADY_ACHIEVED (409)
   c. UnitOfWork.begin()
   d. INSERT journal_entry:
        reference_type = 'personal_goal'
        description    = 'Setoran ke goal: [goal.name]'
   e. INSERT journal_lines:
        DEBIT  → goal.linked_account_id  (e.g. 1-10200 Tabungan & Investasi)
        CREDIT → source_account_id       (e.g. 1-10002 Rekening Bank)
   f. Validate balance → JOURNAL_IMBALANCE + rollback if fails
   g. UPDATE financial_goals SET current_amount += amount
   h. If current_amount >= target_amount:
        SET status = 'achieved'
        INSERT smart_alerts (alert_type='goal_achieved', message='[name] tercapai!')
   i. UnitOfWork.commit()

5. Return: { goal, pct_achieved, is_achieved }
```

### Flow 10d — Trigger Recurring Transaction

```
Automatic check (cron daily at 00:05 WIB):
  SELECT * FROM recurring_transactions
  WHERE next_due_date <= TODAY AND is_active = TRUE AND tenant_id IN (personal tenants)

  For each due recurring:
    INSERT smart_alerts (alert_type='recurring_due', message='[name] jatuh tempo hari ini')

Manual trigger (user taps "Catat Sekarang"):
  PATCH /api/v1/personal/recurring/:id/trigger

  RecurringService.trigger():
    a. AccountTypeGuard → PERSONAL_ACCOUNT_ONLY (403)
    b. TierGuard → RECURRING_PREMIUM_REQUIRED (403) if tier != 'premium'
    c. Load recurring_transaction → check is_active = TRUE
    d. UnitOfWork.begin()
    e. INSERT journal_entry:
         reference_type = 'personal_recurring'
         description    = '[recurring.name] — auto entry'
    f. INSERT journal_lines:
         DEBIT  → recurring.debit_account_id
         CREDIT → recurring.credit_account_id
         amount = recurring.amount
    g. Validate balance → rollback if fails
    h. UPDATE recurring_transactions:
         last_triggered_at = NOW()
         next_due_date     = compute_next_date(frequency, day_of_period)
    i. UnitOfWork.commit()

5. Return: { journal_id, next_due_date }
```

---

## 11. Bill Tracker & Reminder Flows (Personal + Business)

> These flows apply to **both** `account_type = 'personal'` and `account_type = 'business'`. The same `bills` and `bill_payments` tables are used. Account type determines which COA accounts are used in the resulting journal entries.

### Flow 11a — Create Bill (Catat Tagihan)

```
1. User taps "Catat Tagihan" (hutang) or "Catat Piutang" (receivable)
2. Form:
   - title, contact_name, contact_phone (optional)
   - amount, due_date
   - bill_type: 'hutang' | 'piutang'
   - coa_account_id (pre-suggested based on account_type + bill_type)
   - payment_account_id (cash/bank account for when it's paid)
   - reminder_days[] (default: [7, 3, 1]; free tier locked to [7])
   - photo_url (optional; premium/pro only)
3. POST /api/v1/bills

4. BillService.create():
   a. TierGuard: check active bills count < 10 for free tier → TIER_LIMIT_EXCEEDED
   b. If reminder_days custom → check tier (premium/pro) → PREMIUM_FEATURE_REQUIRED
   c. INSERT bills (status = 'pending', amount_paid = 0)
   d. Optionally: if user wants to immediately create journal for the debt incurred:
        → INSERT journal_entry (reference_type = 'bill_created')
        → For hutang business: DEBIT BEBAN account, CREDIT Hutang Usaha 2-20100
        → For hutang personal: DEBIT Pengeluaran 6-60999, CREDIT Hutang/Cicilan 2-20100
        → For piutang business: DEBIT Piutang Usaha 1-10300, CREDIT Pendapatan 4-40900
        → For piutang personal: DEBIT ASET (selected), CREDIT Pendapatan 4-40900
   e. UPDATE bills SET journal_entry_id = new journal entry id

5. Return: { bill_id, status: 'pending', due_date, reminder_days }
```

### Flow 11b — Record Payment (Bayar / Terima Tagihan)

```
1. User opens bill → taps "Bayar" (hutang) or "Tandai Diterima" (piutang)
2. Form:
   - amount (can be partial, max = bill.amount - bill.amount_paid)
   - payment_date (default: today)
   - payment_account_id (which cash/bank account)
   - notes (optional)
3. POST /api/v1/bills/:id/pay

4. BillService.recordPayment():
   a. Load bill → check status NOT IN ('paid', 'cancelled') → BILL_ALREADY_SETTLED
   b. Validate amount <= (bill.amount - bill.amount_paid) → OVERPAYMENT_ERROR
   c. UnitOfWork.begin()
   d. INSERT bill_payments row
   e. Compute new total: new_amount_paid = bill.amount_paid + payment.amount
   f. INSERT journal_entry (reference_type = 'bill_paid'):
        For hutang business: DEBIT Hutang Usaha 2-20100, CREDIT payment_account (Kas/Bank)
        For hutang personal: DEBIT Hutang/Cicilan 2-20100, CREDIT payment_account (ASET)
        For piutang business: DEBIT payment_account (Kas/Bank), CREDIT Piutang Usaha 1-10300
        For piutang personal: DEBIT payment_account (ASET), CREDIT Pendapatan 4-40900
      Validate |Σdebit − Σcredit| < 0.01 → JOURNAL_IMBALANCE + rollback
   g. UPDATE bills:
        amount_paid = new_amount_paid
        status = (new_amount_paid >= bill.amount) ? 'paid' : 'partial'
        journal_entry_id = latest journal id (for full payment)
   h. UnitOfWork.commit()
   i. If status = 'paid': INSERT smart_alerts (alert_type='bill_paid', 'Tagihan [title] lunas!')

5. Return: { bill, payment, journal_id, is_fully_paid }
```

### Flow 11c — Reminder System (Automatic)

```
Cron job daily at 01:00 WIB:

Step 1 — Mark overdue:
  UPDATE bills SET status = 'overdue'
  WHERE due_date < CURRENT_DATE AND status IN ('pending', 'partial')

Step 2 — Send reminders:
  For each bill WHERE status IN ('pending', 'partial'):
    days_until_due = due_date - CURRENT_DATE
    IF days_until_due = ANY(bill.reminder_days):
      INSERT smart_alerts:
        alert_type = 'bill_due'
        message    = '[title] jatuh tempo dalam [days_until_due] hari — Rp [amount - amount_paid] belum lunas'
        reference_id = bill.id

Step 3 — Overdue alert (on the due day + 1):
  For each bill newly set to 'overdue':
    INSERT smart_alerts:
      alert_type = 'bill_overdue'
      message    = '[title] sudah melewati jatuh tempo! Segera lunasi.'
```

### Flow 11d — Cancel Bill

```
1. User taps "Batalkan" on a pending/partial bill
2. PATCH /api/v1/bills/:id/cancel
3. BillService.cancel():
   a. Check status NOT 'paid' → BILL_ALREADY_SETTLED if paid
   b. UPDATE bills SET status = 'cancelled'
   c. If bill had a 'bill_created' journal_entry:
      → Mark journal_entry status = 'voided'
      → Create reversal journal_entry (reference_type = 'bill_cancelled')
   d. Return: { bill_id, status: 'cancelled' }
```
