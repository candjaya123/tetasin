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
  referenceNumber: json['reference_number'] as String?,
  entityName: json['entity_name'] as String?,
  customerName: json['customer_name'] as String?,
  source: json['source'] as String?,
  totalAmount: (json['total_amount'] as num).toDouble(),
  taxAmount: (json['tax_amount'] as num?)?.toDouble() ?? 0.0,
  discountAmount: (json['discount_amount'] as num?)?.toDouble() ?? 0.0,
  transactionId: json['transaction_id'] as String?,
  notes: json['notes'] as String?,
  divisionNotes: json['division_notes'] == null
      ? null
      : DivisionNotes.fromJson(json['division_notes'] as Map<String, dynamic>),
  fulfilledAt: json['fulfilled_at'] == null
      ? null
      : DateTime.parse(json['fulfilled_at'] as String),
  createdAt: DateTime.parse(json['created_at'] as String),
  updatedAt: json['updated_at'] == null
      ? null
      : DateTime.parse(json['updated_at'] as String),
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
      'reference_number': instance.referenceNumber,
      'entity_name': instance.entityName,
      'customer_name': instance.customerName,
      'source': instance.source,
      'total_amount': instance.totalAmount,
      'tax_amount': instance.taxAmount,
      'discount_amount': instance.discountAmount,
      'transaction_id': instance.transactionId,
      'notes': instance.notes,
      'division_notes': instance.divisionNotes,
      'fulfilled_at': instance.fulfilledAt?.toIso8601String(),
      'created_at': instance.createdAt.toIso8601String(),
      'updated_at': instance.updatedAt?.toIso8601String(),
      'order_items': instance.items,
    };

_$DivisionNotesImpl _$$DivisionNotesImplFromJson(Map<String, dynamic> json) =>
    _$DivisionNotesImpl(
      kasir: json['kasir'] as String?,
      stok: json['stok'] as String?,
      dapur: json['dapur'] as String?,
    );

Map<String, dynamic> _$$DivisionNotesImplToJson(_$DivisionNotesImpl instance) =>
    <String, dynamic>{
      'kasir': instance.kasir,
      'stok': instance.stok,
      'dapur': instance.dapur,
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
