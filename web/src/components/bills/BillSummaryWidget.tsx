'use client';

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { HandCoins, Banknote } from "lucide-react";
import type { BillSummary } from "@/types";

interface BillSummaryWidgetProps {
  summary: BillSummary;
  onClick?: () => void;
}

export function BillSummaryWidget({ summary, onClick }: BillSummaryWidgetProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);
  };

  return (
    <Card className="cursor-pointer hover:shadow-md transition-all" onClick={onClick}>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between rounded-xl bg-orange-50 border border-orange-100 p-3">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center size-9 rounded-lg bg-orange-100 text-orange-600">
              <HandCoins className="size-5" />
            </div>
            <div>
              <p className="text-xs text-orange-500 font-medium">Hutang</p>
              <p className="text-sm font-black text-orange-700">
                {formatCurrency(summary.hutang.outstanding_amount)}
              </p>
              <p className="text-[10px] text-orange-400">
                {summary.hutang.total} tagihan
              </p>
            </div>
          </div>
          {summary.hutang.overdue_count > 0 && (
            <span className="text-[10px] font-black bg-red-500 text-white rounded-full px-2 py-0.5">
              {summary.hutang.overdue_count} JT
            </span>
          )}
        </div>

        <div className="flex items-center justify-between rounded-xl bg-blue-50 border border-blue-100 p-3">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center size-9 rounded-lg bg-blue-100 text-blue-600">
              <Banknote className="size-5" />
            </div>
            <div>
              <p className="text-xs text-blue-500 font-medium">Piutang</p>
              <p className="text-sm font-black text-blue-700">
                {formatCurrency(summary.piutang.outstanding_amount)}
              </p>
              <p className="text-[10px] text-blue-400">
                {summary.piutang.total} tagihan
              </p>
            </div>
          </div>
          {summary.piutang.overdue_count > 0 && (
            <span className="text-[10px] font-black bg-red-500 text-white rounded-full px-2 py-0.5">
              {summary.piutang.overdue_count} JT
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
