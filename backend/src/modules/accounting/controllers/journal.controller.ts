import { Controller, Post, Body, Param, Request, UseGuards, Get, Query, Logger, HttpCode, HttpStatus, Put, Delete } from '@nestjs/common';
import { AccountingRepository } from '../repositories/accounting.repository';
import { SupabaseService } from '../../../shared/supabase.service';
import { JwtAuthGuard } from '../../business-profile/guards/jwt-auth.guard';
import { BudgetService } from '../services/budget.service';
import { AccountingService } from '../services/accounting.service';
import { RequireTier } from '../../../core/auth/tier.decorator';
import { SubscriptionTier } from '../../../core/constants/subscription-tier.enum';
import type { AuthenticatedRequest } from '../../../core/auth/authenticated-request.interface';

@Controller('api/v1/accounting')
@UseGuards(JwtAuthGuard)
export class AccountingController {
  constructor(
    private readonly accountingRepository: AccountingRepository,
    private readonly supabaseService: SupabaseService,
    private readonly budgetService: BudgetService,
    private readonly accountingService: AccountingService,
  ) {}

  // ========== Journal Entries ==========
  @Get('journal-entries')
  @RequireTier(SubscriptionTier.FREE)
  async getJournalEntries(@Request() req: AuthenticatedRequest, @Query('startDate') start?: string, @Query('endDate') end?: string) {
    return await this.accountingRepository.getJournalEntries(req.user.tenant_id, start, end);
  }

  @Get('journal-entries/:id')
  @RequireTier(SubscriptionTier.FREE)
  async getJournalEntryById(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return await this.accountingRepository.getJournalEntryById(req.user.tenant_id, id);
  }

  @Post('journal-entries')
  @RequireTier(SubscriptionTier.FREE)
  @HttpCode(HttpStatus.CREATED)
  async createJournalEntry(@Request() req: AuthenticatedRequest, @Body() payload: any) {
    const { reference_number, description, lines, date } = payload;
    const result = await this.accountingService.createJournalEntry(
      req.user.tenant_id,
      {
        date,
        reference_number,
        description,
        lines,
      }
    );

    // Trigger Budget Alert Check (Async)
    const currentMonth = (date || new Date().toISOString()).slice(0, 7);
    lines.forEach((line: any) => {
      if ((line.debit || 0) > 0) {
        this.budgetService.checkBudgetAlerts(req.user.tenant_id, line.account_id, currentMonth)
          .catch(err => Logger.warn('Budget Check Error:', err));
      }
    });

    return result;
  }

  // ========== COA ==========
  @Get('coa')
  @RequireTier(SubscriptionTier.FREE)
  async getCOA(@Request() req: AuthenticatedRequest) {
    return await this.accountingRepository.getAccountingAccounts(req.user.tenant_id);
  }

  @Post('coa')
  @RequireTier(SubscriptionTier.PRO)
  @HttpCode(HttpStatus.CREATED)
  async createAccount(@Request() req: AuthenticatedRequest, @Body() body: any) {
    return await this.accountingRepository.createAccount(req.user.tenant_id, body);
  }

  @Put('coa/:id')
  @RequireTier(SubscriptionTier.PRO)
  @HttpCode(HttpStatus.OK)
  async updateAccount(@Request() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: any) {
    return await this.accountingRepository.updateAccount(req.user.tenant_id, id, body);
  }

  @Delete('coa/:id')
  @RequireTier(SubscriptionTier.PRO)
  @HttpCode(HttpStatus.OK)
  async deleteAccount(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return await this.accountingRepository.deleteAccount(req.user.tenant_id, id);
  }

  @Get('coa/templates')
  @RequireTier(SubscriptionTier.FREE)
  async getCoaTemplates() {
    // Return the 31 seed accounts from akun.csv (business) + 12 personal
    return {
      business: this.getBusinessCoaTemplate(),
      personal: this.getPersonalCoaTemplate(),
    };
  }

