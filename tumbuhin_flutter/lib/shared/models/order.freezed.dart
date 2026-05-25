// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'order.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

Order _$OrderFromJson(Map<String, dynamic> json) {
  return _Order.fromJson(json);
}

/// @nodoc
mixin _$Order {
  String get id => throw _privateConstructorUsedError;
  @JsonKey(name: 'tenant_id')
  String get tenantId => throw _privateConstructorUsedError;
  @JsonKey(name: 'created_by')
  String? get createdBy => throw _privateConstructorUsedError;
  @JsonKey(name: 'type')
  String get type => throw _privateConstructorUsedError; // 'SO' or 'PO'
  @JsonKey(name: 'status')
  String get status => throw _privateConstructorUsedError;
  @JsonKey(name: 'reference_number')
  String? get referenceNumber => throw _privateConstructorUsedError;
  @JsonKey(name: 'entity_name')
  String? get entityName => throw _privateConstructorUsedError;
  @JsonKey(name: 'customer_name')
  String? get customerName => throw _privateConstructorUsedError;
  @JsonKey(name: 'source')
  String? get source => throw _privateConstructorUsedError;
  @JsonKey(name: 'total_amount')
  double get totalAmount => throw _privateConstructorUsedError;
  @JsonKey(name: 'tax_amount')
  double get taxAmount => throw _privateConstructorUsedError;
  @JsonKey(name: 'discount_amount')
  double get discountAmount => throw _privateConstructorUsedError;
  @JsonKey(name: 'transaction_id')
  String? get transactionId => throw _privateConstructorUsedError;
  @JsonKey(name: 'notes')
  String? get notes => throw _privateConstructorUsedError;
  @JsonKey(name: 'division_notes')
  DivisionNotes? get divisionNotes => throw _privateConstructorUsedError;
  @JsonKey(name: 'fulfilled_at')
  DateTime? get fulfilledAt => throw _privateConstructorUsedError;
  @JsonKey(name: 'created_at')
  DateTime get createdAt => throw _privateConstructorUsedError;
  @JsonKey(name: 'updated_at')
  DateTime? get updatedAt => throw _privateConstructorUsedError;
  @JsonKey(name: 'order_items')
  List<OrderItem>? get items => throw _privateConstructorUsedError;

  /// Serializes this Order to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of Order
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $OrderCopyWith<Order> get copyWith => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $OrderCopyWith<$Res> {
  factory $OrderCopyWith(Order value, $Res Function(Order) then) =
      _$OrderCopyWithImpl<$Res, Order>;
  @useResult
  $Res call({
    String id,
    @JsonKey(name: 'tenant_id') String tenantId,
    @JsonKey(name: 'created_by') String? createdBy,
    @JsonKey(name: 'type') String type,
    @JsonKey(name: 'status') String status,
    @JsonKey(name: 'reference_number') String? referenceNumber,
    @JsonKey(name: 'entity_name') String? entityName,
    @JsonKey(name: 'customer_name') String? customerName,
    @JsonKey(name: 'source') String? source,
    @JsonKey(name: 'total_amount') double totalAmount,
    @JsonKey(name: 'tax_amount') double taxAmount,
    @JsonKey(name: 'discount_amount') double discountAmount,
    @JsonKey(name: 'transaction_id') String? transactionId,
    @JsonKey(name: 'notes') String? notes,
    @JsonKey(name: 'division_notes') DivisionNotes? divisionNotes,
    @JsonKey(name: 'fulfilled_at') DateTime? fulfilledAt,
    @JsonKey(name: 'created_at') DateTime createdAt,
    @JsonKey(name: 'updated_at') DateTime? updatedAt,
    @JsonKey(name: 'order_items') List<OrderItem>? items,
  });

  $DivisionNotesCopyWith<$Res>? get divisionNotes;
}

/// @nodoc
class _$OrderCopyWithImpl<$Res, $Val extends Order>
    implements $OrderCopyWith<$Res> {
  _$OrderCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of Order
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? tenantId = null,
    Object? createdBy = freezed,
    Object? type = null,
    Object? status = null,
    Object? referenceNumber = freezed,
    Object? entityName = freezed,
    Object? customerName = freezed,
    Object? source = freezed,
    Object? totalAmount = null,
    Object? taxAmount = null,
    Object? discountAmount = null,
    Object? transactionId = freezed,
    Object? notes = freezed,
    Object? divisionNotes = freezed,
    Object? fulfilledAt = freezed,
    Object? createdAt = null,
    Object? updatedAt = freezed,
    Object? items = freezed,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as String,
            tenantId: null == tenantId
                ? _value.tenantId
                : tenantId // ignore: cast_nullable_to_non_nullable
                      as String,
            createdBy: freezed == createdBy
                ? _value.createdBy
                : createdBy // ignore: cast_nullable_to_non_nullable
                      as String?,
            type: null == type
                ? _value.type
                : type // ignore: cast_nullable_to_non_nullable
                      as String,
            status: null == status
                ? _value.status
                : status // ignore: cast_nullable_to_non_nullable
                      as String,
            referenceNumber: freezed == referenceNumber
                ? _value.referenceNumber
                : referenceNumber // ignore: cast_nullable_to_non_nullable
                      as String?,
            entityName: freezed == entityName
                ? _value.entityName
                : entityName // ignore: cast_nullable_to_non_nullable
                      as String?,
            customerName: freezed == customerName
                ? _value.customerName
                : customerName // ignore: cast_nullable_to_non_nullable
                      as String?,
            source: freezed == source
                ? _value.source
                : source // ignore: cast_nullable_to_non_nullable
                      as String?,
            totalAmount: null == totalAmount
                ? _value.totalAmount
                : totalAmount // ignore: cast_nullable_to_non_nullable
                      as double,
            taxAmount: null == taxAmount
                ? _value.taxAmount
                : taxAmount // ignore: cast_nullable_to_non_nullable
                      as double,
            discountAmount: null == discountAmount
                ? _value.discountAmount
                : discountAmount // ignore: cast_nullable_to_non_nullable
                      as double,
            transactionId: freezed == transactionId
                ? _value.transactionId
                : transactionId // ignore: cast_nullable_to_non_nullable
                      as String?,
            notes: freezed == notes
                ? _value.notes
                : notes // ignore: cast_nullable_to_non_nullable
                      as String?,
            divisionNotes: freezed == divisionNotes
                ? _value.divisionNotes
                : divisionNotes // ignore: cast_nullable_to_non_nullable
                      as DivisionNotes?,
            fulfilledAt: freezed == fulfilledAt
                ? _value.fulfilledAt
                : fulfilledAt // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
            createdAt: null == createdAt
                ? _value.createdAt
                : createdAt // ignore: cast_nullable_to_non_nullable
                      as DateTime,
            updatedAt: freezed == updatedAt
                ? _value.updatedAt
                : updatedAt // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
            items: freezed == items
                ? _value.items
                : items // ignore: cast_nullable_to_non_nullable
                      as List<OrderItem>?,
          )
          as $Val,
    );
  }

  /// Create a copy of Order
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $DivisionNotesCopyWith<$Res>? get divisionNotes {
    if (_value.divisionNotes == null) {
      return null;
    }

    return $DivisionNotesCopyWith<$Res>(_value.divisionNotes!, (value) {
      return _then(_value.copyWith(divisionNotes: value) as $Val);
    });
  }
}

