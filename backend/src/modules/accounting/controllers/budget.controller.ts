import { Controller, Get, Post, Delete, Body, Request, UseGuards, Query, Param } from '@nestjs/common';
import { BudgetService } from '../services/budget.service';
import { JwtAuthGuard } from '../../business-profile/guards/jwt-auth.guard';
import { RequireTier } from '../../../core/auth/tier.decorator';
import { SubscriptionTier } from '../../../core/constants/subscription-tier.enum';
import type { AuthenticatedRequest } from '../../../core/auth/authenticated-request.interface';

@Controller('api/v1/finance/budgets')
@UseGuards(JwtAuthGuard)
@RequireTier(SubscriptionTier.PRO)
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Get()
  async getBudgets(
    @Request() req: AuthenticatedRequest,
    @Query('month') month: string
  ) {
    const targetMonth = month || new Date().toISOString().slice(0, 7);
    return this.budgetService.getBudgets(req.user.tenant_id, targetMonth);
  }

  @Get('summary')
  async getBudgetSummary(
    @Request() req: AuthenticatedRequest,
    @Query('month') month: string
  ) {
    const targetMonth = month || new Date().toISOString().slice(0, 7);
    return this.budgetService.getBudgetSummary(req.user.tenant_id, targetMonth);
  }

  @Post()
  async upsertBudget(@Request() req: AuthenticatedRequest, @Body() body: any) {
    return this.budgetService.upsertBudget(req.user.tenant_id, body);
  }

  @Delete(':id')
  async deleteBudget(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.budgetService.deleteBudget(req.user.tenant_id, id);
  }
}
