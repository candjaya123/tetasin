// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'bill.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

Bill _$BillFromJson(Map<String, dynamic> json) {
  return _Bill.fromJson(json);
}

/// @nodoc
mixin _$Bill {
  String get id => throw _privateConstructorUsedError;
  @JsonKey(name: 'tenant_id')
  String get tenantId => throw _privateConstructorUsedError;
  String get title => throw _privateConstructorUsedError;
  double get amount => throw _privateConstructorUsedError;
  @JsonKey(name: 'bill_type')
  String get billType => throw _privateConstructorUsedError;
  @JsonKey(name: 'due_date')
  String get dueDate => throw _privateConstructorUsedError;
  @JsonKey(name: 'contact_name')
  String? get contactName => throw _privateConstructorUsedError;
  @JsonKey(name: 'contact_phone')
  String? get contactPhone => throw _privateConstructorUsedError;
  @JsonKey(name: 'coa_account_id')
  String? get coaAccountId => throw _privateConstructorUsedError;
  @JsonKey(name: 'payment_account_id')
  String? get paymentAccountId => throw _privateConstructorUsedError;
  String get status => throw _privateConstructorUsedError;
  @JsonKey(name: 'amount_paid')
  double get amountPaid => throw _privateConstructorUsedError;
  @JsonKey(name: 'reminder_days')
  List<int>? get reminderDays => throw _privateConstructorUsedError;
  String? get description => throw _privateConstructorUsedError;
  String? get photoUrl => throw _privateConstructorUsedError;
  @JsonKey(name: 'journal_entry_id')
  String? get journalEntryId => throw _privateConstructorUsedError;
  @JsonKey(name: 'last_reminded_at')
  String? get lastRemindedAt => throw _privateConstructorUsedError;
  @JsonKey(name: 'created_at')
  String? get createdAt => throw _privateConstructorUsedError;
  List<BillPayment>? get payments => throw _privateConstructorUsedError;

  /// Serializes this Bill to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of Bill
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $BillCopyWith<Bill> get copyWith => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $BillCopyWith<$Res> {
  factory $BillCopyWith(Bill value, $Res Function(Bill) then) =
      _$BillCopyWithImpl<$Res, Bill>;
  @useResult
  $Res call({
    String id,
    @JsonKey(name: 'tenant_id') String tenantId,
    String title,
    double amount,
    @JsonKey(name: 'bill_type') String billType,
    @JsonKey(name: 'due_date') String dueDate,
    @JsonKey(name: 'contact_name') String? contactName,
    @JsonKey(name: 'contact_phone') String? contactPhone,
    @JsonKey(name: 'coa_account_id') String? coaAccountId,
    @JsonKey(name: 'payment_account_id') String? paymentAccountId,
    String status,
    @JsonKey(name: 'amount_paid') double amountPaid,
    @JsonKey(name: 'reminder_days') List<int>? reminderDays,
    String? description,
    String? photoUrl,
    @JsonKey(name: 'journal_entry_id') String? journalEntryId,
    @JsonKey(name: 'last_reminded_at') String? lastRemindedAt,
    @JsonKey(name: 'created_at') String? createdAt,
    List<BillPayment>? payments,
  });
}

/// @nodoc
class _$BillCopyWithImpl<$Res, $Val extends Bill>
    implements $BillCopyWith<$Res> {
  _$BillCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of Bill
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? tenantId = null,
    Object? title = null,
    Object? amount = null,
    Object? billType = null,
    Object? dueDate = null,
    Object? contactName = freezed,
    Object? contactPhone = freezed,
    Object? coaAccountId = freezed,
    Object? paymentAccountId = freezed,
    Object? status = null,
    Object? amountPaid = null,
    Object? reminderDays = freezed,
    Object? description = freezed,
    Object? photoUrl = freezed,
    Object? journalEntryId = freezed,
    Object? lastRemindedAt = freezed,
    Object? createdAt = freezed,
    Object? payments = freezed,
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
            title: null == title
                ? _value.title
                : title // ignore: cast_nullable_to_non_nullable
                      as String,
            amount: null == amount
                ? _value.amount
                : amount // ignore: cast_nullable_to_non_nullable
                      as double,
            billType: null == billType
                ? _value.billType
                : billType // ignore: cast_nullable_to_non_nullable
                      as String,
            dueDate: null == dueDate
                ? _value.dueDate
                : dueDate // ignore: cast_nullable_to_non_nullable
                      as String,
            contactName: freezed == contactName
                ? _value.contactName
                : contactName // ignore: cast_nullable_to_non_nullable
                      as String?,
            contactPhone: freezed == contactPhone
                ? _value.contactPhone
                : contactPhone // ignore: cast_nullable_to_non_nullable
                      as String?,
            coaAccountId: freezed == coaAccountId
                ? _value.coaAccountId
                : coaAccountId // ignore: cast_nullable_to_non_nullable
                      as String?,
            paymentAccountId: freezed == paymentAccountId
                ? _value.paymentAccountId
                : paymentAccountId // ignore: cast_nullable_to_non_nullable
                      as String?,
            status: null == status
                ? _value.status
                : status // ignore: cast_nullable_to_non_nullable
                      as String,
            amountPaid: null == amountPaid
                ? _value.amountPaid
                : amountPaid // ignore: cast_nullable_to_non_nullable
                      as double,
            reminderDays: freezed == reminderDays
                ? _value.reminderDays
                : reminderDays // ignore: cast_nullable_to_non_nullable
                      as List<int>?,
            description: freezed == description
                ? _value.description
                : description // ignore: cast_nullable_to_non_nullable
                      as String?,
            photoUrl: freezed == photoUrl
                ? _value.photoUrl
                : photoUrl // ignore: cast_nullable_to_non_nullable
                      as String?,
            journalEntryId: freezed == journalEntryId
                ? _value.journalEntryId
                : journalEntryId // ignore: cast_nullable_to_non_nullable
                      as String?,
            lastRemindedAt: freezed == lastRemindedAt
                ? _value.lastRemindedAt
                : lastRemindedAt // ignore: cast_nullable_to_non_nullable
                      as String?,
            createdAt: freezed == createdAt
                ? _value.createdAt
                : createdAt // ignore: cast_nullable_to_non_nullable
                      as String?,
            payments: freezed == payments
                ? _value.payments
                : payments // ignore: cast_nullable_to_non_nullable
                      as List<BillPayment>?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$BillImplCopyWith<$Res> implements $BillCopyWith<$Res> {
  factory _$$BillImplCopyWith(
    _$BillImpl value,
    $Res Function(_$BillImpl) then,
  ) = __$$BillImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String id,
    @JsonKey(name: 'tenant_id') String tenantId,
    String title,
    double amount,
    @JsonKey(name: 'bill_type') String billType,
    @JsonKey(name: 'due_date') String dueDate,
    @JsonKey(name: 'contact_name') String? contactName,
    @JsonKey(name: 'contact_phone') String? contactPhone,
    @JsonKey(name: 'coa_account_id') String? coaAccountId,
    @JsonKey(name: 'payment_account_id') String? paymentAccountId,
    String status,
    @JsonKey(name: 'amount_paid') double amountPaid,
    @JsonKey(name: 'reminder_days') List<int>? reminderDays,
    String? description,
    String? photoUrl,
    @JsonKey(name: 'journal_entry_id') String? journalEntryId,
    @JsonKey(name: 'last_reminded_at') String? lastRemindedAt,
    @JsonKey(name: 'created_at') String? createdAt,
    List<BillPayment>? payments,
  });
}

