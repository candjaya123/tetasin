# Tumbuhin — Frontend Architecture

> **Document Purpose:** Defines the structure, patterns, and standards for both the Next.js web dashboard and the Flutter mobile application.
> **Who Should Read This:** Frontend engineers, mobile engineers, and AI coding assistants.

---

## 1. Web Frontend (Next.js 14)

### 1.1 Directory Structure

```
web/src/
├── app/
│   ├── (auth)/                     ← Auth-gated routes group
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (marketing)/                ← Public landing/marketing pages
│   │   ├── page.tsx
│   │   └── pricing/page.tsx
│   ├── admin/                      ← Super admin portal
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── tenant/                     ← Tenant dashboard
│   │   ├── layout.tsx              ← Shared sidebar + nav
│   │   ├── page.tsx                ← Dashboard overview
│   │   ├── pos/page.tsx
│   │   ├── inventory/
│   │   ├── finance/
│   │   ├── orders/
│   │   ├── procurement/
│   │   ├── receipt/
│   │   │   ├── page.tsx            ← Draft list dashboard
│   │   │   ├── scan/page.tsx       ← Upload / camera capture
│   │   │   ├── manual/page.tsx     ← Manual expense entry
│   │   │   └── [id]/page.tsx       ← Draft review + approval
│   │   ├── promos/
│   │   ├── staff/
│   │   ├── settings/
│   │   └── subscription/
│   └── api/                        ← Next.js API Routes (proxy only)
├── components/
│   ├── ui/                         ← Shadcn/UI base components (READ ONLY)
│   ├── common/                     ← App-wide layout: Sidebar, Header, ErrorBoundary
│   ├── [feature]/                  ← Feature-specific components
│   └── forms/                      ← Shared form controls
├── hooks/                          ← Custom React Query hooks
│   ├── use-sales.ts
│   ├── use-inventory.ts
│   ├── use-receipt.ts
│   └── use-toast.ts
├── lib/
│   ├── api/                        ← Centralized API service functions
│   │   ├── client.ts               ← Fetch wrapper with auth headers
│   │   ├── salesService.ts
│   │   ├── inventoryService.ts
│   │   ├── receiptService.ts
│   │   └── reportService.ts
│   ├── utils/                      ← Pure utility functions
│   └── constants/                  ← App-wide constants
└── types/                          ← TypeScript type definitions
```

### 1.2 Data Fetching Rules

```typescript
// ALL data fetching goes through /lib/api/ — NEVER directly to Supabase

// lib/api/client.ts — centralized API wrapper
async function apiGet<T>(path: string): Promise<ApiResponse<T>> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const response = await fetch(`${BACKEND_URL}${path}`, {
    headers: {
      'Authorization': `Bearer ${session?.access_token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const err = await response.json();
    throw new ApiError(err.error?.code, err.error?.message);
  }
  return response.json();
}

// Feature service file
// lib/api/receiptService.ts
export const receiptService = {
  getDrafts: () => apiGet<DraftTransaction[]>('/api/v1/receipt/drafts'),
  getDraft: (id: string) => apiGet<DraftTransaction>(`/api/v1/receipt/drafts/${id}`),
  approveDraft: (id: string) => apiPost(`/api/v1/receipt/drafts/${id}/approve`, {}),
};
```

### 1.3 State Management

| Type of State | Solution |
|---|---|
| Server state (API data) | React Query (`useQuery`, `useMutation`) |
| UI state (toggles, modals) | `useState` / `useReducer` |
| Global client state | Zustand store |
| Auth session | Supabase Auth context |

### 1.4 Page Component Pattern

```tsx
// Every page: thin wrapper, delegates to hooks + components
// app/tenant/receipt/page.tsx
export default function ReceiptDashboardPage() {
  const { data: drafts, isLoading, error } = useDrafts();

  if (isLoading) return <ReceiptSkeleton />;
  if (error) return <ErrorBoundary error={error} />;

  return <ReceiptDashboard drafts={drafts} />;
}

