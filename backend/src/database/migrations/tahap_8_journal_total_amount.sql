-- Migration: Add total_amount to journal_entries
-- This column is used for summary views and was missing in previous migrations.

ALTER TABLE public.journal_entries ADD COLUMN IF NOT EXISTS total_amount DECIMAL(15,2) DEFAULT 0;

-- Update existing records if any
UPDATE public.journal_entries e
SET total_amount = (
    SELECT COALESCE(SUM(l.debit), 0)
    FROM public.journal_lines l
    WHERE l.entry_id = e.id
)
WHERE total_amount = 0 OR total_amount IS NULL;
