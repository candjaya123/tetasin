import { http, HttpResponse } from 'msw';

export const handlers = [
  // Intercept GET /api/v1/auth/me
  http.get('http://localhost:3001/api/v1/auth/me', () => {
    return HttpResponse.json({
      id: 'mock-user-id',
      email: 'test@tumbuhin.com',
      profile: {
        role: 'manager',
        accountType: 'business',
      },
    });
  }),

  // Intercept GET /api/v1/tenant
  http.get('http://localhost:3001/api/v1/tenant', () => {
    return HttpResponse.json({
      id: 'mock-tenant-id',
      name: 'Test Tenant',
      tier: 'pro',
    });
  }),
];
