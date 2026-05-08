const { Client } = require('pg');
require('dotenv').config();

async function reloadSchema() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  try {
    await client.connect();
    console.log('Reloading PostgREST schema cache...');
    await client.query("NOTIFY pgrst, 'reload schema'");
    console.log('Reload signal sent successfully.');
  } catch (err) {
    console.error('Error reloading schema:', err);
  } finally {
    await client.end();
  }
}

reloadSchema();
