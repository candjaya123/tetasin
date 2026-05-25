import 'package:dio/dio.dart';

class ResponseEnvelopeInterceptor extends Interceptor {
  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    if (response.data is Map) {
      final map = response.data as Map;
      if (map.containsKey('success') && map.containsKey('data')) {
        response.data = map['data'];
      }
    }
    return handler.next(response);
  }
}
