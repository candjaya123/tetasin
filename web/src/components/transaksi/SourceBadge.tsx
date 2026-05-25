'use client';

import { Badge } from "@/components/ui/badge";

const sourceConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "ghost"; className: string }> = {
  pos_sale:       { label: "POS",         variant: "default",     className: "bg-blue-100 text-blue-700 hover:bg-blue-100" },
  pos_void:       { label: "Void POS",    variant: "default",     className: "bg-red-100 text-red-700 hover:bg-red-100" },
  expense:        { label: "Pengeluaran", variant: "default",     className: "bg-orange-100 text-orange-700 hover:bg-orange-100" },
  receipt_ocr:    { label: "OCR Nota",    variant: "default",     className: "bg-purple-100 text-purple-700 hover:bg-purple-100" },
  po_fulfillment: { label: "PO Selesai",  variant: "default",     className: "bg-green-100 text-green-700 hover:bg-green-100" },
  stock_adjustment: { label: "Stok Opname", variant: "default",  className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100" },
  manual:         { label: "Manual",      variant: "default",     className: "bg-gray-100 text-gray-700 hover:bg-gray-100" },
};

interface SourceBadgeProps {
  sourceType: string;
}

export function SourceBadge({ sourceType }: SourceBadgeProps) {
  const config = sourceConfig[sourceType] ?? { label: sourceType, variant: "default" as const, className: "bg-gray-100 text-gray-700 hover:bg-gray-100" };

  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
}
