'use client';

import React from 'react';
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Repeat, CalendarDays, Trash2 } from "lucide-react";
import { PremiumGate } from "./PremiumGate";

interface RecurringItem {
  name: string;
  amount: number;
  direction: 'income' | 'expense';
  frequency: string;
  next_due_date: string;
  is_active: boolean;
}

interface RecurringCardProps {
  item: RecurringItem;
  tier: string;
  onTrigger: (item: RecurringItem) => void;
  onEdit: (item: RecurringItem) => void;
  onDelete: (item: RecurringItem) => void;
}

const formatRp = (value: number) => {
  return new Intl.NumberFormat('id-ID').format(value);
};

const FREQUENCY_LABELS: Record<string, string> = {
  daily: 'Harian',
  weekly: 'Mingguan',
  monthly: 'Bulanan',
  yearly: 'Tahunan',
};

export function RecurringCard({ item, tier, onTrigger, onEdit, onDelete }: RecurringCardProps) {
  const nextDueDate = new Date(item.next_due_date);
  const today = new Date();
  const daysUntilDue = Math.ceil((nextDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const isOverdue = daysUntilDue < 0;

  const cardContent = (
    <div
      className={cn(
        "relative rounded-2xl border border-border bg-card p-5 transition-all",
        !item.is_active && "opacity-60"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <h4 className="font-heading text-sm font-bold text-slate-800 truncate">
              {item.name}
            </h4>
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] py-0 h-5",
                item.direction === 'income'
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-700"
              )}
            >
              {item.direction === 'income' ? (
                <TrendingUp className="size-3 mr-0.5" />
              ) : (
                <TrendingDown className="size-3 mr-0.5" />
              )}
              {item.direction === 'income' ? 'Masuk' : 'Keluar'}
            </Badge>
          </div>

          <p
            className={cn(
              "text-lg font-black",
              item.direction === 'income' ? "text-emerald-600" : "text-red-600"
            )}
          >
            Rp {formatRp(item.amount)}
          </p>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Repeat className="size-3" />
              {FREQUENCY_LABELS[item.frequency] || item.frequency}
            </span>
            <span className={cn(
              "inline-flex items-center gap-1 font-medium",
              isOverdue ? "text-red-500" : "text-muted-foreground"
            )}>
              <CalendarDays className="size-3" />
              {isOverdue
                ? `${Math.abs(daysUntilDue)} hari terlambat`
                : daysUntilDue === 0
                  ? 'Hari ini'
                  : `${daysUntilDue} hari lagi`}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            className="rounded-xl text-xs font-bold"
            onClick={() => onTrigger(item)}
            disabled={!item.is_active}
          >
            Catat Sekarang
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="rounded-xl text-xs text-muted-foreground"
            onClick={() => onEdit(item)}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="rounded-xl text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => onDelete(item)}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );

  if (tier === 'free') {
    return (
      <PremiumGate featureName="Transaksi Berulang">
        {cardContent}
      </PremiumGate>
    );
  }

  return cardContent;
}
