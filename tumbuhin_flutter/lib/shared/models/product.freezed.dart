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
  @JsonKey(name: 'cost_price')
  double get costPrice => throw _privateConstructorUsedError;
  String? get sku => throw _privateConstructorUsedError;
  @JsonKey(name: 'barcode')
  String? get barcode => throw _privateConstructorUsedError;
  String? get category => throw _privateConstructorUsedError;
  @JsonKey(name: 'reorder_point')
  double get reorderPoint => throw _privateConstructorUsedError;
  String get unit => throw _privateConstructorUsedError;
  @JsonKey(name: 'image_url')
  String? get imageUrl => throw _privateConstructorUsedError;
  @JsonKey(name: 'current_stock')
  double get stock => throw _privateConstructorUsedError;
  String? get description => throw _privateConstructorUsedError;
  @JsonKey(name: 'is_active')
  bool get isActive => throw _privateConstructorUsedError;
  @JsonKey(name: 'product_recipes')
  List<ProductRecipe>? get recipes => throw _privateConstructorUsedError;
  @JsonKey(name: 'product_variant_groups')
  List<VariantGroup>? get variantGroups => throw _privateConstructorUsedError;
  @JsonKey(name: 'product_addon_groups')
  List<AddonGroup>? get addonGroups => throw _privateConstructorUsedError;

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
    @JsonKey(name: 'cost_price') double costPrice,
    String? sku,
    @JsonKey(name: 'barcode') String? barcode,
    String? category,
    @JsonKey(name: 'reorder_point') double reorderPoint,
    String unit,
    @JsonKey(name: 'image_url') String? imageUrl,
    @JsonKey(name: 'current_stock') double stock,
    String? description,
    @JsonKey(name: 'is_active') bool isActive,
    @JsonKey(name: 'product_recipes') List<ProductRecipe>? recipes,
    @JsonKey(name: 'product_variant_groups') List<VariantGroup>? variantGroups,
    @JsonKey(name: 'product_addon_groups') List<AddonGroup>? addonGroups,
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
    Object? costPrice = null,
    Object? sku = freezed,
    Object? barcode = freezed,
    Object? category = freezed,
    Object? reorderPoint = null,
    Object? unit = null,
    Object? imageUrl = freezed,
    Object? stock = null,
    Object? description = freezed,
    Object? isActive = null,
    Object? recipes = freezed,
    Object? variantGroups = freezed,
    Object? addonGroups = freezed,
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
            costPrice: null == costPrice
                ? _value.costPrice
                : costPrice // ignore: cast_nullable_to_non_nullable
                      as double,
            sku: freezed == sku
                ? _value.sku
                : sku // ignore: cast_nullable_to_non_nullable
                      as String?,
            barcode: freezed == barcode
                ? _value.barcode
                : barcode // ignore: cast_nullable_to_non_nullable
                      as String?,
            category: freezed == category
                ? _value.category
                : category // ignore: cast_nullable_to_non_nullable
                      as String?,
            reorderPoint: null == reorderPoint
                ? _value.reorderPoint
                : reorderPoint // ignore: cast_nullable_to_non_nullable
                      as double,
            unit: null == unit
                ? _value.unit
                : unit // ignore: cast_nullable_to_non_nullable
                      as String,
            imageUrl: freezed == imageUrl
                ? _value.imageUrl
                : imageUrl // ignore: cast_nullable_to_non_nullable
                      as String?,
            stock: null == stock
                ? _value.stock
                : stock // ignore: cast_nullable_to_non_nullable
                      as double,
            description: freezed == description
                ? _value.description
                : description // ignore: cast_nullable_to_non_nullable
                      as String?,
            isActive: null == isActive
                ? _value.isActive
                : isActive // ignore: cast_nullable_to_non_nullable
                      as bool,
            recipes: freezed == recipes
                ? _value.recipes
                : recipes // ignore: cast_nullable_to_non_nullable
                      as List<ProductRecipe>?,
            variantGroups: freezed == variantGroups
                ? _value.variantGroups
                : variantGroups // ignore: cast_nullable_to_non_nullable
                      as List<VariantGroup>?,
            addonGroups: freezed == addonGroups
                ? _value.addonGroups
                : addonGroups // ignore: cast_nullable_to_non_nullable
                      as List<AddonGroup>?,
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
    @JsonKey(name: 'cost_price') double costPrice,
    String? sku,
    @JsonKey(name: 'barcode') String? barcode,
    String? category,
    @JsonKey(name: 'reorder_point') double reorderPoint,
    String unit,
    @JsonKey(name: 'image_url') String? imageUrl,
    @JsonKey(name: 'current_stock') double stock,
    String? description,
    @JsonKey(name: 'is_active') bool isActive,
    @JsonKey(name: 'product_recipes') List<ProductRecipe>? recipes,
    @JsonKey(name: 'product_variant_groups') List<VariantGroup>? variantGroups,
    @JsonKey(name: 'product_addon_groups') List<AddonGroup>? addonGroups,
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
    Object? costPrice = null,
    Object? sku = freezed,
    Object? barcode = freezed,
    Object? category = freezed,
    Object? reorderPoint = null,
    Object? unit = null,
    Object? imageUrl = freezed,
    Object? stock = null,
    Object? description = freezed,
    Object? isActive = null,
    Object? recipes = freezed,
    Object? variantGroups = freezed,
    Object? addonGroups = freezed,
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
        costPrice: null == costPrice
            ? _value.costPrice
            : costPrice // ignore: cast_nullable_to_non_nullable
                  as double,
        sku: freezed == sku
            ? _value.sku
            : sku // ignore: cast_nullable_to_non_nullable
                  as String?,
        barcode: freezed == barcode
            ? _value.barcode
            : barcode // ignore: cast_nullable_to_non_nullable
                  as String?,
        category: freezed == category
            ? _value.category
            : category // ignore: cast_nullable_to_non_nullable
                  as String?,
        reorderPoint: null == reorderPoint
            ? _value.reorderPoint
            : reorderPoint // ignore: cast_nullable_to_non_nullable
                  as double,
        unit: null == unit
            ? _value.unit
            : unit // ignore: cast_nullable_to_non_nullable
                  as String,
        imageUrl: freezed == imageUrl
            ? _value.imageUrl
            : imageUrl // ignore: cast_nullable_to_non_nullable
                  as String?,
        stock: null == stock
            ? _value.stock
            : stock // ignore: cast_nullable_to_non_nullable
                  as double,
        description: freezed == description
            ? _value.description
            : description // ignore: cast_nullable_to_non_nullable
                  as String?,
        isActive: null == isActive
            ? _value.isActive
            : isActive // ignore: cast_nullable_to_non_nullable
                  as bool,
        recipes: freezed == recipes
            ? _value._recipes
            : recipes // ignore: cast_nullable_to_non_nullable
                  as List<ProductRecipe>?,
        variantGroups: freezed == variantGroups
            ? _value._variantGroups
            : variantGroups // ignore: cast_nullable_to_non_nullable
                  as List<VariantGroup>?,
        addonGroups: freezed == addonGroups
            ? _value._addonGroups
            : addonGroups // ignore: cast_nullable_to_non_nullable
                  as List<AddonGroup>?,
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
    @JsonKey(name: 'cost_price') this.costPrice = 0.0,
    this.sku,
    @JsonKey(name: 'barcode') this.barcode,
    this.category,
    @JsonKey(name: 'reorder_point') this.reorderPoint = 0.0,
    this.unit = 'pcs',
    @JsonKey(name: 'image_url') this.imageUrl,
    @JsonKey(name: 'current_stock') this.stock = 0.0,
    this.description,
    @JsonKey(name: 'is_active') this.isActive = true,
    @JsonKey(name: 'product_recipes') final List<ProductRecipe>? recipes,
    @JsonKey(name: 'product_variant_groups')
    final List<VariantGroup>? variantGroups,
    @JsonKey(name: 'product_addon_groups') final List<AddonGroup>? addonGroups,
  }) : _recipes = recipes,
       _variantGroups = variantGroups,
       _addonGroups = addonGroups;

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
  @JsonKey(name: 'cost_price')
  final double costPrice;
  @override
  final String? sku;
  @override
  @JsonKey(name: 'barcode')
  final String? barcode;
  @override
  final String? category;
  @override
  @JsonKey(name: 'reorder_point')
  final double reorderPoint;
  @override
  @JsonKey()
  final String unit;
  @override
  @JsonKey(name: 'image_url')
  final String? imageUrl;
  @override
  @JsonKey(name: 'current_stock')
  final double stock;
  @override
  final String? description;
  @override
  @JsonKey(name: 'is_active')
  final bool isActive;
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

  final List<VariantGroup>? _variantGroups;
  @override
  @JsonKey(name: 'product_variant_groups')
  List<VariantGroup>? get variantGroups {
    final value = _variantGroups;
    if (value == null) return null;
    if (_variantGroups is EqualUnmodifiableListView) return _variantGroups;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(value);
  }

  final List<AddonGroup>? _addonGroups;
  @override
  @JsonKey(name: 'product_addon_groups')
  List<AddonGroup>? get addonGroups {
    final value = _addonGroups;
    if (value == null) return null;
    if (_addonGroups is EqualUnmodifiableListView) return _addonGroups;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(value);
  }

  @override
  String toString() {
    return 'Product(id: $id, name: $name, price: $price, costPrice: $costPrice, sku: $sku, barcode: $barcode, category: $category, reorderPoint: $reorderPoint, unit: $unit, imageUrl: $imageUrl, stock: $stock, description: $description, isActive: $isActive, recipes: $recipes, variantGroups: $variantGroups, addonGroups: $addonGroups)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$ProductImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.price, price) || other.price == price) &&
            (identical(other.costPrice, costPrice) ||
                other.costPrice == costPrice) &&
            (identical(other.sku, sku) || other.sku == sku) &&
            (identical(other.barcode, barcode) || other.barcode == barcode) &&
            (identical(other.category, category) ||
                other.category == category) &&
            (identical(other.reorderPoint, reorderPoint) ||
                other.reorderPoint == reorderPoint) &&
            (identical(other.unit, unit) || other.unit == unit) &&
            (identical(other.imageUrl, imageUrl) ||
                other.imageUrl == imageUrl) &&
            (identical(other.stock, stock) || other.stock == stock) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.isActive, isActive) ||
                other.isActive == isActive) &&
            const DeepCollectionEquality().equals(other._recipes, _recipes) &&
            const DeepCollectionEquality().equals(
              other._variantGroups,
              _variantGroups,
            ) &&
            const DeepCollectionEquality().equals(
              other._addonGroups,
              _addonGroups,
            ));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    name,
    price,
    costPrice,
    sku,
    barcode,
    category,
    reorderPoint,
    unit,
    imageUrl,
    stock,
    description,
    isActive,
    const DeepCollectionEquality().hash(_recipes),
    const DeepCollectionEquality().hash(_variantGroups),
    const DeepCollectionEquality().hash(_addonGroups),
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
    @JsonKey(name: 'cost_price') final double costPrice,
    final String? sku,
    @JsonKey(name: 'barcode') final String? barcode,
    final String? category,
    @JsonKey(name: 'reorder_point') final double reorderPoint,
    final String unit,
    @JsonKey(name: 'image_url') final String? imageUrl,
    @JsonKey(name: 'current_stock') final double stock,
    final String? description,
    @JsonKey(name: 'is_active') final bool isActive,
    @JsonKey(name: 'product_recipes') final List<ProductRecipe>? recipes,
    @JsonKey(name: 'product_variant_groups')
    final List<VariantGroup>? variantGroups,
    @JsonKey(name: 'product_addon_groups') final List<AddonGroup>? addonGroups,
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
  @JsonKey(name: 'cost_price')
  double get costPrice;
  @override
  String? get sku;
  @override
  @JsonKey(name: 'barcode')
  String? get barcode;
  @override
  String? get category;
  @override
  @JsonKey(name: 'reorder_point')
  double get reorderPoint;
  @override
  String get unit;
  @override
  @JsonKey(name: 'image_url')
  String? get imageUrl;
  @override
  @JsonKey(name: 'current_stock')
  double get stock;
  @override
  String? get description;
  @override
  @JsonKey(name: 'is_active')
  bool get isActive;
  @override
  @JsonKey(name: 'product_recipes')
  List<ProductRecipe>? get recipes;
  @override
  @JsonKey(name: 'product_variant_groups')
  List<VariantGroup>? get variantGroups;
  @override
  @JsonKey(name: 'product_addon_groups')
  List<AddonGroup>? get addonGroups;

  /// Create a copy of Product
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$ProductImplCopyWith<_$ProductImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

