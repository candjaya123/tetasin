import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/pos_providers.dart';
import '../../../shared/models/cart_item.dart';

class BarcodeScannerScreen extends ConsumerStatefulWidget {
  const BarcodeScannerScreen({super.key});

  @override
  ConsumerState<BarcodeScannerScreen> createState() =>
      _BarcodeScannerScreenState();
}

class _BarcodeScannerScreenState extends ConsumerState<BarcodeScannerScreen> {
  bool _isScanning = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Scan Barcode'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        foregroundColor: Colors.white,
      ),
      extendBodyBehindAppBar: true,
      body: Stack(
        children: [
          MobileScanner(
            onDetect: (capture) {
              if (!_isScanning) return;

              final List<Barcode> barcodes = capture.barcodes;
              for (final barcode in barcodes) {
                if (barcode.rawValue != null) {
                  _handleBarcode(barcode.rawValue!);
                  break;
                }
              }
            },
          ),
          // Scanner Overlay
          Center(
            child: Container(
              width: 250,
              height: 250,
              decoration: BoxDecoration(
                border: Border.all(color: const Color(0xFFFDB827), width: 2),
                borderRadius: BorderRadius.circular(24),
              ),
            ),
          ),
          const Positioned(
            bottom: 100,
            left: 0,
            right: 0,
            child: Text(
              'Arahkan kamera ke barcode produk',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _handleBarcode(String code) {
    setState(() => _isScanning = false);

    // Logic to find product in productsProvider
    final productsAsync = ref.read(productsProvider);
    productsAsync.whenData((products) {
      try {
        final product = products.firstWhere(
          (p) => (p.sku == code || p.barcode == code) || p.id == code,
        );
        ref
            .read(cartProvider.notifier)
            .addToCart(CartItem(product: product, quantity: 1));

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${product.name} ditambahkan'),
            backgroundColor: Colors.green,
            duration: const Duration(seconds: 1),
          ),
        );
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Produk dengan kode $code tidak ditemukan'),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 2),
          ),
        );
      }
    });

    // Resume scanning after a short delay
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) setState(() => _isScanning = true);
    });
  }
}
