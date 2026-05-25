'use client';

import React from 'react';
import { cn } from "@/lib/utils";

interface BudgetProgressBarProps {
  categoryName: string;
  spent: number;
  limit: number;
  accountCode: string;
}

const formatRp = (value: number) => {
  return new Intl.NumberFormat('id-ID').format(value);
};

export function BudgetProgressBar({ categoryName, spent, limit, accountCode }: BudgetProgressBarProps) {
  const percentage = limit > 0 ? (spent / limit) * 100 : 0;
  const clampedPercentage = Math.min(percentage, 100);

  const statusColor = percentage >= 100
    ? "bg-red-500"
    : percentage > 80
      ? "bg-amber-500"
      : "bg-emerald-500";

  const textColor = percentage >= 100
    ? "text-red-600"
    : percentage > 80
      ? "text-amber-600"
      : "text-emerald-600";

  const bgColor = percentage >= 100
    ? "bg-red-100"
    : percentage > 80
      ? "bg-amber-100"
      : "bg-emerald-100";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-bold text-slate-800 truncate">
            {categoryName}
          </span>
          <span className="text-[11px] font-medium text-muted-foreground shrink-0">
            {accountCode}
          </span>
        </div>
        <span className={cn("text-sm font-bold shrink-0 ml-2", textColor)}>
          {percentage.toFixed(1)}%
        </span>
      </div>

      <div className="relative h-4 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={cn("h-full rounded-full transition-all duration-500", statusColor)}
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-muted-foreground">
          Rp {formatRp(spent)}
        </span>
        <span className="font-medium text-muted-foreground">
          Rp {formatRp(limit)}
        </span>
      </div>
    </div>
  );
}
