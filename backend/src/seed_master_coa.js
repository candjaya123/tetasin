require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedMasterCOA() {
  console.log('Connecting to Supabase...');
  
  // 1. Create table if not exists using SQL via RPC or just assume it needs creating.
  // We can't directly execute DDL via standard JS client easily without RPC.
  // Wait, the user might not have a master_chart_of_accounts table yet. 
  // Let's create an RPC or execute raw SQL. The best way is to use the `pg` package to connect directly using DATABASE_URL.
  
  const { Client } = require('pg');
  const dbClient = new Client({
    connectionString: process.env.DATABASE_URL
  });
  
  try {
    await dbClient.connect();
    console.log('Connected to PostgreSQL database directly.');

    // 1. Create the table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS master_chart_of_accounts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        normal_balance VARCHAR(10) NOT NULL,
        category_raw VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
        UNIQUE(code)
      );
    `;
    await dbClient.query(createTableQuery);
    console.log('Table master_chart_of_accounts created or verified.');
    
    // Clear existing to prevent duplicates if running multiple times
    await dbClient.query('TRUNCATE TABLE master_chart_of_accounts;');
    console.log('Cleared existing rows.');

    // 2. Read CSV
    const csvPath = '../../akun.csv'; // from backend/src -> e:/tumbuhin/akun.csv
    const fullPath = path.resolve(__dirname, csvPath);
    console.log(`Reading CSV from: ${fullPath}`);
    
    if (!fs.existsSync(fullPath)) {
      throw new Error(`File not found: ${fullPath}`);
    }

    const fileContent = fs.readFileSync(fullPath, 'utf8');
    const lines = fileContent.split('\n');
    const accountsToInsert = [];

    for (let i = 3; i < lines.length; i++) { // Skip header lines
      const line = lines[i].trim();
      if (!line) continue;
      
      const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      if (parts.length < 6) continue;
      
      const code = parts[2]?.trim();
      const name = parts[3]?.trim().replace(/"/g, '');
      let normalBalance = parts[4]?.trim().toLowerCase().includes('kredit') ? 'credit' : 'debit';
      const categoryRaw = parts[5]?.trim().toUpperCase();
      
      if (!code || !name || !categoryRaw) continue;

      let type = 'asset';
      if (categoryRaw.includes('ASET')) type = 'asset';
      else if (categoryRaw.includes('KEWAJIBAN')) type = 'liability';
      else if (categoryRaw.includes('EKUITAS')) type = 'equity';
      else if (categoryRaw.includes('PENDAPATAN')) type = 'revenue';
      else if (categoryRaw.includes('BEBAN') || categoryRaw.includes('HPP')) type = 'expense';

      accountsToInsert.push({ code, name, type, normalBalance, categoryRaw });
    }

    console.log(`Found ${accountsToInsert.length} accounts to insert.`);

    // 3. Insert using parameterized queries
    let inserted = 0;
    for (const acc of accountsToInsert) {
      const insertQuery = `
        INSERT INTO master_chart_of_accounts (code, name, type, normal_balance, category_raw)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (code) DO NOTHING;
      `;
      await dbClient.query(insertQuery, [acc.code, acc.name, acc.type, acc.normalBalance, acc.categoryRaw]);
      inserted++;
    }
    
    console.log(`Successfully seeded ${inserted} accounts into the database.`);
    
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await dbClient.end();
  }
}

seedMasterCOA();
