# Tumbuhin — Product Vision & Engineering Direction

> **Document Purpose:** Defines the long-term product and engineering direction to ensure short-term decisions don't compromise long-term growth.
> **Who Should Read This:** CTO, Product Manager, Technical Lead, Senior Engineers.
> **Why It Matters:** Without a shared north star, teams optimize locally and create global fragility.

---

## 1. Product Vision Statement

**"Tumbuhin will be the operating system for Indonesian SMEs — the single platform that replaces the cashier book, the Excel spreadsheet, the accountant's manual ledger, and the WhatsApp order tracking, all in one mobile-first, AI-augmented system."**

---

## 2. Current Problems

| Problem | Impact |
|---|---|
| Vision not formally documented — decisions made ad-hoc | Architectural drift, feature sprawl |
| No long-term API versioning strategy | Future breaking changes will impact clients |
| AI role unclear to new contributors — risk of AI being used for business logic | Data integrity and hallucination risk |
| No documented product roadmap beyond Phase 12 | Teams have no strategic context for prioritization |
| Upsell / monetization not fully tied to product feature flags in code | Revenue leakage from unpaid feature access |

---

## 3. Ideal Structure — Long-Term Product Architecture

### 3.1 The 3-Layer Platform Model

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 3: Intelligence Layer                                 │
│  ─────────────────────────────────────────────────────────  │
│  AI CFO · Forecasting · Smart Alerts · Procurement Autopilot│
│  (Advisory Only — Never Executes Transactions)              │
└──────────────────────────┬──────────────────────────────────┘
                           │ Reads from
┌──────────────────────────▼──────────────────────────────────┐
│  Layer 2: Business Engine Layer                              │
│  ─────────────────────────────────────────────────────────  │
│  POS · Inventory · Accounting · Procurement · Promotions    │
│  (Deterministic — All math is exact, ACID transactions)     │
└──────────────────────────┬──────────────────────────────────┘
                           │ Persists to
┌──────────────────────────▼──────────────────────────────────┐
│  Layer 1: Data & Infrastructure Layer                        │
│  ─────────────────────────────────────────────────────────  │
│  PostgreSQL · RLS · BullMQ · Redis · Supabase Auth          │
│  (Immutable audit trail, multi-tenant isolation)            │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 The 5-Year Product Evolution

| Year | Focus |
|---|---|
| **Year 1 (Current)** | Core operational platform: POS, Inventory, Accounting, AI chat |
| **Year 2** | Franchise tier: multi-branch management, consolidated reporting, franchise dashboard |
| **Year 3** | Ecosystem: Open API for integrations, marketplace plugins, supplier network |
| **Year 4** | Intelligence: Predictive inventory, demand forecasting, automated PO execution |
| **Year 5** | Financial Services: Embedded lending, insurance, business credit scoring |

---

## 4. Engineering Vision

### 4.1 Platform Engineering Goals

1. **API-First:** Every feature must be accessible via the backend API. No feature-only-in-UI.
2. **AI-Augmented, Not AI-Driven:** AI reads data, explains it, and suggests. Humans confirm. Systems execute.
3. **Tenant-Native:** Multi-tenancy is not an afterthought — it is baked into every data model, query, and policy.
4. **Event-Complete:** Every business action produces a domain event. The event log is the source of truth for audit, analytics, and async processing.
5. **Idempotent by Default:** All write operations must be idempotent. Duplicate requests must be safe.

### 4.2 Scalability Goals

| Milestone | Target |
|---|---|
| Phase 1 | 1,000 active tenants (Full tier), 50k transactions/day |
| Phase 2 | 10,000 tenants, 100+ Franchise accounts, 500k transactions/day |
| Phase 3 | 100,000 tenants, 1,000+ Franchise accounts — requires microservice extraction |

### 4.3 Technical Evolution Goals

| Goal | Strategy |
|---|---|
| Sub-100ms P99 API response | Redis caching on hot reads, DB indexing, materialized views |
| Zero-downtime deployments | Blue-green via Docker + health checks |
| Full observability | OpenTelemetry traces + structured Pino logs + Grafana dashboards |
| 80% test coverage | Unit + integration + E2E test suite (Jest + Playwright) |
| AI cost control | Token budgeting per tenant, rate limiting on AI endpoints |

---

## 5. Refactor Direction

### Short-Term (0–3 months)
- [ ] Resolve enum mismatch — align DB to `'free', 'full', 'franchise'`
- [ ] Migrate all direct Supabase frontend calls to backend API
- [ ] Standardize auth guard chain
- [ ] Implement comprehensive E2E test suite for critical flows

### Medium-Term (3–9 months)
- [ ] Build Franchise dashboard — multi-branch overview and consolidated reports
- [ ] Implement branch-linking system (franchise_account_id FK on tenants)
- [ ] Add Redis caching layer for `ledger_balances` and `report` endpoints
- [ ] Implement OpenTelemetry distributed tracing
- [ ] Define and publish internal API versioning policy
- [ ] Build feature flag system for tier-based feature access

### Long-Term (9–24 months)
- [ ] Extract AI module into independent service
- [ ] Build open API documentation (Swagger/OpenAPI 3.0)
- [ ] Introduce GraphQL for complex reporting queries including cross-branch aggregation
- [ ] Implement Supabase Realtime for live POS updates
- [ ] Build plugin/integration marketplace

---

## 6. Long-Term Recommendations

1. **Adopt ADR (Architecture Decision Records):** Document every significant architectural decision in `docs/adr/` to prevent institutional knowledge loss.
2. **Invest in Developer Experience (DX):** Onboarding should take < 30 minutes with one `docker compose up` command.
3. **Build for AI-Assisted Development:** All code must be self-documenting, module boundaries explicit, and conventions enforced by tooling (linters, generators).
4. **Financial Data is Sacred:** Double-entry integrity, immutable event logs, and ACID guarantees must never be compromised for performance shortcuts.
5. **Mobile-First, API-Only:** The backend is a product, not an implementation detail. Every endpoint is a public contract.
