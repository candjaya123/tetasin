import { Controller, Post, Request, Body, UseGuards } from '@nestjs/common';
import { PersonalFinanceService } from '../services/personal-finance.service';
import { JwtAuthGuard } from '../../business-profile/guards/jwt-auth.guard';
import { RequireTier } from '../../../core/auth/tier.decorator';
import { SubscriptionTier } from '../../../core/constants/subscription-tier.enum';
import { RequireAccountType } from '../../../core/auth/account-type.guard';
import type { AuthenticatedRequest } from '../../../core/auth/authenticated-request.interface';

@Controller('api/v1/personal')
@UseGuards(JwtAuthGuard)
@RequireAccountType('personal')
export class PersonalEntryController {
  constructor(private readonly personalFinanceService: PersonalFinanceService) {}

  @Post('income')
  @RequireTier(SubscriptionTier.FREE)
  async recordIncome(@Request() req: AuthenticatedRequest, @Body() body: any) {
    return this.personalFinanceService.recordIncome(req.user.tenant_id, body);
  }

  @Post('expense')
  @RequireTier(SubscriptionTier.FREE)
  async recordExpense(@Request() req: AuthenticatedRequest, @Body() body: any) {
    return this.personalFinanceService.recordExpense(req.user.tenant_id, body);
  }

  @Post('transfer')
  @RequireTier(SubscriptionTier.FREE)
  async transfer(@Request() req: AuthenticatedRequest, @Body() body: any) {
    return this.personalFinanceService.transfer(req.user.tenant_id, body);
  }
}
