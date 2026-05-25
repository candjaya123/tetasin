require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const client = new Client({ connectionString: process.env.DATABASE_URL });
async function run() {
  await client.connect();
  const sub = 'ce49b73d-fab5-4cd7-b4d8-58aad1a8f6e3'; // the user's UUID
  const profile = await client.query("SELECT * FROM public.profiles WHERE id = ", [sub]);
  console.log("Profile count:", profile.rows.length);
  if (profile.rows.length > 0) {
    console.log("Tenant ID:", profile.rows[0].tenant_id);
    const tenant = await client.query("SELECT * FROM public.tenants WHERE id = ", [profile.rows[0].tenant_id]);
    console.log("Tenant:", tenant.rows[0]);
  } else {
    console.log("Profile is completely missing. Trigger definitely failed.");
    // Check if the user exists in auth.users
    const user = await client.query("SELECT * FROM auth.users WHERE id = ", [sub]);
    console.log("Auth user count:", user.rows.length);
  }
  await client.end();
}
run().catch(console.error);