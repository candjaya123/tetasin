# Tumbuhin — Coding Standards

> **Document Purpose:** Engineering conventions and code quality standards for all layers.
> **Who Should Read This:** All engineers and AI coding assistants.
> **Enforcement:** These standards are enforced by ESLint, TypeScript strict mode, and Prettier pre-commit hooks.

---

## 1. Naming Conventions

### 1.1 Files and Folders (Backend)

```
backend/src/modules/sales/
├── sales.module.ts
├── controllers/
│   └── sales.controller.ts
├── services/
│   └── sales.service.ts
├── repositories/
│   └── sales.repository.ts
├── domain/
│   ├── sale.entity.ts
│   └── sale-created.event.ts
└── dto/
    ├── create-sale.dto.ts
    └── sale-response.dto.ts
```

**Rules:**
- Files: `kebab-case.type.ts`
- Directories: `kebab-case` (plural for collections: `controllers/`, `services/`)
- Test files: `*.spec.ts` in the same directory as the file they test

### 1.2 TypeScript Identifiers

```typescript
// Classes: PascalCase
class SalesService {}
class CreateSaleDto {}
class JournalImbalanceException {}

// Interfaces: PascalCase (no "I" prefix)
interface SaleResult {}
interface TenantContext {}

// Methods and variables: camelCase
async processSale(dto: CreateSaleDto): Promise<SaleResult> {}
const totalAmount = items.reduce(...);

// Constants: SCREAMING_SNAKE_CASE
const MAX_TRANSACTIONS_PER_MONTH = 500;
const JOURNAL_IMBALANCE_THRESHOLD = 0.01;

// Enums: PascalCase name, SCREAMING_SNAKE_CASE values
enum SubscriptionTier {
  STARTER = 'starter',
  BUSINESS = 'business',
  PRO = 'pro',
}

// Private class members: camelCase (no underscore prefix)
private readonly supabaseService: SupabaseService;
```

### 1.3 Database

```sql
-- Tables: snake_case, plural
transactions, journal_entries, chart_of_accounts, draft_transactions

-- Columns: snake_case
tenant_id, created_at, updated_at, is_active, total_amount

-- Enums: snake_case values
CREATE TYPE subscription_tier AS ENUM ('starter', 'business', 'pro');

-- Indexes: idx_<table>_<column(s)>
CREATE INDEX idx_transactions_tenant_date ON transactions(tenant_id, created_at DESC);

-- Functions: snake_case
process_sale(), refresh_ledger_analytics()

-- Constraints: fk_<table>_<column>, uq_<table>_<column>
CONSTRAINT fk_journal_lines_entry FOREIGN KEY (journal_entry_id) ...
CONSTRAINT uq_accounts_tenant_code UNIQUE (tenant_id, code)
```

---

## 2. Folder Structure

### 2.1 Backend Module Pattern

Every NestJS module MUST follow this structure:

```
module-name/
├── module-name.module.ts     ← REQUIRED
├── controllers/              ← HTTP handlers only
├── services/                 ← Business logic
├── repositories/             ← DB queries
├── domain/                   ← Entities, value objects, events
└── dto/                      ← Request/Response DTOs
```

**Import rules:**
- Controllers import only Services
- Services import only Repositories and Domain entities
- Repositories import only the DB client (SupabaseService)
- Domain entities are pure TypeScript with zero dependencies

### 2.2 Web (Next.js) Structure

```
src/
├── app/
│   ├── (auth)/               ← Auth-gated routes group
│   ├── (marketing)/          ← Public routes group
│   ├── admin/                ← Admin-only routes
│   └── tenant/               ← Tenant dashboard routes
├── components/
│   ├── ui/                   ← Shadcn base components (do not modify)
│   ├── common/               ← Shared layout components
│   ├── [feature]/            ← Feature-specific components
│   └── forms/                ← Form components
├── hooks/                    ← Custom React hooks
├── lib/
│   ├── api/                  ← Centralized API client functions
│   ├── utils/                ← Pure utility functions
│   └── constants/            ← App-wide constants
└── types/                    ← TypeScript type definitions
```

### 2.3 Flutter Structure

```
lib/
├── core/
│   ├── router/               ← go_router configuration
│   ├── theme/                ← Design tokens, colors, typography
│   ├── api/                  ← ApiClient (Dio), interceptors
│   └── config/               ← App configuration
├── features/
│   └── [feature]/
│       ├── data/
│       │   ├── models/       ← Data classes / DTOs
│       │   └── services/     ← API calls via ApiClient
│       ├── domain/
│       │   └── entities/     ← Business entities
│       └── presentation/
│           ├── screens/      ← Full screens
│           ├── widgets/      ← Feature-specific widgets
│           └── providers/    ← Riverpod state management
└── shared/
    ├── widgets/              ← Reusable UI components
    └── utils/                ← Utilities
```

---

## 3. Code Quality Standards

### 3.1 Backend (NestJS)

