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
    @JsonKey(name: 'reference_number') String? referenceNumber,
    @JsonKey(name: 'entity_name') String? entityName,
    @JsonKey(name: 'customer_name') String? customerName,
    @JsonKey(name: 'source') String? source,
    @JsonKey(name: 'total_amount') required double totalAmount,
    @JsonKey(name: 'tax_amount') @Default(0.0) double taxAmount,
    @JsonKey(name: 'discount_amount') @Default(0.0) double discountAmount,
    @JsonKey(name: 'transaction_id') String? transactionId,
    @JsonKey(name: 'notes') String? notes,
    @JsonKey(name: 'division_notes') DivisionNotes? divisionNotes,
    @JsonKey(name: 'fulfilled_at') DateTime? fulfilledAt,
    @JsonKey(name: 'created_at') required DateTime createdAt,
    @JsonKey(name: 'updated_at') DateTime? updatedAt,
    @JsonKey(name: 'order_items') List<OrderItem>? items,
  }) = _Order;

  factory Order.fromJson(Map<String, dynamic> json) => _$OrderFromJson(json);

  static const List<String> statuses = [
    'draft',
    'confirmed',
    'processing',
    'ready',
    'fulfilled',
    'invoiced',
    'paid',
    'cancelled',
    'voided',
  ];

  /// Backend VALID_STATUS_TRANSITIONS (source of truth)
  static const Map<String, List<String>> transitions = {
    'draft': ['confirmed', 'cancelled'],
    'confirmed': ['processing', 'cancelled'],
    'processing': ['ready', 'cancelled'],
    'ready': ['fulfilled', 'cancelled'],
    'fulfilled': ['paid', 'cancelled'],
    'invoiced': ['paid', 'cancelled'],
    'paid': [],
    'cancelled': [],
    'voided': [],
  };
}

extension OrderX on Order {
  bool get canTransition => Order.transitions[status]?.isNotEmpty ?? false;

  List<String> get possibleNextStatuses => Order.transitions[status] ?? [];
}

@freezed
class DivisionNotes with _$DivisionNotes {
  const factory DivisionNotes({String? kasir, String? stok, String? dapur}) =
      _DivisionNotes;

  factory DivisionNotes.fromJson(Map<String, dynamic> json) =>
      _$DivisionNotesFromJson(json);
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

  factory OrderItem.fromJson(Map<String, dynamic> json) =>
      _$OrderItemFromJson(json);
}

@freezed
class ProductInfo with _$ProductInfo {
  const factory ProductInfo({required String name}) = _ProductInfo;

  factory ProductInfo.fromJson(Map<String, dynamic> json) =>
      _$ProductInfoFromJson(json);
}
