-- =============================================================
-- MIGRATION 015: Personal Finance Module & Bill Tracker Upgrades
-- =============================================================
-- Adds: premium tier, product_type engine, personal finance tables,
-- bill tracker enhancements (payments, reminders, auto-journal).
-- =============================================================

-- 1. ADD 'premium' TO subscription_tier ENUM
-- Strategy: rename old type, create new, cast columns, drop old.
DO $$
DECLARE
    current_enum_values TEXT[];
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_tier') THEN
        SELECT array_agg(e.enumlabel ORDER BY e.enumsortorder) INTO current_enum_values
        FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = 'subscription_tier';

        IF current_enum_values IS DISTINCT FROM ARRAY['free', 'premium', 'pro', 'franchise'] THEN
            ALTER TYPE subscription_tier RENAME TO subscription_tier_old;
            CREATE TYPE subscription_tier AS ENUM ('free', 'premium', 'pro', 'franchise');

            ALTER TABLE public.tenants
                ALTER COLUMN tier DROP DEFAULT,
                ALTER COLUMN tier TYPE subscription_tier
                USING CASE tier::text
                    WHEN 'free' THEN 'free'::subscription_tier
                    WHEN 'pro' THEN 'pro'::subscription_tier
                    WHEN 'franchise' THEN 'franchise'::subscription_tier
                    ELSE 'free'::subscription_tier
                END,
                ALTER COLUMN tier SET DEFAULT 'free'::subscription_tier;

            DROP TYPE subscription_tier_old;
        END IF;
    END IF;
END $$;

-- 2. CREATE product_type ENUM
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_type') THEN
        CREATE TYPE product_type AS ENUM (
            'physical', 'service', 'digital', 'custom_price',
            'weighted', 'composite', 'hybrid'
        );
    END IF;
END $$;

-- 3. ADD COLUMNS TO products TABLE
ALTER TABLE public.products
    ADD COLUMN IF NOT EXISTS product_type    product_type NOT NULL DEFAULT 'physical',
    ADD COLUMN IF NOT EXISTS base_price_unit TEXT,
    ADD COLUMN IF NOT EXISTS track_stock     BOOLEAN DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_products_type_tenant
    ON public.products(tenant_id, product_type) WHERE is_active = TRUE;

-- 4. CREATE product_behaviors TABLE
CREATE TABLE IF NOT EXISTS public.product_behaviors (
    id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id    UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    product_id   UUID NOT NULL UNIQUE REFERENCES public.products(id) ON DELETE CASCADE,
    product_type product_type NOT NULL,
    metadata     JSONB NOT NULL DEFAULT '{}',
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_behaviors_tenant
    ON public.product_behaviors(tenant_id);

-- 5. CREATE personal_budgets TABLE
CREATE TABLE IF NOT EXISTS public.personal_budgets (
    id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id      UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    account_id     UUID NOT NULL REFERENCES public.chart_of_accounts(id) ON DELETE CASCADE,
    month          INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year           INTEGER NOT NULL,
    budget_amount  NUMERIC(15,2) NOT NULL DEFAULT 0,
    created_at     TIMESTAMPTZ DEFAULT NOW(),
    updated_at     TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, account_id, month, year)
);

CREATE INDEX IF NOT EXISTS idx_personal_budgets_tenant_period
    ON public.personal_budgets(tenant_id, year, month);

