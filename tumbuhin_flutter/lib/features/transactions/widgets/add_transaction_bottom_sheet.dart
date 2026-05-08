
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../reports/providers/report_providers.dart';
import '../../../core/theme/app_colors.dart';

class AddTransactionBottomSheet extends ConsumerStatefulWidget {
  const AddTransactionBottomSheet({super.key});

  @override
  ConsumerState<AddTransactionBottomSheet> createState() => _AddTransactionBottomSheetState();
}

class _AddTransactionBottomSheetState extends ConsumerState<AddTransactionBottomSheet> {
  final _amountController = TextEditingController();
  final _descriptionController = TextEditingController();
  String _type = 'expense'; // 'income' | 'expense'
  String? _selectedCategoryId;
  String? _selectedAccountId;
  bool _isLoading = false;

  @override
  void dispose() {
    _amountController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (_amountController.text.isEmpty || _selectedCategoryId == null || _selectedAccountId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Mohon lengkapi data transaksi')),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      final amount = double.parse(_amountController.text.replaceAll(RegExp(r'[^0-9]'), ''));
      final service = ref.read(reportServiceProvider);

      // Construct Journal Lines
      final List<Map<String, dynamic>> lines = [];
      
      if (_type == 'expense') {
        // Debit Expense, Credit Asset/Liability
        lines.add({
          'account_id': _selectedCategoryId,
          'debit': amount,
          'credit': 0,
        });
        lines.add({
          'account_id': _selectedAccountId,
          'debit': 0,
          'credit': amount,
        });
      } else {
        // Debit Asset, Credit Revenue
        lines.add({
          'account_id': _selectedAccountId,
          'debit': amount,
          'credit': 0,
        });
        lines.add({
          'account_id': _selectedCategoryId,
          'debit': 0,
          'credit': amount,
        });
      }

      final payload = {
        'reference_number': 'PERS-${DateTime.now().millisecondsSinceEpoch}',
        'description': _descriptionController.text.isEmpty ? (_type == 'income' ? 'Pemasukan' : 'Pengeluaran') : _descriptionController.text,
        'date': DateTime.now().toIso8601String(),
        'lines': lines,
      };

      await service.createExpense(payload);
      
      if (mounted) {
        ref.invalidate(journalProvider);
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Transaksi berhasil disimpan')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Gagal menyimpan: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final coaAsync = ref.watch(coaProvider);

    return Container(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
        top: 20,
        left: 20,
        right: 20,
      ),
      decoration: const BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: AppColors.border,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'Tambah Transaksi',
            style: GoogleFonts.outfit(
              fontSize: 24,
              fontWeight: FontWeight.w900,
              color: AppColors.secondary,
            ),
          ),
          const SizedBox(height: 24),
          
          // Type Toggle
          SegmentedButton<String>(
            segments: const [
              ButtonSegment(value: 'expense', label: Text('Pengeluaran'), icon: Icon(Icons.arrow_outward_rounded)),
              ButtonSegment(value: 'income', label: Text('Pemasukan'), icon: Icon(Icons.south_west_rounded)),
            ],
            selected: {_type},
            onSelectionChanged: (val) => setState(() {
              _type = val.first;
              _selectedCategoryId = null; // Reset category when switching type
            }),
            style: SegmentedButton.styleFrom(
              selectedBackgroundColor: _type == 'income' ? Colors.green : Colors.red,
              selectedForegroundColor: Colors.white,
            ),
          ),
          const SizedBox(height: 24),

          // Nominal Input
          TextField(
            controller: _amountController,
            keyboardType: TextInputType.number,
            style: GoogleFonts.outfit(fontSize: 32, fontWeight: FontWeight.w900),
            decoration: InputDecoration(
              labelText: 'Nominal',
              prefixText: 'Rp ',
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
              floatingLabelBehavior: FloatingLabelBehavior.always,
            ),
          ),
          const SizedBox(height: 16),

          // Account (Sumber Dana / Tujuan)
          coaAsync.when(
            data: (coa) {
              // Personal: type='asset', code=1-10xxx (Kas, Bank, E-Wallet)
              // Business: type='asset', broader code range
              final assetAccounts = coa.where((a) {
                final type = (a['type'] ?? '').toString().toLowerCase();
                final code = (a['code'] ?? '').toString();
                return (type == 'asset' || type == 'assets' || type == 'aset') &&
                    (code.startsWith('1-10') || code.startsWith('1-11'));
              }).toList();

              // Personal income: type='revenue'; Business income: type='income'/'pendapatan'
              // Personal expense: type='expense', code=6-; Business expense: type='expense'/'beban'
              final categoryAccounts = coa.where((a) {
                final type = (a['type'] ?? '').toString().toLowerCase();
                final code = (a['code'] ?? '').toString();
                if (_type == 'income') {
                  return type == 'income' || type == 'pendapatan' ||
                      type == 'revenue' || code.startsWith('4-');
                } else {
                  return type == 'expense' || type == 'expenses' ||
                      type == 'beban' || code.startsWith('5-') || code.startsWith('6-');
                }
              }).toList();

              return Column(
                children: [
                  DropdownButtonFormField<String>(
                    value: _selectedAccountId,
                    decoration: InputDecoration(
                      labelText: _type == 'income' ? 'Simpan ke' : 'Bayar pakai',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                    items: assetAccounts.map((a) => DropdownMenuItem(
                      value: a['id'].toString(),
                      child: Text(a['name']),
                    )).toList(),
                    onChanged: (val) => setState(() => _selectedAccountId = val),
                  ),
                  const SizedBox(height: 16),
                  DropdownButtonFormField<String>(
                    value: _selectedCategoryId,
                    decoration: InputDecoration(
                      labelText: 'Kategori',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                    items: categoryAccounts.map((a) => DropdownMenuItem(
                      value: a['id'].toString(),
                      child: Text(a['name']),
                    )).toList(),
                    onChanged: (val) => setState(() => _selectedCategoryId = val),
                  ),
                ],
              );
            },
            loading: () => const LinearProgressIndicator(),
            error: (_, __) => const Text('Gagal memuat kategori'),
          ),
          const SizedBox(height: 16),

          // Description
          TextField(
            controller: _descriptionController,
            decoration: InputDecoration(
              labelText: 'Catatan (Opsional)',
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
            ),
          ),
          const SizedBox(height: 32),

          // Save Button
          SizedBox(
            width: double.infinity,
            height: 60,
            child: ElevatedButton(
              onPressed: _isLoading ? null : _save,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.secondary,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
              child: _isLoading 
                ? const CircularProgressIndicator(color: Colors.white)
                : Text('Simpan Transaksi', style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.bold)),
            ),
          ),
          const SizedBox(height: 40),
        ],
      ),
    );
  }
}
