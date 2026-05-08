import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/providers/auth_provider.dart';
import '../../core/theme/app_colors.dart';
import '../models/user_profile.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../features/reports/widgets/add_expense_sheet.dart';
import '../../features/reports/widgets/add_budget_sheet.dart';

import '../../../core/theme/responsive.dart';

class MainShell extends ConsumerWidget {
  final Widget child;

  const MainShell({super.key, required this.child});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final location = GoRouterState.of(context).uri.path;
    final authState = ref.watch(authProvider);
    final userRole = authState.profile?.role ?? UserRole.kasir;
    final accountType = authState.profile?.accountType ?? 'business';
    final isPersonal = accountType == 'personal';

    final List<Map<String, dynamic>> tabs = isPersonal ? [
      {
        'path': '/reports', // Dashboard for personal
        'label': 'Ringkasan',
        'icon': Icons.dashboard_outlined,
        'activeIcon': Icons.dashboard_rounded,
      },
      {
        'path': '/transactions', // Dedicated transactions screen
        'label': 'Transaksi',
        'icon': Icons.receipt_long_outlined,
        'activeIcon': Icons.receipt_long_rounded,
      },
      {
        'path': '/budget', // Dedicated budget screen
        'label': 'Anggaran',
        'icon': Icons.savings_outlined,
        'activeIcon': Icons.savings_rounded,
      },
    ] : [
      {
        'path': '/pos',
        'label': 'Kasir',
        'icon': Icons.shopping_bag_outlined,
        'activeIcon': Icons.shopping_bag_rounded,
      },
      {
        'path': '/inventory',
        'label': 'Stok',
        'icon': Icons.inventory_2_outlined,
        'activeIcon': Icons.inventory_2_rounded,
      },
    ];

    if (!isPersonal && userRole == UserRole.manager) {
      tabs.add({
        'path': '/reports',
        'label': 'Keuangan',
        'icon': Icons.account_balance_wallet_outlined,
        'activeIcon': Icons.account_balance_wallet_rounded,
      });
    }

    int getSelectedIndex() {
      final index = tabs.indexWhere((tab) => location.startsWith(tab['path']));
      return index == -1 ? 0 : index;
    }

    String getTitle() {
      switch (location) {
        case String l when l.startsWith('/pos'): return 'Kasir';
        case String l when l.startsWith('/transactions'): return 'Daftar Transaksi';
        case String l when l.startsWith('/inventory'): return 'Inventaris';
        case String l when l.startsWith('/budget'): return 'Anggaran';
        case String l when l.startsWith('/reports'): return isPersonal ? 'Ringkasan' : 'Keuangan';
        case String l when l.startsWith('/settings'): return 'Pengaturan';
        default: return 'Tumbuhin';
      }
    }

    void showTransactionSheet(BuildContext context, {required bool isIncome}) {
      showModalBottomSheet(
        context: context,
        isScrollControlled: true,
        backgroundColor: Colors.transparent,
        builder: (context) => AddExpenseSheet(isIncome: isIncome),
      );
    }

