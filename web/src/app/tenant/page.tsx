'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Bot,
  CreditCard,
  PieChart,
  Target,
  Calendar,
  Search,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { reportService } from '@/lib/api/reportService';
import { profileService } from '@/lib/api/profileService';
import { journalService } from '@/lib/api/journalService';
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { apiGet } from '@/lib/api/client';

export default function TenantOverview() {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardSummary, setDashboardSummary] = useState<{ revenue: string; expenses: string; net_profit: string } | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);

  const [transactions, setTransactions] = useState<any[]>([]);
  const [coa, setCoa] = useState<any[]>([]);
  const [transLoading, setTransLoading] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [accountId, setAccountId] = useState('all');
  const [transType, setTransType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentDateStr, setCurrentDateStr] = useState('');

  useEffect(() => {
    setCurrentDateStr(new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }));
  }, []);

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(num);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const start = new Date();
        start.setMonth(start.getMonth() - 1);
        const end = new Date();

        const [tnt, summary, { orderService }] = await Promise.all([
          profileService.getTenant(),
          reportService.getDashboardSummary(start.toISOString(), end.toISOString()),
          import('@/lib/api/orderService')
        ]);

        if (tnt) setTenant(tnt);
        if (summary) setDashboardSummary(summary);

        const orders = await orderService.getOrders();
        if (orders) setRecentOrders(orders.slice(0, 4));

        const coaData = await reportService.getAccountingAccounts();
        setCoa(coaData);

        const alertsData = await apiGet<any[]>('/api/v1/business-profile/alerts');
        if (alertsData) setAlerts(alertsData);
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

  const stats = (isPersonal ? [
    { title: "Kas Bersih (30hr)", value: formatCurrency(dashboardSummary?.net_profit || '0'), icon: CreditCard, accent: true },
    { title: "Pemasukan (30hr)", value: formatCurrency(dashboardSummary?.revenue || '0'), icon: ArrowUpRight, accent: false },
    { title: "Pengeluaran (30hr)", value: formatCurrency(dashboardSummary?.expenses || '0'), icon: ArrowDownRight, accent: false },
    { title: "Target Menabung", value: "Rp 5.000.000", icon: Target, accent: false }
  ] : [
    { title: "Total Pendapatan", value: formatCurrency(dashboardSummary?.revenue || '0'), icon: Wallet, accent: true },
    { title: "Laba Bersih", value: formatCurrency(dashboardSummary?.net_profit || '0'), icon: TrendingUp, accent: false },
    { title: "Total Beban", value: formatCurrency(dashboardSummary?.expenses || '0'), icon: ArrowDownRight, accent: false },
    { title: "Integritas Data", value: "100%", icon: Bot, accent: false }
  ]);

  const filteredTransactions = transactions.filter(t =>
    t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.reference_doc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
            <div className="w-6 h-6 rounded-lg bg-primary/30" />
          </div>
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-primary/40 animate-pulse" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-primary/20 animate-pulse" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-8 pb-8 sm:pb-20">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/8 text-primary text-[11px] sm:text-xs font-semibold rounded-full border border-primary/15">
              <Sparkles className="w-3 h-3" />
              Live Dashboard
            </span>
          </div>
          <h2 className="text-xl sm:text-3xl font-bold text-foreground tracking-tight">
            Selamat Datang, {tenant?.name || 'Partner'}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
            {isPersonal ? "Kelola keuangan pribadi Anda dengan cerdas." : "Ringkasan performa bisnis Anda hari ini."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-card/60 backdrop-blur-sm border border-border/40 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-medium text-muted-foreground shadow-sm">
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
            <span>{currentDateStr || 'Loading...'}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-muted/50 rounded-2xl w-full md:max-w-sm border border-border/30">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-2 sm:py-2.5 px-4 sm:px-5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 ${
            activeTab === 'overview'
              ? 'bg-card text-foreground shadow-sm border border-border/30'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Ringkasan
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex-1 py-2 sm:py-2.5 px-4 sm:px-5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 ${
            activeTab === 'transactions'
              ? 'bg-card text-foreground shadow-sm border border-border/30'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Transaksi
        </button>
      </div>

      {activeTab === 'overview' ? (
        <ErrorBoundary>
          <div className="space-y-5 sm:space-y-8 animate-reveal-up">

            {/* Stats Grid — 2 columns on mobile */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              {stats.map((stat, i) => (
                <Card
                  key={i}
                  variant={stat.accent ? "elevated" : "default"}
                  className={`relative overflow-hidden ${
                    stat.accent
                      ? 'bg-secondary text-secondary-foreground border-white/5'
                      : ''
                  }`}
                >
                  {stat.accent && (
                    <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-primary/15 rounded-full -mr-10 -mt-10 sm:-mr-12 sm:-mt-12 blur-3xl" />
                  )}
                  <CardHeader className="flex flex-row items-center justify-between pb-0.5 sm:pb-1 p-3 sm:p-5">
                    <CardTitle className={`text-[10px] sm:text-xs font-medium uppercase tracking-wider ${
                      stat.accent ? 'text-white/40 sm:text-white/50' : 'text-muted-foreground'
                    }`}>
                      {stat.title}
                    </CardTitle>
                    <div className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all ${
                      stat.accent
                        ? 'bg-white/10'
                        : 'bg-primary/8'
                    }`}>
                      <stat.icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary`} />
                    </div>
                  </CardHeader>
                  <CardContent className="px-3 sm:px-5 pb-3 sm:pb-5">
                    <div className={`text-lg sm:text-2xl lg:text-3xl font-bold tracking-tight ${
                      stat.accent ? 'text-white' : 'text-foreground'
                    }`}>
                      {stat.value}
                    </div>
                    <div className={`flex items-center mt-1 sm:mt-2 text-[10px] sm:text-xs font-medium ${
                      stat.accent ? 'text-white/40' : 'text-muted-foreground'
                    }`}>
                      {parseFloat(dashboardSummary?.net_profit || '0') >= 0 ? (
                        <ArrowUpRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 text-emerald-500" />
                      ) : (
                        <ArrowDownRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 text-red-400" />
                      )}
                      <span>VS Bulan Lalu</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Charts & Recent — stacked on mobile */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
              <Card variant="elevated" className="lg:col-span-2 min-h-[260px] sm:h-[440px]">
                <CardHeader className="p-4 sm:p-6 border-b border-border/30">
                  <CardTitle className="text-base sm:text-lg font-semibold text-foreground">
                    Grafik Performa
                  </CardTitle>
                </CardHeader>
                <div className="flex-grow flex items-center justify-center p-6 sm:p-8 h-[200px] sm:h-[360px]">
                  <div className="text-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-muted/50 flex items-center justify-center mx-auto mb-3 sm:mb-5 border border-border/30">
                      {isPersonal
                        ? <PieChart className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground/25" />
                        : <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground/25" />
                      }
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground/60">Memproses Visualisasi Data...</p>
                  </div>
                </div>
              </Card>

              <Card variant="elevated" className="min-h-[220px] sm:h-[440px] flex flex-col">
                <CardHeader className="bg-muted/30 border-b border-border/30 p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg font-semibold text-foreground">
                    {isPersonal ? "Transaksi Terakhir" : "Pesanan Terbaru"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-5 flex-grow overflow-y-auto">
                  {recentOrders.length === 0 ? (
                    <div className="py-8 sm:py-12 text-center h-full flex flex-col justify-center">
                      <ShoppingBag className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground/15 mx-auto mb-3 sm:mb-4" />
                      <p className="text-xs sm:text-sm text-muted-foreground/50 font-medium">Belum ada data</p>
                    </div>
                  ) : (
                    recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center gap-3 sm:gap-4 group cursor-pointer">
                        <div className={`h-10 w-10 sm:h-11 sm:w-11 rounded-lg sm:rounded-xl flex items-center justify-center font-semibold text-xs sm:text-sm shrink-0 transition-all ${
                          order.type === 'PO'
                            ? 'bg-amber-50 text-amber-700 border border-amber-100'
                            : 'bg-primary/10 text-primary border border-primary/15'
                        }`}>
                          {(order.type || 'SO').slice(0, 2)}
                        </div>
                        <div className="flex-grow min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                            #{order.order_number || order.id?.slice(0, 8).toUpperCase()}
                          </p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                            {order.entity_name || (isPersonal ? 'Kebutuhan' : 'Pelanggan')} &bull;{' '}
                            {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                        <div className="text-xs sm:text-sm font-semibold text-foreground shrink-0">
                          {formatCurrency(order.total_amount || 0)}
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </ErrorBoundary>
      ) : (
        <ErrorBoundary>
          <div className="space-y-4 sm:space-y-6 animate-reveal-up">
            {/* Filters — 2 columns on mobile */}
            <Card variant="elevated">
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-4">
                  <div className="col-span-2 lg:col-span-1 space-y-1.5">
                    <label className="text-[10px] sm:text-xs font-medium text-muted-foreground ml-1">Cari Deskripsi</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground/40" />
                      <Input
                        placeholder="Cari transaksi..."
                        className="pl-9 sm:pl-10 h-10 sm:h-11 rounded-xl border-none bg-muted/50 text-xs sm:text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] sm:text-xs font-medium text-muted-foreground ml-1">Mulai</label>
                    <Input
                      type="date"
                      className="h-10 sm:h-11 rounded-xl border-none bg-muted/50 text-xs sm:text-sm"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] sm:text-xs font-medium text-muted-foreground ml-1">Sampai</label>
                    <Input
                      type="date"
                      className="h-10 sm:h-11 rounded-xl border-none bg-muted/50 text-xs sm:text-sm"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] sm:text-xs font-medium text-muted-foreground ml-1">Akun</label>
                    <Select value={accountId} onValueChange={(val) => setAccountId(val || '')}>
                      <SelectTrigger className="h-10 sm:h-11 rounded-xl bg-muted/50 border-none text-xs sm:text-sm">
                        <SelectValue placeholder="Semua" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Akun</SelectItem>
                        {coa.map((item) => (
                          <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 lg:col-span-1 space-y-1.5">
                    <label className="text-[10px] sm:text-xs font-medium text-muted-foreground ml-1">Tipe</label>
                    <div className="flex bg-muted/50 p-1 rounded-xl h-10 sm:h-11">
                      {['all', 'income', 'expense'].map((t) => (
                        <button
                          key={t}
                          onClick={() => setTransType(t)}
                          className={`flex-1 rounded-lg text-[10px] sm:text-xs font-medium transition-all ${
                            transType === t
                              ? 'bg-card text-foreground shadow-sm border border-border/30'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {t === 'all' ? 'Semua' : t === 'income' ? 'Masuk' : 'Keluar'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transactions Table */}
            <Card variant="elevated" className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border/30 text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      <th className="px-3 sm:px-6 py-3 sm:py-4">Tanggal</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4">Deskripsi</th>
                      <th className="hidden sm:table-cell px-6 py-4">Referensi</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-right">Nominal</th>
                      <th className="px-2 sm:px-6 py-3 sm:py-4 w-8 sm:w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    {transLoading ? (
                      <tr>
                        <td colSpan={5} className="py-16 sm:py-24 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                            <span className="text-xs sm:text-sm text-muted-foreground/50">Memuat data...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-16 sm:py-24 text-center">
                          <div className="text-center">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-3xl bg-muted/50 flex items-center justify-center mx-auto mb-3 sm:mb-4 border border-border/20">
                              <Search className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground/25" />
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground/50 font-medium">Tidak ada data</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map((t) => {
                        const isIncome = t.journal_lines.some((l: any) =>
                          ['income', 'pendapatan'].includes(l.chart_of_accounts.type.toLowerCase())
                        );
                        const isExpanded = expandedRow === t.id;
                        return (
                          <React.Fragment key={t.id}>
                            <tr
                              className="hover:bg-primary/[0.02] transition-colors cursor-pointer group"
                              onClick={() => setExpandedRow(isExpanded ? null : t.id)}
                            >
                              <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-foreground font-medium whitespace-nowrap">
                                {new Date(t.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                              </td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4">
                                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                  <div className={`flex-shrink-0 w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl items-center justify-center ${
                                    isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                                  } flex`}>
                                    {isIncome
                                      ? <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                      : <ArrowDownRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    }
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs sm:text-sm font-medium text-foreground truncate">
                                      {t.description}
                                    </p>
                                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 truncate">
                                      {t.journal_lines[0]?.chart_of_accounts.name}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="hidden sm:table-cell px-6 py-4">
                                <span className="px-2.5 py-1 bg-muted/50 text-muted-foreground rounded-lg text-xs font-medium">
                                  {t.reference_doc}
                                </span>
                              </td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4 text-right font-semibold text-foreground text-xs sm:text-sm whitespace-nowrap">
                                {formatCurrency(t.total_amount)}
                              </td>
                              <td className="px-2 sm:px-6 py-3 sm:py-4 text-right">
                                {isExpanded
                                  ? <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground/40" />
                                  : <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground/40" />
                                }
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr className="bg-muted/20 animate-scale-in">
                                <td colSpan={5} className="px-4 sm:px-8 py-4 sm:py-5">
                                  <div className="bg-card border border-border/30 rounded-2xl overflow-hidden p-3 sm:p-4 space-y-2 shadow-inner">
                                    {t.journal_lines.map((line: any) => (
                                      <div key={line.id} className="flex justify-between items-center px-3 sm:px-4 py-1.5 sm:py-2">
                                        <span className="text-[10px] sm:text-xs font-medium text-muted-foreground">
                                          {line.chart_of_accounts.name}
                                        </span>
                                        <span className="text-[10px] sm:text-xs font-semibold text-foreground">
                                          {line.debit > 0 ? formatCurrency(line.debit) : formatCurrency(line.credit)}
                                        </span>
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
        </ErrorBoundary>
      )}
    </div>
  );
}
