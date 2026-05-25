'use client';

import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Beaker, Coins, Square } from "lucide-react";

interface HppModeBadgeProps {
  mode: 'recipe' | 'direct' | 'none';
}

const modeConfig: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  recipe: {
    label: 'Resep',
    icon: <Beaker className="w-3 h-3" />,
    className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  direct: {
    label: 'Langsung',
    icon: <Coins className="w-3 h-3" />,
    className: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  none: {
    label: 'Tidak Ada',
    icon: <Square className="w-3 h-3" />,
    className: 'bg-slate-100 text-slate-500 border-slate-200',
  },
};

export function HppModeBadge({ mode }: HppModeBadgeProps) {
  const config = modeConfig[mode] ?? modeConfig.none;

  return (
    <Badge variant="outline" className={`${config.className} gap-1 px-2 py-0.5 text-[10px] font-bold`}>
      {config.icon}
      {config.label}
    </Badge>
  );
}
