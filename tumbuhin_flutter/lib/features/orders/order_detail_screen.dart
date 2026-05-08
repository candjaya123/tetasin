import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hugeicons/hugeicons.dart';
import 'package:intl/intl.dart';
import 'package:printing/printing.dart';
import 'package:share_plus/share_plus.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import '../../shared/models/order.dart';

import '../../core/theme/responsive.dart';

class OrderDetailScreen extends ConsumerWidget {
  final Order order;

  const OrderDetailScreen({super.key, required this.order});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currencyFormat = NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0);

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Detail Pesanan', style: TextStyle(fontWeight: FontWeight.w900)),
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
                  _buildInfoCard(context),
                  const SizedBox(height: 30),
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
                  if (order.items != null && order.items!.isNotEmpty)
                    ...order.items!.map((item) => _buildItemRow(item, currencyFormat))
                  else
                    const Center(
                      child: Padding(
                        padding: EdgeInsets.symmetric(vertical: 20),
                        child: Text('Tidak ada item tercatat', style: TextStyle(color: Colors.grey)),
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
                        _buildInfoCard(context),
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
                          if (order.items != null && order.items!.isNotEmpty)
                            ...order.items!.map((item) => _buildItemRow(item, currencyFormat))
                          else
                            const Center(
                              child: Padding(
                                padding: EdgeInsets.symmetric(vertical: 40),
                                child: Text('Tidak ada item tercatat', style: TextStyle(color: Colors.grey)),
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

  Widget _buildInfoCard(BuildContext context) {
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
              Text(
                '#${order.id.substring(0, 8).toUpperCase()}',
                style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18),
              ),
              _buildStatusBadge(order.status),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            order.type == 'SO' ? 'Sales Order' : 'Purchase Order',
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
            order.type == 'SO' ? 'Pelanggan' : 'Supplier',
            order.entityName ?? '-',
          ),
          const SizedBox(height: 10),
          _buildInfoRow(
            'Tanggal',
            DateFormat('dd MMM yyyy, HH:mm').format(order.createdAt),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusBadge(String status) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: const Color(0xFFD1FAE5),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.checklist_rtl_rounded, size: 12, color: Color(0xFF10B981)),
          const SizedBox(width: 4),
          Text(
            status.toUpperCase(),
            style: const TextStyle(
              color: Color(0xFF065F46),
              fontSize: 10,
              fontWeight: FontWeight.w800,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: Color(0xFF6B7280), fontSize: 13)),
        Text(value, style: const TextStyle(fontWeight: FontWeight.w700, color: Color(0xFF1A1A1A))),
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
                  style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16),
                ),
                const SizedBox(height: 2),
                Text(
                  '${item.quantity.toInt()} x ${currencyFormat.format(item.unitPrice)}',
                  style: const TextStyle(color: Color(0xFF6B7280), fontSize: 12),
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
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
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
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _handleShare() async {
    final text = 'Berikut adalah rincian ${order.type} #${order.id.substring(0, 8).toUpperCase()} untuk ${order.entityName}. Total: Rp ${order.totalAmount.toInt()}';
    await Share.share(text);
  }

  Future<void> _handlePrint() async {
    final pdf = pw.Document();
    final currencyFormat = NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0);

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
                  child: pw.Text(order.type == 'SO' ? 'SALES ORDER' : 'PURCHASE ORDER',
                      style: pw.TextStyle(fontSize: 24, fontWeight: pw.FontWeight.bold)),
                ),
                pw.Text('Nomor: #${order.id.substring(0, 8).toUpperCase()}'),
                pw.Text('Pihak: ${order.entityName}'),
                pw.SizedBox(height: 10),
                pw.Divider(),
                pw.Table(
                  children: [
                    pw.TableRow(
                      children: [
                        pw.Padding(padding: const pw.EdgeInsets.all(5), child: pw.Text('Item', style: pw.TextStyle(fontWeight: pw.FontWeight.bold))),
                        pw.Padding(padding: const pw.EdgeInsets.all(5), child: pw.Text('Qty', style: pw.TextStyle(fontWeight: pw.FontWeight.bold))),
                        pw.Padding(padding: const pw.EdgeInsets.all(5), child: pw.Text('Total', style: pw.TextStyle(fontWeight: pw.FontWeight.bold))),
                      ],
                    ),
                    ...?order.items?.map((i) => pw.TableRow(
                      children: [
                        pw.Padding(padding: const pw.EdgeInsets.all(5), child: pw.Text(i.product?.name ?? '-')),
                        pw.Padding(padding: const pw.EdgeInsets.all(5), child: pw.Text(i.quantity.toInt().toString())),
                        pw.Padding(padding: const pw.EdgeInsets.all(5), child: pw.Text(currencyFormat.format(i.quantity * i.unitPrice))),
                      ],
                    )),
                  ],
                ),
                pw.SizedBox(height: 20),
                pw.Align(
                  alignment: pw.Alignment.centerRight,
                  child: pw.Text('TOTAL: ${currencyFormat.format(order.totalAmount)}',
                      style: pw.TextStyle(fontSize: 18, fontWeight: pw.FontWeight.bold)),
                ),
              ],
            ),
          );
        },
      ),
    );

    await Printing.layoutPdf(onLayout: (PdfPageFormat format) async => pdf.save());
  }
}
