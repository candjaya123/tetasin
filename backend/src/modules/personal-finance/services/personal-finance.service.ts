import { Injectable, BadRequestException } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { SupabaseService } from '../../../shared/supabase.service';

@Injectable()
export class PersonalFinanceService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(PersonalFinanceService.name);
  }

  async recordIncome(tenantId: string, body: any) {
    const { amount, income_account_id, destination_account_id, date, notes } = body;
    if (!amount || amount <= 0) throw new BadRequestException('Amount must be positive');
    if (!income_account_id || !destination_account_id) {
      throw new BadRequestException('income_account_id and destination_account_id required');
    }

    const client = this.supabaseService.getClient();
    const { data: journal, error: jeError } = await client
      .from('journal_entries')
      .insert({
        tenant_id: tenantId,
        reference_type: 'personal_income',
        description: notes || 'Personal income',
        status: 'posted',
      })
      .select()
      .single();
    if (jeError) throw jeError;

    const debitLine = {
      journal_entry_id: journal.id,
      entry_id: journal.id,
      account_id: destination_account_id,
      debit: amount,
      credit: 0,
      description: notes || 'Income received',
    };
    const creditLine = {
      journal_entry_id: journal.id,
      entry_id: journal.id,
      account_id: income_account_id,
      debit: 0,
      credit: amount,
      description: notes || 'Income credited',
    };

    const { error: linesError } = await client
      .from('journal_lines')
      .insert([debitLine, creditLine]);
    if (linesError) throw linesError;

    return { success: true, data: { journal_id: journal.id } };
  }

  async recordExpense(tenantId: string, body: any) {
    const { amount, expense_account_id, payment_account_id, date, notes } = body;
    if (!amount || amount <= 0) throw new BadRequestException('Amount must be positive');
    if (!expense_account_id || !payment_account_id) {
      throw new BadRequestException('expense_account_id and payment_account_id required');
    }

    const client = this.supabaseService.getClient();
    const { data: journal, error: jeError } = await client
      .from('journal_entries')
      .insert({
        tenant_id: tenantId,
        reference_type: 'personal_expense',
        description: notes || 'Personal expense',
        status: 'posted',
      })
      .select()
      .single();
    if (jeError) throw jeError;

    const debitLine = {
      journal_entry_id: journal.id,
      entry_id: journal.id,
      account_id: expense_account_id,
      debit: amount,
      credit: 0,
      description: notes || 'Expense',
    };
    const creditLine = {
      journal_entry_id: journal.id,
      entry_id: journal.id,
      account_id: payment_account_id,
      debit: 0,
      credit: amount,
      description: notes || 'Paid from',
    };

    const { error: linesError } = await client
      .from('journal_lines')
      .insert([debitLine, creditLine]);
    if (linesError) throw linesError;

    const warnings = await this.checkBudgetWarnings(tenantId, expense_account_id, amount, date);

    const result: any = { success: true, data: { journal_id: journal.id } };
    if (warnings.length > 0) {
      result.warnings = warnings;
    }
    return result;
  }

  async transfer(tenantId: string, body: any) {
    const { amount, from_account_id, to_account_id, notes } = body;
    if (!amount || amount <= 0) throw new BadRequestException('Amount must be positive');
    if (!from_account_id || !to_account_id) {
      throw new BadRequestException('from_account_id and to_account_id required');
    }
    if (from_account_id === to_account_id) {
      throw new BadRequestException('Source and destination accounts must differ');
    }

    const client = this.supabaseService.getClient();
    const { data: journal, error: jeError } = await client
      .from('journal_entries')
      .insert({
        tenant_id: tenantId,
        reference_type: 'personal_transfer',
        description: notes || 'Transfer between accounts',
        status: 'posted',
      })
      .select()
      .single();
    if (jeError) throw jeError;

    const debitLine = {
      journal_entry_id: journal.id,
      entry_id: journal.id,
      account_id: to_account_id,
      debit: amount,
      credit: 0,
      description: notes || 'Transfer in',
    };
    const creditLine = {
      journal_entry_id: journal.id,
      entry_id: journal.id,
      account_id: from_account_id,
      debit: 0,
      credit: amount,
      description: notes || 'Transfer out',
    };

    const { error: linesError } = await client
      .from('journal_lines')
      .insert([debitLine, creditLine]);
    if (linesError) throw linesError;

    return { success: true, data: { journal_id: journal.id } };
  }

  async getSummary(tenantId: string, month?: string, year?: string) {
    const now = new Date();
    const m = month ? parseInt(month) : now.getMonth() + 1;
    const y = year ? parseInt(year) : now.getFullYear();

    const startDate = new Date(y, m - 1, 1).toISOString();
    const endDate = new Date(y, m, 0, 23, 59, 59).toISOString();

    const client = this.supabaseService.getClient();

    const { data: revenueLines, error: revError } = await client
      .from('journal_lines')
      .select('credit, debit, account_id')
      .in('journal_entry_id', await client
        .from('journal_entries')
        .select('id')
        .eq('tenant_id', tenantId)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .eq('status', 'posted')
        .then(r => r.data?.map((e: any) => e.id) || []),
      );
    if (revError) throw revError;

    const { data: accounts } = await client
      .from('chart_of_accounts')
      .select('id, code, name, kategori')
      .eq('tenant_id', tenantId);

    const accountMap = new Map((accounts || []).map((a: any) => [a.id, a]));

    let pemasukan = 0;
    let pengeluaran = 0;

    for (const line of revenueLines || []) {
      const acct = accountMap.get(line.account_id);
      if (acct?.kategori === 'PENDAPATAN') {
        pemasukan += Number(line.credit) || 0;
      } else if (acct?.kategori === 'BEBAN OPERASIONAL') {
        pengeluaran += Number(line.debit) || 0;
      }
    }

    const selisih = pemasukan - pengeluaran;

    const netWorthData = await this.getNetWorth(tenantId);

    const budgetStatus = await this.getBudgetStatus(tenantId, m, y);

    return {
      success: true,
      data: {
        month: m,
        year: y,
        pemasukan,
        pengeluaran,
        selisih,
        net_worth: netWorthData.data?.net_worth || 0,
        budget_status: budgetStatus,
      },
    };
  }

  async getNetWorth(tenantId: string) {
    const client = this.supabaseService.getClient();

    const { data: journalIds } = await client
      .from('journal_entries')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('status', 'posted');

    if (!journalIds || journalIds.length === 0) {
      return { success: true, data: { aset: 0, hutang: 0, net_worth: 0 } };
    }

    const ids = journalIds.map((j: any) => j.id);
    const { data: lines } = await client
      .from('journal_lines')
      .select('account_id, debit, credit')
      .in('journal_entry_id', ids);

    const { data: accounts } = await client
      .from('chart_of_accounts')
      .select('id, kategori, normal_balance')
      .eq('tenant_id', tenantId);

    let totalAset = 0;
    let totalHutang = 0;

    const accountBalances = new Map<string, number>();
    for (const acct of accounts || []) {
      accountBalances.set(acct.id, 0);
    }

    for (const line of lines || []) {
      const balance = accountBalances.get(line.account_id) || 0;
      accountBalances.set(line.account_id, balance + (Number(line.debit) || 0) - (Number(line.credit) || 0));
    }

    for (const acct of accounts || []) {
      const bal = accountBalances.get(acct.id) || 0;
      if (acct.kategori === 'ASET') {
        totalAset += bal;
      } else if (acct.kategori === 'KEWAJIBAN') {
        totalHutang += Math.abs(bal);
      }
    }

    const netWorth = totalAset - totalHutang;

    return {
      success: true,
      data: { aset: totalAset, hutang: totalHutang, net_worth: Math.max(0, netWorth) },
    };
  }

  async getBudgets(tenantId: string, month?: string, year?: string) {
    const now = new Date();
    const m = month ? parseInt(month) : now.getMonth() + 1;
    const y = year ? parseInt(year) : now.getFullYear();

    const client = this.supabaseService.getClient();
    const { data: budgets, error } = await client
      .from('personal_budgets')
      .select('*, chart_of_accounts(name, code)')
      .eq('tenant_id', tenantId)
      .eq('month', m)
      .eq('year', y);
    if (error) throw error;

    const budgetStatus = await this.getBudgetStatus(tenantId, m, y, budgets);

    return { success: true, data: budgetStatus };
  }

  async upsertBudget(tenantId: string, body: any) {
    const { account_id, month, year, budget_amount } = body;
    if (!account_id || !month || !year || budget_amount == null) {
      throw new BadRequestException('account_id, month, year, budget_amount required');
    }

    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('personal_budgets')
      .upsert(
        { tenant_id: tenantId, account_id, month, year, budget_amount },
        { onConflict: 'tenant_id, account_id, month, year' },
      )
      .select()
      .single();
    if (error) throw error;

    return { success: true, data };
  }

  async getGoals(tenantId: string) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('financial_goals')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });
    if (error) throw error;

    const goalsWithProgress = (data || []).map((goal: any) => ({
      ...goal,
      progress_pct: goal.target_amount > 0
        ? Math.min(100, Math.round((Number(goal.current_amount) / Number(goal.target_amount)) * 100))
        : 0,
    }));

    return { success: true, data: goalsWithProgress };
  }

  async createGoal(tenantId: string, body: any) {
    const { name, goal_type, target_amount, target_date, linked_account_id, notes } = body;
    if (!name || !goal_type || !target_amount) {
      throw new BadRequestException('name, goal_type, target_amount required');
    }

    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('financial_goals')
      .insert({
        tenant_id: tenantId,
        name,
        goal_type,
        target_amount,
        target_date,
        linked_account_id,
        notes,
        status: 'active',
      })
      .select()
      .single();
    if (error) throw error;

    return { success: true, data };
  }

  async getGoalDetail(tenantId: string, id: string) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('financial_goals')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('id', id)
      .single();
    if (error) throw error;

    return {
      success: true,
      data: {
        ...data,
        progress_pct: data.target_amount > 0
          ? Math.min(100, Math.round((Number(data.current_amount) / Number(data.target_amount)) * 100))
          : 0,
      },
    };
  }

  async updateGoalProgress(tenantId: string, id: string, body: any) {
    const { amount, source_account_id, notes } = body;
    if (!amount || amount <= 0) throw new BadRequestException('Amount must be positive');

    const client = this.supabaseService.getClient();

    const { data: goal, error: goalError } = await client
      .from('financial_goals')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('id', id)
      .single();
    if (goalError || !goal) throw new BadRequestException('Goal not found');

    const newAmount = Number(goal.current_amount) + Number(amount);

    const { data: journal, error: jeError } = await client
      .from('journal_entries')
      .insert({
        tenant_id: tenantId,
        reference_type: 'personal_goal',
        reference_id: id,
        description: notes || `Progress untuk ${goal.name}`,
        status: 'posted',
      })
      .select()
      .single();
    if (jeError) throw jeError;

    if (goal.linked_account_id && source_account_id) {
      const debitLine = {
        journal_entry_id: journal.id,
        entry_id: journal.id,
        account_id: goal.linked_account_id,
        debit: amount,
        credit: 0,
        description: `Setoran ${goal.name}`,
      };
      const creditLine = {
        journal_entry_id: journal.id,
        entry_id: journal.id,
        account_id: source_account_id,
        debit: 0,
        credit: amount,
        description: `Dari sumber dana`,
      };
      const { error: linesError } = await client
        .from('journal_lines')
        .insert([debitLine, creditLine]);
      if (linesError) throw linesError;
    }

    const newStatus = newAmount >= Number(goal.target_amount) ? 'achieved' : 'active';
    const { error: updateError } = await client
      .from('financial_goals')
      .update({ current_amount: newAmount, status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('tenant_id', tenantId);
    if (updateError) throw updateError;

    return {
      success: true,
      data: {
        goal_id: id,
        current_amount: newAmount,
        target_amount: goal.target_amount,
        status: newStatus,
        progress_pct: goal.target_amount > 0
          ? Math.min(100, Math.round((newAmount / Number(goal.target_amount)) * 100))
          : 0,
        journal_id: journal.id,
      },
    };
  }

  async cancelGoal(tenantId: string, id: string) {
    const client = this.supabaseService.getClient();
    const { error } = await client
      .from('financial_goals')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('tenant_id', tenantId)
      .eq('id', id);
    if (error) throw error;

    return { success: true, data: { id, status: 'cancelled' } };
  }

  async getRecurring(tenantId: string) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('recurring_transactions')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('next_due_date', { ascending: true });
    if (error) throw error;

    return { success: true, data };
  }

  async createRecurring(tenantId: string, body: any) {
    const { name, amount, direction, debit_account_id, credit_account_id, frequency, day_of_period, next_due_date } = body;
    if (!name || !amount || !direction || !debit_account_id || !credit_account_id || !frequency || !next_due_date) {
      throw new BadRequestException('Missing required fields');
    }

    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('recurring_transactions')
      .insert({
        tenant_id: tenantId, name, amount, direction,
        debit_account_id, credit_account_id, frequency,
        day_of_period, next_due_date, is_active: true,
      })
      .select()
      .single();
    if (error) throw error;

    return { success: true, data };
  }

  async updateRecurring(tenantId: string, id: string, body: any) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('recurring_transactions')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('tenant_id', tenantId)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;

    return { success: true, data };
  }

  async triggerRecurring(tenantId: string, id: string) {
    const client = this.supabaseService.getClient();
    const { data: recurring, error: recError } = await client
      .from('recurring_transactions')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('id', id)
      .single();
    if (recError || !recurring) throw new BadRequestException('Recurring transaction not found');

    const { data: journal, error: jeError } = await client
      .from('journal_entries')
      .insert({
        tenant_id: tenantId,
        reference_type: 'personal_recurring',
        reference_id: id,
        description: `Auto: ${recurring.name}`,
        status: 'posted',
      })
      .select()
      .single();
    if (jeError) throw jeError;

    const debitLine = {
      journal_entry_id: journal.id,
      entry_id: journal.id,
      account_id: recurring.debit_account_id,
      debit: Number(recurring.amount),
      credit: 0,
      description: recurring.name,
    };
    const creditLine = {
      journal_entry_id: journal.id,
      entry_id: journal.id,
      account_id: recurring.credit_account_id,
      debit: 0,
      credit: Number(recurring.amount),
      description: recurring.name,
    };

    const { error: linesError } = await client
      .from('journal_lines')
      .insert([debitLine, creditLine]);
    if (linesError) throw linesError;

    let nextDue = new Date(recurring.next_due_date);
    switch (recurring.frequency) {
      case 'daily': nextDue.setDate(nextDue.getDate() + 1); break;
      case 'weekly': nextDue.setDate(nextDue.getDate() + 7); break;
      case 'monthly': nextDue.setMonth(nextDue.getMonth() + 1); break;
      case 'yearly': nextDue.setFullYear(nextDue.getFullYear() + 1); break;
    }

    const { error: updateError } = await client
      .from('recurring_transactions')
      .update({
        last_triggered_at: new Date().toISOString(),
        next_due_date: nextDue.toISOString().split('T')[0],
      })
      .eq('id', id)
      .eq('tenant_id', tenantId);
    if (updateError) throw updateError;

    return {
      success: true,
      data: {
        recurring_id: id,
        journal_id: journal.id,
        next_due_date: nextDue.toISOString().split('T')[0],
        amount_processed: Number(recurring.amount),
      },
    };
  }

  async deactivateRecurring(tenantId: string, id: string) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('recurring_transactions')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('tenant_id', tenantId)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;

    return { success: true, data };
  }

  private async checkBudgetWarnings(tenantId: string, accountId: string, amount: number, date?: string) {
    const now = new Date(date || Date.now());
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const client = this.supabaseService.getClient();
    const { data: budget } = await client
      .from('personal_budgets')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('account_id', accountId)
      .eq('month', month)
      .eq('year', year)
      .maybeSingle();

    if (!budget) return [];

    const startDate = new Date(year, month - 1, 1).toISOString();
    const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();

    const { data: journalIds } = await client
      .from('journal_entries')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('status', 'posted')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (!journalIds || journalIds.length === 0) return [];

    const ids = journalIds.map((j: any) => j.id);
    const { data: lines } = await client
      .from('journal_lines')
      .select('debit')
      .in('journal_entry_id', ids)
      .eq('account_id', accountId);

    const actualSpent = (lines || []).reduce((sum: number, l: any) => sum + (Number(l.debit) || 0), 0) + amount;
    const pctUsed = budget.budget_amount > 0 ? Math.round((actualSpent / Number(budget.budget_amount)) * 100) : 0;

    if (pctUsed >= 100) {
      return [{
        code: 'BUDGET_EXCEEDED',
        message: `Pengeluaran melebihi anggaran bulan ini (${pctUsed}%)`,
        account_id: accountId,
        pct_used: pctUsed,
      }];
    }
    if (pctUsed >= 80) {
      return [{
        code: 'BUDGET_WARNING',
        message: `Anggaran sudah terpakai ${pctUsed}%`,
        account_id: accountId,
        pct_used: pctUsed,
      }];
    }

    return [];
  }

  private async getBudgetStatus(tenantId: string, month: number, year: number, budgets?: any[]) {
    const client = this.supabaseService.getClient();

    let budgetList = budgets;
    if (!budgetList) {
      const { data } = await client
        .from('personal_budgets')
        .select('*, chart_of_accounts(name, code)')
        .eq('tenant_id', tenantId)
        .eq('month', month)
        .eq('year', year);
      budgetList = data || [];
    }

    if (budgetList.length === 0) return [];

    const startDate = new Date(year, month - 1, 1).toISOString();
    const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();

    const { data: journalIds } = await client
      .from('journal_entries')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('status', 'posted')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    const ids = (journalIds || []).map((j: any) => j.id);

    let allLines: any[] = [];
    if (ids.length > 0) {
      const { data: lines } = await client
        .from('journal_lines')
        .select('account_id, debit')
        .in('journal_entry_id', ids);
      allLines = lines || [];
    }

    const spendingByAccount = new Map<string, number>();
    for (const line of allLines) {
      const current = spendingByAccount.get(line.account_id) || 0;
      spendingByAccount.set(line.account_id, current + (Number(line.debit) || 0));
    }

    return budgetList.map((budget: any) => {
      const actual = spendingByAccount.get(budget.account_id) || 0;
      const pctUsed = Number(budget.budget_amount) > 0
        ? Math.round((actual / Number(budget.budget_amount)) * 100)
        : 0;
      const status = pctUsed >= 100 ? 'over_budget' : pctUsed >= 80 ? 'warning' : 'on_track';

      return {
        account_id: budget.account_id,
        name: budget.chart_of_accounts?.name || '',
        code: budget.chart_of_accounts?.code || '',
        budget: Number(budget.budget_amount),
        actual,
        pct_used: pctUsed,
        status,
      };
    });
  }
}
