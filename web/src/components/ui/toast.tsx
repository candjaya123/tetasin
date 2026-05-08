'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ToastProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;

export const ToastViewport = ({ className }: { className?: string }) => (
  <div className={cn("fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]", className)} />
);

export const Toast = ({ className, variant, children, onOpenChange, open, defaultOpen, ...props }: any) => (
  <div className={cn(
    "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-xl border p-6 pr-8 shadow-lg transition-all bg-white",
    variant === 'destructive' ? "border-red-200 bg-red-50 text-red-900" : "border-slate-200 text-slate-900",
    className
  )} {...props}>
    {children}
  </div>
);

export const ToastTitle = ({ className, ...props }: any) => (
  <div className={cn("text-sm font-black tracking-tight", className)} {...props} />
);

export const ToastDescription = ({ className, ...props }: any) => (
  <div className={cn("text-sm font-medium opacity-70", className)} {...props} />
);

export const ToastClose = ({ className, ...props }: any) => (
  <button className={cn("absolute right-2 top-2 rounded-md p-1 text-slate-400 opacity-0 transition-opacity hover:text-slate-900 group-hover:opacity-100", className)} {...props}>
    <X className="h-4 w-4" />
  </button>
);

export const ToastAction = ({ className, ...props }: any) => (
  <div className={cn("inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors hover:bg-slate-100", className)} {...props} />
);
