# Tumbuhin — Test Strategy

> **Document Purpose:** Defines quality assurance architecture — unit, integration, E2E, regression, load testing, and QA workflows.
> **Who Should Read This:** All engineers and QA engineers.
> **Why It Matters:** Large systems become unstable and unmaintainable without testing discipline.

---

## 1. Current Problems

| Problem | Severity | Description |
|---|---|---|
| No end-to-end test suite | 🔴 High | Phase 11 (E2E testing) still pending — no automated validation of critical flows |
| No integration tests for API endpoints | 🔴 High | Controllers untested — breaking changes go undetected |
| No test coverage requirements enforced | 🟡 Medium | No CI gate on minimum coverage |
| Debug/test scripts (`test.md`, `check_cols.js`) in repo root | 🟡 Medium | Manual testing artifacts pollute the repo |
| No load testing for POS endpoint | 🟡 Medium | Unknown throughput limits before production failures |

---

## 2. Testing Pyramid

```
                     ╔══════════════╗
                     ║   E2E Tests  ║  (few, slow, high confidence)
                     ║  Playwright  ║
                     ╠══════════════╣
                  ╔══════════════════════╗
                  ║  Integration Tests   ║  (moderate, fast)
                  ║  Supertest + Jest    ║
                  ╠══════════════════════╣
             ╔══════════════════════════════╗
             ║       Unit Tests              ║  (many, very fast)
             ║  Jest + Mock repositories     ║
             ╚══════════════════════════════╝
```

---

## 3. Unit Testing

### 3.1 Scope

Every service method MUST have unit tests. Focus on:
- Business logic correctness
- Error/edge case handling
- Input validation behavior
- Journal balance invariants

### 3.2 Pattern

```typescript
// backend/src/modules/sales/services/sales.service.spec.ts
import { Test } from '@nestjs/testing';
import { SalesService } from './sales.service';
import { SalesRepository } from '../repositories/sales.repository';
import { AccountingService } from '../../accounting/services/accounting.service';

describe('SalesService', () => {
  let service: SalesService;
  let mockSalesRepo: jest.Mocked<SalesRepository>;
  let mockAccountingService: jest.Mocked<AccountingService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        SalesService,
        { provide: SalesRepository, useValue: { create: jest.fn(), findByTenant: jest.fn() } },
        { provide: AccountingService, useValue: { createJournalEntry: jest.fn() } },
      ],
    }).compile();

    service = module.get(SalesService);
    mockSalesRepo = module.get(SalesRepository);
    mockAccountingService = module.get(AccountingService);
  });

  describe('processSale', () => {
    it('should create transaction and journal entry on valid sale', async () => {
      // Arrange
      mockSalesRepo.create.mockResolvedValue({ id: 'txn-uuid', status: 'committed' });
      mockAccountingService.createJournalEntry.mockResolvedValue({ id: 'jnl-uuid' });

      // Act
      const result = await service.processSale(validSaleDto, mockContext);

      // Assert
      expect(result.status).toBe('committed');
      expect(mockAccountingService.createJournalEntry).toHaveBeenCalledOnce();
    });

    it('should throw INSUFFICIENT_STOCK when stock is below required', async () => {
      // Arrange
      mockSalesRepo.getStockForItems.mockResolvedValue([{ available: 1, required: 5 }]);

      // Act & Assert
      await expect(service.processSale(saleWithHighQtyDto, mockContext))
        .rejects.toThrow(expect.objectContaining({ code: 'INSUFFICIENT_STOCK' }));
    });

    it('should throw TRANSACTION_LIMIT on Starter tier when limit exceeded', async () => {
      // Arrange
      const starterContext = { ...mockContext, tier: 'starter', monthlyCount: 500 };

      // Act & Assert
      await expect(service.processSale(validSaleDto, starterContext))
        .rejects.toThrow(expect.objectContaining({ code: 'TRANSACTION_LIMIT' }));
    });

    it('should rollback on journal imbalance error', async () => {
      // Arrange
      mockAccountingService.createJournalEntry.mockRejectedValue(
        new Error('JOURNAL_IMBALANCE')
      );

      // Act & Assert
      await expect(service.processSale(validSaleDto, mockContext)).rejects.toThrow();
      expect(mockSalesRepo.rollback).toHaveBeenCalledOnce();
    });
  });
});
```

### 3.3 Coverage Targets

| Module | Minimum Coverage |
|---|---|
| `sales` service | 90% |
| `accounting` service | 95% |
| `inventory` service | 85% |
| `report` service | 80% |
| All other services | 80% |

---

## 4. Integration Testing

### 4.1 Scope

Test the full HTTP stack: routing → guards → controller → service → repository → DB response.
Use Supertest with a real NestJS application instance and a test database.

### 4.2 Pattern

