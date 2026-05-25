# Tetasin — Deployment & Operations

> **Document Purpose:** Defines deployment architecture, CI/CD pipelines, health checks, environment configuration, monitoring, backup schedules, and runbook procedures.
> **Who Should Read This:** DevOps engineers, backend engineers, and on-call responders.

---

## 1. Infrastructure Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                        PRODUCTION STACK                               │
├──────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  Web (Vercel)            Admin (Vercel)            Flutter (App Store) │
│  tetasin.com            admin.tetasin.com        iOS + Android       │
│       │                        │                                       │
│       └────────────────────────┘                                       │
│                         │                                              │
│                    Cloudflare CDN                                      │
│                         │                                              │
│              ┌──────────▼──────────────┐                              │
│              │  NestJS API (Docker)     │                              │
│              │  api.tetasin.com        │                              │
│              │  Port 3001               │                              │
│              └──────────┬──────────────┘                              │
│           ┌─────────────┼─────────────┐                               │
│           ▼             ▼             ▼                                │
│      Supabase         Redis        Gemini                              │
│      PostgreSQL       (BullMQ +    API                                 │
│      + Auth + RLS     Caching)                                         │
│      + Storage                                                         │
│                                                                        │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 2. Environment Configuration

### 2.1 Required Backend Environment Variables

```bash
# Database
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...       # Backend only — NEVER expose to client
SUPABASE_JWT_SECRET=your-jwt-secret

# AI
GOOGLE_GEMINI_API_KEY=AIza...

# Payment
MIDTRANS_SERVER_KEY=SB-Mid-server-...
MIDTRANS_CLIENT_KEY=SB-Mid-client-...
MIDTRANS_IS_PRODUCTION=false           # true in production only

# Queue
REDIS_HOST=redis
REDIS_PORT=6379
USE_MOCK_REDIS=false                   # true ONLY in local dev

# App
NODE_ENV=production
PORT=3001
WEB_URL=https://tetasin.com
ADMIN_URL=https://admin.tetasin.com
```

### 2.2 Frontend Environment Variables

```bash
# Web (.env.local) — NEXT_PUBLIC_ prefix = safe for browser
NEXT_PUBLIC_BACKEND_URL=https://api.tetasin.com
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...   # Anon key only, NOT service role
```

---

## 3. Docker Configuration

### 3.1 Backend Dockerfile

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --frozen-lockfile
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3001
CMD ["node", "dist/main.js"]
```

### 3.2 Docker Compose (Local Dev)

```yaml
services:
  api:
    build: ./backend
    ports: ["3001:3001"]
    environment:
      - USE_MOCK_REDIS=true
      - NODE_ENV=development
    volumes:
      - ./backend:/app
      - /app/node_modules
    command: npm run start:dev

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
```

---

## 4. CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run lint             # ESLint + Prettier
      - run: npm run tsc              # TypeScript check
      - run: npm run test:unit        # Unit tests
      - run: npm run test:integration # Integration tests
      - run: npm run test:cov         # Coverage gate

  deploy-staging:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - name: Build Docker image
        run: docker build -t tetasin-api:${{ github.sha }} ./backend
      - name: Deploy to staging
        run: |
          docker push $REGISTRY/tetasin-api:${{ github.sha }}
          kubectl set image deployment/api api=$REGISTRY/tetasin-api:${{ github.sha }} -n staging

  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment: production           # Requires manual approval
    steps:
      - name: Deploy to production
        run: |
          kubectl set image deployment/api api=$REGISTRY/tetasin-api:${{ github.sha }} -n production
      - name: Verify rollout
        run: kubectl rollout status deployment/api -n production --timeout=5m
```

---

## 5. Health Checks

### 5.1 API Health Endpoint (Public)

```
GET /api/v1/health
```

```json
{
  "status": "ok",
  "timestamp": "2026-05-11T08:00:00Z",
  "version": "1.2.3",
  "services": {
    "database": "ok",
    "redis": "ok",
    "gemini": "ok"
  }
}
```

