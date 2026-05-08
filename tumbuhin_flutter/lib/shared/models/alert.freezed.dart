// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'alert.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

SmartAlert _$SmartAlertFromJson(Map<String, dynamic> json) {
  return _SmartAlert.fromJson(json);
}

/// @nodoc
mixin _$SmartAlert {
  String get id => throw _privateConstructorUsedError;
  String get title => throw _privateConstructorUsedError;
  String get message => throw _privateConstructorUsedError;
  String get type => throw _privateConstructorUsedError;
  DateTime get date => throw _privateConstructorUsedError;
  bool get isRead => throw _privateConstructorUsedError;

  /// Serializes this SmartAlert to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of SmartAlert
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $SmartAlertCopyWith<SmartAlert> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $SmartAlertCopyWith<$Res> {
  factory $SmartAlertCopyWith(
    SmartAlert value,
    $Res Function(SmartAlert) then,
  ) = _$SmartAlertCopyWithImpl<$Res, SmartAlert>;
  @useResult
  $Res call({
    String id,
    String title,
    String message,
    String type,
    DateTime date,
    bool isRead,
  });
}

/// @nodoc
class _$SmartAlertCopyWithImpl<$Res, $Val extends SmartAlert>
    implements $SmartAlertCopyWith<$Res> {
  _$SmartAlertCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of SmartAlert
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? title = null,
    Object? message = null,
    Object? type = null,
    Object? date = null,
    Object? isRead = null,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as String,
            title: null == title
                ? _value.title
                : title // ignore: cast_nullable_to_non_nullable
                      as String,
            message: null == message
                ? _value.message
                : message // ignore: cast_nullable_to_non_nullable
                      as String,
            type: null == type
                ? _value.type
                : type // ignore: cast_nullable_to_non_nullable
                      as String,
            date: null == date
                ? _value.date
                : date // ignore: cast_nullable_to_non_nullable
                      as DateTime,
            isRead: null == isRead
                ? _value.isRead
                : isRead // ignore: cast_nullable_to_non_nullable
                      as bool,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$SmartAlertImplCopyWith<$Res>
    implements $SmartAlertCopyWith<$Res> {
  factory _$$SmartAlertImplCopyWith(
    _$SmartAlertImpl value,
    $Res Function(_$SmartAlertImpl) then,
  ) = __$$SmartAlertImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String id,
    String title,
    String message,
    String type,
    DateTime date,
    bool isRead,
  });
}

/// @nodoc
class __$$SmartAlertImplCopyWithImpl<$Res>
    extends _$SmartAlertCopyWithImpl<$Res, _$SmartAlertImpl>
    implements _$$SmartAlertImplCopyWith<$Res> {
  __$$SmartAlertImplCopyWithImpl(
    _$SmartAlertImpl _value,
    $Res Function(_$SmartAlertImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of SmartAlert
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? title = null,
    Object? message = null,
    Object? type = null,
    Object? date = null,
    Object? isRead = null,
  }) {
    return _then(
      _$SmartAlertImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as String,
        title: null == title
            ? _value.title
            : title // ignore: cast_nullable_to_non_nullable
                  as String,
        message: null == message
            ? _value.message
            : message // ignore: cast_nullable_to_non_nullable
                  as String,
        type: null == type
            ? _value.type
            : type // ignore: cast_nullable_to_non_nullable
                  as String,
        date: null == date
            ? _value.date
            : date // ignore: cast_nullable_to_non_nullable
                  as DateTime,
        isRead: null == isRead
            ? _value.isRead
            : isRead // ignore: cast_nullable_to_non_nullable
                  as bool,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$SmartAlertImpl implements _SmartAlert {
  const _$SmartAlertImpl({
    required this.id,
    required this.title,
    required this.message,
    required this.type,
    required this.date,
    this.isRead = false,
  });

  factory _$SmartAlertImpl.fromJson(Map<String, dynamic> json) =>
      _$$SmartAlertImplFromJson(json);

  @override
  final String id;
  @override
  final String title;
  @override
  final String message;
  @override
  final String type;
  @override
  final DateTime date;
  @override
  @JsonKey()
  final bool isRead;

  @override
  String toString() {
    return 'SmartAlert(id: $id, title: $title, message: $message, type: $type, date: $date, isRead: $isRead)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$SmartAlertImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.title, title) || other.title == title) &&
            (identical(other.message, message) || other.message == message) &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.date, date) || other.date == date) &&
            (identical(other.isRead, isRead) || other.isRead == isRead));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode =>
      Object.hash(runtimeType, id, title, message, type, date, isRead);

  /// Create a copy of SmartAlert
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$SmartAlertImplCopyWith<_$SmartAlertImpl> get copyWith =>
      __$$SmartAlertImplCopyWithImpl<_$SmartAlertImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$SmartAlertImplToJson(this);
  }
}

abstract class _SmartAlert implements SmartAlert {
  const factory _SmartAlert({
    required final String id,
    required final String title,
    required final String message,
    required final String type,
    required final DateTime date,
    final bool isRead,
  }) = _$SmartAlertImpl;

  factory _SmartAlert.fromJson(Map<String, dynamic> json) =
      _$SmartAlertImpl.fromJson;

  @override
  String get id;
  @override
  String get title;
  @override
  String get message;
  @override
  String get type;
  @override
  DateTime get date;
  @override
  bool get isRead;

  /// Create a copy of SmartAlert
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$SmartAlertImplCopyWith<_$SmartAlertImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
