# Tumbuhin — Scaling Strategy

> **Document Purpose:** Defines long-term scalability planning — horizontal scaling, caching layers, async processing, queue systems, DB scaling, CDN, and performance bottlenecks.
> **Who Should Read This:** Backend engineers, architects, DevOps.
> **Why It Matters:** Scalability must be intentionally designed early. Retrofitting scalability is 10x more expensive.

---

## 1. Current Problems

| Problem | Severity | Description |
|---|---|---|
| No caching layer — every report hits DB directly | 🔴 High | At 10k tenants, materialized view queries will be slow |
| BullMQ worker co-located with API process | 🟡 Medium | CPU-bound background jobs compete with API request handling |
| No read replica for report queries | 🟡 Medium | Analytics queries block write operations on same DB connection pool |
| AI calls are synchronous — no request queuing | 🟡 Medium | Gemini latency (1–3s) blocks HTTP response |
| No CDN for static assets | 🟡 Medium | Avatar images and receipts loaded directly from Supabase Storage |
| Materialized views refreshed every hour per global cron | 🟡 Medium | All tenants refreshed simultaneously — thundering herd |

---

## 2. Scaling Tiers

### Tier 1: 0–1,000 tenants (Current)
- Single NestJS instance
- Supabase hosted PostgreSQL
- Redis for BullMQ only
- Vercel for web frontend
- Manual scaling

### Tier 2: 1,000–10,000 tenants
- Multiple NestJS instances behind load balancer
- Redis caching for reports and hot data
- Separate BullMQ worker process
- Read replica for analytics queries
- CDN for static assets

### Tier 3: 10,000–100,000 tenants
- Microservices extraction (AI, Reporting)
- Database partitioning by tenant
- Message broker (Kafka) for high-throughput events
- Kubernetes for orchestration
- Multi-region deployment

---

## 3. Caching Strategy

### 3.1 Cache Layers

```
Client (browser/app)
  │  ← HTTP Cache headers (max-age for static data)
  ▼
CDN (Cloudflare)
  │  ← Static assets, public pages
  ▼
Application Cache (Redis)
  │  ← Report data, product catalog, COA
  ▼
Database Query Cache (PostgreSQL)
  │  ← Buffer pool, materialized views
  ▼
PostgreSQL (Supabase)
```

### 3.2 Cache TTL Strategy

| Data Type | Cache Key | TTL |
|---|---|---|
| Balance sheet | `balance-sheet:{tenantId}` | 1 hour |
| Income statement | `income-stmt:{tenantId}:{month}` | 1 hour |
| Cash flow | `cash-flow:{tenantId}:{month}` | 1 hour |
| Product catalog | `products:{tenantId}` | 15 minutes |
| Chart of accounts | `coa:{tenantId}` | 4 hours |
| Tenant tier/profile | `tenant:{tenantId}` | 30 minutes |
| AI financial summary | `ai-summary:{tenantId}` | 6 hours |

### 3.3 Cache Invalidation

```typescript
// Invalidate on data change — event-driven
@OnEvent('SaleCreated')
async onSaleCreated(event: SaleCreatedEvent) {
  await this.cache.del(`balance-sheet:${event.tenantId}`);
  await this.cache.del(`income-stmt:${event.tenantId}:${currentMonth}`);
  await this.cache.del(`products:${event.tenantId}`);
}

@OnEvent('JournalPosted')
async onJournalPosted(event: JournalPostedEvent) {
  await this.cache.del(`balance-sheet:${event.tenantId}`);
  await this.cache.del(`cash-flow:${event.tenantId}:${currentMonth}`);
}
```

---

## 4. Async Processing Strategy

### 4.1 Queue Architecture

```
Domain Event Triggered
    │
    ▼
EventBusService.emit()
    ├── Persist to event_log (synchronous)
    └── Enqueue to BullMQ (async)
           │
           ├── HIGH priority queue: sale-events
           │     └── Stock alerts, receipt generation
           ├── NORMAL priority queue: journal-events
           │     └── Report cache invalidation, ledger refresh
           └── LOW priority queue: ai-events
                 └── AI insight generation, email notifications
```

### 4.2 Queue Configuration

```typescript
// Separate queues with different priorities and concurrency
const queues = {
  'sale-events':    { concurrency: 20, priority: 1 },
  'journal-events': { concurrency: 10, priority: 2 },
  'ai-events':      { concurrency: 5,  priority: 3, rateLimiter: { max: 60, duration: 3600000 } },
  'email-events':   { concurrency: 5,  priority: 3 },
};
```

