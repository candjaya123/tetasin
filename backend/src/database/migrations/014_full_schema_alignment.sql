-- =============================================================
-- MIGRATION 014: Full Schema Alignment with docs/ & full_schema
-- =============================================================
-- Aligns the existing incremental schema with the canonical
-- full_schema_supabase.sql target, preserving backward compat.
-- =============================================================

-- 1. CREATE MISSING ENUM TYPES
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('manager', 'kasir', 'stok');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
        CREATE TYPE payment_method AS ENUM ('cash', 'qris', 'transfer', 'card');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pesanan_status') THEN
        CREATE TYPE pesanan_status AS ENUM ('draft', 'confirmed', 'processing', 'ready', 'fulfilled', 'invoiced', 'paid', 'cancelled', 'voided');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_source') THEN
        CREATE TYPE transaction_source AS ENUM ('pos_sale', 'pos_void', 'expense', 'receipt_ocr', 'po_fulfillment', 'stock_adjustment', 'manual');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'journal_status') THEN
        CREATE TYPE journal_status AS ENUM ('draft', 'posted', 'voided');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'hpp_mode') THEN
        CREATE TYPE hpp_mode AS ENUM ('recipe', 'direct', 'none');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'industry_type') THEN
        CREATE TYPE industry_type AS ENUM ('retail', 'fnb', 'grocery', 'pharmacy', 'electronics', 'manufacturing', 'service', 'hybrid', 'general');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'draft_status_enum') THEN
        CREATE TYPE draft_status_enum AS ENUM ('pending', 'approved', 'rejected');
    END IF;
END $$;

-- 2. ADD MISSING COLUMNS TO EXISTING TABLES

-- 2a. tenants
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS npwp TEXT;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS contact_email TEXT;

-- 2b. profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS account_type VARCHAR DEFAULT 'business';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_superadmin BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ai_operation_mode TEXT CHECK (ai_operation_mode IN ('NORMAL', 'SAFE', 'LOCKED')) DEFAULT 'NORMAL';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2c. chart_of_accounts
ALTER TABLE public.chart_of_accounts ADD COLUMN IF NOT EXISTS kategori TEXT CHECK (kategori IN ('ASET','KEWAJIBAN','EKUITAS','PENDAPATAN','HPP / BIAYA LANGSUNG','BEBAN OPERASIONAL'));
ALTER TABLE public.chart_of_accounts ADD COLUMN IF NOT EXISTS is_system BOOLEAN DEFAULT FALSE;
ALTER TABLE public.chart_of_accounts ADD COLUMN IF NOT EXISTS parent_code TEXT;

-- 2d. journal_entries
ALTER TABLE public.journal_entries ADD COLUMN IF NOT EXISTS status journal_status DEFAULT 'posted';
ALTER TABLE public.journal_entries ADD COLUMN IF NOT EXISTS reference_type TEXT;
ALTER TABLE public.journal_entries ADD COLUMN IF NOT EXISTS reference_id UUID;
ALTER TABLE public.journal_entries ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.journal_entries ADD COLUMN IF NOT EXISTS idempotency_key TEXT UNIQUE;

-- 2e. sales_orders
ALTER TABLE public.sales_orders ADD COLUMN IF NOT EXISTS pesanan_number TEXT;
ALTER TABLE public.sales_orders ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE public.sales_orders ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'pos';
ALTER TABLE public.sales_orders ADD COLUMN IF NOT EXISTS division_notes JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.sales_orders ADD COLUMN IF NOT EXISTS transaction_id UUID;
ALTER TABLE public.sales_orders ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.sales_orders ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.sales_orders ADD COLUMN IF NOT EXISTS fulfilled_at TIMESTAMPTZ;
ALTER TABLE public.sales_orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2f. sale_items
ALTER TABLE public.sale_items ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.sale_items ADD COLUMN IF NOT EXISTS unit_price NUMERIC(15,2);
ALTER TABLE public.sale_items ADD COLUMN IF NOT EXISTS discount NUMERIC(15,2) DEFAULT 0;
ALTER TABLE public.sale_items ADD COLUMN IF NOT EXISTS hpp_mode TEXT DEFAULT 'none';
ALTER TABLE public.sale_items ADD COLUMN IF NOT EXISTS hpp_per_unit NUMERIC(15,4) DEFAULT 0;
ALTER TABLE public.sale_items ADD COLUMN IF NOT EXISTS hpp_amount NUMERIC(15,2) DEFAULT 0;
ALTER TABLE public.sale_items ADD COLUMN IF NOT EXISTS total NUMERIC(15,2);
ALTER TABLE public.sale_items ADD COLUMN IF NOT EXISTS selected_variants JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.sale_items ADD COLUMN IF NOT EXISTS selected_addons JSONB DEFAULT '[]'::jsonb;

-- 3. CREATE MISSING TABLES

-- 3a. raw_materials
CREATE TABLE IF NOT EXISTS public.raw_materials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    unit TEXT NOT NULL,
    unit_price NUMERIC(15,4) NOT NULL DEFAULT 0,
    current_stock NUMERIC(15,3) NOT NULL DEFAULT 0,
    reorder_point NUMERIC(15,3) DEFAULT 0,
    last_purchase_price NUMERIC(15,4) DEFAULT 0,
    coa_account_id UUID REFERENCES public.chart_of_accounts(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3b. product_recipes
CREATE TABLE IF NOT EXISTS public.product_recipes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    raw_material_id UUID NOT NULL REFERENCES public.raw_materials(id) ON DELETE RESTRICT,
    quantity_needed NUMERIC(15,4) NOT NULL,
    UNIQUE(product_id, raw_material_id)
);

-- 3c. product_variant_groups
CREATE TABLE IF NOT EXISTS public.product_variant_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    is_required BOOLEAN DEFAULT TRUE,
    allow_multiple BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3d. product_variant_options
