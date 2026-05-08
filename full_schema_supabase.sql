-- STEP 1: DATABASE SCHEMA & RLS (Saas POS Ready)

-- 1. ENUMS & EXTENSIONS
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('manager', 'kasir', 'stok');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_tier') THEN
        CREATE TYPE subscription_tier AS ENUM ('free', 'business', 'ai');
    END IF;
END $$;

-- 2. TABLES
-- Profiles: Linked to Supabase Auth
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'stok',
    tenant_id UUID NOT NULL, -- Mandatory for SaaS
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Accounts: Chart of Accounts (COA)
CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    code TEXT NOT NULL, -- e.g., '1-1001'
    name TEXT NOT NULL, -- e.g., 'Kas Utama', 'Persediaan Bahan Baku'
    type TEXT NOT NULL, -- e.g., 'aset', 'beban', 'pendapatan'
    UNIQUE(tenant_id, code)
);

-- Raw Materials: Inventory items
CREATE TABLE IF NOT EXISTS public.raw_materials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    name TEXT NOT NULL,
    unit TEXT NOT NULL, -- gram, ml, pcs
    unit_price NUMERIC(15, 2) NOT NULL DEFAULT 0, -- Modal per unit
    current_stock NUMERIC(15, 3) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products: Items sold to customers
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    name TEXT NOT NULL,
    selling_price NUMERIC(15, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product Recipes: Composition of raw materials for 1 unit of product
CREATE TABLE IF NOT EXISTS public.product_recipes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    raw_material_id UUID REFERENCES public.raw_materials(id) ON DELETE RESTRICT,
    quantity_needed NUMERIC(15, 3) NOT NULL,
    UNIQUE(product_id, raw_material_id)
);

-- Journal Entries: Double-entry accounting records
CREATE TABLE IF NOT EXISTS public.journal_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    transaction_date TIMESTAMPTZ DEFAULT NOW(),
    debit_account_id UUID REFERENCES public.accounts(id),
    credit_account_id UUID REFERENCES public.accounts(id),
    amount NUMERIC(15, 2) NOT NULL,
    description TEXT,
    reference_doc_id UUID -- Reference to Invoice or Purchase ID
);

-- 3. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raw_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

-- 4. RLS POLICIES (Tenant Isolation)
-- Rule: Users can only see/edit data with their own tenant_id
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'tenant_isolation_policy') THEN
        CREATE POLICY tenant_isolation_policy ON public.profiles
            FOR ALL USING (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'tenant_isolation_accounts') THEN
        CREATE POLICY tenant_isolation_accounts ON public.accounts
            FOR ALL USING (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'tenant_isolation_raw_materials') THEN
        CREATE POLICY tenant_isolation_raw_materials ON public.raw_materials
            FOR ALL USING (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'tenant_isolation_products') THEN
        CREATE POLICY tenant_isolation_products ON public.products
            FOR ALL USING (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'tenant_isolation_recipes') THEN
        CREATE POLICY tenant_isolation_recipes ON public.product_recipes
            FOR ALL USING (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'tenant_isolation_journals') THEN
        CREATE POLICY tenant_isolation_journals ON public.journal_entries
            FOR ALL USING (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));
    END IF;
END $$;

-- 5. AUTOMATIC PROFILE CREATION TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, tenant_id)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'User'), 
    'manager', 
    gen_random_uuid() 
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
-- STEP 2: BACKEND LOGIC & RPC (Automation & Concurrency Safety)

CREATE OR REPLACE FUNCTION public.process_sale(
    p_items JSONB, 
    p_payment_account_id UUID, 
    p_revenue_account_id UUID, 
    p_hpp_account_id UUID, 
    p_inventory_account_id UUID,
    p_description TEXT DEFAULT 'Penjualan POS'
)
RETURNS UUID AS $$
DECLARE
    v_tenant_id UUID;
    v_transaction_id UUID;
    v_item RECORD;
    v_recipe RECORD;
    v_total_sale_amount NUMERIC(15, 2) := 0;
    v_total_hpp_amount NUMERIC(15, 2) := 0;
    v_current_item_hpp NUMERIC(15, 2);
    v_required_qty NUMERIC(15, 3);
