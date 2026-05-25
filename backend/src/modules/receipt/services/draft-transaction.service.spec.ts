import { Test, TestingModule } from '@nestjs/testing';
import { DraftTransactionService } from './draft-transaction.service';
import { ReceiptRepository } from '../repositories/receipt.repository';
import { AccountingService } from '../../accounting/services/accounting.service';
import { MerchantMemoryService } from './merchant-memory.service';
import { EventBusService } from '../../../core/events/event-bus.service';
import { UnitOfWork } from '../../../core/database/unit-of-work';
import { UnprocessableEntityException, NotFoundException } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

describe('DraftTransactionService', () => {
  let service: DraftTransactionService;
  let mockReceiptRepository: any;
  let mockAccountingService: any;
  let mockMerchantMemoryService: any;
  let mockEventBus: any;
  let mockUnitOfWork: any;

  const mockDraft = {
    id: 'draft-id-1',
    tenant_id: 'tenant-1',
    status: 'ready',
    merchant_name: 'Test Merchant',
    total_amount: 100000,
    debit_account_id: 'account-debit-1',
    credit_account_id: 'account-credit-1',
    category: 'Operasional',
    tags: ['test'],
    transaction_date: '2024-01-15T00:00:00Z',
  };

  const mockJournalEntry = { id: 'journal-1' };

  beforeEach(async () => {
    mockReceiptRepository = {
      createDraft: jest.fn(),
      getDraft: jest.fn(),
      getDraftsByTenant: jest.fn(),
      updateDraft: jest.fn(),
      getMerchantMapping: jest.fn(),
      upsertMerchantMapping: jest.fn(),
    };

    mockAccountingService = {
      createJournalEntry: jest.fn(),
    };

    mockMerchantMemoryService = {
      learn: jest.fn(),
      recommend: jest.fn(),
      getRecommendation: jest.fn(),
    };

    mockEventBus = {
      emit: jest.fn(),
    };

    mockUnitOfWork = {
      runInTransaction: jest.fn((work: any) => work()),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DraftTransactionService,
        { provide: ReceiptRepository, useValue: mockReceiptRepository },
        { provide: AccountingService, useValue: mockAccountingService },
        { provide: MerchantMemoryService, useValue: mockMerchantMemoryService },
        { provide: EventBusService, useValue: mockEventBus },
        { provide: UnitOfWork, useValue: mockUnitOfWork },
        {
          provide: PinoLogger,
          useValue: { info: jest.fn(), error: jest.fn(), warn: jest.fn(), setContext: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<DraftTransactionService>(DraftTransactionService);
  });

  describe('approveDraft', () => {
    it('should approve a ready draft and create journal entry', async () => {
      mockReceiptRepository.getDraft.mockResolvedValue(mockDraft);
      mockAccountingService.createJournalEntry.mockResolvedValue(mockJournalEntry);

      const result = await service.approveDraft('draft-id-1', 'user-1');

      expect(result).toEqual({ journal_id: 'journal-1' });
      expect(mockAccountingService.createJournalEntry).toHaveBeenCalledWith(
        'tenant-1',
        expect.objectContaining({
          description: expect.stringContaining('Test Merchant'),
          lines: expect.arrayContaining([
            expect.objectContaining({ account_id: 'account-debit-1', debit: 100000 }),
            expect.objectContaining({ account_id: 'account-credit-1', credit: 100000 }),
          ]),
        }),
        undefined,
      );
      expect(mockReceiptRepository.updateDraft).toHaveBeenCalledWith(
        'draft-id-1',
        expect.objectContaining({ status: 'approved' }),
      );
      expect(mockEventBus.emit).toHaveBeenCalledWith(expect.objectContaining({
        event_type: 'DraftApproved'
      }));
    });

    it('should throw INVALID_DRAFT_STATUS if draft is not ready', async () => {
      mockReceiptRepository.getDraft.mockResolvedValue({ ...mockDraft, status: 'approved' });

      await expect(service.approveDraft('draft-id-1', 'user-1')).rejects.toThrow(UnprocessableEntityException);
    });

    it('should throw MISSING_ACCOUNT_MAPPING if debit or credit account is missing', async () => {
      mockReceiptRepository.getDraft.mockResolvedValue({ ...mockDraft, debit_account_id: null });

      await expect(service.approveDraft('draft-id-1', 'user-1')).rejects.toThrow(UnprocessableEntityException);
    });

    it('should rollback if journal creation fails', async () => {
      mockReceiptRepository.getDraft.mockResolvedValue(mockDraft);
      const journalError = new Error('JOURNAL_IMBALANCE');
      mockAccountingService.createJournalEntry.mockRejectedValue(journalError);

      await expect(service.approveDraft('draft-id-1', 'user-1')).rejects.toThrow('JOURNAL_IMBALANCE');
      expect(mockReceiptRepository.updateDraft).not.toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ status: 'approved' }),
      );
    });
  });

  describe('rejectDraft', () => {
    it('should reject a draft with reason', async () => {
      mockReceiptRepository.getDraft.mockResolvedValue(mockDraft);

      const result = await service.rejectDraft('draft-id-1', 'user-1', 'Duplicate entry');

      expect(result).toEqual({ success: true });
      expect(mockReceiptRepository.updateDraft).toHaveBeenCalledWith(
        'draft-id-1',
        expect.objectContaining({ status: 'rejected', rejection_reason: 'Duplicate entry' }),
      );
      expect(mockEventBus.emit).toHaveBeenCalledWith(expect.objectContaining({
        event_type: 'DraftRejected'
      }));
    });

    it('should throw NotFoundException for non-existent draft', async () => {
      mockReceiptRepository.getDraft.mockResolvedValue(null);

      await expect(service.rejectDraft('non-existent', 'user-1')).rejects.toThrow(NotFoundException);
    });
  });
});
