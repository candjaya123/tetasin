import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { ReceiptRepository } from '../repositories/receipt.repository';
import { AccountingService } from '../../accounting/services/accounting.service';
import { MerchantMemoryService } from './merchant-memory.service';
import { EventBusService } from '../../../core/events/event-bus.service';
import { UnitOfWork } from '../../../core/database/unit-of-work';
import { UpdateDraftDto } from '../dto/update-draft.dto';
import { CreateManualDraftDto } from '../dto/create-manual-draft.dto';

@Injectable()
export class DraftTransactionService {
  constructor(
    private readonly receiptRepository: ReceiptRepository,
    private readonly accountingService: AccountingService,
    private readonly merchantMemoryService: MerchantMemoryService,
    private readonly eventBus: EventBusService,
    private readonly uow: UnitOfWork,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(DraftTransactionService.name);
  }

  async createManualDraft(tenantId: string, userId: string, data: CreateManualDraftDto) {
    this.logger.info({ tenantId, userId, action: 'create_manual_draft' }, 'Creating manual draft');
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
    if (!draft) {
      throw new NotFoundException({ code: 'DRAFT_NOT_FOUND', message: 'Draft tidak ditemukan' });
    }
    return draft;
  }

  async updateDraft(id: string, data: UpdateDraftDto) {
    return this.receiptRepository.updateDraft(id, data as Record<string, unknown>);
  }

  async approveDraft(id: string, userId: string) {
    const draft = await this.getDraft(id);

    if (draft.status !== 'ready') {
      throw new UnprocessableEntityException({
        code: 'INVALID_DRAFT_STATUS',
        message: `Draft berstatus ${draft.status}, tidak dapat disetujui`,
        details: { current_status: draft.status, required_status: 'ready' },
      });
    }

    if (!draft.debit_account_id || !draft.credit_account_id) {
      throw new UnprocessableEntityException({
        code: 'MISSING_ACCOUNT_MAPPING',
        message: 'Akun debit dan kredit harus diisi sebelum menyetujui draft',
        details: { has_debit: !!draft.debit_account_id, has_credit: !!draft.credit_account_id },
      });
    }

    return this.uow.runInTransaction(async (client) => {
      const journal = await this.accountingService.createJournalEntry(
        draft.tenant_id,
        {
          reference_number: `DRAFT-${id.slice(0, 8)}`,
          date: draft.transaction_date,
          description: `Pengeluaran: ${draft.merchant_name || 'Transaksi'}`,
          lines: [
            { account_id: draft.debit_account_id, debit: Number(draft.total_amount), credit: 0 },
            { account_id: draft.credit_account_id, debit: 0, credit: Number(draft.total_amount) },
          ],
        },
        client,
      );

      await this.receiptRepository.updateDraft(id, {
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: userId,
        resulting_journal_id: journal.id,
      });

      await this.merchantMemoryService.learn(draft.tenant_id, draft.merchant_name, {
        category: draft.category,
        debit_account_id: draft.debit_account_id,
        tags: draft.tags,
      });

      await this.eventBus.emit({
        tenant_id: draft.tenant_id,
        event_type: 'DraftApproved',
        payload: { draftId: id, journalId: journal.id },
      });

      this.logger.info({ draftId: id, journalId: journal.id, tenantId: draft.tenant_id }, 'Draft approved');
      return { journal_id: journal.id };
    });
  }

  async rejectDraft(id: string, userId: string, reason?: string) {
    const draft = await this.getDraft(id);
    if (draft.status === 'approved') {
      throw new UnprocessableEntityException({
        code: 'ALREADY_APPROVED',
        message: 'Draft sudah disetujui, tidak dapat ditolak',
      });
    }

    await this.receiptRepository.updateDraft(id, {
      status: 'rejected',
      rejected_at: new Date().toISOString(),
      rejection_reason: reason || null,
    });

    await this.eventBus.emit({
      tenant_id: draft.tenant_id,
      event_type: 'DraftRejected',
      payload: { draftId: id, userId },
    });

    return { success: true };
  }
}
