import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import '../../shared/models/product.dart';
import 'providers/inventory_providers.dart';
import '../../shared/repositories/repositories_provider.dart';
import 'package:go_router/go_router.dart';

class ProductEditScreen extends ConsumerStatefulWidget {
  final Product? product;

  const ProductEditScreen({super.key, this.product});

  @override
  ConsumerState<ProductEditScreen> createState() => _ProductEditScreenState();
}

class _ProductEditScreenState extends ConsumerState<ProductEditScreen> {
  final _formKey = GlobalKey<FormState>();
  File? _image;
  final _nameController = TextEditingController();
  final _skuController = TextEditingController();
  final _barcodeController = TextEditingController();
  final _sellingPriceController = TextEditingController();
  final _costPriceController = TextEditingController();
  final _stockController = TextEditingController();
  final _reorderPointController = TextEditingController();
  String _unit = 'pcs';
  String _category = '';

  bool _isSaving = false;
  List<Map<String, dynamic>> _recipe = [];

  // Variant state (live-editable lists)
  List<_VariantGroupData> _variantGroups = [];
  // Addon state
  List<_AddonGroupData> _addonGroups = [];

  static const List<String> _unitOptions = [
    'pcs',
    'kg',
    'gram',
    'liter',
    'ml',
    'pack',
    'box',
    'roll',
  ];
  final List<String> _categorySuggestions = [
    'Makanan',
    'Minuman',
    'Bahan Baku',
    'Kemasan',
    'Peralatan',
    'Lainnya',
  ];

