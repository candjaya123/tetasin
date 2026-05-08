import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../shared/models/product.dart';
import '../../../shared/models/cart_item.dart';
import '../../../shared/repositories/repositories_provider.dart';

enum PosViewMode { grid, chat }

final posViewModeProvider = StateProvider<PosViewMode>((ref) => PosViewMode.grid);

final posSearchQueryProvider = StateProvider<String>((ref) => '');

final productsProvider = FutureProvider<List<Product>>((ref) async {
  final repository = ref.watch(posRepositoryProvider);
  return repository.getProducts();
});

class CartNotifier extends StateNotifier<List<CartItem>> {
  CartNotifier() : super([]);

  void addToCart(Product product) {
    final existingIndex = state.indexWhere((item) => item.product.id == product.id);
    if (existingIndex != -1) {
      final existingItem = state[existingIndex];
      state = [
        ...state.sublist(0, existingIndex),
        existingItem.copyWith(quantity: existingItem.quantity + 1),
        ...state.sublist(existingIndex + 1),
      ];
    } else {
      state = [...state, CartItem(product: product, quantity: 1)];
    }
  }

  void removeFromCart(String productId) {
    state = state.where((item) => item.product.id != productId).toList();
  }

  void updateQuantity(String productId, int delta) {
    final index = state.indexWhere((item) => item.product.id == productId);
    if (index != -1) {
      final newItem = state[index].copyWith(
        quantity: (state[index].quantity + delta).clamp(1, 999),
      );
      state = [
        ...state.sublist(0, index),
        newItem,
        ...state.sublist(index + 1),
      ];
    }
  }

  void clearCart() {
    state = [];
  }

  double get subtotal => state.fold(0, (sum, item) => sum + (item.product.price * item.quantity));
  
  // Placeholder calculations, can be made dynamic later
  double get taxRate => 0.11; // 11%
  double get taxAmount => subtotal * taxRate;
  double get total => subtotal + taxAmount;
}

final cartProvider = StateNotifierProvider<CartNotifier, List<CartItem>>((ref) {
  return CartNotifier();
});