  private getBusinessCoaTemplate() {
    return [
      { code: '1-10000', name: 'Kas Tangan', type: 'aset', kategori: 'ASET', normal_balance: 'debit' },
      { code: '1-10002', name: 'Kas Bank', type: 'aset', kategori: 'ASET', normal_balance: 'debit' },
      { code: '1-10003', name: 'E-Wallet', type: 'aset', kategori: 'ASET', normal_balance: 'debit' },
      { code: '1-10100', name: 'Biaya Dibayar di Muka', type: 'aset', kategori: 'ASET', normal_balance: 'debit' },
      { code: '1-10300', name: 'Piutang Usaha', type: 'aset', kategori: 'ASET', normal_balance: 'debit' },
      { code: '1-10400', name: 'Perlengkapan', type: 'aset', kategori: 'ASET', normal_balance: 'debit' },
      { code: '1-10500', name: 'Persediaan Bahan Baku', type: 'aset', kategori: 'ASET', normal_balance: 'debit' },
      { code: '1-10501', name: 'Persediaan Dalam Proses', type: 'aset', kategori: 'ASET', normal_balance: 'debit' },
      { code: '1-10502', name: 'Persediaan Barang Jadi', type: 'aset', kategori: 'ASET', normal_balance: 'debit' },
      { code: '1-10503', name: 'Persediaan Barang Dagang', type: 'aset', kategori: 'ASET', normal_balance: 'debit' },
      { code: '1-15000', name: 'Peralatan', type: 'aset', kategori: 'ASET', normal_balance: 'debit' },
      { code: '1-15900', name: 'Akumulasi Penyusutan', type: 'aset', kategori: 'ASET', normal_balance: 'credit' },
      { code: '2-20100', name: 'Hutang Usaha', type: 'kewajiban', kategori: 'KEWAJIBAN', normal_balance: 'credit' },
      { code: '2-20400', name: 'Hutang Bank', type: 'kewajiban', categoria: 'KEWAJIBAN', normal_balance: 'credit' },
      { code: '2-20600', name: 'Pendapatan Diterima di Muka', type: 'kewajiban', categoria: 'KEWAJIBAN', normal_balance: 'credit' },
      { code: '3-30000', name: 'Modal', type: 'ekuitas', categoria: 'EKUITAS', normal_balance: 'credit' },
      { code: '3-31000', name: 'Prive', type: 'ekuitas', categoria: 'EKUITAS', normal_balance: 'debit' },
      { code: '4-40000', name: 'Penjualan Produk', type: 'pendapatan', categoria: 'PENDAPATAN', normal_balance: 'credit' },
      { code: '4-40001', name: 'Penjualan Jasa', type: 'pendapatan', categoria: 'PENDAPATAN', normal_balance: 'credit' },
      { code: '4-40900', name: 'Pendapatan Lain-lain', type: 'pendapatan', categoria: 'PENDAPATAN', normal_balance: 'credit' },
      { code: '4-41000', name: 'Diskon Penjualan', type: 'pendapatan', categoria: 'PENDAPATAN', normal_balance: 'debit' },
      { code: '4-41001', name: 'Retur Penjualan', type: 'pendapatan', categoria: 'PENDAPATAN', normal_balance: 'debit' },
      { code: '5-50000', name: 'Harga Pokok Penjualan', type: 'beban', categoria: 'HPP / BIAYA LANGSUNG', normal_balance: 'debit' },
      { code: '6-60000', name: 'Biaya Admin', type: 'beban', categoria: 'BEBAN OPERACIONAL', normal_balance: 'debit' },
      { code: '6-60100', name: 'Beban Gaji Karyawan', type: 'beban', categoria: 'BEBAN OPERACIONAL', normal_balance: 'debit' },
      { code: '6-60200', name: 'Biaya Utility', type: 'beban', categoria: 'BEBAN OPERACIONAL', normal_balance: 'debit' },
      { code: '6-60300', name: 'Biaya Marketing', type: 'beban', categoria: 'BEBAN OPERACIONAL', normal_balance: 'debit' },
      { code: '6-60400', name: 'Beban Sewa', type: 'beban', categoria: 'BEBAN OPERACIONAL', normal_balance: 'debit' },
      { code: '6-60500', name: 'Beban Penyusutan', type: 'beban', categoria: 'BEBAN OPERACIONAL', normal_balance: 'debit' },
      { code: '6-60600', name: 'Biaya Distribucion', type: 'beban', categoria: 'BEBAN OPERACIONAL', normal_balance: 'debit' },
      { code: '6-60999', name: 'Biaya Lain-lain', type: 'beban', categoria: 'BEBAN OPERACIONAL', normal_balance: 'debit' },
    ];
  }

