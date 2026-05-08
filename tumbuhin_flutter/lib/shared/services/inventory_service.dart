import 'dart:io';
import 'package:dio/dio.dart';
import '../models/product.dart';
import '../../../core/api/api_client.dart';

class InventoryService {
  final ApiClient _apiClient;

  InventoryService(this._apiClient);

  Future<List<Product>> getInventory({String? search}) async {
    try {
      final response = await _apiClient.dio.get(
        '/api/v1/inventory/products',
        queryParameters: search != null ? {'search': search} : null,
      );
      print('Inventory response status: ${response.statusCode}');
      print('Inventory data type: ${response.data.runtimeType}');
      
      if (response.data is List) {
        return (response.data as List).map((e) => Product.fromJson(e)).toList();
      } else {
        print('Warning: Expected List but got ${response.data.runtimeType}');
        return [];
      }
    } catch (e) {
      print('Error in getInventory: $e');
      rethrow;
    }
  }

  Future<List<Map<String, dynamic>>> getRawMaterials() async {
    final response = await _apiClient.dio.get('/api/v1/inventory/raw-materials');
    return List<Map<String, dynamic>>.from(response.data);
  }

  Future<Product> createProduct(Map<String, dynamic> data) async {
    final response = await _apiClient.dio.post('/api/v1/inventory/products', data: data);
    if (response.data is Map<String, dynamic>) {
      return Product.fromJson(response.data);
    }
    // Backend returns UUID string directly
    return Product(id: response.data.toString(), name: data['p_name'] ?? '', price: data['p_selling_price']?.toDouble() ?? 0, stock: 0);
  }

  Future<Product> updateProduct(String id, Map<String, dynamic> data) async {
    final response = await _apiClient.dio.put('/api/v1/inventory/products/$id', data: data);
    if (response.data is Map<String, dynamic>) {
      return Product.fromJson(response.data);
    }
    // Backend returns nothing or void for updates
    return Product(id: id, name: data['p_name'] ?? '', price: data['p_selling_price']?.toDouble() ?? 0, stock: 0);
  }

  Future<void> deleteProduct(String id) async {
    await _apiClient.dio.delete('/api/v1/inventory/products/$id');
  }

  // Warehouse & Stock Movement
  Future<List<Map<String, dynamic>>> getWarehouses() async {
    final response = await _apiClient.dio.get('/api/v1/inventory/warehouses');
    return List<Map<String, dynamic>>.from(response.data);
  }

  Future<void> stockTransfer(Map<String, dynamic> data) async {
    await _apiClient.dio.post('/api/v1/inventory/transfer', data: data);
  }

  Future<void> stockOpname(Map<String, dynamic> data) async {
    await _apiClient.dio.post('/api/v1/inventory/opname', data: data);
  }

  /// Update stok produk secara langsung (Tambah Stok / Set Stok)
  Future<void> updateProductStock({required String productId, required int newStock}) async {
    try {
      // Try dedicated stock endpoint first
      await _apiClient.dio.patch(
        '/api/v1/inventory/products/$productId/stock',
        data: {'stock': newStock},
      );
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) {
        // Fallback: use generic update product endpoint
        await _apiClient.dio.put(
          '/api/v1/inventory/products/$productId',
          data: {'p_stock': newStock},
        );
      } else {
        rethrow;
      }
    }
  }

  Future<String> uploadImage(File file) async {
    final fileName = file.path.split('/').last;
    final formData = FormData.fromMap({
      'file': await MultipartFile.fromFile(file.path, filename: fileName),
    });
    final response = await _apiClient.dio.post('/api/v1/inventory/upload', data: formData);
    return response.data['url'];
  }
}
