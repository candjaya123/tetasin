import '../../../core/api/api_client.dart';

class AiService {
  final ApiClient _apiClient;

  AiService(this._apiClient);

  Future<String> chat(String message) async {
    final response = await _apiClient.dio.post('/api/v1/ai/business/chat', data: {'prompt': message});
    return response.data['response'];
  }

  Future<Map<String, dynamic>> processReceipt(String imageUrl) async {
    // In backend, it expects a file upload via FileInterceptor('image')
    // For now, I'll just update the path. The implementation might need to handle MultipartFile.
    final response = await _apiClient.dio.post('/api/v1/ai/scan-receipt', data: {'image_url': imageUrl});
    return response.data;
  }
}