/// @nodoc
class __$$BillImplCopyWithImpl<$Res>
    extends _$BillCopyWithImpl<$Res, _$BillImpl>
    implements _$$BillImplCopyWith<$Res> {
  __$$BillImplCopyWithImpl(_$BillImpl _value, $Res Function(_$BillImpl) _then)
    : super(_value, _then);

  /// Create a copy of Bill
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? tenantId = null,
    Object? title = null,
    Object? amount = null,
    Object? billType = null,
    Object? dueDate = null,
    Object? contactName = freezed,
    Object? contactPhone = freezed,
    Object? coaAccountId = freezed,
    Object? paymentAccountId = freezed,
    Object? status = null,
    Object? amountPaid = null,
    Object? reminderDays = freezed,
    Object? description = freezed,
    Object? photoUrl = freezed,
    Object? journalEntryId = freezed,
    Object? lastRemindedAt = freezed,
    Object? createdAt = freezed,
    Object? payments = freezed,
  }) {
    return _then(
      _$BillImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as String,
        tenantId: null == tenantId
            ? _value.tenantId
            : tenantId // ignore: cast_nullable_to_non_nullable
                  as String,
        title: null == title
            ? _value.title
            : title // ignore: cast_nullable_to_non_nullable
                  as String,
        amount: null == amount
            ? _value.amount
            : amount // ignore: cast_nullable_to_non_nullable
                  as double,
        billType: null == billType
            ? _value.billType
            : billType // ignore: cast_nullable_to_non_nullable
                  as String,
        dueDate: null == dueDate
            ? _value.dueDate
            : dueDate // ignore: cast_nullable_to_non_nullable
                  as String,
        contactName: freezed == contactName
            ? _value.contactName
            : contactName // ignore: cast_nullable_to_non_nullable
                  as String?,
        contactPhone: freezed == contactPhone
            ? _value.contactPhone
            : contactPhone // ignore: cast_nullable_to_non_nullable
                  as String?,
        coaAccountId: freezed == coaAccountId
            ? _value.coaAccountId
            : coaAccountId // ignore: cast_nullable_to_non_nullable
                  as String?,
        paymentAccountId: freezed == paymentAccountId
            ? _value.paymentAccountId
            : paymentAccountId // ignore: cast_nullable_to_non_nullable
                  as String?,
        status: null == status
            ? _value.status
            : status // ignore: cast_nullable_to_non_nullable
                  as String,
        amountPaid: null == amountPaid
            ? _value.amountPaid
            : amountPaid // ignore: cast_nullable_to_non_nullable
                  as double,
        reminderDays: freezed == reminderDays
            ? _value._reminderDays
            : reminderDays // ignore: cast_nullable_to_non_nullable
                  as List<int>?,
        description: freezed == description
            ? _value.description
            : description // ignore: cast_nullable_to_non_nullable
                  as String?,
        photoUrl: freezed == photoUrl
            ? _value.photoUrl
            : photoUrl // ignore: cast_nullable_to_non_nullable
                  as String?,
        journalEntryId: freezed == journalEntryId
            ? _value.journalEntryId
            : journalEntryId // ignore: cast_nullable_to_non_nullable
                  as String?,
        lastRemindedAt: freezed == lastRemindedAt
            ? _value.lastRemindedAt
            : lastRemindedAt // ignore: cast_nullable_to_non_nullable
                  as String?,
        createdAt: freezed == createdAt
            ? _value.createdAt
            : createdAt // ignore: cast_nullable_to_non_nullable
                  as String?,
        payments: freezed == payments
            ? _value._payments
            : payments // ignore: cast_nullable_to_non_nullable
                  as List<BillPayment>?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$BillImpl implements _Bill {
  const _$BillImpl({
    required this.id,
    @JsonKey(name: 'tenant_id') required this.tenantId,
    required this.title,
    required this.amount,
    @JsonKey(name: 'bill_type') required this.billType,
    @JsonKey(name: 'due_date') required this.dueDate,
    @JsonKey(name: 'contact_name') this.contactName,
    @JsonKey(name: 'contact_phone') this.contactPhone,
    @JsonKey(name: 'coa_account_id') this.coaAccountId,
    @JsonKey(name: 'payment_account_id') this.paymentAccountId,
    required this.status,
    @JsonKey(name: 'amount_paid') required this.amountPaid,
    @JsonKey(name: 'reminder_days') final List<int>? reminderDays,
    this.description,
    this.photoUrl,
    @JsonKey(name: 'journal_entry_id') this.journalEntryId,
    @JsonKey(name: 'last_reminded_at') this.lastRemindedAt,
    @JsonKey(name: 'created_at') this.createdAt,
    final List<BillPayment>? payments,
  }) : _reminderDays = reminderDays,
       _payments = payments;

  factory _$BillImpl.fromJson(Map<String, dynamic> json) =>
      _$$BillImplFromJson(json);

  @override
  final String id;
  @override
  @JsonKey(name: 'tenant_id')
  final String tenantId;
  @override
  final String title;
  @override
  final double amount;
  @override
  @JsonKey(name: 'bill_type')
  final String billType;
  @override
  @JsonKey(name: 'due_date')
  final String dueDate;
  @override
  @JsonKey(name: 'contact_name')
  final String? contactName;
  @override
  @JsonKey(name: 'contact_phone')
  final String? contactPhone;
  @override
  @JsonKey(name: 'coa_account_id')
  final String? coaAccountId;
  @override
  @JsonKey(name: 'payment_account_id')
  final String? paymentAccountId;
  @override
  final String status;
  @override
  @JsonKey(name: 'amount_paid')
  final double amountPaid;
  final List<int>? _reminderDays;
  @override
  @JsonKey(name: 'reminder_days')
  List<int>? get reminderDays {
    final value = _reminderDays;
    if (value == null) return null;
    if (_reminderDays is EqualUnmodifiableListView) return _reminderDays;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(value);
  }

  @override
  final String? description;
  @override
  final String? photoUrl;
  @override
  @JsonKey(name: 'journal_entry_id')
  final String? journalEntryId;
  @override
  @JsonKey(name: 'last_reminded_at')
  final String? lastRemindedAt;
  @override
  @JsonKey(name: 'created_at')
  final String? createdAt;
  final List<BillPayment>? _payments;
  @override
  List<BillPayment>? get payments {
    final value = _payments;
    if (value == null) return null;
    if (_payments is EqualUnmodifiableListView) return _payments;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(value);
  }

  @override
  String toString() {
    return 'Bill(id: $id, tenantId: $tenantId, title: $title, amount: $amount, billType: $billType, dueDate: $dueDate, contactName: $contactName, contactPhone: $contactPhone, coaAccountId: $coaAccountId, paymentAccountId: $paymentAccountId, status: $status, amountPaid: $amountPaid, reminderDays: $reminderDays, description: $description, photoUrl: $photoUrl, journalEntryId: $journalEntryId, lastRemindedAt: $lastRemindedAt, createdAt: $createdAt, payments: $payments)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$BillImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.tenantId, tenantId) ||
                other.tenantId == tenantId) &&
            (identical(other.title, title) || other.title == title) &&
            (identical(other.amount, amount) || other.amount == amount) &&
            (identical(other.billType, billType) ||
                other.billType == billType) &&
            (identical(other.dueDate, dueDate) || other.dueDate == dueDate) &&
            (identical(other.contactName, contactName) ||
                other.contactName == contactName) &&
            (identical(other.contactPhone, contactPhone) ||
                other.contactPhone == contactPhone) &&
            (identical(other.coaAccountId, coaAccountId) ||
                other.coaAccountId == coaAccountId) &&
            (identical(other.paymentAccountId, paymentAccountId) ||
                other.paymentAccountId == paymentAccountId) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.amountPaid, amountPaid) ||
                other.amountPaid == amountPaid) &&
            const DeepCollectionEquality().equals(
              other._reminderDays,
              _reminderDays,
            ) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.photoUrl, photoUrl) ||
                other.photoUrl == photoUrl) &&
            (identical(other.journalEntryId, journalEntryId) ||
                other.journalEntryId == journalEntryId) &&
            (identical(other.lastRemindedAt, lastRemindedAt) ||
                other.lastRemindedAt == lastRemindedAt) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            const DeepCollectionEquality().equals(other._payments, _payments));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hashAll([
    runtimeType,
    id,
    tenantId,
    title,
    amount,
    billType,
    dueDate,
    contactName,
    contactPhone,
    coaAccountId,
    paymentAccountId,
    status,
    amountPaid,
    const DeepCollectionEquality().hash(_reminderDays),
    description,
    photoUrl,
    journalEntryId,
    lastRemindedAt,
    createdAt,
    const DeepCollectionEquality().hash(_payments),
  ]);

  /// Create a copy of Bill
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$BillImplCopyWith<_$BillImpl> get copyWith =>
      __$$BillImplCopyWithImpl<_$BillImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$BillImplToJson(this);
  }
}

