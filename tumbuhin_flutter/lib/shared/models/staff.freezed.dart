// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'staff.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

StaffAccount _$StaffAccountFromJson(Map<String, dynamic> json) {
  return _StaffAccount.fromJson(json);
}

/// @nodoc
mixin _$StaffAccount {
  String get id => throw _privateConstructorUsedError;
  @JsonKey(name: 'full_name')
  String get fullName => throw _privateConstructorUsedError;
  String get role => throw _privateConstructorUsedError;
  String? get email => throw _privateConstructorUsedError;
  @JsonKey(name: 'tenant_id')
  String? get tenantId => throw _privateConstructorUsedError;
  @JsonKey(name: 'created_at')
  DateTime? get createdAt => throw _privateConstructorUsedError;

  /// Serializes this StaffAccount to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of StaffAccount
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $StaffAccountCopyWith<StaffAccount> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $StaffAccountCopyWith<$Res> {
  factory $StaffAccountCopyWith(
    StaffAccount value,
    $Res Function(StaffAccount) then,
  ) = _$StaffAccountCopyWithImpl<$Res, StaffAccount>;
  @useResult
  $Res call({
    String id,
    @JsonKey(name: 'full_name') String fullName,
    String role,
    String? email,
    @JsonKey(name: 'tenant_id') String? tenantId,
    @JsonKey(name: 'created_at') DateTime? createdAt,
  });
}

/// @nodoc
class _$StaffAccountCopyWithImpl<$Res, $Val extends StaffAccount>
    implements $StaffAccountCopyWith<$Res> {
  _$StaffAccountCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of StaffAccount
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? fullName = null,
    Object? role = null,
    Object? email = freezed,
    Object? tenantId = freezed,
    Object? createdAt = freezed,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as String,
            fullName: null == fullName
                ? _value.fullName
                : fullName // ignore: cast_nullable_to_non_nullable
                      as String,
            role: null == role
                ? _value.role
                : role // ignore: cast_nullable_to_non_nullable
                      as String,
            email: freezed == email
                ? _value.email
                : email // ignore: cast_nullable_to_non_nullable
                      as String?,
            tenantId: freezed == tenantId
                ? _value.tenantId
                : tenantId // ignore: cast_nullable_to_non_nullable
                      as String?,
            createdAt: freezed == createdAt
                ? _value.createdAt
                : createdAt // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$StaffAccountImplCopyWith<$Res>
    implements $StaffAccountCopyWith<$Res> {
  factory _$$StaffAccountImplCopyWith(
    _$StaffAccountImpl value,
    $Res Function(_$StaffAccountImpl) then,
  ) = __$$StaffAccountImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String id,
    @JsonKey(name: 'full_name') String fullName,
    String role,
    String? email,
    @JsonKey(name: 'tenant_id') String? tenantId,
    @JsonKey(name: 'created_at') DateTime? createdAt,
  });
}

