import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hugeicons/hugeicons.dart';
import 'package:intl/intl.dart';
import 'package:go_router/go_router.dart';
import '../../../shared/models/product.dart';
import '../../../shared/repositories/repositories_provider.dart';
import 'providers/order_providers.dart';
import '../inventory/providers/inventory_providers.dart';

class OrderCreateScreen extends ConsumerStatefulWidget {
  const OrderCreateScreen({super.key});

  @override
  ConsumerState<OrderCreateScreen> createState() => _OrderCreateScreenState();
}

class _OrderCreateScreenState extends ConsumerState<OrderCreateScreen> {
  final _formKey = GlobalKey<FormState>();
  final _entityNameController = TextEditingController();
  String _orderType = 'SO';
  final List<Map<String, dynamic>> _selectedItems = [];
  bool _isLoading = false;

  @override
  void dispose() {
    _entityNameController.dispose();
    super.dispose();
  }

  double get _totalAmount => _selectedItems.fold(0.0, (sum, item) => sum + (item['quantity'] * item['price']));

  void _addItem(Product product) {
    setState(() {
      final existingIndex = _selectedItems.indexWhere((item) => item['id'] == product.id);
      if (existingIndex != -1) {
        _selectedItems[existingIndex]['quantity'] += 1;
      } else {
        _selectedItems.add({
          'id': product.id,
          'name': product.name,
          'price': _orderType == 'SO' ? product.price : 0.0,
          'quantity': 1,
        });
      }
    });
  }

