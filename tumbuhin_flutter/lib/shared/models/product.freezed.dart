// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'product.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

Product _$ProductFromJson(Map<String, dynamic> json) {
  return _Product.fromJson(json);
}

/// @nodoc
mixin _$Product {
  String get id => throw _privateConstructorUsedError;
  String get name => throw _privateConstructorUsedError;
  @JsonKey(name: 'selling_price')
  double get price => throw _privateConstructorUsedError;
  @JsonKey(name: 'image_url')
  String? get imageUrl => throw _privateConstructorUsedError;
  @JsonKey(name: 'category_id')
  String? get categoryId => throw _privateConstructorUsedError;
  int get stock => throw _privateConstructorUsedError;
  String? get description => throw _privateConstructorUsedError;
  @JsonKey(name: 'barcode')
  String? get skuCode => throw _privateConstructorUsedError;
  @JsonKey(name: 'product_recipes')
  List<ProductRecipe>? get recipes => throw _privateConstructorUsedError;

  /// Serializes this Product to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of Product
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $ProductCopyWith<Product> get copyWith => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $ProductCopyWith<$Res> {
  factory $ProductCopyWith(Product value, $Res Function(Product) then) =
      _$ProductCopyWithImpl<$Res, Product>;
  @useResult
  $Res call({
    String id,
    String name,
    @JsonKey(name: 'selling_price') double price,
    @JsonKey(name: 'image_url') String? imageUrl,
    @JsonKey(name: 'category_id') String? categoryId,
    int stock,
    String? description,
    @JsonKey(name: 'barcode') String? skuCode,
    @JsonKey(name: 'product_recipes') List<ProductRecipe>? recipes,
  });
}

/// @nodoc
class _$ProductCopyWithImpl<$Res, $Val extends Product>
    implements $ProductCopyWith<$Res> {
  _$ProductCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of Product
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? price = null,
    Object? imageUrl = freezed,
    Object? categoryId = freezed,
    Object? stock = null,
    Object? description = freezed,
    Object? skuCode = freezed,
    Object? recipes = freezed,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as String,
            name: null == name
                ? _value.name
                : name // ignore: cast_nullable_to_non_nullable
                      as String,
            price: null == price
                ? _value.price
                : price // ignore: cast_nullable_to_non_nullable
                      as double,
            imageUrl: freezed == imageUrl
                ? _value.imageUrl
                : imageUrl // ignore: cast_nullable_to_non_nullable
                      as String?,
            categoryId: freezed == categoryId
                ? _value.categoryId
                : categoryId // ignore: cast_nullable_to_non_nullable
                      as String?,
            stock: null == stock
                ? _value.stock
                : stock // ignore: cast_nullable_to_non_nullable
                      as int,
            description: freezed == description
                ? _value.description
                : description // ignore: cast_nullable_to_non_nullable
                      as String?,
            skuCode: freezed == skuCode
                ? _value.skuCode
                : skuCode // ignore: cast_nullable_to_non_nullable
                      as String?,
            recipes: freezed == recipes
                ? _value.recipes
                : recipes // ignore: cast_nullable_to_non_nullable
                      as List<ProductRecipe>?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$ProductImplCopyWith<$Res> implements $ProductCopyWith<$Res> {
  factory _$$ProductImplCopyWith(
    _$ProductImpl value,
    $Res Function(_$ProductImpl) then,
  ) = __$$ProductImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String id,
    String name,
    @JsonKey(name: 'selling_price') double price,
    @JsonKey(name: 'image_url') String? imageUrl,
    @JsonKey(name: 'category_id') String? categoryId,
    int stock,
    String? description,
    @JsonKey(name: 'barcode') String? skuCode,
    @JsonKey(name: 'product_recipes') List<ProductRecipe>? recipes,
  });
}

