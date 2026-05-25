import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/dimens.dart';
import '../../../shared/repositories/repositories_provider.dart';
import '../../../shared/widgets/polish_widgets.dart';

class GoalDetailPage extends ConsumerWidget {
  final String goalId;

  const GoalDetailPage({super.key, required this.goalId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final goalAsync = ref.watch(goalDetailProvider(goalId));

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Detail Target'),
        actions: [
          IconButton(
            icon: const Icon(Icons.delete_outline_rounded),
            onPressed: () async {
              final confirm = await showDialog<bool>(
                context: context,
                builder: (ctx) => AlertDialog(
                  title: const Text('Hapus Target?'),
                  content: const Text('Tindakan ini tidak dapat dibatalkan.'),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(ctx, false),
                      child: const Text('Batal'),
                    ),
                    TextButton(
                      onPressed: () => Navigator.pop(ctx, true),
                      child: const Text(
                        'Hapus',
                        style: TextStyle(color: Colors.red),
                      ),
                    ),
                  ],
                ),
              );
              if (confirm == true && context.mounted) {
                await ref
                    .read(personalFinanceRepositoryProvider)
                    .cancelGoal(goalId);
                if (context.mounted) context.pop();
              }
            },
          ),
        ],
      ),
      body: goalAsync.when(
        data: (goal) => _buildContent(context, ref, goal),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => ErrorStateWidget(
          error: e.toString(),
          onRetry: () => ref.invalidate(goalDetailProvider(goalId)),
        ),
      ),
    );
  }

  Widget _buildContent(BuildContext context, WidgetRef ref, dynamic goal) {
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
    final remaining = goal.targetAmount - goal.currentAmount;
    final deadline = goal.targetDate != null
        ? DateTime.tryParse(goal.targetDate.toString())
        : null;

    return SingleChildScrollView(
      padding: Dimens.page,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: double.infinity,
            padding: Dimens.card,
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: Dimens.brLg,
              border: Border.all(color: AppColors.borderLight),
            ),
            child: Column(
              children: [
                Container(
                  padding: const EdgeInsets.all(Dimens.md),
                  decoration: BoxDecoration(
                    color: isCompleted
                        ? AppColors.successLight
                        : AppColors.primary.withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    isCompleted
                        ? Icons.check_circle_rounded
                        : Icons.track_changes_rounded,
                    size: 40,
                    color: isCompleted
                        ? AppColors.success
                        : AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: Dimens.lg),
                Text(
                  goal.name,
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
                const SizedBox(height: Dimens.xs),
                Text(
                  goal.goalType ?? goal.goal_type ?? 'saving',
                  style: Theme.of(context).textTheme.bodySmall,
                ),
                const SizedBox(height: Dimens.xl),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _StatItem(
                      label: 'Target',
                      value: currencyFormat.format(goal.targetAmount),
                    ),
                    _StatItem(
                      label: 'Terkumpul',
                      value: currencyFormat.format(goal.currentAmount),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: Dimens.lg),
          Container(
            width: double.infinity,
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
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Progres',
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    Text(
                      '${progress.toStringAsFixed(1)}%',
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                  ],
                ),
                const SizedBox(height: Dimens.md),
                ClipRRect(
                  borderRadius: Dimens.brXs,
                  child: LinearProgressIndicator(
                    value: (progress / 100).clamp(0, 1),
                    minHeight: 10,
                  ),
                ),
                const SizedBox(height: Dimens.sm),
                Text(
                  'Sisa: ${currencyFormat.format(remaining > 0 ? remaining : 0)}',
                  style: Theme.of(context).textTheme.bodySmall,
                ),
              ],
            ),
          ),
          const SizedBox(height: Dimens.lg),
          if (deadline != null)
            Container(
              padding: Dimens.card,
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: Dimens.brLg,
                border: Border.all(color: AppColors.borderLight),
              ),
              child: InfoRow(
                label: 'Tenggat',
                value: DateFormat('d MMMM yyyy', 'id_ID').format(deadline),
              ),
            ),
          if (!isCompleted) ...[
            const SizedBox(height: Dimens.xxl),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: () => _showAddFundsSheet(context, ref, goal),
                icon: const Icon(Icons.add_circle_outline_rounded),
                label: const Text('Tambahkan Dana'),
              ),
            ),
          ],
        ],
      ),
    );
  }

  void _showAddFundsSheet(BuildContext context, WidgetRef ref, dynamic goal) {
    final amountCtrl = TextEditingController();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom),
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
              Center(
                child: Container(
                  width: 36,
                  height: 4,
                  decoration: BoxDecoration(
                    color: AppColors.border,
                    borderRadius: Dimens.brXs,
                  ),
                ),
              ),
              const SizedBox(height: Dimens.xxl),
              Text(
                'Tambahkan Dana',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: Dimens.xl),
              TextField(
                controller: amountCtrl,
                decoration: const InputDecoration(
                  labelText: 'Jumlah',
                  hintText: 'Rp',
                ),
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: Dimens.xxl),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () async {
                    final amount = double.tryParse(
                      amountCtrl.text.replaceAll('.', '').replaceAll(',', '.'),
                    );
                    if (amount == null || amount <= 0) return;
                    Navigator.pop(ctx);
                    await ref
                        .read(personalFinanceRepositoryProvider)
                        .updateGoalProgress(goal.id.toString(), {
                          'current_amount': (goal.currentAmount + amount)
                              .toString(),
                        });
                    if (context.mounted) {
                      ref.invalidate(goalDetailProvider(goalId));
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Dana berhasil ditambahkan'),
                        ),
                      );
                    }
                  },
                  child: const Text('Simpan'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _StatItem extends StatelessWidget {
  final String label;
  final String value;
  const _StatItem({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(value, style: Theme.of(context).textTheme.titleLarge),
        const SizedBox(height: Dimens.xs),
        Text(label, style: Theme.of(context).textTheme.bodySmall),
      ],
    );
  }
}

final goalDetailProvider = FutureProvider.family((ref, String id) async {
  return ref.read(personalFinanceRepositoryProvider).getGoalDetail(id);
});