/// @nodoc
abstract class _$$OrderImplCopyWith<$Res> implements $OrderCopyWith<$Res> {
  factory _$$OrderImplCopyWith(
    _$OrderImpl value,
    $Res Function(_$OrderImpl) then,
  ) = __$$OrderImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String id,
    @JsonKey(name: 'tenant_id') String tenantId,
    @JsonKey(name: 'created_by') String? createdBy,
    @JsonKey(name: 'type') String type,
    @JsonKey(name: 'status') String status,
    @JsonKey(name: 'reference_number') String? referenceNumber,
    @JsonKey(name: 'entity_name') String? entityName,
    @JsonKey(name: 'customer_name') String? customerName,
    @JsonKey(name: 'source') String? source,
    @JsonKey(name: 'total_amount') double totalAmount,
    @JsonKey(name: 'tax_amount') double taxAmount,
    @JsonKey(name: 'discount_amount') double discountAmount,
    @JsonKey(name: 'transaction_id') String? transactionId,
    @JsonKey(name: 'notes') String? notes,
    @JsonKey(name: 'division_notes') DivisionNotes? divisionNotes,
    @JsonKey(name: 'fulfilled_at') DateTime? fulfilledAt,
    @JsonKey(name: 'created_at') DateTime createdAt,
    @JsonKey(name: 'updated_at') DateTime? updatedAt,
    @JsonKey(name: 'order_items') List<OrderItem>? items,
  });

  @override
  $DivisionNotesCopyWith<$Res>? get divisionNotes;
}

