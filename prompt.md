# Tumbuhin — Master Implementation Prompt

> **Purpose:** This file is the authoritative task prompt for completing the Tumbuhin platform.
> Use this file to instruct any AI coding assistant for any implementation task.
> **MANDATORY:** Before writing any code, read **ALL** files in `E:\tumbuhin\docs\` first.
> This document references those files — it does not replace them.

---

## ⚠️ CRITICAL RULES — READ BEFORE ANYTHING ELSE

These rules are non-negotiable and sourced from `docs/ai_rules.md` + `docs/security_rules.md`.
Any code that violates them must be rewritten before merging.

```
❌ NEVER: console.log() → Use this.logger.info/warn/error() (Pino)
❌ NEVER: `any` type in TypeScript → Define typed interfaces and DTOs
❌ NEVER: tenant_id from user input → ALWAYS from req.user.tenantId (JWT)
❌ NEVER: financial write without UnitOfWork.runInTransaction()
❌ NEVER: journal entry where |debit - credit| >= 0.01
❌ NEVER: skip RLS on new tables → Every table needs policy immediately
❌ NEVER: direct Supabase call from web frontend → use /lib/api/ only
❌ NEVER: cross-module service import → use EventBusService
❌ NEVER: AI auto-commit financial data → drafts require user approval
❌ NEVER: 'franchise' tier for personal account → block at service layer
❌ NEVER: old tier values ('starter', 'business', 'full', 'ai')
```

---

## 📐 PLATFORM IDENTITY

**Tumbuhin** is a multi-tenant SaaS ERP platform for Indonesian SMEs.

| Layer | Technology |
|---|---|
| Backend | NestJS 10 + TypeScript 5 + Supabase PostgreSQL + BullMQ + nestjs-pino |
| Web | Next.js 14 (App Router) + Tailwind CSS + Shadcn/UI + React Query |
| Mobile | Flutter 3 + Dart 3 + Riverpod 2 + Dio 5 |
| AI | Google Gemini 2.0 Flash — advisory only |
| Auth | Supabase Auth (JWT) |
| Queue | BullMQ (Redis) |

**Architecture:** Clean Architecture within a Modular Monolith.
**Layer order:** `Controller → Service → Repository → Database`

---

## 🎯 SUBSCRIPTION TIERS (CANONICAL)

```typescript
enum SubscriptionTier {
  FREE      = 'free',       // Personal & Business
  PRO       = 'pro',        // Personal & Business
  FRANCHISE = 'franchise',  // Business accounts ONLY
}
```

- **`free`** — POS (100/mo limit), 1 warehouse, basic inventory, no AI, owner only
- **`pro`** — Unlimited POS, multi-warehouse, AI chat + OCR, full accounting, staff RBAC
- **`franchise`** — All Pro + multi-branch management, consolidated reporting (**business `account_type` only**)

> ⚠️ If `account_type = 'personal'`, block any upgrade to `'franchise'` at the service layer.

---

## 🏗️ MANDATORY CODE PATTERNS

### Pattern 1 — Controller Endpoint

```typescript
@Post()
@RequireTier(SubscriptionTier.PRO)
@Roles('manager', 'kasir')
async create(
  @Body() dto: CreateSaleDto,
  @Request() req: AuthenticatedRequest,
): Promise<ApiResponse<SaleResponseDto>> {
  const result = await this.salesService.processSale(dto, req.user.tenantId, req.user.userId);
  return { success: true, data: result };
}
```

### Pattern 2 — DTO Validation

```typescript
export class CreateSaleDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];

  @IsEnum(PaymentMethod)
  payment_method: PaymentMethod;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @IsUUID()
  @IsOptional()
  idempotency_key?: string;
}
```

### Pattern 3 — Repository Query (ALWAYS filter tenant_id)

```typescript
async findByTenant(tenantId: string, params: QueryParams): Promise<Transaction[]> {
  const { data, error } = await this.supabase.client
    .from('transactions')
    .select('*, sale_items(*)')
    .eq('tenant_id', tenantId)   // MANDATORY — never omit
    .order('created_at', { ascending: false })
    .range(params.offset, params.offset + params.limit - 1);

  if (error) throw new InternalServerErrorException(error.message);
  return data ?? [];
}
```

### Pattern 4 — Financial Write (UnitOfWork)

```typescript
return this.unitOfWork.runInTransaction(async (client) => {
  const tx = await this.salesRepo.create(dto, client);
  await this.inventoryRepo.deductStock(dto.items, client);
  const journal = await this.accountingService.createJournalEntry(journalDto, client);
  return { transaction_id: tx.id, journal_id: journal.id };
});
```

### Pattern 5 — Error Throwing

```typescript
throw new UnprocessableEntityException({
  code: 'INSUFFICIENT_STOCK',
  message: `Stok tidak mencukupi untuk ${productName}`,
  details: { product_id, required, available },
});
```

### Pattern 6 — Standard Response Envelope

```json
{ "success": true, "data": {}, "meta": { "page": 1, "per_page": 20, "total": 150 } }
{ "success": false, "error": { "code": "INSUFFICIENT_STOCK", "message": "...", "details": {} }, "trace_id": "..." }
```

### Pattern 7 — Logging (Pino — no console.log)

```typescript
this.logger.info({ traceId, tenantId, action: 'sale_processed', duration }, 'Sale processed');
this.logger.error({ err: error, tenantId, traceId }, 'Sale processing failed');
```

### Pattern 8 — DB Migration Template

```sql
-- NNN_description.sql
CREATE TYPE IF NOT EXISTS new_type AS ENUM (...);

