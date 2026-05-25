# Tetasin — OCR + AI-Assisted Transaction Entry: Full Planning Document

> **Document Purpose:** Comprehensive architecture blueprint for the receipt-scan-to-transaction feature.  
> **Who Should Read This:** Engineers, architects, product managers.  
> **Related ADR:** `docs/adr/007_ocr_ai_transaction_entry.md`  
> **Status:** 🔄 Planning Phase — No production code changes.

---

## 1. Feature Overview

**Goal:** Allow users to photograph/upload a receipt and have AI extract transaction data, recommend categories and accounts, then let the user review and approve before saving.

**Core Principle:** AI is an assistant — never the final authority on financial data.

**Tier Availability:** Business+ (upgraded from current Pro-only gating)

### Resolved Design Decisions (2026-05-12)

| Question | Decision |
|---|---|
| **Receipt language priority** | Indonesian-first. Gemini prompts optimized for Bahasa Indonesia receipts with English fallback. |
| **Manual entry without receipt** | ✅ Yes. Draft transaction form is accessible without a receipt scan — doubles as a general-purpose expense entry form. |
| **Notification on OCR completion** | ✅ Yes. Push notification on Flutter, toast on Web when async processing completes. |
| **Old endpoint deprecation** | Immediate replacement. `POST /api/v1/ai/scan-receipt` is removed and replaced by new `POST /api/v1/receipt/scan`. No backward compatibility period. |

### User Flow Summary

```
Path A (Receipt):  📷 Upload/Capture → ⏳ Async Processing → 🤖 AI Extraction → 📝 Draft Review → ✅ Approve → 💾 Committed Transaction + Journal
Path B (Manual):   ✏️ Manual Entry → 📝 Draft Form → ✅ Approve → 💾 Committed Transaction + Journal
```

---

## 2. OCR Architecture

### 2.1 Pipeline Design

```
Image Input (JPEG/PNG/HEIC, max 10MB)
    │
    ├── 1. Validation (format, size, dimensions)
    │
    ├── 2. Preprocessing (optional, server-side)
    │      ├── Auto-rotate via EXIF
    │      ├── Compress if > 4MB
    │      └── Convert HEIC → JPEG if needed
    │
    ├── 3. Upload to Supabase Storage
    │      └── Bucket: receipt-scans/{tenant_id}/{scan_id}.jpg
    │
    ├── 4. Enqueue BullMQ Job (receipt-scan queue)
    │      └── Return scan_id immediately to client
    │
    └── 5. BullMQ Worker processes:
           ├── a. Send image to Gemini 2.0 Flash (multimodal)
           ├── b. Parse structured JSON response
           ├── c. Run confidence scoring
           ├── d. Check merchant memory for prior mappings
           ├── e. Check duplicate detection
           ├── f. Save to receipt_scans + draft_transactions
           └── g. Emit 'ReceiptScanned' domain event
```

### 2.2 OCR Engine Choice

| Option | Pros | Cons | Decision |
|---|---|---|---|
| **Gemini 2.0 Flash (multimodal)** | Single API call for OCR + extraction + classification, already integrated | Cost per call, depends on Google | ✅ Primary |
| Google Cloud Vision + LLM | Higher OCR accuracy on edge cases | Two API calls, more complexity | ⏳ Future fallback |
| Tesseract (local) | Free, no API dependency | Poor Indonesian receipt accuracy, no reasoning | ❌ Rejected |

### 2.3 Extraction Schema

Gemini prompt will request structured JSON with confidence scoring:

The prompt is written in **Bahasa Indonesia** and optimized for Indonesian receipt formats (thermal POS receipts, handwritten nota, digital invoices). English receipts are handled as fallback.