/// @nodoc
class __$$ProductImplCopyWithImpl<$Res>
    extends _$ProductCopyWithImpl<$Res, _$ProductImpl>
    implements _$$ProductImplCopyWith<$Res> {
  __$$ProductImplCopyWithImpl(
    _$ProductImpl _value,
    $Res Function(_$ProductImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of Product
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? price = null,
    Object? imageUrl = freezed,
    Object? categoryId = freezed,
    Object? stock = null,
    Object? description = freezed,
    Object? skuCode = freezed,
    Object? recipes = freezed,
  }) {
    return _then(
      _$ProductImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as String,
        name: null == name
            ? _value.name
            : name // ignore: cast_nullable_to_non_nullable
                  as String,
        price: null == price
            ? _value.price
            : price // ignore: cast_nullable_to_non_nullable
                  as double,
        imageUrl: freezed == imageUrl
            ? _value.imageUrl
            : imageUrl // ignore: cast_nullable_to_non_nullable
                  as String?,
        categoryId: freezed == categoryId
            ? _value.categoryId
            : categoryId // ignore: cast_nullable_to_non_nullable
                  as String?,
        stock: null == stock
            ? _value.stock
            : stock // ignore: cast_nullable_to_non_nullable
                  as int,
        description: freezed == description
            ? _value.description
            : description // ignore: cast_nullable_to_non_nullable
                  as String?,
        skuCode: freezed == skuCode
            ? _value.skuCode
            : skuCode // ignore: cast_nullable_to_non_nullable
                  as String?,
        recipes: freezed == recipes
            ? _value._recipes
            : recipes // ignore: cast_nullable_to_non_nullable
                  as List<ProductRecipe>?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$ProductImpl implements _Product {
  const _$ProductImpl({
    required this.id,
    required this.name,
    @JsonKey(name: 'selling_price') this.price = 0.0,
    @JsonKey(name: 'image_url') this.imageUrl,
    @JsonKey(name: 'category_id') this.categoryId,
    this.stock = 0,
    this.description,
    @JsonKey(name: 'barcode') this.skuCode,
    @JsonKey(name: 'product_recipes') final List<ProductRecipe>? recipes,
  }) : _recipes = recipes;

  factory _$ProductImpl.fromJson(Map<String, dynamic> json) =>
      _$$ProductImplFromJson(json);

  @override
  final String id;
  @override
  final String name;
  @override
  @JsonKey(name: 'selling_price')
  final double price;
  @override
  @JsonKey(name: 'image_url')
  final String? imageUrl;
  @override
  @JsonKey(name: 'category_id')
  final String? categoryId;
  @override
  @JsonKey()
  final int stock;
  @override
  final String? description;
  @override
  @JsonKey(name: 'barcode')
  final String? skuCode;
  final List<ProductRecipe>? _recipes;
  @override
  @JsonKey(name: 'product_recipes')
  List<ProductRecipe>? get recipes {
    final value = _recipes;
    if (value == null) return null;
    if (_recipes is EqualUnmodifiableListView) return _recipes;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(value);
  }

  @override
  String toString() {
    return 'Product(id: $id, name: $name, price: $price, imageUrl: $imageUrl, categoryId: $categoryId, stock: $stock, description: $description, skuCode: $skuCode, recipes: $recipes)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$ProductImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.price, price) || other.price == price) &&
            (identical(other.imageUrl, imageUrl) ||
                other.imageUrl == imageUrl) &&
            (identical(other.categoryId, categoryId) ||
                other.categoryId == categoryId) &&
            (identical(other.stock, stock) || other.stock == stock) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.skuCode, skuCode) || other.skuCode == skuCode) &&
            const DeepCollectionEquality().equals(other._recipes, _recipes));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    name,
    price,
    imageUrl,
    categoryId,
    stock,
    description,
    skuCode,
    const DeepCollectionEquality().hash(_recipes),
  );

  /// Create a copy of Product
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$ProductImplCopyWith<_$ProductImpl> get copyWith =>
      __$$ProductImplCopyWithImpl<_$ProductImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$ProductImplToJson(this);
  }
}

abstract class _Product implements Product {
  const factory _Product({
    required final String id,
    required final String name,
    @JsonKey(name: 'selling_price') final double price,
    @JsonKey(name: 'image_url') final String? imageUrl,
    @JsonKey(name: 'category_id') final String? categoryId,
    final int stock,
    final String? description,
    @JsonKey(name: 'barcode') final String? skuCode,
    @JsonKey(name: 'product_recipes') final List<ProductRecipe>? recipes,
  }) = _$ProductImpl;

  factory _Product.fromJson(Map<String, dynamic> json) = _$ProductImpl.fromJson;

