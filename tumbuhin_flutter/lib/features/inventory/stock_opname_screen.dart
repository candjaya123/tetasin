import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'providers/inventory_providers.dart';
import '../../../shared/repositories/repositories_provider.dart';

class StockOpnameScreen extends ConsumerStatefulWidget {
  const StockOpnameScreen({super.key});

  @override
  ConsumerState<StockOpnameScreen> createState() => _StockOpnameScreenState();
}

class _StockOpnameScreenState extends ConsumerState<StockOpnameScreen> {
  String? _selectedWarehouseId;
  final _notesController = TextEditingController();
  bool _isSubmitting = false;

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _handleOpname() async {
    if (_selectedWarehouseId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Pilih gudang terlebih dahulu')),
      );
      return;
    }

    setState(() => _isSubmitting = true);
    try {
      final repository = ref.read(inventoryRepositoryProvider);
      await repository.stockOpname({
        'warehouse_id': _selectedWarehouseId,
        'notes': _notesController.text,
        'items': [], // TODO: Implementation for selecting multiple products
      });

      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Stok Opname berhasil disimpan')),
        );
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
          'Stok Opname',
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
            Text(
              'Pilih Gudang',
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
                  value: _selectedWarehouseId,
                  isExpanded: true,
                  hint: const Text('Pilih Gudang'),
                  items: warehouses.map((w) {
                    return DropdownMenuItem<String>(
                      value: w['id'],
                      child: Text(w['name']),
                    );
                  }).toList(),
                  onChanged: (val) =>
                      setState(() => _selectedWarehouseId = val),
                ),
              ),
            ),
            const SizedBox(height: 32),
            Text(
              'Daftar Produk untuk Disesuaikan',
              style: GoogleFonts.outfit(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(32),
              decoration: BoxDecoration(
                color: Colors.grey.shade50,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.grey.shade100),
              ),
              child: Column(
                children: [
                  Icon(
                    Icons.add_circle_outline_rounded,
                    size: 48,
                    color: Colors.grey.shade300,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Tambah produk untuk mulai opname',
                    style: GoogleFonts.outfit(color: Colors.grey.shade600),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),
            Text(
              'Catatan Tambahan',
              style: GoogleFonts.outfit(
                fontWeight: FontWeight.w600,
                fontSize: 14,
                color: Colors.grey.shade700,
              ),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: _notesController,
              maxLines: 3,
              decoration: InputDecoration(
                hintText: 'Alasan penyesuaian stok...',
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
          onPressed: _isSubmitting ? null : _handleOpname,
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
                  'Simpan Hasil Opname',
                  style: GoogleFonts.outfit(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
        ),
      ),
    );
  }
}
