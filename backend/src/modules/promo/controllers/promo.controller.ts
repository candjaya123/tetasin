import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { PromoService } from '../services/promo.service';
import { RequireTier } from '../../../core/auth/tier.decorator';
import { SubscriptionTier } from '../../../core/auth/tier.enum';
import { JwtAuthGuard } from '../../business-profile/guards/jwt-auth.guard';

@Controller('api/v1/promotions')
@UseGuards(JwtAuthGuard)
export class PromoController {
  constructor(private readonly promoService: PromoService) {}

  @Get()
  @RequireTier(SubscriptionTier.FULL)
  async getPromotions(@Request() req: any) {
    return this.promoService.getPromotions(req.user.tenant_id);
  }

  @Post()
  @RequireTier(SubscriptionTier.FULL)
  async createPromotion(@Request() req: any, @Body() body: any) {
    return this.promoService.createPromotion(req.user.tenant_id, body);
  }

  @Put(':id')
  @RequireTier(SubscriptionTier.FULL)
  async updatePromotion(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    return this.promoService.updatePromotion(id, req.user.tenant_id, body);
  }

  @Delete(':id')
  @RequireTier(SubscriptionTier.FULL)
  async deletePromotion(@Request() req: any, @Param('id') id: string) {
    return this.promoService.deletePromotion(id, req.user.tenant_id);
  }

  @Post('apply')
  async applyPromotions(@Request() req: any, @Body() body: { items: any[] }) {
    // Both Starter and Business can apply promos (if Starter has none, it just returns items)
    // PromoService will filter by active promos for the tenant
    return this.promoService.applyPromotions(req.user.tenant_id, body.items);
  }
}
