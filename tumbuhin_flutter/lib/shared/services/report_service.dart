// Catatan: File ini adalah stub sederhana untuk kompatibilitas.
// ReportService yang digunakan oleh fitur Reports ada di:
// lib/features/reports/services/report_service.dart
// Provider-nya: lib/features/reports/providers/report_providers.dart (reportServiceProvider)
//
// File ini hanya digunakan oleh shared/repositories/report_repository.dart
// untuk getDashboard() dan getFinancialReports().

import '../../../core/api/api_client.dart';

class SharedReportService {
  final ApiClient _apiClient;

  SharedReportService(this._apiClient);

  Future<Map<String, dynamic>> getDashboard() async {
    final response = await _apiClient.dio.get('/api/v1/report/dashboard');
    return response.data as Map<String, dynamic>;
  }

  Future<List<Map<String, dynamic>>> getFinancialReports(String type) async {
    final endpoint = type == 'income-statement'
        ? '/api/v1/finance/income-statement'
        : '/api/v1/report/dashboard';
    final response = await _apiClient.dio.get(endpoint);
    if (response.data is List) {
      return (response.data as List).cast<Map<String, dynamic>>();
    }
    return [];
  }
}
