'use client';

import React, { useMemo } from 'react';
import { cn } from "@/lib/utils";

interface MonthlyData {
  month: number;
  year: number;
  pemasukan: number;
  pengeluaran: number;
}

interface MonthlySummaryChartProps {
  data: MonthlyData[];
}

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
];

const formatRp = (value: number) => {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}Jt`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(0)}Rb`;
  }
  return new Intl.NumberFormat('id-ID').format(value);
};

export function MonthlySummaryChart({ data }: MonthlySummaryChartProps) {
  const maxValue = useMemo(() => {
    if (data.length === 0) return 1;
    return Math.max(...data.map((d) => Math.max(d.pemasukan, d.pengeluaran)), 1);
  }, [data]);

  const yAxisTicks = useMemo(() => {
    const ticks: number[] = [];
    const step = maxValue / 4;
    for (let i = 0; i <= 4; i++) {
      ticks.push(Math.round(step * i));
    }
    return ticks;
  }, [maxValue]);

  const sortedData = useMemo(
    () => [...data].sort((a, b) => a.year - b.year || a.month - b.month),
    [data]
  );

  if (sortedData.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
        Belum ada data ringkasan bulanan.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading text-base font-medium text-slate-700">
          Ringkasan Bulanan
        </h3>
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="size-3 rounded-sm bg-emerald-500" />
            <span className="text-muted-foreground">Pemasukan</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-3 rounded-sm bg-red-400" />
            <span className="text-muted-foreground">Pengeluaran</span>
          </div>
        </div>
      </div>

      <div className="relative">
        {/* Y-axis */}
        <div className="flex">
          <div className="flex flex-col justify-between pr-3 pb-6 w-14">
            {yAxisTicks.reverse().map((tick) => (
              <div key={tick} className="text-[10px] font-medium text-muted-foreground text-right leading-none">
                {formatRp(tick)}
              </div>
            ))}
          </div>

          {/* Chart area */}
          <div className="flex-1">
            {/* Grid lines */}
            <div className="relative">
              {yAxisTicks.map((tick) => (
                <div
                  key={`grid-${tick}`}
                  className="absolute left-0 right-0 border-b border-border/50"
                  style={{
                    bottom: `${(tick / maxValue) * 100}%`,
                  }}
                />
              ))}
            </div>

            {/* Bars */}
            <div className="flex items-end gap-1 pt-1 h-48">
              {sortedData.map((item) => {
                const pemasukanHeight = (item.pemasukan / maxValue) * 100;
                const pengeluaranHeight = (item.pengeluaran / maxValue) * 100;

                return (
                  <div
                    key={`${item.year}-${item.month}`}
                    className="flex-1 flex flex-col items-center gap-1 min-w-0"
                  >
                    <div className="w-full flex flex-col items-center gap-[2px]">
                      <div
                        className="w-full max-w-[20px] rounded-t-sm bg-red-400 transition-all hover:opacity-80"
                        style={{ height: `${pengeluaranHeight}%` }}
                        title={`Pengeluaran: Rp ${formatRp(item.pengeluaran)}`}
                      />
                      <div
                        className="w-full max-w-[20px] rounded-t-sm bg-emerald-500 transition-all hover:opacity-80"
                        style={{ height: `${pemasukanHeight}%` }}
                        title={`Pemasukan: Rp ${formatRp(item.pemasukan)}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* X-axis labels */}
            <div className="flex gap-1 mt-1">
              {sortedData.map((item) => (
                <div
                  key={`label-${item.year}-${item.month}`}
                  className="flex-1 text-center text-[10px] font-medium text-muted-foreground leading-tight"
                >
                  {MONTH_LABELS[item.month - 1]}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
