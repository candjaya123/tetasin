import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { PromoService } from '../services/promo.service';
import { JwtAuthGuard } from '../../business-profile/guards/jwt-auth.guard';
import { RequireTier } from '../../../core/auth/tier.decorator';
import { SubscriptionTier } from '../../../core/constants/subscription-tier.enum';
import type { AuthenticatedRequest } from '../../../core/auth/authenticated-request.interface';

@Controller('api/v1/promo')
@UseGuards(JwtAuthGuard)
@RequireTier(SubscriptionTier.PRO)
export class PromoController {
  constructor(private readonly promoService: PromoService) {}

  @Get()
  async getPromotions(@Request() req: AuthenticatedRequest) {
    return this.promoService.getPromotions(req.user.tenant_id);
  }

  @Post()
  async createPromotion(@Request() req: AuthenticatedRequest, @Body() body: any) {
    return this.promoService.createPromotion(req.user.tenant_id, body);
  }

  @Put(':id')
  async updatePromotion(@Request() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: any) {
    return this.promoService.updatePromotion(id, req.user.tenant_id, body);
  }

  @Delete(':id')
  async deletePromotion(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.promoService.deletePromotion(id, req.user.tenant_id);
  }

  @Post('apply')
  async applyPromotions(@Request() req: AuthenticatedRequest, @Body() body: { items: any[] }) {
    // Both Trial and Full can apply promos
    return this.promoService.applyPromotions(req.user.tenant_id, body.items);
  }
}
