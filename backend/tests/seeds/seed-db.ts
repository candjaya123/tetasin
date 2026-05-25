import { createClient } from '@supabase/supabase-js';
import { faker } from '@faker-js/faker/locale/id_ID';

const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';
const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('🌱 Starting Database Seeding...');

  // 1. Create a Test Tenant
  const { data: tenant, error: tenantErr } = await supabase
    .from('tenants')
    .insert({
      name: faker.company.name(),
      account_type: 'business',
      tier: 'pro',
      subscription_status: 'active',
      contact_phone: faker.phone.number(),
      contact_email: faker.internet.email(),
    })
    .select()
    .single();

  if (tenantErr) {
    console.error('Error creating tenant:', tenantErr);
    return;
  }
  console.log('✅ Created Test Tenant:', tenant.name);

  // 2. Create Industry Profile
  await supabase.from('tenant_industry_profiles').insert({
    tenant_id: tenant.id,
    industry_type: 'fnb',
  });

  // 3. Create dummy products
  const products = Array.from({ length: 10 }).map(() => ({
    tenant_id: tenant.id,
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    price: parseInt(faker.commerce.price({ min: 10000, max: 100000 })),
    sku: faker.string.alphanumeric(8).toUpperCase(),
    stock_quantity: faker.number.int({ min: 0, max: 100 }),
    product_type: 'physical',
  }));

  const { error: prodErr } = await supabase.from('products').insert(products);
  if (prodErr) {
    console.error('Error creating products:', prodErr);
  } else {
    console.log(`✅ Created 10 dummy products for tenant ${tenant.id}`);
  }

  console.log('🌱 Database Seeding Complete.');
}

seed().catch(console.error);
