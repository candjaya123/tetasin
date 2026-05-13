# ADR-001: Modular Monolith Architecture

**Status:** Accepted
**Date:** 2026-05-11
**Authors:** Platform Engineering Team

---

## Decision

Tumbuhin backend uses **Modular Monolith** with **Event-Driven** async processing via BullMQ.

## Context

Tumbuhin serves 15 business domains from a single platform. The architecture choice must balance:
- Clean domain isolation (for future microservice extraction)
- Operational simplicity (2–5 person engineering team)
- ACID transaction support (financial integrity requirement)
- Scalability path to 10,000+ tenants

## Rationale

| Concern | Decision |
|---|---|
| Team size | 2–5 engineers → single deployment is manageable |
| Domain isolation | NestJS module system enforces boundaries by import rules |
| Future scalability | Module boundaries allow future microservice extraction |
| ACID transactions | In-process UnitOfWork gives cheap, reliable transactions |
| Debugging | Single process = single log stream, single debugger |

Microservices were rejected for the current scale — they require distributed transaction management (saga pattern), service mesh, and service discovery from day one, adding complexity beyond the team's capacity.

## Implementation

```
backend/src/modules/
├── accounting/      → journal_entries, journal_lines, chart_of_accounts
├── ai/              → Gemini chat, memory, insight aggregation
├── business-profile/→ tenant config, staff, RBAC
├── inventory/       → products, raw materials, recipes
├── receipt/         → OCR scanning, draft transactions, merchant memory
├── report/          → financial reports, materialized view queries
├── sales/           → POS transactions (idempotent)
├── warehouse/       → multi-warehouse, transfers, opnames
└── [8 more modules]
```

Cross-module communication: **EventBusService only** (BullMQ async events). Direct service-to-service imports are forbidden.

## Re-evaluation Triggers

- Team size exceeds 15 engineers
- Tenant count exceeds 10,000
- A specific module shows irresolvable performance bottleneck
