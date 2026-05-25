import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:go_router/go_router.dart';
import 'providers/inventory_providers.dart';
import '../../shared/models/product.dart';
import 'package:intl/intl.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'dart:async';
import '../../shared/widgets/polish_widgets.dart';
import '../../shared/repositories/repositories_provider.dart';

class InventoryScreen extends ConsumerStatefulWidget {
  const InventoryScreen({super.key});

  @override
  ConsumerState<InventoryScreen> createState() => _InventoryScreenState();
}

class _InventoryScreenState extends ConsumerState<InventoryScreen> {
  Timer? _debounce;

  @override
  void dispose() {
    _debounce?.cancel();
    super.dispose();
  }

  void _onSearchChanged(String query) {
    if (_debounce?.isActive ?? false) _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 500), () {
      ref.read(inventorySearchProvider.notifier).state = query;
    });
  }

  void _showAddStockSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => const _AddStockBottomSheet(),
    );
  }

  void _showManageStockSheet(BuildContext context, Product product) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _ManageStockBottomSheet(product: product),
    ).then((_) => ref.invalidate(inventoryProductsProvider));
  }

  void _showDeleteConfirmation(Product product) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(
          'Hapus Produk?',
          style: GoogleFonts.outfit(fontWeight: FontWeight.bold),
        ),
        content: Text('Apakah Anda yakin ingin menghapus "${product.name}"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Batal', style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(context);
              try {
                await ref
                    .read(inventoryRepositoryProvider)
                    .deleteProduct(product.id);
                ref.invalidate(inventoryProductsProvider);
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Produk berhasil dihapus')),
                  );
                }
              } catch (e) {
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Gagal menghapus produk: $e'),
                      backgroundColor: Colors.red,
                    ),
                  );
                }
              }
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

  @override
  Widget build(BuildContext context) {
    final productsAsync = ref.watch(inventoryProductsProvider);
    final currencyFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );
    final isToolbarExpanded = ref.watch(inventoryToolbarExpandedProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      floatingActionButton:
          FloatingActionButton(
            onPressed: () => context.push('/inventory/add'),
            backgroundColor: const Color(0xFFFDB827),
            foregroundColor: Colors.black,
            elevation: 4,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
            child: const Icon(Icons.add_rounded, size: 22),
          ).animate().scale(
            delay: 200.ms,
            duration: 300.ms,
            curve: Curves.easeOutBack,
          ),
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 20, 24, 4),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Inventaris',
                        style: GoogleFonts.outfit(
                          fontSize: 26,
                          fontWeight: FontWeight.w900,
                          color: const Color(0xFF1A1A1A),
                          letterSpacing: -0.5,
                        ),
                      ),
                      const SizedBox(height: 4),
                      productsAsync.when(
                        data: (p) => Text(
                          '${p.length} Produk',
                          style: GoogleFonts.outfit(
                            fontSize: 12,
                            color: Colors.grey.shade500,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        loading: () => const SizedBox.shrink(),
                        error: (_, __) => const SizedBox.shrink(),
                      ),
                    ],
                  ),
                  Container(
                    height: 36,
                    width: 36,
                    decoration: BoxDecoration(
                      color: const Color(0xFFF3F4F6),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: IconButton(
                      padding: EdgeInsets.zero,
                      iconSize: 18,
                      onPressed: () {
                        ref
                                .read(inventoryToolbarExpandedProvider.notifier)
                                .state =
                            !isToolbarExpanded;
                      },
                      icon: Icon(
                        isToolbarExpanded
                            ? Icons.keyboard_arrow_up_rounded
                            : Icons.keyboard_arrow_down_rounded,
                        color: const Color(0xFF6B7280),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            if (isToolbarExpanded) ...[
              Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: 24,
                  vertical: 8,
                ),
                child: Container(
                  height: 44,
                  padding: const EdgeInsets.symmetric(horizontal: 14),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: TextField(
                    onChanged: _onSearchChanged,
                    style: GoogleFonts.outfit(fontSize: 14),
                    decoration: InputDecoration(
                      hintText: 'Cari produk, SKU, barcode...',
                      hintStyle: GoogleFonts.outfit(
                        color: Colors.grey.shade400,
                        fontSize: 14,
                      ),
                      border: InputBorder.none,
                      icon: const Icon(
                        Icons.search_rounded,
                        size: 18,
                        color: Color(0xFF6B7280),
                      ),
                    ),
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: 24,
                  vertical: 6,
                ),
                child: Row(
                  children: [
                    _QuickActionChip(
                      title: 'Stok In',
                      icon: Icons.add_circle_outline_rounded,
                      color: const Color(0xFF6C5CE7),
                      onTap: () => _showAddStockSheet(context),
                    ),
                    const SizedBox(width: 8),
                    _QuickActionChip(
                      title: 'Opname',
                      icon: Icons.assignment_turned_in_rounded,
                      color: const Color(0xFFE17055),
                      onTap: () => context.push('/inventory/opname'),
                    ),
                    const SizedBox(width: 8),
                    _QuickActionChip(
                      title: 'Transfer',
                      icon: Icons.swap_horizontal_circle_rounded,
                      color: const Color(0xFF00B894),
                      onTap: () => context.push('/inventory/transfer'),
                    ),
                  ],
                ),
              ),
            ],
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 12, 24, 12),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  'Daftar Produk',
                  style: GoogleFonts.outfit(
                    fontSize: 14,
                    fontWeight: FontWeight.w800,
                    color: const Color(0xFF1A1A1A),
                  ),
                ),
              ),
            ),
            Expanded(
              child: productsAsync.when(
                data: (products) => products.isEmpty
                    ? EmptyStateWidget(
                        title: 'Belum ada produk',
                        message:
                            'Tekan tombol + di pojok kanan bawah\nuntuk menambah produk baru.',
                        onAction: () => context.push('/inventory/add'),
                        actionLabel: 'Tambah Produk',
                      )
                    : AppRefreshIndicator(
                        onRefresh: () =>
                            ref.refresh(inventoryProductsProvider.future),
                        child: ListView.builder(
                          padding: const EdgeInsets.symmetric(horizontal: 24),
                          itemCount: products.length,
                          itemBuilder: (context, index) {
                            final product = products[index];
                            return _ProductListTile(
                                  product: product,
                                  currencyFormat: currencyFormat,
                                  onDelete: () =>
                                      _showDeleteConfirmation(product),
                                  onManageStock: () =>
                                      _showManageStockSheet(context, product),
                                )
                                .animate(delay: (index * 40).ms)
                                .fadeIn(duration: 300.ms)
                                .slideY(begin: 0.06, end: 0);
                          },
                        ),
                      ),
                loading: () => ListView.builder(
                  padding: const EdgeInsets.all(24),
                  itemCount: 6,
                  itemBuilder: (context, index) => SkeletonLoader.listTile(),
                ),
                error: (err, stack) => ErrorStateWidget(
                  error: err.toString(),
                  onRetry: () => ref.refresh(inventoryProductsProvider),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _QuickActionChip extends StatelessWidget {
  final String title;
  final IconData icon;
  final Color color;
  final VoidCallback onTap;

  const _QuickActionChip({
    required this.title,
    required this.icon,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.06),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: color.withValues(alpha: 0.12)),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, color: color, size: 18),
              const SizedBox(width: 6),
              Text(
                title,
                style: GoogleFonts.outfit(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: color,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ProductListTile extends StatelessWidget {
  final Product product;
  final NumberFormat currencyFormat;
  final VoidCallback? onDelete;
  final VoidCallback? onManageStock;

  const _ProductListTile({
    required this.product,
    required this.currencyFormat,
    this.onDelete,
    this.onManageStock,
  });

  @override
  Widget build(BuildContext context) {
    final isLowStock = product.stock < 10;

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFF3F4F6)),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () => context.push('/inventory/detail', extra: product),
          borderRadius: BorderRadius.circular(20),
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Row(
              children: [
                Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8F9FA),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: product.imageUrl != null
                      ? ClipRRect(
                          borderRadius: BorderRadius.circular(14),
                          child: CachedNetworkImage(
                            imageUrl: product.imageUrl!,
                            fit: BoxFit.cover,
                            placeholder: (context, url) =>
                                const SkeletonLoader(width: 56, height: 56),
                            errorWidget: (context, url, error) => const Icon(
                              Icons.image_not_supported_rounded,
                              color: Colors.grey,
                            ),
                          ),
                        )
                      : const Icon(
                          Icons.inventory_2_rounded,
                          color: Color(0xFFFDB827),
                          size: 24,
                        ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        product.name,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: GoogleFonts.outfit(
                          fontSize: 14,
                          fontWeight: FontWeight.w800,
                          color: const Color(0xFF1A1A1A),
                        ),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        product.sku ?? product.barcode ?? 'Tanpa SKU',
                        style: GoogleFonts.outfit(
                          fontSize: 11,
                          color: Colors.grey.shade500,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 5),
                      Text(
                        currencyFormat.format(product.price),
                        style: GoogleFonts.outfit(
                          fontSize: 14,
                          fontWeight: FontWeight.w900,
                          color: const Color(0xFFFDB827),
                        ),
                      ),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: isLowStock
                            ? Colors.red.withValues(alpha: 0.08)
                            : const Color(0xFFFDB827).withValues(alpha: 0.08),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        '${product.stock} Unit',
                        style: GoogleFonts.outfit(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: isLowStock
                              ? Colors.red
                              : const Color(0xFFFDB827),
                        ),
                      ),
                    ),
                    const SizedBox(height: 8),
                    PopupMenuButton<String>(
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                      iconSize: 18,
                      icon: const Icon(
                        Icons.more_vert_rounded,
                        color: Color(0xFF6B7280),
                      ),
                      onSelected: (value) {
                        if (value == 'stock' && onManageStock != null)
                          onManageStock!();
                        if (value == 'delete' && onDelete != null) onDelete!();
                      },
                      itemBuilder: (ctx) => [
                        if (onManageStock != null)
                          const PopupMenuItem(
                            value: 'stock',
                            child: Row(
                              children: [
                                Icon(
                                  Icons.edit_calendar_rounded,
                                  size: 16,
                                  color: Color(0xFFFDB827),
                                ),
                                SizedBox(width: 10),
                                Text(
                                  'Atur Stok',
                                  style: TextStyle(fontSize: 13),
                                ),
                              ],
                            ),
                          ),
                        if (onDelete != null)
                          const PopupMenuItem(
                            value: 'delete',
                            child: Row(
                              children: [
                                Icon(
                                  Icons.delete_outline_rounded,
                                  size: 16,
                                  color: Colors.redAccent,
                                ),
                                SizedBox(width: 10),
                                Text(
                                  'Hapus Produk',
                                  style: TextStyle(fontSize: 13),
                                ),
                              ],
                            ),
                          ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ─── Manage Stock Per Product ───────────────────────────────────────────────
class _ManageStockBottomSheet extends ConsumerStatefulWidget {
  final Product product;
  const _ManageStockBottomSheet({required this.product});

  @override
  ConsumerState<_ManageStockBottomSheet> createState() =>
      _ManageStockBottomSheetState();
}

class _ManageStockBottomSheetState
    extends ConsumerState<_ManageStockBottomSheet>
    with TickerProviderStateMixin {
  late TabController _tabController;
  final _addQtyController = TextEditingController();
  final _setQtyController = TextEditingController();
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _tabController.addListener(() => setState(() {}));
    _setQtyController.text = '${widget.product.stock}';
  }

  @override
  void dispose() {
    _tabController.dispose();
    _addQtyController.dispose();
    _setQtyController.dispose();
    super.dispose();
  }

  Future<void> _saveAddStock() async {
    final qty = int.tryParse(_addQtyController.text);
    if (qty == null || qty <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Masukkan jumlah yang valid'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }
    setState(() => _isSaving = true);
    try {
      final repo = ref.read(inventoryRepositoryProvider);
      await repo.updateProductStock(
        productId: widget.product.id,
        newStock: widget.product.stock + qty,
      );
      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Stok ${widget.product.name} ditambah $qty unit'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Gagal: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  Future<void> _saveSetStock() async {
    final qty = int.tryParse(_setQtyController.text);
    if (qty == null || qty < 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Masukkan jumlah yang valid'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }
    setState(() => _isSaving = true);
    try {
      final repo = ref.read(inventoryRepositoryProvider);
      await repo.updateProductStock(
        productId: widget.product.id,
        newStock: qty.toDouble(),
      );
      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Stok ${widget.product.name} diatur ke $qty unit'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Gagal: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(
        left: 24,
        right: 24,
        top: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 32,
      ),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(30)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey.shade300,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFFFEF9E7),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: const Icon(
                  Icons.inventory_2_outlined,
                  color: Color(0xFFFDB827),
                  size: 24,
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Atur Stok',
                      style: GoogleFonts.outfit(
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    Text(
                      widget.product.name,
                      style: GoogleFonts.outfit(
                        fontSize: 13,
                        color: Colors.grey.shade600,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 14,
                  vertical: 8,
                ),
                decoration: BoxDecoration(
                  color: const Color(0xFFFEF9E7),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  children: [
                    Text(
                      'Stok Saat Ini',
                      style: GoogleFonts.outfit(
                        fontSize: 10,
                        color: Colors.grey.shade500,
                      ),
                    ),
                    Text(
                      '${widget.product.stock}',
                      style: GoogleFonts.outfit(
                        fontSize: 20,
                        fontWeight: FontWeight.w900,
                        color: const Color(0xFFFDB827),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Container(
            decoration: BoxDecoration(
              color: Colors.grey.shade100,
              borderRadius: BorderRadius.circular(14),
            ),
            child: TabBar(
              controller: _tabController,
              indicator: BoxDecoration(
                color: const Color(0xFFFDB827),
                borderRadius: BorderRadius.circular(12),
              ),
              indicatorSize: TabBarIndicatorSize.tab,
              labelColor: Colors.black,
              unselectedLabelColor: Colors.grey.shade600,
              labelStyle: GoogleFonts.outfit(
                fontWeight: FontWeight.w700,
                fontSize: 13,
              ),
              unselectedLabelStyle: GoogleFonts.outfit(
                fontWeight: FontWeight.w500,
                fontSize: 13,
              ),
              dividerColor: Colors.transparent,
              tabs: const [
                Tab(text: '  Tambah Stok  '),
                Tab(text: '  Set Stok  '),
              ],
            ),
          ),
          const SizedBox(height: 20),
          SizedBox(
            height: 110,
            child: TabBarView(
              controller: _tabController,
              children: [
                TextField(
                  controller: _addQtyController,
                  keyboardType: TextInputType.number,
                  autofocus: true,
                  onChanged: (_) => setState(() {}),
                  decoration: InputDecoration(
                    labelText: 'Jumlah Tambah',
                    hintText: 'Contoh: 50',
                    helperText: _addQtyController.text.isEmpty
                        ? 'Stok baru: ${widget.product.stock} + ? unit'
                        : 'Stok baru: ${widget.product.stock + (int.tryParse(_addQtyController.text) ?? 0)} unit',
                    prefixIcon: const Icon(
                      Icons.add_circle_outline,
                      color: Color(0xFFFDB827),
                    ),
                    filled: true,
                    fillColor: Colors.grey.shade50,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: BorderSide(color: Colors.grey.shade200),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: const BorderSide(
                        color: Color(0xFFFDB827),
                        width: 2,
                      ),
                    ),
                  ),
                ),
                TextField(
                  controller: _setQtyController,
                  keyboardType: TextInputType.number,
                  onChanged: (_) => setState(() {}),
                  decoration: InputDecoration(
                    labelText: 'Set Stok Baru',
                    hintText: 'Contoh: 100',
                    helperText:
                        'Stok lama (${widget.product.stock}) akan diganti.',
                    prefixIcon: const Icon(
                      Icons.tune_rounded,
                      color: Color(0xFFFDB827),
                    ),
                    filled: true,
                    fillColor: Colors.grey.shade50,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: BorderSide(color: Colors.grey.shade200),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: const BorderSide(
                        color: Color(0xFFFDB827),
                        width: 2,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            height: 52,
            child: ElevatedButton(
              onPressed: _isSaving
                  ? null
                  : () {
                      if (_tabController.index == 0)
                        _saveAddStock();
                      else
                        _saveSetStock();
                    },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFFDB827),
                foregroundColor: Colors.black,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                elevation: 0,
              ),
              child: _isSaving
                  ? const SizedBox(
                      width: 22,
                      height: 22,
                      child: CircularProgressIndicator(
                        strokeWidth: 2.5,
                        color: Colors.black,
                      ),
                    )
                  : Text(
                      _tabController.index == 0 ? 'Tambah Stok' : 'Simpan Stok',
                      style: GoogleFonts.outfit(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
            ),
          ),
        ],
      ),
    );
  }
}

class _AddStockBottomSheet extends ConsumerStatefulWidget {
  const _AddStockBottomSheet();

  @override
  ConsumerState<_AddStockBottomSheet> createState() =>
      _AddStockBottomSheetState();
}

class _AddStockBottomSheetState extends ConsumerState<_AddStockBottomSheet> {
  Map<String, dynamic>? _selectedMaterial;
  final _qtyController = TextEditingController();
  bool _isSaving = false;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(
        left: 24,
        right: 24,
        top: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 32,
      ),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(30)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey.shade300,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'Tambah Stok Bahan',
            style: GoogleFonts.outfit(
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Pilih bahan baku dan masukkan jumlah stok yang masuk.',
            style: TextStyle(color: Colors.grey.shade500, fontSize: 14),
          ),
          const SizedBox(height: 24),

          // Material Picker
          Text(
            'Bahan Baku',
            style: GoogleFonts.outfit(
              fontWeight: FontWeight.w600,
              fontSize: 14,
            ),
          ),
          const SizedBox(height: 10),
          InkWell(
            onTap: () => _showMaterialPicker(context, ref),
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.grey.shade50,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: Row(
                children: [
                  Icon(
                    Icons.category_rounded,
                    color: Colors.grey.shade400,
                    size: 20,
                  ),
                  const SizedBox(width: 12),
                  Text(
                    _selectedMaterial?['name'] ?? 'Pilih Bahan...',
                    style: GoogleFonts.outfit(
                      color: _selectedMaterial == null
                          ? Colors.grey
                          : Colors.black87,
                    ),
                  ),
                  const Spacer(),
                  const Icon(Icons.arrow_drop_down_rounded, color: Colors.grey),
                ],
              ),
            ),
          ),

          const SizedBox(height: 20),

          // Quantity Input
          Text(
            'Jumlah Masuk',
            style: GoogleFonts.outfit(
              fontWeight: FontWeight.w600,
              fontSize: 14,
            ),
          ),
          const SizedBox(height: 10),
          TextField(
            controller: _qtyController,
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            style: GoogleFonts.outfit(
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
            decoration: InputDecoration(
              hintText: '0.00',
              filled: true,
              fillColor: Colors.grey.shade50,
              suffixText: _selectedMaterial?['unit'] ?? '',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16),
                borderSide: BorderSide.none,
              ),
            ),
          ),

          const SizedBox(height: 32),

          SizedBox(
            width: double.infinity,
            height: 56,
            child: ElevatedButton(
              onPressed: _isSaving || _selectedMaterial == null
                  ? null
                  : _submit,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFFDB827),
                foregroundColor: Colors.black,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                elevation: 0,
              ),
              child: _isSaving
                  ? const SizedBox(
                      width: 24,
                      height: 24,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.black,
                      ),
                    )
                  : Text(
                      'Konfirmasi Tambah Stok',
                      style: GoogleFonts.outfit(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
            ),
          ),
        ],
      ),
    );
  }

  void _showMaterialPicker(BuildContext context, WidgetRef ref) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _RawMaterialPicker(
        onSelected: (material) {
          setState(() => _selectedMaterial = material);
        },
      ),
    );
  }

  Future<void> _submit() async {
    final qty = double.tryParse(_qtyController.text) ?? 0;
    if (qty <= 0) return;

    setState(() => _isSaving = true);
    try {
      final repository = ref.read(inventoryRepositoryProvider);

      await repository.stockOpname({
        'material_id': _selectedMaterial!['id'],
        'actual_stock': (_selectedMaterial!['current_stock'] ?? 0) + qty,
        'notes': 'Tambah stok cepat',
      });

      if (mounted) {
        ref.invalidate(rawMaterialsProvider);
        ref.invalidate(inventoryProductsProvider);
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Stok ${_selectedMaterial!['name']} berhasil ditambah!',
            ),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Gagal menambah stok: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }
}

// ─── Raw Material Picker ──────────────────────────────────────────────────────
class _RawMaterialPicker extends ConsumerWidget {
  final void Function(Map<String, dynamic>) onSelected;
  const _RawMaterialPicker({required this.onSelected});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final materialsAsync = ref.watch(rawMaterialsProvider);

    return Container(
      height: MediaQuery.of(context).size.height * 0.6,
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(30)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey.shade300,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 20),
          Text(
            'Pilih Bahan Baku',
            style: GoogleFonts.outfit(
              fontSize: 18,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 16),
          Expanded(
            child: materialsAsync.when(
              data: (materials) => materials.isEmpty
                  ? Center(
                      child: Text(
                        'Belum ada bahan baku.',
                        style: GoogleFonts.outfit(color: Colors.grey),
                      ),
                    )
                  : ListView.separated(
                      itemCount: materials.length,
                      separatorBuilder: (_, __) => const Divider(height: 1),
                      itemBuilder: (context, index) {
                        final m = materials[index];
                        return ListTile(
                          leading: Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: const Color(0xFFFEF9E7),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: const Icon(
                              Icons.category_rounded,
                              color: Color(0xFFFDB827),
                              size: 20,
                            ),
                          ),
                          title: Text(
                            m['name'] ?? '',
                            style: GoogleFonts.outfit(
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          subtitle: Text(
                            'Stok: ${m['current_stock'] ?? 0} ${m['unit'] ?? ''}',
                            style: GoogleFonts.outfit(
                              fontSize: 12,
                              color: Colors.grey,
                            ),
                          ),
                          trailing: const Icon(
                            Icons.chevron_right_rounded,
                            color: Colors.grey,
                          ),
                          onTap: () {
                            Navigator.pop(context);
                            onSelected(m);
                          },
                        );
                      },
                    ),
              loading: () => const Center(
                child: CircularProgressIndicator(color: Color(0xFFFDB827)),
              ),
              error: (e, _) => Center(child: Text('Gagal memuat: $e')),
            ),
          ),
        ],
      ),
    );
  }
}
