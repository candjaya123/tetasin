import 'package:freezed_annotation/freezed_annotation.dart';

part 'product.freezed.dart';
part 'product.g.dart';

@freezed
class Product with _$Product {
  const factory Product({
    required String id,
    required String name,
    @JsonKey(name: 'selling_price') @Default(0.0) double price,
    @JsonKey(name: 'cost_price') @Default(0.0) double costPrice,
    String? sku,
    @JsonKey(name: 'barcode') String? barcode,
    String? category,
    @JsonKey(name: 'reorder_point') @Default(0.0) double reorderPoint,
    @Default('pcs') String unit,
    @JsonKey(name: 'image_url') String? imageUrl,
    @JsonKey(name: 'current_stock') @Default(0.0) double stock,
    String? description,
    @JsonKey(name: 'is_active') @Default(true) bool isActive,
    @JsonKey(name: 'product_recipes') List<ProductRecipe>? recipes,
    @JsonKey(name: 'product_variant_groups') List<VariantGroup>? variantGroups,
    @JsonKey(name: 'product_addon_groups') List<AddonGroup>? addonGroups,
  }) = _Product;

  factory Product.fromJson(Map<String, dynamic> json) =>
      _$ProductFromJson(json);
}

@freezed
class VariantGroup with _$VariantGroup {
  const factory VariantGroup({
    required String id,
    required String name,
    @JsonKey(name: 'is_required') @Default(true) bool isRequired,
    @JsonKey(name: 'allow_multiple') @Default(false) bool allowMultiple,
    @JsonKey(name: 'display_order') @Default(0) int displayOrder,
    @JsonKey(name: 'product_variant_options') List<VariantOption>? options,
  }) = _VariantGroup;

  factory VariantGroup.fromJson(Map<String, dynamic> json) =>
      _$VariantGroupFromJson(json);
}

@freezed
class VariantOption with _$VariantOption {
  const factory VariantOption({
    required String id,
    required String name,
    @JsonKey(name: 'price_delta') @Default(0.0) double priceDelta,
    @JsonKey(name: 'cost_delta') @Default(0.0) double costDelta,
    @JsonKey(name: 'sku_suffix') String? skuSuffix,
    @JsonKey(name: 'current_stock') @Default(0.0) double currentStock,
    @JsonKey(name: 'display_order') @Default(0) int displayOrder,
    @JsonKey(name: 'is_active') @Default(true) bool isActive,
  }) = _VariantOption;

  factory VariantOption.fromJson(Map<String, dynamic> json) =>
      _$VariantOptionFromJson(json);
}

@freezed
class AddonGroup with _$AddonGroup {
  const factory AddonGroup({
    required String id,
    required String name,
    @JsonKey(name: 'is_required') @Default(false) bool isRequired,
    @JsonKey(name: 'min_selections') @Default(0) int minSelections,
    @JsonKey(name: 'max_selections') @Default(1) int maxSelections,
    @JsonKey(name: 'is_promo_eligible') @Default(true) bool isPromoEligible,
    @JsonKey(name: 'display_order') @Default(0) int displayOrder,
    @JsonKey(name: 'product_addons') List<Addon>? addons,
  }) = _AddonGroup;

  factory AddonGroup.fromJson(Map<String, dynamic> json) =>
      _$AddonGroupFromJson(json);
}

@freezed
class Addon with _$Addon {
  const factory Addon({
    required String id,
    required String name,
    @Default(0.0) double price,
    @JsonKey(name: 'cost_price') @Default(0.0) double costPrice,
    @JsonKey(name: 'track_stock') @Default(false) bool trackStock,
    @JsonKey(name: 'current_stock') double? currentStock,
    @JsonKey(name: 'raw_material_id') String? rawMaterialId,
    @JsonKey(name: 'display_order') @Default(0) int displayOrder,
    @JsonKey(name: 'is_active') @Default(true) bool isActive,
  }) = _Addon;

  factory Addon.fromJson(Map<String, dynamic> json) => _$AddonFromJson(json);
}

@freezed
class ProductRecipe with _$ProductRecipe {
  const factory ProductRecipe({
    @JsonKey(name: 'raw_material_id') required String rawMaterialId,
    @JsonKey(name: 'quantity_needed') required double quantityNeeded,
    @JsonKey(name: 'raw_materials') RawMaterialInfo? rawMaterial,
  }) = _ProductRecipe;

  factory ProductRecipe.fromJson(Map<String, dynamic> json) =>
      _$ProductRecipeFromJson(json);
}

@freezed
class RawMaterialInfo with _$RawMaterialInfo {
  const factory RawMaterialInfo({
    required String name,
    required String unit,
    @JsonKey(name: 'unit_price') double? unitPrice,
  }) = _RawMaterialInfo;

  factory RawMaterialInfo.fromJson(Map<String, dynamic> json) =>
      _$RawMaterialInfoFromJson(json);
}
