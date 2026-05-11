import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../../shared/supabase.service';
import { AccountingRepository } from '../repositories/accounting.repository';
import { Decimal } from 'decimal.js';

@Injectable()
export class AccountingService {
  private readonly logger = new Logger(AccountingService.name);

  constructor(
    private readonly accountingRepository: AccountingRepository,
    private readonly supabaseService: SupabaseService,
  ) {}

  /**
   * Menghasilkan entri jurnal double-entry.
   * Memastikan total Debit == total Kredit.
   */
  async createJournalEntry(tenantId: string, payload: {
    date?: string;
    reference_number: string;
    description: string;
    lines: { account_id: string; debit: number; credit: number }[];
  }, dbClient?: any) {
    this.logger.log(`Creating journal entry for tenant: ${tenantId}, ref: ${payload.reference_number}`);

    // 1. Validasi Persamaan Dasar Akuntansi (Debit == Kredit)
    let totalDebit = new Decimal(0);
    let totalCredit = new Decimal(0);

    payload.lines.forEach(line => {
      totalDebit = totalDebit.plus(new Decimal(line.debit || 0));
      totalCredit = totalCredit.plus(new Decimal(line.credit || 0));
    });

    if (!totalDebit.equals(totalCredit)) {
      this.logger.error(`Journal imbalance: Debit (${totalDebit.toString()}) != Credit (${totalCredit.toString()})`);
      throw new Error(`Entri jurnal tidak seimbang: Debit (${totalDebit.toString()}) != Kredit (${totalCredit.toString()})`);
    }

    // 2. Simpan via Repository
    const entry = await this.accountingRepository.createTransactionWithLines(
      {
        tenant_id: tenantId,
        reference_number: payload.reference_number,
        description: payload.description,
      },
      payload.lines,
      dbClient
    );

    return entry;
  }

  /**
   * Menginisialisasi COA untuk tenant baru berdasarkan master table di DB
   */
  async initializeCOA(tenantId: string, industry?: string, scale?: string, accountType: string = 'business') {
    this.logger.log(`Initializing COA for tenant: ${tenantId}, industry: ${industry}, scale: ${scale}, type: ${accountType}`);
    
    const client = this.accountingRepository.getClient();
    
    try {
      const isPersonal = accountType === 'personal';

      if (isPersonal) {
        const personalAccounts = [
          { code: '1-10000', name: 'Kas Tunai', type: 'asset', normal_balance: 'debit' },
          { code: '1-10001', name: 'Rekening Bank Utama', type: 'asset', normal_balance: 'debit' },
          { code: '1-10002', name: 'E-Wallet', type: 'asset', normal_balance: 'debit' },
          { code: '2-20000', name: 'Kartu Kredit', type: 'liability', normal_balance: 'credit' },
          { code: '2-20001', name: 'Cicilan / Paylater', type: 'liability', normal_balance: 'credit' },
          { code: '3-30000', name: 'Saldo Awal', type: 'equity', normal_balance: 'credit' },
          { code: '4-40000', name: 'Gaji Pokok', type: 'revenue', normal_balance: 'credit' },
          { code: '4-40001', name: 'Bonus / THR', type: 'revenue', normal_balance: 'credit' },
          { code: '4-40002', name: 'Pendapatan Lainnya', type: 'revenue', normal_balance: 'credit' },
          { code: '6-60000', name: 'Beban Makan & Minum', type: 'expense', normal_balance: 'debit' },
          { code: '6-60001', name: 'Beban Transportasi', type: 'expense', normal_balance: 'debit' },
          { code: '6-60002', name: 'Tagihan & Utilitas', type: 'expense', normal_balance: 'debit' },
          { code: '6-60003', name: 'Belanja Bulanan', type: 'expense', normal_balance: 'debit' },
          { code: '6-60004', name: 'Hiburan & Lifestyle', type: 'expense', normal_balance: 'debit' },
          { code: '6-60005', name: 'Kesehatan', type: 'expense', normal_balance: 'debit' },
          { code: '6-60006', name: 'Tabungan & Investasi', type: 'expense', normal_balance: 'debit' },
        ].map(acc => ({ ...acc, tenant_id: tenantId }));

        const { error } = await client.from('accounts').insert(personalAccounts);
        if (error) {
          this.logger.error(`Error seeding Personal COA: ${error.message}`);
          throw error;
        }
        this.logger.log(`Successfully seeded ${personalAccounts.length} personal accounts for tenant ${tenantId}`);
        return;
      }

      const { data: masterAccounts, error: fetchError } = await client
        .from('master_chart_of_accounts')
        .select('*');

      if (fetchError || !masterAccounts) {
        this.logger.error(`Failed to fetch master COA: ${fetchError?.message}`);
        return;
      }

      const accountsToInsert = [];
      const isJasa = industry === 'Jasa';
      const isMikro = scale === 'Mikro';

      for (const master of masterAccounts) {
        const code = master.code;
        const name = master.name;
        const type = master.type;
        const normalBalance = master.normal_balance;
        const categoryRaw = master.category_raw || '';
        
        // 2. Filter Industri Jasa (Lewati Persediaan & HPP)
        if (isJasa && (categoryRaw.includes('PERSEDIAAN') || categoryRaw.includes('HPP') || categoryRaw.includes('HARGA POKOK'))) {
          continue;
        }

        // 3. Filter Skala Mikro (Lewati akun kompleks)
        if (isMikro && (
          categoryRaw.includes('TANGGUHAN') || 
          name.toUpperCase().includes('OBLIGASI') || 
          (code.startsWith('2-2') && normalBalance === 'credit') // Hutang Jangka Panjang
        )) {
          continue;
        }

        accountsToInsert.push({
          tenant_id: tenantId,
          code,
          name: name.replace(/"/g, ''),
          type,
          normal_balance: normalBalance,
        });
      }

      if (accountsToInsert.length > 0) {
        const { error } = await client
          .from('accounts')
          .insert(accountsToInsert);
        
        if (error) {
          this.logger.error(`Error seeding COA: ${error.message}`);
          throw error;
        }
        this.logger.log(`Successfully seeded ${accountsToInsert.length} accounts for tenant ${tenantId}`);
      }
    } catch (err) {
      this.logger.error(`Failed to initialize COA: ${err.message}`);
    }
  }
}
