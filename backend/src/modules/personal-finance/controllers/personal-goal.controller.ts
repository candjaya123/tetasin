import { Controller, Get, Post, Patch, Request, Body, Param, UseGuards } from '@nestjs/common';
import { PersonalFinanceService } from '../services/personal-finance.service';
import { JwtAuthGuard } from '../../business-profile/guards/jwt-auth.guard';
import { RequireTier } from '../../../core/auth/tier.decorator';
import { SubscriptionTier } from '../../../core/constants/subscription-tier.enum';
import { RequireAccountType } from '../../../core/auth/account-type.guard';
import type { AuthenticatedRequest } from '../../../core/auth/authenticated-request.interface';

@Controller('api/v1/personal')
@UseGuards(JwtAuthGuard)
@RequireAccountType('personal')
export class PersonalGoalController {
  constructor(private readonly personalFinanceService: PersonalFinanceService) {}

  @Get('goals')
  @RequireTier(SubscriptionTier.FREE)
  async getGoals(@Request() req: AuthenticatedRequest) {
    return this.personalFinanceService.getGoals(req.user.tenant_id);
  }

  @Post('goals')
  @RequireTier(SubscriptionTier.FREE)
  async createGoal(@Request() req: AuthenticatedRequest, @Body() body: any) {
    return this.personalFinanceService.createGoal(req.user.tenant_id, body);
  }

  @Get('goals/:id')
  @RequireTier(SubscriptionTier.FREE)
  async getGoalDetail(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.personalFinanceService.getGoalDetail(req.user.tenant_id, id);
  }

  @Patch('goals/:id/progress')
  @RequireTier(SubscriptionTier.FREE)
  async updateGoalProgress(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.personalFinanceService.updateGoalProgress(req.user.tenant_id, id, body);
  }

  @Patch('goals/:id/cancel')
  @RequireTier(SubscriptionTier.FREE)
  async cancelGoal(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.personalFinanceService.cancelGoal(req.user.tenant_id, id);
  }
}
