import { Controller, Get, Post, Put, Delete, Body, Param, Request, UseGuards } from '@nestjs/common';
import { WarehouseService } from '../services/warehouse.service';
import { JwtAuthGuard } from '../../business-profile/guards/jwt-auth.guard';
import { RequireTier } from '../../../core/auth/tier.decorator';
import { SubscriptionTier } from '../../../core/constants/subscription-tier.enum';
import type { AuthenticatedRequest } from '../../../core/auth/authenticated-request.interface';

@Controller('api/v1/warehouses')
@UseGuards(JwtAuthGuard)
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Get()
  @RequireTier(SubscriptionTier.FREE)
  async getWarehouses(@Request() req: AuthenticatedRequest) {
    return this.warehouseService.getWarehouses(req.user.tenant_id);
  }

  @Post()
  @RequireTier(SubscriptionTier.PRO)
  async createWarehouse(@Request() req: AuthenticatedRequest, @Body() body: any) {
    return this.warehouseService.createWarehouse(req.user.tenant_id, body);
  }

  @Put(':id')
  @RequireTier(SubscriptionTier.PRO)
  async updateWarehouse(@Request() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: any) {
    return this.warehouseService.updateWarehouse(id, req.user.tenant_id, body);
  }

  @Delete(':id')
  @RequireTier(SubscriptionTier.PRO)
  async deleteWarehouse(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.warehouseService.deleteWarehouse(id, req.user.tenant_id);
  }

  @Post('transfers')
  @RequireTier(SubscriptionTier.PRO)
  async createTransfer(@Request() req: AuthenticatedRequest, @Body() body: any) {
    return this.warehouseService.createStockTransfer(req.user.tenant_id, req.user.id, body);
  }

  @Post('opnames')
  @RequireTier(SubscriptionTier.PRO)
  async createOpname(@Request() req: AuthenticatedRequest, @Body() body: any) {
    return this.warehouseService.createStockOpname(req.user.tenant_id, req.user.id, body);
  }
}