```json
{
  "merchant": { "value": "Indomaret Jl. Sudirman", "confidence": "high" },
  "transaction_date": { "value": "2026-05-10T00:00:00Z", "confidence": "high" },
  "total_amount": { "value": 125000, "confidence": "high" },
  "subtotal": { "value": 118000, "confidence": "medium" },
  "tax_amount": { "value": 7000, "confidence": "medium" },
  "discount_amount": { "value": 0, "confidence": "high" },
  "currency": { "value": "IDR", "confidence": "high" },
  "payment_method": { "value": "cash", "confidence": "medium" },
  "receipt_number": { "value": "INV-2026-0512", "confidence": "low" },
  "line_items": [
    { "name": "Aqua 600ml", "quantity": 2, "unit_price": 4000, "total": 8000, "confidence": "high" },
    { "name": "Indomie Goreng", "quantity": 3, "unit_price": 3500, "total": 10500, "confidence": "high" }
  ],
  "suggested_category": { "value": "office_supplies", "confidence": "medium" },
  "suggested_account_code": { "value": "5-50100", "confidence": "medium" },
  "suggested_tags": ["groceries", "operational"],
  "raw_text": "... full OCR text ..."
}
```

### 2.4 Confidence Scoring Strategy

| Level | Meaning | UX Treatment |
|---|---|---|
| `high` (≥0.85) | AI is very confident | Green indicator, auto-filled |
| `medium` (0.5–0.84) | Possible but uncertain | Yellow indicator, auto-filled but highlighted |
| `low` (<0.5) | Unreliable | Red indicator, empty field, user must fill manually |

---

## 3. AI Recommendation Engine

### 3.1 Classification Strategy (Hybrid)

```
Receipt Data
    │
    ├── Layer 1: Merchant Memory (rule-based, deterministic)
    │   └── Look up merchant_mappings for this tenant
    │       ├── Found → Use stored category + account
    │       └── Not found → Proceed to Layer 2
    │
    ├── Layer 2: Gemini Classification (AI-based)
    │   └── Prompt includes:
    │       ├── Tenant's COA list
    │       ├── Tenant's existing categories
    │       ├── Receipt extracted data
    │       └── Recent transaction patterns (last 30 days)
    │
    └── Output: Recommended category, account, tags, transaction type
```

### 3.2 What AI Recommends

| Recommendation | Source | Confidence Basis |
|---|---|---|
| **Transaction category** (e.g., "food_expense") | Gemini + merchant memory | Prior approvals for same merchant |
| **COA account mapping** (e.g., "5-50100 Beban Operasional") | Gemini + tenant's COA | Match against tenant's account list |
| **Payment method** | OCR extraction | Text on receipt ("CASH", "QRIS") |
| **Tags** | Gemini suggestion | Receipt content analysis |
| **Transaction type** | Gemini | "expense" / "purchase" / "asset_acquisition" |
| **Duplicate warning** | Heuristic check | Same merchant + amount + date within 24h |

### 3.3 Merchant Memory System

```sql
-- Stores learned mappings per tenant
CREATE TABLE merchant_mappings (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    merchant_name   TEXT NOT NULL,           -- normalized lowercase
    merchant_alias  TEXT[],                  -- alternative names detected
    default_category TEXT,                   -- last approved category
    default_account_id UUID REFERENCES chart_of_accounts(id),
    default_tags    TEXT[],
    approval_count  INTEGER DEFAULT 0,       -- times user approved this mapping
    last_used_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, merchant_name)
);
CREATE INDEX idx_merchant_mappings_tenant ON merchant_mappings(tenant_id);
```

**Learning flow:**
1. User approves a draft transaction with category "food_expense" for merchant "Indomaret"
2. System upserts `merchant_mappings` → `default_category = 'food_expense'`
3. Next time "Indomaret" is scanned → Layer 1 returns stored mapping immediately
4. `approval_count` increments → higher confidence over time

---

## 4. Transaction Draft System

### 4.1 Draft Lifecycle

```
PROCESSING → READY → (APPROVED | REJECTED | EXPIRED)
    │           │         │          │           │
    │           │         │          │           └── Auto-expire after 30 days
    │           │         │          └── User explicitly rejects
    │           │         └── User approves → creates real transaction + journal
    │           └── AI extraction complete, ready for review
    └── Image uploaded, BullMQ processing
```

### 4.2 Database Schema

