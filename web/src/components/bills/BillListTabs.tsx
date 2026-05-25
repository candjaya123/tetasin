'use client';

import React from 'react';
import { cn } from "@/lib/utils";
import { Banknote, HandCoins, LayoutList, ClockAlert } from "lucide-react";

interface TabCounts {
  hutang: number;
  piutang: number;
  all: number;
  overdue: number;
}

const TABS = [
  {
    key: 'hutang' as const,
    label: 'Hutang',
    icon: HandCoins,
    color: 'data-[active=true]:text-orange-600 data-[active=true]:border-orange-500',
  },
  {
    key: 'piutang' as const,
    label: 'Piutang',
    icon: Banknote,
    color: 'data-[active=true]:text-blue-600 data-[active=true]:border-blue-500',
  },
  {
    key: 'all' as const,
    label: 'Semua',
    icon: LayoutList,
    color: 'data-[active=true]:text-primary data-[active=true]:border-primary',
  },
  {
    key: 'overdue' as const,
    label: 'Jatuh Tempo',
    icon: ClockAlert,
    color: 'data-[active=true]:text-red-600 data-[active=true]:border-red-500',
  },
] as const;

export type TabKey = typeof TABS[number]['key'];

interface BillListTabsProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  counts: TabCounts;
}

export function BillListTabs({ activeTab, onTabChange, counts }: BillListTabsProps) {
  return (
    <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto">
      {TABS.map(({ key, label, icon: Icon, color }) => (
        <button
          key={key}
          data-active={activeTab === key}
          onClick={() => onTabChange(key)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 border-transparent transition-colors whitespace-nowrap",
            "text-slate-400 hover:text-slate-600",
            color
          )}
        >
          <Icon className="size-4" />
          <span>{label}</span>
          {counts[key] > 0 && (
            <span
              className={cn(
                "inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full text-[10px] font-bold",
                activeTab === key ? "bg-slate-100 text-slate-700" : "bg-slate-100 text-slate-400"
              )}
            >
              {counts[key]}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
