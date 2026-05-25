import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../providers/receipt_provider.dart';
import '../../data/receipt_models.dart';
import '../widgets/confidence_indicator.dart';
import '../widgets/receipt_image_preview.dart';
import '../../../../shared/widgets/coa_picker.dart';
import '../../../../core/theme/app_colors.dart';

class DraftReviewScreen extends ConsumerStatefulWidget {
  final String id;

  const DraftReviewScreen({super.key, required this.id});

  @override
  ConsumerState<DraftReviewScreen> createState() => _DraftReviewScreenState();
}

class _DraftReviewScreenState extends ConsumerState<DraftReviewScreen> {
  final _formKey = GlobalKey<FormState>();
  final _merchantController = TextEditingController();
  final _amountController = TextEditingController();
  DateTime? _selectedDate;
  String? _selectedCategory;
  String? _selectedDebitAccount;
  String? _selectedCreditAccount;
  List<_EditableLineItem> _lineItems = [];
  bool _initialized = false;

  @override
  void dispose() {
    _merchantController.dispose();
    _amountController.dispose();
    super.dispose();
  }

  void _initFromDraft(DraftTransaction draft) {
    if (_initialized) return;
    _initialized = true;
    _merchantController.text = draft.merchantName ?? '';
    _amountController.text = draft.totalAmount?.toString() ?? '';
    _selectedDate = draft.transactionDate;
    _selectedCategory = draft.category;
    _selectedDebitAccount = draft.debitAccountId;
    _selectedCreditAccount = draft.creditAccountId;
    _lineItems = draft.lineItems
        .map(
          (m) => _EditableLineItem(
            nameController: TextEditingController(
              text: m['name']?.toString() ?? '',
            ),
            qtyController: TextEditingController(
              text: m['qty']?.toString() ?? '1',
            ),
            priceController: TextEditingController(
              text: m['unit_price']?.toString() ?? '',
            ),
          ),
        )
        .toList();
  }

  String _confidenceFor(String fieldKey, double overallConfidence) {
    final recs =
        ref.read(draftDetailProvider(widget.id)).value?.aiRecommendations ?? {};
    final perField = recs['field_confidence'] as Map<String, dynamic>? ?? {};
    final val = perField[fieldKey] as double?;
    final score = val ?? overallConfidence;
    if (score >= 0.85) return 'high';
    if (score >= 0.5) return 'medium';
    return 'low';
  }

