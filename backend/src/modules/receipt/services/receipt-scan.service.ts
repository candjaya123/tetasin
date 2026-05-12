import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ReceiptRepository } from '../repositories/receipt.repository';
import { SupabaseService } from '../../../shared/supabase.service';

@Injectable()
export class ReceiptScanService {
  private readonly logger = new Logger(ReceiptScanService.name);

  constructor(
    @InjectQueue('receipt-scan') private readonly receiptQueue: Queue,
    private readonly receiptRepository: ReceiptRepository,
    private readonly supabaseService: SupabaseService,
  ) {}

  async handleUpload(tenantId: string, userId: string, file: Express.Multer.File) {
    // 1. Upload to Supabase Storage
    const fileName = `${tenantId}/${Date.now()}-${file.originalname}`;
    const { data: uploadData, error: uploadError } = await this.supabaseService.getClient()
      .storage
      .from('receipt-scans')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Failed to upload receipt: ${uploadError.message}`);
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const imageUrl = `${supabaseUrl}/storage/v1/object/public/receipt-scans/${fileName}`;

    // 2. Create Receipt Scan record
    const scan = await this.receiptRepository.createScan({
      tenant_id: tenantId,
      uploaded_by: userId,
      image_url: imageUrl,
      status: 'processing',
      ai_model_used: 'gemini-2.0-flash',
    });

    // 3. Enqueue job
    await this.receiptQueue.add('process-scan', {
      scanId: scan.id,
      tenantId,
      userId,
      imageUrl,
      mimeType: file.mimetype,
      imageBuffer: file.buffer.toString('base64'),
    }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    });

    return { scanId: scan.id, status: 'processing' };
  }

  async getScanStatus(id: string) {
    return this.receiptRepository.getScan(id);
  }
}
