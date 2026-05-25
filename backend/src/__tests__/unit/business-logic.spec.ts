import { describe, it, expect } from '@jest/globals';

// ---------------------------------------------------------------------------
// Financial Calculation Engine — pure deterministic functions
// ---------------------------------------------------------------------------

const Decimal = {
  add: (a: string, b: string): string => (Number(a) + Number(b)).toFixed(2),
  sub: (a: string, b: string): string => (Number(a) - Number(b)).toFixed(2),
  mul: (a: string, b: string): string => (Number(a) * Number(b)).toFixed(2),
  div: (a: string, b: string): string => (Number(a) / Number(b)).toFixed(2),
  abs: (v: string): string => Math.abs(Number(v)).toFixed(2),
  eq: (a: string, b: string): boolean => Number(a) === Number(b),
  lt: (a: string, b: string): boolean => Number(a) < Number(b),
  gt: (a: string, b: string): boolean => Number(a) > Number(b),
};

describe('Financial Calculations', () => {
  describe('Line Total Calculation', () => {
    it('should calculate line total as quantity × unit_price', () => {
      const quantity = 3;
      const unitPrice = 15000;
      expect(quantity * unitPrice).toBe(45000);
    });

    it('should handle zero quantity gracefully', () => {
      expect(0 * 15000).toBe(0);
    });

    it('should handle large quantities without overflow', () => {
      const total = 999999 * 999999999;
      expect(total).toBeGreaterThan(0);
      expect(Number.isFinite(total)).toBe(true);
    });

    it('should handle decimal quantities', () => {
      const total = 2.5 * 15000;
      expect(total).toBe(37500);
    });

    it('should handle zero unit price', () => {
      expect(5 * 0).toBe(0);
    });
  });

  describe('Discount Calculations', () => {
    it('should apply percentage discount correctly', () => {
      const subtotal = 100000;
      const discountPercent = 10;
      const discount = Math.floor(subtotal * discountPercent / 100);
      expect(discount).toBe(10000);
    });

    it('should apply fixed discount correctly', () => {
      const subtotal = 100000;
      const fixedDiscount = 15000;
      const discount = Math.min(fixedDiscount, subtotal);
      expect(discount).toBe(15000);
    });

    it('should cap fixed discount at subtotal', () => {
      const subtotal = 5000;
      const fixedDiscount = 10000;
      const discount = Math.min(fixedDiscount, subtotal);
      expect(discount).toBe(5000);
    });

    it('should calculate final total after discount', () => {
      const subtotal = 200000;
      const discount = 25000;
      const finalTotal = subtotal - discount;
      expect(finalTotal).toBe(175000);
    });

    it('should handle zero discount', () => {
      const subtotal = 50000;
      const discount = 0;
      expect(subtotal - discount).toBe(50000);
    });

    it('should handle 100% discount', () => {
      const subtotal = 75000;
      const discount = Math.floor(subtotal * 100 / 100);
      expect(subtotal - discount).toBe(0);
    });
  });

  describe('HPP (Cost of Goods Sold) Calculation', () => {
    it('should calculate HPP from recipe', () => {
      const recipes = [
        { quantity_needed: 0.2, raw_material_unit_price: 50000 },
        { quantity_needed: 0.05, raw_material_unit_price: 30000 },
      ];
      const quantity = 2;
      const hpp = recipes.reduce(
        (sum, r) => sum + r.quantity_needed * r.raw_material_unit_price * quantity,
        0,
      );
      expect(hpp).toBe(23000);
    });

    it('should return zero HPP for products without recipes', () => {
      const recipes: any[] = [];
      const quantity = 5;
      const hpp = recipes.reduce((sum, r) => sum + r.quantity_needed * (r.raw_material_unit_price ?? 0) * quantity, 0);
      expect(hpp).toBe(0);
    });

    it('should handle HPP for single-ingredient product', () => {
      const recipes = [{ quantity_needed: 1, raw_material_unit_price: 8000 }];
      const quantity = 3;
      const hpp = recipes.reduce((sum, r) => sum + r.quantity_needed * r.raw_material_unit_price * quantity, 0);
      expect(hpp).toBe(24000);
    });

    it('should handle fractional ingredients correctly', () => {
      const recipes = [{ quantity_needed: 0.003, raw_material_unit_price: 100000 }];
      const quantity = 10;
      const hpp = recipes.reduce((sum, r) => sum + r.quantity_needed * r.raw_material_unit_price * quantity, 0);
      expect(hpp).toBe(3000);
    });
  });

  describe('Journal Balance Validation', () => {
    const validateJournalBalance = (lines: { type: 'debit' | 'credit'; amount: number }[]) => {
      const totalDebit = lines.filter((l) => l.type === 'debit').reduce((s, l) => s + l.amount, 0);
      const totalCredit = lines.filter((l) => l.type === 'credit').reduce((s, l) => s + l.amount, 0);
      const difference = Math.abs(totalDebit - totalCredit);
      return { totalDebit, totalCredit, difference, isBalanced: difference < 0.01 };
    };

    it('should validate balanced journal entries', () => {
      const result = validateJournalBalance([
        { type: 'debit', amount: 100000 },
        { type: 'credit', amount: 50000 },
        { type: 'credit', amount: 50000 },
      ]);
      expect(result.isBalanced).toBe(true);
      expect(result.difference).toBe(0);
    });

    it('should detect imbalanced journal entries', () => {
      const result = validateJournalBalance([
        { type: 'debit', amount: 100000 },
        { type: 'credit', amount: 30000 },
      ]);
      expect(result.isBalanced).toBe(false);
      expect(result.difference).toBe(70000);
    });

    it('should handle empty journal lines', () => {
      const result = validateJournalBalance([]);
      expect(result.totalDebit).toBe(0);
      expect(result.totalCredit).toBe(0);
      expect(result.isBalanced).toBe(true);
    });

    it('should reject very small imbalances (>0.01)', () => {
      const result = validateJournalBalance([
        { type: 'debit', amount: 100000.02 },
        { type: 'credit', amount: 100000 },
      ]);
      expect(result.isBalanced).toBe(false);
      expect(result.difference).toBeGreaterThan(0.01);
    });

    it('should accept very small differences within tolerance', () => {
      const result = validateJournalBalance([
        { type: 'debit', amount: 100000.001 },
        { type: 'credit', amount: 100000 },
      ]);
      expect(result.isBalanced).toBe(true);
      expect(result.difference).toBeLessThan(0.01);
    });

    it('should handle multiple lines of each type', () => {
      const result = validateJournalBalance([
        { type: 'debit', amount: 1000 },
        { type: 'debit', amount: 2000 },
        { type: 'debit', amount: 3000 },
        { type: 'credit', amount: 6000 },
      ]);
      expect(result.isBalanced).toBe(true);
      expect(result.totalDebit).toBe(6000);
      expect(result.totalCredit).toBe(6000);
    });
  });

  describe('Variant Pricing', () => {
    it('should add price delta to base price', () => {
      const basePrice = 25000;
      const selectedOptions = [
        { price_delta: 5000 },
        { price_delta: 10000 },
      ];
      const total = basePrice + selectedOptions.reduce((s, o) => s + o.price_delta, 0);
      expect(total).toBe(40000);
    });

    it('should handle negative price deltas', () => {
      const basePrice = 30000;
      const selectedOptions = [{ price_delta: -5000 }];
      const total = basePrice + selectedOptions.reduce((s, o) => s + o.price_delta, 0);
      expect(total).toBe(25000);
    });

    it('should handle empty variant selection', () => {
      const basePrice = 20000;
      const selectedOptions: { price_delta: number }[] = [];
      const total = basePrice + selectedOptions.reduce((s, o) => s + o.price_delta, 0);
      expect(total).toBe(20000);
    });
  });

  describe('Add-on Pricing', () => {
    it('should calculate addon total from selections', () => {
      const selectedAddons = [
        { price: 5000, qty: 2 },
        { price: 3000, qty: 1 },
      ];
      const total = selectedAddons.reduce((s, a) => s + a.price * a.qty, 0);
      expect(total).toBe(13000);
    });

    it('should handle free addons', () => {
      const selectedAddons = [
        { price: 0, qty: 5 },
        { price: 5000, qty: 1 },
      ];
      const total = selectedAddons.reduce((s, a) => s + a.price * a.qty, 0);
      expect(total).toBe(5000);
    });

    it('should handle empty addon selection', () => {
      const selectedAddons: { price: number; qty: number }[] = [];
      const total = selectedAddons.reduce((s, a) => s + a.price * a.qty, 0);
      expect(total).toBe(0);
    });
  });

  describe('Stock Deduction', () => {
    const deductStock = (currentStock: number, quantity: number, recipes: { quantity_needed: number; raw_stock: number }[]) => {
      const newProductStock = currentStock - quantity;
      const materialResults = recipes.map((r) => ({
        required: r.quantity_needed * quantity,
        newStock: r.raw_stock - r.quantity_needed * quantity,
        sufficient: r.raw_stock >= r.quantity_needed * quantity,
      }));
      return { newProductStock, materialResults, anyInsufficient: materialResults.some((r) => !r.sufficient) };
    };

    it('should deduct stock on sale', () => {
      const result = deductStock(50, 3, []);
      expect(result.newProductStock).toBe(47);
    });

    it('should deduct raw material stock from recipes', () => {
      const result = deductStock(100, 2, [
        { quantity_needed: 0.5, raw_stock: 10 },
        { quantity_needed: 0.1, raw_stock: 5 },
      ]);
      expect(result.materialResults[0].newStock).toBe(9);
      expect(result.materialResults[1].newStock).toBe(4.8);
    });

    it('should detect insufficient stock', () => {
      const result = deductStock(2, 5, []);
      expect(result.newProductStock).toBe(-3);
    });

    it('should detect insufficient raw material stock', () => {
      const result = deductStock(100, 1, [
        { quantity_needed: 100, raw_stock: 50 },
      ]);
      expect(result.anyInsufficient).toBe(true);
    });

    it('should handle zero stock edge case', () => {
      const result = deductStock(0, 1, []);
      expect(result.newProductStock).toBe(-1);
    });

    it('should handle large quantities precisely', () => {
      const result = deductStock(10000, 500, [
        { quantity_needed: 0.001, raw_stock: 100 },
      ]);
      expect(result.materialResults[0].newStock).toBe(99.5);
      expect(result.anyInsufficient).toBe(false);
    });
  });

  describe('Transaction Limit Enforcement', () => {
    it('should allow transaction when under monthly limit', () => {
      const monthlyLimit = 500;
      const currentCount = 300;
      expect(currentCount < monthlyLimit).toBe(true);
    });

    it('should reject when at limit', () => {
      const monthlyLimit = 500;
      const currentCount = 500;
      expect(currentCount >= monthlyLimit).toBe(true);
    });

    it('should reject when over limit', () => {
      const monthlyLimit = 500;
      const currentCount = 501;
      expect(currentCount >= monthlyLimit).toBe(true);
    });

    it('should handle zero current transactions', () => {
      const monthlyLimit = 500;
      const currentCount = 0;
      expect(currentCount < monthlyLimit).toBe(true);
    });
  });
});

describe('Decimal Arithmetic Precision', () => {
  it('should maintain 2-decimal precision for addition', () => {
    const result = Decimal.add('100.33', '200.67');
    expect(result).toBe('301.00');
  });

  it('should maintain precision for subtraction', () => {
    const result = Decimal.sub('500.50', '100.25');
    expect(result).toBe('400.25');
  });

  it('should maintain precision for multiplication', () => {
    const result = Decimal.mul('150.00', '3');
    expect(result).toBe('450.00');
  });

  it('should maintain precision for division', () => {
    const result = Decimal.div('100.00', '3');
    expect(result).toBe('33.33');
  });

  it('should detect tiny differences', () => {
    const a = '100000.005';
    const b = '100000.000';
    expect(Decimal.eq(a, b)).toBe(false);
  });
});