import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { ReceiptRepository } from '../repositories/receipt.repository';
import { AccountingService } from '../../accounting/services/accounting.service';
import { MerchantMemoryService } from './merchant-memory.service';
import { EventBusService } from '../../../core/events/event-bus.service';
import { UnitOfWork } from '../../../core/database/unit-of-work';
import { UpdateDraftDto } from '../dto/update-draft.dto';

@Injectable()
export class DraftTransactionService {
  private readonly logger = new Logger(DraftTransactionService.name);

  constructor(
    private readonly receiptRepository: ReceiptRepository,
    private readonly accountingService: AccountingService,
    private readonly merchantMemoryService: MerchantMemoryService,
    private readonly eventBus: EventBusService,
    private readonly uow: UnitOfWork,
  ) {}

  async createManualDraft(tenantId: string, userId: string, data: any) {
    return this.receiptRepository.createDraft({
      tenant_id: tenantId,
      created_by: userId,
      status: 'ready',
      ...data,
    });
  }

  async listDrafts(tenantId: string) {
    return this.receiptRepository.getDraftsByTenant(tenantId);
  }

  async getDraft(id: string) {
    const draft = await this.receiptRepository.getDraft(id);
    if (!draft) throw new NotFoundException('Draft not found');
    return draft;
  }

  async updateDraft(id: string, data: UpdateDraftDto) {
    return this.receiptRepository.updateDraft(id, data);
  }

  async approveDraft(id: string, userId: string) {
    const draft = await this.getDraft(id);
    
    if (draft.status === 'approved') {
      throw new Error('Draft is already approved');
    }

    if (!draft.debit_account_id || !draft.credit_account_id) {
      throw new Error('Debit and Credit accounts must be mapped before approval');
    }

    return this.uow.run(async (dbClient) => {
      // 1. Create Transaction + Journal Entries
      const journalEntry = await this.accountingService.createJournalEntry(draft.tenant_id, {
        date: draft.transaction_date,
        description: draft.notes || `Approved from receipt: ${draft.merchant_name}`,
        reference_number: draft.receipt_number || `SCAN-${id.slice(0, 8)}`,
        lines: [
          { account_id: draft.debit_account_id, debit: Number(draft.total_amount), credit: 0 },
          { account_id: draft.credit_account_id, debit: 0, credit: Number(draft.total_amount) },
        ],
      }, dbClient);

      // 2. Update Draft status
      await this.receiptRepository.updateDraft(id, {
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: userId,
        resulting_journal_id: journalEntry.id,
      });

      // 3. Learn from approval
      await this.merchantMemoryService.learn(draft.tenant_id, draft.merchant_name, draft);

      // 4. Emit events
      await this.eventBus.publish('DraftApproved', {
        draftId: id,
        tenantId: draft.tenant_id,
        journalId: journalEntry.id,
      });

      return journalEntry;
    });
  }

  async rejectDraft(id: string, userId: string, reason?: string) {
    await this.receiptRepository.updateDraft(id, {
      status: 'rejected',
      rejected_at: new Date().toISOString(),
      rejection_reason: reason,
    });

    const draft = await this.getDraft(id);
    await this.eventBus.publish('DraftRejected', {
      draftId: id,
      tenantId: draft.tenant_id,
      userId,
    });

    return { success: true };
  }
}
