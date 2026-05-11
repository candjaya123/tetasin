import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { PromoService } from '../services/promo.service';
import { JwtAuthGuard } from '../../business-profile/guards/jwt-auth.guard';

@Controller('api/v1/promotions')
@UseGuards(JwtAuthGuard)
export class PromoController {
  constructor(private readonly promoService: PromoService) {}

  @Get()
  async getPromotions(@Request() req: any) {
    return this.promoService.getPromotions(req.user.tenant_id);
  }

  @Post()
  async createPromotion(@Request() req: any, @Body() body: any) {
    return this.promoService.createPromotion(req.user.tenant_id, body);
  }

  @Put(':id')
  async updatePromotion(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    return this.promoService.updatePromotion(id, req.user.tenant_id, body);
  }

  @Delete(':id')
  async deletePromotion(@Request() req: any, @Param('id') id: string) {
    return this.promoService.deletePromotion(id, req.user.tenant_id);
  }

  @Post('apply')
  async applyPromotions(@Request() req: any, @Body() body: { items: any[] }) {
    // Both Trial and Full can apply promos
    return this.promoService.applyPromotions(req.user.tenant_id, body.items);
  }
}
