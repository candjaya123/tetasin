import { apiGet, apiPost, apiPut } from './client';

export const profileService = {
  getProfile: () => apiGet<any>('/api/v1/business-profile/profile'),
  updateProfile: (updates: any) => apiPut('/api/v1/business-profile/profile', updates),
  getTenant: () => apiGet<any>('/api/v1/business-profile/tenant'),
  updateTenant: (updates: any) => apiPut('/api/v1/business-profile/tenant', updates),
  getStaff: () => apiGet('/api/v1/business-profile/staff'),
  inviteStaff: (email: string, role: string) => apiPost('/api/v1/business-profile/staff', { email, role }),
  deleteAccount: () => apiPost('/api/v1/business-profile/account/delete'),
};