### 5.2 Readiness vs Liveness

```typescript
// GET /api/v1/health/live — fast, no external calls
// Returns 200 immediately if process is running
// GET /api/v1/health/ready — checks DB + Redis
// Returns 200 only if all dependencies are reachable
```

---

## 6. Monitoring & Observability

### 6.1 Structured Logs (Pino → Loki → Grafana)

Every log entry includes:
- `traceId` — correlates request through all layers
- `tenantId` — enables per-tenant incident investigation
- `action` — machine-readable event name
- `duration` — performance tracking

### 6.2 Performance Targets (SLA)

| Endpoint | P50 | P95 | P99 |
|---|---|---|---|
| `POST /api/v1/sales` | < 200ms | < 400ms | < 500ms |
| `GET /api/v1/finance/balance-sheet` | < 100ms (cached) | < 300ms | < 500ms |
| `GET /api/v1/report/dashboard` | < 300ms | < 600ms | < 1000ms |
| `POST /api/v1/receipt/scan` | < 300ms | < 500ms | < 800ms |
| `POST /api/v1/ai/chat` (enqueue) | < 500ms | < 800ms | < 1000ms |
| `GET /api/v1/inventory/products` | < 100ms | < 250ms | < 300ms |

### 6.3 Alerting Thresholds

| Metric | Warning | Critical |
|---|---|---|
| API error rate | > 1% | > 5% |
| P99 response time | > 1000ms | > 3000ms |
| BullMQ queue depth | > 500 jobs | > 2000 jobs |
| DB connection pool | > 70% utilized | > 90% |
| Redis memory | > 70% | > 90% |

---

## 7. Backup Strategy

| Resource | Frequency | Retention | Method |
|---|---|---|---|
| PostgreSQL | Continuous WAL + Daily snapshots | 30 days | Supabase managed |
| Redis | Daily RDB snapshot | 7 days | Manual + cron |
| Receipt images | On upload | 90 days, then auto-delete | Supabase Storage lifecycle |
| Environment variables | On change | Indefinite | 1Password / AWS Secrets Manager |

---

## 8. Rollback Procedures

### 8.1 API Rollback (Kubernetes)

```bash
# Rollback to previous deployment
kubectl rollout undo deployment/api -n production

# Rollback to specific revision
kubectl rollout history deployment/api -n production
kubectl rollout undo deployment/api --to-revision=5 -n production
```

### 8.2 Database Rollback

Migrations use `IF NOT EXISTS` and `IF EXISTS` guards to be idempotent.

```sql
-- All migrations in: backend/src/core/database/migrations/
-- Naming convention: NNN_description.sql
-- Example: 007_receipt_module.sql
```

For emergency DB rollback:
1. Identify migration to revert
2. Run corresponding `DOWN` SQL (kept in same file under `-- DOWN:` comment)
3. Verify application startup succeeds with previous schema

---

## 9. Operations Runbook

### 9.1 High Error Rate

```
1. Check /api/v1/health — is DB/Redis reachable?
2. Check Grafana error rate dashboard
3. Filter logs by traceId for a failing request
4. If DB error → check Supabase dashboard for connection pool exhaustion
5. If Redis error → restart Redis pod, check BullMQ queue backlog
6. If Gemini error → AI endpoints fail gracefully; non-AI endpoints unaffected
```

### 9.2 Scheduled Maintenance

```bash
# Maintenance mode — returns 503 for all API requests except /health
kubectl set env deployment/api MAINTENANCE_MODE=true -n production

# After maintenance:
kubectl set env deployment/api MAINTENANCE_MODE=false -n production
```

### 9.3 BullMQ Queue Drain

```bash
# Clear stuck jobs from a specific queue
redis-cli FLUSHDB  # ⚠️ Clears ALL queue jobs — use only in emergency

# Or selectively via Bull Dashboard at /admin/queue
```
