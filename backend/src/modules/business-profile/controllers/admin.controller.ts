import { Controller, Get, Put, Delete, Param, Body, UseGuards, Request, ForbiddenException, NotFoundException, InternalServerErrorException, Logger } from '@nestjs/common';
import { SupabaseService } from '../../../shared/supabase.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../../../core/auth/authenticated-request.interface';

@Controller('api/v1/admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Get('tenants')
  async getTenants(@Request() req: AuthenticatedRequest) {
    // Check if user is super_admin (logic to be implemented or rely on role in JWT)
    if (req.user.role !== 'super_admin') {
      throw new Error('Unauthorized: Super Admin access only');
    }

    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('tenants')
      .select(`
        *,
        profiles:profiles(count)
      `);
    
    if (error) throw error;
    return data;
  }

  @Put('tenants/:id')
  async updateTenant(@Param('id') id: string, @Body() body: any) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('tenants')
      .update(body)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  /**
   * Hard-delete a user from Supabase Auth + all related data.
   * Fixes the "User already registered" error when re-registering
   * with a previously deleted account's email.
   */
  @Delete('users/:userId')
  async deleteUser(@Param('userId') userId: string, @Request() req: AuthenticatedRequest) {
    const logger = new Logger('AdminController');

    if (req.user.role !== 'super_admin') {
      throw new ForbiddenException('Super Admin access only');
    }

    const client = this.supabaseService.getClient();

    try {
      // 1. Hard-delete from Supabase Auth (removes from auth.users permanently)
      //    This is the root cause fix: allows the email to be re-used for signup
      const { error: authError } = await client.auth.admin.deleteUser(userId);

      if (authError) {
        if (authError.message?.includes('User not found')) {
          throw new NotFoundException(`User ${userId} tidak ditemukan di Supabase Auth.`);
        }
        throw new InternalServerErrorException(`Gagal menghapus dari Auth: ${authError.message}`);
      }

      logger.log(`User ${userId} berhasil dihapus dari Supabase Auth oleh ${req.user.email}`);

      return {
        success: true,
        message: `User ${userId} telah berhasil dihapus. Email dapat digunakan untuk registrasi ulang.`,
      };
    } catch (err) {
      if (err instanceof ForbiddenException || err instanceof NotFoundException) throw err;
      logger.error(`Failed to delete user ${userId}: ${err.message}`);
      throw new InternalServerErrorException(`Gagal menghapus user: ${err.message}`);
    }
  }
}
