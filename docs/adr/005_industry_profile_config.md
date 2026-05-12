# ADR-005: Industry Profile Configuration — Tenant-Level Business Type

**Status:** Proposed  
**Date:** 2026-05-12  
**Authors:** Platform Engineering Team  
**Reviewers:** CTO, Product Lead

---

## Context

As Tumbuhin expands to support multiple business industries (Retail, F&B, Grocery, Pharmacy, Electronics, Manufacturing, Service), the platform must activate industry-specific behaviors per tenant without:

1. Hardcoding industry logic in shared code paths
2. Creating separate codebases or backends per industry
3. Breaking existing tenants when new industry support is added

The challenge: **Same POS flow, different behaviors** per industry:

| Behavior | Retail | F&B | Grocery | Pharmacy | Electronics | Service |
|---|---|---|---|---|---|---|
| Stock deduction unit | pcs | ingredients | kg/gram | batch | serial | none |
| Barcode scan | ✅ | optional | ✅ | ✅ (batch) | ✅ (IMEI) | ❌ |
| Price entry method | fixed | fixed | per kg | fixed | fixed | custom |
| Kitchen workflow | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Expiry tracking | ❌ | optional | ✅ | ✅ | ❌ | ❌ |
| Booking/scheduling | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Work order / BOM | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## Decision

We introduce a **`tenant_industry_profile`** table that stores tenant-level industry configuration. This config:

- Is set during onboarding (or updated by the tenant manager)
- Drives feature flags, UI activation, and behavior routing at runtime
- Does **not** branch business logic in code — it activates/deactivates behavior modules
- Is read from Redis cache (30-minute TTL) to avoid per-request DB reads

### Industry Types Supported

```typescript
enum IndustryType {
  RETAIL        = 'retail',
  FNB           = 'fnb',
  GROCERY       = 'grocery',
  PHARMACY      = 'pharmacy',
  ELECTRONICS   = 'electronics',
  MANUFACTURING = 'manufacturing',
  SERVICE       = 'service',
  HYBRID        = 'hybrid',   // multiple types
  GENERAL       = 'general',  // default (current behavior)
}
```

### Feature Flag Mapping

Each industry activates a feature flag set stored in `industry_feature_flags` (compile-time constant, not DB):

```typescript
const INDUSTRY_FLAGS: Record<IndustryType, IndustryFeatureFlags> = {
  retail:        { weightedPricing: false, kitchenFlow: false, batchTracking: false, serialTracking: false, bookingFlow: false, bomDeduction: false },
  fnb:           { weightedPricing: false, kitchenFlow: true,  batchTracking: false, serialTracking: false, bookingFlow: false, bomDeduction: true  },
  grocery:       { weightedPricing: true,  kitchenFlow: false, batchTracking: false, serialTracking: false, bookingFlow: false, bomDeduction: false },
  pharmacy:      { weightedPricing: false, kitchenFlow: false, batchTracking: true,  serialTracking: false, bookingFlow: false, bomDeduction: false },
  electronics:   { weightedPricing: false, kitchenFlow: false, batchTracking: false, serialTracking: true,  bookingFlow: false, bomDeduction: false },
  manufacturing: { weightedPricing: false, kitchenFlow: false, batchTracking: true,  serialTracking: false, bookingFlow: false, bomDeduction: true  },
  service:       { weightedPricing: false, kitchenFlow: false, batchTracking: false, serialTracking: false, bookingFlow: true,  bomDeduction: false },
  hybrid:        { weightedPricing: true,  kitchenFlow: true,  batchTracking: true,  serialTracking: true,  bookingFlow: true,  bomDeduction: true  },
  general:       { weightedPricing: false, kitchenFlow: false, batchTracking: false, serialTracking: false, bookingFlow: false, bomDeduction: false },
};
```

---

## Alternatives Considered

### Option A: Hardcode Per-Industry Branches in Service Layer (Rejected)

```typescript
if (tenant.industry === 'pharmacy') { ... } 
else if (tenant.industry === 'fnb') { ... }
```

**Cons:**
- Every new industry = new `else if` branches across every service
- Impossible to maintain at 8+ industries
- Violates Open/Closed Principle

**Verdict:** Rejected. Creates unmaintainable spaghetti code.

### Option B: Separate Backend Modules Per Industry (Rejected)

Create `PharmacyModule`, `FnbModule`, `ElectronicsModule` as separate NestJS modules with separate endpoints.

**Cons:**
- Frontend must call different endpoints based on industry
- Cannot share POS cart/checkout flow across industries
- Tenant switching industries requires code changes

**Verdict:** Rejected. Contradicts the modular monolith strategy (ADR-001).

### Option C: Tenant Industry Profile + Feature Flags (Chosen)

Industry profile stored in DB. Feature flags compiled as constants. `IndustryFlagService` injects flags into request context.

**Pros:**
- Zero code branches — behavior modules activate/deactivate via flags
- Single POS flow works for all industries
- Adding new industry = add to enum + update flag map (1 file change)
- Testable: unit tests per flag combination

**Verdict:** Chosen.

---

## Tradeoffs

| Concern | Decision |
|---|---|
| **Flag explosion** | Maximum 12 boolean flags — well within manageable range |
| **Hybrid businesses** | `hybrid` type enables all flags — tenant selects only relevant product types |
| **Tenant switching industries** | Supported — flag change takes effect on next login (cache TTL) |
| **Subscription gating** | Industry-specific features (kitchen flow, batch tracking) require Business tier minimum |
| **Backward compatibility** | All existing tenants default to `general` — zero behavior change |

---

## Implementation Scope (Planning Only)

### Database Changes Required
```sql
CREATE TYPE industry_type AS ENUM (
  'retail', 'fnb', 'grocery', 'pharmacy', 
  'electronics', 'manufacturing', 'service', 'hybrid', 'general'
);

CREATE TABLE tenant_industry_profiles (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id       UUID NOT NULL UNIQUE REFERENCES tenants(id) ON DELETE CASCADE,
  industry_type   industry_type NOT NULL DEFAULT 'general',
  sub_industries  TEXT[],           -- for hybrid, list active sub-types
  config          JSONB DEFAULT '{}', -- future extensibility
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Add to tenants table
ALTER TABLE tenants ADD COLUMN industry_type industry_type DEFAULT 'general';
```

### Backend Service Required
- `IndustryFlagService.getFlags(tenantId): IndustryFeatureFlags` — reads from Redis cache
- `TierGuard` extended to include industry flags in request context
- Onboarding flow updated to capture industry type

---

## Review Date

Re-evaluate when:
- More than 12 boolean flags are needed (consider a more granular permission system)
- Industry-specific flows require separate transaction orchestration (candidate for plugin extraction)
