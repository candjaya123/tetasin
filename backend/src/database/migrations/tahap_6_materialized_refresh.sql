-- 1. Drop existing standard views or materialized views
DROP VIEW IF EXISTS ledger_balances CASCADE;
DROP VIEW IF EXISTS monthly_profit_loss CASCADE;

DROP MATERIALIZED VIEW IF EXISTS ledger_balances CASCADE;
DROP MATERIALIZED VIEW IF EXISTS monthly_profit_loss CASCADE;

-- 2. Create Materialized View for Ledger Balances
CREATE MATERIALIZED VIEW ledger_balances AS
SELECT 
    l.tenant_id,
    l.account_id,
    a.code,
    a.name,
    a.type,
    a.normal_balance,
    SUM(l.debit) as total_debit,
    SUM(l.credit) as total_credit,
    CASE 
        WHEN a.normal_balance = 'debit' THEN SUM(l.debit) - SUM(l.credit)
        ELSE SUM(l.credit) - SUM(l.debit)
    END as current_balance
FROM journal_lines l
JOIN chart_of_accounts a ON l.account_id = a.id
JOIN journal_entries je ON l.journal_entry_id = je.id
WHERE je.status = 'posted'
GROUP BY l.tenant_id, l.account_id, a.code, a.name, a.type, a.normal_balance;

-- Create index for performance
CREATE UNIQUE INDEX idx_ledger_balances_unique ON ledger_balances (tenant_id, account_id);

-- 3. Create Materialized View for Profit & Loss
CREATE MATERIALIZED VIEW monthly_profit_loss AS
SELECT 
    jl.tenant_id,
    DATE_TRUNC('month', je.transaction_date) as month,
    SUM(CASE WHEN coa.type = 'pendapatan' THEN jl.credit ELSE 0 END) as total_revenue,
    SUM(CASE WHEN coa.type = 'beban' THEN jl.debit ELSE 0 END) as total_expense,
    SUM(CASE WHEN coa.type = 'pendapatan' THEN jl.credit - jl.debit ELSE 0 END) - 
    SUM(CASE WHEN coa.type = 'beban' THEN jl.debit - jl.credit ELSE 0 END) as net_profit
FROM journal_lines jl
JOIN chart_of_accounts coa ON jl.account_id = coa.id
JOIN journal_entries je ON jl.journal_entry_id = je.id
WHERE je.status = 'posted'
GROUP BY jl.tenant_id, DATE_TRUNC('month', je.transaction_date);

-- 4. Function to refresh analytics
CREATE OR REPLACE FUNCTION refresh_ledger_analytics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY ledger_balances;
  REFRESH MATERIALIZED VIEW monthly_profit_loss;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
