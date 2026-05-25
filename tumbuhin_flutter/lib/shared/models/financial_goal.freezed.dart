// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'financial_goal.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

FinancialGoal _$FinancialGoalFromJson(Map<String, dynamic> json) {
  return _FinancialGoal.fromJson(json);
}

/// @nodoc
mixin _$FinancialGoal {
  String get id => throw _privateConstructorUsedError;
  @JsonKey(name: 'tenant_id')
  String get tenantId => throw _privateConstructorUsedError;
  String get name => throw _privateConstructorUsedError;
  @JsonKey(name: 'goal_type')
  String get goalType => throw _privateConstructorUsedError;
  @JsonKey(name: 'target_amount')
  double get targetAmount => throw _privateConstructorUsedError;
  @JsonKey(name: 'current_amount')
  double get currentAmount => throw _privateConstructorUsedError;
  @JsonKey(name: 'target_date')
  String? get targetDate => throw _privateConstructorUsedError;
  @JsonKey(name: 'linked_account_id')
  String? get linkedAccountId => throw _privateConstructorUsedError;
  String? get notes => throw _privateConstructorUsedError;
  String get status => throw _privateConstructorUsedError;
  @JsonKey(name: 'progress_pct')
  double? get progressPct => throw _privateConstructorUsedError;
  @JsonKey(name: 'created_at')
  String? get createdAt => throw _privateConstructorUsedError;

  /// Serializes this FinancialGoal to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of FinancialGoal
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $FinancialGoalCopyWith<FinancialGoal> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $FinancialGoalCopyWith<$Res> {
  factory $FinancialGoalCopyWith(
    FinancialGoal value,
    $Res Function(FinancialGoal) then,
  ) = _$FinancialGoalCopyWithImpl<$Res, FinancialGoal>;
  @useResult
  $Res call({
    String id,
    @JsonKey(name: 'tenant_id') String tenantId,
    String name,
    @JsonKey(name: 'goal_type') String goalType,
    @JsonKey(name: 'target_amount') double targetAmount,
    @JsonKey(name: 'current_amount') double currentAmount,
    @JsonKey(name: 'target_date') String? targetDate,
    @JsonKey(name: 'linked_account_id') String? linkedAccountId,
    String? notes,
    String status,
    @JsonKey(name: 'progress_pct') double? progressPct,
    @JsonKey(name: 'created_at') String? createdAt,
  });
}

/// @nodoc
class _$FinancialGoalCopyWithImpl<$Res, $Val extends FinancialGoal>
    implements $FinancialGoalCopyWith<$Res> {
  _$FinancialGoalCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of FinancialGoal
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? tenantId = null,
    Object? name = null,
    Object? goalType = null,
    Object? targetAmount = null,
    Object? currentAmount = null,
    Object? targetDate = freezed,
    Object? linkedAccountId = freezed,
    Object? notes = freezed,
    Object? status = null,
    Object? progressPct = freezed,
    Object? createdAt = freezed,
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
            goalType: null == goalType
                ? _value.goalType
                : goalType // ignore: cast_nullable_to_non_nullable
                      as String,
            targetAmount: null == targetAmount
                ? _value.targetAmount
                : targetAmount // ignore: cast_nullable_to_non_nullable
                      as double,
            currentAmount: null == currentAmount
                ? _value.currentAmount
                : currentAmount // ignore: cast_nullable_to_non_nullable
                      as double,
            targetDate: freezed == targetDate
                ? _value.targetDate
                : targetDate // ignore: cast_nullable_to_non_nullable
                      as String?,
            linkedAccountId: freezed == linkedAccountId
                ? _value.linkedAccountId
                : linkedAccountId // ignore: cast_nullable_to_non_nullable
                      as String?,
            notes: freezed == notes
                ? _value.notes
                : notes // ignore: cast_nullable_to_non_nullable
                      as String?,
            status: null == status
                ? _value.status
                : status // ignore: cast_nullable_to_non_nullable
                      as String,
            progressPct: freezed == progressPct
                ? _value.progressPct
                : progressPct // ignore: cast_nullable_to_non_nullable
                      as double?,
            createdAt: freezed == createdAt
                ? _value.createdAt
                : createdAt // ignore: cast_nullable_to_non_nullable
                      as String?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$FinancialGoalImplCopyWith<$Res>
    implements $FinancialGoalCopyWith<$Res> {
  factory _$$FinancialGoalImplCopyWith(
    _$FinancialGoalImpl value,
    $Res Function(_$FinancialGoalImpl) then,
  ) = __$$FinancialGoalImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String id,
    @JsonKey(name: 'tenant_id') String tenantId,
    String name,
    @JsonKey(name: 'goal_type') String goalType,
    @JsonKey(name: 'target_amount') double targetAmount,
    @JsonKey(name: 'current_amount') double currentAmount,
    @JsonKey(name: 'target_date') String? targetDate,
    @JsonKey(name: 'linked_account_id') String? linkedAccountId,
    String? notes,
    String status,
    @JsonKey(name: 'progress_pct') double? progressPct,
    @JsonKey(name: 'created_at') String? createdAt,
  });
}

