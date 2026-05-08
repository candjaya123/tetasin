import '../services/report_service.dart';

class ReportRepository {
  final SharedReportService _service;

  ReportRepository(this._service);

  Future<Map<String, dynamic>> getDashboard() => _service.getDashboard();

  Future<List<Map<String, dynamic>>> getFinancialReports(String type) => 
      _service.getFinancialReports(type);
}
