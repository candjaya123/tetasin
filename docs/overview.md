# Tetasin Platform — Project Overview

> **Document Purpose:** High-level entry point for all stakeholders — engineers, architects, PMs, QA, and AI coding assistants — to understand the product vision, scope, actors, and system boundaries.
> **Who Should Read This:** Everyone joining or contributing to the project.
> **Why It Matters:** Without a shared understanding of what we're building and for whom, every individual decision risks misalignment.

---

## 1. Product Vision

**Tetasin** is a **multi-tenant SaaS ERP and AI platform** purpose-built for Indonesian SMEs (UMKM). It digitizes the full operational lifecycle of a small-to-medium business — from point-of-sale to procurement, inventory, accounting, and financial reporting — under a single, subscription-based roof.

**Core Promise:**
> "Upload a receipt → Automatically becomes a double-entry journal. One platform to run your entire business."

**North Star Metric:** Number of active business tenants generating at least one POS transaction per week.

---

## 2. Target Users (Actors)

| Actor | Account Type | Description | Primary Platforms |
|---|---|---|---|
| **Personal User** | `personal` | Individual tracking personal income, expenses, savings goals, and net worth | Mobile App (primary), Web Dashboard |
| **Business Owner (Manager)** | `business` | Registers the tenant, configures the business, views financial reports, approves POs | Web Dashboard, Mobile App |
| **Cashier (Kasir)** | `business` | Operates the POS terminal, processes daily sales | Web POS, Mobile App |
| **Stock Manager (Stok)** | `business` | Manages raw materials, inventory replenishment, stock opnames | Web Dashboard, Mobile App |
| **Super Admin** | — | Platform-level administration, tenant management, subscription billing | Admin Panel (Web) |
| **AI Virtual CFO** | `business` | Autonomous agent that reads aggregated financial data and generates insights/recommendations | Chat Widget (Web + Mobile) |

> ⚠️ **`account_type` is immutable.** It is set once at registration and can never be changed. Personal and business accounts are completely separate product modes. There is no upgrade path from personal → business.

---

## 3. Core Domains

### 3.1 Business Account Domains (`account_type = 'business'`)

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
| **Subscription & Billing** | Tier model enforced at API and UI layers |
| **Bill Tracker & Reminder** | Track hutang/piutang (payables/receivables) with due-date smart alerts and one-tap payment journaling |

### 3.2 Personal Account Domains (`account_type = 'personal'`)

| Domain | Description |
|---|---|
| **Personal Finance Tracker** | Income/expense logging with double-entry integrity; replaces POS for personal users |
| **Budget Management** | Monthly per-category spending limits with real-time vs-actual progress tracking |
| **Financial Goals** | Savings targets, debt payoff goals, and emergency fund building with progress rings |
| **Recurring Transactions** | Scheduled income/expense reminders with one-tap journal confirmation (`premium` only) |
| **Net Worth Dashboard** | Real-time snapshot of total assets minus liabilities |
| **Financial Reporting** | Monthly cash flow, net worth trend, expense breakdown by category |
| **Bill Tracker & Reminder** | Track personal hutang/piutang (loans owed and owed to you) with due-date reminders and payment journaling |

---

## 4. Platform Scope

### 4.1 What Tetasin IS

- A **multi-tenant SaaS platform** — each business gets its own isolated data environment
- A **deterministic ERP engine** — all financial calculations are mathematically exact; AI is advisory only
- A **cross-platform product** — Web Dashboard (Next.js), Mobile App (Flutter), and a shared Backend API (NestJS)
- An **AI-augmented** (not AI-driven) platform — Gemini handles communication, not computation

### 4.2 What Tetasin IS NOT

- Not a payment gateway (uses Midtrans as an integration)
- Not a raw marketplace (B2C sales to end-consumers happen via POS, not an e-commerce storefront)
- Not a general-purpose accounting software (purpose-built for SME operational use cases)
- Not an AI-autonomous system (AI cannot execute transactions or modify data)

---

## 5. Subscription Tiers

> ⚠️ **Tiers are split by account_type.** Personal and business accounts have completely separate tier tracks. A tier valid for one track is **invalid** for the other. The backend enforces this with `AccountTypeGuard` + `TierGuard` on every request.

### 5.1 Personal Account Tiers

| Tier | DB Value | Price | Description |
|---|---|---|---|
| Personal Free | `free` | Rp 0 | Basic income/expense tracking, limited entries |
| Personal Premium | `premium` | Rp 49k/mo | Unlimited tracking, goals, recurring, export |

### 5.2 Business Account Tiers

| Tier | DB Value | Price | Description |
|---|---|---|---|
| Business Free | `free` | Rp 0 | Trial POS, 100 transactions/month |
| Business Pro | `pro` | Rp 99k–249k/mo | Full ERP, staff RBAC, multi-warehouse, AI |
| Business Franchise | `franchise` | Rp 499k+/mo | Multi-branch consolidated operations |

### 5.3 Feature Matrix

| Feature | Personal Free | Personal Premium | Business Free | Business Pro | Business Franchise |
|---|---|---|---|---|---|
| Income/Expense Logging | ✅ 100/mo | ✅ Unlimited | ❌ | ❌ | ❌ |
| POS Sales | ❌ | ❌ | ✅ 100/mo | ✅ Unlimited | ✅ All branches |
| Budget Management | ✅ 3 categories | ✅ Unlimited | ❌ | ❌ | ❌ |
| Financial Goals | ✅ 2 goals | ✅ Unlimited | ❌ | ❌ | ❌ |
| Recurring Transactions | ❌ | ✅ Unlimited | ❌ | ❌ | ❌ |
| Net Worth Dashboard | ✅ | ✅ | ❌ | ❌ | ❌ |
| Inventory + Products | ❌ | ❌ | ✅ Basic | ✅ Full | ✅ Multi-branch |
| Raw Materials (BOM/HPP) | ❌ | ❌ | ❌ | ✅ | ✅ |
| Staff RBAC | ❌ | ❌ | ❌ | ✅ | ✅ |
| Multi-Warehouse | ❌ | ❌ | ❌ | ✅ | ✅ |
| AI Chat + Receipt OCR | ❌ | ❌ | ❌ | ✅ | ✅ |
| Consolidated Reports | ❌ | ❌ | ❌ | ❌ | ✅ |
| Financial Reports | Monthly summary | Full P&L, Neraca | Monthly | Full | All branches |
| Transaction History | 3 months | Unlimited | 30 days | Unlimited | Unlimited |
| Export | ❌ | CSV + PDF | ❌ | CSV + PDF | CSV + PDF + API |

### 5.4 Canonical Tier Values

```typescript
// subscription_tier ENUM in DB:
enum SubscriptionTier {
  FREE      = 'free',      // Both personal & business entry tier
  PREMIUM   = 'premium',   // Personal accounts ONLY
  PRO       = 'pro',       // Business accounts ONLY
  FRANCHISE = 'franchise', // Business accounts ONLY
}

// Valid tiers per account_type:
PERSONAL_TIERS  = ['free', 'premium']
BUSINESS_TIERS  = ['free', 'pro', 'franchise']
```

> ⚠️ **NEVER** use old values `'starter'`, `'business'`, `'full'`, or `'ai'`
> ⚠️ **NEVER** assign `'premium'` to a business account or `'pro'`/`'franchise'` to a personal account — backend raises `ACCOUNT_TYPE_TIER_MISMATCH (403)`

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
