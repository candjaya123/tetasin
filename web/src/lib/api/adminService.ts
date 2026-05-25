import { apiGet, apiPut } from './client';

export const adminService = {
  getTenants: () => apiGet('/api/v1/admin/tenants'),
  updateTenant: (id: string, updates: any) => apiPut(`/api/v1/admin/tenants/${id}`, updates),
};
