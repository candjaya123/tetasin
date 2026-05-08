'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, 
  ShoppingBag, 
  ArrowUpRight, 
  ArrowDownRight,
  Wallet,
  Zap,
  Bot,
  CreditCard,
  PieChart,
  Target,
  ArrowRight,
  Calendar,
  History,
  Search,
  Filter,
  Download,
  ChevronDown,
  ChevronUp,
  FileText
} from "lucide-react";
import { reportService } from '@/lib/api/reportService';
import { profileService } from '@/lib/api/profileService';
import { journalService } from '@/lib/api/journalService';
import { createClient } from '@/lib/supabase/client';
import { BlurredInsight } from '@/components/ai/BlurredInsight';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

const supabase = createClient();

export default function TenantOverview() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'transactions'
  const [incomeData, setIncomeData] = useState({ revenue: 0, expenses: 0, net_profit: 0 });
  const [dashboardSummary, setDashboardSummary] = useState<{ total_sales: number } | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);

  // Transaction Tab States
  const [transactions, setTransactions] = useState<any[]>([]);
  const [coa, setCoa] = useState<any[]>([]);
  const [transLoading, setTransLoading] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [accountId, setAccountId] = useState('all');
  const [transType, setTransType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const start = new Date();
        start.setMonth(start.getMonth() - 1);
        const end = new Date();

        const [tnt, income, summary, { orderService }] = await Promise.all([
          profileService.getTenant(),
          reportService.getIncomeStatement(start.toISOString(), end.toISOString()),
          reportService.getDashboardSummary(),
          import('@/lib/api/orderService')
        ]);

        if (tnt) setTenant(tnt);
        if (income) setIncomeData(income);
        if (summary) setDashboardSummary(summary);
        
        const orders = await orderService.getOrders();
        if (orders) setRecentOrders(orders.slice(0, 4));

        // Fetch COA for transactions tab
        const coaResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/finance/coa`, {
            headers: {
                'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
            }
        });
        const coaData = await coaResponse.json();
        setCoa(coaData);

        if (true) {
          const { data } = await supabase
            .from('smart_alerts')
            .select('*')
            .eq('tenant_id', tnt.id)
            .eq('is_read', false)
            .limit(3);
          if (data) setAlerts(data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === 'transactions') {
      fetchTransactions();
    }
  }, [activeTab, startDate, endDate, accountId, transType]);

  const fetchTransactions = async () => {
    setTransLoading(true);
    try {
      const data = await journalService.getTransactions({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        account_id: accountId === 'all' ? undefined : accountId,
        type: transType === 'all' ? undefined : transType
      });
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setTransLoading(false);
    }
  };

  const isPersonal = tenant?.account_type === 'personal';
  const isFull = tenant?.tier === 'full';

  const stats = (isPersonal ? [
    { title: "Saldo Saat Ini", value: formatCurrency(incomeData.net_profit), icon: <CreditCard className="w-5 h-5 text-primary" />, isPositive: incomeData.net_profit >= 0 },
    { title: "Pemasukan (30hr)", value: formatCurrency(incomeData.revenue), icon: <ArrowUpRight className="w-5 h-5 text-green-500" />, isPositive: true },
    { title: "Pengeluaran (30hr)", value: formatCurrency(incomeData.expenses), icon: <ArrowDownRight className="w-5 h-5 text-red-500" />, isPositive: false },
    { title: "Target Menabung", value: "Rp 5.000.000", icon: <Target className="w-5 h-5 text-slate-600" />, isPositive: true }
  ] : [
    { title: "Total Pendapatan", value: formatCurrency(incomeData.revenue), icon: <Wallet className="w-5 h-5 text-primary" />, isPositive: true },
    { title: "Total Transaksi", value: dashboardSummary ? `${dashboardSummary.total_sales} transaksi` : '-', icon: <ShoppingBag className="w-5 h-5 text-slate-600" />, isPositive: true },
    { title: "Laba Bersih", value: formatCurrency(incomeData.net_profit), icon: <TrendingUp className="w-5 h-5 text-slate-600" />, isPositive: incomeData.net_profit >= 0 },
    { title: "Total Beban", value: formatCurrency(incomeData.expenses), icon: <ArrowDownRight className="w-5 h-5 text-slate-600" />, isPositive: false }
  ]);

  const filteredTransactions = transactions.filter(t => 
    t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.reference_doc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/20">
               Live Dashboard
             </span>
          </div>
          <h2 className="text-3xl font-black text-secondary tracking-tight">
            Selamat Datang, {tenant?.name || 'Partner'}
          </h2>
          <p className="text-muted-foreground font-medium mt-1">
            {isPersonal ? "Kelola keuangan pribadi Anda dengan cerdas." : "Ringkasan performa bisnis Anda hari ini."}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-xl text-sm font-bold text-secondary shadow-sm">
            <Calendar className="w-4 h-4 text-primary" />
            <span>{new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex p-1 bg-slate-100/50 rounded-2xl w-full max-w-md border border-slate-200/50">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-3 px-6 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
            activeTab === 'overview' ? 'bg-white text-primary shadow-lg shadow-primary/5' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Ringkasan
        </button>
        <button 
          onClick={() => setActiveTab('transactions')}
          className={`flex-1 py-3 px-6 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
            activeTab === 'transactions' ? 'bg-white text-primary shadow-lg shadow-primary/5' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Transaksi
        </button>
      </div>

      {activeTab === 'overview' ? (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* AI Upsell Banner */}
          {!isPersonal && !isFull && (
            <Card className="border border-border bg-white shadow-sm overflow-hidden relative rounded-[2rem] group hover:shadow-primary/5 transition-all">
              <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
              <CardContent className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-primary/10 rounded-[1.25rem] border border-primary/20">
                    <Bot className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-xl font-black text-secondary">Optimasi Bisnis dengan AI</p>
                    <p className="text-muted-foreground font-medium max-w-md">Aktifkan analisa margin otomatis dan asisten AI.</p>
                  </div>
                </div>
                <button className="px-8 py-3.5 bg-secondary text-secondary-foreground rounded-2xl font-black hover:bg-secondary/90 transition-all shadow-xl shadow-secondary/10 whitespace-nowrap">
                  Upgrade ke Pro
                </button>
              </CardContent>
            </Card>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => ( 
              <Card key={i} className={`border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all rounded-[2rem] group relative overflow-hidden ${
                i === 0 ? 'bg-secondary text-white' : 'bg-white'
              }`}>
                {i === 0 && <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full -mr-12 -mt-12 blur-2xl"></div>}
                <CardHeader className="flex flex-row items-center justify-between pb-3 p-8">
                  <CardTitle className={`text-[10px] font-black uppercase tracking-[0.2em] ${i === 0 ? 'text-white/40' : 'text-slate-400'}`}>{stat.title}</CardTitle>
                  <div className={`p-3 rounded-2xl transition-all ${i === 0 ? 'bg-white/10' : 'bg-slate-50 group-hover:bg-primary/10'}`}>
                    {React.cloneElement(stat.icon as React.ReactElement<any>, { className: `w-5 h-5 ${i === 0 ? 'text-primary' : (stat.icon as any).props.className}` })}
                  </div>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <div className="text-3xl font-black tracking-tight">{stat.value}</div>
                  <div className={`flex items-center mt-2 text-xs font-bold ${i === 0 ? 'text-white/30' : 'text-slate-400'}`}>
                    {stat.isPositive ? <ArrowUpRight className="w-3.5 h-3.5 mr-1 text-green-400" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-1 text-red-400" />}
                    <span>VS Bulan Lalu</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts & Recent Orders */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 border border-border shadow-sm h-[450px] bg-white rounded-[2rem] overflow-hidden">
              <CardHeader className="p-8 border-b border-border">
                 <CardTitle className="text-lg font-black text-secondary">Grafik Performa</CardTitle>
              </CardHeader>
              <div className="flex-grow flex items-center justify-center p-8 h-[340px]">
                <div className="text-center">
                  <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-border">
                    {isPersonal ? <PieChart className="w-10 h-10 text-slate-200" /> : <TrendingUp className="w-10 h-10 text-slate-200" />}
                  </div>
                  <p className="font-bold text-slate-400 text-sm tracking-wide uppercase">Memproses Visualisasi Data...</p>
                </div>
              </div>
            </Card>
            
            <Card className="border border-border shadow-sm bg-white rounded-[2rem] overflow-hidden flex flex-col h-[450px]">
              <CardHeader className="bg-slate-50/50 border-b border-border p-8">
                <CardTitle className="text-lg font-black text-secondary">{isPersonal ? "Transaksi Terakhir" : "Pesanan Terbaru"}</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8 flex-grow overflow-y-auto">
                {recentOrders.length === 0 ? (
                  <div className="py-12 text-center h-full flex flex-col justify-center">
                    <ShoppingBag className="w-10 h-10 text-slate-100 mx-auto mb-6" />
                    <p className="text-slate-400 font-black text-sm uppercase tracking-widest">Belum ada data</p>
                  </div>
                ) : (
                  recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center gap-5 group cursor-pointer">
                      <div className={`h-14 w-14 rounded-2xl flex items-center justify-center font-black text-xs transition-all ${order.type === 'PO' ? 'bg-amber-100 text-amber-700' : 'bg-primary/10 text-primary'}`}>
                        {(order.type || 'SO').slice(0, 2)}
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="text-base font-black text-secondary truncate group-hover:text-primary transition-colors">#{order.order_number || order.id?.slice(0, 8).toUpperCase()}</p>
                        <p className="text-xs text-muted-foreground font-bold mt-0.5">{order.entity_name || (isPersonal ? 'Kebutuhan' : 'Pelanggan')} • {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p>
                      </div>
                      <div className={`text-base font-black ${order.type === 'PO' ? 'text-amber-700' : 'text-primary'}`}>{formatCurrency(order.total_amount || 0)}</div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Transaction Tab Logic */}
          <Card className="border border-border bg-white rounded-[2rem] shadow-sm overflow-hidden">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Cari Deskripsi</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input placeholder="Cari transaksi..." className="pl-10 h-11 rounded-xl bg-slate-50 border-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Mulai</label>
                  <Input type="date" className="h-11 rounded-xl bg-slate-50 border-none" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Sampai</label>
                  <Input type="date" className="h-11 rounded-xl bg-slate-50 border-none" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Akun</label>
                  <Select value={accountId} onValueChange={(val) => setAccountId(val || '')}>
                    <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-none"><SelectValue placeholder="Semua Akun" /></SelectTrigger>
                    <SelectContent className="rounded-xl border-border">
                      <SelectItem value="all">Semua Akun</SelectItem>
                      {coa.map((item) => (<SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tipe</label>
                  <div className="flex bg-slate-50 p-1 rounded-xl h-11">
                    {['all', 'income', 'expense'].map((t) => (
                      <button key={t} onClick={() => setTransType(t)} className={`flex-1 rounded-lg text-[10px] font-black uppercase transition-all ${transType === t ? 'bg-white text-primary shadow-sm' : 'text-slate-400'}`}>
                        {t === 'all' ? 'Semua' : t === 'income' ? 'Masuk' : 'Keluar'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border bg-white rounded-[2rem] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-border text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <th className="px-8 py-5">Tanggal</th>
                    <th className="px-8 py-5">Deskripsi</th>
                    <th className="px-8 py-5">Referensi</th>
                    <th className="px-8 py-5 text-right">Nominal</th>
                    <th className="px-8 py-5 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {transLoading ? (
                    <tr><td colSpan={5} className="py-20 text-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" /></td></tr>
                  ) : filteredTransactions.length === 0 ? (
                    <tr><td colSpan={5} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest">Tidak ada data</td></tr>
                  ) : (
                    filteredTransactions.map((t) => {
                      const isIncome = t.journal_lines.some((l: any) => ['income', 'pendapatan'].includes(l.chart_of_accounts.type.toLowerCase()));
                      const isExpanded = expandedRow === t.id;
                      return (
                        <React.Fragment key={t.id}>
                          <tr className="hover:bg-slate-50/50 transition-colors cursor-pointer group" onClick={() => setExpandedRow(isExpanded ? null : t.id)}>
                            <td className="px-8 py-6 text-sm font-bold text-secondary">{new Date(t.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</td>
                            <td className="px-8 py-6">
                               <div className="flex items-center gap-3">
                                 <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isIncome ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                   {isIncome ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                                 </div>
                                 <div>
                                   <p className="text-sm font-black text-secondary">{t.description}</p>
                                   <p className="text-[10px] text-muted-foreground font-bold uppercase mt-0.5">{t.journal_lines[0]?.chart_of_accounts.name}</p>
                                 </div>
                               </div>
                            </td>
                            <td className="px-8 py-6"><span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black">{t.reference_doc}</span></td>
                            <td className="px-8 py-6 text-right font-black text-secondary">{formatCurrency(t.total_amount)}</td>
                            <td className="px-8 py-6">{isExpanded ? <ChevronUp className="w-4 h-4 text-slate-300" /> : <ChevronDown className="w-4 h-4 text-slate-300" />}</td>
                          </tr>
                          {isExpanded && (
                            <tr className="bg-slate-50/30 animate-in fade-in zoom-in-95 duration-200">
                              <td colSpan={5} className="px-8 py-6">
                                <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden p-4 space-y-3 shadow-inner">
                                  {t.journal_lines.map((line: any) => (
                                    <div key={line.id} className="flex justify-between items-center px-4">
                                      <span className="text-xs font-bold text-slate-500">{line.chart_of_accounts.name}</span>
                                      <span className="text-xs font-black text-secondary">{line.debit > 0 ? formatCurrency(line.debit) : formatCurrency(line.credit)}</span>
                                    </div>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
