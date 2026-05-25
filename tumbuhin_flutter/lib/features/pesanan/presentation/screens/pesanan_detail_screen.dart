import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:hugeicons/hugeicons.dart';
import 'package:intl/intl.dart';
import 'package:printing/printing.dart';
import 'package:share_plus/share_plus.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import '../../../../shared/models/order.dart';

import '../../../../core/theme/responsive.dart';
import '../providers/pesanan_provider.dart';
import '../widgets/pesanan_status_stepper.dart';
import '../widgets/pesanan_status_chip.dart';
import '../widgets/division_notes_panel.dart';
import '../widgets/status_action_button.dart';

class PesananDetailScreen extends ConsumerStatefulWidget {
  final Order order;

  const PesananDetailScreen({super.key, required this.order});

  @override
  ConsumerState<PesananDetailScreen> createState() =>
      _PesananDetailScreenState();
}

class _PesananDetailScreenState extends ConsumerState<PesananDetailScreen> {
  late String _kasirNotes;
  late String _stokNotes;
  late String _dapurNotes;
  bool _isSavingNotes = false;

  @override
  void initState() {
    super.initState();
    _kasirNotes = widget.order.divisionNotes?.kasir ?? '';
    _stokNotes = widget.order.divisionNotes?.stok ?? '';
    _dapurNotes = widget.order.divisionNotes?.dapur ?? '';
  }

  Order get order => widget.order;

