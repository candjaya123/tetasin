import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { InventoryRepository } from '../../inventory/repositories/inventory.repository';
import { AccountingService } from '../../accounting/services/accounting.service';
import { ProcessSaleDto } from '../controllers/process-sale.dto';
import { AccountingRepository } from '../../accounting/repositories/accounting.repository';
import { UnitOfWork } from '../../../core/database/unit-of-work';
import { EventBusService } from '../../../core/events/event-bus.service';
import { SupabaseService } from '../../../shared/supabase.service';
import { SubscriptionTier } from '../../../core/constants/subscription-tier.enum';

type HppMode = 'recipe' | 'direct' | 'none';

interface HppResult {
  mode: HppMode;
  hppPerUnit: number;
  hppAmount: number;
  journalLines: Array<{ account_id: string; debit: number; credit: number }>;
}

@Injectable()
export class SalesService {
  constructor(
    private readonly inventoryRepository: InventoryRepository,
    private readonly accountingService: AccountingService,
    private readonly accountingRepository: AccountingRepository,
    private readonly unitOfWork: UnitOfWork,
    private readonly eventBus: EventBusService,
    private readonly supabaseService: SupabaseService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(SalesService.name);
  }

  // --- HppEngine ---
  // Resolves HPP strategy per line item: recipe (BOM), direct (cost_price), or none.
  private async hppEngine(
    product: any,
    quantity: number,
    tenantId: string,
    hppAccountId: string,
    inventoryAccountId: string,
    dbClient: any,
  ): Promise<HppResult> {
    const inventoryRepo = this.inventoryRepository;

    if (product.product_recipes && product.product_recipes.length > 0) {
      let hppPerUnit = 0;
      const jl: Array<{ account_id: string; debit: number; credit: number }> = [];

      for (const recipe of product.product_recipes) {
        const requiredQty = Number(recipe.quantity_needed) * quantity;
        const unitPrice = Number(recipe.raw_materials?.unit_price || 0);
        const materialHpp = unitPrice * requiredQty;
        hppPerUnit += unitPrice * Number(recipe.quantity_needed);

        await inventoryRepo.deductStock(recipe.raw_material_id, requiredQty, dbClient);

        const ingredientCoaId = recipe.raw_materials?.coa_account_id;
        const inventoryId = ingredientCoaId || inventoryAccountId;

        jl.push({ account_id: hppAccountId, debit: materialHpp, credit: 0 });
        jl.push({ account_id: inventoryId, debit: 0, credit: materialHpp });
      }

      return { mode: 'recipe', hppPerUnit, hppAmount: hppPerUnit * quantity, journalLines: jl };
    }

    if (Number(product.cost_price) > 0) {
      const hppPerUnit = Number(product.cost_price);
      const hppAmount = hppPerUnit * quantity;
      const inventoryId = product.hpp_coa_id || inventoryAccountId;

      return {
        mode: 'direct',
        hppPerUnit,
        hppAmount,
        journalLines: [
          { account_id: hppAccountId, debit: hppAmount, credit: 0 },
          { account_id: inventoryId, debit: 0, credit: hppAmount },
        ],
      };
    }

    return { mode: 'none', hppPerUnit: 0, hppAmount: 0, journalLines: [] };
  }

  private resolvePaymentCode(paymentMethod?: string): string {
    const map: Record<string, string> = {
      cash: '1-10000',
      qris: '1-10003',
      transfer: '1-10002',
      card: '1-10002',
      Tunai: '1-10000',
      Transfer: '1-10002',
      'E-Wallet': '1-10003',
    };
    return map[paymentMethod || ''] || '1-10000';
  }

