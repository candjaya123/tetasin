import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../shared/repositories/repositories_provider.dart';

class ChatMessage {
  final String text;
  final bool isUser;
  final DateTime timestamp;

  ChatMessage({required this.text, required this.isUser, DateTime? timestamp})
    : timestamp = timestamp ?? DateTime.now();
}

class AiChatNotifier extends StateNotifier<List<ChatMessage>> {
  final Ref _ref;

  AiChatNotifier(this._ref)
    : super([
        ChatMessage(
          text:
              'Halo! Saya CFO Virtual Anda. Ada yang bisa saya bantu terkait laporan keuangan atau operasional toko hari ini?',
          isUser: false,
        ),
      ]);

  bool isLoading = false;

  Future<void> sendMessage(String text) async {
    if (text.trim().isEmpty) return;

    final userMessage = ChatMessage(text: text, isUser: true);
    state = [...state, userMessage];

    isLoading = true;
    state = [...state]; // Trigger UI update for loading

    try {
      final repository = _ref.read(aiRepositoryProvider);
      final response = await repository.chat(text);

      state = [...state, ChatMessage(text: response, isUser: false)];
    } on DioException catch (e) {
      String errorMsg;
      if (e.response?.statusCode == 429) {
        errorMsg =
            '⏳ Kuota AI sedang tinggi. Mohon tunggu beberapa menit dan coba lagi.';
      } else if (e.response?.statusCode == 403) {
        errorMsg =
            '🔒 Fitur ini memerlukan akun dengan tier yang lebih tinggi.';
      } else if (e.type == DioExceptionType.connectionTimeout ||
          e.type == DioExceptionType.receiveTimeout) {
        errorMsg = '🌐 Koneksi timeout. Pastikan internet Anda stabil.';
      } else {
        errorMsg =
            'Maaf, terjadi kesalahan (${e.response?.statusCode ?? "network"}). Coba lagi nanti.';
      }
      state = [...state, ChatMessage(text: errorMsg, isUser: false)];
    } catch (e) {
      state = [
        ...state,
        ChatMessage(
          text: 'Maaf, terjadi kesalahan tidak terduga. Silakan coba lagi.',
          isUser: false,
        ),
      ];
    } finally {
      isLoading = false;
      state = [...state];
    }
  }
}

final aiChatProvider = StateNotifierProvider<AiChatNotifier, List<ChatMessage>>(
  (ref) {
    return AiChatNotifier(ref);
  },
);
