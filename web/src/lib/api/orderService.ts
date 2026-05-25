import { apiGet, apiPost, apiPut, apiPatch } from './client';

export const orderService = {
  getOrders: (params?: { status?: string; source?: string }) => {
    const queryParams: Record<string, string> = {};
    if (params?.status) queryParams.status = params.status;
    if (params?.source) queryParams.source = params.source;
    return apiGet<any[]>('/api/v1/orders', queryParams);
  },
  getOrderById: (id: string) => apiGet(`/api/v1/orders/${id}`),
  createOrder: (data: any) => apiPost('/api/v1/orders', data),
  updateOrderStatus: (id: string, status: string, division_note?: string, division?: string) =>
    apiPatch(`/api/v1/orders/${id}/status`, { status, division_note, division }),
  voidOrder: (id: string) => apiPatch(`/api/v1/orders/${id}/void`),
  updateDivisionNotes: (id: string, notes: { kasir?: string; stok?: string; dapur?: string }) =>
    apiPatch(`/api/v1/orders/${id}/division-notes`, notes),
  // Purchase Orders
  getPurchaseOrders: () => apiGet<any[]>('/api/v1/orders/purchase'),
  createPurchaseOrder: (data: any) => apiPost('/api/v1/orders/purchase', data),
  updatePurchaseOrder: (id: string, data: any) => apiPut(`/api/v1/orders/purchase/${id}`, data),
  receivePurchaseOrder: (id: string, items: Array<{ item_id: string; received_qty: number }>) =>
    apiPost(`/api/v1/orders/purchase/${id}/receive`, { items }),
};