VariantGroup _$VariantGroupFromJson(Map<String, dynamic> json) {
  return _VariantGroup.fromJson(json);
}

/// @nodoc
mixin _$VariantGroup {
  String get id => throw _privateConstructorUsedError;
  String get name => throw _privateConstructorUsedError;
  @JsonKey(name: 'is_required')
  bool get isRequired => throw _privateConstructorUsedError;
  @JsonKey(name: 'allow_multiple')
  bool get allowMultiple => throw _privateConstructorUsedError;
  @JsonKey(name: 'display_order')
  int get displayOrder => throw _privateConstructorUsedError;
  @JsonKey(name: 'product_variant_options')
  List<VariantOption>? get options => throw _privateConstructorUsedError;

  /// Serializes this VariantGroup to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of VariantGroup
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $VariantGroupCopyWith<VariantGroup> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $VariantGroupCopyWith<$Res> {
  factory $VariantGroupCopyWith(
    VariantGroup value,
    $Res Function(VariantGroup) then,
  ) = _$VariantGroupCopyWithImpl<$Res, VariantGroup>;
  @useResult
  $Res call({
    String id,
    String name,
    @JsonKey(name: 'is_required') bool isRequired,
    @JsonKey(name: 'allow_multiple') bool allowMultiple,
    @JsonKey(name: 'display_order') int displayOrder,
    @JsonKey(name: 'product_variant_options') List<VariantOption>? options,
  });
}

/// @nodoc
class _$VariantGroupCopyWithImpl<$Res, $Val extends VariantGroup>
    implements $VariantGroupCopyWith<$Res> {
  _$VariantGroupCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of VariantGroup
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? isRequired = null,
    Object? allowMultiple = null,
    Object? displayOrder = null,
    Object? options = freezed,
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
            isRequired: null == isRequired
                ? _value.isRequired
                : isRequired // ignore: cast_nullable_to_non_nullable
                      as bool,
            allowMultiple: null == allowMultiple
                ? _value.allowMultiple
                : allowMultiple // ignore: cast_nullable_to_non_nullable
                      as bool,
            displayOrder: null == displayOrder
                ? _value.displayOrder
                : displayOrder // ignore: cast_nullable_to_non_nullable
                      as int,
            options: freezed == options
                ? _value.options
                : options // ignore: cast_nullable_to_non_nullable
                      as List<VariantOption>?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$VariantGroupImplCopyWith<$Res>
    implements $VariantGroupCopyWith<$Res> {
  factory _$$VariantGroupImplCopyWith(
    _$VariantGroupImpl value,
    $Res Function(_$VariantGroupImpl) then,
  ) = __$$VariantGroupImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String id,
    String name,
    @JsonKey(name: 'is_required') bool isRequired,
    @JsonKey(name: 'allow_multiple') bool allowMultiple,
    @JsonKey(name: 'display_order') int displayOrder,
    @JsonKey(name: 'product_variant_options') List<VariantOption>? options,
  });
}

