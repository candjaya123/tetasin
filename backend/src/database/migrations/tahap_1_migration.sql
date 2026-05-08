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

-- Customers
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
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
