import { Controller, Get, Query, Request, UseGuards, BadRequestException } from '@nestjs/common';
import { ReportService } from '../../services/report/report.service';
import { JwtAuthGuard } from '../../../business-profile/guards/jwt-auth.guard';

@Controller('api/v1/reports')
@UseGuards(JwtAuthGuard)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('dashboard')
  async getDashboard(@Request() req: any, @Query('startDate') start?: string, @Query('endDate') end?: string) {
    const tenantId = req.user.tenant_id;
    if (!tenantId) throw new BadRequestException('Tenant ID tidak ditemukan. Pastikan profil bisnis sudah lengkap.');
    return await this.reportService.getDashboardSummary(tenantId, start, end);
  }

  @Get('accounting/accounts')
  async getAccounts(@Request() req: any) {
    const tenantId = req.user.tenant_id;
    if (!tenantId) throw new BadRequestException('Tenant ID tidak ditemukan.');
    return await this.reportService.getAccountingAccounts(tenantId);
  }

  @Get('income-statement')
  async getIncomeStatement(
    @Request() req: any,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const tenantId = req.user.tenant_id || req.user.entity_id; 
    if (!tenantId) throw new BadRequestException('Tenant ID tidak ditemukan.');
    return await this.reportService.getIncomeStatement(tenantId, startDate, endDate);
  }

  @Get('sales')
  async getSales(@Request() req: any, @Query('startDate') start?: string, @Query('endDate') end?: string) {
    const tenantId = req.user.tenant_id;
    return await this.reportService.getSalesReport(tenantId, start, end);
  }
}