  @override
  Widget build(BuildContext context) {
    final currencyFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );
    final statusNotifier = ref.watch(
      updatePesananStatusNotifierProvider.notifier,
    );
    final currentOrder =
        ref.watch(orderDetailProvider(order.id)).valueOrNull ?? order;

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text(
          'Detail Pesanan',
          style: TextStyle(fontWeight: FontWeight.w900),
        ),
      ),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1000),
          child: Responsive(
            mobile: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildInfoCard(context, currentOrder),
                  const SizedBox(height: 24),
                  PesananStatusStepper(
                    currentStatus: currentOrder.status,
                    possibleNextStatuses: currentOrder.possibleNextStatuses,
                    onStatusChange: (newStatus) => _handleStatusChange(
                      statusNotifier,
                      currentOrder.id,
                      newStatus,
                    ),
                  ),
                  const SizedBox(height: 24),
                  StatusActionButton(order: currentOrder),
                  const SizedBox(height: 24),
                  if (currentOrder.transactionId != null)
                    _buildTransactionLink(currentOrder),
                  if (currentOrder.transactionId != null)
                    const SizedBox(height: 24),
                  _buildDivisionNotes(),
                  const SizedBox(height: 24),
                  if (currentOrder.status == 'invoiced') ...[
                    _buildInvoiceDetails(currentOrder, currencyFormat),
                    const SizedBox(height: 24),
                  ],
                  if (currentOrder.status == 'voided') ...[
                    _buildVoidBanner(currentOrder),
                    const SizedBox(height: 24),
                  ],
                  if (currentOrder.notes != null &&
                      currentOrder.notes!.isNotEmpty)
                    _buildNotes(currentOrder),
                  if (currentOrder.notes != null &&
                      currentOrder.notes!.isNotEmpty)
                    const SizedBox(height: 24),
                  const Text(
                    'DAFTAR ITEM',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w900,
                      color: Color(0xFF9CA3AF),
                      letterSpacing: 1.2,
                    ),
                  ),
                  const SizedBox(height: 15),
                  if (currentOrder.items != null &&
                      currentOrder.items!.isNotEmpty)
                    ...currentOrder.items!.map(
                      (item) => _buildItemRow(item, currencyFormat),
                    )
                  else
                    const Center(
                      child: Padding(
                        padding: EdgeInsets.symmetric(vertical: 20),
                        child: Text(
                          'Tidak ada item tercatat',
                          style: TextStyle(color: Colors.grey),
                        ),
                      ),
                    ),
                  const SizedBox(height: 30),
                  _buildTotalSection(currencyFormat),
                ],
              ),
            ),
            tablet: Padding(
              padding: const EdgeInsets.all(24),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    flex: 4,
                    child: Column(
                      children: [
                        _buildInfoCard(context, currentOrder),
                        const SizedBox(height: 24),
                        PesananStatusStepper(
                          currentStatus: currentOrder.status,
                          possibleNextStatuses:
                              currentOrder.possibleNextStatuses,
                          onStatusChange: (newStatus) => _handleStatusChange(
                            statusNotifier,
                            currentOrder.id,
                            newStatus,
                          ),
                        ),
                        const SizedBox(height: 24),
                        StatusActionButton(order: currentOrder),
                        const SizedBox(height: 24),
                        if (currentOrder.transactionId != null)
                          _buildTransactionLink(currentOrder),
                        if (currentOrder.transactionId != null)
                          const SizedBox(height: 24),
                        _buildDivisionNotes(),
                        const SizedBox(height: 24),
                        if (currentOrder.status == 'invoiced') ...[
                          _buildInvoiceDetails(currentOrder, currencyFormat),
                          const SizedBox(height: 24),
                        ],
                        if (currentOrder.status == 'voided') ...[
                          _buildVoidBanner(currentOrder),
                          const SizedBox(height: 24),
                        ],
                        if (currentOrder.notes != null &&
                            currentOrder.notes!.isNotEmpty)
                          _buildNotes(currentOrder),
                        const SizedBox(height: 24),
                        _buildTotalSection(currencyFormat),
                      ],
                    ),
                  ),
                  const SizedBox(width: 32),
                  Expanded(
                    flex: 6,
                    child: Container(
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: const Color(0xFFF3F4F6)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'DAFTAR ITEM',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w900,
                              color: Color(0xFF9CA3AF),
                              letterSpacing: 1.2,
                            ),
                          ),
                          const SizedBox(height: 20),
                          if (currentOrder.items != null &&
                              currentOrder.items!.isNotEmpty)
                            ...currentOrder.items!.map(
                              (item) => _buildItemRow(item, currencyFormat),
                            )
                          else
                            const Center(
                              child: Padding(
                                padding: EdgeInsets.symmetric(vertical: 40),
                                child: Text(
                                  'Tidak ada item tercatat',
                                  style: TextStyle(color: Colors.grey),
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
      bottomNavigationBar: _buildFooter(context),
    );
  }

  Future<void> _handleStatusChange(
    UpdatePesananStatusNotifier notifier,
    String orderId,
    String newStatus,
  ) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Ubah Status'),
        content: Text('Pindahkan status ke "$newStatus"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Batal'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Konfirmasi'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      await notifier.updateStatus(orderId, newStatus);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Status berhasil diubah ke $newStatus')),
        );
      }
    }
  }

  Future<void> _saveDivisionNotes() async {
    setState(() => _isSavingNotes = true);
    try {
      final notifier = ref.read(divisionNotesNotifierProvider.notifier);
      await notifier.updateDivisionNotes(
        order.id,
        DivisionNotes(kasir: _kasirNotes, stok: _stokNotes, dapur: _dapurNotes),
      );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Catatan divisi berhasil disimpan')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Gagal menyimpan: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isSavingNotes = false);
    }
  }

  Widget _buildInfoCard(BuildContext context, Order currentOrder) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFFF9FAFB),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFF3F4F6)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  currentOrder.referenceNumber ??
                      '#${currentOrder.id.substring(0, 8).toUpperCase()}',
                  style: const TextStyle(
                    fontWeight: FontWeight.w900,
                    fontSize: 18,
                  ),
                ),
              ),
              PesananStatusChip(status: currentOrder.status),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            currentOrder.type == 'SO' ? 'Sales Order' : 'Purchase Order',
            style: const TextStyle(
              color: Color(0xFFFDB827),
              fontWeight: FontWeight.w800,
              fontSize: 12,
            ),
          ),
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 15),
            child: Divider(color: Color(0xFFE5E7EB)),
          ),
          _buildInfoRow(
            currentOrder.type == 'SO' ? 'Pelanggan' : 'Supplier',
            currentOrder.entityName ?? '-',
          ),
          if (currentOrder.customerName != null) ...[
            const SizedBox(height: 10),
            _buildInfoRow('Nama Pelanggan', currentOrder.customerName!),
          ],
          if (currentOrder.source != null) ...[
            const SizedBox(height: 10),
            _buildInfoRow('Sumber', currentOrder.source!),
          ],
          const SizedBox(height: 10),
          _buildInfoRow(
            'Tanggal',
            DateFormat('dd MMM yyyy, HH:mm').format(currentOrder.createdAt),
          ),
          if (currentOrder.createdBy != null) ...[
            const SizedBox(height: 10),
            _buildInfoRow('Dibuat Oleh', currentOrder.createdBy!),
          ],
          if (currentOrder.fulfilledAt != null) ...[
            const SizedBox(height: 10),
            _buildInfoRow(
              'Dipenuhi Pada',
              DateFormat(
                'dd MMM yyyy, HH:mm',
              ).format(currentOrder.fulfilledAt!),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildTransactionLink(Order currentOrder) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFF0FDF4),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFBBF7D0)),
      ),
      child: InkWell(
        onTap: () => context.push('/transaksi'),
        borderRadius: BorderRadius.circular(16),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: const Color(0xFF10B981).withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(
                HugeIcons.strokeRoundedExchange01,
                size: 20,
                color: Color(0xFF10B981),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Terkait Transaksi / Jurnal',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF065F46),
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'ID: ${currentOrder.transactionId}',
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: Color(0xFF047857),
                    ),
                  ),
                ],
              ),
            ),
            const Icon(
              HugeIcons.strokeRoundedArrowRight01,
              size: 16,
              color: Color(0xFF10B981),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDivisionNotes() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        DivisionNotesPanel(
          notes: DivisionNotes(
            kasir: _kasirNotes,
            stok: _stokNotes,
            dapur: _dapurNotes,
          ),
          canEdit: true,
          onKasirChanged: (v) => setState(() => _kasirNotes = v),
          onStokChanged: (v) => setState(() => _stokNotes = v),
          onDapurChanged: (v) => setState(() => _dapurNotes = v),
        ),
        if (_kasirNotes != (order.divisionNotes?.kasir ?? '') ||
            _stokNotes != (order.divisionNotes?.stok ?? '') ||
            _dapurNotes != (order.divisionNotes?.dapur ?? ''))
          Padding(
            padding: const EdgeInsets.only(top: 12),
            child: SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: _isSavingNotes ? null : _saveDivisionNotes,
                icon: _isSavingNotes
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Icon(Icons.save_rounded, size: 16),
                label: const Text('Simpan Catatan Divisi'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF1A1A1A),
                  foregroundColor: const Color(0xFFFDB827),
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildNotes(Order currentOrder) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFFFFBEB),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFFDE68A)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(
            HugeIcons.strokeRoundedNote01,
            size: 18,
            color: Color(0xFFD97706),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'CATATAN',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFFD97706),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  currentOrder.notes!,
                  style: const TextStyle(
                    fontSize: 13,
                    color: Color(0xFF1A1A1A),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInvoiceDetails(Order currentOrder, NumberFormat currencyFormat) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFF5F3FF),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFDDD6FE)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(
                Icons.receipt_long_rounded,
                size: 18,
                color: Color(0xFF8B5CF6),
              ),
              const SizedBox(width: 8),
              const Text(
                'DETAIL INVOICE',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                  color: Color(0xFF8B5CF6),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          _buildInvoiceInfoRow(
            'Total',
            currencyFormat.format(currentOrder.totalAmount),
          ),
          const SizedBox(height: 6),
          _buildInvoiceInfoRow(
            'Pajak',
            currencyFormat.format(currentOrder.taxAmount),
          ),
          const SizedBox(height: 6),
          _buildInvoiceInfoRow(
            'Diskon',
            currencyFormat.format(currentOrder.discountAmount),
          ),
          if (currentOrder.transactionId != null) ...[
            const SizedBox(height: 6),
            _buildInvoiceInfoRow('Transaksi', currentOrder.transactionId!),
          ],
          if (currentOrder.referenceNumber != null) ...[
            const SizedBox(height: 6),
            _buildInvoiceInfoRow('Referensi', currentOrder.referenceNumber!),
          ],
        ],
      ),
    );
  }

  Widget _buildInvoiceInfoRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: const TextStyle(color: Color(0xFF6B7280), fontSize: 12),
        ),
        Text(
          value,
          style: const TextStyle(
            fontWeight: FontWeight.w700,
            color: Color(0xFF1A1A1A),
            fontSize: 12,
          ),
        ),
      ],
    );
  }

  Widget _buildVoidBanner(Order currentOrder) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFFEF2F2),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFFECACA)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: const Color(0xFFDC2626).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(
                  Icons.block_rounded,
                  size: 18,
                  color: Color(0xFFDC2626),
                ),
              ),
              const SizedBox(width: 10),
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'PESANAN DI-VOID',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFFDC2626),
                    ),
                  ),
                  SizedBox(height: 2),
                  Text(
                    'Pesanan ini telah dibatalkan secara permanen',
                    style: TextStyle(fontSize: 11, color: Color(0xFF991B1B)),
                  ),
                ],
              ),
            ],
          ),
          if (currentOrder.notes != null && currentOrder.notes!.isNotEmpty) ...[
            const SizedBox(height: 12),
            const Divider(color: Color(0xFFFECACA)),
            const SizedBox(height: 8),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Alasan: ',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF991B1B),
                  ),
                ),
                Expanded(
                  child: Text(
                    currentOrder.notes!,
                    style: const TextStyle(
                      fontSize: 11,
                      color: Color(0xFF991B1B),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: const TextStyle(color: Color(0xFF6B7280), fontSize: 13),
        ),
        Flexible(
          child: Text(
            value,
            style: const TextStyle(
              fontWeight: FontWeight.w700,
              color: Color(0xFF1A1A1A),
            ),
            textAlign: TextAlign.end,
          ),
        ),
      ],
    );
  }

  Widget _buildItemRow(OrderItem item, NumberFormat currencyFormat) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 15),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.product?.name ?? 'Produk Tidak Dikenal',
                  style: const TextStyle(
                    fontWeight: FontWeight.w700,
                    fontSize: 16,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  '${item.quantity.toInt()} x ${currencyFormat.format(item.unitPrice)}',
                  style: const TextStyle(
                    color: Color(0xFF6B7280),
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          Text(
            currencyFormat.format(item.quantity * item.unitPrice),
            style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14),
          ),
        ],
      ),
    );
  }

  Widget _buildTotalSection(NumberFormat currencyFormat) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFFF3F4F6),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const Text(
            'TOTAL',
            style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16),
          ),
          Text(
            currencyFormat.format(order.totalAmount),
            style: const TextStyle(
              fontWeight: FontWeight.w900,
              fontSize: 24,
              color: Color(0xFFFDB827),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFooter(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Row(
          children: [
            Expanded(
              flex: 1,
              child: ElevatedButton.icon(
                onPressed: () => _handleShare(),
                icon: const Icon(HugeIcons.strokeRoundedShare01, size: 20),
                label: const Text('Bagikan'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFF3F4F6),
                  foregroundColor: const Color(0xFF4B5563),
                  elevation: 0,
                  padding: const EdgeInsets.symmetric(vertical: 15),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 15),
            Expanded(
              flex: 2,
              child: ElevatedButton.icon(
                onPressed: () => _handlePrint(),
                icon: const Icon(HugeIcons.strokeRoundedPrinter, size: 20),
                label: const Text('Cetak PDF'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFFDB827),
                  foregroundColor: const Color(0xFF1A1A1A),
                  elevation: 0,
                  padding: const EdgeInsets.symmetric(vertical: 15),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _handleShare() async {
    final displayRef =
        order.referenceNumber ?? '#${order.id.substring(0, 8).toUpperCase()}';
    final text =
        'Berikut adalah rincian ${order.type} $displayRef untuk ${order.entityName}. Total: Rp ${order.totalAmount.toInt()}';
    await Share.share(text);
  }

  Future<void> _handlePrint() async {
    final pdf = pw.Document();
    final currencyFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );

    pdf.addPage(
      pw.Page(
        build: (pw.Context context) {
          return pw.Padding(
            padding: const pw.EdgeInsets.all(20),
            child: pw.Column(
              crossAxisAlignment: pw.CrossAxisAlignment.start,
              children: [
                pw.Header(
                  level: 0,
                  child: pw.Text(
                    order.type == 'SO' ? 'SALES ORDER' : 'PURCHASE ORDER',
                    style: pw.TextStyle(
                      fontSize: 24,
                      fontWeight: pw.FontWeight.bold,
                    ),
                  ),
                ),
                pw.Text(
                  'Nomor: ${order.referenceNumber ?? '#${order.id.substring(0, 8).toUpperCase()}'}',
                ),
                pw.Text('Pihak: ${order.entityName}'),
                pw.SizedBox(height: 10),
                pw.Divider(),
                pw.Table(
                  children: [
                    pw.TableRow(
                      children: [
                        pw.Padding(
                          padding: const pw.EdgeInsets.all(5),
                          child: pw.Text(
                            'Item',
                            style: pw.TextStyle(fontWeight: pw.FontWeight.bold),
                          ),
                        ),
                        pw.Padding(
                          padding: const pw.EdgeInsets.all(5),
                          child: pw.Text(
                            'Qty',
                            style: pw.TextStyle(fontWeight: pw.FontWeight.bold),
                          ),
                        ),
                        pw.Padding(
                          padding: const pw.EdgeInsets.all(5),
                          child: pw.Text(
                            'Total',
                            style: pw.TextStyle(fontWeight: pw.FontWeight.bold),
                          ),
                        ),
                      ],
                    ),
                    ...?order.items?.map(
                      (i) => pw.TableRow(
                        children: [
                          pw.Padding(
                            padding: const pw.EdgeInsets.all(5),
                            child: pw.Text(i.product?.name ?? '-'),
                          ),
                          pw.Padding(
                            padding: const pw.EdgeInsets.all(5),
                            child: pw.Text(i.quantity.toInt().toString()),
                          ),
                          pw.Padding(
                            padding: const pw.EdgeInsets.all(5),
                            child: pw.Text(
                              currencyFormat.format(i.quantity * i.unitPrice),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                pw.SizedBox(height: 20),
                pw.Align(
                  alignment: pw.Alignment.centerRight,
                  child: pw.Text(
                    'TOTAL: ${currencyFormat.format(order.totalAmount)}',
                    style: pw.TextStyle(
                      fontSize: 18,
                      fontWeight: pw.FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );

    await Printing.layoutPdf(
      onLayout: (PdfPageFormat format) async => pdf.save(),
    );
  }
}