BEGIN
    -- 1. Get Tenant ID from Caller Profile
    SELECT tenant_id INTO v_tenant_id FROM public.profiles WHERE id = auth.uid();
    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: Profile or Tenant not found.';
    END IF;

    -- 2. Validate Input
    IF jsonb_array_length(p_items) = 0 THEN
        RAISE EXCEPTION 'No items provided for the sale.';
    END IF;

    -- 3. Process Each Item (Stock Deductions & HPP Calculation)
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id UUID, quantity NUMERIC, price NUMERIC)
    LOOP
        v_total_sale_amount := v_total_sale_amount + (v_item.price * v_item.quantity);
        v_current_item_hpp := 0;

        -- Iterate through recipe for this product
        FOR v_recipe IN 
            SELECT r.raw_material_id, r.quantity_needed, rm.unit_price, rm.name
            FROM public.product_recipes r
            JOIN public.raw_materials rm ON r.raw_material_id = rm.id
            WHERE r.product_id = v_item.product_id AND r.tenant_id = v_tenant_id
            FOR UPDATE OF rm -- CONCURRENCY SAFETY: Lock the raw material rows
        LOOP
            v_required_qty := v_recipe.quantity_needed * v_item.quantity;
            
            -- Validation: Check Stock
            IF (SELECT current_stock FROM public.raw_materials WHERE id = v_recipe.raw_material_id) < v_required_qty THEN
                RAISE EXCEPTION 'Insufficient stock for ingredient: %', v_recipe.name;
            END IF;

            -- Deduct Stock
            UPDATE public.raw_materials 
            SET current_stock = current_stock - v_required_qty,
                updated_at = NOW()
            WHERE id = v_recipe.raw_material_id;

            -- Accumulate HPP
            v_current_item_hpp := v_current_item_hpp + (v_recipe.unit_price * v_required_qty);
        END LOOP;

        v_total_hpp_amount := v_total_hpp_amount + v_current_item_hpp;
    END LOOP;

    -- 4. Record Transaction & Journal Entries (Accounting-Correct)
    -- We can treat the journal entries themselves as the transaction record
    
    -- Entry 1: Penjualan (Revenue Recognition)
    -- Debit: Kas/Bank, Credit: Pendapatan
    INSERT INTO public.journal_entries (tenant_id, debit_account_id, credit_account_id, amount, description)
    VALUES (v_tenant_id, p_payment_account_id, p_revenue_account_id, v_total_sale_amount, p_description);

    -- Entry 2: HPP (Expense Recognition)
    -- Debit: Beban HPP, Credit: Persediaan Bahan Baku
    IF v_total_hpp_amount > 0 THEN
        INSERT INTO public.journal_entries (tenant_id, debit_account_id, credit_account_id, amount, description)
        VALUES (v_tenant_id, p_hpp_account_id, p_inventory_account_id, v_total_hpp_amount, p_description || ' (HPP Otomatis)');
    END IF;

    -- Return the first journal entry ID as reference
    SELECT id INTO v_transaction_id FROM public.journal_entries 
    WHERE tenant_id = v_tenant_id ORDER BY transaction_date DESC LIMIT 1;

    RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- STEP 3.4: PRODUCT & RECIPE ATOMIC HELPERS

CREATE OR REPLACE FUNCTION public.create_product_with_recipe(
    p_name TEXT,
    p_selling_price NUMERIC,
    p_recipe JSONB DEFAULT '[]'::JSONB
)
RETURNS UUID AS $$
DECLARE
    v_tenant_id UUID;
    v_product_id UUID;
    v_recipe_item RECORD;
BEGIN
    -- Get current tenant
    SELECT tenant_id INTO v_tenant_id FROM public.profiles WHERE id = auth.uid();
    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    -- 1. Insert Product
    INSERT INTO public.products (tenant_id, name, selling_price)
    VALUES (v_tenant_id, p_name, p_selling_price)
    RETURNING id INTO v_product_id;

    -- 2. Insert Recipe Items
    FOR v_recipe_item IN SELECT * FROM jsonb_to_recordset(p_recipe) AS x(materialId UUID, quantity NUMERIC)
    LOOP
        INSERT INTO public.product_recipes (tenant_id, product_id, raw_material_id, quantity_needed)
        VALUES (v_tenant_id, v_product_id, v_recipe_item.materialId, v_recipe_item.quantity);
    END LOOP;

    RETURN v_product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION public.update_product_with_recipe(
    p_product_id UUID,
    p_name TEXT,
    p_selling_price NUMERIC,
    p_recipe JSONB DEFAULT '[]'::JSONB
)
RETURNS VOID AS $$
DECLARE
    v_tenant_id UUID;
    v_recipe_item RECORD;
BEGIN
    -- Get current tenant
    SELECT tenant_id INTO v_tenant_id FROM public.profiles WHERE id = auth.uid();
    
    -- 1. Update Product
    UPDATE public.products 
    SET name = p_name, 
        selling_price = p_selling_price, 
        updated_at = NOW()
    WHERE id = p_product_id AND tenant_id = v_tenant_id;

    -- 2. Hard Sync Recipe (Delete old, Insert new)
    DELETE FROM public.product_recipes WHERE product_id = p_product_id AND tenant_id = v_tenant_id;

    FOR v_recipe_item IN SELECT * FROM jsonb_to_recordset(p_recipe) AS x(materialId UUID, quantity NUMERIC)
    LOOP
        INSERT INTO public.product_recipes (tenant_id, product_id, raw_material_id, quantity_needed)
        VALUES (v_tenant_id, p_product_id, v_recipe_item.materialId, v_recipe_item.quantity);
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- STEP 4.1 & 4.2: SECURITY REINFORCEMENT & AUTO-SEEDING COA

