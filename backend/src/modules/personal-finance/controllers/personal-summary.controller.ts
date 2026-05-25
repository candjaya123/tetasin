import { Controller, Get, Request, Query, UseGuards } from '@nestjs/common';
import { PersonalFinanceService } from '../services/personal-finance.service';
import { JwtAuthGuard } from '../../business-profile/guards/jwt-auth.guard';
import { RequireTier } from '../../../core/auth/tier.decorator';
import { SubscriptionTier } from '../../../core/constants/subscription-tier.enum';
import { RequireAccountType } from '../../../core/auth/account-type.guard';
import type { AuthenticatedRequest } from '../../../core/auth/authenticated-request.interface';

@Controller('api/v1/personal')
@UseGuards(JwtAuthGuard)
@RequireAccountType('personal')
export class PersonalSummaryController {
  constructor(private readonly personalFinanceService: PersonalFinanceService) {}

  @Get('summary')
  @RequireTier(SubscriptionTier.FREE)
  async getSummary(
    @Request() req: AuthenticatedRequest,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.personalFinanceService.getSummary(req.user.tenant_id, month, year);
  }

  @Get('net-worth')
  @RequireTier(SubscriptionTier.FREE)
  async getNetWorth(@Request() req: AuthenticatedRequest) {
    return this.personalFinanceService.getNetWorth(req.user.tenant_id);
  }
}
