# ADR-001: Modular Monolith Architecture

**Status:** Accepted  
**Date:** 2026-05-11  
**Authors:** Platform Engineering Team  
**Reviewers:** Technical Lead, Backend Lead

---

## Context

Tumbuhin is a multi-tenant SaaS ERP platform targeting Indonesian SMEs. As the platform was being architected, we needed to decide on the overall backend architecture style.

The key competing options were:
1. **Microservices** — Independent services per domain, deployed separately
2. **Modular Monolith** — Single deployment unit with strong internal module boundaries
3. **Monolith** — Single codebase with no enforced boundaries

The platform serves ~10 business domains: sales, accounting, inventory, procurement, AI, reporting, warehouse, promotions, staff management, and onboarding.

---

## Decision

We chose **Modular Monolith** with **Event-Driven** async processing via BullMQ.

---

## Alternatives Considered

### Option A: Microservices (Rejected for now)

**Pros:**
- Independent scaling per domain
- Technology flexibility per service
- True isolation — a failing AI service doesn't affect POS

**Cons:**
- Massive operational overhead for a 2–5 person engineering team
- Distributed transactions are complex (saga pattern required)
- Network latency between services adds up
- Debugging cross-service issues is difficult
- Requires service mesh, service discovery, API gateway from day 1

**Verdict:** Premature for current scale. Revisit when team size exceeds 15 engineers or tenant count exceeds 10,000.

### Option B: Monolith (Rejected)

**Pros:**
- Simplest to start

**Cons:**
- No enforced domain boundaries
- Any developer can touch any code
- Becomes unmaintainable past 50k LOC
- Tight coupling makes future extraction to services impossible

**Verdict:** Not acceptable for a platform intended to scale to 100k+ tenants.

### Option C: Modular Monolith (Chosen)

**Pros:**
- Clean domain boundaries enforced by NestJS module system
- Single deployment unit — simple ops for small team
- Easy to debug and trace requests
- Can extract modules to microservices later when needed
- Shared in-process database transactions (ACID via UnitOfWork)

**Cons:**
- All modules share the same process — one CPU-heavy module can affect others
- Cannot scale modules independently
- Shared schema — domain isolation relies on discipline, not technical enforcement

---

## Tradeoffs

| Concern | Decision |
|---|---|
| **Team size** | 2–5 engineers → Monolith deployment is manageable |
| **Operational complexity** | Modular monolith = 1 deployment, 1 logs stream, 1 debugger |
| **Domain isolation** | NestJS module system enforces import boundaries by convention |
| **Future scalability** | Module boundaries allow future extraction to microservices |
| **ACID transactions** | In-process = cheap transactions via UnitOfWork |

---

## Implementation Details

- 14 NestJS modules, each with strict controller → service → repository layering
- `CoreModule` provides shared infrastructure: auth, DB, events, logging
- `EventBusService` (BullMQ) decouples async side effects from domain logic
- `UnitOfWork` wraps multi-table writes in PostgreSQL transactions

---

## Long-Term Implications

- The `ai` module is the most likely candidate for extraction to a standalone service (different scaling needs, cost model)
- The `report` module should be migrated to a separate read-only replica query pattern
- All module boundaries must be respected during development — cross-module direct service imports will make future extraction impossible

---

## Review Date

This decision should be re-evaluated when:
- Team size exceeds 15 engineers
- Tenant count exceeds 10,000
- A specific module shows performance bottleneck that cannot be solved by caching
