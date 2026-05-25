import { Controller, Post, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
import { SalesService } from '../services/sales.service';
import { ProcessSaleDto } from './process-sale.dto';
import { MidtransService } from '../../../shared/midtrans.service';
import { JwtAuthGuard } from '../../business-profile/guards/jwt-auth.guard';
import { RequireTier } from '../../../core/auth/tier.decorator';
import { SubscriptionTier } from '../../../core/constants/subscription-tier.enum';
import type { AuthenticatedRequest } from '../../../core/auth/authenticated-request.interface';

@Controller('api/v1/sales')
@UseGuards(JwtAuthGuard)
export class SalesController {
  constructor(
    private readonly salesService: SalesService,
    private readonly midtransService: MidtransService,
  ) {}

  @Post()
  @RequireTier(SubscriptionTier.FREE)
  async processSale(@Request() req: AuthenticatedRequest, @Body() payload: ProcessSaleDto) {
    // Auto-inject entity_id from token if not provided
    payload.entity_id = payload.entity_id || req.user.tenant_id;
    
    // Convert payment_method from frontend into appropriate payment_account_code 
    // This allows the service to lookup the right account ID if payment_account_id is missing.
    // The service currently looks up codes. We'll pass the hint via a temporary field or just let the service handle it.
    // Actually, I should update the DTO and Service to handle `payment_method` or map it here.
    const methodMap: Record<string, string> = {
      'Tunai': '1-10000',
      'Transfer': '1-10001',
      'E-Wallet': '1-10002'
    };
    // We can pass the mapped code back to the payload so SalesService can use it.
    // Since SalesService expects payment_account_id, we can't just pass the code there.
    // But SalesService falls back to '1-10000'. We should modify SalesService to accept the code from payload.
    // Let's pass it as a custom property for now.
    (payload as any).payment_account_code = methodMap[(payload as any).payment_method] || '1-10000';

    return await this.salesService.processSale(req.user, payload);
  }

  @Patch(':id/void')
  @RequireTier(SubscriptionTier.PRO)
  async voidSale(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return await this.salesService.voidSale(req.user, id);
  }

  @Post('checkout-midtrans')
  @RequireTier(SubscriptionTier.FREE)
  async checkoutMidtrans(@Body() payload: any, @Request() req: AuthenticatedRequest) {
    const { amount, items } = payload;
    const orderId = `ORDER-${Date.now()}-${req.user.id.slice(0, 5)}`;
    
    return await this.midtransService.createSnapToken({
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      item_details: items,
      customer_details: {
        first_name: req.user.email.split('@')[0],
        email: req.user.email,
        phone: '',
      },
    });
  }
}
