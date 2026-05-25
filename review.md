# Flutter App — Deep Review & Refactoring Plan

> **Scope:** Cross-reference of `tumbuhin_flutter/lib/` against every document in `docs/`.
> **Date:** 2026-05-21
> **Verdict:** The app compiles and covers the happy path, but has **24 confirmed gaps** against the documentation spanning routing, navigation shell, module naming, OCR review UX, POS cart model, transaksi providers, and personal-mode layout. None of the gaps are cosmetic — several will cause runtime crashes or allow unauthorized feature access.

---

## Legend

| Symbol | Meaning |
|---|---|
| 🔴 **Critical** | Runtime crash or security bypass — fix immediately |
| 🟠 **High** | Wrong business behavior per spec — fix before next milestone |
| 🟡 **Medium** | Structural/architectural mismatch — fix in next sprint |
| 🟢 **Low** | Cosmetic or naming only — fix opportunistically |

---

## 1. Routing & Tier Guards (`app_router.dart`)

### 1.1 AI Chat Gated Only on `free` — `premium` Also Excluded per Spec

| | |
|---|---|
| **File** | `app_router.dart` L94 |
| **Current** | `if (state.uri.path == '/ai-chat' && (tier == 'free' \|\| tier == null))` |
| **Spec** | `overview.md §5.3` Feature Matrix: AI Chat is ❌ for Personal Free AND ❌ for Personal Premium. Only Business Pro and Business Franchise get AI. |
| **Gap** | A Personal Premium user can currently navigate to `/ai-chat` without redirection. |
| **Severity** | 🟠 High — backend will reject with 403 TIER_RESTRICTION but the Flutter UI lets them reach the screen. |

**Fix:**
```dart
final isPersonal = authState.profile?.accountType == 'personal';
if (state.uri.path == '/ai-chat') {
  if (isPersonal || tier == 'free' || tier == null) {
    return isPersonal ? '/reports' : '/pos';
  }
}
```

---

### 1.2 Receipt OCR Routes Have No Tier Guard

| | |
|---|---|
| **File** | `app_router.dart` L280–L299 |
| **Current** | `/receipt`, `/receipt/scan`, `/receipt/manual`, `/receipt/:id` — **no tier check** |
| **Spec** | `overview.md §5.3`: Receipt OCR is ❌ for Business Free. `frontend_architecture.md §3.3`: scan press must redirect free tier to `/subscription`. |
| **Gap** | A Business Free user can navigate the entire receipt OCR flow unchallenged. |
| **Severity** | 🟠 High |

**Fix — add to global redirect block:**
```dart
const receiptPaths = ['/receipt/scan', '/receipt/manual', '/receipt'];
if (receiptPaths.any((p) => state.uri.path.startsWith(p))) {
  if (!isPersonal && (tier == 'free' || tier == null)) {
    return '/subscription';
  }
}
```

---

### 1.3 `TransaksiDetailScreen` Receives Model via `state.extra` — Crash on Deep Link

| | |
|---|---|
| **File** | `app_router.dart` L122–L128 |
| **Current** | `final entry = state.extra as JournalEntry;` — crashes if `extra` is null |
| **Spec** | `frontend_architecture.md §2.2`: `transactionDetailProvider` fetches by ID. Router should use path param. |
| **Gap** | No `transactionDetailProvider` exists. State-extra-only routing means detail screen is unreachable from URLs or push notifications. |
| **Severity** | 🔴 Critical |

**Fix:** Implement `transactionDetailProvider` and change router to:
```dart
GoRoute(
  path: ':id',
  builder: (context, state) {
    final id = state.pathParameters['id']!;
    return TransaksiDetailScreen(transactionId: id);
  },
),
```

---

### 1.4 Route Path `/transactions` Should Be `/transaksi`

| | |
|---|---|
| **File** | `app_router.dart` L118 |
| **Current** | `path: '/transactions'` |
| **Spec** | `frontend_architecture.md §2.2 Tab Layout`: tab path is `/transaksi`. |
| **Severity** | 🟠 High |

