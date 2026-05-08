-- 1. Drop existing standard views or materialized views
DROP VIEW IF EXISTS ledger_balances CASCADE;
DROP VIEW IF EXISTS monthly_profit_loss CASCADE;

DROP MATERIALIZED VIEW IF EXISTS ledger_balances CASCADE;
DROP MATERIALIZED VIEW IF EXISTS monthly_profit_loss CASCADE;

-- 2. Create Materialized View for Ledger Balances
CREATE MATERIALIZED VIEW ledger_balances AS
SELECT 
    l.account_id,
    a.tenant_id,
    a.code,
    a.name,
    a.type,
    SUM(l.debit) as total_debit,
    SUM(l.credit) as total_credit,
    CASE 
        WHEN a.normal_balance = 'debit' THEN SUM(l.debit) - SUM(l.credit)
        ELSE SUM(l.credit) - SUM(l.debit)
    END as current_balance
FROM journal_lines l
JOIN chart_of_accounts a ON l.account_id = a.id
GROUP BY l.account_id, a.tenant_id, a.code, a.name, a.type, a.normal_balance;

-- Create index for performance
CREATE UNIQUE INDEX idx_ledger_balances_account_id ON ledger_balances (account_id);

-- 3. Create Materialized View for Profit & Loss
CREATE MATERIALIZED VIEW monthly_profit_loss AS
SELECT 
    e.tenant_id,
    EXTRACT(YEAR FROM date) as year,
    EXTRACT(MONTH FROM date) as month,
    SUM(CASE WHEN a.type = 'revenue' THEN l.credit - l.debit ELSE 0 END) as total_revenue,
    SUM(CASE WHEN a.type = 'expense' THEN l.debit - l.credit ELSE 0 END) as total_expense,
    SUM(CASE WHEN a.type = 'revenue' THEN l.credit - l.debit ELSE 0 END) - 
    SUM(CASE WHEN a.type = 'expense' THEN l.debit - l.credit ELSE 0 END) as net_profit
FROM journal_entries e
JOIN journal_lines l ON e.id = l.entry_id
JOIN chart_of_accounts a ON l.account_id = a.id
GROUP BY e.tenant_id, year, month;

-- 4. Function to refresh analytics
CREATE OR REPLACE FUNCTION refresh_ledger_analytics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY ledger_balances;
  REFRESH MATERIALIZED VIEW monthly_profit_loss;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
