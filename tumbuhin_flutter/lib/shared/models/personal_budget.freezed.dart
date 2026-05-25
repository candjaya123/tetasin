// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'personal_budget.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

PersonalBudget _$PersonalBudgetFromJson(Map<String, dynamic> json) {
  return _PersonalBudget.fromJson(json);
}

/// @nodoc
mixin _$PersonalBudget {
  String get id => throw _privateConstructorUsedError;
  @JsonKey(name: 'tenant_id')
  String get tenantId => throw _privateConstructorUsedError;
  @JsonKey(name: 'account_id')
  String get accountId => throw _privateConstructorUsedError;
  int get month => throw _privateConstructorUsedError;
  int get year => throw _privateConstructorUsedError;
  @JsonKey(name: 'budget_amount')
  double get budgetAmount => throw _privateConstructorUsedError;
  @JsonKey(name: 'chart_of_accounts')
  ChartOfAccountRef? get chartOfAccounts => throw _privateConstructorUsedError;
  double? get actual => throw _privateConstructorUsedError;

  /// Serializes this PersonalBudget to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of PersonalBudget
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $PersonalBudgetCopyWith<PersonalBudget> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $PersonalBudgetCopyWith<$Res> {
  factory $PersonalBudgetCopyWith(
    PersonalBudget value,
    $Res Function(PersonalBudget) then,
  ) = _$PersonalBudgetCopyWithImpl<$Res, PersonalBudget>;
  @useResult
  $Res call({
    String id,
    @JsonKey(name: 'tenant_id') String tenantId,
    @JsonKey(name: 'account_id') String accountId,
    int month,
    int year,
    @JsonKey(name: 'budget_amount') double budgetAmount,
    @JsonKey(name: 'chart_of_accounts') ChartOfAccountRef? chartOfAccounts,
    double? actual,
  });

  $ChartOfAccountRefCopyWith<$Res>? get chartOfAccounts;
}

/// @nodoc
class _$PersonalBudgetCopyWithImpl<$Res, $Val extends PersonalBudget>
    implements $PersonalBudgetCopyWith<$Res> {
  _$PersonalBudgetCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of PersonalBudget
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? tenantId = null,
    Object? accountId = null,
    Object? month = null,
    Object? year = null,
    Object? budgetAmount = null,
    Object? chartOfAccounts = freezed,
    Object? actual = freezed,
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
            accountId: null == accountId
                ? _value.accountId
                : accountId // ignore: cast_nullable_to_non_nullable
                      as String,
            month: null == month
                ? _value.month
                : month // ignore: cast_nullable_to_non_nullable
                      as int,
            year: null == year
                ? _value.year
                : year // ignore: cast_nullable_to_non_nullable
                      as int,
            budgetAmount: null == budgetAmount
                ? _value.budgetAmount
                : budgetAmount // ignore: cast_nullable_to_non_nullable
                      as double,
            chartOfAccounts: freezed == chartOfAccounts
                ? _value.chartOfAccounts
                : chartOfAccounts // ignore: cast_nullable_to_non_nullable
                      as ChartOfAccountRef?,
            actual: freezed == actual
                ? _value.actual
                : actual // ignore: cast_nullable_to_non_nullable
                      as double?,
          )
          as $Val,
    );
  }

  /// Create a copy of PersonalBudget
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $ChartOfAccountRefCopyWith<$Res>? get chartOfAccounts {
    if (_value.chartOfAccounts == null) {
      return null;
    }

    return $ChartOfAccountRefCopyWith<$Res>(_value.chartOfAccounts!, (value) {
      return _then(_value.copyWith(chartOfAccounts: value) as $Val);
    });
  }
}

/// @nodoc
abstract class _$$PersonalBudgetImplCopyWith<$Res>
    implements $PersonalBudgetCopyWith<$Res> {
  factory _$$PersonalBudgetImplCopyWith(
    _$PersonalBudgetImpl value,
    $Res Function(_$PersonalBudgetImpl) then,
  ) = __$$PersonalBudgetImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String id,
    @JsonKey(name: 'tenant_id') String tenantId,
    @JsonKey(name: 'account_id') String accountId,
    int month,
    int year,
    @JsonKey(name: 'budget_amount') double budgetAmount,
    @JsonKey(name: 'chart_of_accounts') ChartOfAccountRef? chartOfAccounts,
    double? actual,
  });

  @override
  $ChartOfAccountRefCopyWith<$Res>? get chartOfAccounts;
}

