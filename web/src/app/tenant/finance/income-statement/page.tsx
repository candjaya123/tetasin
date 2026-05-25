'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  BarChart3,
  Calendar,
  ShieldAlert,
  Download
} from "lucide-react";
import { ReportSkeleton } from '@/components/finance/ReportSkeleton';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { profileService } from '@/lib/api/profileService';
import { Button } from '@/components/ui/button';
import { ReportTreeTable } from '@/components/shared/ReportTreeTable';
import { exportHierarchicalReport } from '@/lib/exportUtils';

interface IncomeStatementData {
  revenue: { total: string; accounts: any[] };
  cogs: { total: string; accounts: any[] };
  opex: { total: string; accounts: any[] };
  gross_profit: string;
  net_profit: string;
}

export default function IncomeStatementPage() {
  const [data, setData] = useState<IncomeStatementData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const initPage = async () => {
      try {
        setLoading(true);
        const tnt = await profileService.getTenant();
        setTenant(tnt);

        if (tnt?.account_type === 'personal') {
          setLoading(false);
          return;
        }

        const session = await supabase.auth.getSession();
        const token = session.data.session?.access_token;

        const start = new Date();
        start.setMonth(start.getMonth() - 1);
        const end = new Date();

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/reports/income-statement?startDate=${start.toISOString()}&endDate=${end.toISOString()}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error('Gagal mengambil data laporan laba rugi');
        const result = await response.json();
        setData(result);
      } catch (err: any) {
        console.error('Error fetching income statement:', err);
      } finally {
        setLoading(false);
      }
    };

    initPage();
  }, [supabase]);

  const formatCurrency = (val: string | number) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(num);
  };

  const reportData = [
    { title: 'Pendapatan (Revenue)', total: data?.revenue.total || '0', accounts: data?.revenue.accounts || [], color: 'text-green-600' },
    { title: 'Harga Pokok Penjualan (COGS)', total: data?.cogs.total || '0', accounts: data?.cogs.accounts || [], color: 'text-red-500' },
    { title: 'Beban Operasional (OPEX)', total: data?.opex.total || '0', accounts: data?.opex.accounts || [], color: 'text-red-500' },
  ];

  const handleExport = () => {
    if (!data) return;
    exportHierarchicalReport('Laporan_Laba_Rugi', reportData);
  };

  if (loading) return <div className="p-8"><ReportSkeleton /></div>;

  if (tenant?.account_type === 'personal') {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-6 text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center border border-primary/20">
          <ShieldAlert className="w-12 h-12 text-primary" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-secondary tracking-tight">FITUR BISNIS TERPROTEKSI</h2>
          <p className="text-slate-500 font-medium max-w-sm mx-auto">
            Laporan Laba Rugi hanya tersedia untuk akun tipe Bisnis. Silakan gunakan Dashboard Utama untuk ringkasan keuangan pribadi Anda.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3 uppercase">
              <BarChart3 className="w-8 h-8 text-primary" />
              Laporan Laba Rugi
            </h1>
            <p className="text-slate-500 font-medium tracking-wide uppercase text-[10px] bg-slate-100 w-fit px-3 py-1 rounded-full border border-slate-200">
              Analisa performa profitabilitas bisnis berbasis hierarki standar ERP
            </p>
          </div>
          <Button 
            className="rounded-2xl px-6 py-6 font-black uppercase tracking-widest text-[10px] gap-2 shadow-xl shadow-primary/10 transition-all hover:scale-105 active:scale-95"
            onClick={handleExport}
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border border-border shadow-sm bg-white rounded-[2rem] hover:shadow-xl transition-all group overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Total Pendapatan</p>
                <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
              </div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">{formatCurrency(data?.revenue.total || 0)}</h2>
            </CardContent>
          </Card>
          
          <Card className="border border-border shadow-sm bg-white rounded-[2rem] hover:shadow-xl transition-all group overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Total Pengeluaran</p>
                <div className="w-10 h-10 bg-red-50 rounded-2xl flex items-center justify-center border border-red-100 group-hover:scale-110 transition-transform">
                  <ArrowDownRight className="w-5 h-5 text-red-600" />
                </div>
              </div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">{formatCurrency(parseFloat(data?.cogs.total || '0') + parseFloat(data?.opex.total || '0'))}</h2>
            </CardContent>
          </Card>

          <Card className={`border-none shadow-2xl rounded-[2rem] text-white relative overflow-hidden group ${parseFloat(data?.net_profit || '0') >= 0 ? 'bg-secondary' : 'bg-red-900'}`}>
            <CardContent className="p-8 relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-white/10 transition-all" />
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Laba Bersih</p>
                <BarChart3 className="w-5 h-5 opacity-60" />
              </div>
              <h2 className="text-3xl font-black tracking-tight">{formatCurrency(data?.net_profit || 0)}</h2>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
           <div className="flex items-center justify-between px-4">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Rincian Laporan Hierarkis</h3>
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                <div className="w-2 h-2 rounded-full bg-primary" />
                Standard PSAK/IFRS
              </div>
           </div>
           <ReportTreeTable 
            data={reportData} 
            netTitle="Laba (Rugi) Bersih" 
            netValue={data?.net_profit} 
          />
        </div>

        <div className="p-10 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full -mr-24 -mt-24 blur-3xl group-hover:bg-primary/20 transition-all" />
            <div className="flex items-center gap-6 relative">
              <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10">
                <Calendar className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-black tracking-tight uppercase">Analisa Akuntansi Presisi</h3>
                <p className="text-slate-400 text-xs font-bold mt-1 tracking-wide">Laporan ini dihasilkan secara real-time dari database ledger dengan agregasi SQL tingkat tinggi untuk akurasi mutlak.</p>
              </div>
            </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
