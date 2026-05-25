'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ToastProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;

export const ToastViewport = ({ className }: { className?: string }) => (
  <div className={cn(
    "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:bottom-6 sm:right-6 sm:top-auto sm:flex-col sm:gap-3 md:max-w-[400px]",
    className
  )} />
);

export const Toast = ({ className, variant, children, onOpenChange, open, defaultOpen, ...props }: any) => (
  <div className={cn(
    "group pointer-events-auto relative flex w-full items-center justify-between gap-3 overflow-hidden rounded-2xl border p-5 pr-10 shadow-lg backdrop-blur-2xl transition-all duration-300",
    variant === 'destructive'
      ? "border-red-200 bg-red-50/90 text-red-900 dark:border-red-500/20 dark:bg-red-950/80 dark:text-red-200"
      : "border-border/50 bg-white/85 text-foreground dark:border-white/8 dark:bg-card/85",
    className
  )} {...props}>
    {children}
  </div>
);

export const ToastTitle = ({ className, ...props }: any) => (
  <div className={cn("text-sm font-semibold tracking-tight", className)} {...props} />
);

export const ToastDescription = ({ className, ...props }: any) => (
  <div className={cn("text-sm font-medium opacity-70", className)} {...props} />
);

export const ToastClose = ({ className, ...props }: any) => (
  <button
    className={cn(
      "absolute right-3 top-3 rounded-lg p-1 text-muted-foreground/40 opacity-0 transition-all hover:text-foreground hover:bg-muted group-hover:opacity-100",
      className
    )}
    {...props}
  >
    <X className="h-4 w-4" />
  </button>
);

export const ToastAction = ({ className, ...props }: any) => (
  <div
    className={cn(
      "inline-flex h-9 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-white px-3 text-sm font-medium transition-colors hover:bg-muted/50 dark:bg-white/5",
      className
    )}
    {...props}
  />
);
