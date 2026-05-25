import '../../../core/api/api_client.dart';
import '../models/bill.dart';

class BillTrackerService {
  final ApiClient _apiClient;
  BillTrackerService(this._apiClient);

  Future<List<Bill>> getBills({Map<String, String>? params}) async {
    final response = await _apiClient.dio.get(
      '/api/v1/bills',
      queryParameters: params,
    );
    return (response.data as List).map((e) => Bill.fromJson(e)).toList();
  }

  Future<Map<String, dynamic>> createBill(Map<String, dynamic> data) async {
    final response = await _apiClient.dio.post('/api/v1/bills', data: data);
    return response.data as Map<String, dynamic>;
  }

  Future<Bill> getBillDetail(String id) async {
    final response = await _apiClient.dio.get('/api/v1/bills/$id');
    return Bill.fromJson(response.data);
  }

  Future<Map<String, dynamic>> updateBill(
    String id,
    Map<String, dynamic> data,
  ) async {
    final response = await _apiClient.dio.patch(
      '/api/v1/bills/$id',
      data: data,
    );
    return response.data as Map<String, dynamic>;
  }

  Future<void> deleteBill(String id) async {
    await _apiClient.dio.delete('/api/v1/bills/$id');
  }

  Future<Map<String, dynamic>> payBill(
    String id,
    Map<String, dynamic> data,
  ) async {
    final response = await _apiClient.dio.post(
      '/api/v1/bills/$id/pay',
      data: data,
    );
    return response.data as Map<String, dynamic>;
  }

  Future<List<BillPayment>> getPayments(String id) async {
    final response = await _apiClient.dio.get('/api/v1/bills/$id/payments');
    return (response.data as List).map((e) => BillPayment.fromJson(e)).toList();
  }

  Future<void> cancelBill(String id) async {
    await _apiClient.dio.patch('/api/v1/bills/$id/cancel');
  }

  Future<BillSummary> getSummary() async {
    final response = await _apiClient.dio.get('/api/v1/bills/summary');
    return BillSummary.fromJson(response.data);
  }
}
