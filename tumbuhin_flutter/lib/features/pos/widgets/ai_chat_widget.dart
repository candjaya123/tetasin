import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/ai_chat_notifier.dart';

class AiChatWidget extends ConsumerStatefulWidget {
  const AiChatWidget({super.key});

  @override
  ConsumerState<AiChatWidget> createState() => _AiChatWidgetState();
}

class _AiChatWidgetState extends ConsumerState<AiChatWidget> {
  final _controller = TextEditingController();
  final _scrollController = ScrollController();

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final messages = ref.watch(aiChatProvider);
    final notifier = ref.watch(aiChatProvider.notifier);

    return Column(
      children: [
        Expanded(
          child: ListView.builder(
            controller: _scrollController,
            padding: const EdgeInsets.all(14),
            itemCount: messages.length,
            itemBuilder: (context, index) {
              final msg = messages[index];
              return _ChatBubble(message: msg);
            },
          ),
        ),
        if (notifier.isLoading)
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 14, vertical: 6),
            child: Row(
              children: [
                SizedBox(
                  width: 18,
                  height: 18,
                  child: CircularProgressIndicator(strokeWidth: 2),
                ),
                SizedBox(width: 10),
                Text(
                  'CFO Virtual sedang berpikir...',
                  style: TextStyle(fontSize: 11, color: Colors.grey),
                ),
              ],
            ),
          ),
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: Colors.white,
            border: Border(top: BorderSide(color: Colors.grey.shade200)),
          ),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _controller,
                  decoration: InputDecoration(
                    hintText: 'Tanya CFO Virtual...',
                    hintStyle: TextStyle(
                      fontSize: 13,
                      color: Colors.grey.shade500,
                    ),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(20),
                      borderSide: BorderSide.none,
                    ),
                    filled: true,
                    fillColor: Colors.grey.shade100,
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 8,
                    ),
                  ),
                  onSubmitted: (val) {
                    notifier.sendMessage(val);
                    _controller.clear();
                    _scrollToBottom();
                  },
                ),
              ),
              const SizedBox(width: 8),
              IconButton(
                onPressed: () {
                  notifier.sendMessage(_controller.text);
                  _controller.clear();
                  _scrollToBottom();
                },
                icon: const Icon(Icons.send, size: 20),
                color: const Color(0xFFFDB827),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _ChatBubble extends StatelessWidget {
  final ChatMessage message;

  const _ChatBubble({required this.message});

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: message.isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.75,
        ),
        decoration: BoxDecoration(
          color: message.isUser
              ? const Color(0xFFFDB827).withValues(alpha: 0.15)
              : Colors.grey.shade200,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(14),
            topRight: const Radius.circular(14),
            bottomLeft: Radius.circular(message.isUser ? 14 : 0),
            bottomRight: Radius.circular(message.isUser ? 0 : 14),
          ),
        ),
        child: Text(
          message.text,
          style: const TextStyle(color: Colors.black87, fontSize: 14),
        ),
      ),
    );
  }
}
