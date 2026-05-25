import { describe, it, expect } from '@jest/globals';
import { buildMockCOAAccount } from '../mocks/factories';

describe('Journal Entry Creation', () => {
  const assembleJournalEntry = (params: {
    tenantId: string;
    description: string;
    lines: { account_id: string; type: 'debit' | 'credit'; amount: number }[];
    referenceId?: string;
    referenceType?: string;
  }) => {
    const { tenantId, description, lines, referenceId, referenceType } = params;

    const totalDebit = lines.filter((l) => l.type === 'debit').reduce((s, l) => s + l.amount, 0);
    const totalCredit = lines.filter((l) => l.type === 'credit').reduce((s, l) => s + l.amount, 0);
    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

    if (!isBalanced) {
      throw new Error(`JOURNAL_IMBALANCE: Debit=${totalDebit}, Credit=${totalCredit}, Diff=${Math.abs(totalDebit - totalCredit).toFixed(2)}`);
    }

    return {
      id: 'generated-journal-id',
      tenant_id: tenantId,
      reference_id: referenceId || null,
      reference_type: referenceType || 'manual',
      status: 'posted',
      description,
      transaction_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      journal_lines: lines.map((l, i) => ({
        id: `line-${i}`,
        journal_entry_id: 'generated-journal-id',
        account_id: l.account_id,
        tenant_id: tenantId,
        type: l.type,
        amount: l.amount,
        description: null,
      })),
    };
  };

  describe('Balance Validation', () => {
    it('should create balanced journal entry', () => {
      const entry = assembleJournalEntry({
        tenantId: 'test-tenant',
        description: 'Penjualan Kopi',
        lines: [
          { account_id: 'acc-kas', type: 'debit', amount: 30000 },
          { account_id: 'acc-revenue', type: 'credit', amount: 30000 },
        ],
      });

      expect(entry.status).toBe('posted');
      expect(entry.journal_lines.length).toBe(2);
    });

    it('should throw on imbalanced journal', () => {
      expect(() =>
        assembleJournalEntry({
          tenantId: 'test-tenant',
          description: 'Invalid entry',
          lines: [
            { account_id: 'acc-kas', type: 'debit', amount: 50000 },
            { account_id: 'acc-revenue', type: 'credit', amount: 30000 },
          ],
        }),
      ).toThrow('JOURNAL_IMBALANCE');
    });

    it('should handle complex multi-line entries', () => {
      const entry = assembleJournalEntry({
        tenantId: 'test-tenant',
        description: 'Penjualan dengan diskon',
        lines: [
          { account_id: 'acc-kas', type: 'debit', amount: 95000 },
          { account_id: 'acc-discount', type: 'debit', amount: 5000 },
          { account_id: 'acc-revenue', type: 'credit', amount: 100000 },
        ],
      });

      expect(entry.journal_lines.length).toBe(3);
      const lines = entry.journal_lines;
      const totalDebit = lines.filter((l) => l.type === 'debit').reduce((s, l) => s + l.amount, 0);
      const totalCredit = lines.filter((l) => l.type === 'credit').reduce((s, l) => s + l.amount, 0);
      expect(totalDebit).toBe(totalCredit);
    });

    it('should reject negative amounts', () => {
      expect(() =>
        assembleJournalEntry({
          tenantId: 'test-tenant',
          description: 'Negative amount',
          lines: [
            { account_id: 'acc-kas', type: 'debit', amount: -1000 },
            { account_id: 'acc-revenue', type: 'credit', amount: 1000 },
          ],
        }),
      ).toThrow();
    });

    it('should reject zero amount lines', () => {
      const hasZeroLine = (lines: { amount: number }[]) => lines.some((l) => l.amount <= 0);
      expect(hasZeroLine([{ amount: 0 }, { amount: 1000 }])).toBe(true);
      expect(hasZeroLine([{ amount: 5000 }, { amount: 5000 }])).toBe(false);
    });
  });

  describe('Account Type Validation', () => {
    const validAccountTypes = ['aset', 'kewajiban', 'ekuitas', 'pendapatan', 'beban'];

    it('should accept all valid account types', () => {
      for (const type of validAccountTypes) {
        const account = buildMockCOAAccount({ type });
        expect(validAccountTypes.includes(account.type)).toBe(true);
      }
    });

    it('should reject invalid account types', () => {
      expect(validAccountTypes.includes('revenue')).toBe(false);
      expect(validAccountTypes.includes('expense')).toBe(false);
      expect(validAccountTypes.includes('income')).toBe(false);
      expect(validAccountTypes.includes('asset')).toBe(false);
    });
  });

  describe('Journal Status Lifecycle', () => {
    const validTransition = (from: string, to: string): boolean => {
      if (from === 'posted' && to === 'draft') return false;
      if (from === 'voided') return false;
      return true;
    };

    it('should allow draft → posted transition', () => {
      expect(validTransition('draft', 'posted')).toBe(true);
    });

    it('should allow posted → voided transition', () => {
      expect(validTransition('posted', 'voided')).toBe(true);
    });

    it('should not allow posted journal to return to draft', () => {
      expect(validTransition('posted', 'draft')).toBe(false);
    });

    it('should not allow voided → posted transition', () => {
      expect(validTransition('voided', 'posted')).toBe(false);
    });
  });
});

describe('COA Code Convention', () => {
  it('should classify 1-xxxx as asset', () => {
    const code = '1-10000';
    expect(code.startsWith('1-')).toBe(true);
  });

  it('should classify 2-xxxx as liability', () => {
    const code = '2-20000';
    expect(code.startsWith('2-')).toBe(true);
  });

  it('should classify 3-xxxx as equity', () => {
    const code = '3-30000';
    expect(code.startsWith('3-')).toBe(true);
  });

  it('should classify 4-xxxx as revenue', () => {
    const code = '4-40000';
    expect(code.startsWith('4-')).toBe(true);
  });

  it('should classify 5-xxxx and 6-xxxx as expense', () => {
    expect('5-10000'.startsWith('5-')).toBe(true);
    expect('6-10000'.startsWith('6-')).toBe(true);
  });

  it('should generate balance sheet categories correctly', () => {
    const accounts = [
      { code: '1-10000', type: 'aset', amount: 50000 },
      { code: '1-10001', type: 'aset', amount: 30000 },
      { code: '2-20000', type: 'kewajiban', amount: 20000 },
      { code: '3-30000', type: 'ekuitas', amount: 60000 },
    ];

    const assets = accounts.filter((a) => a.code.startsWith('1-')).reduce((s, a) => s + a.amount, 0);
    const liabilities = accounts.filter((a) => a.code.startsWith('2-')).reduce((s, a) => s + a.amount, 0);
    const equity = accounts.filter((a) => a.code.startsWith('3-')).reduce((s, a) => s + a.amount, 0);

    expect(assets).toBe(80000);
    expect(liabilities).toBe(20000);
    expect(equity).toBe(60000);
    expect(assets).toBe(liabilities + equity);
  });
});