import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../business-profile/guards/jwt-auth.guard';
import { RequireTier } from '../../../core/auth/tier.decorator';
import { Roles, UserRole } from '../../../core/auth/role.decorator';
import { SubscriptionTier } from '../../../core/constants/subscription-tier.enum';
import { ReceiptScanService } from '../services/receipt-scan.service';
import { DraftTransactionService } from '../services/draft-transaction.service';
import { MerchantMemoryService } from '../services/merchant-memory.service';
import { UpdateDraftDto } from '../dto/update-draft.dto';
import { RejectDraftDto } from '../dto/reject-draft.dto';
import { CreateManualDraftDto } from '../dto/create-manual-draft.dto';
import type { AuthenticatedRequest } from '../../../core/auth/authenticated-request.interface';

@Controller('api/v1/receipt')
@UseGuards(JwtAuthGuard)
export class ReceiptController {
  constructor(
    private readonly receiptScanService: ReceiptScanService,
    private readonly draftTransactionService: DraftTransactionService,
    private readonly merchantMemoryService: MerchantMemoryService,
  ) {}

  @Post('scan')
  @RequireTier(SubscriptionTier.PRO)
  @Roles(UserRole.MANAGER, UserRole.KASIR)
  @UseInterceptors(FileInterceptor('image'))
  async uploadReceipt(@UploadedFile() file: Express.Multer.File, @Request() req: AuthenticatedRequest) {
    return this.receiptScanService.handleUpload(req.user.tenant_id, req.user.id, file);
  }

  @Get('scan/:id')
  @RequireTier(SubscriptionTier.PRO)
  async getScanStatus(@Param('id') id: string) {
    return this.receiptScanService.getScanStatus(id);
  }

  @Post('drafts')
  @RequireTier(SubscriptionTier.PRO)
  @Roles(UserRole.MANAGER, UserRole.KASIR)
  async createManualDraft(@Body() dto: CreateManualDraftDto, @Request() req: AuthenticatedRequest) {
    return this.draftTransactionService.createManualDraft(req.user.tenant_id, req.user.id, dto);
  }

  @Get('drafts')
  @RequireTier(SubscriptionTier.PRO)
  async listDrafts(@Request() req: AuthenticatedRequest) {
    return this.draftTransactionService.listDrafts(req.user.tenant_id);
  }

  @Get('drafts/:id')
  @RequireTier(SubscriptionTier.PRO)
  async getDraft(@Param('id') id: string) {
    return this.draftTransactionService.getDraft(id);
  }

  @Patch('drafts/:id')
  @RequireTier(SubscriptionTier.PRO)
  @Roles(UserRole.MANAGER, UserRole.KASIR)
  async updateDraft(@Param('id') id: string, @Body() dto: UpdateDraftDto) {
    return this.draftTransactionService.updateDraft(id, dto as any);
  }

  @Post('drafts/:id/approve')
  @HttpCode(HttpStatus.OK)
  @RequireTier(SubscriptionTier.PRO)
  @Roles(UserRole.MANAGER)
  async approveDraft(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.draftTransactionService.approveDraft(id, req.user.id);
  }

  @Post('drafts/:id/reject')
  @HttpCode(HttpStatus.OK)
  @RequireTier(SubscriptionTier.PRO)
  @Roles(UserRole.MANAGER)
  async rejectDraft(@Param('id') id: string, @Body() dto: RejectDraftDto, @Request() req: AuthenticatedRequest) {
    return this.draftTransactionService.rejectDraft(id, req.user.id, dto.reason);
  }

  @Get('merchants')
  @RequireTier(SubscriptionTier.PRO)
  async listMerchants(@Request() req: AuthenticatedRequest) {
    return this.merchantMemoryService.list(req.user.tenant_id);
  }
}
