import { Controller, Get, Post, Body, UseGuards, Request, Param } from '@nestjs/common';
import { OrderService } from '../services/order.service';

@Controller('api/v1/orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('purchase')
  async getPurchaseOrders(@Request() req: any) {
    return this.orderService.getPurchaseOrders(req.user.tenant_id);
  }

  @Post('purchase')
  async createPurchaseOrder(@Request() req: any, @Body() body: any) {
    return this.orderService.createPurchaseOrder(req.user.tenant_id, body);
  }

  @Get('sales')
  async getSalesOrders(@Request() req: any) {
    return this.orderService.getSalesOrders(req.user.tenant_id);
  }

  @Post('sales')
  async createSalesOrder(@Request() req: any, @Body() body: any) {
    return this.orderService.createSalesOrder(req.user.tenant_id, body);
  }
}
