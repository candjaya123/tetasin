import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/dimens.dart';
import '../../../shared/models/recurring_transaction.dart';
import '../../../shared/widgets/coa_picker.dart';
import '../../../shared/widgets/polish_widgets.dart';
import '../../../shared/widgets/premium_gate.dart';
import '../../../shared/widgets/upgrade_banner.dart';
import '../../auth/providers/auth_provider.dart';
import 'recurring_provider.dart';

class RecurringListPage extends ConsumerWidget {
  const RecurringListPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final tier = ref.watch(authProvider).tenant?.tier ?? 'free';
    final isPremium = tier != 'free';

    final content = _buildContent(context, ref);

    if (!isPremium) {
      return Scaffold(
        backgroundColor: AppColors.background,
        body: PremiumGate(
          featureName: 'Transaksi Berulang',
          requiredTier: 'Premium',
          child: content,
        ),
      );
    }

    return content;
  }

  Widget _buildContent(BuildContext context, WidgetRef ref) {
    final tier = ref.watch(authProvider).tenant?.tier ?? 'free';
    final listAsync = ref.watch(recurringListProvider);
    final currencyFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Transaksi Berulang')),
      body: Column(
        children: [
          if (tier == 'free') UpgradeBanner(tier: 'Premium'),
          Expanded(
            child: listAsync.when(
              data: (items) {
                if (items.isEmpty) return _buildEmptyState(context, ref);
                return RefreshIndicator(
                  onRefresh: () async => ref.refresh(recurringListProvider),
                  child: ListView.builder(
                    padding: Dimens.page,
                    itemCount: items.length,
                    itemBuilder: (_, i) => Padding(
                      padding: const EdgeInsets.only(bottom: Dimens.md),
                      child: _RecurringCard(
                        item: items[i],
                        currencyFormat: currencyFormat,
                      ),
                    ),
                  ),
                );
              },
              loading: () => ListView.builder(
                padding: Dimens.page,
                itemCount: 4,
                itemBuilder: (_, __) => Padding(
                  padding: const EdgeInsets.only(bottom: Dimens.md),
                  child: SkeletonLoader.card(),
                ),
              ),
              error: (e, _) => ErrorStateWidget(
                error: e.toString(),
                onRetry: () => ref.refresh(recurringListProvider),
              ),
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showCreateSheet(context, ref),
        child: const Icon(Icons.add_rounded),
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context, WidgetRef ref) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(Dimens.xxxl),
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
                Icons.repeat_rounded,
                size: 40,
                color: AppColors.textTertiary,
              ),
            ),
            const SizedBox(height: Dimens.xxl),
            Text(
              'Belum ada transaksi berulang',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: Dimens.sm),
            Text(
              'Tambahkan transaksi berulang untuk\nmengotomatiskan pencatatan rutin',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ],
        ),
      ),
    );
  }

  void _showCreateSheet(BuildContext context, WidgetRef ref) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _RecurringFormSheet(
        onSubmit: (data) async {
          await ref.read(recurringNotifierProvider.notifier).create(data);
        },
      ),
    );
  }
}

class _RecurringCard extends ConsumerWidget {
  final RecurringTransaction item;
  final NumberFormat currencyFormat;

  const _RecurringCard({required this.item, required this.currencyFormat});

  String _frequencyLabel(String freq) {
    switch (freq) {
      case 'daily':
        return 'Harian';
      case 'weekly':
        return 'Mingguan';
      case 'monthly':
        return 'Bulanan';
      case 'yearly':
        return 'Tahunan';
      default:
        return freq;
    }
  }

  String _directionLabel(String dir) {
    switch (dir) {
      case 'in':
        return 'Masuk';
      case 'out':
        return 'Keluar';
      default:
        return dir;
    }
  }

