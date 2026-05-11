# ADR-002: Supabase as Database, Auth, and Storage Platform

**Status:** Accepted  
**Date:** 2026-05-11  
**Authors:** Platform Engineering Team  
**Reviewers:** Technical Lead, Security Lead

---

## Context

Tumbuhin requires a database that supports:
- Multi-tenant data isolation (Row Level Security)
- JWT-based authentication integrated with the database
- Managed hosting (small team, no dedicated DBA)
- Real-time capabilities for future live POS updates
- File storage for receipts and avatars

We needed to decide between a fully managed database solution versus self-hosted PostgreSQL plus separate auth and storage services.

---

## Decision

We chose **Supabase** as the unified platform for:
- PostgreSQL database (managed)
- JWT authentication (Supabase Auth)
- Row Level Security (RLS) for multi-tenant isolation
- File storage (Supabase Storage)
- Edge Functions for webhook processing

---

## Alternatives Considered

### Option A: Self-Hosted PostgreSQL + Separate Auth (Rejected)

**Pros:**
- Full control over DB configuration and extensions
- Lower long-term cost at scale

**Cons:**
- Requires DBA expertise to manage backups, replication, tuning
- Need to build and maintain auth service separately
- RLS is available but requires manual setup and management
- Storage requires separate service (S3 + CloudFront)
- Higher operational burden for small team

**Verdict:** Too much operational overhead for current team size.

### Option B: Supabase (Chosen)

**Pros:**
- Managed PostgreSQL with automatic backups
- Built-in JWT auth (email/password + OAuth)
- RLS enforced at DB level — second line of defense
- Built-in file storage with CDN
- Service Role Key allows backend to bypass RLS for server-side operations
- Real-time subscriptions available when needed
- Local development via Supabase CLI

**Cons:**
- Vendor lock-in — migrating away is non-trivial
- Service Role Key is a high-privilege credential that must be protected
- Connection pooling requires configuration at scale
- Limited to PostgreSQL — no NoSQL option if needed

---

## Tradeoffs

| Concern | Decision |
|---|---|
| **Vendor lock-in** | Acceptable: Supabase is open source, self-hosting is possible if needed |
| **Service Role Key security** | Backend-only, never exposed to clients, rotated every 6 months |
| **RLS performance** | Backend uses Service Role Key (bypasses RLS) — RLS only for client-side queries |
| **Connection pooling** | Supabase provides pgBouncer; may need Supavisor at scale |
| **Cost at scale** | Re-evaluate at 10k tenants — may migrate to dedicated PostgreSQL |

---

## Implementation Details

**Security model:**
- Backend API: Uses `SUPABASE_SERVICE_ROLE_KEY` — bypasses RLS, queries by tenant_id explicitly
- Client (direct queries): Uses `SUPABASE_ANON_KEY` — subject to RLS policies
- Auth: JWT issued by Supabase Auth, validated by `SupabaseStrategy` in backend
- RLS: Enabled on all tables, uses `SECURITY DEFINER` functions to prevent infinite recursion

**Connection architecture:**
```
Backend → Service Role Key → PostgreSQL (all data, any tenant — controlled by code)
Client  → Anon Key + JWT  → PostgreSQL (own tenant data only — enforced by RLS)
```

---

## Long-Term Implications

- At 50k+ concurrent connections, will need Supavisor or PgBouncer tuning
- Supabase Realtime will be critical for live POS dashboard feature (Year 2)
- If Supabase pricing becomes prohibitive, self-hosting Supabase on Kubernetes is viable
- All DB interactions through Supabase client — no ORM needed (raw SQL via RPC for complex operations)

---

## Review Date

Re-evaluate when:
- Monthly Supabase cost exceeds $2,000
- Connection pooling becomes a bottleneck
- Team wants to use a DB feature not supported by Supabase
