import { Injectable, Logger } from '@nestjs/common';
import { GeminiProvider } from '../../../core/ai/gemini.provider';

@Injectable()
export class ReceiptExtractionService {
  private readonly logger = new Logger(ReceiptExtractionService.name);

  constructor(private readonly gemini: GeminiProvider) {}

  async extract(imageBuffer: Buffer, mimeType: string) {
    try {
      const result = await this.gemini.extractReceipt(imageBuffer, mimeType);
      return result;
    } catch (e) {
      this.logger.error(`Extraction failed: ${e.message}`);
      throw e;
    }
  }

  calculateConfidence(extraction: any): number {
    const fields = [
      extraction.merchant,
      extraction.transaction_date,
      extraction.total_amount
    ];
    
    let score = 0;
    fields.forEach(f => {
      if (f?.confidence === 'high') score += 1;
      else if (f?.confidence === 'medium') score += 0.5;
    });
    
    return score / fields.length;
  }
}
