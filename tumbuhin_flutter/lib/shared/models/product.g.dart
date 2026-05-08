// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'product.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$ProductImpl _$$ProductImplFromJson(Map<String, dynamic> json) =>
    _$ProductImpl(
      id: json['id'] as String,
      name: json['name'] as String,
      price: (json['selling_price'] as num?)?.toDouble() ?? 0.0,
      imageUrl: json['image_url'] as String?,
      categoryId: json['category_id'] as String?,
      stock: (json['stock'] as num?)?.toInt() ?? 0,
      description: json['description'] as String?,
      skuCode: json['barcode'] as String?,
      recipes: (json['product_recipes'] as List<dynamic>?)
          ?.map((e) => ProductRecipe.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$$ProductImplToJson(_$ProductImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'selling_price': instance.price,
      'image_url': instance.imageUrl,
      'category_id': instance.categoryId,
      'stock': instance.stock,
      'description': instance.description,
      'barcode': instance.skuCode,
      'product_recipes': instance.recipes,
    };

_$ProductRecipeImpl _$$ProductRecipeImplFromJson(Map<String, dynamic> json) =>
    _$ProductRecipeImpl(
      rawMaterialId: json['raw_material_id'] as String,
      quantityNeeded: (json['quantity_needed'] as num).toDouble(),
      rawMaterial: json['raw_materials'] == null
          ? null
          : RawMaterialInfo.fromJson(
              json['raw_materials'] as Map<String, dynamic>,
            ),
    );

Map<String, dynamic> _$$ProductRecipeImplToJson(_$ProductRecipeImpl instance) =>
    <String, dynamic>{
      'raw_material_id': instance.rawMaterialId,
      'quantity_needed': instance.quantityNeeded,
      'raw_materials': instance.rawMaterial,
    };

_$RawMaterialInfoImpl _$$RawMaterialInfoImplFromJson(
  Map<String, dynamic> json,
) => _$RawMaterialInfoImpl(
  name: json['name'] as String,
  unit: json['unit'] as String,
  unitPrice: (json['unit_price'] as num?)?.toDouble(),
);

Map<String, dynamic> _$$RawMaterialInfoImplToJson(
  _$RawMaterialInfoImpl instance,
) => <String, dynamic>{
  'name': instance.name,
  'unit': instance.unit,
  'unit_price': instance.unitPrice,
};
