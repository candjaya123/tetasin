import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/dimens.dart';
import '../../../shared/services/services_provider.dart';
import '../../../shared/widgets/polish_widgets.dart';
import '../../../shared/widgets/bill_summary_widget.dart';

class PersonalDashboardPage extends ConsumerWidget {
  const PersonalDashboardPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final netWorthAsync = ref.watch(_netWorthProvider);
    final currencyFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: Dimens.page,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Ringkasan Keuangan',
                style: Theme.of(context).textTheme.headlineMedium,
              ),
              const SizedBox(height: Dimens.xs),
              Text(
                'Pantau kekayaan bersih Anda',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              const SizedBox(height: Dimens.sectionGap),
              netWorthAsync.when(
                data: (data) =>
                    _buildNetWorthCard(context, data, currencyFormat),
                loading: () => Container(
                  padding: Dimens.card,
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: Dimens.brLg,
                    border: Border.all(color: AppColors.borderLight),
                  ),
                  child: const Center(
                    child: Padding(
                      padding: EdgeInsets.all(Dimens.xxxxl),
                      child: CircularProgressIndicator(),
                    ),
                  ),
                ),
                error: (e, _) => ErrorStateWidget(
                  error: e.toString(),
                  onRetry: () => ref.refresh(_netWorthProvider),
                ),
              ),
              const SizedBox(height: Dimens.md),
              const BillSummaryWidget(),
              const SizedBox(height: Dimens.sectionGap),
              Text('Aksi Cepat', style: Theme.of(context).textTheme.titleLarge),
              const SizedBox(height: Dimens.md),
              _QuickActionsGrid(ref: ref),
              const SizedBox(height: Dimens.sectionGap),
              Text(
                'Ringkasan Bulan Ini',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: Dimens.md),
              _MonthlySummarySection(),
              const SizedBox(height: Dimens.xxxl),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNetWorthCard(
    BuildContext context,
    Map<String, dynamic> data,
    NumberFormat currencyFormat,
  ) {
    final totalAset = (data['total_assets'] ?? data['totalAset'] ?? 0)
        .toDouble();
    final totalHutang = (data['total_liabilities'] ?? data['totalHutang'] ?? 0)
        .toDouble();
    final netWorth =
        (data['net_worth'] ?? data['netWorth'] ?? totalAset - totalHutang)
            .toDouble();

    return Container(
      width: double.infinity,
      padding: Dimens.cardV2,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppColors.primary,
            AppColors.primary.withValues(alpha: 0.85),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: Dimens.brLg,
        boxShadow: [Shadows.lg],
      ),
      child: Column(
        children: [
          Text(
            'Kekayaan Bersih',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              color: AppColors.onPrimary.withValues(alpha: 0.8),
            ),
          ),
          const SizedBox(height: Dimens.sm),
          Text(
            currencyFormat.format(netWorth),
            style: Theme.of(context).textTheme.displaySmall?.copyWith(
              color: AppColors.onPrimary,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: Dimens.lg),
          Row(
            children: [
              Expanded(
                child: _MiniStat(
                  label: 'Total Aset',
                  value: currencyFormat.format(totalAset),
                  color: AppColors.onPrimary,
                ),
              ),
              Container(
                width: 1,
                height: 36,
                color: AppColors.onPrimary.withValues(alpha: 0.3),
              ),
              Expanded(
                child: _MiniStat(
                  label: 'Total Hutang',
                  value: currencyFormat.format(totalHutang),
                  color: AppColors.onPrimary,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _MiniStat extends StatelessWidget {
  final String label;
  final String value;
  final Color color;

  const _MiniStat({
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          value,
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
            color: color,
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(height: Dimens.xs),
        Text(
          label,
          style: Theme.of(
            context,
          ).textTheme.bodySmall?.copyWith(color: color.withValues(alpha: 0.7)),
        ),
      ],
    );
  }
}

class _QuickActionsGrid extends StatelessWidget {
  final WidgetRef ref;

  const _QuickActionsGrid({required this.ref});

  void _recordIncome(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const _QuickEntrySheet(isIncome: true),
    ).then((_) => ref.refresh(_monthlySummaryProvider));
  }

  void _recordExpense(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const _QuickEntrySheet(isIncome: false),
    ).then((_) => ref.refresh(_monthlySummaryProvider));
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: _ActionCard(
            icon: Icons.trending_up_rounded,
            label: 'Catat\nPemasukan',
            color: AppColors.success,
            onTap: () => _recordIncome(context),
          ),
        ),
        const SizedBox(width: Dimens.md),
        Expanded(
          child: _ActionCard(
            icon: Icons.trending_down_rounded,
            label: 'Catat\nPengeluaran',
            color: AppColors.error,
            onTap: () => _recordExpense(context),
          ),
        ),
        const SizedBox(width: Dimens.md),
        Expanded(
          child: _ActionCard(
            icon: Icons.savings_rounded,
            label: 'Lihat\nAnggaran',
            color: AppColors.info,
            onTap: () => context.push('/budget'),
          ),
        ),
      ],
    );
  }
}

class _ActionCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _ActionCard({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.surface,
      borderRadius: Dimens.brLg,
      child: InkWell(
        onTap: onTap,
        borderRadius: Dimens.brLg,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: Dimens.xl),
          decoration: BoxDecoration(
            border: Border.all(color: AppColors.borderLight),
            borderRadius: Dimens.brLg,
          ),
          child: Column(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.1),
                  borderRadius: Dimens.brSm,
                ),
                child: Icon(icon, color: color, size: 22),
              ),
              const SizedBox(height: Dimens.md),
              Text(
                label,
                textAlign: TextAlign.center,
                style: Theme.of(
                  context,
                ).textTheme.bodySmall?.copyWith(fontWeight: FontWeight.w600),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _QuickEntrySheet extends ConsumerStatefulWidget {
  final bool isIncome;
  const _QuickEntrySheet({required this.isIncome});

  @override
  ConsumerState<_QuickEntrySheet> createState() => _QuickEntrySheetState();
}

class _QuickEntrySheetState extends ConsumerState<_QuickEntrySheet> {
  final _amountCtrl = TextEditingController();
  final _notesCtrl = TextEditingController();
  String? _accountId;
  bool _isLoading = false;

  @override
  void dispose() {
    _amountCtrl.dispose();
    _notesCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final amountText = _amountCtrl.text
        .replaceAll('.', '')
        .replaceAll(',', '.');
    final amount = double.tryParse(amountText);
    if (amount == null || amount <= 0) return;

    setState(() => _isLoading = true);
    try {
      if (widget.isIncome) {
        await ref.read(personalFinanceServiceProvider).recordIncome({
          'amount': amount,
          'notes': _notesCtrl.text,
          if (_accountId != null) 'coa_account_id': _accountId,
        });
      } else {
        await ref.read(personalFinanceServiceProvider).recordExpense({
          'amount': amount,
          'notes': _notesCtrl.text,
          if (_accountId != null) 'coa_account_id': _accountId,
        });
      }
      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              widget.isIncome ? 'Pemasukan tercatat' : 'Pengeluaran tercatat',
            ),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Gagal: $e')));
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      child: SingleChildScrollView(
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
                widget.isIncome ? 'Catat Pemasukan' : 'Catat Pengeluaran',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: Dimens.lg),
              TextFormField(
                controller: _amountCtrl,
                decoration: const InputDecoration(
                  labelText: 'Jumlah',
                  hintText: 'Rp',
                  prefixIcon: Icon(Icons.money_rounded),
                ),
                keyboardType: TextInputType.number,
                autofocus: true,
              ),
              const SizedBox(height: Dimens.lg),
              TextFormField(
                controller: _notesCtrl,
                decoration: const InputDecoration(
                  labelText: 'Catatan (opsional)',
                  prefixIcon: Icon(Icons.notes_rounded),
                ),
              ),
              const SizedBox(height: Dimens.xxl),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _submit,
                  child: _isLoading
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : Text(
                          widget.isIncome
                              ? 'Simpan Pemasukan'
                              : 'Simpan Pengeluaran',
                        ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _MonthlySummarySection extends ConsumerWidget {
  const _MonthlySummarySection();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final summaryAsync = ref.watch(_monthlySummaryProvider);
    final currencyFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );

    return summaryAsync.when(
      data: (data) {
        final income = (data['income'] ?? 0).toDouble();
        final expense = (data['expense'] ?? data['expenses'] ?? 0).toDouble();
        final balance = income - expense;

        return Column(
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
                  Row(
                    children: [
                      Expanded(
                        child: StatCard(
                          label: 'Pemasukan',
                          value: currencyFormat.format(income),
                          icon: Icons.trending_up_rounded,
                          color: AppColors.success,
                        ),
                      ),
                      const SizedBox(width: Dimens.md),
                      Expanded(
                        child: StatCard(
                          label: 'Pengeluaran',
                          value: currencyFormat.format(expense),
                          icon: Icons.trending_down_rounded,
                          color: AppColors.error,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: Dimens.md),
                  Row(
                    children: [
                      Expanded(
                        child: StatCard(
                          label: 'Saldo Bersih',
                          value: currencyFormat.format(balance),
                          icon: Icons.account_balance_wallet_rounded,
                          color: balance >= 0
                              ? AppColors.info
                              : AppColors.error,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        );
      },
      loading: () => SkeletonLoader.card(),
      error: (e, _) => ErrorStateWidget(
        error: e.toString(),
        onRetry: () => ref.refresh(_monthlySummaryProvider),
      ),
    );
  }
}

final _netWorthProvider = FutureProvider<Map<String, dynamic>>((ref) {
  return ref.read(personalFinanceServiceProvider).getNetWorth();
});

final _monthlySummaryProvider = FutureProvider<Map<String, dynamic>>((ref) {
  final now = DateTime.now();
  return ref
      .read(personalFinanceServiceProvider)
      .getSummary(month: now.month, year: now.year);
});
