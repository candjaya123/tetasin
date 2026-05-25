'use client';

import React from 'react';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending: { label: 'Menunggu', className: 'bg-blue-100 text-blue-700' },
  partial: { label: 'Sebagian', className: 'bg-amber-100 text-amber-700' },
  paid: { label: 'Lunas', className: 'bg-green-100 text-green-700' },
  overdue: { label: 'Jatuh Tempo', className: 'bg-red-100 text-red-700' },
  cancelled: { label: 'Dibatalkan', className: 'bg-gray-100 text-gray-500' },
};

interface BillStatusBadgeProps {
  status: string;
  className?: string;
}

export function BillStatusBadge({ status, className }: BillStatusBadgeProps) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

  return (
    <Badge variant="ghost" className={cn(cfg.className, className)}>
      {cfg.label}
    </Badge>
  );
}
