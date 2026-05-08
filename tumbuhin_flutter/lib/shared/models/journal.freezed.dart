// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'journal.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

JournalEntry _$JournalEntryFromJson(Map<String, dynamic> json) {
  return _JournalEntry.fromJson(json);
}

/// @nodoc
mixin _$JournalEntry {
  String get id => throw _privateConstructorUsedError;
  DateTime get date => throw _privateConstructorUsedError;
  String get description => throw _privateConstructorUsedError;
  List<JournalLine> get lines => throw _privateConstructorUsedError;
  @JsonKey(name: 'reference_id')
  String? get referenceId => throw _privateConstructorUsedError;

  /// Serializes this JournalEntry to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of JournalEntry
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $JournalEntryCopyWith<JournalEntry> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $JournalEntryCopyWith<$Res> {
  factory $JournalEntryCopyWith(
    JournalEntry value,
    $Res Function(JournalEntry) then,
  ) = _$JournalEntryCopyWithImpl<$Res, JournalEntry>;
  @useResult
  $Res call({
    String id,
    DateTime date,
    String description,
    List<JournalLine> lines,
    @JsonKey(name: 'reference_id') String? referenceId,
  });
}

/// @nodoc
class _$JournalEntryCopyWithImpl<$Res, $Val extends JournalEntry>
    implements $JournalEntryCopyWith<$Res> {
  _$JournalEntryCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of JournalEntry
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? date = null,
    Object? description = null,
    Object? lines = null,
    Object? referenceId = freezed,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as String,
            date: null == date
                ? _value.date
                : date // ignore: cast_nullable_to_non_nullable
                      as DateTime,
            description: null == description
                ? _value.description
                : description // ignore: cast_nullable_to_non_nullable
                      as String,
            lines: null == lines
                ? _value.lines
                : lines // ignore: cast_nullable_to_non_nullable
                      as List<JournalLine>,
            referenceId: freezed == referenceId
                ? _value.referenceId
                : referenceId // ignore: cast_nullable_to_non_nullable
                      as String?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$JournalEntryImplCopyWith<$Res>
    implements $JournalEntryCopyWith<$Res> {
  factory _$$JournalEntryImplCopyWith(
    _$JournalEntryImpl value,
    $Res Function(_$JournalEntryImpl) then,
  ) = __$$JournalEntryImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String id,
    DateTime date,
    String description,
    List<JournalLine> lines,
    @JsonKey(name: 'reference_id') String? referenceId,
  });
}

/// @nodoc
class __$$JournalEntryImplCopyWithImpl<$Res>
    extends _$JournalEntryCopyWithImpl<$Res, _$JournalEntryImpl>
    implements _$$JournalEntryImplCopyWith<$Res> {
  __$$JournalEntryImplCopyWithImpl(
    _$JournalEntryImpl _value,
    $Res Function(_$JournalEntryImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of JournalEntry
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? date = null,
    Object? description = null,
    Object? lines = null,
    Object? referenceId = freezed,
  }) {
    return _then(
      _$JournalEntryImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as String,
        date: null == date
            ? _value.date
            : date // ignore: cast_nullable_to_non_nullable
                  as DateTime,
        description: null == description
            ? _value.description
            : description // ignore: cast_nullable_to_non_nullable
                  as String,
        lines: null == lines
            ? _value._lines
            : lines // ignore: cast_nullable_to_non_nullable
                  as List<JournalLine>,
        referenceId: freezed == referenceId
            ? _value.referenceId
            : referenceId // ignore: cast_nullable_to_non_nullable
                  as String?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$JournalEntryImpl implements _JournalEntry {
  const _$JournalEntryImpl({
    required this.id,
    required this.date,
    required this.description,
    required final List<JournalLine> lines,
    @JsonKey(name: 'reference_id') this.referenceId,
  }) : _lines = lines;

  factory _$JournalEntryImpl.fromJson(Map<String, dynamic> json) =>
      _$$JournalEntryImplFromJson(json);

  @override
  final String id;
  @override
  final DateTime date;
  @override
  final String description;
  final List<JournalLine> _lines;
  @override
  List<JournalLine> get lines {
    if (_lines is EqualUnmodifiableListView) return _lines;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_lines);
  }

  @override
  @JsonKey(name: 'reference_id')
  final String? referenceId;

  @override
  String toString() {
    return 'JournalEntry(id: $id, date: $date, description: $description, lines: $lines, referenceId: $referenceId)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$JournalEntryImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.date, date) || other.date == date) &&
            (identical(other.description, description) ||
                other.description == description) &&
            const DeepCollectionEquality().equals(other._lines, _lines) &&
            (identical(other.referenceId, referenceId) ||
                other.referenceId == referenceId));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    date,
    description,
    const DeepCollectionEquality().hash(_lines),
    referenceId,
  );

  /// Create a copy of JournalEntry
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$JournalEntryImplCopyWith<_$JournalEntryImpl> get copyWith =>
      __$$JournalEntryImplCopyWithImpl<_$JournalEntryImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$JournalEntryImplToJson(this);
  }
}