```sql
-- Receipt scan records (image + raw OCR output)
CREATE TABLE receipt_scans (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    uploaded_by     UUID NOT NULL REFERENCES profiles(id),
    image_url       TEXT NOT NULL,            -- Supabase Storage URL
    status          TEXT NOT NULL DEFAULT 'processing',
                    -- 'processing' | 'completed' | 'failed'
    raw_ocr_text    TEXT,                     -- Full extracted text
    extracted_data  JSONB,                    -- Structured extraction result
    ai_model_used   TEXT,                     -- 'gemini-2.0-flash'
    processing_time_ms INTEGER,              -- Performance tracking
    error_message   TEXT,                     -- If status='failed'
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_receipt_scans_tenant ON receipt_scans(tenant_id, created_at DESC);

-- Draft transactions (AI-generated, pending user review)
CREATE TABLE draft_transactions (
    id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    receipt_scan_id     UUID REFERENCES receipt_scans(id) ON DELETE SET NULL,
    created_by          UUID NOT NULL REFERENCES profiles(id),
    status              TEXT NOT NULL DEFAULT 'ready',
                        -- 'processing' | 'ready' | 'approved' | 'rejected' | 'expired'

    -- Extracted / recommended fields (user-editable)
    merchant_name       TEXT,
    transaction_date    TIMESTAMPTZ,
    total_amount        NUMERIC(15,2),
    subtotal            NUMERIC(15,2),
    tax_amount          NUMERIC(15,2),
    discount_amount     NUMERIC(15,2) DEFAULT 0,
    currency            TEXT DEFAULT 'IDR',
    payment_method      payment_method,
    receipt_number      TEXT,
    category            TEXT,
    notes               TEXT,
    tags                TEXT[],

    -- AI recommendation metadata
    ai_recommendations  JSONB NOT NULL DEFAULT '{}',
    -- { category: { value, confidence, source },
    --   account: { value, confidence, source },
    --   tags: { value, confidence },
    --   duplicate_warning: { is_duplicate, similar_transaction_id } }

    -- Account mapping
    debit_account_id    UUID REFERENCES chart_of_accounts(id),
    credit_account_id   UUID REFERENCES chart_of_accounts(id),

    -- Line items
    line_items          JSONB DEFAULT '[]',

    -- User corrections tracking (for learning)
    user_corrections    JSONB DEFAULT '{}',
    -- { field_name: { ai_value, user_value } }

    -- Approval metadata
    approved_at         TIMESTAMPTZ,
    approved_by         UUID REFERENCES profiles(id),
    resulting_transaction_id UUID REFERENCES transactions(id),
    resulting_journal_id     UUID REFERENCES journal_entries(id),

    -- Rejection metadata
    rejected_at         TIMESTAMPTZ,
    rejection_reason    TEXT,

    expires_at          TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_draft_transactions_tenant ON draft_transactions(tenant_id, status, created_at DESC);
CREATE INDEX idx_draft_transactions_status ON draft_transactions(status) WHERE status = 'ready';
```

### 4.3 Approval Flow → Real Transaction

When user approves a draft:

```
1. Validate all required fields are filled
2. Begin UnitOfWork transaction (BEGIN)
3. Create transaction record (status: 'committed')
4. Create journal_entry + journal_lines (double-entry)
   └── Validate: |totalDebit - totalCredit| < 0.01
5. Update draft_transactions.status = 'approved'
6. Set resulting_transaction_id and resulting_journal_id
7. Update merchant_mappings (learning)
8. COMMIT
9. Emit 'DraftApproved' domain event
10. Emit 'SaleCreated' or 'ExpenseCreated' event (triggers cache invalidation)
```

---

## 5. Backend Module Design

### 5.1 New Module: `modules/receipt/`

