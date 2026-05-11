# Tumbuhin — API Contract

> **Document Purpose:** Defines backend/frontend communication standards — endpoint structure, request/response format, authentication, pagination, filtering, error standards, and API versioning.
> **Who Should Read This:** All frontend and backend engineers, QA, and AI coding assistants.
> **Why It Matters:** Inconsistent API contracts are the #1 cause of frontend/backend integration failures.

---

## 1. Current Problems

| Problem | Severity | Description |
|---|---|---|
| No formal API versioning policy | 🔴 High | URL has `/api/v1/` but no deprecation strategy |
| Inconsistent response envelopes | 🟡 Medium | Some return `{ data, meta }`, others return raw arrays |
| No standard pagination format | 🟡 Medium | Different endpoints use different pagination |
| Error codes not standardized | 🟡 Medium | Some return HTTP status + string, others return structured errors |
| Missing OpenAPI/Swagger documentation | 🟡 Medium | No machine-readable contract |

---

## 2. Base URL

```
Production:  https://api.tumbuhin.com/api/v1
Staging:     https://staging-api.tumbuhin.com/api/v1
Local Dev:   http://localhost:3000/api/v1
```

---

## 3. Authentication

All authenticated endpoints require:

```http
Authorization: Bearer <supabase_jwt_token>
Content-Type: application/json
X-Trace-Id: <uuid>
```

---

## 4. Standard Response Envelope

**Success:**
```json
{
  "success": true,
  "data": { },
  "meta": { "page": 1, "per_page": 20, "total": 150 },
  "timestamp": "2026-05-11T08:00:00Z"
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "Insufficient stock for product: Kopi Susu",
    "details": { "product_id": "uuid", "required": 5, "available": 2 }
  },
  "trace_id": "abc123"
}
```

---

## 5. HTTP Status Codes

| Status | When to Use |
|---|---|
| `200 OK` | GET, successful PUT/PATCH |
| `201 Created` | POST that creates a resource |
| `204 No Content` | DELETE |
| `400 Bad Request` | Validation error, business rule violation |
| `401 Unauthorized` | Missing or invalid JWT |
| `403 Forbidden` | Wrong tier or role |
| `404 Not Found` | Non-existent resource |
| `409 Conflict` | Idempotency key reused |
| `422 Unprocessable Entity` | Business logic failure (insufficient stock, unbalanced journal) |
| `429 Too Many Requests` | Rate limit exceeded |
| `500 Internal Server Error` | Unhandled exception only |

---

## 6. Pagination

```
GET /api/v1/transactions?page=1&per_page=20&sort=created_at&order=desc
```

| Param | Default | Max |
|---|---|---|
| `page` | `1` | — |
| `per_page` | `20` | `100` |
| `sort` | `created_at` | — |
| `order` | `desc` | — |

---

## 7. Core Endpoints

### 7.1 Sales / POS

```
POST   /api/v1/sales
GET    /api/v1/sales
GET    /api/v1/sales/:id
PATCH  /api/v1/sales/:id/void
```

**POST /api/v1/sales — Request:**
```json
{
  "items": [{ "product_id": "uuid", "quantity": 2, "unit_price": 15000 }],
  "payment_method": "cash",
  "discount_amount": 0,
  "idempotency_key": "session-uuid-timestamp"
}
```

**POST /api/v1/sales — Response (201):**
```json
{
  "success": true,
  "data": {
    "transaction_id": "uuid",
    "journal_id": "uuid",
    "total_amount": 30000,
    "status": "committed"
  }
}
```

### 7.2 Inventory

```
GET    /api/v1/inventory/products
POST   /api/v1/inventory/products
GET    /api/v1/inventory/products/:id
PUT    /api/v1/inventory/products/:id
DELETE /api/v1/inventory/products/:id
GET    /api/v1/inventory/raw-materials
POST   /api/v1/inventory/raw-materials
POST   /api/v1/inventory/stock-adjustment
```

### 7.3 Finance & Accounting

