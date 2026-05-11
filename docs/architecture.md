# Tumbuhin — Architecture

> **Document Purpose:** Defines the ideal system architecture — module boundaries, communication patterns, dependency rules, and scalability strategy.
> **Who Should Read This:** Backend engineers, system architects, technical leads.
> **Why It Matters:** Prevents architectural chaos, guides module decomposition, and ensures long-term maintainability.

---

## 1. Architecture Style

Tumbuhin uses a **Modular Monolith** backend with **Event-Driven** async processing.

**Rationale:**
- Modular monolith provides deployment simplicity at current scale
- Module boundaries are clean enough to extract to microservices later
- Event-driven architecture (BullMQ) handles async side-effects without tight coupling
- Supabase provides managed multi-tenant PostgreSQL with built-in Auth and RLS

**Architecture Tier:**

```
Client Layer (Flutter App, Next.js Web, Admin Panel)
         │
         ▼
API Gateway Layer (NestJS — single process, 14 modules)
         │
    ┌────┴──────────────────────────┐
    │                               │
    ▼                               ▼
Sync Path (Request/Response)   Async Path (BullMQ Queue)
    │                               │
    ▼                               ▼
PostgreSQL (Supabase)        Redis (BullMQ broker)
    │
    ▼
Materialized Views (Analytics)
```

---

## 2. Current Problems

| Problem | Impact | Severity |
|---|---|---|
| Subscription tier enum mismatch (`free/business/ai` in DB vs `STARTER/BUSINESS/PRO` in code) | Auth bugs on tier enforcement | 🔴 High |
| Some pages bypass backend and query Supabase directly (`promos/page.tsx`) | Security gap, no RBAC enforcement | 🔴 High |
| `JwtAuthGuard` and `AuthGuard` coexist in `AppModule` — dual auth guard confusion | Inconsistent auth behavior | 🟡 Medium |
| Loose module coupling — some services import from sibling modules directly | Breaks module isolation | 🟡 Medium |
| No API versioning strategy beyond `/api/v1/` prefix | Breaking changes risk | 🟡 Medium |
| Missing `InventoryModule` registration confirmed (now fixed, but symptom of module sprawl) | Feature silently missing | 🟡 Medium |
| `CoreModule` marked `@Global()` at `AppModule` level — leaks global scope | DI pollution | 🟡 Medium |
| No circuit breaker or retry on external calls (Gemini, Midtrans) | Cascading failures | 🟠 Low-Medium |

---

## 3. Ideal Structure

### 3.1 Monorepo Layout (Ideal)

```
tumbuhin/
├── backend/                    ← NestJS API (TypeScript)
│   ├── src/
│   │   ├── core/               ← Cross-cutting concerns
│   │   │   ├── auth/           ← JWT, Guards, Decorators
│   │   │   ├── database/       ← UnitOfWork, Supabase client
│   │   │   ├── events/         ← EventBusService, BullMQ
│   │   │   ├── interceptors/   ← Response format, Logging
│   │   │   ├── middlewares/    ← Idempotency, TraceId
│   │   │   ├── exceptions/     ← Global exception filters
│   │   │   └── ai/             ← GeminiProvider wrapper
│   │   ├── modules/            ← 14 domain modules
│   │   │   ├── accounting/
│   │   │   ├── ai/
│   │   │   ├── business-profile/
│   │   │   ├── erp/
│   │   │   ├── insight/
│   │   │   ├── inventory/
│   │   │   ├── onboarding/
│   │   │   ├── order/
│   │   │   ├── procurement/
│   │   │   ├── promo/
│   │   │   ├── recovery/
│   │   │   ├── report/
│   │   │   ├── sales/
│   │   │   └── warehouse/
│   │   └── shared/             ← Shared utilities, SupabaseService
│   └── test/
├── web/                        ← Next.js 14 Web Dashboard
│   └── src/
│       ├── app/                ← App Router pages
│       ├── components/         ← Reusable UI components
│       ├── hooks/              ← Custom React hooks
│       └── lib/                ← API clients, utilities
└── tumbuhin_flutter/           ← Flutter Mobile App
    └── lib/
        ├── core/               ← App-level config, routing
        ├── features/           ← Feature modules
        └── shared/             ← Shared widgets, services
```