```typescript
// ✅ CORRECT: Typed DTOs with full validation
import { IsString, IsNumber, IsUUID, Min } from 'class-validator';

export class CreateSaleItemDto {
  @IsUUID()
  product_id: string;

  @IsNumber()
  @Min(0.001)
  quantity: number;

  @IsNumber()
  @Min(0)
  unit_price: number;
}

// ✅ CORRECT: Typed business exception with error code
import { UnprocessableEntityException } from '@nestjs/common';
throw new UnprocessableEntityException({
  code: 'INSUFFICIENT_STOCK',
  message: `Insufficient stock for ${productName}`,
  details: { product_id, required, available },
});

// ✅ CORRECT: Injected Pino logger
constructor(@InjectPinoLogger() private readonly logger: PinoLogger) {}
this.logger.info({ tenantId, transactionId, action: 'sale_processed' }, 'Sale processed');

// ✅ CORRECT: Typed return
async processSale(dto: CreateSaleDto): Promise<SaleResponseDto> {}
```

### 3.2 Web (Next.js / TypeScript)

```typescript
// ✅ CORRECT: API calls through centralized client
import { apiGet, apiPost } from '@/lib/api/client';
const { data } = await apiPost<SaleResponse>('/api/v1/sales', payload);

// ✅ CORRECT: Typed API responses
interface SaleResponse { transaction_id: string; total_amount: number; }

// ✅ CORRECT: Custom hook for data fetching
function useSales(params: SalesQueryParams) {
  return useQuery({
    queryKey: ['sales', params],
    queryFn: () => getSales(params),
  });
}
```

### 3.3 Flutter (Dart)

```dart
// ✅ CORRECT: Service calls through Dio ApiClient
class ReceiptService {
  final ApiClient _client;
  Future<DraftTransaction> getDraft(String id) async {
    final response = await _client.dio.get('/api/v1/receipt/drafts/$id');
    return DraftTransaction.fromJson(response.data['data']);
  }
}

// ✅ CORRECT: Error handling with typed exceptions
try {
  final result = await _repository.approveDraft(id);
} on ApiException catch (e) {
  if (e.code == 'JOURNAL_IMBALANCE') { ... }
}
```

---

## 4. Error Handling

### 4.1 Backend Exception Hierarchy

```typescript
import {
  BadRequestException,          // 400: Validation failures
  UnauthorizedException,        // 401: Auth failures
  ForbiddenException,           // 403: Tier/Role restrictions
  NotFoundException,            // 404: Resource not found
  ConflictException,            // 409: Duplicate resource / idempotency
  UnprocessableEntityException, // 422: Business logic failures
  InternalServerErrorException  // 500: Unhandled exceptions only
} from '@nestjs/common';

// Business logic failures always use UnprocessableEntityException with error code:
throw new UnprocessableEntityException({
  code: 'JOURNAL_IMBALANCE',
  message: 'Journal entry debits do not equal credits',
  details: { debit: totalDebit, credit: totalCredit }
});
```

All exceptions are caught by `GlobalExceptionFilter` in `core/exceptions/` and transformed to the standard error envelope.

---

## 5. Logging Strategy

```typescript
// Required log fields for all structured log entries
this.logger.info({
  traceId,          // From TraceIdMiddleware on every request
  tenantId,         // Always for tenant-scoped operations
  userId,           // When user-triggered
  action,           // e.g., 'sale_processed', 'journal_created', 'draft_approved'
  duration,         // ms for performance monitoring
}, 'Human-readable message in English lowercase');

// Error logging MUST include the full error object
this.logger.error({ err: error, tenantId, traceId }, 'Sale processing failed');
```

**Log levels:** `error` > `warn` > `info`  
**Production:** `error`, `warn`, `info` only  
**Development:** all levels with `pino-pretty`

---

## 6. Testing Standards

| Type | Framework | Minimum Coverage | When |
|---|---|---|---|
| Unit | Jest | 80% (accounting: 95%, sales: 90%) | Every service method |
| Integration | Jest + Supertest | All 15 controllers | Every controller |
| E2E | Playwright (web), Flutter test (mobile) | 6 P0 critical flows | Before every release |
| Load | k6 | POS endpoint | Quarterly |

```typescript
// Unit test pattern
describe('SalesService', () => {
  describe('processSale', () => {
    it('should create journal entry when stock is sufficient', async () => { ... });
    it('should throw INSUFFICIENT_STOCK when stock is low', async () => { ... });
    it('should rollback on journal imbalance', async () => { ... });
  });
});
```

---

## 7. PR Checklist

Before any PR is merged:
- [ ] Unit tests pass (100%)
- [ ] Coverage ≥ 80% for modified files
- [ ] Integration tests pass
- [ ] No `console.log` in production code
- [ ] No `any` TypeScript types
- [ ] API contract unchanged (or version bumped)
- [ ] No cross-module internal imports
- [ ] All DTOs have `class-validator` decorators
