'use client';

import React from 'react';
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface NetWorthCardProps {
  totalAset: number;
  totalHutang: number;
  kekayaanBersih: number;
  previousNetWorth?: number;
}

const formatRp = (value: number) => {
  return new Intl.NumberFormat('id-ID').format(value);
};

export function NetWorthCard({ totalAset, totalHutang, kekayaanBersih, previousNetWorth }: NetWorthCardProps) {
  const isPositive = kekayaanBersih >= 0;
  const trend = previousNetWorth !== undefined ? kekayaanBersih - previousNetWorth : undefined;
  const trendPercentage = previousNetWorth && previousNetWorth !== 0
    ? ((kekayaanBersih - previousNetWorth) / Math.abs(previousNetWorth)) * 100
    : undefined;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border shadow-sm p-6",
        isPositive
          ? "bg-gradient-to-br from-emerald-50 via-white to-teal-50"
          : "bg-gradient-to-br from-red-50 via-white to-rose-50"
      )}
    >
      <div className="relative z-10 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-base font-medium text-slate-700">
            Kekayaan Bersih
          </h3>
          {trend !== undefined && (
            <div
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold",
                trend >= 0
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-red-100 text-red-700"
              )}
            >
              {trend >= 0 ? (
                <TrendingUp className="size-3.5" />
              ) : (
                <TrendingDown className="size-3.5" />
              )}
              {trendPercentage !== undefined && (
                <span>{Math.abs(trendPercentage).toFixed(1)}%</span>
              )}
            </div>
          )}
        </div>

        <p
          className={cn(
            "text-4xl font-black tracking-tight",
            isPositive ? "text-emerald-600" : "text-red-600"
          )}
        >
          Rp {formatRp(Math.abs(kekayaanBersih))}
          {!isPositive && (
            <span className="text-red-400 ml-1">-</span>
          )}
        </p>

        <div className="flex gap-6 pt-2 border-t border-border/50">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Total Aset
            </p>
            <p className="text-sm font-bold text-slate-800">
              Rp {formatRp(totalAset)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Total Hutang
            </p>
            <p className="text-sm font-bold text-slate-800">
              Rp {formatRp(totalHutang)}
            </p>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "absolute -top-12 -right-12 size-48 rounded-full opacity-[0.08]",
          isPositive ? "bg-emerald-500" : "bg-red-500"
        )}
      />
      <div
        className={cn(
          "absolute -bottom-8 -left-8 size-32 rounded-full opacity-[0.06]",
          isPositive ? "bg-teal-500" : "bg-rose-500"
        )}
      />
    </div>
  );
}
