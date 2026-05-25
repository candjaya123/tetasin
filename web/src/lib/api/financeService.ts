import { apiGet } from './client';

// Define types for financial report data
export interface LedgerEntry {
  id: string;
  date: string;
  description: string;
  reference_number?: string;
  debit: number;
  credit: number;
  account_code: string;
  account_name: string;
}

export interface TrialBalance {
  account_code: string;
  account_name: string;
  debit_total: number;
  credit_total: number;
  balance: number;
}

export interface IncomeStatement {
  revenue: number;
  cogs: number;
  gross_profit: number;
  operating_expenses: number;
  net_income: number;
}

export interface BalanceSheet {
  assets: {
    current: number;
    fixed: number;
    total: number;
  };
  liabilities: {
    current: number;
    long_term: number;
    total: number;
  };
  equity: number;
}

export interface CashFlow {
  operating: number;
  investing: number;
  financing: number;
  net_change: number;
  beginning_balance: number;
  ending_balance: number;
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
  sale_items?: any[];
}

export const financeService = {
  getLedger: (params?: {
    tenant_id?: string;
    from?: string;
    to?: string;
    account_id?: string;
    page?: number;
    per_page?: number;
  }) => {
    const queryParams: Record<string, string> = {};
    if (params?.tenant_id) queryParams.tenant_id = params.tenant_id;
    if (params?.from) queryParams.from = params.from;
    if (params?.to) queryParams.to = params.to;
    if (params?.account_id) queryParams.account_id = params.account_id;
    if (params?.page) queryParams.page = String(params.page);
    if (params?.per_page) queryParams.per_page = String(params.per_page);
    return apiGet<LedgerEntry[]>('/api/v1/finance/ledger', queryParams);
  },

  getTrialBalance: (params?: {
    tenant_id?: string;
    as_of_date?: string;
  }) => {
    const queryParams: Record<string, string> = {};
    if (params?.tenant_id) queryParams.tenant_id = params.tenant_id;
    if (params?.as_of_date) queryParams.as_of_date = params.as_of_date;
    return apiGet<TrialBalance[]>('/api/v1/finance/trial-balance', queryParams);
  },

  getIncomeStatement: (params?: {
    tenant_id?: string;
    from?: string;
    to?: string;
  }) => {
    const queryParams: Record<string, string> = {};
    if (params?.tenant_id) queryParams.tenant_id = params.tenant_id;
    if (params?.from) queryParams.from = params.from;
    if (params?.to) queryParams.to = params.to;
    return apiGet<IncomeStatement>('/api/v1/finance/income-statement', queryParams);
  },

  getBalanceSheet: (params?: {
    tenant_id?: string;
    as_of_date?: string;
  }) => {
    const queryParams: Record<string, string> = {};
    if (params?.tenant_id) queryParams.tenant_id = params.tenant_id;
    if (params?.as_of_date) queryParams.as_of_date = params.as_of_date;
    return apiGet<BalanceSheet>('/api/v1/finance/balance-sheet', queryParams);
  },

  getCashFlow: (params?: {
    tenant_id?: string;
    from?: string;
    to?: string;
  }) => {
    const queryParams: Record<string, string> = {};
    if (params?.tenant_id) queryParams.tenant_id = params.tenant_id;
    if (params?.from) queryParams.from = params.from;
    if (params?.to) queryParams.to = params.to;
    return apiGet<CashFlow>('/api/v1/finance/cash-flow', queryParams);
  },

  getTransactions: (params?: {
    tenant_id?: string;
    source_type?: string;
    from?: string;
    to?: string;
    page?: number;
    per_page?: number;
    sort?: string;
    order?: string;
  }) => {
    const queryParams: Record<string, string> = {};
    if (params?.tenant_id) queryParams.tenant_id = params.tenant_id;
    if (params?.source_type) queryParams.source_type = params.source_type;
    if (params?.from) queryParams.from = params.from;
    if (params?.to) queryParams.to = params.to;
    if (params?.page) queryParams.page = String(params.page);
    if (params?.per_page) queryParams.per_page = String(params.per_page);
    if (params?.sort) queryParams.sort = params.sort;
    if (params?.order) queryParams.order = params.order;
    return apiGet<Transaction[]>('/api/v1/finance/transactions', queryParams);
  },
};