import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'providers/inventory_providers.dart';
import '../../../shared/repositories/repositories_provider.dart';

class StockTransferScreen extends ConsumerStatefulWidget {
  const StockTransferScreen({super.key});

  @override
  ConsumerState<StockTransferScreen> createState() =>
      _StockTransferScreenState();
}

class _StockTransferScreenState extends ConsumerState<StockTransferScreen> {
  String? _fromWarehouseId;
  String? _toWarehouseId;
  final _quantityController = TextEditingController();
  bool _isSubmitting = false;

  @override
  void dispose() {
    _quantityController.dispose();
    super.dispose();
  }

  Future<void> _handleTransfer() async {
    if (_fromWarehouseId == null || _toWarehouseId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Pilih gudang asal dan tujuan')),
      );
      return;
    }

    if (_fromWarehouseId == _toWarehouseId) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Gudang asal dan tujuan tidak boleh sama'),
        ),
      );
      return;
    }

    setState(() => _isSubmitting = true);
    try {
      final repository = ref.read(inventoryRepositoryProvider);
      await repository.stockTransfer({
        'from_warehouse_id': _fromWarehouseId,
        'to_warehouse_id': _toWarehouseId,
        // TODO: In a real app, you'd select a product first
        'product_id': 'temporary-id',
        'quantity': double.tryParse(_quantityController.text) ?? 0,
      });

      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Transfer stok berhasil')));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final warehousesAsync = ref.watch(warehousesProvider);

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: Text(
          'Transfer Stok',
          style: GoogleFonts.outfit(fontWeight: FontWeight.bold),
        ),
        elevation: 0,
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
      ),
      body: warehousesAsync.when(
        data: (warehouses) => ListView(
          padding: const EdgeInsets.all(24),
          children: [
            _buildWarehouseDropdown(
              label: 'Dari Gudang',
              value: _fromWarehouseId,
              items: warehouses,
              onChanged: (val) => setState(() => _fromWarehouseId = val),
            ),
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 24),
              child: Center(
                child: CircleAvatar(
                  backgroundColor: Color(0xFFFDB827),
                  child: Icon(
                    Icons.arrow_downward_rounded,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
            _buildWarehouseDropdown(
              label: 'Ke Gudang',
              value: _toWarehouseId,
              items: warehouses,
              onChanged: (val) => setState(() => _toWarehouseId = val),
            ),
            const SizedBox(height: 32),
            Text(
              'Detail Transfer',
              style: GoogleFonts.outfit(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _quantityController,
              keyboardType: TextInputType.number,
              decoration: InputDecoration(
                labelText: 'Jumlah Stok',
                hintText: '0.00',
                filled: true,
                fillColor: Colors.grey.shade50,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
          ],
        ),
        loading: () => const Center(
          child: CircularProgressIndicator(color: Color(0xFFFDB827)),
        ),
        error: (err, _) => Center(child: Text('Error memuat gudang: $err')),
      ),
      bottomNavigationBar: Padding(
        padding: const EdgeInsets.all(24),
        child: ElevatedButton(
          onPressed: _isSubmitting ? null : _handleTransfer,
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF2D3436),
            foregroundColor: Colors.white,
            minimumSize: const Size(double.infinity, 60),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
            ),
            elevation: 0,
          ),
          child: _isSubmitting
              ? const CircularProgressIndicator(color: Colors.white)
              : Text(
                  'Konfirmasi Transfer',
                  style: GoogleFonts.outfit(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
        ),
      ),
    );
  }

  Widget _buildWarehouseDropdown({
    required String label,
    required String? value,
    required List<Map<String, dynamic>> items,
    required ValueChanged<String?> onChanged,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: GoogleFonts.outfit(
            fontWeight: FontWeight.w600,
            fontSize: 14,
            color: Colors.grey.shade700,
          ),
        ),
        const SizedBox(height: 10),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          decoration: BoxDecoration(
            color: Colors.grey.shade50,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Colors.grey.shade200),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: value,
              isExpanded: true,
              hint: const Text('Pilih Gudang'),
              items: items.map((w) {
                return DropdownMenuItem<String>(
                  value: w['id'],
                  child: Text(w['name']),
                );
              }).toList(),
              onChanged: onChanged,
            ),
          ),
        ),
      ],
    );
  }
}
