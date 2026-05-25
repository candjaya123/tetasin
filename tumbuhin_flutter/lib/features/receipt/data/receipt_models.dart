class ReceiptScan {
  final String id;
  final String tenantId;
  final String uploadedBy;
  final String imageUrl;
  final String status;
  final Map<String, dynamic>? extractedData;
  final String? errorMessage;
  final DateTime createdAt;

  ReceiptScan({
    required this.id,
    required this.tenantId,
    required this.uploadedBy,
    required this.imageUrl,
    required this.status,
    this.extractedData,
    this.errorMessage,
    required this.createdAt,
  });

  factory ReceiptScan.fromJson(Map<String, dynamic> json) {
    return ReceiptScan(
      id: json['id'] as String,
      tenantId: json['tenant_id'] as String,
      uploadedBy: json['uploaded_by'] as String,
      imageUrl: json['image_url'] as String,
      status: json['status'] as String,
      extractedData: json['extracted_data'] as Map<String, dynamic>?,
      errorMessage: json['error_message'] as String?,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }
}

class DraftTransaction {
  final String id;
  final String tenantId;
  final String? receiptScanId;
  final String status;
  final String? merchantName;
  final DateTime? transactionDate;
  final double? totalAmount;
  final double? subtotal;
  final double? taxAmount;
  final double? discountAmount;
  final String? category;
  final String? notes;
  final List<String>? tags;
  final Map<String, dynamic> aiRecommendations;
  final String? debitAccountId;
  final String? creditAccountId;
  final List<Map<String, dynamic>> lineItems;
  final DateTime? createdAt;

  DraftTransaction({
    required this.id,
    required this.tenantId,
    this.receiptScanId,
    required this.status,
    this.merchantName,
    this.transactionDate,
    this.totalAmount,
    this.subtotal,
    this.taxAmount,
    this.discountAmount,
    this.category,
    this.notes,
    this.tags,
    this.aiRecommendations = const {},
    this.debitAccountId,
    this.creditAccountId,
    this.lineItems = const [],
    this.createdAt,
  });

  factory DraftTransaction.fromJson(Map<String, dynamic> json) {
    return DraftTransaction(
      id: json['id'] as String,
      tenantId: json['tenant_id'] as String,
      receiptScanId: json['receipt_scan_id'] as String?,
      status: json['status'] as String,
      merchantName: json['merchant_name'] as String?,
      transactionDate: json['transaction_date'] != null
          ? DateTime.parse(json['transaction_date'] as String)
          : null,
      totalAmount: (json['total_amount'] as num?)?.toDouble(),
      subtotal: (json['subtotal'] as num?)?.toDouble(),
      taxAmount: (json['tax_amount'] as num?)?.toDouble(),
      discountAmount: (json['discount_amount'] as num?)?.toDouble(),
      category: json['category'] as String?,
      notes: json['notes'] as String?,
      tags: (json['tags'] as List<dynamic>?)?.cast<String>(),
      aiRecommendations:
          (json['ai_recommendations'] as Map<String, dynamic>?) ?? {},
      debitAccountId: json['debit_account_id'] as String?,
      creditAccountId: json['credit_account_id'] as String?,
      lineItems:
          (json['line_items'] as List<dynamic>?)
              ?.map((e) => e as Map<String, dynamic>)
              .toList() ??
          [],
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'] as String)
          : null,
    );
  }
}

class MerchantMapping {
  final String id;
  final String merchantName;
  final String? defaultCategory;
  final String? defaultAccountId;
  final int approvalCount;

  MerchantMapping({
    required this.id,
    required this.merchantName,
    this.defaultCategory,
    this.defaultAccountId,
    this.approvalCount = 0,
  });

  factory MerchantMapping.fromJson(Map<String, dynamic> json) {
    return MerchantMapping(
      id: json['id'] as String,
      merchantName: json['merchant_name'] as String,
      defaultCategory: json['default_category'] as String?,
      defaultAccountId: json['default_account_id'] as String?,
      approvalCount: (json['approval_count'] as num?)?.toInt() ?? 0,
    );
  }
}
