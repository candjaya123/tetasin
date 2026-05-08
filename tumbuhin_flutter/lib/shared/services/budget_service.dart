import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/api/api_client.dart';
import '../../core/api/api_provider.dart';

final budgetServiceProvider = Provider<BudgetService>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return BudgetService(apiClient);
});

class BudgetService {
  final ApiClient _apiClient;

  BudgetService(this._apiClient);

  Dio get _dio => _apiClient.dio;

  Future<List<Map<String, dynamic>>> getBudgets(String month) async {
    try {
      final response = await _dio.get('/api/v1/finance/budgets', queryParameters: {
        'month': month,
      });
      return List<Map<String, dynamic>>.from(response.data);
    } catch (e) {
      rethrow;
    }
  }

  Future<void> upsertBudget({
    required String accountId,
    required double limitAmount,
    required String month,
  }) async {
    try {
      await _dio.post('/api/v1/finance/budgets', data: {
        'account_id': accountId,
        'limit_amount': limitAmount,
        'period_month': month,
      });
    } catch (e) {
      rethrow;
    }
  }

  Future<void> deleteBudget(String id) async {
    try {
      await _dio.delete('/api/v1/finance/budgets/$id');
    } catch (e) {
      rethrow;
    }
  }
}
