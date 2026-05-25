import { Controller, Get, Post, Patch, Delete, Body, Param, Request, UseGuards, Query } from '@nestjs/common';
import { BillTrackerService } from '../services/bill-tracker.service';
import { JwtAuthGuard } from '../../business-profile/guards/jwt-auth.guard';
import { RequireTier } from '../../../core/auth/tier.decorator';
import { SubscriptionTier } from '../../../core/constants/subscription-tier.enum';
import type { AuthenticatedRequest } from '../../../core/auth/authenticated-request.interface';

@Controller('api/v1/bills')
@UseGuards(JwtAuthGuard)
export class BillTrackerController {
  constructor(private readonly billTrackerService: BillTrackerService) {}

  @Get()
  @RequireTier(SubscriptionTier.FREE)
  async getBills(
    @Request() req: AuthenticatedRequest,
    @Query('status') status?: string,
    @Query('bill_type') billType?: string,
    @Query('due_before') dueBefore?: string,
    @Query('due_after') dueAfter?: string,
    @Query('search') search?: string,
    @Query('sort') sort?: string,
  ) {
    return this.billTrackerService.getBills(req.user.tenant_id, {
      status, bill_type: billType, due_before: dueBefore,
      due_after: dueAfter, search, sort,
    });
  }

  @Post()
  @RequireTier(SubscriptionTier.FREE)
  async createBill(@Request() req: AuthenticatedRequest, @Body() body: any) {
    return this.billTrackerService.createBill(req.user.tenant_id, body);
  }

  @Get('summary')
  @RequireTier(SubscriptionTier.FREE)
  async getSummary(@Request() req: AuthenticatedRequest) {
    return this.billTrackerService.getSummary(req.user.tenant_id);
  }

  @Get(':id')
  @RequireTier(SubscriptionTier.FREE)
  async getBillDetail(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.billTrackerService.getBillDetail(req.user.tenant_id, id);
  }

  @Patch(':id')
  @RequireTier(SubscriptionTier.FREE)
  async updateBill(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.billTrackerService.updateBill(req.user.tenant_id, id, body);
  }

  @Delete(':id')
  @RequireTier(SubscriptionTier.FREE)
  async deleteBill(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.billTrackerService.deleteBill(req.user.tenant_id, id);
  }

  @Post(':id/pay')
  @RequireTier(SubscriptionTier.FREE)
  async payBill(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.billTrackerService.payBill(req.user.tenant_id, id, body);
  }

  @Get(':id/payments')
  @RequireTier(SubscriptionTier.FREE)
  async getPayments(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.billTrackerService.getPayments(req.user.tenant_id, id);
  }

  @Patch(':id/cancel')
  @RequireTier(SubscriptionTier.FREE)
  async cancelBill(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.billTrackerService.cancelBill(req.user.tenant_id, id);
  }
}
