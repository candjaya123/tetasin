-- =============================================================
-- 🚀 MIGRASI TAHAP 1: ARSITEKTUR 3-TIER & ERP CORE
-- =============================================================

-- 1. TASK 1.1: Pembaruan Tabel tenants (Subscription System)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_tier') THEN
        CREATE TYPE subscription_tier AS ENUM ('free', 'business', 'ai');
    END IF;
END $$;

ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS tier subscription_tier DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR DEFAULT 'active',
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP WITH TIME ZONE;

-- 2. TASK 1.2: Pembuatan Tabel ERP Baru (Advanced Business Features)

-- Gudang Cabang
CREATE TABLE IF NOT EXISTS warehouses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    is_main BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transfer Stok Antar Gudang
CREATE TABLE IF NOT EXISTS stock_transfers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    from_warehouse_id UUID REFERENCES warehouses(id) ON DELETE CASCADE,
    to_warehouse_id UUID REFERENCES warehouses(id) ON DELETE CASCADE,
    reference_number VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending', -- pending, in_transit, completed, cancelled
    notes TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Item dalam Transfer Stok
CREATE TABLE IF NOT EXISTS stock_transfer_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transfer_id UUID REFERENCES stock_transfers(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity DECIMAL(15,2) NOT NULL
);

-- Stock Opname (Audit Stok Fisik)
CREATE TABLE IF NOT EXISTS stock_opnames (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    warehouse_id UUID REFERENCES warehouses(id) ON DELETE CASCADE,
    reference_number VARCHAR(255),
    notes TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Item dalam Stock Opname
CREATE TABLE IF NOT EXISTS stock_opname_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opname_id UUID REFERENCES stock_opnames(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    system_quantity DECIMAL(15,2) NOT NULL,
    physical_quantity DECIMAL(15,2) NOT NULL,
    difference DECIMAL(15,2) NOT NULL
);

-- Purchase Order (PO)
CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    vendor_name VARCHAR(255), -- Bisa dihubungkan ke tabel vendors nantinya
    reference_number VARCHAR(255),
    total_amount DECIMAL(15,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'draft', -- draft, sent, received, cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sales Order (SO)
CREATE TABLE IF NOT EXISTS sales_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id), -- Asumsi tabel customers sudah ada atau akan ada
    reference_number VARCHAR(255),
    total_amount DECIMAL(15,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending', -- pending, partially_fulfilled, fulfilled, cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Promotions & Bundles
CREATE TABLE IF NOT EXISTS promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50), -- discount, buy_x_get_y, bundle
    rules JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    starts_at TIMESTAMP WITH TIME ZONE,
    ends_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TASK 1.3: Pembuatan Tabel Aggregation & Alerting

-- Cache Metrik Harian (Aggregation Layer)
CREATE TABLE IF NOT EXISTS tenant_metrics_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    daily_revenue_json JSONB DEFAULT '{}'::jsonb,
    top_products_json JSONB DEFAULT '[]'::jsonb,
    slow_moving_json JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, date)
);

-- Smart Alerts (Insight Engine)
CREATE TABLE IF NOT EXISTS smart_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    alert_type VARCHAR(100), -- low_stock, revenue_drop, etc.
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Item dalam Penjualan (Sale Items)
CREATE TABLE IF NOT EXISTS sale_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    quantity DECIMAL(15,2) NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    total_price DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================
-- 🛡️ AKTIVASI RLS UNTUK TABEL BARU
-- =============================================================
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_transfer_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_opnames ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_opname_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_metrics_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

-- Policy dasar (Backend service role akan mem-bypass ini)
-- User hanya bisa melihat data milik tenant-nya
CREATE POLICY "Users can view own warehouse" ON warehouses FOR SELECT USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));
-- Tambahkan policy serupa untuk tabel lain jika dibutuhkan akses frontend terbatas.
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
-- =============================================================
-- 🚀 MIGRASI TAHAP 3: AI BUSINESS MEMORY & AGGREGATION
-- =============================================================

-- 1. TASK 5.1: Pembuatan Tabel Business Memory (RAG Context)
CREATE TABLE IF NOT EXISTS business_memory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    memory_type VARCHAR(100) NOT NULL, -- sales_pattern, product_behavior, seasonal_trend, cashier_behavior
    context_key VARCHAR(255) NOT NULL, -- e.g., "peak_hours", "low_stock_frequency"
    memory_data JSONB NOT NULL,
    importance_score DECIMAL(3,2) DEFAULT 0.5,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, context_key)
);

-- 2. Tambahkan Index untuk Performa Pencarian AI
CREATE INDEX IF NOT EXISTS idx_business_memory_tenant ON business_memory(tenant_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON journal_entries(date);
CREATE INDEX IF NOT EXISTS idx_journal_lines_account ON journal_lines(account_id);

-- 3. Aktivasi RLS
ALTER TABLE business_memory ENABLE ROW LEVEL SECURITY;

-- Policy Dasar
CREATE POLICY "Users can view own business memory" ON business_memory FOR SELECT USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));
-- =============================================================
-- 🚀 MIGRASI TAHAP 4: AUDIT LOG & ENTERPRISE SECURITY
-- =============================================================

