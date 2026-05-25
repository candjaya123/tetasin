// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'cart_item.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$CartItemImpl _$$CartItemImplFromJson(Map<String, dynamic> json) =>
    _$CartItemImpl(
      product: Product.fromJson(json['product'] as Map<String, dynamic>),
      quantity: (json['quantity'] as num?)?.toInt() ?? 1,
      selectedVariants:
          (json['selectedVariants'] as List<dynamic>?)
              ?.map((e) => VariantOption.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
      selectedAddons:
          (json['selectedAddons'] as List<dynamic>?)
              ?.map((e) => Addon.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
      specialInstructions: json['specialInstructions'] as String?,
    );

Map<String, dynamic> _$$CartItemImplToJson(_$CartItemImpl instance) =>
    <String, dynamic>{
      'product': instance.product,
      'quantity': instance.quantity,
      'selectedVariants': instance.selectedVariants,
      'selectedAddons': instance.selectedAddons,
      'specialInstructions': instance.specialInstructions,
    };
