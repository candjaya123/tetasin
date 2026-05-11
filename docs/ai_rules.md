# Tumbuhin — AI-Assisted Development Rules

> **Document Purpose:** Defines rules for AI-assisted development — mandatory patterns, forbidden practices, code generation standards, and consistency rules.
> **Who Should Read This:** All AI coding assistants, engineers using AI tools, technical leads.
> **Why It Matters:** Ensures sustainable and consistent AI-assisted engineering aligned with the platform's architectural vision.

---

## 1. Context

Tumbuhin is a **multi-tenant SaaS ERP platform** for Indonesian SMEs with:
- **Backend:** NestJS (TypeScript), Supabase PostgreSQL, BullMQ, Pino
- **Web:** Next.js 14 (App Router), Tailwind CSS, Shadcn/UI
- **Mobile:** Flutter (Dart)
- **AI Engine:** Google Gemini 1.5 Flash (advisory only, never executes transactions)

The codebase follows **Clean Architecture** within a **Modular Monolith** pattern.

---

## 2. Mandatory Architecture Rules

### 2.1 Backend (NestJS)

```
RULE 1: Controllers contain ZERO business logic.
  → Controllers: parse request → call service → return response DTO
  → If you find yourself writing if/else in a controller, move it to the service

RULE 2: Services contain ZERO direct database queries.
  → Services call repositories only. Never call Supabase/DB client directly.

RULE 3: Repositories contain ZERO business logic.
  → Repositories: SQL queries only. Return data or throw DB errors.

RULE 4: ALL financial writes run inside UnitOfWork.runInTransaction()
  → Sales, journal entries, stock deductions = MUST be atomic
  → Never allow partial commits on financial operations

RULE 5: ALL journal entries MUST validate: |totalDebit - totalCredit| < 0.01
  → This is enforced in AccountingService.createJournalEntry()
  → Never bypass this validation

RULE 6: tenant_id MUST come from the JWT context (req.user.tenantId)
  → NEVER accept tenant_id as a user-supplied parameter
  → NEVER hardcode or generate tenant_id in business logic

RULE 7: ALL new endpoints require Tier + Role guards
  → Use @RequireTier() and @Roles() decorators
  → Default is to restrict, not to allow

RULE 8: ALL DTOs must use class-validator decorators
  → Every @Post() and @Put() endpoint must have a validated DTO
  → No 'any' type in DTOs
```

### 2.2 Web (Next.js)

```
RULE 9: ALL data fetching goes through /lib/api/ — NEVER directly to Supabase
  → Use apiGet(), apiPost() from the centralized client
  → Supabase client is for auth session management ONLY in web

RULE 10: Page components must be thin
  → Extract all data fetching to custom hooks in /hooks/
  → Extract all UI logic to components in /components/

RULE 11: Use the standard response envelope
  → All API responses: { success, data, meta?, error? }
  → Handle both success and error cases in every fetch hook
```

### 2.3 Flutter

```
RULE 12: All HTTP calls go through ApiClient (Dio)
  → Never use raw http package in feature code
  → Auth interceptor is applied automatically

RULE 13: Screens must not contain business logic
  → Screens: layout + event handling only
  → Business logic: in providers/notifiers
  → Data fetching: in services/repositories
```

### 2.4 Database

```
RULE 14: Every new table MUST have tenant_id
  → Exception: lookup/reference tables (e.g., country codes)
  → Add RLS policy immediately after table creation

RULE 15: All DB queries from backend MUST filter by tenant_id
  → .eq('tenant_id', tenantId) on every query
  → Never query without tenant_id filter on tenant-scoped tables

RULE 16: Enum values in DB must match TypeScript enum values exactly
  → DB: subscription_tier = ('starter', 'business', 'pro')
  → TS: SubscriptionTier = { STARTER = 'starter', BUSINESS = 'business', PRO = 'pro' }
```

---

## 3. Forbidden Patterns

```
❌ NEVER: Use console.log() in any TypeScript/Dart file
  → Use this.logger.info/warn/error() (Pino injected logger) in backend
  → Use debugPrint() in Flutter debug builds only

❌ NEVER: Write raw SQL strings (string concatenation)
  → Always use Supabase client query builder or parameterized RPC

❌ NEVER: Import from sibling module's internal files
  → ✅ Import from a module's public API (exported from .module.ts)
  → ❌ import { SalesRepository } from '../sales/repositories/sales.repository'

❌ NEVER: Use 'any' type in TypeScript
  → Define proper interfaces and DTOs

❌ NEVER: Allow AI to execute transactions or modify database state
  → AI reads aggregated data only (ledger_balances, business_memory)
  → AI returns text responses — never returns actions to execute

❌ NEVER: Expose environment variables to client-side code
  → Web: only NEXT_PUBLIC_* variables are safe for browser
  → Backend: all secrets in process.env, never in code

❌ NEVER: Skip RLS policy when creating new tables
  → Every new table: ALTER TABLE x ENABLE ROW LEVEL SECURITY + policy

❌ NEVER: Return raw Supabase errors to clients
  → Catch and transform to standard error envelope

❌ NEVER: Commit .env files or API keys
  → .gitignore must include .env, .env.local, .env.*

❌ NEVER: Bypass journal balance validation
  → The |debit - credit| < 0.01 check is sacred
```