abstract class _JournalEntry implements JournalEntry {
  const factory _JournalEntry({
    required final String id,
    required final DateTime date,
    required final String description,
    required final List<JournalLine> lines,
    @JsonKey(name: 'reference_id') final String? referenceId,
  }) = _$JournalEntryImpl;

  factory _JournalEntry.fromJson(Map<String, dynamic> json) =
      _$JournalEntryImpl.fromJson;

  @override
  String get id;
  @override
  DateTime get date;
  @override
  String get description;
  @override
  List<JournalLine> get lines;
  @override
  @JsonKey(name: 'reference_id')
  String? get referenceId;

  /// Create a copy of JournalEntry
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$JournalEntryImplCopyWith<_$JournalEntryImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

JournalLine _$JournalLineFromJson(Map<String, dynamic> json) {
  return _JournalLine.fromJson(json);
}

/// @nodoc
mixin _$JournalLine {
  String get id => throw _privateConstructorUsedError;
  @JsonKey(name: 'account_id')
  String get accountId => throw _privateConstructorUsedError;
  double get debit => throw _privateConstructorUsedError;
  double get credit => throw _privateConstructorUsedError;
  String? get description => throw _privateConstructorUsedError;

  /// Serializes this JournalLine to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of JournalLine
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $JournalLineCopyWith<JournalLine> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $JournalLineCopyWith<$Res> {
  factory $JournalLineCopyWith(
    JournalLine value,
    $Res Function(JournalLine) then,
  ) = _$JournalLineCopyWithImpl<$Res, JournalLine>;
  @useResult
  $Res call({
    String id,
    @JsonKey(name: 'account_id') String accountId,
    double debit,
    double credit,
    String? description,
  });
}

/// @nodoc
class _$JournalLineCopyWithImpl<$Res, $Val extends JournalLine>
    implements $JournalLineCopyWith<$Res> {
  _$JournalLineCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of JournalLine
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? accountId = null,
    Object? debit = null,
    Object? credit = null,
    Object? description = freezed,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as String,
            accountId: null == accountId
                ? _value.accountId
                : accountId // ignore: cast_nullable_to_non_nullable
                      as String,
            debit: null == debit
                ? _value.debit
                : debit // ignore: cast_nullable_to_non_nullable
                      as double,
            credit: null == credit
                ? _value.credit
                : credit // ignore: cast_nullable_to_non_nullable
                      as double,
            description: freezed == description
                ? _value.description
                : description // ignore: cast_nullable_to_non_nullable
                      as String?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$JournalLineImplCopyWith<$Res>
    implements $JournalLineCopyWith<$Res> {
  factory _$$JournalLineImplCopyWith(
    _$JournalLineImpl value,
    $Res Function(_$JournalLineImpl) then,
  ) = __$$JournalLineImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String id,
    @JsonKey(name: 'account_id') String accountId,
    double debit,
    double credit,
    String? description,
  });
}

/// @nodoc
class __$$JournalLineImplCopyWithImpl<$Res>
    extends _$JournalLineCopyWithImpl<$Res, _$JournalLineImpl>
    implements _$$JournalLineImplCopyWith<$Res> {
  __$$JournalLineImplCopyWithImpl(
    _$JournalLineImpl _value,
    $Res Function(_$JournalLineImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of JournalLine
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? accountId = null,
    Object? debit = null,
    Object? credit = null,
    Object? description = freezed,
  }) {
    return _then(
      _$JournalLineImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as String,
        accountId: null == accountId
            ? _value.accountId
            : accountId // ignore: cast_nullable_to_non_nullable
                  as String,
        debit: null == debit
            ? _value.debit
            : debit // ignore: cast_nullable_to_non_nullable
                  as double,
        credit: null == credit
            ? _value.credit
            : credit // ignore: cast_nullable_to_non_nullable
                  as double,
        description: freezed == description
            ? _value.description
            : description // ignore: cast_nullable_to_non_nullable
                  as String?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$JournalLineImpl implements _JournalLine {
  const _$JournalLineImpl({
    required this.id,
    @JsonKey(name: 'account_id') required this.accountId,
    required this.debit,
    required this.credit,
    this.description,
  });

  factory _$JournalLineImpl.fromJson(Map<String, dynamic> json) =>
      _$$JournalLineImplFromJson(json);

  @override
  final String id;
  @override
  @JsonKey(name: 'account_id')
  final String accountId;
  @override
  final double debit;
  @override
  final double credit;
  @override
  final String? description;

  @override
  String toString() {
    return 'JournalLine(id: $id, accountId: $accountId, debit: $debit, credit: $credit, description: $description)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$JournalLineImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.accountId, accountId) ||
                other.accountId == accountId) &&
            (identical(other.debit, debit) || other.debit == debit) &&
            (identical(other.credit, credit) || other.credit == credit) &&
            (identical(other.description, description) ||
                other.description == description));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode =>
      Object.hash(runtimeType, id, accountId, debit, credit, description);

  /// Create a copy of JournalLine
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$JournalLineImplCopyWith<_$JournalLineImpl> get copyWith =>
      __$$JournalLineImplCopyWithImpl<_$JournalLineImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$JournalLineImplToJson(this);
  }
}

abstract class _JournalLine implements JournalLine {
  const factory _JournalLine({
    required final String id,
    @JsonKey(name: 'account_id') required final String accountId,
    required final double debit,
    required final double credit,
    final String? description,
  }) = _$JournalLineImpl;

  factory _JournalLine.fromJson(Map<String, dynamic> json) =
      _$JournalLineImpl.fromJson;

  @override
  String get id;
  @override
  @JsonKey(name: 'account_id')
  String get accountId;
  @override
  double get debit;
  @override
  double get credit;
  @override
  String? get description;

  /// Create a copy of JournalLine
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$JournalLineImplCopyWith<_$JournalLineImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

LedgerBalance _$LedgerBalanceFromJson(Map<String, dynamic> json) {
  return _LedgerBalance.fromJson(json);
}

/// @nodoc
mixin _$LedgerBalance {
  @JsonKey(name: 'account_id')
  String get accountId => throw _privateConstructorUsedError;
  @JsonKey(name: 'account_name')
  String get accountName => throw _privateConstructorUsedError;
  double get balance => throw _privateConstructorUsedError;

  /// Serializes this LedgerBalance to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of LedgerBalance
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $LedgerBalanceCopyWith<LedgerBalance> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $LedgerBalanceCopyWith<$Res> {
  factory $LedgerBalanceCopyWith(
    LedgerBalance value,
    $Res Function(LedgerBalance) then,
  ) = _$LedgerBalanceCopyWithImpl<$Res, LedgerBalance>;
  @useResult
  $Res call({
    @JsonKey(name: 'account_id') String accountId,
    @JsonKey(name: 'account_name') String accountName,
    double balance,
  });
}

/// @nodoc
class _$LedgerBalanceCopyWithImpl<$Res, $Val extends LedgerBalance>
    implements $LedgerBalanceCopyWith<$Res> {
  _$LedgerBalanceCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of LedgerBalance
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? accountId = null,
    Object? accountName = null,
    Object? balance = null,
  }) {
    return _then(
      _value.copyWith(
            accountId: null == accountId
                ? _value.accountId
                : accountId // ignore: cast_nullable_to_non_nullable
                      as String,
            accountName: null == accountName
                ? _value.accountName
                : accountName // ignore: cast_nullable_to_non_nullable
                      as String,
            balance: null == balance
                ? _value.balance
                : balance // ignore: cast_nullable_to_non_nullable
                      as double,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$LedgerBalanceImplCopyWith<$Res>
    implements $LedgerBalanceCopyWith<$Res> {
  factory _$$LedgerBalanceImplCopyWith(
    _$LedgerBalanceImpl value,
    $Res Function(_$LedgerBalanceImpl) then,
  ) = __$$LedgerBalanceImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    @JsonKey(name: 'account_id') String accountId,
    @JsonKey(name: 'account_name') String accountName,
    double balance,
  });
}

/// @nodoc
class __$$LedgerBalanceImplCopyWithImpl<$Res>
    extends _$LedgerBalanceCopyWithImpl<$Res, _$LedgerBalanceImpl>
    implements _$$LedgerBalanceImplCopyWith<$Res> {
  __$$LedgerBalanceImplCopyWithImpl(
    _$LedgerBalanceImpl _value,
    $Res Function(_$LedgerBalanceImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of LedgerBalance
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? accountId = null,
    Object? accountName = null,
    Object? balance = null,
  }) {
    return _then(
      _$LedgerBalanceImpl(
        accountId: null == accountId
            ? _value.accountId
            : accountId // ignore: cast_nullable_to_non_nullable
                  as String,
        accountName: null == accountName
            ? _value.accountName
            : accountName // ignore: cast_nullable_to_non_nullable
                  as String,
        balance: null == balance
            ? _value.balance
            : balance // ignore: cast_nullable_to_non_nullable
                  as double,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$LedgerBalanceImpl implements _LedgerBalance {
  const _$LedgerBalanceImpl({
    @JsonKey(name: 'account_id') required this.accountId,
    @JsonKey(name: 'account_name') required this.accountName,
    required this.balance,
  });

  factory _$LedgerBalanceImpl.fromJson(Map<String, dynamic> json) =>
      _$$LedgerBalanceImplFromJson(json);

  @override
  @JsonKey(name: 'account_id')
  final String accountId;
  @override
  @JsonKey(name: 'account_name')
  final String accountName;
  @override
  final double balance;

  @override
  String toString() {
    return 'LedgerBalance(accountId: $accountId, accountName: $accountName, balance: $balance)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$LedgerBalanceImpl &&
            (identical(other.accountId, accountId) ||
                other.accountId == accountId) &&
            (identical(other.accountName, accountName) ||
                other.accountName == accountName) &&
            (identical(other.balance, balance) || other.balance == balance));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, accountId, accountName, balance);

  /// Create a copy of LedgerBalance
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$LedgerBalanceImplCopyWith<_$LedgerBalanceImpl> get copyWith =>
      __$$LedgerBalanceImplCopyWithImpl<_$LedgerBalanceImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$LedgerBalanceImplToJson(this);
  }
}

abstract class _LedgerBalance implements LedgerBalance {
  const factory _LedgerBalance({
    @JsonKey(name: 'account_id') required final String accountId,
    @JsonKey(name: 'account_name') required final String accountName,
    required final double balance,
  }) = _$LedgerBalanceImpl;

  factory _LedgerBalance.fromJson(Map<String, dynamic> json) =
      _$LedgerBalanceImpl.fromJson;

  @override
  @JsonKey(name: 'account_id')
  String get accountId;
  @override
  @JsonKey(name: 'account_name')
  String get accountName;
  @override
  double get balance;

  /// Create a copy of LedgerBalance
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$LedgerBalanceImplCopyWith<_$LedgerBalanceImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
