import '../models/product.dart';
import '../services/pos_service.dart';

class PosRepository {
  final PosService _service;

  PosRepository(this._service);

  Future<List<Product>> getProducts({String? search}) => _service.getProducts(search: search);

  Future<Map<String, dynamic>> processCheckout(
    Map<String, dynamic> checkoutData,
  ) => _service.processCheckout(checkoutData);
}
