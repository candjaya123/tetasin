import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_colors.dart';
import '../../../shared/services/budget_service.dart';
import '../providers/budget_providers.dart';
import '../providers/report_providers.dart';

class AddBudgetSheet extends ConsumerStatefulWidget {
  final Map<String, dynamic>? initialBudget;
  
  const AddBudgetSheet({super.key, this.initialBudget});

  @override
  ConsumerState<AddBudgetSheet> createState() => _AddBudgetSheetState();
}

class _AddBudgetSheetState extends ConsumerState<AddBudgetSheet> {
  final _amountController = TextEditingController();
  String? _selectedAccountId;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    if (widget.initialBudget != null) {
      _amountController.text = widget.initialBudget!['limit_amount'].toString();
      _selectedAccountId = widget.initialBudget!['account_id'];
    }
  }

  @override
  void dispose() {
    _amountController.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (_amountController.text.isEmpty || _selectedAccountId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Mohon isi nominal dan pilih kategori')),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      final service = ref.read(budgetServiceProvider);
      final month = ref.read(budgetMonthProvider);
      final amount = double.parse(_amountController.text.replaceAll(RegExp(r'[^0-9]'), ''));

      await service.upsertBudget(
        accountId: _selectedAccountId!,
        limitAmount: amount,
        month: month,
      );

      if (mounted) {
        ref.invalidate(budgetsProvider(month));
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Anggaran berhasil disimpan')),
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
        top: 24,
        left: 24,
        right: 24,
      ),
      decoration: const BoxDecoration(
        color: Colors.white,
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
            widget.initialBudget != null ? 'Edit Anggaran' : 'Atur Anggaran',
            style: GoogleFonts.outfit(
              fontSize: 24,
              fontWeight: FontWeight.w900,
              color: AppColors.black,
            ),
          ),
          const SizedBox(height: 8),
          Text(
             'Tentukan batas pengeluaran untuk kategori pilihan Anda.',
             style: GoogleFonts.outfit(
                fontSize: 14,
                color: AppColors.mediumGrey,
                fontWeight: FontWeight.w500,
             ),
          ),
          const SizedBox(height: 32),
          
          // Nominal
          TextField(
            controller: _amountController,
            keyboardType: TextInputType.number,
            style: GoogleFonts.outfit(fontSize: 28, fontWeight: FontWeight.w900),
            decoration: InputDecoration(
              labelText: 'Batas Nominal (Rp)',
              labelStyle: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.lightGrey),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(20)),
              prefixText: 'Rp ',
              floatingLabelBehavior: FloatingLabelBehavior.always,
            ),
          ),
          const SizedBox(height: 24),

          // Category Dropdown
          coaAsync.when(
            data: (coa) {
              final expenseAccounts = coa.where((a) {
                final type = (a['type'] ?? '').toString().toLowerCase();
                final code = (a['code'] ?? '').toString();
                // Personal: type='expense', code starts with 6-
                // Business: type='expense'/'beban', code starts with 5- or 6-
                return type == 'expense' || type == 'expenses' || 
                       type == 'beban' || code.startsWith('5-') || code.startsWith('6-');
              }).toList();

              return DropdownButtonFormField<String>(
                value: _selectedAccountId,
                decoration: InputDecoration(
                  labelText: 'Pilih Kategori',
                  labelStyle: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.lightGrey),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(20)),
                  floatingLabelBehavior: FloatingLabelBehavior.always,
                ),
                items: expenseAccounts.map((a) => DropdownMenuItem(
                  value: a['id'].toString(),
                  child: Text(a['name'], style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
                )).toList(),
                onChanged: widget.initialBudget != null ? null : (val) => setState(() => _selectedAccountId = val),
              );
            },
            loading: () => const LinearProgressIndicator(),
            error: (_, __) => const Text('Gagal memuat kategori'),
          ),
          
          const SizedBox(height: 40),

          SizedBox(
            width: double.infinity,
            height: 60,
            child: ElevatedButton(
              onPressed: _isLoading ? null : _save,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: AppColors.onPrimary,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                elevation: 0,
              ),
              child: _isLoading 
                ? const CircularProgressIndicator(color: Colors.white)
                : Text(
                    widget.initialBudget != null ? 'Simpan Perubahan' : 'Simpan Anggaran',
                    style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w900),
                  ),
            ),
          ),
          const SizedBox(height: 40),
        ],
      ),
    );
  }
}