  Color _directionColor(String dir) {
    return dir == 'in' ? AppColors.success : AppColors.error;
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final nextDue = item.nextDueDate.isNotEmpty
        ? DateFormat(
            'd MMM yyyy',
            'id_ID',
          ).format(DateTime.parse(item.nextDueDate))
        : '';

    return Container(
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
                  color: _directionColor(item.direction).withValues(alpha: 0.1),
                  borderRadius: Dimens.brSm,
                ),
                child: Icon(
                  item.direction == 'in'
                      ? Icons.trending_up_rounded
                      : Icons.trending_down_rounded,
                  size: 20,
                  color: _directionColor(item.direction),
                ),
              ),
              const SizedBox(width: Dimens.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.name,
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    const SizedBox(height: Dimens.xs),
                    Row(
                      children: [
                        Text(
                          _directionLabel(item.direction),
                          style: Theme.of(context).textTheme.bodySmall
                              ?.copyWith(
                                color: _directionColor(item.direction),
                                fontWeight: FontWeight.w600,
                              ),
                        ),
                        const SizedBox(width: Dimens.sm),
                        Container(
                          width: 4,
                          height: 4,
                          decoration: const BoxDecoration(
                            color: AppColors.textTertiary,
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: Dimens.sm),
                        Text(
                          _frequencyLabel(item.frequency),
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    currencyFormat.format(item.amount),
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  if (nextDue.isNotEmpty) ...[
                    const SizedBox(height: Dimens.xs),
                    Text(
                      'Berikutnya: $nextDue',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: AppColors.textTertiary,
                        fontSize: 10,
                      ),
                    ),
                  ],
                ],
              ),
            ],
          ),
          const SizedBox(height: Dimens.md),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Text(
                    item.isActive ? 'Aktif' : 'Nonaktif',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: item.isActive
                          ? AppColors.success
                          : AppColors.textTertiary,
                    ),
                  ),
                  Switch(
                    value: item.isActive,
                    onChanged: (v) {
                      ref
                          .read(recurringNotifierProvider.notifier)
                          .toggleActive(item.id, v);
                    },
                    materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                ],
              ),
              Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.play_arrow_rounded, size: 20),
                    tooltip: 'Jalankan sekarang',
                    onPressed: () {
                      ref
                          .read(recurringNotifierProvider.notifier)
                          .triggerNow(item.id);
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Transaksi berulang dijalankan'),
                        ),
                      );
                    },
                  ),
                  IconButton(
                    icon: const Icon(Icons.delete_outline_rounded, size: 20),
                    tooltip: 'Hapus',
                    color: AppColors.error,
                    onPressed: () async {
                      final confirm = await showDialog<bool>(
                        context: context,
                        builder: (ctx) => AlertDialog(
                          title: const Text('Hapus Transaksi?'),
                          content: const Text(
                            'Transaksi berulang ini akan dihapus.',
                          ),
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
                      if (confirm == true) {
                        ref
                            .read(recurringNotifierProvider.notifier)
                            .delete(item.id);
                      }
                    },
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _RecurringFormSheet extends ConsumerStatefulWidget {
  final Future<void> Function(Map<String, dynamic>) onSubmit;

  const _RecurringFormSheet({required this.onSubmit});

  @override
  ConsumerState<_RecurringFormSheet> createState() =>
      _RecurringFormSheetState();
}

class _RecurringFormSheetState extends ConsumerState<_RecurringFormSheet> {
  final _nameCtrl = TextEditingController();
  final _amountCtrl = TextEditingController();
  String _direction = 'out';
  String? _debitAccountId;
  String? _creditAccountId;
  String _frequency = 'monthly';
  int _dayOfPeriod = 1;
  DateTime? _startDate;
  bool _isLoading = false;

  @override
  void dispose() {
    _nameCtrl.dispose();
    _amountCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _startDate ?? DateTime.now(),
      firstDate: DateTime(2020),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (picked != null) setState(() => _startDate = picked);
  }

  Future<void> _submit() async {
    if (_nameCtrl.text.isEmpty) return;
    final amountText = _amountCtrl.text
        .replaceAll('.', '')
        .replaceAll(',', '.');
    final amount = double.tryParse(amountText);
    if (amount == null || amount <= 0) return;

    setState(() => _isLoading = true);
    try {
      await widget.onSubmit({
        'name': _nameCtrl.text,
        'amount': amount,
        'direction': _direction,
        'debit_account_id': _debitAccountId ?? '',
        'credit_account_id': _creditAccountId ?? '',
        'frequency': _frequency,
        'day_of_period': _dayOfPeriod,
        if (_startDate != null)
          'next_due_date': DateFormat('yyyy-MM-dd').format(_startDate!),
      });
      if (mounted) Navigator.pop(context);
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
    return Container(
      decoration: const BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.vertical(top: Dimens.radiusXl),
      ),
      child: Padding(
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
                  'Transaksi Berulang',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: Dimens.xl),
                TextFormField(
                  controller: _nameCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Nama Transaksi',
                    hintText: 'Cth: Bayar Listrik',
                    prefixIcon: Icon(Icons.label_rounded),
                  ),
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
                ),
                const SizedBox(height: Dimens.lg),
                DropdownButtonFormField<String>(
                  initialValue: _direction,
                  decoration: const InputDecoration(
                    labelText: 'Arah Transaksi',
                    prefixIcon: Icon(Icons.swap_horiz_rounded),
                  ),
                  items: const [
                    DropdownMenuItem(
                      value: 'out',
                      child: Text('Keluar (Pengeluaran)'),
                    ),
                    DropdownMenuItem(
                      value: 'in',
                      child: Text('Masuk (Pemasukan)'),
                    ),
                  ],
                  onChanged: (v) => setState(() => _direction = v!),
                ),
                const SizedBox(height: Dimens.lg),
                CoaPicker(
                  label: _direction == 'in'
                      ? 'Akun Debit'
                      : 'Akun Debit (Dana Masuk)',
                  hintText: 'Pilih akun',
                  onChanged: (v) => _debitAccountId = v,
                ),
                const SizedBox(height: Dimens.lg),
                CoaPicker(
                  label: _direction == 'out'
                      ? 'Akun Kredit (Sumber Dana)'
                      : 'Akun Kredit',
                  hintText: 'Pilih akun',
                  onChanged: (v) => _creditAccountId = v,
                ),
                const SizedBox(height: Dimens.lg),
                DropdownButtonFormField<String>(
                  initialValue: _frequency,
                  decoration: const InputDecoration(
                    labelText: 'Frekuensi',
                    prefixIcon: Icon(Icons.repeat_rounded),
                  ),
                  items: const [
                    DropdownMenuItem(value: 'daily', child: Text('Harian')),
                    DropdownMenuItem(value: 'weekly', child: Text('Mingguan')),
                    DropdownMenuItem(value: 'monthly', child: Text('Bulanan')),
                    DropdownMenuItem(value: 'yearly', child: Text('Tahunan')),
                  ],
                  onChanged: (v) => setState(() => _frequency = v!),
                ),
                const SizedBox(height: Dimens.lg),
                InkWell(
                  onTap: _pickDate,
                  borderRadius: Dimens.brSm,
                  child: InputDecorator(
                    decoration: const InputDecoration(
                      labelText: 'Tanggal Mulai',
                      prefixIcon: Icon(Icons.calendar_month_rounded),
                      suffixIcon: Icon(Icons.arrow_drop_down_rounded),
                    ),
                    child: Text(
                      _startDate != null
                          ? DateFormat(
                              'd MMMM yyyy',
                              'id_ID',
                            ).format(_startDate!)
                          : 'Pilih tanggal',
                    ),
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
                        : const Text('Simpan'),
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
