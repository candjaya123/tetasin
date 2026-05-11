# Tumbuhin — Business Flow

> **Document Purpose:** Defines core operational and domain workflows — transaction flows, inventory flows, accounting flows, approval flows, and synchronization logic.
> **Who Should Read This:** Backend engineers, QA, product managers, and business analysts.
> **Why It Matters:** Business logic consistency is critical for ERP/SaaS systems. Undocumented flows lead to edge-case failures and data corruption.

---

## 1. Current Problems

| Problem | Severity | Description |
|---|---|---|
| Promo `applyPromotions()` not called during POS checkout via API | 🔴 High | Discounts only applied in-memory, not persisted to journal |
| No void/refund flow documented or fully implemented | 🟡 Medium | Voided sales leave inconsistent inventory and journal state |
| Cash flow report field mismatch between backend and frontend | 🟡 Medium | `chart_of_accounts` field name vs frontend transform |
| Procurement draft approval flow not end-to-end tested | 🟡 Medium | Draft → PO → Fulfillment path untested |
| No documented edge case for partial stock during sales | 🟡 Medium | Mixed-product sales with partial stock availability |

---

## 2. Flow 1: User Registration & Onboarding

```
1. User signs up via Supabase Auth (email + password)
   → Supabase triggers `handle_new_user()` DB function
   
2. `handle_new_user()` atomically:
   a. Creates tenant record (name, account_type, tier='starter')
   b. Creates profile (linked to tenant_id)
   c. Seeds COA (4 accounts for business, 4 for personal)
   d. Creates default notification configs

3. Frontend detects auth state change
   → Redirects to /onboarding

4. OnboardingController receives business profile data
   → Updates tenant name, address, contact info

5. Tenant enters dashboard
   → Dashboard shows empty state with onboarding checklist
```

**Edge Cases:**
- If `handle_new_user()` fails → Supabase Auth user exists but no profile → Retry mechanism needed
- Business name with special characters → Sanitize before inserting

---

## 3. Flow 2: POS Sale (Critical Path)

```
Cashier opens POS → selects products → checkout

1. Frontend: PromoService.applyPromotions(cart_items)
   → Calculates discounts deterministically
   → Returns adjusted prices (NOT sent to server yet)

2. Cashier confirms payment method → POST /api/v1/sales

3. Backend SalesService.processSale():
   a. Check transaction limit (Starter: 500/month)
   b. Begin UnitOfWork transaction (BEGIN)
   c. Create transaction record (status: 'validating')
   d. For each item:
      i.  Fetch product + recipe ingredients
      ii. Calculate HPP (unit_price × quantity_needed × qty)
      iii.Check stock availability → RAISE if insufficient
      iv. Deduct stock from raw_materials (FOR UPDATE lock)
   e. Lookup COA accounts by code:
      - 1-10000: Kas Tangan
      - 4-40000: Pendapatan Penjualan
      - 5-50000: HPP
      - 1-10503: Persediaan
      - 4-41000: Diskon Penjualan (if applicable)
   f. Assemble journal lines (Debit/Credit pairs)
   g. AccountingService.createJournalEntry()
      → Validate: |totalDebit - totalCredit| < 0.01
      → If imbalanced → ROLLBACK + raise JOURNAL_IMBALANCE
   h. Save sale_items
   i. Update transaction status → 'committed'
   j. COMMIT transaction

4. EventBusService.emit('SaleCreated')
   → Persist to event_log
   → Push to BullMQ queue

5. Return { transaction_id, journal_id, status: 'committed' }

6. Frontend displays receipt → optional print
```

**Journal Entries Created:**
```
Entry 1 (Revenue Recognition):
  DEBIT:  Kas Tangan          Rp 30,000
  CREDIT: Pendapatan Penjualan Rp 30,000

Entry 2 (HPP Recognition):
  DEBIT:  Beban HPP           Rp 12,000
  CREDIT: Persediaan Bahan Baku Rp 12,000

Entry 3 (Discount, if any):
  DEBIT:  Diskon Penjualan    Rp 2,000
  CREDIT: Kas Tangan          Rp 2,000
```

**Edge Cases:**
- Insufficient stock mid-sale → Full ROLLBACK, no partial commits
- Duplicate checkout (double-click) → Idempotency key prevents duplicate transaction
- Network timeout → Client retries with same idempotency key → Returns original response

---

## 4. Flow 3: Inventory Management

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
2. WarehouseService:
   a. Validate source warehouse has sufficient stock
   b. Deduct from source warehouse
   c. Add to destination warehouse
   d. Create stock_transfer record
   e. Create journal entry (no P&L impact, asset transfer)
3. Commit atomically via UnitOfWork

Stock Opname:
1. POST /api/v1/warehouse/opname
2. WarehouseService:
   a. Record physical count vs system count
   b. Calculate variance
   c. If variance > 0 → Stock gain journal entry
   d. If variance < 0 → Stock loss journal entry
