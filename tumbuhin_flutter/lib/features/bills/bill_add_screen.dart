import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/dimens.dart';
import '../../shared/services/services_provider.dart';

class BillAddScreen extends ConsumerStatefulWidget {
  const BillAddScreen({super.key});

  @override
  ConsumerState<BillAddScreen> createState() => _BillAddScreenState();
}

class _BillAddScreenState extends ConsumerState<BillAddScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _amountCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  DateTime? _dueDate;
  String? _categoryId;
  bool _isRecurring = false;
  String _frequency = 'monthly';
  bool _isLoading = false;

  @override
  void dispose() {
    _nameCtrl.dispose();
    _amountCtrl.dispose();
    _descCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _dueDate ?? DateTime.now().add(const Duration(days: 7)),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (picked != null) setState(() => _dueDate = picked);
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_dueDate == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Pilih tanggal jatuh tempo')),
      );
      return;
    }

    setState(() => _isLoading = true);
    try {
      final payload = {
        'name': _nameCtrl.text,
        'amount': double.parse(
          _amountCtrl.text.replaceAll('.', '').replaceAll(',', '.'),
        ),
        'due_date': DateFormat('yyyy-MM-dd').format(_dueDate!),
        'description': _descCtrl.text,
        if (_categoryId != null) 'category_id': _categoryId,
        if (_isRecurring) ...{'is_recurring': true, 'frequency': _frequency},
      };
      await ref.read(billTrackerServiceProvider).createBill(payload);
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Tagihan berhasil dibuat')),
        );
        context.pop();
      }
    } catch (e) {
      if (context.mounted) {
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
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Tambah Tagihan')),
      body: SingleChildScrollView(
        padding: Dimens.page,
        child: Form(
          key: _formKey,
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
                    TextFormField(
                      controller: _nameCtrl,
                      decoration: const InputDecoration(
                        labelText: 'Nama Tagihan',
                        hintText: 'Cth: Listrik, Air, Internet',
                        prefixIcon: Icon(Icons.receipt_rounded),
                      ),
                      validator: (v) => (v == null || v.trim().isEmpty)
                          ? 'Masukkan nama tagihan'
                          : null,
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
                      validator: (v) {
                        if (v == null || v.trim().isEmpty)
                          return 'Masukkan jumlah';
                        final n = double.tryParse(
                          v.replaceAll('.', '').replaceAll(',', '.'),
                        );
                        return (n == null || n <= 0)
                            ? 'Jumlah tidak valid'
                            : null;
                      },
                    ),
                    const SizedBox(height: Dimens.lg),
                    TextFormField(
                      controller: _descCtrl,
                      decoration: const InputDecoration(
                        labelText: 'Keterangan (opsional)',
                        prefixIcon: Icon(Icons.notes_rounded),
                      ),
                      maxLines: 2,
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
                    InkWell(
                      onTap: _pickDate,
                      borderRadius: Dimens.brSm,
                      child: InputDecorator(
                        decoration: InputDecoration(
                          labelText: 'Jatuh Tempo',
                          prefixIcon: const Icon(Icons.calendar_month_rounded),
                          suffixIcon: const Icon(Icons.arrow_drop_down_rounded),
                        ),
                        child: Text(
                          _dueDate != null
                              ? DateFormat(
                                  'd MMMM yyyy',
                                  'id_ID',
                                ).format(_dueDate!)
                              : 'Pilih tanggal',
                        ),
                      ),
                    ),
                    const SizedBox(height: Dimens.md),
                    SwitchListTile(
                      contentPadding: EdgeInsets.zero,
                      title: const Text('Tagihan Berulang'),
                      subtitle: const Text('Aktifkan untuk tagihan bulanan'),
                      value: _isRecurring,
                      onChanged: (v) => setState(() => _isRecurring = v),
                    ),
                    if (_isRecurring) ...[
                      const SizedBox(height: Dimens.sm),
                      DropdownButtonFormField<String>(
                        initialValue: _frequency,
                        decoration: const InputDecoration(
                          labelText: 'Frekuensi',
                        ),
                        items: const [
                          DropdownMenuItem(
                            value: 'monthly',
                            child: Text('Bulanan'),
                          ),
                          DropdownMenuItem(
                            value: 'weekly',
                            child: Text('Mingguan'),
                          ),
                          DropdownMenuItem(
                            value: 'yearly',
                            child: Text('Tahunan'),
                          ),
                        ],
                        onChanged: (v) => setState(() => _frequency = v!),
                      ),
                    ],
                  ],
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
                      : const Text('Simpan Tagihan'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
