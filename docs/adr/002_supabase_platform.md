# ADR-002: Supabase as Platform Foundation

**Status:** Accepted
**Date:** 2026-05-11
**Authors:** Platform Engineering Team

---

## Decision

Use **Supabase** as the platform foundation for PostgreSQL, authentication, row-level security, and file storage.

## Context

The platform requires:
- Multi-tenant relational database with strict isolation
- JWT-based authentication integrated with the database
- Row-level security to enforce tenant isolation at DB layer
- File storage for receipt images and avatars
- Managed infrastructure (small team, no dedicated DBA)

## Implementation

### Authentication

```typescript
// Backend validates Supabase JWTs via SupabaseStrategy (Passport)
// Service Role Key used only in backend — never exposed to client
const client = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
```

### Row-Level Security

```sql
-- Every tenant-scoped table has RLS + policy
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON transactions
  FOR ALL USING (tenant_id = get_auth_tenant_id());

-- get_auth_tenant_id() uses SECURITY DEFINER to avoid recursion
CREATE OR REPLACE FUNCTION get_auth_tenant_id() RETURNS UUID AS $$
  SELECT tenant_id FROM profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;
```

### File Storage

```
Buckets:
  receipt-scans/   → tenant receipt images (RLS enforced, 90-day TTL)
  avatars/         → user/business avatars (public read, tenant-scoped writes)
```

## Access Rules

| Client | Access Level | Key Used |
|---|---|---|
| Backend API | Full read/write + admin | `SUPABASE_SERVICE_ROLE_KEY` |
| Web frontend | Auth session management only | `SUPABASE_ANON_KEY` |
| Flutter mobile | Auth session management only | `SUPABASE_ANON_KEY` |

**Never:** Frontend clients call `from()` / `.select()` directly for business data. All business data access routes through `/api/v1/*` backend endpoints.

## RLS as Defense-in-Depth

The backend enforces `tenant_id` filtering on every query via application code. RLS is a **second defense layer** — it catches any query that mistakenly omits the tenant filter. Both layers are mandatory.

## Supabase Edge Functions

Used for:
- Midtrans webhook processing (subscription upgrade callbacks)
- `handle_new_user()` trigger on user registration (auto-provision tenant + profile + COA)

Not used for: general business logic (that belongs in the NestJS backend).