---

### 1.5 `/orders` Route Should Be `/pesanan`

| | |
|---|---|
| **File** | `app_router.dart` L181 |
| **Current** | `path: '/orders'` |
| **Spec** | `frontend_architecture.md §2.1`: feature folder is `pesanan/`, routes are `/pesanan`, `/pesanan/:id`. |
| **Severity** | 🟡 Medium |

---

## 2. Navigation Shell (`main_shell.dart`)

### 2.1 Personal Mode Shows 5 Tabs — Spec Requires 3

| | |
|---|---|
| **File** | `main_shell.dart` L26–L32 |
| **Current** | Personal tabs: Ringkasan, Transaksi, Anggaran, Target, Tagihan (5 tabs) |
| **Spec** | `frontend_architecture.md §2.2`: "Personal account users see a simplified tab layout: Ringkasan, Transaksi, Anggaran." (3 tabs) |
| **Gap** | Target (`/goals`) and Tagihan (`/bills`) shown as primary nav tabs — should be secondary screens. |
| **Severity** | 🟡 Medium |

**Fix:**
```dart
final List<_NavTab> tabs = isPersonal ? [
  _NavTab('/reports',      'Ringkasan', Icons.dashboard_outlined,    Icons.dashboard_rounded),
  _NavTab('/transaksi',    'Transaksi', Icons.receipt_long_outlined,  Icons.receipt_long_rounded),
  _NavTab('/budget',       'Anggaran',  Icons.savings_outlined,        Icons.savings_rounded),
] : [ /* business tabs */ ];
```

---

### 2.2 `Keuangan` Tab Has No Tier Guard — Role Only

| | |
|---|---|
| **File** | `main_shell.dart` L38–L40 |
| **Current** | `if (!isPersonal && userRole == UserRole.manager)` — tier not checked |
| **Spec** | `frontend_architecture.md §2.2`: Keuangan tab is for Pro/Franchise tier, manager only. |
| **Gap** | A Business Free manager sees the Keuangan tab and gets 403 from backend on tap. |
| **Severity** | 🟠 High |

**Fix:**
```dart
final isProOrFranchise = tier == 'pro' || tier == 'franchise';
if (!isPersonal && userRole == UserRole.manager && isProOrFranchise) {
  tabs.add(_NavTab('/reports', 'Keuangan', ...));
}
```

---

### 2.3 Business Transaksi Tab Points to `/transactions` Not `/transaksi`

| | |
|---|---|
| **File** | `main_shell.dart` L35 |
| **Current** | `_NavTab('/transactions', 'Transaksi', ...)` |
| **Spec** | `/transaksi` per `frontend_architecture.md §2.2` |
| **Severity** | 🟡 Medium (coupled to §1.4 fix) |

---

## 3. Feature Directory Structure & Naming

### 3.1 `features/orders/` Should Be `features/pesanan/`

| | |
|---|---|
| **Current** | `lib/features/orders/` — `orders_screen.dart`, `order_detail_screen.dart`, `order_create_screen.dart` all in root |
| **Spec** | `frontend_architecture.md §2.1`: `features/pesanan/presentation/screens/pesanan_list_screen.dart` etc. |
| **Gap** | English folder name; screens not inside `presentation/screens/` subdirectory (coding_standards.md §2.3). |
| **Severity** | 🟡 Medium |

**Required rename mapping:**

| Current | Target |
|---|---|
| `features/orders/` | `features/pesanan/` |
| `orders_screen.dart` | `presentation/screens/pesanan_list_screen.dart` |
| `order_detail_screen.dart` | `presentation/screens/pesanan_detail_screen.dart` |
| `order_create_screen.dart` | `presentation/screens/pesanan_form_screen.dart` |
| `providers/order_providers.dart` | `presentation/providers/pesanan_provider.dart` |

