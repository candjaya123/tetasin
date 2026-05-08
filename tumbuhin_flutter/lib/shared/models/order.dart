import 'package:freezed_annotation/freezed_annotation.dart';

part 'order.freezed.dart';
part 'order.g.dart';

@freezed
class Order with _$Order {
  const factory Order({
    required String id,
    @JsonKey(name: 'tenant_id') required String tenantId,
    @JsonKey(name: 'created_by') String? createdBy,
    @JsonKey(name: 'type') required String type, // 'SO' or 'PO'
    @JsonKey(name: 'status') required String status,
    @JsonKey(name: 'entity_name') String? entityName,
    @JsonKey(name: 'total_amount') required double totalAmount,
    @JsonKey(name: 'tax_amount') @Default(0.0) double taxAmount,
    @JsonKey(name: 'discount_amount') @Default(0.0) double discountAmount,
    @JsonKey(name: 'created_at') required DateTime createdAt,
    @JsonKey(name: 'order_items') List<OrderItem>? items,
  }) = _Order;

  factory Order.fromJson(Map<String, dynamic> json) => _$OrderFromJson(json);
}

@freezed
class OrderItem with _$OrderItem {
  const factory OrderItem({
    required String id,
    @JsonKey(name: 'order_id') required String orderId,
    @JsonKey(name: 'product_id') required String productId,
    required double quantity,
    @JsonKey(name: 'unit_price') required double unitPrice,
    @JsonKey(name: 'created_at') DateTime? createdAt,
    @JsonKey(name: 'products') ProductInfo? product,
  }) = _OrderItem;

  factory OrderItem.fromJson(Map<String, dynamic> json) => _$OrderItemFromJson(json);
}

@freezed
class ProductInfo with _$ProductInfo {
  const factory ProductInfo({
    required String name,
  }) = _ProductInfo;

  factory ProductInfo.fromJson(Map<String, dynamic> json) => _$ProductInfoFromJson(json);
}