/// @nodoc
class __$$FinancialGoalImplCopyWithImpl<$Res>
    extends _$FinancialGoalCopyWithImpl<$Res, _$FinancialGoalImpl>
    implements _$$FinancialGoalImplCopyWith<$Res> {
  __$$FinancialGoalImplCopyWithImpl(
    _$FinancialGoalImpl _value,
    $Res Function(_$FinancialGoalImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of FinancialGoal
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? tenantId = null,
    Object? name = null,
    Object? goalType = null,
    Object? targetAmount = null,
    Object? currentAmount = null,
    Object? targetDate = freezed,
    Object? linkedAccountId = freezed,
    Object? notes = freezed,
    Object? status = null,
    Object? progressPct = freezed,
    Object? createdAt = freezed,
  }) {
    return _then(
      _$FinancialGoalImpl(
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
        goalType: null == goalType
            ? _value.goalType
            : goalType // ignore: cast_nullable_to_non_nullable
                  as String,
        targetAmount: null == targetAmount
            ? _value.targetAmount
            : targetAmount // ignore: cast_nullable_to_non_nullable
                  as double,
        currentAmount: null == currentAmount
            ? _value.currentAmount
            : currentAmount // ignore: cast_nullable_to_non_nullable
                  as double,
        targetDate: freezed == targetDate
            ? _value.targetDate
            : targetDate // ignore: cast_nullable_to_non_nullable
                  as String?,
        linkedAccountId: freezed == linkedAccountId
            ? _value.linkedAccountId
            : linkedAccountId // ignore: cast_nullable_to_non_nullable
                  as String?,
        notes: freezed == notes
            ? _value.notes
            : notes // ignore: cast_nullable_to_non_nullable
                  as String?,
        status: null == status
            ? _value.status
            : status // ignore: cast_nullable_to_non_nullable
                  as String,
        progressPct: freezed == progressPct
            ? _value.progressPct
            : progressPct // ignore: cast_nullable_to_non_nullable
                  as double?,
        createdAt: freezed == createdAt
            ? _value.createdAt
            : createdAt // ignore: cast_nullable_to_non_nullable
                  as String?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$FinancialGoalImpl implements _FinancialGoal {
  const _$FinancialGoalImpl({
    required this.id,
    @JsonKey(name: 'tenant_id') required this.tenantId,
    required this.name,
    @JsonKey(name: 'goal_type') required this.goalType,
    @JsonKey(name: 'target_amount') required this.targetAmount,
    @JsonKey(name: 'current_amount') required this.currentAmount,
    @JsonKey(name: 'target_date') this.targetDate,
    @JsonKey(name: 'linked_account_id') this.linkedAccountId,
    this.notes,
    required this.status,
    @JsonKey(name: 'progress_pct') this.progressPct,
    @JsonKey(name: 'created_at') this.createdAt,
  });

  factory _$FinancialGoalImpl.fromJson(Map<String, dynamic> json) =>
      _$$FinancialGoalImplFromJson(json);

  @override
  final String id;
  @override
  @JsonKey(name: 'tenant_id')
  final String tenantId;
  @override
  final String name;
  @override
  @JsonKey(name: 'goal_type')
  final String goalType;
  @override
  @JsonKey(name: 'target_amount')
  final double targetAmount;
  @override
  @JsonKey(name: 'current_amount')
  final double currentAmount;
  @override
  @JsonKey(name: 'target_date')
  final String? targetDate;
  @override
  @JsonKey(name: 'linked_account_id')
  final String? linkedAccountId;
  @override
  final String? notes;
  @override
  final String status;
  @override
  @JsonKey(name: 'progress_pct')
  final double? progressPct;
  @override
  @JsonKey(name: 'created_at')
  final String? createdAt;

  @override
  String toString() {
    return 'FinancialGoal(id: $id, tenantId: $tenantId, name: $name, goalType: $goalType, targetAmount: $targetAmount, currentAmount: $currentAmount, targetDate: $targetDate, linkedAccountId: $linkedAccountId, notes: $notes, status: $status, progressPct: $progressPct, createdAt: $createdAt)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$FinancialGoalImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.tenantId, tenantId) ||
                other.tenantId == tenantId) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.goalType, goalType) ||
                other.goalType == goalType) &&
            (identical(other.targetAmount, targetAmount) ||
                other.targetAmount == targetAmount) &&
            (identical(other.currentAmount, currentAmount) ||
                other.currentAmount == currentAmount) &&
            (identical(other.targetDate, targetDate) ||
                other.targetDate == targetDate) &&
            (identical(other.linkedAccountId, linkedAccountId) ||
                other.linkedAccountId == linkedAccountId) &&
            (identical(other.notes, notes) || other.notes == notes) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.progressPct, progressPct) ||
                other.progressPct == progressPct) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    tenantId,
    name,
    goalType,
    targetAmount,
    currentAmount,
    targetDate,
    linkedAccountId,
    notes,
    status,
    progressPct,
    createdAt,
  );

  /// Create a copy of FinancialGoal
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$FinancialGoalImplCopyWith<_$FinancialGoalImpl> get copyWith =>
      __$$FinancialGoalImplCopyWithImpl<_$FinancialGoalImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$FinancialGoalImplToJson(this);
  }
}

