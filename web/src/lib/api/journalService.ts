import { apiGet, apiPost } from './client';

export const journalService = {
  getDrafts: () => apiGet('/api/v1/receipt/drafts'),
  approveDraft: (id: string) => apiPost(`/api/v1/receipt/drafts/${id}/approve`),
  createExpense: (data: any) => apiPost('/api/v1/accounting/journal-entries', data),
  getCOA: () => apiGet<any[]>('/api/v1/accounting/coa'),
  getTemplates: () => apiGet<any[]>('/api/v1/accounting/coa/templates'),
  getTransactions: async (params?: {
    startDate?: string;
    endDate?: string;
    account_id?: string;
    type?: string;
  }) => {
    const query: Record<string, string> = {};
    if (params?.startDate) query.start_date = params.startDate;
    if (params?.endDate) query.end_date = params.endDate;
    if (params?.account_id) query.account_id = params.account_id;
    if (params?.type) query.type = params.type;
    return apiGet<any[]>('/api/v1/transactions', query);
  },
  getExpenses: (params?: Record<string, string>) =>
    apiGet<any[]>('/api/v1/finance/expenses', params || {}),
};
