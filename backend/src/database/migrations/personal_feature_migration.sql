-- 🚀 MIGRASI: Personal Money Planner & Account Type Support

-- 1. Tambah kolom account_type ke tabel tenants
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS account_type VARCHAR DEFAULT 'business';

-- 2. Update handle_new_user trigger untuk mendukung account_type dan tier saat registrasi
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    v_new_tenant_id UUID;
    v_business_name TEXT;
    v_account_type TEXT;
    v_tier subscription_tier;
BEGIN
  -- Extract metadata
  v_account_type := COALESCE(new.raw_user_meta_data->>'account_type', 'business');
  
  -- Jika personal, paksa nama bisnis jadi 'Personal Workspace'
  IF v_account_type = 'personal' THEN
    v_business_name := 'Personal Workspace';
  ELSE
    v_business_name := COALESCE(new.raw_user_meta_data->>'business_name', 'Toko Baru');
  END IF;
  
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
    CASE WHEN v_account_type = 'personal' THEN 'personal' ELSE 'manager' END, 
    v_new_tenant_id
  );

  -- 3. Seed Chart of Accounts (COA)
  -- Jika personal, kita tetap gunakan COA standar tapi mungkin di UI saja yang dibedakan
  INSERT INTO public.accounts (tenant_id, code, name, type) VALUES
    (v_new_tenant_id, '1-1001', 'Kas Utama', 'aset'),
    (v_new_tenant_id, '1-2001', 'Persediaan Barang', 'aset'),
    (v_new_tenant_id, '4-1001', 'Pendapatan', 'pendapatan'),
    (v_new_tenant_id, '5-1001', 'Beban Pengeluaran', 'beban');

  -- 4. Insert Default Notification Configs
  INSERT INTO public.tenant_notification_configs (tenant_id, role)
  VALUES 
    (v_new_tenant_id, 'manager'),
    (v_new_tenant_id, 'kasir'),
    (v_new_tenant_id, 'stok');

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
