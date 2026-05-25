-- Migration 013: Add missing columns to journal_lines
-- Fixes: journal_entry_id, tenant_id, FK constraint, and RLS

-- 1. Add journal_entry_id column if not present
ALTER TABLE journal_lines ADD COLUMN IF NOT EXISTS journal_entry_id UUID;

-- 2. Add tenant_id column if not present (nullable first for data migration)
ALTER TABLE journal_lines ADD COLUMN IF NOT EXISTS tenant_id UUID;

-- 3. Add FK constraint from journal_entry_id to journal_entries
-- Use a DO block to avoid error if column is still missing
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'journal_lines' AND column_name = 'journal_entry_id'
    ) THEN
        ALTER TABLE journal_lines
            ADD CONSTRAINT IF NOT EXISTS fk_journal_lines_entry
            FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 4. Enable RLS on journal_lines if not already enabled
ALTER TABLE journal_lines ENABLE ROW LEVEL SECURITY;