    Widget buildTransactionOption(
      BuildContext context, {
      required IconData icon,
      required String label,
      required Color color,
      required VoidCallback onTap,
    }) {
      return InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 20),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: color.withValues(alpha: 0.2)),
          ),
          child: Column(
            children: [
              Icon(icon, color: color, size: 32),
              const SizedBox(height: 8),
              Text(
                label,
                style: GoogleFonts.outfit(
                  fontWeight: FontWeight.bold,
                  color: color,
                ),
              ),
            ],
          ),
        ),
      );
    }

    return Responsive(
      mobile: Scaffold(
        appBar: AppBar(
          backgroundColor: AppColors.white,
          foregroundColor: AppColors.black,
          elevation: 0,
          scrolledUnderElevation: 1,
          shadowColor: AppColors.border,
          title: Row(
            children: [
              Image.asset('assets/images/Logo-awal.png', height: 30),
              const SizedBox(width: 10),
              Text(
                getTitle(),
                style: GoogleFonts.outfit(
                  fontSize: 20,
                  fontWeight: FontWeight.w900,
                  color: AppColors.black,
                ),
              ),
            ],
          ),
          actions: [
            IconButton(
              icon: const Icon(Icons.settings_outlined),
              onPressed: () => context.push('/settings'),
            ),
          ],
        ),
        body: child,
        floatingActionButton: isPersonal ? FloatingActionButton(
          onPressed: () {
            if (location.startsWith('/budget')) {
              showModalBottomSheet(
                context: context,
                isScrollControlled: true,
                backgroundColor: Colors.transparent,
                builder: (context) => const AddBudgetSheet(),
              );
              return;
            }
            
            showModalBottomSheet(
              context: context,
              backgroundColor: Colors.white,
              shape: const RoundedRectangleBorder(
                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
              ),
              builder: (ctx) => Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      'Pilih Jenis Transaksi',
                      style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 24),
                    Row(
                      children: [
                        Expanded(
                          child: buildTransactionOption(
                            context,
                            icon: Icons.trending_up_rounded,
                            label: 'Pemasukan',
                            color: Colors.green,
                            onTap: () {
                              Navigator.pop(ctx);
                              showTransactionSheet(context, isIncome: true);
                            },
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: buildTransactionOption(
                            context,
                            icon: Icons.trending_down_rounded,
                            label: 'Pengeluaran',
                            color: Colors.red,
                            onTap: () {
                              Navigator.pop(ctx);
                              showTransactionSheet(context, isIncome: false);
                            },
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                  ],
                ),
              ),
            );
          },
          backgroundColor: AppColors.primary,
          child: const Icon(Icons.add_rounded, size: 28, color: AppColors.onPrimary),
        ) : null,
        bottomNavigationBar: _PremiumBottomNav(
          tabs: tabs,
          selectedIndex: getSelectedIndex(),
          onTap: (index) => context.go(tabs[index]['path']),
        ),
      ),
      tablet: Scaffold(
        body: Row(
          children: [
            NavigationRail(
              extended: context.screenWidth >= 1100,
              backgroundColor: AppColors.white,
              indicatorColor: AppColors.primary,
              minWidth: 80,
              leading: Padding(
                padding: const EdgeInsets.symmetric(vertical: 24),
                child: Image.asset('assets/images/Logo-awal.png', height: 40),
              ),
              trailing: Expanded(
                child: Align(
                  alignment: Alignment.bottomCenter,
                  child: Padding(
                    padding: const EdgeInsets.only(bottom: 24),
                    child: IconButton(
                      icon: const Icon(Icons.settings_outlined),
                      onPressed: () => context.push('/settings'),
                    ),
                  ),
                ),
              ),
              selectedIndex: getSelectedIndex(),
              onDestinationSelected: (index) => context.go(tabs[index]['path']),
              labelType: context.screenWidth >= 1100 ? NavigationRailLabelType.none : NavigationRailLabelType.all,
              unselectedLabelTextStyle: GoogleFonts.outfit(fontSize: 12, color: AppColors.lightGrey, fontWeight: FontWeight.w500),
              selectedLabelTextStyle: GoogleFonts.outfit(fontSize: 12, color: AppColors.black, fontWeight: FontWeight.w800),
              unselectedIconTheme: const IconThemeData(color: AppColors.lightGrey),
              selectedIconTheme: const IconThemeData(color: AppColors.black),
              destinations: tabs.map((tab) => NavigationRailDestination(
                icon: Icon(tab['icon']),
                selectedIcon: Icon(tab['activeIcon']),
                label: Text(tab['label']),
              )).toList(),
            ),
            const VerticalDivider(thickness: 1, width: 1, color: AppColors.border),
            Expanded(
              child: Column(
                children: [
                  AppBar(
                    backgroundColor: AppColors.white,
                    elevation: 0,
                    title: Text(
                      getTitle(),
                      style: GoogleFonts.outfit(fontWeight: FontWeight.w800),
                    ),
                    centerTitle: false,
                  ),
                  Expanded(child: child),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _PremiumBottomNav extends StatelessWidget {
  final List<Map<String, dynamic>> tabs;
  final int selectedIndex;
  final ValueChanged<int> onTap;

  const _PremiumBottomNav({
    required this.tabs,
    required this.selectedIndex,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: AppColors.white,
        border: Border(top: BorderSide(color: AppColors.border, width: 1)),
      ),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          child: Row(
            children: tabs.asMap().entries.map((entry) {
              final index = entry.key;
              final tab = entry.value;
              final isSelected = selectedIndex == index;

              return Expanded(
                child: GestureDetector(
                  behavior: HitTestBehavior.opaque,
                  onTap: () => onTap(index),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 220),
                    curve: Curves.easeOut,
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    decoration: BoxDecoration(
                      // Stronger yellow accent on active tab
                      color: isSelected ? AppColors.primary : Colors.transparent,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        AnimatedSwitcher(
                          duration: const Duration(milliseconds: 200),
                          child: Icon(
                            isSelected ? tab['activeIcon'] : tab['icon'],
                            key: ValueKey(isSelected),
                            // Black icon on yellow, grey on inactive
                            color: isSelected ? AppColors.onPrimary : AppColors.lightGrey,
                            size: 22,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          tab['label'],
                          style: GoogleFonts.outfit(
                            fontSize: 11,
                            fontWeight: isSelected ? FontWeight.w800 : FontWeight.w500,
                            color: isSelected ? AppColors.onPrimary : AppColors.lightGrey,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ),
      ),
    );
  }
}