-- 1. REVISE RLS POLICIES FOR RBAC
-- We need to ensure 'kasir' cannot insert/update/delete products or raw materials.
-- First, drop existing policies to avoid conflicts
DROP POLICY IF EXISTS tenant_isolation_raw_materials ON public.raw_materials;
DROP POLICY IF EXISTS tenant_isolation_products ON public.products;

-- Raw Materials Policy: 
-- SELECT: All roles in the same tenant.
-- INSERT/UPDATE/DELETE: Only 'manager' or 'stok'.
CREATE POLICY rbac_raw_materials ON public.raw_materials
    FOR ALL USING (
        tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
    )
    WITH CHECK (
        tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
        AND (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('manager', 'stok')
    );

-- Products Policy:
-- SELECT: All roles in the same tenant.
-- INSERT/UPDATE/DELETE: Only 'manager' or 'stok'.
CREATE POLICY rbac_products ON public.products
    FOR ALL USING (
        tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
    )
    WITH CHECK (
        tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
        AND (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('manager', 'stok')
    );


-- 2. ENHANCE AUTO-PROFILE TRIGGER (COA SEEDING)
-- This version automatically seeds the 4 mandatory accounts for every new tenant.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    v_new_tenant_id UUID := gen_random_uuid();
BEGIN
  -- Insert Profile
  INSERT INTO public.profiles (id, full_name, role, tenant_id)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'User'), 
    'manager', 
    v_new_tenant_id
  );

  -- Seed Chart of Accounts (COA) for the new tenant
  -- Accounting-Correct: Pre-defining mandatory accounts for process_sale RPC
  INSERT INTO public.accounts (tenant_id, code, name, type) VALUES
    (v_new_tenant_id, '1-1001', 'Kas Utama', 'aset'),
    (v_new_tenant_id, '1-2001', 'Persediaan Bahan Baku', 'aset'),
    (v_new_tenant_id, '4-1001', 'Pendapatan Penjualan', 'pendapatan'),
    (v_new_tenant_id, '5-1001', 'Beban HPP', 'beban');

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-apply trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
-- STEP 4.4: STAFF MANAGEMENT SECURITY DEFINER HELPERS

/**
 * register_staff
 * Allows an Owner to create a profile for a new staff member.
 * Note: The actual Auth User creation should happen via Supabase Admin API 
 * (Edge Functions) but this ensures the profile is linked correctly to the tenant.
 */
CREATE OR REPLACE FUNCTION public.register_staff_profile(
    p_user_id UUID,
    p_full_name TEXT,
    p_role user_role
)
RETURNS VOID AS $$
DECLARE
    v_owner_tenant_id UUID;
    v_owner_role user_role;
BEGIN
    -- 1. Get Caller's Info
    SELECT tenant_id, role INTO v_owner_tenant_id, v_owner_role 
    FROM public.profiles WHERE id = auth.uid();

    -- 2. Security Check: Only Owners can register staff
    IF v_owner_role != 'manager' THEN
        RAISE EXCEPTION 'Unauthorized: Only owners can manage staff.';
    END IF;

    -- 3. Insert/Update Staff Profile with SAME tenant_id
    INSERT INTO public.profiles (id, full_name, role, tenant_id)
    VALUES (p_user_id, p_full_name, p_role, v_owner_tenant_id)
    ON CONFLICT (id) DO UPDATE 
    SET role = p_role, 
        full_name = p_full_name, 
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Migrate 'manager' role to 'manager'

