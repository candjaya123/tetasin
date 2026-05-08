import { Controller, Get, Post, Body, UseGuards, Request, Param } from '@nestjs/common';
import { OrderService } from '../services/order.service';
import { RequireTier } from '../../../core/auth/tier.decorator';
import { SubscriptionTier } from '../../../core/auth/tier.enum';

@Controller('api/v1/orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('purchase')
  @RequireTier(SubscriptionTier.FULL)
  async getPurchaseOrders(@Request() req: any) {
    return this.orderService.getPurchaseOrders(req.user.tenant_id);
  }

  @Post('purchase')
  @RequireTier(SubscriptionTier.FULL)
  async createPurchaseOrder(@Request() req: any, @Body() body: any) {
    return this.orderService.createPurchaseOrder(req.user.tenant_id, body);
  }

  @Get('sales')
  @RequireTier(SubscriptionTier.FULL)
  async getSalesOrders(@Request() req: any) {
    return this.orderService.getSalesOrders(req.user.tenant_id);
  }

  @Post('sales')
  @RequireTier(SubscriptionTier.FULL)
  async createSalesOrder(@Request() req: any, @Body() body: any) {
    return this.orderService.createSalesOrder(req.user.tenant_id, body);
  }
}
