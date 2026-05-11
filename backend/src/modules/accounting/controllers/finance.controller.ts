import { Controller, Get, Post, Body, Request, UseGuards, Query, Put, Delete, Param, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../../business-profile/guards/jwt-auth.guard';
import { AccountingRepository } from '../repositories/accounting.repository';

@Controller('api/v1/finance')
@UseGuards(JwtAuthGuard)
export class FinanceController {
  constructor(private readonly accountingRepository: AccountingRepository) {}

  @Get('coa')
  async getCOA(@Request() req: any) {
    return await this.accountingRepository.getAccountingAccounts(req.user.tenant_id);
  }

  @Post('coa')
  async createAccount(@Request() req: any, @Body() body: any) {
    return await this.accountingRepository.createAccount(req.user.tenant_id, body);
  }

  @Put('coa/:id')
  async updateAccount(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    return await this.accountingRepository.updateAccount(req.user.tenant_id, id, body);
  }

  @Delete('coa/:id')
  async deleteAccount(@Request() req: any, @Param('id') id: string) {
    await this.accountingRepository.deleteAccount(req.user.tenant_id, id);
    return { success: true };
  }

  @Get('balance-sheet')
  async getBalanceSheet(@Request() req: any) {
    if (req.user.account_type === 'personal') {
      throw new ForbiddenException('Laporan Neraca hanya tersedia untuk akun Bisnis.');
    }
    // This is a legacy endpoint, we should probably point it to ReportService
    // For now, let's just make it call a safe repository method or return empty
    // Actually, ReportController handles this now.
    return { message: "Gunakan endpoint /api/v1/reports/balance-sheet" };
  }

  @Get('cash-flow')
  async getCashFlow(
    @Request() req: any, 
    @Query('account_id') accountId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
     // Forwarding to specialized repository methods or handled here via repository
     return await this.accountingRepository.getJournalEntriesWithLines(
       req.user.tenant_id,
       startDate || new Date(0).toISOString(),
       endDate || new Date().toISOString()
     );
  }

  @Get('ledger')
  async getLedger(
    @Request() req: any, 
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

  @Get('transactions')
  async getTransactions(
    @Request() req: any,
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

    // Filtering logic can stay here or move to service
    let normalized = data.map((entry: any) => ({
      ...entry,
      total_amount: entry.journal_lines?.reduce((acc: number, line: any) => acc + (Number(line.debit) || 0), 0) || 0
    }));

    if (type === 'income') {
      normalized = normalized.filter((e: any) =>
        e.journal_lines.some((l: any) =>
          ['revenue', 'pendapatan', 'income'].includes((l.accounts?.type || '').toLowerCase())
        )
      );
    } else if (type === 'expense') {
      normalized = normalized.filter((e: any) =>
        e.journal_lines.some((l: any) =>
          ['expense', 'beban', 'hpp', 'cost of sales'].includes((l.accounts?.type || '').toLowerCase())
        )
      );
    }

    return normalized;
  }
}
