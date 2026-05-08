import '../../../core/api/api_client.dart';
import '../models/order.dart';

class OrderService {
  final ApiClient _apiClient;

  OrderService(this._apiClient);

  Future<List<Order>> getSalesOrders() async {
    final response = await _apiClient.dio.get('/api/v1/orders/sales');
    return (response.data as List).map((e) {
      // Map backend response to Order model
      final data = Map<String, dynamic>.from(e);
      data['type'] = 'SO';
      return Order.fromJson(data);
    }).toList();
  }

  Future<List<Order>> getPurchaseOrders() async {
    final response = await _apiClient.dio.get('/api/v1/orders/purchase');
    return (response.data as List).map((e) {
      // Map backend response to Order model
      final data = Map<String, dynamic>.from(e);
      data['type'] = 'PO';
      // Map vendor_name to entity_name for unified UI
      data['entity_name'] = data['vendor_name'];
      return Order.fromJson(data);
    }).toList();
  }

  Future<Order> createSalesOrder(Map<String, dynamic> data) async {
    final response = await _apiClient.dio.post('/api/v1/orders/sales', data: data);
    return Order.fromJson(response.data);
  }

  Future<Order> createPurchaseOrder(Map<String, dynamic> data) async {
    final response = await _apiClient.dio.post('/api/v1/orders/purchase', data: data);
    return Order.fromJson(response.data);
  }
}
