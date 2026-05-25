import 'package:freezed_annotation/freezed_annotation.dart';
import 'product.dart';

part 'cart_item.freezed.dart';
part 'cart_item.g.dart';

@freezed
class CartItem with _$CartItem {
  const CartItem._();

  const factory CartItem({
    required Product product,
    @Default(1) int quantity,
    @Default([]) List<VariantOption> selectedVariants,
    @Default([]) List<Addon> selectedAddons,
    String? specialInstructions,
  }) = _CartItem;

  factory CartItem.fromJson(Map<String, dynamic> json) =>
      _$CartItemFromJson(json);

  String get compositeKey {
    final variantIds = selectedVariants.map((v) => v.id).toList()..sort();
    final addonIds = selectedAddons.map((a) => a.id).toList()..sort();
    return '${product.id}_${variantIds.join(',')}_${addonIds.join(',')}_${specialInstructions ?? ''}';
  }

  double get unitPrice {
    double price = product.price;
    for (final v in selectedVariants) {
      price += v.priceDelta;
    }
    for (final a in selectedAddons) {
      price += a.price;
    }
    return price;
  }

  double get lineTotal => unitPrice * quantity;
}
