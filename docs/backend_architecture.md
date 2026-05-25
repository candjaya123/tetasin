# Tetasin — Backend Architecture

> **Document Purpose:** Defines backend engineering structure — service layer, repository pattern, queue/background jobs, caching, event-driven architecture, dependency injection, and domain boundaries.
> **Who Should Read This:** Backend engineers, architects, and AI coding assistants.

---

## 1. Layered Architecture Per Module

```
HTTP Request
    │
    ▼
┌───────────────────────────────────────────────────────────────┐
│  Controller Layer (sales.controller.ts)                        │
│  - Parse request, validate DTO, call service, return DTO      │
│  - No business logic. No DB access. No if/else logic.         │
└───────────────────────────────────────────────────────────────┘
    │
    ▼
┌───────────────────────────────────────────────────────────────┐
│  Service Layer (sales.service.ts)                              │
│  - Orchestrate business workflow                               │
│  - Use UnitOfWork for ACID transactions                        │
│  - Emit domain events via EventBusService                      │
│  - Never access DB directly                                    │
└───────────────────────────────────────────────────────────────┘
    │
    ▼
┌───────────────────────────────────────────────────────────────┐
│  Repository Layer (sales.repository.ts)                        │
│  - Pure DB queries (SELECT, INSERT, UPDATE, DELETE)            │
│  - Returns typed domain entities                               │
│  - No business logic                                           │
└───────────────────────────────────────────────────────────────┘
    │
    ▼
┌───────────────────────────────────────────────────────────────┐
│  Database (Supabase / PostgreSQL)                              │
└───────────────────────────────────────────────────────────────┘
```

---

## 2. Module Dependency Graph

```
AppModule
├── CoreModule (global)
│   ├── AuthModule            ← JWT, Guards, Decorators
│   ├── DatabaseModule        ← UnitOfWork, SupabaseClient
│   ├── EventModule           ← EventBusService, BullMQ
│   ├── AiModule              ← GeminiProvider
│   └── LoggerModule          ← nestjs-pino
├── SalesModule               ← [BUSINESS ONLY]
│   └── depends: AccountingModule, InventoryModule, OrderModule, PromoModule (via events)
├── AccountingModule          ← [SHARED: personal + business]
│   ├── CoaSeedService        ← Seeds accounts on tenant creation (12 personal / 31 business)
│   └── depends: DatabaseModule
├── PersonalFinanceModule     ← [PERSONAL ONLY]
│   ├── PersonalFinanceService  ← income/expense/transfer journal creation
│   ├── BudgetService           ← personal_budgets CRUD + vs-actual calculation
│   ├── GoalService             ← financial_goals progress + achievement detection
│   ├── RecurringService        ← recurring_transactions trigger + next_due_date
│   └── depends: AccountingModule (journal creation), NotificationModule
├── OrderModule               ← [BUSINESS ONLY] Pesanan lifecycle, void flow
│   └── depends: AccountingModule (reversal journal on void)
├── TransactionsModule        ← [SHARED] Universal financial event log (read-only aggregator)
│   └── depends: AccountingModule, SalesModule, OrderModule (read-only joins)
├── InventoryModule           ← [BUSINESS ONLY]
│   ├── HppEngineService        ← Computes HPP per sale item (recipe or direct mode)
│   ├── RecipeService           ← CRUD for product_recipes (BOM)
│   └── depends: DatabaseModule, WarehouseModule
├── ReceiptModule             ← [BUSINESS ONLY]
│   └── depends: CoreModule (GeminiProvider, EventBus), AccountingModule (approval only)
├── ReportModule              ← [SHARED: adapted output per account_type]
│   └── depends: AccountingModule, SalesModule (read-only)
├── OnboardingModule          ← [SHARED]
│   └── depends: AccountingModule (CoaSeedService) — branches on account_type
├── BillModule                ← [SHARED: personal + business]
│   ├── BillService             ← bill CRUD, payment recording, status lifecycle
│   ├── BillReminderService     ← BullMQ cron: overdue detection + smart_alert insertion
│   └── depends: AccountingModule (journal on payment), NotificationModule
└── [other domain modules]
```

