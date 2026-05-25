# Tetasin — Frontend Architecture

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
│   │   │   ├── page.tsx                ← Product list
│   │   │   ├── [id]/page.tsx           ← Product detail + Recipe tab
│   │   │   ├── [id]/recipe/page.tsx    ← Recipe builder + HPP preview card
│   │   │   └── raw-materials/
│   │   │       ├── page.tsx            ← Bahan Baku list with stock + unit_price
│   │   │       └── [id]/page.tsx       ← Bahan Baku detail + recipe usages
│   │   ├── transaksi/              ← Universal financial event log
│   │   │   ├── page.tsx            ← Full transaction list (all source_types)
│   │   │   └── [id]/page.tsx       ← Detail: source + pesanan + journal lines
│   │   ├── pesanan/                ← Cross-division order management
│   │   │   ├── page.tsx            ← Pesanan list with status filter tabs
│   │   │   └── [id]/page.tsx       ← Detail + division notes + status actions
│   │   ├── finance/
│   │   ├── accounting/
│   │   │   ├── coa/page.tsx        ← Chart of Accounts manager
│   │   │   └── journal/page.tsx    ← Manual journal entry form
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
│   ├── use-transaksi.ts            ← Universal transaction log hooks
│   ├── use-pesanan.ts              ← Pesanan status + detail hooks
│   ├── use-inventory.ts
│   ├── use-receipt.ts
│   └── use-toast.ts
├── components/
│   ├── inventory/
│   │   ├── BahanBakuTable.tsx      ← List with unit, unit_price, stock, reorder alert
│   │   ├── BahanBakuForm.tsx        ← Create/edit: name, unit, unit_price, COA picker
│   │   ├── RecipeBuilder.tsx        ← Ingredient rows + quantity_needed editor
│   │   ├── HppPreviewCard.tsx       ← Per-ingredient cost table + gross margin %
│   │   └── HppModeBadge.tsx         ← Recipe 🧪 / Direct 💰 / None ⬜ badge
│   ├── transaksi/
│   │   ├── TransaksiTable.tsx      ← Unified log with source_type badges
│   │   ├── JournalLinesDrawer.tsx  ← Slide-out showing debit/credit pairs
│   │   └── SourceBadge.tsx         ← Color-coded badge per source_type
│   ├── pesanan/
│   │   ├── PesananTable.tsx        ← Status-filtered table
│   │   ├── PesananStatusStepper.tsx← Visual status progression
│   │   └── DivisionNotesPanel.tsx  ← Per-division notes display
│   └── accounting/
│       ├── CoaTable.tsx            ← COA list with kategori color coding
│       ├── AddAccountModal.tsx     ← form: code + name + kategori picker (6 options)
│       └── ManualJournalForm.tsx   ← Line-by-line debit/credit with balance indicator
├── lib/
│   ├── api/                        ← Centralized API service functions
│   │   ├── client.ts               ← Fetch wrapper with auth headers
│   │   ├── salesService.ts
│   │   ├── transactionService.ts   ← getTransactions(), getTransaction(id)
│   │   ├── orderService.ts         ← getOrders(), updateStatus(), voidOrder()
│   │   ├── accountingService.ts    ← getCoa(), createAccount(), getJournals(), createJournal()
│   │   ├── inventoryService.ts     ← products, raw-materials, recipes, hpp-preview
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
│   ├── transaksi/                  ← Universal financial event log (replaces 'expenses')
│   │   ├── data/
│   │   │   ├── transaction_service.dart   ← GET /api/v1/transactions
│   │   │   └── transaction_models.dart    ← Transaction, JournalLine, SourceType enum
│   │   └── presentation/
│   │       ├── screens/
│   │       │   ├── transaksi_list_screen.dart   ← Unified log with filter chips
│   │       │   └── transaksi_detail_screen.dart ← Source + pesanan + journal lines
│   │       ├── widgets/
│   │       │   ├── transaction_source_badge.dart ← Color badge per source_type
│   │       │   └── journal_lines_card.dart       ← Expandable debit/credit view
│   │       └── providers/
│   │           └── transaksi_provider.dart
│   ├── pesanan/                    ← Cross-division order management (NEW)
│   │   ├── data/
│   │   │   ├── pesanan_service.dart       ← GET/PATCH /api/v1/orders
│   │   │   └── pesanan_models.dart        ← Pesanan, PesananStatus enum (9 states)
│   │   └── presentation/
│   │       ├── screens/
│   │       │   ├── pesanan_list_screen.dart    ← Tab bar per status group
│   │       │   └── pesanan_detail_screen.dart  ← Division notes + status action btn
│   │       ├── widgets/
│   │       │   ├── pesanan_status_chip.dart
│   │       │   ├── division_notes_panel.dart
│   │       │   └── status_action_button.dart   ← Role-gated status update button
│   │       └── providers/
│   │           └── pesanan_provider.dart
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
│   └── ai/
└── shared/
    ├── widgets/
    │   ├── main_shell.dart         ← Bottom nav + AppBar shell
    │   └── [other shared widgets]
    ├── models/                     ← Shared data models
    ├── services/
    └── utils/