```
modules/receipt/
├── receipt.module.ts
├── controllers/
│   └── receipt.controller.ts         ← HTTP handlers
├── services/
│   ├── receipt-scan.service.ts       ← Orchestrates scan workflow
│   ├── receipt-extraction.service.ts ← Gemini prompt engineering
│   ├── draft-transaction.service.ts  ← Draft CRUD + approval
│   ├── merchant-memory.service.ts    ← Merchant mapping learning
│   └── duplicate-detection.service.ts← Heuristic duplicate check
├── repositories/
│   ├── receipt-scan.repository.ts
│   ├── draft-transaction.repository.ts
│   └── merchant-mapping.repository.ts
├── processors/
│   └── receipt-scan.processor.ts     ← BullMQ worker
├── dto/
│   ├── upload-receipt.dto.ts
│   ├── draft-transaction-response.dto.ts
│   ├── approve-draft.dto.ts
│   └── update-draft.dto.ts
└── domain/
    └── receipt.events.ts             ← Domain events
```

### 5.2 API Endpoints

```
POST   /api/v1/receipt/scan              ← Upload image, returns scan_id (replaces old /ai/scan-receipt)
GET    /api/v1/receipt/scan/:id          ← Poll scan status + result
POST   /api/v1/receipt/drafts            ← Create manual draft (no receipt required)
GET    /api/v1/receipt/drafts            ← List draft transactions
GET    /api/v1/receipt/drafts/:id        ← Get single draft with AI recommendations
PATCH  /api/v1/receipt/drafts/:id        ← Edit draft fields
POST   /api/v1/receipt/drafts/:id/approve ← Approve → create real transaction
POST   /api/v1/receipt/drafts/:id/reject  ← Reject draft
GET    /api/v1/receipt/merchants         ← List learned merchant mappings
```

> **Note:** `POST /api/v1/ai/scan-receipt` is **removed** and replaced by `POST /api/v1/receipt/scan`. The old endpoint in `AiController` will be deleted during implementation.

### 5.3 Module Dependencies

```
ReceiptModule
├── imports: [CoreModule (GeminiProvider, EventBusService)]
├── delegates to: AccountingModule (journal creation on approval)
├── delegates to: SalesModule (if receipt maps to a sale)
├── reads from: chart_of_accounts (for account suggestions)
└── emits: 'ReceiptScanned', 'DraftCreated', 'DraftApproved', 'DraftRejected'
```

**No direct cross-module service imports.** Communication with `AccountingModule` happens via the existing `AccountingService` interface, called only during the approval flow.

---

## 6. Frontend UX Planning

### 6.1 Web (Next.js) — New Pages

```
src/app/tenant/
├── receipt/
│   ├── page.tsx              ← Receipt scan dashboard (list of drafts)
│   ├── scan/page.tsx         ← Upload / camera capture interface
│   ├── manual/page.tsx       ← Manual expense entry (no receipt required)
│   └── [id]/page.tsx         ← Draft review + approval form
```

### 6.2 Flutter — New Feature Module

```
lib/features/receipt/
├── data/
│   ├── receipt_service.dart
│   └── receipt_models.dart
├── presentation/
│   ├── screens/
│   │   ├── receipt_scan_screen.dart    ← Camera + upload
│   │   ├── receipt_drafts_screen.dart  ← List of pending drafts
│   │   ├── manual_entry_screen.dart    ← Manual expense entry (no receipt)
│   │   └── draft_review_screen.dart    ← Review + approve/reject
│   ├── widgets/
│   │   ├── confidence_indicator.dart   ← Green/yellow/red badges
│   │   ├── ai_suggestion_chip.dart     ← Tappable suggestion chips
│   │   └── receipt_preview.dart        ← Image with overlay highlights
│   └── providers/
│       └── receipt_provider.dart
```

### 6.3 UX States

| State | UX |
|---|---|
| **Upload** | Drag-and-drop (web) or camera button (mobile), file picker fallback |
| **Processing** | Skeleton loading with progress indicator, "AI is reading your receipt..." |
| **Completed Notification** | Push notification (Flutter) / toast (Web): "Receipt processed — tap to review" |
| **Ready** | Autofilled form with confidence indicators on each field |
| **Manual Entry** | Empty form with same fields, no AI indicators — pure manual input |
| **AI Suggestions** | Chips/badges showing AI recommendation + confidence level |
| **Editing** | All fields editable, original AI value shown as reference |
| **Approval** | Summary view → "Confirm Transaction" button |
| **Error** | Retry button, manual entry fallback link |
| **Duplicate Warning** | Yellow banner: "Similar transaction found on [date]" with link |

