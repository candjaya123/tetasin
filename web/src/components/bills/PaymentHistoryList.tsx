'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Calendar, Landmark, FileText, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentEntry {
  id: string;
  date: string;
  amount: number;
  accountName: string;
  journalId?: string;
}

interface PaymentHistoryListProps {
  payments: PaymentEntry[];
}

export function PaymentHistoryList({ payments }: PaymentHistoryListProps) {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

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
      month: 'long',
      year: 'numeric',
    });
  };

  const toggle = (id: string) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (payments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-slate-400">
        <Receipt className="size-10 mb-2 opacity-40" />
        <p className="text-sm">Belum ada pembayaran</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
      {payments.map((payment) => {
        const isExpanded = !!expandedItems[payment.id];

        return (
          <div key={payment.id} className="bg-white">
            <button
              onClick={() => toggle(payment.id)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-1 rounded transition-colors",
                  isExpanded ? "bg-slate-100 text-slate-600" : "text-slate-400"
                )}>
                  {isExpanded ? (
                    <ChevronDown className="size-4" />
                  ) : (
                    <ChevronRight className="size-4" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Calendar className="size-3.5 text-slate-400" />
                    <span className="text-xs text-slate-500">{formatDate(payment.date)}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Landmark className="size-3.5 text-slate-400" />
                    <span className="text-sm font-medium text-slate-600">{payment.accountName}</span>
                  </div>
                </div>
              </div>
              <span className="text-sm font-black text-green-600">
                {formatCurrency(payment.amount)}
              </span>
            </button>

            {isExpanded && (
              <div className="px-4 pb-3 pl-16 space-y-2">
                {payment.journalId && (
                  <div className="flex items-center gap-2 text-xs">
                    <FileText className="size-3.5 text-slate-400" />
                    <span className="text-slate-500">Jurnal:</span>
                    <span className="font-mono text-slate-600">{payment.journalId}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