---

## 3. Repository Pattern

```typescript
// repositories/sales.repository.ts
@Injectable()
export class SalesRepository {
  constructor(private readonly supabase: SupabaseService) {}

  async findByTenant(tenantId: string, params: QueryParams): Promise<Transaction[]> {
    const { data, error } = await this.supabase.getClient()
      .from('transactions')
      .select('*, sale_items(*)')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .range(params.from, params.to);

    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async create(dto: CreateTransactionDto): Promise<Transaction> {
    const { data, error } = await this.supabase.getClient()
      .from('transactions')
      .insert(dto)
      .select()
      .single();

    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }
}
```

---

## 4. Unit of Work (ACID Transactions)

All financial writes — sales, journal entries, stock deductions, draft approvals — MUST use `UnitOfWork.runInTransaction()`.

```typescript
// core/database/unit-of-work.ts
@Injectable()
export class UnitOfWork {
  async runInTransaction<T>(work: (client: SupabaseClient) => Promise<T>): Promise<T> {
    const client = this.getTransactionClient();
    try {
      await client.rpc('begin_transaction');
      const result = await work(client);
      await client.rpc('commit_transaction');
      return result;
    } catch (error) {
      await client.rpc('rollback_transaction');
      throw error;
    }
  }
}

// Usage in SalesService — creates pesanan + transaction atomically
async processSale(dto: CreateSaleDto, tenantId: string): Promise<SaleResponseDto> {
  return this.unitOfWork.runInTransaction(async (client) => {
    // Step 1: Create Pesanan (sales_orders)
    const pesanan = await this.orderRepo.create({
      pesanan_number: await this.generatePesananNumber(tenantId, client),
      status: 'confirmed',
      source: 'pos',
      customer_name: dto.customer_name ?? 'Walk-in',
    }, client);

    // Step 2: Create Transaction linked to Pesanan
    const transaction = await this.salesRepo.create({
      ...dto, pesanan_id: pesanan.id, source_type: 'pos_sale', status: 'validating',
    }, client);

    // Step 3: Compute HPP + Deduct stock (HppEngine per item)
    const hppResults: HppResult[] = [];
    for (const item of dto.items) {
      const hpp = await this.hppEngine.calculate(item.product_id, item.quantity, client);
      hppResults.push(hpp);
      for (const deduction of hpp.deductions) {
        await this.rawMaterialRepo.deductStock(deduction.id, deduction.qty, client);
      }
    }

    // Step 4: Build + validate journal entries (see docs/accounting.md §2.1)
    const journal = await this.accountingService.createJournalEntry(journalDto, client);

    // Step 5: Commit both records
    await this.salesRepo.update(transaction.id, { status: 'committed', journal_id: journal.id }, client);
    await this.orderRepo.update(pesanan.id, { status: 'fulfilled', transaction_id: transaction.id }, client);

    return { transaction_id: transaction.id, pesanan_id: pesanan.id, journal_id: journal.id, status: 'committed' };
  });
}
```

---

## 5. Event-Driven Architecture

```typescript
// core/events/event-bus.service.ts
@Injectable()
export class EventBusService {
  constructor(
    @InjectQueue('event-processor-queue') private readonly queue: Queue,
  ) {}

  async emit(eventName: string, payload: Record<string, unknown>): Promise<void> {
    await this.persistEvent(eventName, payload);
    await this.queue.add(eventName, payload, { attempts: 3, backoff: 1000 });
  }
}
```

**Domain events emitted:**

| Event | Source | Consumers |
|---|---|---|
| `SaleCreated` | SalesService | Analytics, notification, cache invalidation |
| `PesananVoided` | OrderService | Reversal journal creation, cache invalidation |
| `PesananStatusChanged` | OrderService | Division notification (push to Stok/Dapur) |
| `StockLow` | InventoryService | Procurement draft generation |
| `JournalPosted` | AccountingService | Materialized view refresh |
| `TenantUpgraded` | SubscriptionService | Feature unlock, welcome email |
| `ReceiptScanned` | ReceiptScanProcessor | Analytics, user notification |
| `DraftApproved` | DraftTransactionService | Cache invalidation, merchant memory |
| `DraftRejected` | DraftTransactionService | Analytics |

