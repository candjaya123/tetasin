import { apiGet, apiPost, apiPatch, apiDelete } from './client';

export const staffService = {
  getStaff: () => apiGet('/api/v1/staff'),
  inviteStaff: (email: string, role: string) => apiPost('/api/v1/staff', { email, role }),
  updateStaffRole: (staffId: string, role: string) =>
    apiPost(`/api/v1/staff/${staffId}/role`, { role }),
  getStaffLogs: (userId: string) => apiGet(`/api/v1/business-profile/staff/${userId}/logs`),
  getAuditLogs: () => apiGet('/api/v1/staff/audit-logs'),
};
