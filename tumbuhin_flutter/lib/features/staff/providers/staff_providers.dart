import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../shared/models/staff.dart';
import '../../../shared/repositories/repositories_provider.dart';

final staffListProvider = FutureProvider<List<StaffAccount>>((ref) async {
  final repository = ref.watch(staffRepositoryProvider);
  return repository.getStaff();
});

final staffLogsProvider = FutureProviderFamily<List<StaffLog>, String>((
  ref,
  staffId,
) async {
  final repository = ref.watch(staffRepositoryProvider);
  return repository.getStaffLogs(staffId);
});
