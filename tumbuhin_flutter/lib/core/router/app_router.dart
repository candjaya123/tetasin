import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
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
import '../../features/orders/orders_screen.dart';
import '../../features/orders/order_detail_screen.dart';
import '../../features/orders/order_create_screen.dart';
import '../../features/promos/promos_screen.dart';
import '../../features/promos/promo_edit_screen.dart';
import '../../features/staff/staff_screen.dart';
import '../../features/staff/staff_qr_join_screen.dart';
import '../../features/transactions/transactions_screen.dart';
import '../../shared/widgets/main_shell.dart';
import '../../shared/models/product.dart';
import '../../shared/models/order.dart';
import '../../shared/models/promotion.dart';

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
          return isPersonal ? '/reports' : '/pos';
        }
        
        // Proteksi tambahan: Jika user personal nyasar ke /pos, lempar ke /reports
        if (isPersonal && state.uri.path == '/pos') {
          return '/reports';
        }
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/splash',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      ShellRoute(
        builder: (context, state, child) => MainShell(child: child),
        routes: [
          GoRoute(
            path: '/pos',
            builder: (context, state) => const PosScreen(),
          ),
          GoRoute(
            path: '/transactions',
            builder: (context, state) => const TransactionsScreen(),
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
                   final isPersonal = authState.profile?.accountType == 'personal';
                   return isPersonal ? const BudgetScreen() : const ReportsScreen();
                },
              ),
            ],
          ),
          GoRoute(
            path: '/settings',
            builder: (context, state) => const SettingsScreen(),
          ),
          GoRoute(
            path: '/orders',
            builder: (context, state) => const OrdersScreen(),
            routes: [
              GoRoute(
                path: 'new',
                builder: (context, state) => const OrderCreateScreen(),
              ),
              GoRoute(
                path: 'detail',
                builder: (context, state) {
                  final order = state.extra as Order;
                  return OrderDetailScreen(order: order);
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
