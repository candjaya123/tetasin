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
  final _priceController = TextEditingController();
  final _skuController = TextEditingController();
  final _stockController = TextEditingController();
  
  bool _isSaving = false;
  List<Map<String, dynamic>> _recipe = [];

  @override
  void initState() {
    super.initState();
    if (widget.product != null) {
      _nameController.text = widget.product!.name;
      _priceController.text = widget.product!.price.toString();
      _skuController.text = widget.product!.skuCode ?? '';
      _stockController.text = widget.product!.stock.toString();
      
      if (widget.product!.recipes != null) {
        _recipe = widget.product!.recipes!.map((r) => {
          'id': r.rawMaterialId,
          'name': r.rawMaterial?.name ?? 'Unknown',
          'qty': r.quantityNeeded,
          'unit': r.rawMaterial?.unit ?? '',
        }).toList();
      }
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _priceController.dispose();
    _skuController.dispose();
    _stockController.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(source: ImageSource.gallery);
    if (pickedFile != null) {
      setState(() => _image = File(pickedFile.path));
    }
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSaving = true);
    try {
      final repository = ref.read(inventoryRepositoryProvider);
      
      // Backend expects p_recipe: [{ raw_material_id, quantity_needed }]
      final List<Map<String, dynamic>> recipeData = _recipe.map((r) => {
        'raw_material_id': r['id'],
        'quantity_needed': r['qty'],
      }).toList();

      String? imageUrl = widget.product?.imageUrl;
      if (_image != null) {
        imageUrl = await repository.uploadImage(_image!);
      }

      final Map<String, dynamic> data = {
        'p_name': _nameController.text,
        'p_selling_price': double.parse(_priceController.text),
        'p_barcode': _skuController.text.isEmpty ? null : _skuController.text,
        'p_stock': int.tryParse(_stockController.text) ?? 0,
        'p_recipe': recipeData,
        'p_image_url': imageUrl,
      };

      if (widget.product == null) {
        await repository.createProduct(data);
      } else {
        await repository.updateProduct(widget.product!.id, data);
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
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Gagal menyimpan produk: $e')),
        );
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
      builder: (context) => _RawMaterialPicker(
        onSelected: (material) {
          _addRecipeItem(material);
        },
      ),
    );
  }

  void _addRecipeItem(Map<String, dynamic> material) {
    final qtyController = TextEditingController();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
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
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Batal')),
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
              Navigator.pop(context);
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
                padding: EdgeInsets.symmetric(horizontal: 16.0),
                child: SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2)),
              ),
            )
          else
            TextButton(
              onPressed: _save,
              child: const Text('Simpan', style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFFFDB827))),
            ),
        ],
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(24),
          children: [
            Center(
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
                              child: Image.network(widget.product!.imageUrl!, fit: BoxFit.cover),
                            )
                          : Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.add_a_photo_rounded, color: Colors.grey.shade400, size: 32),
                                const SizedBox(height: 4),
                                Text('Foto', style: TextStyle(color: Colors.grey.shade500, fontSize: 12)),
                              ],
                            ),
                ),
              ),
            ),
            const SizedBox(height: 32),

            _buildTextField(
              label: 'Nama Produk',
              controller: _nameController,
              hint: 'Contoh: Kopi Gula Aren',
              validator: (v) => v!.isEmpty ? 'Nama tidak boleh kosong' : null,
            ),
            const SizedBox(height: 20),
            _buildTextField(
              label: 'Harga Jual (Rp)',
              controller: _priceController,
              hint: '0',
              keyboardType: TextInputType.number,
              validator: (v) => v!.isEmpty ? 'Harga tidak boleh kosong' : null,
            ),
            const SizedBox(height: 20),
            _buildTextField(
              label: 'SKU / Barcode',
              controller: _skuController,
              hint: 'Opsional',
            ),
            const SizedBox(height: 20),
            _buildTextField(
              label: 'Stok Awal',
              controller: _stockController,
              hint: '0',
              keyboardType: TextInputType.number,
            ),
            
            const SizedBox(height: 32),
            
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Resep / Komposisi',
                  style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                TextButton.icon(
                  onPressed: _showRawMaterialPicker,
                  icon: const Icon(Icons.add_circle_outline, size: 20, color: Color(0xFFFDB827)),
                  label: const Text('Tambah Bahan', style: TextStyle(color: Color(0xFFFDB827))),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Container(
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
                      children: _recipe.asMap().entries.map((entry) {
                        return _buildRecipeItem(entry.key, entry.value);
                      }).toList(),
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTextField({
    required String label,
    required TextEditingController controller,
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
          controller: controller,
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

  Widget _buildRecipeItem(int index, Map<String, dynamic> item) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        children: [
          Expanded(child: Text(item['name'], style: GoogleFonts.outfit())),
          Text('${item['qty']} ${item['unit']}', style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
          const SizedBox(width: 8),
          IconButton(
            icon: const Icon(Icons.remove_circle_outline, color: Colors.red, size: 20),
            onPressed: () => setState(() => _recipe.removeAt(index)),
          ),
        ],
      ),
    );
  }
}

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
          Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(2))),
          const SizedBox(height: 20),
          Text('Pilih Bahan Baku', style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.bold)),
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
                    subtitle: Text(item['unit'], style: TextStyle(color: Colors.grey.shade500)),
                    trailing: const Icon(Icons.add_circle_outline, color: Color(0xFFFDB827)),
                    onTap: () {
                      onSelected(item);
                      Navigator.pop(context);
                    },
                  );
                },
              ),
              loading: () => const Center(child: CircularProgressIndicator(color: Color(0xFFFDB827))),
              error: (err, _) => Center(child: Text('Error: $err')),
            ),
          ),
        ],
      ),
    );
  }
}
