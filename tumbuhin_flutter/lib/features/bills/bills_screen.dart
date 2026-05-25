import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/dimens.dart';
import '../../shared/widgets/polish_widgets.dart';
import 'bills_provider.dart';

final _activeTabProvider = StateProvider<int>((ref) => 0);

class BillsScreen extends ConsumerWidget {
  const BillsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final activeTab = ref.watch(_activeTabProvider);

    return DefaultTabController(
      length: 4,
      initialIndex: activeTab,
      child: Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(
          title: Text(
            'Tagihan',
            style: Theme.of(context).textTheme.headlineMedium,
          ),
          bottom: TabBar(
            isScrollable: true,
            labelColor: AppColors.textPrimary,
            unselectedLabelColor: AppColors.textTertiary,
            indicatorColor: AppColors.primary,
            onTap: (index) {
              ref.read(_activeTabProvider.notifier).state = index;
              switch (index) {
                case 0:
                  ref.read(billTypeFilterProvider.notifier).state = 'hutang';
                  break;
                case 1:
                  ref.read(billTypeFilterProvider.notifier).state = 'piutang';
                  break;
                case 2:
                  ref.read(billTypeFilterProvider.notifier).state = null;
                  break;
                case 3:
                  ref.read(billTypeFilterProvider.notifier).state =
                      'jatuh_tempo';
                  break;
              }
            },
            tabs: const [
              Tab(text: 'Hutang'),
              Tab(text: 'Piutang'),
              Tab(text: 'Semua'),
              Tab(text: 'Jatuh Tempo'),
            ],
          ),
        ),
        body: TabBarView(
          physics: const NeverScrollableScrollPhysics(),
          children: [
            _BillListView(filterType: 'hutang'),
            _BillListView(filterType: 'piutang'),
            _BillListView(filterType: null),
            const _OverdueBillList(),
          ],
        ),
        floatingActionButton: FloatingActionButton(
          onPressed: () => context.push('/bills/add'),
          child: const Icon(Icons.add_rounded),
        ),
      ),
    );
  }
}

class _OverdueBillList extends ConsumerWidget {
  const _OverdueBillList();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final billsAsync = ref.watch(billsOverdueProvider);

    return billsAsync.when(
      data: (bills) {
        if (bills.isEmpty) {
          return Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: Dimens.xxxl),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: 88,
                    height: 88,
                    decoration: BoxDecoration(
                      color: AppColors.surfaceSecondary,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.check_circle_outline,
                      size: 40,
                      color: AppColors.textTertiary,
                    ),
                  ),
                  const SizedBox(height: Dimens.xxl),
                  Text(
                    'Tidak ada tagihan jatuh tempo',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: Dimens.sm),
                  Text(
                    'Semua tagihan masih dalam batas waktu',
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                ],
              ),
            ),
          );
        }
        return RefreshIndicator(
          onRefresh: () async => ref.invalidate(billsOverdueProvider),
          child: ListView.builder(
            padding: const EdgeInsets.symmetric(
              horizontal: Dimens.lg,
              vertical: Dimens.md,
            ),
            itemCount: bills.length,
            itemBuilder: (_, i) => Padding(
              padding: const EdgeInsets.only(bottom: Dimens.md),
              child: _BillCard(bill: bills[i]),
            ),
          ),
        );
      },
      loading: () => ListView.builder(
        padding: const EdgeInsets.symmetric(
          horizontal: Dimens.lg,
          vertical: Dimens.md,
        ),
        itemCount: 4,
        itemBuilder: (_, __) => Padding(
          padding: const EdgeInsets.only(bottom: Dimens.md),
          child: SkeletonLoader.card(),
        ),
      ),
      error: (e, _) => ErrorStateWidget(
        error: e.toString(),
        onRetry: () => ref.invalidate(billsOverdueProvider),
      ),
    );
  }
}

class _BillListView extends ConsumerWidget {
  final String? filterType;

