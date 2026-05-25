'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center p-12 bg-card rounded-[2rem] border-2 border-dashed border-border text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center border border-red-100">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-secondary uppercase tracking-tight">Oops! Terjadi Kesalahan</h3>
            <p className="text-slate-500 font-medium max-w-xs mx-auto">
              Sistem gagal memproses data laporan saat ini. Pastikan koneksi internet Anda stabil.
            </p>
          </div>
          <Button 
            onClick={() => this.setState({ hasError: false })}
            className="rounded-2xl px-8 py-6 font-black uppercase tracking-widest text-xs gap-2"
          >
            <RefreshCcw className="w-4 h-4" />
            Coba Segarkan
          </Button>
          {this.state.error && (
             <p className="text-[10px] text-slate-300 font-mono mt-4">Error: {this.state.error.message}</p>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
