import 'dart:io';
import 'package:dio/dio.dart';
import '../../../core/api/api_client.dart';
import 'receipt_models.dart';

class ReceiptRepository {
  final ApiClient _apiClient;

  ReceiptRepository(this._apiClient);

  Future<ReceiptScan> uploadScan(File image) async {
    final formData = FormData.fromMap({
      'image': await MultipartFile.fromFile(image.path),
    });
    final response = await _apiClient.dio.post(
      '/api/v1/receipt/scan',
      data: formData,
    );
    return ReceiptScan.fromJson(response.data);
  }

  Future<ReceiptScan> getScanStatus(String scanId) async {
    final response = await _apiClient.dio.get('/api/v1/receipt/scan/$scanId');
    return ReceiptScan.fromJson(response.data);
  }

  Future<List<DraftTransaction>> getDrafts() async {
    final response = await _apiClient.dio.get('/api/v1/receipt/drafts');
    return (response.data as List)
        .map((e) => DraftTransaction.fromJson(e))
        .toList();
  }

  Future<DraftTransaction> getDraft(String id) async {
    final response = await _apiClient.dio.get('/api/v1/receipt/drafts/$id');
    return DraftTransaction.fromJson(response.data);
  }

  Future<DraftTransaction> createManualDraft(Map<String, dynamic> data) async {
    final response = await _apiClient.dio.post(
      '/api/v1/receipt/drafts',
      data: data,
    );
    return DraftTransaction.fromJson(response.data);
  }

  Future<DraftTransaction> updateDraft(
    String id,
    Map<String, dynamic> data,
  ) async {
    final response = await _apiClient.dio.patch(
      '/api/v1/receipt/drafts/$id',
      data: data,
    );
    return DraftTransaction.fromJson(response.data);
  }

  Future<void> approveDraft(String id) async {
    await _apiClient.dio.post('/api/v1/receipt/drafts/$id/approve');
  }

  Future<void> rejectDraft(String id, {String? reason}) async {
    await _apiClient.dio.post(
      '/api/v1/receipt/drafts/$id/reject',
      data: {'reason': reason},
    );
  }

  Future<List<MerchantMapping>> getMerchants() async {
    final response = await _apiClient.dio.get('/api/v1/receipt/merchants');
    return (response.data as List)
        .map((e) => MerchantMapping.fromJson(e))
        .toList();
  }
}
