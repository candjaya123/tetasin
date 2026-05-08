const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkColumns() {
  const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'tenants' });
  // If RPC doesn't exist, we can try a simple select
  const { data: sample, error: sError } = await supabase.from('tenants').select('*').limit(1);
  console.log('Sample Tenant:', sample);
  if (sError) console.error('Error:', sError);
}

checkColumns();