### 6.4 Confidence Indicators

```
🟢 High confidence  → Field auto-filled, green dot
🟡 Medium confidence → Field auto-filled, yellow dot + "Verify this"
🔴 Low confidence    → Field empty, red dot + "AI couldn't read this"
```

Each indicator is tappable to show: "AI extracted: [value] from receipt text: [snippet]"

---

## 7. Error Handling Strategy

| Scenario | Detection | User Action | System Action |
|---|---|---|---|
| **Unreadable receipt** | Gemini returns mostly `low` confidence | Manual entry option shown | Save scan with `status='failed'` |
| **Partial extraction** | Some fields `high`, some `low` | Edit empty fields manually | Auto-fill what's confident |
| **OCR timeout** | BullMQ job exceeds 30s | Retry button | Retry with backoff (max 3 attempts) |
| **Gemini rate limit** | 429 response | "Try again in a few minutes" | Queue with delay |
| **Duplicate receipt** | Heuristic match (merchant+amount+date) | Warning banner, can proceed | Log duplicate check result |
| **Invalid image** | File validation (size, format) | Error message before upload | Reject at API level |
| **Unsupported format** | MIME type check | "Please upload JPEG or PNG" | Return 400 |
| **Journal imbalance** | Debit ≠ Credit on approval | Block approval, show error | Prevent commit |

---

## 8. Security & Privacy

### 8.1 Receipt Image Storage

- **Storage:** Supabase Storage bucket `receipt-scans` with RLS policies
- **Path:** `receipt-scans/{tenant_id}/{scan_id}.{ext}` — tenant-isolated
- **Access:** Only authenticated users of the same tenant can read
- **Retention:** Images retained for 90 days, then auto-deleted via scheduled job
- **Encryption:** Supabase Storage encrypts at rest (AES-256)

### 8.2 AI Provider Privacy

- Receipt images are sent to Google Gemini API for processing
- Google's data usage policy applies — no training on customer data with paid API
- No PII is stored in AI prompts beyond receipt content
- Consider on-premise OCR for compliance-sensitive tenants (future)

### 8.3 Audit Trail

Every receipt scan and draft action is logged to `audit_logs`:
- `receipt.scanned` — Image uploaded
- `draft.created` — AI generated draft
- `draft.edited` — User modified fields
- `draft.approved` — User confirmed transaction
- `draft.rejected` — User rejected draft

---

## 9. Scalability & Performance

### 9.1 Async Processing Architecture

```
Upload → API (< 200ms response with scan_id)
    │
    └── BullMQ 'receipt-scan' queue
        ├── Concurrency: 5 (limit Gemini API load)
        ├── Rate limit: 60/hour per tenant
        ├── Max retries: 3
        ├── Backoff: exponential (1s, 2s, 4s)
        └── Timeout: 30s per job
```

### 9.2 Cost Optimization

| Strategy | Savings |
|---|---|
| Compress images to < 1MB before sending to Gemini | ~40% token reduction |
| Cache merchant memory lookups in Redis (15min TTL) | Avoid DB query per scan |
| Rate limit scans per tenant (60/hour) | Prevent API cost explosion |
| Use `gemini-2.0-flash` (not Pro) | ~10x cheaper per call |
| Batch line-item extraction in single prompt | 1 API call not N |

### 9.3 Performance Targets

| Operation | Target |
|---|---|
| Image upload + scan_id response | < 300ms |
| Full OCR + extraction (async) | < 8 seconds P95 |
| Draft approval → committed transaction | < 500ms |
| Draft list page load | < 200ms |

---

