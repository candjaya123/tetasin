import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/services_provider.dart';
import 'pos_repository.dart';
import 'inventory_repository.dart';
import 'report_repository.dart';
import 'ai_repository.dart';
import 'journal_repository.dart';
import 'profile_repository.dart';
import 'order_repository.dart';
import 'promo_repository.dart';
import 'staff_repository.dart';
import 'alert_repository.dart';
import 'personal_finance_repository.dart';
import 'bill_tracker_repository.dart';

final posRepositoryProvider = Provider<PosRepository>((ref) {
  final service = ref.watch(posServiceProvider);
  return PosRepository(service);
});

final inventoryRepositoryProvider = Provider<InventoryRepository>((ref) {
  final service = ref.watch(inventoryServiceProvider);
  return InventoryRepository(service);
});

final reportRepositoryProvider = Provider<ReportRepository>((ref) {
  final service = ref.watch(sharedReportServiceProvider);
  return ReportRepository(service);
});

final aiRepositoryProvider = Provider<AiRepository>((ref) {
  final service = ref.watch(aiServiceProvider);
  return AiRepository(service);
});

final journalRepositoryProvider = Provider<JournalRepository>((ref) {
  final service = ref.watch(journalServiceProvider);
  return JournalRepository(service);
});

final profileRepositoryProvider = Provider<ProfileRepository>((ref) {
  final service = ref.watch(profileServiceProvider);
  return ProfileRepository(service);
});

final orderRepositoryProvider = Provider<OrderRepository>((ref) {
  final service = ref.watch(orderServiceProvider);
  return OrderRepository(service);
});

final promoRepositoryProvider = Provider<PromoRepository>((ref) {
  final service = ref.watch(promoServiceProvider);
  return PromoRepository(service);
});

final staffRepositoryProvider = Provider<StaffRepository>((ref) {
  final service = ref.watch(staffServiceProvider);
  return StaffRepository(service);
});

final alertRepositoryProvider = Provider<AlertRepository>((ref) {
  final service = ref.watch(alertServiceProvider);
  return AlertRepository(service);
});

final personalFinanceRepositoryProvider = Provider<PersonalFinanceRepository>((
  ref,
) {
  final service = ref.watch(personalFinanceServiceProvider);
  return PersonalFinanceRepository(service);
});

final billTrackerRepositoryProvider = Provider<BillTrackerRepository>((ref) {
  final service = ref.watch(billTrackerServiceProvider);
  return BillTrackerRepository(service);
});