---

### 3.2 `features/expenses/` Should Be Deleted — Replaced by `transaksi`

| | |
|---|---|
| **Current** | `lib/features/expenses/expenses_screen.dart` exists and is registered at `/expenses` |
| **Spec** | `frontend_architecture.md §2.1` comment: `transaksi` **replaces** `expenses`. Manual expenses appear as `source_type = 'expense'` rows in the unified transaction log. |
| **Gap** | Orphaned legacy module. `AddExpenseSheet` in `main_shell.dart` already handles personal expense entry. |
| **Severity** | 🟡 Medium |

---

### 3.3 `transactions_screen.dart` Placed Outside `presentation/screens/`

| | |
|---|---|
| **Current** | `lib/features/transactions/transactions_screen.dart` |
| **Spec** | `coding_standards.md §2.3`: screens must live in `presentation/screens/` |
| **Severity** | 🟢 Low |

---

### 3.4 `features/transactions/data/` Is Empty

| | |
|---|---|
| **Current** | `lib/features/transactions/data/` — empty directory |
| **Spec** | `frontend_architecture.md §2.1`: must contain `transaction_service.dart` and `transaction_models.dart` |
| **Severity** | 🟠 High |

---

## 4. Riverpod Providers — Missing Core Providers

### 4.1 `transactionListProvider` and `transactionDetailProvider` — Missing

| | |
|---|---|
| **Current** | `transaksi_providers.dart` — only has 3 `StateProvider` for UI filters. No data-fetching providers. |
| **Spec** | `frontend_architecture.md §2.2`:
```dart
final transactionListProvider =
  FutureProvider.family<List<Transaction>, TransactionFilter>(...);
final transactionDetailProvider =
  FutureProvider.family<Transaction, String>(...);
``` |
| **Gap** | List screen has no standard Riverpod data source. Detail screen cannot fetch by ID. |
| **Severity** | 🔴 Critical (coupled to §1.3 crash) |

---

### 4.2 `pesananListProvider` and `UpdatePesananStatusNotifier` — Missing

| | |
|---|---|
| **Current** | `order_providers.dart` has `orderByIdProvider` only. |
| **Spec** | `frontend_architecture.md §2.2`: `pesananListProvider` + `UpdatePesananStatusNotifier` |
| **Gap** | Status update flow and filtered list loading not implemented via standard Riverpod patterns. |
| **Severity** | 🟠 High |

---

## 5. OCR Receipt Review Flow (`draft_review_screen.dart`)

### 5.1 Draft Review Screen — All Fields Are Read-Only

| | |
|---|---|
| **File** | `draft_review_screen.dart` |
| **Current** | Renders extracted data as static `Text` widgets. No form fields. |
| **Spec** | `business_flow.md §4`: "User reviews draft → fills in debit_account_id + credit_account_id". `ocr_ai_transaction_planning.md`: user must correct merchant name, date, amount, category, COA accounts before approving. |
| **Gap** | `debit_account_id` and `credit_account_id` required by `/approve` endpoint cannot be set. Backend will reject with `MISSING_ACCOUNT_MAPPING`. OCR flow is entirely broken end-to-end. |
| **Severity** | 🔴 Critical |

**Required form fields:**

| Field | Widget | Notes |
|---|---|---|
| Merchant Name | `TextFormField` | Pre-filled from OCR |
| Transaction Date | `DatePickerField` | Pre-filled from OCR |
| Total Amount | `TextFormField` (numeric) | Pre-filled from OCR |
| Category | COA picker (BEBAN accounts) | Required |
| Debit Account | COA picker | Required for approval |
| Credit Account | COA picker | Required for approval |
| Notes | `TextFormField` | Optional |

---

### 5.2 Confidence Indicators Not Wired to Fields

