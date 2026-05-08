const { Client } = require('pg');
require('dotenv').config();

async function createBudgetsTable() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  try {
    await client.connect();
    console.log('Creating budgets table...');
    
    const query = `
      CREATE TABLE IF NOT EXISTS budgets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        account_id UUID REFERENCES chart_of_accounts(id) ON DELETE CASCADE,
        limit_amount NUMERIC NOT NULL,
        period_month VARCHAR(7) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(tenant_id, account_id, period_month)
      );

      -- Add account_type to tenants and profiles if not exists (insurance)
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tenants' AND column_name='account_type') THEN
          ALTER TABLE tenants ADD COLUMN account_type VARCHAR(20) DEFAULT 'business';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='account_type') THEN
          ALTER TABLE profiles ADD COLUMN account_type VARCHAR(20) DEFAULT 'business';
        END IF;
      END $$;
    `;

    await client.query(query);
    console.log('Table created successfully.');
    
    // Reload schema cache
    await client.query("NOTIFY pgrst, 'reload schema'");
    console.log('PostgREST schema cache reloaded.');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

createBudgetsTable();