CREATE TABLE IF NOT EXISTS new_table (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    -- ... columns ...
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_new_table_tenant ON new_table(tenant_id, created_at DESC);

ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;
CREATE POLICY new_table_tenant_isolation ON new_table
    FOR ALL USING (tenant_id = get_auth_tenant_id());
```

### Pattern 9 — Web API Call (lib/api/)

```typescript
// lib/api/receiptService.ts
export async function getDrafts(page = 1): Promise<ApiResponse<DraftTransaction[]>> {
  return apiGet(`/api/v1/receipt/drafts?page=${page}`);
}

// In a hook — never call Supabase directly for business data
export function useDrafts(page: number) {
  return useQuery({
    queryKey: ['drafts', page],
    queryFn: () => getDrafts(page),
  });
}
```

### Pattern 10 — Flutter API Call (ApiClient)

```dart
// In a repository
Future<List<DraftTransaction>> getDrafts() async {
  final response = await _apiClient.get('/api/v1/receipt/drafts');
  return (response.data['data'] as List)
      .map((e) => DraftTransaction.fromJson(e))
      .toList();
}

// In a Riverpod provider
final draftsProvider = FutureProvider<List<DraftTransaction>>((ref) {
  return ref.read(receiptRepositoryProvider).getDrafts();
});
```

---

## 📋 IMPLEMENTATION TASK LIST

### PHASE A — Database Migrations (Run first)

#### A1. Fix Enum Migration
```sql
-- Run this on Supabase to align the DB enum with the canonical values
-- Old: ('starter','business','pro') or ('free','business','ai')
-- New: ('free','pro','franchise')
ALTER TYPE subscription_tier RENAME TO subscription_tier_old;
CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'franchise');
-- Migrate existing data
ALTER TABLE tenants ALTER COLUMN tier TYPE subscription_tier
    USING CASE tier::text
        WHEN 'starter' THEN 'free'::subscription_tier
        WHEN 'business' THEN 'pro'::subscription_tier
        WHEN 'pro' THEN 'pro'::subscription_tier
        WHEN 'free' THEN 'free'::subscription_tier
        ELSE 'free'::subscription_tier
    END;
DROP TYPE subscription_tier_old;
```

#### A2. Run Receipt Module Migration
File: `backend/src/core/database/migrations/007_receipt_module.sql`
Creates: `receipt_scans`, `draft_transactions`, `merchant_mappings`
All three tables need: `tenant_id`, timestamps, RLS policy, indexes.

#### A3. Add Franchise Constraint
```sql
ALTER TABLE tenants ADD CONSTRAINT chk_franchise_requires_business
    CHECK (tier != 'franchise' OR account_type = 'business');
```

#### A4. Fix Journal Lines FK
```sql
ALTER TABLE journal_lines
    ADD CONSTRAINT IF NOT EXISTS fk_journal_lines_entry
    FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id) ON DELETE CASCADE;
