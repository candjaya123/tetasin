import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../shared/models/product.dart';
import '../../../shared/models/cart_item.dart';
import '../../../shared/repositories/repositories_provider.dart';

enum PosViewMode { grid, chat }

final posViewModeProvider = StateProvider<PosViewMode>(
  (ref) => PosViewMode.grid,
);

final posSearchQueryProvider = StateProvider<String>((ref) => '');

final posHeaderExpandedProvider = StateProvider<bool>((ref) => true);

final posSearchExpandedProvider = StateProvider<bool>((ref) => true);

final productsProvider = FutureProvider<List<Product>>((ref) async {
  final repository = ref.watch(posRepositoryProvider);
  final search = ref.watch(posSearchQueryProvider);
  return repository.getProducts(search: search.isEmpty ? null : search);
});

class CartNotifier extends StateNotifier<List<CartItem>> {
  CartNotifier() : super([]);

  void addToCart(CartItem cartItem) {
    final existingIndex = state.indexWhere(
      (item) => item.compositeKey == cartItem.compositeKey,
    );
    if (existingIndex != -1) {
      final existingItem = state[existingIndex];
      state = [
        ...state.sublist(0, existingIndex),
        existingItem.copyWith(
          quantity: existingItem.quantity + cartItem.quantity,
        ),
        ...state.sublist(existingIndex + 1),
      ];
    } else {
      state = [...state, cartItem];
    }
  }

  void removeFromCart(String compositeKey) {
    state = state.where((item) => item.compositeKey != compositeKey).toList();
  }

  void updateQuantity(String compositeKey, int delta) {
    final index = state.indexWhere((item) => item.compositeKey == compositeKey);
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

  double get subtotal => state.fold(0, (sum, item) => sum + item.lineTotal);

  double get taxRate => 0.11;
  double get taxAmount => subtotal * taxRate;
  double get total => subtotal + taxAmount;
}

final cartProvider = StateNotifierProvider<CartNotifier, List<CartItem>>((ref) {
  return CartNotifier();
});
