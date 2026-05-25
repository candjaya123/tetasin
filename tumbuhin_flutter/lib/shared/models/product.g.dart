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
      costPrice: (json['cost_price'] as num?)?.toDouble() ?? 0.0,
      sku: json['sku'] as String?,
      barcode: json['barcode'] as String?,
      category: json['category'] as String?,
      reorderPoint: (json['reorder_point'] as num?)?.toDouble() ?? 0.0,
      unit: json['unit'] as String? ?? 'pcs',
      imageUrl: json['image_url'] as String?,
      stock: (json['current_stock'] as num?)?.toDouble() ?? 0.0,
      description: json['description'] as String?,
      isActive: json['is_active'] as bool? ?? true,
      recipes: (json['product_recipes'] as List<dynamic>?)
          ?.map((e) => ProductRecipe.fromJson(e as Map<String, dynamic>))
          .toList(),
      variantGroups: (json['product_variant_groups'] as List<dynamic>?)
          ?.map((e) => VariantGroup.fromJson(e as Map<String, dynamic>))
          .toList(),
      addonGroups: (json['product_addon_groups'] as List<dynamic>?)
          ?.map((e) => AddonGroup.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$$ProductImplToJson(_$ProductImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'selling_price': instance.price,
      'cost_price': instance.costPrice,
      'sku': instance.sku,
      'barcode': instance.barcode,
      'category': instance.category,
      'reorder_point': instance.reorderPoint,
      'unit': instance.unit,
      'image_url': instance.imageUrl,
      'current_stock': instance.stock,
      'description': instance.description,
      'is_active': instance.isActive,
      'product_recipes': instance.recipes,
      'product_variant_groups': instance.variantGroups,
      'product_addon_groups': instance.addonGroups,
    };

_$VariantGroupImpl _$$VariantGroupImplFromJson(Map<String, dynamic> json) =>
    _$VariantGroupImpl(
      id: json['id'] as String,
      name: json['name'] as String,
      isRequired: json['is_required'] as bool? ?? true,
      allowMultiple: json['allow_multiple'] as bool? ?? false,
      displayOrder: (json['display_order'] as num?)?.toInt() ?? 0,
      options: (json['product_variant_options'] as List<dynamic>?)
          ?.map((e) => VariantOption.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$$VariantGroupImplToJson(_$VariantGroupImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'is_required': instance.isRequired,
      'allow_multiple': instance.allowMultiple,
      'display_order': instance.displayOrder,
      'product_variant_options': instance.options,
    };

_$VariantOptionImpl _$$VariantOptionImplFromJson(Map<String, dynamic> json) =>
    _$VariantOptionImpl(
      id: json['id'] as String,
      name: json['name'] as String,
      priceDelta: (json['price_delta'] as num?)?.toDouble() ?? 0.0,
      costDelta: (json['cost_delta'] as num?)?.toDouble() ?? 0.0,
      skuSuffix: json['sku_suffix'] as String?,
      currentStock: (json['current_stock'] as num?)?.toDouble() ?? 0.0,
      displayOrder: (json['display_order'] as num?)?.toInt() ?? 0,
      isActive: json['is_active'] as bool? ?? true,
    );

Map<String, dynamic> _$$VariantOptionImplToJson(_$VariantOptionImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'price_delta': instance.priceDelta,
      'cost_delta': instance.costDelta,
      'sku_suffix': instance.skuSuffix,
      'current_stock': instance.currentStock,
      'display_order': instance.displayOrder,
      'is_active': instance.isActive,
    };

_$AddonGroupImpl _$$AddonGroupImplFromJson(Map<String, dynamic> json) =>
    _$AddonGroupImpl(
      id: json['id'] as String,
      name: json['name'] as String,
      isRequired: json['is_required'] as bool? ?? false,
      minSelections: (json['min_selections'] as num?)?.toInt() ?? 0,
      maxSelections: (json['max_selections'] as num?)?.toInt() ?? 1,
      isPromoEligible: json['is_promo_eligible'] as bool? ?? true,
      displayOrder: (json['display_order'] as num?)?.toInt() ?? 0,
      addons: (json['product_addons'] as List<dynamic>?)
          ?.map((e) => Addon.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$$AddonGroupImplToJson(_$AddonGroupImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'is_required': instance.isRequired,
      'min_selections': instance.minSelections,
      'max_selections': instance.maxSelections,
      'is_promo_eligible': instance.isPromoEligible,
      'display_order': instance.displayOrder,
      'product_addons': instance.addons,
    };

_$AddonImpl _$$AddonImplFromJson(Map<String, dynamic> json) => _$AddonImpl(
  id: json['id'] as String,
  name: json['name'] as String,
  price: (json['price'] as num?)?.toDouble() ?? 0.0,
  costPrice: (json['cost_price'] as num?)?.toDouble() ?? 0.0,
  trackStock: json['track_stock'] as bool? ?? false,
  currentStock: (json['current_stock'] as num?)?.toDouble(),
  rawMaterialId: json['raw_material_id'] as String?,
  displayOrder: (json['display_order'] as num?)?.toInt() ?? 0,
  isActive: json['is_active'] as bool? ?? true,
);

Map<String, dynamic> _$$AddonImplToJson(_$AddonImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'price': instance.price,
      'cost_price': instance.costPrice,
      'track_stock': instance.trackStock,
      'current_stock': instance.currentStock,
      'raw_material_id': instance.rawMaterialId,
      'display_order': instance.displayOrder,
      'is_active': instance.isActive,
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