```

### 2.2 Tab Layout (Business Users)

```
Bottom Navigation Tabs:
┌──────────┬──────────┬────────────┬──────────┐
│  Kasir   │   Stok   │ Transaksi  │ Keuangan │
│  /pos    │/inventory│/transaksi  │ /reports │
└──────────┴──────────┴────────────┴──────────┘
```

- **Kasir** (`/pos`) — Point of Sale, barcode scanning, checkout. Post-checkout shows Pesanan card.
- **Stok** (`/inventory`) — Inventory management, products, stock transfers. Pesanan accessible via drawer.
- **Transaksi** (`/transaksi`) — **Universal financial event log**: POS sales, expenses, OCR approvals, PO fulfillments, stock adjustments. Each row links to its journal entry with debit/credit lines.
- **Keuangan** (`/reports`) — Financial overview, income statement, balance sheet (Pro/Franchise tier, manager only)

Personal account users see a simplified tab layout: Ringkasan, Transaksi, Anggaran.

**Pesanan access points:**
- Post-POS checkout card → tap to view pesanan detail
- Stok role: side drawer shortcut to pending pesanan
- Deep link from push notification on status change
- Manager: sidebar menu item `/pesanan`

**Riverpod providers for new modules:**
```dart
// Transaksi
final transactionListProvider =
  FutureProvider.family<List<Transaction>, TransactionFilter>((ref, filter) {
    return ref.read(transactionServiceProvider).getAll(filter);
  });

final transactionDetailProvider =
  FutureProvider.family<TransactionDetail, String>((ref, id) {
    return ref.read(transactionServiceProvider).getById(id);
  });

// Pesanan
final pesananListProvider =
  FutureProvider.family<List<Pesanan>, PesananFilter>((ref, filter) {
    return ref.read(pesananServiceProvider).getAll(filter);
  });

class UpdatePesananStatusNotifier extends AsyncNotifier<void> {
  Future<void> update(String id, PesananStatus status, String? note) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() =>
      ref.read(pesananServiceProvider).updateStatus(id, status, note));
    ref.invalidate(pesananListProvider);
  }
}
```

### 2.3 API Call Pattern

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

### 2.4 Riverpod State Pattern

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

### 2.5 Router Pattern (go_router)

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
// Canonical tiers: 'free' | 'pro' | 'franchise'
function ReceiptScanPage() {
  const { tier } = useTenant();
  if (tier === 'free') return <UpgradeBanner requiredTier="pro" />;
  return <ReceiptScanView />;
}
```

