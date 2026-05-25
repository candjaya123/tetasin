import { Controller, Get, Post, Put, Patch, Param, Body, Query, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { OrderService } from '../services/order.service';
import { JwtAuthGuard } from '../../business-profile/guards/jwt-auth.guard';
import { RequireTier } from '../../../core/auth/tier.decorator';
import { SubscriptionTier } from '../../../core/constants/subscription-tier.enum';
import type { AuthenticatedRequest } from '../../../core/auth/authenticated-request.interface';

const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  draft: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['ready', 'cancelled'],
  ready: ['fulfilled', 'cancelled'],
  fulfilled: ['paid', 'cancelled'],
  invoiced: ['paid', 'cancelled'],
  paid: [],
  cancelled: [],
  voided: [],
};

const ROLE_TRANSITIONS: Record<string, Record<string, string[]>> = {
  kasir: {
    draft: ['confirmed', 'cancelled'],
    confirmed: [],
    processing: [],
    ready: [],
    fulfilled: ['paid', 'cancelled'],
    invoiced: ['paid', 'cancelled'],
    paid: [],
    cancelled: [],
    voided: [],
  },
  stok: {
    draft: [],
    confirmed: ['processing', 'cancelled'],
    processing: ['ready', 'cancelled'],
    ready: [],
    fulfilled: [],
    invoiced: [],
    paid: [],
    cancelled: [],
    voided: [],
  },
  dapur: {
    draft: [],
    confirmed: ['processing', 'cancelled'],
    processing: ['ready', 'cancelled'],
    ready: [],
    fulfilled: [],
    invoiced: [],
    paid: [],
    cancelled: [],
    voided: [],
  },
  manager: {
    draft: ['confirmed', 'cancelled', 'voided'],
    confirmed: ['processing', 'ready', 'fulfilled', 'cancelled', 'voided'],
    processing: ['ready', 'fulfilled', 'cancelled', 'voided'],
    ready: ['fulfilled', 'cancelled', 'voided'],
    fulfilled: ['invoiced', 'paid', 'cancelled', 'voided'],
    invoiced: ['paid', 'cancelled', 'voided'],
    paid: ['voided'],
    cancelled: [],
    voided: [],
  },
};

@Controller('api/v1/orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // ========== Pesanan (Sales Orders) — Contracted Endpoints ==========
  @Get()
  @RequireTier(SubscriptionTier.FREE)
  async getOrders(
    @Request() req: AuthenticatedRequest,
    @Query('status') status?: string,
    @Query('source') source?: string,
  ) {
    return this.orderService.getSalesOrders(req.user.tenant_id, status, source);
  }

  @Post()
  @RequireTier(SubscriptionTier.PRO)
  async createOrder(@Request() req: AuthenticatedRequest, @Body() body: any) {
    return this.orderService.createSalesOrder(req.user.tenant_id, body, req.user.id);
  }

  @Get(':id')
  @RequireTier(SubscriptionTier.FREE)
  async getOrder(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.orderService.getSalesOrder(req.user.tenant_id, id);
  }

  @Patch(':id/status')
  @RequireTier(SubscriptionTier.FREE)
  async updateOrderStatus(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: { status: string; division_note?: string; division?: string },
  ) {
    const role = req.user.role || '';
    const currentStatus = await this.orderService.getSalesOrderStatus(req.user.tenant_id, id);

    const allowed = VALID_STATUS_TRANSITIONS[currentStatus];
    if (!allowed || !allowed.includes(body.status)) {
      throw new BadRequestException(
        `Transisi status tidak valid: ${currentStatus} -> ${body.status}. ` +
        `Status yang diizinkan: ${(allowed || []).join(', ') || 'tidak ada'}`,
      );
    }

    const roleAllowed = ROLE_TRANSITIONS[role]?.[currentStatus] || [];
    if (role !== 'manager' && !roleAllowed.includes(body.status)) {
      throw new BadRequestException(`Role ${role} tidak dapat mengubah status ke ${body.status}`);
    }

    return this.orderService.updateSalesOrderStatus(
      req.user.tenant_id,
      id,
      body.status,
      body.division_note,
      body.division,
      req.user.id,
    );
  }

  @Patch(':id/void')
  @RequireTier(SubscriptionTier.PRO)
  async voidOrder(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    const role = req.user.role || '';
    if (role !== 'manager') {
      throw new BadRequestException('Hanya manager yang dapat membatalkan pesanan.');
    }
    return this.orderService.updateSalesOrderStatus(
      req.user.tenant_id, id, 'voided', undefined, undefined, req.user.id,
    );
  }

  @Patch(':id/division-notes')
  @RequireTier(SubscriptionTier.FREE)
  async updateSalesOrderDivisionNotes(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: { kasir?: string; stok?: string; dapur?: string },
  ) {
    return this.orderService.updateSalesOrderDivisionNotes(
      req.user.tenant_id,
      id,
      body,
    );
  }

  // ========== Customers ==========
  @Get('customers')
  @RequireTier(SubscriptionTier.FREE)
  async getCustomers(@Request() req: AuthenticatedRequest) {
    return this.orderService.getCustomers(req.user.tenant_id);
  }

  @Post('customers')
  @RequireTier(SubscriptionTier.FREE)
  async createCustomer(@Request() req: AuthenticatedRequest, @Body() body: any) {
    return this.orderService.createCustomer(req.user.tenant_id, body);
  }

  @Put('customers/:id')
  @RequireTier(SubscriptionTier.FREE)
  async updateCustomer(@Request() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: any) {
    return this.orderService.updateCustomer(req.user.tenant_id, id, body);
  }

  // ========== Purchase Orders (Extra — to be migrated to Procurement) ==========
  @Get('purchase')
  @RequireTier(SubscriptionTier.FREE)
  async getPurchaseOrders(@Request() req: AuthenticatedRequest) {
    return this.orderService.getPurchaseOrders(req.user.tenant_id);
  }

  @Post('purchase')
  @RequireTier(SubscriptionTier.PRO)
  async createPurchaseOrder(@Request() req: AuthenticatedRequest, @Body() body: any) {
    return this.orderService.createPurchaseOrder(req.user.tenant_id, body);
  }

  @Put('purchase/:id')
  @RequireTier(SubscriptionTier.PRO)
  async updatePurchaseOrder(@Request() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: any) {
    return this.orderService.updatePurchaseOrder(req.user.tenant_id, id, body);
  }

  @Post('purchase/:id/receive')
  @RequireTier(SubscriptionTier.PRO)
  async receivePurchaseOrder(@Request() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: { items: Array<{ item_id: string; received_qty: number }> }) {
    return this.orderService.receivePurchaseOrder(req.user.tenant_id, id, body.items, req.user.id);
  }
}