  @override
  String get id;
  @override
  String get name;
  @override
  @JsonKey(name: 'selling_price')
  double get price;
  @override
  @JsonKey(name: 'image_url')
  String? get imageUrl;
  @override
  @JsonKey(name: 'category_id')
  String? get categoryId;
  @override
  int get stock;
  @override
  String? get description;
  @override
  @JsonKey(name: 'barcode')
  String? get skuCode;
  @override
  @JsonKey(name: 'product_recipes')
  List<ProductRecipe>? get recipes;

  /// Create a copy of Product
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$ProductImplCopyWith<_$ProductImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

ProductRecipe _$ProductRecipeFromJson(Map<String, dynamic> json) {
  return _ProductRecipe.fromJson(json);
}

/// @nodoc
mixin _$ProductRecipe {
  @JsonKey(name: 'raw_material_id')
  String get rawMaterialId => throw _privateConstructorUsedError;
  @JsonKey(name: 'quantity_needed')
  double get quantityNeeded => throw _privateConstructorUsedError;
  @JsonKey(name: 'raw_materials')
  RawMaterialInfo? get rawMaterial => throw _privateConstructorUsedError;

  /// Serializes this ProductRecipe to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of ProductRecipe
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $ProductRecipeCopyWith<ProductRecipe> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $ProductRecipeCopyWith<$Res> {
  factory $ProductRecipeCopyWith(
    ProductRecipe value,
    $Res Function(ProductRecipe) then,
  ) = _$ProductRecipeCopyWithImpl<$Res, ProductRecipe>;
  @useResult
  $Res call({
    @JsonKey(name: 'raw_material_id') String rawMaterialId,
    @JsonKey(name: 'quantity_needed') double quantityNeeded,
    @JsonKey(name: 'raw_materials') RawMaterialInfo? rawMaterial,
  });

  $RawMaterialInfoCopyWith<$Res>? get rawMaterial;
}

/// @nodoc
class _$ProductRecipeCopyWithImpl<$Res, $Val extends ProductRecipe>
    implements $ProductRecipeCopyWith<$Res> {
  _$ProductRecipeCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of ProductRecipe
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? rawMaterialId = null,
    Object? quantityNeeded = null,
    Object? rawMaterial = freezed,
  }) {
    return _then(
      _value.copyWith(
            rawMaterialId: null == rawMaterialId
                ? _value.rawMaterialId
                : rawMaterialId // ignore: cast_nullable_to_non_nullable
                      as String,
            quantityNeeded: null == quantityNeeded
                ? _value.quantityNeeded
                : quantityNeeded // ignore: cast_nullable_to_non_nullable
                      as double,
            rawMaterial: freezed == rawMaterial
                ? _value.rawMaterial
                : rawMaterial // ignore: cast_nullable_to_non_nullable
                      as RawMaterialInfo?,
          )
          as $Val,
    );
  }

  /// Create a copy of ProductRecipe
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $RawMaterialInfoCopyWith<$Res>? get rawMaterial {
    if (_value.rawMaterial == null) {
      return null;
    }

    return $RawMaterialInfoCopyWith<$Res>(_value.rawMaterial!, (value) {
      return _then(_value.copyWith(rawMaterial: value) as $Val);
    });
  }
}

/// @nodoc
abstract class _$$ProductRecipeImplCopyWith<$Res>
    implements $ProductRecipeCopyWith<$Res> {
  factory _$$ProductRecipeImplCopyWith(
    _$ProductRecipeImpl value,
    $Res Function(_$ProductRecipeImpl) then,
  ) = __$$ProductRecipeImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    @JsonKey(name: 'raw_material_id') String rawMaterialId,
    @JsonKey(name: 'quantity_needed') double quantityNeeded,
    @JsonKey(name: 'raw_materials') RawMaterialInfo? rawMaterial,
  });

  @override
  $RawMaterialInfoCopyWith<$Res>? get rawMaterial;
}

