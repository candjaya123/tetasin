import { Controller, Post, Body, Param, Request, UseGuards, Get, Query } from '@nestjs/common';
import { AccountingRepository } from '../repositories/accounting.repository';
import { SupabaseService } from '../../../shared/supabase.service';
import { JournalEntry } from '../domain/journal.domain';
import { JwtAuthGuard } from '../../business-profile/guards/jwt-auth.guard';
import { BudgetService } from '../services/budget.service';
import { AccountingService } from '../services/accounting.service';

@Controller('api/v1/journal')
@UseGuards(JwtAuthGuard)
export class JournalController {
  constructor(
    private readonly accountingRepository: AccountingRepository,
    private readonly supabaseService: SupabaseService,
    private readonly budgetService: BudgetService,
    private readonly accountingService: AccountingService,
  ) {}

  @Get()
  async getJournals(@Request() req: any, @Query('startDate') start?: string, @Query('endDate') end?: string) {
    return await this.accountingRepository.getJournalEntries(req.user.tenant_id, start, end);
  }

  @Post()
  async createJournalEntry(@Request() req: any, @Body() payload: any) {
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
          .catch(err => console.error('Budget Check Error:', err));
      }
    });

    return result;
  }

  @Get('drafts')
  async getDrafts(@Request() req: any) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('drafts')
      .select('*')
      .eq('tenant_id', req.user.tenant_id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  @Post('draft')
  async createDraft(@Body() payload: any) {
    const entries = Array.isArray(payload) ? payload : [payload];
    const draftEntries = entries.map(entry => ({
      ...entry,
      is_draft: true,
    }));
    const client = this.supabaseService.getClient();
    const { data, error } = await client.from('drafts').insert(draftEntries).select();
    if (error) throw error;
    return data;
  }

  @Post('approve-draft/:draftId')
  async approveDraft(@Param('draftId') draftId: string, @Request() req: any) {
    const client = this.supabaseService.getClient();

    // 1. Fetch Draft
    const { data: draft, error: fetchError } = await client
      .from('drafts')
      .select('*')
      .eq('id', draftId)
      .single();

    if (fetchError || !draft) throw new Error(`Draft not found: ${fetchError?.message}`);

    const payload = draft.payload; // Assuming payload is formatted as transaction + lines
    
    // 2. Validate Balance
    const lines = payload.lines.map((l: any) => ({
      amount: Number(l.debit) || Number(l.credit),
      type: Number(l.debit) > 0 ? 'debit' as const : 'credit' as const
    }));
    JournalEntry.validateBalance(lines);

    // 3. Create Real Transaction
    const transactionData = {
      tenant_id: draft.tenant_id,
      reference_number: `AI-${Date.now()}`,
      transaction_type: 'expense' as const,
      created_by: req.user.id,
    };

    const linesData = payload.lines.map((l: any) => ({
      account_id: l.account_id,
      debit: l.debit || 0,
      credit: l.credit || 0,
      description: l.description || 'AI Extracted Transaction',
    }));

    const result = await this.accountingService.createJournalEntry(
      draft.tenant_id,
      {
        reference_number: transactionData.reference_number,
        description: 'Approved from Draft',
        lines: linesData,
      }
    );
    const transactionId = result.id;

    // 4. Update Draft Status
    await client.from('drafts').update({ status: 'approved' }).eq('id', draftId);

    return { transactionId };
  }
}
