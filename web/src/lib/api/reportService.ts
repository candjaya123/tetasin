import { createClient } from '../supabase/client';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

const getHeaders = async () => {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('No session found');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`,
  };
};

const handleResponse = async (response: Response, errorMessage: string) => {
  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'No error body');
    console.error(`[API ERROR] ${errorMessage}:`, {
      status: response.status,
      statusText: response.statusText,
      body: errorBody
    });
    throw new Error(`${errorMessage} (Status: ${response.status})`);
  }
  return response.json();
};

export const reportService = {
  async getDashboardSummary() {
    const response = await fetch(`${BACKEND_URL}/api/v1/reports/dashboard`, {
      headers: await getHeaders(),
    });
    return handleResponse(response, 'Failed to fetch dashboard summary');
  },

  async getAccountingAccounts() {
    const response = await fetch(`${BACKEND_URL}/api/v1/reports/accounting/accounts`, {
      headers: await getHeaders(),
    });
    return handleResponse(response, 'Failed to fetch accounts');
  },

  async getIncomeStatement(startDate: string, endDate: string) {
    const response = await fetch(`${BACKEND_URL}/api/v1/reports/income-statement?startDate=${startDate}&endDate=${endDate}`, {
      headers: await getHeaders(),
    });
    return handleResponse(response, 'Failed to fetch income statement');
  },

  async getBalanceSheet(endDate?: string) {
    const response = await fetch(`${BACKEND_URL}/api/v1/reports/balance-sheet?endDate=${endDate || ''}`, {
      headers: await getHeaders(),
    });
    return handleResponse(response, 'Failed to fetch balance sheet');
  },

  async getCashFlow(startDate: string, endDate: string) {
    const response = await fetch(`${BACKEND_URL}/api/v1/reports/cash-flow?startDate=${startDate}&endDate=${endDate}`, {
      headers: await getHeaders(),
    });
    return handleResponse(response, 'Failed to fetch cash flow');
  },

  async getJournal(startDate: string, endDate: string) {
    const response = await fetch(`${BACKEND_URL}/api/v1/reports/journal?startDate=${startDate}&endDate=${endDate}`, {
      headers: await getHeaders(),
    });
    return handleResponse(response, 'Failed to fetch journal');
  },

  async getLedger(accountId: string, startDate: string, endDate: string) {
    const response = await fetch(`${BACKEND_URL}/api/v1/reports/ledger?accountId=${accountId}&startDate=${startDate}&endDate=${endDate}`, {
      headers: await getHeaders(),
    });
    return handleResponse(response, 'Failed to fetch ledger');
  },

  async getTrialBalance(endDate: string) {
    const response = await fetch(`${BACKEND_URL}/api/v1/reports/trial-balance?endDate=${endDate}`, {
      headers: await getHeaders(),
    });
    return handleResponse(response, 'Failed to fetch trial balance');
  },

  async getSalesReport(startDate?: string, endDate?: string) {
    const response = await fetch(`${BACKEND_URL}/api/v1/reports/sales?startDate=${startDate || ''}&endDate=${endDate || ''}`, {
      headers: await getHeaders(),
    });
    return handleResponse(response, 'Failed to fetch sales report');
  },

  async getStockReport() {
    const response = await fetch(`${BACKEND_URL}/api/v1/reports/stock`, {
      headers: await getHeaders(),
    });
    return handleResponse(response, 'Failed to fetch stock report');
  }
};
