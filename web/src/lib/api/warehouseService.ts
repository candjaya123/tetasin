import { apiGet, apiPost, apiPut, apiDelete } from './client';

export const warehouseService = {
  getWarehouses: () => apiGet<any[]>('/api/v1/warehouses'),
  createWarehouse: (data: any) => apiPost('/api/v1/warehouses', data),
  updateWarehouse: (id: string, data: any) => apiPut(`/api/v1/warehouses/${id}`, data),
  deleteWarehouse: (id: string) => apiDelete(`/api/v1/warehouses/${id}`),
  transferStock: (data: { from_warehouse_id: string; to_warehouse_id: string; items: Array<{ product_id: string; quantity: number }>; notes?: string }) =>
    apiPost('/api/v1/warehouses/transfers', data),
  getStockCard: (productId: string) => apiGet(`/api/v1/warehouses/stock-card/${productId}`),
  createOpname: (data: { warehouse_id: string; notes?: string; items: { product_id: string; system_quantity: number; physical_quantity: number }[] }) =>
    apiPost('/api/v1/warehouses/opnames', data),
};
