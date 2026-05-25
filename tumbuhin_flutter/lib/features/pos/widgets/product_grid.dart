import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:hugeicons/hugeicons.dart';

import '../providers/pos_providers.dart';
import '../../../shared/models/product.dart';
import '../../../shared/models/cart_item.dart';
import '../../../shared/widgets/polish_widgets.dart';
import '../../../core/theme/responsive.dart';
import '../../../core/theme/app_colors.dart';
import 'package:google_fonts/google_fonts.dart';
import 'product_selection_sheet.dart';

class ProductGrid extends ConsumerWidget {
  const ProductGrid({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final productsAsync = ref.watch(productsProvider);
    final searchQuery = ref.watch(posSearchQueryProvider).toLowerCase();

    return productsAsync.when(
      data: (products) {
        final filteredProducts = products.where((p) {
          return p.name.toLowerCase().contains(searchQuery);
        }).toList();

        if (filteredProducts.isEmpty) {
          return const EmptyStateWidget(
            title: 'Produk tidak ditemukan',
            message: 'Coba ubah kata kunci pencarian Anda.',
            icon: HugeIcons.strokeRoundedSearch02,
          );
        }

        final crossAxisCount = context.screenWidth < 600
            ? 2
            : context.screenWidth < 900
            ? 3
            : 4;

        return AppRefreshIndicator(
          onRefresh: () => ref.refresh(productsProvider.future),
          child: GridView.builder(
            padding: const EdgeInsets.all(20),
            gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: crossAxisCount,
              childAspectRatio: 0.75,
              crossAxisSpacing: 20,
              mainAxisSpacing: 20,
            ),
            itemCount: filteredProducts.length,
            itemBuilder: (context, index) {
              return ProductItem(product: filteredProducts[index])
                  .animate()
                  .scale(duration: 200.ms, begin: const Offset(0.9, 0.9))
                  .fadeIn(duration: 200.ms);
            },
          ),
        );
      },

      loading: () {
        final crossAxisCount = context.screenWidth < 600
            ? 2
            : context.screenWidth < 900
            ? 3
            : 4;

        return GridView.builder(
          padding: const EdgeInsets.all(20),
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: crossAxisCount,
            childAspectRatio: 0.75,
            crossAxisSpacing: 20,
            mainAxisSpacing: 20,
          ),
          itemCount: 6,
          itemBuilder: (context, index) {
            return const SkeletonLoader(
              width: double.infinity,
              height: double.infinity,
              borderRadius: 16,
            );
          },
        );
      },

      error: (e, s) => ErrorStateWidget(
        error: e.toString(),
        onRetry: () => ref.refresh(productsProvider.future),
      ),
    );
  }
}

class ProductItem extends ConsumerWidget {
  final Product product;

  const ProductItem({super.key, required this.product});

  Future<void> _handleTap(BuildContext context, WidgetRef ref) async {
    HapticFeedback.lightImpact();

    final hasRequiredVariants =
        product.variantGroups?.any((g) => g.isRequired) ?? false;
    final hasRequiredAddons =
        product.addonGroups?.any((g) => g.isRequired) ?? false;

    if (hasRequiredVariants || hasRequiredAddons) {
      final cartItem = await showModalBottomSheet<CartItem>(
        context: context,
        isScrollControlled: true,
        backgroundColor: Colors.transparent,
        builder: (_) => ProductSelectionSheet(product: product),
      );
      if (cartItem != null && context.mounted) {
        ref.read(cartProvider.notifier).addToCart(cartItem);
        _showSnackBar(context, '${product.name} ditambah ke keranjang');
      }
    } else {
      ref
          .read(cartProvider.notifier)
          .addToCart(CartItem(product: product, quantity: 1));
      _showSnackBar(context, '${product.name} ditambah ke keranjang');
    }
  }

  void _showSnackBar(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        duration: const Duration(milliseconds: 500),
      ),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currencyFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );

    return InkWell(
      onTap: () => _handleTap(context, ref),
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppColors.borderLight, width: 0.5),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: product.imageUrl != null
                  ? ClipRRect(
                      borderRadius: const BorderRadius.vertical(
                        top: Radius.circular(20),
                      ),
                      child: CachedNetworkImage(
                        imageUrl: product.imageUrl!,
                        fit: BoxFit.cover,
                        width: double.infinity,
                        placeholder: (context, url) =>
                            Container(color: AppColors.surfaceSecondary),
                        errorWidget: (context, url, error) => const Icon(
                          Icons.error_outline,
                          color: AppColors.textTertiary,
                        ),
                      ),
                    )
                  : Container(
                      width: double.infinity,
                      decoration: const BoxDecoration(
                        color: AppColors.surfaceSecondary,
                        borderRadius: BorderRadius.vertical(
                          top: Radius.circular(20),
                        ),
                      ),
                      child: const Center(
                        child: Icon(
                          Icons.image_outlined,
                          color: AppColors.textTertiary,
                          size: 28,
                        ),
                      ),
                    ),
            ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    product.name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.outfit(
                      fontWeight: FontWeight.w700,
                      fontSize: 14,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    currencyFormat.format(product.price),
                    style: GoogleFonts.outfit(
                      color: AppColors.primary,
                      fontWeight: FontWeight.w800,
                      fontSize: 15,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Stok: ${product.stock}',
                    style: GoogleFonts.outfit(
                      fontSize: 12,
                      color: AppColors.textTertiary,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
