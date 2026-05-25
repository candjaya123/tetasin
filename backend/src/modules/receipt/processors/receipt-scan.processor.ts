import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { ReceiptExtractionService } from '../services/receipt-extraction.service';
import { ReceiptRepository } from '../repositories/receipt.repository';
import { MerchantMemoryService } from '../services/merchant-memory.service';
import { DuplicateDetectionService } from '../services/duplicate-detection.service';
import { EventBusService } from '../../../core/events/event-bus.service';

@Processor('receipt-scan')
export class ReceiptScanProcessor extends WorkerHost {
  private readonly logger = new Logger(ReceiptScanProcessor.name);

  constructor(
    private readonly extractionService: ReceiptExtractionService,
    private readonly receiptRepository: ReceiptRepository,
    private readonly merchantMemory: MerchantMemoryService,
    private readonly duplicateDetection: DuplicateDetectionService,
    private readonly eventBus: EventBusService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { scanId, tenantId, userId, mimeType, imageBuffer } = job.data;
    this.logger.log(`Processing scan job ${job.id} for scan ${scanId}`);

    try {
      // 1. Extract data via Gemini
      const buffer = Buffer.from(imageBuffer, 'base64');
      const extraction = await this.extractionService.extract(buffer, mimeType);

      // 2. Get Confidence
      const confidence = this.extractionService.calculateConfidence(extraction);

      // 3. Check Merchant Memory
      const recommendation = await this.merchantMemory.recommend(tenantId, extraction.merchant?.value);
      
      // 4. Duplicate Detection
      const duplicateInfo = await this.duplicateDetection.check(
        tenantId, 
        extraction.merchant?.value, 
        extraction.total_amount?.value, 
        extraction.transaction_date?.value
      );

      // 5. Enrich extraction with recommendations
      const aiRecommendations = {
        ...extraction,
        confidence_score: confidence,
        duplicate_warning: duplicateInfo,
        suggested_category: recommendation?.default_category || extraction.suggested_category?.value,
        suggested_account_id: recommendation?.default_account_id,
        suggested_tags: recommendation?.default_tags || extraction.suggested_tags,
      };

      // 6. Update Scan record
      await this.receiptRepository.updateScan(scanId, {
        status: 'completed',
        raw_ocr_text: extraction.raw_text,
        extracted_data: extraction,
        processing_time_ms: Date.now() - job.timestamp,
      });

      // 7. Create Draft Transaction
      const draft = await this.receiptRepository.createDraft({
        tenant_id: tenantId,
        receipt_scan_id: scanId,
        created_by: userId,
        status: 'ready',
        merchant_name: extraction.merchant?.value,
        transaction_date: extraction.transaction_date?.value,
        total_amount: extraction.total_amount?.value,
        subtotal: extraction.subtotal?.value,
        tax_amount: extraction.tax_amount?.value,
        discount_amount: extraction.discount_amount?.value,
        currency: extraction.currency?.value || 'IDR',
        payment_method: extraction.payment_method?.value,
        receipt_number: extraction.receipt_number?.value,
        category: aiRecommendations.suggested_category,
        debit_account_id: aiRecommendations.suggested_account_id,
        line_items: extraction.line_items || [],
        ai_recommendations: aiRecommendations,
      });

      // 8. Emit event
      await this.eventBus.emit({
        tenant_id: tenantId,
        event_type: 'ReceiptScanned',
        payload: { scanId, draftId: draft.id },
      });

      return { draftId: draft.id };
    } catch (e) {
      this.logger.error(`Failed to process scan ${scanId}: ${e.message}`);
      await this.receiptRepository.updateScan(scanId, {
        status: 'failed',
        error_message: e.message,
      });
      throw e;
    }
  }
}
