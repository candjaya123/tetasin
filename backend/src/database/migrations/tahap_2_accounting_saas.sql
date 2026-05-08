-- =============================================================
-- 🚀 MIGRASI TAHAP 2: ACCOUNTING ENGINE & SAAS TIER SYSTEM
-- =============================================================

-- 1. TASK 1.1: Pembaruan Enum subscription_tier
DO $$ 
BEGIN
    -- Tambahkan nilai baru jika belum ada
    ALTER TYPE subscription_tier ADD VALUE IF NOT EXISTS 'starter';
    ALTER TYPE subscription_tier ADD VALUE IF NOT EXISTS 'pro';
END $$;

-- Update data lama ke tier baru
UPDATE tenants SET tier = 'starter' WHERE tier = 'free';
UPDATE tenants SET tier = 'pro' WHERE tier = 'ai';

-- 2. TASK 1.2: Pembuatan Tabel Business Event Core
CREATE TABLE IF NOT EXISTS business_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL, -- transaction_created, stock_updated, etc.
    payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TASK 1.3: Pembuatan Tabel Accounting Core
DROP TABLE IF EXISTS journal_lines CASCADE;
DROP TABLE IF EXISTS journal_entries CASCADE;
DROP TABLE IF EXISTS chart_of_accounts CASCADE;

CREATE TABLE IF NOT EXISTS chart_of_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    code VARCHAR(20) NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- asset, liability, equity, revenue, expense
    normal_balance VARCHAR(10) NOT NULL, -- debit, credit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, code)
);

CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    reference_doc VARCHAR(255), -- ID order, PO, etc.
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS journal_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_id UUID REFERENCES journal_entries(id) ON DELETE CASCADE,
    account_id UUID REFERENCES chart_of_accounts(id) ON DELETE CASCADE,
    debit DECIMAL(15,2) DEFAULT 0,
    credit DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Aktivasi RLS
ALTER TABLE business_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_lines ENABLE ROW LEVEL SECURITY;

-- Policy Dasar
CREATE POLICY "Users can view own business events" ON business_events FOR SELECT USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can view own COA" ON chart_of_accounts FOR SELECT USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can view own journals" ON journal_entries FOR SELECT USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can view own journal lines" ON journal_lines FOR SELECT USING (entry_id IN (SELECT id FROM journal_entries WHERE tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())));
