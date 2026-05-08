import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:supabase_flutter/supabase_flutter.dart' hide AuthState;
import '../../../shared/models/user_profile.dart';
import '../../../shared/models/tenant.dart';

part 'auth_state.freezed.dart';

@freezed
class AuthState with _$AuthState {
  const factory AuthState({
    Session? session,
    UserProfile? profile,
    Tenant? tenant,
    @Default(true) bool isLoading,
    @Default(false) bool isGuest,
  }) = _AuthState;

  const AuthState._();

  bool get isAuthenticated => session != null || isGuest;
}
