# Tumbuhin Platform — Project Overview

> **Document Purpose:** High-level entry point for all stakeholders — engineers, architects, PMs, QA, and AI coding assistants — to understand the product vision, scope, actors, and system boundaries.
> **Who Should Read This:** Everyone joining or contributing to the project.
> **Why It Matters:** Without a shared understanding of what we're building and for whom, every individual decision risks misalignment.

---

## 1. Product Vision

**Tumbuhin** is a **multi-tenant SaaS ERP and AI platform** purpose-built for Indonesian SMEs (UMKM). It digitizes the full operational lifecycle of a small-to-medium business — from point-of-sale to procurement, inventory, accounting, and financial reporting — under a single, subscription-based roof.

**Core Promise:**
> "Upload a receipt → Automatically becomes a double-entry journal. One platform to run your entire business."

**North Star Metric:** Number of active business tenants generating at least one POS transaction per week.

---

## 2. Target Users (Actors)

| Actor | Description | Primary Platforms |
|---|---|---|
| **Business Owner (Manager)** | Registers the tenant, configures the business, views financial reports, approves POs | Web Dashboard, Mobile App |
| **Cashier (Kasir)** | Operates the POS terminal, processes daily sales | Web POS, Mobile App |
| **Stock Manager (Stok)** | Manages raw materials, inventory replenishment, stock opnames | Web Dashboard, Mobile App |
| **Super Admin** | Platform-level administration, tenant management, subscription billing | Admin Panel (Web) |
| **AI Virtual CFO** | Autonomous agent that reads aggregated financial data and generates insights/recommendations | Chat Widget (Web + Mobile) |

---

## 3. Core Business Domains

| Domain | Description |
|---|---|
| **Point of Sale (POS)** | Real-time sales processing with automatic journal entry creation |
| **Inventory Management** | Multi-warehouse stock tracking, raw materials, product recipes, stock transfers, opnames |
| **Universal Product Engine** | 🔄 *Planned (Phase 13)* — Multi-industry product type system: Physical, Service, Digital, Weighted, Composite, Custom Price, Hybrid |
| **Industry Profile** | 🔄 *Planned (Phase 13)* — Tenant-level industry configuration (Retail, F&B, Grocery, Pharmacy, Electronics, Manufacturing, Service) |
| **Accounting (Double-Entry)** | Automated double-entry bookkeeping via Chart of Accounts (COA); journal, ledger, trial balance |
| **Procurement** | Sales Orders (SO), Purchase Orders (PO), vendor management, automated restock drafts |
| **Financial Reporting** | Income statement, balance sheet, cash flow, ledger balances |
| **AI CFO Assistant** | Gemini-powered chat, receipt scanning (OCR), financial forecasting, RAG memory |
| **Promotions Engine** | Discount and promo logic applied deterministically during checkout |
| **Staff & RBAC** | Role-based access control (Manager / Kasir / Stok) per tenant |
| **Subscription & Billing** | 3-tier SaaS model (Free / Full / Franchise), enforced at API and UI layers |

---

## 4. Platform Scope

### 4.1 What Tumbuhin IS

- A **multi-tenant SaaS platform** — each business gets its own isolated data environment
- A **deterministic ERP engine** — all financial calculations are mathematically exact; AI is advisory only
- A **cross-platform product** — Web Dashboard (Next.js), Mobile App (Flutter), and a shared Backend API (NestJS)
- An **AI-augmented** (not AI-driven) platform — Gemini handles communication, not computation

### 4.2 What Tumbuhin IS NOT

- Not a payment gateway (uses Midtrans as an integration)
- Not a raw marketplace (B2C sales to end-consumers happen via POS, not an e-commerce storefront)
- Not a general-purpose accounting software (purpose-built for SME operational use cases)
- Not an AI-autonomous system (AI cannot execute transactions or modify data)

---

## 5. Subscription Tiers

Tumbuhin uses a **3-tier subscription model** designed for clarity and simplicity:

| Feature | Free | Full | Franchise |
|---|---|---|---|
| **Target** | Personal / hobby / trial | Single business owner | Multi-branch / franchise operator |
| **Price** | Free | Rp 99k–249k/mo | Rp 499k+/mo |
| **POS Transactions** | Limited (100/month) | Unlimited | Unlimited (all branches) |
| **Inventory** | 1 warehouse, basic | Multi-warehouse, transfers, opname | All branches centralized |
| **Promotions** | None | Full promo engine | Centralized promo across branches |
| **Staff Accounts (RBAC)** | Owner only | Manager + Kasir + Stok | Per-branch RBAC + franchise admin |
| **Accounting** | Basic income tracking | Full double-entry: P&L, balance sheet, cash flow, ledger | Consolidated reports across branches |
| **AI Features** | None | AI CFO chat + receipt scan + forecasting | AI insights across all branches |
| **Multi-Account Management** | ❌ | ❌ (single tenant only) | ✅ Monitor & manage N branches from one dashboard |
| **Consolidated Reporting** | ❌ | ❌ | ✅ Aggregated P&L, inventory, revenue per branch |
| **History** | 30 days | Unlimited | Unlimited |
| **Export** | None | CSV + PDF | CSV + PDF + API + consolidated export |