abstract class _Bill implements Bill {
  const factory _Bill({
    required final String id,
    @JsonKey(name: 'tenant_id') required final String tenantId,
    required final String title,
    required final double amount,
    @JsonKey(name: 'bill_type') required final String billType,
    @JsonKey(name: 'due_date') required final String dueDate,
    @JsonKey(name: 'contact_name') final String? contactName,
    @JsonKey(name: 'contact_phone') final String? contactPhone,
    @JsonKey(name: 'coa_account_id') final String? coaAccountId,
    @JsonKey(name: 'payment_account_id') final String? paymentAccountId,
    required final String status,
    @JsonKey(name: 'amount_paid') required final double amountPaid,
    @JsonKey(name: 'reminder_days') final List<int>? reminderDays,
    final String? description,
    final String? photoUrl,
    @JsonKey(name: 'journal_entry_id') final String? journalEntryId,
    @JsonKey(name: 'last_reminded_at') final String? lastRemindedAt,
    @JsonKey(name: 'created_at') final String? createdAt,
    final List<BillPayment>? payments,
  }) = _$BillImpl;

  factory _Bill.fromJson(Map<String, dynamic> json) = _$BillImpl.fromJson;

  @override
  String get id;
  @override
  @JsonKey(name: 'tenant_id')
  String get tenantId;
  @override
  String get title;
  @override
  double get amount;
  @override
  @JsonKey(name: 'bill_type')
  String get billType;
  @override
  @JsonKey(name: 'due_date')
  String get dueDate;
  @override
  @JsonKey(name: 'contact_name')
  String? get contactName;
  @override
  @JsonKey(name: 'contact_phone')
  String? get contactPhone;
  @override
  @JsonKey(name: 'coa_account_id')
  String? get coaAccountId;
  @override
  @JsonKey(name: 'payment_account_id')
  String? get paymentAccountId;
  @override
  String get status;
  @override
  @JsonKey(name: 'amount_paid')
  double get amountPaid;
  @override
  @JsonKey(name: 'reminder_days')
  List<int>? get reminderDays;
  @override
  String? get description;
  @override
  String? get photoUrl;
  @override
  @JsonKey(name: 'journal_entry_id')
  String? get journalEntryId;
  @override
  @JsonKey(name: 'last_reminded_at')
  String? get lastRemindedAt;
  @override
  @JsonKey(name: 'created_at')
  String? get createdAt;
  @override
  List<BillPayment>? get payments;

