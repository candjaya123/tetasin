import '../../../core/api/api_client.dart';
import '../models/promotion.dart';

class PromoService {
  final ApiClient _apiClient;

  PromoService(this._apiClient);

  Future<List<Promotion>> getPromotions() async {
    final response = await _apiClient.dio.get('/api/v1/promotions');
    return (response.data as List).map((e) => Promotion.fromJson(e)).toList();
  }

  Future<Promotion> createPromotion(Map<String, dynamic> data) async {
    final response = await _apiClient.dio.post('/api/v1/promotions', data: data);
    return Promotion.fromJson(response.data);
  }

  Future<Promotion> updatePromotion(String id, Map<String, dynamic> data) async {
    final response = await _apiClient.dio.put('/api/v1/promotions/$id', data: data);
    return Promotion.fromJson(response.data);
  }

  Future<void> deletePromotion(String id) async {
    await _apiClient.dio.delete('/api/v1/promotions/$id');
  }

  Future<List<Map<String, dynamic>>> applyPromotions(List<Map<String, dynamic>> items) async {
    final response = await _apiClient.dio.post('/api/v1/promotions/apply', data: {'items': items});
    return List<Map<String, dynamic>>.from(response.data);
  }
}
