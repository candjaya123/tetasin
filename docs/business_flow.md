# Tumbuhin — Business Flow

> **Document Purpose:** Defines core operational and domain workflows — transaction flows, inventory flows, accounting flows, approval flows, and synchronization logic.
> **Who Should Read This:** Backend engineers, QA, product managers, and business analysts.

---

## 1. Flow 1: User Registration & Onboarding

```
1. User signs up via Supabase Auth (email + password)
   → Supabase triggers handle_new_user() DB function

2. handle_new_user() atomically:
   a. Creates tenant record (name, account_type, tier='starter')
   b. Creates profile (linked to tenant_id, role='manager')
   c. Seeds COA (standard chart of accounts for account_type)
   d. Creates default notification configs

3. Frontend detects auth state change → redirects to /onboarding

4. OnboardingController receives business profile data
   → Updates tenant name, address, contact info

5. Tenant enters dashboard
   → Dashboard shows empty state with onboarding checklist
```

---

## 2. Flow 2: POS Sale (Critical Path)

```
Cashier opens POS → selects products → checkout

1. Frontend: PromoService.applyPromotions(cart_items)
   → Calculates discounts deterministically
   → Returns adjusted prices

2. Cashier confirms payment method → POST /api/v1/sales

3. Backend SalesService.processSale():
   a. Check transaction limit (Starter: 500/month)
   b. Begin UnitOfWork.runInTransaction() (BEGIN)
   c. Create transaction record (status: 'validating')
   d. For each item:
      i.  Fetch product + recipe ingredients
      ii. Calculate HPP (unit_price × quantity_needed × qty)
      iii.Check stock availability → RAISE INSUFFICIENT_STOCK if insufficient
      iv. Deduct stock from raw_materials (FOR UPDATE lock)
   e. Lookup COA accounts by code
   f. Assemble journal lines (Debit/Credit pairs)
   g. AccountingService.createJournalEntry()
      → Validate: |totalDebit - totalCredit| < 0.01
      → If imbalanced → ROLLBACK + raise JOURNAL_IMBALANCE
   h. Save sale_items
   i. Update transaction status → 'committed'
   j. COMMIT

4. EventBusService.emit('SaleCreated', { transactionId, tenantId })
   → Persist to event_log → Push to BullMQ

5. Return { transaction_id, journal_id, status: 'committed' }
```

**Journal Entries Created:**
```
Entry 1 — Revenue Recognition:
  DEBIT:  Kas Tangan             Rp 30,000
  CREDIT: Pendapatan Penjualan   Rp 30,000

Entry 2 — HPP Recognition:
  DEBIT:  Beban HPP              Rp 12,000
  CREDIT: Persediaan Bahan Baku  Rp 12,000

Entry 3 — Discount (if any):
  DEBIT:  Diskon Penjualan       Rp 2,000
  CREDIT: Kas Tangan             Rp 2,000
```

**Edge Cases:**
- Insufficient stock mid-sale → Full ROLLBACK, no partial commits
- Duplicate checkout → Idempotency key returns original response (409)
- Network timeout → Client retries with same idempotency key → Original response

---

## 3. Flow 3: Inventory Management

```
Stock Addition:
1. Manager opens Inventory → Add Stock
2. POST /api/v1/inventory/stock-adjustment
3. InventoryService:
   a. Update raw_materials.current_stock
   b. Create journal entry (Debit: Persediaan, Credit: Kas/Hutang)
4. EventBusService.emit('StockAdded')

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

## 6. Flow 6: Financial Reporting

```
Hourly Analytics Refresh (Cron):
1. AnalyticsCronService runs EVERY_HOUR
2. Calls refresh_ledger_analytics() PostgreSQL function
3. Materialized views updated:
   - ledger_balances (per account balance)
   - monthly_profit_loss (P&L per month)

Report Generation (User-triggered):
1. User opens balance sheet
2. GET /api/v1/finance/balance-sheet (Pro tier required)
3. FinanceController:
   a. Validate tier (Pro required)
   b. Check Redis cache (balance-sheet:{tenantId})
   c. If miss → Query ledger_balances WHERE tenant_id = user.tenantId
   d. Group by account type
   e. Cache result (1 hour TTL)
   f. Return structured response
```

**Financial Statement Mapping:**
```
Income Statement:
  Revenue    = SUM of 'pendapatan' accounts (credit balance)
  Expenses   = SUM of 'beban' accounts (debit balance)
  Net Profit = Revenue - Expenses

Balance Sheet:
  Assets      = SUM of 'aset' accounts (debit balance)
  Liabilities = SUM of 'kewajiban' accounts (credit balance)
  Equity      = SUM of 'ekuitas' accounts (credit balance)
  Verify:     Assets = Liabilities + Equity
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
1. User clicks "Upgrade" → POST /api/v1/subscription/upgrade { target_tier: 'business' }
2. BusinessProfileService:
   a. Create Midtrans payment order
   b. Return payment_url to frontend
3. User completes payment in Midtrans
4. Midtrans webhook → Supabase Edge Function
5. Edge Function → UPDATE tenants SET tier = 'business'
6. TierGuard now allows Business features on next request
```
