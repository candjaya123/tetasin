# Tumbuhin — Frontend Architecture

> **Document Purpose:** Defines ideal frontend engineering structure for both the Next.js Web Dashboard and Flutter Mobile App.
> **Who Should Read This:** Frontend engineers, Flutter developers, and UX engineers.
> **Why It Matters:** Prevents frontend complexity explosion as features grow.

---

## 1. Current Problems

### 1.1 Web (Next.js)

| Problem | Severity | Description |
|---|---|---|
| Direct Supabase calls in page components | 🔴 High | `promos/page.tsx` bypasses backend — no RBAC enforcement |
| Inconsistent data fetching — some pages use `fetch`, others use Supabase SDK | 🟡 Medium | No centralized API client |
| Business logic in page components | 🟡 Medium | Financial calculations in `page.tsx` should be in hooks |
| No loading/error boundary standardization | 🟡 Medium | Each page handles loading states differently |
| `tenant/page.tsx` is 22KB — massive god component | 🟡 Medium | Dashboard page does too much |

### 1.2 Flutter

| Problem | Severity | Description |
|---|---|---|
| State management not standardized (Zustand mentioned in docs but Flutter uses different tools) | 🟡 Medium | Doc references old React Native architecture |
| No feature module structure enforced | 🟡 Medium | Features mixed in flat directory |
| Direct HTTP calls potentially in screen files | 🟡 Medium | No clear repository pattern |

---

## 2. Ideal Structure — Web (Next.js)

### 2.1 App Router Structure

```
src/app/
├── (auth)/
│   ├── login/page.tsx
│   └── register/page.tsx
├── (marketing)/
│   └── page.tsx                    ← Landing page
├── admin/
│   ├── layout.tsx                  ← Admin auth check
│   └── tenants/page.tsx
└── tenant/
    ├── layout.tsx                  ← Main shell (sidebar, nav)
    ├── page.tsx                    ← Dashboard summary
    ├── pos/page.tsx
    ├── inventory/
    │   ├── page.tsx                ← Product list
    │   └── [id]/page.tsx           ← Product detail
    ├── orders/page.tsx
    ├── finance/
    │   ├── balance-sheet/page.tsx
    │   ├── cash-flow/page.tsx
    │   └── ledger/page.tsx
    ├── procurement/
    │   └── drafts/page.tsx
    ├── marketing/
    │   └── promos/page.tsx
    ├── settings/
    │   └── staff/page.tsx
    └── withdrawal/page.tsx
```

### 2.2 Component Architecture

```
src/components/
├── ui/                     ← Shadcn components (DO NOT MODIFY)
├── layout/
│   ├── Sidebar.tsx
│   ├── TopBar.tsx
│   ├── MobileNav.tsx
│   └── Shell.tsx           ← Main layout wrapper
├── common/
│   ├── DataTable.tsx       ← Reusable table with pagination
│   ├── PageHeader.tsx
│   ├── LoadingState.tsx
│   ├── ErrorState.tsx
│   └── EmptyState.tsx
├── finance/
│   ├── BalanceSheet.tsx
│   ├── CashFlowTable.tsx
│   └── LedgerTable.tsx
├── pos/
│   ├── ProductCatalog.tsx
│   ├── Cart.tsx
│   └── CheckoutModal.tsx
├── inventory/
│   ├── ProductForm.tsx
│   └── StockAdjustment.tsx
├── ai/
│   └── ChatWidget.tsx
└── forms/
    ├── SaleForm.tsx
    └── ProductForm.tsx
```

### 2.3 Data Fetching Pattern (Ideal)

**Rule:** All data fetching goes through `/lib/api/` — NEVER directly from Supabase.

```typescript
// lib/api/client.ts — Centralized API client
import { getSession } from '@/lib/auth';

export async function apiGet<T>(path: string, params?: Record<string, string>): Promise<T> {
  const { token } = await getSession();
  const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}${path}`);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  if (!res.ok) throw await res.json();
  const { data } = await res.json();
  return data;
}

// lib/api/sales.ts
export const getSales = (params) => apiGet('/api/v1/sales', params);
export const createSale = (dto) => apiPost('/api/v1/sales', dto);

// hooks/useSales.ts — Data fetching hook
export function useSales(params: SalesQueryParams) {
  return useQuery({
    queryKey: ['sales', params],
    queryFn: () => getSales(params),
  });
}

