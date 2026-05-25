import { apiGet, apiPost, apiPatch, apiDelete } from './client';
import type { PersonalMonthlySummary, PersonalBudget, FinancialGoal, RecurringTransaction, NetWorth } from '@/types';

export const personalFinanceService = {
  getSummary: (month?: number, year?: number) => {
    const params: Record<string, string> = {};
    if (month) params.month = String(month);
    if (year) params.year = String(year);
    return apiGet<PersonalMonthlySummary>('/api/v1/personal/summary', params);
  },

  getNetWorth: () => apiGet<NetWorth>('/api/v1/personal/net-worth'),

  recordIncome: (data: { amount: number; income_account_id: string; destination_account_id: string; date?: string; notes?: string }) =>
    apiPost<any>('/api/v1/personal/income', data),

  recordExpense: (data: { amount: number; expense_account_id: string; payment_account_id: string; date?: string; notes?: string }) =>
    apiPost<any>('/api/v1/personal/expense', data),

  transfer: (data: { amount: number; from_account_id: string; to_account_id: string; notes?: string }) =>
    apiPost<any>('/api/v1/personal/transfer', data),

  getBudgets: (month?: number, year?: number) => {
    const params: Record<string, string> = {};
    if (month) params.month = String(month);
    if (year) params.year = String(year);
    return apiGet<PersonalBudget[]>('/api/v1/personal/budgets', params);
  },

  upsertBudget: (data: { account_id: string; month: number; year: number; budget_amount: number }) =>
    apiPost<PersonalBudget>('/api/v1/personal/budgets', data),

  getGoals: () => apiGet<FinancialGoal[]>('/api/v1/personal/goals'),

  createGoal: (data: { name: string; goal_type: string; target_amount: number; target_date?: string; linked_account_id?: string; notes?: string }) =>
    apiPost<FinancialGoal>('/api/v1/personal/goals', data),

  getGoalDetail: (id: string) => apiGet<FinancialGoal>(`/api/v1/personal/goals/${id}`),

  updateGoalProgress: (id: string, data: { amount: number; source_account_id?: string; notes?: string }) =>
    apiPatch<any>(`/api/v1/personal/goals/${id}/progress`, data),

  cancelGoal: (id: string) => apiPatch<any>(`/api/v1/personal/goals/${id}/cancel`),

  getRecurring: () => apiGet<RecurringTransaction[]>('/api/v1/personal/recurring'),

  createRecurring: (data: { name: string; amount: number; direction: string; debit_account_id: string; credit_account_id: string; frequency: string; day_of_period?: number; next_due_date: string }) =>
    apiPost<RecurringTransaction>('/api/v1/personal/recurring', data),

  updateRecurring: (id: string, data: Partial<RecurringTransaction>) =>
    apiPatch<RecurringTransaction>(`/api/v1/personal/recurring/${id}`, data),

  triggerRecurring: (id: string) =>
    apiPatch<any>(`/api/v1/personal/recurring/${id}/trigger`),

  deactivateRecurring: (id: string) =>
    apiDelete<any>(`/api/v1/personal/recurring/${id}`),
};
