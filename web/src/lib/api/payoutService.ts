import { apiGet, apiPost, apiPut, apiDelete } from './client';

export const payoutService = {
  getPayouts: () => apiGet<any[]>('/api/v1/payouts'),
  executePayout: (payload: { amount: number; bank_name: string; bank_account: string; notes?: string }) =>
    apiPost('/api/v1/payouts/execute', payload),
  approvePayout: (id: string) => apiPost(`/api/v1/payouts/${id}/approve`),
  rejectPayout: (id: string) => apiPost(`/api/v1/payouts/${id}/reject`),
};
