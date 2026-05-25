import '../services/bill_tracker_service.dart';
import '../models/bill.dart';

class BillTrackerRepository {
  final BillTrackerService _service;
  BillTrackerRepository(this._service);

  Future<List<Bill>> getBills({Map<String, String>? params}) =>
      _service.getBills(params: params);

  Future<Map<String, dynamic>> createBill(Map<String, dynamic> data) =>
      _service.createBill(data);

  Future<Bill> getBillDetail(String id) => _service.getBillDetail(id);

  Future<Map<String, dynamic>> updateBill(
    String id,
    Map<String, dynamic> data,
  ) => _service.updateBill(id, data);

  Future<void> deleteBill(String id) => _service.deleteBill(id);

  Future<Map<String, dynamic>> payBill(String id, Map<String, dynamic> data) =>
      _service.payBill(id, data);

  Future<List<BillPayment>> getPayments(String id) => _service.getPayments(id);

  Future<void> cancelBill(String id) => _service.cancelBill(id);

  Future<BillSummary> getSummary() => _service.getSummary();
}
