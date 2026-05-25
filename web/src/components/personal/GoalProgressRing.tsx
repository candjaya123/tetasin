'use client';

import React from 'react';
import { cn } from "@/lib/utils";
import { Target, CheckCircle2, XCircle } from "lucide-react";

interface GoalProgressRingProps {
  goalName: string;
  currentAmount: number;
  targetAmount: number;
  targetDate?: string;
  status: 'active' | 'achieved' | 'cancelled';
}

const formatRp = (value: number) => {
  const formatted = new Intl.NumberFormat('id-ID').format(value);
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}Jt`;
  }
  return formatted;
};

const STATUS_CONFIG = {
  active: {
    ringColor: "stroke-blue-500",
    bgColor: "text-blue-600",
    iconBg: "bg-blue-100",
    icon: Target,
    iconColor: "text-blue-600",
  },
  achieved: {
    ringColor: "stroke-emerald-500",
    bgColor: "text-emerald-600",
    iconBg: "bg-emerald-100",
    icon: CheckCircle2,
    iconColor: "text-emerald-600",
  },
  cancelled: {
    ringColor: "stroke-slate-300",
    bgColor: "text-slate-400",
    iconBg: "bg-slate-100",
    icon: XCircle,
    iconColor: "text-slate-400",
  },
};

export function GoalProgressRing({ goalName, currentAmount, targetAmount, targetDate, status }: GoalProgressRingProps) {
  const percentage = targetAmount > 0 ? Math.min((currentAmount / targetAmount) * 100, 100) : 0;
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const daysRemaining = targetDate
    ? Math.ceil((new Date(targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : undefined;

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start gap-4">
        <div className="relative shrink-0">
          <svg
            width={100}
            height={100}
            viewBox="0 0 100 100"
            className="-rotate-90"
          >
            <circle
              cx={50}
              cy={50}
              r={radius}
              fill="none"
              strokeWidth={8}
              className="stroke-muted/30"
            />
            <circle
              cx={50}
              cy={50}
              r={radius}
              fill="none"
              strokeWidth={8}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className={cn("transition-all duration-700", config.ringColor)}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("text-sm font-black", config.bgColor)}>
              {percentage.toFixed(0)}%
            </span>
            <span className="text-[10px] font-medium text-muted-foreground">
              tercapai
            </span>
          </div>
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <div className={cn("rounded-lg p-1", config.iconBg)}>
              <Icon className={cn("size-3.5", config.iconColor)} />
            </div>
            <h4 className="font-heading text-sm font-bold text-slate-800 truncate">
              {goalName}
            </h4>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-slate-700">Rp {formatRp(currentAmount)}</span>
              <span className="text-muted-foreground">/ Rp {formatRp(targetAmount)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            {status === 'achieved' && (
              <span className="font-medium text-emerald-600">Tercapai</span>
            )}
            {status === 'cancelled' && (
              <span className="font-medium text-slate-400">Dibatalkan</span>
            )}
            {status === 'active' && daysRemaining !== undefined && (
              <span className={cn(
                "font-medium",
                daysRemaining < 0 ? "text-red-500" : "text-muted-foreground"
              )}>
                {daysRemaining < 0
                  ? `${Math.abs(daysRemaining)} hari terlambat`
                  : `${daysRemaining} hari lagi`}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
