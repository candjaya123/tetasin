import '../../../core/api/api_client.dart';
import '../models/order.dart';

class OrderService {
  final ApiClient _apiClient;

  OrderService(this._apiClient);

  Future<List<Order>> getSalesOrders() async {
    final response = await _apiClient.dio.get('/api/v1/orders/sales');
    return (response.data as List).map((e) => _mapOrderData(e, 'SO')).toList();
  }

  Future<List<Order>> getPurchaseOrders() async {
    final response = await _apiClient.dio.get('/api/v1/orders/purchase');
    return (response.data as List).map((e) => _mapOrderData(e, 'PO')).toList();
  }

  Future<Order> createSalesOrder(Map<String, dynamic> data) async {
    final response = await _apiClient.dio.post('/api/v1/orders/sales', data: data);
    return _mapOrderData(response.data, 'SO');
  }

  Future<Order> createPurchaseOrder(Map<String, dynamic> data) async {
    final response = await _apiClient.dio.post('/api/v1/orders/purchase', data: data);
    return _mapOrderData(response.data, 'PO');
  }

  Order _mapOrderData(dynamic e, String type) {
    final data = Map<String, dynamic>.from(e);
    data['type'] = type;

    // Fix casting: backend might send int for round numbers
    if (data['total_amount'] != null) {
      data['total_amount'] = (data['total_amount'] as num).toDouble();
    }
    if (data['tax_amount'] != null) {
      data['tax_amount'] = (data['tax_amount'] as num).toDouble();
    }
    if (data['discount_amount'] != null) {
      data['discount_amount'] = (data['discount_amount'] as num).toDouble();
    }

    if (type == 'SO') {
      // Map nested customer name to entity_name for SO
      if (data['customers'] != null && data['customers'] is Map) {
        data['entity_name'] = data['customers']['name'];
      }
    } else {
      // Map vendor_name to entity_name for unified UI PO
      data['entity_name'] = data['vendor_name'];
    }

    return Order.fromJson(data);
  }
}
