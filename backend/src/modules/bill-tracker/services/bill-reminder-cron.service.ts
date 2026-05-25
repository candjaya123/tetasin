import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SupabaseService } from '../../../shared/supabase.service';

@Injectable()
export class BillReminderCronService {
  private readonly logger = new Logger(BillReminderCronService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async markOverdueBills() {
    this.logger.log('Memeriksa tagihan yang melewati jatuh tempo...');

    try {
      const client = this.supabaseService.getClient();
      const today = new Date().toISOString().split('T')[0];

      const { data: overdueBills, error: fetchError } = await client
        .from('bills')
        .select('id, tenant_id, title, due_date, amount, amount_paid')
        .in('status', ['pending', 'partial'])
        .lt('due_date', today);

      if (fetchError) {
        this.logger.error(`Gagal mengambil tagihan: ${fetchError.message}`);
        return;
      }

      if (!overdueBills || overdueBills.length === 0) {
        this.logger.log('Tidak ada tagihan yang perlu ditandai overdue.');
        return;
      }

      const billIds = overdueBills.map((b: any) => b.id);

      const { error: updateError } = await client
        .from('bills')
        .update({ status: 'overdue', updated_at: new Date().toISOString() })
        .in('id', billIds);

      if (updateError) {
        this.logger.error(`Gagal memperbarui status overdue: ${updateError.message}`);
        return;
      }

      for (const bill of overdueBills) {
        const outstanding = Number(bill.amount) - Number(bill.amount_paid || 0);
        const { error: alertError } = await client
          .from('smart_alerts')
          .insert({
            tenant_id: bill.tenant_id,
            alert_type: 'bill_overdue',
            message: `Tagihan "${bill.title}" sebesar Rp ${outstanding.toLocaleString('id-ID')} telah melewati jatuh tempo (${bill.due_date}). Segera lakukan pembayaran.`,
            priority: 'high',
            is_read: false,
          });

        if (alertError) {
          this.logger.warn(`Gagal membuat alert untuk ${bill.id}: ${alertError.message}`);
        }
      }

      this.logger.log(`${overdueBills.length} tagihan ditandai sebagai overdue.`);
    } catch (error: any) {
      this.logger.error(`Bill Reminder Cron Error: ${error.message}`);
    }
  }
}