### 4.3 AI Call Optimization

```typescript
// Async AI insight generation — don't block HTTP response
async chat(dto: ChatDto, tenantId: string): Promise<{ jobId: string }> {
  const jobId = await this.aiQueue.add('generate-insight', { dto, tenantId });
  return { jobId };  // Return immediately, client polls for result
}

// Client polls: GET /api/v1/ai/result/:jobId
async getResult(jobId: string): Promise<AiResponse | { status: 'pending' }> {
  const job = await this.aiQueue.getJob(jobId);
  if (job.isCompleted()) return job.returnvalue;
  return { status: 'pending' };
}
```

---

## 5. Database Scaling

### 5.1 Indexing Strategy (Priority Order)

```sql
-- CRITICAL: All tenant-scoped, date-range queries
CREATE INDEX CONCURRENTLY idx_transactions_tenant_date 
  ON transactions(tenant_id, transaction_date DESC);

CREATE INDEX CONCURRENTLY idx_journal_entries_tenant_date 
  ON journal_entries(tenant_id, transaction_date DESC);

CREATE INDEX CONCURRENTLY idx_journal_lines_entry_account 
  ON journal_lines(journal_entry_id, account_id);

-- IMPORTANT: POS product search
CREATE INDEX CONCURRENTLY idx_products_tenant_active 
  ON products(tenant_id) WHERE is_active = TRUE;

CREATE INDEX CONCURRENTLY idx_products_barcode 
  ON products(barcode) WHERE barcode IS NOT NULL;
```

### 5.2 Read Replica Routing

```typescript
// Route read-heavy queries to replica
@Injectable()
export class DatabaseModule {
  getReadClient(): SupabaseClient {
    return createClient(env.SUPABASE_URL, env.SUPABASE_READ_KEY);
  }
  getWriteClient(): SupabaseClient {
    return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);
  }
}

// ReportRepository uses read client
class ReportRepository {
  constructor(@Inject('READ_DB') private readDb: SupabaseClient) {}
}
```

### 5.3 Table Partitioning (Future)

```sql
-- Partition high-volume tables by tenant when tenant count > 5,000
-- Or by date for time-series data

CREATE TABLE transactions (
    -- ... columns
) PARTITION BY HASH (tenant_id);

CREATE TABLE transactions_p0 PARTITION OF transactions
  FOR VALUES WITH (MODULUS 4, REMAINDER 0);
-- ... create p1, p2, p3
```

---

## 6. CDN Strategy

```
Static Assets (avatars, receipts)
  → Supabase Storage → Cloudflare CDN
  → Cache-Control: public, max-age=86400

Web App (Next.js)
  → Vercel Edge Network (built-in CDN)
  → ISR for marketing pages

API Responses (not cached at CDN level)
  → Backend handles caching via Redis
  → CDN passthrough only
```

---

## 7. Performance Targets

| Endpoint | P50 Target | P99 Target |
|---|---|---|
| `POST /api/v1/sales` | < 200ms | < 500ms |
| `GET /api/v1/report/dashboard` | < 300ms | < 1000ms |
| `GET /api/v1/finance/balance-sheet` | < 100ms (cached) | < 500ms |
| `POST /api/v1/ai/chat` | < 500ms (enqueue) | < 1000ms |
| `GET /api/v1/inventory/products` | < 100ms | < 300ms |

---

## 8. Refactor Direction

1. **Add Redis caching** for all finance/report endpoints (start with balance-sheet, income-statement)
2. **Extract BullMQ worker** to separate process (`npm run worker`)
3. **Stagger materialized view refresh** — per-tenant TTL-based refresh, not global cron
4. **Add CDN** for Supabase Storage via Cloudflare proxy
5. **Add read replica** routing for reporting queries when load increases

---

## 9. Long-Term Recommendations

| Recommendation | Timeline | Impact |
|---|---|---|
| Kubernetes + horizontal pod autoscaling | 12–18 months | Handle traffic spikes |
| Kafka for event streaming at scale | 18–24 months | 1M+ events/day |
| Database sharding by tenant | 24–36 months | 100k+ tenants |
| Multi-region active-passive | 18–24 months | Disaster recovery, APAC latency |
| GraphQL for reporting (DataLoader) | 9–12 months | Eliminate N+1 in report queries |