  @override
  void initState() {
    super.initState();
    if (widget.product != null) {
      _nameController.text = widget.product!.name;
      _skuController.text = widget.product!.sku ?? '';
      _barcodeController.text = widget.product!.barcode ?? '';
      _sellingPriceController.text = widget.product!.price.toInt().toString();
      _costPriceController.text = widget.product!.costPrice.toInt().toString();
      _stockController.text = widget.product!.stock.toInt().toString();
      _reorderPointController.text = widget.product!.reorderPoint
          .toInt()
          .toString();
      _unit = widget.product!.unit;
      _category = widget.product!.category ?? '';

      if (widget.product!.recipes != null) {
        _recipe = widget.product!.recipes!
            .map(
              (r) => {
                'id': r.rawMaterialId,
                'name': r.rawMaterial?.name ?? 'Unknown',
                'qty': r.quantityNeeded,
                'unit': r.rawMaterial?.unit ?? '',
              },
            )
            .toList();
      }

      if (widget.product!.variantGroups != null) {
        _variantGroups = widget.product!.variantGroups!
            .map(
              (g) => _VariantGroupData(
                id: g.id,
                name: g.name,
                isRequired: g.isRequired,
                options:
                    g.options
                        ?.map(
                          (o) => _VariantOptionData(
                            id: o.id,
                            name: o.name,
                            priceDelta: o.priceDelta,
                            stock: o.currentStock,
                            skuSuffix: o.skuSuffix,
                            isActive: o.isActive,
                          ),
                        )
                        .toList() ??
                    [],
              ),
            )
            .toList();
      }

      if (widget.product!.addonGroups != null) {
        _addonGroups = widget.product!.addonGroups!
            .map(
              (g) => _AddonGroupData(
                id: g.id,
                name: g.name,
                isRequired: g.isRequired,
                minSelections: g.minSelections,
                maxSelections: g.maxSelections,
                addons:
                    g.addons
                        ?.map(
                          (a) => _AddonData(
                            id: a.id,
                            name: a.name,
                            price: a.price,
                            trackStock: a.trackStock,
                            stock: a.currentStock ?? 0,
                            isActive: a.isActive,
                          ),
                        )
                        .toList() ??
                    [],
              ),
            )
            .toList();
      }
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _skuController.dispose();
    _barcodeController.dispose();
    _sellingPriceController.dispose();
    _costPriceController.dispose();
    _stockController.dispose();
    _reorderPointController.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(source: ImageSource.gallery);
    if (pickedFile != null) setState(() => _image = File(pickedFile.path));
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isSaving = true);
    try {
      final repository = ref.read(inventoryRepositoryProvider);

      final List<Map<String, dynamic>> recipeData = _recipe
          .map((r) => {'raw_material_id': r['id'], 'quantity_needed': r['qty']})
          .toList();

      String? imageUrl = widget.product?.imageUrl;
      if (_image != null) imageUrl = await repository.uploadImage(_image!);

      final Map<String, dynamic> data = {
        'p_name': _nameController.text,
        'p_selling_price': double.tryParse(_sellingPriceController.text) ?? 0,
        'p_cost_price': double.tryParse(_costPriceController.text) ?? 0,
        'p_sku': _skuController.text.isEmpty ? null : _skuController.text,
        'p_barcode': _barcodeController.text.isEmpty
            ? null
            : _barcodeController.text,
        'p_category': _category.isEmpty ? null : _category,
        'p_reorder_point': double.tryParse(_reorderPointController.text) ?? 0,
        'p_unit': _unit,
        'p_stock': double.tryParse(_stockController.text) ?? 0,
        'p_image_url': imageUrl,
        'p_recipe': recipeData,
      };

      final String productId;
      final bool isNewProduct = widget.product == null;
      if (isNewProduct) {
        final result = await repository.createProduct(data);
        productId = result.id;
      } else {
        await repository.updateProduct(widget.product!.id, data);
        productId = widget.product!.id;
      }

      try {
        // Save variant groups + options
        for (final g in _variantGroups) {
          final groupResult = await repository.upsertVariantGroup(productId, {
            if (g.id != null) 'id': g.id,
            'name': g.name,
            'is_required': g.isRequired,
          });
          final groupId = g.id ?? (groupResult?['id'] as String?);
          if (groupId == null) {
            throw Exception('Gagal membuat grup varian: ${g.name}');
          }
          for (final o in g.options) {
            await repository.upsertVariantOption(productId, groupId, {
              if (o.id != null) 'id': o.id,
              'name': o.name,
              'price_delta': o.priceDelta,
              'current_stock': o.stock,
              'sku_suffix': o.skuSuffix,
              'is_active': o.isActive,
            });
          }
        }

        // Save addon groups + addons
        for (final g in _addonGroups) {
          final groupResult = await repository.upsertAddonGroup(productId, {
            if (g.id != null) 'id': g.id,
            'name': g.name,
            'is_required': g.isRequired,
            'min_selections': g.minSelections,
            'max_selections': g.maxSelections,
          });
          final groupId = g.id ?? (groupResult?['id'] as String?);
          if (groupId == null) {
            throw Exception('Gagal membuat grup add-on: ${g.name}');
          }
          for (final a in g.addons) {
            await repository.upsertAddon(productId, groupId, {
              if (a.id != null) 'id': a.id,
              'name': a.name,
              'price': a.price,
              'track_stock': a.trackStock,
              'current_stock': a.stock,
              'is_active': a.isActive,
            });
          }
        }
      } catch (variantAddonError) {
        // Client-side rollback: delete the newly created product if variant/addon fails
        if (isNewProduct) {
          try {
            await repository.deleteProduct(productId);
          } catch (deleteErr) {
            debugPrint('Rollback delete failed: $deleteErr');
          }
        }
        rethrow;
      }

      if (mounted) {
        ref.invalidate(inventoryProductsProvider);
        context.pop();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Produk berhasil disimpan')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Gagal menyimpan produk: $e')));
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  void _showRawMaterialPicker() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _RawMaterialPicker(
        onSelected: (material) => _addRecipeItem(material),
      ),
    );
  }

  void _addRecipeItem(Map<String, dynamic> material) {
    final qtyController = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Jumlah ${material['name']}', style: GoogleFonts.outfit()),
        content: TextField(
          controller: qtyController,
          keyboardType: TextInputType.number,
          decoration: InputDecoration(
            suffixText: material['unit'],
            hintText: '0.00',
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Batal'),
          ),
          ElevatedButton(
            onPressed: () {
              setState(() {
                _recipe.add({
                  'id': material['id'],
                  'name': material['name'],
                  'qty': double.tryParse(qtyController.text) ?? 0,
                  'unit': material['unit'],
                });
              });
              Navigator.pop(ctx);
            },
            child: const Text('Tambah'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: Text(
          widget.product == null ? 'Tambah Produk' : 'Edit Produk',
          style: GoogleFonts.outfit(fontWeight: FontWeight.bold),
        ),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
        actions: [
          if (_isSaving)
            const Center(
              child: Padding(
                padding: EdgeInsets.symmetric(horizontal: 16),
                child: SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(strokeWidth: 2),
                ),
              ),
            )
          else
            TextButton(
              onPressed: _save,
              child: const Text(
                'Simpan',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: Color(0xFFFDB827),
                ),
              ),
            ),
        ],
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(24),
          children: [
            _buildImagePicker(),
            const SizedBox(height: 32),
            _sectionTitle('Informasi Dasar'),
            const SizedBox(height: 16),
            _tf(
              'Nama Produk',
              _nameController,
              hint: 'Contoh: Kopi Gula Aren',
              validator: (v) => v!.isEmpty ? 'Nama tidak boleh kosong' : null,
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: _tf('SKU', _skuController, hint: 'Kode internal'),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _tf('Barcode', _barcodeController, hint: 'Kode scan'),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(child: _buildCategoryField()),
                const SizedBox(width: 16),
                Expanded(child: _buildUnitDropdown()),
              ],
            ),
            const SizedBox(height: 32),
            _sectionTitle('Harga & Stok'),
            const SizedBox(height: 16),
            _tf(
              'Harga Jual (Rp)',
              _sellingPriceController,
              hint: '0',
              keyboardType: TextInputType.number,
              validator: (v) => v!.isEmpty ? 'Harga tidak boleh kosong' : null,
            ),
            const SizedBox(height: 16),
            _tf(
              'Harga Pokok / Modal (Rp)',
              _costPriceController,
              hint: '0',
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: _tf(
                    'Stok Awal',
                    _stockController,
                    hint: '0',
                    keyboardType: TextInputType.number,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _tf(
                    'Batas Restok',
                    _reorderPointController,
                    hint: '0',
                    keyboardType: TextInputType.number,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 32),
            _buildVariantSection(),
            const SizedBox(height: 32),
            _buildAddonSection(),
            const SizedBox(height: 32),
            _sectionTitle('Resep / Komposisi'),
            const SizedBox(height: 16),
            _buildRecipeSection(),
            const SizedBox(height: 12),
            TextButton.icon(
              onPressed: _showRawMaterialPicker,
              icon: const Icon(
                Icons.add_circle_outline,
                size: 20,
                color: Color(0xFFFDB827),
              ),
              label: const Text(
                'Tambah Bahan',
                style: TextStyle(color: Color(0xFFFDB827)),
              ),
            ),
            const SizedBox(height: 48),
          ],
        ),
      ),
    );
  }

  // ==========================================================
  // Variant Section
  // ==========================================================
  Widget _buildVariantSection() {
    return _ExpandableSection(
      title: 'Varian (Size / Warna / Dosis)',
      icon: Icons.style_rounded,
      count: _variantGroups.fold<int>(0, (c, g) => c + g.options.length),
      initiallyExpanded: _variantGroups.isNotEmpty,
      children: [
        ..._variantGroups.map((g) => _buildVariantGroupCard(g)),
        const SizedBox(height: 8),
        _buildAddVariantGroupButton(),
      ],
    );
  }

  Widget _buildVariantGroupCard(_VariantGroupData group) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        children: [
          _groupHeader(
            group.name,
            group.isRequired ? 'Wajib' : 'Opsional',
            Colors.purple,
            onDelete: () => setState(() => _variantGroups.remove(group)),
          ),
          const Divider(height: 1),
          ...group.options.map(
            (o) => ListTile(
              dense: true,
              leading: Checkbox(
                value: o.isActive,
                onChanged: (v) => setState(() => o.isActive = v!),
                activeColor: const Color(0xFFFDB827),
              ),
              title: Text(
                o.name,
                style: GoogleFonts.outfit(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
              ),
              subtitle: Row(
                children: [
                  if (o.priceDelta != 0)
                    Text(
                      '${o.priceDelta > 0 ? "+Rp" : "-Rp"}${o.priceDelta.abs().toInt()}',
                      style: GoogleFonts.outfit(
                        fontSize: 11,
                        color: o.priceDelta > 0 ? Colors.green : Colors.red,
                      ),
                    ),
                  if (o.skuSuffix != null) ...[
                    const SizedBox(width: 8),
                    Text(
                      'SKU: ${o.skuSuffix}',
                      style: GoogleFonts.outfit(
                        fontSize: 11,
                        color: Colors.grey,
                      ),
                    ),
                  ],
                ],
              ),
              trailing: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    'Stok: ${o.stock.toInt()}',
                    style: GoogleFonts.outfit(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, size: 16, color: Colors.red),
                    onPressed: () => setState(() => group.options.remove(o)),
                  ),
                ],
              ),
              onTap: () => _editVariantOption(group, o),
            ),
          ),
          const Divider(height: 1),
          TextButton.icon(
            icon: const Icon(Icons.add, size: 16, color: Colors.purple),
            label: const Text(
              'Tambah Opsi',
              style: TextStyle(color: Colors.purple, fontSize: 13),
            ),
            onPressed: () => _addVariantOption(group),
          ),
        ],
      ),
    );
  }

  void _addVariantGroup() {
    final ctrl = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(
          'Varian Baru',
          style: GoogleFonts.outfit(fontWeight: FontWeight.bold),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: ctrl,
              decoration: const InputDecoration(
                hintText: 'Nama varian, misal: Ukuran, Warna',
              ),
              autofocus: true,
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                const Text('Wajib?', style: TextStyle(fontSize: 13)),
                StatefulBuilder(
                  builder: (ctx, setSt) {
                    bool required = true;
                    return Switch(
                      value: required,
                      onChanged: (v) => setSt(() => required = v),
                      activeColor: const Color(0xFFFDB827),
                    );
                  },
                ),
              ],
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Batal'),
          ),
          ElevatedButton(
            onPressed: () {
              if (ctrl.text.trim().isNotEmpty) {
                setState(
                  () => _variantGroups.add(
                    _VariantGroupData(name: ctrl.text.trim(), isRequired: true),
                  ),
                );
                Navigator.pop(ctx);
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFFDB827),
            ),
            child: const Text('Tambah', style: TextStyle(color: Colors.black)),
          ),
        ],
      ),
    );
  }

  Widget _buildAddVariantGroupButton() {
    return OutlinedButton.icon(
      icon: const Icon(Icons.add, size: 16),
      label: const Text('Tambah Grup Varian'),
      style: OutlinedButton.styleFrom(
        foregroundColor: Colors.purple,
        side: const BorderSide(color: Colors.purple),
      ),
      onPressed: _addVariantGroup,
    );
  }

  void _addVariantOption(_VariantGroupData group) {
    _editVariantOption(
      group,
      _VariantOptionData(name: '', priceDelta: 0, stock: 0, isActive: true),
    );
  }

  void _editVariantOption(_VariantGroupData group, _VariantOptionData option) {
    final nameCtrl = TextEditingController(text: option.name);
    final priceCtrl = TextEditingController(
      text: option.priceDelta.toInt().toString(),
    );
    final skuCtrl = TextEditingController(text: option.skuSuffix ?? '');
    final stockCtrl = TextEditingController(
      text: option.stock.toInt().toString(),
    );
    final isNew = option.id == null;

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(
          isNew ? 'Opsi Baru' : 'Edit Opsi',
          style: GoogleFonts.outfit(fontWeight: FontWeight.bold),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: nameCtrl,
              decoration: const InputDecoration(
                labelText: 'Nama opsi',
                hintText: 'S, M, L, XL',
              ),
              autofocus: true,
            ),
            const SizedBox(height: 8),
            TextField(
              controller: priceCtrl,
              decoration: const InputDecoration(
                labelText: 'Selisih harga (+/-)',
              ),
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 8),
            TextField(
              controller: skuCtrl,
              decoration: const InputDecoration(
                labelText: 'SKU Suffix (opsional)',
              ),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: stockCtrl,
              decoration: const InputDecoration(labelText: 'Stok'),
              keyboardType: TextInputType.number,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Batal'),
          ),
          if (!isNew)
            TextButton(
              onPressed: () {
                setState(() => group.options.remove(option));
                Navigator.pop(ctx);
              },
              child: const Text('Hapus', style: TextStyle(color: Colors.red)),
            ),
          ElevatedButton(
            onPressed: () {
              if (nameCtrl.text.trim().isNotEmpty) {
                setState(() {
                  option.name = nameCtrl.text.trim();
                  option.priceDelta = double.tryParse(priceCtrl.text) ?? 0;
                  option.skuSuffix = skuCtrl.text.isEmpty ? null : skuCtrl.text;
                  option.stock = double.tryParse(stockCtrl.text) ?? 0;
                  if (isNew) group.options.add(option);
                });
                Navigator.pop(ctx);
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFFDB827),
            ),
            child: const Text('Simpan', style: TextStyle(color: Colors.black)),
          ),
        ],
      ),
    );
  }

  // ==========================================================
  // Add-on Section
  // ==========================================================
  Widget _buildAddonSection() {
    return _ExpandableSection(
      title: 'Add-on (Topping / Extra)',
      icon: Icons.add_box_rounded,
      count: _addonGroups.fold<int>(0, (c, g) => c + g.addons.length),
      initiallyExpanded: _addonGroups.isNotEmpty,
      children: [
        ..._addonGroups.map((g) => _buildAddonGroupCard(g)),
        const SizedBox(height: 8),
        OutlinedButton.icon(
          icon: const Icon(Icons.add, size: 16),
          label: const Text('Tambah Grup Add-on'),
          style: OutlinedButton.styleFrom(
            foregroundColor: Colors.orange,
            side: const BorderSide(color: Colors.orange),
          ),
          onPressed: () => _addAddonGroup(),
        ),
      ],
    );
  }

  Widget _buildAddonGroupCard(_AddonGroupData group) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        children: [
          _groupHeader(
            group.name,
            group.isRequired ? 'Wajib' : 'Opsional',
            Colors.orange,
            onDelete: () => setState(() => _addonGroups.remove(group)),
          ),
          const Divider(height: 1),
          ...group.addons.map(
            (a) => ListTile(
              dense: true,
              leading: Checkbox(
                value: a.isActive,
                onChanged: (v) => setState(() => a.isActive = v!),
                activeColor: const Color(0xFFFDB827),
              ),
              title: Text(
                a.name,
                style: GoogleFonts.outfit(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
              ),
              subtitle: Text(
                a.price > 0 ? '+Rp ${a.price.toInt()}' : 'Gratis',
                style: GoogleFonts.outfit(
                  fontSize: 11,
                  color: a.price > 0 ? Colors.green : Colors.grey,
                ),
              ),
              trailing: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (a.trackStock)
                    Text(
                      'Stok: ${a.stock.toInt()}',
                      style: GoogleFonts.outfit(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  IconButton(
                    icon: const Icon(Icons.close, size: 16, color: Colors.red),
                    onPressed: () => setState(() => group.addons.remove(a)),
                  ),
                ],
              ),
              onTap: () => _editAddon(group, a),
            ),
          ),
          const Divider(height: 1),
          TextButton.icon(
            icon: const Icon(Icons.add, size: 16, color: Colors.orange),
            label: const Text(
              'Tambah Add-on',
              style: TextStyle(color: Colors.orange, fontSize: 13),
            ),
            onPressed: () => _addAddon(group),
          ),
        ],
      ),
    );
  }

  void _addAddonGroup() {
    final ctrl = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(
          'Grup Add-on Baru',
          style: GoogleFonts.outfit(fontWeight: FontWeight.bold),
        ),
        content: TextField(
          controller: ctrl,
          decoration: const InputDecoration(
            hintText: 'Nama, misal: Extra Topping',
          ),
          autofocus: true,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Batal'),
          ),
          ElevatedButton(
            onPressed: () {
              if (ctrl.text.trim().isNotEmpty) {
                setState(
                  () => _addonGroups.add(
                    _AddonGroupData(
                      name: ctrl.text.trim(),
                      isRequired: false,
                      minSelections: 0,
                      maxSelections: 1,
                    ),
                  ),
                );
                Navigator.pop(ctx);
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFFDB827),
            ),
            child: const Text('Tambah', style: TextStyle(color: Colors.black)),
          ),
        ],
      ),
    );
  }

  void _addAddon(_AddonGroupData group) {
    _editAddon(group, _AddonData(name: '', price: 0, isActive: true));
  }

  void _editAddon(_AddonGroupData group, _AddonData addon) {
    final nameCtrl = TextEditingController(text: addon.name);
    final priceCtrl = TextEditingController(
      text: addon.price.toInt().toString(),
    );
    final stockCtrl = TextEditingController(
      text: addon.stock.toInt().toString(),
    );
    final isNew = addon.id == null;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setSt) {
          return AlertDialog(
            title: Text(
              isNew ? 'Add-on Baru' : 'Edit Add-on',
              style: GoogleFonts.outfit(fontWeight: FontWeight.bold),
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: nameCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Nama add-on',
                    hintText: 'Extra Keju',
                  ),
                  autofocus: true,
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: priceCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Harga tambahan',
                  ),
                  keyboardType: TextInputType.number,
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    const Text('Lacak stok?', style: TextStyle(fontSize: 13)),
                    Switch(
                      value: addon.trackStock,
                      onChanged: (v) => setSt(() => addon.trackStock = v),
                      activeColor: const Color(0xFFFDB827),
                    ),
                  ],
                ),
                if (addon.trackStock)
                  TextField(
                    controller: stockCtrl,
                    decoration: const InputDecoration(labelText: 'Stok'),
                    keyboardType: TextInputType.number,
                  ),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(ctx),
                child: const Text('Batal'),
              ),
              if (!isNew)
                TextButton(
                  onPressed: () {
                    setState(() => group.addons.remove(addon));
                    Navigator.pop(ctx);
                  },
                  child: const Text(
                    'Hapus',
                    style: TextStyle(color: Colors.red),
                  ),
                ),
              ElevatedButton(
                onPressed: () {
                  if (nameCtrl.text.trim().isNotEmpty) {
                    setState(() {
                      addon.name = nameCtrl.text.trim();
                      addon.price = double.tryParse(priceCtrl.text) ?? 0;
                      addon.stock = double.tryParse(stockCtrl.text) ?? 0;
                      if (isNew) group.addons.add(addon);
                    });
                    Navigator.pop(ctx);
                  }
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFFDB827),
                ),
                child: const Text(
                  'Simpan',
                  style: TextStyle(color: Colors.black),
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  // ==========================================================
  // Shared Widgets
  // ==========================================================

  Widget _buildImagePicker() {
    return Center(
      child: GestureDetector(
        onTap: _pickImage,
        child: Container(
          width: 120,
          height: 120,
          decoration: BoxDecoration(
            color: Colors.grey.shade100,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: Colors.grey.shade300, width: 2),
          ),
          child: _image != null
              ? ClipRRect(
                  borderRadius: BorderRadius.circular(22),
                  child: Image.file(_image!, fit: BoxFit.cover),
                )
              : widget.product?.imageUrl != null
              ? ClipRRect(
                  borderRadius: BorderRadius.circular(22),
                  child: Image.network(
                    widget.product!.imageUrl!,
                    fit: BoxFit.cover,
                  ),
                )
              : Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.add_a_photo_rounded,
                      color: Colors.grey.shade400,
                      size: 32,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Foto',
                      style: TextStyle(
                        color: Colors.grey.shade500,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
        ),
      ),
    );
  }

  Widget _sectionTitle(String text) => Text(
    text,
    style: GoogleFonts.outfit(
      fontSize: 16,
      fontWeight: FontWeight.w900,
      color: Colors.black87,
    ),
  );

  Widget _buildCategoryField() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Kategori',
          style: GoogleFonts.outfit(fontWeight: FontWeight.w600, fontSize: 14),
        ),
        const SizedBox(height: 10),
        Autocomplete<String>(
          optionsBuilder: (v) => v.text.isEmpty
              ? _categorySuggestions
              : _categorySuggestions.where(
                  (c) => c.toLowerCase().contains(v.text.toLowerCase()),
                ),
          initialValue: _category.isEmpty
              ? null
              : TextEditingValue(text: _category),
          onSelected: (v) => setState(() => _category = v),
          fieldViewBuilder: (ctx, ctrl, focusNode, onSubmit) {
            ctrl.text = _category;
            return TextFormField(
              controller: ctrl,
              focusNode: focusNode,
              onFieldSubmitted: (_) => onSubmit(),
              style: GoogleFonts.outfit(),
              decoration: InputDecoration(
                hintText: 'Pilih atau ketik',
                filled: true,
                fillColor: Colors.grey.shade50,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: BorderSide.none,
                ),
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 14,
                ),
              ),
              onChanged: (v) => _category = v,
            );
          },
        ),
      ],
    );
  }

  Widget _buildUnitDropdown() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Satuan',
          style: GoogleFonts.outfit(fontWeight: FontWeight.w600, fontSize: 14),
        ),
        const SizedBox(height: 10),
        DropdownButtonFormField<String>(
          value: _unit,
          style: GoogleFonts.outfit(),
          decoration: InputDecoration(
            filled: true,
            fillColor: Colors.grey.shade100,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: BorderSide(color: Colors.grey.shade300),
            ),
            contentPadding: const EdgeInsets.symmetric(horizontal: 16),
          ),
          dropdownColor: Colors.grey.shade100,
          items: _unitOptions
              .map((u) => DropdownMenuItem(value: u, child: Text(u)))
              .toList(),
          onChanged: (v) => setState(() => _unit = v!),
        ),
      ],
    );
  }

  Widget _tf(
    String label,
    TextEditingController ctrl, {
    String? hint,
    TextInputType? keyboardType,
    String? Function(String?)? validator,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: GoogleFonts.outfit(fontWeight: FontWeight.w600, fontSize: 14),
        ),
        const SizedBox(height: 10),
        TextFormField(
          controller: ctrl,
          keyboardType: keyboardType,
          validator: validator,
          style: GoogleFonts.outfit(),
          decoration: InputDecoration(
            hintText: hint,
            filled: true,
            fillColor: Colors.grey.shade50,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: BorderSide.none,
            ),
          ),
        ),
      ],
    );
  }

  Widget _groupHeader(
    String name,
    String badge,
    Color color, {
    VoidCallback? onDelete,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          Expanded(
            child: Text(
              name,
              style: GoogleFonts.outfit(
                fontWeight: FontWeight.w800,
                fontSize: 14,
              ),
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              badge,
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
          ),
          if (onDelete != null)
            IconButton(
              icon: const Icon(
                Icons.delete_outline,
                size: 18,
                color: Colors.red,
              ),
              onPressed: onDelete,
            ),
        ],
      ),
    );
  }

  Widget _buildRecipeSection() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.grey.shade100),
      ),
      child: _recipe.isEmpty
          ? Center(
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 20),
                child: Text(
                  'Belum ada bahan baku yang ditambahkan.',
                  style: TextStyle(color: Colors.grey.shade500),
                ),
              ),
            )
          : Column(
              children: _recipe
                  .asMap()
                  .entries
                  .map((e) => _buildRecipeItem(e.key, e.value))
                  .toList(),
            ),
    );
  }

  Widget _buildRecipeItem(int index, Map<String, dynamic> item) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Expanded(child: Text(item['name'], style: GoogleFonts.outfit())),
          Text(
            '${item['qty']} ${item['unit']}',
            style: GoogleFonts.outfit(fontWeight: FontWeight.bold),
          ),
          const SizedBox(width: 8),
          IconButton(
            icon: const Icon(
              Icons.remove_circle_outline,
              color: Colors.red,
              size: 20,
            ),
            onPressed: () => setState(() => _recipe.removeAt(index)),
          ),
        ],
      ),
    );
  }
}

