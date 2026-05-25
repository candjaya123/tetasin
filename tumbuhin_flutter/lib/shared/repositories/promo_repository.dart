import '../models/promotion.dart';
import '../services/promo_service.dart';

class PromoRepository {
  final PromoService _service;

  PromoRepository(this._service);

  Future<List<Promotion>> getPromotions() => _service.getPromotions();
  Future<Promotion> createPromotion(Map<String, dynamic> data) =>
      _service.createPromotion(data);
  Future<Promotion> updatePromotion(String id, Map<String, dynamic> data) =>
      _service.updatePromotion(id, data);
  Future<void> deletePromotion(String id) => _service.deletePromotion(id);
  Future<List<Map<String, dynamic>>> applyPromotions(
    List<Map<String, dynamic>> items,
  ) => _service.applyPromotions(items);
}
