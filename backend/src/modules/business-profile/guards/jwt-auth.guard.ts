import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { SupabaseService } from '../../../shared/supabase.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly supabaseService: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Missing authorization header');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Missing token');
    }

    try {
      // Verify token with Supabase Auth server (secure, not just local decode)
      const client = this.supabaseService.getClient();
      const { data: userData, error: verifyError } = await client.auth.getUser(token);

      if (verifyError || !userData.user) {
        Logger.warn('JwtAuthGuard: Token verification failed:', verifyError);
        throw new UnauthorizedException('Invalid or expired token');
      }

      const payload = userData.user;

      // Attach user to request
      request.user = {
        id: payload.id,
        email: payload.email,
        user_metadata: payload.user_metadata,
        app_metadata: payload.app_metadata,
      };

      // Fetch and inject tenant_id, account_type, role, and tier globally
      const { data: profile, error: profileError } = await client
        .from('profiles')
        .select('tenant_id, account_type, role, tenants(tier)')
        .eq('id', payload.id)
        .maybeSingle();

      if (profileError) {
        Logger.warn('JwtAuthGuard: Profile fetch error:', profileError);
      }

      if (profile) {
        request.user.tenant_id = profile.tenant_id;
        request.user.account_type = profile.account_type || 'business';
        request.user.role = profile.role || 'owner';
        request.user.tier = profile.tenants?.[0]?.tier || 'free';
      }

      return true;
    } catch (error) {
      Logger.warn('JwtAuthGuard: Auth error:', error);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