abstract class _FinancialGoal implements FinancialGoal {
  const factory _FinancialGoal({
    required final String id,
    @JsonKey(name: 'tenant_id') required final String tenantId,
    required final String name,
    @JsonKey(name: 'goal_type') required final String goalType,
    @JsonKey(name: 'target_amount') required final double targetAmount,
    @JsonKey(name: 'current_amount') required final double currentAmount,
    @JsonKey(name: 'target_date') final String? targetDate,
    @JsonKey(name: 'linked_account_id') final String? linkedAccountId,
    final String? notes,
    required final String status,
    @JsonKey(name: 'progress_pct') final double? progressPct,
    @JsonKey(name: 'created_at') final String? createdAt,
  }) = _$FinancialGoalImpl;

  factory _FinancialGoal.fromJson(Map<String, dynamic> json) =
      _$FinancialGoalImpl.fromJson;

  @override
  String get id;
  @override
  @JsonKey(name: 'tenant_id')
  String get tenantId;
  @override
  String get name;
  @override
  @JsonKey(name: 'goal_type')
  String get goalType;
  @override
  @JsonKey(name: 'target_amount')
  double get targetAmount;
  @override
  @JsonKey(name: 'current_amount')
  double get currentAmount;
  @override
  @JsonKey(name: 'target_date')
  String? get targetDate;
  @override
  @JsonKey(name: 'linked_account_id')
  String? get linkedAccountId;
  @override
  String? get notes;
  @override
  String get status;
  @override
  @JsonKey(name: 'progress_pct')
  double? get progressPct;
  @override
  @JsonKey(name: 'created_at')
  String? get createdAt;

  /// Create a copy of FinancialGoal
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$FinancialGoalImplCopyWith<_$FinancialGoalImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
