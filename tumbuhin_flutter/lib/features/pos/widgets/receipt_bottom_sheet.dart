import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:esc_pos_utils_plus/esc_pos_utils_plus.dart';
import '../../../shared/models/cart_item.dart';
import '../../../core/hardware/bluetooth_printer_service.dart';

class ReceiptBottomSheet extends ConsumerWidget {
  final List<CartItem> items;
  final String orderId;
  final double total;
  final String paymentMethod;

  const ReceiptBottomSheet({
    super.key,
    required this.items,
    required this.orderId,
    required this.total,
    required this.paymentMethod,
  });

  Future<void> _printPhysicalReceipt(
    WidgetRef ref,
    BuildContext context,
  ) async {
    final service = ref.read(bluetoothPrinterServiceProvider);
    if (!service.isConnected) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Printer Bluetooth belum terhubung. Atur di Pengaturan.',
          ),
        ),
      );
      return;
    }

    try {
      final profile = await CapabilityProfile.load();
      final generator = Generator(PaperSize.mm58, profile);
      List<int> bytes = [];

      bytes += generator.text(
        'TUMBUHIN POS',
        styles: const PosStyles(
          align: PosAlign.center,
          bold: true,
          height: PosTextSize.size2,
        ),
      );
      bytes += generator.text(
        'ID: $orderId',
        styles: const PosStyles(align: PosAlign.center),
      );
      bytes += generator.text(
        DateFormat('dd/MM/yyyy HH:mm').format(DateTime.now()),
        styles: const PosStyles(align: PosAlign.center),
      );
      bytes += generator.hr();

      for (var item in items) {
        bytes += generator.row([
          PosColumn(text: '${item.quantity}x ${item.product.name}', width: 8),
          PosColumn(
            text: NumberFormat.currency(
              locale: 'id_ID',
              symbol: '',
              decimalDigits: 0,
            ).format(item.lineTotal),
            width: 4,
            styles: const PosStyles(align: PosAlign.right),
          ),
        ]);
      }

      bytes += generator.hr();
      bytes += generator.row([
        PosColumn(text: 'TOTAL', width: 6, styles: const PosStyles(bold: true)),
        PosColumn(
          text: NumberFormat.currency(
            locale: 'id_ID',
            symbol: 'Rp',
            decimalDigits: 0,
          ).format(total),
          width: 6,
          styles: const PosStyles(align: PosAlign.right, bold: true),
        ),
      ]);
      bytes += generator.text(
        'Metode: $paymentMethod',
        styles: const PosStyles(align: PosAlign.center),
      );
      bytes += generator.feed(2);
      bytes += generator.cut();

      await service.printReceipt(bytes);
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Gagal mencetak: $e')));
      }
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currencyFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );
    final dateFormat = DateFormat('dd MMM yyyy, HH:mm');

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.check_circle, color: Colors.green, size: 64),
            const SizedBox(height: 16),
            const Text(
              'Pembayaran Berhasil!',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 24),

            // "Paper" Receipt look
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.grey.shade50,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: Column(
                children: [
                  const Text(
                    'Tetasin POS',
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                  Text(
                    orderId,
                    style: const TextStyle(fontSize: 12, color: Colors.grey),
                  ),
                  Text(
                    dateFormat.format(DateTime.now()),
                    style: const TextStyle(fontSize: 12, color: Colors.grey),
                  ),
                  const Divider(height: 32),
                  ...items.map(
                    (item) => Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            '${item.quantity}x ${item.product.name}',
                            style: const TextStyle(fontSize: 14),
                          ),
                          Text(
                            currencyFormat.format(item.lineTotal),
                            style: const TextStyle(fontSize: 14),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const Divider(height: 32),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Total',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                      Text(
                        currencyFormat.format(total),
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),
            QrImageView(data: orderId, version: QrVersions.auto, size: 100.0),
            const SizedBox(height: 8),
            const Text(
              'Struk Digital',
              style: TextStyle(fontSize: 12, color: Colors.grey),
            ),

            const SizedBox(height: 32),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => _printPhysicalReceipt(ref, context),
                    icon: const Icon(Icons.print_rounded),
                    label: const Text('Cetak Struk'),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () {
                      Navigator.pop(context);
                      context.push('/pesanan');
                    },
                    icon: const Icon(Icons.receipt_long_rounded),
                    label: const Text('Pesanan'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFFDB827),
                      foregroundColor: const Color(0xFF1A1A1A),
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: () => Navigator.pop(context),
                icon: const Icon(Icons.done_all),
                label: const Text('Selesai'),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
