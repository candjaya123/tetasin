require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
async function promote() {
  const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data, error } = await admin.from('tenants').update({ tier: 'pro' }).eq('tier', 'free');
  console.log('Promoted tenants:', error || 'Success');
}
promote().catch(console.error);