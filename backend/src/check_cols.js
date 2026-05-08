const { Client } = require('pg');
require('dotenv').config();

async function checkColumns() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres'
  });
  try {
    await client.connect();
    const res = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'products'");
    console.log('Columns in products table:');
    console.log(res.rows.map(r => r.column_name));
  } catch (err) {
    console.error('Error connecting to DB:', err);
  } finally {
    await client.end();
  }
}

checkColumns();