// ==========================================================
// Data classes for local state
// ==========================================================
class _VariantGroupData {
  String? id;
  String name;
  bool isRequired;
  List<_VariantOptionData> options;
  _VariantGroupData({
    this.id,
    required this.name,
    this.isRequired = true,
    List<_VariantOptionData>? options,
  }) : options = options ?? [];
}

class _VariantOptionData {
  String? id;
  String name;
  double priceDelta;
  double stock;
  String? skuSuffix;
  bool isActive;
  _VariantOptionData({
    this.id,
    this.name = '',
    this.priceDelta = 0,
    this.stock = 0,
    this.skuSuffix,
    this.isActive = true,
  });
}

class _AddonGroupData {
  String? id;
  String name;
  bool isRequired;
  int minSelections;
  int maxSelections;
  List<_AddonData> addons;
  _AddonGroupData({
    this.id,
    required this.name,
    this.isRequired = false,
    this.minSelections = 0,
    this.maxSelections = 1,
    List<_AddonData>? addons,
  }) : addons = addons ?? [];
}

class _AddonData {
  String? id;
  String name;
  double price;
  bool trackStock;
  double stock;
  bool isActive;
  _AddonData({
    this.id,
    this.name = '',
    this.price = 0,
    this.trackStock = false,
    this.stock = 0,
    this.isActive = true,
  });
}