/// @nodoc
class __$$OrderImplCopyWithImpl<$Res>
    extends _$OrderCopyWithImpl<$Res, _$OrderImpl>
    implements _$$OrderImplCopyWith<$Res> {
  __$$OrderImplCopyWithImpl(
    _$OrderImpl _value,
    $Res Function(_$OrderImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of Order
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? tenantId = null,
    Object? createdBy = freezed,
    Object? type = null,
    Object? status = null,
    Object? referenceNumber = freezed,
    Object? entityName = freezed,
    Object? customerName = freezed,
    Object? source = freezed,
    Object? totalAmount = null,
    Object? taxAmount = null,
    Object? discountAmount = null,
    Object? transactionId = freezed,
    Object? notes = freezed,
    Object? divisionNotes = freezed,
    Object? fulfilledAt = freezed,
    Object? createdAt = null,
    Object? updatedAt = freezed,
    Object? items = freezed,
  }) {
    return _then(
      _$OrderImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as String,
        tenantId: null == tenantId
            ? _value.tenantId
            : tenantId // ignore: cast_nullable_to_non_nullable
                  as String,
        createdBy: freezed == createdBy
            ? _value.createdBy
            : createdBy // ignore: cast_nullable_to_non_nullable
                  as String?,
        type: null == type
            ? _value.type
            : type // ignore: cast_nullable_to_non_nullable
                  as String,
        status: null == status
            ? _value.status
            : status // ignore: cast_nullable_to_non_nullable
                  as String,
        referenceNumber: freezed == referenceNumber
            ? _value.referenceNumber
            : referenceNumber // ignore: cast_nullable_to_non_nullable
                  as String?,
        entityName: freezed == entityName
            ? _value.entityName
            : entityName // ignore: cast_nullable_to_non_nullable
                  as String?,
        customerName: freezed == customerName
            ? _value.customerName
            : customerName // ignore: cast_nullable_to_non_nullable
                  as String?,
        source: freezed == source
            ? _value.source
            : source // ignore: cast_nullable_to_non_nullable
                  as String?,
        totalAmount: null == totalAmount
            ? _value.totalAmount
            : totalAmount // ignore: cast_nullable_to_non_nullable
                  as double,
        taxAmount: null == taxAmount
            ? _value.taxAmount
            : taxAmount // ignore: cast_nullable_to_non_nullable
                  as double,
        discountAmount: null == discountAmount
            ? _value.discountAmount
            : discountAmount // ignore: cast_nullable_to_non_nullable
                  as double,
        transactionId: freezed == transactionId
            ? _value.transactionId
            : transactionId // ignore: cast_nullable_to_non_nullable
                  as String?,
        notes: freezed == notes
            ? _value.notes
            : notes // ignore: cast_nullable_to_non_nullable
                  as String?,
        divisionNotes: freezed == divisionNotes
            ? _value.divisionNotes
            : divisionNotes // ignore: cast_nullable_to_non_nullable
                  as DivisionNotes?,
        fulfilledAt: freezed == fulfilledAt
            ? _value.fulfilledAt
            : fulfilledAt // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
        createdAt: null == createdAt
            ? _value.createdAt
            : createdAt // ignore: cast_nullable_to_non_nullable
                  as DateTime,
        updatedAt: freezed == updatedAt
            ? _value.updatedAt
            : updatedAt // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
        items: freezed == items
            ? _value._items
            : items // ignore: cast_nullable_to_non_nullable
                  as List<OrderItem>?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$OrderImpl implements _Order {
  const _$OrderImpl({
    required this.id,
    @JsonKey(name: 'tenant_id') required this.tenantId,
    @JsonKey(name: 'created_by') this.createdBy,
    @JsonKey(name: 'type') required this.type,
    @JsonKey(name: 'status') required this.status,
    @JsonKey(name: 'reference_number') this.referenceNumber,
    @JsonKey(name: 'entity_name') this.entityName,
    @JsonKey(name: 'customer_name') this.customerName,
    @JsonKey(name: 'source') this.source,
    @JsonKey(name: 'total_amount') required this.totalAmount,
    @JsonKey(name: 'tax_amount') this.taxAmount = 0.0,
    @JsonKey(name: 'discount_amount') this.discountAmount = 0.0,
    @JsonKey(name: 'transaction_id') this.transactionId,
    @JsonKey(name: 'notes') this.notes,
    @JsonKey(name: 'division_notes') this.divisionNotes,
    @JsonKey(name: 'fulfilled_at') this.fulfilledAt,
    @JsonKey(name: 'created_at') required this.createdAt,
    @JsonKey(name: 'updated_at') this.updatedAt,
    @JsonKey(name: 'order_items') final List<OrderItem>? items,
  }) : _items = items;

  factory _$OrderImpl.fromJson(Map<String, dynamic> json) =>
      _$$OrderImplFromJson(json);

  @override
  final String id;
  @override
  @JsonKey(name: 'tenant_id')
  final String tenantId;
  @override
  @JsonKey(name: 'created_by')
  final String? createdBy;
  @override
  @JsonKey(name: 'type')
  final String type;
  // 'SO' or 'PO'
  @override
  @JsonKey(name: 'status')
  final String status;
  @override
  @JsonKey(name: 'reference_number')
  final String? referenceNumber;
  @override
  @JsonKey(name: 'entity_name')
  final String? entityName;
  @override
  @JsonKey(name: 'customer_name')
  final String? customerName;
  @override
  @JsonKey(name: 'source')
  final String? source;
  @override
  @JsonKey(name: 'total_amount')
  final double totalAmount;
  @override
  @JsonKey(name: 'tax_amount')
  final double taxAmount;
  @override
  @JsonKey(name: 'discount_amount')
  final double discountAmount;
  @override
  @JsonKey(name: 'transaction_id')
  final String? transactionId;
  @override
  @JsonKey(name: 'notes')
  final String? notes;
  @override
  @JsonKey(name: 'division_notes')
  final DivisionNotes? divisionNotes;
  @override
  @JsonKey(name: 'fulfilled_at')
  final DateTime? fulfilledAt;
  @override
  @JsonKey(name: 'created_at')
  final DateTime createdAt;
  @override
  @JsonKey(name: 'updated_at')
  final DateTime? updatedAt;
  final List<OrderItem>? _items;
  @override
  @JsonKey(name: 'order_items')
  List<OrderItem>? get items {
    final value = _items;
    if (value == null) return null;
    if (_items is EqualUnmodifiableListView) return _items;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(value);
  }

  @override
  String toString() {
    return 'Order(id: $id, tenantId: $tenantId, createdBy: $createdBy, type: $type, status: $status, referenceNumber: $referenceNumber, entityName: $entityName, customerName: $customerName, source: $source, totalAmount: $totalAmount, taxAmount: $taxAmount, discountAmount: $discountAmount, transactionId: $transactionId, notes: $notes, divisionNotes: $divisionNotes, fulfilledAt: $fulfilledAt, createdAt: $createdAt, updatedAt: $updatedAt, items: $items)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$OrderImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.tenantId, tenantId) ||
                other.tenantId == tenantId) &&
            (identical(other.createdBy, createdBy) ||
                other.createdBy == createdBy) &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.referenceNumber, referenceNumber) ||
                other.referenceNumber == referenceNumber) &&
            (identical(other.entityName, entityName) ||
                other.entityName == entityName) &&
            (identical(other.customerName, customerName) ||
                other.customerName == customerName) &&
            (identical(other.source, source) || other.source == source) &&
            (identical(other.totalAmount, totalAmount) ||
                other.totalAmount == totalAmount) &&
            (identical(other.taxAmount, taxAmount) ||
                other.taxAmount == taxAmount) &&
            (identical(other.discountAmount, discountAmount) ||
                other.discountAmount == discountAmount) &&
            (identical(other.transactionId, transactionId) ||
                other.transactionId == transactionId) &&
            (identical(other.notes, notes) || other.notes == notes) &&
            (identical(other.divisionNotes, divisionNotes) ||
                other.divisionNotes == divisionNotes) &&
            (identical(other.fulfilledAt, fulfilledAt) ||
                other.fulfilledAt == fulfilledAt) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt) &&
            const DeepCollectionEquality().equals(other._items, _items));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hashAll([
    runtimeType,
    id,
    tenantId,
    createdBy,
    type,
    status,
    referenceNumber,
    entityName,
    customerName,
    source,
    totalAmount,
    taxAmount,
    discountAmount,
    transactionId,
    notes,
    divisionNotes,
    fulfilledAt,
    createdAt,
    updatedAt,
    const DeepCollectionEquality().hash(_items),
  ]);

  /// Create a copy of Order
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$OrderImplCopyWith<_$OrderImpl> get copyWith =>
      __$$OrderImplCopyWithImpl<_$OrderImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$OrderImplToJson(this);
  }
}

