import { Controller, Get, Query, Request, UseGuards, BadRequestException, ForbiddenException, InternalServerErrorException, HttpException, Logger } from '@nestjs/common';
import { ReportService } from '../../services/report/report.service';
import { JwtAuthGuard } from '../../../business-profile/guards/jwt-auth.guard';
import { RequireTier } from '../../../../core/auth/tier.decorator';
import { SubscriptionTier } from '../../../../core/constants/subscription-tier.enum';
import { Roles, UserRole } from '../../../../core/auth/role.decorator';
import type { AuthenticatedRequest } from '../../../../core/auth/authenticated-request.interface';

@Controller('api/v1/report')
@UseGuards(JwtAuthGuard)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('dashboard')
  async getDashboard(@Request() req: AuthenticatedRequest, @Query('startDate') start?: string, @Query('endDate') end?: string) {
    const tenantId = req.user.tenant_id;
    const accountType = req.user.account_type;

    if (!tenantId) throw new BadRequestException('Tenant ID tidak ditemukan.');

    if (accountType === 'personal') {
      return await this.reportService.getPersonalSummary(tenantId, start, end);
    }

    return await this.reportService.getDashboardSummary(tenantId, start, end);
  }

  @Get('sales')
  @RequireTier(SubscriptionTier.PRO)
  async getSales(@Request() req: AuthenticatedRequest, @Query('startDate') start?: string, @Query('endDate') end?: string) {
    const tenantId = req.user.tenant_id;
    if (req.user.account_type === 'personal') {
      throw new ForbiddenException('Laporan Penjualan hanya tersedia untuk akun Bisnis.');
    }
    return await this.reportService.getSalesReport(tenantId, start, end);
  }

  @Get('stock')
  @RequireTier(SubscriptionTier.PRO)
  async getStock(@Request() req: AuthenticatedRequest) {
    const tenantId = req.user.tenant_id;
    if (req.user.account_type === 'personal') {
      throw new ForbiddenException('Laporan Stok hanya tersedia untuk akun Bisnis.');
    }
    return await this.reportService.getStockReport(tenantId);
  }
}
