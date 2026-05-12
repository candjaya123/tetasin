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
  HttpCode 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../business-profile/guards/jwt-auth.guard';
import { ReceiptScanService } from '../services/receipt-scan.service';
import { DraftTransactionService } from '../services/draft-transaction.service';
import { UpdateDraftDto } from '../dto/update-draft.dto';

@Controller('api/v1/receipt')
@UseGuards(JwtAuthGuard)
export class ReceiptController {
  constructor(
    private readonly receiptScanService: ReceiptScanService,
    private readonly draftTransactionService: DraftTransactionService,
  ) {}

  @Post('scan')
  @UseInterceptors(FileInterceptor('image'))
  async uploadReceipt(@UploadedFile() file: Express.Multer.File, @Request() req: any) {
    const tenantId = req.user.tenant_id;
    const userId = req.user.sub || req.user.id;
    
    return this.receiptScanService.handleUpload(tenantId, userId, file);
  }

  @Get('scan/:id')
  async getScanStatus(@Param('id') id: string) {
    return this.receiptScanService.getScanStatus(id);
  }

  @Post('drafts')
  async createManualDraft(@Body() body: any, @Request() req: any) {
    const tenantId = req.user.tenant_id;
    const userId = req.user.sub || req.user.id;
    return this.draftTransactionService.createManualDraft(tenantId, userId, body);
  }

  @Get('drafts')
  async listDrafts(@Request() req: any) {
    const tenantId = req.user.tenant_id;
    return this.draftTransactionService.listDrafts(tenantId);
  }

  @Get('drafts/:id')
  async getDraft(@Param('id') id: string) {
    return this.draftTransactionService.getDraft(id);
  }

  @Patch('drafts/:id')
  async updateDraft(@Param('id') id: string, @Body() body: UpdateDraftDto) {
    return this.draftTransactionService.updateDraft(id, body);
  }

  @Post('drafts/:id/approve')
  @HttpCode(HttpStatus.OK)
  async approveDraft(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.sub || req.user.id;
    return this.draftTransactionService.approveDraft(id, userId);
  }

  @Post('drafts/:id/reject')
  @HttpCode(HttpStatus.OK)
  async rejectDraft(@Param('id') id: string, @Body() body: { reason?: string }, @Request() req: any) {
    const userId = req.user.sub || req.user.id;
    return this.draftTransactionService.rejectDraft(id, userId, body.reason);
  }
}