/// @nodoc
class __$$VariantGroupImplCopyWithImpl<$Res>
    extends _$VariantGroupCopyWithImpl<$Res, _$VariantGroupImpl>
    implements _$$VariantGroupImplCopyWith<$Res> {
  __$$VariantGroupImplCopyWithImpl(
    _$VariantGroupImpl _value,
    $Res Function(_$VariantGroupImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of VariantGroup
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? isRequired = null,
    Object? allowMultiple = null,
    Object? displayOrder = null,
    Object? options = freezed,
  }) {
    return _then(
      _$VariantGroupImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as String,
        name: null == name
            ? _value.name
            : name // ignore: cast_nullable_to_non_nullable
                  as String,
        isRequired: null == isRequired
            ? _value.isRequired
            : isRequired // ignore: cast_nullable_to_non_nullable
                  as bool,
        allowMultiple: null == allowMultiple
            ? _value.allowMultiple
            : allowMultiple // ignore: cast_nullable_to_non_nullable
                  as bool,
        displayOrder: null == displayOrder
            ? _value.displayOrder
            : displayOrder // ignore: cast_nullable_to_non_nullable
                  as int,
        options: freezed == options
            ? _value._options
            : options // ignore: cast_nullable_to_non_nullable
                  as List<VariantOption>?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$VariantGroupImpl implements _VariantGroup {
  const _$VariantGroupImpl({
    required this.id,
    required this.name,
    @JsonKey(name: 'is_required') this.isRequired = true,
    @JsonKey(name: 'allow_multiple') this.allowMultiple = false,
    @JsonKey(name: 'display_order') this.displayOrder = 0,
    @JsonKey(name: 'product_variant_options')
    final List<VariantOption>? options,
  }) : _options = options;

  factory _$VariantGroupImpl.fromJson(Map<String, dynamic> json) =>
      _$$VariantGroupImplFromJson(json);

  @override
  final String id;
  @override
  final String name;
  @override
  @JsonKey(name: 'is_required')
  final bool isRequired;
  @override
  @JsonKey(name: 'allow_multiple')
  final bool allowMultiple;
  @override
  @JsonKey(name: 'display_order')
  final int displayOrder;
  final List<VariantOption>? _options;
  @override
  @JsonKey(name: 'product_variant_options')
  List<VariantOption>? get options {
    final value = _options;
    if (value == null) return null;
    if (_options is EqualUnmodifiableListView) return _options;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(value);
  }

  @override
  String toString() {
    return 'VariantGroup(id: $id, name: $name, isRequired: $isRequired, allowMultiple: $allowMultiple, displayOrder: $displayOrder, options: $options)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$VariantGroupImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.isRequired, isRequired) ||
                other.isRequired == isRequired) &&
            (identical(other.allowMultiple, allowMultiple) ||
                other.allowMultiple == allowMultiple) &&
            (identical(other.displayOrder, displayOrder) ||
                other.displayOrder == displayOrder) &&
            const DeepCollectionEquality().equals(other._options, _options));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    name,
    isRequired,
    allowMultiple,
    displayOrder,
    const DeepCollectionEquality().hash(_options),
  );

  /// Create a copy of VariantGroup
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$VariantGroupImplCopyWith<_$VariantGroupImpl> get copyWith =>
      __$$VariantGroupImplCopyWithImpl<_$VariantGroupImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$VariantGroupImplToJson(this);
  }
}

