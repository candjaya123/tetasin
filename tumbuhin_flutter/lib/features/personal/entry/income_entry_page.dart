import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/dimens.dart';
import '../../../features/reports/providers/report_providers.dart';
import '../../../shared/widgets/polish_widgets.dart';

class IncomeEntryPage extends ConsumerStatefulWidget {
  const IncomeEntryPage({super.key});

  @override
  ConsumerState<IncomeEntryPage> createState() => _IncomeEntryPageState();
}

class _IncomeEntryPageState extends ConsumerState<IncomeEntryPage> {
  final _formKey = GlobalKey<FormState>();
  final _amountController = TextEditingController();
  final _descController = TextEditingController();
  DateTime _selectedDate = DateTime.now();
  Map<String, dynamic>? _selectedCategoryAccount;
  Map<String, dynamic>? _selectedPaymentAccount;
  bool _isSubmitting = false;
  bool _triedSubmit = false;

  @override
  void dispose() {
    _amountController.dispose();
    _descController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final coaAsync = ref.watch(coaProvider);
    final currencyFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Catat Pemasukan')),
      body: SingleChildScrollView(
        padding: Dimens.page,
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              TextFormField(
                controller: _amountController,
                keyboardType: TextInputType.number,
                style: Theme.of(context).textTheme.headlineMedium,
                decoration: InputDecoration(
                  labelText: 'Nominal (Rp)',
                  prefixText: 'Rp ',
                  border: OutlineInputBorder(borderRadius: Dimens.brMd),
                ),
                validator: (v) => v == null || v.isEmpty ? 'Wajib diisi' : null,
              ),
              const SizedBox(height: Dimens.lg),
              coaAsync.when(
                data: (accounts) {
                  final categoryAccounts = accounts.where((a) {
                    final type = (a['type'] ?? '').toString().toLowerCase();
                    final code = (a['code'] ?? '').toString();
                    return type == 'income' ||
                        type == 'pendapatan' ||
                        type == 'revenue' ||
                        code.startsWith('4-');
                  }).toList();

                  final paymentAccounts = accounts.where((a) {
                    final type = (a['type'] ?? '').toString().toLowerCase();
                    final code = (a['code'] ?? '').toString();
                    return (type == 'asset' ||
                            type == 'assets' ||
                            type == 'aset') &&
                        (code.startsWith('1-10') ||
                            code.startsWith('1-11') ||
                            code == '1110' ||
                            code == '1120' ||
                            code.startsWith('1'));
                  }).toList();

                  final categoryName =
                      _selectedCategoryAccount?['name'] ?? 'Pilih Kategori';
                  final paymentName =
                      _selectedPaymentAccount?['name'] ?? 'Masuk ke Rekening';

                  return Column(
                    children: [
                      _buildSelectionField(
                        label: 'Kategori Pemasukan',
                        value: categoryName,
                        icon: Icons.trending_up_rounded,
                        onTap: () => _showAccountSelector(
                          context,
                          categoryAccounts,
                          isCategory: true,
                        ),
                        hasError:
                            _triedSubmit && _selectedCategoryAccount == null,
                      ),
                      const SizedBox(height: Dimens.lg),
                      _buildSelectionField(
                        label: 'Penyimpanan',
                        value: paymentName,
                        icon: Icons.account_balance_wallet_rounded,
                        onTap: () => _showAccountSelector(
                          context,
                          paymentAccounts,
                          isCategory: false,
                        ),
                        hasError:
                            _triedSubmit && _selectedPaymentAccount == null,
                      ),
                    ],
                  );
                },
                loading: () => const Center(
                  child: Padding(
                    padding: EdgeInsets.all(Dimens.xxxl),
                    child: CircularProgressIndicator(),
                  ),
                ),
                error: (e, _) => Container(
                  padding: const EdgeInsets.all(Dimens.md),
                  decoration: BoxDecoration(
                    color: AppColors.errorLight,
                    borderRadius: Dimens.brMd,
                  ),
                  child: Text(
                    'Gagal memuat daftar akun. Pastikan backend berjalan.',
                    style: Theme.of(
                      context,
                    ).textTheme.bodySmall?.copyWith(color: AppColors.error),
                  ),
                ),
              ),
              const SizedBox(height: Dimens.lg),
              InkWell(
                onTap: () async {
                  final picked = await showDatePicker(
                    context: context,
                    initialDate: _selectedDate,
                    firstDate: DateTime(2020),
                    lastDate: DateTime.now(),
                  );
                  if (picked != null) {
                    setState(() => _selectedDate = picked);
                  }
                },
                borderRadius: Dimens.brMd,
                child: Container(
                  padding: Dimens.input,
                  decoration: BoxDecoration(
                    border: Border.all(color: AppColors.border),
                    borderRadius: Dimens.brMd,
                  ),
                  child: Row(
                    children: [
                      const Icon(
                        Icons.calendar_today_rounded,
                        color: AppColors.textTertiary,
                        size: 24,
                      ),
                      const SizedBox(width: Dimens.lg),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Tanggal',
                              style: Theme.of(context).textTheme.bodySmall
                                  ?.copyWith(color: AppColors.textTertiary),
                            ),
                            Text(
                              DateFormat(
                                'd MMMM yyyy',
                                'id_ID',
                              ).format(_selectedDate),
                              style: Theme.of(context).textTheme.bodyLarge,
                            ),
                          ],
                        ),
                      ),
                      const Icon(
                        Icons.chevron_right_rounded,
                        color: AppColors.textTertiary,
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: Dimens.lg),
              TextFormField(
                controller: _descController,
                decoration: InputDecoration(
                  labelText: 'Keterangan',
                  hintText: 'Contoh: Gaji bulanan, bonus...',
                  border: OutlineInputBorder(borderRadius: Dimens.brMd),
                ),
                maxLines: 2,
              ),
              const SizedBox(height: Dimens.xxxl),
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: _isSubmitting ? null : _submit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.black,
                    foregroundColor: AppColors.primary,
                    shape: RoundedRectangleBorder(borderRadius: Dimens.brMd),
                  ),
                  child: _isSubmitting
                      ? const SizedBox(
                          width: 24,
                          height: 24,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: AppColors.primary,
                          ),
                        )
                      : const Text(
                          'Simpan Pemasukan',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                          ),
                        ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSelectionField({
    required String label,
    required String value,
    required IconData icon,
    required VoidCallback onTap,
    required bool hasError,
  }) {
    final isPlaceholder =
        value.startsWith('Pilih') || value.startsWith('Masuk');
    return InkWell(
      onTap: onTap,
      borderRadius: Dimens.brMd,
      child: Container(
        padding: const EdgeInsets.symmetric(
          horizontal: Dimens.lg,
          vertical: Dimens.lg,
        ),
        decoration: BoxDecoration(
          border: Border.all(
            color: hasError ? AppColors.error : AppColors.border,
            width: hasError ? 1.5 : 1.0,
          ),
          borderRadius: Dimens.brMd,
          color: hasError ? AppColors.errorLight : AppColors.surface,
        ),
        child: Row(
          children: [
            Icon(
              icon,
              color: hasError ? AppColors.error : AppColors.textTertiary,
              size: 24,
            ),
            const SizedBox(width: Dimens.lg),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: hasError
                          ? AppColors.error
                          : AppColors.textTertiary,
                    ),
                  ),
                  const SizedBox(height: Dimens.xs),
                  Text(
                    value,
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      fontWeight: isPlaceholder
                          ? FontWeight.normal
                          : FontWeight.bold,
                      color: isPlaceholder
                          ? (hasError
                                ? AppColors.error
                                : AppColors.textTertiary)
                          : AppColors.textPrimary,
                    ),
                  ),
                ],
              ),
            ),
            Icon(
              Icons.chevron_right_rounded,
              color: hasError ? AppColors.error : AppColors.textTertiary,
            ),
          ],
        ),
      ),
    );
  }

  void _showAccountSelector(
    BuildContext context,
    List<dynamic> accounts, {
    required bool isCategory,
  }) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Dimens.radiusXl),
      ),
      builder: (ctx) {
        return DraggableScrollableSheet(
          initialChildSize: 0.6,
          minChildSize: 0.4,
          maxChildSize: 0.9,
          expand: false,
          builder: (ctx, scrollController) {
            return Column(
              children: [
                Padding(
                  padding: const EdgeInsets.only(
                    top: Dimens.sm,
                    bottom: Dimens.lg,
                  ),
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: AppColors.border,
                      borderRadius: Dimens.brXs,
                    ),
                  ),
                ),
                Text(
                  isCategory ? 'Pilih Kategori Pemasukan' : 'Pilih Rekening',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: Dimens.sm),
                Expanded(
                  child: accounts.isEmpty
                      ? const Center(child: Text('Tidak ada pilihan tersedia.'))
                      : ListView.builder(
                          controller: scrollController,
                          padding: const EdgeInsets.symmetric(
                            horizontal: Dimens.lg,
                          ),
                          itemCount: accounts.length,
                          itemBuilder: (ctx, i) {
                            final account = accounts[i];
                            final currentSelection = isCategory
                                ? _selectedCategoryAccount
                                : _selectedPaymentAccount;
                            final isSelected =
                                currentSelection?['id']?.toString() ==
                                account['id']?.toString();
                            return ListTile(
                              onTap: () {
                                setState(() {
                                  final data = Map<String, dynamic>.from(
                                    account,
                                  );
                                  if (isCategory) {
                                    _selectedCategoryAccount = data;
                                  } else {
                                    _selectedPaymentAccount = data;
                                  }
                                });
                                Navigator.pop(ctx);
                              },
                              leading: Container(
                                padding: const EdgeInsets.all(Dimens.sm),
                                decoration: BoxDecoration(
                                  color: isSelected
                                      ? AppColors.primary.withValues(alpha: 0.2)
                                      : AppColors.surfaceSecondary,
                                  borderRadius: Dimens.brSm,
                                ),
                                child: Icon(
                                  isCategory
                                      ? Icons.trending_up_rounded
                                      : Icons.account_balance_wallet_rounded,
                                  color: isSelected
                                      ? AppColors.primary
                                      : AppColors.textTertiary,
                                  size: 20,
                                ),
                              ),
                              title: Text(
                                account['name'] ?? '',
                                style: TextStyle(
                                  fontWeight: isSelected
                                      ? FontWeight.bold
                                      : FontWeight.normal,
                                ),
                              ),
                              subtitle: Text(
                                'Kode: ${account['code'] ?? ''}',
                                style: Theme.of(context).textTheme.bodySmall,
                              ),
                              trailing: isSelected
                                  ? const Icon(
                                      Icons.check_circle_rounded,
                                      color: AppColors.primary,
                                    )
                                  : null,
                              contentPadding: EdgeInsets.zero,
                            );
                          },
                        ),
                ),
              ],
            );
          },
        );
      },
    );
  }

  Future<void> _submit() async {
    setState(() => _triedSubmit = true);

    if (!_formKey.currentState!.validate()) return;

    if (_selectedCategoryAccount == null || _selectedPaymentAccount == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text(
            'Lengkapi kategori dan rekening terlebih dahulu.',
          ),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    setState(() => _isSubmitting = true);
    try {
      final amount =
          double.tryParse(_amountController.text.replaceAll(',', '')) ?? 0;
      if (amount <= 0) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Nominal harus lebih dari 0')),
        );
        return;
      }

      final dateStr =
          '${_selectedDate.year}-${_selectedDate.month.toString().padLeft(2, '0')}-${_selectedDate.day.toString().padLeft(2, '0')}';
      final payload = {
        'reference_number': 'INC-${DateTime.now().millisecondsSinceEpoch}',
        'description': _descController.text.isEmpty
            ? 'Pemasukan Manual'
            : _descController.text,
        'date': dateStr,
        'lines': [
          {
            'account_id': _selectedPaymentAccount!['id'].toString(),
            'debit': amount,
            'credit': 0,
          },
          {
            'account_id': _selectedCategoryAccount!['id'].toString(),
            'debit': 0,
            'credit': amount,
          },
        ],
      };

      await ref.read(reportServiceProvider).createExpense(payload);

      if (mounted) {
        ref.invalidate(journalProvider);
        ref.invalidate(reportSummaryProvider);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Pemasukan berhasil dicatat'),
            backgroundColor: AppColors.success,
          ),
        );
        context.pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Gagal mencatat transaksi: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }
}
