# Tumbuhin — API Contract

> **Document Purpose:** Defines backend/frontend communication standards — endpoint structure, request/response format, authentication, pagination, filtering, error standards, and versioning.
> **Who Should Read This:** All frontend and backend engineers, QA, and AI coding assistants.

---

## 1. Base URL

```
Production:  https://api.tumbuhin.com/api/v1
Staging:     https://staging-api.tumbuhin.com/api/v1
Local Dev:   http://localhost:3001/api/v1
```

---

## 2. Authentication

All authenticated endpoints require:

```http
Authorization: Bearer <supabase_jwt_token>
Content-Type: application/json
X-Trace-Id: <uuid>
```

Public endpoints are explicitly decorated with `@Public()` and require no token.

---

## 3. Standard Response Envelope

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

All responses — success and error — are wrapped in this envelope. No endpoint returns a raw array or raw object.

---

## 4. HTTP Status Codes

| Status | When |
|---|---|
| `200 OK` | GET, successful PUT/PATCH |
| `201 Created` | POST that creates a resource |
| `204 No Content` | DELETE |
| `400 Bad Request` | Validation error |
| `401 Unauthorized` | Missing or invalid JWT |
| `403 Forbidden` | Wrong tier or role |
| `404 Not Found` | Non-existent resource |
| `409 Conflict` | Idempotency key reused |
| `422 Unprocessable Entity` | Business logic failure (insufficient stock, unbalanced journal) |
| `429 Too Many Requests` | Rate limit exceeded |
| `500 Internal Server Error` | Unhandled exception only |

---

## 5. Pagination

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

## 6. Core Endpoints

### 6.1 Sales / POS

```
POST   /api/v1/sales                → Create sale (idempotent)
GET    /api/v1/sales                → List sales
GET    /api/v1/sales/:id            → Get single sale
PATCH  /api/v1/sales/:id/void       → Void a sale
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

### 6.2 Inventory

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

### 6.3 Finance & Accounting

```
GET    /api/v1/accounting/journal-entries
POST   /api/v1/accounting/journal-entries
GET    /api/v1/accounting/coa
POST   /api/v1/accounting/coa
GET    /api/v1/finance/ledger
GET    /api/v1/finance/trial-balance
GET    /api/v1/finance/income-statement
GET    /api/v1/finance/balance-sheet         ← Pro tier only
GET    /api/v1/finance/cash-flow
```

### 6.4 AI

```
POST   /api/v1/ai/chat               ← Business tier+
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

### 6.5 Receipt OCR (ADR-007)

```
POST   /api/v1/receipt/scan                   ← Upload image, returns scan_id (Business+)
GET    /api/v1/receipt/scan/:id               ← Poll scan status + result
POST   /api/v1/receipt/drafts                 ← Create manual draft (no receipt)
GET    /api/v1/receipt/drafts                 ← List draft transactions
GET    /api/v1/receipt/drafts/:id             ← Get single draft with AI recommendations
PATCH  /api/v1/receipt/drafts/:id             ← Edit draft fields
POST   /api/v1/receipt/drafts/:id/approve     ← Approve → create real transaction + journal
POST   /api/v1/receipt/drafts/:id/reject      ← Reject draft
GET    /api/v1/receipt/merchants              ← List learned merchant mappings
```

### 6.6 Procurement

```
GET    /api/v1/procurement/purchase-orders
POST   /api/v1/procurement/purchase-orders
PATCH  /api/v1/procurement/purchase-orders/:id/approve
PATCH  /api/v1/procurement/purchase-orders/:id/fulfill
GET    /api/v1/procurement/drafts
GET    /api/v1/procurement/sales-orders
```

### 6.7 Other Modules

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
GET    /api/v1/health                         ← Public, no auth
```

---

## 7. Tier Rejection Response

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

## 8. Idempotency

```http
POST /api/v1/sales
Idempotency-Key: <client-generated-uuid>
```

Implemented on `/api/v1/sales` and `/api/v1/journal` via `IdempotencyMiddleware`. 24-hour TTL. Returns `409 Conflict` on duplicate key with original response body.

---

## 9. Rate Limiting

| Endpoint Group | Limit |
|---|---|
| `POST /api/v1/receipt/scan` | 60 requests/hour per tenant |
| `POST /api/v1/ai/chat` | 60 requests/hour per tenant |
| `POST /api/v1/sales` | 300 requests/minute per tenant |
| `GET /api/v1/finance/*` | 30 requests/minute per tenant |
| All other | 300 requests/minute |

---

## 10. Error Codes Reference

| Code | HTTP | Description |
|---|---|---|
| `UNAUTHORIZED` | 401 | Invalid or expired JWT |
| `TIER_RESTRICTION` | 403 | Feature not available at current subscription tier |
| `ROLE_RESTRICTION` | 403 | User role insufficient |
| `INSUFFICIENT_STOCK` | 422 | Not enough inventory |
| `JOURNAL_IMBALANCE` | 422 | Debits ≠ Credits |
| `DUPLICATE_REQUEST` | 409 | Idempotency key already used |
| `TRANSACTION_LIMIT` | 422 | Monthly transaction limit reached (Starter) |
| `VALIDATION_ERROR` | 400 | DTO validation failed |
| `NOT_FOUND` | 404 | Resource does not exist |
| `AI_RATE_LIMIT` | 429 | Gemini API rate limit hit |
| `OCR_FAILED` | 422 | Receipt image could not be processed |
| `DRAFT_ALREADY_APPROVED` | 409 | Draft is already in approved state |
| `MISSING_ACCOUNT_MAPPING` | 422 | Draft requires debit + credit account before approval |
| `INTERNAL_ERROR` | 500 | Unhandled server error |