// ==========================================================
// Expandable Section
// ==========================================================
class _ExpandableSection extends StatefulWidget {
  final String title;
  final IconData icon;
  final int count;
  final bool initiallyExpanded;
  final List<Widget> children;

  const _ExpandableSection({
    required this.title,
    required this.icon,
    this.count = 0,
    this.initiallyExpanded = false,
    required this.children,
  });

  @override
  State<_ExpandableSection> createState() => _ExpandableSectionState();
}

class _ExpandableSectionState extends State<_ExpandableSection> {
  late bool _expanded;

  @override
  void initState() {
    super.initState();
    _expanded = widget.initiallyExpanded;
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        children: [
          InkWell(
            onTap: () => setState(() => _expanded = !_expanded),
            borderRadius: BorderRadius.vertical(top: const Radius.circular(20)),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.grey.shade100,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(
                      widget.icon,
                      size: 20,
                      color: Colors.grey.shade700,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      widget.title,
                      style: GoogleFonts.outfit(
                        fontWeight: FontWeight.w800,
                        fontSize: 14,
                      ),
                    ),
                  ),
                  if (widget.count > 0)
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 2,
                      ),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFDB827).withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        '${widget.count}',
                        style: GoogleFonts.outfit(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: const Color(0xFFFDB827),
                        ),
                      ),
                    ),
                  const SizedBox(width: 8),
                  Icon(
                    _expanded ? Icons.expand_less : Icons.expand_more,
                    color: Colors.grey,
                  ),
                ],
              ),
            ),
          ),
          if (_expanded)
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
              child: Column(children: widget.children),
            ),
        ],
      ),
    );
  }
}

