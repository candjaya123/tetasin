import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
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
      // Fast local JWT decode (bypassing Supabase network call for local dev)
      let payloadBase64 = token.split('.')[1];
      payloadBase64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
      const decodedJson = Buffer.from(payloadBase64, 'base64').toString('utf-8');
      const payload = JSON.parse(decodedJson);
      
      if (!payload.sub) throw new Error('Invalid token payload');

      // Attach user to request
      request.user = {
        id: payload.sub,
        email: payload.email,
        user_metadata: payload.user_metadata,
        app_metadata: payload.app_metadata
      };

      // Fetch and inject tenant_id, account_type, and tier globally for all controllers
      const client = this.supabaseService.getClient();
      const { data: profile, error: profileError } = await client
        .from('profiles')
        .select('tenant_id, account_type, role')
        .eq('id', payload.sub)
        .maybeSingle();

      if (profileError) {
        console.error('JwtAuthGuard: Profile fetch error:', profileError);
      }
      
      if (profile) {
        request.user.tenant_id = profile.tenant_id;
        request.user.account_type = profile.account_type || 'business';
        request.user.role = profile.role || 'owner';
      }
      
      return true;
    } catch (error) {
      console.error('JwtAuthGuard: Fast decode error:', error);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
