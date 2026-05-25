// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'recurring_transaction.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

RecurringTransaction _$RecurringTransactionFromJson(Map<String, dynamic> json) {
  return _RecurringTransaction.fromJson(json);
}

/// @nodoc
mixin _$RecurringTransaction {
  String get id => throw _privateConstructorUsedError;
  @JsonKey(name: 'tenant_id')
  String get tenantId => throw _privateConstructorUsedError;
  String get name => throw _privateConstructorUsedError;
  double get amount => throw _privateConstructorUsedError;
  String get direction => throw _privateConstructorUsedError;
  @JsonKey(name: 'debit_account_id')
  String get debitAccountId => throw _privateConstructorUsedError;
  @JsonKey(name: 'credit_account_id')
  String get creditAccountId => throw _privateConstructorUsedError;
  String get frequency => throw _privateConstructorUsedError;
  @JsonKey(name: 'day_of_period')
  int? get dayOfPeriod => throw _privateConstructorUsedError;
  @JsonKey(name: 'next_due_date')
  String get nextDueDate => throw _privateConstructorUsedError;
  @JsonKey(name: 'is_active')
  bool get isActive => throw _privateConstructorUsedError;
  @JsonKey(name: 'last_triggered_at')
  String? get lastTriggeredAt => throw _privateConstructorUsedError;

  /// Serializes this RecurringTransaction to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of RecurringTransaction
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $RecurringTransactionCopyWith<RecurringTransaction> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $RecurringTransactionCopyWith<$Res> {
  factory $RecurringTransactionCopyWith(
    RecurringTransaction value,
    $Res Function(RecurringTransaction) then,
  ) = _$RecurringTransactionCopyWithImpl<$Res, RecurringTransaction>;
  @useResult
  $Res call({
    String id,
    @JsonKey(name: 'tenant_id') String tenantId,
    String name,
    double amount,
    String direction,
    @JsonKey(name: 'debit_account_id') String debitAccountId,
    @JsonKey(name: 'credit_account_id') String creditAccountId,
    String frequency,
    @JsonKey(name: 'day_of_period') int? dayOfPeriod,
    @JsonKey(name: 'next_due_date') String nextDueDate,
    @JsonKey(name: 'is_active') bool isActive,
    @JsonKey(name: 'last_triggered_at') String? lastTriggeredAt,
  });
}

/// @nodoc
class _$RecurringTransactionCopyWithImpl<
  $Res,
  $Val extends RecurringTransaction
>
    implements $RecurringTransactionCopyWith<$Res> {
  _$RecurringTransactionCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of RecurringTransaction
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? tenantId = null,
    Object? name = null,
    Object? amount = null,
    Object? direction = null,
    Object? debitAccountId = null,
    Object? creditAccountId = null,
    Object? frequency = null,
    Object? dayOfPeriod = freezed,
    Object? nextDueDate = null,
    Object? isActive = null,
    Object? lastTriggeredAt = freezed,
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
            name: null == name
                ? _value.name
                : name // ignore: cast_nullable_to_non_nullable
                      as String,
            amount: null == amount
                ? _value.amount
                : amount // ignore: cast_nullable_to_non_nullable
                      as double,
            direction: null == direction
                ? _value.direction
                : direction // ignore: cast_nullable_to_non_nullable
                      as String,
            debitAccountId: null == debitAccountId
                ? _value.debitAccountId
                : debitAccountId // ignore: cast_nullable_to_non_nullable
                      as String,
            creditAccountId: null == creditAccountId
                ? _value.creditAccountId
                : creditAccountId // ignore: cast_nullable_to_non_nullable
                      as String,
            frequency: null == frequency
                ? _value.frequency
                : frequency // ignore: cast_nullable_to_non_nullable
                      as String,
            dayOfPeriod: freezed == dayOfPeriod
                ? _value.dayOfPeriod
                : dayOfPeriod // ignore: cast_nullable_to_non_nullable
                      as int?,
            nextDueDate: null == nextDueDate
                ? _value.nextDueDate
                : nextDueDate // ignore: cast_nullable_to_non_nullable
                      as String,
            isActive: null == isActive
                ? _value.isActive
                : isActive // ignore: cast_nullable_to_non_nullable
                      as bool,
            lastTriggeredAt: freezed == lastTriggeredAt
                ? _value.lastTriggeredAt
                : lastTriggeredAt // ignore: cast_nullable_to_non_nullable
                      as String?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$RecurringTransactionImplCopyWith<$Res>
    implements $RecurringTransactionCopyWith<$Res> {
  factory _$$RecurringTransactionImplCopyWith(
    _$RecurringTransactionImpl value,
    $Res Function(_$RecurringTransactionImpl) then,
  ) = __$$RecurringTransactionImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String id,
    @JsonKey(name: 'tenant_id') String tenantId,
    String name,
    double amount,
    String direction,
    @JsonKey(name: 'debit_account_id') String debitAccountId,
    @JsonKey(name: 'credit_account_id') String creditAccountId,
    String frequency,
    @JsonKey(name: 'day_of_period') int? dayOfPeriod,
    @JsonKey(name: 'next_due_date') String nextDueDate,
    @JsonKey(name: 'is_active') bool isActive,
    @JsonKey(name: 'last_triggered_at') String? lastTriggeredAt,
  });
}

