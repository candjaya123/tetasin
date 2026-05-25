import { apiGet } from './client';
import type { Transaction } from '@/types';

const BASE = 'transactions';

export const getTransactions = async (
  tenantId: string,
  params?: {
    source_type?: string;
    from?: string;
    to?: string;
    page?: number;
    per_page?: number;
    sort?: string;
    order?: 'asc' | 'desc';
  }
): Promise<Transaction[]> => {
  const queryParams: Record<string, string> = { tenant_id: tenantId };
  if (params?.source_type) queryParams.source_type = params.source_type;
  if (params?.from) queryParams.from = params.from;
  if (params?.to) queryParams.to = params.to;
  if (params?.page) queryParams.page = String(params.page);
  if (params?.per_page) queryParams.per_page = String(params.per_page);
  if (params?.sort) queryParams.sort = params.sort;
  if (params?.order) queryParams.order = params.order;
  const data = await apiGet<Transaction[]>(`api/v1/${BASE}`, queryParams);
  return data;
};

export const getTransactionById = async (id: string): Promise<Transaction> => {
  const data = await apiGet<Transaction>(`api/v1/${BASE}/${id}`);
  return data;
};
