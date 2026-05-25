import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/dimens.dart';
import '../../shared/repositories/repositories_provider.dart';
import '../../shared/widgets/polish_widgets.dart';

class GoalsScreen extends ConsumerWidget {
  const GoalsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final goalsAsync = ref.watch(goalsListProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: Dimens.page,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Target Keuangan',
                style: Theme.of(context).textTheme.headlineMedium,
              ),
              const SizedBox(height: Dimens.xs),
              Text(
                'Wujudkan tujuan finansial Anda',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              const SizedBox(height: Dimens.sectionGap),
              goalsAsync.when(
                data: (goals) => goals.isEmpty
                    ? _buildEmptyState(context, ref)
                    : Column(
                        children: goals
                            .map(
                              (goal) => Padding(
                                padding: const EdgeInsets.only(
                                  bottom: Dimens.md,
                                ),
                                child: _GoalCard(goal: goal),
                              ),
                            )
                            .toList(),
                      ),
                loading: () => ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: 3,
                  itemBuilder: (_, __) => Padding(
                    padding: const EdgeInsets.only(bottom: Dimens.md),
                    child: SkeletonLoader.card(),
                  ),
                ),
                error: (e, s) => ErrorStateWidget(
                  error: e.toString(),
                  onRetry: () => ref.refresh(goalsListProvider),
                ),
              ),
            ],
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showCreateGoalSheet(context, ref),
        child: const Icon(Icons.add_rounded),
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context, WidgetRef ref) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.only(top: 80),
        child: Column(
          children: [
            Container(
              width: 88,
              height: 88,
              decoration: BoxDecoration(
                color: AppColors.surfaceSecondary,
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.track_changes_rounded,
                size: 40,
                color: AppColors.textTertiary,
              ),
            ),
            const SizedBox(height: Dimens.xxl),
            Text(
              'Belum ada target',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: Dimens.sm),
            Text(
              'Buat target untuk mulai menabung\nmencapai tujuan Anda',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ],
        ),
      ),
    );
  }

  void _showCreateGoalSheet(BuildContext context, WidgetRef ref) {
    final nameCtrl = TextEditingController();
    final amountCtrl = TextEditingController();
    String goalType = 'saving';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setSheetState) => Container(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(ctx).viewInsets.bottom,
          ),
          decoration: const BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.vertical(top: Dimens.radiusXl),
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
              crossAxisAlignment: CrossAxisAlignment.start,
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
                  'Target Baru',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: Dimens.xl),
                TextField(
                  controller: nameCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Nama Target',
                    hintText: 'Cth: Beli Laptop',
                  ),
                ),
                const SizedBox(height: Dimens.lg),
                TextField(
                  controller: amountCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Jumlah Target',
                    hintText: 'Rp',
                  ),
                  keyboardType: TextInputType.number,
                ),
                const SizedBox(height: Dimens.lg),
                DropdownButtonFormField<String>(
                  initialValue: goalType,
                  decoration: const InputDecoration(labelText: 'Tipe Target'),
                  items: const [
                    DropdownMenuItem(value: 'saving', child: Text('Tabungan')),
                    DropdownMenuItem(
                      value: 'debt_payment',
                      child: Text('Bayar Hutang'),
                    ),
                    DropdownMenuItem(
                      value: 'investment',
                      child: Text('Investasi'),
                    ),
                    DropdownMenuItem(value: 'custom', child: Text('Lainnya')),
                  ],
                  onChanged: (v) => setSheetState(() => goalType = v!),
                ),
                const SizedBox(height: Dimens.xxl),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () async {
                      if (nameCtrl.text.isEmpty || amountCtrl.text.isEmpty)
                        return;
                      Navigator.pop(ctx);
                      await ref
                          .read(personalFinanceRepositoryProvider)
                          .createGoal({
                            'name': nameCtrl.text,
                            'goal_type': goalType,
                            'target_amount': double.parse(
                              amountCtrl.text
                                  .replaceAll('.', '')
                                  .replaceAll(',', '.'),
                            ),
                          });
                      ref.invalidate(goalsListProvider);
                    },
                    child: const Text('Simpan'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _GoalCard extends ConsumerWidget {
  final dynamic goal;

  const _GoalCard({required this.goal});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currencyFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );
    final progress =
        goal.progressPct ??
        (goal.targetAmount > 0
            ? (goal.currentAmount / goal.targetAmount * 100)
            : 0);
    final isCompleted = goal.status == 'completed' || progress >= 100;

    return InkWell(
      onTap: () => context.push('/goals/${goal.id}'),
      borderRadius: Dimens.brLg,
      child: Container(
        padding: Dimens.card,
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: Dimens.brLg,
          border: Border.all(color: AppColors.borderLight),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(Dimens.sm),
                  decoration: BoxDecoration(
                    color: isCompleted
                        ? AppColors.successLight
                        : AppColors.primary.withValues(alpha: 0.1),
                    borderRadius: Dimens.brSm,
                  ),
                  child: Icon(
                    isCompleted
                        ? Icons.check_circle_rounded
                        : Icons.track_changes_rounded,
                    color: isCompleted
                        ? AppColors.success
                        : AppColors.textPrimary,
                    size: 20,
                  ),
                ),
                const SizedBox(width: Dimens.md),
                Expanded(
                  child: Text(
                    goal.name,
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                ),
                if (isCompleted)
                  StatusBadge(label: 'Tercapai', color: AppColors.success),
              ],
            ),
            const SizedBox(height: Dimens.lg),
            ClipRRect(
              borderRadius: Dimens.brXs,
              child: LinearProgressIndicator(
                value: (progress / 100).clamp(0, 1),
                minHeight: 8,
              ),
            ),
            const SizedBox(height: Dimens.sm),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${progress.toStringAsFixed(1)}%',
                  style: Theme.of(
                    context,
                  ).textTheme.bodySmall?.copyWith(fontWeight: FontWeight.w600),
                ),
                Text(
                  '${currencyFormat.format(goal.currentAmount)} / ${currencyFormat.format(goal.targetAmount)}',
                  style: Theme.of(context).textTheme.bodySmall,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

final goalsListProvider = FutureProvider((ref) {
  return ref.read(personalFinanceRepositoryProvider).getGoals();
});
