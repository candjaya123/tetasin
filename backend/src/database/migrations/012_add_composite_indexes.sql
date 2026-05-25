-- Migration 012: Add missing composite indexes
-- A5 from prompt.md

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_tenant_date
    ON transactions(tenant_id, transaction_date DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_journal_entries_tenant_date
    ON journal_entries(tenant_id, transaction_date DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_journal_lines_entry_account
    ON journal_lines(entry_id, account_id);

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'tenant_id') THEN
        CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_created
            ON audit_logs(tenant_id, created_at DESC);
    END IF;
END $$;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_tenant_role
    ON profiles(tenant_id, role);
