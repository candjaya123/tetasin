# Tumbuhin — Backend Architecture

> **Document Purpose:** Defines ideal backend engineering structure — service layer design, repository pattern, queue/background jobs, caching strategy, event-driven architecture, dependency injection, and domain boundaries.
> **Who Should Read This:** Backend engineers, architects, and AI coding assistants.
> **Why It Matters:** Supports scalability, maintainability, and clean separation of concerns.

---

## 1. Current Problems

| Problem | Severity | Description |
|---|---|---|
| Dual auth guard (`JwtAuthGuard` + `AuthGuard`) in AppModule | 🔴 High | Two guards applied to all routes — undefined behavior |
| `@Global()` on `AppModule` causes DI scope pollution | 🟡 Medium | Global providers from AppModule conflict with module-level providers |
| Some services directly import sibling module services | 🟡 Medium | Violates module isolation — creates circular dependency risk |
| Business logic in `AccountingService` also handles journal creation | 🟡 Medium | Fat service — should delegate to `JournalService` |
| No repository abstraction on some modules | 🟡 Medium | Direct Supabase queries in service layer |
| No retry/circuit breaker on external calls (Gemini, Midtrans) | 🟡 Medium | Single failure point |
| BullMQ worker runs in same process as API | 🟠 Low | CPU-bound jobs block API event loop |

---

## 2. Ideal Structure

### 2.1 Module Dependency Graph

```
AppModule
├── CoreModule (global)
│   ├── AuthModule          ← JWT, Guards, Decorators
│   ├── DatabaseModule      ← UnitOfWork, SupabaseClient
│   ├── EventModule         ← EventBusService, BullMQ
│   ├── AiModule            ← GeminiProvider
│   └── LoggerModule        ← Pino
├── SalesModule
│   └── depends: AccountingModule, InventoryModule, PromoModule (via events)
├── AccountingModule
│   └── depends: DatabaseModule
├── InventoryModule
│   └── depends: DatabaseModule, WarehouseModule
├── ReportModule
│   └── depends: AccountingModule, SalesModule (read-only)
├── AiModule (feature)
│   └── depends: CoreModule/AiModule, AccountingModule
└── [other domain modules]
```

### 2.2 Layered Architecture Per Module

```
HTTP Request
    │
    ▼
┌───────────────────────────────────────────────────────────────┐
│  Controller Layer (sales.controller.ts)                        │
│  - Parse request, call service, return response DTO           │
│  - No business logic. No DB access.                           │
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
│  - Returns raw data or domain entities                         │
│  - No business logic                                           │
└───────────────────────────────────────────────────────────────┘
    │
    ▼
┌───────────────────────────────────────────────────────────────┐
│  Database (Supabase / PostgreSQL)                              │
└───────────────────────────────────────────────────────────────┘
```

### 2.3 Repository Pattern

```typescript
// repositories/sales.repository.ts
@Injectable()
export class SalesRepository {
  constructor(private readonly supabase: SupabaseService) {}

  async findByTenant(tenantId: string, params: QueryParams): Promise<Transaction[]> {
    const { data, error } = await this.supabase.client
      .from('transactions')
      .select('*, sale_items(*)')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .range(params.from, params.to);
    
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async create(dto: CreateTransactionDto): Promise<Transaction> {
    const { data, error } = await this.supabase.client
      .from('transactions')
      .insert(dto)
      .select()
      .single();
    
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }
}
```

### 2.4 Unit of Work (ACID Transactions)

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
async processSale(dto: CreateSaleDto): Promise<SaleResponseDto> {
  return this.unitOfWork.runInTransaction(async (client) => {
    const transaction = await this.salesRepo.create(dto, client);
    await this.inventoryRepo.deductStock(dto.items, client);
    const journal = await this.accountingService.createJournalEntry(journalDto, client);
    return { transaction_id: transaction.id, journal_id: journal.id, status: 'committed' };
  });
}
```

### 2.5 Event-Driven Architecture

```typescript
// core/events/event-bus.service.ts
@Injectable()
export class EventBusService {
  constructor(
    @InjectQueue('event-processor-queue') private readonly queue: Queue,
  ) {}