abstract class _VariantGroup implements VariantGroup {
  const factory _VariantGroup({
    required final String id,
    required final String name,
    @JsonKey(name: 'is_required') final bool isRequired,
    @JsonKey(name: 'allow_multiple') final bool allowMultiple,
    @JsonKey(name: 'display_order') final int displayOrder,
    @JsonKey(name: 'product_variant_options')
    final List<VariantOption>? options,
  }) = _$VariantGroupImpl;

  factory _VariantGroup.fromJson(Map<String, dynamic> json) =
      _$VariantGroupImpl.fromJson;

  @override
  String get id;
  @override
  String get name;
  @override
  @JsonKey(name: 'is_required')
  bool get isRequired;
  @override
  @JsonKey(name: 'allow_multiple')
  bool get allowMultiple;
  @override
  @JsonKey(name: 'display_order')
  int get displayOrder;
  @override
  @JsonKey(name: 'product_variant_options')
  List<VariantOption>? get options;

  /// Create a copy of VariantGroup
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$VariantGroupImplCopyWith<_$VariantGroupImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

VariantOption _$VariantOptionFromJson(Map<String, dynamic> json) {
  return _VariantOption.fromJson(json);
}

/// @nodoc
mixin _$VariantOption {
  String get id => throw _privateConstructorUsedError;
  String get name => throw _privateConstructorUsedError;
  @JsonKey(name: 'price_delta')
  double get priceDelta => throw _privateConstructorUsedError;
  @JsonKey(name: 'cost_delta')
  double get costDelta => throw _privateConstructorUsedError;
  @JsonKey(name: 'sku_suffix')
  String? get skuSuffix => throw _privateConstructorUsedError;
  @JsonKey(name: 'current_stock')
  double get currentStock => throw _privateConstructorUsedError;
  @JsonKey(name: 'display_order')
  int get displayOrder => throw _privateConstructorUsedError;
  @JsonKey(name: 'is_active')
  bool get isActive => throw _privateConstructorUsedError;

  /// Serializes this VariantOption to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of VariantOption
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $VariantOptionCopyWith<VariantOption> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $VariantOptionCopyWith<$Res> {
  factory $VariantOptionCopyWith(
    VariantOption value,
    $Res Function(VariantOption) then,
  ) = _$VariantOptionCopyWithImpl<$Res, VariantOption>;
  @useResult
  $Res call({
    String id,
    String name,
    @JsonKey(name: 'price_delta') double priceDelta,
    @JsonKey(name: 'cost_delta') double costDelta,
    @JsonKey(name: 'sku_suffix') String? skuSuffix,
    @JsonKey(name: 'current_stock') double currentStock,
    @JsonKey(name: 'display_order') int displayOrder,
    @JsonKey(name: 'is_active') bool isActive,
  });
}

/// @nodoc
class _$VariantOptionCopyWithImpl<$Res, $Val extends VariantOption>
    implements $VariantOptionCopyWith<$Res> {
  _$VariantOptionCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of VariantOption
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? priceDelta = null,
    Object? costDelta = null,
    Object? skuSuffix = freezed,
    Object? currentStock = null,
    Object? displayOrder = null,
    Object? isActive = null,
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
            priceDelta: null == priceDelta
                ? _value.priceDelta
                : priceDelta // ignore: cast_nullable_to_non_nullable
                      as double,
            costDelta: null == costDelta
                ? _value.costDelta
                : costDelta // ignore: cast_nullable_to_non_nullable
                      as double,
            skuSuffix: freezed == skuSuffix
                ? _value.skuSuffix
                : skuSuffix // ignore: cast_nullable_to_non_nullable
                      as String?,
            currentStock: null == currentStock
                ? _value.currentStock
                : currentStock // ignore: cast_nullable_to_non_nullable
                      as double,
            displayOrder: null == displayOrder
                ? _value.displayOrder
                : displayOrder // ignore: cast_nullable_to_non_nullable
                      as int,
            isActive: null == isActive
                ? _value.isActive
                : isActive // ignore: cast_nullable_to_non_nullable
                      as bool,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$VariantOptionImplCopyWith<$Res>
    implements $VariantOptionCopyWith<$Res> {
  factory _$$VariantOptionImplCopyWith(
    _$VariantOptionImpl value,
    $Res Function(_$VariantOptionImpl) then,
  ) = __$$VariantOptionImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String id,
    String name,
    @JsonKey(name: 'price_delta') double priceDelta,
    @JsonKey(name: 'cost_delta') double costDelta,
    @JsonKey(name: 'sku_suffix') String? skuSuffix,
    @JsonKey(name: 'current_stock') double currentStock,
    @JsonKey(name: 'display_order') int displayOrder,
    @JsonKey(name: 'is_active') bool isActive,
  });
}

/// @nodoc
class __$$VariantOptionImplCopyWithImpl<$Res>
    extends _$VariantOptionCopyWithImpl<$Res, _$VariantOptionImpl>
    implements _$$VariantOptionImplCopyWith<$Res> {
  __$$VariantOptionImplCopyWithImpl(
    _$VariantOptionImpl _value,
    $Res Function(_$VariantOptionImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of VariantOption
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? priceDelta = null,
    Object? costDelta = null,
    Object? skuSuffix = freezed,
    Object? currentStock = null,
    Object? displayOrder = null,
    Object? isActive = null,
  }) {
    return _then(
      _$VariantOptionImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as String,
        name: null == name
            ? _value.name
            : name // ignore: cast_nullable_to_non_nullable
                  as String,
        priceDelta: null == priceDelta
            ? _value.priceDelta
            : priceDelta // ignore: cast_nullable_to_non_nullable
                  as double,
        costDelta: null == costDelta
            ? _value.costDelta
            : costDelta // ignore: cast_nullable_to_non_nullable
                  as double,
        skuSuffix: freezed == skuSuffix
            ? _value.skuSuffix
            : skuSuffix // ignore: cast_nullable_to_non_nullable
                  as String?,
        currentStock: null == currentStock
            ? _value.currentStock
            : currentStock // ignore: cast_nullable_to_non_nullable
                  as double,
        displayOrder: null == displayOrder
            ? _value.displayOrder
            : displayOrder // ignore: cast_nullable_to_non_nullable
                  as int,
        isActive: null == isActive
            ? _value.isActive
            : isActive // ignore: cast_nullable_to_non_nullable
                  as bool,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$VariantOptionImpl implements _VariantOption {
  const _$VariantOptionImpl({
    required this.id,
    required this.name,
    @JsonKey(name: 'price_delta') this.priceDelta = 0.0,
    @JsonKey(name: 'cost_delta') this.costDelta = 0.0,
    @JsonKey(name: 'sku_suffix') this.skuSuffix,
    @JsonKey(name: 'current_stock') this.currentStock = 0.0,
    @JsonKey(name: 'display_order') this.displayOrder = 0,
    @JsonKey(name: 'is_active') this.isActive = true,
  });

  factory _$VariantOptionImpl.fromJson(Map<String, dynamic> json) =>
      _$$VariantOptionImplFromJson(json);

  @override
  final String id;
  @override
  final String name;
  @override
  @JsonKey(name: 'price_delta')
  final double priceDelta;
  @override
  @JsonKey(name: 'cost_delta')
  final double costDelta;
  @override
  @JsonKey(name: 'sku_suffix')
  final String? skuSuffix;
  @override
  @JsonKey(name: 'current_stock')
  final double currentStock;
  @override
  @JsonKey(name: 'display_order')
  final int displayOrder;
  @override
  @JsonKey(name: 'is_active')
  final bool isActive;

  @override
  String toString() {
    return 'VariantOption(id: $id, name: $name, priceDelta: $priceDelta, costDelta: $costDelta, skuSuffix: $skuSuffix, currentStock: $currentStock, displayOrder: $displayOrder, isActive: $isActive)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$VariantOptionImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.priceDelta, priceDelta) ||
                other.priceDelta == priceDelta) &&
            (identical(other.costDelta, costDelta) ||
                other.costDelta == costDelta) &&
            (identical(other.skuSuffix, skuSuffix) ||
                other.skuSuffix == skuSuffix) &&
            (identical(other.currentStock, currentStock) ||
                other.currentStock == currentStock) &&
            (identical(other.displayOrder, displayOrder) ||
                other.displayOrder == displayOrder) &&
            (identical(other.isActive, isActive) ||
                other.isActive == isActive));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    name,
    priceDelta,
    costDelta,
    skuSuffix,
    currentStock,
    displayOrder,
    isActive,
  );

  /// Create a copy of VariantOption
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$VariantOptionImplCopyWith<_$VariantOptionImpl> get copyWith =>
      __$$VariantOptionImplCopyWithImpl<_$VariantOptionImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$VariantOptionImplToJson(this);
  }
}

abstract class _VariantOption implements VariantOption {
  const factory _VariantOption({
    required final String id,
    required final String name,
    @JsonKey(name: 'price_delta') final double priceDelta,
    @JsonKey(name: 'cost_delta') final double costDelta,
    @JsonKey(name: 'sku_suffix') final String? skuSuffix,
    @JsonKey(name: 'current_stock') final double currentStock,
    @JsonKey(name: 'display_order') final int displayOrder,
    @JsonKey(name: 'is_active') final bool isActive,
  }) = _$VariantOptionImpl;