  /// Create a copy of Bill
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$BillImplCopyWith<_$BillImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

BillPayment _$BillPaymentFromJson(Map<String, dynamic> json) {
  return _BillPayment.fromJson(json);
}

/// @nodoc
mixin _$BillPayment {
  String get id => throw _privateConstructorUsedError;
  @JsonKey(name: 'bill_id')
  String get billId => throw _privateConstructorUsedError;
  @JsonKey(name: 'tenant_id')
  String get tenantId => throw _privateConstructorUsedError;
  double get amount => throw _privateConstructorUsedError;
  @JsonKey(name: 'payment_date')
  String get paymentDate => throw _privateConstructorUsedError;
  @JsonKey(name: 'payment_account_id')
  String? get paymentAccountId => throw _privateConstructorUsedError;
  String? get notes => throw _privateConstructorUsedError;
  @JsonKey(name: 'journal_entry_id')
  String? get journalEntryId => throw _privateConstructorUsedError;
  @JsonKey(name: 'created_at')
  String? get createdAt => throw _privateConstructorUsedError;

  /// Serializes this BillPayment to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of BillPayment
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $BillPaymentCopyWith<BillPayment> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $BillPaymentCopyWith<$Res> {
  factory $BillPaymentCopyWith(
    BillPayment value,
    $Res Function(BillPayment) then,
  ) = _$BillPaymentCopyWithImpl<$Res, BillPayment>;
  @useResult
  $Res call({
    String id,
    @JsonKey(name: 'bill_id') String billId,
    @JsonKey(name: 'tenant_id') String tenantId,
    double amount,
    @JsonKey(name: 'payment_date') String paymentDate,
    @JsonKey(name: 'payment_account_id') String? paymentAccountId,
    String? notes,
    @JsonKey(name: 'journal_entry_id') String? journalEntryId,
    @JsonKey(name: 'created_at') String? createdAt,
  });
}

/// @nodoc
class _$BillPaymentCopyWithImpl<$Res, $Val extends BillPayment>
    implements $BillPaymentCopyWith<$Res> {
  _$BillPaymentCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of BillPayment
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? billId = null,
    Object? tenantId = null,
    Object? amount = null,
    Object? paymentDate = null,
    Object? paymentAccountId = freezed,
    Object? notes = freezed,
    Object? journalEntryId = freezed,
    Object? createdAt = freezed,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as String,
            billId: null == billId
                ? _value.billId
                : billId // ignore: cast_nullable_to_non_nullable
                      as String,
            tenantId: null == tenantId
                ? _value.tenantId
                : tenantId // ignore: cast_nullable_to_non_nullable
                      as String,
            amount: null == amount
                ? _value.amount
                : amount // ignore: cast_nullable_to_non_nullable
                      as double,
            paymentDate: null == paymentDate
                ? _value.paymentDate
                : paymentDate // ignore: cast_nullable_to_non_nullable
                      as String,
            paymentAccountId: freezed == paymentAccountId
                ? _value.paymentAccountId
                : paymentAccountId // ignore: cast_nullable_to_non_nullable
                      as String?,
            notes: freezed == notes
                ? _value.notes
                : notes // ignore: cast_nullable_to_non_nullable
                      as String?,
            journalEntryId: freezed == journalEntryId
                ? _value.journalEntryId
                : journalEntryId // ignore: cast_nullable_to_non_nullable
                      as String?,
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
abstract class _$$BillPaymentImplCopyWith<$Res>
    implements $BillPaymentCopyWith<$Res> {
  factory _$$BillPaymentImplCopyWith(
    _$BillPaymentImpl value,
    $Res Function(_$BillPaymentImpl) then,
  ) = __$$BillPaymentImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String id,
    @JsonKey(name: 'bill_id') String billId,
    @JsonKey(name: 'tenant_id') String tenantId,
    double amount,
    @JsonKey(name: 'payment_date') String paymentDate,
    @JsonKey(name: 'payment_account_id') String? paymentAccountId,
    String? notes,
    @JsonKey(name: 'journal_entry_id') String? journalEntryId,
    @JsonKey(name: 'created_at') String? createdAt,
  });
}

/// @nodoc
class __$$BillPaymentImplCopyWithImpl<$Res>
    extends _$BillPaymentCopyWithImpl<$Res, _$BillPaymentImpl>
    implements _$$BillPaymentImplCopyWith<$Res> {
  __$$BillPaymentImplCopyWithImpl(
    _$BillPaymentImpl _value,
    $Res Function(_$BillPaymentImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of BillPayment
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? billId = null,
    Object? tenantId = null,
    Object? amount = null,
    Object? paymentDate = null,
    Object? paymentAccountId = freezed,
    Object? notes = freezed,
    Object? journalEntryId = freezed,
    Object? createdAt = freezed,
  }) {
    return _then(
      _$BillPaymentImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as String,
        billId: null == billId
            ? _value.billId
            : billId // ignore: cast_nullable_to_non_nullable
                  as String,
        tenantId: null == tenantId
            ? _value.tenantId
            : tenantId // ignore: cast_nullable_to_non_nullable
                  as String,
        amount: null == amount
            ? _value.amount
            : amount // ignore: cast_nullable_to_non_nullable
                  as double,
        paymentDate: null == paymentDate
            ? _value.paymentDate
            : paymentDate // ignore: cast_nullable_to_non_nullable
                  as String,
        paymentAccountId: freezed == paymentAccountId
            ? _value.paymentAccountId
            : paymentAccountId // ignore: cast_nullable_to_non_nullable
                  as String?,
        notes: freezed == notes
            ? _value.notes
            : notes // ignore: cast_nullable_to_non_nullable
                  as String?,
        journalEntryId: freezed == journalEntryId
            ? _value.journalEntryId
            : journalEntryId // ignore: cast_nullable_to_non_nullable
                  as String?,
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
class _$BillPaymentImpl implements _BillPayment {
  const _$BillPaymentImpl({
    required this.id,
    @JsonKey(name: 'bill_id') required this.billId,
    @JsonKey(name: 'tenant_id') required this.tenantId,
    required this.amount,
    @JsonKey(name: 'payment_date') required this.paymentDate,
    @JsonKey(name: 'payment_account_id') this.paymentAccountId,
    this.notes,
    @JsonKey(name: 'journal_entry_id') this.journalEntryId,
    @JsonKey(name: 'created_at') this.createdAt,
  });

  factory _$BillPaymentImpl.fromJson(Map<String, dynamic> json) =>
      _$$BillPaymentImplFromJson(json);

  @override
  final String id;
  @override
  @JsonKey(name: 'bill_id')
  final String billId;
  @override
  @JsonKey(name: 'tenant_id')
  final String tenantId;
  @override
  final double amount;
  @override
  @JsonKey(name: 'payment_date')
  final String paymentDate;
  @override
  @JsonKey(name: 'payment_account_id')
  final String? paymentAccountId;
  @override
  final String? notes;
  @override
  @JsonKey(name: 'journal_entry_id')
  final String? journalEntryId;
  @override
  @JsonKey(name: 'created_at')
  final String? createdAt;

  @override
  String toString() {
    return 'BillPayment(id: $id, billId: $billId, tenantId: $tenantId, amount: $amount, paymentDate: $paymentDate, paymentAccountId: $paymentAccountId, notes: $notes, journalEntryId: $journalEntryId, createdAt: $createdAt)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$BillPaymentImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.billId, billId) || other.billId == billId) &&
            (identical(other.tenantId, tenantId) ||
                other.tenantId == tenantId) &&
            (identical(other.amount, amount) || other.amount == amount) &&
            (identical(other.paymentDate, paymentDate) ||
                other.paymentDate == paymentDate) &&
            (identical(other.paymentAccountId, paymentAccountId) ||
                other.paymentAccountId == paymentAccountId) &&
            (identical(other.notes, notes) || other.notes == notes) &&
            (identical(other.journalEntryId, journalEntryId) ||
                other.journalEntryId == journalEntryId) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    billId,
    tenantId,
    amount,
    paymentDate,
    paymentAccountId,
    notes,
    journalEntryId,
    createdAt,
  );

  /// Create a copy of BillPayment
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$BillPaymentImplCopyWith<_$BillPaymentImpl> get copyWith =>
      __$$BillPaymentImplCopyWithImpl<_$BillPaymentImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$BillPaymentImplToJson(this);
  }
}

abstract class _BillPayment implements BillPayment {
  const factory _BillPayment({
    required final String id,
    @JsonKey(name: 'bill_id') required final String billId,
    @JsonKey(name: 'tenant_id') required final String tenantId,
    required final double amount,
    @JsonKey(name: 'payment_date') required final String paymentDate,
    @JsonKey(name: 'payment_account_id') final String? paymentAccountId,
    final String? notes,
    @JsonKey(name: 'journal_entry_id') final String? journalEntryId,
    @JsonKey(name: 'created_at') final String? createdAt,
  }) = _$BillPaymentImpl;

  factory _BillPayment.fromJson(Map<String, dynamic> json) =
      _$BillPaymentImpl.fromJson;

  @override
  String get id;
  @override
  @JsonKey(name: 'bill_id')
  String get billId;
  @override
  @JsonKey(name: 'tenant_id')
  String get tenantId;
  @override
  double get amount;
  @override
  @JsonKey(name: 'payment_date')
  String get paymentDate;
  @override
  @JsonKey(name: 'payment_account_id')
  String? get paymentAccountId;
  @override
  String? get notes;
  @override
  @JsonKey(name: 'journal_entry_id')
  String? get journalEntryId;
  @override
  @JsonKey(name: 'created_at')
  String? get createdAt;

  /// Create a copy of BillPayment
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$BillPaymentImplCopyWith<_$BillPaymentImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

BillSummary _$BillSummaryFromJson(Map<String, dynamic> json) {
  return _BillSummary.fromJson(json);
}

/// @nodoc
mixin _$BillSummary {
  BillCounter get hutang => throw _privateConstructorUsedError;
  BillCounter get piutang => throw _privateConstructorUsedError;

  /// Serializes this BillSummary to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of BillSummary
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $BillSummaryCopyWith<BillSummary> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $BillSummaryCopyWith<$Res> {
  factory $BillSummaryCopyWith(
    BillSummary value,
    $Res Function(BillSummary) then,
  ) = _$BillSummaryCopyWithImpl<$Res, BillSummary>;
  @useResult
  $Res call({BillCounter hutang, BillCounter piutang});

  $BillCounterCopyWith<$Res> get hutang;
  $BillCounterCopyWith<$Res> get piutang;
}

/// @nodoc
class _$BillSummaryCopyWithImpl<$Res, $Val extends BillSummary>
    implements $BillSummaryCopyWith<$Res> {
  _$BillSummaryCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of BillSummary
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? hutang = null, Object? piutang = null}) {
    return _then(
      _value.copyWith(
            hutang: null == hutang
                ? _value.hutang
                : hutang // ignore: cast_nullable_to_non_nullable
                      as BillCounter,
            piutang: null == piutang
                ? _value.piutang
                : piutang // ignore: cast_nullable_to_non_nullable
                      as BillCounter,
          )
          as $Val,
    );
  }

  /// Create a copy of BillSummary
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $BillCounterCopyWith<$Res> get hutang {
    return $BillCounterCopyWith<$Res>(_value.hutang, (value) {
      return _then(_value.copyWith(hutang: value) as $Val);
    });
  }

  /// Create a copy of BillSummary
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $BillCounterCopyWith<$Res> get piutang {
    return $BillCounterCopyWith<$Res>(_value.piutang, (value) {
      return _then(_value.copyWith(piutang: value) as $Val);
    });
  }
}

/// @nodoc
abstract class _$$BillSummaryImplCopyWith<$Res>
    implements $BillSummaryCopyWith<$Res> {
  factory _$$BillSummaryImplCopyWith(
    _$BillSummaryImpl value,
    $Res Function(_$BillSummaryImpl) then,
  ) = __$$BillSummaryImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({BillCounter hutang, BillCounter piutang});

  @override
  $BillCounterCopyWith<$Res> get hutang;
  @override
  $BillCounterCopyWith<$Res> get piutang;
}

/// @nodoc
class __$$BillSummaryImplCopyWithImpl<$Res>
    extends _$BillSummaryCopyWithImpl<$Res, _$BillSummaryImpl>
    implements _$$BillSummaryImplCopyWith<$Res> {
  __$$BillSummaryImplCopyWithImpl(
    _$BillSummaryImpl _value,
    $Res Function(_$BillSummaryImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of BillSummary
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? hutang = null, Object? piutang = null}) {
    return _then(
      _$BillSummaryImpl(
        hutang: null == hutang
            ? _value.hutang
            : hutang // ignore: cast_nullable_to_non_nullable
                  as BillCounter,
        piutang: null == piutang
            ? _value.piutang
            : piutang // ignore: cast_nullable_to_non_nullable
                  as BillCounter,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$BillSummaryImpl implements _BillSummary {
  const _$BillSummaryImpl({required this.hutang, required this.piutang});

  factory _$BillSummaryImpl.fromJson(Map<String, dynamic> json) =>
      _$$BillSummaryImplFromJson(json);

  @override
  final BillCounter hutang;
  @override
  final BillCounter piutang;

  @override
  String toString() {
    return 'BillSummary(hutang: $hutang, piutang: $piutang)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$BillSummaryImpl &&
            (identical(other.hutang, hutang) || other.hutang == hutang) &&
            (identical(other.piutang, piutang) || other.piutang == piutang));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, hutang, piutang);

  /// Create a copy of BillSummary
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$BillSummaryImplCopyWith<_$BillSummaryImpl> get copyWith =>
      __$$BillSummaryImplCopyWithImpl<_$BillSummaryImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$BillSummaryImplToJson(this);
  }
}

abstract class _BillSummary implements BillSummary {
  const factory _BillSummary({
    required final BillCounter hutang,
    required final BillCounter piutang,
  }) = _$BillSummaryImpl;

  factory _BillSummary.fromJson(Map<String, dynamic> json) =
      _$BillSummaryImpl.fromJson;

  @override
  BillCounter get hutang;
  @override
  BillCounter get piutang;

  /// Create a copy of BillSummary
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$BillSummaryImplCopyWith<_$BillSummaryImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

BillCounter _$BillCounterFromJson(Map<String, dynamic> json) {
  return _BillCounter.fromJson(json);
}

/// @nodoc
mixin _$BillCounter {
  int get total => throw _privateConstructorUsedError;
  @JsonKey(name: 'outstanding_amount')
  double get outstandingAmount => throw _privateConstructorUsedError;
  @JsonKey(name: 'overdue_count')
  int get overdueCount => throw _privateConstructorUsedError;

  /// Serializes this BillCounter to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of BillCounter
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $BillCounterCopyWith<BillCounter> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $BillCounterCopyWith<$Res> {
  factory $BillCounterCopyWith(
    BillCounter value,
    $Res Function(BillCounter) then,
  ) = _$BillCounterCopyWithImpl<$Res, BillCounter>;
  @useResult
  $Res call({
    int total,
    @JsonKey(name: 'outstanding_amount') double outstandingAmount,
    @JsonKey(name: 'overdue_count') int overdueCount,
  });
}

/// @nodoc
class _$BillCounterCopyWithImpl<$Res, $Val extends BillCounter>
    implements $BillCounterCopyWith<$Res> {
  _$BillCounterCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of BillCounter
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? total = null,
    Object? outstandingAmount = null,
    Object? overdueCount = null,
  }) {
    return _then(
      _value.copyWith(
            total: null == total
                ? _value.total
                : total // ignore: cast_nullable_to_non_nullable
                      as int,
            outstandingAmount: null == outstandingAmount
                ? _value.outstandingAmount
                : outstandingAmount // ignore: cast_nullable_to_non_nullable
                      as double,
            overdueCount: null == overdueCount
                ? _value.overdueCount
                : overdueCount // ignore: cast_nullable_to_non_nullable
                      as int,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$BillCounterImplCopyWith<$Res>
    implements $BillCounterCopyWith<$Res> {
  factory _$$BillCounterImplCopyWith(
    _$BillCounterImpl value,
    $Res Function(_$BillCounterImpl) then,
  ) = __$$BillCounterImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int total,
    @JsonKey(name: 'outstanding_amount') double outstandingAmount,
    @JsonKey(name: 'overdue_count') int overdueCount,
  });
}

/// @nodoc
class __$$BillCounterImplCopyWithImpl<$Res>
    extends _$BillCounterCopyWithImpl<$Res, _$BillCounterImpl>
    implements _$$BillCounterImplCopyWith<$Res> {
  __$$BillCounterImplCopyWithImpl(
    _$BillCounterImpl _value,
    $Res Function(_$BillCounterImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of BillCounter
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? total = null,
    Object? outstandingAmount = null,
    Object? overdueCount = null,
  }) {
    return _then(
      _$BillCounterImpl(
        total: null == total
            ? _value.total
            : total // ignore: cast_nullable_to_non_nullable
                  as int,
        outstandingAmount: null == outstandingAmount
            ? _value.outstandingAmount
            : outstandingAmount // ignore: cast_nullable_to_non_nullable
                  as double,
        overdueCount: null == overdueCount
            ? _value.overdueCount
            : overdueCount // ignore: cast_nullable_to_non_nullable
                  as int,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$BillCounterImpl implements _BillCounter {
  const _$BillCounterImpl({
    required this.total,
    @JsonKey(name: 'outstanding_amount') required this.outstandingAmount,
    @JsonKey(name: 'overdue_count') required this.overdueCount,
  });

  factory _$BillCounterImpl.fromJson(Map<String, dynamic> json) =>
      _$$BillCounterImplFromJson(json);

  @override
  final int total;
  @override
  @JsonKey(name: 'outstanding_amount')
  final double outstandingAmount;
  @override
  @JsonKey(name: 'overdue_count')
  final int overdueCount;

  @override
  String toString() {
    return 'BillCounter(total: $total, outstandingAmount: $outstandingAmount, overdueCount: $overdueCount)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$BillCounterImpl &&
            (identical(other.total, total) || other.total == total) &&
            (identical(other.outstandingAmount, outstandingAmount) ||
                other.outstandingAmount == outstandingAmount) &&
            (identical(other.overdueCount, overdueCount) ||
                other.overdueCount == overdueCount));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode =>
      Object.hash(runtimeType, total, outstandingAmount, overdueCount);

  /// Create a copy of BillCounter
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$BillCounterImplCopyWith<_$BillCounterImpl> get copyWith =>
      __$$BillCounterImplCopyWithImpl<_$BillCounterImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$BillCounterImplToJson(this);
  }
}

abstract class _BillCounter implements BillCounter {
  const factory _BillCounter({
    required final int total,
    @JsonKey(name: 'outstanding_amount')
    required final double outstandingAmount,
    @JsonKey(name: 'overdue_count') required final int overdueCount,
  }) = _$BillCounterImpl;

  factory _BillCounter.fromJson(Map<String, dynamic> json) =
      _$BillCounterImpl.fromJson;

  @override
  int get total;
  @override
  @JsonKey(name: 'outstanding_amount')
  double get outstandingAmount;
  @override
  @JsonKey(name: 'overdue_count')
  int get overdueCount;

  /// Create a copy of BillCounter
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$BillCounterImplCopyWith<_$BillCounterImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
