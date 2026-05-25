import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'auth_interceptor.dart';
import 'error_interceptor.dart';
import 'response_envelope_interceptor.dart';

class ApiClient {
  late final Dio dio;

  ApiClient({
    required AuthInterceptor authInterceptor,
    required ErrorInterceptor errorInterceptor,
  }) {
    dio = Dio(
      BaseOptions(
        baseUrl: dotenv.env['BACKEND_URL'] ?? 'http://localhost:8080',
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 15),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    dio.interceptors.addAll([
      authInterceptor,
      errorInterceptor,
      ResponseEnvelopeInterceptor(),
      if (kDebugMode) LogInterceptor(requestBody: true, responseBody: true),
    ]);
  }
}
