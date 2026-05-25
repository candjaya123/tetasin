import { Controller, Post, UseInterceptors, UploadedFile, HttpCode, HttpStatus, Request, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { JwtAuthGuard } from '../../business-profile/guards/jwt-auth.guard';
import { RequireTier } from '../../../core/auth/tier.decorator';
import { SubscriptionTier } from '../../../core/constants/subscription-tier.enum';
import type { AuthenticatedRequest } from '../../../core/auth/authenticated-request.interface';

@Controller('api/v1/ai')
@UseGuards(JwtAuthGuard)
@RequireTier(SubscriptionTier.PRO)
export class OcrController {
  constructor(@InjectQueue('ai-ocr-queue') private readonly aiQueue: Queue) {}

  @Post('ocr')
  @HttpCode(HttpStatus.ACCEPTED)
  @UseInterceptors(FileInterceptor('file'))
  async extractReceipt(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: AuthenticatedRequest
  ) {
    if (!file) throw new Error('No file uploaded');

    const tenantId = (req.user.tenant_id || req.user.entity_id)!;

    const job = await this.aiQueue.add('extract', {
      imageBuffer: file.buffer,
      mimetype: file.mimetype,
      tenantId: tenantId,
    });

    return {
      message: "Struk sedang diproses AI",
      status: "pending",
      jobId: job.id
    };
  }
}