---

## 6. Background Jobs

| Job | Schedule | Description |
|---|---|---|
| `AnalyticsCronService` | Every hour | Refreshes `ledger_balances` and `monthly_profit_loss` materialized views |
| `ProcurementCronService` | Midnight | Scans low-stock products, creates procurement drafts |
| `InsightCronService` | Daily | Generates AI financial insights per tenant |
| `SubscriptionExpiryJob` | Daily | Checks subscription end dates, downgrades expired tenants |
| `DraftExpiryJob` | Daily | Marks draft_transactions as 'expired' after 30 days |

---

## 7. Caching Strategy

```typescript
@Injectable()
export class ReportService {
  constructor(
    private readonly redis: RedisService,
    private readonly reportRepo: ReportRepository,
  ) {}

  async getBalanceSheet(tenantId: string): Promise<BalanceSheetDto> {
    const cacheKey = `balance-sheet:${tenantId}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const data = await this.reportRepo.getBalanceSheet(tenantId);
    await this.redis.setEx(cacheKey, 3600, JSON.stringify(data));
    return data;
  }
}
```

**Cache TTL strategy:**

| Data | Cache Key | TTL |
|---|---|---|
| Balance sheet | `balance-sheet:{tenantId}` | 1 hour |
| Income statement | `income-stmt:{tenantId}:{month}` | 1 hour |
| Product catalog | `products:{tenantId}` | 15 minutes |
| Chart of accounts | `coa:{tenantId}` | 4 hours |
| Tenant tier | `tenant:{tenantId}` | 30 minutes |
| Merchant memory | `merchant:{tenantId}:{name}` | 15 minutes |

---

## 8. Guard Chain

```typescript
// AppModule — exact registration order matters
providers: [
  { provide: APP_GUARD, useClass: JwtAuthGuard },   // Layer 1: JWT validation
  { provide: APP_GUARD, useClass: TierGuard },       // Layer 2: Subscription tier
  { provide: APP_GUARD, useClass: RoleGuard },       // Layer 3: RBAC
],

// Controller usage:
// Canonical tiers: SubscriptionTier.FREE | SubscriptionTier.PRO | SubscriptionTier.FRANCHISE
// ❌ Never use BUSINESS, STARTER, FULL, AI
@Controller('finance')
export class FinanceController {

  @Get('balance-sheet')
  @RequireTier(SubscriptionTier.PRO)   // Pro + Franchise
  @Roles('manager')
  getBalanceSheet() { ... }

