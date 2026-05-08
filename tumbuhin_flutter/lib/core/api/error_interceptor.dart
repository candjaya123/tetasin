import 'dart:async';
import 'package:dio/dio.dart';

class ErrorInterceptor extends Interceptor {
  final _unauthorizedController = StreamController<void>.broadcast();
  Stream<void> get onUnauthorized => _unauthorizedController.stream;

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    if (err.response?.statusCode == 401) {
      _unauthorizedController.add(null);
    }
    return handler.next(err);
  }

  void dispose() {
    _unauthorizedController.close();
  }
}
