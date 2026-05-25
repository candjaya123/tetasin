import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_colors.dart';
import '../providers/report_providers.dart';

class AddExpenseSheet extends ConsumerStatefulWidget {
  final bool isIncome;
  const AddExpenseSheet({super.key, this.isIncome = false});

  @override
  ConsumerState<AddExpenseSheet> createState() => _AddExpenseSheetState();
}

class _AddExpenseSheetState extends ConsumerState<AddExpenseSheet> {
  final _formKey = GlobalKey<FormState>();
  final _amountController = TextEditingController();
  final _descController = TextEditingController();

  // Menyimpan seluruh objek akun, bukan hanya ID, agar validasi lebih robust
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
    final isIncome = widget.isIncome;

    return Container(
      padding: EdgeInsets.only(
        left: 24,
        right: 24,
        top: 24,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
      ),
      child: Form(
        key: _formKey,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    isIncome ? 'Catat Pemasukan' : 'Catat Pengeluaran',
                    style: GoogleFonts.outfit(
                      fontSize: 20,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  IconButton(
                    onPressed: () => Navigator.pop(context),
                    icon: const Icon(Icons.close, color: AppColors.mediumGrey),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              TextFormField(
                controller: _amountController,
                keyboardType: TextInputType.number,
                style: GoogleFonts.outfit(
                  fontSize: 24,
                  fontWeight: FontWeight.w900,
                ),
                decoration: InputDecoration(
                  labelText: 'Nominal (Rp)',
                  labelStyle: GoogleFonts.outfit(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: AppColors.mediumGrey,
                  ),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                  prefixText: 'Rp ',
                ),
                validator: (v) => v == null || v.isEmpty ? 'Wajib diisi' : null,
              ),
              const SizedBox(height: 16),
              coaAsync.when(
                data: (accounts) {
                  // Filter kategori berdasarkan tipe (Income vs Expense)
                  final categoryAccounts = accounts.where((a) {
                    final type = (a['type'] ?? '').toString().toLowerCase();
                    final code = (a['code'] ?? '').toString();
                    if (isIncome) {
                      return type == 'income' ||
                          type == 'pendapatan' ||
                          type == 'revenue' ||
                          code.startsWith('4-');
                    } else {
                      return type == 'expense' ||
                          type == 'expenses' ||
                          type == 'beban' ||
                          code.startsWith('5-') ||
                          code.startsWith('6-');
                    }
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
                      _selectedPaymentAccount?['name'] ??
                      (isIncome ? 'Masuk ke Rekening' : 'Pilih Sumber Dana');

                  return Column(
                    children: [
                      _buildSelectionField(
                        label: isIncome
                            ? 'Kategori Pemasukan'
                            : 'Kategori Pengeluaran',
                        value: categoryName,
                        icon: isIncome
                            ? Icons.trending_up_rounded
                            : Icons.category_rounded,
                        onTap: () => _showCategorySelector(
                          context,
                          categoryAccounts,
                          isIncome: isIncome,
                        ),
                        hasError:
                            _triedSubmit && _selectedCategoryAccount == null,
                      ),
                      const SizedBox(height: 16),
                      _buildSelectionField(
                        label: isIncome ? 'Penyimpanan' : 'Sumber Dana',
                        value: paymentName,
                        icon: Icons.account_balance_wallet_rounded,
                        onTap: () =>
                            _showPaymentSelector(context, paymentAccounts),
                        hasError:
                            _triedSubmit && _selectedPaymentAccount == null,
                      ),
                    ],
                  );
                },
                loading: () => const Center(
                  child: Padding(
                    padding: EdgeInsets.all(16),
                    child: CircularProgressIndicator(color: AppColors.primary),
                  ),
                ),
                error: (e, _) => Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.red.shade50,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    'Gagal memuat daftar akun. Pastikan backend berjalan.',
                    style: GoogleFonts.outfit(
                      color: Colors.red.shade700,
                      fontSize: 13,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _descController,
                decoration: InputDecoration(
                  labelText: 'Keterangan',
                  hintText: isIncome
                      ? 'Contoh: Gaji bulanan, bonus...'
                      : 'Contoh: Bayar listrik, beli kemasan...',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
                maxLines: 2,
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: _isSubmitting ? null : _submit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.black,
                    foregroundColor: AppColors.primary,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                  child: _isSubmitting
                      ? const CircularProgressIndicator(
                          color: AppColors.primary,
                        )
                      : Text(
                          isIncome ? 'Simpan Pemasukan' : 'Simpan Pengeluaran',
                          style: GoogleFonts.outfit(
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
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        decoration: BoxDecoration(
          border: Border.all(
            color: hasError ? Colors.red.shade400 : AppColors.border,
            width: hasError ? 1.5 : 1.0,
          ),
          borderRadius: BorderRadius.circular(16),
          color: hasError ? Colors.red.shade50 : Colors.white,
        ),
        child: Row(
          children: [
            Icon(
              icon,
              color: hasError ? Colors.red.shade400 : AppColors.mediumGrey,
              size: 24,
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label,
                    style: GoogleFonts.outfit(
                      fontSize: 12,
                      color: hasError
                          ? Colors.red.shade400
                          : AppColors.mediumGrey,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    value,
                    style: GoogleFonts.outfit(
                      fontSize: 14,
                      fontWeight: isPlaceholder
                          ? FontWeight.normal
                          : FontWeight.bold,
                      color: isPlaceholder
                          ? (hasError
                                ? Colors.red.shade400
                                : AppColors.mediumGrey)
                          : AppColors.black,
                    ),
                  ),
                ],
              ),
            ),
            Icon(
              Icons.chevron_right_rounded,
              color: hasError ? Colors.red.shade400 : AppColors.mediumGrey,
            ),
          ],
        ),
      ),
    );
  }

  void _showCategorySelector(
    BuildContext context,
    List<dynamic> accounts, {
    required bool isIncome,
  }) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
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
                Container(
                  margin: const EdgeInsets.only(top: 8, bottom: 16),
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: AppColors.border,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
                Text(
                  isIncome
                      ? 'Pilih Kategori Pemasukan'
                      : 'Pilih Kategori Pengeluaran',
                  style: GoogleFonts.outfit(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                Expanded(
                  child: accounts.isEmpty
                      ? Center(
                          child: Text(
                            'Tidak ada kategori tersedia.',
                            style: GoogleFonts.outfit(
                              color: AppColors.mediumGrey,
                            ),
                          ),
                        )
                      : ListView.builder(
                          controller: scrollController,
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          itemCount: accounts.length,
                          itemBuilder: (ctx, i) {
                            final account = accounts[i];
                            final isSelected =
                                _selectedCategoryAccount?['id']?.toString() ==
                                account['id']?.toString();
                            return ListTile(
                              onTap: () {
                                setState(
                                  () => _selectedCategoryAccount =
                                      Map<String, dynamic>.from(account),
                                );
                                Navigator.pop(ctx);
                              },
                              leading: Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: isSelected
                                      ? AppColors.primary.withValues(alpha: 0.2)
                                      : AppColors.surface,
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Icon(
                                  isIncome
                                      ? Icons.trending_up_rounded
                                      : Icons.receipt_long_rounded,
                                  color: isSelected
                                      ? AppColors.primary
                                      : AppColors.mediumGrey,
                                  size: 20,
                                ),
                              ),
                              title: Text(
                                account['name'] ?? '',
                                style: GoogleFonts.outfit(
                                  fontWeight: isSelected
                                      ? FontWeight.bold
                                      : FontWeight.normal,
                                ),
                              ),
                              subtitle: Text(
                                'Kode: ${account['code'] ?? ''}',
                                style: GoogleFonts.outfit(
                                  fontSize: 11,
                                  color: AppColors.mediumGrey,
                                ),
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

  void _showPaymentSelector(BuildContext context, List<dynamic> accounts) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return Padding(
          padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Pilih Rekening Kas/Bank',
                style: GoogleFonts.outfit(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),
              if (accounts.isEmpty)
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Text(
                    'Tidak ada akun kas/bank tersedia.',
                    style: GoogleFonts.outfit(color: AppColors.mediumGrey),
                  ),
                )
              else
                ...accounts.map((account) {
                  final isSelected =
                      _selectedPaymentAccount?['id']?.toString() ==
                      account['id']?.toString();
                  return ListTile(
                    onTap: () {
                      setState(
                        () => _selectedPaymentAccount =
                            Map<String, dynamic>.from(account),
                      );
                      Navigator.pop(ctx);
                    },
                    leading: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: isSelected
                            ? AppColors.primary.withValues(alpha: 0.2)
                            : AppColors.surface,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Icon(
                        Icons.account_balance_wallet_rounded,
                        color: isSelected
                            ? AppColors.primary
                            : AppColors.mediumGrey,
                        size: 20,
                      ),
                    ),
                    title: Text(
                      account['name'] ?? '',
                      style: GoogleFonts.outfit(
                        fontWeight: isSelected
                            ? FontWeight.bold
                            : FontWeight.normal,
                      ),
                    ),
                    subtitle: Text(
                      'Kode: ${account['code'] ?? ''}',
                      style: GoogleFonts.outfit(
                        fontSize: 11,
                        color: AppColors.mediumGrey,
                      ),
                    ),
                    trailing: isSelected
                        ? const Icon(
                            Icons.check_circle_rounded,
                            color: AppColors.primary,
                          )
                        : null,
                    contentPadding: EdgeInsets.zero,
                  );
                }),
            ],
          ),
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
          content: Text(
            'Lengkapi kategori dan rekening terlebih dahulu.',
            style: GoogleFonts.outfit(),
          ),
          backgroundColor: Colors.red.shade600,
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

      final now = DateTime.now();
      final dateStr =
          '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';
      final isIncome = widget.isIncome;

      final payload = {
        'reference_number':
            '${isIncome ? "INC" : "EXP"}-${DateTime.now().millisecondsSinceEpoch}',
        'description': _descController.text.isEmpty
            ? (isIncome ? 'Pemasukan Manual' : 'Pengeluaran Manual')
            : _descController.text,
        'date': dateStr,
        'lines': [
          {
            'account_id': isIncome
                ? _selectedPaymentAccount!['id'].toString()
                : _selectedCategoryAccount!['id'].toString(),
            'debit': amount,
            'credit': 0,
          },
          {
            'account_id': isIncome
                ? _selectedCategoryAccount!['id'].toString()
                : _selectedPaymentAccount!['id'].toString(),
            'debit': 0,
            'credit': amount,
          },
        ],
      };

      await ref.read(reportServiceProvider).createExpense(payload);

      if (mounted) {
        ref.invalidate(journalProvider);
        ref.invalidate(reportSummaryProvider);
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              isIncome
                  ? '✅ Pemasukan berhasil dicatat'
                  : '✅ Pengeluaran berhasil dicatat',
              style: GoogleFonts.outfit(fontWeight: FontWeight.bold),
            ),
            backgroundColor: Colors.green.shade600,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Gagal mencatat transaksi: $e'),
            backgroundColor: Colors.red.shade600,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }
}
