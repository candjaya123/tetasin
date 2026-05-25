require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
async function test() {
  const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data: users } = await admin.auth.admin.listUsers();
  const latestUser = users.users.sort((a,b) => new Date(b.created_at) - new Date(a.created_at))[0];
  console.log('Latest User:', latestUser.email, latestUser.id);
  
  const { data: profile } = await admin.from('profiles').select('*').eq('id', latestUser.id).single();
  console.log('Profile:', profile);
  
  if (profile) {
    const { data: tenant } = await admin.from('tenants').select('*').eq('id', profile.tenant_id).single();
    console.log('Tenant:', tenant);
  }
}
test().catch(console.error);