/// @nodoc
class __$$RecurringTransactionImplCopyWithImpl<$Res>
    extends _$RecurringTransactionCopyWithImpl<$Res, _$RecurringTransactionImpl>
    implements _$$RecurringTransactionImplCopyWith<$Res> {
  __$$RecurringTransactionImplCopyWithImpl(
    _$RecurringTransactionImpl _value,
    $Res Function(_$RecurringTransactionImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of RecurringTransaction
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? tenantId = null,
    Object? name = null,
    Object? amount = null,
    Object? direction = null,
    Object? debitAccountId = null,
    Object? creditAccountId = null,
    Object? frequency = null,
    Object? dayOfPeriod = freezed,
    Object? nextDueDate = null,
    Object? isActive = null,
    Object? lastTriggeredAt = freezed,
  }) {
    return _then(
      _$RecurringTransactionImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as String,
        tenantId: null == tenantId
            ? _value.tenantId
            : tenantId // ignore: cast_nullable_to_non_nullable
                  as String,
        name: null == name
            ? _value.name
            : name // ignore: cast_nullable_to_non_nullable
                  as String,
        amount: null == amount
            ? _value.amount
            : amount // ignore: cast_nullable_to_non_nullable
                  as double,
        direction: null == direction
            ? _value.direction
            : direction // ignore: cast_nullable_to_non_nullable
                  as String,
        debitAccountId: null == debitAccountId
            ? _value.debitAccountId
            : debitAccountId // ignore: cast_nullable_to_non_nullable
                  as String,
        creditAccountId: null == creditAccountId
            ? _value.creditAccountId
            : creditAccountId // ignore: cast_nullable_to_non_nullable
                  as String,
        frequency: null == frequency
            ? _value.frequency
            : frequency // ignore: cast_nullable_to_non_nullable
                  as String,
        dayOfPeriod: freezed == dayOfPeriod
            ? _value.dayOfPeriod
            : dayOfPeriod // ignore: cast_nullable_to_non_nullable
                  as int?,
        nextDueDate: null == nextDueDate
            ? _value.nextDueDate
            : nextDueDate // ignore: cast_nullable_to_non_nullable
                  as String,
        isActive: null == isActive
            ? _value.isActive
            : isActive // ignore: cast_nullable_to_non_nullable
                  as bool,
        lastTriggeredAt: freezed == lastTriggeredAt
            ? _value.lastTriggeredAt
            : lastTriggeredAt // ignore: cast_nullable_to_non_nullable
                  as String?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$RecurringTransactionImpl implements _RecurringTransaction {
  const _$RecurringTransactionImpl({
    required this.id,
    @JsonKey(name: 'tenant_id') required this.tenantId,
    required this.name,
    required this.amount,
    required this.direction,
    @JsonKey(name: 'debit_account_id') required this.debitAccountId,
    @JsonKey(name: 'credit_account_id') required this.creditAccountId,
    required this.frequency,
    @JsonKey(name: 'day_of_period') this.dayOfPeriod,
    @JsonKey(name: 'next_due_date') required this.nextDueDate,
    @JsonKey(name: 'is_active') required this.isActive,
    @JsonKey(name: 'last_triggered_at') this.lastTriggeredAt,
  });

  factory _$RecurringTransactionImpl.fromJson(Map<String, dynamic> json) =>
      _$$RecurringTransactionImplFromJson(json);

  @override
  final String id;
  @override
  @JsonKey(name: 'tenant_id')
  final String tenantId;
  @override
  final String name;
  @override
  final double amount;
  @override
  final String direction;
  @override
  @JsonKey(name: 'debit_account_id')
  final String debitAccountId;
  @override
  @JsonKey(name: 'credit_account_id')
  final String creditAccountId;
  @override
  final String frequency;
  @override
  @JsonKey(name: 'day_of_period')
  final int? dayOfPeriod;
  @override
  @JsonKey(name: 'next_due_date')
  final String nextDueDate;
  @override
  @JsonKey(name: 'is_active')
  final bool isActive;
  @override
  @JsonKey(name: 'last_triggered_at')
  final String? lastTriggeredAt;

  @override
  String toString() {
    return 'RecurringTransaction(id: $id, tenantId: $tenantId, name: $name, amount: $amount, direction: $direction, debitAccountId: $debitAccountId, creditAccountId: $creditAccountId, frequency: $frequency, dayOfPeriod: $dayOfPeriod, nextDueDate: $nextDueDate, isActive: $isActive, lastTriggeredAt: $lastTriggeredAt)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$RecurringTransactionImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.tenantId, tenantId) ||
                other.tenantId == tenantId) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.amount, amount) || other.amount == amount) &&
            (identical(other.direction, direction) ||
                other.direction == direction) &&
            (identical(other.debitAccountId, debitAccountId) ||
                other.debitAccountId == debitAccountId) &&
            (identical(other.creditAccountId, creditAccountId) ||
                other.creditAccountId == creditAccountId) &&
            (identical(other.frequency, frequency) ||
                other.frequency == frequency) &&
            (identical(other.dayOfPeriod, dayOfPeriod) ||
                other.dayOfPeriod == dayOfPeriod) &&
            (identical(other.nextDueDate, nextDueDate) ||
                other.nextDueDate == nextDueDate) &&
            (identical(other.isActive, isActive) ||
                other.isActive == isActive) &&
            (identical(other.lastTriggeredAt, lastTriggeredAt) ||
                other.lastTriggeredAt == lastTriggeredAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    tenantId,
    name,
    amount,
    direction,
    debitAccountId,
    creditAccountId,
    frequency,
    dayOfPeriod,
    nextDueDate,
    isActive,
    lastTriggeredAt,
  );

  /// Create a copy of RecurringTransaction
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$RecurringTransactionImplCopyWith<_$RecurringTransactionImpl>
  get copyWith =>
      __$$RecurringTransactionImplCopyWithImpl<_$RecurringTransactionImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$RecurringTransactionImplToJson(this);
  }
}

