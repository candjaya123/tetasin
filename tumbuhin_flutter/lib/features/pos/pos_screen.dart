import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'widgets/pos_header.dart';
import 'widgets/product_grid.dart';
import 'widgets/cart_summary.dart';
import 'widgets/ai_chat_widget.dart';
import 'providers/pos_providers.dart';
import '../../../core/theme/responsive.dart';
import 'widgets/cart_panel.dart';

class PosScreen extends ConsumerWidget {
  const PosScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final viewMode = ref.watch(posViewModeProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      body: SafeArea(
        child: Responsive(
          mobile: Column(
            children: [
              const PosHeader(),
              Expanded(
                child: viewMode == PosViewMode.grid
                    ? const ProductGrid()
                    : const AiChatWidget(),
              ),
              const CartSummary(),
            ],
          ),
          tablet: Row(
            children: [
              Expanded(
                child: Column(
                  children: [
                    const PosHeader(),
                    Expanded(
                      child: viewMode == PosViewMode.grid
                          ? const ProductGrid()
                          : const AiChatWidget(),
                    ),
                  ],
                ),
              ),
              const CartPanel(),
            ],
          ),
        ),
      ),
    );
  }
}