### Tier Definitions

- **Free** — Entry-level access for personal use or trying the platform. Feature-gated, no staff, no multi-warehouse, no AI.
- **Full** — Complete ERP for a single business. All features unlocked for one tenant. No multi-account management.
- **Franchise** — Enterprise tier for franchise owners or holding companies. One Franchise account can **create, manage, and monitor** multiple branch tenant accounts. Includes consolidated dashboards and cross-branch analytics.

---

## 6. System Boundaries

```
┌────────────────────────────────────────────────────────────────────────────┐
│                          TUMBUHIN PLATFORM                                  │
│                                                                              │
│  ┌──────────────────┐   ┌──────────────────┐   ┌───────────────────────┐   │
│  │  Flutter Mobile  │   │  Next.js Web App  │   │  Admin Panel (Next.js)│   │
│  │  (iOS / Android) │   │  (Tenant Dashboard│   │  (Super Admin)        │   │
│  └────────┬─────────┘   └────────┬──────────┘   └───────────┬───────────┘  │
│           │                      │                            │              │
│           └──────────────────────▼────────────────────────────┘             │
│                                  │                                           │
│                    ┌─────────────▼──────────────┐                           │
│                    │   NestJS Backend API        │                           │
│                    │   /api/v1/*                 │                           │
│                    │   14 Domain Modules         │                           │
│                    └─────────────┬──────────────┘                           │
│                                  │                                           │
│           ┌──────────────────────┼──────────────────────┐                   │
│           │                      │                       │                   │
│  ┌────────▼──────┐   ┌───────────▼─────────┐  ┌────────▼──────────┐        │
│  │   Supabase    │   │   Redis / BullMQ    │  │  Google Gemini    │        │
│  │  (PostgreSQL  │   │   (Job Queues)      │  │  (AI Engine)      │        │
│  │  + Auth + RLS)│   └─────────────────────┘  └───────────────────┘        │
│  └───────────────┘                                                           │
│                                                                              │
└────────────────────────────────────────────────────────────────────────────┘

External Integrations:
  • Midtrans → Payout / withdrawal processing
  • Supabase Storage → Avatar and receipt uploads
  • Google Generative AI SDK → Gemini 1.5 Flash
```

---

## 7. Business Objectives

| Objective | Metric |
|---|---|
| Monetize SME operations digitization | MRR from subscription tiers |
| Drive upsell through progressive revelation | Conversion rate Free → Full → Franchise |
| Establish accounting trust | Zero journal imbalance events in production |
| Differentiate via AI CFO | DAU of AI chat sessions |
| Capture franchise/chain market | Number of Franchise accounts with 3+ branches |
| Platform reliability | 99.5% uptime on backend API |

---

## 8. Project Status

| Phase | Description | Status |
|---|---|---|
| 1 | Event-driven architecture & DB core | ✅ Complete |
| 2 | Monetization & operational friction | ✅ Complete |
| 3 | Double-entry accounting | ✅ Complete |
| 4 | UX upsell & progressive revelation | ✅ Complete |
| 5 | AI Financial Brain & Memory Layer | ✅ Complete |
| 6 | Testing & Validation Phase 1 | ✅ Complete |
| 7 | Web POS implementation | ✅ Complete |
| 8 | Omni-channel AI chat | ✅ Complete |
| 9 | Comprehensive financial reports | ✅ Complete |
| 10 | Advanced procurement & document builder | ✅ Complete |
| 11 | Final end-to-end testing | ⬜ Pending |
| 12 | Deterministic core logic & UI polish | ✅ Complete |
| 13 | Universal Product Engine — multi-industry support | 🔄 Planning (see `docs/product_engine_upgrade.md`) |

---

## 9. Key Engineering Principles

1. **Deterministic First** — All business logic (pricing, stock deduction, journaling) is mathematically exact. No AI involvement in decisions.
2. **Tenant Isolation** — Every data record carries `tenant_id`. RLS policies enforce zero data leakage between tenants.
3. **ACID Transactions** — Sales, journals, and stock deductions run inside PostgreSQL `BEGIN/COMMIT/ROLLBACK` blocks.
4. **Event Sourcing (Partial)** — Domain events are persisted to `event_log` and processed asynchronously via BullMQ.
5. **AI as Interface** — Gemini is an interface layer (communication), not a decision layer (computation).
6. **Security in Depth** — Three guard layers: JWT Auth → Tier Guard → Role Guard on every request.
