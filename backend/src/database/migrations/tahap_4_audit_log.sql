-- =============================================================
-- 🚀 MIGRASI TAHAP 4: AUDIT LOG & ENTERPRISE SECURITY
-- =============================================================

-- 1. TASK 6.1: Pembuatan Tabel Audit Log
DROP TABLE IF EXISTS audit_logs CASCADE;

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
