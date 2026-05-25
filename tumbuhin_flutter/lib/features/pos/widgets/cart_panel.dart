import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../providers/pos_providers.dart';
import 'checkout_bottom_sheet.dart';

class CartPanel extends ConsumerWidget {
  const CartPanel({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cart = ref.watch(cartProvider);
    final cartNotifier = ref.watch(cartProvider.notifier);
    final currencyFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );

    return Container(
      width: 320,
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(left: BorderSide(color: Colors.grey.shade200)),
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(20),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Keranjang',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                if (cart.isNotEmpty)
                  IconButton(
                    onPressed: () =>
                        ref.read(cartProvider.notifier).clearCart(),
                    icon: const Icon(
                      Icons.delete_outline,
                      color: Colors.red,
                      size: 20,
                    ),
                    tooltip: 'Kosongkan',
                  ),
              ],
            ),
          ),
          Expanded(
            child: cart.isEmpty
                ? Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.shopping_cart_outlined,
                          size: 44,
                          color: Colors.grey.shade300,
                        ),
                        const SizedBox(height: 14),
                        Text(
                          'Keranjang kosong',
                          style: TextStyle(
                            color: Colors.grey.shade500,
                            fontSize: 13,
                          ),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    itemCount: cart.length,
                    itemBuilder: (context, index) {
                      final item = cart[index];
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 16),
                        child: Row(
                          children: [
                            Container(
                              width: 44,
                              height: 44,
                              decoration: BoxDecoration(
                                color: Colors.grey.shade100,
                                borderRadius: BorderRadius.circular(10),
                                image: item.product.imageUrl != null
                                    ? DecorationImage(
                                        image: NetworkImage(
                                          item.product.imageUrl!,
                                        ),
                                        fit: BoxFit.cover,
                                      )
                                    : null,
                              ),
                              child: item.product.imageUrl == null
                                  ? const Icon(
                                      Icons.image,
                                      color: Colors.grey,
                                      size: 14,
                                    )
                                  : null,
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    item.product.name,
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 13,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  if (item.selectedVariants.isNotEmpty)
                                    Text(
                                      item.selectedVariants
                                          .map((v) => v.name)
                                          .join(', '),
                                      style: TextStyle(
                                        color: Colors.grey.shade500,
                                        fontSize: 10,
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  if (item.selectedAddons.isNotEmpty)
                                    Text(
                                      item.selectedAddons
                                          .map((a) => a.name)
                                          .join(', '),
                                      style: TextStyle(
                                        color: Colors.grey.shade500,
                                        fontSize: 10,
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  Text(
                                    currencyFormat.format(item.unitPrice),
                                    style: TextStyle(
                                      color: Colors.grey.shade600,
                                      fontSize: 11,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Row(
                              children: [
                                _SmallIconButton(
                                  icon: Icons.remove,
                                  onPressed: () => ref
                                      .read(cartProvider.notifier)
                                      .updateQuantity(item.compositeKey, -1),
                                ),
                                Padding(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 6,
                                  ),
                                  child: Text(
                                    '${item.quantity}',
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 13,
                                    ),
                                  ),
                                ),
                                _SmallIconButton(
                                  icon: Icons.add,
                                  onPressed: () => ref
                                      .read(cartProvider.notifier)
                                      .updateQuantity(item.compositeKey, 1),
                                ),
                              ],
                            ),
                          ],
                        ),
                      );
                    },
                  ),
          ),
          if (cart.isNotEmpty)
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.grey.shade50,
                border: Border(top: BorderSide(color: Colors.grey.shade200)),
              ),
              child: Column(
                children: [
                  _SummaryRow(
                    label: 'Subtotal',
                    value: currencyFormat.format(cartNotifier.subtotal),
                  ),
                  const SizedBox(height: 6),
                  _SummaryRow(
                    label: 'Pajak (11%)',
                    value: currencyFormat.format(cartNotifier.taxAmount),
                  ),
                  const Divider(height: 20),
                  _SummaryRow(
                    label: 'Total',
                    value: currencyFormat.format(cartNotifier.total),
                    isBold: true,
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    height: 46,
                    child: ElevatedButton(
                      onPressed: () {
                        showModalBottomSheet(
                          context: context,
                          isScrollControlled: true,
                          backgroundColor: Colors.transparent,
                          builder: (context) => const CheckoutBottomSheet(),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFFDB827),
                        foregroundColor: Colors.black,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                        elevation: 0,
                      ),
                      child: const Text(
                        'Pembayaran',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
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

class _SmallIconButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onPressed;

  const _SmallIconButton({required this.icon, required this.onPressed});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onPressed,
      child: Container(
        padding: const EdgeInsets.all(2),
        decoration: BoxDecoration(
          border: Border.all(color: Colors.grey.shade300),
          borderRadius: BorderRadius.circular(5),
        ),
        child: Icon(icon, size: 12),
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  final String label;
  final String value;
  final bool isBold;

  const _SummaryRow({
    required this.label,
    required this.value,
    this.isBold = false,
  });

  @override
  Widget build(BuildContext context) {
    final style = TextStyle(
      fontSize: isBold ? 15 : 13,
      fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
    );
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: style),
        Text(value, style: style),
      ],
    );
  }
}