| | |
|---|---|
| **Current** | `confidence_indicator.dart` widget exists but is **not used** in `draft_review_screen.dart` |
| **Spec** | `ocr_ai_transaction_planning.md`: each extracted field must show colored dot — 🟢 high / 🟡 medium / 🔴 low confidence. |
| **Severity** | 🟠 High |

---

### 5.3 Line Items Not Shown in Draft Review

| | |
|---|---|
| **Current** | Review screen shows only aggregate totals. |
| **Spec** | `ocr_ai_transaction_planning.md`: extracted line items (product name, qty, unit price) must be displayed and editable. |
| **Severity** | 🟡 Medium |

---

## 6. POS / Universal Product Engine

### 6.1 `CartItem` Has No Variant or Add-on Fields

| | |
|---|---|
| **File** | `cart_item.dart` |
| **Current** | `CartItem({ required Product product, required int quantity })` |
| **Spec** | `product_engine_upgrade.md`: CartItem must carry `selectedVariants` and `selectedAddons` to compute correct `unit_price` delta and send proper checkout payload. |
| **Gap** | Checkout will always send base price, ignoring required variant surcharges — a financial calculation error. |
| **Severity** | 🔴 Critical |

**Required model:**
```dart
@freezed
class CartItem with _$CartItem {
  const factory CartItem({
    required Product product,
    required int quantity,
    @Default([]) List<VariantOption> selectedVariants,
    @Default([]) List<Addon> selectedAddons,
    String? specialInstructions,
  }) = _CartItem;
}
```

---

### 6.2 Product Tap Adds Directly to Cart — No Variant/Add-on Dialog

| | |
|---|---|
| **File** | `product_grid.dart` |
| **Current** | Tapping a product card immediately adds 1 unit to cart. |
| **Spec** | `product_engine_upgrade.md`: if `product.variantGroups` is non-empty or any variant group has `isRequired = true`, a selection dialog must appear first. |
| **Gap** | Required variants are silently skipped. Backend checkout will fail validation for products requiring variant selection. |
| **Severity** | 🔴 Critical |

**Fix flow:**
```dart
void _onProductTap(Product product, WidgetRef ref) {
  final hasRequired = (product.variantGroups?.any((g) => g.isRequired) ?? false)
                   || (product.addonGroups?.any((g) => g.isRequired) ?? false);
  if (hasRequired) {
    showModalBottomSheet(
      context: context,
      builder: (_) => ProductSelectionSheet(product: product),
    );
  } else {
    ref.read(cartProvider.notifier).addItem(CartItem(product: product, quantity: 1));
  }
}
```

---

### 6.3 Checkout Payload Sends No Variant/Add-on Data

| | |
|---|---|
| **File** | `checkout_bottom_sheet.dart` |
| **Current** | Sends `{ items: [{ product_id, quantity, unit_price }] }` |
| **Spec** | `product_engine_upgrade.md` & `api_contract.md`: POST `/api/v1/sales` must include `selected_variants` and `selected_addons` arrays per item. |
| **Gap** | Pricing and HPP calculated incorrectly for variant products. Promo eligibility checks fail for add-on items. |
| **Severity** | 🔴 Critical |

---

## 7. Pesanan (Orders) Module

### 7.1 Screens Outside `presentation/screens/`

| | |
|---|---|
| **Current** | `orders_screen.dart`, `order_detail_screen.dart`, `order_create_screen.dart` in root of `features/orders/` |
| **Spec** | `coding_standards.md §2.3`: screens must be in `features/[name]/presentation/screens/` |
| **Severity** | 🟡 Medium |

---

### 7.2 Pesanan Status Lifecycle — Only 5 of 9 Statuses Handled in UI

| | |
|---|---|
| **Current** | `order_detail_screen.dart` handles subset of statuses. |
| **Spec** | `business_flow.md §2b`: 9 statuses: `draft`, `confirmed`, `processing`, `ready`, `fulfilled`, `invoiced`, `paid`, `cancelled`, `voided`. Manager-only void required. |
| **Gap** | `invoiced`, `voided`, and role-gated transitions not implemented. |
| **Severity** | 🟠 High |

