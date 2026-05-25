import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SubscriptionTier } from '../constants/subscription-tier.enum';
import { TIER_KEY } from './tier.decorator';
import { SupabaseService } from '../../shared/supabase.service';

@Injectable()
export class TierGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly supabaseService: SupabaseService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredTier = this.reflector.getAllAndOverride<SubscriptionTier>(TIER_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredTier) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.tenant_id) {
      throw new ForbiddenException('Akses ditolak: Tenant tidak ditemukan.');
    }

    const client = this.supabaseService.getClient();
    const { data: tenant, error } = await client
      .from('tenants')
      .select('tier, account_type')
      .eq('id', user.tenant_id)
      .single();

    if (error || !tenant) {
      throw new ForbiddenException('Akses ditolak: Data tenant tidak ditemukan.');
    }

    const tierHierarchy: Record<string, number> = {
      [SubscriptionTier.FREE]: 0,
      [SubscriptionTier.PREMIUM]: 1,
      [SubscriptionTier.PRO]: 2,
      [SubscriptionTier.FRANCHISE]: 3,
    };

    const userTierLevel = tierHierarchy[tenant.tier] ?? -1;
    const requiredTierLevel = tierHierarchy[requiredTier];

    if (userTierLevel < requiredTierLevel) {
      throw new ForbiddenException({
        code: 'TIER_RESTRICTION',
        message: `Fitur ini membutuhkan tier ${requiredTier}. Anda saat ini menggunakan tier ${tenant.tier}.`,
      });
    }

    if (requiredTier === SubscriptionTier.FRANCHISE && tenant.account_type === 'personal') {
      throw new ForbiddenException({
        code: 'TIER_RESTRICTION',
        message: 'Franchise tier hanya tersedia untuk akun bisnis.',
      });
    }

    if (requiredTier === SubscriptionTier.PREMIUM && tenant.account_type !== 'personal') {
      throw new ForbiddenException({
        code: 'TIER_RESTRICTION',
        message: 'Premium tier hanya tersedia untuk akun personal.',
      });
    }

    return true;
  }
}
