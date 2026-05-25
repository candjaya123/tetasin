# Tetasin — Security Rules

> **Document Purpose:** Defines platform security standards — authentication, authorization, RBAC, validation, encryption, secret management, and audit logging.
> **Who Should Read This:** All engineers. Security is everyone's responsibility.
> **Why It Matters:** Security must be systemic, not ad-hoc. A single gap can compromise all tenant data.

---

## 1. Current Problems

| Problem | Severity | Description |
|---|---|---|
| Direct Supabase calls in web frontend bypass RBAC | 🔴 High | `promos/page.tsx` reads data without going through backend guards |
| Dual auth guard (`JwtAuthGuard` + `AuthGuard`) | 🔴 High | Undefined behavior — which guard runs first? |
| Tier enum mismatch allows bypass | 🟡 Medium | If tier name doesn't match, guard may fail open |
| No rate limiting on AI endpoints | 🟡 Medium | Unlimited AI calls per tenant = cost explosion |
| Service Role Key accessible to backend — no rotation schedule | 🟡 Medium | Leaked key = full DB access bypass RLS |
| No audit log on financial write operations | 🟡 Medium | Can't trace who created/modified journal entries |
| Missing input sanitization on AI prompt field | 🟡 Medium | Prompt injection risk |

---

## 2. Authentication Architecture

### 2.1 Auth Flow

```
Client (Web/Flutter)
  │
  ├── 1. User authenticates via Supabase Auth (email/password or OAuth)
  │
  ├── 2. Supabase returns JWT (access_token, refresh_token)
  │   └── JWT payload includes: user.id (sub), email, metadata
  │
  ├── 3. Client sends JWT in every API request:
  │   └── Authorization: Bearer <jwt>
  │
  └── 4. Backend validates JWT via SupabaseStrategy
      ├── Verify signature against Supabase JWKS
      ├── Check token expiry
      ├── Inject user into request context
      └── Allow through to next guard
```

### 2.2 Auth Guard Chain (Required Order)

```typescript
// AppModule providers (EXACT ORDER MATTERS):
providers: [
  { provide: APP_GUARD, useClass: JwtAuthGuard },   // 1. JWT validation
  { provide: APP_GUARD, useClass: TierGuard },       // 2. Subscription tier
  { provide: APP_GUARD, useClass: RoleGuard },       // 3. RBAC
]

// Public endpoints MUST be explicitly decorated:
@Public()  // Custom decorator that skips JwtAuthGuard
@Get('health')
healthCheck() {}
```

### 2.3 Token Management

| Rule | Implementation |
|---|---|
| JWT expiry | 1 hour (Supabase default) |
| Refresh token expiry | 7 days |
| Token rotation | Supabase handles automatically |
| Token storage (Web) | `httpOnly` cookie or memory only — NEVER localStorage |
| Token storage (Flutter) | `flutter_secure_storage` — NEVER SharedPreferences |

---

## 3. Authorization — RBAC Model

### 3.1 Roles

| Role | Capabilities |
|---|---|
| `manager` | Full access to all features for the tenant |
| `kasir` | POS only: browse products, process sales, view own sales |
| `stok` | Inventory only: manage products, raw materials, stock levels |

### 3.2 Role Enforcement

```typescript
// Endpoint-level RBAC
@Get('staff')
@Roles('manager')                    // Only manager can view staff
getStaff() {}

@Post('sales')
@Roles('manager', 'kasir')           // Manager and kasir can make sales
createSale() {}

// Forbidden: Never bypass RoleGuard for convenience
// ❌ Using `@Public()` on financial endpoints
```

### 3.3 Tier + Role Matrix

> `franchise` tier is available to **business accounts only**.

| Feature | Free | Pro | Franchise |
|---|---|---|---|
| POS (kasir/manager) | ✅ | ✅ | ✅ |
| Inventory (stok/manager) | ✅ | ✅ | ✅ |
| Promotions engine | ❌ | ✅ (manager) | ✅ |
| Staff accounts (RBAC) | ❌ | ✅ | ✅ |
| P&L Report | ❌ | ✅ | ✅ |
| Balance Sheet | ❌ | ✅ (manager) | ✅ |
| AI Chat | ❌ | ✅ | ✅ |
| AI Receipt Scan | ❌ | ✅ | ✅ |
| Multi-warehouse | ❌ | ✅ | ✅ |
| Multi-branch Management | ❌ | ❌ | ✅ (business only) |
| Consolidated Reporting | ❌ | ❌ | ✅ (business only) |

---

## 4. Data Isolation — Multi-Tenancy

### 4.1 Tenant Isolation Rules

1. **Every table has `tenant_id`** — no exceptions for tenant-scoped data
2. **Every backend query includes `WHERE tenant_id = user.tenant_id`** — injected from JWT context, never from user input
3. **RLS policies** enforce isolation at DB level as a second defense
4. **Service Role Key** is backend-only — never exposed to client

### 4.2 RLS Policy Pattern

```sql
-- Safe RLS using SECURITY DEFINER functions (avoid recursion)
CREATE OR REPLACE FUNCTION get_auth_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

CREATE POLICY tenant_isolation ON transactions
  FOR ALL USING (tenant_id = get_auth_tenant_id());
```