CREATE TABLE IF NOT EXISTS public.product_variant_options (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES public.product_variant_groups(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price_delta NUMERIC(15,2) DEFAULT 0,
    cost_delta NUMERIC(15,2) DEFAULT 0,
    sku_suffix TEXT,
    current_stock NUMERIC(15,3) NOT NULL DEFAULT 0,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3e. product_addon_groups
CREATE TABLE IF NOT EXISTS public.product_addon_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    is_required BOOLEAN DEFAULT FALSE,
    min_selections INTEGER DEFAULT 0,
    max_selections INTEGER DEFAULT 1,
    is_promo_eligible BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3f. product_addons
CREATE TABLE IF NOT EXISTS public.product_addons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES public.product_addon_groups(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price NUMERIC(15,2) NOT NULL DEFAULT 0,
    cost_price NUMERIC(15,2) DEFAULT 0,
    track_stock BOOLEAN DEFAULT FALSE,
    current_stock NUMERIC(15,3),
    raw_material_id UUID REFERENCES public.raw_materials(id) ON DELETE SET NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3g. purchase_order_items
CREATE TABLE IF NOT EXISTS public.purchase_order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    po_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
    raw_material_id UUID NOT NULL REFERENCES public.raw_materials(id) ON DELETE RESTRICT,
    quantity NUMERIC(15,3) NOT NULL,
    unit_price NUMERIC(15,4) NOT NULL,
    received_qty NUMERIC(15,3) DEFAULT 0
);

-- 3h. tenant_balances
CREATE TABLE IF NOT EXISTS public.tenant_balances (
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE PRIMARY KEY,
    balance_amount NUMERIC DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3i. ledger_snapshots
CREATE TABLE IF NOT EXISTS public.ledger_snapshots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES public.chart_of_accounts(id) ON DELETE CASCADE,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    ending_balance NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, account_id, month, year)
);

-- 3j. event_log
CREATE TABLE IF NOT EXISTS public.event_log (
    id UUID DEFAULT gen_random_uuid() NOT NULL,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    trace_id TEXT NOT NULL,
    idempotency_key TEXT NOT NULL,
    event_type TEXT NOT NULL,
    sequence_number BIGINT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id, created_at),
    UNIQUE (id)
);

-- 3k. processed_events
CREATE TABLE IF NOT EXISTS public.processed_events (
    event_id UUID PRIMARY KEY REFERENCES public.event_log(id) ON DELETE CASCADE,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    worker_id TEXT NOT NULL
);

-- 3l. dlq_events
CREATE TABLE IF NOT EXISTS public.dlq_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES public.event_log(id) ON DELETE CASCADE,
    error_message TEXT,
    stack_trace TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3m. tenant_industry_profiles
CREATE TABLE IF NOT EXISTS public.tenant_industry_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    industry industry_type DEFAULT 'general',
    default_product_type TEXT DEFAULT 'physical',
    features_config JSONB DEFAULT '{}'::jsonb,
    ui_config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id)
);