---

### 7.3 Missing Widgets: `PesananStatusChip`, `DivisionNotesPanel`, `StatusActionButton`

| | |
|---|---|
| **Spec** | `frontend_architecture.md §2.1 pesanan/widgets/`: three reusable widgets required. |
| **Gap** | None exist. Logic is inline in detail screen. |
| **Severity** | 🟡 Medium |

---

## 8. Bills Module

### 8.1 Missing `payment_sheet.dart`

| | |
|---|---|
| **Current** | `bills/` has: `bills_screen.dart`, `bill_detail_screen.dart`, `bill_add_screen.dart` only. |
| **Spec** | `frontend_architecture.md §9.5`: `payment_sheet.dart` — bottom sheet payment recorder. |
| **Gap** | Users cannot record a payment from the bill detail screen. The "Bayar" button has no target. |
| **Severity** | 🟠 High |

---

### 8.2 Missing Bills Provider / Cubit

| | |
|---|---|
| **Current** | No Riverpod provider for bills state. |
| **Spec** | `frontend_architecture.md §9.5`: `bills_cubit.dart` for list, filter, and summary state. |
| **Severity** | 🟡 Medium |

---

## 9. Personal Account Mode

### 9.1 Missing `features/personal/` Module Structure

| | |
|---|---|
| **Current** | Personal mode re-uses business module paths. No `features/personal/` directory. |
| **Spec** | `frontend_architecture.md §8.5`:
```
lib/features/personal/
├── dashboard/personal_dashboard_page.dart
├── entry/income_entry_page.dart
├── entry/expense_entry_page.dart
├── budgets/budget_list_page.dart
├── goals/goals_list_page.dart
├── goals/goal_detail_page.dart
└── recurring/recurring_list_page.dart
``` |
| **Severity** | 🟡 Medium |

---

### 9.2 Recurring Transactions — Entirely Absent from Flutter App

| | |
|---|---|
| **Spec** | `business_flow.md §10d` & `frontend_architecture.md §8.5`: recurring transactions require `premium` tier. Client shows `PremiumGate` overlay for `free`. |
| **Gap** | `RecurringTransaction` model exists but no screen, provider, or route. Feature is 0% implemented. |
| **Severity** | 🟠 High |

---

### 9.3 No `NetWorthCard` on Personal Dashboard

| | |
|---|---|
| **Spec** | `frontend_architecture.md §8.3`: Personal dashboard primary KPI is NetWorthCard (Total Aset − Total Hutang). |
| **Gap** | Personal users land on FinanceOverviewScreen which shows business-style report tabs. |
| **Severity** | 🟠 High |

---

## 10. Missing Shared Widgets

### 10.1 No COA Picker Widget

| | |
|---|---|
| **Spec** | Required by draft approval, manual entry, bill creation, and income/expense forms. |
| **Gap** | No `CoaPicker` or equivalent widget exists anywhere. |
| **Severity** | 🟠 High (blocks §5.1 fix) |

### 10.2 No `PremiumGate` / `UpgradeBanner` Widget

| | |
|---|---|
| **Spec** | `frontend_architecture.md §3.3` Tier-Gated UI, §8.3: `PremiumGate` blurred overlay with upgrade CTA. |
| **Gap** | Tier gates only exist as router redirects — not as inline upgrade prompts within screens. |
| **Severity** | 🟠 High |

### 10.3 No `BillSummaryWidget`

| | |
|---|---|
| **Spec** | `frontend_architecture.md §9.2`: widget to show on both personal and business dashboards. |
| **Gap** | Widget does not exist. Dashboards show no hutang/piutang summary. |
| **Severity** | 🟡 Medium |

---

## 11. API Contract & Routes

### 11.1 `/subscription` Route — Not Registered