abstract class _RecurringTransaction implements RecurringTransaction {
  const factory _RecurringTransaction({
    required final String id,
    @JsonKey(name: 'tenant_id') required final String tenantId,
    required final String name,
    required final double amount,
    required final String direction,
    @JsonKey(name: 'debit_account_id') required final String debitAccountId,
    @JsonKey(name: 'credit_account_id') required final String creditAccountId,
    required final String frequency,
    @JsonKey(name: 'day_of_period') final int? dayOfPeriod,
    @JsonKey(name: 'next_due_date') required final String nextDueDate,
    @JsonKey(name: 'is_active') required final bool isActive,
    @JsonKey(name: 'last_triggered_at') final String? lastTriggeredAt,
  }) = _$RecurringTransactionImpl;

  factory _RecurringTransaction.fromJson(Map<String, dynamic> json) =
      _$RecurringTransactionImpl.fromJson;

  @override
  String get id;
  @override
  @JsonKey(name: 'tenant_id')
  String get tenantId;
  @override
  String get name;
  @override
  double get amount;
  @override
  String get direction;
  @override
  @JsonKey(name: 'debit_account_id')
  String get debitAccountId;
  @override
  @JsonKey(name: 'credit_account_id')
  String get creditAccountId;
  @override
  String get frequency;
  @override
  @JsonKey(name: 'day_of_period')
  int? get dayOfPeriod;
  @override
  @JsonKey(name: 'next_due_date')
  String get nextDueDate;
  @override
  @JsonKey(name: 'is_active')
  bool get isActive;
  @override
  @JsonKey(name: 'last_triggered_at')
  String? get lastTriggeredAt;

  /// Create a copy of RecurringTransaction
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$RecurringTransactionImplCopyWith<_$RecurringTransactionImpl>
  get copyWith => throw _privateConstructorUsedError;
}
