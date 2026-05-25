'use client';

import React from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Crown, Lock } from "lucide-react";

interface PremiumGateProps {
  children: React.ReactNode;
  featureName: string;
  requiredTier?: string;
  onUpgrade?: () => void;
}

export function PremiumGate({
  children,
  featureName,
  requiredTier = 'premium',
  onUpgrade,
}: PremiumGateProps) {
  return (
    <div className="relative">
      <div className="relative overflow-hidden rounded-2xl">
        <div className="blur-sm select-none pointer-events-none">
          {children}
        </div>
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl bg-white/60 backdrop-blur-[2px] p-6 text-center">
        <div className="size-12 rounded-2xl bg-amber-100 flex items-center justify-center border border-amber-200">
          <Crown className="size-6 text-amber-500" />
        </div>

        <div className="space-y-1">
          <p className="font-heading text-sm font-bold text-slate-800">
            Fitur Premium
          </p>
          <p className="text-xs text-muted-foreground max-w-[240px]">
            <span className="font-semibold text-slate-700">{featureName}</span> tersedia untuk pengguna{' '}
            <span className="font-semibold capitalize text-amber-600">{requiredTier}</span>.
          </p>
        </div>

        <Button
          onClick={onUpgrade}
          className="bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl gap-2 shadow-lg shadow-amber-200"
        >
          <Crown className="size-4" />
          Upgrade ke Premium
        </Button>
      </div>
    </div>
  );
}