  async emit(eventName: string, payload: Record<string, unknown>): Promise<void> {
    // 1. Persist to event_log (audit trail)
    await this.persistEvent(eventName, payload);
    // 2. Push to BullMQ for async processing
    await this.queue.add(eventName, payload, { attempts: 3, backoff: 1000 });
  }
}

// Domain events emitted:
// 'SaleCreated'        → Update analytics, send notification
// 'StockLow'           → Trigger procurement draft
// 'JournalPosted'      → Update materialized views
// 'TenantUpgraded'     → Unlock features, send welcome email
```

### 2.6 Background Jobs

| Job | Schedule | Description |
|---|---|---|
| `AnalyticsCronService` | Every hour | Refreshes `ledger_balances` and `monthly_profit_loss` materialized views |
| `ProcurementCronService` | Midnight | Scans low-stock products, creates procurement drafts |
| `InsightCronService` | Daily | Generates AI financial insights per tenant |
| `SubscriptionExpiryJob` | Daily | Checks subscription end dates, downgrades expired tenants |

### 2.7 Caching Strategy (Ideal)

```typescript
// Reports are expensive — cache with Redis TTL
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
    await this.redis.setEx(cacheKey, 3600, JSON.stringify(data)); // 1 hour TTL
    return data;
  }

  // Invalidate cache when new journal is posted
  async invalidateReportCache(tenantId: string): Promise<void> {
    await this.redis.del(`balance-sheet:${tenantId}`);
    await this.redis.del(`income-statement:${tenantId}`);
  }
}
```

### 2.8 Guard Chain

```typescript
// Correct auth configuration in AppModule:
providers: [
  {
    provide: APP_GUARD,
    useClass: JwtAuthGuard,   // Layer 1: JWT validation only
  },
  {
    provide: APP_GUARD,
    useClass: TierGuard,      // Layer 2: Subscription tier check
  },
  {
    provide: APP_GUARD,
    useClass: RoleGuard,      // Layer 3: RBAC
  },
],

// Usage on controllers/endpoints:
@Controller('finance')
@RequireTier(SubscriptionTier.BUSINESS)
export class FinanceController {
  
  @Get('balance-sheet')
  @RequireTier(SubscriptionTier.PRO)  // Override to Pro tier
  @Roles('manager')
  getBalanceSheet() { ... }
}
```

### 2.9 External Service Resilience

```typescript
// Wrap external calls with retry and timeout
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
          this.logger.warn({ err, attempt }, 'Gemini retry');
        },
      }
    );
  }
}
```

---

## 3. Domain Boundaries

| Module | Owns | Does NOT access |
|---|---|---|
| `sales` | `transactions`, `sale_items` | Journal entries directly |
| `accounting` | `journal_entries`, `journal_lines`, `chart_of_accounts` | Products, inventory |
| `inventory` | `products`, `raw_materials`, `product_recipes` | Journal entries |
| `warehouse` | `warehouses`, `stock_transfers`, `stock_opnames` | Journal entries |
| `report` | Materialized views (`ledger_balances`, `monthly_profit_loss`) | Raw journal lines |
| `ai` | `business_memory` | Any write to business data |
| `procurement` | `purchase_orders`, `sales_orders`, `procurement_drafts` | Journal entries (delegates to accounting) |

---

## 4. Refactor Direction

1. **Remove duplicate auth guard** — keep only `JwtAuthGuard`, remove old `AuthGuard`
2. **Move `@Global()` to `CoreModule`** only — `AppModule` should not be global
3. **Add Redis caching** for all report endpoints
4. **Extract BullMQ workers** to separate NestJS app (`backend-worker`)
5. **Add circuit breaker** (using `cockatiel` or similar) around Gemini and Midtrans calls
6. **Enforce module boundaries** via ESLint `import/no-restricted-paths` rules

---

## 5. Long-Term Recommendations

| Recommendation | Rationale |
|---|---|
| Extract `ai` module to microservice | AI workloads are independent, should scale separately |
| Add `@nestjs/throttler` per tenant | Prevent noisy-neighbor problem |
| Adopt **Database per service** when extracting modules | True microservice isolation |
| Implement **CQRS** with separate read/write DB | Report queries should hit read replica |
| Add **OpenTelemetry** tracing | Trace Gemini calls, DB queries, queue jobs end-to-end |
