# Tumbuhin — Backend Architecture

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
│   ├── AuthModule          ← JWT, Guards, Decorators
│   ├── DatabaseModule      ← UnitOfWork, SupabaseClient
│   ├── EventModule         ← EventBusService, BullMQ
│   ├── AiModule            ← GeminiProvider
│   └── LoggerModule        ← nestjs-pino
├── SalesModule
│   └── depends: AccountingModule, InventoryModule, PromoModule (via events)
├── AccountingModule
│   └── depends: DatabaseModule
├── InventoryModule
│   └── depends: DatabaseModule, WarehouseModule
├── ReceiptModule
│   └── depends: CoreModule (GeminiProvider, EventBus), AccountingModule (approval only)
├── ReportModule
│   └── depends: AccountingModule, SalesModule (read-only)
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

// Usage in SalesService
async processSale(dto: CreateSaleDto, tenantId: string): Promise<SaleResponseDto> {
  return this.unitOfWork.runInTransaction(async (client) => {
    const transaction = await this.salesRepo.create(dto, client);
    await this.inventoryRepo.deductStock(dto.items, client);
    const journal = await this.accountingService.createJournalEntry(journalDto, client);
    return { transaction_id: transaction.id, journal_id: journal.id, status: 'committed' };
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
@Controller('finance')
@RequireTier(SubscriptionTier.BUSINESS)
export class FinanceController {

  @Get('balance-sheet')
  @RequireTier(SubscriptionTier.PRO)
  @Roles('manager')
  getBalanceSheet() { ... }
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
| `accounting` | `journal_entries`, `journal_lines`, `chart_of_accounts` | Products, inventory |
| `inventory` | `products`, `raw_materials`, `product_recipes` | Journal entries |
| `warehouse` | `warehouses`, `stock_transfers`, `stock_opnames` | Journal entries |
| `report` | Materialized views (`ledger_balances`, `monthly_profit_loss`) | Raw journal lines |
| `ai` | `business_memory` | Any write to business data |
| `receipt` | `receipt_scans`, `draft_transactions`, `merchant_mappings` | Delegates journal creation to `accounting` on approval only |
| `procurement` | `purchase_orders`, `sales_orders`, `procurement_drafts` | Journal entries (delegates to accounting) |