```dart
// Flutter: Tier-aware navigation
// Canonical tiers: 'free' | 'premium' (personal) | 'pro' | 'franchise' (business)
// NEVER use 'starter','business','full'
void onScanPressed() {
  if (authState.tier == 'free') {
    context.push('/subscription');
    return;
  }
  context.push('/receipt/scan');
}
```

---

## 8. Personal Account Frontend

> Personal accounts have a completely separate UI surface from business accounts. Route access is enforced at the **Next.js middleware layer** (server-side), not client-side, to prevent any unauthorized rendering.

### 8.1 Route Structure

```
web/src/app/tenant/
├── (business)/                       ← Route group: only for account_type = 'business'
│   ├── pos/page.tsx                  ← POS terminal
│   ├── inventory/
│   │   ├── page.tsx                  ← Product list
│   │   ├── [id]/page.tsx             ← Product detail + Recipe tab + HPP preview
│   │   └── raw-materials/page.tsx    ← Bahan baku list + unit_price + stock
│   ├── pesanan/page.tsx              ← Cross-division order management
│   ├── procurement/page.tsx          ← Purchase orders
│   └── staff/page.tsx                ← Staff management
│
├── (personal)/                       ← Route group: only for account_type = 'personal'
│   ├── page.tsx                      ← Personal dashboard: net worth + monthly summary
│   ├── income/page.tsx               ← Record income form
│   ├── expense/page.tsx              ← Record expense form
│   ├── transfer/page.tsx             ← Move money between own accounts
│   ├── budgets/page.tsx              ← Budget manager: set limits + progress bars
│   ├── goals/
│   │   ├── page.tsx                  ← Goals list with progress rings
│   │   └── [id]/page.tsx             ← Goal detail + add setoran
│   └── recurring/page.tsx            ← Recurring transactions (premium gate)
│
└── (shared)/                         ← Both account types
    ├── transaksi/page.tsx            ← Universal financial event log
    ├── accounting/
    │   ├── coa/page.tsx              ← Chart of Accounts manager
    │   └── journal/page.tsx          ← Manual journal entry
    ├── finance/page.tsx              ← Reports (labels adapted per account_type)
    ├── settings/page.tsx
    └── subscription/page.tsx
```

### 8.2 Middleware Guard (middleware.ts)

```typescript
// Runs server-side on EVERY request — enforces account_type separation at the edge
// account_type is read from the JWT claim (set once at registration, immutable)

const BUSINESS_ONLY_PREFIXES = [
  '/tenant/pos', '/tenant/inventory', '/tenant/pesanan',
  '/tenant/procurement', '/tenant/staff',
];
const PERSONAL_ONLY_PREFIXES = [
  '/tenant/income', '/tenant/expense', '/tenant/transfer',
  '/tenant/budgets', '/tenant/goals', '/tenant/recurring',
];

export function middleware(request: NextRequest) {
  const accountType = getAccountTypeFromJWT(request); // reads JWT claim

  if (!accountType) return NextResponse.redirect('/login');

  // Block personal users from business routes
  if (accountType === 'personal') {
    const isBusinessRoute = BUSINESS_ONLY_PREFIXES.some(p => request.nextUrl.pathname.startsWith(p));
    if (isBusinessRoute) return NextResponse.redirect('/tenant'); // personal dashboard
  }

  // Block business users from personal routes
  if (accountType === 'business') {
    const isPersonalRoute = PERSONAL_ONLY_PREFIXES.some(p => request.nextUrl.pathname.startsWith(p));
    if (isPersonalRoute) return NextResponse.redirect('/tenant'); // business dashboard
  }

  return NextResponse.next();
}
```

### 8.3 Personal-Only Components

