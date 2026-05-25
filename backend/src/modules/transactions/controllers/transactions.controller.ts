import { Controller, Get, Param, Query, Request, UseGuards, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../../shared/supabase.service';
import { JwtAuthGuard } from '../../business-profile/guards/jwt-auth.guard';
import { RequireTier } from '../../../core/auth/tier.decorator';
import { SubscriptionTier } from '../../../core/constants/subscription-tier.enum';
import type { AuthenticatedRequest } from '../../../core/auth/authenticated-request.interface';

@Controller('api/v1/transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Get()
  @RequireTier(SubscriptionTier.FREE)
  async getTransactions(
    @Request() req: AuthenticatedRequest,
    @Query('source_type') sourceType?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('page') page?: string,
    @Query('per_page') perPage?: string,
    @Query('sort') sort?: string,
    @Query('order') order?: string,
  ) {
    const client = this.supabaseService.getClient();
    const tenantId = req.user.tenant_id;

    const currentPage = Math.max(1, parseInt(page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(perPage || '20', 10)));
    const offset = (currentPage - 1) * limit;

    let query = client
      .from('transactions')
      .select('*')
      .eq('tenant_id', tenantId)
      .order(sort || 'transaction_date', { ascending: order === 'asc' })
      .range(offset, offset + limit - 1);

    if (sourceType) query = query.eq('source_type', sourceType);
    if (from) query = query.gte('transaction_date', from);
    if (to) query = query.lte('transaction_date', to);

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      data: data || [],
      meta: {
        page: currentPage,
        per_page: limit,
        total: count || data?.length || 0,
      },
    };
  }

  @Get(':id')
  @RequireTier(SubscriptionTier.FREE)
  async getTransactionById(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    const client = this.supabaseService.getClient();
    const tenantId = req.user.tenant_id;

    const { data: transaction, error: txError } = await client
      .from('transactions')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();

    if (txError || !transaction) throw new NotFoundException('Transaksi tidak ditemukan');

    const { data: pesanan } = await client
      .from('sales_orders')
      .select('*')
      .eq('id', transaction.pesanan_id)
      .maybeSingle();

    const { data: journal } = await client
      .from('journal_entries')
      .select('*, journal_lines(*, chart_of_accounts(*))')
      .eq('id', transaction.journal_id)
      .maybeSingle();

    const { data: saleItems } = await client
      .from('sale_items')
      .select('*')
      .eq('transaction_id', id);

    return {
      ...transaction,
      pesanan,
      journal,
      sale_items: saleItems || [],
    };
  }
}
