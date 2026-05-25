'use client';

import React from 'react';
import { Check, Circle, XCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SalesOrder } from "@/types";

const STEPS = [
  { key: 'draft', label: 'Draft' },
  { key: 'confirmed', label: 'Dikonfirmasi' },
  { key: 'processing', label: 'Diproses' },
  { key: 'ready', label: 'Siap' },
  { key: 'fulfilled', label: 'Selesai' },
  { key: 'invoiced', label: 'Invoice' },
  { key: 'paid', label: 'Dibayar' },
] as const;

const STEP_ORDER: Record<string, number> = {
  draft: 0,
  confirmed: 1,
  processing: 2,
  ready: 3,
  fulfilled: 4,
  invoiced: 5,
  paid: 6,
};

const TERMINAL_STATES = ['cancelled', 'voided'] as const;

interface PesananStatusStepperProps {
  currentStatus: SalesOrder['status'];
}

export function PesananStatusStepper({ currentStatus }: PesananStatusStepperProps) {
  const isTerminal = TERMINAL_STATES.includes(currentStatus as typeof TERMINAL_STATES[number]);
  const currentIdx = STEP_ORDER[currentStatus] ?? -1;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        {STEPS.map((step, idx) => {
          const isCompleted = !isTerminal && idx <= currentIdx;
          const isCurrent = !isTerminal && idx === currentIdx;
          const isFuture = isTerminal || idx > currentIdx;

          return (
            <React.Fragment key={step.key}>
              <div className="flex flex-col items-center gap-1.5 flex-1">
                <div
                  className={cn(
                    "flex items-center justify-center size-8 rounded-full border-2 transition-colors",
                    isCompleted && "bg-green-500 border-green-500 text-white",
                    isCurrent && "bg-primary border-primary text-primary-foreground",
                    isFuture && "bg-white border-gray-200 text-gray-300"
                  )}
                >
                  {isCompleted ? (
                    <Check className="size-4" />
                  ) : isCurrent ? (
                    <Circle className="size-4 fill-current" />
                  ) : (
                    <Circle className="size-4" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium text-center leading-tight",
                    isCompleted && "text-green-600",
                    isCurrent && "text-primary font-bold",
                    isFuture && "text-gray-300"
                  )}
                >
                  {step.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 -mt-5 transition-colors",
                    idx < currentIdx && !isTerminal ? "bg-green-500" : "bg-gray-200"
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {isTerminal && (
        <div className="flex items-center justify-center gap-3 mt-3">
          {currentStatus === 'cancelled' && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200">
              <XCircle className="size-4 text-red-500" />
              <span className="text-xs font-bold text-red-600">Dibatalkan</span>
            </div>
          )}
          {currentStatus === 'voided' && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200">
              <AlertTriangle className="size-4 text-rose-500" />
              <span className="text-xs font-bold text-rose-600">Void</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