### 4.3 Cross-Tenant Access Prevention

```typescript
// ALWAYS inject tenant_id from JWT context, NEVER from user input
@Get('sales')
getSales(@User() user: TenantContext) {
  // user.tenantId comes from verified JWT, NOT from query params
  return this.salesService.findByTenant(user.tenantId, params);
}

// NEVER allow user to specify their own tenant_id
// ❌ FORBIDDEN: this.salesService.findByTenant(dto.tenantId, params);
```

---

## 5. Input Validation

### 5.1 DTO Validation Rules

```typescript
// ALL endpoints must have validated DTOs
export class CreateSaleDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];

  @IsEnum(PaymentMethod)
  payment_method: PaymentMethod;

  @IsOptional()
  @IsString()
  @MaxLength(500)         // Prevent large text injection
  notes?: string;

  @IsUUID()
  @IsOptional()
  idempotency_key?: string;
}

// AI prompt sanitization
export class ChatDto {
  @IsString()
  @MaxLength(2000)        // Prevent prompt injection via huge input
  @Transform(({ value }) => sanitizeHtml(value))  // Strip HTML/scripts
  prompt: string;
}
```

### 5.2 SQL Injection Prevention

- ALL database queries use parameterized queries (Supabase client enforces this)
- NEVER use string concatenation to build SQL
- PostgreSQL functions use `$1, $2` parameterized inputs only

---

## 6. Secret Management

### 6.1 Required Environment Variables

```bash
# Backend .env (NEVER commit to git)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...    # Service role — backend only, never expose
SUPABASE_JWT_SECRET=your-jwt-secret

GOOGLE_GEMINI_API_KEY=AIza...
MIDTRANS_SERVER_KEY=SB-Mid-server...
MIDTRANS_CLIENT_KEY=SB-Mid-client...

REDIS_HOST=localhost
REDIS_PORT=6379

NODE_ENV=production
```

### 6.2 Secret Rotation Policy

| Secret | Rotation Frequency | Action |
|---|---|---|
| Supabase Service Role Key | Every 6 months | Update in deployment config |
| Gemini API Key | Every 12 months or if leaked | Rotate immediately if suspected |
| Midtrans Keys | Per Midtrans policy | Update and redeploy |
| JWT Secret | Every 12 months | Rotates all active sessions |

### 6.3 Rules

- NEVER log secrets or tokens — even partial values
- NEVER hardcode API keys in source code
- All secrets managed via environment variables or secrets manager (Doppler/AWS Secrets Manager)
- `.env` in `.gitignore` — enforce in CI pipeline

---

## 7. Audit Logging

### 7.1 What to Audit

All write operations on financial and sensitive data MUST be logged:

```typescript
// Pattern: log before and after every critical write
async createJournalEntry(dto: CreateJournalDto, userId: string): Promise<JournalEntry> {
  this.logger.info({
    action: 'journal_entry.create',
    tenantId: dto.tenantId,
    userId,
    amount: dto.total_amount,
    traceId: this.requestContext.traceId,
  }, 'Creating journal entry');

  const entry = await this.journalRepo.create(dto);
  
  this.logger.info({ action: 'journal_entry.created', entryId: entry.id }, 'Journal entry created');
  return entry;
}
```

### 7.2 Audit Log Table

```sql
CREATE TABLE audit_logs (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id   UUID NOT NULL REFERENCES tenants(id),
    user_id     UUID REFERENCES profiles(id),
    action      TEXT NOT NULL,   -- 'sale.created', 'journal.posted', 'product.deleted'
    entity_type TEXT NOT NULL,   -- 'transaction', 'journal_entry', 'product'
    entity_id   UUID,
    payload     JSONB,           -- Relevant data snapshot
    ip_address  INET,
    trace_id    TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_audit_logs_tenant_date ON audit_logs(tenant_id, created_at DESC);
```

---

## 8. API Security Headers

```typescript
// main.ts — Apply security headers globally
app.use(helmet({
  contentSecurityPolicy: true,
  hsts: { maxAge: 31536000 },
  noSniff: true,
  xssFilter: true,
}));

app.enableCors({
  origin: [process.env.WEB_URL, process.env.ADMIN_URL],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
});
```

---

## 9. Refactor Direction

1. **Fix auth guard order** — single `JwtAuthGuard` → `TierGuard` → `RoleGuard`
2. **Migrate web direct Supabase calls** to backend API endpoints with full guard chain
3. **Add prompt sanitization** to `ChatDto`
4. **Implement rate limiting** on AI endpoints
5. **Add `audit_logs` table** and logging on all financial write operations
6. **Set up secret rotation schedule** in team runbook

---

## 10. Long-Term Recommendations

| Recommendation | Rationale |
|---|---|
| Penetration testing (quarterly) | Discover vulnerabilities before attackers do |
| WAF (Web Application Firewall) | Block common OWASP attacks at edge |
| SIEM integration | Centralized security event monitoring |
| SOC 2 Type II compliance | Required for enterprise customers |
| End-to-end encryption for sensitive fields | Encrypt NPWP, bank account numbers at rest |
