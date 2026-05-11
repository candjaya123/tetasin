# Tumbuhin — Coding Standards

> **Document Purpose:** Defines engineering conventions and code quality standards for all layers.
> **Who Should Read This:** All engineers and AI coding assistants.
> **Why It Matters:** Consistency across teams and AI-generated code is critical for long-term maintainability.

---

## 1. Current Problems

| Problem | Severity | Description |
|---|---|---|
| No enforced code style guide | 🟡 Medium | Each file varies in formatting, import order, and naming |
| Debug scripts in `src/` (e.g., `debug_ai.js`, `check_cols.js`) | 🟡 Medium | Non-production scripts pollute the source tree |
| Mixed JS and TS files in backend `src/` | 🟡 Medium | `add_stock_col.js`, `check_cols.js` in `/backend/src/` |
| No consistent error handling pattern | 🟡 Medium | Some services throw raw strings, others throw typed exceptions |
| No logging standards — unstructured console.log mixed with Pino | 🟡 Medium | Breaks log aggregation |
| Inconsistent DTO validation — some endpoints lack `class-validator` | 🟡 Medium | Security and data integrity risk |

---

## 2. Naming Conventions

### 2.1 Files and Folders

```
backend/src/modules/sales/
├── sales.module.ts          ← kebab-case, descriptive
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
- Test files: `*.spec.ts` alongside the file they test

### 2.2 TypeScript Identifiers

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

### 2.3 Database

```sql
-- Tables: snake_case, plural
transactions, journal_entries, chart_of_accounts

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

## 3. Folder Structure Rules

### 3.1 Backend Module Pattern

Every NestJS module MUST follow this structure:
```
module-name/
├── module-name.module.ts     ← REQUIRED
├── controllers/              ← HTTP only
├── services/                 ← Business logic
├── repositories/             ← DB queries
├── domain/                   ← Entities, value objects, events
└── dto/                      ← Request/Response DTOs
```

**Rules:**
- Controllers import only Services (never Repositories)
- Services import only Repositories and Domain entities
- Repositories import only the DB client
- Domain entities are pure TypeScript with no dependencies

### 3.2 Web (Next.js) Structure

```
src/
├── app/
│   ├── (auth)/               ← Auth-gated routes group
│   ├── (marketing)/          ← Public routes group
│   ├── admin/                ← Admin-only routes
│   └── tenant/               ← Tenant dashboard routes
├── components/
│   ├── ui/                   ← Shadcn base components (do not edit)
│   ├── common/               ← Shared layout components
│   ├── [feature]/            ← Feature-specific components
│   └── forms/                ← Form components
├── hooks/                    ← Custom React hooks
├── lib/
│   ├── api/                  ← API client functions
│   ├── utils/                ← Pure utility functions
│   └── constants/            ← App-wide constants
└── types/                    ← TypeScript type definitions
```

### 3.3 Flutter Structure

```
lib/
├── core/
│   ├── router/               ← go_router configuration
│   ├── theme/                ← Design tokens, colors, typography
│   └── config/               ← App configuration
├── features/
│   └── [feature]/
│       ├── data/
│       │   ├── models/       ← Data classes / DTOs
│       │   └── services/     ← API calls
│       ├── domain/
│       │   └── entities/     ← Business entities
│       └── presentation/
│           ├── screens/      ← Full screens
│           ├── widgets/      ← Feature-specific widgets
│           └── providers/    ← State management
└── shared/
    ├── widgets/              ← Reusable UI components
    └── utils/                ← Utilities
```

---

## 4. Code Quality Rules

### 4.1 Backend (NestJS)

```typescript
// ✅ CORRECT: Typed DTOs with validation
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

// ✅ CORRECT: Typed error throwing
import { UnprocessableEntityException } from '@nestjs/common';
throw new UnprocessableEntityException({
  code: 'INSUFFICIENT_STOCK',
  message: `Insufficient stock for ${productName}`,
});

// ❌ FORBIDDEN: Raw string errors
throw new Error('insufficient stock');

// ✅ CORRECT: Use injected logger (Pino)
constructor(@InjectPinoLogger() private readonly logger: PinoLogger) {}
this.logger.info({ tenantId, transactionId }, 'Sale processed');

// ❌ FORBIDDEN: console.log in production code
console.log('Sale processed');

// ✅ CORRECT: Return typed response
async processSale(dto: CreateSaleDto): Promise<SaleResponseDto> {}

// ❌ FORBIDDEN: Return 'any'
async processSale(dto: any): Promise<any> {}
```

