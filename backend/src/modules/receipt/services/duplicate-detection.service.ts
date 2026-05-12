import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../../shared/supabase.service';

@Injectable()
export class DuplicateDetectionService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async check(tenantId: string, merchantName: string, amount: number, date: string) {
    if (!merchantName || !amount || !date) return { is_duplicate: false };

    const client = this.supabaseService.getClient();
    
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const { data: drafts } = await client
      .from('draft_transactions')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('status', 'approved')
      .ilike('merchant_name', merchantName)
      .eq('total_amount', amount)
      .gte('transaction_date', startDate.toISOString())
      .lte('transaction_date', endDate.toISOString())
      .limit(1);

    if (drafts && drafts.length > 0) {
      return { is_duplicate: true, similar_id: drafts[0].id };
    }

    return { is_duplicate: false };
  }
}
