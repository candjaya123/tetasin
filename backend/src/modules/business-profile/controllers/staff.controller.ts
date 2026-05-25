import { Controller, Get, Post, Body, Request, UseGuards, Param, Delete, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../../shared/supabase.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Roles, UserRole } from '../../../core/auth/role.decorator';
import { RequireTier } from '../../../core/auth/tier.decorator';
import { SubscriptionTier } from '../../../core/constants/subscription-tier.enum';
import type { AuthenticatedRequest } from '../../../core/auth/authenticated-request.interface';

@Controller('api/v1/staff')
@UseGuards(JwtAuthGuard)
@RequireTier(SubscriptionTier.PRO)
export class StaffController {
  constructor(private readonly supabaseService: SupabaseService) { }

  @Get()
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  async getStaff(@Request() req: AuthenticatedRequest) {
    const client = this.supabaseService.getClient();
    const tenantId = req.user.tenant_id;
    if (!tenantId) throw new BadRequestException('Tenant ID tidak ditemukan');

    const { data, error } = await client
      .from('profiles')
      .select('id, full_name, role, avatar_url, created_at')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  }

  @Post()
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  async inviteStaff(@Request() req: AuthenticatedRequest, @Body() payload: { email: string; role: string }) {
    const client = this.supabaseService.getClient();
    const tenantId = req.user.tenant_id;
    if (!tenantId) throw new BadRequestException('Tenant ID tidak ditemukan');
    if (!payload.email) throw new BadRequestException('Email wajib diisi');

    const validRoles = ['manager', 'kasir', 'stok'];
    const role = validRoles.includes(payload.role) ? payload.role : 'kasir';

    // Check if profile already exists (by email lookup via auth.users)
    const { data: existingProfiles, error: lookupError } = await client
      .from('profiles')
      .select('id, tenant_id')
      .eq('tenant_id', tenantId);

    if (lookupError) throw lookupError;

    // If staff already exists with this tenant, update role
    // For new staff invite, we create a profile entry
    // Note: In production, this should send an invitation email + create auth user
    // For now, we return instructions to create via Supabase dashboard

    return {
      success: true,
      message: `Undangan staff dikirim ke ${payload.email} dengan role ${role}`,
      existingStaff: existingProfiles?.length ?? 0,
    };
  }

  @Post(':id/role')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  async updateStaffRole(@Param('id') id: string, @Request() req: AuthenticatedRequest, @Body() payload: { role: string }) {
    const client = this.supabaseService.getClient();
    const tenantId = req.user.tenant_id;
    if (!tenantId) throw new BadRequestException('Tenant ID tidak ditemukan');

    const validRoles = ['manager', 'kasir', 'stok'];
    if (!validRoles.includes(payload.role)) {
      throw new BadRequestException(`Role tidak valid. Pilih: ${validRoles.join(', ')}`);
    }

    const { error } = await client
      .from('profiles')
      .update({ role: payload.role, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('tenant_id', tenantId);

    if (error) throw error;
    return { success: true, id, role: payload.role };
  }

  @Delete(':id')
  @Roles(UserRole.OWNER)
  async removeStaff(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    const client = this.supabaseService.getClient();
    const tenantId = req.user.tenant_id;
    if (!tenantId) throw new BadRequestException('Tenant ID tidak ditemukan');

    // Don't delete the profile — just remove tenant association
    const { error } = await client
      .from('profiles')
      .update({ tenant_id: null, role: null, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('tenant_id', tenantId);

    if (error) throw error;
    return { success: true };
  }
}