-- 1. Rename the ENUM value (Removed since it's already manager)

-- 2. Update RBAC policies for products and raw_materials
DROP POLICY IF EXISTS rbac_raw_materials ON public.raw_materials;
CREATE POLICY rbac_raw_materials ON public.raw_materials
    FOR ALL USING (
        tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
    )
    WITH CHECK (
        tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
        AND (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('manager', 'stok')
    );

DROP POLICY IF EXISTS rbac_products ON public.products;
CREATE POLICY rbac_products ON public.products
    FOR ALL USING (
        tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
    )
    WITH CHECK (
        tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
        AND (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('manager', 'stok')
    );

-- 3. Update 'handle_new_user' trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    v_new_tenant_id UUID := gen_random_uuid();
BEGIN
  -- Insert Profile
  INSERT INTO public.profiles (id, full_name, role, tenant_id)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'User'), 
    'manager', 
    v_new_tenant_id
  );

  -- Seed Chart of Accounts (COA) for the new tenant
  INSERT INTO public.accounts (tenant_id, code, name, type) VALUES
    (v_new_tenant_id, '1-1001', 'Kas Utama', 'aset'),
    (v_new_tenant_id, '1-2001', 'Persediaan Bahan Baku', 'aset'),
    (v_new_tenant_id, '4-1001', 'Pendapatan Penjualan', 'pendapatan'),
    (v_new_tenant_id, '5-1001', 'Beban HPP', 'beban');

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Update 'register_staff_profile' logic
CREATE OR REPLACE FUNCTION public.register_staff_profile(
    p_user_id UUID,
    p_full_name TEXT,
    p_role user_role
)
RETURNS VOID AS $$
DECLARE
    v_manager_tenant_id UUID;
    v_manager_role user_role;
BEGIN
    -- 1. Get Caller's Info
    SELECT tenant_id, role INTO v_manager_tenant_id, v_manager_role 
    FROM public.profiles WHERE id = auth.uid();

    -- 2. Security Check: Only Managers can register staff
    IF v_manager_role != 'manager' THEN
        RAISE EXCEPTION 'Unauthorized: Only managers can manage staff.';
    END IF;

    -- 3. Insert/Update Staff Profile with SAME tenant_id
    INSERT INTO public.profiles (id, full_name, role, tenant_id)
    VALUES (p_user_id, p_full_name, p_role, v_manager_tenant_id)
    ON CONFLICT (id) DO UPDATE 
    SET role = p_role, 
        full_name = p_full_name, 
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Fix Infinite Recursion in RLS Policies

-- 1. Create SECURITY DEFINER functions to bypass RLS when looking up user's tenant/role
-- Security Definer runs as the function creator (superuser) bypassing RLS and avoiding infinite loops.
CREATE OR REPLACE FUNCTION public.get_auth_tenant_id()
RETURNS UUID AS $$
    SELECT tenant_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS user_role AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- 2. Drop existing recursive policies
DROP POLICY IF EXISTS tenant_isolation_policy ON public.profiles;
DROP POLICY IF EXISTS tenant_isolation_accounts ON public.accounts;
DROP POLICY IF EXISTS tenant_isolation_raw_materials ON public.raw_materials;
DROP POLICY IF EXISTS tenant_isolation_products ON public.products;
DROP POLICY IF EXISTS tenant_isolation_recipes ON public.product_recipes;
DROP POLICY IF EXISTS tenant_isolation_journals ON public.journal_entries;
DROP POLICY IF EXISTS rbac_raw_materials ON public.raw_materials;
DROP POLICY IF EXISTS rbac_products ON public.products;

-- 3. Re-create policies using the safe functions

-- Profiles: Can read their own profiles, or anyone in the same tenant
CREATE POLICY tenant_isolation_policy ON public.profiles
    FOR ALL USING (
        id = auth.uid() 
        OR tenant_id = public.get_auth_tenant_id()
    );

-- Accounts
CREATE POLICY tenant_isolation_accounts ON public.accounts
    FOR ALL USING (tenant_id = public.get_auth_tenant_id());

-- Raw Materials
CREATE POLICY rbac_raw_materials ON public.raw_materials
    FOR ALL USING (
        tenant_id = public.get_auth_tenant_id()
    )
    WITH CHECK (
        tenant_id = public.get_auth_tenant_id()
        AND public.get_auth_role() IN ('manager', 'stok')
    );

-- Products
CREATE POLICY rbac_products ON public.products
    FOR ALL USING (
        tenant_id = public.get_auth_tenant_id()
    )
    WITH CHECK (
        tenant_id = public.get_auth_tenant_id()
        AND public.get_auth_role() IN ('manager', 'stok')
    );

-- Recipes
CREATE POLICY tenant_isolation_recipes ON public.product_recipes
    FOR ALL USING (tenant_id = public.get_auth_tenant_id());

-- Journals
CREATE POLICY tenant_isolation_journals ON public.journal_entries
    FOR ALL USING (tenant_id = public.get_auth_tenant_id());
-- HARDENED MULTI-TENANCY & TENANT NAMES

-- 1. Create the official Tenants table
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    account_type VARCHAR DEFAULT 'business',
    tier subscription_tier DEFAULT 'free',
    subscription_status VARCHAR DEFAULT 'active',
    subscription_end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add avatar_url to profiles for Profile Photo feature
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 3. Modify handle_new_user trigger to handle business names
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    v_new_tenant_id UUID;
    v_business_name TEXT;
    v_account_type TEXT;
    v_tier subscription_tier;
BEGIN
  -- Extract metadata
  v_business_name := COALESCE(new.raw_user_meta_data->>'business_name', 'Toko Baru');
  v_account_type := COALESCE(new.raw_user_meta_data->>'account_type', 'business');
  
  -- Map tier string to enum (default to 'free' if invalid or missing)
  BEGIN
    v_tier := (new.raw_user_meta_data->>'tier')::subscription_tier;
  EXCEPTION WHEN OTHERS THEN
    v_tier := 'free'::subscription_tier;
  END;

  -- 1. Create a new Tenant entry
  INSERT INTO public.tenants (name, account_type, tier, subscription_status)
  VALUES (v_business_name, v_account_type, v_tier, 'active')
  RETURNING id INTO v_new_tenant_id;

  -- 2. Insert Profile linked to that tenant
  INSERT INTO public.profiles (id, full_name, role, tenant_id)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'User'), 
    'manager', 
    v_new_tenant_id
  );

  -- 3. Seed Chart of Accounts (COA)
  -- Perbaikan: Sesuaikan seeding berdasarkan tipe akun
  IF v_account_type = 'personal' THEN
      INSERT INTO public.accounts (tenant_id, code, name, type) VALUES
        (v_new_tenant_id, '1-10000', 'Kas Tunai', 'aset'),
        (v_new_tenant_id, '1-10001', 'Rekening Bank Utama', 'aset'),
        (v_new_tenant_id, '4-40000', 'Gaji Pokok / Pendapatan', 'pendapatan'),
        (v_new_tenant_id, '6-60000', 'Beban Pengeluaran Umum', 'beban');
  ELSE
      INSERT INTO public.accounts (tenant_id, code, name, type) VALUES
        (v_new_tenant_id, '1-1001', 'Kas Utama', 'aset'),
        (v_new_tenant_id, '1-2001', 'Persediaan Barang', 'aset'),
        (v_new_tenant_id, '4-1001', 'Pendapatan Penjualan', 'pendapatan'),
        (v_new_tenant_id, '5-1001', 'Beban HPP', 'beban');
  END IF;

  -- 4. Insert Default Notification Configs
  INSERT INTO public.tenant_notification_configs (tenant_id, role)
  VALUES 
    (v_new_tenant_id, 'manager'),
    (v_new_tenant_id, 'kasir'),
    (v_new_tenant_id, 'stok');

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Set up Storage Bucket for Avatars (Notes: Must be created in dashboard too)
-- This SQL just ensures the public policy is there if the bucket exists.
-- Typically handled via Supabase Dashboard, but documenting here.
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Avatar images are publicly accessible" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'avatars' AND auth.uid() = (storage.foldername(name))[1]::uuid);
-- ACTIVITY LOGS FOR MANAGER MONITORING

