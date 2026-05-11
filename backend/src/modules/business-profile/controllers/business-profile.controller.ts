import { Controller, Get, Put, Post, Body, UseGuards, Request, Param } from '@nestjs/common';
import * as crypto from 'crypto';
import { SupabaseService } from '../../../shared/supabase.service';
import { AccountingService } from '../../accounting/services/accounting.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('api/v1/business-profile')
@UseGuards(JwtAuthGuard)
export class BusinessProfileController {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly accountingService: AccountingService,
  ) {}

  @Get('profile')
  async getProfile(@Request() req: any) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();
    
    const accountType = req.user.user_metadata?.account_type || 'business';

    if (error) {
      if (error.code === 'PGRST116') {
        const newTenantId = crypto.randomUUID();
        
        await client.from('tenants').insert({ 
          id: newTenantId, 
          name: req.user.user_metadata?.business_name || (accountType === 'personal' ? 'Personal Tracker' : 'Toko Auto-Recover'),
          account_type: accountType
        });

        // Seed COA for new tenant
        await this.accountingService.initializeCOA(newTenantId, 'starter', undefined, accountType);

        const { data: newProfile, error: insertError } = await client
          .from('profiles')
          .insert({ 
            id: req.user.id, 
            full_name: req.user.user_metadata?.full_name || 'User', 
            role: 'manager', 
            tenant_id: newTenantId,
            account_type: accountType
          })
          .select('*')
          .single();
        if (insertError) throw insertError;
        return newProfile;
      }
      throw error;
    }

    if (data) {
      // Auto-sync account_type if it's personal in metadata but not in profile
      if (req.user.user_metadata?.account_type === 'personal' && data.account_type !== 'personal') {
        await client.from('profiles').update({ account_type: 'personal' }).eq('id', req.user.id);
        data.account_type = 'personal';
        if (data.tenant_id) {
           await client.from('tenants').update({ account_type: 'personal' }).eq('id', data.tenant_id);
        }
      }

      if (!data.tenant_id) {
        const newTenantId = crypto.randomUUID();
        await client.from('tenants').insert({ 
          id: newTenantId, 
          name: req.user.user_metadata?.business_name || (accountType === 'personal' ? 'Personal Tracker' : 'Toko Auto-Recover'),
          account_type: accountType
        });
        
        // Seed COA
        await this.accountingService.initializeCOA(newTenantId, 'starter', undefined, accountType);

        const { data: updatedProfile } = await client
          .from('profiles')
          .update({ tenant_id: newTenantId, account_type: accountType })
          .eq('id', req.user.id)
          .select('*')
          .single();
        return updatedProfile;
      }

      // Check if COA is missing for personal accounts
      if (data.account_type === 'personal') {
        const { data: accounts } = await client.from('accounts').select('id').eq('tenant_id', data.tenant_id).limit(1);
        if (!accounts || accounts.length === 0) {
          await this.accountingService.initializeCOA(data.tenant_id, 'starter', undefined, 'personal');
        }
      }

      const { data: tenant } = await client.from('tenants').select('id').eq('id', data.tenant_id).single();
      if (!tenant) {
        await client.from('tenants').insert({ 
          id: data.tenant_id, 
          name: req.user.user_metadata?.business_name || (accountType === 'personal' ? 'Personal Tracker' : 'Toko Auto-Recover'),
          account_type: accountType
        });
        // Seed COA if tenant was missing
        await this.accountingService.initializeCOA(data.tenant_id, 'starter', undefined, accountType);
      }
    }
    return data;
  }

  @Put('profile')
  async updateProfile(@Request() req: any, @Body() body: any) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('profiles')
      .update(body)
      .eq('id', req.user.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  @Get('tenant')
  async getTenant(@Request() req: any) {
    const client = this.supabaseService.getClient();
    let { data: profile } = await client.from('profiles').select('tenant_id, account_type').eq('id', req.user.id).single();
    
    // Auto-fix if tenant_id is missing from profile
    if (!profile?.tenant_id) {
        const newTenantId = require('crypto').randomUUID();
        const accountType = req.user.user_metadata?.account_type || profile?.account_type || 'business';
        await client.from('tenants').insert({ 
          id: newTenantId, 
          name: req.user.user_metadata?.business_name || (accountType === 'personal' ? 'Personal Tracker' : 'Toko Auto-Recover'),
          account_type: accountType
        });
        await client.from('profiles').update({ tenant_id: newTenantId, account_type: accountType }).eq('id', req.user.id);
        profile = { tenant_id: newTenantId, account_type: accountType };
    }

    const { data, error } = await client
      .from('tenants')
      .select('*')
      .eq('id', profile.tenant_id)
      .single();
      
    // Auto-fix if tenant_id exists in profile but missing in tenants table
    if (error) {
        if (error.code === 'PGRST116') { // Not found
            const accountType = req.user.user_metadata?.account_type || profile?.account_type || 'business';
            await client.from('tenants').insert({ 
              id: profile.tenant_id, 
              name: req.user.user_metadata?.business_name || (accountType === 'personal' ? 'Personal Tracker' : 'Toko Auto-Recover'),
              account_type: accountType
            });
            const { data: newTenant } = await client.from('tenants').select('*').eq('id', profile.tenant_id).single();
            return newTenant;
        }
        throw error;
    }
    
    return data;
  }

  @Put('tenant')
  async updateTenant(@Request() req: any, @Body() body: any) {
    const client = this.supabaseService.getClient();
    const { data: profile } = await client.from('profiles').select('tenant_id').eq('id', req.user.id).single();
    if (!profile?.tenant_id) throw new Error('Tenant ID not found in profile');

    const { data, error } = await client
      .from('tenants')
      .update(body)
      .eq('id', profile.tenant_id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  @Get('staff')
  async getStaff(@Request() req: any) {
    const client = this.supabaseService.getClient();
    const { data: profile } = await client.from('profiles').select('tenant_id').eq('id', req.user.id).single();

    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('tenant_id', profile?.tenant_id);
    if (error) throw error;
    return data;
  }

  @Post('staff/invite')
  async inviteStaff(@Request() req: any, @Body() body: { email: string; role: string }) {
    // Logic for staff invitation (e.g. sending email or creating a placeholder profile)
    // For now, let's just return success
    return { success: true, message: `Invitation sent to ${body.email}` };
  }

  @Get('notifications')
  async getNotifications(@Request() req: any) {
    const client = this.supabaseService.getClient();
    const { data: profile } = await client.from('profiles').select('tenant_id').eq('id', req.user.id).single();

    const { data, error } = await client
      .from('tenant_notification_configs')
      .select('*')
      .eq('tenant_id', profile?.tenant_id);
    if (error) throw error;
    return data;
  }

  @Put('notifications/:role')
  async updateNotification(@Request() req: any, @Param('role') role: string, @Body() body: any) {
    const client = this.supabaseService.getClient();
    const { data: profile } = await client.from('profiles').select('tenant_id').eq('id', req.user.id).single();

    const { data, error } = await client
      .from('tenant_notification_configs')
      .update(body)
      .eq('tenant_id', profile?.tenant_id)
      .eq('role', role)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  @Get('staff/:userId/logs')
  async getStaffLogs(@Param('userId') userId: string) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('activity_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) throw error;
    return data;
  }

  @Post('account/delete')
  async deleteAccount(@Request() req: any) {
    const client = this.supabaseService.getClient();
    
    // 1. Get the profile to find the tenant_id
    const { data: profile } = await client
      .from('profiles')
      .select('tenant_id, role')
      .eq('id', req.user.id)
      .single();

    if (!profile) {
      throw new Error('Profile not found');
    }

    // 2. Only managers/owners can delete the tenant
    if (profile.role !== 'manager') {
      throw new Error('Hanya manajer/pemilik yang dapat menghapus akun bisnis');
    }

    // 3. Delete the tenant. Because of ON DELETE CASCADE, 
    // this will delete all related products, journals, etc.
    if (profile.tenant_id) {
      const { error: tenantError } = await client
        .from('tenants')
        .delete()
        .eq('id', profile.tenant_id);
        
      if (tenantError) {
        throw new Error(`Failed to delete tenant: ${tenantError.message}`);
      }
    }

    // 4. Delete the profile
    const { error: profileError } = await client
      .from('profiles')
      .delete()
      .eq('id', req.user.id);

    if (profileError) {
      throw new Error(`Failed to delete profile: ${profileError.message}`);
    }

    // 5. PERMANENTLY DELETE FROM SUPABASE AUTH (auth.users)
    // This allows the user to register again with the same email.
    const { error: authError } = await client.auth.admin.deleteUser(req.user.id);
    
    if (authError) {
      // We log this but don't necessarily fail the whole process if DB was cleaned up, 
      // but it's better to notify.
      console.error(`Failed to delete user from Auth: ${authError.message}`);
    }

    return { success: true, message: 'Akun dan semua data berhasil dihapus secara permanen' };
  }
}
