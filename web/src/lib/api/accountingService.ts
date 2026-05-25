import { apiGet, apiPost, apiPut, apiDelete } from './client';
import type { ChartOfAccount, JournalEntry } from '@/types';

const BASE = 'accounting';

export const accountingService = {
  getCoa: (tenantId: string) =>
    apiGet<ChartOfAccount[]>(`api/v1/${BASE}/coa`, { tenant_id: tenantId }),

  createAccount: (payload: Partial<ChartOfAccount>) =>
    apiPost<ChartOfAccount>(`api/v1/${BASE}/coa`, payload),

  updateAccount: (id: string, payload: Partial<ChartOfAccount>) =>
    apiPut<ChartOfAccount>(`api/v1/${BASE}/coa/${id}`, payload),

  deleteAccount: (id: string) =>
    apiDelete(`api/v1/${BASE}/coa/${id}`),

  getJournals: (params?: { tenant_id?: string; from?: string; to?: string; page?: number; per_page?: number }) => {
    const queryParams: Record<string, string> = {};
    if (params?.tenant_id) queryParams.tenant_id = params.tenant_id;
    if (params?.from) queryParams.from = params.from;
    if (params?.to) queryParams.to = params.to;
    if (params?.page) queryParams.page = String(params.page);
    if (params?.per_page) queryParams.per_page = String(params.per_page);
    return apiGet<JournalEntry[]>(`api/v1/${BASE}/journal-entries`, queryParams);
  },

  getJournalById: (id: string) =>
    apiGet<JournalEntry>(`api/v1/${BASE}/journal-entries/${id}`),

  createJournal: (payload: {
    description: string;
    date: string;
    lines: Array<{
      account_id: string;
      debit?: number;
      credit?: number;
      description?: string;
    }>;
    total_amount?: number;
    idempotency_key?: string;
  }) =>
    apiPost<JournalEntry>(`api/v1/${BASE}/journal-entries`, payload),
};