/// @nodoc
class __$$PersonalBudgetImplCopyWithImpl<$Res>
    extends _$PersonalBudgetCopyWithImpl<$Res, _$PersonalBudgetImpl>
    implements _$$PersonalBudgetImplCopyWith<$Res> {
  __$$PersonalBudgetImplCopyWithImpl(
    _$PersonalBudgetImpl _value,
    $Res Function(_$PersonalBudgetImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of PersonalBudget
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? tenantId = null,
    Object? accountId = null,
    Object? month = null,
    Object? year = null,
    Object? budgetAmount = null,
    Object? chartOfAccounts = freezed,
    Object? actual = freezed,
  }) {
    return _then(
      _$PersonalBudgetImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as String,
        tenantId: null == tenantId
            ? _value.tenantId
            : tenantId // ignore: cast_nullable_to_non_nullable
                  as String,
        accountId: null == accountId
            ? _value.accountId
            : accountId // ignore: cast_nullable_to_non_nullable
                  as String,
        month: null == month
            ? _value.month
            : month // ignore: cast_nullable_to_non_nullable
                  as int,
        year: null == year
            ? _value.year
            : year // ignore: cast_nullable_to_non_nullable
                  as int,
        budgetAmount: null == budgetAmount
            ? _value.budgetAmount
            : budgetAmount // ignore: cast_nullable_to_non_nullable
                  as double,
        chartOfAccounts: freezed == chartOfAccounts
            ? _value.chartOfAccounts
            : chartOfAccounts // ignore: cast_nullable_to_non_nullable
                  as ChartOfAccountRef?,
        actual: freezed == actual
            ? _value.actual
            : actual // ignore: cast_nullable_to_non_nullable
                  as double?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$PersonalBudgetImpl implements _PersonalBudget {
  const _$PersonalBudgetImpl({
    required this.id,
    @JsonKey(name: 'tenant_id') required this.tenantId,
    @JsonKey(name: 'account_id') required this.accountId,
    required this.month,
    required this.year,
    @JsonKey(name: 'budget_amount') required this.budgetAmount,
    @JsonKey(name: 'chart_of_accounts') this.chartOfAccounts,
    this.actual,
  });

  factory _$PersonalBudgetImpl.fromJson(Map<String, dynamic> json) =>
      _$$PersonalBudgetImplFromJson(json);

  @override
  final String id;
  @override
  @JsonKey(name: 'tenant_id')
  final String tenantId;
  @override
  @JsonKey(name: 'account_id')
  final String accountId;
  @override
  final int month;
  @override
  final int year;
  @override
  @JsonKey(name: 'budget_amount')
  final double budgetAmount;
  @override
  @JsonKey(name: 'chart_of_accounts')
  final ChartOfAccountRef? chartOfAccounts;
  @override
  final double? actual;

  @override
  String toString() {
    return 'PersonalBudget(id: $id, tenantId: $tenantId, accountId: $accountId, month: $month, year: $year, budgetAmount: $budgetAmount, chartOfAccounts: $chartOfAccounts, actual: $actual)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$PersonalBudgetImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.tenantId, tenantId) ||
                other.tenantId == tenantId) &&
            (identical(other.accountId, accountId) ||
                other.accountId == accountId) &&
            (identical(other.month, month) || other.month == month) &&
            (identical(other.year, year) || other.year == year) &&
            (identical(other.budgetAmount, budgetAmount) ||
                other.budgetAmount == budgetAmount) &&
            (identical(other.chartOfAccounts, chartOfAccounts) ||
                other.chartOfAccounts == chartOfAccounts) &&
            (identical(other.actual, actual) || other.actual == actual));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    tenantId,
    accountId,
    month,
    year,
    budgetAmount,
    chartOfAccounts,
    actual,
  );

  /// Create a copy of PersonalBudget
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$PersonalBudgetImplCopyWith<_$PersonalBudgetImpl> get copyWith =>
      __$$PersonalBudgetImplCopyWithImpl<_$PersonalBudgetImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$PersonalBudgetImplToJson(this);
  }
}