abstract class _Order implements Order {
  const factory _Order({
    required final String id,
    @JsonKey(name: 'tenant_id') required final String tenantId,
    @JsonKey(name: 'created_by') final String? createdBy,
    @JsonKey(name: 'type') required final String type,
    @JsonKey(name: 'status') required final String status,
    @JsonKey(name: 'reference_number') final String? referenceNumber,
    @JsonKey(name: 'entity_name') final String? entityName,
    @JsonKey(name: 'customer_name') final String? customerName,
    @JsonKey(name: 'source') final String? source,
    @JsonKey(name: 'total_amount') required final double totalAmount,
    @JsonKey(name: 'tax_amount') final double taxAmount,
    @JsonKey(name: 'discount_amount') final double discountAmount,
    @JsonKey(name: 'transaction_id') final String? transactionId,
    @JsonKey(name: 'notes') final String? notes,
    @JsonKey(name: 'division_notes') final DivisionNotes? divisionNotes,
    @JsonKey(name: 'fulfilled_at') final DateTime? fulfilledAt,
    @JsonKey(name: 'created_at') required final DateTime createdAt,
    @JsonKey(name: 'updated_at') final DateTime? updatedAt,
    @JsonKey(name: 'order_items') final List<OrderItem>? items,
  }) = _$OrderImpl;

