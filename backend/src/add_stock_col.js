const { Client } = require('pg');
require('dotenv').config();

async function addStockColumn() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  try {
    await client.connect();
    console.log('Adding stock column to products table...');
    await client.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0");
    console.log('Stock column added successfully.');
  } catch (err) {
    console.error('Error adding column:', err);
  } finally {
    await client.end();
  }
}

addStockColumn();
