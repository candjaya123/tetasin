import { Injectable } from '@nestjs/common';
import { ReceiptRepository } from '../repositories/receipt.repository';

@Injectable()
export class MerchantMemoryService {
  constructor(private readonly receiptRepository: ReceiptRepository) {}

  async getRecommendation(tenantId: string, merchantName: string) {
    if (!merchantName) return null;
    return this.receiptRepository.getMerchantMapping(tenantId, merchantName);
  }

  async learn(tenantId: string, merchantName: string, approvedData: any) {
    if (!merchantName) return;
    
    const existing = await this.receiptRepository.getMerchantMapping(tenantId, merchantName);
    
    const data = {
      tenant_id: tenantId,
      merchant_name: merchantName.toLowerCase(),
      default_category: approvedData.category,
      default_account_id: approvedData.debit_account_id || approvedData.account_id,
      default_tags: approvedData.tags,
      approval_count: (existing?.approval_count || 0) + 1,
      last_used_at: new Date().toISOString(),
    };
    
    return this.receiptRepository.upsertMerchantMapping(data);
  }
}
