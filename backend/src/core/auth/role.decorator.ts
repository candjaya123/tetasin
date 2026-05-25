import { SetMetadata } from '@nestjs/common';

export enum UserRole {
  OWNER = 'owner',
  MANAGER = 'manager',
  KASIR = 'kasir',
  STOK = 'stok',
  PERSONAL = 'personal',
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