-- 3n. global_settings
CREATE TABLE IF NOT EXISTS public.global_settings (
    id SERIAL PRIMARY KEY,
    system_mode TEXT NOT NULL CHECK (system_mode IN ('NORMAL', 'DEGRADED', 'READ_ONLY', 'EMERGENCY')) DEFAULT 'NORMAL',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3o. assets (if not exists via inventory module)
CREATE TABLE IF NOT EXISTS public.assets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    purchase_price NUMERIC(15,2) NOT NULL DEFAULT 0,
    current_value NUMERIC(15,2) NOT NULL DEFAULT 0,
    purchase_date DATE DEFAULT CURRENT_DATE,
    location TEXT,
    photo_url TEXT,
    coa_account_id UUID REFERENCES public.chart_of_accounts(id) ON DELETE SET NULL,
    depreciation_rate NUMERIC(5,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3p. bills (if not exists via inventory module)
CREATE TABLE IF NOT EXISTS public.bills (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    amount NUMERIC(15,2) NOT NULL DEFAULT 0,
    due_date DATE,
    type TEXT NOT NULL CHECK (type IN ('hutang', 'piutang')),
    status TEXT NOT NULL CHECK (status IN ('pending', 'paid')) DEFAULT 'pending',
    coa_account_id UUID REFERENCES public.chart_of_accounts(id) ON DELETE SET NULL,
    description TEXT,
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3q. activity_logs (if not exists)
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3r. tenant_notification_configs (if not exists)
CREATE TABLE IF NOT EXISTS public.tenant_notification_configs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    role user_role NOT NULL,
    notify_sale BOOLEAN NOT NULL DEFAULT true,
    notify_stock_update BOOLEAN NOT NULL DEFAULT true,
    notify_stock_low BOOLEAN NOT NULL DEFAULT true,
    notify_bill_due BOOLEAN NOT NULL DEFAULT true,
    notify_staff_activity BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, role)
);

-- 4. CREATE INDEXES (target schema composite indexes)

CREATE INDEX IF NOT EXISTS idx_coa_tenant_code ON public.chart_of_accounts(tenant_id, code);
CREATE INDEX IF NOT EXISTS idx_coa_tenant_kategori ON public.chart_of_accounts(tenant_id, kategori);
CREATE INDEX IF NOT EXISTS idx_raw_materials_tenant_id ON public.raw_materials(tenant_id);
CREATE INDEX IF NOT EXISTS idx_raw_materials_warehouse_id ON public.raw_materials(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_products_tenant_id ON public.products(tenant_id);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON public.products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_tenant_active ON public.products(tenant_id) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_product_recipes_product_id ON public.product_recipes(product_id);
CREATE INDEX IF NOT EXISTS idx_product_recipes_raw_material_id ON public.product_recipes(raw_material_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_tenant_ref_type ON public.journal_entries(tenant_id, reference_type);
CREATE INDEX IF NOT EXISTS idx_journal_entries_ref_id ON public.journal_entries(reference_id);
CREATE INDEX IF NOT EXISTS idx_journal_lines_journal_entry_id ON public.journal_lines(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_journal_lines_account_id ON public.journal_lines(account_id);
CREATE INDEX IF NOT EXISTS idx_sales_orders_tenant_status ON public.sales_orders(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_sales_orders_tenant_created_at ON public.sales_orders(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_tenant_source_type ON public.transactions(tenant_id, source_type);
CREATE INDEX IF NOT EXISTS idx_transactions_pesanan_id ON public.transactions(pesanan_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_transaction_id ON public.sale_items(transaction_id);
CREATE INDEX IF NOT EXISTS idx_ledger_snapshots_account_id ON public.ledger_snapshots(account_id);

-- 5. ENABLE ROW LEVEL SECURITY on all tenant-scoped tables
ALTER TABLE IF EXISTS public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.raw_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.product_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.product_variant_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.product_variant_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.product_addon_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.product_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.journal_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sales_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.stock_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.stock_transfer_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.stock_opnames ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.stock_opname_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.receipt_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.merchant_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.draft_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.event_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.processed_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.dlq_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ledger_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tenant_metrics_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.smart_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tenant_notification_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tenant_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.bills ENABLE ROW LEVEL SECURITY;

-- 6. CREATE AUTH HELPER FUNCTIONS (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.get_auth_tenant_id()
RETURNS UUID AS $$
    SELECT tenant_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS user_role AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_auth_is_superadmin()
RETURNS BOOLEAN AS $$
    SELECT is_superadmin FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- 7. CREATE RLS POLICIES (using helper functions)

-- Profiles: users see own profile + tenant members
DROP POLICY IF EXISTS tenant_isolation_policy ON public.profiles;
CREATE POLICY tenant_isolation_policy ON public.profiles FOR ALL
    USING (id = auth.uid() OR tenant_id = public.get_auth_tenant_id());

-- Tenants: select for own tenant or superadmin; update only for manager
DROP POLICY IF EXISTS tenant_isolation_tenants_select ON public.tenants;
CREATE POLICY tenant_isolation_tenants_select ON public.tenants FOR SELECT
    USING (id = public.get_auth_tenant_id() OR public.get_auth_is_superadmin());

DROP POLICY IF EXISTS tenant_isolation_tenants_update ON public.tenants;
CREATE POLICY tenant_isolation_tenants_update ON public.tenants FOR UPDATE
    USING (id = public.get_auth_tenant_id() AND public.get_auth_role() = 'manager');

-- Chart of Accounts
DROP POLICY IF EXISTS tenant_isolation_coa ON public.chart_of_accounts;
CREATE POLICY tenant_isolation_coa ON public.chart_of_accounts FOR ALL
    USING (tenant_id = public.get_auth_tenant_id());

-- Raw Materials
DROP POLICY IF EXISTS rbac_raw_materials_select ON public.raw_materials;
CREATE POLICY rbac_raw_materials_select ON public.raw_materials FOR SELECT
    USING (tenant_id = public.get_auth_tenant_id());

DROP POLICY IF EXISTS rbac_raw_materials_modify ON public.raw_materials;
CREATE POLICY rbac_raw_materials_modify ON public.raw_materials FOR ALL
    USING (tenant_id = public.get_auth_tenant_id())
    WITH CHECK (tenant_id = public.get_auth_tenant_id() AND public.get_auth_role() IN ('manager', 'stok'));

-- Products
DROP POLICY IF EXISTS rbac_products_select ON public.products;
CREATE POLICY rbac_products_select ON public.products FOR SELECT
    USING (tenant_id = public.get_auth_tenant_id());

DROP POLICY IF EXISTS rbac_products_modify ON public.products;
CREATE POLICY rbac_products_modify ON public.products FOR ALL
    USING (tenant_id = public.get_auth_tenant_id())
    WITH CHECK (tenant_id = public.get_auth_tenant_id() AND public.get_auth_role() IN ('manager', 'stok'));

-- Product Recipes
DROP POLICY IF EXISTS tenant_isolation_recipes ON public.product_recipes;
CREATE POLICY tenant_isolation_recipes ON public.product_recipes FOR ALL
    USING (tenant_id = public.get_auth_tenant_id());

-- Variant Groups & Options
DROP POLICY IF EXISTS tenant_isolation_variant_groups ON public.product_variant_groups;
CREATE POLICY tenant_isolation_variant_groups ON public.product_variant_groups FOR ALL
    USING (tenant_id = public.get_auth_tenant_id());

DROP POLICY IF EXISTS tenant_isolation_variant_options ON public.product_variant_options;
CREATE POLICY tenant_isolation_variant_options ON public.product_variant_options FOR ALL
    USING (tenant_id = public.get_auth_tenant_id());

DROP POLICY IF EXISTS tenant_isolation_addon_groups ON public.product_addon_groups;
CREATE POLICY tenant_isolation_addon_groups ON public.product_addon_groups FOR ALL
    USING (tenant_id = public.get_auth_tenant_id());

DROP POLICY IF EXISTS tenant_isolation_addons ON public.product_addons;
CREATE POLICY tenant_isolation_addons ON public.product_addons FOR ALL
    USING (tenant_id = public.get_auth_tenant_id());

-- Journals
DROP POLICY IF EXISTS tenant_isolation_journals ON public.journal_entries;
CREATE POLICY tenant_isolation_journals ON public.journal_entries FOR ALL
    USING (tenant_id = public.get_auth_tenant_id());

DROP POLICY IF EXISTS tenant_isolation_journal_lines ON public.journal_lines;
CREATE POLICY tenant_isolation_journal_lines ON public.journal_lines FOR ALL
    USING (journal_entry_id IN (SELECT id FROM public.journal_entries WHERE tenant_id = public.get_auth_tenant_id()));

-- Sales & Pesanan
DROP POLICY IF EXISTS tenant_isolation_sales_orders ON public.sales_orders;
CREATE POLICY tenant_isolation_sales_orders ON public.sales_orders FOR ALL
    USING (tenant_id = public.get_auth_tenant_id());

DROP POLICY IF EXISTS tenant_isolation_transactions ON public.transactions;
CREATE POLICY tenant_isolation_transactions ON public.transactions FOR ALL
    USING (tenant_id = public.get_auth_tenant_id());

DROP POLICY IF EXISTS tenant_isolation_sale_items ON public.sale_items;
CREATE POLICY tenant_isolation_sale_items ON public.sale_items FOR ALL
    USING (tenant_id = public.get_auth_tenant_id());

-- Warehouses
DROP POLICY IF EXISTS tenant_isolation_warehouses ON public.warehouses;
CREATE POLICY tenant_isolation_warehouses ON public.warehouses FOR ALL
    USING (tenant_id = public.get_auth_tenant_id());

-- Procurement
DROP POLICY IF EXISTS tenant_isolation_purchase_orders ON public.purchase_orders;
CREATE POLICY tenant_isolation_purchase_orders ON public.purchase_orders FOR ALL
    USING (tenant_id = public.get_auth_tenant_id());

DROP POLICY IF EXISTS tenant_isolation_purchase_order_items ON public.purchase_order_items;
CREATE POLICY tenant_isolation_purchase_order_items ON public.purchase_order_items FOR ALL
    USING (po_id IN (SELECT id FROM public.purchase_orders WHERE tenant_id = public.get_auth_tenant_id()));

-- Stock Transfers & Opnames
DROP POLICY IF EXISTS tenant_isolation_stock_transfers ON public.stock_transfers;
CREATE POLICY tenant_isolation_stock_transfers ON public.stock_transfers FOR ALL
    USING (tenant_id = public.get_auth_tenant_id());

DROP POLICY IF EXISTS tenant_isolation_stock_transfer_items ON public.stock_transfer_items;
CREATE POLICY tenant_isolation_stock_transfer_items ON public.stock_transfer_items FOR ALL
    USING (transfer_id IN (SELECT id FROM public.stock_transfers WHERE tenant_id = public.get_auth_tenant_id()));

DROP POLICY IF EXISTS tenant_isolation_stock_opnames ON public.stock_opnames;
CREATE POLICY tenant_isolation_stock_opnames ON public.stock_opnames FOR ALL
    USING (tenant_id = public.get_auth_tenant_id());

DROP POLICY IF EXISTS tenant_isolation_stock_opname_items ON public.stock_opname_items;
CREATE POLICY tenant_isolation_stock_opname_items ON public.stock_opname_items FOR ALL
    USING (opname_id IN (SELECT id FROM public.stock_opnames WHERE tenant_id = public.get_auth_tenant_id()));

-- Promotions
DROP POLICY IF EXISTS tenant_isolation_promotions ON public.promotions;
CREATE POLICY tenant_isolation_promotions ON public.promotions FOR ALL
    USING (tenant_id = public.get_auth_tenant_id());

-- Receipt OCR
DROP POLICY IF EXISTS tenant_isolation_receipt_scans ON public.receipt_scans;
CREATE POLICY tenant_isolation_receipt_scans ON public.receipt_scans FOR ALL
    USING (tenant_id = public.get_auth_tenant_id());

DROP POLICY IF EXISTS tenant_isolation_merchant_mappings ON public.merchant_mappings;
CREATE POLICY tenant_isolation_merchant_mappings ON public.merchant_mappings FOR ALL
    USING (tenant_id = public.get_auth_tenant_id());

DROP POLICY IF EXISTS tenant_isolation_draft_transactions ON public.draft_transactions;
CREATE POLICY tenant_isolation_draft_transactions ON public.draft_transactions FOR ALL
    USING (tenant_id = public.get_auth_tenant_id());

-- Event Log
DROP POLICY IF EXISTS tenant_isolation_event_log ON public.event_log;
CREATE POLICY tenant_isolation_event_log ON public.event_log FOR ALL
    USING (tenant_id = public.get_auth_tenant_id());

DROP POLICY IF EXISTS tenant_isolation_processed_events ON public.processed_events;
CREATE POLICY tenant_isolation_processed_events ON public.processed_events FOR ALL
    USING (event_id IN (SELECT id FROM public.event_log WHERE tenant_id = public.get_auth_tenant_id()));

DROP POLICY IF EXISTS tenant_isolation_dlq_events ON public.dlq_events;
CREATE POLICY tenant_isolation_dlq_events ON public.dlq_events FOR ALL
    USING (event_id IN (SELECT id FROM public.event_log WHERE tenant_id = public.get_auth_tenant_id()));

-- Analytics
DROP POLICY IF EXISTS tenant_isolation_ledger_snapshots ON public.ledger_snapshots;
CREATE POLICY tenant_isolation_ledger_snapshots ON public.ledger_snapshots FOR ALL
    USING (tenant_id = public.get_auth_tenant_id());

DROP POLICY IF EXISTS tenant_isolation_tenant_metrics_cache ON public.tenant_metrics_cache;
CREATE POLICY tenant_isolation_tenant_metrics_cache ON public.tenant_metrics_cache FOR ALL
    USING (tenant_id = public.get_auth_tenant_id());

DROP POLICY IF EXISTS tenant_isolation_smart_alerts ON public.smart_alerts;
CREATE POLICY tenant_isolation_smart_alerts ON public.smart_alerts FOR ALL
    USING (tenant_id = public.get_auth_tenant_id());

DROP POLICY IF EXISTS tenant_isolation_tenant_notification_configs ON public.tenant_notification_configs;
CREATE POLICY tenant_isolation_tenant_notification_configs ON public.tenant_notification_configs FOR ALL
    USING (tenant_id = public.get_auth_tenant_id());

-- Payouts
DROP POLICY IF EXISTS tenant_isolation_tenant_balances ON public.tenant_balances;
CREATE POLICY tenant_isolation_tenant_balances ON public.tenant_balances FOR SELECT
    USING (tenant_id = public.get_auth_tenant_id() OR public.get_auth_is_superadmin());

DROP POLICY IF EXISTS tenant_isolation_payout_requests ON public.payout_requests;
CREATE POLICY tenant_isolation_payout_requests ON public.payout_requests FOR ALL
    USING (tenant_id = public.get_auth_tenant_id() OR public.get_auth_is_superadmin());

-- Activity Logs
DROP POLICY IF EXISTS rbac_activity_logs_select ON public.activity_logs;
CREATE POLICY rbac_activity_logs_select ON public.activity_logs FOR SELECT
    USING (tenant_id = public.get_auth_tenant_id() AND public.get_auth_role() = 'manager');

DROP POLICY IF EXISTS rbac_activity_logs_insert ON public.activity_logs;
CREATE POLICY rbac_activity_logs_insert ON public.activity_logs FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Assets & Bills & Customers
DROP POLICY IF EXISTS tenant_isolation_assets ON public.assets;
CREATE POLICY tenant_isolation_assets ON public.assets FOR ALL
    USING (tenant_id = public.get_auth_tenant_id());

DROP POLICY IF EXISTS tenant_isolation_bills ON public.bills;
CREATE POLICY tenant_isolation_bills ON public.bills FOR ALL
    USING (tenant_id = public.get_auth_tenant_id());

DROP POLICY IF EXISTS tenant_isolation_customers ON public.customers;
CREATE POLICY tenant_isolation_customers ON public.customers FOR ALL
    USING (tenant_id = public.get_auth_tenant_id());

-- 8. CREATE TRIGGERS

-- Handle New Tenant Balance Trigger
CREATE OR REPLACE FUNCTION public.handle_new_tenant_balance()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.tenant_balances (tenant_id, balance_amount)
    VALUES (NEW.id, 0)
    ON CONFLICT (tenant_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_tenant_created_balance ON public.tenants;
CREATE TRIGGER on_tenant_created_balance
    AFTER INSERT ON public.tenants
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_tenant_balance();

-- Update handle_new_user with canonical COA seeding
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE v_tid UUID; v_name TEXT; v_type TEXT;
BEGIN
  v_name := COALESCE(new.raw_user_meta_data->>'business_name', 'Toko Baru');
  v_type := COALESCE(new.raw_user_meta_data->>'account_type', 'business');

  INSERT INTO tenants (name, account_type, tier) VALUES (v_name, v_type, 'free') RETURNING id INTO v_tid;

  INSERT INTO profiles (id, full_name, role, tenant_id, account_type)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', 'User'), 'manager', v_tid, v_type);

  -- Seed canonical COA (31 accounts matching docs/accounting.md)
  INSERT INTO chart_of_accounts (tenant_id, code, name, type, kategori, normal_balance, is_system) VALUES
    (v_tid, '1-10000', 'Kas Tangan', 'aset', 'ASET', 'debit', TRUE),
    (v_tid, '1-10002', 'Kas Bank', 'aset', 'ASET', 'debit', TRUE),
    (v_tid, '1-10003', 'E-Wallet', 'aset', 'ASET', 'debit', TRUE),
    (v_tid, '1-10100', 'Biaya Dibayar di Muka', 'aset', 'ASET', 'debit', TRUE),
    (v_tid, '1-10300', 'Piutang Usaha', 'aset', 'ASET', 'debit', TRUE),
    (v_tid, '1-10400', 'Perlengkapan', 'aset', 'ASET', 'debit', TRUE),
    (v_tid, '1-10500', 'Persediaan Bahan Baku', 'aset', 'ASET', 'debit', TRUE),
    (v_tid, '1-10501', 'Persediaan Dalam Proses', 'aset', 'ASET', 'debit', TRUE),
    (v_tid, '1-10502', 'Persediaan Barang Jadi', 'aset', 'ASET', 'debit', TRUE),
    (v_tid, '1-10503', 'Persediaan Barang Dagang', 'aset', 'ASET', 'debit', TRUE),
    (v_tid, '1-15000', 'Peralatan', 'aset', 'ASET', 'debit', TRUE),
    (v_tid, '1-15900', 'Akumulasi Penyusutan', 'aset', 'ASET', 'credit', TRUE),
    (v_tid, '2-20100', 'Hutang Usaha', 'kewajiban', 'KEWAJIBAN', 'credit', TRUE),
    (v_tid, '2-20400', 'Hutang Bank', 'kewajiban', 'KEWAJIBAN', 'credit', TRUE),
    (v_tid, '2-20600', 'Pendapatan Diterima di Muka', 'kewajiban', 'KEWAJIBAN', 'credit', TRUE),
    (v_tid, '3-30000', 'Modal', 'ekuitas', 'EKUITAS', 'credit', TRUE),
    (v_tid, '3-31000', 'Prive', 'ekuitas', 'EKUITAS', 'debit', TRUE),
    (v_tid, '4-40000', 'Penjualan Produk', 'pendapatan', 'PENDAPATAN', 'credit', TRUE),
    (v_tid, '4-40001', 'Penjualan Jasa', 'pendapatan', 'PENDAPATAN', 'credit', TRUE),
    (v_tid, '4-40900', 'Pendapatan Lain-lain', 'pendapatan', 'PENDAPATAN', 'credit', TRUE),
    (v_tid, '4-41000', 'Diskon Penjualan', 'pendapatan', 'PENDAPATAN', 'debit', TRUE),
    (v_tid, '4-41001', 'Retur Penjualan', 'pendapatan', 'PENDAPATAN', 'debit', TRUE),
    (v_tid, '5-50000', 'Harga Pokok Penjualan', 'beban', 'HPP / BIAYA LANGSUNG', 'debit', TRUE),
    (v_tid, '6-60000', 'Biaya Admin', 'beban', 'BEBAN OPERASIONAL', 'debit', TRUE),
    (v_tid, '6-60100', 'Beban Gaji Karyawan', 'beban', 'BEBAN OPERASIONAL', 'debit', TRUE),
    (v_tid, '6-60200', 'Biaya Utility', 'beban', 'BEBAN OPERASIONAL', 'debit', TRUE),
    (v_tid, '6-60300', 'Biaya Marketing', 'beban', 'BEBAN OPERASIONAL', 'debit', TRUE),
    (v_tid, '6-60400', 'Beban Sewa', 'beban', 'BEBAN OPERASIONAL', 'debit', TRUE),
    (v_tid, '6-60500', 'Beban Penyusutan', 'beban', 'BEBAN OPERASIONAL', 'debit', TRUE),
    (v_tid, '6-60600', 'Biaya Distribusi', 'beban', 'BEBAN OPERASIONAL', 'debit', TRUE),
    (v_tid, '6-60999', 'Biaya Lain-lain', 'beban', 'BEBAN OPERASIONAL', 'debit', TRUE);

  -- Seed default notification configs
  INSERT INTO tenant_notification_configs (tenant_id, role) VALUES
    (v_tid, 'manager'), (v_tid, 'kasir'), (v_tid, 'stok')
    ON CONFLICT (tenant_id, role) DO NOTHING;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. CREATE STORED PROCEDURES

-- Register Staff (manager-only)
CREATE OR REPLACE FUNCTION public.register_staff_profile(
    p_user_id UUID, p_full_name TEXT, p_role user_role
)
RETURNS VOID AS $$
DECLARE
    v_manager_tenant_id UUID;
    v_manager_role user_role;
BEGIN
    SELECT tenant_id, role INTO v_manager_tenant_id, v_manager_role
    FROM public.profiles WHERE id = auth.uid();
    IF v_manager_role != 'manager' THEN
        RAISE EXCEPTION 'Unauthorized: Only managers can manage staff.';
    END IF;
    INSERT INTO public.profiles (id, full_name, role, tenant_id)
    VALUES (p_user_id, p_full_name, p_role, v_manager_tenant_id)
    ON CONFLICT (id) DO UPDATE
    SET role = p_role, full_name = p_full_name, updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create Product with Recipe (atomic)
CREATE OR REPLACE FUNCTION public.create_product_with_recipe(
    p_name TEXT, p_selling_price NUMERIC, p_cost_price NUMERIC DEFAULT 0,
    p_barcode TEXT DEFAULT NULL, p_hpp_coa_id UUID DEFAULT NULL,
    p_recipe JSONB DEFAULT '[]'::JSONB
)
RETURNS UUID AS $$
DECLARE
    v_tenant_id UUID; v_product_id UUID; v_recipe_item RECORD;
BEGIN
    SELECT tenant_id INTO v_tenant_id FROM public.profiles WHERE id = auth.uid();
    IF v_tenant_id IS NULL THEN RAISE EXCEPTION 'Unauthorized'; END IF;

    INSERT INTO public.products (tenant_id, name, selling_price, cost_price, barcode, hpp_coa_id, current_stock)
    VALUES (v_tenant_id, p_name, p_selling_price, p_cost_price, p_barcode, p_hpp_coa_id, 0)
    RETURNING id INTO v_product_id;

    FOR v_recipe_item IN SELECT * FROM jsonb_to_recordset(p_recipe) AS x(materialId UUID, quantity NUMERIC)
    LOOP
        INSERT INTO public.product_recipes (tenant_id, product_id, raw_material_id, quantity_needed)
        VALUES (v_tenant_id, v_product_id, v_recipe_item.materialId, v_recipe_item.quantity);
    END LOOP;
    RETURN v_product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update Product with Recipe
CREATE OR REPLACE FUNCTION public.update_product_with_recipe(
    p_product_id UUID, p_name TEXT, p_selling_price NUMERIC,
    p_cost_price NUMERIC DEFAULT 0, p_barcode TEXT DEFAULT NULL,
    p_hpp_coa_id UUID DEFAULT NULL, p_recipe JSONB DEFAULT '[]'::JSONB
)
RETURNS VOID AS $$
DECLARE
    v_tenant_id UUID; v_recipe_item RECORD;
BEGIN
    SELECT tenant_id INTO v_tenant_id FROM public.profiles WHERE id = auth.uid();
    UPDATE public.products SET name = p_name, selling_price = p_selling_price,
        cost_price = p_cost_price, barcode = p_barcode,
        hpp_coa_id = p_hpp_coa_id, updated_at = NOW()
    WHERE id = p_product_id AND tenant_id = v_tenant_id;
    DELETE FROM public.product_recipes WHERE product_id = p_product_id AND tenant_id = v_tenant_id;
    FOR v_recipe_item IN SELECT * FROM jsonb_to_recordset(p_recipe) AS x(materialId UUID, quantity NUMERIC)
    LOOP
        INSERT INTO public.product_recipes (tenant_id, product_id, raw_material_id, quantity_needed)
        VALUES (v_tenant_id, p_product_id, v_recipe_item.materialId, v_recipe_item.quantity);
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- HPP Preview
CREATE OR REPLACE FUNCTION public.get_hpp_preview(p_product_id UUID)
RETURNS JSON AS $$
DECLARE
    v_tenant_id UUID; v_product RECORD; v_recipe_items JSON;
    v_hpp_per_unit NUMERIC(15,4) := 0; v_mode TEXT := 'none';
BEGIN
    SELECT tenant_id INTO v_tenant_id FROM public.profiles WHERE id = auth.uid();
    SELECT * INTO v_product FROM public.products WHERE id = p_product_id AND tenant_id = v_tenant_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'Product not found'; END IF;
    SELECT json_agg(json_build_object(
        'name', rm.name, 'quantity_needed', pr.quantity_needed,
        'unit', rm.unit, 'unit_price', rm.unit_price,
        'cost', pr.quantity_needed * rm.unit_price
    )), SUM(pr.quantity_needed * rm.unit_price)
    INTO v_recipe_items, v_hpp_per_unit
    FROM public.product_recipes pr
    JOIN public.raw_materials rm ON pr.raw_material_id = rm.id
    WHERE pr.product_id = p_product_id AND pr.tenant_id = v_tenant_id;
    IF v_recipe_items IS NOT NULL THEN v_mode := 'recipe';
    ELSIF v_product.cost_price > 0 THEN v_mode := 'direct'; v_hpp_per_unit := v_product.cost_price;
    END IF;
    RETURN json_build_object(
        'product_name', v_product.name, 'hpp_mode', v_mode,
        'hpp_per_unit', COALESCE(v_hpp_per_unit, 0),
        'selling_price', v_product.selling_price,
        'gross_margin_pct', CASE WHEN v_product.selling_price > 0
            THEN ((v_product.selling_price - COALESCE(v_hpp_per_unit, 0)) / v_product.selling_price) * 100 ELSE 0 END,
        'ingredients', COALESCE(v_recipe_items, '[]'::json)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- POS Sale (using existing debit/credit columns)
CREATE OR REPLACE FUNCTION public.process_pos_sale(
    p_items JSONB, p_payment_method payment_method,
    p_discount_amount NUMERIC, p_customer_name TEXT, p_idempotency_key TEXT
)
RETURNS JSON AS $$
DECLARE
    v_tenant_id UUID; v_transaction_id UUID; v_pesanan_id UUID;
    v_journal_id UUID; v_pesanan_number TEXT; v_item RECORD; v_recipe RECORD;
    v_total_amount NUMERIC(15,2) := 0; v_subtotal NUMERIC(15,2) := 0;
    v_payment_account_id UUID; v_revenue_account_id UUID;
    v_discount_account_id UUID; v_hpp_expense_account_id UUID;
    v_current_item_hpp_per_unit NUMERIC(15,4);
    v_current_item_hpp_amount NUMERIC(15,2); v_current_item_hpp_mode TEXT;
    v_recipe_count INT; v_direct_cost NUMERIC(15,2); v_product_hpp_coa_id UUID;
    v_ingredient_coa_id UUID;
    v_total_debit NUMERIC(15,2) := 0; v_total_credit NUMERIC(15,2) := 0;
BEGIN
    SELECT tenant_id INTO v_tenant_id FROM public.profiles WHERE id = auth.uid();
    IF v_tenant_id IS NULL THEN RAISE EXCEPTION 'Unauthorized'; END IF;

    v_pesanan_number := 'ORD-' || to_char(NOW(), 'YYYY') || '-' || LPAD(floor(random() * 100000)::text, 5, '0');

    SELECT id INTO v_payment_account_id FROM chart_of_accounts WHERE tenant_id = v_tenant_id AND code =
        CASE p_payment_method WHEN 'cash' THEN '1-10000' WHEN 'qris' THEN '1-10003' ELSE '1-10002' END;
    SELECT id INTO v_revenue_account_id FROM chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '4-40000';
    SELECT id INTO v_discount_account_id FROM chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '4-41000';
    SELECT id INTO v_hpp_expense_account_id FROM chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '5-50000';

    INSERT INTO sales_orders (tenant_id, pesanan_number, customer_name, status, source)
    VALUES (v_tenant_id, v_pesanan_number, p_customer_name, 'confirmed', 'pos')
    RETURNING id INTO v_pesanan_id;

    INSERT INTO transactions (tenant_id, cashier_id, pesanan_id, source_type, status, payment_method, idempotency_key)
    VALUES (v_tenant_id, auth.uid(), v_pesanan_id, 'pos_sale', 'validating', p_payment_method, p_idempotency_key)
    RETURNING id INTO v_transaction_id;

    INSERT INTO journal_entries (tenant_id, reference_type, reference_id, description, idempotency_key)
    VALUES (v_tenant_id, 'pos_sale', v_transaction_id, 'POS Sale ' || v_pesanan_number, p_idempotency_key)
    RETURNING id INTO v_journal_id;

    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id UUID, quantity NUMERIC, unit_price NUMERIC, discount NUMERIC)
    LOOP
        v_subtotal := v_subtotal + (v_item.unit_price * v_item.quantity);
        v_current_item_hpp_per_unit := 0;

        SELECT count(*), max(p.cost_price), max(p.hpp_coa_id)
        INTO v_recipe_count, v_direct_cost, v_product_hpp_coa_id
        FROM products p LEFT JOIN product_recipes pr ON p.id = pr.product_id
        WHERE p.id = v_item.product_id AND p.tenant_id = v_tenant_id;

        IF v_recipe_count > 0 THEN
            v_current_item_hpp_mode := 'recipe';
            FOR v_recipe IN
                SELECT r.raw_material_id, r.quantity_needed, rm.unit_price, rm.name, rm.coa_account_id
                FROM product_recipes r JOIN raw_materials rm ON r.raw_material_id = rm.id
                WHERE r.product_id = v_item.product_id AND r.tenant_id = v_tenant_id
                FOR UPDATE OF rm
            LOOP
                IF (SELECT current_stock FROM raw_materials WHERE id = v_recipe.raw_material_id) < (v_recipe.quantity_needed * v_item.quantity) THEN
                    RAISE EXCEPTION 'INSUFFICIENT_INGREDIENT: %', v_recipe.name;
                END IF;
                UPDATE raw_materials SET current_stock = current_stock - (v_recipe.quantity_needed * v_item.quantity), updated_at = NOW()
                WHERE id = v_recipe.raw_material_id;
                v_current_item_hpp_per_unit := v_current_item_hpp_per_unit + (v_recipe.unit_price * v_recipe.quantity_needed);
                v_ingredient_coa_id := COALESCE(v_recipe.coa_account_id, (SELECT id FROM chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '1-10500'));
                INSERT INTO journal_lines (journal_entry_id, entry_id, account_id, debit, credit)
                VALUES (v_journal_id, v_journal_id, v_hpp_expense_account_id, v_recipe.unit_price * v_recipe.quantity_needed * v_item.quantity, 0);
                INSERT INTO journal_lines (journal_entry_id, entry_id, account_id, debit, credit)
                VALUES (v_journal_id, v_journal_id, v_ingredient_coa_id, 0, v_recipe.unit_price * v_recipe.quantity_needed * v_item.quantity);
                v_total_debit := v_total_debit + (v_recipe.unit_price * v_recipe.quantity_needed * v_item.quantity);
                v_total_credit := v_total_credit + (v_recipe.unit_price * v_recipe.quantity_needed * v_item.quantity);
            END LOOP;
        ELSIF v_direct_cost > 0 THEN
            v_current_item_hpp_mode := 'direct';
            v_current_item_hpp_per_unit := v_direct_cost;
            v_ingredient_coa_id := COALESCE(v_product_hpp_coa_id, (SELECT id FROM chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '1-10503'));
            INSERT INTO journal_lines (journal_entry_id, entry_id, account_id, debit, credit)
            VALUES (v_journal_id, v_journal_id, v_hpp_expense_account_id, v_direct_cost * v_item.quantity, 0);
            INSERT INTO journal_lines (journal_entry_id, entry_id, account_id, debit, credit)
            VALUES (v_journal_id, v_journal_id, v_ingredient_coa_id, 0, v_direct_cost * v_item.quantity);
            v_total_debit := v_total_debit + (v_direct_cost * v_item.quantity);
            v_total_credit := v_total_credit + (v_direct_cost * v_item.quantity);
        ELSE
            v_current_item_hpp_mode := 'none';
        END IF;

        v_current_item_hpp_amount := v_current_item_hpp_per_unit * v_item.quantity;

        INSERT INTO sale_items (tenant_id, transaction_id, product_id, quantity, unit_price, discount, hpp_mode, hpp_per_unit, hpp_amount, total)
        VALUES (v_tenant_id, v_transaction_id, v_item.product_id, v_item.quantity, v_item.unit_price, v_item.discount,
            v_current_item_hpp_mode, v_current_item_hpp_per_unit, v_current_item_hpp_amount,
            (v_item.unit_price * v_item.quantity) - v_item.discount);
    END LOOP;

    v_total_amount := v_subtotal - p_discount_amount;

    -- Revenue Recognition
    INSERT INTO journal_lines (journal_entry_id, entry_id, account_id, debit, credit)
    VALUES (v_journal_id, v_journal_id, v_payment_account_id, v_total_amount, 0);
    v_total_debit := v_total_debit + v_total_amount;
    INSERT INTO journal_lines (journal_entry_id, entry_id, account_id, debit, credit)
    VALUES (v_journal_id, v_journal_id, v_revenue_account_id, 0, v_subtotal);
    v_total_credit := v_total_credit + v_subtotal;
    IF p_discount_amount > 0 THEN
        INSERT INTO journal_lines (journal_entry_id, entry_id, account_id, debit, credit)
        VALUES (v_journal_id, v_journal_id, v_discount_account_id, p_discount_amount, 0);
        v_total_debit := v_total_debit + p_discount_amount;
    END IF;

    IF ABS(v_total_debit - v_total_credit) >= 0.01 THEN
        RAISE EXCEPTION 'JOURNAL_IMBALANCE: Debits % != Credits %', v_total_debit, v_total_credit;
    END IF;

    UPDATE transactions SET subtotal = v_subtotal, discount_amount = p_discount_amount,
        total_amount = v_total_amount, status = 'committed', journal_id = v_journal_id
    WHERE id = v_transaction_id;
    UPDATE sales_orders SET total_amount = v_total_amount, status = 'fulfilled',
        transaction_id = v_transaction_id, fulfilled_at = NOW()
    WHERE id = v_pesanan_id;

    RETURN json_build_object('transaction_id', v_transaction_id, 'pesanan_id', v_pesanan_id,
        'journal_id', v_journal_id, 'status', 'committed');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Void POS Sale
CREATE OR REPLACE FUNCTION public.void_pos_sale(p_transaction_id UUID)
RETURNS VOID AS $$
DECLARE
    v_tenant_id UUID; v_manager_role user_role;
    v_original_journal_id UUID; v_new_journal_id UUID; v_line RECORD;
BEGIN
    SELECT tenant_id, role INTO v_tenant_id, v_manager_role FROM public.profiles WHERE id = auth.uid();
    IF v_manager_role != 'manager' THEN RAISE EXCEPTION 'Unauthorized'; END IF;
    SELECT journal_id INTO v_original_journal_id FROM transactions WHERE id = p_transaction_id AND tenant_id = v_tenant_id AND status != 'voided';
    IF v_original_journal_id IS NULL THEN RAISE EXCEPTION 'Transaction not found or already voided'; END IF;
    UPDATE transactions SET status = 'voided' WHERE id = p_transaction_id;
    UPDATE sales_orders SET status = 'voided' WHERE transaction_id = p_transaction_id;
    INSERT INTO journal_entries (tenant_id, reference_type, reference_id, description)
    VALUES (v_tenant_id, 'pos_void', p_transaction_id, 'Reversal for POS Sale')
    RETURNING id INTO v_new_journal_id;
    FOR v_line IN SELECT * FROM journal_lines WHERE journal_entry_id = v_original_journal_id
    LOOP
        INSERT INTO journal_lines (journal_entry_id, entry_id, account_id, debit, credit)
        VALUES (v_new_journal_id, v_new_journal_id, v_line.account_id, v_line.credit, v_line.debit);
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update Pesanan Status
CREATE OR REPLACE FUNCTION public.update_pesanan_status(
    p_pesanan_id UUID, p_status pesanan_status,
    p_division_note TEXT DEFAULT NULL, p_division TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    v_tenant_id UUID; v_current_notes JSONB;
BEGIN
    SELECT tenant_id INTO v_tenant_id FROM public.profiles WHERE id = auth.uid();
    SELECT division_notes INTO v_current_notes FROM sales_orders WHERE id = p_pesanan_id AND tenant_id = v_tenant_id;
    IF p_division IS NOT NULL AND p_division_note IS NOT NULL THEN
        v_current_notes := jsonb_set(COALESCE(v_current_notes, '{}'::jsonb), ARRAY[p_division], to_jsonb(p_division_note));
    END IF;
    UPDATE sales_orders SET status = p_status, division_notes = v_current_notes, updated_at = NOW()
    WHERE id = p_pesanan_id AND tenant_id = v_tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Payout helpers
CREATE OR REPLACE FUNCTION public.increment_tenant_balance(p_tenant_id UUID, p_amount NUMERIC)
RETURNS VOID AS $$
BEGIN
    INSERT INTO tenant_balances (tenant_id, balance_amount)
    VALUES (p_tenant_id, p_amount)
    ON CONFLICT (tenant_id) DO UPDATE
    SET balance_amount = tenant_balances.balance_amount + p_amount, updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.approve_payout(p_payout_id UUID)
RETURNS VOID AS $$
DECLARE v_tenant_id UUID; v_amount NUMERIC; v_status TEXT;
BEGIN
    IF NOT public.get_auth_is_superadmin() THEN RAISE EXCEPTION 'Unauthorized'; END IF;
    SELECT tenant_id, amount, status INTO v_tenant_id, v_amount, v_status FROM payout_requests WHERE id = p_payout_id;
    IF v_status != 'pending' THEN RAISE EXCEPTION 'Payout not pending'; END IF;
    UPDATE payout_requests SET status = 'success', updated_at = NOW() WHERE id = p_payout_id;
    UPDATE tenant_balances SET balance_amount = balance_amount - v_amount, updated_at = NOW() WHERE tenant_id = v_tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.reject_payout(p_payout_id UUID)
RETURNS VOID AS $$
DECLARE v_status TEXT;
BEGIN
    IF NOT public.get_auth_is_superadmin() THEN RAISE EXCEPTION 'Unauthorized'; END IF;
    SELECT status INTO v_status FROM payout_requests WHERE id = p_payout_id;
    IF v_status != 'pending' THEN RAISE EXCEPTION 'Payout not pending'; END IF;
    UPDATE payout_requests SET status = 'failed', updated_at = NOW() WHERE id = p_payout_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 10. STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('inventory-docs', 'inventory-docs', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('receipt-scans', 'receipt-scans', false) ON CONFLICT DO NOTHING;

-- Storage Policies
DO $$ BEGIN
    CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
    CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT
        WITH CHECK (bucket_id = 'avatars' AND auth.uid() = (storage.foldername(name))[1]::uuid);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
    CREATE POLICY "Public Access for inventory docs" ON storage.objects FOR SELECT USING (bucket_id = 'inventory-docs');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
    CREATE POLICY "Users can upload inventory docs" ON storage.objects FOR INSERT
        WITH CHECK (bucket_id = 'inventory-docs' AND auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 11. INITIAL SEED DATA
INSERT INTO public.global_settings (system_mode) VALUES ('NORMAL') ON CONFLICT DO NOTHING;
