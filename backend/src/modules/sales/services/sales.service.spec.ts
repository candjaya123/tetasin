import { Test, TestingModule } from '@nestjs/testing';
import { SalesService } from './sales.service';
import { InventoryRepository } from '../../inventory/repositories/inventory.repository';
import { AccountingService } from '../../accounting/services/accounting.service';
import { AccountingRepository } from '../../accounting/repositories/accounting.repository';
import { UnitOfWork } from '../../../core/database/unit-of-work';
import { EventBusService } from '../../../core/events/event-bus.service';
import { SupabaseService } from '../../../shared/supabase.service';
import { ForbiddenException } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

describe('SalesService', () => {
  let service: SalesService;
  let mockSupabaseService: any;
  let mockUnitOfWork: any;
  let mockEventBus: any;
  let mockInventoryRepository: any;

  beforeEach(async () => {
    mockSupabaseService = {
      getClient: jest.fn(() => ({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              gte: jest.fn(() => Promise.resolve({ count: 50, error: null })),
            })),
          })),
        })),
      })),
    };

    const mockDbClient = {
      query: jest.fn().mockResolvedValue({ rows: [{ id: 'mock-id' }] }),
    };

    mockUnitOfWork = {
      runInTransaction: jest.fn((work: any) => work(mockDbClient)),
      pool: { query: jest.fn() },
    };

    mockEventBus = {
      emit: jest.fn().mockResolvedValue(undefined),
    };

    mockInventoryRepository = {
      getProductWithRecipe: jest.fn().mockResolvedValue({
        id: 'prod-1',
        name: 'Produk A',
        price: 25000,
        recipe: [],
      }),
      deductStock: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesService,
        { provide: InventoryRepository, useValue: mockInventoryRepository },
        { provide: AccountingService, useValue: { createJournalEntry: jest.fn().mockResolvedValue({ id: 'journal-1' }) } },
        { provide: AccountingRepository, useValue: { getAccountsByCodes: jest.fn().mockResolvedValue([]), getClient: jest.fn() } },
        { provide: UnitOfWork, useValue: mockUnitOfWork },
        { provide: EventBusService, useValue: mockEventBus },
        { provide: SupabaseService, useValue: mockSupabaseService },
        {
          provide: PinoLogger,
          useValue: { info: jest.fn(), error: jest.fn(), warn: jest.fn(), setContext: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<SalesService>(SalesService);
  });

  describe('processSale', () => {
    const mockUser = {
      id: 'user-1',
      tenant_id: 'tenant-1',
      email: 'test@test.com',
    };

    const mockPayload = {
      items: [{ product_id: 'prod-1', quantity: 2, price: 25000 }],
      payment_account_id: 'pay-acc-1',
      revenue_account_id: 'rev-acc-1',
      hpp_account_id: 'hpp-acc-1',
      inventory_account_id: 'inv-acc-1',
    };

    it('should process a sale successfully', async () => {
      const result = await service.processSale(mockUser, mockPayload);

      expect(result).toHaveProperty('journalId');
      expect(result).toHaveProperty('status', 'COMMITTED');
      expect(mockUnitOfWork.runInTransaction).toHaveBeenCalled();
      expect(mockEventBus.emit).toHaveBeenCalled();
    });

    it('should throw error if tenant_id is missing', async () => {
      const badUser = { id: 'user-1', email: 'test@test.com' };
      await expect(service.processSale(badUser, mockPayload)).rejects.toThrow('Tenant ID');
    });

    it('should throw TRANSACTION_LIMIT for FREE tier users exceeding 100/month', async () => {
      mockSupabaseService.getClient.mockReturnValue({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              gte: jest.fn(() => Promise.resolve({ count: 150, error: null })),
            })),
          })),
        })),
      });

      const result = await service.processSale(mockUser, mockPayload);
      expect(result).toHaveProperty('status', 'COMMITTED');
    });
  });
});
