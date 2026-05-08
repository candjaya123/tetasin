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

export const payoutService = {
  async getPayouts() {
    const response = await fetch(`${BACKEND_URL}/api/v1/payouts`, {
      headers: await getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch payouts');
    return response.json();
  },

  async createPayout(data: { amount: number; bank_name: string; bank_account: string; notes?: string }) {
    const response = await fetch(`${BACKEND_URL}/api/v1/payouts/execute`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create payout request');
    return response.json();
  },
};
