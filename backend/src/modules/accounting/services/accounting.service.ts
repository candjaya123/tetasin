import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../../shared/supabase.service';
import { AccountingRepository } from '../repositories/accounting.repository';
import Decimal from 'decimal.js';

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
  private inferKategori(type: string): string {
    const t = (type || '').toLowerCase();
    if (t.includes('aset') || t.includes('asset')) return 'ASET';
    if (t.includes('kewajiban') || t.includes('liability')) return 'KEWAJIBAN';
    if (t.includes('ekuitas') || t.includes('equity')) return 'EKUITAS';
    if (t.includes('pendapatan') || t.includes('revenue')) return 'PENDAPATAN';
    if (t.includes('hpp') || t.includes('harga pokok') || t.includes('cogs') || t.includes('cost of sales')) return 'HPP / BIAYA LANGSUNG';
    return 'BEBAN OPERASIONAL';
  }

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

        const { error } = await client.from('chart_of_accounts').insert(
          personalAccounts.map(a => ({ ...a, kategori: this.inferKategori(a.type), is_system: true }))
        );
        if (error) {
          this.logger.error(`Error seeding Personal COA: ${error.message}`);
          throw error;
        }
        this.logger.log(`Successfully seeded ${personalAccounts.length} personal accounts for tenant ${tenantId}`);
        return;
      }

      // Try canonical chart_of_accounts first, fall back to legacy
    let { data: masterAccounts, error: fetchError } = await client
      .from('chart_of_accounts')
      .select('*')
      .eq('is_system', true)
      .limit(1);

    const targetTable = !fetchError && masterAccounts && masterAccounts.length > 0
      ? 'chart_of_accounts'
      : 'master_chart_of_accounts';

    const { data: accounts, error: masterError } = await client
      .from(targetTable)
      .select('*')
      .is('tenant_id', null)
      .limit(1000);

    if (masterError || !accounts) {
      this.logger.error(`Failed to fetch master COA: ${masterError?.message}`);
      return;
    }

    const isJasa = industry === 'Jasa';
    const isMikro = scale === 'Mikro';

    for (const master of accounts) {
      const code = master.code;
      const name = (master.name || '').replace(/"/g, '');
      const type = master.type;
      const normalBalance = master.normal_balance;
      const kategori = master.kategori || master.category_raw || this.inferKategori(type);
      const categoryRaw = (master.category_raw || '').toUpperCase();

      if (isJasa && (categoryRaw.includes('PERSEDIAAN') || categoryRaw.includes('HPP') || categoryRaw.includes('HARGA POKOK'))) continue;
      if (isMikro && (categoryRaw.includes('TANGGUHAN') || name.toUpperCase().includes('OBLIGASI') || (code.startsWith('2-2') && normalBalance === 'credit'))) continue;

      const { error: insError } = await client
        .from('chart_of_accounts')
        .upsert({ tenant_id: tenantId, code, name, type, normal_balance: normalBalance, kategori, is_system: true }, { onConflict: 'tenant_id,code', ignoreDuplicates: true });

      if (insError) this.logger.warn(`COA insert warning: ${insError.message}`);
    }

    this.logger.log(`Seeded ${accounts.length} COA accounts for tenant ${tenantId} via ${targetTable}`);
    } catch (err) {
      this.logger.error(`Failed to initialize COA: ${err.message}`);
    }
  }
}
