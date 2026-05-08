import { createClient } from '../supabase/client';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

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
  }
};
