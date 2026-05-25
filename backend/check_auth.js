require('dotenv').config();
const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });
async function checkAuth() {
  await client.connect();
  const sub = 'ce49b73d-fab5-4cd7-b4d8-58aad1a8f6e3'; // From JWT
  const profile = await client.query("SELECT * FROM public.profiles WHERE id = '" + sub + "'");
  console.log('User in public.profiles:', profile.rows.length);
  if (profile.rows.length > 0) {
    console.log('Profile:', profile.rows[0]);
    const tenant = await client.query("SELECT * FROM public.tenants WHERE id = '" + profile.rows[0].tenant_id + "'");
    console.log('User in public.tenants:', tenant.rows.length);
  }
  await client.end();
}
checkAuth().catch(console.error);