## 10. Risk Analysis

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **OCR misreads amounts** | Medium | 🔴 High — incorrect financial records | Mandatory user review; confidence indicators; never auto-commit |
| **AI hallucinates categories** | Medium | 🟡 Medium — wrong classification | Show AI confidence; user always edits; merchant memory overrides |
| **Duplicate transactions** | Low | 🔴 High — double-counted expenses | Heuristic duplicate detection (merchant+amount+date within 24h) |
| **Gemini API downtime** | Low | 🟡 Medium — feature unavailable | Graceful degradation; manual entry fallback; retry queue |
| **Cost escalation** | Medium | 🟡 Medium — unexpected API bills | Per-tenant rate limits; image compression; usage dashboards |
| **User trust erosion** | Low | 🔴 High — users stop using feature | Transparent confidence scoring; always show "what AI extracted" |
| **Prompt injection via receipt text** | Low | 🟡 Medium — malformed output | Sanitize OCR text; validate JSON schema; never execute extracted text |

---

## 11. Migration & Rollout Plan

### Phase 1: Database Migration (Non-Breaking)
- Add `receipt_scans`, `draft_transactions`, `merchant_mappings` tables
- No changes to existing tables
- **Impact on existing features: None**

### Phase 2: Backend Module
- Create `modules/receipt/` with full service-repository stack
- Register new BullMQ queue `receipt-scan`
- Extend `GeminiProvider` with enhanced extraction prompt
- Keep existing `POST /api/v1/ai/scan-receipt` working (deprecated, not removed)
- **Impact on existing features: None** — new endpoints only

### Phase 3: Frontend — Web
- Add `/tenant/receipt/` pages (scan, manual entry, drafts, review)
- Add "Scan Receipt" button to tenant sidebar navigation
- Add toast notification on OCR completion
- **Impact on existing features: None** — additive only

### Phase 4: Frontend — Flutter
- Add `features/receipt/` module (camera, manual entry, drafts, review)
- Add camera integration and upload flow
- Add push notification on OCR completion
- **Impact on existing features: None** — additive only

### Phase 5: Learning & Polish
- Enable merchant memory learning on approval
- Add duplicate detection
- Add draft expiration cron job
- **Remove** old `POST /api/v1/ai/scan-receipt` endpoint from `AiController`

### Rollout Strategy
- Feature flag: `receipt_scan_enabled` per tenant
- Soft launch to 10% of Business+ tenants
- Monitor: Gemini API costs, approval rates, user correction frequency
- Full rollout after 2-week validation

---

## 12. Integration with Existing Features

### What This Feature Does NOT Change

| Existing Feature | Impact |
|---|---|
| POS / Sales flow | ❌ No changes — POS remains independent |
| Manual journal entries | ❌ No changes — manual entry still works |
| Procurement / PO flow | ❌ No changes |
| Inventory management | ❌ No changes |
| AI Chat (business/personal) | ❌ No changes — separate endpoints |
| Promotions engine | ❌ No changes |
| Financial reports | ✅ Approved receipt transactions appear in reports (as normal transactions) |
| Existing scan-receipt endpoint | ⚠️ Deprecated but not removed — returns same format |

### New Domain Events Added

| Event | Trigger | Consumers |
|---|---|---|
| `ReceiptScanned` | Image processed by Gemini | Analytics, audit log |
| `DraftCreated` | AI generates draft transaction | Notification to user |
| `DraftApproved` | User confirms transaction | Cache invalidation, merchant memory update |
| `DraftRejected` | User rejects draft | Analytics (track rejection rate) |

---

## 13. Success Metrics

| Metric | Target | Measurement |
|---|---|---|
| OCR accuracy (amount field) | > 90% correct on first extraction | Compare AI value vs. user-approved value |
| Approval rate | > 70% of drafts approved without edits | `approved_count / total_drafts` |
| Time to approve | < 30 seconds from draft ready to approved | Timestamp diff |
| Feature adoption | > 40% of Business+ tenants use within 3 months | DAU of receipt scan |
| User correction rate | Decreasing over time per tenant | Track `user_corrections` JSONB |
| Duplicate detection accuracy | < 5% false positive rate | Manual review of flagged duplicates |
