import { apiGet, apiPost } from './client';

export const receiptService = {
  createManualDraft: (data: any) => apiPost('/api/v1/receipt/drafts', data),
  getDrafts: () => apiGet<any[]>('/api/v1/receipt/drafts'),
};
