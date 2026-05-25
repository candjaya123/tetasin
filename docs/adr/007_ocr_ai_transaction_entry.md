# ADR-007: OCR + AI-Assisted Transaction Entry

**Status:** Proposed  
**Date:** 2026-05-12  
**Authors:** Architecture Team  
**Supersedes:** None  
**Related:** ADR-003 (Deterministic Core), ADR-001 (Modular Monolith)

---

## Context

Tetasin's core promise is:

> "Upload a receipt → Automatically becomes a double-entry journal."

A basic `POST /api/v1/ai/scan-receipt` endpoint already exists in the `AiController` using `GeminiProvider.extractReceipt()`. However, this current implementation:

1. Only extracts 4 fields (`vendor_name`, `total_amount`, `date`, `suggested_coa`)
2. Returns raw AI output directly — no structured draft transaction
3. Has no draft/review/approve workflow
4. Does not create journal entries or transactions from scanned data
5. Has no learning from user corrections
6. Has no duplicate detection
7. Is gated to Pro tier only (should be available at Business+ tier)

This ADR proposes a full **OCR + AI-Assisted Transaction Entry** system that:
- Extracts comprehensive receipt data via Gemini Vision
- Creates **draft transactions** (never committed automatically)
- Recommends categories, accounts, tags, and merchant mappings
- Lets users review, edit, and explicitly approve before saving
- Learns from user corrections over time

---

## Decision

### D1: AI is Assistive, Never Autonomous

Consistent with ADR-003 (Deterministic Core) and the platform's engineering principle:

> "AI reads data, explains it, and suggests. Humans confirm. Systems execute."

The OCR + AI pipeline produces **draft transactions** only. A transaction becomes official **only** after explicit user confirmation via a dedicated approval endpoint.

### D2: Use Gemini Vision as Primary OCR + Extraction Engine

Rather than adding a separate OCR engine (Tesseract, Google Cloud Vision) and a separate LLM for classification, we use **Gemini 2.0 Flash** multimodal capabilities for both:
- **OCR** (text extraction from image)
- **Structured extraction** (parsing receipt fields)
- **Classification** (recommending categories, accounts)

**Rationale:**
- Gemini handles both OCR and reasoning in a single call — simpler architecture
- Already integrated via `GeminiProvider`
- Eliminates the need for a separate OCR pipeline
- Confidence scoring built into the prompt engineering
- Fallback to explicit OCR (Google Cloud Vision) can be added later if needed

### D3: Draft Transaction as First-Class Entity

Create a dedicated `receipt_scans` table and `draft_transactions` table, separate from the production `transactions` table. This ensures:
- AI-generated data never pollutes the verified financial records
- Drafts can be edited, rejected, or expired without affecting accounting
- Full audit trail of AI suggestions vs. user corrections

### D4: New Module — `receipt` Module

Create a new backend module `modules/receipt/` following the existing Service-Repository pattern. This module:
- Owns `receipt_scans` and `draft_transactions` tables
- Delegates to `AccountingModule` only after user approval
- Uses `GeminiProvider` from `CoreModule/AiModule`
- Emits domain events via `EventBusService`

### D5: Async OCR Processing via BullMQ

Receipt scanning and AI extraction should be **asynchronous**:
1. User uploads image → receives a `scan_id` immediately
2. BullMQ job processes the image
3. Client polls or receives push notification when ready

**Rationale:**
- Gemini calls take 2-5 seconds
- Image preprocessing may add latency
- Prevents HTTP timeout on slow/large images
- Aligns with existing `scaling_strategy.md` recommendations

### D6: Tier Gating — Business+ (Not Pro-Only)

Receipt scanning should be available at **Business tier and above** (not just Pro). This drives upsell from Starter → Business.

### D7: Learning via Merchant Memory

Store user corrections in `merchant_mappings` table. When the same merchant is scanned again, use the previously-approved category and account mapping as the default suggestion. This is rule-based learning (not ML) — deterministic and explainable.

---

## Consequences

### Positive
- Fulfills the core product promise ("receipt → journal")
- AI never modifies financial data without user consent
- Modular design — `receipt` module is isolated, doesn't break existing modules
- Async processing prevents API blocking
- Merchant memory improves accuracy over time without ML complexity

### Negative
- Additional Gemini API cost per receipt scan (~$0.002/image for Flash)
- New tables and module add schema complexity
- Requires frontend work on both Web and Flutter for the review/approval UX

### Risks
- Gemini may hallucinate amounts or dates on blurry receipts — mitigated by confidence scoring and mandatory user review
- Duplicate receipt detection is heuristic-based — may have false positives
- Merchant memory is tenant-scoped — no cross-tenant learning (intentional for data isolation)

---

## Alternatives Considered

| Alternative | Why Rejected |
|---|---|
| Google Cloud Vision API + separate LLM | Two API calls, higher cost, more complexity — Gemini handles both |
| Tesseract (local OCR) | Poor accuracy on Indonesian receipts, no multilingual support, no reasoning |
| Auto-commit transactions from OCR | Violates ADR-003 — AI must never execute financial transactions |
| Store drafts in `transactions` table with `status='draft'` | Pollutes production table, complicates queries, audit risk |
| ML model for category prediction | Overkill at current scale — rule-based merchant memory is sufficient |

---

## References

- `docs/architecture.md` — Module boundary rules
- `docs/backend_architecture.md` — Service-Repository pattern
- `docs/business_flow.md` — POS Sale flow (the target output)
- `docs/security_rules.md` — Tier gating, audit logging
- `docs/scaling_strategy.md` — Async processing via BullMQ
- `backend/src/core/ai/gemini.provider.ts` — Existing Gemini integration
- `backend/src/modules/ai/ai.controller.ts` — Existing scan-receipt endpoint
