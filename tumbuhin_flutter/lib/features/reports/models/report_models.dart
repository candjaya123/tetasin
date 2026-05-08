class ReportSummary {
  final double netProfit;
  final double revenue;
  final double expenses;
  final int lowStockCount;
  final double expenseRatio;

  ReportSummary({
    required this.netProfit,
    required this.revenue,
    required this.expenses,
    required this.lowStockCount,
    required this.expenseRatio,
  });

  factory ReportSummary.fromJson(Map<String, dynamic> json) {
    return ReportSummary(
      netProfit: (json['net_profit'] ?? 0.0).toDouble(),
      revenue: (json['revenue'] ?? 0.0).toDouble(),
      expenses: (json['expenses'] ?? 0.0).toDouble(),
      lowStockCount: json['low_stock_count'] ?? 0,
      expenseRatio: (json['expense_ratio'] ?? 0.0).toDouble(),
    );
  }
}

class JournalEntry {
  final String id;
  final DateTime date;
  final String description;
  final String referenceNumber;
  final double totalAmount;
  final List<JournalLine> lines;

  JournalEntry({
    required this.id,
    required this.date,
    required this.description,
    required this.referenceNumber,
    required this.totalAmount,
    required this.lines,
  });

  factory JournalEntry.fromJson(Map<String, dynamic> json) {
    return JournalEntry(
      id: json['id'],
      date: DateTime.parse(json['date'] ?? json['created_at']),
      description: json['description'] ?? '',
      referenceNumber: json['reference_doc'] ?? '',
      totalAmount: (json['total_amount'] ?? 0.0).toDouble(),
      lines: (json['journal_lines'] as List? ?? [])
          .map((l) => JournalLine.fromJson(l))
          .toList(),
    );
  }
}

class JournalLine {
  final String id;
  final String accountId;
  final String accountName;
  final String accountCode;
  final String accountType;
  final double debit;
  final double credit;

  JournalLine({
    required this.id,
    required this.accountId,
    required this.accountName,
    required this.accountCode,
    required this.accountType,
    required this.debit,
    required this.credit,
  });

  factory JournalLine.fromJson(Map<String, dynamic> json) {
    final coa = json['chart_of_accounts'] ?? json['accounts'] ?? {};
    return JournalLine(
      id: json['id'],
      accountId: json['account_id'],
      accountName: coa['name'] ?? '',
      accountCode: coa['code'] ?? '',
      accountType: coa['type'] ?? '',
      debit: (json['debit'] ?? 0.0).toDouble(),
      credit: (json['credit'] ?? 0.0).toDouble(),
    );
  }
}

class LedgerEntry {
  final String id;
  final DateTime date;
  final String description;
  final String reference;
  final double debit;
  final double credit;
  final double balance;

  LedgerEntry({
    required this.id,
    required this.date,
    required this.description,
    required this.reference,
    required this.debit,
    required this.credit,
    required this.balance,
  });

  factory LedgerEntry.fromJson(Map<String, dynamic> json, double currentBalance) {
    return LedgerEntry(
      id: json['id'],
      date: DateTime.parse(json['created_at']),
      description: json['journal_entries']?['description'] ?? '',
      reference: json['journal_entries']?['reference_number'] ?? '',
      debit: (json['debit'] ?? 0.0).toDouble(),
      credit: (json['credit'] ?? 0.0).toDouble(),
      balance: currentBalance,
    );
  }
}

class SalesReportItem {
  final String id;
  final DateTime date;
  final String orderNumber;
  final String customerName;
  final double totalAmount;
  final String status;

  SalesReportItem({
    required this.id,
    required this.date,
    required this.orderNumber,
    required this.customerName,
    required this.totalAmount,
    required this.status,
  });

  factory SalesReportItem.fromJson(Map<String, dynamic> json) {
    return SalesReportItem(
      id: json['id'],
      date: DateTime.parse(json['created_at']),
      orderNumber: json['order_number'] ?? '',
      customerName: json['customer_name'] ?? 'Guest',
      totalAmount: (json['total_amount'] ?? 0.0).toDouble(),
      status: json['status'] ?? 'completed',
    );
  }
}

class StockReportItem {
  final String id;
  final String name;
  final String sku;
  final int currentStock;
  final int minStock;
  final double unitPrice;

  StockReportItem({
    required this.id,
    required this.name,
    required this.sku,
    required this.currentStock,
    required this.minStock,
    required this.unitPrice,
  });

  factory StockReportItem.fromJson(Map<String, dynamic> json) {
    return StockReportItem(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      sku: json['sku_code'] ?? json['sku'] ?? '',
      currentStock: (json['stock'] ?? json['current_stock'] ?? 0) as int,
      minStock: (json['min_stock'] ?? 5) as int,
      unitPrice: ((json['selling_price'] ?? json['price'] ?? 0.0) as num).toDouble(),
    );
  }
}

class BalanceSheetItem {
  final String accountId;
  final String code;
  final String name;
  final String type;
  final double totalDebit;
  final double totalCredit;
  final double currentBalance;

  BalanceSheetItem({
    required this.accountId,
    required this.code,
    required this.name,
    required this.type,
    required this.totalDebit,
    required this.totalCredit,
    required this.currentBalance,
  });

  factory BalanceSheetItem.fromJson(Map<String, dynamic> json) {
    return BalanceSheetItem(
      accountId: json['account_id'],
      code: json['code'],
      name: json['name'],
      type: json['type'],
      totalDebit: (json['total_debit'] ?? 0.0).toDouble(),
      totalCredit: (json['total_credit'] ?? 0.0).toDouble(),
      currentBalance: (json['current_balance'] ?? 0.0).toDouble(),
    );
  }
}
