import { Controller, Get, Post, Request, Body, Query, UseGuards } from '@nestjs/common';
import { PersonalFinanceService } from '../services/personal-finance.service';
import { JwtAuthGuard } from '../../business-profile/guards/jwt-auth.guard';
import { RequireTier } from '../../../core/auth/tier.decorator';
import { SubscriptionTier } from '../../../core/constants/subscription-tier.enum';
import { RequireAccountType } from '../../../core/auth/account-type.guard';
import type { AuthenticatedRequest } from '../../../core/auth/authenticated-request.interface';

@Controller('api/v1/personal')
@UseGuards(JwtAuthGuard)
@RequireAccountType('personal')
export class PersonalBudgetController {
  constructor(private readonly personalFinanceService: PersonalFinanceService) {}

  @Get('budgets')
  @RequireTier(SubscriptionTier.FREE)
  async getBudgets(
    @Request() req: AuthenticatedRequest,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.personalFinanceService.getBudgets(req.user.tenant_id, month, year);
  }

  @Post('budgets')
  @RequireTier(SubscriptionTier.FREE)
  async upsertBudget(@Request() req: AuthenticatedRequest, @Body() body: any) {
    return this.personalFinanceService.upsertBudget(req.user.tenant_id, body);
  }
}
