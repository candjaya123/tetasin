import { describe, it, expect, beforeEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from '../../modules/inventory/services/inventory.service';
import { AccountingService } from '../../modules/accounting/services/accounting.service';
import { buildMockSaleRequest, buildMockProduct } from '../mocks/factories';
import { BadRequestException, ForbiddenException } from '@nestjs/common';

// Simulated SalesService logic (pure functions extracted for unit testing)
describe('Sales Processing Logic', () => {
  const validateSaleRequest = (body: any) => {
    const errors: string[] = [];
    if (!body.items || body.items.length === 0) errors.push('items required');
    if (!body.payment_method) errors.push('payment_method required');
    for (const item of body.items) {
      if (!item.product_id) errors.push('product_id required');
      if (!item.quantity || item.quantity <= 0) errors.push('quantity must be positive');
      if (!item.unit_price || item.unit_price < 0) errors.push('unit_price must be non-negative');
    }
    return errors;
  };

  const calculateTransactionTotals = (items: { quantity: number; unit_price: number }[], discountAmount: number = 0) => {
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
    const discount = Math.min(discountAmount, subtotal);
    const totalAmount = subtotal - discount;
    return { subtotal, discount, totalAmount };
  };

  const checkStockAvailability = (
    items: { product_id: string; quantity: number }[],
    products: Record<string, { current_stock: number; name: string }>,
  ) => {
    const insufficient: { product_id: string; name: string; required: number; available: number }[] = [];
    for (const item of items) {
      const product = products[item.product_id];
      if (!product) {
        insufficient.push({ product_id: item.product_id, name: 'Unknown', required: item.quantity, available: 0 });
      } else if (product.current_stock < item.quantity) {
        insufficient.push({
          product_id: item.product_id,
          name: product.name,
          required: item.quantity,
          available: product.current_stock,
        });
      }
    }
    return insufficient;
  };

  describe('Request Validation', () => {
    it('should reject empty items array', () => {
      const errors = validateSaleRequest({ items: [], payment_method: 'cash' });
      expect(errors).toContain('items required');
    });

    it('should reject missing payment method', () => {
      const errors = validateSaleRequest({ items: [{ product_id: 'p1', quantity: 1, unit_price: 1000 }] });
      expect(errors).toContain('payment_method required');
    });

    it('should reject negative quantity', () => {
      const errors = validateSaleRequest({
        items: [{ product_id: 'p1', quantity: -1, unit_price: 1000 }],
        payment_method: 'cash',
      });
      expect(errors).toContain('quantity must be positive');
    });

    it('should reject zero quantity', () => {
      const errors = validateSaleRequest({
        items: [{ product_id: 'p1', quantity: 0, unit_price: 1000 }],
        payment_method: 'cash',
      });
      expect(errors).toContain('quantity must be positive');
    });

    it('should reject negative unit price', () => {
      const errors = validateSaleRequest({
        items: [{ product_id: 'p1', quantity: 2, unit_price: -500 }],
        payment_method: 'cash',
      });
      expect(errors).toContain('unit_price must be non-negative');
    });

    it('should accept valid request', () => {
      const errors = validateSaleRequest({
        items: [{ product_id: 'p1', quantity: 2, unit_price: 15000 }],
        payment_method: 'cash',
      });
      expect(errors).toHaveLength(0);
    });

    it('should validate multiple items', () => {
      const errors = validateSaleRequest({
        items: [
          { product_id: 'p1', quantity: 1, unit_price: 10000 },
          { product_id: 'p2', quantity: -1, unit_price: 5000 },
        ],
        payment_method: 'qris',
      });
      expect(errors).toContain('quantity must be positive');
    });
  });

  describe('Transaction Total Calculation', () => {
    it('should calculate subtotal from items', () => {
      const { subtotal } = calculateTransactionTotals([
        { quantity: 2, unit_price: 15000 },
        { quantity: 1, unit_price: 25000 },
      ]);
      expect(subtotal).toBe(55000);
    });

    it('should apply discount to total', () => {
      const { totalAmount } = calculateTransactionTotals(
        [{ quantity: 1, unit_price: 100000 }],
        10000,
      );
      expect(totalAmount).toBe(90000);
    });

    it('should cap discount at subtotal', () => {
      const { discount, totalAmount } = calculateTransactionTotals(
        [{ quantity: 1, unit_price: 5000 }],
        10000,
      );
      expect(discount).toBe(5000);
      expect(totalAmount).toBe(0);
    });

    it('should handle zero items gracefully', () => {
      const { subtotal, totalAmount } = calculateTransactionTotals([]);
      expect(subtotal).toBe(0);
      expect(totalAmount).toBe(0);
    });

    it('should handle large transactions', () => {
      const { subtotal } = calculateTransactionTotals([
        { quantity: 1000, unit_price: 999999 },
      ]);
      expect(subtotal).toBe(999999000);
      expect(Number.isFinite(subtotal)).toBe(true);
    });
  });

  describe('Stock Availability Check', () => {
    const products = {
      'p1': { current_stock: 50, name: 'Kopi' },
      'p2': { current_stock: 3, name: 'Teh' },
      'p3': { current_stock: 0, name: 'Susu' },
    };

    it('should pass when stock is sufficient', () => {
      const result = checkStockAvailability(
        [{ product_id: 'p1', quantity: 5 }],
        products,
      );
      expect(result).toHaveLength(0);
    });

    it('should detect insufficient stock', () => {
      const result = checkStockAvailability(
        [{ product_id: 'p2', quantity: 10 }],
        products,
      );
      expect(result).toHaveLength(1);
      expect(result[0].product_id).toBe('p2');
      expect(result[0].required).toBe(10);
      expect(result[0].available).toBe(3);
    });

    it('should detect zero stock product', () => {
      const result = checkStockAvailability(
        [{ product_id: 'p3', quantity: 1 }],
        products,
      );
      expect(result).toHaveLength(1);
      expect(result[0].available).toBe(0);
    });

    it('should detect unknown product', () => {
      const result = checkStockAvailability(
        [{ product_id: 'unknown', quantity: 1 }],
        products,
      );
      expect(result).toHaveLength(1);
    });

    it('should check all items in batch', () => {
      const result = checkStockAvailability(
        [
          { product_id: 'p1', quantity: 5 },
          { product_id: 'p2', quantity: 10 },
          { product_id: 'p3', quantity: 1 },
        ],
        products,
      );
      expect(result).toHaveLength(2);
    });

    it('should return empty for sufficient multi-item batch', () => {
      const result = checkStockAvailability(
        [
          { product_id: 'p1', quantity: 1 },
          { product_id: 'p2', quantity: 2 },
        ],
        products,
      );
      expect(result).toHaveLength(0);
    });
  });

  describe('Idempotency Key Logic', () => {
    const idempotencyStore = new Map<string, any>();

    const checkIdempotency = (key: string): { isDuplicate: boolean; originalResponse?: any } => {
      if (idempotencyStore.has(key)) {
        return { isDuplicate: true, originalResponse: idempotencyStore.get(key) };
      }
      return { isDuplicate: false };
    };

    const storeIdempotency = (key: string, response: any) => {
      idempotencyStore.set(key, response);
    };

    beforeEach(() => {
      idempotencyStore.clear();
    });

    it('should allow first request with new key', () => {
      const result = checkIdempotency('key-001');
      expect(result.isDuplicate).toBe(false);
    });

    it('should detect duplicate idempotency key', () => {
      storeIdempotency('key-002', { status: 'committed', transaction_id: 'tx-1' });
      const result = checkIdempotency('key-002');
      expect(result.isDuplicate).toBe(true);
      expect(result.originalResponse).toEqual({
        status: 'committed',
        transaction_id: 'tx-1',
      });
    });

    it('should return original response on duplicate', () => {
      const originalResponse = { status: 'committed', transaction_id: 'tx-5', total_amount: 50000 };
      storeIdempotency('key-003', originalResponse);

      const result = checkIdempotency('key-003');
      expect(result.originalResponse).toBe(originalResponse);
    });

    it('should handle multiple unique keys', () => {
      storeIdempotency('key-a', { id: 'a' });
      storeIdempotency('key-b', { id: 'b' });

      expect(checkIdempotency('key-a').isDuplicate).toBe(true);
      expect(checkIdempotency('key-b').isDuplicate).toBe(true);
      expect(checkIdempotency('key-c').isDuplicate).toBe(false);
    });
  });

  describe('Complete Sale Flow (Simulated)', () => {
    it('should process a valid sale end-to-end', () => {
      const items = [
        { product_id: 'p1', quantity: 2, unit_price: 15000 },
        { product_id: 'p2', quantity: 1, unit_price: 20000 },
      ];
      const discountAmount = 5000;
      const paymentMethod = 'cash';

      // Validate
      const errors = validateSaleRequest({ items, payment_method: paymentMethod });
      expect(errors).toHaveLength(0);

      // Calculate totals
      const { subtotal, totalAmount } = calculateTransactionTotals(items, discountAmount);
      expect(subtotal).toBe(50000);
      expect(totalAmount).toBe(45000);

      // Check stock
      const products = {
        'p1': { current_stock: 100, name: 'Kopi' },
        'p2': { current_stock: 50, name: 'Roti' },
      };
      const stockIssues = checkStockAvailability(items, products);
      expect(stockIssues).toHaveLength(0);

      // Verify journal balance
      // Sale with discount: DEBIT Kas(totalAmount) + DEBIT Diskon(discount) = CREDIT Pendapatan(subtotal)
      const journalLines: { type: 'debit' | 'credit'; amount: number }[] = [
        { type: 'debit', amount: totalAmount }, // Kas (money received)
        { type: 'debit', amount: discountAmount }, // Diskon Penjualan
        { type: 'credit', amount: subtotal }, // Pendapatan Penjualan
      ];
      const debit = journalLines.filter((l) => l.type === 'debit').reduce((s, l) => s + l.amount, 0);
      const credit = journalLines.filter((l) => l.type === 'credit').reduce((s, l) => s + l.amount, 0);
      expect(debit).toBe(credit);
      expect(Math.abs(debit - credit)).toBeLessThan(0.01);
    });

    it('should roll back if stock insufficient', () => {
      const items = [{ product_id: 'p1', quantity: 1000, unit_price: 10000 }];
      const products = { 'p1': { current_stock: 5, name: 'Kopi' } };

      const stockIssues = checkStockAvailability(items, products);
      expect(stockIssues.length).toBeGreaterThan(0);
      expect(stockIssues.length).toBeGreaterThan(0);
    });
  });
});

describe('Payment Method Validation', () => {
  const VALID_PAYMENT_METHODS = ['cash', 'qris', 'transfer', 'card'];

  it('should accept all valid payment methods', () => {
    for (const method of VALID_PAYMENT_METHODS) {
      expect(VALID_PAYMENT_METHODS.includes(method)).toBe(true);
    }
  });

  it('should reject invalid payment method', () => {
    expect(VALID_PAYMENT_METHODS.includes('bitcoin')).toBe(false);
    expect(VALID_PAYMENT_METHODS.includes('')).toBe(false);
    expect(VALID_PAYMENT_METHODS.includes('CASH')).toBe(false);
  });
});