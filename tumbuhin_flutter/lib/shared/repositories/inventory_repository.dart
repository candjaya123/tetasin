import 'dart:io';
import '../models/product.dart';
import '../services/inventory_service.dart';

class InventoryRepository {
  final InventoryService _service;

  InventoryRepository(this._service);

  Future<List<Product>> getInventory({String? search}) => _service.getInventory(search: search);

  Future<Product> createProduct(Map<String, dynamic> data) => _service.createProduct(data);

  Future<Product> updateProduct(String id, Map<String, dynamic> data) => _service.updateProduct(id, data);

  Future<void> deleteProduct(String id) => _service.deleteProduct(id);

  Future<List<Map<String, dynamic>>> getWarehouses() => _service.getWarehouses();

  Future<void> stockTransfer(Map<String, dynamic> data) => _service.stockTransfer(data);

  Future<void> stockOpname(Map<String, dynamic> data) => _service.stockOpname(data);

  Future<void> updateProductStock({required String productId, required int newStock}) =>
      _service.updateProductStock(productId: productId, newStock: newStock);

  Future<List<Map<String, dynamic>>> getRawMaterials() => _service.getRawMaterials();

  Future<String> uploadImage(File file) => _service.uploadImage(file);
}