| | |
|---|---|
| **Spec** | `frontend_architecture.md §3.3`: tier-aware navigation should redirect to `/subscription`. |
| **Gap** | No `/subscription` route in `app_router.dart`. All tier-redirects go to `/pos` or `/reports` instead. |
| **Severity** | 🟡 Medium |

---

## Summary Table

| # | Gap | Severity |
|---|---|---|
| 1.1 | AI Chat allows Personal Premium | 🟠 High |
| 1.2 | No tier gate on Receipt OCR routes | 🟠 High |
| 1.3 | `TransaksiDetailScreen` crashes on deep link | 🔴 Critical |
| 1.4 | Route `/transactions` should be `/transaksi` | 🟠 High |
| 1.5 | Route `/orders` should be `/pesanan` | 🟡 Medium |
| 2.1 | Personal mode has 5 tabs (spec: 3) | 🟡 Medium |
| 2.2 | Keuangan tab shown to Business Free managers | 🟠 High |
| 2.3 | Transaksi tab path mismatch | 🟡 Medium |
| 3.1 | `features/orders/` name & structure wrong | 🟡 Medium |
| 3.2 | `features/expenses/` should be deleted | 🟡 Medium |
| 3.3 | `transactions_screen.dart` wrong location | 🟢 Low |
| 3.4 | `features/transactions/data/` is empty | 🟠 High |
| 4.1 | `transactionListProvider`/`DetailProvider` missing | 🔴 Critical |
| 4.2 | `pesananListProvider`/`UpdateStatus` missing | 🟠 High |
| 5.1 | Draft review has no editable fields | 🔴 Critical |
| 5.2 | `confidence_indicator.dart` not used | 🟠 High |
| 5.3 | Line items not shown in draft review | 🟡 Medium |
| 6.1 | `CartItem` lacks variant/add-on fields | 🔴 Critical |
| 6.2 | Product tap adds without variant dialog | 🔴 Critical |
| 6.3 | Checkout payload missing variant/add-on data | 🔴 Critical |
| 7.2 | Only 5 of 9 Pesanan statuses handled | 🟠 High |
| 8.1 | `payment_sheet.dart` for bills missing | 🟠 High |
| 9.2 | Recurring transactions entirely absent | 🟠 High |
| 9.3 | No NetWorthCard for personal dashboard | 🟠 High |
| 10.1 | No COA picker widget | 🟠 High |
| 10.2 | No PremiumGate/UpgradeBanner widget | 🟠 High |
| 11.1 | `/subscription` route missing | 🟡 Medium |

**Totals: 6 Critical · 13 High · 7 Medium · 1 Low**

---

## Refactoring Plan

### Phase 1 — Critical Fixes (Week 1)

> Runtime crashes and broken core flows. No release with these open.

#### P1.1 — Fix `TransaksiDetailScreen` Deep-Link Crash

- **[NEW]** `lib/features/transactions/data/transaction_models.dart` — `Transaction`, `JournalLine`, `SourceType` models
- **[NEW]** `lib/features/transactions/data/transaction_service.dart` — `getAll(filter)`, `getById(id)` via ApiClient.dio
- **[MODIFY]** `lib/features/transactions/presentation/providers/transaksi_providers.dart` — add `transactionListProvider`, `transactionDetailProvider`
- **[MODIFY]** `lib/features/transactions/presentation/screens/transaksi_detail_screen.dart` — accept `transactionId: String`, load via provider
- **[MODIFY]** `lib/core/router/app_router.dart` L122–128 — use `state.pathParameters['id']` not `state.extra`

#### P1.2 — Fix OCR Draft Review to Be Editable

- **[MODIFY]** `lib/features/receipt/presentation/screens/draft_review_screen.dart`:
  - Replace static `Text` with editable `TextFormField`, date picker, COA pickers
  - Wire `confidence_indicator.dart` to each field
  - Approve button calls `updateDraft` then `approve`
- **[NEW]** `lib/shared/widgets/coa_picker.dart` — reusable COA account dropdown backed by `coaListProvider`

