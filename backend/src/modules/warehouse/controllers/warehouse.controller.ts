import { Controller, Get, Post, Put, Delete, Body, Param, Request } from '@nestjs/common';
import { WarehouseService } from '../services/warehouse.service';

@Controller('api/v1/warehouses')
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Get()
  async getWarehouses(@Request() req: any) {
    return this.warehouseService.getWarehouses(req.user.tenant_id);
  }

  @Post()
  async createWarehouse(@Request() req: any, @Body() body: any) {
    return this.warehouseService.createWarehouse(req.user.tenant_id, body);
  }

  @Put(':id')
  async updateWarehouse(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    return this.warehouseService.updateWarehouse(id, req.user.tenant_id, body);
  }

  @Delete(':id')
  async deleteWarehouse(@Request() req: any, @Param('id') id: string) {
    return this.warehouseService.deleteWarehouse(id, req.user.tenant_id);
  }

  @Post('transfers')
  async createTransfer(@Request() req: any, @Body() body: any) {
    return this.warehouseService.createStockTransfer(req.user.tenant_id, req.user.id, body);
  }

  @Post('opnames')
  async createOpname(@Request() req: any, @Body() body: any) {
    return this.warehouseService.createStockOpname(req.user.tenant_id, req.user.id, body);
  }
}
