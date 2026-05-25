-- Migration 011: Fix journal_lines FK to journal_entries
-- A4 from prompt.md
-- Note: This migration is a no-op if journal_entry_id column doesn't exist yet.
-- Migration 013 adds the missing columns first.
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
