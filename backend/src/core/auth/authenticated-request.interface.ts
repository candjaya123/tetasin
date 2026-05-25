import { Request } from 'express';

export interface AuthenticatedUser {
  id: string;
  sub: string;
  email: string;
  tenant_id: string;
  entity_id?: string;
  account_type: 'personal' | 'business';
  role: string;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
