import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'transitions.dart';
import '../../features/auth/login_screen.dart';
import '../../features/auth/splash_screen.dart';
import '../../features/auth/providers/auth_provider.dart';
import '../../features/pos/pos_screen.dart';
import '../../features/inventory/inventory_screen.dart';
import '../../features/inventory/product_detail_screen.dart';
import '../../features/inventory/product_edit_screen.dart';
import '../../features/inventory/stock_transfer_screen.dart';
import '../../features/inventory/stock_opname_screen.dart';
import '../../features/reports/reports_screen.dart';
import '../../features/reports/finance_overview_screen.dart';
import '../../features/reports/budget_screen.dart';
import '../../features/ai/ai_chat_screen.dart';
import '../../features/settings/settings_screen.dart';
import '../../features/settings/notification_screen.dart';
import '../../features/receipt/presentation/screens/receipt_drafts_screen.dart';
import '../../features/receipt/presentation/screens/receipt_scan_screen.dart';
import '../../features/receipt/presentation/screens/manual_entry_screen.dart';
import '../../features/receipt/presentation/screens/draft_review_screen.dart';
import '../../features/pesanan/presentation/screens/pesanan_list_screen.dart';
import '../../features/pesanan/presentation/screens/pesanan_detail_screen.dart';
import '../../features/pesanan/presentation/screens/pesanan_form_screen.dart';
import '../../features/promos/promos_screen.dart';
import '../../features/promos/promo_edit_screen.dart';
import '../../features/staff/staff_screen.dart';
import '../../features/staff/staff_qr_join_screen.dart';
import '../../features/transactions/presentation/screens/transaksi_list_screen.dart';
import '../../features/transactions/presentation/screens/transaksi_detail_screen.dart';
import '../../features/goals/goals_screen.dart';
import '../../features/goals/goal_detail_screen.dart';
import '../../features/bills/bills_screen.dart';
import '../../features/bills/bill_detail_screen.dart';
import '../../features/bills/bill_add_screen.dart';
import '../../features/personal/dashboard/personal_dashboard_page.dart';
import '../../features/personal/recurring/recurring_list_page.dart';
import '../../features/personal/entry/income_entry_page.dart';
import '../../features/personal/entry/expense_entry_page.dart';
import '../../features/personal/budgets/budget_list_page.dart';
import '../../features/personal/goals/goals_list_page.dart';
import '../../features/personal/goals/goal_detail_page.dart';
import '../../features/subscription/subscription_screen.dart';
import '../../shared/widgets/main_shell.dart';
import '../../shared/models/product.dart';
import '../../shared/models/order.dart';
import '../../shared/models/promotion.dart';
import '../../shared/repositories/repositories_provider.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    initialLocation: '/splash',
    refreshListenable: AuthRefreshListenable(ref),
    redirect: (context, state) {
      if (authState.isLoading) {
        return '/splash';
      }

      final isAuthenticated = authState.isAuthenticated;
      final isPersonal = authState.profile?.accountType == 'personal';
      final isLoggingIn = state.uri.path == '/login';
      final isSplash = state.uri.path == '/splash';

      if (!isAuthenticated && !isLoggingIn) {
        return '/login';
      }

      if (isAuthenticated) {
        if (isLoggingIn || isSplash) {
          return isPersonal ? '/personal' : '/pos';
        }

        // Block personal users from business-only routes
        if (isPersonal) {
          const businessOnlyPaths = [
            '/pos',
            '/inventory',
            '/pesanan',
            '/promos',
            '/staff',
            '/receipt',
            '/ai-chat',
            '/reports',
          ];
          if (businessOnlyPaths.any((p) => state.uri.path.startsWith(p))) {
            return '/personal';
          }
        }

        // Block business users from personal-only routes
        if (!isPersonal) {
          const personalOnlyPaths = ['/budget', '/goals', '/personal'];
          if (personalOnlyPaths.any((p) => state.uri.path.startsWith(p))) {
            return '/pos';
          }
        }

        // Block free-tier and personal users from AI chat
        // (Only Business Pro and Business Franchise can access AI chat)
        final tier = authState.tenant?.tier;
        if (state.uri.path == '/ai-chat') {
          if (isPersonal || tier == 'free' || tier == null) {
            return isPersonal ? '/personal' : '/pos';
          }
        }

        // Block business free-tier from receipt OCR routes
        const receiptPaths = ['/receipt/scan', '/receipt/manual', '/receipt'];
        if (receiptPaths.any((p) => state.uri.path.startsWith(p))) {
          if (!isPersonal && (tier == 'free' || tier == null)) {
            return '/subscription';
          }
        }
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/splash',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
      ShellRoute(
        builder: (context, state, child) => MainShell(child: child),
        routes: [
          GoRoute(path: '/pos', builder: (context, state) => const PosScreen()),
          GoRoute(
            path: '/transaksi',
            builder: (context, state) => const TransaksiListScreen(),
            routes: [
              GoRoute(
                path: ':id',
                builder: (context, state) {
                  final id = state.pathParameters['id']!;
                  return TransaksiDetailScreen(transactionId: id);
                },
              ),
            ],
          ),
          GoRoute(
            path: '/inventory',
            builder: (context, state) => const InventoryScreen(),
            routes: [
              GoRoute(
                path: 'add',
                builder: (context, state) => const ProductEditScreen(),
              ),
              GoRoute(
                path: 'edit',
                builder: (context, state) {
                  final product = state.extra as Product?;
                  return ProductEditScreen(product: product);
                },
              ),
              GoRoute(
                path: 'detail',
                builder: (context, state) {
                  final product = state.extra as Product;
                  return ProductDetailScreen(product: product);
                },
              ),
              GoRoute(
                path: 'transfer',
                builder: (context, state) => const StockTransferScreen(),
              ),
              GoRoute(
                path: 'opname',
                builder: (context, state) => const StockOpnameScreen(),
              ),
            ],
          ),
          GoRoute(
            path: '/reports',
            builder: (context, state) => const FinanceOverviewScreen(),
            routes: [
              GoRoute(
                path: 'detail',
                builder: (context, state) {
                  final authState = ref.watch(authProvider);
                  final isPersonal =
                      authState.profile?.accountType == 'personal';
                  return isPersonal
                      ? const BudgetScreen()
                      : const ReportsScreen();
                },
              ),
            ],
          ),
          GoRoute(
            path: '/settings',
            builder: (context, state) => const SettingsScreen(),
          ),
          GoRoute(
            path: '/pesanan',
            builder: (context, state) => const PesananListScreen(),
            routes: [
              GoRoute(
                path: 'new',
                builder: (context, state) => const PesananFormScreen(),
              ),
              GoRoute(
                path: 'detail',
                builder: (context, state) {
                  final order = state.extra as Order;
                  return PesananDetailScreen(order: order);
                },
              ),
              GoRoute(
                path: ':id',
                builder: (context, state) {
                  final id = state.pathParameters['id']!;
                  final order = state.extra as Order?;
                  if (order != null) return PesananDetailScreen(order: order);
                  return _OrderLoaderWidget(id: id);
                },
              ),
            ],
          ),
          GoRoute(
            path: '/promos',
            builder: (context, state) => const PromosScreen(),
            routes: [
              GoRoute(
                path: 'add',
                builder: (context, state) => const PromoEditScreen(),
              ),
              GoRoute(
                path: 'edit',
                builder: (context, state) {
                  final promo = state.extra as Promotion;
                  return PromoEditScreen(promo: promo);
                },
              ),
            ],
          ),
          GoRoute(
            path: '/staff',
            builder: (context, state) => const StaffScreen(),
            routes: [
              GoRoute(
                path: 'qr-join',
                builder: (context, state) => const StaffQRJoinScreen(),
              ),
            ],
          ),
          GoRoute(
            path: '/notifications',
            builder: (context, state) => const NotificationScreen(),
          ),
          GoRoute(
            path: '/ai-chat',
            builder: (context, state) => const AiChatScreen(),
          ),
          GoRoute(
            path: '/budget',
            builder: (context, state) => const BudgetScreen(),
          ),
          GoRoute(
            path: '/goals',
            builder: (context, state) => const GoalsScreen(),
            routes: [
              GoRoute(
                path: ':id',
                builder: (context, state) {
                  final id = state.pathParameters['id']!;
                  return GoalDetailScreen(goalId: id);
                },
              ),
            ],
          ),
          GoRoute(
            path: '/bills',
            builder: (context, state) => const BillsScreen(),
            routes: [
              GoRoute(
                path: 'add',
                builder: (context, state) => const BillAddScreen(),
              ),
              GoRoute(
                path: ':id',
                builder: (context, state) {
                  final id = state.pathParameters['id']!;
                  return BillDetailScreen(billId: id);
                },
              ),
            ],
          ),
          GoRoute(
            path: '/personal',
            builder: (context, state) => const PersonalDashboardPage(),
            routes: [
              GoRoute(
                path: 'recurring',
                builder: (context, state) => const RecurringListPage(),
              ),
              GoRoute(
                path: 'income',
                builder: (context, state) => const IncomeEntryPage(),
              ),
              GoRoute(
                path: 'expense',
                builder: (context, state) => const ExpenseEntryPage(),
              ),
              GoRoute(
                path: 'budgets',
                builder: (context, state) => const BudgetListPage(),
              ),
              GoRoute(
                path: 'goals',
                builder: (context, state) => const GoalsListPage(),
                routes: [
                  GoRoute(
                    path: ':id',
                    builder: (context, state) {
                      final id = state.pathParameters['id']!;
                      return GoalDetailPage(goalId: id);
                    },
                  ),
                ],
              ),
            ],
          ),
          GoRoute(
            path: '/receipt',
            builder: (context, state) => const ReceiptDraftsScreen(),
            routes: [
              GoRoute(
                path: 'scan',
                builder: (context, state) => const ReceiptScanScreen(),
              ),
              GoRoute(
                path: 'manual',
                builder: (context, state) => const ManualEntryScreen(),
              ),
              GoRoute(
                path: ':id',
                builder: (context, state) {
                  final id = state.pathParameters['id']!;
                  return DraftReviewScreen(id: id);
                },
              ),
            ],
          ),
          GoRoute(
            path: '/subscription',
            builder: (context, state) => const SubscriptionScreen(),
          ),
        ],
      ),
    ],
  );
});

class AuthRefreshListenable extends ChangeNotifier {
  AuthRefreshListenable(Ref ref) {
    ref.listen(authProvider, (previous, next) {
      if (previous?.isLoading != next.isLoading ||
          previous?.isAuthenticated != next.isAuthenticated) {
        notifyListeners();
      }
    });
  }
}

class _OrderLoaderWidget extends ConsumerWidget {
  final String id;

  const _OrderLoaderWidget({required this.id});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final orderAsync = ref.watch(orderByIdProvider(id));

    return orderAsync.when(
      loading: () =>
          const Scaffold(body: Center(child: CircularProgressIndicator())),
      error: (err, _) => Scaffold(
        appBar: AppBar(title: const Text('Detail Pesanan')),
        body: Center(child: Text('Gagal memuat pesanan: $err')),
      ),
      data: (order) => PesananDetailScreen(order: order),
    );
  }
}

final orderByIdProvider = FutureProvider.family<Order, String>((ref, id) {
  return ref.read(orderRepositoryProvider).getOrderById(id);
});
