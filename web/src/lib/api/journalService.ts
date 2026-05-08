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

export const journalService = {
  async getDrafts() {
    const response = await fetch(`${BACKEND_URL}/api/v1/journal/drafts`, {
      headers: await getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch drafts');
    return response.json();
  },

  async approveDraft(id: string) {
    const response = await fetch(`${BACKEND_URL}/api/v1/journal/approve-draft/${id}`, {
      method: 'POST',
      headers: await getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to approve draft');
    return response.json();
  },

  async createExpense(data: any) {
    const response = await fetch(`${BACKEND_URL}/api/v1/journal`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create expense');
    return response.json();
  },
  
  async getTransactions(params: { startDate?: string; endDate?: string; account_id?: string; type?: string }) {
    const query = new URLSearchParams();
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate) query.append('endDate', params.endDate);
    if (params.account_id) query.append('account_id', params.account_id);
    if (params.type) query.append('type', params.type);

    const url = `${BACKEND_URL}/api/v1/finance/transactions?${query.toString()}`;
    console.log('[journalService] Fetching transactions from:', url);

    try {
      const response = await fetch(url, {
        headers: await getHeaders(),
      });

      if (response.status === 404) {
        console.warn('[journalService] /finance/transactions endpoint not found on server. Backend needs to be deployed.');
        return [];
      }

      if (!response.ok) {
        const errorBody = await response.text().catch(() => 'Cannot read body');
        console.error(`[journalService] HTTP ${response.status}:`, errorBody);
        // Return empty array instead of crashing the UI
        return [];
      }

      return response.json();
    } catch (err) {
      console.error('[journalService] Network error fetching transactions:', err);
      return [];
    }
  }
};