// Component handles all presentation
// components/receipt/ReceiptDashboard.tsx
export function ReceiptDashboard({ drafts }: { drafts: DraftTransaction[] }) {
  return (
    <div>
      <ReceiptStats drafts={drafts} />
      <ReceiptTable drafts={drafts} />
    </div>
  );
}
```

---

## 2. Flutter Mobile App

### 2.1 Directory Structure

```
lib/
├── core/
│   ├── api/
│   │   ├── api_client.dart         ← Dio singleton with auth + error interceptors
│   │   ├── api_provider.dart       ← Riverpod provider for ApiClient
│   │   ├── auth_interceptor.dart   ← Attaches JWT to every request
│   │   └── error_interceptor.dart  ← Converts Dio errors to typed ApiException
│   ├── router/
│   │   └── app_router.dart         ← go_router configuration
│   └── theme/
│       ├── app_theme.dart
│       ├── app_colors.dart
│       └── responsive.dart
├── features/
│   ├── auth/
│   ├── pos/
│   ├── inventory/
│   ├── orders/
│   ├── promos/
│   ├── reports/
│   ├── receipt/                    ← OCR Receipt module
│   │   ├── data/
│   │   │   ├── receipt_service.dart
│   │   │   └── receipt_models.dart
│   │   └── presentation/
│   │       ├── screens/
│   │       │   ├── receipt_scan_screen.dart
│   │       │   ├── receipt_drafts_screen.dart
│   │       │   ├── manual_entry_screen.dart
│   │       │   └── draft_review_screen.dart
│   │       ├── widgets/
│   │       │   ├── confidence_indicator.dart
│   │       │   ├── ai_suggestion_chip.dart
│   │       │   └── receipt_preview.dart
│   │       └── providers/
│   │           └── receipt_provider.dart
│   ├── staff/
│   ├── settings/
│   ├── transactions/
│   └── ai/
└── shared/
    ├── widgets/
    │   ├── main_shell.dart         ← Bottom nav + AppBar shell
    │   └── [other shared widgets]
    ├── models/                     ← Shared data models
    ├── services/
    └── utils/
```

### 2.2 API Call Pattern

```dart
// Feature service — ALWAYS use ApiClient.dio
class ReceiptService {
  final ApiClient _client;
  ReceiptService(this._client);

  Future<List<DraftTransaction>> getDrafts() async {
    final response = await _client.dio.get('/api/v1/receipt/drafts');
    final List<dynamic> items = response.data['data'];
    return items.map((e) => DraftTransaction.fromJson(e)).toList();
  }

  Future<DraftTransaction> approveDraft(String id) async {
    final response = await _client.dio.post('/api/v1/receipt/drafts/$id/approve');
    return DraftTransaction.fromJson(response.data['data']);
  }
}
```

### 2.3 Riverpod State Pattern

```dart
// Provider definition
final receiptServiceProvider = Provider<ReceiptService>((ref) {
  return ReceiptService(ref.read(apiClientProvider));
});

final draftsProvider = FutureProvider.autoDispose<List<DraftTransaction>>((ref) {
  return ref.watch(receiptServiceProvider).getDrafts();
});

// Notifier for mutations
class DraftApprovalNotifier extends AsyncNotifier<void> {
  Future<void> approve(String draftId) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(
      () => ref.read(receiptServiceProvider).approveDraft(draftId),
    );
  }
}
```

### 2.4 Router Pattern (go_router)

```dart
// app_router.dart — all routes in single GoRouter config
GoRoute(
  path: '/receipt',
  builder: (ctx, state) => const ReceiptDraftsScreen(),
  routes: [
    GoRoute(
      path: 'scan',
      builder: (ctx, state) => const ReceiptScanScreen(),
    ),
    GoRoute(
      path: 'manual',
      builder: (ctx, state) => const ManualEntryScreen(),
    ),
    GoRoute(
      path: ':id',
      builder: (ctx, state) {
        final id = state.pathParameters['id']!;
        return DraftReviewScreen(draftId: id);
      },
    ),
  ],
),
```

---

## 3. Shared Standards

### 3.1 Error Handling

```typescript
// Web: Typed error boundary
function useDrafts() {
  return useQuery({
    queryKey: ['receipt', 'drafts'],
    queryFn: () => receiptService.getDrafts(),
    onError: (err: ApiError) => {
      if (err.code === 'TIER_RESTRICTION') {
        router.push('/tenant/subscription');
      }
    },
  });
}
```

```dart
// Flutter: Typed API exception
try {
  await receiptService.approveDraft(id);
} on ApiException catch (e) {
  if (e.code == 'MISSING_ACCOUNT_MAPPING') {
    // Show account picker
  }
}
```

### 3.2 Loading States

Every data-fetching screen must handle all three states:

```tsx
// Web
if (isLoading) return <SkeletonLoader />;
if (error) return <ErrorCard message={error.message} onRetry={refetch} />;
return <DataView data={data} />;
```

```dart
// Flutter
ref.watch(draftsProvider).when(
  loading: () => const LoadingIndicator(),
  error: (err, _) => ErrorView(onRetry: () => ref.invalidate(draftsProvider)),
  data: (drafts) => DraftListView(drafts: drafts),
);
```

### 3.3 Tier-Gated UI

```tsx
// Web: Show upgrade prompt instead of locked feature
function ReceiptScanPage() {
  const { tier } = useTenant();
  if (tier === 'starter') return <UpgradeBanner requiredTier="business" />;
  return <ReceiptScanView />;
}
```

```dart
// Flutter: Tier-aware navigation
void onScanPressed() {
  if (authState.tier == 'starter') {
    context.push('/subscription');
    return;
  }
  context.push('/receipt/scan');
}
```