### 4.2 Web (Next.js / TypeScript)

```typescript
// ✅ CORRECT: API calls through centralized client
import { apiClient } from '@/lib/api/client';
const { data } = await apiClient.post('/sales', payload);

// ❌ FORBIDDEN: Direct Supabase access from pages
const { data } = await supabase.from('transactions').select('*');

// ✅ CORRECT: Typed API responses
interface SaleResponse { transaction_id: string; total_amount: number; }
const result: SaleResponse = await createSale(dto);

// ✅ CORRECT: Custom hooks for data fetching
function useSales(params: SalesQueryParams) {
  return useQuery({ queryKey: ['sales', params], queryFn: () => getSales(params) });
}
```

### 4.3 Flutter (Dart)

```dart
// ✅ CORRECT: Service calls through repository layer
class TransactionRepository {
  final ApiClient _client;
  Future<Transaction> createSale(CreateSaleRequest request) async { ... }
}

// ✅ CORRECT: Error handling with typed exceptions
try {
  final result = await _repository.createSale(request);
} on ApiException catch (e) {
  if (e.code == 'INSUFFICIENT_STOCK') { ... }
}

// ❌ FORBIDDEN: Direct http calls in widgets
final response = await http.post(Uri.parse('http://api.../sales'), ...);
```

---

## 5. Error Handling Rules

### 5.1 Backend Exception Hierarchy

```typescript
// Use NestJS built-in exceptions for HTTP layer
import { 
  BadRequestException,       // 400: Validation failures
  UnauthorizedException,     // 401: Auth failures
  ForbiddenException,        // 403: Tier/Role restrictions
  NotFoundException,         // 404: Resource not found
  ConflictException,         // 409: Duplicate resource
  UnprocessableEntityException, // 422: Business logic failures
  InternalServerErrorException  // 500: Unhandled exceptions only
} from '@nestjs/common';

// Business logic exceptions always use UnprocessableEntityException with error code
throw new UnprocessableEntityException({
  code: 'JOURNAL_IMBALANCE',
  message: 'Journal entry debits do not equal credits',
  details: { debit: totalDebit, credit: totalCredit }
});
```

### 5.2 Global Exception Filter

All exceptions must be caught by the `GlobalExceptionFilter` in `core/exceptions/` and transformed to the standard error envelope.

---

## 6. Logging Strategy

```typescript
// Log levels: error > warn > info > debug
// Production: error + warn + info only
// Development: all levels with pino-pretty

// Required log fields
this.logger.info({
  traceId,        // From request context
  tenantId,       // Always include for tenant-scoped operations
  userId,         // When user-triggered
  action,         // e.g., 'sale_processed', 'journal_created'
  duration,       // For performance monitoring
}, 'Human-readable message');

// Error logging MUST include the full error object
this.logger.error({ err: error, tenantId, traceId }, 'Sale processing failed');
```

---

## 7. Testing Expectations

| Type | Framework | Target Coverage | When |
|---|---|---|---|
| Unit tests | Jest | 80% per service | Every service method |
| Integration tests | Jest + Supertest | Critical paths | Every controller |
| E2E tests | Playwright (web), Flutter test | Core user flows | Before every release |
| Load tests | k6 | POS endpoint | Quarterly |

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

## 8. Refactor Direction

1. **Remove all `.js` files from `backend/src/`** — migrate to TypeScript or move to `/scripts/`
2. **Remove debug scripts** (`debug_ai.js`, `check_columns.js`) from committed code
3. **Add ESLint rules** for no-console, explicit-module-boundary-types, no-any
4. **Enable strict TypeScript** (`"strict": true` in tsconfig)
5. **Add Prettier** pre-commit hook via Husky + lint-staged

---

## 9. Long-Term Recommendations

| Recommendation | Rationale |
|---|---|
| Adopt **Conventional Commits** format | Enables auto-generated changelogs and semantic versioning |
| Enforce **Architecture tests** (ts-arch) | Prevent cross-layer imports via automated tests |
| Generate **API docs** from code | NestJS Swagger plugin auto-generates from decorators |
| **Code coverage gate** in CI | Block merges below 80% coverage threshold |
| **Dependency review** in PRs | Alert on new transitive dependencies with security issues |
