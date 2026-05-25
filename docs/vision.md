# Tetasin — Platform Vision & Roadmap

> **Document Purpose:** Long-term product vision, evolution goals, and strategic roadmap.
> **Who Should Read This:** Engineering leadership, product management, and senior engineers.

---

## 1. Three-Year Vision

Tetasin becomes the **default financial operating system for Indonesian SMEs** — replacing paper notebooks, spreadsheets, and isolated apps with a single AI-augmented platform that handles POS, inventory, procurement, accounting, and financial intelligence.

### 1.1 Year 1 — Foundation (Complete)
> "One platform that reliably runs a single-store Indonesian SME."

- Multi-tenant modular monolith (NestJS + Supabase)
- Real-time POS with automatic double-entry journaling
- Multi-warehouse inventory management
- Full procurement lifecycle (SO → PO → fulfillment)
- AI Financial CFO (Gemini-powered chat + insights)
- OCR receipt scanning (photo → journal)
- Web dashboard + Flutter mobile app
- Three subscription tiers (Starter / Business / Pro)

### 1.2 Year 2 — Scale
> "One platform for multi-branch franchise operations."

- Consolidated multi-branch reporting (Pro+)
- Franchise owner dashboard (manages N branches)
- Payroll and staff attendance integration
- B2B ordering portal (supplier integration)
- Expanded AI: predictive restock, cash flow forecasting
- E-commerce integrations (Tokopedia, Shopee)
- Open API for third-party integrations

### 1.3 Year 3 — Ecosystem
> "The financial intelligence backbone for 100,000 Indonesian SMEs."

- Developer marketplace (partner apps on Tetasin platform)
- Embedded lending (revenue-based financing via bank partnerships)
- Industry-specific vertical modules (pharmacy, manufacturing, F&B)
- Regional expansion (SEA markets)
- Kafka-based event streaming for real-time analytics
- Multi-region active-passive deployment

---

## 2. Product Pillars

### Pillar 1: Deterministic ERP Engine
All business computations — pricing, stock deduction, journaling, reporting — are **mathematically exact and reproducible**. No probabilistic or AI-based logic in financial execution.

### Pillar 2: AI as Interface, Not Decision Maker
AI (Gemini) handles:
- Explaining financial data in natural language
- Extracting structured data from receipt images
- Generating insights and recommendations
- Answering business questions via chat

AI does NOT:
- Execute transactions
- Modify database records
- Make autonomous decisions affecting financial integrity

### Pillar 3: Tenant-Native Multi-Tenancy
Every data record, every API call, every report is **naturally scoped to a single tenant**. The platform is built from the ground up for isolation — not retrofitted.

### Pillar 4: API-First Architecture
Every feature is available via the REST API before building UI. The backend API is the product — Web and Flutter are just clients.

### Pillar 5: Universal Product Engine
A single unified product modeling system handles **all SME industry types** — retail, F&B, pharmacy, electronics, manufacturing, services — without separate code paths or special-casing. Product behaviors are declared via `product_type` + `product_behaviors` tables.

---

## 3. Architecture Evolution Path

| Stage | Trigger | Change |
|---|---|---|
| **Modular Monolith** (current) | Team < 15, tenants < 10k | NestJS single process, 15 modules |
| **Modular Monolith + Workers** | BullMQ saturating API CPU | Extract BullMQ worker to separate process (`npm run worker`) |
| **Extract AI Service** | AI compute cost > 30% of total | AI module → standalone Python/Node service |
| **Extract Report Service** | Read queries slowing writes | Report module → CQRS read replica pattern |
| **Kubernetes** | Traffic spikes unpredictable | HPA, ingress controller, pod autoscaling |
| **Microservices** | Team > 15, tenants > 10k | Module boundaries allow clean extraction |

---

## 4. Technology Evolution

| Capability | Today | Year 2 | Year 3 |
|---|---|---|---|
| Event Bus | BullMQ (Redis) | BullMQ + persistent event log | Kafka |
| Database | Supabase (single region) | Read replica for analytics | Multi-region, partitioned |
| Caching | Redis (reports) | Redis cluster | Distributed cache |
| AI | Gemini 2.0 Flash | Gemini + fine-tuned domain model | On-prem option for compliance |
| Observability | Pino logs + Grafana | Full distributed tracing (OpenTelemetry) | Multi-region observability |
| Mobile | Flutter (iOS/Android) | Flutter + web PWA | Native features per platform |

---

## 5. Non-Negotiable Engineering Principles (Permanent)

These principles do NOT change as the platform evolves:

1. **Financial data integrity above all** — `|debit - credit| < 0.01` always enforced
2. **AI never writes to database** — AI is read + suggest only, forever
3. **Human approval for AI-generated financial entries** — OCR drafts require explicit user approval
4. **Tenant isolation at every layer** — RLS + `tenant_id` filtering + JWT context
5. **ACID for financial transactions** — `UnitOfWork.runInTransaction()` never bypassed
6. **Deterministic pricing** — promotions, discounts, taxes are computed exactly
7. **API-first** — every feature has an API endpoint before building UI
8. **Module boundaries** — cross-module service coupling forbidden; use EventBusService

---

## 6. Open Questions (Product Decisions Pending)

| Question | Options | Deadline |
|---|---|---|
| Payroll module — build vs integrate | Build vs Gadjian/Talenta API | Q3 2026 |
| Inventory forecasting | Deterministic reorder point vs AI prediction | Q4 2026 |
| E-commerce channel sync | Direct integration vs middleware (e.g., DaaS) | Q2 2027 |
| On-premise AI for sensitive tenants | Self-hosted LLM vs Gemini with DPA | 2027 |
