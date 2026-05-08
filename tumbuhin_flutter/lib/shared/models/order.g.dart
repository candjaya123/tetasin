// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'order.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$OrderImpl _$$OrderImplFromJson(Map<String, dynamic> json) => _$OrderImpl(
  id: json['id'] as String,
  tenantId: json['tenant_id'] as String,
  createdBy: json['created_by'] as String?,
  type: json['type'] as String,
  status: json['status'] as String,
  entityName: json['entity_name'] as String?,
  totalAmount: (json['total_amount'] as num).toDouble(),
  taxAmount: (json['tax_amount'] as num?)?.toDouble() ?? 0.0,
  discountAmount: (json['discount_amount'] as num?)?.toDouble() ?? 0.0,
  createdAt: DateTime.parse(json['created_at'] as String),
  items: (json['order_items'] as List<dynamic>?)
      ?.map((e) => OrderItem.fromJson(e as Map<String, dynamic>))
      .toList(),
);

Map<String, dynamic> _$$OrderImplToJson(_$OrderImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'tenant_id': instance.tenantId,
      'created_by': instance.createdBy,
      'type': instance.type,
      'status': instance.status,
      'entity_name': instance.entityName,
      'total_amount': instance.totalAmount,
      'tax_amount': instance.taxAmount,
      'discount_amount': instance.discountAmount,
      'created_at': instance.createdAt.toIso8601String(),
      'order_items': instance.items,
    };

_$OrderItemImpl _$$OrderItemImplFromJson(Map<String, dynamic> json) =>
    _$OrderItemImpl(
      id: json['id'] as String,
      orderId: json['order_id'] as String,
      productId: json['product_id'] as String,
      quantity: (json['quantity'] as num).toDouble(),
      unitPrice: (json['unit_price'] as num).toDouble(),
      createdAt: json['created_at'] == null
          ? null
          : DateTime.parse(json['created_at'] as String),
      product: json['products'] == null
          ? null
          : ProductInfo.fromJson(json['products'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$$OrderItemImplToJson(_$OrderItemImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'order_id': instance.orderId,
      'product_id': instance.productId,
      'quantity': instance.quantity,
      'unit_price': instance.unitPrice,
      'created_at': instance.createdAt?.toIso8601String(),
      'products': instance.product,
    };

_$ProductInfoImpl _$$ProductInfoImplFromJson(Map<String, dynamic> json) =>
    _$ProductInfoImpl(name: json['name'] as String);

Map<String, dynamic> _$$ProductInfoImplToJson(_$ProductInfoImpl instance) =>
    <String, dynamic>{'name': instance.name};
