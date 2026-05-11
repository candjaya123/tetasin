# Tumbuhin — Official Technology Stack

> **Document Purpose:** Defines the canonical technology choices and engineering standards for all layers of the platform.
> **Who Should Read This:** All engineers, DevOps, and AI coding assistants.
> **Why It Matters:** Prevents random technology adoption, ensures consistency across teams, and reduces onboarding friction.

---

## 1. Current Problems

| Problem | Impact |
|---|---|
| `app/` (React Native Expo) referenced in `description.md` but actual mobile is Flutter | Documentation drift — confusion for new engineers |
| No formal technology adoption process documented | Ad-hoc library introductions create dependency sprawl |
| Redis used only for BullMQ — no caching layer yet | Performance bottleneck risk at scale |
| No formal CDN or asset delivery strategy | Slow media load times globally |
| AI SDK used directly without version pinning strategy | Breaking changes risk in Gemini API updates |

---

## 2. Ideal Structure — Official Stack

### 2.1 Frontend — Web Dashboard

| Technology | Purpose | Version |
|---|---|---|
| **Next.js** | React framework with App Router | 14.x |
| **TypeScript** | Type-safe development | 5.x |
| **Tailwind CSS** | Utility-first styling | 3.x |
| **Shadcn/UI** | Component library built on Radix UI | Latest |
| **React Query / SWR** | Server-state management (ideal: standardize on one) | — |
| **Zustand** | Client-state management | 4.x |
| **Recharts** | Financial data visualization | 2.x |

### 2.2 Frontend — Mobile App

| Technology | Purpose | Version |
|---|---|---|
| **Flutter** | Cross-platform mobile framework | 3.x |
| **Dart** | Language | 3.x |
| **Riverpod / Provider** | State management (ideal: standardize on Riverpod) | — |
| **Dio** | HTTP client for API calls | 5.x |
| **flutter_secure_storage** | Secure token storage | Latest |

### 2.3 Backend API

| Technology | Purpose | Version |
|---|---|---|
| **NestJS** | Modular Node.js backend framework | 10.x |
| **TypeScript** | Type-safe development | 5.x |
| **Passport.js** | Authentication strategy framework | — |
| **BullMQ** | Redis-backed job queue | 5.x |
| **nestjs-pino** | Structured logging | — |
| **@nestjs/cqrs** | CQRS pattern support | — |
| **@nestjs/schedule** | Cron job scheduling | — |
| **class-validator** | DTO validation | — |
| **class-transformer** | Serialization/deserialization | — |

### 2.4 Database & Infrastructure

| Technology | Purpose | Notes |
|---|---|---|
| **Supabase (PostgreSQL)** | Primary database, Auth, RLS, Storage | Managed |
| **PostgreSQL** | Underlying database engine | 15.x via Supabase |
| **Redis** | BullMQ broker, (future) caching layer | 7.x |
| **Supabase Auth** | JWT-based authentication | Managed |
| **Supabase Storage** | File storage (avatars, receipts) | Managed |
| **Supabase RLS** | Row-level security for tenant isolation | Enforced |

### 2.5 AI & ML

| Technology | Purpose | Notes |
|---|---|---|
| **Google Gemini 1.5 Flash** | Chat, OCR receipt scanning, financial insight | Managed API |
| **@google/generative-ai** | Official Google AI Node.js SDK | Pinned version |

### 2.6 External Integrations

| Integration | Purpose |
|---|---|
| **Midtrans** | Payout / withdrawal processing |
| **Supabase Edge Functions** | Webhooks, email triggers, Midtrans callbacks |

### 2.7 DevOps & Infrastructure

| Technology | Purpose |
|---|---|
| **Docker** | Containerization for backend |
| **Docker Compose** | Local development environment |
| **GitHub Actions** | CI/CD pipeline |
| **Vercel** | Web frontend deployment |
| **Railway / Render / VPS** | Backend deployment |
| **Grafana + Loki** | Log aggregation and monitoring (recommended) |

---

## 3. Naming Conventions

### 3.1 Backend (NestJS / TypeScript)

```typescript
// Files: kebab-case
sales.service.ts
journal.repository.ts
create-sale.dto.ts

// Classes: PascalCase
class SalesService {}
class JournalRepository {}

// Methods: camelCase
async processSale(dto: CreateSaleDto): Promise<SaleResponse> {}

// Constants: SCREAMING_SNAKE_CASE
const MAX_TRANSACTION_LIMIT = 500;

// DTOs: Descriptive, suffixed
class CreateSaleDto {}
class SaleResponseDto {}
class UpdateProductDto {}
```

### 3.2 Database (PostgreSQL)

```sql
-- Tables: snake_case, plural
journal_entries
product_recipes
tenant_notification_configs

-- Columns: snake_case
tenant_id, created_at, updated_at, is_active

-- Indexes: idx_<table>_<column>
CREATE INDEX idx_journal_entries_tenant_id ON journal_entries(tenant_id);

-- Functions: snake_case
process_sale(), refresh_ledger_analytics()

-- Enums: snake_case values
CREATE TYPE subscription_tier AS ENUM ('starter', 'business', 'pro');
```

### 3.3 API Endpoints

```
GET    /api/v1/sales                → List sales
POST   /api/v1/sales                → Create sale
GET    /api/v1/sales/:id            → Get single sale
PUT    /api/v1/sales/:id            → Update sale (full)
PATCH  /api/v1/sales/:id            → Partial update
DELETE /api/v1/sales/:id            → Delete sale
```

---

## 4. Refactor Direction

1. **Standardize state management:** Choose either React Query or SWR for web — not both
2. **Standardize mobile state:** Migrate to Riverpod for Flutter consistency
3. **Version-pin AI SDK:** Lock `@google/generative-ai` to a specific minor version, test upgrades in staging
4. **Redis caching:** Add explicit caching decorators for report endpoints using Redis
5. **CDN:** Add Cloudflare or Vercel Edge Network for static assets and avatar images

---

## 5. Technology Adoption Policy

New technologies must go through the following process:

1. **Proposal:** File an ADR in `docs/adr/` explaining the need
2. **Proof of Concept:** Build a PoC in a feature branch
3. **Review:** Tech lead + 2 senior engineers review
4. **Security Audit:** Check for known CVEs and license compatibility
5. **Approval:** Add to this document as official technology

**Technologies explicitly forbidden without approval:**
- Replacing PostgreSQL with NoSQL (data integrity risk)
- Using AI to execute financial transactions
- Using `eval()` or dynamic code execution in backend
- Direct database access from frontend (must go through backend API)

---

## 6. Long-Term Recommendations

| Recommendation | Rationale |
|---|---|
| Adopt **OpenTelemetry** for distributed tracing | Gemini calls, DB queries, queue jobs need unified tracing |
| Move to **Kubernetes** when tenant count exceeds 5,000 | Docker Compose won't scale beyond a single node |
| Evaluate **Bun** as Node.js alternative for backend | 3–5x faster cold starts, TypeScript native |
| Implement **Rate Limiting** per tenant at API gateway level | Protect shared infrastructure from tenant abuse |
| Evaluate **pgBouncer** or **Supavisor** for connection pooling | Supabase's built-in pooler may need tuning at scale |