```

---

## 5. Flow 4: Procurement (PO Lifecycle)

```
Automated Draft Generation (Midnight Cron):
1. ProcurementCronService scans all tenants
2. Finds products/raw_materials WHERE current_stock <= reorder_point
3. Generates draft PO with estimated quantities and vendor info
4. Saves to business_memory (type: 'procurement_draft')

Manual PO Creation:
1. POST /api/v1/procurement/purchase-orders
2. OrderService creates PO with status: 'draft'

PO Approval Flow:
1. Manager reviews draft at /tenant/procurement/drafts
2. Edits quantities/vendor if needed
3. PATCH /api/v1/procurement/purchase-orders/:id/approve
   → Status changes: draft → approved
   → Notify stock manager
4. Stock manager fulfills PO (goods received)
5. PATCH /api/v1/procurement/purchase-orders/:id/fulfill
   a. Update raw_materials stock (+ received quantities)
   b. Create journal entry:
      DEBIT:  Persediaan Bahan Baku (amount received)
      CREDIT: Utang Dagang (if credit) or Kas (if cash)
   c. Status → 'fulfilled'
```

---

## 6. Flow 5: Financial Reporting

```
Hourly Analytics Refresh (Cron):
1. AnalyticsCronService runs EVERY_HOUR
2. Calls refresh_ledger_analytics() PostgreSQL function
3. Materialized views updated:
   - ledger_balances (per account balance)
   - monthly_profit_loss (P&L per month)

Report Generation (User-triggered):
1. User opens /tenant/finance/balance-sheet
2. GET /api/v1/finance/balance-sheet (with JWT)
3. FinanceController:
   a. Validate tier (Pro required for balance sheet)
   b. Query ledger_balances WHERE tenant_id = user.tenant_id
   c. Group by account type (aset, kewajiban, ekuitas)
   d. Return structured balance sheet object
4. Frontend renders interactive table
```

**Financial Statement Mapping:**
```
Income Statement:
  Revenue    = SUM of 'pendapatan' accounts (credit balance)
  Expenses   = SUM of 'beban' accounts (debit balance)
  Net Profit = Revenue - Expenses

Balance Sheet:
  Assets     = SUM of 'aset' accounts (debit balance)
  Liabilities = SUM of 'kewajiban' accounts (credit balance)
  Equity     = SUM of 'ekuitas' accounts (credit balance)
  Verify:    Assets = Liabilities + Equity

Cash Flow (Simplified):
  Operating  = Cash from sales - Cash for HPP - Cash for expenses
  Investing  = Capital purchases (asset accounts)
  Financing  = Owner equity injections / withdrawals
```

---

## 7. Flow 6: AI CFO Chat

```
User asks: "Bagaimana kondisi keuangan saya?"

1. POST /api/v1/ai/chat { prompt: "..." }
2. AiController → check tier (Business+ required)
3. If empty prompt → ForecastingService.generateFinancialInsight():
   a. AggregatorService.getSemanticFinancialSummary()
      → Query ledger_balances → JSON { revenue, gross_profit, net_profit, cash, inventory }
   b. MemoryService.getRelevantMemories()
      → Query business_memory → historical patterns
   c. Build CFO system prompt with context
   d. GeminiProvider.generateContent(prompt)
   e. Save insight to business_memory (for future RAG context)
4. If user prompt provided → Pass with business context to Gemini
5. Return AI response to client
```

---

## 8. Flow 7: Subscription Upgrade

```
1. User clicks "Upgrade" in web dashboard
2. POST /api/v1/subscription/upgrade { target_tier: 'business' }
3. BusinessProfileService:
   a. Create Midtrans payment order
   b. Return payment_url to frontend
4. User completes payment in Midtrans
5. Midtrans webhook → Supabase Edge Function
6. Edge Function → UPDATE tenants SET tier = 'business'
7. User refreshes → TierGuard now allows Business features
```

---

## 9. Refactor Direction

1. **Promo integration:** Ensure `PromoService.applyPromotions()` is called server-side within `SalesService.processSale()` — not just client-side
2. **Void/Refund flow:** Implement `PATCH /api/v1/sales/:id/void` with full reversal journal entries and stock restoration
3. **Cash flow accuracy:** Fix field mapping between `FinanceService` output and frontend transform
4. **Procurement fulfillment:** Complete the PO fulfillment endpoint with journal entry creation

---

## 10. Long-Term Recommendations

| Recommendation | Rationale |
|---|---|
| Saga pattern for distributed flows | When modules are extracted, ensure cross-module atomicity |
| CQRS for reporting queries | Separate read and write models for better performance |
| Event sourcing for journal entries | Immutable event log as the authoritative source |
| Workflow engine (Temporal.io) | For complex approval flows with timeouts and retries |
