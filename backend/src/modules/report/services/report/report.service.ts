import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../../../shared/supabase.service';
import { AccountingRepository } from '../../../accounting/repositories/accounting.repository';
import { InventoryRepository } from '../../../inventory/repositories/inventory.repository';
import Decimal from 'decimal.js';

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly accountingRepository: AccountingRepository,
    private readonly inventoryRepository: InventoryRepository
  ) {}

  async getIncomeStatement(tenantId: string, startDate: string, endDate: string) {
    try {
      const balances = await this.accountingRepository.getAccountBalances(tenantId, startDate, endDate);
      
      const report = {
        revenue: { total: '0', accounts: [] as any[] },
        cogs: { total: '0', accounts: [] as any[] },
        opex: { total: '0', accounts: [] as any[] },
        gross_profit: '0',
        net_profit: '0'
      };

      let totalRevenue = new Decimal(0);
      let totalCogs = new Decimal(0);
      let totalOpex = new Decimal(0);

      balances.forEach(acc => {
        const debit = new Decimal(acc.total_debit);
        const credit = new Decimal(acc.total_credit);
        const code = acc.code || '';

        if (code.startsWith('4')) {
          const amount = credit.minus(debit);
          totalRevenue = totalRevenue.plus(amount);
          report.revenue.accounts.push({ name: acc.name, code: acc.code, amount: amount.toString() });
        } else if (code.startsWith('5')) {
          const amount = debit.minus(credit);
          totalCogs = totalCogs.plus(amount);
          report.cogs.accounts.push({ name: acc.name, code: acc.code, amount: amount.toString() });
        } else if (code.startsWith('6')) {
          const amount = debit.minus(credit);
          totalOpex = totalOpex.plus(amount);
          report.opex.accounts.push({ name: acc.name, code: acc.code, amount: amount.toString() });
        }
      });

      const grossProfit = totalRevenue.minus(totalCogs);
      const netProfit = grossProfit.minus(totalOpex);

      report.revenue.total = totalRevenue.toString();
      report.cogs.total = totalCogs.toString();
      report.opex.total = totalOpex.toString();
      report.gross_profit = grossProfit.toString();
      report.net_profit = netProfit.toString();

      return report;
    } catch (error) {
      this.logger.error(`Error in getIncomeStatement for tenant ${tenantId}: ${error.message}`);
      throw new Error(`Gagal memproses laporan laba rugi: ${error.message}`);
    }
  }

  async getDashboardSummary(tenantId: string, startDate?: string, endDate?: string) {
    const balances = await this.accountingRepository.getAccountBalances(tenantId, startDate, endDate);
    
    let revenue = new Decimal(0);
    let expenses = new Decimal(0);

    balances.forEach((acc: any) => {
      const debit = new Decimal(acc.total_debit);
      const credit = new Decimal(acc.total_credit);
      const code = acc.code || '';

      if (code.startsWith('4')) {
        revenue = revenue.plus(credit.minus(debit));
      } else if (code.startsWith('5') || code.startsWith('6')) {
        expenses = expenses.plus(debit.minus(credit));
      }
    });

    return {
      revenue: revenue.toString(),
      expenses: expenses.toString(),
      net_profit: revenue.minus(expenses).toString()
    };
  }

  async getBalanceSheet(tenantId: string, endDate?: string) {
    try {
      const balances = await this.accountingRepository.getAccountBalances(tenantId, undefined, endDate);
      
      const report = {
        assets: { total: '0', accounts: [] as any[] },
        liabilities: { total: '0', accounts: [] as any[] },
        equity: { total: '0', accounts: [] as any[] },
        is_balanced: false,
        difference: '0'
      };

      let totalAssets = new Decimal(0);
      let totalLiabilities = new Decimal(0);
      let totalEquity = new Decimal(0);

      balances.forEach((acc: any) => {
        const debit = new Decimal(acc.total_debit);
        const credit = new Decimal(acc.total_credit);
        const code = acc.code || '';

        if (code.startsWith('1')) {
          const amount = debit.minus(credit);
          totalAssets = totalAssets.plus(amount);
          report.assets.accounts.push({ name: acc.name, code: acc.code, amount: amount.toString() });
        } else if (code.startsWith('2')) {
          const amount = credit.minus(debit);
          totalLiabilities = totalLiabilities.plus(amount);
          report.liabilities.accounts.push({ name: acc.name, code: acc.code, amount: amount.toString() });
        } else if (code.startsWith('3')) {
          const amount = credit.minus(debit);
          totalEquity = totalEquity.plus(amount);
          report.equity.accounts.push({ name: acc.name, code: acc.code, amount: amount.toString() });
        }
      });

      report.assets.total = totalAssets.toString();
      report.liabilities.total = totalLiabilities.toString();
      report.equity.total = totalEquity.toString();
      
      const diff = totalAssets.minus(totalLiabilities.plus(totalEquity));
      report.difference = diff.toString();
      report.is_balanced = diff.abs().lessThan(0.01);

      return report;
    } catch (error) {
      this.logger.error(`Error in getBalanceSheet for tenant ${tenantId}: ${error.message}`);
      throw new Error(`Gagal memproses laporan neraca: ${error.message}`);
    }
  }

  async getCashFlow(tenantId: string, startDate: string, endDate: string) {
    try {
      const balances = await this.accountingRepository.getAccountBalances(tenantId, startDate, endDate);
      
      const report = {
        operating: { total: '0', accounts: [] as any[] },
        investing: { total: '0', accounts: [] as any[] },
        financing: { total: '0', accounts: [] as any[] },
        net_cash_flow: '0'
      };

      let totalOp = new Decimal(0);
      let totalInv = new Decimal(0);
      let totalFin = new Decimal(0);

      balances.forEach((acc: any) => {
        const debit = new Decimal(acc.total_debit);
        const credit = new Decimal(acc.total_credit);
        const code = acc.code || '';
        
        if (code.startsWith('4') || code.startsWith('5') || code.startsWith('6') || (code.startsWith('1') && code !== '1-1')) {
          if (!code.startsWith('1-2') && !code.startsWith('2-2') && !code.startsWith('3')) {
             const amount = credit.minus(debit);
             totalOp = totalOp.plus(amount);
             report.operating.accounts.push({ name: acc.name, code: acc.code, amount: amount.toString() });
          }
        }
        
        if (code.startsWith('1-2')) {
          const amount = credit.minus(debit);
          totalInv = totalInv.plus(amount);
          report.investing.accounts.push({ name: acc.name, code: acc.code, amount: amount.toString() });
        }

        if (code.startsWith('2-2') || code.startsWith('3')) {
          const amount = credit.minus(debit);
          totalFin = totalFin.plus(amount);
          report.financing.accounts.push({ name: acc.name, code: acc.code, amount: amount.toString() });
        }
      });

      report.operating.total = totalOp.toString();
      report.investing.total = totalInv.toString();
      report.financing.total = totalFin.toString();
      report.net_cash_flow = totalOp.plus(totalInv).plus(totalFin).toString();

      return report;
    } catch (error) {
      this.logger.error(`Error in getCashFlow for tenant ${tenantId}: ${error.message}`);
      throw new Error(`Gagal memproses laporan arus kas: ${error.message}`);
    }
  }

  async getPersonalSummary(tenantId: string, startDate?: string, endDate?: string) {
    const balances = await this.accountingRepository.getAccountBalances(tenantId, startDate, endDate);
    
    let totalInflow = new Decimal(0);
    let totalOutflow = new Decimal(0);

    balances.forEach((acc: any) => {
      const debit = new Decimal(acc.total_debit);
      const credit = new Decimal(acc.total_credit);
      const code = acc.code || '';

      if (code.startsWith('4')) {
        totalInflow = totalInflow.plus(credit.minus(debit));
      } else if (code.startsWith('6')) {
        totalOutflow = totalOutflow.plus(debit.minus(credit));
      }
    });

    return {
      total_inflow: totalInflow.toString(),
      total_outflow: totalOutflow.toString(),
      net_cash_flow: totalInflow.minus(totalOutflow).toString(),
      transaction_count: 0
    };
  }

  async getAccountingAccounts(tenantId: string) {
    return await this.accountingRepository.getAccountingAccounts(tenantId);
  }

  async getSalesReport(tenantId: string, startDate?: string, endDate?: string) {
    const data = await this.accountingRepository.getSalesReport(tenantId, startDate, endDate);

    return data.map((entry: any) => {
      const revenueLines = entry.journal_lines.filter((l: any) => l.chart_of_accounts?.code.startsWith('4'));
      const totalAmount = revenueLines.reduce((sum: any, l: any) => (sum as any).plus(new Decimal(l.credit)), new Decimal(0));
      return {
        id: entry.id,
        created_at: entry.created_at,
        order_number: entry.reference_doc || 'POS-SALE',
        customer_name: (entry.description || '').split(' - ')[1] || 'Pelanggan POS',
        total_amount: totalAmount.toString(),
        status: 'completed'
      };
    });
  }

  async getJournal(tenantId: string, startDate: string, endDate: string) {
    return await this.accountingRepository.getJournalEntriesWithLines(tenantId, startDate, endDate);
  }

  async getLedger(tenantId: string, accountId: string, startDate: string, endDate: string) {
    // Get opening balance
    const opening = await this.accountingRepository.getAccountBalanceAtDate(tenantId, accountId, startDate);
    const lines = await this.accountingRepository.getLedgerLines(tenantId, accountId, startDate, endDate);

    let runningBalance = new Decimal(opening || 0);
    const results = lines.map((l: any) => {
      const debit = new Decimal(l.debit);
      const credit = new Decimal(l.credit);
      runningBalance = runningBalance.plus(debit.minus(credit));
      return {
        id: l.id,
        date: l.journal_entries.transaction_date,
        description: l.journal_entries.description,
        reference: l.journal_entries.reference_doc || l.journal_entries.reference_type || l.journal_entries.reference_id || '',
        debit: debit.toString(),
        credit: credit.toString(),
        balance: runningBalance.toString()
      };
    });

    return {
      opening_balance: new Decimal(opening || 0).toString(),
      lines: results,
      closing_balance: runningBalance.toString()
    };
  }

  async getTrialBalance(tenantId: string, endDate: string) {
    const balances = await this.accountingRepository.getAccountBalances(tenantId, undefined, endDate);
    
    return balances.map(acc => ({
      code: acc.code,
      name: acc.name,
      debit: acc.total_debit,
      credit: acc.total_credit,
      balance: new Decimal(acc.total_debit).minus(new Decimal(acc.total_credit)).toString()
    }));
  }

  async getStockReport(tenantId: string) {
    const data = await this.inventoryRepository.getStockReport(tenantId);

    return data.map(row => {
      const stock = new Decimal(row.current_stock || 0);
      const price = new Decimal(row.selling_price || 0);
      return {
        id: row.id,
        name: row.name,
        sku: row.sku,
        current_stock: stock.toString(),
        unit_price: price.toString(),
        total_value: stock.times(price).toString(),
      };
    });
  }
}