  @Get('consolidated')
  @RequireTier(SubscriptionTier.FRANCHISE)  // Franchise only
  @Roles('manager')
  getConsolidatedReport() { ... }
}
```

---

## 9. External Service Resilience

```typescript
@Injectable()
export class GeminiProvider {
  async generateContent(prompt: string): Promise<string> {
    return retry(
      async () => {
        const result = await this.model.generateContent(prompt);
        return result.response.text();
      },
      {
        retries: 3,
        minTimeout: 1000,
        onRetry: (err, attempt) => {
          this.logger.warn({ err, attempt }, 'gemini retry');
        },
      }
    );
  }
}
```

---

## 10. Domain Boundaries

| Module | Owns | Does NOT access |
|---|---|---|
| `sales` | `transactions`, `sale_items` | Journal entries directly |
| `order` | `sales_orders` (pesanan), status transitions, void flow | Journal entries (delegates to `accounting`) |
| `transactions` | Read-only view joining `transactions` + `journal_entries` + `journal_lines` | Any writes |
| `accounting` | `journal_entries`, `journal_lines`, `chart_of_accounts`; `CoaSeedService` | Products, inventory |
| `onboarding` | Tenant setup flow | Journal entries directly (uses `accounting.CoaSeedService`) |
| `inventory` | `products`, `raw_materials`, `product_recipes`; `HppEngineService`; `RecipeService` | Journal entries directly |
| `warehouse` | `warehouses`, `stock_transfers`, `stock_opnames` | Journal entries |
| `report` | Materialized views (`ledger_balances`, `monthly_profit_loss`) | Raw journal lines |
| `ai` | `business_memory` | Any write to business data |
| `receipt` | `receipt_scans`, `draft_transactions`, `merchant_mappings` | Delegates journal creation to `accounting` on approval only |
| `procurement` | `purchase_orders`, `procurement_drafts` | `sales_orders` (owned by `order`); journal entries (delegates to `accounting`) |
| `personal-finance` | `personal_budgets`, `financial_goals`, `recurring_transactions` | Any business table; delegates journals to `accounting` |

---

## 11. Personal Account Backend

### 11.1 PersonalFinanceModule Structure

```
PersonalFinanceModule
  Controllers:
    PersonalEntryController   → POST /personal/income, /expense, /transfer
    PersonalSummaryController → GET  /personal/summary, /net-worth
    PersonalBudgetController  → GET/POST /personal/budgets
    PersonalGoalController    → GET/POST /personal/goals, PATCH /goals/:id/progress
    RecurringController       → CRUD /personal/recurring, PATCH /recurring/:id/trigger

  Services:
    PersonalFinanceService    → Wraps AccountingModule journal creation for personal flows
    BudgetService             → Upserts personal_budgets; computes vs-actual from journal_lines
    GoalService               → Tracks financial_goals progress; detects achievement
    RecurringService          → Computes next_due_date; auto-triggers via BullMQ cron

  Guards (applied at module/controller level):
    @PersonalOnly()           → All controllers in this module

  Domain Boundary (strict — NEVER cross):
    ✅ CAN read/write: journal_entries, journal_lines, chart_of_accounts, personal_budgets,
                       financial_goals, recurring_transactions, smart_alerts
    ❌ CANNOT touch:   products, raw_materials, product_recipes, sale_items,
                       sales_orders, purchase_orders, warehouses, transactions (POS)
```

### 11.2 AccountTypeGuard

```typescript
/**
 * @PersonalOnly()  — Applied at controller/module level for all /personal/* routes.
 * @BusinessOnly()  — Applied at controller/module level for POS, inventory, pesanan, etc.
 *
 * Both are thin wrappers around AccountTypeGuard with a fixed expectedType.
 */
@Injectable()
export class AccountTypeGuard implements CanActivate {
  constructor(private readonly expectedType: 'personal' | 'business') {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const profile = request.user; // injected by JwtAuthGuard

    if (profile.account_type !== this.expectedType) {
      const code = this.expectedType === 'personal'
        ? 'PERSONAL_ACCOUNT_ONLY'
        : 'BUSINESS_ACCOUNT_ONLY';
      throw new ForbiddenException({ code, message: `This endpoint requires account_type = '${this.expectedType}'` });
    }
    return true;
  }
}

// Usage:
@Controller('personal')
@UseGuards(JwtAuthGuard, new AccountTypeGuard('personal'))
export class PersonalEntryController { ... }

@Controller('pos')
@UseGuards(JwtAuthGuard, new AccountTypeGuard('business'))
export class SalesController { ... }
```

### 11.3 TierGuard for Personal Limits

```typescript
// TierGuard reads profile.tenant.tier and enforces limits per account_type track:
Personal Free ('free'):
  - income/expense entries: max 100 per month → TRANSACTION_LIMIT (422)
  - active goals: max 2 → TIER_LIMIT_EXCEEDED (403)
  - budget categories: max 3 → TIER_LIMIT_EXCEEDED (403)
  - recurring_transactions: blocked → RECURRING_PREMIUM_REQUIRED (403)

Personal Premium ('premium'):
  - No limits on entries, goals, or budgets
  - Recurring transactions: allowed
  - Export to CSV/PDF: allowed

