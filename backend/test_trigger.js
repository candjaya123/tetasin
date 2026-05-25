require('dotenv').config();
const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });
async function simulateTrigger() {
  await client.connect();
  try {
    await client.query("BEGIN;");
    await client.query(
      DO 
      DECLARE 
        v_tid UUID; 
        v_name TEXT := 'Test Biz'; 
        v_type TEXT := 'business';
        v_id UUID := gen_random_uuid();
      BEGIN
        INSERT INTO tenants (name, account_type) VALUES (v_name, v_type) RETURNING id INTO v_tid;
        -- Insert into profiles but bypass auth.users foreign key just for this test
        -- Wait, the foreign key to auth.users will fail if I generate a random UUID!
        -- So let's create a fake auth user first
        INSERT INTO auth.users (id, email) VALUES (v_id, 'fake@test.com');
        
        INSERT INTO profiles (id, full_name, role, tenant_id, account_type) VALUES (v_id, 'Test User', 'manager', v_tid, v_type);
        
        IF v_type = 'personal' THEN
          INSERT INTO chart_of_accounts (tenant_id, code, name, type) VALUES 
          (v_tid,'1-10000','Kas Tunai','aset'),(v_tid,'1-10001','Rekening Bank','aset'),(v_tid,'4-40000','Gaji/Pendapatan','pendapatan'),(v_tid,'6-60000','Beban Pengeluaran','beban');
        ELSE
          INSERT INTO chart_of_accounts (tenant_id, code, name, type) VALUES 
          (v_tid,'1-1001','Kas Utama','aset'),(v_tid,'1-2001','Persediaan Barang','aset'),(v_tid,'4-1001','Pendapatan Penjualan','pendapatan'),(v_tid,'5-1001','Beban HPP','beban');
        END IF;
        
        INSERT INTO tenant_notification_configs (tenant_id, role) VALUES (v_tid,'manager'),(v_tid,'kasir'),(v_tid,'stok') ON CONFLICT (tenant_id, role) DO NOTHING;
        INSERT INTO tenant_balances (tenant_id, balance_amount) VALUES (v_tid, 0) ON CONFLICT (tenant_id) DO NOTHING;
        INSERT INTO entities (tenant_id, name) VALUES (v_tid, v_name) ON CONFLICT DO NOTHING;
      END ;
    );
    console.log('Trigger logic succeeded!');
    await client.query("ROLLBACK;");
  } catch (err) {
    console.error('Trigger logic failed:', err.message);
    await client.query("ROLLBACK;");
  } finally {
    await client.end();
  }
}
simulateTrigger();