export interface SaleItem {
  product_id: string;
  product_name?: string;
  quantity: number;
  price: number;
  discount?: number;
  selected_variants?: any[];
  selected_addons?: any[];
}

export interface ProcessSaleDto {
  items: SaleItem[];
  payment_method?: string;
  discount_amount?: number;
  payment_account_id?: string;
  revenue_account_id?: string;
  hpp_account_id?: string;
  inventory_account_id?: string;
  discount_account_id?: string;
  idempotency_key?: string;
  customer_name?: string;
  pesanan_number?: string;
  notes?: string;
  description?: string;
  entity_id?: string;
  branch_id?: string;
}

export interface SaleResult {
  journalId: string;
  transactionId: string;
  pesananId: string;
  order_number: string;
  pesananNumber: string;
  status: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  meta?: any;
  timestamp: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  trace_id?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface Customer {
  id: string;
  tenant_id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at: string;
}

export interface SalesOrder {
  id: string;
  tenant_id: string;
  pesanan_number: string;
  customer_name?: string;
  status: 'draft' | 'confirmed' | 'processing' | 'ready' | 'fulfilled' | 'invoiced' | 'paid' | 'cancelled' | 'voided';
  source: string;
  division_notes: Record<string, string>;
  transaction_id?: string;
  total_amount: number;
  notes?: string;
  created_by?: string;
  fulfilled_at?: string;
  created_at: string;
  updated_at: string;
  transactions?: Transaction[];
}

export interface Transaction {
  id: string;
  tenant_id: string;
  cashier_id?: string;
  pesanan_id?: string;
  journal_id?: string;
  source_type: string;
  status: string;
  payment_method: string;
  subtotal: number;
  discount_amount: number;
  total_amount: number;
  notes?: string;
  idempotency_key?: string;
  transaction_date: string;
  created_at: string;
  sale_items?: SaleItemRecord[];
}

export interface SaleItemRecord {
  id: string;
  tenant_id: string;
  transaction_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  discount: number;
  hpp_mode: string;
  hpp_per_unit: number;
  hpp_amount: number;
  total: number;
  selected_variants: any[];
  selected_addons: any[];
}

export interface JournalEntry {
  id: string;
  tenant_id: string;
  date: string;
  description?: string;
  reference_type?: string;
  reference_id?: string;
  status: 'draft' | 'posted' | 'voided';
  created_by?: string;
  idempotency_key?: string;
  created_at: string;
  journal_lines?: JournalLine[];
}

export interface JournalLine {
  id: string;
  journal_entry_id?: string;
  entry_id?: string;
  account_id: string;
  debit: number;
  credit: number;
  description?: string;
  chart_of_accounts?: ChartOfAccount;
}

export interface ChartOfAccount {
  id: string;
  tenant_id: string;
  code: string;
  name: string;
  type: string;
  kategori?: string;
  normal_balance: 'debit' | 'credit';
  is_system?: boolean;
  parent_code?: string;
}

export interface Product {
  id: string;
  tenant_id: string;
  name: string;
  sku?: string;
  barcode?: string;
  selling_price: number;
  cost_price: number;
  current_stock: number;
  reorder_point?: number;
  unit: string;
  category?: string;
  hpp_coa_id?: string;
  is_active: boolean;
  warehouse_id?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  product_recipes?: ProductRecipe[];
  product_variant_groups?: ProductVariantGroup[];
  product_addon_groups?: ProductAddonGroup[];
}

export interface ProductRecipe {
  id: string;
  product_id: string;
  raw_material_id: string;
  quantity_needed: number;
  raw_materials?: RawMaterial;
}

export interface RawMaterial {
  id: string;
  tenant_id: string;
  name: string;
  unit: string;
  unit_price: number;
  current_stock: number;
  reorder_point?: number;
  last_purchase_price?: number;
  coa_account_id?: string;
  warehouse_id?: string;
}

export interface ProductVariantGroup {
  id: string;
  product_id: string;
  name: string;
  is_required: boolean;
  allow_multiple: boolean;
  display_order: number;
  options?: ProductVariantOption[];
}

export interface ProductVariantOption {
  id: string;
  group_id: string;
  product_id: string;
  name: string;
  price_delta: number;
  cost_delta: number;
  sku_suffix?: string;
  current_stock: number;
  is_active: boolean;
}

export interface ProductAddonGroup {
  id: string;
  product_id: string;
  name: string;
  is_required: boolean;
  min_selections: number;
  max_selections: number;
  is_promo_eligible: boolean;
  display_order: number;
  addons?: ProductAddon[];
}

export interface ProductAddon {
  id: string;
  group_id: string;
  product_id: string;
  name: string;
  price: number;
  cost_price?: number;
  track_stock?: boolean;
  current_stock?: number;
  raw_material_id?: string;
  is_active: boolean;
}

export interface StaffMember {
  id: string;
  full_name: string;
  role: string;
  tenant_id: string;
  email?: string;
  account_type?: string;
  avatar_url?: string;
  is_superadmin?: boolean;
}

export interface Tenant {
  id: string;
  name: string;
  account_type: string;
  tier: 'free' | 'premium' | 'pro' | 'franchise';
  subscription_status: string;
  subscription_end_date?: string;
  address?: string;
  npwp?: string;
  contact_phone?: string;
  contact_email?: string;
  website?: string;
  created_at: string;
}

export interface PersonalMonthlySummary {
  month: number;
  year: number;
  pemasukan: number;
  pengeluaran: number;
  selisih: number;
  net_worth: number;
  budget_status: BudgetStatus[];
}

export interface BudgetStatus {
  account_id: string;
  name: string;
  code: string;
  budget: number;
  actual: number;
  pct_used: number;
  status: 'on_track' | 'warning' | 'over_budget';
}

export interface PersonalBudget {
  id: string;
  tenant_id: string;
  account_id: string;
  month: number;
  year: number;
  budget_amount: number;
  chart_of_accounts?: { name: string; code: string };
}

export interface FinancialGoal {
  id: string;
  tenant_id: string;
  name: string;
  goal_type: 'savings' | 'debt_payoff' | 'investment' | 'emergency_fund';
  target_amount: number;
  current_amount: number;
  target_date?: string;
  linked_account_id?: string;
  notes?: string;
  status: 'active' | 'achieved' | 'cancelled';
  progress_pct?: number;
  created_at: string;
}

export interface RecurringTransaction {
  id: string;
  tenant_id: string;
  name: string;
  amount: number;
  direction: 'income' | 'expense';
  debit_account_id: string;
  credit_account_id: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  day_of_period?: number;
  next_due_date: string;
  is_active: boolean;
  last_triggered_at?: string;
}

export interface Bill {
  id: string;
  tenant_id: string;
  title: string;
  amount: number;
  bill_type: 'hutang' | 'piutang';
  due_date: string;
  contact_name?: string;
  contact_phone?: string;
  coa_account_id?: string;
  payment_account_id?: string;
  status: 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled';
  amount_paid: number;
  reminder_days: number[];
  description?: string;
  photo_url?: string;
  journal_entry_id?: string;
  last_reminded_at?: string;
  created_at: string;
  payments?: BillPayment[];
}

export interface BillPayment {
  id: string;
  bill_id: string;
  tenant_id: string;
  amount: number;
  payment_date: string;
  payment_account_id?: string;
  notes?: string;
  journal_entry_id?: string;
  created_at: string;
}

export interface BillSummary {
  hutang: { total: number; outstanding_amount: number; overdue_count: number };
  piutang: { total: number; outstanding_amount: number; overdue_count: number };
}

export interface NetWorth {
  aset: number;
  hutang: number;
  net_worth: number;
}

export interface ProductBehavior {
  id: string;
  tenant_id: string;
  product_id: string;
  product_type: ProductType;
  metadata: Record<string, any>;
}

export type ProductType = 'physical' | 'service' | 'digital' | 'custom_price' | 'weighted' | 'composite' | 'hybrid';

export interface SmartAlert {
  id: string;
  tenant_id: string;
  alert_type?: string;
  message: string;
  priority: string;
  is_read: boolean;
  created_at: string;
}

export interface IndustryProfile {
  id: string;
  tenant_id: string;
  industry: string;
  default_product_type: string;
  features_config: Record<string, boolean>;
  ui_config: Record<string, any>;
}

export interface PurchaseOrder {
  id: string;
  tenant_id: string;
  vendor_name?: string;
  reference_number?: string;
  total_amount: number;
  status: string;
  created_by?: string;
  created_at: string;
  purchase_order_items?: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
  id: string;
  po_id: string;
  raw_material_id: string;
  quantity: number;
  unit_price: number;
  received_qty: number;
}

export interface HppPreview {
  product_name: string;
  hpp_mode: 'recipe' | 'direct' | 'none';
  hpp_per_unit: number;
  selling_price: number;
  gross_margin_pct: number;
  ingredients: Array<{
    name: string;
    quantity_needed: number;
    unit: string;
    unit_price: number;
    cost: number;
  }>;
}
