import { Controller, Post, Param, UseGuards, Request, Get, Body } from '@nestjs/common';
import { SupabaseService } from '../../../shared/supabase.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { MidtransService } from '../../../shared/midtrans.service';
import { RequireTier } from '../../../core/auth/tier.decorator';
import { SubscriptionTier } from '../../../core/constants/subscription-tier.enum';
import type { AuthenticatedRequest } from '../../../core/auth/authenticated-request.interface';

@Controller('api/v1/payouts')
@UseGuards(JwtAuthGuard)
@RequireTier(SubscriptionTier.PRO)
export class PayoutController {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly midtransService: MidtransService,
  ) {}

  @Get()
  async getAllPayouts(@Request() req: AuthenticatedRequest) {
    // ... rest of the code
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('payout_requests')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  @Post(':id/approve')
  async approvePayout(@Param('id') id: string) {
    const client = this.supabaseService.getClient();
    const { error } = await client.rpc('approve_payout', { p_payout_id: id });
    if (error) throw error;
    return { success: true };
  }

  @Post('execute')
  async executePayout(@Body() payload: any) {
    // Logic to execute via Midtrans IRIS
    const result = await this.midtransService.executePayout(payload);
    return result;
  }

  @Post(':id/reject')
  async rejectPayout(@Param('id') id: string) {
    const client = this.supabaseService.getClient();
    const { error } = await client.rpc('reject_payout', { p_payout_id: id });
    if (error) throw error;
    return { success: true };
  }
}