  factory _Order.fromJson(Map<String, dynamic> json) = _$OrderImpl.fromJson;

  @override
  String get id;
  @override
  @JsonKey(name: 'tenant_id')
  String get tenantId;
  @override
  @JsonKey(name: 'created_by')
  String? get createdBy;
  @override
  @JsonKey(name: 'type')
  String get type; // 'SO' or 'PO'
  @override
  @JsonKey(name: 'status')
  String get status;
  @override
  @JsonKey(name: 'reference_number')
  String? get referenceNumber;
  @override
  @JsonKey(name: 'entity_name')
  String? get entityName;
  @override
  @JsonKey(name: 'customer_name')
  String? get customerName;
  @override
  @JsonKey(name: 'source')
  String? get source;
  @override
  @JsonKey(name: 'total_amount')
  double get totalAmount;
  @override
  @JsonKey(name: 'tax_amount')
  double get taxAmount;
  @override
  @JsonKey(name: 'discount_amount')
  double get discountAmount;
  @override
  @JsonKey(name: 'transaction_id')
  String? get transactionId;
  @override
  @JsonKey(name: 'notes')
  String? get notes;
  @override
  @JsonKey(name: 'division_notes')
  DivisionNotes? get divisionNotes;
  @override
  @JsonKey(name: 'fulfilled_at')
  DateTime? get fulfilledAt;
  @override
  @JsonKey(name: 'created_at')
  DateTime get createdAt;
  @override
  @JsonKey(name: 'updated_at')
  DateTime? get updatedAt;
  @override
  @JsonKey(name: 'order_items')
  List<OrderItem>? get items;