// app/tenant/pos/page.tsx — Page component (thin layer)
export default function POSPage() {
  const { data: products } = useProducts();
  return <POSInterface products={products} />;
}
```

### 2.4 State Management

| State Type | Tool | Examples |
|---|---|---|
| Server state (async data) | React Query / SWR | Products list, transaction history |
| UI state (local) | `useState` / `useReducer` | Modal open/close, form values |
| Global client state | Zustand | Auth session, cart contents |

**No mixing:** Server state must not be stored in Zustand. UI state must not be in React Query.

### 2.5 Error Boundary Pattern

```typescript
// Every page must be wrapped in error boundary + suspense
'use client';
import { ErrorBoundary } from 'react-error-boundary';
import { Suspense } from 'react';

export default function InventoryPage() {
  return (
    <ErrorBoundary fallback={<ErrorState />}>
      <Suspense fallback={<LoadingState />}>
        <InventoryContent />
      </Suspense>
    </ErrorBoundary>
  );
}
```

---

## 3. Ideal Structure — Flutter Mobile

### 3.1 Feature Module Structure

```
lib/
├── core/
│   ├── router/
│   │   └── app_router.dart         ← go_router configuration
│   ├── theme/
│   │   ├── app_colors.dart
│   │   ├── app_typography.dart
│   │   └── app_theme.dart
│   ├── network/
│   │   └── api_client.dart         ← Dio client with auth interceptor
│   └── config/
│       └── app_config.dart
├── features/
│   ├── auth/
│   │   ├── data/
│   │   │   ├── auth_service.dart
│   │   │   └── auth_model.dart
│   │   ├── domain/
│   │   │   └── user_entity.dart
│   │   └── presentation/
│   │       ├── screens/
│   │       │   └── login_screen.dart
│   │       └── providers/
│   │           └── auth_provider.dart
│   ├── pos/
│   ├── inventory/
│   ├── reports/
│   ├── orders/
│   └── settings/
└── shared/
    ├── widgets/
    │   ├── loading_widget.dart
    │   ├── error_widget.dart
    │   └── empty_state_widget.dart
    └── utils/
        ├── currency_formatter.dart
        └── date_formatter.dart
```

### 3.2 Data Flow Pattern

```dart
// api_client.dart — Single Dio instance with auth interceptor
class ApiClient {
  late final Dio _dio;
  
  ApiClient() {
    _dio = Dio(BaseOptions(baseUrl: AppConfig.apiBaseUrl));
    _dio.interceptors.add(AuthInterceptor());
  }
  
  Future<T> get<T>(String path, {Map<String, dynamic>? queryParams}) async { ... }
  Future<T> post<T>(String path, dynamic data) async { ... }
}

// Feature service
class SalesService {
  final ApiClient _client;
  Future<SaleResult> createSale(CreateSaleRequest request) async {
    return _client.post<SaleResult>('/api/v1/sales', request.toJson());
  }
}

// Provider (Riverpod)
final salesProvider = StateNotifierProvider<SalesNotifier, SalesState>((ref) {
  return SalesNotifier(ref.read(salesServiceProvider));
});

// Screen
class POSScreen extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final salesState = ref.watch(salesProvider);
    return POSLayout(onCheckout: (cart) => ref.read(salesProvider.notifier).checkout(cart));
  }
}
```

---

## 4. Responsive Strategy

### Web
- Mobile: < 768px — Stack layout, bottom nav
- Tablet: 768–1024px — Collapsible sidebar
- Desktop: > 1024px — Full sidebar + content area

### Mobile (Flutter)
- Phone portrait: Primary mode
- Phone landscape: POS mode (side-by-side catalog + cart)
- Tablet: Split view (sidebar + content)

---

## 5. Refactor Direction

1. **Web: Migrate `promos/page.tsx`** to use `apiGet('/api/v1/promo')` instead of Supabase
2. **Web: Break up `tenant/page.tsx`** (22KB) into smaller components
3. **Web: Centralize API client** — create `lib/api/client.ts` used by all pages
4. **Flutter: Implement feature module structure** for all 10 features
5. **Both: Standardize error and loading states** with shared components

---

## 6. Long-Term Recommendations

| Recommendation | Rationale |
|---|---|
| Micro-frontend architecture for admin panel | Independent deployment of admin vs tenant dashboard |
| Flutter web support | Single Flutter codebase for mobile + web kiosk POS |
| Offline-first POS in Flutter | IndexedDB/Hive for offline sale queuing |
| Design system documentation (Storybook) | Shared component library with visual tests |
| Server Components for report pages | Zero client-side bundle for read-heavy pages |
