import { apiGet, apiPost, apiPut, apiDelete } from './client';

export const productService = {
  getProducts: () => apiGet<any[]>('/api/v1/inventory/products'),
  createProduct: (data: { p_name: string; p_selling_price: number; p_recipe: any[]; p_barcode?: string }) =>
    apiPost('/api/v1/inventory/products', data),
  updateProduct: (id: string, data: any) => apiPut(`/api/v1/inventory/products/${id}`, data),
  deleteProduct: (id: string) => apiDelete(`/api/v1/inventory/products/${id}`),
  getRawMaterials: () => apiGet('/api/v1/inventory/raw-materials'),
};
