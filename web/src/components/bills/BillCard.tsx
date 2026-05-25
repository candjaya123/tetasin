'use client';

import React from 'react';
import { BillStatusBadge } from "@/components/bills/BillStatusBadge";
import { Badge } from "@/components/ui/badge";
import { Calendar, Phone, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Bill } from "@/types";

interface BillCardProps {
  bill: Bill;
  onClick: (bill: Bill) => void;
}

export function BillCard({ bill, onClick }: BillCardProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const isOverdue = bill.status === 'overdue';

  return (
    <button
      onClick={() => onClick(bill)}
      className={cn(
        "w-full text-left bg-white rounded-xl border border-slate-100 p-4 transition-all hover:shadow-md hover:border-slate-200",
        isOverdue && "border-l-4 border-l-red-500"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={cn(
                "text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded",
                bill.bill_type === 'hutang'
                  ? "bg-orange-100 text-orange-600"
                  : "bg-blue-100 text-blue-600"
              )}
            >
              {bill.bill_type === 'hutang' ? 'Hutang' : 'Piutang'}
            </span>
            <h4 className="text-sm font-bold text-slate-800 truncate">
              {bill.title}
            </h4>
          </div>

          {bill.contact_name && (
            <div className="flex items-center gap-1 mb-1">
              <Building2 className="size-3 text-slate-400 flex-shrink-0" />
              <span className="text-xs text-slate-500 truncate">{bill.contact_name}</span>
            </div>
          )}

          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Calendar className="size-3 flex-shrink-0" />
            <span>{formatDate(bill.due_date)}</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <span
            className={cn(
              "text-sm font-black",
              isOverdue ? "text-red-600" : "text-slate-800"
            )}
          >
            {formatCurrency(bill.amount)}
          </span>
          <BillStatusBadge status={bill.status} />
        </div>
      </div>
    </button>
  );
}