  void _removeItem(int index) {
    setState(() {
      _selectedItems.removeAt(index);
    });
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedItems.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Pilih minimal satu item')),
      );
      return;
    }

    setState(() => _isLoading = true);
    try {
      final repository = ref.read(orderRepositoryProvider);
      final payload = {
        'entity_name': _entityNameController.text,
        'total_amount': _totalAmount,
        'status': _orderType == 'SO' ? 'pending' : 'draft',
        'items': _selectedItems.map((i) => {
          'product_id': i['id'],
          'quantity': i['quantity'],
          'unit_price': i['price'],
        }).toList(),
      };

      if (_orderType == 'SO') {
        await repository.createSalesOrder(payload);
      } else {
        await repository.createPurchaseOrder(payload);
      }

      if (mounted) {
        ref.invalidate(salesOrdersProvider);
        ref.invalidate(purchaseOrdersProvider);
        context.pop();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Pesanan berhasil dibuat')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Gagal membuat pesanan: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final productsAsync = ref.watch(inventoryProductsProvider);
    final currencyFormat = NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Buat Pesanan Baru', style: TextStyle(fontWeight: FontWeight.w900)),
      ),
      body: Form(
        key: _formKey,
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildTypeSelector(),
                    const SizedBox(height: 20),
                    _buildEntityInput(),
                    const SizedBox(height: 30),
                    const Text('PILIH PRODUK', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: Colors.grey)),
                    const SizedBox(height: 10),
                    _buildProductSelector(productsAsync, currencyFormat),
                    const SizedBox(height: 30),
                    const Text('ITEM TERPILIH', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: Colors.grey)),
                    const SizedBox(height: 10),
                    _buildSelectedItemsList(currencyFormat),
                  ],
                ),
              ),
            ),
            _buildBottomBar(currencyFormat),
          ],
        ),
      ),
    );
  }

  Widget _buildTypeSelector() {
    return Row(
      children: [
        Expanded(
          child: _TypeChip(
            label: 'Sales Order (SO)',
            isSelected: _orderType == 'SO',
            onTap: () => setState(() => _orderType = 'SO'),
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: _TypeChip(
            label: 'Purchase Order (PO)',
            isSelected: _orderType == 'PO',
            onTap: () => setState(() => _orderType = 'PO'),
          ),
        ),
      ],
    );
  }

  Widget _buildEntityInput() {
    return TextFormField(
      controller: _entityNameController,
      decoration: InputDecoration(
        labelText: _orderType == 'SO' ? 'Nama Pelanggan' : 'Nama Supplier',
        hintText: 'Masukkan nama pihak terkait',
        prefixIcon: const Icon(HugeIcons.strokeRoundedUser),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
        filled: true,
        fillColor: Colors.grey[50],
      ),
      validator: (v) => v == null || v.isEmpty ? 'Nama harus diisi' : null,
    );
  }

  Widget _buildProductSelector(AsyncValue<List<Product>> productsAsync, NumberFormat currencyFormat) {
    return productsAsync.when(
      data: (products) => SizedBox(
        height: 120,
        child: ListView.builder(
          scrollDirection: Axis.horizontal,
          itemCount: products.length,
          itemBuilder: (context, index) {
            final p = products[index];
            return GestureDetector(
              onTap: () => _addItem(p),
              child: Container(
                width: 100,
                margin: const EdgeInsets.only(right: 12),
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.grey[200]!),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(HugeIcons.strokeRoundedPackage, color: Color(0xFFFDB827)),
                    const SizedBox(height: 8),
                    Text(
                      p.name,
                      style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
                      textAlign: TextAlign.center,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, s) => Text('Error: $e'),
    );
  }

  Widget _buildSelectedItemsList(NumberFormat currencyFormat) {
    if (_selectedItems.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(20),
        width: double.infinity,
        decoration: BoxDecoration(
          color: Colors.grey[50],
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.grey[200]!, style: BorderStyle.solid),
        ),
        child: const Center(child: Text('Belum ada item terpilih', style: TextStyle(color: Colors.grey))),
      );
    }

    return Column(
      children: _selectedItems.asMap().entries.map((entry) {
        final i = entry.value;
        return Container(
          margin: const EdgeInsets.only(bottom: 10),
          padding: const EdgeInsets.all(15),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Colors.grey[100]!),
          ),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(i['name'], style: const TextStyle(fontWeight: FontWeight.bold)),
                    Text(currencyFormat.format(i['price']), style: const TextStyle(fontSize: 12, color: Colors.grey)),
                  ],
                ),
              ),
              Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.remove_circle_outline, size: 20),
                    onPressed: () {
                      setState(() {
                        if (i['quantity'] > 1) {
                          i['quantity'] -= 1;
                        } else {
                          _removeItem(entry.key);
                        }
                      });
                    },
                  ),
                  Text('${i['quantity'].toInt()}', style: const TextStyle(fontWeight: FontWeight.bold)),
                  IconButton(
                    icon: const Icon(Icons.add_circle_outline, size: 20),
                    onPressed: () => setState(() => i['quantity'] += 1),
                  ),
                ],
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  Widget _buildBottomBar(NumberFormat currencyFormat) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: const BoxDecoration(
        color: Colors.white,
        boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 10, offset: Offset(0, -2))],
      ),
      child: SafeArea(
        child: Row(
          children: [
            Expanded(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Total Pembayaran', style: TextStyle(color: Colors.grey, fontSize: 12)),
                  Text(
                    currencyFormat.format(_totalAmount),
                    style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 20, color: Color(0xFFFDB827)),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 20),
            ElevatedButton(
              onPressed: _isLoading ? null : _submit,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF1A1A1A),
                foregroundColor: const Color(0xFFFDB827),
                padding: const EdgeInsets.symmetric(horizontal: 30, vertical: 15),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
              child: _isLoading
                  ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Color(0xFFFDB827), strokeWidth: 2))
                  : const Text('Buat Pesanan', style: TextStyle(fontWeight: FontWeight.w900)),
            ),
          ],
        ),
      ),
    );
  }
}

class _TypeChip extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _TypeChip({required this.label, required this.isSelected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFFDB827) : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: isSelected ? const Color(0xFFFDB827) : Colors.grey[300]!),
        ),
        child: Center(
          child: Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w800,
              color: isSelected ? const Color(0xFF1A1A1A) : Colors.grey[600],
            ),
          ),
        ),
      ),
    );
  }
}
