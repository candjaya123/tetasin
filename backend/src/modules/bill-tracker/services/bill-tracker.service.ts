import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { SupabaseService } from '../../../shared/supabase.service';

interface BillQuery {
  status?: string;
  bill_type?: string;
  due_before?: string;
  due_after?: string;
  search?: string;
  sort?: string;
}

@Injectable()
export class BillTrackerService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(BillTrackerService.name);
  }

  async getBills(tenantId: string, query: BillQuery) {
    const client = this.supabaseService.getClient();
    let dbQuery = client
      .from('bills')
      .select('*')
      .eq('tenant_id', tenantId);

    if (query.status) {
      const statuses = query.status.split(',');
      dbQuery = dbQuery.in('status', statuses);
    }
    if (query.bill_type) {
      dbQuery = dbQuery.eq('bill_type', query.bill_type);
    }
    if (query.due_before) {
      dbQuery = dbQuery.lte('due_date', query.due_before);
    }
    if (query.due_after) {
      dbQuery = dbQuery.gte('due_date', query.due_after);
    }
    if (query.search) {
      dbQuery = dbQuery.or(`title.ilike.%${query.search}%,contact_name.ilike.%${query.search}%`);
    }
    const sortField = query.sort || 'due_date';
    dbQuery = dbQuery.order(sortField, { ascending: true });

    const { data, error } = await dbQuery;
    if (error) throw error;

    return { success: true, data };
  }

  async createBill(tenantId: string, body: any) {
    const { title, amount, bill_type, due_date, contact_name, contact_phone, coa_account_id, payment_account_id, reminder_days, description, photo_url } = body;

    if (!title || !amount || !bill_type || !due_date) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'title, amount, bill_type, due_date required',
      });
    }

    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('bills')
      .insert({
        tenant_id: tenantId,
        title,
        amount,
        bill_type,
        due_date,
        contact_name,
        contact_phone,
        type: bill_type,
        coa_account_id,
        payment_account_id,
        reminder_days: reminder_days || [7, 3, 1],
        description,
        photo_url,
        status: 'pending',
        amount_paid: 0,
      })
      .select()
      .single();
    if (error) throw error;

    return { success: true, data: { bill_id: data.id, status: data.status, due_date: data.due_date } };
  }

  async getBillDetail(tenantId: string, id: string) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('bills')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('id', id)
      .single();
    if (error) throw new NotFoundException('Bill not found');

    const { data: payments } = await client
      .from('bill_payments')
      .select('*')
      .eq('bill_id', id)
      .order('payment_date', { ascending: false });

    return { success: true, data: { ...data, payments: payments || [] } };
  }

  async updateBill(tenantId: string, id: string, body: any) {
    const client = this.supabaseService.getClient();

    const { data: existing } = await client
      .from('bills')
      .select('status')
      .eq('tenant_id', tenantId)
      .eq('id', id)
      .single();
    if (!existing) throw new NotFoundException('Bill not found');
    if (existing.status === 'paid' || existing.status === 'cancelled') {
      throw new ConflictException({
        code: 'BILL_ALREADY_SETTLED',
        message: 'Cannot modify a bill that is already paid or cancelled',
      });
    }

    const { data, error } = await client
      .from('bills')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('tenant_id', tenantId)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;

    return { success: true, data };
  }

  async deleteBill(tenantId: string, id: string) {
    const client = this.supabaseService.getClient();
    const { error } = await client
      .from('bills')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('tenant_id', tenantId)
      .eq('id', id);
    if (error) throw error;

    return { success: true };
  }

  async payBill(tenantId: string, id: string, body: any) {
    const { amount, payment_date, payment_account_id, notes } = body;
    if (!amount || amount <= 0) throw new BadRequestException({
      code: 'VALIDATION_ERROR',
      message: 'Amount must be positive',
    });

    const client = this.supabaseService.getClient();

    const { data: bill, error: billError } = await client
      .from('bills')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('id', id)
      .single();
    if (billError || !bill) throw new NotFoundException('Bill not found');
    if (bill.status === 'paid' || bill.status === 'cancelled') {
      throw new ConflictException({
        code: 'BILL_ALREADY_SETTLED',
        message: 'Bill is already paid or cancelled',
      });
    }

    const remaining = Number(bill.amount) - Number(bill.amount_paid);
    if (amount > remaining) {
      throw new BadRequestException({
        code: 'OVERPAYMENT_ERROR',
        message: `Payment amount exceeds remaining balance of ${remaining}`,
      });
    }

    const newAmountPaid = Number(bill.amount_paid) + Number(amount);
    const isFullyPaid = newAmountPaid >= Number(bill.amount);
    const newStatus = isFullyPaid ? 'paid' : 'partial';

    const billType = bill.bill_type || bill.type;

    const { data: journal, error: jeError } = await client
      .from('journal_entries')
      .insert({
        tenant_id: tenantId,
        reference_type: billType === 'hutang' ? 'bill_paid' : 'bill_paid',
        reference_id: id,
        description: `Pembayaran ${billType === 'hutang' ? 'tagihan' : 'piutang'}: ${bill.title}`,
        status: 'posted',
      })
      .select()
      .single();
    if (jeError) throw jeError;

    const payAccountId = payment_account_id || bill.payment_account_id;
    const coaAccountId = bill.coa_account_id;

    if (coaAccountId && payAccountId) {
      let debitLine: any, creditLine: any;

      if (billType === 'hutang') {
        debitLine = { journal_entry_id: journal.id, entry_id: journal.id, account_id: coaAccountId, debit: amount, credit: 0, description: `Bayar ${bill.title}` };
        creditLine = { journal_entry_id: journal.id, entry_id: journal.id, account_id: payAccountId, debit: 0, credit: amount, description: `Dari rekening pembayaran` };
      } else {
        debitLine = { journal_entry_id: journal.id, entry_id: journal.id, account_id: payAccountId, debit: amount, credit: 0, description: `Terima ${bill.title}` };
        creditLine = { journal_entry_id: journal.id, entry_id: journal.id, account_id: coaAccountId, debit: 0, credit: amount, description: `Piutang dibayar` };
      }

      const { error: linesError } = await client
        .from('journal_lines')
        .insert([debitLine, creditLine]);
      if (linesError) throw linesError;
    }

    const { error: payError } = await client
      .from('bill_payments')
      .insert({
        bill_id: id,
        tenant_id: tenantId,
        amount,
        payment_date: payment_date || new Date().toISOString().split('T')[0],
        payment_account_id: payAccountId,
        notes,
        journal_entry_id: journal.id,
      });
    if (payError) throw payError;

    const { error: updateError } = await client
      .from('bills')
      .update({
        amount_paid: newAmountPaid,
        status: newStatus,
        journal_entry_id: isFullyPaid ? journal.id : bill.journal_entry_id,
        updated_at: new Date().toISOString(),
      })
      .eq('tenant_id', tenantId)
      .eq('id', id);
    if (updateError) throw updateError;

    return {
      success: true,
      data: {
        bill_id: id,
        amount_paid: newAmountPaid,
        remaining: Number(bill.amount) - newAmountPaid,
        status: newStatus,
        journal_id: journal.id,
        is_fully_paid: isFullyPaid,
      },
    };
  }

  async getPayments(tenantId: string, id: string) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('bill_payments')
      .select('*, journal_entries!inner(tenant_id)')
      .eq('bill_id', id)
      .order('payment_date', { ascending: false });
    if (error) throw error;

    const filtered = (data || []).filter((p: any) => p.journal_entries?.tenant_id === tenantId);
    return { success: true, data: filtered };
  }

  async cancelBill(tenantId: string, id: string) {
    const client = this.supabaseService.getClient();
    const { data: bill } = await client
      .from('bills')
      .select('status')
      .eq('tenant_id', tenantId)
      .eq('id', id)
      .single();
    if (!bill) throw new NotFoundException('Bill not found');
    if (bill.status === 'paid') {
      throw new ConflictException({
        code: 'BILL_ALREADY_SETTLED',
        message: 'Cannot cancel a paid bill',
      });
    }

    const { error } = await client
      .from('bills')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('tenant_id', tenantId)
      .eq('id', id);
    if (error) throw error;

    return { success: true, data: { id, status: 'cancelled' } };
  }

  async getSummary(tenantId: string) {
    const client = this.supabaseService.getClient();
    const { data: bills, error } = await client
      .from('bills')
      .select('bill_type, amount, amount_paid, status')
      .eq('tenant_id', tenantId);
    if (error) throw error;

    const hutang = { total: 0, outstanding_amount: 0, overdue_count: 0 };
    const piutang = { total: 0, outstanding_amount: 0, overdue_count: 0 };

    for (const bill of bills || []) {
      const bt = bill.bill_type;
      const outstanding = Number(bill.amount) - Number(bill.amount_paid || 0);
      const target = bt === 'piutang' ? piutang : hutang;

      target.total++;
      if (bill.status !== 'paid' && bill.status !== 'cancelled') {
        target.outstanding_amount += outstanding;
      }
      if (bill.status === 'overdue') {
        target.overdue_count++;
      }
    }

    return {
      success: true,
      data: { hutang, piutang },
    };
  }
}
