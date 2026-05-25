import { Controller, Get, Post, Patch, Delete, Request, Body, Param, UseGuards } from '@nestjs/common';
import { PersonalFinanceService } from '../services/personal-finance.service';
import { JwtAuthGuard } from '../../business-profile/guards/jwt-auth.guard';
import { RequireTier } from '../../../core/auth/tier.decorator';
import { SubscriptionTier } from '../../../core/constants/subscription-tier.enum';
import { RequireAccountType } from '../../../core/auth/account-type.guard';
import type { AuthenticatedRequest } from '../../../core/auth/authenticated-request.interface';

@Controller('api/v1/personal')
@UseGuards(JwtAuthGuard)
@RequireAccountType('personal')
export class RecurringController {
  constructor(private readonly personalFinanceService: PersonalFinanceService) {}

  @Get('recurring')
  @RequireTier(SubscriptionTier.PREMIUM)
  async getRecurring(@Request() req: AuthenticatedRequest) {
    return this.personalFinanceService.getRecurring(req.user.tenant_id);
  }

  @Post('recurring')
  @RequireTier(SubscriptionTier.PREMIUM)
  async createRecurring(@Request() req: AuthenticatedRequest, @Body() body: any) {
    return this.personalFinanceService.createRecurring(req.user.tenant_id, body);
  }

  @Patch('recurring/:id')
  @RequireTier(SubscriptionTier.PREMIUM)
  async updateRecurring(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.personalFinanceService.updateRecurring(req.user.tenant_id, id, body);
  }

  @Patch('recurring/:id/trigger')
  @RequireTier(SubscriptionTier.PREMIUM)
  async triggerRecurring(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.personalFinanceService.triggerRecurring(req.user.tenant_id, id);
  }

  @Delete('recurring/:id')
  @RequireTier(SubscriptionTier.PREMIUM)
  async deactivateRecurring(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.personalFinanceService.deactivateRecurring(req.user.tenant_id, id);
  }
}
