import { Test, TestingModule } from '@nestjs/testing';
import { AccountingService } from './accounting.service';
import { AccountingRepository } from '../repositories/accounting.repository';
import { SupabaseService } from '../../../shared/supabase.service';

describe('AccountingService', () => {
  let service: AccountingService;
  let mockAccountingRepository: any;

  beforeEach(async () => {
    mockAccountingRepository = {
      createTransactionWithLines: jest.fn(),
      getClient: jest.fn(() => ({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountingService,
        { provide: AccountingRepository, useValue: mockAccountingRepository },
        { provide: SupabaseService, useValue: { getClient: jest.fn(), getPool: jest.fn() } },
      ],
    }).compile();

    service = module.get<AccountingService>(AccountingService);
  });

  describe('createJournalEntry', () => {
    const validPayload = {
      reference_number: 'REF-001',
      description: 'Test entry',
      lines: [
        { account_id: 'acc-1', debit: 50000, credit: 0 },
        { account_id: 'acc-2', debit: 0, credit: 50000 },
      ],
    };

    it('should create a balanced journal entry', async () => {
      const expectedEntry = { id: 'journal-1', ...validPayload };
      mockAccountingRepository.createTransactionWithLines.mockResolvedValue(expectedEntry);

      const result = await service.createJournalEntry('tenant-1', validPayload);

      expect(result).toEqual(expectedEntry);
      expect(mockAccountingRepository.createTransactionWithLines).toHaveBeenCalledWith(
        expect.objectContaining({
          tenant_id: 'tenant-1',
          reference_number: 'REF-001',
        }),
        validPayload.lines,
        undefined,
      );
    });

    it('should throw error on debit/credit imbalance', async () => {
      const imbalancedPayload = {
        ...validPayload,
        lines: [
          { account_id: 'acc-1', debit: 50000, credit: 0 },
          { account_id: 'acc-2', debit: 0, credit: 49999 },
        ],
      };

      await expect(service.createJournalEntry('tenant-1', imbalancedPayload)).rejects.toThrow(
        /tidak seimbang|Debit.*Credit/,
      );
    });

    it('should handle zero-value lines', async () => {
      const zeroPayload = {
        ...validPayload,
        lines: [
          { account_id: 'acc-1', debit: 0, credit: 0 },
          { account_id: 'acc-2', debit: 0, credit: 0 },
        ],
      };

      mockAccountingRepository.createTransactionWithLines.mockResolvedValue({ id: 'journal-zero' });

      const result = await service.createJournalEntry('tenant-1', zeroPayload);
      expect(result).toBeDefined();
    });

    it('should pass dbClient to repository when provided', async () => {
      const dbClient = {};
      mockAccountingRepository.createTransactionWithLines.mockResolvedValue({ id: 'journal-1' });

      await service.createJournalEntry('tenant-1', validPayload, dbClient);

      expect(mockAccountingRepository.createTransactionWithLines).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Array),
        dbClient,
      );
    });
  });
});