-- 1. Create the Activity Logs table
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL, -- e.g. 'Membuat Produk', 'Menambah Stok', 'Penjualan'
    details JSONB, -- Storing extra data like product name, price, etc.
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- 3. Policy for Managers: Can view all logs in their tenant
CREATE POLICY "Managers can view all logs in their tenant" 
  ON public.activity_logs FOR SELECT 
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'manager' 
    AND 
    tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
  );

-- 4. Policy for Users: Can view their own logs
CREATE POLICY "Users can view their own logs" 
  ON public.activity_logs FOR SELECT 
  USING (auth.uid() = user_id);

-- 5. Policy for System/App: Can insert logs
-- We allow insertion if the user is part of the tenant
CREATE POLICY "Users can insert their own logs" 
  ON public.activity_logs FOR INSERT 
  WITH CHECK (
    tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
    AND
    auth.uid() = user_id
  );
-- EXTENDED TENANT INFO & ROLE-BASED NOTIFICATIONS

-- 1. Expand Tenants Table
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS npwp TEXT;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS website TEXT;

-- 2. Create Notification Configs Table
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

-- 3. Enable RLS
ALTER TABLE public.tenant_notification_configs ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- Managers can manage all configs for their tenant
CREATE POLICY "Managers can manage notification configs" 
  ON public.tenant_notification_configs FOR ALL 
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'manager' 
    AND 
    tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
  );

-- Users can only see their own role config
CREATE POLICY "Users can see their own notification config" 
  ON public.tenant_notification_configs FOR SELECT 
  USING (
    role = (SELECT role FROM public.profiles WHERE id = auth.uid())
    AND
    tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
  );

-- 5. Seed default configs for existing tenants
-- This is a one-time migration to ensure all roles have a config entry
INSERT INTO public.tenant_notification_configs (tenant_id, role)
SELECT t.id, r.role
FROM public.tenants t
CROSS JOIN (SELECT unnest(enum_range(NULL::user_role)) as role) r
ON CONFLICT DO NOTHING;
-- 1. Add barcode column to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS barcode TEXT UNIQUE;

