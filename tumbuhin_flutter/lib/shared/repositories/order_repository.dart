import '../models/order.dart';
import '../services/order_service.dart';

class OrderRepository {
  final OrderService _service;

  OrderRepository(this._service);

  Future<List<Order>> getSalesOrders() => _service.getSalesOrders();
  Future<List<Order>> getPurchaseOrders() => _service.getPurchaseOrders();
  Future<Order> getOrderById(String id) => _service.getOrderById(id);

  Future<Order> createSalesOrder(Map<String, dynamic> data) =>
      _service.createSalesOrder(data);
  Future<Order> createPurchaseOrder(Map<String, dynamic> data) =>
      _service.createPurchaseOrder(data);

  Future<void> updateOrderStatus(String id, String status) =>
      _service.updateOrderStatus(id, status);

  Future<void> updateDivisionNotes(String id, DivisionNotes notes) =>
      _service.updateDivisionNotes(id, notes.toJson());
}
