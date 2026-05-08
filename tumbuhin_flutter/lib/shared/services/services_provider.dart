import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/api/api_provider.dart';
import 'pos_service.dart';
import 'inventory_service.dart';
import 'report_service.dart'; // SharedReportService - digunakan oleh ReportRepository
import 'ai_service.dart';
import 'journal_service.dart';
import 'profile_service.dart';
import 'order_service.dart';
import 'promo_service.dart';
import 'staff_service.dart';
import 'alert_service.dart';

final posServiceProvider = Provider<PosService>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return PosService(apiClient);
});

final inventoryServiceProvider = Provider<InventoryService>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return InventoryService(apiClient);
});

final sharedReportServiceProvider = Provider<SharedReportService>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return SharedReportService(apiClient);
});

final aiServiceProvider = Provider<AiService>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return AiService(apiClient);
});

final journalServiceProvider = Provider<JournalService>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return JournalService(apiClient);
});

final profileServiceProvider = Provider<ProfileService>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return ProfileService(apiClient);
});

final orderServiceProvider = Provider<OrderService>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return OrderService(apiClient);
});

final promoServiceProvider = Provider<PromoService>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return PromoService(apiClient);
});

final staffServiceProvider = Provider<StaffService>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return StaffService(apiClient);
});

final alertServiceProvider = Provider<AlertService>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return AlertService(apiClient);
});