-- 2. Create tenant_balances table for Escrow System
CREATE TABLE IF NOT EXISTS public.tenant_balances (
    tenant_id UUID PRIMARY KEY REFERENCES public.tenants(id) ON DELETE CASCADE,
    balance_amount NUMERIC DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for tenant_balances
ALTER TABLE public.tenant_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant can view own balance" 
ON public.tenant_balances FOR SELECT 
USING (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

-- 3. Create payout_requests table
CREATE TABLE IF NOT EXISTS public.payout_requests (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    bank_info TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for payout_requests
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant can view own payout requests" 
ON public.payout_requests FOR SELECT 
USING (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Tenant can create payout requests" 
ON public.payout_requests FOR INSERT 
WITH CHECK (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

-- Trigger to create balance record for new tenants
CREATE OR REPLACE FUNCTION public.handle_new_tenant_balance()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.tenant_balances (tenant_id, balance_amount)
    VALUES (NEW.id, 0);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_tenant_created_balance
    AFTER INSERT ON public.tenants
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_tenant_balance();

INSERT INTO public.tenant_balances (tenant_id, balance_amount)
SELECT id, 0 FROM public.tenants
ON CONFLICT (tenant_id) DO NOTHING;

-- Helper function for webhook to increment balance
CREATE OR REPLACE FUNCTION public.increment_tenant_balance(
    p_tenant_id UUID,
    p_amount NUMERIC
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.tenant_balances (tenant_id, balance_amount)
    VALUES (p_tenant_id, p_amount)
    ON CONFLICT (tenant_id) DO UPDATE
    SET balance_amount = public.tenant_balances.balance_amount + p_amount,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update create_product_with_recipe to support barcode
CREATE OR REPLACE FUNCTION public.create_product_with_recipe(
    p_name TEXT,
    p_selling_price NUMERIC,
    p_recipe JSONB DEFAULT '[]'::JSONB,
    p_barcode TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_tenant_id UUID;
    v_product_id UUID;
    v_recipe_item RECORD;
BEGIN
    -- Get current tenant
    SELECT tenant_id INTO v_tenant_id FROM public.profiles WHERE id = auth.uid();
    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    -- 1. Insert Product
    INSERT INTO public.products (tenant_id, name, selling_price, barcode)
    VALUES (v_tenant_id, p_name, p_selling_price, p_barcode)
    RETURNING id INTO v_product_id;

    -- 2. Insert Recipe Items
    FOR v_recipe_item IN SELECT * FROM jsonb_to_recordset(p_recipe) AS x(materialId UUID, quantity NUMERIC)
    LOOP
        INSERT INTO public.product_recipes (tenant_id, product_id, raw_material_id, quantity_needed)
        VALUES (v_tenant_id, v_product_id, v_recipe_item.materialId, v_recipe_item.quantity);
    END LOOP;

    RETURN v_product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Update update_product_with_recipe to support barcode
CREATE OR REPLACE FUNCTION public.update_product_with_recipe(
    p_product_id UUID,
    p_name TEXT,
    p_selling_price NUMERIC,
    p_recipe JSONB DEFAULT '[]'::JSONB,
    p_barcode TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    v_tenant_id UUID;
    v_recipe_item RECORD;
BEGIN
    -- Get current tenant
    SELECT tenant_id INTO v_tenant_id FROM public.profiles WHERE id = auth.uid();
    
    -- 1. Update Product
    UPDATE public.products 
    SET name = p_name, 
        selling_price = p_selling_price, 
        barcode = p_barcode,
        updated_at = NOW()
    WHERE id = p_product_id AND tenant_id = v_tenant_id;

    -- 2. Hard Sync Recipe (Delete old, Insert new)
    DELETE FROM public.product_recipes WHERE product_id = p_product_id AND tenant_id = v_tenant_id;

    FOR v_recipe_item IN SELECT * FROM jsonb_to_recordset(p_recipe) AS x(materialId UUID, quantity NUMERIC)
    LOOP
        INSERT INTO public.product_recipes (tenant_id, product_id, raw_material_id, quantity_needed)
        VALUES (v_tenant_id, p_product_id, v_recipe_item.materialId, v_recipe_item.quantity);
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Add is_superadmin column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_superadmin BOOLEAN DEFAULT false;

-- Enhance RLS policies to allow superadmin access
-- 1. Payout Requests
DROP POLICY IF EXISTS "Tenant can view own payout requests" ON public.payout_requests;
CREATE POLICY "Tenant or Superadmin can view payout requests" 
ON public.payout_requests FOR SELECT 
USING (
    tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()) OR 
    (SELECT is_superadmin FROM public.profiles WHERE id = auth.uid()) = true
);

-- 2. Tenant Balances
DROP POLICY IF EXISTS "Tenant can view own balance" ON public.tenant_balances;
CREATE POLICY "Tenant or Superadmin can view balance" 
ON public.tenant_balances FOR SELECT 
USING (
    tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()) OR 
    (SELECT is_superadmin FROM public.profiles WHERE id = auth.uid()) = true
);

-- 3. Tenants table
-- Usually tenants is viewable strictly by own tenant, but superadmin needs to see all.
-- Check if a policy exists
DROP POLICY IF EXISTS "Users can view own tenant data" ON public.tenants;
CREATE POLICY "Users or Superadmin can view tenant data"
ON public.tenants FOR SELECT
USING (
    id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()) OR 
    (SELECT is_superadmin FROM public.profiles WHERE id = auth.uid()) = true
);


-- Function to explicitly approve a payout request
CREATE OR REPLACE FUNCTION public.approve_payout(p_payout_id UUID)
RETURNS VOID AS $$
DECLARE
    v_is_superadmin BOOLEAN;
    v_tenant_id UUID;
    v_amount NUMERIC;
    v_status TEXT;
BEGIN
    SELECT is_superadmin INTO v_is_superadmin FROM public.profiles WHERE id = auth.uid();
    IF NOT v_is_superadmin THEN
        RAISE EXCEPTION 'Unauthorized: Only Superadmin can approve payouts.';
    END IF;

    SELECT tenant_id, amount, status INTO v_tenant_id, v_amount, v_status 
    FROM public.payout_requests WHERE id = p_payout_id;

    IF v_status != 'pending' THEN
        RAISE EXCEPTION 'Payout is not pending.';
    END IF;

    -- Update payout status
    UPDATE public.payout_requests SET status = 'success', updated_at = NOW() WHERE id = p_payout_id;

    -- Decrement balance
    UPDATE public.tenant_balances 
    SET balance_amount = balance_amount - v_amount, updated_at = NOW()
    WHERE tenant_id = v_tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Function to explicitly reject a payout request
CREATE OR REPLACE FUNCTION public.reject_payout(p_payout_id UUID)
RETURNS VOID AS $$
DECLARE
    v_is_superadmin BOOLEAN;
    v_status TEXT;
BEGIN
    SELECT is_superadmin INTO v_is_superadmin FROM public.profiles WHERE id = auth.uid();
    IF NOT v_is_superadmin THEN
        RAISE EXCEPTION 'Unauthorized: Only Superadmin can reject payouts.';
    END IF;

    SELECT status INTO v_status FROM public.payout_requests WHERE id = p_payout_id;
    IF v_status != 'pending' THEN
        RAISE EXCEPTION 'Payout is not pending.';
    END IF;

    -- Update payout status
    UPDATE public.payout_requests SET status = 'failed', updated_at = NOW() WHERE id = p_payout_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- ASSETS AND BILLS MANAGEMENT

-- 1. Assets Table
CREATE TABLE IF NOT EXISTS public.assets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    purchase_price NUMERIC(15, 2) NOT NULL DEFAULT 0,
    current_value NUMERIC(15, 2) NOT NULL DEFAULT 0,
    purchase_date DATE DEFAULT CURRENT_DATE,
    location TEXT,
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Bills Table (Hutang / Piutang)
CREATE TABLE IF NOT EXISTS public.bills (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    due_date DATE,
    type TEXT NOT NULL CHECK (type IN ('hutang', 'piutang')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
    photo_url TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
CREATE POLICY "Tenant isolation for assets" ON public.assets
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Tenant isolation for bills" ON public.bills
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

-- 5. Storage policies for inventory documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('inventory-docs', 'inventory-docs', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access for inventory docs" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'inventory-docs');

CREATE POLICY "Users can upload inventory docs" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'inventory-docs' AND auth.role() = 'authenticated');
-- 1. Create Enums
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'business_type') THEN
        CREATE TYPE business_type AS ENUM ('retail', 'jasa', 'manufaktur');
    END IF;
END $$;

-- 2. Create Tables
CREATE TABLE IF NOT EXISTS public.entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.business_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,
    business_type business_type NOT NULL,
    tax_mode BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE public.entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- Use placeholder policies that will work once profiles are updated
CREATE POLICY entity_isolation_policy ON public.entities
    FOR ALL USING (id IN (SELECT entity_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY branch_isolation_policy ON public.branches
    FOR ALL USING (entity_id IN (SELECT entity_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY business_profile_isolation_policy ON public.business_profiles
    FOR ALL USING (entity_id IN (SELECT entity_id FROM public.profiles WHERE id = auth.uid()));
-- 1. Create Enums
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_balance_type') THEN
        CREATE TYPE account_balance_type AS ENUM ('debit', 'credit');
    END IF;
END $$;

-- 2. Update accounts table
ALTER TABLE public.accounts 
ADD COLUMN IF NOT EXISTS entity_id UUID REFERENCES public.entities(id),
ADD COLUMN IF NOT EXISTS normal_balance account_balance_type;

-- 3. Update journal_entries table
ALTER TABLE public.journal_entries
ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES public.branches(id),
ADD COLUMN IF NOT EXISTS entity_id UUID REFERENCES public.entities(id),
ADD COLUMN IF NOT EXISTS is_draft BOOLEAN DEFAULT false;

-- 4. Update profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS entity_id UUID REFERENCES public.entities(id);
-- 1. Create Enums
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type_enum') THEN
        CREATE TYPE transaction_type_enum AS ENUM ('sales', 'expense', 'payout', 'adjustment');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'draft_status_enum') THEN
        CREATE TYPE draft_status_enum AS ENUM ('pending', 'approved', 'rejected');
    END IF;
END $$;

-- 2. Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,
    reference_number TEXT NOT NULL,
    transaction_type transaction_type_enum NOT NULL,
    idempotency_key UUID UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- 3. Create journal_lines table
CREATE TABLE IF NOT EXISTS public.journal_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES public.accounts(id),
    debit NUMERIC DEFAULT 0,
    credit NUMERIC DEFAULT 0,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create drafts table
CREATE TABLE IF NOT EXISTS public.drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,
    source TEXT NOT NULL,
    payload JSONB NOT NULL,
    status draft_status_enum DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    entity_affected TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies
CREATE POLICY transaction_isolation_policy ON public.transactions
    FOR ALL USING (tenant_id IN (SELECT entity_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY journal_line_isolation_policy ON public.journal_lines
    FOR ALL USING (transaction_id IN (SELECT id FROM public.transactions WHERE tenant_id IN (SELECT entity_id FROM public.profiles WHERE id = auth.uid())));

CREATE POLICY draft_isolation_policy ON public.drafts
    FOR ALL USING (tenant_id IN (SELECT entity_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY audit_log_isolation_policy ON public.audit_logs
    FOR ALL USING (user_id = auth.uid());
CREATE OR REPLACE FUNCTION create_transaction_v1(
    p_tenant_id UUID,
    p_reference_number TEXT,
    p_transaction_type transaction_type_enum,
    p_idempotency_key UUID,
    p_created_by UUID,
    p_lines JSONB
) RETURNS UUID AS $$
DECLARE
    v_transaction_id UUID;
    v_line JSONB;
BEGIN
    -- 1. Insert Transaction Header
    INSERT INTO public.transactions (
        tenant_id,
        reference_number,
        transaction_type,
        idempotency_key,
        created_by
    ) VALUES (
        p_tenant_id,
        p_reference_number,
        p_transaction_type,
        p_idempotency_key,
        p_created_by
    ) RETURNING id INTO v_transaction_id;

    -- 2. Insert Journal Lines
    FOR v_line IN SELECT * FROM jsonb_array_elements(p_lines)
    LOOP
        INSERT INTO public.journal_lines (
            transaction_id,
            account_id,
            debit,
            credit,
            description
        ) VALUES (
            v_transaction_id,
            (v_line->>'account_id')::UUID,
            (v_line->>'debit')::NUMERIC,
            (v_line->>'credit')::NUMERIC,
            (v_line->>'description')::TEXT
        );
    END LOOP;

    RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Migration: Create Event Store and Hardening Tables
-- Date: 2026-04-28

-- 1. Event Log Table (Source of Truth) - Partitioned by Month
CREATE TABLE event_log (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES profiles(tenant_id),
  trace_id VARCHAR(255) NOT NULL,
  idempotency_key VARCHAR(255) NOT NULL, -- Event Reliability
  event_type VARCHAR(100) NOT NULL,
  sequence_number BIGINT NOT NULL, -- Event Ordering System
  version INT NOT NULL DEFAULT 1, -- Event Versioning System
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id, created_at),
  UNIQUE(tenant_id, sequence_number, version, created_at)
) PARTITION BY RANGE (created_at);

-- Initial Partition for 2026-04
CREATE TABLE event_log_y2026m04 PARTITION OF event_log
    FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');

CREATE INDEX idx_event_log_tenant_type ON event_log(tenant_id, event_type);

-- 2. Processed Events (Exactly-Once Processing Layer)
CREATE TABLE processed_events (
  event_id UUID PRIMARY KEY REFERENCES event_log(id),
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  worker_id VARCHAR(100) NOT NULL
);

-- 3. Global Settings (Failover Mode Policy)
CREATE TABLE global_settings (
  id SERIAL PRIMARY KEY,
  system_mode TEXT CHECK (system_mode IN ('NORMAL', 'DEGRADED', 'READ_ONLY', 'EMERGENCY')) DEFAULT 'NORMAL',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed initial setting
INSERT INTO global_settings (system_mode) VALUES ('NORMAL');

-- 4. AI Feedbacks (AI Decision Trace & Self-Correction)
CREATE TABLE ai_feedbacks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES profiles(tenant_id),
  prompt_version VARCHAR(50), -- 'v1.0-sales'
  original_prompt TEXT,
  ai_reasoning TEXT, -- AI Decision Trace
  executed_command JSONB,
  correction_type VARCHAR(50), -- 'UNDO', 'MANUAL_EDIT'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. DLQ Events (For failed background processing)
CREATE TABLE dlq_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES event_log(id),
  error_message TEXT,
  stack_trace TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. AI Safe Mode (Adding configuration to profiles)
ALTER TABLE profiles 
ADD COLUMN ai_operation_mode TEXT CHECK (ai_operation_mode IN ('NORMAL', 'SAFE', 'LOCKED')) DEFAULT 'NORMAL';

-- 7. Transaction State Machine Status
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_status_fsm') THEN
        CREATE TYPE transaction_status_fsm AS ENUM ('INIT', 'VALIDATING', 'PROCESSING', 'COMMITTED', 'FAILED', 'REVERSED');
    END IF;
END $$;

ALTER TABLE transactions 
ADD COLUMN status transaction_status_fsm DEFAULT 'INIT';

-- 8. Monthly Ledger Snapshots (Scaling Strategy)
CREATE TABLE ledger_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES profiles(tenant_id),
  account_id UUID NOT NULL,
  month INT NOT NULL,
  year INT NOT NULL,
  ending_balance NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, account_id, month, year)
);
ALTER TABLE profiles 
ADD COLUMN industry VARCHAR(100),
ADD COLUMN business_scale VARCHAR(50),
ADD COLUMN financial_complexity VARCHAR(50),
ADD COLUMN enabled_modules JSONB DEFAULT '[]'::jsonb,
ADD COLUMN accounting_assumptions JSONB DEFAULT '[]'::jsonb;
