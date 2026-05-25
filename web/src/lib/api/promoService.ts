import { apiGet, apiPost, apiPut, apiDelete } from './client';

export const promoService = {
  getPromos: () => apiGet('/api/v1/promo'),
  createPromo: (data: any) => apiPost('/api/v1/promo', data),
  updatePromo: (id: string, data: any) => apiPut(`/api/v1/promo/${id}`, data),
  deletePromo: (id: string) => apiDelete(`/api/v1/promo/${id}`),
};
