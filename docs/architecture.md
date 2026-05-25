# Tetasin — Architecture

> **Document Purpose:** Defines the system architecture — module boundaries, communication patterns, dependency rules, and scalability strategy.
> **Who Should Read This:** Backend engineers, system architects, technical leads.

---

## 1. Architecture Style

Tetasin uses a **Modular Monolith** backend with **Event-Driven** async processing.

**Rationale:**
- Single deployment unit with clean module boundaries — simple operations for a small team
- Module boundaries clean enough to extract to microservices when tenant count exceeds 10,000
- Event-driven architecture (BullMQ) handles async side-effects without tight coupling
- Supabase provides managed multi-tenant PostgreSQL with Auth and RLS

```
Client Layer (Flutter App, Next.js Web, Admin Panel)
         │
         ▼
API Gateway Layer (NestJS — single process, 15 modules)
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

## 2. Module Inventory

| Module | Responsibility |
|---|---|
| `accounting` | Chart of accounts, journal entries, journal lines, ledger |
| `ai` | Gemini chat, financial insights, AI memory aggregation |
| `business-profile` | Tenant configuration, staff management, RBAC |
| `erp` | ERP integration layer |
| `insight` | AI-generated financial insight cron jobs |
| `inventory` | Products, raw materials, recipes, stock levels |
| `industry` | Tenant industry profile configuration |
| `onboarding` | New tenant setup, COA seeding |
| `order` | Sales orders, purchase orders |
| `procurement` | PO lifecycle, vendor management, auto-draft generation |
| `promo` | Promotion engine, discount rules |
| `receipt` | OCR receipt scanning, draft transactions, merchant memory |
| `recovery` | Data recovery utilities |
| `report` | Financial reports, materialized view queries |
| `sales` | POS transactions, sale processing, idempotency |
| `warehouse` | Multi-warehouse, stock transfers, stock opname |

---

## 3. Ideal Module Structure

```
modules/sales/
├── sales.module.ts             ← Module registration + exports
├── controllers/
│   └── sales.controller.ts    ← HTTP handlers only, zero business logic
├── services/
│   └── sales.service.ts       ← Business orchestration
├── repositories/
│   └── sales.repository.ts    ← DB queries only
├── domain/
│   ├── sale.entity.ts         ← Domain entity with invariants
│   └── sale.events.ts         ← Domain event definitions
└── dto/
    ├── create-sale.dto.ts
    └── sale-response.dto.ts
```

---

## 4. Dependency Rules

```
Controller → Service → Repository → Database
Controller → DTO (validation layer)
Service → Domain Entity (business invariants)
Service → EventBusService (async side effects only)
Service → Other Module Services: ONLY via shared interface, never direct import
```

**Forbidden:**
- Controllers must never access repositories directly
- Services must never import from another module's service directly — use `EventBusService`
- Repositories must never contain business logic

---

## 5. Communication Patterns

| Pattern | Use Case |
|---|---|
| **HTTP (Sync)** | Client → Backend API (all user-triggered actions) |
| **BullMQ Queue (Async)** | Domain events → side effects (email, analytics, restock, OCR) |
| **PostgreSQL RPC** | Complex atomic DB operations (e.g., `process_sale`) |
| **Materialized Views** | Pre-computed financial aggregations (refreshed hourly) |

---

## 6. Security Architecture

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
      └── Prevent duplicate financial transaction processing
```

**AppModule guard chain (exact order):**

```typescript
providers: [
  { provide: APP_GUARD, useClass: JwtAuthGuard },
  { provide: APP_GUARD, useClass: TierGuard },
  { provide: APP_GUARD, useClass: RoleGuard },
]
```

---

## 7. Monorepo Layout

```
tetasin/
├── backend/                    ← NestJS API (TypeScript)
│   ├── src/
│   │   ├── core/               ← Cross-cutting concerns
│   │   │   ├── auth/           ← JWT, Guards, Decorators
│   │   │   ├── database/       ← UnitOfWork, Supabase client, migrations/
│   │   │   ├── events/         ← EventBusService, BullMQ
│   │   │   ├── interceptors/   ← Response format, Logging
│   │   │   ├── middlewares/    ← Idempotency, TraceId
│   │   │   ├── exceptions/     ← Global exception filters
│   │   │   └── ai/             ← GeminiProvider wrapper
│   │   ├── modules/            ← 15 domain modules
│   │   └── shared/             ← SupabaseService, shared utilities
│   └── test/
├── web/                        ← Next.js 14 Web Dashboard
│   └── src/
│       ├── app/                ← App Router pages
│       ├── components/         ← Reusable UI components
│       ├── hooks/              ← Custom React hooks
│       └── lib/                ← API clients, utilities
└── tetasin_flutter/           ← Flutter Mobile App
    └── lib/
        ├── core/               ← Config, routing, theme, API client
        ├── features/           ← Feature modules
        └── shared/             ← Shared widgets, services, models
```

---

## 8. Scalability Path

| Tenant Count | Architecture |
|---|---|
| 0–1,000 | Single NestJS instance, Supabase managed DB, Redis for BullMQ only |
| 1,000–10,000 | Multiple NestJS instances + load balancer, Redis caching for reports, separate BullMQ worker process, read replica for analytics |
| 10,000–100,000 | Extract AI + Report modules to microservices, Kafka for event streaming, Kubernetes, multi-region |

**Most likely first extractions:**
1. `ai` module → standalone service (different scaling profile, cost model)
2. `report` module → read-only replica query pattern (CQRS)
3. `receipt` module → dedicated OCR worker service
