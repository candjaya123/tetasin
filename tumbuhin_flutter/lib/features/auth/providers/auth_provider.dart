import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart' hide AuthState;
import '../../../core/api/api_provider.dart';
import '../../../shared/models/user_profile.dart';
import '../../../shared/models/tenant.dart';
import '../../../shared/repositories/profile_repository.dart';
import '../../../shared/repositories/repositories_provider.dart';
import 'auth_state.dart';

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final client = ref.watch(supabaseClientProvider);
  final repo = ref.watch(profileRepositoryProvider);
  final errorInterceptor = ref.watch(errorInterceptorProvider);
  
  final notifier = AuthNotifier(client, repo);
  
  // Listen to 401 errors from API
  final subscription = errorInterceptor.onUnauthorized.listen((_) {
    notifier.signOut();
  });
  
  ref.onDispose(() => subscription.cancel());
  
  return notifier;
});

class AuthNotifier extends StateNotifier<AuthState> {
  final SupabaseClient _client;
  final ProfileRepository _repo;

  AuthNotifier(this._client, this._repo) : super(const AuthState()) {
    _init();
  }

  void _init() {
    // Listen to auth state changes
    _client.auth.onAuthStateChange.listen((data) {
      final session = data.session;
      setSession(session);
    });

    // Initial session
    final initialSession = _client.auth.currentSession;
    if (initialSession != null) {
      setSession(initialSession);
    } else {
      state = state.copyWith(isLoading: false);
    }
  }

  void setSession(Session? session) {
    state = state.copyWith(
      session: session,
      isLoading: session != null,
      isGuest: false,
    );
    
    if (session != null) {
      fetchProfile();
    } else {
      state = state.copyWith(profile: null, tenant: null, isLoading: false);
    }
  }

  Future<void> fetchProfile() async {
    try {
      final profile = await _repo.getProfile();
      state = state.copyWith(profile: profile);
      fetchTenant();
    } catch (e) {
      state = state.copyWith(isLoading: false);
    }
  }

  Future<void> fetchTenant() async {
    try {
      final tenant = await _repo.getTenant();
      state = state.copyWith(tenant: tenant, isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false);
    }
  }

  void loginAsGuest() {
    state = state.copyWith(
      isGuest: true,
      isLoading: false,
      profile: const UserProfile(
        id: 'guest-uid',
        fullName: 'Pengguna Tamu',
        role: UserRole.manager,
        tenantId: 'guest-tenant-id',
      ),
      tenant: const Tenant(
        id: 'guest-tenant-id',
        name: 'Toko Tamu (Mode Memory)',
        address: 'Alamat Tamu',
        contactPhone: '08123456789',
        tier: 'trial',
      ),
    );
  }

  Future<void> login(String email, String password) async {
    state = state.copyWith(isLoading: true);
    try {
      final response = await _client.auth.signInWithPassword(email: email, password: password);
      
      // Verifikasi apakah profil masih ada (untuk mendeteksi akun yang sudah dihapus di DB tapi masih ada di Auth)
      final profileData = await _client
          .from('profiles')
          .select()
          .eq('id', response.user!.id)
          .maybeSingle();

      if (profileData == null) {
        await _client.auth.signOut();
        throw const AuthException('Email belum terdaftar atau akun telah dihapus.');
      }
    } catch (e) {
      state = state.copyWith(isLoading: false);
      rethrow;
    }
  }

  Future<void> updateProfile(Map<String, dynamic> updates) async {
    try {
      final updated = await _repo.updateProfile(updates);
      state = state.copyWith(profile: updated);
    } catch (e) {
      rethrow;
    }
  }

  Future<void> updateTenant(Map<String, dynamic> updates) async {
    try {
      final updated = await _repo.updateTenant(updates);
      state = state.copyWith(tenant: updated);
    } catch (e) {
      rethrow;
    }
  }

  Future<void> signOut() async {
    if (state.isGuest) {
      state = const AuthState(isLoading: false);
      return;
    }
    await _client.auth.signOut();
  }
}