#### P1.3 — Fix CartItem and POS Variant Flow

- **[MODIFY]** `lib/shared/models/cart_item.dart` — add `selectedVariants`, `selectedAddons`, `specialInstructions`; regenerate freezed files
- **[NEW]** `lib/features/pos/widgets/product_selection_sheet.dart` — variant/add-on selection bottom sheet; validates required groups; returns `CartItem`
- **[MODIFY]** `lib/features/pos/widgets/product_grid.dart` — on tap: show `ProductSelectionSheet` if has required variants/addons
- **[MODIFY]** `lib/features/pos/widgets/checkout_bottom_sheet.dart` — include `selected_variants` and `selected_addons` in POST body; show variant-adjusted price

---

### Phase 2 — High Severity Fixes (Week 2)

#### P2.1 — Fix Route Paths and Tier Guards

- **[MODIFY]** `lib/core/router/app_router.dart`:
  - Rename `/transactions` → `/transaksi`
  - Rename `/orders` → `/pesanan`
  - Fix AI chat tier guard (block all personal accounts, not just `free`)
  - Add Receipt OCR tier guard (block business `free` tier)
  - Add `/subscription` route
- **[MODIFY]** `lib/shared/widgets/main_shell.dart`:
  - Personal tabs: reduce to 3 (Ringkasan, Transaksi, Anggaran)
  - Keuangan tab: add `isProOrFranchise` condition
  - Update `/transactions` → `/transaksi`

#### P2.2 — Add Pesanan Providers and Full Status Lifecycle

- **[MODIFY]** `lib/features/orders/providers/order_providers.dart` → add `pesananListProvider`, `UpdatePesananStatusNotifier`
- **[NEW]** `lib/features/orders/presentation/widgets/pesanan_status_chip.dart`
- **[NEW]** `lib/features/orders/presentation/widgets/division_notes_panel.dart`
- **[NEW]** `lib/features/orders/presentation/widgets/status_action_button.dart` — role-gated (manager only for void/cancel)
- **[MODIFY]** `lib/features/orders/order_detail_screen.dart` — handle all 9 statuses including `invoiced`, `voided`

#### P2.3 — Add Bills Payment Sheet

- **[NEW]** `lib/features/bills/payment_sheet.dart` — bottom sheet: amount (max = remaining), payment_account_id picker (COA picker), date, notes; calls POST `/api/v1/bills/:id/pay`
- **[MODIFY]** `lib/features/bills/bill_detail_screen.dart` — wire "Bayar"/"Tandai Diterima" to `PaymentSheet`
- **[NEW]** `lib/features/bills/bills_provider.dart` — Riverpod provider for bills list, summary, filter state

#### P2.4 — Add Premium Gate and Upgrade Banner

- **[NEW]** `lib/shared/widgets/premium_gate.dart` — blurred overlay with upgrade CTA; props: `featureName`, `requiredTier`
- **[NEW]** `lib/shared/widgets/upgrade_banner.dart` — inline banner for tier-locked screens
- Apply to: recurring transactions, AI chat (for personal accounts), receipt scan (business free)

#### P2.5 — Add Personal Net Worth Dashboard

- **[NEW]** `lib/features/personal/dashboard/personal_dashboard_page.dart` — `NetWorthCard` (Aset − Hutang) + `MonthlySummaryChart`
- **[MODIFY]** `lib/core/router/app_router.dart` — for personal users, add `/personal` route and redirect after login to `/personal`

#### P2.6 — Add Recurring Transactions Screen

- **[NEW]** `lib/features/personal/recurring/recurring_list_page.dart` — list with `PremiumGate` overlay for free tier
- **[NEW]** `lib/features/personal/recurring/recurring_provider.dart`
- Register route `/personal/recurring` in `app_router.dart`

---

### Phase 3 — Medium Severity Restructuring (Week 3)

