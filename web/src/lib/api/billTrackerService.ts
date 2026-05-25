import { apiGet, apiPost, apiPatch, apiDelete } from './client';
import type { Bill, BillPayment, BillSummary } from '@/types';

export const billTrackerService = {
  getBills: (params?: Record<string, string>) =>
    apiGet<Bill[]>('/api/v1/bills', params),

  createBill: (data: {
    title: string; amount: number; bill_type: string; due_date: string;
    contact_name?: string; contact_phone?: string; coa_account_id?: string;
    payment_account_id?: string; reminder_days?: number[]; description?: string;
  }) => apiPost<any>('/api/v1/bills', data),

  getBillDetail: (id: string) => apiGet<Bill>(`/api/v1/bills/${id}`),

  updateBill: (id: string, data: Partial<Bill>) =>
    apiPatch<Bill>(`/api/v1/bills/${id}`, data),

  deleteBill: (id: string) => apiDelete<any>(`/api/v1/bills/${id}`),

  payBill: (id: string, data: { amount: number; payment_date?: string; payment_account_id?: string; notes?: string }) =>
    apiPost<any>(`/api/v1/bills/${id}/pay`, data),

  getPayments: (id: string) => apiGet<BillPayment[]>(`/api/v1/bills/${id}/payments`),

  cancelBill: (id: string) => apiPatch<any>(`/api/v1/bills/${id}/cancel`),

  getSummary: () => apiGet<BillSummary>('/api/v1/bills/summary'),
};
