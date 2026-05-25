'use client';

import React from 'react';
import { AlertTriangle } from "lucide-react";

interface OverdueBannerProps {
  count: number;
  onFilterOverdue: () => void;
}

export function OverdueBanner({ count, onFilterOverdue }: OverdueBannerProps) {
  if (count <= 0) return null;

  return (
    <button
      onClick={onFilterOverdue}
      className="sticky top-0 z-10 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors"
    >
      <AlertTriangle className="size-4" />
      <span>{count} tagihan sudah jatuh tempo</span>
    </button>
  );
}
