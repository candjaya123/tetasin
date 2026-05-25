import * as crypto from 'crypto';
const uuid = () => crypto.randomUUID();

export const TEST_TENANT_ID = '11111111-1111-1111-1111-111111111111';
export const TEST_USER_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
export const TEST_MANAGER_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
export const TEST_KASIR_ID = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
export const TEST_STOK_ID = 'dddddddd-dddd-dddd-dddd-dddddddddddd';

export const mockAuthenticatedRequest = (overrides: Record<string, any> = {}) => ({
  user: {
    id: TEST_USER_ID,
    email: 'test@tumbuhin.com',
    tenant_id: TEST_TENANT_ID,
    entity_id: TEST_TENANT_ID,
    account_type: 'business' as const,
    tier: 'pro' as const,
    role: 'manager' as const,
    ...overrides,
  },
  headers: {
    authorization: 'Bearer mock-jwt-token',
    'x-trace-id': uuid(),
  },
});

export const buildMockProduct = (overrides: Record<string, any> = {}) => ({
  id: uuid(),
  tenant_id: TEST_TENANT_ID,
  name: 'Kopi Susu',
  selling_price: 15000,
  cost_price: 8000,
  sku: 'KS-001',
  barcode: '1234567890',
  category: 'Minuman',
  reorder_point: 10,
  unit: 'pcs',
  current_stock: 50,
  is_active: true,
  image_url: null,
  product_recipes: [],
  product_variant_groups: [],
  product_addon_groups: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const buildMockJournalEntry = (overrides: Record<string, any> = {}) => ({
  id: uuid(),
  tenant_id: TEST_TENANT_ID,
  reference_id: null,
  reference_type: 'manual',
  status: 'posted' as const,
  description: 'Test journal entry',
  transaction_date: new Date().toISOString(),
  created_by: TEST_USER_ID,
  created_at: new Date().toISOString(),
  journal_lines: [],
  ...overrides,
});

export const buildMockJournalLine = (overrides: Record<string, any> = {}) => ({
  id: uuid(),
  journal_entry_id: uuid(),
  account_id: uuid(),
  tenant_id: TEST_TENANT_ID,
  type: 'debit' as const,
  amount: 50000,
  description: null,
  ...overrides,
});

export const buildMockCOAAccount = (overrides: Record<string, any> = {}) => ({
  id: uuid(),
  tenant_id: TEST_TENANT_ID,
  code: '1-10000',
  name: 'Kas Tunai',
  type: 'aset',
  is_system: false,
  parent_code: null,
  created_at: new Date().toISOString(),
  ...overrides,
});

export const buildMockTransaction = (overrides: Record<string, any> = {}) => ({
  id: uuid(),
  tenant_id: TEST_TENANT_ID,
  cashier_id: TEST_KASIR_ID,
  journal_id: uuid(),
  status: 'committed' as const,
  payment_method: 'cash' as const,
  subtotal: 100000,
  discount_amount: 0,
  total_amount: 100000,
  notes: null,
  idempotency_key: uuid(),
  transaction_date: new Date().toISOString(),
  created_at: new Date().toISOString(),
  ...overrides,
});

export const buildMockSaleItem = (overrides: Record<string, any> = {}) => ({
  id: uuid(),
  tenant_id: TEST_TENANT_ID,
  transaction_id: uuid(),
  product_id: uuid(),
  quantity: 2,
  unit_price: 15000,
  discount: 0,
  hpp_amount: 16000,
  total: 30000,
  ...overrides,
});

export const buildMockSaleRequest = (overrides: Record<string, any> = {}) => ({
  items: [{ product_id: uuid(), quantity: 2, unit_price: 15000 }],
  payment_method: 'cash' as const,
  discount_amount: 0,
  idempotency_key: uuid(),
  ...overrides,
});

export const buildMockDraftTransaction = (overrides: Record<string, any> = {}) => ({
  id: uuid(),
  tenant_id: TEST_TENANT_ID,
  receipt_scan_id: null,
  created_by: TEST_USER_ID,
  status: 'ready' as const,
  merchant_name: 'Toko Sumber Rejeki',
  transaction_date: new Date().toISOString(),
  total_amount: 50000,
  subtotal: 50000,
  tax_amount: 0,
  discount_amount: 0,
  currency: 'IDR',
  payment_method: 'cash',
  receipt_number: null,
  category: 'Beban',
  notes: null,
  tags: [],
  ai_recommendations: {},
  debit_account_id: uuid(),
  credit_account_id: uuid(),
  line_items: [],
  user_corrections: {},
  approved_at: null,
  approved_by: null,
  resulting_transaction_id: null,
  resulting_journal_id: null,
  rejected_at: null,
  rejection_reason: null,
  expires_at: new Date(Date.now() + 30 * 24 * 3600000).toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const buildMockPurchaseOrder = (overrides: Record<string, any> = {}) => ({
  id: uuid(),
  tenant_id: TEST_TENANT_ID,
  vendor_name: 'PT Supplier Makmur',
  status: 'draft' as const,
  total_amount: 500000,
  notes: null,
  created_by: TEST_USER_ID,
  approved_by: null,
  approved_at: null,
  expected_at: new Date(Date.now() + 7 * 24 * 3600000).toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const buildMockSalesOrder = (overrides: Record<string, any> = {}) => ({
  id: uuid(),
  tenant_id: TEST_TENANT_ID,
  customer_name: 'Budi Santoso',
  status: 'pending' as const,
  total_amount: 200000,
  notes: null,
  created_by: TEST_USER_ID,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});