---

## 4. Code Generation Standards

When generating code for Tumbuhin, AI must:

### 4.1 Module Generation

When asked to "add a new feature/module":
1. Create the full module structure: `.module.ts`, `controllers/`, `services/`, `repositories/`, `dto/`
2. Register the module in `AppModule`
3. Apply `@RequireTier()` and `@Roles()` to all endpoints
4. Add tenant_id filtering to all repository queries
5. Add class-validator decorators to all DTOs

### 4.2 Database Changes

When asked to "add a table" or "add a column":
1. Write migration SQL with `IF NOT EXISTS` guards
2. Include `tenant_id` column (unless reference table)
3. Add `created_at`, `updated_at` timestamps
4. Create appropriate indexes
5. Enable RLS and write policy

### 4.3 API Endpoint Pattern

```typescript
// Standard controller endpoint pattern
@Post()
@RequireTier(SubscriptionTier.BUSINESS)
@Roles('manager', 'kasir')
async create(
  @Body() dto: CreateSaleDto,
  @User() user: TenantContext,
): Promise<ApiResponse<SaleResponseDto>> {
  const result = await this.salesService.processSale(dto, user);
  return { success: true, data: result };
}
```

---

## 5. Consistency Rules

| Rule | Pattern |
|---|---|
| File naming | `kebab-case.type.ts` — e.g., `sales.service.ts`, `create-sale.dto.ts` |
| Method naming | `camelCase` — e.g., `processSale()`, `findByTenant()` |
| API endpoints | REST: `GET /api/v1/resource`, `POST /api/v1/resource/:id/action` |
| Error codes | `SCREAMING_SNAKE_CASE` — e.g., `INSUFFICIENT_STOCK`, `TIER_RESTRICTION` |
| Database tables | `snake_case`, `plural` — e.g., `journal_entries`, `chart_of_accounts` |
| DB columns | `snake_case` — e.g., `tenant_id`, `created_at` |
| Enum values | `snake_case` in DB, `SCREAMING_SNAKE_CASE` in TypeScript |
| Log messages | English, lowercase, verb phrase — e.g., `'sale processed'` |
| Comment language | English in code, Bahasa Indonesia only in user-facing strings |

---

## 6. AI Context Handling

When working on Tumbuhin, always check:

1. **Which module** is being modified — respect its boundaries
2. **Which tier** the feature requires — add guard accordingly
3. **Which role** can access — add role decorator
4. **Does it touch financial data** — must use UnitOfWork
5. **Does it create a DB record** — must include tenant_id
6. **Does it expose data** — must filter by tenant_id

**Before generating database queries, verify:**
- Table name matches actual schema (see `docs/database_schema.md`)
- Columns match actual schema — check `full_schema_supabase.sql`
- Enum values match: `starter | business | pro`, `manager | kasir | stok`

---

## 7. Response Expectations

When AI generates code for this project, the output must:

1. **Be complete** — not skeleton/placeholder code
2. **Follow module structure** — controller, service, repository separation
3. **Include validation** — DTOs with class-validator
4. **Include error handling** — typed NestJS exceptions
5. **Include tenant isolation** — tenant_id in all queries
6. **Include tier/role guards** — on all endpoints
7. **Not include console.log** — use logger
8. **Not use 'any' type** — define proper TypeScript types
9. **Not import from sibling module internals** — use module boundaries

---

## 8. Refactor Direction

When refactoring existing code, AI must:
1. Preserve all existing functionality — do not silently remove features
2. Maintain all existing API contracts — do not change endpoint signatures
3. Preserve all existing log messages — change only format, not content
4. Flag any changes that might affect other modules or the DB schema
5. Not remove `@RequireTier()` or `@Roles()` guards unless explicitly asked

---

## 9. Long-Term Recommendations

| Recommendation | Rationale |
|---|---|
| Keep this document updated after major refactors | AI rules must reflect current architecture |
| Version this document alongside code | Use ADRs to track rule changes |
| Run architecture conformance tests | Automated validation that code follows these rules |
| Review AI-generated code in PR | Senior engineer must review all AI-assisted PRs |