### 3.2 Module Structure (Per Domain Module — Ideal)

```
modules/sales/
├── sales.module.ts             ← Module registration
├── controllers/
│   └── sales.controller.ts    ← HTTP handlers only, no business logic
├── services/
│   └── sales.service.ts       ← Business orchestration
├── repositories/
│   └── sales.repository.ts    ← DB queries only
├── domain/
│   ├── sale.entity.ts         ← Domain entity with invariants
│   └── sale.events.ts         ← Domain events
└── dto/
    ├── create-sale.dto.ts
    └── sale-response.dto.ts
```

### 3.3 Dependency Rules

```
Controller → Service → Repository → Database
Controller → DTO (validation)
Service → Domain Entity (business rules)
Service → EventBusService (for side effects)
Service → Other Services (ONLY via interface, not direct import)
```

**Forbidden:**
- Controllers must never access repositories directly
- Services must never import from another module's service directly (use events or shared interfaces)
- Repositories must never contain business logic

### 3.4 Communication Patterns

| Pattern | Use Case |
|---|---|
| **HTTP (Sync)** | Client → Backend API (all user-triggered actions) |
| **BullMQ Queue (Async)** | Domain events → side effects (email, analytics, restock) |
| **PostgreSQL Functions (RPC)** | Complex atomic DB operations (e.g., `process_sale`) |
| **Materialized Views** | Pre-computed financial aggregations (refreshed hourly) |
| **Supabase Realtime** | (Future) Live POS dashboard updates |

---

## 4. Security Architecture

```
Incoming HTTP Request
  │
  ├── Layer 1: TraceIdMiddleware → Inject trace-id for observability
  │
  ├── Layer 2: JwtAuthGuard (Supabase JWT) → Validate token, inject user
  │
  ├── Layer 3: TierGuard → Check subscription tier from DB
  │   └── Inject tenant_id, tier, role into request context
  │
  ├── Layer 4: RoleGuard → RBAC enforcement
  │   └── Reject if role insufficient for endpoint
  │
  └── Layer 5: IdempotencyMiddleware (on /sales, /journal)
      └── Prevent duplicate transaction processing
```

---

## 5. Refactor Direction

### Priority 1 — Resolve Auth Guard Duplication
- Remove `AuthGuard` from `AppModule`, keep only `JwtAuthGuard`
- Standardize on a single auth pipeline

### Priority 2 — Migrate Direct Supabase Calls in Web
- All web pages must go through `/api/v1/*` endpoints
- `promos/page.tsx`, any remaining direct Supabase queries → move to backend

### Priority 3 — Sync Tier Enum
- Align DB enum to match code: change `free/business/ai` → `starter/business/pro`
- Or update TypeScript enum to match DB

### Priority 4 — Enforce Module Boundaries
- No cross-module service imports — use event bus for cross-domain side-effects
- Add ESLint module boundary rules

### Priority 5 — Add API Versioning Header Support
- Support `Accept: application/vnd.tumbuhin.v1+json` in addition to URL versioning

---

## 6. Long-Term Recommendations

| Recommendation | Timeline |
|---|---|
| Extract `ai` module to standalone AI microservice when query volume exceeds 10k/day | 12–18 months |
| Add Redis caching layer for `ledger_balances` read path | 6–9 months |
| Implement OpenTelemetry distributed tracing | 3–6 months |
| Add Supabase Realtime for live POS dashboard | 6–9 months |
| GraphQL federation layer for complex reporting queries | 18–24 months |
| Migrate BullMQ to dedicated worker process | 6–12 months |