/// @nodoc
class __$$ProductRecipeImplCopyWithImpl<$Res>
    extends _$ProductRecipeCopyWithImpl<$Res, _$ProductRecipeImpl>
    implements _$$ProductRecipeImplCopyWith<$Res> {
  __$$ProductRecipeImplCopyWithImpl(
    _$ProductRecipeImpl _value,
    $Res Function(_$ProductRecipeImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of ProductRecipe
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? rawMaterialId = null,
    Object? quantityNeeded = null,
    Object? rawMaterial = freezed,
  }) {
    return _then(
      _$ProductRecipeImpl(
        rawMaterialId: null == rawMaterialId
            ? _value.rawMaterialId
            : rawMaterialId // ignore: cast_nullable_to_non_nullable
                  as String,
        quantityNeeded: null == quantityNeeded
            ? _value.quantityNeeded
            : quantityNeeded // ignore: cast_nullable_to_non_nullable
                  as double,
        rawMaterial: freezed == rawMaterial
            ? _value.rawMaterial
            : rawMaterial // ignore: cast_nullable_to_non_nullable
                  as RawMaterialInfo?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$ProductRecipeImpl implements _ProductRecipe {
  const _$ProductRecipeImpl({
    @JsonKey(name: 'raw_material_id') required this.rawMaterialId,
    @JsonKey(name: 'quantity_needed') required this.quantityNeeded,
    @JsonKey(name: 'raw_materials') this.rawMaterial,
  });

  factory _$ProductRecipeImpl.fromJson(Map<String, dynamic> json) =>
      _$$ProductRecipeImplFromJson(json);

  @override
  @JsonKey(name: 'raw_material_id')
  final String rawMaterialId;
  @override
  @JsonKey(name: 'quantity_needed')
  final double quantityNeeded;
  @override
  @JsonKey(name: 'raw_materials')
  final RawMaterialInfo? rawMaterial;

  @override
  String toString() {
    return 'ProductRecipe(rawMaterialId: $rawMaterialId, quantityNeeded: $quantityNeeded, rawMaterial: $rawMaterial)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$ProductRecipeImpl &&
            (identical(other.rawMaterialId, rawMaterialId) ||
                other.rawMaterialId == rawMaterialId) &&
            (identical(other.quantityNeeded, quantityNeeded) ||
                other.quantityNeeded == quantityNeeded) &&
            (identical(other.rawMaterial, rawMaterial) ||
                other.rawMaterial == rawMaterial));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode =>
      Object.hash(runtimeType, rawMaterialId, quantityNeeded, rawMaterial);

  /// Create a copy of ProductRecipe
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$ProductRecipeImplCopyWith<_$ProductRecipeImpl> get copyWith =>
      __$$ProductRecipeImplCopyWithImpl<_$ProductRecipeImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$ProductRecipeImplToJson(this);
  }
}

abstract class _ProductRecipe implements ProductRecipe {
  const factory _ProductRecipe({
    @JsonKey(name: 'raw_material_id') required final String rawMaterialId,
    @JsonKey(name: 'quantity_needed') required final double quantityNeeded,
    @JsonKey(name: 'raw_materials') final RawMaterialInfo? rawMaterial,
  }) = _$ProductRecipeImpl;

  factory _ProductRecipe.fromJson(Map<String, dynamic> json) =
      _$ProductRecipeImpl.fromJson;

  @override
  @JsonKey(name: 'raw_material_id')
  String get rawMaterialId;
  @override
  @JsonKey(name: 'quantity_needed')
  double get quantityNeeded;
  @override
  @JsonKey(name: 'raw_materials')
  RawMaterialInfo? get rawMaterial;

  /// Create a copy of ProductRecipe
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$ProductRecipeImplCopyWith<_$ProductRecipeImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

RawMaterialInfo _$RawMaterialInfoFromJson(Map<String, dynamic> json) {
  return _RawMaterialInfo.fromJson(json);
}

/// @nodoc
mixin _$RawMaterialInfo {
  String get name => throw _privateConstructorUsedError;
  String get unit => throw _privateConstructorUsedError;
  @JsonKey(name: 'unit_price')
  double? get unitPrice => throw _privateConstructorUsedError;

  /// Serializes this RawMaterialInfo to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of RawMaterialInfo
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $RawMaterialInfoCopyWith<RawMaterialInfo> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $RawMaterialInfoCopyWith<$Res> {
  factory $RawMaterialInfoCopyWith(
    RawMaterialInfo value,
    $Res Function(RawMaterialInfo) then,
  ) = _$RawMaterialInfoCopyWithImpl<$Res, RawMaterialInfo>;
  @useResult
  $Res call({
    String name,
    String unit,
    @JsonKey(name: 'unit_price') double? unitPrice,
  });
}

/// @nodoc
class _$RawMaterialInfoCopyWithImpl<$Res, $Val extends RawMaterialInfo>
    implements $RawMaterialInfoCopyWith<$Res> {
  _$RawMaterialInfoCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of RawMaterialInfo
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? name = null,
    Object? unit = null,
    Object? unitPrice = freezed,
  }) {
    return _then(
      _value.copyWith(
            name: null == name
                ? _value.name
                : name // ignore: cast_nullable_to_non_nullable
                      as String,
            unit: null == unit
                ? _value.unit
                : unit // ignore: cast_nullable_to_non_nullable
                      as String,
            unitPrice: freezed == unitPrice
                ? _value.unitPrice
                : unitPrice // ignore: cast_nullable_to_non_nullable
                      as double?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$RawMaterialInfoImplCopyWith<$Res>
    implements $RawMaterialInfoCopyWith<$Res> {
  factory _$$RawMaterialInfoImplCopyWith(
    _$RawMaterialInfoImpl value,
    $Res Function(_$RawMaterialInfoImpl) then,
  ) = __$$RawMaterialInfoImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String name,
    String unit,
    @JsonKey(name: 'unit_price') double? unitPrice,
  });
}

/// @nodoc
class __$$RawMaterialInfoImplCopyWithImpl<$Res>
    extends _$RawMaterialInfoCopyWithImpl<$Res, _$RawMaterialInfoImpl>
    implements _$$RawMaterialInfoImplCopyWith<$Res> {
  __$$RawMaterialInfoImplCopyWithImpl(
    _$RawMaterialInfoImpl _value,
    $Res Function(_$RawMaterialInfoImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of RawMaterialInfo
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? name = null,
    Object? unit = null,
    Object? unitPrice = freezed,
  }) {
    return _then(
      _$RawMaterialInfoImpl(
        name: null == name
            ? _value.name
            : name // ignore: cast_nullable_to_non_nullable
                  as String,
        unit: null == unit
            ? _value.unit
            : unit // ignore: cast_nullable_to_non_nullable
                  as String,
        unitPrice: freezed == unitPrice
            ? _value.unitPrice
            : unitPrice // ignore: cast_nullable_to_non_nullable
                  as double?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$RawMaterialInfoImpl implements _RawMaterialInfo {
  const _$RawMaterialInfoImpl({
    required this.name,
    required this.unit,
    @JsonKey(name: 'unit_price') this.unitPrice,
  });

  factory _$RawMaterialInfoImpl.fromJson(Map<String, dynamic> json) =>
      _$$RawMaterialInfoImplFromJson(json);

  @override
  final String name;
  @override
  final String unit;
  @override
  @JsonKey(name: 'unit_price')
  final double? unitPrice;

  @override
  String toString() {
    return 'RawMaterialInfo(name: $name, unit: $unit, unitPrice: $unitPrice)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$RawMaterialInfoImpl &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.unit, unit) || other.unit == unit) &&
            (identical(other.unitPrice, unitPrice) ||
                other.unitPrice == unitPrice));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, name, unit, unitPrice);

  /// Create a copy of RawMaterialInfo
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$RawMaterialInfoImplCopyWith<_$RawMaterialInfoImpl> get copyWith =>
      __$$RawMaterialInfoImplCopyWithImpl<_$RawMaterialInfoImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$RawMaterialInfoImplToJson(this);
  }
}

abstract class _RawMaterialInfo implements RawMaterialInfo {
  const factory _RawMaterialInfo({
    required final String name,
    required final String unit,
    @JsonKey(name: 'unit_price') final double? unitPrice,
  }) = _$RawMaterialInfoImpl;

  factory _RawMaterialInfo.fromJson(Map<String, dynamic> json) =
      _$RawMaterialInfoImpl.fromJson;

  @override
  String get name;
  @override
  String get unit;
  @override
  @JsonKey(name: 'unit_price')
  double? get unitPrice;

  /// Create a copy of RawMaterialInfo
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$RawMaterialInfoImplCopyWith<_$RawMaterialInfoImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