// NEVER apply business limits (POS count, staff count) to personal accounts.
// NEVER apply personal limits (goal count, budget count) to business accounts.
```

### 11.4 Immutable account_type Enforcement

```typescript
// In OnboardingService / ProfileService — any PATCH that targets account_type:
if (dto.account_type && dto.account_type !== profile.account_type) {
  throw new ConflictException({ code: 'ACCOUNT_TYPE_IMMUTABLE',
    message: 'account_type cannot be changed after registration.' });
}

// In handle_new_user() Supabase DB function:
-- account_type set ONCE from raw_user_meta_data->>'account_type'
-- No UPDATE path exists in the DB trigger or any RPC
```

---

## 12. Bill Tracker & Reminder Backend

### 12.1 BillModule Structure

```
BillModule
  Controllers:
    BillController      → CRUD /bills, GET /bills/summary
    BillPayController   → POST /bills/:id/pay, GET /bills/:id/payments

  Services:
    BillService         → Core bill lifecycle management
      .create()         → INSERT bill + optional bill_created journal
      .recordPayment()  → INSERT bill_payment + INSERT journal_entry (ACID)
      .cancel()         → UPDATE status + void bill_created journal
      .getSummary()     → Aggregate hutang/piutang outstanding totals

    BillReminderService → BullMQ cron (daily 01:00 WIB)
      .markOverdue()    → UPDATE bills SET status = 'overdue' where due_date < today
      .sendReminders()  → INSERT smart_alerts for bills matching reminder_days

  Guards:
    JwtAuthGuard   → all routes
    TierGuard      → enforces free tier limits (10 active bills, locked reminder_days)
    NO AccountTypeGuard  → this module is available to BOTH personal and business

  Domain Boundary:
    ✅ CAN read/write: bills, bill_payments, journal_entries, journal_lines, smart_alerts
    ❌ CANNOT touch:  products, raw_materials, sales_orders (business-only modules)
    ✅ Delegates journal creation to AccountingModule (never writes journal tables directly)
```

### 12.2 Auto-Journal on Payment Logic

```typescript
// BillService.recordPayment() — determines journal accounts based on account_type + bill_type
async function resolveJournalAccounts(bill: Bill, tenantAccountType: string) {
  if (tenantAccountType === 'business') {
    return bill.bill_type === 'hutang'
      ? { debit: bill.coa_account_id,      credit: bill.payment_account_id } // Hutang Usaha dr, Kas cr
      : { debit: bill.payment_account_id,  credit: bill.coa_account_id };    // Kas dr, Piutang Usaha cr
  } else {
    // personal
    return bill.bill_type === 'hutang'
      ? { debit: bill.coa_account_id,      credit: bill.payment_account_id } // Hutang/Cicilan dr, ASET cr
      : { debit: bill.payment_account_id,  credit: bill.coa_account_id };    // ASET dr, Pendapatan cr
  }
}
// journal_entry reference_type = 'bill_paid'
// After journal committed: UPDATE bills SET amount_paid += payment.amount
// Auto-compute new status: 'partial' or 'paid'
```

### 12.3 BullMQ Cron Job

```typescript
// Registered in BillReminderService using @nestjs/bull or BullMQ
@Processor('bill-reminder')
export class BillReminderProcessor {
  @Process('daily-check')
  async run() {
    // Step 1: Mark overdue
    await this.billRepo.markOverdue();
    // Step 2: Send reminder alerts for bills matching reminder_days
    const dueBills = await this.billRepo.findUpcoming();
    for (const bill of dueBills) {
      const daysUntilDue = differenceInDays(bill.due_date, today);
      if (bill.reminder_days.includes(daysUntilDue)) {
        await this.notificationService.insertSmartAlert({
          tenant_id: bill.tenant_id,
          alert_type: 'bill_due',
          reference_id: bill.id,
          message: `${bill.title} jatuh tempo dalam ${daysUntilDue} hari`,
        });
      }
    }
  }
}
```
