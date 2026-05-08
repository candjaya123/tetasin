import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:hugeicons/hugeicons.dart';

import '../providers/pos_providers.dart';
import '../../../shared/models/product.dart';
import '../../../shared/widgets/polish_widgets.dart';
import '../../../core/theme/responsive.dart';

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
            padding: const EdgeInsets.all(16),
            gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: crossAxisCount,
              childAspectRatio: 0.75,
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
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

      // ✅ FIX LOADING
      loading: () {
        final crossAxisCount = context.screenWidth < 600
            ? 2
            : context.screenWidth < 900
            ? 3
            : 4;

        return GridView.builder(
          padding: const EdgeInsets.all(16),
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: crossAxisCount,
            childAspectRatio: 0.75,
            crossAxisSpacing: 16,
            mainAxisSpacing: 16,
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

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currencyFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );

    return InkWell(
      onTap: () {
        HapticFeedback.lightImpact();
        ref.read(cartProvider.notifier).addToCart(product);

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${product.name} ditambah ke keranjang'),
            duration: const Duration(milliseconds: 500),
          ),
        );
      },
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              // ✅ FIX: withValues → withOpacity
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: product.imageUrl != null
                  ? ClipRRect(
                      borderRadius: const BorderRadius.vertical(
                        top: Radius.circular(16),
                      ),
                      child: CachedNetworkImage(
                        imageUrl: product.imageUrl!,
                        fit: BoxFit.cover,
                        placeholder: (context, url) =>
                            Container(color: Colors.grey.shade100),
                        errorWidget: (context, url, error) =>
                            const Icon(Icons.error_outline),
                      ),
                    )
                  : const Center(
                      child: Icon(Icons.image, color: Colors.grey, size: 40),
                    ),
            ),
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    product.name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    currencyFormat.format(product.price),
                    style: TextStyle(
                      color: Theme.of(context).primaryColor,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Stok: ${product.stock}',
                    style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
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