/// @nodoc
class __$$StaffAccountImplCopyWithImpl<$Res>
    extends _$StaffAccountCopyWithImpl<$Res, _$StaffAccountImpl>
    implements _$$StaffAccountImplCopyWith<$Res> {
  __$$StaffAccountImplCopyWithImpl(
    _$StaffAccountImpl _value,
    $Res Function(_$StaffAccountImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of StaffAccount
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? fullName = null,
    Object? role = null,
    Object? email = freezed,
    Object? tenantId = freezed,
    Object? createdAt = freezed,
  }) {
    return _then(
      _$StaffAccountImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as String,
        fullName: null == fullName
            ? _value.fullName
            : fullName // ignore: cast_nullable_to_non_nullable
                  as String,
        role: null == role
            ? _value.role
            : role // ignore: cast_nullable_to_non_nullable
                  as String,
        email: freezed == email
            ? _value.email
            : email // ignore: cast_nullable_to_non_nullable
                  as String?,
        tenantId: freezed == tenantId
            ? _value.tenantId
            : tenantId // ignore: cast_nullable_to_non_nullable
                  as String?,
        createdAt: freezed == createdAt
            ? _value.createdAt
            : createdAt // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$StaffAccountImpl implements _StaffAccount {
  const _$StaffAccountImpl({
    required this.id,
    @JsonKey(name: 'full_name') required this.fullName,
    required this.role,
    this.email,
    @JsonKey(name: 'tenant_id') this.tenantId,
    @JsonKey(name: 'created_at') this.createdAt,
  });

  factory _$StaffAccountImpl.fromJson(Map<String, dynamic> json) =>
      _$$StaffAccountImplFromJson(json);

  @override
  final String id;
  @override
  @JsonKey(name: 'full_name')
  final String fullName;
  @override
  final String role;
  @override
  final String? email;
  @override
  @JsonKey(name: 'tenant_id')
  final String? tenantId;
  @override
  @JsonKey(name: 'created_at')
  final DateTime? createdAt;

  @override
  String toString() {
    return 'StaffAccount(id: $id, fullName: $fullName, role: $role, email: $email, tenantId: $tenantId, createdAt: $createdAt)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$StaffAccountImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.fullName, fullName) ||
                other.fullName == fullName) &&
            (identical(other.role, role) || other.role == role) &&
            (identical(other.email, email) || other.email == email) &&
            (identical(other.tenantId, tenantId) ||
                other.tenantId == tenantId) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode =>
      Object.hash(runtimeType, id, fullName, role, email, tenantId, createdAt);

  /// Create a copy of StaffAccount
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$StaffAccountImplCopyWith<_$StaffAccountImpl> get copyWith =>
      __$$StaffAccountImplCopyWithImpl<_$StaffAccountImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$StaffAccountImplToJson(this);
  }
}

abstract class _StaffAccount implements StaffAccount {
  const factory _StaffAccount({
    required final String id,
    @JsonKey(name: 'full_name') required final String fullName,
    required final String role,
    final String? email,
    @JsonKey(name: 'tenant_id') final String? tenantId,
    @JsonKey(name: 'created_at') final DateTime? createdAt,
  }) = _$StaffAccountImpl;

  factory _StaffAccount.fromJson(Map<String, dynamic> json) =
      _$StaffAccountImpl.fromJson;

  @override
  String get id;
  @override
  @JsonKey(name: 'full_name')
  String get fullName;
  @override
  String get role;
  @override
  String? get email;
  @override
  @JsonKey(name: 'tenant_id')
  String? get tenantId;
  @override
  @JsonKey(name: 'created_at')
  DateTime? get createdAt;

  /// Create a copy of StaffAccount
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$StaffAccountImplCopyWith<_$StaffAccountImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

StaffLog _$StaffLogFromJson(Map<String, dynamic> json) {
  return _StaffLog.fromJson(json);
}

/// @nodoc
mixin _$StaffLog {
  String get id => throw _privateConstructorUsedError;
  @JsonKey(name: 'profile_id')
  String get profileId => throw _privateConstructorUsedError;
  String get action => throw _privateConstructorUsedError;
  @JsonKey(name: 'created_at')
  DateTime get createdAt => throw _privateConstructorUsedError;

  /// Serializes this StaffLog to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of StaffLog
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $StaffLogCopyWith<StaffLog> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $StaffLogCopyWith<$Res> {
  factory $StaffLogCopyWith(StaffLog value, $Res Function(StaffLog) then) =
      _$StaffLogCopyWithImpl<$Res, StaffLog>;
  @useResult
  $Res call({
    String id,
    @JsonKey(name: 'profile_id') String profileId,
    String action,
    @JsonKey(name: 'created_at') DateTime createdAt,
  });
}

/// @nodoc
class _$StaffLogCopyWithImpl<$Res, $Val extends StaffLog>
    implements $StaffLogCopyWith<$Res> {
  _$StaffLogCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of StaffLog
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? profileId = null,
    Object? action = null,
    Object? createdAt = null,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as String,
            profileId: null == profileId
                ? _value.profileId
                : profileId // ignore: cast_nullable_to_non_nullable
                      as String,
            action: null == action
                ? _value.action
                : action // ignore: cast_nullable_to_non_nullable
                      as String,
            createdAt: null == createdAt
                ? _value.createdAt
                : createdAt // ignore: cast_nullable_to_non_nullable
                      as DateTime,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$StaffLogImplCopyWith<$Res>
    implements $StaffLogCopyWith<$Res> {
  factory _$$StaffLogImplCopyWith(
    _$StaffLogImpl value,
    $Res Function(_$StaffLogImpl) then,
  ) = __$$StaffLogImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String id,
    @JsonKey(name: 'profile_id') String profileId,
    String action,
    @JsonKey(name: 'created_at') DateTime createdAt,
  });
}

/// @nodoc
class __$$StaffLogImplCopyWithImpl<$Res>
    extends _$StaffLogCopyWithImpl<$Res, _$StaffLogImpl>
    implements _$$StaffLogImplCopyWith<$Res> {
  __$$StaffLogImplCopyWithImpl(
    _$StaffLogImpl _value,
    $Res Function(_$StaffLogImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of StaffLog
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? profileId = null,
    Object? action = null,
    Object? createdAt = null,
  }) {
    return _then(
      _$StaffLogImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as String,
        profileId: null == profileId
            ? _value.profileId
            : profileId // ignore: cast_nullable_to_non_nullable
                  as String,
        action: null == action
            ? _value.action
            : action // ignore: cast_nullable_to_non_nullable
                  as String,
        createdAt: null == createdAt
            ? _value.createdAt
            : createdAt // ignore: cast_nullable_to_non_nullable
                  as DateTime,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$StaffLogImpl implements _StaffLog {
  const _$StaffLogImpl({
    required this.id,
    @JsonKey(name: 'profile_id') required this.profileId,
    required this.action,
    @JsonKey(name: 'created_at') required this.createdAt,
  });

  factory _$StaffLogImpl.fromJson(Map<String, dynamic> json) =>
      _$$StaffLogImplFromJson(json);

  @override
  final String id;
  @override
  @JsonKey(name: 'profile_id')
  final String profileId;
  @override
  final String action;
  @override
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  @override
  String toString() {
    return 'StaffLog(id: $id, profileId: $profileId, action: $action, createdAt: $createdAt)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$StaffLogImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.profileId, profileId) ||
                other.profileId == profileId) &&
            (identical(other.action, action) || other.action == action) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode =>
      Object.hash(runtimeType, id, profileId, action, createdAt);

  /// Create a copy of StaffLog
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$StaffLogImplCopyWith<_$StaffLogImpl> get copyWith =>
      __$$StaffLogImplCopyWithImpl<_$StaffLogImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$StaffLogImplToJson(this);
  }
}

abstract class _StaffLog implements StaffLog {
  const factory _StaffLog({
    required final String id,
    @JsonKey(name: 'profile_id') required final String profileId,
    required final String action,
    @JsonKey(name: 'created_at') required final DateTime createdAt,
  }) = _$StaffLogImpl;

  factory _StaffLog.fromJson(Map<String, dynamic> json) =
      _$StaffLogImpl.fromJson;

  @override
  String get id;
  @override
  @JsonKey(name: 'profile_id')
  String get profileId;
  @override
  String get action;
  @override
  @JsonKey(name: 'created_at')
  DateTime get createdAt;

  /// Create a copy of StaffLog
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$StaffLogImplCopyWith<_$StaffLogImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
