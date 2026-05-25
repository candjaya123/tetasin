'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Scale, 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp,
  ShieldAlert,
  Download
} from "lucide-react";
import { ReportSkeleton } from '@/components/finance/ReportSkeleton';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { profileService } from '@/lib/api/profileService';
import { Button } from '@/components/ui/button';
import { ReportTreeTable } from '@/components/shared/ReportTreeTable';
import { exportHierarchicalReport } from '@/lib/exportUtils';

interface BalanceSheetData {
  assets: { total: string; accounts: any[] };
  liabilities: { total: string; accounts: any[] };
  equity: { total: string; accounts: any[] };
  is_balanced: boolean;
  difference: string;
}

export default function BalanceSheetPage() {
  const [data, setData] = useState<BalanceSheetData | null>(null);
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

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/reports/balance-sheet`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) throw new Error('Gagal mengambil data neraca');
        const result = await response.json();
        setData(result);
      } catch (err: any) {
        console.error('Error fetching balance sheet:', err);
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
    }).format(Math.abs(num));
  };

  const reportData = [
    { title: 'Aset (Assets)', total: data?.assets.total || '0', accounts: data?.assets.accounts || [], color: 'text-primary' },
    { title: 'Liabilitas (Liabilities)', total: data?.liabilities.total || '0', accounts: data?.liabilities.accounts || [], color: 'text-red-500' },
    { title: 'Ekuitas (Equity)', total: data?.equity.total || '0', accounts: data?.equity.accounts || [], color: 'text-green-600' },
  ];

  const handleExport = () => {
    if (!data) return;
    exportHierarchicalReport('Laporan_Neraca', reportData);
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
            Laporan Neraca Keuangan hanya tersedia untuk akun tipe Bisnis. Silakan gunakan Dashboard Utama untuk ringkasan keuangan pribadi Anda.
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
              <Scale className="w-8 h-8 text-primary" />
              Neraca Keuangan
            </h1>
            <p className="text-slate-500 font-medium tracking-wide uppercase text-[10px] bg-slate-100 w-fit px-3 py-1 rounded-full border border-slate-200">
              Posisi Keuangan Bisnis per <span suppressHydrationWarning>{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
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
          <Card className="border-none shadow-xl shadow-primary/5 bg-secondary text-white rounded-[2rem] overflow-hidden group">
            <CardContent className="p-8 relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/20 transition-all" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Total Aset</p>
              <h2 className="text-3xl font-black mt-2 tracking-tight">{formatCurrency(data?.assets.total || 0)}</h2>
              <div className="flex items-center gap-2 mt-4 text-primary text-[10px] font-black uppercase tracking-widest bg-white/5 w-fit px-3 py-1.5 rounded-xl border border-white/10">
                <TrendingUp className="w-3 h-3" />
                <span>Likuiditas Aktif</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border border-border shadow-sm bg-white rounded-[2rem] hover:shadow-xl transition-all group overflow-hidden">
            <CardContent className="p-8">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Total Liabilitas</p>
              <h2 className="text-3xl font-black mt-2 text-slate-800 tracking-tight">{formatCurrency(data?.liabilities.total || 0)}</h2>
              <div className="flex items-center gap-2 mt-4 text-red-500 text-[10px] font-black uppercase tracking-widest bg-red-50 w-fit px-3 py-1.5 rounded-xl border border-red-100">
                <ArrowDownRight className="w-3 h-3" />
                <span>Kewajiban</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border shadow-sm bg-white rounded-[2rem] hover:shadow-xl transition-all group overflow-hidden">
            <CardContent className="p-8">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Total Ekuitas</p>
              <h2 className="text-3xl font-black mt-2 text-slate-800 tracking-tight">{formatCurrency(data?.equity.total || 0)}</h2>
              <div className="flex items-center gap-2 mt-4 text-green-500 text-[10px] font-black uppercase tracking-widest bg-green-50 w-fit px-3 py-1.5 rounded-xl border border-green-100">
                <ArrowUpRight className="w-3 h-3" />
                <span>Modal Bersih</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
           <div className="flex items-center justify-between px-4">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Rincian Neraca (Aktiva & Pasiva)</h3>
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                <div className="w-2 h-2 rounded-full bg-primary" />
                Agregasi Ledger SQL
              </div>
           </div>
           <ReportTreeTable 
            data={reportData} 
          />
        </div>

        <div className={`p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group transition-all duration-500 ${data?.is_balanced ? 'bg-secondary' : 'bg-red-900'}`}>
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 blur-3xl group-hover:bg-white/10 transition-all" />
          <div className="flex items-center justify-between relative">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-all duration-500">
                <Scale className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-1">Audit Integritas</p>
                <h3 className="text-2xl font-black tracking-tight uppercase">
                  {data?.is_balanced ? 'Status Neraca Seimbang' : 'Neraca Tidak Seimbang'}
                </h3>
                <p className="text-slate-400 text-xs font-bold mt-1">
                  {data?.is_balanced 
                    ? 'Audit otomatis mendeteksi Aset = Liabilitas + Ekuitas dengan presisi absolut.'
                    : `Terdapat selisih sebesar ${formatCurrency(data?.difference || '0')} pada pencatatan ledger Anda.`
                  }
                </p>
              </div>
            </div>
            {data?.is_balanced && (
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Value Audit</p>
                <p className="text-xl font-black text-primary tracking-tight">{formatCurrency(data?.assets.total || 0)}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
