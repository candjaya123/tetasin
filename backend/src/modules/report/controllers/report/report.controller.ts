import { Controller, Get, Query, Request, UseGuards, BadRequestException, ForbiddenException, InternalServerErrorException, HttpException } from '@nestjs/common';
import { ReportService } from '../../services/report/report.service';
import { JwtAuthGuard } from '../../../business-profile/guards/jwt-auth.guard';

@Controller('api/v1/reports')
@UseGuards(JwtAuthGuard)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('dashboard')
  async getDashboard(@Request() req: any, @Query('startDate') start?: string, @Query('endDate') end?: string) {
    const tenantId = req.user.tenant_id;
    const accountType = req.user.account_type;

    if (!tenantId) throw new BadRequestException('Tenant ID tidak ditemukan.');

    if (accountType === 'personal') {
      return await this.reportService.getPersonalSummary(tenantId, start, end);
    }

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
    try {
      const tenantId = req.user?.tenant_id || req.user?.entity_id; 
      const accountType = req.user?.account_type;

      if (accountType === 'personal') {
        throw new ForbiddenException('Laporan Laba Rugi hanya tersedia untuk akun Bisnis.');
      }

      if (!tenantId) {
        throw new BadRequestException('Tenant ID tidak ditemukan. Pastikan Anda sudah login dan memiliki profil bisnis.');
      }

      return await this.reportService.getIncomeStatement(tenantId, startDate, endDate);
    } catch (e) {
      console.error('[CONTROLLER ERROR] getIncomeStatement:', e);
      if (e instanceof HttpException) throw e;
      throw new InternalServerErrorException(e.message || 'Error internal pada pembuatan laporan');
    }
  }

  @Get('balance-sheet')
  async getBalanceSheet(@Request() req: any, @Query('endDate') endDate?: string) {
    const tenantId = req.user.tenant_id;
    if (req.user.account_type === 'personal') {
      throw new ForbiddenException('Laporan Neraca hanya tersedia untuk akun Bisnis.');
    }
    return await this.reportService.getBalanceSheet(tenantId, endDate);
  }

  @Get('cash-flow')
  async getCashFlow(@Request() req: any, @Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    const tenantId = req.user.tenant_id;
    if (req.user.account_type === 'personal') {
      throw new ForbiddenException('Laporan Arus Kas hanya tersedia untuk akun Bisnis.');
    }
    return await this.reportService.getCashFlow(tenantId, startDate, endDate);
  }

  @Get('sales')
  async getSales(@Request() req: any, @Query('startDate') start?: string, @Query('endDate') end?: string) {
    const tenantId = req.user.tenant_id;
    if (req.user.account_type === 'personal') {
      throw new ForbiddenException('Laporan Penjualan hanya tersedia untuk akun Bisnis.');
    }
    return await this.reportService.getSalesReport(tenantId, start, end);
  }

  @Get('journal')
  async getJournal(@Request() req: any, @Query('startDate') start: string, @Query('endDate') end: string) {
    const tenantId = req.user.tenant_id;
    if (req.user.account_type === 'personal') {
      throw new ForbiddenException('Laporan Jurnal hanya tersedia untuk akun Bisnis.');
    }
    return await this.reportService.getJournal(tenantId, start, end);
  }

  @Get('ledger')
  async getLedger(@Request() req: any, @Query('accountId') accountId: string, @Query('startDate') start: string, @Query('endDate') end: string) {
    const tenantId = req.user.tenant_id;
    if (req.user.account_type === 'personal') {
      throw new ForbiddenException('Buku Besar hanya tersedia untuk akun Bisnis.');
    }
    if (!accountId) throw new BadRequestException('Account ID wajib diisi.');
    return await this.reportService.getLedger(tenantId, accountId, start, end);
  }

  @Get('trial-balance')
  async getTrialBalance(@Request() req: any, @Query('endDate') endDate: string) {
    const tenantId = req.user.tenant_id;
    if (req.user.account_type === 'personal') {
      throw new ForbiddenException('Neraca Saldo hanya tersedia untuk akun Bisnis.');
    }
    return await this.reportService.getTrialBalance(tenantId, endDate);
  }

  @Get('stock')
  async getStock(@Request() req: any) {
    const tenantId = req.user.tenant_id;
    if (req.user.account_type === 'personal') {
      throw new ForbiddenException('Laporan Stok hanya tersedia untuk akun Bisnis.');
    }
    return await this.reportService.getStockReport(tenantId);
  }
}