  /// Create a copy of Order
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$OrderImplCopyWith<_$OrderImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

DivisionNotes _$DivisionNotesFromJson(Map<String, dynamic> json) {
  return _DivisionNotes.fromJson(json);
}

/// @nodoc
mixin _$DivisionNotes {
  String? get kasir => throw _privateConstructorUsedError;
  String? get stok => throw _privateConstructorUsedError;
  String? get dapur => throw _privateConstructorUsedError;

  /// Serializes this DivisionNotes to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of DivisionNotes
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $DivisionNotesCopyWith<DivisionNotes> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $DivisionNotesCopyWith<$Res> {
  factory $DivisionNotesCopyWith(
    DivisionNotes value,
    $Res Function(DivisionNotes) then,
  ) = _$DivisionNotesCopyWithImpl<$Res, DivisionNotes>;
  @useResult
  $Res call({String? kasir, String? stok, String? dapur});
}

/// @nodoc
class _$DivisionNotesCopyWithImpl<$Res, $Val extends DivisionNotes>
    implements $DivisionNotesCopyWith<$Res> {
  _$DivisionNotesCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of DivisionNotes
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? kasir = freezed,
    Object? stok = freezed,
    Object? dapur = freezed,
  }) {
    return _then(
      _value.copyWith(
            kasir: freezed == kasir
                ? _value.kasir
                : kasir // ignore: cast_nullable_to_non_nullable
                      as String?,
            stok: freezed == stok
                ? _value.stok
                : stok // ignore: cast_nullable_to_non_nullable
                      as String?,
            dapur: freezed == dapur
                ? _value.dapur
                : dapur // ignore: cast_nullable_to_non_nullable
                      as String?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$DivisionNotesImplCopyWith<$Res>
    implements $DivisionNotesCopyWith<$Res> {
  factory _$$DivisionNotesImplCopyWith(
    _$DivisionNotesImpl value,
    $Res Function(_$DivisionNotesImpl) then,
  ) = __$$DivisionNotesImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({String? kasir, String? stok, String? dapur});
}

/// @nodoc
class __$$DivisionNotesImplCopyWithImpl<$Res>
    extends _$DivisionNotesCopyWithImpl<$Res, _$DivisionNotesImpl>
    implements _$$DivisionNotesImplCopyWith<$Res> {
  __$$DivisionNotesImplCopyWithImpl(
    _$DivisionNotesImpl _value,
    $Res Function(_$DivisionNotesImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of DivisionNotes
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? kasir = freezed,
    Object? stok = freezed,
    Object? dapur = freezed,
  }) {
    return _then(
      _$DivisionNotesImpl(
        kasir: freezed == kasir
            ? _value.kasir
            : kasir // ignore: cast_nullable_to_non_nullable
                  as String?,
        stok: freezed == stok
            ? _value.stok
            : stok // ignore: cast_nullable_to_non_nullable
                  as String?,
        dapur: freezed == dapur
            ? _value.dapur
            : dapur // ignore: cast_nullable_to_non_nullable
                  as String?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$DivisionNotesImpl implements _DivisionNotes {
  const _$DivisionNotesImpl({this.kasir, this.stok, this.dapur});

  factory _$DivisionNotesImpl.fromJson(Map<String, dynamic> json) =>
      _$$DivisionNotesImplFromJson(json);

  @override
  final String? kasir;
  @override
  final String? stok;
  @override
  final String? dapur;

  @override
  String toString() {
    return 'DivisionNotes(kasir: $kasir, stok: $stok, dapur: $dapur)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$DivisionNotesImpl &&
            (identical(other.kasir, kasir) || other.kasir == kasir) &&
            (identical(other.stok, stok) || other.stok == stok) &&
            (identical(other.dapur, dapur) || other.dapur == dapur));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, kasir, stok, dapur);

  /// Create a copy of DivisionNotes
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$DivisionNotesImplCopyWith<_$DivisionNotesImpl> get copyWith =>
      __$$DivisionNotesImplCopyWithImpl<_$DivisionNotesImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$DivisionNotesImplToJson(this);
  }
}

abstract class _DivisionNotes implements DivisionNotes {
  const factory _DivisionNotes({
    final String? kasir,
    final String? stok,
    final String? dapur,
  }) = _$DivisionNotesImpl;

  factory _DivisionNotes.fromJson(Map<String, dynamic> json) =
      _$DivisionNotesImpl.fromJson;

  @override
  String? get kasir;
  @override
  String? get stok;
  @override
  String? get dapur;

  /// Create a copy of DivisionNotes
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$DivisionNotesImplCopyWith<_$DivisionNotesImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

OrderItem _$OrderItemFromJson(Map<String, dynamic> json) {
  return _OrderItem.fromJson(json);
}

/// @nodoc
mixin _$OrderItem {
  String get id => throw _privateConstructorUsedError;
  @JsonKey(name: 'order_id')
  String get orderId => throw _privateConstructorUsedError;
  @JsonKey(name: 'product_id')
  String get productId => throw _privateConstructorUsedError;
  double get quantity => throw _privateConstructorUsedError;
  @JsonKey(name: 'unit_price')
  double get unitPrice => throw _privateConstructorUsedError;
  @JsonKey(name: 'created_at')
  DateTime? get createdAt => throw _privateConstructorUsedError;
  @JsonKey(name: 'products')
  ProductInfo? get product => throw _privateConstructorUsedError;

  /// Serializes this OrderItem to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of OrderItem
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $OrderItemCopyWith<OrderItem> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $OrderItemCopyWith<$Res> {
  factory $OrderItemCopyWith(OrderItem value, $Res Function(OrderItem) then) =
      _$OrderItemCopyWithImpl<$Res, OrderItem>;
  @useResult
  $Res call({
    String id,
    @JsonKey(name: 'order_id') String orderId,
    @JsonKey(name: 'product_id') String productId,
    double quantity,
    @JsonKey(name: 'unit_price') double unitPrice,
    @JsonKey(name: 'created_at') DateTime? createdAt,
    @JsonKey(name: 'products') ProductInfo? product,
  });

  $ProductInfoCopyWith<$Res>? get product;
}

/// @nodoc
class _$OrderItemCopyWithImpl<$Res, $Val extends OrderItem>
    implements $OrderItemCopyWith<$Res> {
  _$OrderItemCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of OrderItem
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? orderId = null,
    Object? productId = null,
    Object? quantity = null,
    Object? unitPrice = null,
    Object? createdAt = freezed,
    Object? product = freezed,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as String,
            orderId: null == orderId
                ? _value.orderId
                : orderId // ignore: cast_nullable_to_non_nullable
                      as String,
            productId: null == productId
                ? _value.productId
                : productId // ignore: cast_nullable_to_non_nullable
                      as String,
            quantity: null == quantity
                ? _value.quantity
                : quantity // ignore: cast_nullable_to_non_nullable
                      as double,
            unitPrice: null == unitPrice
                ? _value.unitPrice
                : unitPrice // ignore: cast_nullable_to_non_nullable
                      as double,
            createdAt: freezed == createdAt
                ? _value.createdAt
                : createdAt // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
            product: freezed == product
                ? _value.product
                : product // ignore: cast_nullable_to_non_nullable
                      as ProductInfo?,
          )
          as $Val,
    );
  }

  /// Create a copy of OrderItem
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $ProductInfoCopyWith<$Res>? get product {
    if (_value.product == null) {
      return null;
    }

    return $ProductInfoCopyWith<$Res>(_value.product!, (value) {
      return _then(_value.copyWith(product: value) as $Val);
    });
  }
}

/// @nodoc
abstract class _$$OrderItemImplCopyWith<$Res>
    implements $OrderItemCopyWith<$Res> {
  factory _$$OrderItemImplCopyWith(
    _$OrderItemImpl value,
    $Res Function(_$OrderItemImpl) then,
  ) = __$$OrderItemImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String id,
    @JsonKey(name: 'order_id') String orderId,
    @JsonKey(name: 'product_id') String productId,
    double quantity,
    @JsonKey(name: 'unit_price') double unitPrice,
    @JsonKey(name: 'created_at') DateTime? createdAt,
    @JsonKey(name: 'products') ProductInfo? product,
  });

  @override
  $ProductInfoCopyWith<$Res>? get product;
}

/// @nodoc
class __$$OrderItemImplCopyWithImpl<$Res>
    extends _$OrderItemCopyWithImpl<$Res, _$OrderItemImpl>
    implements _$$OrderItemImplCopyWith<$Res> {
  __$$OrderItemImplCopyWithImpl(
    _$OrderItemImpl _value,
    $Res Function(_$OrderItemImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of OrderItem
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? orderId = null,
    Object? productId = null,
    Object? quantity = null,
    Object? unitPrice = null,
    Object? createdAt = freezed,
    Object? product = freezed,
  }) {
    return _then(
      _$OrderItemImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as String,
        orderId: null == orderId
            ? _value.orderId
            : orderId // ignore: cast_nullable_to_non_nullable
                  as String,
        productId: null == productId
            ? _value.productId
            : productId // ignore: cast_nullable_to_non_nullable
                  as String,
        quantity: null == quantity
            ? _value.quantity
            : quantity // ignore: cast_nullable_to_non_nullable
                  as double,
        unitPrice: null == unitPrice
            ? _value.unitPrice
            : unitPrice // ignore: cast_nullable_to_non_nullable
                  as double,
        createdAt: freezed == createdAt
            ? _value.createdAt
            : createdAt // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
        product: freezed == product
            ? _value.product
            : product // ignore: cast_nullable_to_non_nullable
                  as ProductInfo?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$OrderItemImpl implements _OrderItem {
  const _$OrderItemImpl({
    required this.id,
    @JsonKey(name: 'order_id') required this.orderId,
    @JsonKey(name: 'product_id') required this.productId,
    required this.quantity,
    @JsonKey(name: 'unit_price') required this.unitPrice,
    @JsonKey(name: 'created_at') this.createdAt,
    @JsonKey(name: 'products') this.product,
  });

  factory _$OrderItemImpl.fromJson(Map<String, dynamic> json) =>
      _$$OrderItemImplFromJson(json);

  @override
  final String id;
  @override
  @JsonKey(name: 'order_id')
  final String orderId;
  @override
  @JsonKey(name: 'product_id')
  final String productId;
  @override
  final double quantity;
  @override
  @JsonKey(name: 'unit_price')
  final double unitPrice;
  @override
  @JsonKey(name: 'created_at')
  final DateTime? createdAt;
  @override
  @JsonKey(name: 'products')
  final ProductInfo? product;

  @override
  String toString() {
    return 'OrderItem(id: $id, orderId: $orderId, productId: $productId, quantity: $quantity, unitPrice: $unitPrice, createdAt: $createdAt, product: $product)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$OrderItemImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.orderId, orderId) || other.orderId == orderId) &&
            (identical(other.productId, productId) ||
                other.productId == productId) &&
            (identical(other.quantity, quantity) ||
                other.quantity == quantity) &&
            (identical(other.unitPrice, unitPrice) ||
                other.unitPrice == unitPrice) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.product, product) || other.product == product));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    orderId,
    productId,
    quantity,
    unitPrice,
    createdAt,
    product,
  );

  /// Create a copy of OrderItem
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$OrderItemImplCopyWith<_$OrderItemImpl> get copyWith =>
      __$$OrderItemImplCopyWithImpl<_$OrderItemImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$OrderItemImplToJson(this);
  }
}

abstract class _OrderItem implements OrderItem {
  const factory _OrderItem({
    required final String id,
    @JsonKey(name: 'order_id') required final String orderId,
    @JsonKey(name: 'product_id') required final String productId,
    required final double quantity,
    @JsonKey(name: 'unit_price') required final double unitPrice,
    @JsonKey(name: 'created_at') final DateTime? createdAt,
    @JsonKey(name: 'products') final ProductInfo? product,
  }) = _$OrderItemImpl;

  factory _OrderItem.fromJson(Map<String, dynamic> json) =
      _$OrderItemImpl.fromJson;

  @override
  String get id;
  @override
  @JsonKey(name: 'order_id')
  String get orderId;
  @override
  @JsonKey(name: 'product_id')
  String get productId;
  @override
  double get quantity;
  @override
  @JsonKey(name: 'unit_price')
  double get unitPrice;
  @override
  @JsonKey(name: 'created_at')
  DateTime? get createdAt;
  @override
  @JsonKey(name: 'products')
  ProductInfo? get product;

  /// Create a copy of OrderItem
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$OrderItemImplCopyWith<_$OrderItemImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

ProductInfo _$ProductInfoFromJson(Map<String, dynamic> json) {
  return _ProductInfo.fromJson(json);
}

/// @nodoc
mixin _$ProductInfo {
  String get name => throw _privateConstructorUsedError;

  /// Serializes this ProductInfo to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of ProductInfo
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $ProductInfoCopyWith<ProductInfo> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $ProductInfoCopyWith<$Res> {
  factory $ProductInfoCopyWith(
    ProductInfo value,
    $Res Function(ProductInfo) then,
  ) = _$ProductInfoCopyWithImpl<$Res, ProductInfo>;
  @useResult
  $Res call({String name});
}

/// @nodoc
class _$ProductInfoCopyWithImpl<$Res, $Val extends ProductInfo>
    implements $ProductInfoCopyWith<$Res> {
  _$ProductInfoCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of ProductInfo
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? name = null}) {
    return _then(
      _value.copyWith(
            name: null == name
                ? _value.name
                : name // ignore: cast_nullable_to_non_nullable
                      as String,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$ProductInfoImplCopyWith<$Res>
    implements $ProductInfoCopyWith<$Res> {
  factory _$$ProductInfoImplCopyWith(
    _$ProductInfoImpl value,
    $Res Function(_$ProductInfoImpl) then,
  ) = __$$ProductInfoImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({String name});
}

/// @nodoc
class __$$ProductInfoImplCopyWithImpl<$Res>
    extends _$ProductInfoCopyWithImpl<$Res, _$ProductInfoImpl>
    implements _$$ProductInfoImplCopyWith<$Res> {
  __$$ProductInfoImplCopyWithImpl(
    _$ProductInfoImpl _value,
    $Res Function(_$ProductInfoImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of ProductInfo
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? name = null}) {
    return _then(
      _$ProductInfoImpl(
        name: null == name
            ? _value.name
            : name // ignore: cast_nullable_to_non_nullable
                  as String,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$ProductInfoImpl implements _ProductInfo {
  const _$ProductInfoImpl({required this.name});

  factory _$ProductInfoImpl.fromJson(Map<String, dynamic> json) =>
      _$$ProductInfoImplFromJson(json);

  @override
  final String name;

  @override
  String toString() {
    return 'ProductInfo(name: $name)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$ProductInfoImpl &&
            (identical(other.name, name) || other.name == name));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, name);

  /// Create a copy of ProductInfo
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$ProductInfoImplCopyWith<_$ProductInfoImpl> get copyWith =>
      __$$ProductInfoImplCopyWithImpl<_$ProductInfoImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$ProductInfoImplToJson(this);
  }
}

abstract class _ProductInfo implements ProductInfo {
  const factory _ProductInfo({required final String name}) = _$ProductInfoImpl;

  factory _ProductInfo.fromJson(Map<String, dynamic> json) =
      _$ProductInfoImpl.fromJson;

  @override
  String get name;

  /// Create a copy of ProductInfo
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$ProductInfoImplCopyWith<_$ProductInfoImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
