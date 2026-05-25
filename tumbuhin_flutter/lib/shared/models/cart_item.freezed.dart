// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'cart_item.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

CartItem _$CartItemFromJson(Map<String, dynamic> json) {
  return _CartItem.fromJson(json);
}

/// @nodoc
mixin _$CartItem {
  Product get product => throw _privateConstructorUsedError;
  int get quantity => throw _privateConstructorUsedError;
  List<VariantOption> get selectedVariants =>
      throw _privateConstructorUsedError;
  List<Addon> get selectedAddons => throw _privateConstructorUsedError;
  String? get specialInstructions => throw _privateConstructorUsedError;

  /// Serializes this CartItem to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of CartItem
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $CartItemCopyWith<CartItem> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $CartItemCopyWith<$Res> {
  factory $CartItemCopyWith(CartItem value, $Res Function(CartItem) then) =
      _$CartItemCopyWithImpl<$Res, CartItem>;
  @useResult
  $Res call({
    Product product,
    int quantity,
    List<VariantOption> selectedVariants,
    List<Addon> selectedAddons,
    String? specialInstructions,
  });

  $ProductCopyWith<$Res> get product;
}

/// @nodoc
class _$CartItemCopyWithImpl<$Res, $Val extends CartItem>
    implements $CartItemCopyWith<$Res> {
  _$CartItemCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of CartItem
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? product = null,
    Object? quantity = null,
    Object? selectedVariants = null,
    Object? selectedAddons = null,
    Object? specialInstructions = freezed,
  }) {
    return _then(
      _value.copyWith(
            product: null == product
                ? _value.product
                : product // ignore: cast_nullable_to_non_nullable
                      as Product,
            quantity: null == quantity
                ? _value.quantity
                : quantity // ignore: cast_nullable_to_non_nullable
                      as int,
            selectedVariants: null == selectedVariants
                ? _value.selectedVariants
                : selectedVariants // ignore: cast_nullable_to_non_nullable
                      as List<VariantOption>,
            selectedAddons: null == selectedAddons
                ? _value.selectedAddons
                : selectedAddons // ignore: cast_nullable_to_non_nullable
                      as List<Addon>,
            specialInstructions: freezed == specialInstructions
                ? _value.specialInstructions
                : specialInstructions // ignore: cast_nullable_to_non_nullable
                      as String?,
          )
          as $Val,
    );
  }

  /// Create a copy of CartItem
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $ProductCopyWith<$Res> get product {
    return $ProductCopyWith<$Res>(_value.product, (value) {
      return _then(_value.copyWith(product: value) as $Val);
    });
  }
}

/// @nodoc
abstract class _$$CartItemImplCopyWith<$Res>
    implements $CartItemCopyWith<$Res> {
  factory _$$CartItemImplCopyWith(
    _$CartItemImpl value,
    $Res Function(_$CartItemImpl) then,
  ) = __$$CartItemImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    Product product,
    int quantity,
    List<VariantOption> selectedVariants,
    List<Addon> selectedAddons,
    String? specialInstructions,
  });

  @override
  $ProductCopyWith<$Res> get product;
}

/// @nodoc
class __$$CartItemImplCopyWithImpl<$Res>
    extends _$CartItemCopyWithImpl<$Res, _$CartItemImpl>
    implements _$$CartItemImplCopyWith<$Res> {
  __$$CartItemImplCopyWithImpl(
    _$CartItemImpl _value,
    $Res Function(_$CartItemImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of CartItem
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? product = null,
    Object? quantity = null,
    Object? selectedVariants = null,
    Object? selectedAddons = null,
    Object? specialInstructions = freezed,
  }) {
    return _then(
      _$CartItemImpl(
        product: null == product
            ? _value.product
            : product // ignore: cast_nullable_to_non_nullable
                  as Product,
        quantity: null == quantity
            ? _value.quantity
            : quantity // ignore: cast_nullable_to_non_nullable
                  as int,
        selectedVariants: null == selectedVariants
            ? _value._selectedVariants
            : selectedVariants // ignore: cast_nullable_to_non_nullable
                  as List<VariantOption>,
        selectedAddons: null == selectedAddons
            ? _value._selectedAddons
            : selectedAddons // ignore: cast_nullable_to_non_nullable
                  as List<Addon>,
        specialInstructions: freezed == specialInstructions
            ? _value.specialInstructions
            : specialInstructions // ignore: cast_nullable_to_non_nullable
                  as String?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$CartItemImpl extends _CartItem {
  const _$CartItemImpl({
    required this.product,
    this.quantity = 1,
    final List<VariantOption> selectedVariants = const [],
    final List<Addon> selectedAddons = const [],
    this.specialInstructions,
  }) : _selectedVariants = selectedVariants,
       _selectedAddons = selectedAddons,
       super._();

  factory _$CartItemImpl.fromJson(Map<String, dynamic> json) =>
      _$$CartItemImplFromJson(json);

  @override
  final Product product;
  @override
  @JsonKey()
  final int quantity;
  final List<VariantOption> _selectedVariants;
  @override
  @JsonKey()
  List<VariantOption> get selectedVariants {
    if (_selectedVariants is EqualUnmodifiableListView)
      return _selectedVariants;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_selectedVariants);
  }

  final List<Addon> _selectedAddons;
  @override
  @JsonKey()
  List<Addon> get selectedAddons {
    if (_selectedAddons is EqualUnmodifiableListView) return _selectedAddons;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_selectedAddons);
  }

  @override
  final String? specialInstructions;

  @override
  String toString() {
    return 'CartItem(product: $product, quantity: $quantity, selectedVariants: $selectedVariants, selectedAddons: $selectedAddons, specialInstructions: $specialInstructions)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$CartItemImpl &&
            (identical(other.product, product) || other.product == product) &&
            (identical(other.quantity, quantity) ||
                other.quantity == quantity) &&
            const DeepCollectionEquality().equals(
              other._selectedVariants,
              _selectedVariants,
            ) &&
            const DeepCollectionEquality().equals(
              other._selectedAddons,
              _selectedAddons,
            ) &&
            (identical(other.specialInstructions, specialInstructions) ||
                other.specialInstructions == specialInstructions));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    product,
    quantity,
    const DeepCollectionEquality().hash(_selectedVariants),
    const DeepCollectionEquality().hash(_selectedAddons),
    specialInstructions,
  );

  /// Create a copy of CartItem
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$CartItemImplCopyWith<_$CartItemImpl> get copyWith =>
      __$$CartItemImplCopyWithImpl<_$CartItemImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$CartItemImplToJson(this);
  }
}

abstract class _CartItem extends CartItem {
  const factory _CartItem({
    required final Product product,
    final int quantity,
    final List<VariantOption> selectedVariants,
    final List<Addon> selectedAddons,
    final String? specialInstructions,
  }) = _$CartItemImpl;
  const _CartItem._() : super._();

  factory _CartItem.fromJson(Map<String, dynamic> json) =
      _$CartItemImpl.fromJson;

  @override
  Product get product;
  @override
  int get quantity;
  @override
  List<VariantOption> get selectedVariants;
  @override
  List<Addon> get selectedAddons;
  @override
  String? get specialInstructions;

  /// Create a copy of CartItem
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$CartItemImplCopyWith<_$CartItemImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