```
web/src/components/personal/
├── NetWorthCard.tsx          ← Primary KPI: Total Aset − Total Hutang = Kekayaan Bersih
│                                Real-time, updates after every journal commit
├── MonthlySummaryChart.tsx   ← Bar chart: Pemasukan vs Pengeluaran per month
├── BudgetProgressBar.tsx     ← Per category: spent / limit with color-coded status
│                                green (on_track) | yellow (warning ≥80%) | red (over_budget)
├── GoalProgressRing.tsx      ← Circular SVG ring: % achieved + days remaining label
├── IncomeExpenseForm.tsx     ← Unified form with direction toggle (Pemasukan / Pengeluaran)
│                                COA account picker filtered to PENDAPATAN or BEBAN accounts
├── TransferForm.tsx          ← Source → Destination picker (ASET accounts only)
├── RecurringCard.tsx         ← Recurring item row + "Catat Sekarang" button
│                                Disabled + PremiumGate overlay for free tier users
└── PremiumGate.tsx           ← Blurred overlay with upgrade CTA for premium-only features
                                 Props: featureName, requiredTier='premium'
```

### 8.4 Shared Finance Page (adapted labels per account_type)

```typescript
// /tenant/finance/page.tsx — shared by both account types
// Labels and report types change based on account_type

const PERSONAL_REPORTS = [
  { id: 'ringkasan', label: 'Ringkasan Bulanan' },   // Monthly summary
  { id: 'net-worth', label: 'Kekayaan Bersih' },     // Net worth
  { id: 'arus-kas',  label: 'Arus Kas' },            // Cash flow
];

const BUSINESS_REPORTS = [
  { id: 'laba-rugi',   label: 'Laporan Laba Rugi' }, // Income statement
  { id: 'neraca',      label: 'Neraca' },             // Balance sheet
  { id: 'arus-kas',    label: 'Arus Kas' },
  { id: 'trial-balance', label: 'Neraca Saldo' },
];

// Component selects report list based on profile.account_type
const reports = accountType === 'personal' ? PERSONAL_REPORTS : BUSINESS_REPORTS;
```

### 8.5 Flutter Mobile — Personal Mode

```dart
// lib/features/personal/
├── dashboard/
│   ├── personal_dashboard_page.dart    ← Net worth card + monthly bar chart
│   └── personal_dashboard_cubit.dart
├── entry/
│   ├── income_entry_page.dart          ← Catat Pemasukan form
│   ├── expense_entry_page.dart         ← Catat Pengeluaran form
│   └── entry_cubit.dart
├── budgets/
│   ├── budget_list_page.dart           ← Budget list with progress bars
│   └── budget_cubit.dart
├── goals/
│   ├── goals_list_page.dart            ← Goals with circular progress rings
│   ├── goal_detail_page.dart           ← Detail + setoran form
│   └── goals_cubit.dart
└── recurring/
    ├── recurring_list_page.dart         ← Recurring items (premium gate)
    └── recurring_cubit.dart

// Flutter route guard (in router.dart):
// Reads authCubit.state.accountType — redirects away from wrong routes
GoRoute(
  path: '/pos',
  redirect: (ctx, state) =>
    authCubit.state.accountType == 'personal' ? '/personal' : null,
),
GoRoute(
  path: '/personal',
  redirect: (ctx, state) =>
    authCubit.state.accountType == 'business' ? '/dashboard' : null,
),

// Flutter tier-aware navigation for premium features:
void onRecurringPressed(BuildContext context) {
  final tier = context.read<AuthCubit>().state.tier;
  if (tier != 'premium') {
    showPremiumUpgradeSheet(context, feature: 'Transaksi Berulang');
    return;
  }
  context.push('/personal/recurring');
}
```

---

## 9. Bill Tracker & Reminder Frontend (Personal + Business)

> Bill Tracker is a **shared** UI surface — the same pages and components are used for both account types. The only differences are the default COA account suggestions (pre-filled based on `account_type`) and tier gates on specific features (custom reminder days, photo attachment).

### 9.1 Route Structure

```
web/src/app/tenant/
├── (shared)/
│   └── bills/
│       ├── page.tsx              ← Bills list: tabs for Hutang / Piutang / Semua
│       │                            Overdue bills pinned at top with red badge
│       ├── new/page.tsx          ← Create bill form
│       └── [id]/page.tsx         ← Bill detail: info + payment history + "Bayar" button
```

