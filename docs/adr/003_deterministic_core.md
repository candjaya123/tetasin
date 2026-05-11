# ADR-003: Deterministic Business Logic — AI as Interface, Not Decision-Maker

**Status:** Accepted  
**Date:** 2026-05-11  
**Authors:** Platform Engineering Team  
**Reviewers:** CTO, Product Lead, AI Lead

---

## Context

Tumbuhin's core value proposition includes an "AI CFO" feature that analyzes financial data and provides insights. In early versions, there was consideration of using AI (Gemini) to:
- Calculate financial statements
- Determine how much stock to reorder
- Decide on promotion eligibility
- Process and commit financial transactions

However, this approach presented serious risks for a financial ERP system.

---

## Decision

We adopted **Deterministic Core** principle:

> All business logic that affects financial state, inventory, or pricing is implemented as deterministic mathematical code (PostgreSQL + TypeScript). AI is restricted to reading aggregated data and generating human-readable explanations.

**AI Allowed:**
- ✅ Read `ledger_balances` materialized view and summarize
- ✅ Answer user questions about their own business data
- ✅ Scan receipts (OCR) and draft journal entries for human review
- ✅ Generate financial forecasts as advisory text
- ✅ Suggest procurement quantities as draft (requires human approval)

**AI Forbidden:**
- ❌ Calculate financial statements (P&L, Balance Sheet, Cash Flow)
- ❌ Execute or commit transactions
- ❌ Modify database records
- ❌ Determine final selling prices or discounts
- ❌ Make autonomous procurement decisions

---

## Alternatives Considered

### Option A: AI-Driven Core (Rejected)

Allow Gemini to calculate financial statements and make procurement decisions.

**Pros:**
- More dynamic and "intelligent" responses
- Less code to write for business logic

**Cons:**
- LLMs hallucinate — financial data cannot have hallucination errors
- Non-deterministic: same input may produce different outputs on different runs
- Cannot be audited or explained legally
- Impossible to guarantee double-entry balance (Debit = Credit) with LLM
- Regulatory risk: financial statements must be mathematically accurate
- Latency: Gemini adds 1–3 seconds to every calculation

**Verdict:** Unacceptable for a financial system. A single hallucinated journal entry could corrupt a tenant's entire accounting records.

### Option B: Deterministic Core + AI Interface (Chosen)

All math is done in PostgreSQL/TypeScript. Gemini only reads pre-computed results and explains them.

**Pros:**
- Financial data is always accurate (ACID transactions, validated balance)
- AI provides value-added communication layer (summarization, forecasting)
- Clear boundary: any bug in business logic is in deterministic code — easy to debug
- Regulatory-safe: AI output is labeled as "advisory" not "computed"
- Performance: financial calculations run in SQL, not waiting for LLM

**Cons:**
- More code required for deterministic business logic
- AI cannot "understand" complex business rules (must be pre-computed)
- Limits AI autonomy — human approval required for all AI-suggested actions

---

## Implementation

```typescript
// AiController — AI reads from pre-computed aggregations only
async chat(dto: ChatDto, context: TenantContext) {
  // 1. Fetch pre-computed financial summary (deterministic SQL)
  const financialSummary = await this.aggregator.getSemanticFinancialSummary(context.tenantId);
  
  // 2. Retrieve memory context (past interactions)
  const memories = await this.memory.getRelevantMemories(context.tenantId, dto.prompt);
  
  // 3. Pass data + question to Gemini for explanation only
  const explanation = await this.gemini.generateContent(
    buildCFOPrompt(financialSummary, memories, dto.prompt)
  );
  
  // 4. Return explanation — AI has not touched any data
  return { response: explanation };
}
```

The `getSemanticFinancialSummary()` is a pure PostgreSQL query on `ledger_balances` — the materialized view that is refreshed hourly by a deterministic cron job.

---

## Tradeoffs

| Concern | Decision |
|---|---|
| **AI accuracy** | Acceptable lower accuracy for non-critical insights; zero tolerance for financial calculation errors |
| **AI autonomy** | Human-in-the-loop for all AI-suggested actions (procurement, journal drafts) |
| **Development velocity** | More backend code required; justified by data integrity requirement |
| **User experience** | AI provides conversational interface over correct data — better UX than AI-generated but wrong numbers |

---

## Long-Term Implications

- As LLMs improve (structured output, function calling, verification), the AI boundary can be gradually expanded
- OCR receipt scanning (scan → draft journal) is the safest expansion: AI creates a draft, human reviews and confirms
- Autonomous procurement restock (AI creates PO draft, human approves) is the next expansion candidate
- Full AI autonomy for financial decisions is not planned within a 5-year horizon

---

## Review Date

Re-evaluate this decision when:
- LLM structured outputs prove mathematically reliable in production financial systems
- An industry-standard verification layer for LLM financial calculations is available
- Regulatory framework for AI-generated financial statements is established in Indonesia