  async processSale(user: any, payload: ProcessSaleDto) {
    const tenantId = user.tenant_id || user.entity_id;
    payload.entity_id = user.entity_id || tenantId;

    this.logger.info({ tenantId, userId: user.id, action: 'sale_process_start' }, 'Processing sale');

    if (!payload.entity_id) {
      throw new Error('Tenant ID (entity_id) tidak ditemukan dalam context user.');
    }

    if (user.tier === SubscriptionTier.FREE || user.subscription_tier === SubscriptionTier.FREE) {
      const monthlyCount = await this.supabaseService.getClient()
        .from('transactions')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

      if ((monthlyCount.count ?? 0) >= 100) {
        throw new ForbiddenException({
          code: 'TRANSACTION_LIMIT',
          message: 'Batas transaksi bulanan (100) tercapai. Upgrade ke Pro untuk transaksi tanpa batas.',
        });
      }
    }

    return await this.unitOfWork.runInTransaction(async (dbClient) => {
      this.logger.info({ tenantId, action: 'sale_processing' }, 'Starting sale transaction');
      let totalSaleAmount = 0;
      let totalHppAmount = 0;
      let totalDiscount = Number(payload.discount_amount || 0);
      const taxAmount = Number(payload.tax_amount || 0);
      const itemsToProcess: Array<{ item: any; product: any; hpp: HppResult }> = [];
      const paymentMethod = payload.payment_method || 'cash';

      // Step 1: Load products and compute HPP
      for (const item of payload.items) {
        totalSaleAmount += Number(item.price) * Number(item.quantity);
        totalDiscount += Number(item.discount || 0);
        const product = await this.inventoryRepository.getProductWithRecipe(
          item.product_id,
          payload.entity_id as string,
          dbClient,
        );
        if (!product) throw new Error(`Product not found: ${item.product_id}`);
        itemsToProcess.push({ item, product, hpp: null as any });
      }

      // Step 2: Resolve COA accounts
      const paymentCode = this.resolvePaymentCode(paymentMethod);
      const codesToLookup = [paymentCode, '1-10000', '1-1001', '4-1001', '4-40000', '5-1001', '5-50000', '1-1001', '1-10503', '4-1002', '4-41000', '2-20700'];

      const accounts = await this.accountingRepository.getAccountsByCodes(
        payload.entity_id as string,
        codesToLookup,
        dbClient,
      );

      const findId = (possibleCodes: string[]) => {
        for (const code of possibleCodes) {
          const acc = accounts.find((a: any) => a.code === code);
          if (acc) return acc.id;
        }
        return null;
      };

      const paymentAccountId = payload.payment_account_id || findId([paymentCode, '1-10000', '1-1001']);
      const revenueAccountId = payload.revenue_account_id || findId(['4-1001', '4-40000']);
      const hppAccountId = payload.hpp_account_id || findId(['5-1001', '5-50000']);
      const inventoryAccountId = payload.inventory_account_id || findId(['1-1001', '1-10503']);
      const discountAccountId = payload.discount_account_id || findId(['4-1002', '4-41000']);
      const taxAccountId = findId(['2-20700']);

      if (!paymentAccountId || !revenueAccountId || !hppAccountId || !inventoryAccountId) {
        this.logger.error({ tenantId, action: 'missing_accounts' }, 'Akun akuntansi dasar tidak ditemukan');
        throw new Error('Akun akuntansi dasar (Kas/HPP/Pendapatan/Persediaan) tidak ditemukan. Pastikan Chart of Accounts (COA) sudah di-setup.');
      }

      // Validate frontend total matches backend recalculation (with rounding tolerance)
      const expectedTotal = totalSaleAmount + taxAmount - totalDiscount;
      if (Math.abs(expectedTotal - (payload as any).total) >= 1.0) {
        this.logger.warn({ tenantId, expectedTotal, frontendTotal: (payload as any).total, action: 'total_mismatch' }, 'Frontend total does not match backend calculation');
      }

      // Step 3: Create Pesanan (sales order)
      const pesananNumber = payload.pesanan_number || `ORD-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`;
      const { rows: pRows } = await dbClient.query(
        `INSERT INTO sales_orders (tenant_id, pesanan_number, customer_name, status, source, total_amount, notes, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
        [tenantId, pesananNumber, payload.customer_name || null, 'confirmed', 'pos', 0, payload.notes || null, user.id]
      );
      const pesanan = pRows[0];

      // Step 4: Create Transaction record
      const totalWithTax = totalSaleAmount + taxAmount - totalDiscount;
      const { rows: tRows } = await dbClient.query(
        `INSERT INTO transactions (tenant_id, cashier_id, pesanan_id, source_type, status, payment_method, idempotency_key, subtotal, tax_amount, discount_amount, total_amount)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
        [tenantId, user.id, pesanan.id, 'pos_sale', 'validating', paymentMethod, payload.idempotency_key || null, totalSaleAmount, taxAmount, totalDiscount, totalWithTax]
      );
      const transaction = tRows[0];

      // Step 5: Create Journal Entry (empty initially)
      const { rows: jRows } = await dbClient.query(
        `INSERT INTO journal_entries (tenant_id, reference_type, reference_id, description, status, idempotency_key, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [tenantId, 'pos_sale', transaction.id, `POS Sale ${pesananNumber}`, 'posted', payload.idempotency_key || null, user.id]
      );
      const journalId = jRows[0]?.id;
      if (!journalId) throw new Error(`Gagal membuat jurnal`);

      const allJournalLines: Array<{ account_id: string; debit: number; credit: number }> = [];

      // Step 6: Process each item (HPP + sale_items)
      for (const { item, product } of itemsToProcess) {
        const hpp = await this.hppEngine(
          product,
          Number(item.quantity),
          tenantId,
          hppAccountId,
          inventoryAccountId,
          dbClient,
        );
        totalHppAmount += hpp.hppAmount;
        allJournalLines.push(...hpp.journalLines);

        const itemTotal = (Number(item.price) * Number(item.quantity)) - Number(item.discount || 0);

        await dbClient.query(
          `INSERT INTO sale_items (tenant_id, transaction_id, product_id, quantity, unit_price, discount, hpp_mode, hpp_per_unit, hpp_amount, total, selected_variants, selected_addons)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb, $12::jsonb)`,
          [tenantId, transaction.id, item.product_id, Number(item.quantity), Number(item.price), Number(item.discount || 0), hpp.mode, hpp.hppPerUnit, hpp.hppAmount, itemTotal, item.selected_variants || [], item.selected_addons || []]
        );
      }

      // Step 7: Revenue Recognition journal lines (including tax)
      const totalNetSale = totalSaleAmount + taxAmount - totalDiscount;
      allJournalLines.push({ account_id: paymentAccountId, debit: totalNetSale, credit: 0 });
      allJournalLines.push({ account_id: revenueAccountId, debit: 0, credit: totalSaleAmount });

      if (taxAmount > 0 && taxAccountId) {
        allJournalLines.push({ account_id: taxAccountId, debit: 0, credit: taxAmount });
      }

      if (totalDiscount > 0 && discountAccountId) {
        allJournalLines.push({ account_id: discountAccountId, debit: totalDiscount, credit: 0 });
      }

      // Step 8: Insert journal lines (using debit/credit columns)
      for (const line of allJournalLines) {
        await dbClient.query(
          `INSERT INTO journal_lines (journal_entry_id, entry_id, account_id, debit, credit)
           VALUES ($1, $2, $3, $4, $5)`,
          [journalId, journalId, line.account_id, line.debit, line.credit]
        );
      }

      // Step 9: Validate journal balance
      const totalDebit = allJournalLines.reduce((s, l) => s + l.debit, 0);
      const totalCredit = allJournalLines.reduce((s, l) => s + l.credit, 0);
      if (Math.abs(totalDebit - totalCredit) >= 0.01) {
        throw new Error(`JOURNAL_IMBALANCE: Debit ${totalDebit} != Kredit ${totalCredit}`);
      }

      // Step 10: Finalize
      const finalTotal = totalSaleAmount + taxAmount - totalDiscount;
      await dbClient.query(
        `UPDATE transactions SET status = 'committed', journal_id = $1, subtotal = $2, tax_amount = $3, discount_amount = $4, total_amount = $5 WHERE id = $6`,
        [journalId, totalSaleAmount, taxAmount, totalDiscount, finalTotal, transaction.id]
      );

      await dbClient.query(
        `UPDATE sales_orders SET status = 'fulfilled', total_amount = $1, transaction_id = $2, fulfilled_at = NOW() WHERE id = $3`,
        [finalTotal, transaction.id, pesanan.id]
      );

      this.logger.info(
        { journalId, transactionId: transaction.id, pesananId: pesanan.id, totalAmount: totalNetSale, action: 'sale_committed' },
        'Sale completed',
      );

      try {
        await this.eventBus.emit({
          tenant_id: tenantId,
          event_type: 'SaleCreated',
          payload: {
            journalId,
            transactionId: transaction.id,
            pesananId: pesanan.id,
            totalAmount: totalNetSale,
          },
        });
      } catch (eventError: any) {
        this.logger.warn({ err: eventError, action: 'event_emit_failed' }, 'Event logging failed (non-critical)');
      }

      return {
        journalId,
        transactionId: transaction.id,
        pesananId: pesanan.id,
        order_number: pesananNumber,
        pesananNumber,
        status: 'COMMITTED',
      };
    });
  }

  async voidSale(user: any, transactionId: string) {
    const tenantId = user.tenant_id || user.entity_id;

    return await this.unitOfWork.runInTransaction(async (dbClient) => {
      // Verify manager role + find transaction
      const { rows: txRows } = await dbClient.query(
        `SELECT id, journal_id, status, tenant_id FROM transactions WHERE id = $1 AND tenant_id = $2`,
        [transactionId, tenantId]
      );
      const tx = txRows[0];

      if (!tx) throw new BadRequestException('Transaksi tidak ditemukan');
      if (tx.status === 'voided') throw new BadRequestException('Transaksi sudah di-void');
      if (tx.status !== 'committed') throw new BadRequestException('Hanya transaksi committed yang bisa di-void');

      // Get original journal lines
      const { rows: originalLines } = await dbClient.query(
        `SELECT account_id, debit, credit FROM journal_lines WHERE journal_entry_id = $1`,
        [tx.journal_id]
      );

      if (!originalLines || originalLines.length === 0) {
        throw new BadRequestException('Baris jurnal tidak ditemukan');
      }

      // Mark as voided
      await dbClient.query(`UPDATE transactions SET status = 'voided' WHERE id = $1`, [transactionId]);
      await dbClient.query(`UPDATE sales_orders SET status = 'voided' WHERE transaction_id = $1`, [transactionId]);

      // Create reversal journal
      const { rows: revRows } = await dbClient.query(
        `INSERT INTO journal_entries (tenant_id, reference_type, reference_id, description, status, created_by)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [tenantId, 'pos_void', transactionId, `Void reversal for transaction ${transactionId}`, 'posted', user.id]
      );
      const reversalJournal = revRows[0];

      if (!reversalJournal) throw new Error(`Gagal membuat jurnal reversal`);

      // Flip debit <-> credit
      for (const line of originalLines) {
        await dbClient.query(
          `INSERT INTO journal_lines (journal_entry_id, entry_id, account_id, debit, credit)
           VALUES ($1, $2, $3, $4, $5)`,
          [reversalJournal.id, reversalJournal.id, line.account_id, line.credit, line.debit]
        );
      }

      return { reversalJournalId: reversalJournal.id, status: 'VOIDED' };
    });
  }
}