  double _scoreFor(String fieldKey, double overallConfidence) {
    final recs =
        ref.read(draftDetailProvider(widget.id)).value?.aiRecommendations ?? {};
    final perField = recs['field_confidence'] as Map<String, dynamic>? ?? {};
    return (perField[fieldKey] as double?) ?? overallConfidence;
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate ?? DateTime.now(),
      firstDate: DateTime(2020),
      lastDate: DateTime.now().add(const Duration(days: 1)),
    );
    if (picked != null) {
      setState(() => _selectedDate = picked);
    }
  }

  void _addLineItem() {
    setState(() {
      _lineItems.add(
        _EditableLineItem(
          nameController: TextEditingController(),
          qtyController: TextEditingController(text: '1'),
          priceController: TextEditingController(),
        ),
      );
    });
  }

  void _removeLineItem(int index) {
    setState(() {
      _lineItems[index].dispose();
      _lineItems.removeAt(index);
    });
  }

  Future<void> _approveWithUpdates() async {
    if (!_formKey.currentState!.validate()) return;

    final notifier = ref.read(draftNotifierProvider.notifier);
    final id = widget.id;

    final data = <String, dynamic>{
      'merchant_name': _merchantController.text.trim(),
      'total_amount': double.tryParse(_amountController.text.trim()) ?? 0,
      if (_selectedDate != null)
        'transaction_date': _selectedDate!.toIso8601String(),
      if (_selectedCategory != null) 'category': _selectedCategory,
      if (_selectedDebitAccount != null)
        'debit_account_id': _selectedDebitAccount,
      if (_selectedCreditAccount != null)
        'credit_account_id': _selectedCreditAccount,
      'line_items': _lineItems
          .map(
            (li) => {
              'name': li.nameController.text.trim(),
              'qty': int.tryParse(li.qtyController.text.trim()) ?? 1,
              'unit_price':
                  double.tryParse(li.priceController.text.trim()) ?? 0,
            },
          )
          .toList(),
    };

    try {
      await notifier.updateDraft(id, data);
      if (!mounted) return;
      await notifier.approve(id);
      if (mounted) context.pop();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Gagal menyetujui: $e')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final draftAsync = ref.watch(draftDetailProvider(widget.id));

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Review Draft',
          style: GoogleFonts.outfit(fontWeight: FontWeight.w800),
        ),
      ),
      body: draftAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => Center(child: Text('Error: $err')),
        data: (draft) {
          final canReview = draft.status == 'ready';
          final aiRecs = draft.aiRecommendations;
          final overallConfidence = aiRecs['confidence_score'] as double? ?? 0;

          _initFromDraft(draft);

          return Form(
            key: _formKey,
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                if (draft.receiptScanId != null && aiRecs['image_url'] != null)
                  SizedBox(
                    height: 300,
                    child: ReceiptImagePreview(
                      imageUrl: aiRecs['image_url'] as String,
                    ),
                  ),
                const SizedBox(height: 16),

                _Section(
                  title: 'Informasi Transaksi',
                  children: [
                    _FieldWithConfidence(
                      label: 'Merchant',
                      confidence: _confidenceFor(
                        'merchant_name',
                        overallConfidence,
                      ),
                      score: _scoreFor('merchant_name', overallConfidence),
                      child: TextFormField(
                        controller: _merchantController,
                        decoration: const InputDecoration(
                          hintText: 'Nama merchant',
                        ),
                        validator: (v) => (v == null || v.trim().isEmpty)
                            ? 'Wajib diisi'
                            : null,
                      ),
                    ),
                    const SizedBox(height: 12),
                    _FieldWithConfidence(
                      label: 'Tanggal',
                      confidence: _confidenceFor(
                        'transaction_date',
                        overallConfidence,
                      ),
                      score: _scoreFor('transaction_date', overallConfidence),
                      child: InkWell(
                        onTap: _pickDate,
                        child: InputDecorator(
                          decoration: const InputDecoration(
                            hintText: 'Pilih tanggal',
                            suffixIcon: Icon(Icons.calendar_today, size: 18),
                          ),
                          child: Text(
                            _selectedDate != null
                                ? DateFormat(
                                    'dd MMM yyyy',
                                    'id_ID',
                                  ).format(_selectedDate!)
                                : '-',
                            style: GoogleFonts.outfit(fontSize: 14),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    _FieldWithConfidence(
                      label: 'Total',
                      confidence: _confidenceFor(
                        'total_amount',
                        overallConfidence,
                      ),
                      score: _scoreFor('total_amount', overallConfidence),
                      child: TextFormField(
                        controller: _amountController,
                        decoration: const InputDecoration(
                          hintText: '0',
                          prefixText: 'Rp ',
                        ),
                        keyboardType: const TextInputType.numberWithOptions(
                          decimal: true,
                        ),
                        inputFormatters: [
                          FilteringTextInputFormatter.allow(RegExp(r'[\d.]')),
                        ],
                        validator: (v) {
                          if (v == null || v.trim().isEmpty)
                            return 'Wajib diisi';
                          if (double.tryParse(v.trim()) == null)
                            return 'Angka tidak valid';
                          return null;
                        },
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                _Section(
                  title: 'Akun COA',
                  children: [
                    _FieldWithConfidence(
                      label: 'Kategori',
                      confidence: _confidenceFor('category', overallConfidence),
                      score: _scoreFor('category', overallConfidence),
                      child: CoaPicker(
                        initialValue: _selectedCategory,
                        label: 'Kategori',
                        hintText: 'Pilih kategori',
                        filter: 'BEBAN',
                        onChanged: (v) => setState(() => _selectedCategory = v),
                      ),
                    ),
                    const SizedBox(height: 12),
                    _FieldWithConfidence(
                      label: 'Debit',
                      confidence: _confidenceFor(
                        'debit_account_id',
                        overallConfidence,
                      ),
                      score: _scoreFor('debit_account_id', overallConfidence),
                      child: CoaPicker(
                        initialValue: _selectedDebitAccount,
                        label: 'Akun Debit',
                        hintText: 'Pilih akun debit',
                        onChanged: (v) =>
                            setState(() => _selectedDebitAccount = v),
                      ),
                    ),
                    const SizedBox(height: 12),
                    _FieldWithConfidence(
                      label: 'Kredit',
                      confidence: _confidenceFor(
                        'credit_account_id',
                        overallConfidence,
                      ),
                      score: _scoreFor('credit_account_id', overallConfidence),
                      child: CoaPicker(
                        initialValue: _selectedCreditAccount,
                        label: 'Akun Kredit',
                        hintText: 'Pilih akun kredit',
                        onChanged: (v) =>
                            setState(() => _selectedCreditAccount = v),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                _Section(
                  title: 'AI Confidence',
                  children: [
                    ConfidenceIndicator(
                      confidence: overallConfidence >= 0.85
                          ? 'high'
                          : overallConfidence >= 0.5
                          ? 'medium'
                          : 'low',
                      score: overallConfidence,
                    ),
                    if (aiRecs['duplicate_warning']?['is_duplicate'] == true)
                      Container(
                        margin: const EdgeInsets.only(top: 8),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.red.withValues(alpha: 0.08),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: Colors.red.withValues(alpha: 0.2),
                          ),
                        ),
                        child: const Row(
                          children: [
                            Icon(
                              Icons.warning_amber,
                              color: Colors.red,
                              size: 16,
                            ),
                            SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                'Duplikat terdeteksi',
                                style: TextStyle(
                                  color: Colors.red,
                                  fontSize: 12,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 12),

                _Section(
                  title: 'Line Items',
                  trailing: IconButton(
                    onPressed: _addLineItem,
                    icon: const Icon(Icons.add_circle_outline, size: 20),
                    visualDensity: VisualDensity.compact,
                  ),
                  children: [
                    if (_lineItems.isEmpty)
                      Text(
                        'Belum ada item. Tambahkan dengan tombol +',
                        style: GoogleFonts.outfit(
                          fontSize: 12,
                          color: AppColors.textTertiary,
                        ),
                      ),
                    ..._lineItems.asMap().entries.map((entry) {
                      final idx = entry.key;
                      final li = entry.value;
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 8),
                        child: Row(
                          children: [
                            Expanded(
                              flex: 3,
                              child: TextFormField(
                                controller: li.nameController,
                                decoration: const InputDecoration(
                                  hintText: 'Nama item',
                                  contentPadding: EdgeInsets.symmetric(
                                    horizontal: 12,
                                    vertical: 12,
                                  ),
                                  isDense: true,
                                ),
                                style: GoogleFonts.outfit(fontSize: 13),
                              ),
                            ),
                            const SizedBox(width: 6),
                            SizedBox(
                              width: 48,
                              child: TextFormField(
                                controller: li.qtyController,
                                decoration: const InputDecoration(
                                  hintText: 'Qty',
                                  contentPadding: EdgeInsets.symmetric(
                                    horizontal: 8,
                                    vertical: 12,
                                  ),
                                  isDense: true,
                                ),
                                keyboardType: TextInputType.number,
                                inputFormatters: [
                                  FilteringTextInputFormatter.digitsOnly,
                                ],
                                style: GoogleFonts.outfit(fontSize: 13),
                              ),
                            ),
                            const SizedBox(width: 6),
                            Expanded(
                              flex: 2,
                              child: TextFormField(
                                controller: li.priceController,
                                decoration: const InputDecoration(
                                  hintText: 'Harga',
                                  contentPadding: EdgeInsets.symmetric(
                                    horizontal: 12,
                                    vertical: 12,
                                  ),
                                  isDense: true,
                                ),
                                keyboardType:
                                    const TextInputType.numberWithOptions(
                                      decimal: true,
                                    ),
                                inputFormatters: [
                                  FilteringTextInputFormatter.allow(
                                    RegExp(r'[\d.]'),
                                  ),
                                ],
                                style: GoogleFonts.outfit(fontSize: 13),
                              ),
                            ),
                            const SizedBox(width: 4),
                            IconButton(
                              onPressed: () => _removeLineItem(idx),
                              icon: const Icon(
                                Icons.delete_outline,
                                size: 18,
                                color: AppColors.error,
                              ),
                              visualDensity: VisualDensity.compact,
                            ),
                          ],
                        ),
                      );
                    }),
                  ],
                ),
                const SizedBox(height: 32),
                if (canReview)
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () async {
                            final reason = await showDialog<String>(
                              context: context,
                              builder: (ctx) => _RejectDialog(),
                            );
                            if (reason != null) {
                              ref
                                  .read(draftNotifierProvider.notifier)
                                  .reject(
                                    widget.id,
                                    reason: reason.isEmpty ? null : reason,
                                  );
                              if (!context.mounted) return;
                              context.pop();
                            }
                          },
                          icon: const Icon(Icons.close),
                          label: const Text('Tolak'),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: Colors.red,
                          ),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: FilledButton.icon(
                          onPressed: _approveWithUpdates,
                          icon: const Icon(Icons.check),
                          label: const Text('Setujui'),
                        ),
                      ),
                    ],
                  ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _Section extends StatelessWidget {
  final String title;
  final List<Widget> children;
  final Widget? trailing;

  const _Section({required this.title, required this.children, this.trailing});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  title,
                  style: GoogleFonts.outfit(
                    fontWeight: FontWeight.w800,
                    fontSize: 14,
                  ),
                ),
              ),
              ?trailing,
            ],
          ),
          const SizedBox(height: 12),
          ...children,
        ],
      ),
    );
  }
}

class _FieldWithConfidence extends StatelessWidget {
  final String label;
  final String confidence;
  final double score;
  final Widget child;

  const _FieldWithConfidence({
    required this.label,
    required this.confidence,
    required this.score,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(
              label,
              style: GoogleFonts.outfit(
                fontWeight: FontWeight.w600,
                fontSize: 13,
                color: AppColors.textSecondary,
              ),
            ),
            const SizedBox(width: 6),
            ConfidenceIndicator(confidence: confidence, score: score),
          ],
        ),
        const SizedBox(height: 4),
        child,
      ],
    );
  }
}

class _EditableLineItem {
  final TextEditingController nameController;
  final TextEditingController qtyController;
  final TextEditingController priceController;

  _EditableLineItem({
    required this.nameController,
    required this.qtyController,
    required this.priceController,
  });

  void dispose() {
    nameController.dispose();
    qtyController.dispose();
    priceController.dispose();
  }
}

class _RejectDialog extends StatelessWidget {
  final _controller = TextEditingController();

  _RejectDialog();

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Alasan Penolakan'),
      content: TextField(
        controller: _controller,
        decoration: const InputDecoration(hintText: 'Opsional...'),
        autofocus: true,
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context, ''),
          child: const Text('Tolak'),
        ),
        TextButton(
          onPressed: () => Navigator.pop(context, _controller.text),
          child: const Text('Tolak dengan Alasan'),
        ),
      ],
    );
  }
}
