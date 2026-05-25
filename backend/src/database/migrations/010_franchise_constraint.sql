-- Migration 010: Add franchise constraint to tenants table
-- A3 from prompt.md
ALTER TABLE tenants 
    ADD CONSTRAINT IF NOT EXISTS chk_franchise_requires_business
    CHECK (tier != 'franchise' OR account_type = 'business');
