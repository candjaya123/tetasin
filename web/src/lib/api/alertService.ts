import { apiGet, apiPut, apiPost } from './client';

export const alertService = {
  getAlerts: () => apiGet<any[]>('/api/v1/business-profile/alerts'),
  getUnreadCount: () => apiGet<{ count: number }>('/api/v1/business-profile/alerts/count'),
  markAsRead: (id: string) => apiPut(`/api/v1/business-profile/alerts/${id}/read`, {}),
  markAllAsRead: () => apiPost('/api/v1/business-profile/alerts/read-all', {}),
};
