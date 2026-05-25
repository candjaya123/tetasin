import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/dimens.dart';
import '../../shared/services/services_provider.dart';
import '../../shared/widgets/coa_picker.dart';

class PaymentSheet extends ConsumerStatefulWidget {
  final String billId;
  final String billName;
  final double remainingAmount;

  const PaymentSheet({
    super.key,
    required this.billId,
    required this.billName,
    required this.remainingAmount,
  });

  @override
  ConsumerState<PaymentSheet> createState() => _PaymentSheetState();
}

class _PaymentSheetState extends ConsumerState<PaymentSheet> {
  final _amountCtrl = TextEditingController();
  final _notesCtrl = TextEditingController();
  String? _paymentAccountId;
  DateTime? _paymentDate;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _amountCtrl.text = widget.remainingAmount.toStringAsFixed(0);
    _paymentDate = DateTime.now();
  }

  @override
  void dispose() {
    _amountCtrl.dispose();
    _notesCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _paymentDate ?? DateTime.now(),
      firstDate: DateTime(2020),
      lastDate: DateTime.now(),
    );
    if (picked != null) setState(() => _paymentDate = picked);
  }

  Future<void> _submit() async {
    final amountText = _amountCtrl.text
        .replaceAll('.', '')
        .replaceAll(',', '.');
    final amount = double.tryParse(amountText);
    if (amount == null || amount <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Masukkan jumlah yang valid')),
      );
      return;
    }
    if (amount > widget.remainingAmount) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Jumlah melebihi sisa tagihan')),
      );
      return;
    }

    setState(() => _isLoading = true);
    try {
      final payload = <String, dynamic>{
        'amount': amount,
        'payment_date': DateFormat(
          'yyyy-MM-dd',
        ).format(_paymentDate ?? DateTime.now()),
        if (_paymentAccountId != null) 'payment_account_id': _paymentAccountId,
        if (_notesCtrl.text.isNotEmpty) 'notes': _notesCtrl.text,
      };
      await ref
          .read(billTrackerServiceProvider)
          .payBill(widget.billId, payload);
      if (mounted) {
        Navigator.pop(context, true);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Pembayaran berhasil dicatat')),
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
    final currencyFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );

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
                'Bayar Tagihan',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: Dimens.xs),
              Text(
                'Tagihan: ${widget.billName}',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              const SizedBox(height: Dimens.xs),
              Text(
                'Sisa tagihan: ${currencyFormat.format(widget.remainingAmount)}',
                style: Theme.of(
                  context,
                ).textTheme.bodySmall?.copyWith(color: AppColors.textSecondary),
              ),
              const SizedBox(height: Dimens.lg),
              TextFormField(
                controller: _amountCtrl,
                decoration: InputDecoration(
                  labelText: 'Jumlah Bayar',
                  hintText: 'Rp',
                  helperText:
                      'Maks: ${currencyFormat.format(widget.remainingAmount)}',
                  prefixIcon: const Icon(Icons.money_rounded),
                ),
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: Dimens.lg),
              CoaPicker(
                label: 'Akun Pembayaran',
                hintText: 'Pilih akun sumber dana',
                filter: 'ASET',
                onChanged: (v) => _paymentAccountId = v,
              ),
              const SizedBox(height: Dimens.lg),
              InkWell(
                onTap: _pickDate,
                borderRadius: Dimens.brSm,
                child: InputDecorator(
                  decoration: const InputDecoration(
                    labelText: 'Tanggal Bayar',
                    prefixIcon: Icon(Icons.calendar_month_rounded),
                    suffixIcon: Icon(Icons.arrow_drop_down_rounded),
                  ),
                  child: Text(
                    _paymentDate != null
                        ? DateFormat(
                            'd MMMM yyyy',
                            'id_ID',
                          ).format(_paymentDate!)
                        : 'Pilih tanggal',
                  ),
                ),
              ),
              const SizedBox(height: Dimens.lg),
              TextFormField(
                controller: _notesCtrl,
                decoration: const InputDecoration(
                  labelText: 'Catatan (opsional)',
                  hintText: 'Cth: Dibayar via transfer',
                  prefixIcon: Icon(Icons.notes_rounded),
                ),
                maxLines: 2,
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
                      : const Text('Bayar'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

Future<bool?> showPaymentSheet({
  required BuildContext context,
  required WidgetRef ref,
  required String billId,
  required String billName,
  required double remainingAmount,
}) {
  return showModalBottomSheet<bool>(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (_) => Container(
      decoration: const BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.vertical(top: Dimens.radiusXl),
      ),
      child: ProviderScope(
        child: PaymentSheet(
          billId: billId,
          billName: billName,
          remainingAmount: remainingAmount,
        ),
      ),
    ),
  );
}
