import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../providers/pos_providers.dart';
import '../../../shared/models/cart_item.dart';
import 'receipt_bottom_sheet.dart';
import '../../../shared/repositories/repositories_provider.dart';

class CheckoutBottomSheet extends ConsumerStatefulWidget {
  const CheckoutBottomSheet({super.key});

  @override
  ConsumerState<CheckoutBottomSheet> createState() =>
      _CheckoutBottomSheetState();
}

class _CheckoutBottomSheetState extends ConsumerState<CheckoutBottomSheet> {
  bool _isLoading = false;
  String _selectedPayment = 'Tunai';

  Future<void> _handleCheckout() async {
    HapticFeedback.mediumImpact();
    setState(() => _isLoading = true);
    try {
      final cart = ref.read(cartProvider);
      final cartNotifier = ref.read(cartProvider.notifier);

      final checkoutData = {
        'items': cart
            .map(
              (item) => {
                'product_id': item.product.id,
                'quantity': item.quantity,
                'price': item.unitPrice,
                'selected_variants': item.selectedVariants
                    .map(
                      (v) => {
                        'variant_option_id': v.id,
                        'name': v.name,
                        'price_delta': v.priceDelta,
                      },
                    )
                    .toList(),
                'selected_addons': item.selectedAddons
                    .map(
                      (a) => {
                        'addon_id': a.id,
                        'name': a.name,
                        'price': a.price,
                      },
                    )
                    .toList(),
                if (item.specialInstructions != null)
                  'special_instructions': item.specialInstructions,
              },
            )
            .toList(),
        'payment_method': _selectedPayment,
        'subtotal': cartNotifier.subtotal,
        'tax_amount': cartNotifier.taxAmount,
        'total': cartNotifier.total,
      };

      final result = await ref
          .read(posRepositoryProvider)
          .processCheckout(checkoutData);

      if (mounted) {
        final itemsSnapshot = List<CartItem>.from(cart);
        final totalSnapshot = cartNotifier.total;
        final paymentSnapshot = _selectedPayment;
        final orderNumber = result['order_number'] ?? 'BERHASIL';

        ref.read(cartProvider.notifier).clearCart();
        Navigator.pop(context); // Close checkout sheet

        try {
          await showModalBottomSheet(
            context: context,
            isScrollControlled: true,
            backgroundColor: Colors.transparent,
            builder: (context) => ReceiptBottomSheet(
              items: itemsSnapshot,
              orderId: orderNumber,
              total: totalSnapshot,
              paymentMethod: paymentSnapshot,
            ),
          );
        } catch (receiptErr) {
          // If receipt sheet fails, still show success message
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Transaksi $orderNumber berhasil.'),
              backgroundColor: Colors.green,
              duration: const Duration(seconds: 4),
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        String errorMessage = e.toString();

        if (e is DioException && e.response != null) {
          final statusCode = e.response?.statusCode;
          final data = e.response?.data;
          errorMessage = 'Server Error ($statusCode): $data';
        } else if (e.toString().contains('timeout')) {
          errorMessage =
              'Koneksi Timeout. Pastikan server aktif dan terjangkau oleh HP.';
        }

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(errorMessage),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 5),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final cartNotifier = ref.watch(cartProvider.notifier);
    final currencyFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );

    return Container(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const SizedBox(height: 12),
          Container(
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.grey.shade300,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Konfirmasi Pembayaran',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 24),
                const Text(
                  'Metode Pembayaran',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 12),
                _PaymentOption(
                  label: 'Tunai',
                  icon: Icons.money,
                  isSelected: _selectedPayment == 'Tunai',
                  onTap: () => setState(() => _selectedPayment = 'Tunai'),
                ),
                _PaymentOption(
                  label: 'Transfer Bank',
                  icon: Icons.account_balance,
                  isSelected: _selectedPayment == 'Transfer',
                  onTap: () => setState(() => _selectedPayment = 'Transfer'),
                ),
                _PaymentOption(
                  label: 'E-Wallet',
                  icon: Icons.account_balance_wallet,
                  isSelected: _selectedPayment == 'E-Wallet',
                  onTap: () => setState(() => _selectedPayment = 'E-Wallet'),
                ),
                const Divider(height: 40),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Total Bayar', style: TextStyle(fontSize: 16)),
                    Text(
                      currencyFormat.format(cartNotifier.total),
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  height: 55,
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _handleCheckout,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF1A1A1A),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                    child: _isLoading
                        ? const CircularProgressIndicator(color: Colors.white)
                        : const Text(
                            'Selesaikan Transaksi',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                          ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _PaymentOption extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool isSelected;
  final VoidCallback onTap;

  const _PaymentOption({
    required this.label,
    required this.icon,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      onTap: onTap,
      leading: Icon(
        icon,
        color: isSelected ? const Color(0xFFFDB827) : Colors.grey,
      ),
      title: Text(label),
      trailing: isSelected
          ? const Icon(Icons.check_circle, color: Color(0xFFFDB827))
          : null,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(
          color: isSelected ? const Color(0xFFFDB827) : Colors.grey.shade200,
        ),
      ),
    );
  }
}
