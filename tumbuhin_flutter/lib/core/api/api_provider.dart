import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'api_client.dart';
import 'auth_interceptor.dart';
import 'error_interceptor.dart';

final supabaseClientProvider = Provider<SupabaseClient>((ref) {
  return Supabase.instance.client;
});

final authInterceptorProvider = Provider<AuthInterceptor>((ref) {
  final supabase = ref.watch(supabaseClientProvider);
  return AuthInterceptor(supabase);
});

final errorInterceptorProvider = Provider<ErrorInterceptor>((ref) {
  final interceptor = ErrorInterceptor();
  ref.onDispose(() => interceptor.dispose());
  return interceptor;
});

final apiClientProvider = Provider<ApiClient>((ref) {
  final auth = ref.watch(authInterceptorProvider);
  final error = ref.watch(errorInterceptorProvider);
  return ApiClient(authInterceptor: auth, errorInterceptor: error);
});