#### P3.1 — Rename `features/orders/` → `features/pesanan/`

```
lib/features/orders/                      → lib/features/pesanan/
orders_screen.dart                        → presentation/screens/pesanan_list_screen.dart
order_detail_screen.dart                  → presentation/screens/pesanan_detail_screen.dart
order_create_screen.dart                  → presentation/screens/pesanan_form_screen.dart
providers/order_providers.dart            → presentation/providers/pesanan_provider.dart

Update all imports in: app_router.dart, main_shell.dart
```

#### P3.2 — Delete `features/expenses/`

- Delete `lib/features/expenses/expenses_screen.dart`
- Remove `/expenses` route from `app_router.dart`
- Verify `AddExpenseSheet` in `main_shell.dart` handles personal expense entry

#### P3.3 — Move `transactions_screen.dart`

```
lib/features/transactions/transactions_screen.dart
→ lib/features/transactions/presentation/screens/transaksi_list_screen.dart

Update import in app_router.dart
```

#### P3.4 — Add Bills Tab Structure

- **[MODIFY]** `lib/features/bills/bills_screen.dart` — add tab bar: Hutang / Piutang / Semua / Jatuh Tempo
- Add overdue banner when overdue bills exist

#### P3.5 — Add OCR Line Items to Draft Review

- Add editable `ListView` of extracted line items (name, qty, unit price, delete) to `draft_review_screen.dart`

#### P3.6 — Add `BillSummaryWidget`

- **[NEW]** `lib/shared/widgets/bill_summary_widget.dart` — Hutang Rp X | Piutang Rp Y
- Integrate into personal dashboard and business FinanceOverviewScreen

---

### Phase 4 — Low Severity / Polish (Week 4)

#### P4.1 — Enforce `features/personal/` Structure

Create the full `features/personal/` directory tree per spec and migrate:
- Budgets, Goals, GoalDetail from scattered locations into `features/personal/`
- Create `entry/income_entry_page.dart` and `expense_entry_page.dart` from existing `AddExpenseSheet` logic

#### P4.2 — Add `features/transactions/data/` Files

- Ensure `transaction_service.dart` and `transaction_models.dart` exist (done in P1.1, finalize here)

---

## Execution Order

```
Phase 1 (Critical — Week 1):
  P1.1 → Transaction data layer + detail provider + router fix
  P1.2 → Editable draft review + COA picker widget
  P1.3 → CartItem model + ProductSelectionSheet + checkout payload

Phase 2 (High — Week 2):
  P2.1 → Route renames + tier guards + /subscription route
  P2.2 → Pesanan providers + full status lifecycle + 3 widgets
  P2.3 → Bills payment sheet + bills provider
  P2.4 → PremiumGate + UpgradeBanner widgets
  P2.5 → Personal net worth dashboard
  P2.6 → Recurring transactions screen

Phase 3 (Medium — Week 3):
  P3.1 → Rename orders → pesanan folder + all imports
  P3.2 → Delete expenses feature
  P3.3 → Move transactions_screen.dart
  P3.4 → Bills tab structure (Hutang/Piutang/Semua/Jatuh Tempo)
  P3.5 → OCR line items editor
  P3.6 → BillSummaryWidget

Phase 4 (Low — Week 4):
  P4.1 → features/personal/ directory restructure
  P4.2 → Finalize transactions/data/ files
```

---

## Files Not Reviewed (Scope Excluded)

| Doc | Reason |
|---|---|
| `backend_architecture.md` | NestJS backend only |
| `database_schema.md` | PostgreSQL schema only |
| `api_contract.md` | Backend spec (referenced for payload validation above) |
| `deployment.md` | CI/CD infra |
| `security_rules.md` | Backend RLS rules |
| `scaling_strategy.md` | Infra scaling |
| `adr/` | Architecture Decision Records |
| `design.md` | UI design tokens — separate design audit |
| `test_strategy.md` | Test coverage — separate audit |