abstract class _PersonalBudget implements PersonalBudget {
  const factory _PersonalBudget({
    required final String id,
    @JsonKey(name: 'tenant_id') required final String tenantId,
    @JsonKey(name: 'account_id') required final String accountId,
    required final int month,
    required final int year,
    @JsonKey(name: 'budget_amount') required final double budgetAmount,
    @JsonKey(name: 'chart_of_accounts')
    final ChartOfAccountRef? chartOfAccounts,
    final double? actual,
  }) = _$PersonalBudgetImpl;

  factory _PersonalBudget.fromJson(Map<String, dynamic> json) =
      _$PersonalBudgetImpl.fromJson;

  @override
  String get id;
  @override
  @JsonKey(name: 'tenant_id')
  String get tenantId;
  @override
  @JsonKey(name: 'account_id')
  String get accountId;
  @override
  int get month;
  @override
  int get year;
  @override
  @JsonKey(name: 'budget_amount')
  double get budgetAmount;
  @override
  @JsonKey(name: 'chart_of_accounts')
  ChartOfAccountRef? get chartOfAccounts;
  @override
  double? get actual;

  /// Create a copy of PersonalBudget
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$PersonalBudgetImplCopyWith<_$PersonalBudgetImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

ChartOfAccountRef _$ChartOfAccountRefFromJson(Map<String, dynamic> json) {
  return _ChartOfAccountRef.fromJson(json);
}

/// @nodoc
mixin _$ChartOfAccountRef {
  String? get name => throw _privateConstructorUsedError;
  String? get code => throw _privateConstructorUsedError;

  /// Serializes this ChartOfAccountRef to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of ChartOfAccountRef
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $ChartOfAccountRefCopyWith<ChartOfAccountRef> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $ChartOfAccountRefCopyWith<$Res> {
  factory $ChartOfAccountRefCopyWith(
    ChartOfAccountRef value,
    $Res Function(ChartOfAccountRef) then,
  ) = _$ChartOfAccountRefCopyWithImpl<$Res, ChartOfAccountRef>;
  @useResult
  $Res call({String? name, String? code});
}

/// @nodoc
class _$ChartOfAccountRefCopyWithImpl<$Res, $Val extends ChartOfAccountRef>
    implements $ChartOfAccountRefCopyWith<$Res> {
  _$ChartOfAccountRefCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of ChartOfAccountRef
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? name = freezed, Object? code = freezed}) {
    return _then(
      _value.copyWith(
            name: freezed == name
                ? _value.name
                : name // ignore: cast_nullable_to_non_nullable
                      as String?,
            code: freezed == code
                ? _value.code
                : code // ignore: cast_nullable_to_non_nullable
                      as String?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$ChartOfAccountRefImplCopyWith<$Res>
    implements $ChartOfAccountRefCopyWith<$Res> {
  factory _$$ChartOfAccountRefImplCopyWith(
    _$ChartOfAccountRefImpl value,
    $Res Function(_$ChartOfAccountRefImpl) then,
  ) = __$$ChartOfAccountRefImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({String? name, String? code});
}

/// @nodoc
class __$$ChartOfAccountRefImplCopyWithImpl<$Res>
    extends _$ChartOfAccountRefCopyWithImpl<$Res, _$ChartOfAccountRefImpl>
    implements _$$ChartOfAccountRefImplCopyWith<$Res> {
  __$$ChartOfAccountRefImplCopyWithImpl(
    _$ChartOfAccountRefImpl _value,
    $Res Function(_$ChartOfAccountRefImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of ChartOfAccountRef
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? name = freezed, Object? code = freezed}) {
    return _then(
      _$ChartOfAccountRefImpl(
        name: freezed == name
            ? _value.name
            : name // ignore: cast_nullable_to_non_nullable
                  as String?,
        code: freezed == code
            ? _value.code
            : code // ignore: cast_nullable_to_non_nullable
                  as String?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$ChartOfAccountRefImpl implements _ChartOfAccountRef {
  const _$ChartOfAccountRefImpl({this.name, this.code});

  factory _$ChartOfAccountRefImpl.fromJson(Map<String, dynamic> json) =>
      _$$ChartOfAccountRefImplFromJson(json);

  @override
  final String? name;
  @override
  final String? code;

  @override
  String toString() {
    return 'ChartOfAccountRef(name: $name, code: $code)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$ChartOfAccountRefImpl &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.code, code) || other.code == code));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, name, code);

  /// Create a copy of ChartOfAccountRef
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$ChartOfAccountRefImplCopyWith<_$ChartOfAccountRefImpl> get copyWith =>
      __$$ChartOfAccountRefImplCopyWithImpl<_$ChartOfAccountRefImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$ChartOfAccountRefImplToJson(this);
  }
}

abstract class _ChartOfAccountRef implements ChartOfAccountRef {
  const factory _ChartOfAccountRef({final String? name, final String? code}) =
      _$ChartOfAccountRefImpl;

  factory _ChartOfAccountRef.fromJson(Map<String, dynamic> json) =
      _$ChartOfAccountRefImpl.fromJson;

  @override
  String? get name;
  @override
  String? get code;

  /// Create a copy of ChartOfAccountRef
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$ChartOfAccountRefImplCopyWith<_$ChartOfAccountRefImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

BudgetStatus _$BudgetStatusFromJson(Map<String, dynamic> json) {
  return _BudgetStatus.fromJson(json);
}

/// @nodoc
mixin _$BudgetStatus {
  @JsonKey(name: 'account_id')
  String get accountId => throw _privateConstructorUsedError;
  String get name => throw _privateConstructorUsedError;
  String get code => throw _privateConstructorUsedError;
  double get budget => throw _privateConstructorUsedError;
  double get actual => throw _privateConstructorUsedError;
  @JsonKey(name: 'pct_used')
  double get pctUsed => throw _privateConstructorUsedError;
  String get status => throw _privateConstructorUsedError;

  /// Serializes this BudgetStatus to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of BudgetStatus
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $BudgetStatusCopyWith<BudgetStatus> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $BudgetStatusCopyWith<$Res> {
  factory $BudgetStatusCopyWith(
    BudgetStatus value,
    $Res Function(BudgetStatus) then,
  ) = _$BudgetStatusCopyWithImpl<$Res, BudgetStatus>;
  @useResult
  $Res call({
    @JsonKey(name: 'account_id') String accountId,
    String name,
    String code,
    double budget,
    double actual,
    @JsonKey(name: 'pct_used') double pctUsed,
    String status,
  });
}

/// @nodoc
class _$BudgetStatusCopyWithImpl<$Res, $Val extends BudgetStatus>
    implements $BudgetStatusCopyWith<$Res> {
  _$BudgetStatusCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of BudgetStatus
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? accountId = null,
    Object? name = null,
    Object? code = null,
    Object? budget = null,
    Object? actual = null,
    Object? pctUsed = null,
    Object? status = null,
  }) {
    return _then(
      _value.copyWith(
            accountId: null == accountId
                ? _value.accountId
                : accountId // ignore: cast_nullable_to_non_nullable
                      as String,
            name: null == name
                ? _value.name
                : name // ignore: cast_nullable_to_non_nullable
                      as String,
            code: null == code
                ? _value.code
                : code // ignore: cast_nullable_to_non_nullable
                      as String,
            budget: null == budget
                ? _value.budget
                : budget // ignore: cast_nullable_to_non_nullable
                      as double,
            actual: null == actual
                ? _value.actual
                : actual // ignore: cast_nullable_to_non_nullable
                      as double,
            pctUsed: null == pctUsed
                ? _value.pctUsed
                : pctUsed // ignore: cast_nullable_to_non_nullable
                      as double,
            status: null == status
                ? _value.status
                : status // ignore: cast_nullable_to_non_nullable
                      as String,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$BudgetStatusImplCopyWith<$Res>
    implements $BudgetStatusCopyWith<$Res> {
  factory _$$BudgetStatusImplCopyWith(
    _$BudgetStatusImpl value,
    $Res Function(_$BudgetStatusImpl) then,
  ) = __$$BudgetStatusImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    @JsonKey(name: 'account_id') String accountId,
    String name,
    String code,
    double budget,
    double actual,
    @JsonKey(name: 'pct_used') double pctUsed,
    String status,
  });
}

/// @nodoc
class __$$BudgetStatusImplCopyWithImpl<$Res>
    extends _$BudgetStatusCopyWithImpl<$Res, _$BudgetStatusImpl>
    implements _$$BudgetStatusImplCopyWith<$Res> {
  __$$BudgetStatusImplCopyWithImpl(
    _$BudgetStatusImpl _value,
    $Res Function(_$BudgetStatusImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of BudgetStatus
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? accountId = null,
    Object? name = null,
    Object? code = null,
    Object? budget = null,
    Object? actual = null,
    Object? pctUsed = null,
    Object? status = null,
  }) {
    return _then(
      _$BudgetStatusImpl(
        accountId: null == accountId
            ? _value.accountId
            : accountId // ignore: cast_nullable_to_non_nullable
                  as String,
        name: null == name
            ? _value.name
            : name // ignore: cast_nullable_to_non_nullable
                  as String,
        code: null == code
            ? _value.code
            : code // ignore: cast_nullable_to_non_nullable
                  as String,
        budget: null == budget
            ? _value.budget
            : budget // ignore: cast_nullable_to_non_nullable
                  as double,
        actual: null == actual
            ? _value.actual
            : actual // ignore: cast_nullable_to_non_nullable
                  as double,
        pctUsed: null == pctUsed
            ? _value.pctUsed
            : pctUsed // ignore: cast_nullable_to_non_nullable
                  as double,
        status: null == status
            ? _value.status
            : status // ignore: cast_nullable_to_non_nullable
                  as String,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$BudgetStatusImpl implements _BudgetStatus {
  const _$BudgetStatusImpl({
    @JsonKey(name: 'account_id') required this.accountId,
    required this.name,
    required this.code,
    required this.budget,
    required this.actual,
    @JsonKey(name: 'pct_used') required this.pctUsed,
    required this.status,
  });

  factory _$BudgetStatusImpl.fromJson(Map<String, dynamic> json) =>
      _$$BudgetStatusImplFromJson(json);

  @override
  @JsonKey(name: 'account_id')
  final String accountId;
  @override
  final String name;
  @override
  final String code;
  @override
  final double budget;
  @override
  final double actual;
  @override
  @JsonKey(name: 'pct_used')
  final double pctUsed;
  @override
  final String status;

  @override
  String toString() {
    return 'BudgetStatus(accountId: $accountId, name: $name, code: $code, budget: $budget, actual: $actual, pctUsed: $pctUsed, status: $status)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$BudgetStatusImpl &&
            (identical(other.accountId, accountId) ||
                other.accountId == accountId) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.code, code) || other.code == code) &&
            (identical(other.budget, budget) || other.budget == budget) &&
            (identical(other.actual, actual) || other.actual == actual) &&
            (identical(other.pctUsed, pctUsed) || other.pctUsed == pctUsed) &&
            (identical(other.status, status) || other.status == status));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    accountId,
    name,
    code,
    budget,
    actual,
    pctUsed,
    status,
  );

  /// Create a copy of BudgetStatus
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$BudgetStatusImplCopyWith<_$BudgetStatusImpl> get copyWith =>
      __$$BudgetStatusImplCopyWithImpl<_$BudgetStatusImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$BudgetStatusImplToJson(this);
  }
}

abstract class _BudgetStatus implements BudgetStatus {
  const factory _BudgetStatus({
    @JsonKey(name: 'account_id') required final String accountId,
    required final String name,
    required final String code,
    required final double budget,
    required final double actual,
    @JsonKey(name: 'pct_used') required final double pctUsed,
    required final String status,
  }) = _$BudgetStatusImpl;

  factory _BudgetStatus.fromJson(Map<String, dynamic> json) =
      _$BudgetStatusImpl.fromJson;

  @override
  @JsonKey(name: 'account_id')
  String get accountId;
  @override
  String get name;
  @override
  String get code;
  @override
  double get budget;
  @override
  double get actual;
  @override
  @JsonKey(name: 'pct_used')
  double get pctUsed;
  @override
  String get status;

  /// Create a copy of BudgetStatus
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$BudgetStatusImplCopyWith<_$BudgetStatusImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
