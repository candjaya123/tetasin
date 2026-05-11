import { Injectable, Logger } from '@nestjs/common';
import { InventoryRepository } from '../../inventory/repositories/inventory.repository';
import { AccountingService } from '../../accounting/services/accounting.service';
import { JournalEntry } from '../../accounting/domain/journal.domain';
import { ProcessSaleDto } from '../controllers/process-sale.dto';
import { AccountingRepository } from '../../accounting/repositories/accounting.repository';
import { UnitOfWork } from '../../../core/database/unit-of-work';
import { EventBusService } from '../../../core/events/event-bus.service';
import { SupabaseService } from '../../../shared/supabase.service';
@Injectable()
export class SalesService {
  private readonly logger = new Logger(SalesService.name);

  constructor(
    private readonly inventoryRepository: InventoryRepository,
    private readonly accountingService: AccountingService,
    private readonly accountingRepository: AccountingRepository,
    private readonly unitOfWork: UnitOfWork,
    private readonly eventBus: EventBusService,
    private readonly supabaseService: SupabaseService,
  ) { }

  async processSale(user: any, payload: ProcessSaleDto) {
    const client = this.supabaseService.getClient();
    payload.entity_id = user.entity_id || user.tenant_id;
    console.log(`Processing sale for user: ${user.id}, tenant: ${payload.entity_id}`);

    if (!payload.entity_id) {
      throw new Error('Tenant ID (entity_id) tidak ditemukan dalam context user.');
    }

    // --- TAHAP 1: PERSIAPAN (DILUAR TRANSAKSI) ---
    let finalStatus = 'success';
    try {
      const client = this.accountingRepository.getClient();
      const tenantId = user.tenant_id || user.entity_id;
      const entityId = user.entity_id || user.tenant_id;

      // Sync Tenant & Entity via REST (Safe & Independent)
      await client.from('tenants').upsert({ id: tenantId, name: 'My Business' }).select();
      await client.from('entities').upsert({ id: entityId, name: 'Main Branch', tenant_id: tenantId }).select();

      // Detect valid status enum via RAW SQL (More robust than RPC)
      // We'll use the AccountingRepository's pool to run this safely outside the main transaction
      const enumResult = await this.unitOfWork.pool.query(`
        SELECT enumlabel FROM pg_enum 
        JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
        WHERE typname = 'transaction_status_fsm'
      `);

      const validStatuses = enumResult.rows.map((r: any) => r.enumlabel);
      console.log('Valid statuses found in DB:', validStatuses);

      if (validStatuses.length > 0) {
        const priorities = ['success', 'active', 'completed', 'pending', 'draft', 'SUCCESS', 'ACTIVE', 'COMPLETED'];
        finalStatus = priorities.find(s => validStatuses.includes(s)) || validStatuses[0];
      }
    } catch (e) {
      console.warn('Prep sync failed, using fallback status:', e.message);
    }

    return await this.unitOfWork.runInTransaction(async (dbClient) => {
      try {
        console.log(`Starting sale processing with status: ${finalStatus}...`);
        let totalSaleAmount = 0;
        let totalHppAmount = 0;
        const itemsToProcess = [];

        for (const item of payload.items) {
          totalSaleAmount += (Number(item.price) * Number(item.quantity));
          console.log(`Fetching product data for: ${item.product_id}`);
          const product = await this.inventoryRepository.getProductWithRecipe(
            item.product_id,
            payload.entity_id as string,
            dbClient
          );
          if (!product) throw new Error(`Product not found: ${item.product_id}`);
          console.log(`Product structure: ${JSON.stringify(product)}`);
          itemsToProcess.push({ item, product });
        }

        console.log('Looking up accounting accounts...');
        const codesToLookup = [];
        const paymentCode = (payload as any).payment_account_code || '1-1001'; // Fallback to master_setup code

        if (!payload.payment_account_id) codesToLookup.push(paymentCode, '1-10000', '1-1001');
        if (!payload.revenue_account_id) codesToLookup.push('4-1001', '4-40000');
        if (!payload.hpp_account_id) codesToLookup.push('5-1001', '5-50000');
        if (!payload.inventory_account_id) codesToLookup.push('1-1001', '1-10503');
        if (!payload.discount_account_id) codesToLookup.push('4-1002', '4-41000');

        const accounts = await this.accountingRepository.getAccountsByCodes(payload.entity_id as string, codesToLookup, dbClient);
        console.log(`Found ${accounts?.length || 0} accounts: ${JSON.stringify(accounts.map(a => a.code))}`);

        const findId = (possibleCodes: string[]) => {
          for (const code of possibleCodes) {
            const acc = accounts.find(a => a.code === code);
            if (acc) return acc.id;
          }
          return null;
        };

        const paymentAccountId = payload.payment_account_id || findId([paymentCode, '1-10000', '1-1001']);
        const revenueAccountId = payload.revenue_account_id || findId(['4-1001', '4-40000']);
        const hppAccountId = payload.hpp_account_id || findId(['5-1001', '5-50000']);
        const inventoryAccountId = payload.inventory_account_id || findId(['1-1001', '1-10503']);
        const discountAccountId = payload.discount_account_id || findId(['4-1002', '4-41000']);

        if (!paymentAccountId || !revenueAccountId || !hppAccountId || !inventoryAccountId) {
          console.error('Missing accounts:', { paymentAccountId, revenueAccountId, hppAccountId, inventoryAccountId });
          throw new Error('Akun akuntansi dasar (Kas/HPP/Pendapatan/Persediaan) tidak ditemukan. Pastikan Chart of Accounts (COA) sudah di-setup.');
        }

        console.log('Deducting stock for items...');
        for (const { item, product } of itemsToProcess) {
          if (product.product_recipes) {
            for (const recipe of product.product_recipes) {
              const requiredQty = Number(recipe.quantity_needed) * Number(item.quantity);
              const materialHpp = Number(recipe.raw_materials.unit_price) * requiredQty;
              totalHppAmount += materialHpp;

              console.log(`Deducting ${requiredQty} of ${recipe.raw_material_id}`);
              await this.inventoryRepository.deductStock(recipe.raw_material_id, requiredQty, dbClient);
            }
          }
        }

        const discountAmount = Number(payload.discount_amount || 0);
        const totalNetSale = totalSaleAmount - discountAmount;
        const journalLines = [];

        journalLines.push({ account_id: paymentAccountId, debit: totalNetSale, credit: 0 });
        journalLines.push({ account_id: revenueAccountId, debit: 0, credit: totalSaleAmount });

        if (discountAmount > 0 && discountAccountId) {
          journalLines.push({ account_id: discountAccountId, debit: discountAmount, credit: 0 });
        }

        if (totalHppAmount > 0) {
          journalLines.push(
            { account_id: hppAccountId, debit: totalHppAmount, credit: 0 },
            { account_id: inventoryAccountId, debit: 0, credit: totalHppAmount },
          );
        }

        console.log('Creating journal entry...');
        const journal = await this.accountingService.createJournalEntry(
          payload.entity_id as string,
          {
            reference_number: `POS-${Date.now()}`,
            description: `Penjualan POS #${payload.items.length} item`,
            lines: journalLines,
          },
          dbClient
        );

        console.log(`Journal entry created: ${journal.id}. Sale recorded successfully.`);

        console.log('Emitting SaleCreated event...');
        try {
          await this.eventBus.emit({
            tenant_id: payload.entity_id as string,
            event_type: 'SaleCreated',
            payload: { journalId: journal.id, totalAmount: totalSaleAmount },
          });
        } catch (eventError) {
          console.warn('Event logging failed (non-critical), sale still committed:', eventError.message);
        }

        console.log('Sale processing completed successfully');
        return { journalId: journal.id, status: 'COMMITTED' };

      } catch (error) {
        throw error;
      }
    });
  }
}