```

#### A5. Add Missing Composite Indexes
```sql
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_tenant_date
    ON transactions(tenant_id, transaction_date DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_journal_entries_tenant_date
    ON journal_entries(tenant_id, transaction_date DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_journal_lines_entry_account
    ON journal_lines(journal_entry_id, account_id);
```

---

### PHASE B — Backend: TypeScript Enum Fix

#### B1. Update SubscriptionTier Enum
**File:** `backend/src/core/constants/subscription-tier.enum.ts`

```typescript
export enum SubscriptionTier {
  FREE      = 'free',
  PRO       = 'pro',
  FRANCHISE = 'franchise',
}
```

#### B2. Verify TierGuard uses new values
**File:** `backend/src/core/guards/tier.guard.ts`
- Ensure it reads `tenant.tier` from DB and compares against `SubscriptionTier` enum
- Ensure `FRANCHISE` blocks `account_type = 'personal'`

```typescript
if (requiredTier === SubscriptionTier.FRANCHISE && tenant.account_type === 'personal') {
  throw new ForbiddenException({
    code: 'TIER_RESTRICTION',
    message: 'Franchise tier is only available for business accounts',
  });
}
```

---

### PHASE C — Backend: Receipt Module

**Module:** `backend/src/modules/receipt/`

#### C1. receipt.module.ts
Register: `ReceiptController`, `ReceiptScanService`, `ReceiptExtractionService`,
`DraftTransactionService`, `MerchantMemoryService`, `DuplicateDetectionService`,
`ReceiptRepository`, `ReceiptScanProcessor`, `BullModule.registerQueue({ name: 'receipt-scan' })`

#### C2. receipt.controller.ts
All endpoints require `@RequireTier(SubscriptionTier.PRO)` minimum.
Approval requires `@Roles('manager')` only.

```
POST   /api/v1/receipt/scan                → ReceiptScanService.handleUpload()
GET    /api/v1/receipt/scan/:id            → ReceiptScanService.getStatus()
POST   /api/v1/receipt/drafts              → DraftTransactionService.createManual()
GET    /api/v1/receipt/drafts              → DraftTransactionService.listByTenant()
GET    /api/v1/receipt/drafts/:id          → DraftTransactionService.getById()
PATCH  /api/v1/receipt/drafts/:id          → DraftTransactionService.update()
POST   /api/v1/receipt/drafts/:id/approve  → DraftTransactionService.approveDraft()
POST   /api/v1/receipt/drafts/:id/reject   → DraftTransactionService.rejectDraft()
GET    /api/v1/receipt/merchants           → MerchantMemoryService.list()
```

#### C3. receipt-scan.service.ts
- Validates file (JPEG/PNG/HEIC, max 10MB)
- Uploads to Supabase Storage: `receipt-scans/{tenantId}/{scanId}.jpg`
- Creates `receipt_scans` record (status: `'processing'`)
- Enqueues BullMQ job: `receipt-scan` queue
- Returns `{ scanId, status: 'processing' }` immediately (< 300ms)

#### C4. receipt-extraction.service.ts
- Calls Gemini 2.0 Flash with multimodal input (image + system prompt)
- System prompt is Indonesian-first
- Parses response into typed `ExtractionResult` with confidence levels
- Returns `ExtractionResult` — never commits to DB directly

Confidence levels:
- `high` ≥ 0.85, `medium` 0.50–0.84, `low` < 0.50

#### C5. receipt-scan.processor.ts (BullMQ)
```typescript
@Processor('receipt-scan')
export class ReceiptScanProcessor {
  @Process()
  async processJob(job: Job<ReceiptScanJobPayload>) {
    // 1. Download image from Supabase Storage
    // 2. Call ReceiptExtractionService.extract(imageBuffer)
    // 3. Call MerchantMemoryService.recommend(tenantId, merchantName)
    // 4. Call DuplicateDetectionService.check(tenantId, amount, date, merchant)
    // 5. Update receipt_scans SET status='completed', extracted_data=...
    // 6. Create draft_transactions SET status='ready'
    // 7. EventBusService.emit('ReceiptScanned', { tenantId, draftId })
  }
}
```

#### C6. draft-transaction.service.ts
**`approveDraft()` — CRITICAL PATH:**
```typescript
async approveDraft(draftId: string, userId: string): Promise<{ journal_id: string }> {
  const draft = await this.repo.getDraft(draftId);

  if (draft.status !== 'ready') throw new UnprocessableEntityException({ code: 'INVALID_DRAFT_STATUS' });
  if (!draft.debit_account_id || !draft.credit_account_id) {
    throw new UnprocessableEntityException({ code: 'MISSING_ACCOUNT_MAPPING' });
  }

  return this.unitOfWork.runInTransaction(async (client) => {
    const journal = await this.accountingService.createJournalEntry({
      tenantId: draft.tenant_id,
      transactionDate: draft.transaction_date,
      description: `Pengeluaran: ${draft.merchant_name}`,
      lines: [
        { account_id: draft.debit_account_id, debit: draft.total_amount, credit: 0 },
        { account_id: draft.credit_account_id, debit: 0, credit: draft.total_amount },
      ],
    }, client);

    await this.repo.updateDraft(draftId, {
      status: 'approved',
      approved_at: new Date().toISOString(),
      approved_by: userId,
      resulting_journal_id: journal.id,
    }, client);

    await this.merchantMemoryService.learn(draft.tenant_id, {
      merchantName: draft.merchant_name,
      category: draft.category,
      accountId: draft.debit_account_id,
    });

    return { journal_id: journal.id };
  });
}
```

#### C7. merchant-memory.service.ts
- `recommend(tenantId, merchantName)` → query `merchant_mappings`, return best match
- `learn(tenantId, data)` → upsert `merchant_mappings`, increment `approval_count`
- Uses Redis cache key: `merchant:{tenantId}:{normalizedName}` with 15-min TTL

#### C8. DTOs Required
- `create-manual-draft.dto.ts` — merchant_name, total_amount, transaction_date, category, notes, tags
- `update-draft.dto.ts` — all fields optional, debit_account_id, credit_account_id required for approval
- `approve-draft.dto.ts` — empty body (approval is by ID only)
- `reject-draft.dto.ts` — optional rejection_reason

---

### PHASE D — Backend: Remaining Module Fixes

#### D1. SalesModule — Enforce Tier Limit
```typescript
// In SalesService.processSale()
if (tenant.tier === SubscriptionTier.FREE) {
  const monthlyCount = await this.salesRepo.countThisMonth(tenantId);
  if (monthlyCount >= 100) {
    throw new ForbiddenException({ code: 'TRANSACTION_LIMIT', message: 'Batas transaksi bulanan tercapai' });
  }
}
```

#### D2. BusinessProfileModule — Block Franchise Upgrade
```typescript
// In BusinessProfileService.upgradeTier()
if (dto.tier === SubscriptionTier.FRANCHISE && tenant.account_type === 'personal') {
  throw new ForbiddenException({
    code: 'TIER_RESTRICTION',
    message: 'Tier franchise hanya tersedia untuk akun bisnis',
  });
}
```

#### D3. OnboardingModule — Fix Tier Default
Ensure `handle_new_user()` DB function sets `tier = 'free'` (not `'starter'`):
```sql
-- Update the Supabase function handle_new_user()
-- Change: tier = 'starter' → tier = 'free'
```

#### D4. ReportModule — Add Balance Sheet Guard
Balance sheet endpoint must be: `@RequireTier(SubscriptionTier.PRO)`
```typescript
@Get('balance-sheet')
@RequireTier(SubscriptionTier.PRO)
@Roles('manager')
async getBalanceSheet(@Request() req: AuthenticatedRequest) { ... }
```

#### D5. Remove Console.log
Search and replace all `console.log` in `backend/src/` with proper Pino logger calls:
```bash
# Find all console.log occurrences
grep -rn "console.log" backend/src/ --include="*.ts"
```

---

### PHASE E — Web Frontend (Next.js)

#### E1. Receipt Feature Pages
Create:
- `web/src/app/tenant/receipt/page.tsx` — Draft list with status tabs (ready/approved/rejected)
- `web/src/app/tenant/receipt/scan/page.tsx` — Drag-and-drop upload + camera
- `web/src/app/tenant/receipt/manual/page.tsx` — Manual expense entry form
- `web/src/app/tenant/receipt/[id]/page.tsx` — Draft review: confidence indicators + account mapping + approve/reject

#### E2. API Service Functions
**File:** `web/src/lib/api/receiptService.ts`
```typescript
export const receiptService = {
  uploadScan:    (formData: FormData) => apiPost('/api/v1/receipt/scan', formData),
  getScanStatus: (scanId: string) => apiGet(`/api/v1/receipt/scan/${scanId}`),
  listDrafts:    (params: DraftQueryParams) => apiGet('/api/v1/receipt/drafts', params),
  getDraft:      (id: string) => apiGet(`/api/v1/receipt/drafts/${id}`),
  updateDraft:   (id: string, dto: UpdateDraftDto) => apiPatch(`/api/v1/receipt/drafts/${id}`, dto),
  approveDraft:  (id: string) => apiPost(`/api/v1/receipt/drafts/${id}/approve`),
  rejectDraft:   (id: string, reason?: string) => apiPost(`/api/v1/receipt/drafts/${id}/reject`, { reason }),
};
```

#### E3. React Query Hooks
**File:** `web/src/hooks/use-receipt.ts`
```typescript
export function useDrafts(status?: string) {
  return useQuery({ queryKey: ['drafts', status], queryFn: () => receiptService.listDrafts({ status }) });
}
export function useDraftMutation() {
  const qc = useQueryClient();
  return {
    approve: useMutation({ mutationFn: receiptService.approveDraft, onSuccess: () => qc.invalidateQueries(['drafts']) }),
    reject:  useMutation({ mutationFn: ({ id, reason }) => receiptService.rejectDraft(id, reason), onSuccess: () => qc.invalidateQueries(['drafts']) }),
  };
}
```

#### E4. Confidence Indicator Component
**File:** `web/src/components/receipt/ConfidenceIndicator.tsx`
```tsx
// Props: confidence: 'high' | 'medium' | 'low'
// Renders: green/yellow/red badge with label
```

#### E5. Remove Direct Supabase Business Calls
Search for any `supabase.from(...)` calls in `web/src/` outside of `lib/supabase/` auth context.
Replace all with `apiGet()` / `apiPost()` via `lib/api/` services.

#### E6. Subscription Tier Page
**File:** `web/src/app/tenant/subscription/page.tsx`
- Show current tier badge
- For `personal` account_type: show Free and Pro upgrade options only (hide Franchise)
- For `business` account_type: show all three tiers
- Call Midtrans for payment when upgrading

---

### PHASE F — Flutter Mobile

#### F1. Receipt Feature Module
Create `lib/features/receipt/` with full structure:

```
lib/features/receipt/
├── data/
│   ├── receipt_repository.dart   ← ApiClient calls
│   └── receipt_models.dart       ← DraftTransaction, ReceiptScan, MerchantMapping
├── presentation/
│   ├── screens/
│   │   ├── receipt_scan_screen.dart     ← Camera + file picker
│   │   ├── receipt_drafts_screen.dart   ← Draft list with filters
│   │   ├── manual_entry_screen.dart     ← Manual form
│   │   └── draft_review_screen.dart     ← Confidence UI + approve/reject
│   ├── widgets/
│   │   ├── confidence_indicator.dart    ← Color-coded badge
│   │   ├── ai_suggestion_chip.dart      ← Tappable AI suggestion
│   │   └── receipt_image_preview.dart   ← Zoomable image viewer
│   └── providers/
│       └── receipt_provider.dart        ← Riverpod AsyncNotifier
```

**receipt_repository.dart:**
```dart
class ReceiptRepository {
  final ApiClient _apiClient;

  Future<ReceiptScan> uploadScan(File image) async {
    final formData = FormData.fromMap({
      'image': await MultipartFile.fromFile(image.path),
    });
    final response = await _apiClient.dio.post('/api/v1/receipt/scan', data: formData);
    return ReceiptScan.fromJson(response.data['data']);
  }

  Future<DraftTransaction> getDraft(String id) async {
    final response = await _apiClient.get('/api/v1/receipt/drafts/$id');
    return DraftTransaction.fromJson(response.data['data']);
  }

  Future<void> approveDraft(String id) async {
    await _apiClient.post('/api/v1/receipt/drafts/$id/approve');
  }
}
```

#### F2. Add Receipt Routes
**File:** `lib/core/router/app_router.dart`
Add routes:
```dart
GoRoute(path: '/receipt', builder: (_, __) => const ReceiptDraftsScreen()),
GoRoute(path: '/receipt/scan', builder: (_, __) => const ReceiptScanScreen()),
GoRoute(path: '/receipt/manual', builder: (_, __) => const ManualEntryScreen()),
GoRoute(path: '/receipt/:id', builder: (context, state) => DraftReviewScreen(id: state.pathParameters['id']!)),
```

#### F3. Add Receipt to Bottom Navigation
**File:** `lib/shared/widgets/main_shell.dart`
Add receipt icon to nav bar for Pro+ tier. Show upsell dialog for Free tier.

#### F4. Fix SharedPreferences → flutter_secure_storage
Search for any `SharedPreferences` usage storing tokens or sensitive data.
Replace all with `flutter_secure_storage`.

---

### PHASE G — Testing

#### G1. Unit Tests — Financial Critical (95% coverage required)
- `SalesService.processSale()` — all paths including INSUFFICIENT_STOCK, JOURNAL_IMBALANCE
- `DraftTransactionService.approveDraft()` — success, missing account, rollback
- `AccountingService.createJournalEntry()` — balance validation

Test pattern:
```typescript
describe('DraftTransactionService', () => {
  it('should rollback if journal creation fails', async () => {
    mockAccountingService.createJournalEntry.mockRejectedValue(new Error('JOURNAL_IMBALANCE'));
    await expect(service.approveDraft('draft-id', 'user-id')).rejects.toThrow();
    expect(mockRepo.updateDraft).not.toHaveBeenCalledWith(
      expect.any(String), expect.objectContaining({ status: 'approved' })
    );
  });
});
```

#### G2. Controller Integration Tests (All 15 endpoints)
Every controller must have: success case, 401 unauthenticated, 403 wrong tier, 403 wrong role, 400 validation error.

#### G3. E2E Tests — 6 P0 Flows (Playwright)
Files in `e2e/`:
- `registration.spec.ts` — Sign up → onboarding → dashboard
- `pos-sale.spec.ts` — Add products → checkout → journal created
- `stock-management.spec.ts` — Raw material → recipe → stock deducted on sale
- `receipt-scan.spec.ts` — Upload → process → review → approve → journal
- `financial-report.spec.ts` — Generate P&L → verify numbers
- `subscription-upgrade.spec.ts` — Free → Pro → features unlock

---

### PHASE H — Code Quality

#### H1. Remove all `console.log`
```bash
grep -rn "console.log" backend/src/ --include="*.ts"
grep -rn "print(" lib/ --include="*.dart"  # Replace non-debug prints
```

#### H2. Remove all `any` types
```bash
grep -rn ": any" backend/src/ --include="*.ts"
grep -rn "as any" backend/src/ --include="*.ts"
```

#### H3. Fix Coding Standards enum example in `docs/coding_standards.md`
```typescript
// Update the enum example to use new canonical values:
enum SubscriptionTier {
  FREE      = 'free',
  PRO       = 'pro',
  FRANCHISE = 'franchise',
}
```

---

## 📁 DOCS REFERENCE MAP

When implementing any feature, cross-reference these docs:

| Task | Read This Doc |
|---|---|
| Any new endpoint | `docs/api_contract.md` — response envelope, status codes |
| Any new DB table | `docs/database_schema.md` — conventions, RLS template |
| Any financial write | `docs/backend_architecture.md` — UnitOfWork pattern |
| Tier/role guards | `docs/security_rules.md` — guard chain, tier matrix |
| AI/OCR feature | `docs/ocr_ai_transaction_planning.md` — full pipeline spec |
| Product with variants | `docs/adr/004_universal_product_engine.md` |
| Industry config | `docs/adr/005_industry_profile_config.md` |
| Add-ons/modifiers | `docs/adr/006_variants_and_addons.md` |
| New module | `docs/coding_standards.md` — structure, naming |
| Web page | `docs/frontend_architecture.md` — component patterns |
| Flutter screen | `docs/frontend_architecture.md` — Riverpod patterns |
| Test file | `docs/test_strategy.md` — test patterns, coverage gates |
| CI/CD | `docs/deployment.md` — pipeline, health checks |

---

## ✅ PRE-FLIGHT CHECKLIST

Before marking any task complete, verify:

- [ ] All new tables have `tenant_id`, timestamps, indexes, RLS
- [ ] All endpoints have `@RequireTier()` + `@Roles()` decorators
- [ ] All financial writes use `UnitOfWork.runInTransaction()`
- [ ] All DTOs have `class-validator` decorators, no `any` type
- [ ] All repositories filter by `tenant_id` in every query
- [ ] No `console.log` — Pino logger only
- [ ] Response envelope: `{ success, data }` or `{ success, error, trace_id }`
- [ ] Error codes: `SCREAMING_SNAKE_CASE`
- [ ] Web: data fetching through `lib/api/` only, not direct Supabase
- [ ] Flutter: HTTP through `ApiClient` (Dio), tokens in `flutter_secure_storage`
- [ ] `franchise` tier blocked for `account_type = 'personal'`
- [ ] Tests written: unit (80%+), integration (all controllers), E2E (P0 flows)
- [ ] Migration: `IF NOT EXISTS` guards, includes enum enum changes