> Added to `(shared)/` because both `account_type = 'personal'` and `account_type = 'business'` access `/tenant/bills`. No route guard needed here — route is open to both.

### 9.2 Components

```
web/src/components/bills/
├── BillListTabs.tsx          ← Tabs: Hutang | Piutang | Semua | Jatuh Tempo
│                                Each tab shows filtered + sorted bills
├── BillCard.tsx              ← Single bill row:
│                                [type badge] [title] [contact] [amount] [due_date] [status badge]
│                                Status colors: pending=blue, partial=yellow, overdue=red, paid=green
├── OverdueBanner.tsx         ← Sticky top banner: "X tagihan sudah jatuh tempo"
│                                Click → filter list to overdue only
├── BillForm.tsx              ← Create/edit form with:
│                                - bill_type toggle (Hutang / Piutang)
│                                - COA account picker (pre-suggested per account_type + bill_type)
│                                - reminder_days multi-select (PremiumGate for custom values)
│                                - photo upload (PremiumGate for free tier)
├── BillDetailCard.tsx        ← Bill detail: progress bar (amount_paid / amount), remaining
├── PaymentSheet.tsx          ← Bottom sheet / modal: amount input + payment_account picker
│                                Shows remaining balance + warns if amount > remaining
├── PaymentHistoryList.tsx    ← Accordion list of bill_payments with journal link
├── BillSummaryWidget.tsx     ← Dashboard widget: "Hutang Rp X | Piutang Rp Y"
│                                Clickable → /tenant/bills with filter pre-applied
└── BillStatusBadge.tsx       ← Color-coded status pill: pending|partial|paid|overdue|cancelled
```

### 9.3 Dashboard Widget Placement

```
Business Dashboard (/tenant/page.tsx):
  ├── Revenue Card
  ├── HPP Card
  ├── BillSummaryWidget  ← Shows outstanding hutang/piutang totals
  └── Smart Alerts feed  ← Includes bill_due + bill_overdue alerts

Personal Dashboard (/tenant/personal/page.tsx — or (personal)/page.tsx):
  ├── NetWorthCard
  ├── MonthlySummaryChart
  ├── BillSummaryWidget  ← Same component, same data
  └── BudgetProgressBar[]
```

### 9.4 Smart Alert Integration

```typescript
// Smart alert cards in the notification feed (both account types)
// alert_type = 'bill_due' → renders BillDueAlertCard
// alert_type = 'bill_overdue' → renders BillOverdueAlertCard (red border)
// alert_type = 'bill_paid' → renders BillPaidAlertCard (green, auto-dismisses after 5s)

interface BillDueAlertCard {
  title: string;          // "Tagihan PLN Mei jatuh tempo dalam 3 hari"
  amount_remaining: number;
  due_date: string;
  cta: "Bayar Sekarang"; // → links to /tenant/bills/:id
}
```

### 9.5 Flutter Mobile — Bill Tracker

```dart
// lib/features/bills/        ← Shared feature for both account types
├── bills_list_page.dart      ← Tab view: Hutang | Piutang | Semua
├── bill_detail_page.dart     ← Detail + payment history + pay button
├── bill_form_page.dart       ← Create/edit bill
├── payment_sheet.dart        ← Bottom sheet payment recorder
└── bills_cubit.dart          ← State: list, filter, summary

// Bill status color mapping (Flutter):
Color statusColor(String status) => switch (status) {
  'pending'   => Colors.blue,
  'partial'   => Colors.amber,
  'overdue'   => Colors.red,
  'paid'      => Colors.green,
  'cancelled' => Colors.grey,
  _ => Colors.grey,
};

// Push notification for reminders (FCM):
// alert_type = 'bill_due'     → notification with "Bayar" deep-link action
// alert_type = 'bill_overdue' → high-priority notification, red icon
```