-- 1. TASK 6.1: Pembuatan Tabel Audit Log
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL, -- create_order, void_transaction, etc.
    entity_name VARCHAR(100), -- orders, products, journal_entries
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Aktivasi RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy Dasar (Hanya Owner/Admin yang bisa lihat)
CREATE POLICY "Users can view own audit logs" ON audit_logs FOR SELECT USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- 3. Tambahkan Index untuk Audit
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant ON audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
-- =============================================================
-- 🚀 MIGRASI TAHAP 5: AGGREGATION & REPORTING VIEWS
-- =============================================================

-- 1. View untuk Saldo Buku Besar (Ledger Balances)
-- Mempermudah kalkulasi Neraca & Laba Rugi secara real-time
CREATE OR REPLACE VIEW ledger_balances AS
SELECT 
    l.account_id,
    a.tenant_id,
    a.code,
    a.name,
    a.type,
    SUM(l.debit) as total_debit,
    SUM(l.credit) as total_credit,
    CASE 
        WHEN a.normal_balance = 'debit' THEN SUM(l.debit) - SUM(l.credit)
        ELSE SUM(l.credit) - SUM(l.debit)
    END as current_balance
FROM journal_lines l
JOIN chart_of_accounts a ON l.account_id = a.id
GROUP BY l.account_id, a.tenant_id, a.code, a.name, a.type, a.normal_balance;

-- 2. View untuk Laporan Laba Rugi (Profit & Loss) Bulanan
CREATE OR REPLACE VIEW monthly_profit_loss AS
SELECT 
    tenant_id,
    EXTRACT(YEAR FROM date) as year,
    EXTRACT(MONTH FROM date) as month,
    SUM(CASE WHEN a.type = 'revenue' THEN l.credit - l.debit ELSE 0 END) as total_revenue,
    SUM(CASE WHEN a.type = 'expense' THEN l.debit - l.credit ELSE 0 END) as total_expense,
    SUM(CASE WHEN a.type = 'revenue' THEN l.credit - l.debit ELSE 0 END) - 
    SUM(CASE WHEN a.type = 'expense' THEN l.debit - l.credit ELSE 0 END) as net_profit
FROM journal_entries e
JOIN journal_lines l ON e.id = l.entry_id
JOIN chart_of_accounts a ON l.account_id = a.id
GROUP BY tenant_id, year, month;
-- 1. Drop existing standard views
DROP VIEW IF EXISTS ledger_balances;
DROP VIEW IF EXISTS monthly_profit_loss;

-- 2. Create Materialized View for Ledger Balances
CREATE MATERIALIZED VIEW ledger_balances AS
SELECT 
    l.account_id,
    a.tenant_id,
    a.code,
    a.name,
    a.type,
    SUM(l.debit) as total_debit,
    SUM(l.credit) as total_credit,
    CASE 
        WHEN a.normal_balance = 'debit' THEN SUM(l.debit) - SUM(l.credit)
        ELSE SUM(l.credit) - SUM(l.debit)
    END as current_balance
FROM journal_lines l
JOIN chart_of_accounts a ON l.account_id = a.id
GROUP BY l.account_id, a.tenant_id, a.code, a.name, a.type, a.normal_balance;

-- Create index for performance
CREATE UNIQUE INDEX idx_ledger_balances_account_id ON ledger_balances (account_id);

-- 3. Create Materialized View for Profit & Loss
CREATE MATERIALIZED VIEW monthly_profit_loss AS
SELECT 
    tenant_id,
    EXTRACT(YEAR FROM date) as year,
    EXTRACT(MONTH FROM date) as month,
    SUM(CASE WHEN a.type = 'revenue' THEN l.credit - l.debit ELSE 0 END) as total_revenue,
    SUM(CASE WHEN a.type = 'expense' THEN l.debit - l.credit ELSE 0 END) as total_expense,
    SUM(CASE WHEN a.type = 'revenue' THEN l.credit - l.debit ELSE 0 END) - 
    SUM(CASE WHEN a.type = 'expense' THEN l.debit - l.credit ELSE 0 END) as net_profit
FROM journal_entries e
JOIN journal_lines l ON e.id = l.entry_id
JOIN chart_of_accounts a ON l.account_id = a.id
GROUP BY tenant_id, year, month;

-- 4. Function to refresh analytics
CREATE OR REPLACE FUNCTION refresh_ledger_analytics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY ledger_balances;
  REFRESH MATERIALIZED VIEW monthly_profit_loss;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- 1. Tabel Akun Staf (Bawah Tenant)
CREATE TABLE IF NOT EXISTS staff_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'cashier', -- manager, cashier, warehouse_staff
    pin VARCHAR(4) NOT NULL, -- PIN 4 digit untuk login cepat di POS
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, profile_id)
);

-- 2. Aktifkan RLS
ALTER TABLE staff_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tenant's staff" 
ON staff_accounts FOR SELECT 
USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- 3. Tambahkan kolom role ke profiles untuk integrasi JWT
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'owner';
