import { Controller, Get, Post, Put, Patch, Delete, Body, Param, UseGuards, Request, UseInterceptors, UploadedFile, Query } from '@nestjs/common';
import { InventoryService } from '../services/inventory.service';
import { JwtAuthGuard } from '../../business-profile/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { RequireTier } from '../../../core/auth/tier.decorator';
import { SubscriptionTier } from '../../../core/constants/subscription-tier.enum';
import type { AuthenticatedRequest } from '../../../core/auth/authenticated-request.interface';
import { CreateProductDto, UpdateProductDto, UpdateStockDto } from './dto/inventory.dto';

@Controller('api/v1/inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @RequireTier(SubscriptionTier.PRO)
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: AuthenticatedRequest
  ) {
    if (!file) throw new Error('No file uploaded');
    const tenantId = (req.user.tenant_id || req.user.entity_id)!;
    const url = await this.inventoryService.uploadFile(tenantId, file);
    return { url };
  }

  @Get('raw-materials')
  @RequireTier(SubscriptionTier.FREE)
  async getRawMaterials(@Request() req: AuthenticatedRequest) {
    const tenantId = (req.user.tenant_id || req.user.entity_id)!;
    return this.inventoryService.getRawMaterials(tenantId);
  }

  @Post('raw-materials')
  @RequireTier(SubscriptionTier.PRO)
  async addRawMaterial(@Request() req: AuthenticatedRequest, @Body() body: any) {
    const tenantId = (req.user.tenant_id || req.user.entity_id)!;
    return this.inventoryService.addRawMaterial(tenantId, body);
  }

  @Get('raw-materials/:id')
  @RequireTier(SubscriptionTier.FREE)
  async getRawMaterialById(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    const tenantId = (req.user.tenant_id || req.user.entity_id)!;
    return this.inventoryService.getRawMaterialById(tenantId, id);
  }

  @Patch('raw-materials/:id')
  @RequireTier(SubscriptionTier.PRO)
  async updateRawMaterial(@Request() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: any) {
    const tenantId = (req.user.tenant_id || req.user.entity_id)!;
    return this.inventoryService.updateRawMaterial(id, tenantId, body);
  }

  @Delete('raw-materials/:id')
  @RequireTier(SubscriptionTier.PRO)
  async deleteRawMaterial(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    const tenantId = (req.user.tenant_id || req.user.entity_id)!;
    return this.inventoryService.deleteRawMaterial(id, tenantId);
  }

  @Get('products')
  @RequireTier(SubscriptionTier.FREE)
  async getProducts(@Request() req: AuthenticatedRequest, @Query('search') search?: string) {
    const tenantId = (req.user.tenant_id || req.user.entity_id)!;
    return this.inventoryService.getProducts(tenantId, search);
  }

  @Post('products')
  @RequireTier(SubscriptionTier.PRO)
  async createProduct(@Request() req: AuthenticatedRequest, @Body() body: CreateProductDto) {
    return this.inventoryService.createProductWithRecipe(req.user, body);
  }

  @Put('products/:id')
  @RequireTier(SubscriptionTier.PRO)
  async updateProduct(@Request() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: UpdateProductDto) {
    const tenantId = (req.user.tenant_id || req.user.entity_id)!;
    return this.inventoryService.updateProductWithRecipe(id, tenantId, body);
  }

  @Patch('products/:id/stock')
  @RequireTier(SubscriptionTier.PRO)
  async updateProductStock(@Request() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: UpdateStockDto) {
    const tenantId = (req.user.tenant_id || req.user.entity_id)!;
    return this.inventoryService.updateProductStock(id, tenantId, body.stock);
  }

  @Get('products/:id')
  @RequireTier(SubscriptionTier.FREE)
  async getProductById(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    const tenantId = (req.user.tenant_id || req.user.entity_id)!;
    return this.inventoryService.getProductById(tenantId, id);
  }

  @Delete('products/:id')
  @RequireTier(SubscriptionTier.PRO)
  async deleteProduct(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    const tenantId = (req.user.tenant_id || req.user.entity_id)!;
    return this.inventoryService.deleteProduct(id, tenantId);
  }

  @Get('products/:id/recipes')
  @RequireTier(SubscriptionTier.FREE)
  async getProductRecipes(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    const tenantId = (req.user.tenant_id || req.user.entity_id)!;
    return this.inventoryService.getProductRecipes(tenantId, id);
  }

  @Post('products/:id/recipes')
  @RequireTier(SubscriptionTier.PRO)
  async addProductRecipe(@Request() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: any) {
    const tenantId = (req.user.tenant_id || req.user.entity_id)!;
    return this.inventoryService.addProductRecipe(tenantId, id, body);
  }

  @Patch('products/:id/recipes/:rid')
  @RequireTier(SubscriptionTier.PRO)
  async updateProductRecipe(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Param('rid') rid: string,
    @Body() body: any,
  ) {
    const tenantId = (req.user.tenant_id || req.user.entity_id)!;
    return this.inventoryService.updateProductRecipe(tenantId, id, rid, body);
  }

  @Delete('products/:id/recipes/:rid')
  @RequireTier(SubscriptionTier.PRO)
  async deleteProductRecipe(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Param('rid') rid: string,
  ) {
    const tenantId = (req.user.tenant_id || req.user.entity_id)!;
    return this.inventoryService.deleteProductRecipe(tenantId, id, rid);
  }

  @Get('products/:id/hpp-preview')
  @RequireTier(SubscriptionTier.FREE)
  async getHppPreview(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    const tenantId = (req.user.tenant_id || req.user.entity_id)!;
    return this.inventoryService.getHppPreview(tenantId, id);
  }

  @Post('stock-adjustment')
  @RequireTier(SubscriptionTier.PRO)
  async stockAdjustment(@Request() req: AuthenticatedRequest, @Body() body: any) {
    const tenantId = (req.user.tenant_id || req.user.entity_id)!;
    return this.inventoryService.stockAdjustment(tenantId, body);
  }

  @Get('products/:id/behavior')
  @RequireTier(SubscriptionTier.FREE)
  async getProductBehavior(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    const tenantId = (req.user.tenant_id || req.user.entity_id)!;
    return this.inventoryService.getProductBehavior(tenantId, id);
  }

  @Post('products/:id/behavior')
  @RequireTier(SubscriptionTier.PRO)
  async setProductBehavior(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const tenantId = (req.user.tenant_id || req.user.entity_id)!;
    return this.inventoryService.setProductBehavior(tenantId, id, body);
  }

  @Delete('products/:id/behavior')
  @RequireTier(SubscriptionTier.PRO)
  async deleteProductBehavior(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    const tenantId = (req.user.tenant_id || req.user.entity_id)!;
    return this.inventoryService.deleteProductBehavior(tenantId, id);
  }

  @Get('bills')
  @RequireTier(SubscriptionTier.FREE)
  async getBills(@Request() req: AuthenticatedRequest) {
    const tenantId = (req.user.tenant_id || req.user.entity_id)!;
    return this.inventoryService.getBills(tenantId);
  }

  @Post('bills')
  @RequireTier(SubscriptionTier.PRO)
  async addBill(@Request() req: AuthenticatedRequest, @Body() body: any) {
    const tenantId = (req.user.tenant_id || req.user.entity_id)!;
    return this.inventoryService.addBill(tenantId, body);
  }

  @Put('bills/:id')
  @RequireTier(SubscriptionTier.PRO)
  async updateBill(@Request() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: any) {
    const tenantId = (req.user.tenant_id || req.user.entity_id)!;
    return this.inventoryService.updateBill(id, tenantId, body);
  }

  @Delete('bills/:id')
  @RequireTier(SubscriptionTier.PRO)
  async deleteBill(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    const tenantId = (req.user.tenant_id || req.user.entity_id)!;
    return this.inventoryService.deleteBill(id, tenantId);
  }

  @Get('assets')
  @RequireTier(SubscriptionTier.FREE)
  async getAssets(@Request() req: AuthenticatedRequest) {
    const tenantId = (req.user.tenant_id || req.user.entity_id)!;
    return this.inventoryService.getAssets(tenantId);
  }

  @Post('assets')
  @RequireTier(SubscriptionTier.PRO)
  async addAsset(@Request() req: AuthenticatedRequest, @Body() body: any) {
    const tenantId = (req.user.tenant_id || req.user.entity_id)!;
    return this.inventoryService.addAsset(tenantId, body);
  }

  @Put('assets/:id')
  @RequireTier(SubscriptionTier.PRO)
  async updateAsset(@Request() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: any) {
    const tenantId = (req.user.tenant_id || req.user.entity_id)!;
    return this.inventoryService.updateAsset(id, tenantId, body);
  }

  @Delete('assets/:id')
  @RequireTier(SubscriptionTier.PRO)
  async deleteAsset(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    const tenantId = (req.user.tenant_id || req.user.entity_id)!;
    return this.inventoryService.deleteAsset(id, tenantId);
  }

  @Get('warehouses')
  @RequireTier(SubscriptionTier.FREE)
  async getWarehouses(@Request() req: AuthenticatedRequest) {
    const tenantId = (req.user.tenant_id || req.user.entity_id)!;
    return this.inventoryService.getWarehouses(tenantId);
  }

  @Post('transfer')
  @RequireTier(SubscriptionTier.PRO)
  async stockTransfer(@Request() req: AuthenticatedRequest, @Body() body: any) {
    const tenantId = (req.user.tenant_id || req.user.entity_id)!;
    return this.inventoryService.stockTransfer(tenantId, body);
  }

  @Post('opname')
  @RequireTier(SubscriptionTier.PRO)
  async stockOpname(@Request() req: AuthenticatedRequest, @Body() body: any) {
    const tenantId = (req.user.tenant_id || req.user.entity_id)!;
    return this.inventoryService.stockOpname(tenantId, body);
  }

  // ============================================================
  // Product Variants & Add-ons
  // ============================================================

  @Get('products/:productId/variants')
  @RequireTier(SubscriptionTier.FREE)
  async getProductVariants(@Request() req: AuthenticatedRequest, @Param('productId') productId: string) {
    const tenantId = (req.user.tenant_id || req.user.entity_id)!;
    return this.inventoryService.getProductVariants(tenantId, productId);
  }

  @Post('products/:productId/variant-groups')
  @RequireTier(SubscriptionTier.PRO)
  async upsertVariantGroup(@Request() req: AuthenticatedRequest, @Param('productId') productId: string, @Body() body: any) {
    const tenantId = (req.user.tenant_id || req.user.entity_id)!;
    return this.inventoryService.upsertVariantGroup(tenantId, productId, body);
  }

  @Delete('variant-groups/:groupId')
  @RequireTier(SubscriptionTier.PRO)
  async deleteVariantGroup(@Request() req: AuthenticatedRequest, @Param('groupId') groupId: string) {
    const tenantId = (req.user.tenant_id || req.user.entity_id)!;
    return this.inventoryService.deleteVariantGroup(tenantId, groupId);
  }

  @Post('products/:productId/variant-groups/:groupId/options')
  @RequireTier(SubscriptionTier.PRO)
  async upsertVariantOption(@Request() req: AuthenticatedRequest, @Param('productId') productId: string, @Param('groupId') groupId: string, @Body() body: any) {
    const tenantId = (req.user.tenant_id || req.user.entity_id)!;
    return this.inventoryService.upsertVariantOption(tenantId, productId, groupId, body);
  }

  @Delete('variant-options/:optionId')
  @RequireTier(SubscriptionTier.PRO)
  async deleteVariantOption(@Request() req: AuthenticatedRequest, @Param('optionId') optionId: string) {
    const tenantId = (req.user.tenant_id || req.user.entity_id)!;
    return this.inventoryService.deleteVariantOption(tenantId, optionId);
  }

  @Get('products/:productId/addons')
  @RequireTier(SubscriptionTier.FREE)
  async getProductAddons(@Request() req: AuthenticatedRequest, @Param('productId') productId: string) {
    const tenantId = (req.user.tenant_id || req.user.entity_id)!;
    return this.inventoryService.getProductAddons(tenantId, productId);
  }

  @Post('products/:productId/addon-groups')
  @RequireTier(SubscriptionTier.PRO)
  async upsertAddonGroup(@Request() req: AuthenticatedRequest, @Param('productId') productId: string, @Body() body: any) {
    const tenantId = (req.user.tenant_id || req.user.entity_id)!;
    return this.inventoryService.upsertAddonGroup(tenantId, productId, body);
  }

  @Delete('addon-groups/:groupId')
  @RequireTier(SubscriptionTier.PRO)
  async deleteAddonGroup(@Request() req: AuthenticatedRequest, @Param('groupId') groupId: string) {
    const tenantId = (req.user.tenant_id || req.user.entity_id)!;
    return this.inventoryService.deleteAddonGroup(tenantId, groupId);
  }

  @Post('products/:productId/addon-groups/:groupId/addons')
  @RequireTier(SubscriptionTier.PRO)
  async upsertAddon(@Request() req: AuthenticatedRequest, @Param('productId') productId: string, @Param('groupId') groupId: string, @Body() body: any) {
    const tenantId = (req.user.tenant_id || req.user.entity_id)!;
    return this.inventoryService.upsertAddon(tenantId, productId, groupId, body);
  }

  @Delete('addons/:addonId')
  @RequireTier(SubscriptionTier.PRO)
  async deleteAddon(@Request() req: AuthenticatedRequest, @Param('addonId') addonId: string) {
    const tenantId = (req.user.tenant_id || req.user.entity_id)!;
    return this.inventoryService.deleteAddon(tenantId, addonId);
  }
}