// ==========================================================
// Raw Material Picker
// ==========================================================
class _RawMaterialPicker extends ConsumerWidget {
  final ValueChanged<Map<String, dynamic>> onSelected;
  const _RawMaterialPicker({required this.onSelected});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final rawMaterialsAsync = ref.watch(rawMaterialsProvider);

    return Container(
      height: MediaQuery.of(context).size.height * 0.7,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(30)),
      ),
      child: Column(
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
          const SizedBox(height: 20),
          Text(
            'Pilih Bahan Baku',
            style: GoogleFonts.outfit(
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 20),
          Expanded(
            child: rawMaterialsAsync.when(
              data: (items) => ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                itemCount: items.length,
                itemBuilder: (context, index) {
                  final item = items[index];
                  return ListTile(
                    title: Text(item['name'], style: GoogleFonts.outfit()),
                    subtitle: Text(
                      item['unit'],
                      style: TextStyle(color: Colors.grey.shade500),
                    ),
                    trailing: const Icon(
                      Icons.add_circle_outline,
                      color: Color(0xFFFDB827),
                    ),
                    onTap: () {
                      onSelected(item);
                      Navigator.pop(context);
                    },
                  );
                },
              ),
              loading: () => const Center(
                child: CircularProgressIndicator(color: Color(0xFFFDB827)),
              ),
              error: (err, _) => Center(child: Text('Error: $err')),
            ),
          ),
        ],
      ),
    );
  }
}
