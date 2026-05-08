import '../models/staff.dart';
import '../services/staff_service.dart';

class StaffRepository {
  final StaffService _service;

  StaffRepository(this._service);

  Future<List<StaffAccount>> getStaff() => _service.getStaff();
  Future<void> inviteStaff(String email, String role) => _service.inviteStaff(email, role);
  Future<List<StaffLog>> getStaffLogs(String staffId) => _service.getStaffLogs(staffId);
}