```
GET    /api/v1/accounting/journal-entries
POST   /api/v1/accounting/journal-entries
GET    /api/v1/accounting/coa
POST   /api/v1/accounting/coa
GET    /api/v1/finance/ledger
GET    /api/v1/finance/trial-balance
GET    /api/v1/finance/income-statement
GET    /api/v1/finance/balance-sheet
GET    /api/v1/finance/cash-flow
```

### 7.4 AI

```
POST   /api/v1/ai/chat               ← Business tier+
POST   /api/v1/ai/scan-receipt       ← Pro tier only
GET    /api/v1/ai/insights
```

**POST /api/v1/ai/chat:**
```json
// Request
{ "prompt": "Bagaimana kondisi keuangan bulan ini?" }

// Response
{
  "success": true,
  "data": { "response": "Omset bulan ini Rp 15.2 juta..." }
}
```

### 7.5 Procurement

```
GET    /api/v1/procurement/purchase-orders
POST   /api/v1/procurement/purchase-orders
PATCH  /api/v1/procurement/purchase-orders/:id/approve
GET    /api/v1/procurement/drafts
GET    /api/v1/procurement/sales-orders
```

### 7.6 Other Modules

```
GET    /api/v1/promo
POST   /api/v1/promo
POST   /api/v1/promo/apply
GET    /api/v1/report/dashboard
GET    /api/v1/report/sales
GET    /api/v1/business-profile
GET    /api/v1/business-profile/staff
POST   /api/v1/business-profile/staff
POST   /api/v1/withdrawal/request
GET    /api/v1/withdrawal/balance
```

---

## 8. Tier Rejection Response

```json
{
  "success": false,
  "error": {
    "code": "TIER_RESTRICTION",
    "message": "This feature requires Business tier or higher",
    "required_tier": "business",
    "current_tier": "starter",
    "upgrade_url": "/subscription/upgrade"
  }
}
```

---

## 9. Idempotency

```http
POST /api/v1/sales
Idempotency-Key: <client-generated-uuid>
```

Implemented on `/api/v1/sales` and `/api/v1/journal` via `IdempotencyMiddleware`. 24-hour TTL.

---

## 10. Rate Limiting

| Endpoint Group | Limit |
|---|---|
| `POST /api/v1/ai/*` | 60 requests/hour per tenant |
| `POST /api/v1/sales` | 300 requests/minute per tenant |
| `GET /api/v1/finance/*` | 30 requests/minute per tenant |
| All other | 300 requests/minute |

---

## 11. Error Codes Reference

| Code | Description |
|---|---|
| `UNAUTHORIZED` | Invalid or expired JWT |
| `TIER_RESTRICTION` | Feature not available at current subscription tier |
| `ROLE_RESTRICTION` | User role insufficient |
| `INSUFFICIENT_STOCK` | Not enough inventory |
| `JOURNAL_IMBALANCE` | Debits ≠ Credits |
| `DUPLICATE_REQUEST` | Idempotency key already used |
| `TRANSACTION_LIMIT` | Monthly transaction limit reached (Starter) |
| `VALIDATION_ERROR` | DTO validation failed |
| `NOT_FOUND` | Resource does not exist |
| `INTERNAL_ERROR` | Unhandled server error |

---

## 12. Refactor Direction

1. Apply `ResponseInterceptor` uniformly across all controllers
2. Add `@nestjs/swagger` decorators to all DTOs
3. Implement `@nestjs/throttler` for rate limiting
4. Add `Sunset` header to deprecated endpoints
5. Generate OpenAPI spec as part of CI pipeline

---

## 13. Long-Term Recommendations

| Recommendation | Rationale |
|---|---|
| Publish versioned OpenAPI spec | Machine-readable contract for SDK generation |
| Add API gateway (Kong / AWS) | Centralized rate limiting and routing |
| Flutter SDK auto-generated from OpenAPI | Type-safe client |
| Webhook support for domain events | Third-party integration |
