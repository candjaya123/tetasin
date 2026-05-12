import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ReceiptController } from './controllers/receipt.controller';
import { ReceiptScanService } from './services/receipt-scan.service';
import { ReceiptExtractionService } from './services/receipt-extraction.service';
import { DraftTransactionService } from './services/draft-transaction.service';
import { MerchantMemoryService } from './services/merchant-memory.service';
import { DuplicateDetectionService } from './services/duplicate-detection.service';
import { ReceiptScanProcessor } from './processors/receipt-scan.processor';
import { CoreModule } from '../../core/core.module';
import { AccountingModule } from '../accounting/accounting.module';
import { ReceiptRepository } from './repositories/receipt.repository';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'receipt-scan',
    }),
    CoreModule,
    AccountingModule,
  ],
  controllers: [ReceiptController],
  providers: [
    ReceiptScanService,
    ReceiptExtractionService,
    DraftTransactionService,
    MerchantMemoryService,
    DuplicateDetectionService,
    ReceiptScanProcessor,
    ReceiptRepository,
  ],
  exports: [
    ReceiptScanService,
    DraftTransactionService,
    ReceiptRepository,
  ],
})
export class ReceiptModule {}
