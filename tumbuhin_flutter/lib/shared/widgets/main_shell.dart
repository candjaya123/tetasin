import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/providers/auth_provider.dart';
import '../../core/theme/app_colors.dart';
import '../models/user_profile.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../features/reports/widgets/add_expense_sheet.dart';
import '../../features/reports/widgets/add_budget_sheet.dart';
import '../../core/theme/responsive.dart';
import '../../core/theme/dimens.dart';

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

    final List<_NavTab> tabs = isPersonal
        ? [
            _NavTab(
              '/personal',
              'Ringkasan',
              Icons.dashboard_outlined,
              Icons.dashboard_rounded,
            ),
            _NavTab(
              '/transaksi',
              'Transaksi',
              Icons.receipt_long_outlined,
              Icons.receipt_long_rounded,
            ),
            _NavTab(
              '/budget',
              'Anggaran',
              Icons.savings_outlined,
              Icons.savings_rounded,
            ),
          ]
        : [
            _NavTab(
              '/pos',
              'Kasir',
              Icons.shopping_bag_outlined,
              Icons.shopping_bag_rounded,
            ),
            _NavTab(
              '/inventory',
              'Stok',
              Icons.inventory_2_outlined,
              Icons.inventory_2_rounded,
            ),
            _NavTab(
              '/transaksi',
              'Transaksi',
              Icons.swap_horiz_outlined,
              Icons.swap_horiz_rounded,
            ),
          ];

    final tier = authState.tenant?.tier;
    final isProOrFranchise = tier == 'pro' || tier == 'franchise';
    if (!isPersonal && userRole == UserRole.manager && isProOrFranchise) {
      tabs.add(
        _NavTab(
          '/reports',
          'Keuangan',
          Icons.account_balance_wallet_outlined,
          Icons.account_balance_wallet_rounded,
        ),
      );
    }

    int getSelectedIndex() {
      final index = tabs.indexWhere((tab) => location.startsWith(tab.path));
      return index == -1 ? 0 : index;
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
      return Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: Dimens.brMd,
          child: Container(
            padding: const EdgeInsets.symmetric(vertical: 24),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(24),
            ),
            child: Column(
              children: [
                Icon(icon, color: color, size: 32),
                const SizedBox(height: Dimens.md),
                Text(
                  label,
                  style: GoogleFonts.outfit(
                    fontWeight: FontWeight.w700,
                    color: color,
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    final selectedIndex = getSelectedIndex();

    return Responsive(
      mobile: Scaffold(
        appBar: AppBar(
          title: Padding(
            padding: const EdgeInsets.only(left: Dimens.sm),
            child: Row(
              children: [
                Image.asset('assets/images/Logo-awal.png', height: 22),
                const SizedBox(width: Dimens.sm),
                Padding(
                  padding: const EdgeInsets.only(top: 2),
                  child: Text(
                    'tetasin',
                    style: GoogleFonts.outfit(
                      fontSize: 20,
                      fontWeight: FontWeight.w800,
                      color: AppColors.primary,
                    ),
                  ),
                ),
              ],
            ),
          ),
          actions: [
            IconButton(
              icon: const Icon(Icons.settings_outlined, size: 22),
              onPressed: location.startsWith('/settings')
                  ? null
                  : () => context.push('/settings'),
              tooltip: 'Pengaturan',
            ),
          ],
        ),
        body: child,
        floatingActionButton: isPersonal
            ? FloatingActionButton(
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
                    backgroundColor: Colors.transparent,
                    isScrollControlled: true,
                    builder: (ctx) => Container(
                      decoration: const BoxDecoration(
                        color: AppColors.surface,
                        borderRadius: BorderRadius.vertical(
                          top: Dimens.radiusXl,
                        ),
                      ),
                      child: Padding(
                        padding: EdgeInsets.only(
                          bottom: MediaQuery.of(ctx).viewInsets.bottom,
                        ),
                        child: Padding(
                          padding: const EdgeInsets.fromLTRB(
                            Dimens.xl,
                            Dimens.xxl,
                            Dimens.xl,
                            Dimens.xxxl,
                          ),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Container(
                                width: 36,
                                height: 4,
                                decoration: BoxDecoration(
                                  color: AppColors.border,
                                  borderRadius: Dimens.brXs,
                                ),
                              ),
                              const SizedBox(height: Dimens.xxl),
                              Text(
                                'Pilih Jenis Transaksi',
                                style: GoogleFonts.outfit(
                                  fontSize: 20,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.textPrimary,
                                ),
                              ),
                              const SizedBox(height: Dimens.xxl),
                              Row(
                                children: [
                                  Expanded(
                                    child: buildTransactionOption(
                                      context,
                                      icon: Icons.trending_up_rounded,
                                      label: 'Pemasukan',
                                      color: AppColors.success,
                                      onTap: () {
                                        Navigator.pop(ctx);
                                        showTransactionSheet(
                                          context,
                                          isIncome: true,
                                        );
                                      },
                                    ),
                                  ),
                                  const SizedBox(width: Dimens.lg),
                                  Expanded(
                                    child: buildTransactionOption(
                                      context,
                                      icon: Icons.trending_down_rounded,
                                      label: 'Pengeluaran',
                                      color: AppColors.error,
                                      onTap: () {
                                        Navigator.pop(ctx);
                                        showTransactionSheet(
                                          context,
                                          isIncome: false,
                                        );
                                      },
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  );
                },
                child: const Icon(Icons.add_rounded, size: 22),
              )
            : null,
        bottomNavigationBar: _BottomNav(
          tabs: tabs,
          selectedIndex: selectedIndex,
          onTap: (i) => context.go(tabs[i].path),
        ),
      ),
      tablet: Scaffold(
        body: Row(
          children: [
            NavigationRail(
              extended: context.screenWidth >= 1100,
              backgroundColor: AppColors.surface,
              indicatorColor: AppColors.primary,
              minWidth: 72,
              leading: Padding(
                padding: const EdgeInsets.symmetric(vertical: 24),
                child: Image.asset('assets/images/Logo-awal.png', height: 32),
              ),
              trailing: Expanded(
                child: Align(
                  alignment: Alignment.bottomCenter,
                  child: Padding(
                    padding: const EdgeInsets.only(bottom: 24),
                    child: IconButton(
                      icon: const Icon(Icons.settings_outlined, size: 22),
                      onPressed: location.startsWith('/settings')
                          ? null
                          : () => context.push('/settings'),
                    ),
                  ),
                ),
              ),
              selectedIndex: selectedIndex,
              onDestinationSelected: (i) => context.go(tabs[i].path),
              labelType: context.screenWidth >= 1100
                  ? NavigationRailLabelType.none
                  : NavigationRailLabelType.all,
              unselectedLabelTextStyle: GoogleFonts.outfit(
                fontSize: 12,
                color: AppColors.textTertiary,
                fontWeight: FontWeight.w500,
              ),
              selectedLabelTextStyle: GoogleFonts.outfit(
                fontSize: 12,
                color: AppColors.textPrimary,
                fontWeight: FontWeight.w700,
              ),
              unselectedIconTheme: const IconThemeData(
                color: AppColors.textTertiary,
              ),
              selectedIconTheme: const IconThemeData(
                color: AppColors.onPrimary,
              ),
              groupAlignment: 0.0,
              destinations: tabs
                  .map(
                    (t) => NavigationRailDestination(
                      icon: Icon(t.icon),
                      selectedIcon: Icon(t.activeIcon),
                      label: Text(t.label),
                    ),
                  )
                  .toList(),
            ),
            const VerticalDivider(
              thickness: 1,
              width: 1,
              color: AppColors.divider,
            ),
            Expanded(
              child: Column(
                children: [
                  AppBar(
                    backgroundColor: AppColors.surface,
                    elevation: 0,
                    title: Row(
                      children: [
                        Image.asset('assets/images/Logo-awal.png', height: 22),
                        const SizedBox(width: Dimens.sm),
                        Padding(
                          padding: const EdgeInsets.only(top: 2),
                          child: Text(
                            'tetasin',
                            style: GoogleFonts.outfit(
                              fontSize: 20,
                              fontWeight: FontWeight.w800,
                              color: AppColors.primary,
                            ),
                          ),
                        ),
                      ],
                    ),
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

class _NavTab {
  final String path;
  final String label;
  final IconData icon;
  final IconData activeIcon;

  const _NavTab(this.path, this.label, this.icon, this.activeIcon);
}

class _BottomNav extends StatelessWidget {
  final List<_NavTab> tabs;
  final int selectedIndex;
  final ValueChanged<int> onTap;

  const _BottomNav({
    required this.tabs,
    required this.selectedIndex,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        border: Border(top: BorderSide(color: AppColors.divider)),
      ),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 4),
          child: LayoutBuilder(
            builder: (context, constraints) {
              final maxTabWidth = constraints.maxWidth / tabs.length;
              final useCompact = maxTabWidth < 60;
              return Row(
                children: tabs.asMap().entries.map((entry) {
                  final index = entry.key;
                  final tab = entry.value;
                  final isSelected = selectedIndex == index;
                  return Expanded(
                    child: GestureDetector(
                      behavior: HitTestBehavior.opaque,
                      onTap: () => onTap(index),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        curve: Curves.easeOut,
                        padding: EdgeInsets.symmetric(
                          vertical: useCompact ? 6 : 8,
                        ),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? AppColors.primary
                              : Colors.transparent,
                          borderRadius: Dimens.brXs,
                        ),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              isSelected ? tab.activeIcon : tab.icon,
                              color: isSelected
                                  ? AppColors.onPrimary
                                  : AppColors.textTertiary,
                              size: useCompact ? 18 : 20,
                            ),
                            const SizedBox(height: 2),
                            Text(
                              tab.label,
                              style: GoogleFonts.outfit(
                                fontSize: useCompact ? 9 : 10,
                                fontWeight: isSelected
                                    ? FontWeight.w700
                                    : FontWeight.w500,
                                color: isSelected
                                    ? AppColors.onPrimary
                                    : AppColors.textTertiary,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                }).toList(),
              );
            },
          ),
        ),
      ),
    );
  }
}
