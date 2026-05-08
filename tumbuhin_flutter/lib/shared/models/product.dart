import 'package:freezed_annotation/freezed_annotation.dart';

part 'product.freezed.dart';
part 'product.g.dart';

@freezed
class Product with _$Product {
  const factory Product({
    required String id,
    required String name,
    @JsonKey(name: 'selling_price') @Default(0.0) double price,
    @JsonKey(name: 'image_url') String? imageUrl,
    @JsonKey(name: 'category_id') String? categoryId,
    @Default(0) int stock,
    String? description,
    @JsonKey(name: 'barcode') String? skuCode,
    @JsonKey(name: 'product_recipes') List<ProductRecipe>? recipes,
  }) = _Product;

  factory Product.fromJson(Map<String, dynamic> json) => _$ProductFromJson(json);
}

@freezed
class ProductRecipe with _$ProductRecipe {
  const factory ProductRecipe({
    @JsonKey(name: 'raw_material_id') required String rawMaterialId,
    @JsonKey(name: 'quantity_needed') required double quantityNeeded,
    @JsonKey(name: 'raw_materials') RawMaterialInfo? rawMaterial,
  }) = _ProductRecipe;

  factory ProductRecipe.fromJson(Map<String, dynamic> json) => _$ProductRecipeFromJson(json);
}

@freezed
class RawMaterialInfo with _$RawMaterialInfo {
  const factory RawMaterialInfo({
    required String name,
    required String unit,
    @JsonKey(name: 'unit_price') double? unitPrice,
  }) = _RawMaterialInfo;

  factory RawMaterialInfo.fromJson(Map<String, dynamic> json) => _$RawMaterialInfoFromJson(json);
}
