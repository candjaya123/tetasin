import { apiGet } from './client';

export const reportService = {
  getDashboardSummary: (startDate?: string, endDate?: string) => {
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return apiGet<any>('/api/v1/report/dashboard', params);
  },
  getIncomeStatement: (startDate: string, endDate: string) =>
    apiGet('/api/v1/finance/income-statement', { startDate, endDate }),
  getBalanceSheet: (endDate?: string) =>
    apiGet('/api/v1/finance/balance-sheet', endDate ? { endDate } : undefined),
  getCashFlow: (startDate: string, endDate: string) =>
    apiGet('/api/v1/finance/cash-flow', { startDate, endDate }),
  getLedger: (accountId: string, startDate: string, endDate: string) =>
    apiGet('/api/v1/finance/ledger', { accountId, startDate, endDate }),
  getTrialBalance: (endDate: string) =>
    apiGet('/api/v1/finance/trial-balance', { endDate }),
  getSalesReport: (startDate?: string, endDate?: string) => {
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return apiGet('/api/v1/report/sales', params);
  },
  getStockReport: () => apiGet('/api/v1/report/stock'),
  getJournalEntries: (startDate?: string, endDate?: string) => {
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return apiGet<any[]>('/api/v1/accounting/journal-entries', params);
  },
  getAccountingAccounts: () => apiGet<any[]>('/api/v1/accounting/coa'),
};
