import { Controller, Get, Post, Body, Request, UseGuards, Query, Put, Delete, Param, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../../business-profile/guards/jwt-auth.guard';
import { AccountingRepository } from '../repositories/accounting.repository';
import { ReportService } from '../../report/services/report/report.service';
import { RequireTier } from '../../../core/auth/tier.decorator';
import { SubscriptionTier } from '../../../core/constants/subscription-tier.enum';
import type { AuthenticatedRequest } from '../../../core/auth/authenticated-request.interface';

@Controller('api/v1/finance')
@UseGuards(JwtAuthGuard)
export class FinanceController {
  constructor(
    private readonly accountingRepository: AccountingRepository,
    private readonly reportService: ReportService,
  ) {}

  @Get('ledger')
  @RequireTier(SubscriptionTier.PRO)
  async getLedger(
    @Request() req: AuthenticatedRequest,
    @Query('account_id') accountId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return await this.accountingRepository.getLedgerLines(
      req.user.tenant_id,
      accountId,
      startDate || new Date(0).toISOString(),
      endDate || new Date().toISOString()
    );
  }

  @Get('trial-balance')
  @RequireTier(SubscriptionTier.PRO)
  async getTrialBalance(@Request() req: AuthenticatedRequest, @Query('endDate') endDate: string) {
    return await this.reportService.getTrialBalance(req.user.tenant_id, endDate);
  }

  @Get('income-statement')
  @RequireTier(SubscriptionTier.PRO)
  async getIncomeStatement(
    @Request() req: AuthenticatedRequest,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    if (req.user.account_type === 'personal') {
      throw new ForbiddenException('Laporan Laba Rugi hanya tersedia untuk akun Bisnis.');
    }
    return await this.reportService.getIncomeStatement(req.user.tenant_id, startDate, endDate);
  }

  @Get('balance-sheet')
  @RequireTier(SubscriptionTier.PRO)
  async getBalanceSheet(@Request() req: AuthenticatedRequest, @Query('endDate') endDate?: string) {
    if (req.user.account_type === 'personal') {
      throw new ForbiddenException('Laporan Neraca hanya tersedia untuk akun Bisnis.');
    }
    return await this.reportService.getBalanceSheet(req.user.tenant_id, endDate);
  }

  @Get('cash-flow')
  @RequireTier(SubscriptionTier.PRO)
  async getCashFlow(@Request() req: AuthenticatedRequest, @Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    if (req.user.account_type === 'personal') {
      throw new ForbiddenException('Laporan Arus Kas hanya tersedia untuk akun Bisnis.');
    }
    return await this.reportService.getCashFlow(req.user.tenant_id, startDate, endDate);
  }

  // Legacy transaction list under finance (to be removed; use /api/v1/transactions)
  @Get('transactions')
  async getTransactions(
    @Request() req: AuthenticatedRequest,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('account_id') accountId?: string,
    @Query('type') type?: string,
  ) {
    const data = await this.accountingRepository.getJournalEntries(
      req.user.tenant_id,
      startDate,
      endDate
    );
    let normalized = data.map((entry: any) => ({
      ...entry,
      total_amount: entry.journal_lines?.reduce((acc: number, line: any) => acc + (Number(line.debit) || 0), 0) || 0
    }));
    if (type === 'income') {
      normalized = normalized.filter((e: any) =>
        e.journal_lines?.some((l: any) =>
          ['revenue', 'pendapatan', 'income'].includes((l.accounts?.type || '').toLowerCase())
        )
      );
    } else if (type === 'expense') {
      normalized = normalized.filter((e: any) =>
        e.journal_lines?.some((l: any) =>
          ['expense', 'beban', 'hpp', 'cost of sales'].includes((l.accounts?.type || '').toLowerCase())
        )
      );
    }
    return normalized;
  }
}
