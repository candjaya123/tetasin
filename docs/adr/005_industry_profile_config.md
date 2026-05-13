# ADR-005: Industry Profile Configuration

**Status:** Accepted
**Date:** 2026-05-12
**Authors:** Architecture Team
**Related:** ADR-004 (Universal Product Engine), ADR-006 (Variants & Add-ons)

---

## Decision

Introduce a `tenant_industry_profiles` table that stores industry-specific configuration per tenant. The industry profile drives default product types, COA templates, default behaviors, and UI presentation layer.

## Context

Tumbuhin serves 7 industry verticals. Each vertical has a distinct operational profile:

| Industry | Default Product Type | Stock Model | Key Features |
|---|---|---|---|
| `retail` | `physical` | Unit-based | Barcode scan, stock alerts |
| `fnb` | `composite` | Recipe-based (BOM) | Add-ons, modifiers, table management |
| `grocery` | `weighted` | Weight-based | Price per kg/gram, scale integration |
| `pharmacy` | `physical` | Unit + expiry + batch | Expiry tracking, batch numbers, BPOM |
| `electronics` | `physical` | Unit + serial | Serial number tracking, warranty |
| `manufacturing` | `composite` | BOM + WIP | Production orders, work-in-progress |
| `service` | `service` | No stock | Time-based billing, service catalog |

## Database Schema

```sql
CREATE TABLE tenant_industry_profiles (
    id                      UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id               UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE UNIQUE,
    industry                industry_type NOT NULL DEFAULT 'retail',
    default_product_type    TEXT NOT NULL DEFAULT 'physical',
    coa_template_id         UUID,        -- Seeded COA template used at onboarding
    features_config         JSONB NOT NULL DEFAULT '{}',
    ui_config               JSONB NOT NULL DEFAULT '{}',
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- features_config JSONB examples:
-- { "addon_groups": true, "recipe_based_stock": true, "weight_based_pricing": false }
-- { "expiry_tracking": true, "batch_numbers": true, "serial_tracking": false }

-- ui_config JSONB examples:
-- { "pos_layout": "grid", "show_weight_input": true }
-- { "pos_layout": "list", "show_addon_selector": true }
```

## Industry Profile Resolution

```typescript
@Injectable()
export class IndustryProfileService {
  async getProfile(tenantId: string): Promise<TenantIndustryProfile> {
    const cached = await this.redis.get(`industry-profile:${tenantId}`);
    if (cached) return JSON.parse(cached);

    const profile = await this.repo.findByTenant(tenantId);
    await this.redis.setEx(`industry-profile:${tenantId}`, 3600, JSON.stringify(profile));
    return profile;
  }

  isFeatureEnabled(profile: TenantIndustryProfile, feature: string): boolean {
    return profile.features_config?.[feature] === true;
  }
}
```

## COA Templates

Each industry uses a pre-defined Chart of Accounts template seeded at tenant registration:

| Template | Industry | Key Accounts |
|---|---|---|
| `retail_coa` | retail, electronics | Kas, Piutang, Persediaan Barang, Pendapatan Penjualan, HPP, Beban Operasional |
| `fnb_coa` | fnb | Same + Beban Bahan Baku, Persediaan Bahan Baku |
| `grocery_coa` | grocery | Same + Persediaan per Kategori |
| `pharmacy_coa` | pharmacy | Same + Persediaan Obat, Beban Bahan Habis Pakai |
| `service_coa` | service, manufacturing | Kas, Piutang, Pendapatan Jasa, Beban Gaji, Beban Overhead |

## Feature Flags (features_config)

| Flag | Description | Default for |
|---|---|---|
| `recipe_based_stock` | BOM deduction during sale | fnb, manufacturing |
| `weight_based_pricing` | Price = weight × rate | grocery |
| `addon_groups` | Product add-on selection at POS | fnb |
| `expiry_tracking` | Product expiry date tracking | pharmacy |
| `batch_numbers` | Lot/batch number tracking | pharmacy, manufacturing |
| `serial_tracking` | Serial number per unit | electronics |
| `table_management` | Table assignment at POS | fnb |
| `service_catalog` | Service duration + staffing | service |

## API

```
GET  /api/v1/business-profile/industry       ← Get tenant industry profile
PUT  /api/v1/business-profile/industry       ← Update industry + regenerate COA template
GET  /api/v1/business-profile/industry/features ← Feature flag list
```