  factory _VariantOption.fromJson(Map<String, dynamic> json) =
      _$VariantOptionImpl.fromJson;

  @override
  String get id;
  @override
  String get name;
  @override
  @JsonKey(name: 'price_delta')
  double get priceDelta;
  @override
  @JsonKey(name: 'cost_delta')
  double get costDelta;
  @override
  @JsonKey(name: 'sku_suffix')
  String? get skuSuffix;
  @override
  @JsonKey(name: 'current_stock')
  double get currentStock;
  @override
  @JsonKey(name: 'display_order')
  int get displayOrder;
  @override
  @JsonKey(name: 'is_active')
  bool get isActive;

  /// Create a copy of VariantOption
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$VariantOptionImplCopyWith<_$VariantOptionImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

AddonGroup _$AddonGroupFromJson(Map<String, dynamic> json) {
  return _AddonGroup.fromJson(json);
}

/// @nodoc
mixin _$AddonGroup {
  String get id => throw _privateConstructorUsedError;
  String get name => throw _privateConstructorUsedError;
  @JsonKey(name: 'is_required')
  bool get isRequired => throw _privateConstructorUsedError;
  @JsonKey(name: 'min_selections')
  int get minSelections => throw _privateConstructorUsedError;
  @JsonKey(name: 'max_selections')
  int get maxSelections => throw _privateConstructorUsedError;
  @JsonKey(name: 'is_promo_eligible')
  bool get isPromoEligible => throw _privateConstructorUsedError;
  @JsonKey(name: 'display_order')
  int get displayOrder => throw _privateConstructorUsedError;
  @JsonKey(name: 'product_addons')
  List<Addon>? get addons => throw _privateConstructorUsedError;

  /// Serializes this AddonGroup to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of AddonGroup
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $AddonGroupCopyWith<AddonGroup> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $AddonGroupCopyWith<$Res> {
  factory $AddonGroupCopyWith(
    AddonGroup value,
    $Res Function(AddonGroup) then,
  ) = _$AddonGroupCopyWithImpl<$Res, AddonGroup>;
  @useResult
  $Res call({
    String id,
    String name,
    @JsonKey(name: 'is_required') bool isRequired,
    @JsonKey(name: 'min_selections') int minSelections,
    @JsonKey(name: 'max_selections') int maxSelections,
    @JsonKey(name: 'is_promo_eligible') bool isPromoEligible,
    @JsonKey(name: 'display_order') int displayOrder,
    @JsonKey(name: 'product_addons') List<Addon>? addons,
  });
}

/// @nodoc
class _$AddonGroupCopyWithImpl<$Res, $Val extends AddonGroup>
    implements $AddonGroupCopyWith<$Res> {
  _$AddonGroupCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of AddonGroup
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? isRequired = null,
    Object? minSelections = null,
    Object? maxSelections = null,
    Object? isPromoEligible = null,
    Object? displayOrder = null,
    Object? addons = freezed,
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
            isRequired: null == isRequired
                ? _value.isRequired
                : isRequired // ignore: cast_nullable_to_non_nullable
                      as bool,
            minSelections: null == minSelections
                ? _value.minSelections
                : minSelections // ignore: cast_nullable_to_non_nullable
                      as int,
            maxSelections: null == maxSelections
                ? _value.maxSelections
                : maxSelections // ignore: cast_nullable_to_non_nullable
                      as int,
            isPromoEligible: null == isPromoEligible
                ? _value.isPromoEligible
                : isPromoEligible // ignore: cast_nullable_to_non_nullable
                      as bool,
            displayOrder: null == displayOrder
                ? _value.displayOrder
                : displayOrder // ignore: cast_nullable_to_non_nullable
                      as int,
            addons: freezed == addons
                ? _value.addons
                : addons // ignore: cast_nullable_to_non_nullable
                      as List<Addon>?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$AddonGroupImplCopyWith<$Res>
    implements $AddonGroupCopyWith<$Res> {
  factory _$$AddonGroupImplCopyWith(
    _$AddonGroupImpl value,
    $Res Function(_$AddonGroupImpl) then,
  ) = __$$AddonGroupImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String id,
    String name,
    @JsonKey(name: 'is_required') bool isRequired,
    @JsonKey(name: 'min_selections') int minSelections,
    @JsonKey(name: 'max_selections') int maxSelections,
    @JsonKey(name: 'is_promo_eligible') bool isPromoEligible,
    @JsonKey(name: 'display_order') int displayOrder,
    @JsonKey(name: 'product_addons') List<Addon>? addons,
  });
}

/// @nodoc
class __$$AddonGroupImplCopyWithImpl<$Res>
    extends _$AddonGroupCopyWithImpl<$Res, _$AddonGroupImpl>
    implements _$$AddonGroupImplCopyWith<$Res> {
  __$$AddonGroupImplCopyWithImpl(
    _$AddonGroupImpl _value,
    $Res Function(_$AddonGroupImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of AddonGroup
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? isRequired = null,
    Object? minSelections = null,
    Object? maxSelections = null,
    Object? isPromoEligible = null,
    Object? displayOrder = null,
    Object? addons = freezed,
  }) {
    return _then(
      _$AddonGroupImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as String,
        name: null == name
            ? _value.name
            : name // ignore: cast_nullable_to_non_nullable
                  as String,
        isRequired: null == isRequired
            ? _value.isRequired
            : isRequired // ignore: cast_nullable_to_non_nullable
                  as bool,
        minSelections: null == minSelections
            ? _value.minSelections
            : minSelections // ignore: cast_nullable_to_non_nullable
                  as int,
        maxSelections: null == maxSelections
            ? _value.maxSelections
            : maxSelections // ignore: cast_nullable_to_non_nullable
                  as int,
        isPromoEligible: null == isPromoEligible
            ? _value.isPromoEligible
            : isPromoEligible // ignore: cast_nullable_to_non_nullable
                  as bool,
        displayOrder: null == displayOrder
            ? _value.displayOrder
            : displayOrder // ignore: cast_nullable_to_non_nullable
                  as int,
        addons: freezed == addons
            ? _value._addons
            : addons // ignore: cast_nullable_to_non_nullable
                  as List<Addon>?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$AddonGroupImpl implements _AddonGroup {
  const _$AddonGroupImpl({
    required this.id,
    required this.name,
    @JsonKey(name: 'is_required') this.isRequired = false,
    @JsonKey(name: 'min_selections') this.minSelections = 0,
    @JsonKey(name: 'max_selections') this.maxSelections = 1,
    @JsonKey(name: 'is_promo_eligible') this.isPromoEligible = true,
    @JsonKey(name: 'display_order') this.displayOrder = 0,
    @JsonKey(name: 'product_addons') final List<Addon>? addons,
  }) : _addons = addons;

  factory _$AddonGroupImpl.fromJson(Map<String, dynamic> json) =>
      _$$AddonGroupImplFromJson(json);

  @override
  final String id;
  @override
  final String name;
  @override
  @JsonKey(name: 'is_required')
  final bool isRequired;
  @override
  @JsonKey(name: 'min_selections')
  final int minSelections;
  @override
  @JsonKey(name: 'max_selections')
  final int maxSelections;
  @override
  @JsonKey(name: 'is_promo_eligible')
  final bool isPromoEligible;
  @override
  @JsonKey(name: 'display_order')
  final int displayOrder;
  final List<Addon>? _addons;
  @override
  @JsonKey(name: 'product_addons')
  List<Addon>? get addons {
    final value = _addons;
    if (value == null) return null;
    if (_addons is EqualUnmodifiableListView) return _addons;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(value);
  }

  @override
  String toString() {
    return 'AddonGroup(id: $id, name: $name, isRequired: $isRequired, minSelections: $minSelections, maxSelections: $maxSelections, isPromoEligible: $isPromoEligible, displayOrder: $displayOrder, addons: $addons)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$AddonGroupImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.isRequired, isRequired) ||
                other.isRequired == isRequired) &&
            (identical(other.minSelections, minSelections) ||
                other.minSelections == minSelections) &&
            (identical(other.maxSelections, maxSelections) ||
                other.maxSelections == maxSelections) &&
            (identical(other.isPromoEligible, isPromoEligible) ||
                other.isPromoEligible == isPromoEligible) &&
            (identical(other.displayOrder, displayOrder) ||
                other.displayOrder == displayOrder) &&
            const DeepCollectionEquality().equals(other._addons, _addons));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    name,
    isRequired,
    minSelections,
    maxSelections,
    isPromoEligible,
    displayOrder,
    const DeepCollectionEquality().hash(_addons),
  );

  /// Create a copy of AddonGroup
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$AddonGroupImplCopyWith<_$AddonGroupImpl> get copyWith =>
      __$$AddonGroupImplCopyWithImpl<_$AddonGroupImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$AddonGroupImplToJson(this);
  }
}

abstract class _AddonGroup implements AddonGroup {
  const factory _AddonGroup({
    required final String id,
    required final String name,
    @JsonKey(name: 'is_required') final bool isRequired,
    @JsonKey(name: 'min_selections') final int minSelections,
    @JsonKey(name: 'max_selections') final int maxSelections,
    @JsonKey(name: 'is_promo_eligible') final bool isPromoEligible,
    @JsonKey(name: 'display_order') final int displayOrder,
    @JsonKey(name: 'product_addons') final List<Addon>? addons,
  }) = _$AddonGroupImpl;

