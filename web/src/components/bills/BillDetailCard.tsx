'use client';

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BillStatusBadge } from "@/components/bills/BillStatusBadge";
import { Calendar, Phone, Building2, AlertTriangle, Landmark } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Bill } from "@/types";

interface BillDetailCardProps {
  bill: Bill & { remaining?: number };
}

export function BillDetailCard({ bill }: BillDetailCardProps) {
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

  const amountPaid = bill.amount_paid || 0;
  const remaining = bill.remaining ?? bill.amount - amountPaid;
  const progressPct = bill.amount > 0 ? Math.round((amountPaid / bill.amount) * 100) : 0;
  const isOverdue = bill.status === 'overdue';

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-800">{bill.title}</h3>
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
          </div>
          <BillStatusBadge status={bill.status} />
        </div>

        {isOverdue && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-bold">
            <AlertTriangle className="size-4 flex-shrink-0" />
            Tagihan sudah melewati jatuh tempo
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Progres Pembayaran</span>
            <span className="font-bold text-slate-700">{progressPct}%</span>
          </div>
          <Progress value={progressPct} />
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{formatCurrency(amountPaid)} dibayar</span>
            <span>{formatCurrency(bill.amount)} total</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="size-4 text-slate-400" />
            <span className="text-slate-500">Jatuh tempo:</span>
            <span className={cn("font-bold", isOverdue && "text-red-600")}>
              {formatDate(bill.due_date)}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">Sisa:</span>
            <span className="font-black text-slate-800">
              {formatCurrency(remaining)}
            </span>
          </div>

          {bill.contact_name && (
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="size-4 text-slate-400" />
              <span className="text-slate-500">Kontak:</span>
              <span className="font-bold text-slate-700">{bill.contact_name}</span>
            </div>
          )}

          {bill.contact_phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="size-4 text-slate-400" />
              <span className="text-slate-700 font-mono">{bill.contact_phone}</span>
            </div>
          )}

          {bill.coa_account_id && (
            <div className="flex items-center gap-2 text-sm col-span-full">
              <Landmark className="size-4 text-slate-400" />
              <span className="text-slate-500">Akun COA:</span>
              <span className="text-slate-700 text-xs font-mono">{bill.coa_account_id}</span>
            </div>
          )}
        </div>

        {bill.description && (
          <div className="pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-500">{bill.description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
