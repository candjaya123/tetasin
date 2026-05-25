import '../models/product.dart';
import '../../../core/api/api_client.dart';

class PosService {
  final ApiClient _apiClient;

  PosService(this._apiClient);

  Future<List<Product>> getProducts({String? search}) async {
    final response = await _apiClient.dio.get(
      '/api/v1/inventory/products',
      queryParameters: search != null && search.isNotEmpty ? {'search': search} : null,
    );
    return (response.data as List).map((e) => Product.fromJson(e)).toList();
  }

  Future<Map<String, dynamic>> processCheckout(
    Map<String, dynamic> checkoutData,
  ) async {
    final response = await _apiClient.dio.post(
      '/api/v1/sales/process',
      data: checkoutData,
    );
    return response.data;
  }
}