  factory _AddonGroup.fromJson(Map<String, dynamic> json) =
      _$AddonGroupImpl.fromJson;

  @override
  String get id;
  @override
  String get name;
  @override
  @JsonKey(name: 'is_required')
  bool get isRequired;
  @override
  @JsonKey(name: 'min_selections')
  int get minSelections;
  @override
  @JsonKey(name: 'max_selections')
  int get maxSelections;
  @override
  @JsonKey(name: 'is_promo_eligible')
  bool get isPromoEligible;
  @override
  @JsonKey(name: 'display_order')
  int get displayOrder;
  @override
  @JsonKey(name: 'product_addons')
  List<Addon>? get addons;

  /// Create a copy of AddonGroup
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$AddonGroupImplCopyWith<_$AddonGroupImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

Addon _$AddonFromJson(Map<String, dynamic> json) {
  return _Addon.fromJson(json);
}

/// @nodoc
mixin _$Addon {
  String get id => throw _privateConstructorUsedError;
  String get name => throw _privateConstructorUsedError;
  double get price => throw _privateConstructorUsedError;
  @JsonKey(name: 'cost_price')
  double get costPrice => throw _privateConstructorUsedError;
  @JsonKey(name: 'track_stock')
  bool get trackStock => throw _privateConstructorUsedError;
  @JsonKey(name: 'current_stock')
  double? get currentStock => throw _privateConstructorUsedError;
  @JsonKey(name: 'raw_material_id')
  String? get rawMaterialId => throw _privateConstructorUsedError;
  @JsonKey(name: 'display_order')
  int get displayOrder => throw _privateConstructorUsedError;
  @JsonKey(name: 'is_active')
  bool get isActive => throw _privateConstructorUsedError;

  /// Serializes this Addon to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of Addon
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $AddonCopyWith<Addon> get copyWith => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $AddonCopyWith<$Res> {
  factory $AddonCopyWith(Addon value, $Res Function(Addon) then) =
      _$AddonCopyWithImpl<$Res, Addon>;
  @useResult
  $Res call({
    String id,
    String name,
    double price,
    @JsonKey(name: 'cost_price') double costPrice,
    @JsonKey(name: 'track_stock') bool trackStock,
    @JsonKey(name: 'current_stock') double? currentStock,
    @JsonKey(name: 'raw_material_id') String? rawMaterialId,
    @JsonKey(name: 'display_order') int displayOrder,
    @JsonKey(name: 'is_active') bool isActive,
  });
}

/// @nodoc
class _$AddonCopyWithImpl<$Res, $Val extends Addon>
    implements $AddonCopyWith<$Res> {
  _$AddonCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of Addon
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? price = null,
    Object? costPrice = null,
    Object? trackStock = null,
    Object? currentStock = freezed,
    Object? rawMaterialId = freezed,
    Object? displayOrder = null,
    Object? isActive = null,
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
            costPrice: null == costPrice
                ? _value.costPrice
                : costPrice // ignore: cast_nullable_to_non_nullable
                      as double,
            trackStock: null == trackStock
                ? _value.trackStock
                : trackStock // ignore: cast_nullable_to_non_nullable
                      as bool,
            currentStock: freezed == currentStock
                ? _value.currentStock
                : currentStock // ignore: cast_nullable_to_non_nullable
                      as double?,
            rawMaterialId: freezed == rawMaterialId
                ? _value.rawMaterialId
                : rawMaterialId // ignore: cast_nullable_to_non_nullable
                      as String?,
            displayOrder: null == displayOrder
                ? _value.displayOrder
                : displayOrder // ignore: cast_nullable_to_non_nullable
                      as int,
            isActive: null == isActive
                ? _value.isActive
                : isActive // ignore: cast_nullable_to_non_nullable
                      as bool,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$AddonImplCopyWith<$Res> implements $AddonCopyWith<$Res> {
  factory _$$AddonImplCopyWith(
    _$AddonImpl value,
    $Res Function(_$AddonImpl) then,
  ) = __$$AddonImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String id,
    String name,
    double price,
    @JsonKey(name: 'cost_price') double costPrice,
    @JsonKey(name: 'track_stock') bool trackStock,
    @JsonKey(name: 'current_stock') double? currentStock,
    @JsonKey(name: 'raw_material_id') String? rawMaterialId,
    @JsonKey(name: 'display_order') int displayOrder,
    @JsonKey(name: 'is_active') bool isActive,
  });
}

/// @nodoc
class __$$AddonImplCopyWithImpl<$Res>
    extends _$AddonCopyWithImpl<$Res, _$AddonImpl>
    implements _$$AddonImplCopyWith<$Res> {
  __$$AddonImplCopyWithImpl(
    _$AddonImpl _value,
    $Res Function(_$AddonImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of Addon
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? price = null,
    Object? costPrice = null,
    Object? trackStock = null,
    Object? currentStock = freezed,
    Object? rawMaterialId = freezed,
    Object? displayOrder = null,
    Object? isActive = null,
  }) {
    return _then(
      _$AddonImpl(
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
        costPrice: null == costPrice
            ? _value.costPrice
            : costPrice // ignore: cast_nullable_to_non_nullable
                  as double,
        trackStock: null == trackStock
            ? _value.trackStock
            : trackStock // ignore: cast_nullable_to_non_nullable
                  as bool,
        currentStock: freezed == currentStock
            ? _value.currentStock
            : currentStock // ignore: cast_nullable_to_non_nullable
                  as double?,
        rawMaterialId: freezed == rawMaterialId
            ? _value.rawMaterialId
            : rawMaterialId // ignore: cast_nullable_to_non_nullable
                  as String?,
        displayOrder: null == displayOrder
            ? _value.displayOrder
            : displayOrder // ignore: cast_nullable_to_non_nullable
                  as int,
        isActive: null == isActive
            ? _value.isActive
            : isActive // ignore: cast_nullable_to_non_nullable
                  as bool,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$AddonImpl implements _Addon {
  const _$AddonImpl({
    required this.id,
    required this.name,
    this.price = 0.0,
    @JsonKey(name: 'cost_price') this.costPrice = 0.0,
    @JsonKey(name: 'track_stock') this.trackStock = false,
    @JsonKey(name: 'current_stock') this.currentStock,
    @JsonKey(name: 'raw_material_id') this.rawMaterialId,
    @JsonKey(name: 'display_order') this.displayOrder = 0,
    @JsonKey(name: 'is_active') this.isActive = true,
  });

  factory _$AddonImpl.fromJson(Map<String, dynamic> json) =>
      _$$AddonImplFromJson(json);

  @override
  final String id;
  @override
  final String name;
  @override
  @JsonKey()
  final double price;
  @override
  @JsonKey(name: 'cost_price')
  final double costPrice;
  @override
  @JsonKey(name: 'track_stock')
  final bool trackStock;
  @override
  @JsonKey(name: 'current_stock')
  final double? currentStock;
  @override
  @JsonKey(name: 'raw_material_id')
  final String? rawMaterialId;
  @override
  @JsonKey(name: 'display_order')
  final int displayOrder;
  @override
  @JsonKey(name: 'is_active')
  final bool isActive;

  @override
  String toString() {
    return 'Addon(id: $id, name: $name, price: $price, costPrice: $costPrice, trackStock: $trackStock, currentStock: $currentStock, rawMaterialId: $rawMaterialId, displayOrder: $displayOrder, isActive: $isActive)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$AddonImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.price, price) || other.price == price) &&
            (identical(other.costPrice, costPrice) ||
                other.costPrice == costPrice) &&
            (identical(other.trackStock, trackStock) ||
                other.trackStock == trackStock) &&
            (identical(other.currentStock, currentStock) ||
                other.currentStock == currentStock) &&
            (identical(other.rawMaterialId, rawMaterialId) ||
                other.rawMaterialId == rawMaterialId) &&
            (identical(other.displayOrder, displayOrder) ||
                other.displayOrder == displayOrder) &&
            (identical(other.isActive, isActive) ||
                other.isActive == isActive));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    name,
    price,
    costPrice,
    trackStock,
    currentStock,
    rawMaterialId,
    displayOrder,
    isActive,
  );

  /// Create a copy of Addon
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$AddonImplCopyWith<_$AddonImpl> get copyWith =>
      __$$AddonImplCopyWithImpl<_$AddonImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$AddonImplToJson(this);
  }
}

abstract class _Addon implements Addon {
  const factory _Addon({
    required final String id,
    required final String name,
    final double price,
    @JsonKey(name: 'cost_price') final double costPrice,
    @JsonKey(name: 'track_stock') final bool trackStock,
    @JsonKey(name: 'current_stock') final double? currentStock,
    @JsonKey(name: 'raw_material_id') final String? rawMaterialId,
    @JsonKey(name: 'display_order') final int displayOrder,
    @JsonKey(name: 'is_active') final bool isActive,
  }) = _$AddonImpl;

  factory _Addon.fromJson(Map<String, dynamic> json) = _$AddonImpl.fromJson;

  @override
  String get id;
  @override
  String get name;
  @override
  double get price;
  @override
  @JsonKey(name: 'cost_price')
  double get costPrice;
  @override
  @JsonKey(name: 'track_stock')
  bool get trackStock;
  @override
  @JsonKey(name: 'current_stock')
  double? get currentStock;
  @override
  @JsonKey(name: 'raw_material_id')
  String? get rawMaterialId;
  @override
  @JsonKey(name: 'display_order')
  int get displayOrder;
  @override
  @JsonKey(name: 'is_active')
  bool get isActive;

  /// Create a copy of Addon
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$AddonImplCopyWith<_$AddonImpl> get copyWith =>
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
