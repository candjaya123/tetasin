'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { personalFinanceService } from '@/lib/api/personalFinanceService';
import { billTrackerService } from '@/lib/api/billTrackerService';
import { createClient } from '@/lib/supabase/client';
import { Wallet, TrendingUp, TrendingDown, Target, PiggyBank, AlertCircle, ChevronLeft, ChevronRight, Landmark, ArrowUpRight, ArrowDownRight, Receipt } from "lucide-react";
import type { PersonalMonthlySummary, NetWorth, BillSummary } from '@/types';
import { useRouter } from 'next/navigation';

export default function PersonalDashboardPage() {
  const { toast } = useToast();
  const router = useRouter();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [summary, setSummary] = useState<PersonalMonthlySummary | null>(null);
  const [netWorth, setNetWorth] = useState<NetWorth | null>(null);
  const [billSummary, setBillSummary] = useState<BillSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUserName(data.user?.user_metadata?.full_name || 'Pengguna');
    });
  }, []);

  useEffect(() => {
    loadData();
  }, [month, year]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [summaryData, nw, bs] = await Promise.all([
        personalFinanceService.getSummary(month, year),
        personalFinanceService.getNetWorth(),
        billTrackerService.getSummary(),
      ]);
      setSummary(summaryData);
      setNetWorth(nw);
      setBillSummary(bs);
    } catch (err: any) {
      toast({ title: 'Gagal memuat data', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(year - 1); }
    else { setMonth(month - 1); }
  };
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(year + 1); }
    else { setMonth(month + 1); }
  };

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">Keuangan Pribadi</h1>
          <p className="text-slate-500 mt-1">Halo, {userName}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-none shadow-sm rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Landmark className="h-5 w-5 opacity-80" />
                  <span className="text-sm font-medium opacity-80">Kekayaan Bersih</span>
                </div>
                <p className="text-3xl font-bold">{netWorth ? formatCurrency(netWorth.net_worth) : '—'}</p>
                <p className="text-xs mt-2 opacity-70">Aset: {netWorth ? formatCurrency(netWorth.aset) : '—'} | Hutang: {netWorth ? formatCurrency(netWorth.hutang) : '—'}</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="h-5 w-5 opacity-80" />
                  <span className="text-sm font-medium opacity-80">Pemasukan</span>
                </div>
                <p className="text-3xl font-bold">{summary ? formatCurrency(summary.pemasukan) : '—'}</p>
                <p className="text-xs mt-2 opacity-70">Bulan {monthNames[month - 1]} {year}</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 text-white hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingDown className="h-5 w-5 opacity-80" />
                  <span className="text-sm font-medium opacity-80">Pengeluaran</span>
                </div>
                <p className="text-3xl font-bold">{summary ? formatCurrency(summary.pengeluaran) : '—'}</p>
                <p className="text-xs mt-2 opacity-70">Selisih: {summary ? formatCurrency(summary.selisih) : '—'}</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">Ringkasan Bulanan</h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
              <span className="font-semibold min-w-[100px] text-center">{monthNames[month - 1]} {year}</span>
              <Button variant="outline" size="sm" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="shadow-sm border-border/50 rounded-2xl cursor-pointer hover:shadow-md hover:border-border transition-all" onClick={() => router.push('/tenant/personal/budgets')}>
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-xl"><Target className="h-6 w-6 text-orange-600" /></div>
                <div><p className="font-semibold text-slate-800">Anggaran</p><p className="text-sm text-slate-500">{summary?.budget_status?.length || 0} kategori</p></div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border/50 rounded-2xl cursor-pointer hover:shadow-md hover:border-border transition-all" onClick={() => router.push('/tenant/personal/goals')}>
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-xl"><PiggyBank className="h-6 w-6 text-purple-600" /></div>
                <div><p className="font-semibold text-slate-800">Target</p><p className="text-sm text-slate-500">Tujuan keuangan</p></div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border/50 rounded-2xl cursor-pointer hover:shadow-md hover:border-border transition-all" onClick={() => router.push('/tenant/bills')}>
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-xl"><Receipt className="h-6 w-6 text-red-600" /></div>
                <div>
                  <p className="font-semibold text-slate-800">Tagihan</p>
                  <p className="text-sm text-slate-500">
                    {billSummary ? `${billSummary.hutang.overdue_count} jatuh tempo` : '—'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {summary?.budget_status && summary.budget_status.length > 0 && (
            <Card className="shadow-sm border-border/50 rounded-2xl">
              <CardHeader><CardTitle className="text-lg font-bold text-slate-800">Status Anggaran</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {summary.budget_status.map((b, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm text-slate-800">{b.name}</p>
                      <p className="text-xs text-slate-500 font-medium">{formatCurrency(b.actual)} / {formatCurrency(b.budget)}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${
                        b.status === 'over_budget' ? 'text-red-600' :
                        b.status === 'warning' ? 'text-yellow-600' : 'text-green-600'
                      }`}>{b.pct_used}%</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <div className="flex gap-3">
            <Button className="flex-1 rounded-xl" onClick={() => router.push('/tenant/income')}>
              <ArrowUpRight className="h-4 w-4 mr-2" /> Catat Pemasukan
            </Button>
            <Button className="flex-1 rounded-xl" variant="secondary" onClick={() => router.push('/tenant/expense')}>
              <ArrowDownRight className="h-4 w-4 mr-2" /> Catat Pengeluaran
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