  const _BillListView({this.filterType});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final billsAsync = ref.watch(billsListProvider);

    return billsAsync.when(
      data: (bills) {
        if (bills.isEmpty) {
          return Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: Dimens.xxxl),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: 88,
                    height: 88,
                    decoration: BoxDecoration(
                      color: AppColors.surfaceSecondary,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.receipt_long_rounded,
                      size: 40,
                      color: AppColors.textTertiary,
                    ),
                  ),
                  const SizedBox(height: Dimens.xxl),
                  Text(
                    'Belum ada tagihan',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: Dimens.sm),
                  Text(
                    'Tambahkan tagihan untuk mengingatkan\nAnda tentang pembayaran rutin',
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                ],
              ),
            ),
          ).animate().fadeIn();
        }
        return RefreshIndicator(
          onRefresh: () async => ref.invalidate(billsListProvider),
          child: ListView.builder(
            padding: const EdgeInsets.symmetric(
              horizontal: Dimens.lg,
              vertical: Dimens.md,
            ),
            itemCount: bills.length,
            itemBuilder: (_, i) => Padding(
              padding: const EdgeInsets.only(bottom: Dimens.md),
              child: _BillCard(bill: bills[i]),
            ),
          ),
        );
      },
      loading: () => ListView.builder(
        padding: const EdgeInsets.symmetric(
          horizontal: Dimens.lg,
          vertical: Dimens.md,
        ),
        itemCount: 4,
        itemBuilder: (_, __) => Padding(
          padding: const EdgeInsets.only(bottom: Dimens.md),
          child: SkeletonLoader.card(),
        ),
      ),
      error: (e, _) => ErrorStateWidget(
        error: e.toString(),
        onRetry: () => ref.invalidate(billsListProvider),
      ),
    );
  }
}

class _BillCard extends ConsumerWidget {
  final dynamic bill;
  const _BillCard({required this.bill});

  String _formatCurrency(double val) {
    return NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    ).format(val);
  }

  Color _statusColor(String? status) {
    switch (status) {
      case 'paid':
        return AppColors.success;
      case 'overdue':
        return AppColors.error;
      case 'cancelled':
        return AppColors.textTertiary;
      default:
        return AppColors.warning;
    }
  }

  String _statusLabel(String? status) {
    switch (status) {
      case 'paid':
        return 'Lunas';
      case 'overdue':
        return 'Terlewat';
      case 'cancelled':
        return 'Dibatalkan';
      default:
        return 'Menunggu';
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dueDate = bill.dueDate != null
        ? DateFormat(
            'd MMM yyyy',
            'id_ID',
          ).format(DateTime.parse(bill.dueDate.toString()))
        : '';
    final status = bill.status?.toString() ?? 'pending';

    return InkWell(
          onTap: () => context.push('/bills/${bill.id}'),
          borderRadius: Dimens.brLg,
          child: Container(
            padding: Dimens.card,
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: Dimens.brLg,
              border: Border.all(color: AppColors.borderLight),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(Dimens.sm),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.1),
                    borderRadius: Dimens.brSm,
                  ),
                  child: const Icon(
                    Icons.receipt_rounded,
                    size: 20,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(width: Dimens.md),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        bill.name ?? bill.billName ?? 'Tagihan',
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                      const SizedBox(height: Dimens.xs),
                      Text(
                        dueDate,
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: Dimens.md),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      _formatCurrency(
                        (bill.amount ?? bill.amountDue ?? 0).toDouble(),
                      ),
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    const SizedBox(height: Dimens.xs),
                    StatusBadge(
                      label: _statusLabel(status),
                      color: _statusColor(status),
                    ),
                  ],
                ),
              ],
            ),
          ),
        )
        .animate()
        .fadeIn(delay: (50 * (bill.index ?? 0)).ms)
        .slideX(begin: 0.05, end: 0);
  }
}
