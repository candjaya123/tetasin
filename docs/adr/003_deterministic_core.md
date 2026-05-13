# ADR-003: Deterministic Core

**Status:** Accepted
**Date:** 2026-05-11
**Authors:** Platform Engineering Team

---

## Decision

All financial computation is **deterministic** — performed by typed TypeScript code using exact arithmetic. AI is used exclusively for communication and recommendation, never for financial computation or execution.

## The Invariant

> "AI reads data, explains it, and suggests. Humans confirm. Systems execute."

No financial record is ever created, modified, or deleted by AI autonomously.

## Financial Computation Rules

### Rule 1: Exact Arithmetic Only

```typescript
// ✅ CORRECT: Exact integer arithmetic (amounts in IDR cents, or Numeric(15,2))
const totalAmount = items.reduce((sum, item) =>
  sum + (item.unit_price * item.quantity) - item.discount, 0
);

// ❌ FORBIDDEN: Floating point in financial calculations
const total = 0.1 + 0.2; // = 0.30000000000000004 — unacceptable
```

### Rule 2: Journal Balance Validation (Sacred Invariant)

```typescript
// Enforced in AccountingService.createJournalEntry() — NEVER bypass
const totalDebit = lines.reduce((s, l) => s + l.debit, 0);
const totalCredit = lines.reduce((s, l) => s + l.credit, 0);

if (Math.abs(totalDebit - totalCredit) >= 0.01) {
  throw new UnprocessableEntityException({
    code: 'JOURNAL_IMBALANCE',
    message: 'Journal entry debits must equal credits',
    details: { totalDebit, totalCredit, difference: Math.abs(totalDebit - totalCredit) },
  });
}
```

### Rule 3: ACID for All Financial Writes

```typescript
// ALL financial writes: sales, journals, stock deductions, draft approvals
return this.unitOfWork.runInTransaction(async (client) => {
  const tx = await this.salesRepo.create(dto, client);
  await this.inventoryRepo.deductStock(dto.items, client);
  const journal = await this.accountingService.createJournalEntry(journalDto, client);
  return { transaction_id: tx.id, journal_id: journal.id };
});
```

### Rule 4: Promotions Computed Deterministically

```typescript
// DiscountEngine.apply() — pure function, same input = same output
function applyDiscount(cartItems: CartItem[], promo: Promo): DiscountResult {
  // Rule-based evaluation — no randomness, no AI
  if (promo.type === 'percentage') {
    return { discount: cartItems.total * (promo.value / 100) };
  }
  if (promo.type === 'fixed') {
    return { discount: Math.min(promo.value, cartItems.total) };
  }
}
```

## AI Layer Boundaries

### What AI CAN do

```typescript
// 1. Read aggregated financial data
const summary = await this.aggregator.getSemanticFinancialSummary(tenantId);

// 2. Generate natural language explanations
const insight = await this.gemini.generateContent(systemPrompt + summary);

// 3. Extract structured data from images (OCR)
const extraction = await this.gemini.extractReceipt(imageBuffer, mimeType);

// 4. Recommend accounts, categories, tags
return { suggestedCategory: extraction.suggested_category.value };
```

### What AI CANNOT do

```typescript
// ❌ AI cannot create transactions
gemini.createTransaction(data); // Forbidden

// ❌ AI cannot approve drafts
gemini.approveDraft(draftId);   // Forbidden

// ❌ AI cannot modify financial records
gemini.updateJournal(journalId, changes); // Forbidden

// ❌ AI-suggested data cannot be committed without human approval
// Every AI output creates a DRAFT — user approval is mandatory
```

## Report Generation

Financial statements are computed from journal lines — not from AI summaries:

```sql
-- Income Statement (deterministic SQL aggregation)
SELECT
  coa.type,
  SUM(jl.debit) - SUM(jl.credit) AS net_balance
FROM journal_lines jl
JOIN journal_entries je ON je.id = jl.journal_entry_id
JOIN chart_of_accounts coa ON coa.id = jl.account_id
WHERE je.tenant_id = $1
  AND je.status = 'posted'
  AND je.transaction_date BETWEEN $2 AND $3
GROUP BY coa.type;
```

AI may **explain** this output. It does not **produce** it.
