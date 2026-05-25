import 'dart:io';
import '../models/product.dart';
import '../services/inventory_service.dart';

class InventoryRepository {
  final InventoryService _service;

  InventoryRepository(this._service);

  Future<List<Product>> getInventory({String? search}) =>
      _service.getInventory(search: search);

  Future<Product> createProduct(Map<String, dynamic> data) =>
      _service.createProduct(data);

  Future<Product> updateProduct(String id, Map<String, dynamic> data) =>
      _service.updateProduct(id, data);

  Future<void> deleteProduct(String id) => _service.deleteProduct(id);

  Future<List<Map<String, dynamic>>> getWarehouses() =>
      _service.getWarehouses();

  Future<void> stockTransfer(Map<String, dynamic> data) =>
      _service.stockTransfer(data);

  Future<void> stockOpname(Map<String, dynamic> data) =>
      _service.stockOpname(data);

  Future<void> updateProductStock({
    required String productId,
    required double newStock,
  }) => _service.updateProductStock(productId: productId, newStock: newStock);

  Future<List<Map<String, dynamic>>> getRawMaterials() =>
      _service.getRawMaterials();

  Future<String> uploadImage(File file) => _service.uploadImage(file);

  // Variants
  Future<Map<String, dynamic>> getProductVariants(String productId) =>
      _service.getProductVariants(productId);
  Future<Map<String, dynamic>?> upsertVariantGroup(
    String productId,
    Map<String, dynamic> data,
  ) => _service.upsertVariantGroup(productId, data);
  Future<void> deleteVariantGroup(String groupId) =>
      _service.deleteVariantGroup(groupId);
  Future<Map<String, dynamic>?> upsertVariantOption(
    String productId,
    String groupId,
    Map<String, dynamic> data,
  ) => _service.upsertVariantOption(productId, groupId, data);
  Future<void> deleteVariantOption(String optionId) =>
      _service.deleteVariantOption(optionId);

  // Add-ons
  Future<Map<String, dynamic>> getProductAddons(String productId) =>
      _service.getProductAddons(productId);
  Future<Map<String, dynamic>?> upsertAddonGroup(
    String productId,
    Map<String, dynamic> data,
  ) => _service.upsertAddonGroup(productId, data);
  Future<void> deleteAddonGroup(String groupId) =>
      _service.deleteAddonGroup(groupId);
  Future<Map<String, dynamic>?> upsertAddon(
    String productId,
    String groupId,
    Map<String, dynamic> data,
  ) => _service.upsertAddon(productId, groupId, data);
  Future<void> deleteAddon(String addonId) => _service.deleteAddon(addonId);
}