-- 6. CREATE financial_goals TABLE
CREATE TABLE IF NOT EXISTS public.financial_goals (
    id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id           UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name                TEXT NOT NULL,
    goal_type           TEXT NOT NULL CHECK (goal_type IN ('savings','debt_payoff','investment','emergency_fund')),
    target_amount       NUMERIC(15,2) NOT NULL,
    current_amount      NUMERIC(15,2) NOT NULL DEFAULT 0,
    target_date         DATE,
    linked_account_id   UUID REFERENCES public.chart_of_accounts(id) ON DELETE SET NULL,
    notes               TEXT,
    status              TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','achieved','cancelled')),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_financial_goals_tenant
    ON public.financial_goals(tenant_id, status);

-- 7. CREATE recurring_transactions TABLE
CREATE TABLE IF NOT EXISTS public.recurring_transactions (
    id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id           UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name                TEXT NOT NULL,
    amount              NUMERIC(15,2) NOT NULL,
    direction           TEXT NOT NULL CHECK (direction IN ('income','expense')),
    debit_account_id    UUID NOT NULL REFERENCES public.chart_of_accounts(id) ON DELETE RESTRICT,
    credit_account_id   UUID NOT NULL REFERENCES public.chart_of_accounts(id) ON DELETE RESTRICT,
    frequency           TEXT NOT NULL CHECK (frequency IN ('daily','weekly','monthly','yearly')),
    day_of_period       INTEGER,
    next_due_date       DATE NOT NULL,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    last_triggered_at   TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recurring_transactions_due
    ON public.recurring_transactions(next_due_date) WHERE is_active = TRUE;

-- 8. ADD BILL TRACKER COLUMNS TO bills TABLE
ALTER TABLE public.bills
    ADD COLUMN IF NOT EXISTS contact_name       TEXT,
    ADD COLUMN IF NOT EXISTS contact_phone      TEXT,
    ADD COLUMN IF NOT EXISTS bill_type          TEXT,
    ADD COLUMN IF NOT EXISTS payment_account_id UUID REFERENCES public.chart_of_accounts(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS amount_paid        NUMERIC(15,2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS reminder_days      INTEGER[] DEFAULT ARRAY[7, 3, 1],
    ADD COLUMN IF NOT EXISTS last_reminded_at   TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS journal_entry_id   UUID REFERENCES public.journal_entries(id) ON DELETE SET NULL;

-- Update the status CHECK to include new values
DO $$
BEGIN
    ALTER TABLE public.bills DROP CONSTRAINT IF EXISTS bills_status_check;
    ALTER TABLE public.bills ADD CONSTRAINT bills_status_check
        CHECK (status IN ('pending', 'partial', 'paid', 'overdue', 'cancelled'));
END $$;

-- Sync bill_type from existing type column
UPDATE public.bills SET bill_type = type WHERE bill_type IS NULL;

CREATE INDEX IF NOT EXISTS idx_bills_tenant_status
    ON public.bills(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_bills_tenant_due
    ON public.bills(tenant_id, due_date) WHERE status IN ('pending', 'partial', 'overdue');

-- 9. CREATE bill_payments TABLE
CREATE TABLE IF NOT EXISTS public.bill_payments (
    id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bill_id           UUID NOT NULL REFERENCES public.bills(id) ON DELETE CASCADE,
    tenant_id         UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    amount            NUMERIC(15,2) NOT NULL,
    payment_date      DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_account_id UUID REFERENCES public.chart_of_accounts(id) ON DELETE SET NULL,
    notes             TEXT,
    journal_entry_id  UUID REFERENCES public.journal_entries(id) ON DELETE SET NULL,
    created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bill_payments_bill
    ON public.bill_payments(bill_id);

-- 10. ENABLE ROW LEVEL SECURITY ON NEW TABLES
ALTER TABLE IF EXISTS public.product_behaviors      ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.personal_budgets        ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.financial_goals         ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.recurring_transactions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.bill_payments           ENABLE ROW LEVEL SECURITY;

-- 11. RLS POLICIES FOR NEW TABLES (tenant isolation pattern)

-- product_behaviors
DROP POLICY IF EXISTS tenant_isolation_product_behaviors ON public.product_behaviors;
CREATE POLICY tenant_isolation_product_behaviors ON public.product_behaviors
    FOR ALL USING (tenant_id = public.get_auth_tenant_id());

-- personal_budgets
DROP POLICY IF EXISTS tenant_isolation_personal_budgets ON public.personal_budgets;
CREATE POLICY tenant_isolation_personal_budgets ON public.personal_budgets
    FOR ALL USING (tenant_id = public.get_auth_tenant_id());

-- financial_goals
DROP POLICY IF EXISTS tenant_isolation_financial_goals ON public.financial_goals;
CREATE POLICY tenant_isolation_financial_goals ON public.financial_goals
    FOR ALL USING (tenant_id = public.get_auth_tenant_id());

-- recurring_transactions
DROP POLICY IF EXISTS tenant_isolation_recurring_transactions ON public.recurring_transactions;
CREATE POLICY tenant_isolation_recurring_transactions ON public.recurring_transactions
    FOR ALL USING (tenant_id = public.get_auth_tenant_id());

-- bill_payments
DROP POLICY IF EXISTS tenant_isolation_bill_payments ON public.bill_payments;
CREATE POLICY tenant_isolation_bill_payments ON public.bill_payments
    FOR ALL USING (tenant_id = public.get_auth_tenant_id());

-- 12. UPDATE handle_new_user() TO SUPPORT PERSONAL COA SEED
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE v_tid UUID; v_name TEXT; v_type TEXT;
BEGIN
  v_name := COALESCE(new.raw_user_meta_data->>'business_name', 'Toko Baru');
  v_type := COALESCE(new.raw_user_meta_data->>'account_type', 'business');

  INSERT INTO tenants (name, account_type, tier) VALUES (v_name, v_type, 'free') RETURNING id INTO v_tid;

  INSERT INTO profiles (id, full_name, role, tenant_id, account_type)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', 'User'), 'manager', v_tid, v_type);

  -- Branch seed by account_type
  IF v_type = 'personal' THEN
    -- Personal COA (12 accounts — see docs/accounting.md §6.1)
    INSERT INTO chart_of_accounts (tenant_id, code, name, type, kategori, normal_balance, is_system) VALUES
      (v_tid, '1-10000', 'Dompet / Kas Tunai',    'aset',      'ASET',               'debit',  TRUE),
      (v_tid, '1-10002', 'Rekening Bank',          'aset',      'ASET',               'debit',  TRUE),
      (v_tid, '1-10003', 'E-Wallet',               'aset',      'ASET',               'debit',  TRUE),
      (v_tid, '1-10100', 'Dana Darurat',           'aset',      'ASET',               'debit',  TRUE),
      (v_tid, '1-10200', 'Tabungan & Investasi',   'aset',      'ASET',               'debit',  TRUE),
      (v_tid, '2-20100', 'Hutang / Cicilan',       'kewajiban', 'KEWAJIBAN',          'credit', TRUE),
      (v_tid, '3-30000', 'Kekayaan Bersih (Modal)','ekuitas',   'EKUITAS',            'credit', TRUE),
      (v_tid, '4-40000', 'Gaji / Pendapatan Tetap','pendapatan','PENDAPATAN',         'credit', TRUE),
      (v_tid, '4-40900', 'Pendapatan Lain-lain',   'pendapatan','PENDAPATAN',         'credit', TRUE),
      (v_tid, '6-60000', 'Kebutuhan Pokok',        'beban',     'BEBAN OPERASIONAL',  'debit',  TRUE),
      (v_tid, '6-60100', 'Tagihan & Utilitas',     'beban',     'BEBAN OPERASIONAL',  'debit',  TRUE),
      (v_tid, '6-60999', 'Pengeluaran Lain-lain',  'beban',     'BEBAN OPERASIONAL',  'debit',  TRUE);
  ELSE
    -- Business COA (31 accounts — docs/accounting.md §1.2)
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
  END IF;

  INSERT INTO tenant_notification_configs (tenant_id, role) VALUES
    (v_tid,'manager'),(v_tid,'kasir'),(v_tid,'stok')
    ON CONFLICT (tenant_id, role) DO NOTHING;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
