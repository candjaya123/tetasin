import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { WarehouseService } from '../services/warehouse.service';
import { RequireTier } from '../../../core/auth/tier.decorator';
import { SubscriptionTier } from '../../../core/auth/tier.enum';

@Controller('api/v1/warehouses')
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Get()
  @RequireTier(SubscriptionTier.FULL)
  async getWarehouses(@Request() req: any) {
    return this.warehouseService.getWarehouses(req.user.tenant_id);
  }

  @Post()
  @RequireTier(SubscriptionTier.FULL)
  async createWarehouse(@Request() req: any, @Body() body: any) {
    return this.warehouseService.createWarehouse(req.user.tenant_id, body);
  }

  @Put(':id')
  @RequireTier(SubscriptionTier.FULL)
  async updateWarehouse(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    return this.warehouseService.updateWarehouse(id, req.user.tenant_id, body);
  }

  @Delete(':id')
  @RequireTier(SubscriptionTier.FULL)
  async deleteWarehouse(@Request() req: any, @Param('id') id: string) {
    return this.warehouseService.deleteWarehouse(id, req.user.tenant_id);
  }

  @Post('transfers')
  @RequireTier(SubscriptionTier.FULL)
  async createTransfer(@Request() req: any, @Body() body: any) {
    return this.warehouseService.createStockTransfer(req.user.tenant_id, req.user.id, body);
  }

  @Post('opnames')
  @RequireTier(SubscriptionTier.FULL)
  async createOpname(@Request() req: any, @Body() body: any) {
    return this.warehouseService.createStockOpname(req.user.tenant_id, req.user.id, body);
  }
}
