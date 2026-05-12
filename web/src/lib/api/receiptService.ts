import { createClient } from '../supabase/client';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

const getHeaders = async (isMultipart = false) => {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('No session found');
  
  const headers: any = {
    'Authorization': `Bearer ${session.access_token}`,
  };
  
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  
  return headers;
};

export const receiptService = {
  async scanReceipt(file: File) {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch(`${BACKEND_URL}/api/v1/receipt/scan`, {
      method: 'POST',
      headers: await getHeaders(true),
      body: formData,
    });
    
    if (!response.ok) throw new Error('Failed to scan receipt');
    return response.json();
  },

  async getScanStatus(scanId: string) {
    const response = await fetch(`${BACKEND_URL}/api/v1/receipt/scan/${scanId}`, {
      headers: await getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch scan status');
    return response.json();
  },

  async getDrafts() {
    const response = await fetch(`${BACKEND_URL}/api/v1/receipt/drafts`, {
      headers: await getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch drafts');
    return response.json();
  },

  async getDraft(id: string) {
    const response = await fetch(`${BACKEND_URL}/api/v1/receipt/drafts/${id}`, {
      headers: await getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch draft');
    return response.json();
  },

  async updateDraft(id: string, updates: any) {
    const response = await fetch(`${BACKEND_URL}/api/v1/receipt/drafts/${id}`, {
      method: 'PATCH',
      headers: await getHeaders(),
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update draft');
    return response.json();
  },

  async approveDraft(id: string) {
    const response = await fetch(`${BACKEND_URL}/api/v1/receipt/drafts/${id}/approve`, {
      method: 'POST',
      headers: await getHeaders(),
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to approve draft');
    }
    return response.json();
  },

  async rejectDraft(id: string, reason?: string) {
    const response = await fetch(`${BACKEND_URL}/api/v1/receipt/drafts/${id}/reject`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify({ reason }),
    });
    if (!response.ok) throw new Error('Failed to reject draft');
    return response.json();
  }
};
