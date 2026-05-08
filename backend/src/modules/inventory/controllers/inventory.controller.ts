import { Controller, Get, Post, Put, Patch, Delete, Body, Param, UseGuards, Request, UseInterceptors, UploadedFile, Query } from '@nestjs/common';
import { InventoryService } from '../services/inventory.service';
import { JwtAuthGuard } from '../../business-profile/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('api/v1/inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any
  ) {
    if (!file) throw new Error('No file uploaded');
    const tenantId = req.user.tenant_id || req.user.entity_id;
    const url = await this.inventoryService.uploadFile(tenantId, file);
    return { url };
  }

  @Get('raw-materials')
  async getRawMaterials(@Request() req: any) {
    const tenantId = req.user.tenant_id || req.user.entity_id;
    return this.inventoryService.getRawMaterials(tenantId);
  }

  @Post('raw-materials')
  async addRawMaterial(@Request() req: any, @Body() body: any) {
    const tenantId = req.user.tenant_id || req.user.entity_id;
    return this.inventoryService.addRawMaterial(tenantId, body);
  }

  @Put('raw-materials/:id')
  async updateRawMaterial(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    const tenantId = req.user.tenant_id || req.user.entity_id;
    return this.inventoryService.updateRawMaterial(id, tenantId, body);
  }

  @Delete('raw-materials/:id')
  async deleteRawMaterial(@Request() req: any, @Param('id') id: string) {
    const tenantId = req.user.tenant_id || req.user.entity_id;
    return this.inventoryService.deleteRawMaterial(id, tenantId);
  }

  @Get('products')
  async getProducts(@Request() req: any, @Query('search') search?: string) {
    const tenantId = req.user.tenant_id || req.user.entity_id;
    return this.inventoryService.getProducts(tenantId, search);
  }

  @Post('products')
  async createProduct(@Request() req: any, @Body() body: any) {
    return this.inventoryService.createProductWithRecipe(req.user, body);
  }

  @Put('products/:id')
  async updateProduct(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    const tenantId = req.user.tenant_id || req.user.entity_id;
    return this.inventoryService.updateProductWithRecipe(id, tenantId, body);
  }

  @Patch('products/:id/stock')
  async updateProductStock(@Request() req: any, @Param('id') id: string, @Body() body: { stock: number }) {
    const tenantId = req.user.tenant_id || req.user.entity_id;
    return this.inventoryService.updateProductStock(id, tenantId, body.stock);
  }

  @Delete('products/:id')
  async deleteProduct(@Request() req: any, @Param('id') id: string) {
    const tenantId = req.user.tenant_id || req.user.entity_id;
    return this.inventoryService.deleteProduct(id, tenantId);
  }

  @Get('bills')
  async getBills(@Request() req: any) {
    const tenantId = req.user.tenant_id || req.user.entity_id;
    return this.inventoryService.getBills(tenantId);
  }

  @Post('bills')
  async addBill(@Request() req: any, @Body() body: any) {
    const tenantId = req.user.tenant_id || req.user.entity_id;
    return this.inventoryService.addBill(tenantId, body);
  }

  @Put('bills/:id')
  async updateBill(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    const tenantId = req.user.tenant_id || req.user.entity_id;
    return this.inventoryService.updateBill(id, tenantId, body);
  }

  @Delete('bills/:id')
  async deleteBill(@Request() req: any, @Param('id') id: string) {
    const tenantId = req.user.tenant_id || req.user.entity_id;
    return this.inventoryService.deleteBill(id, tenantId);
  }

  @Get('assets')
  async getAssets(@Request() req: any) {
    const tenantId = req.user.tenant_id || req.user.entity_id;
    return this.inventoryService.getAssets(tenantId);
  }

  @Post('assets')
  async addAsset(@Request() req: any, @Body() body: any) {
    const tenantId = req.user.tenant_id || req.user.entity_id;
    return this.inventoryService.addAsset(tenantId, body);
  }

  @Put('assets/:id')
  async updateAsset(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    const tenantId = req.user.tenant_id || req.user.entity_id;
    return this.inventoryService.updateAsset(id, tenantId, body);
  }

  @Delete('assets/:id')
  async deleteAsset(@Request() req: any, @Param('id') id: string) {
    const tenantId = req.user.tenant_id || req.user.entity_id;
    return this.inventoryService.deleteAsset(id, tenantId);
  }

  @Get('warehouses')
  async getWarehouses(@Request() req: any) {
    const tenantId = req.user.tenant_id || req.user.entity_id;
    return this.inventoryService.getWarehouses(tenantId);
  }

  @Post('transfer')
  async stockTransfer(@Request() req: any, @Body() body: any) {
    const tenantId = req.user.tenant_id || req.user.entity_id;
    return this.inventoryService.stockTransfer(tenantId, body);
  }

  @Post('opname')
  async stockOpname(@Request() req: any, @Body() body: any) {
    const tenantId = req.user.tenant_id || req.user.entity_id;
    return this.inventoryService.stockOpname(tenantId, body);
  }
}
