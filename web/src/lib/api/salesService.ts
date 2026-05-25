import { apiGet, apiPost, apiPatch } from './client';
import type { ProcessSaleDto, SaleResult, Transaction } from '@/types';

const BASE = 'sales';

export const getTransactions = async (tenantId: string): Promise<Transaction[]> => {
  const data = await apiGet<Transaction[]>(`api/v1/transactions`, { tenant_id: tenantId });
  return data;
};

export const processSale = async (payload: ProcessSaleDto): Promise<SaleResult> => {
  const data = await apiPost<SaleResult>(`api/v1/${BASE}`, payload, payload.idempotency_key);
  return data;
};

export const voidSale = async (transactionId: string): Promise<{ reversalJournalId: string; status: string }> => {
  const data = await apiPatch<{ reversalJournalId: string; status: string }>(`api/v1/${BASE}/${transactionId}/void`);
  return data;
};
