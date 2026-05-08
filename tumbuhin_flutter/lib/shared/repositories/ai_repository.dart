import '../services/ai_service.dart';

class AiRepository {
  final AiService _service;

  AiRepository(this._service);

  Future<String> chat(String message) => _service.chat(message);

  Future<Map<String, dynamic>> processReceipt(String imageUrl) => 
      _service.processReceipt(imageUrl);
}
