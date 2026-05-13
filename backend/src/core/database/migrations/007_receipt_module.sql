-- Migration 007: OCR + AI Receipt Module
-- Creates: receipt_scans, draft_transactions, merchant_mappings
-- ADR-007: OCR + AI-Assisted Transaction Entry
-- All tables are tenant-scoped with RLS

-- =====================================================
-- 1. receipt_scans — Image upload + raw OCR output
-- =====================================================
CREATE TABLE IF NOT EXISTS receipt_scans (
    id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    uploaded_by         UUID NOT NULL REFERENCES profiles(id),
    image_url           TEXT NOT NULL,
    status              TEXT NOT NULL DEFAULT 'processing'
                        CHECK (status IN ('processing', 'completed', 'failed')),
    raw_ocr_text        TEXT,
    extracted_data      JSONB,
    ai_model_used       TEXT DEFAULT 'gemini-2.0-flash',
    processing_time_ms  INTEGER,
    error_message       TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_receipt_scans_tenant
    ON receipt_scans(tenant_id, created_at DESC);

ALTER TABLE receipt_scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY receipt_scans_tenant_isolation ON receipt_scans
    FOR ALL USING (tenant_id = get_auth_tenant_id());

-- =====================================================
-- 2. draft_transactions — AI-generated, pending review
-- =====================================================
CREATE TABLE IF NOT EXISTS draft_transactions (
    id                          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id                   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    receipt_scan_id             UUID REFERENCES receipt_scans(id) ON DELETE SET NULL,
    created_by                  UUID NOT NULL REFERENCES profiles(id),
    status                      TEXT NOT NULL DEFAULT 'ready'
                                CHECK (status IN ('processing', 'ready', 'approved', 'rejected', 'expired')),

    -- Extracted / user-editable fields
    merchant_name               TEXT,
    transaction_date            TIMESTAMPTZ,
    total_amount                NUMERIC(15,2),
    subtotal                    NUMERIC(15,2),
    tax_amount                  NUMERIC(15,2),
    discount_amount             NUMERIC(15,2) DEFAULT 0,
    currency                    TEXT DEFAULT 'IDR',
    payment_method              TEXT,
    receipt_number              TEXT,
    category                    TEXT,
    notes                       TEXT,
    tags                        TEXT[],

    -- AI recommendation metadata
    ai_recommendations          JSONB NOT NULL DEFAULT '{}',

    -- Account mapping (required before approval)
    debit_account_id            UUID REFERENCES chart_of_accounts(id),
    credit_account_id           UUID REFERENCES chart_of_accounts(id),

    -- Line items snapshot
    line_items                  JSONB DEFAULT '[]',

    -- User corrections tracking (for learning)
    user_corrections            JSONB DEFAULT '{}',

    -- Approval metadata
    approved_at                 TIMESTAMPTZ,
    approved_by                 UUID REFERENCES profiles(id),
    resulting_transaction_id    UUID REFERENCES transactions(id),
    resulting_journal_id        UUID REFERENCES journal_entries(id),

    -- Rejection metadata
    rejected_at                 TIMESTAMPTZ,
    rejection_reason            TEXT,

    expires_at                  TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
    created_at                  TIMESTAMPTZ DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_draft_transactions_tenant
    ON draft_transactions(tenant_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_draft_transactions_ready
    ON draft_transactions(status) WHERE status = 'ready';

ALTER TABLE draft_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY draft_transactions_tenant_isolation ON draft_transactions
    FOR ALL USING (tenant_id = get_auth_tenant_id());

-- =====================================================
-- 3. merchant_mappings — Rule-based merchant learning
-- =====================================================
CREATE TABLE IF NOT EXISTS merchant_mappings (
    id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    merchant_name       TEXT NOT NULL,
    merchant_alias      TEXT[],
    default_category    TEXT,
    default_account_id  UUID REFERENCES chart_of_accounts(id),
    default_tags        TEXT[],
    approval_count      INTEGER DEFAULT 0,
    last_used_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, merchant_name)
);

CREATE INDEX IF NOT EXISTS idx_merchant_mappings_tenant
    ON merchant_mappings(tenant_id);

ALTER TABLE merchant_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY merchant_mappings_tenant_isolation ON merchant_mappings
    FOR ALL USING (tenant_id = get_auth_tenant_id());
