import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../shared/models/product.dart';
import '../../core/theme/responsive.dart';
import 'providers/inventory_providers.dart';
import '../../shared/repositories/repositories_provider.dart';

class ProductDetailScreen extends ConsumerStatefulWidget {
  final Product product;

  const ProductDetailScreen({super.key, required this.product});

  @override
  ConsumerState<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends ConsumerState<ProductDetailScreen> {
  bool _isDeleting = false;

  void _showDeleteConfirmation(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Hapus Produk?', style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
        content: Text('Apakah Anda yakin ingin menghapus "${widget.product.name}"? Tindakan ini tidak dapat dibatalkan.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Batal', style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(context); // Close dialog
              _deleteProduct();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              foregroundColor: Colors.white,
            ),
            child: const Text('Hapus'),
          ),
        ],
      ),
    );
  }

  Future<void> _deleteProduct() async {
    setState(() => _isDeleting = true);
    
    try {
      await ref.read(inventoryRepositoryProvider).deleteProduct(widget.product.id);
      
      if (mounted) {
        ref.invalidate(inventoryProductsProvider);
        context.pop(); // Go back to inventory list
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Produk berhasil dihapus')),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isDeleting = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Gagal menghapus produk: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final product = widget.product;
    final currencyFormat = NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0);

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      appBar: AppBar(
        title: Text('Detail Produk', style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.edit_note_rounded),
            onPressed: _isDeleting ? null : () => context.push('/inventory/edit', extra: widget.product),
          ),
          IconButton(
            icon: _isDeleting 
              ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(strokeWidth: 2))
              : const Icon(Icons.delete_outline_rounded, color: Colors.red),
            onPressed: _isDeleting ? null : () => _showDeleteConfirmation(context),
          ),
        ],
      ),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1200),
          child: Responsive(
            mobile: SingleChildScrollView(
              child: Column(
                children: [
                  _buildHeader(currencyFormat),
                  const SizedBox(height: 16),
                  _buildStockSection(),
                  const SizedBox(height: 24),
                  _buildRecipeSection(),
                  const SizedBox(height: 40),
                ],
              ),
            ),
            tablet: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    flex: 4,
                    child: Column(
                      children: [
                        _buildHeader(currencyFormat, isTablet: true),
                      ],
                    ),
                  ),
                  const SizedBox(width: 24),
                  Expanded(
                    flex: 6,
                    child: Column(
                      children: [
                        _buildStockSection(),
                        const SizedBox(height: 24),
                        _buildRecipeSection(),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(NumberFormat currencyFormat, {bool isTablet = false}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: isTablet ? BorderRadius.circular(24) : null,
      ),
      child: Column(
        children: [
          Container(
            width: isTablet ? 180 : 120,
            height: isTablet ? 180 : 120,
            decoration: BoxDecoration(
              color: Colors.grey.shade100,
              borderRadius: BorderRadius.circular(24),
            ),
            child: widget.product.imageUrl != null
                ? Hero(
                    tag: 'product-image-${widget.product.id}',
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(24),
                      child: CachedNetworkImage(
                        imageUrl: widget.product.imageUrl!,
                        fit: BoxFit.cover,
                        placeholder: (context, url) => Container(color: Colors.grey.shade100),
                        errorWidget: (context, url, error) => const Icon(Icons.error_outline),
                      ),
                    ),
                  )
                : Hero(
                    tag: 'product-image-${widget.product.id}',
                    child: Icon(Icons.image, size: isTablet ? 64 : 48, color: Colors.grey),
                  ),
          ),
          const SizedBox(height: 16),
          Text(
            widget.product.name,
            textAlign: TextAlign.center,
            style: GoogleFonts.outfit(fontSize: isTablet ? 28 : 24, fontWeight: FontWeight.bold),
          ),
          Text(
            widget.product.skuCode ?? 'Tanpa SKU',
            style: TextStyle(color: Colors.grey.shade600),
          ),
          const SizedBox(height: 12),
          Text(
            currencyFormat.format(widget.product.price),
            style: GoogleFonts.outfit(
              fontSize: isTablet ? 26 : 22,
              fontWeight: FontWeight.bold,
              color: const Color(0xFFFDB827),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStockSection() {
    return Column(
      children: [
        const _SectionHeader(title: 'Stok Gudang', icon: Icons.warehouse_rounded),
        Container(
          margin: const EdgeInsets.symmetric(horizontal: 16),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
          ),
          child: Column(
            children: [
              _StockRow(label: 'Gudang Utama', value: '${widget.product.stock} unit'),
              const Divider(height: 24),
              _StockRow(label: 'Total Keseluruhan', value: '${widget.product.stock} unit', isTotal: true),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildRecipeSection() {
    return Column(
      children: [
        const _SectionHeader(title: 'Resep / Bahan Baku', icon: Icons.receipt_long_rounded),
        Container(
          margin: const EdgeInsets.symmetric(horizontal: 16),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
          ),
          child: (widget.product.recipes == null || widget.product.recipes!.isEmpty)
              ? const Center(child: Text('Produk ini tidak memiliki resep.'))
              : Column(
                  children: widget.product.recipes!.map((r) {
                    return Column(
                      children: [
                        _RecipeRow(
                          name: r.rawMaterial?.name ?? 'Unknown Material',
                          qty: '${r.quantityNeeded} ${r.rawMaterial?.unit ?? ''}',
                        ),
                        if (r != widget.product.recipes!.last) const Divider(),
                      ],
                    );
                  }).toList(),
                ),
        ),
      ],
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;
  final IconData icon;

  const _SectionHeader({required this.title, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 0, 20, 12),
      child: Row(
        children: [
          Icon(icon, size: 20, color: Colors.grey.shade700),
          const SizedBox(width: 8),
          Text(
            title,
            style: GoogleFonts.outfit(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: Colors.grey.shade700,
            ),
          ),
        ],
      ),
    );
  }
}

class _StockRow extends StatelessWidget {
  final String label;
  final String value;
  final bool isTotal;

  const _StockRow({required this.label, required this.value, this.isTotal = false});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: TextStyle(fontWeight: isTotal ? FontWeight.bold : FontWeight.normal)),
        Text(
          value,
          style: GoogleFonts.outfit(
            fontWeight: FontWeight.bold,
            fontSize: isTotal ? 16 : 14,
            color: isTotal ? Colors.black : Colors.grey.shade700,
          ),
        ),
      ],
    );
  }
}

class _RecipeRow extends StatelessWidget {
  final String name;
  final String qty;

  const _RecipeRow({required this.name, required this.qty});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Container(
            width: 8,
            height: 8,
            decoration: const BoxDecoration(color: Color(0xFFFDB827), shape: BoxShape.circle),
          ),
          const SizedBox(width: 12),
          Expanded(child: Text(name)),
          Text(qty, style: const TextStyle(fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}
