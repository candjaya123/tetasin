import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const ACCOUNT_TYPE_KEY = 'requiredAccountType';

export const RequireAccountType = (type: 'personal' | 'business') =>
  SetMetadata(ACCOUNT_TYPE_KEY, type);

import { SetMetadata } from '@nestjs/common';

@Injectable()
export class AccountTypeGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredType = this.reflector.getAllAndOverride<'personal' | 'business'>(
      ACCOUNT_TYPE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredType) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.account_type) {
      throw new ForbiddenException({
        code: 'ACCOUNT_TYPE_REQUIRED',
        message: 'Tipe akun tidak ditemukan.',
      });
    }

    if (user.account_type !== requiredType) {
      throw new ForbiddenException({
        code: 'PERSONAL_ACCOUNT_ONLY',
        message: `Endpoint ini hanya tersedia untuk akun ${requiredType}.`,
      });
    }

    return true;
  }
}
