# Tumbuhin — Deployment & Infrastructure

> **Document Purpose:** Defines deployment strategy, environments, CI/CD pipeline, containerization, monitoring, logging, backup, and rollback procedures.
> **Who Should Read This:** DevOps engineers, backend engineers, technical leads.
> **Why It Matters:** Reliable operations are essential for a SaaS platform. Deployment failures directly impact tenant revenue.

---

## 1. Current Problems

| Problem | Severity | Description |
|---|---|---|
| No formal CI/CD pipeline documented | 🔴 High | Manual deployment risk — no automated testing before deploy |
| No documented rollback strategy | 🔴 High | If deploy fails, no procedure to revert |
| Redis config uses `ioredis-mock` fallback in production code | 🟡 Medium | `process.env.USE_MOCK_REDIS === 'true'` is a production footgun |
| No health check endpoint | 🟡 Medium | Load balancer has no way to detect unhealthy instance |
| No backup schedule for Supabase DB | 🟡 Medium | Data loss risk |
| BullMQ worker co-located with API server | 🟡 Medium | CPU-intensive jobs can starve API threads |

---

## 2. Environments

| Environment | Purpose | URL |
|---|---|---|
| **Development** | Local dev, feature work | `localhost:3000` |
| **Staging** | Pre-release integration testing | `staging-api.tumbuhin.com` |
| **Production** | Live tenant traffic | `api.tumbuhin.com` |

**Environment Variables per Environment:**

```bash
# Development
NODE_ENV=development
USE_MOCK_REDIS=true       ← Only valid in development, never staging/prod

# Staging
NODE_ENV=staging
USE_MOCK_REDIS=false
REDIS_HOST=redis.staging.internal

# Production
NODE_ENV=production
USE_MOCK_REDIS=false
REDIS_HOST=redis.prod.internal
```

---

## 3. Containerization

### 3.1 Backend Dockerfile

```dockerfile
# backend/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node", "dist/main.js"]
```

### 3.2 Docker Compose (Local Development)

```yaml
# docker-compose.yml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - REDIS_HOST=redis
    depends_on:
      - redis
    volumes:
      - ./backend/src:/app/src  # Hot reload in dev

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  worker:
    build: ./backend
    command: node dist/worker.js
    environment:
      - NODE_ENV=production
      - REDIS_HOST=redis
    depends_on:
      - redis
```

---

## 4. CI/CD Pipeline

### 4.1 GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, staging]
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
        working-directory: backend
      - run: npm run test
        working-directory: backend
      - run: npm run test:e2e
        working-directory: backend
      - name: Check coverage threshold
        run: npm run test:cov -- --coverageThreshold='{"global":{"lines":80}}'
        working-directory: backend

  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm run lint
        working-directory: backend

  deploy-staging:
    needs: [test, lint]
    if: github.ref == 'refs/heads/staging'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Staging
        run: |
          docker build -t tumbuhin-backend:staging ./backend
          docker push registry/tumbuhin-backend:staging
          # kubectl rollout or Railway/Render deploy hook

  deploy-production:
    needs: [test, lint]
    if: github.ref == 'refs/heads/main'
    environment: production  # Requires manual approval
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Production
        run: |
          docker build -t tumbuhin-backend:${{ github.sha }} ./backend
          docker push registry/tumbuhin-backend:${{ github.sha }}
          # Blue-green deploy or rolling update
```

### 4.2 Deployment Branches

```
feature/* → develop (auto-merge on PR approval)
develop   → staging (auto-deploy on merge)
staging   → main    (manual approval required, deploy to production)
```

---

## 5. Health Check Endpoint

```typescript
// app.controller.ts — Add health check
@Controller()
export class AppController {
  @Get('health')
  @Public()  // No auth required
  health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.APP_VERSION,
    };
  }
}
```

---

## 6. Monitoring & Alerting

### 6.1 Metrics to Monitor

| Metric | Alert Threshold |
|---|---|
| API P99 response time | > 2000ms |
| Error rate (5xx) | > 1% over 5 minutes |
| BullMQ queue depth | > 1000 jobs |
| Redis memory usage | > 80% |
| DB connection pool | > 80% utilized |
| AI API error rate | > 5% |

### 6.2 Logging Architecture

```
Application (Pino logs)
    │
    ▼
stdout/stderr (JSON format in production)
    │
    ▼
Log aggregator (Loki / Datadog / CloudWatch)
    │
    ▼
Grafana dashboard + Alert rules
```

### 6.3 Required Log Fields

```json
{
  "level": "info",
  "time": "2026-05-11T08:00:00Z",
  "traceId": "abc123",
  "tenantId": "uuid",
  "userId": "uuid",
  "action": "sale_processed",
  "duration": 145,
  "msg": "Sale processed successfully"
}
```

---

## 7. Backup Strategy

### 7.1 Database Backup

| Backup Type | Frequency | Retention |
|---|---|---|
| Supabase point-in-time recovery | Continuous (7 days) | 7 days (Pro plan) |
| Manual full dump | Daily | 30 days |
| Pre-migration snapshot | Before every migration | 90 days |

### 7.2 Backup Procedure

```bash
# Daily backup script (run via cron)
pg_dump $DATABASE_URL | gzip > backup-$(date +%Y%m%d).sql.gz
aws s3 cp backup-$(date +%Y%m%d).sql.gz s3://tumbuhin-backups/daily/
```

---

## 8. Rollback Strategy

### 8.1 Application Rollback

```bash
# Keep last 3 Docker image tags in registry
# If production deploy fails:
docker pull registry/tumbuhin-backend:<previous-sha>
docker tag registry/tumbuhin-backend:<previous-sha> tumbuhin-backend:production
# Redeploy previous image via deployment platform
```

### 8.2 Database Rollback

- Every migration MUST have a corresponding rollback script
- Migration naming: `V{number}__{description}.sql` + `U{number}__{description}.sql` (undo)
- Run rollback script before reverting application code

---

## 9. Refactor Direction

1. **Remove `USE_MOCK_REDIS` from production code path** — use proper Redis in all non-dev environments
2. **Add `/health` endpoint** to backend
3. **Set up GitHub Actions pipeline** with test + lint gates
4. **Add Supabase PITR** (point-in-time recovery) upgrade to Pro plan
5. **Document rollback runbook** in team wiki

---

## 10. Long-Term Recommendations

| Recommendation | Rationale |
|---|---|
| Kubernetes for orchestration | Auto-scaling, rolling updates, self-healing |
| Blue-green deployments | Zero-downtime production deploys |
| Chaos engineering (quarterly) | Test system resilience proactively |
| Multi-region deployment | Disaster recovery, latency for users outside Java |
| Infrastructure as Code (Terraform) | Reproducible infrastructure |
