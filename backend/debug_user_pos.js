const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkUser(userId) {
  console.log('Checking User:', userId);
  const { data: profile, error: pError } = await supabase.from('profiles').select('*').eq('id', userId).single();
  console.log('Profile:', profile);
  if (pError) console.error('Profile Error:', pError);

  if (profile && profile.tenant_id) {
    console.log('Checking Tenant:', profile.tenant_id);
    const { data: tenant, error: tError } = await supabase.from('tenants').select('*').eq('id', profile.tenant_id).single();
    console.log('Tenant:', tenant);
    if (tError) console.error('Tenant Error:', tError);
  } else {
    console.log('No tenant_id in profile');
  }
}

checkUser('aaefbabb-79b1-4146-9582-1f66303693d7');
