# Tumbuhin — Test Strategy

> **Document Purpose:** Defines testing philosophy, pyramid, coverage requirements, test patterns, and CI gates.
> **Who Should Read This:** All engineers, QA, and DevOps.

---

## 1. Testing Philosophy

1. **Test behavior, not implementation** — tests validate what the code does, not how
2. **Critical paths have 100% coverage** — POS sale, journal creation, draft approval
3. **Financial invariants are always tested** — journal balance, stock deduction atomicity
4. **Tests are fast and deterministic** — no flaky tests in main CI pipeline
5. **Pyramid over ice cream cone** — more unit tests, fewer E2E tests

---

## 2. Test Pyramid

```
          /‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\
         /     E2E Tests       \       ← 6 critical user flows (Playwright/Flutter test)
        /─────────────────────── \
       /  Integration Tests       \    ← All 15 controllers (Supertest + Flutter integration)
      /─────────────────────────── \
     /       Unit Tests             \  ← All services + repositories (Jest/Dart)
    /─────────────────────────────── \
```

### 2.1 Unit Tests (Jest / Dart test)

| Layer | Coverage Target |
|---|---|
| `SalesService`, `AccountingService` | 95% — financial critical |
| `DraftTransactionService`, `ReceiptExtractionService` | 90% |
| All other services | 80% |
| Repositories | 70% (mostly query construction) |
| DTOs | 100% (validation edge cases) |

### 2.2 Integration Tests (Jest + Supertest)

Every controller gets an integration test that:
- Calls the real endpoint (in-memory test DB)
- Validates status codes, response envelope, and data structure
- Tests both success and error paths

### 2.3 E2E Tests (Playwright — Web, Flutter Test — Mobile)

**P0 Critical Flows (must pass before every release):**

| Flow | Steps | Platforms |
|---|---|---|
| Registration + Onboarding | Sign up → create tenant → seed COA → dashboard | Web |
| POS Sale (full flow) | Add products → checkout → cash payment → receipt | Web, Flutter |
| Stock Management | Add raw material → create product recipe → check stock after sale | Web |
| Receipt OCR Scan | Upload image → wait for processing → review draft → approve → journal created | Web, Flutter |
| Financial Report | Generate P&L → verify numbers match journal entries | Web |
| Subscription Upgrade | Starter → Business → verify tier-gated features unlock | Web |

### 2.4 Load Tests (k6)

```javascript
// k6 load test — POS endpoint
export const options = {
  vus: 100,          // 100 virtual users
  duration: '5m',    // 5 minute sustained load
  thresholds: {
    http_req_duration: ['p(95) < 500'],  // P95 < 500ms
    http_req_failed: ['rate < 0.01'],    // Error rate < 1%
  },
};
```

Run quarterly and before major releases.

---

## 3. Test Patterns

### 3.1 Unit Test Pattern (NestJS Service)

```typescript
describe('DraftTransactionService', () => {
  let service: DraftTransactionService;
  let mockRepo: jest.Mocked<ReceiptRepository>;
  let mockAccounting: jest.Mocked<AccountingService>;
  let mockUoW: jest.Mocked<UnitOfWork>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        DraftTransactionService,
        { provide: ReceiptRepository, useValue: createMockReceiptRepository() },
        { provide: AccountingService, useValue: createMockAccountingService() },
        { provide: UnitOfWork, useValue: createMockUnitOfWork() },
        { provide: EventBusService, useValue: createMockEventBus() },
        { provide: MerchantMemoryService, useValue: createMockMerchantMemory() },
      ],
    }).compile();
    service = module.get(DraftTransactionService);
    mockRepo = module.get(ReceiptRepository);
    mockAccounting = module.get(AccountingService);
    mockUoW = module.get(UnitOfWork);
  });

  describe('approveDraft', () => {
    it('should create journal entry and mark draft as approved', async () => {
      const mockDraft = buildMockDraft({ status: 'ready', debit_account_id: 'acc-1', credit_account_id: 'acc-2' });
      mockRepo.getDraft.mockResolvedValue(mockDraft);
      mockUoW.runInTransaction.mockImplementation((fn) => fn({} as any));
      mockAccounting.createJournalEntry.mockResolvedValue({ id: 'journal-1' } as any);

      await service.approveDraft('draft-id', 'user-id');

      expect(mockAccounting.createJournalEntry).toHaveBeenCalledTimes(1);
      expect(mockRepo.updateDraft).toHaveBeenCalledWith('draft-id', expect.objectContaining({ status: 'approved' }));
    });

    it('should throw when draft is missing account mapping', async () => {
      const mockDraft = buildMockDraft({ status: 'ready', debit_account_id: null });
      mockRepo.getDraft.mockResolvedValue(mockDraft);

      await expect(service.approveDraft('draft-id', 'user-id'))
        .rejects.toThrow('MISSING_ACCOUNT_MAPPING');
    });

    it('should rollback transaction if journal creation fails', async () => {
      const mockDraft = buildMockDraft({ status: 'ready', debit_account_id: 'acc-1', credit_account_id: 'acc-2' });
      mockRepo.getDraft.mockResolvedValue(mockDraft);
      mockUoW.runInTransaction.mockImplementation((fn) => fn({} as any));
      mockAccounting.createJournalEntry.mockRejectedValue(new Error('JOURNAL_IMBALANCE'));

      await expect(service.approveDraft('draft-id', 'user-id'))
        .rejects.toThrow('JOURNAL_IMBALANCE');

      expect(mockRepo.updateDraft).not.toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ status: 'approved' })
      );
    });
  });
});
```

