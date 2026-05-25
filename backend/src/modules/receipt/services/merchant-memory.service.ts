import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { ReceiptRepository } from '../repositories/receipt.repository';

@Injectable()
export class MerchantMemoryService {
  private readonly cache = new Map<string, { data: any; expiresAt: number }>();
  private readonly CACHE_TTL_MS = 15 * 60 * 1000;

  constructor(
    private readonly receiptRepository: ReceiptRepository,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(MerchantMemoryService.name);
  }

  async recommend(tenantId: string, merchantName: string) {
    if (!merchantName) return null;
    const normalized = merchantName.toLowerCase().trim();
    const cacheKey = `merchant:${tenantId}:${normalized}`;

    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    const mapping = await this.receiptRepository.getMerchantMapping(tenantId, normalized);

    if (mapping) {
      this.cache.set(cacheKey, { data: mapping, expiresAt: Date.now() + this.CACHE_TTL_MS });
    }

    return mapping;
  }

  async learn(tenantId: string, merchantName: string, data: { category?: string; debit_account_id?: string; tags?: string[] }) {
    if (!merchantName) return;

    const normalized = merchantName.toLowerCase().trim();
    const existing = await this.receiptRepository.getMerchantMapping(tenantId, normalized);

    const mappingData = {
      tenant_id: tenantId,
      merchant_name: normalized,
      default_category: data.category || existing?.default_category,
      default_account_id: data.debit_account_id || existing?.default_account_id,
      default_tags: data.tags || existing?.default_tags,
      approval_count: (existing?.approval_count || 0) + 1,
      last_used_at: new Date().toISOString(),
    };

    const result = await this.receiptRepository.upsertMerchantMapping(mappingData);

    const cacheKey = `merchant:${tenantId}:${normalized}`;
    this.cache.set(cacheKey, { data: result, expiresAt: Date.now() + this.CACHE_TTL_MS });

    this.logger.info({ tenantId, merchantName: normalized, action: 'merchant_learned' }, 'Merchant mapping learned');
    return result;
  }

  async list(tenantId: string) {
    return this.receiptRepository.getMerchantMappings(tenantId);
  }
}