```typescript
// backend/test/sales.e2e-spec.ts
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('SalesController (integration)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    authToken = await getTestAuthToken(); // Helper to get valid JWT
  });

  afterAll(() => app.close());

  it('POST /api/v1/sales — creates sale and returns 201', async () => {
    const dto = {
      items: [{ product_id: TEST_PRODUCT_ID, quantity: 1, unit_price: 15000 }],
      payment_method: 'cash',
      idempotency_key: uuid(),
    };

    const res = await request(app.getHttpServer())
      .post('/api/v1/sales')
      .set('Authorization', `Bearer ${authToken}`)
      .send(dto)
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('committed');
    expect(res.body.data.journal_id).toBeDefined();
  });

  it('POST /api/v1/sales — returns 422 with INSUFFICIENT_STOCK', async () => {
    const dto = { items: [{ product_id: EMPTY_STOCK_PRODUCT_ID, quantity: 100, unit_price: 15000 }] };

    const res = await request(app.getHttpServer())
      .post('/api/v1/sales')
      .set('Authorization', `Bearer ${authToken}`)
      .send(dto)
      .expect(422);

    expect(res.body.error.code).toBe('INSUFFICIENT_STOCK');
  });

  it('POST /api/v1/finance/balance-sheet — returns 403 for Starter tier', async () => {
    const starterToken = await getStarterTierToken();
    await request(app.getHttpServer())
      .get('/api/v1/finance/balance-sheet')
      .set('Authorization', `Bearer ${starterToken}`)
      .expect(403);
  });
});
```

---

## 5. End-to-End (E2E) Testing

### 5.1 Critical User Flows to Test

| Flow | Tool | Priority |
|---|---|---|
| User registration + onboarding | Playwright | 🔴 P0 |
| POS sale → journal created → report updated | Playwright | 🔴 P0 |
| Procurement draft → approval → stock update | Playwright | 🔴 P0 |
| Subscription upgrade flow | Playwright | 🟡 P1 |
| AI chat produces response | Playwright | 🟡 P1 |
| Staff management (RBAC) | Playwright | 🟡 P1 |

### 5.2 Playwright Setup

```typescript
// e2e/pos-sale.spec.ts
import { test, expect } from '@playwright/test';

test.describe('POS Sale Flow', () => {
  test('cashier can complete a sale and see updated journal', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'test@tumbuhin.com');
    await page.fill('[data-testid="password"]', 'testpassword');
    await page.click('[data-testid="login-btn"]');
    await expect(page).toHaveURL('/tenant');

    // Navigate to POS
    await page.click('[data-testid="nav-pos"]');
    await page.click('[data-testid="product-kopi-susu"]');
    await page.click('[data-testid="checkout-btn"]');
    await page.selectOption('[data-testid="payment-method"]', 'cash');
    await page.click('[data-testid="confirm-sale"]');

    // Assert sale completed
    await expect(page.locator('[data-testid="sale-success"]')).toBeVisible();

    // Navigate to journal and verify
    await page.click('[data-testid="nav-finance"]');
    await page.click('[data-testid="nav-journal"]');
    await expect(page.locator('[data-testid="latest-journal-row"]')).toContainText('Penjualan POS');
  });
});
```

---

## 6. Load Testing

### 6.1 Critical Endpoints to Load Test

```javascript
// k6/pos-load.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },   // Ramp to 50 concurrent users
    { duration: '3m', target: 50 },   // Hold
    { duration: '1m', target: 200 },  // Peak: 200 concurrent checkouts
    { duration: '1m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(99)<500'],  // 99% under 500ms
    http_req_failed: ['rate<0.01'],    // < 1% error rate
  },
};

export default function () {
  const res = http.post(
    'http://api.tumbuhin.com/api/v1/sales',
    JSON.stringify({ items: [...], payment_method: 'cash', idempotency_key: uuid() }),
    { headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' } }
  );
  check(res, { 'status is 201': (r) => r.status === 201 });
  sleep(1);
}
```

### 6.2 Load Test Schedule

| Test | Frequency | Threshold |
|---|---|---|
| POS sale endpoint | Quarterly | P99 < 500ms, error < 1% |
| Balance sheet report | Quarterly | P99 < 1000ms |
| AI chat endpoint | Quarterly | P99 < 2000ms |

---

## 7. QA Workflows

### 7.1 PR Checklist

Before any PR is merged:
- [ ] Unit tests pass (100%)
- [ ] Coverage >= 80% for modified files
- [ ] Integration tests pass
- [ ] No new `console.log` in production code
- [ ] No new `any` TypeScript types
- [ ] API contract unchanged (or version bumped)

### 7.2 Release Checklist

Before production release:
- [ ] All automated tests pass on staging
- [ ] E2E critical flows verified manually
- [ ] No high-severity issues in security scan
- [ ] Performance benchmarks within thresholds
- [ ] Rollback plan documented

---

## 8. Refactor Direction

1. **Create test database seeder** (`test/fixtures/`) with reproducible tenant, products, stock data
2. **Add CI coverage gate** — fail pipeline if coverage < 80%
3. **Write integration tests** for all 14 module controllers
4. **Write Playwright E2E tests** for the 6 P0 critical flows
5. **Run first k6 load test** on POS endpoint, document baseline metrics

---

## 9. Long-Term Recommendations

| Recommendation | Rationale |
|---|---|
| Contract testing (Pact) | Prevent frontend/backend contract drift |
| Visual regression testing (Percy) | Catch UI regressions in web dashboard |
| Mutation testing (Stryker) | Validate test quality, not just coverage |
| Continuous load testing in staging | Catch performance regressions before production |
| Flutter integration tests | Automated mobile UI testing |
