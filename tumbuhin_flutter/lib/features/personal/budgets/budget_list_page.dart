import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/dimens.dart';
import '../../../shared/services/budget_service.dart';
import '../../../shared/widgets/polish_widgets.dart';
import '../../reports/providers/budget_providers.dart';
import '../../reports/widgets/add_budget_sheet.dart';

class BudgetListPage extends ConsumerWidget {
  const BudgetListPage({super.key});

  String _formatCurrency(double val) {
    return NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    ).format(val);
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentMonth = ref.watch(budgetMonthProvider);
    final budgetsAsync = ref.watch(budgetsProvider(currentMonth));
    final summaryAsync = ref.watch(budgetSummaryProvider(currentMonth));

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Anggaran')),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(budgetsProvider(currentMonth));
          return await ref.read(budgetsProvider(currentMonth).future);
        },
        child: ListView(
          padding: Dimens.page,
          children: [
            _buildHeader(context, ref, currentMonth),
            const SizedBox(height: Dimens.sectionGap),
            summaryAsync.when(
              data: (summary) => _buildSummaryCard(context, summary),
              loading: () => SkeletonLoader.card(),
              error: (err, _) => ErrorStateWidget(
                error: 'Error: $err',
                onRetry: () =>
                    ref.invalidate(budgetSummaryProvider(currentMonth)),
              ),
            ),
            const SizedBox(height: Dimens.xxl),
            budgetsAsync.when(
              data: (budgets) {
                if (budgets.isEmpty) return _buildEmptyState(context);
                return Column(
                  children: budgets
                      .map((b) => _buildBudgetCard(context, ref, b))
                      .toList(),
                );
              },
              loading: () => Column(
                children: List.generate(
                  3,
                  (_) => Padding(
                    padding: const EdgeInsets.only(bottom: Dimens.md),
                    child: SkeletonLoader.card(),
                  ),
                ),
              ),
              error: (err, _) => ErrorStateWidget(
                error: 'Gagal memuat: $err',
                onRetry: () => ref.invalidate(budgetsProvider(currentMonth)),
              ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          showModalBottomSheet(
            context: context,
            isScrollControlled: true,
            backgroundColor: Colors.transparent,
            builder: (context) => const AddBudgetSheet(),
          );
        },
        child: const Icon(Icons.add_rounded),
      ),
    );
  }

  Widget _buildHeader(
    BuildContext context,
    WidgetRef ref,
    String currentMonth,
  ) {
    final date = DateFormat('yyyy-MM').parse(currentMonth);

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          DateFormat('MMMM yyyy', 'id_ID').format(date),
          style: Theme.of(context).textTheme.titleLarge,
        ),
        Row(
          children: [
            IconButton(
              icon: const Icon(Icons.chevron_left_rounded),
              onPressed: () {
                final prev = DateFormat(
                  'yyyy-MM',
                ).format(DateTime(date.year, date.month - 1));
                ref.read(budgetMonthProvider.notifier).state = prev;
              },
            ),
            IconButton(
              icon: const Icon(Icons.chevron_right_rounded),
              onPressed: () {
                final next = DateFormat(
                  'yyyy-MM',
                ).format(DateTime(date.year, date.month + 1));
                ref.read(budgetMonthProvider.notifier).state = next;
              },
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildSummaryCard(BuildContext context, Map<String, dynamic> summary) {
    final totalBudget = (summary['total_budget'] as num).toDouble();
    final totalSpent = (summary['total_spent'] as num).toDouble();
    final percentage = (summary['percentage'] as num).toDouble();
    final totalRemaining = (summary['total_remaining'] as num).toDouble();

    return Container(
      padding: const EdgeInsets.all(Dimens.xxl),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [AppColors.primary, AppColors.primary.withValues(alpha: 0.8)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: Dimens.brLg,
        boxShadow: [Shadows.lg],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'TOTAL ANGGARAN',
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
              color: AppColors.onPrimary.withValues(alpha: 0.6),
            ),
          ),
          const SizedBox(height: Dimens.sm),
          Text(
            _formatCurrency(totalBudget),
            style: Theme.of(
              context,
            ).textTheme.headlineMedium?.copyWith(color: AppColors.onPrimary),
          ),
          const SizedBox(height: Dimens.sectionGap),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'TERPAKAI',
                      style: Theme.of(context).textTheme.labelSmall?.copyWith(
                        color: AppColors.onPrimary.withValues(alpha: 0.6),
                      ),
                    ),
                    const SizedBox(height: Dimens.xs),
                    Text(
                      _formatCurrency(totalSpent),
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        color: AppColors.onPrimary,
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: Dimens.lg,
                  vertical: Dimens.sm,
                ),
                decoration: BoxDecoration(
                  color: AppColors.onPrimary.withValues(alpha: 0.2),
                  borderRadius: Dimens.brMd,
                ),
                child: Text(
                  '${(percentage * 100).toStringAsFixed(0)}%',
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w900,
                    color: AppColors.onPrimary,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: Dimens.md),
          ClipRRect(
            borderRadius: Dimens.brXs,
            child: LinearProgressIndicator(
              value: percentage.clamp(0, 1),
              minHeight: 8,
              backgroundColor: AppColors.onPrimary.withValues(alpha: 0.2),
              valueColor: const AlwaysStoppedAnimation<Color>(
                AppColors.onPrimary,
              ),
            ),
          ),
          const SizedBox(height: Dimens.xs),
          Text(
            'Sisa: ${_formatCurrency(totalRemaining)}',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: AppColors.onPrimary.withValues(alpha: 0.7),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBudgetCard(
    BuildContext context,
    WidgetRef ref,
    Map<String, dynamic> budget,
  ) {
    final double limit = (budget['limit_amount'] ?? 0).toDouble();
    final double spent = (budget['current_spent'] ?? 0).toDouble();
    final double percent = limit > 0 ? (spent / limit) : 0;

    Color progressColor = AppColors.primary;
    if (percent >= 1.0) {
      progressColor = AppColors.error;
    } else if (percent >= 0.8) {
      progressColor = AppColors.warning;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: Dimens.md),
      padding: Dimens.card,
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: Dimens.brLg,
        border: Border.all(color: AppColors.borderLight),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  budget['category_name'] ?? 'Kategori',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
              ),
              Row(
                children: [
                  IconButton(
                    icon: const Icon(
                      Icons.edit_outlined,
                      size: 18,
                      color: AppColors.textTertiary,
                    ),
                    onPressed: () {
                      showModalBottomSheet(
                        context: context,
                        isScrollControlled: true,
                        backgroundColor: Colors.transparent,
                        builder: (context) =>
                            AddBudgetSheet(initialBudget: budget),
                      );
                    },
                  ),
                  IconButton(
                    icon: const Icon(
                      Icons.delete_outline_rounded,
                      size: 18,
                      color: AppColors.error,
                    ),
                    onPressed: () => _handleDelete(context, ref, budget),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: Dimens.md),
          ClipRRect(
            borderRadius: Dimens.brXs,
            child: LinearProgressIndicator(
              value: percent > 1.0 ? 1.0 : percent,
              minHeight: 10,
              backgroundColor: progressColor.withValues(alpha: 0.1),
              valueColor: AlwaysStoppedAnimation<Color>(progressColor),
            ),
          ),
          const SizedBox(height: Dimens.md),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'TERPAKAI',
                    style: Theme.of(context).textTheme.labelSmall,
                  ),
                  Text(
                    _formatCurrency(spent),
                    style: Theme.of(context).textTheme.titleSmall,
                  ),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text('LIMIT', style: Theme.of(context).textTheme.labelSmall),
                  Text(
                    _formatCurrency(limit),
                    style: Theme.of(context).textTheme.titleSmall?.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  Future<void> _handleDelete(
    BuildContext context,
    WidgetRef ref,
    Map<String, dynamic> budget,
  ) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Hapus Anggaran?'),
        content: Text(
          'Anda akan menghapus anggaran untuk kategori ${budget['category_name']}.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Batal'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Hapus', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );

    if (confirm == true) {
      try {
        final service = ref.read(budgetServiceProvider);
        await service.deleteBudget(budget['id']);
        final month = ref.read(budgetMonthProvider);
        ref.invalidate(budgetsProvider(month));
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Anggaran berhasil dihapus')),
          );
        }
      } catch (e) {
        if (context.mounted) {
          ScaffoldMessenger.of(
            context,
          ).showSnackBar(SnackBar(content: Text('Gagal menghapus: $e')));
        }
      }
    }
  }

  Widget _buildEmptyState(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: Dimens.xxxl),
        child: Column(
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: AppColors.surfaceSecondary,
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.savings_outlined,
                size: 40,
                color: AppColors.textTertiary,
              ),
            ),
            const SizedBox(height: Dimens.xxl),
            Text(
              'Belum Ada Anggaran',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: Dimens.sm),
            Text(
              'Mulai atur pengeluaran Anda agar\ntetap hemat dan terencana.',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ],
        ),
      ),
    );
  }
}