  private getPersonalCoaTemplate() {
    return [
      { code: '1-10000', name: 'Dompet / Kas Tunai', type: 'aset', categoria: 'ASET', normal_balance: 'debit' },
      { code: '1-10002', name: 'Rekening Bank', type: 'aset', categoria: 'ASET', normal_balance: 'debit' },
      { code: '1-10003', name: 'E-Wallet', type: 'aset', categoria: 'ASET', normal_balance: 'debit' },
      { code: '1-10100', name: 'Dana Darurat', type: 'aset', categoria: 'ASET', normal_balance: 'debit' },
      { code: '1-10200', name: 'Tabungan & Investasi', type: 'aset', categoria: 'ASET', normal_balance: 'debit' },
      { code: '2-20100', name: 'Hutang / Cicilan', type: 'kewajiban', categoria: 'KEWAJIBAN', normal_balance: 'credit' },
      { code: '3-30000', name: 'Kekayaan Bersih (Modal)', type: 'ekuitas', categoria: 'EKUITAS', normal_balance: 'credit' },
      { code: '4-40000', name: 'Gaji / Pendapatan Tetap', type: 'pendapatan', categoria: 'PENDAPATAN', normal_balance: 'credit' },
      { code: '4-40900', name: 'Pendapitan Lain-lain', type: 'pendapitan', categoria: 'PENDAPATAN', normal_balance: 'credit' },
      { code: '6-60000', name: 'Kebutuhan Pokok', type: 'beban', categoria: 'BEBAN OPERACIONAL', normal_balance: 'debit' },
      { code: '6-60100', name: 'Tagihan & Utilitas', type: 'beban', categoria: 'BEBAN OPERACIONAL', normal_balance: 'debit' },
      { code: '6-60999', name: 'Pengeluaran Lain-lain', type: 'beban', categoria: 'BEBAN OPERACIONAL', normal_balance: 'debit' },
    ];
  }

  // ========== Legacy / Backward Compat Draft Endpoints (to be migrated to ReceiptModule) ==========
  @Get('journal-entries/drafts')
  async getDrafts(@Request() req: AuthenticatedRequest) {
    const data = await this.accountingRepository.getJournalEntries(req.user.tenant_id);
    const drafts = data.filter((entry: any) => entry.status === 'draft' || entry.status === 'pending');
    return drafts.map((entry: any) => {
      const totalAmount = entry.journal_lines?.reduce((acc: number, line: any) => acc + (Number(line.debit) || 0), 0) || 0;
      return {
        id: entry.id,
        created_at: entry.date || entry.transaction_date || entry.created_at,
        source: entry.reference_type || 'system',
        status: entry.status || 'draft',
        payload: {
          total_amount: totalAmount,
          lines: entry.journal_lines
        }
      };
    });
  }

  @Post('journal-entries/draft')
  async createDraft(@Request() req: AuthenticatedRequest, @Body() payload: any) {
    const entries = Array.isArray(payload) ? payload : [payload];
    for (const entry of entries) {
      await this.accountingService.createJournalEntry(
        req.user.tenant_id,
        {
          date: entry.date,
          reference_number: entry.reference_number || `DRAFT-${Date.now()}`,
          description: entry.description,
          lines: entry.lines,
        }
      );
    }
    return { success: true };
  }

  @Post('journal-entries/approve-draft/:draftId')
  async approveDraft(@Param('draftId') draftId: string, @Request() req: AuthenticatedRequest) {
    const client = this.supabaseService.getClient();
    const { data: entry, error: fetchError } = await client
      .from('journal_entries')
      .select('*')
      .eq('id', draftId)
      .single();
    if (fetchError || !entry) throw new Error(`Draft not found: ${fetchError?.message}`);
    const { error: updateError } = await client
      .from('journal_entries')
      .update({ status: 'posted' })
      .eq('id', draftId);
    if (updateError) throw new Error(`Failed to approve draft: ${updateError.message}`);
    return { transactionId: draftId };
  }
}