### 3.2 Controller Integration Test Pattern

```typescript
describe('ReceiptController (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [ReceiptModule, CoreModule],
    })
    .overrideProvider(SupabaseService).useValue(mockSupabase())
    .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  it('POST /api/v1/receipt/drafts — should create a manual draft', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/receipt/drafts')
      .set('Authorization', `Bearer ${testJwt}`)
      .send({ merchant_name: 'Indomaret', total_amount: 50000 })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.status).toBe('ready');
  });

  it('POST /api/v1/receipt/scan — should return 403 for Starter tier', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/receipt/scan')
      .set('Authorization', `Bearer ${starterTierJwt}`)
      .expect(403)
      .expect((res) => {
        expect(res.body.error.code).toBe('TIER_RESTRICTION');
      });
  });
});
```

### 3.3 E2E Test Pattern (Playwright)

```typescript
// e2e/receipt-scan.spec.ts
test('Complete receipt scan flow', async ({ page, apiContext }) => {
  await page.goto('/tenant/receipt');

  // Upload receipt
  await page.click('[data-testid="scan-receipt-btn"]');
  await page.setInputFiles('[data-testid="receipt-upload"]', 'test-fixtures/receipt.jpg');
  await page.click('[data-testid="submit-scan"]');

  // Wait for processing
  await expect(page.locator('[data-testid="scan-status"]')).toHaveText('Selesai', { timeout: 30000 });

  // Review draft
  await page.click('[data-testid="review-draft-btn"]');
  await expect(page.locator('[data-testid="merchant-name"]')).toBeVisible();

  // Set account mapping
  await page.selectOption('[data-testid="debit-account"]', 'Beban Operasional');
  await page.selectOption('[data-testid="credit-account"]', 'Kas Tangan');

  // Approve
  await page.click('[data-testid="approve-btn"]');
  await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
});
```

---

## 4. CI Pipeline Gates

```yaml
# .github/workflows/ci.yml
- Unit Tests:       npm run test:unit        # Must pass at 80%+ coverage
- Integration Tests: npm run test:integration # All 15 controllers
- Lint:             npm run lint             # ESLint + Prettier
- TypeScript:       npm run tsc              # Zero type errors
- E2E (P0 only):    npm run test:e2e:p0      # On main branch only
```

**Merge requirements:**
- All unit + integration tests pass
- Coverage ≥ 80% for modified files (95% for accounting/sales)
- Zero ESLint errors
- Zero TypeScript errors
- No `console.log` or `any` type in diff

---

## 5. Test Data Standards

```typescript
// test/factories/draft.factory.ts
export function buildMockDraft(overrides: Partial<DraftTransaction> = {}): DraftTransaction {
  return {
    id: 'draft-' + randomUUID(),
    tenant_id: 'tenant-test-1',
    status: 'ready',
    merchant_name: 'Indomaret Jl. Sudirman',
    transaction_date: new Date().toISOString(),
    total_amount: 50000,
    currency: 'IDR',
    debit_account_id: null,
    credit_account_id: null,
    ai_recommendations: {},
    line_items: [],
    user_corrections: {},
    expires_at: new Date(Date.now() + 30 * 86400000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}
```

No production data in tests. All test data uses isolated `tenant_id = 'tenant-test-1'`.
