import { apiGet, apiPost, apiDelete } from './client';

export const budgetService = {
  getBudgets: (month?: string) => {
    const params: Record<string, string> = {};
    if (month) params.month = month;
    return apiGet<any[]>('/api/v1/finance/budgets', params);
  },
  getBudgetSummary: (month?: string) => {
    const params: Record<string, string> = {};
    if (month) params.month = month;
    return apiGet<any>('/api/v1/finance/budgets/summary', params);
  },
  upsertBudget: (data: { account_id: string; limit_amount: number; period_month: string }) =>
    apiPost('/api/v1/finance/budgets', data),
  deleteBudget: (id: string) => apiDelete(`/api/v1/finance/budgets/${id}`),
};
