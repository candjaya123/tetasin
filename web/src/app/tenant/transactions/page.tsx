'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  History, 
  Search, 
  Calendar, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight, 
  Download,
  ChevronDown,
  ChevronUp,
  Wallet,
  FileText
} from "lucide-react";
import { journalService } from '@/lib/api/journalService';
import { profileService } from '@/lib/api/profileService';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [coa, setCoa] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [tenant, setTenant] = useState<any>(null);

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [accountId, setAccountId] = useState('all');
  const [type, setType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [tnt, coaData] = await Promise.all([
          profileService.getTenant(),
          // We need a coa fetcher, if financeService doesn't exist, we use fetch
          fetchCOA()
        ]);
        setTenant(tnt);
        setCoa(coaData);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };
    fetchInitialData();
  }, []);

  const fetchCOA = async () => {
     try {
       const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/accounting/coa`, {
         headers: {
           'Authorization': `Bearer ${(await (await import('@/lib/supabase/client')).createClient().auth.getSession()).data.session?.access_token}`
         }
       });
       const json = await response.json();
       return Array.isArray(json) ? json : (json?.data ?? []);
     } catch {
       return [];
     }
  }

  useEffect(() => {
    fetchTransactions();
  }, [startDate, endDate, accountId, type]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const data = await journalService.getTransactions({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        account_id: accountId === 'all' ? undefined : accountId,
        type: type === 'all' ? undefined : type
      });
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (transactions.length === 0) return;
    
    const headers = ["Tanggal", "Deskripsi", "Referensi", "Total"];
    const rows = transactions.map(t => [
      new Date(t.date).toLocaleDateString('id-ID'),
      t.description,
      t.reference_doc,
      t.total_amount
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `transaksi_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  const filteredTransactions = transactions.filter(t => 
    t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.reference_doc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalIncome = transactions.reduce((acc, curr) => {
    const hasIncome = curr.journal_lines.some((l: any) => ['income', 'pendapatan'].includes(l.chart_of_accounts.type.toLowerCase()));
    return hasIncome ? acc + curr.total_amount : acc;
  }, 0);

  const totalExpense = transactions.reduce((acc, curr) => {
    const hasExpense = curr.journal_lines.some((l: any) => ['expense', 'beban'].includes(l.chart_of_accounts.type.toLowerCase()));
    return hasExpense ? acc + curr.total_amount : acc;
  }, 0);

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-secondary tracking-tight flex items-center gap-3">
            <History className="w-8 h-8 text-primary" />
            Riwayat Transaksi
          </h2>
          <p className="text-muted-foreground font-medium mt-1">
            Pantau dan filter seluruh arus kas Anda secara mendetail.
          </p>
        </div>
        <Button 
          onClick={exportToCSV}
          className="bg-white text-secondary border border-border hover:bg-slate-50 font-black rounded-xl gap-2 shadow-sm"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none bg-secondary text-white rounded-[2rem] overflow-hidden relative shadow-xl">
           <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full -mr-12 -mt-12 blur-2xl"></div>
           <CardContent className="p-8">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">Pemasukan Periode Ini</p>
              <h3 className="text-2xl font-black">{formatCurrency(totalIncome)}</h3>
           </CardContent>
        </Card>
        <Card className="border border-border bg-white rounded-[2rem] shadow-sm">
           <CardContent className="p-8">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Pengeluaran Periode Ini</p>
              <h3 className="text-2xl font-black text-red-500">{formatCurrency(totalExpense)}</h3>
           </CardContent>
        </Card>
        <Card className="border border-border bg-white rounded-[2rem] shadow-sm">
           <CardContent className="p-8">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Selisih Kas</p>
              <h3 className={`text-2xl font-black ${totalIncome - totalExpense >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatCurrency(totalIncome - totalExpense)}
              </h3>
           </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card className="border border-border bg-white rounded-[2rem] shadow-sm overflow-hidden">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Cari Deskripsi</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="Cari transaksi..." 
                  className="pl-10 h-11 rounded-xl bg-slate-50 border-none focus:ring-primary"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Mulai Tanggal</label>
              <Input 
                type="date" 
                className="h-11 rounded-xl bg-slate-50 border-none"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Sampai Tanggal</label>
              <Input 
                type="date" 
                className="h-11 rounded-xl bg-slate-50 border-none"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Filter Akun</label>
              <Select value={accountId} onValueChange={(val) => setAccountId(val || '')}>
                <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-none">
                  <SelectValue placeholder="Semua Akun" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border">
                  <SelectItem value="all">Semua Akun</SelectItem>
                  {coa.map((item) => (
                    <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tipe</label>
              <div className="flex bg-slate-50 p-1 rounded-xl h-11">
                {['all', 'income', 'expense'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={`flex-1 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all ${
                      type === t ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'
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
      <Card className="border border-border bg-white rounded-[2rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-border">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Tanggal</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Deskripsi</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Referensi</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Nominal</th>
                <th className="px-8 py-5 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Memuat Transaksi...</p>
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <History className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Tidak ada transaksi ditemukan</p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t) => {
                  const isIncome = t.journal_lines.some((l: any) => ['income', 'pendapatan'].includes(l.chart_of_accounts.type.toLowerCase()));
                  const isExpanded = expandedRow === t.id;

                  return (
                    <React.Fragment key={t.id}>
                      <tr 
                        className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                        onClick={() => setExpandedRow(isExpanded ? null : t.id)}
                      >
                        <td className="px-8 py-6">
                           <p className="text-sm font-bold text-secondary">
                             {new Date(t.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                           </p>
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-3">
                             <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                               isIncome ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                             }`}>
                               {isIncome ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                             </div>
                             <div>
                               <p className="text-sm font-black text-secondary">{t.description}</p>
                               <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">
                                 {t.journal_lines[0]?.chart_of_accounts.name}
                               </p>
                             </div>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest">
                            {t.reference_doc}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <p className={`text-base font-black ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                             {isIncome ? '+' : '-'}{formatCurrency(t.total_amount)}
                           </p>
                        </td>
                        <td className="px-8 py-6 text-right">
                           {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-300" /> : <ChevronDown className="w-4 h-4 text-slate-300" />}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-slate-50/30">
                          <td colSpan={5} className="px-8 py-6 border-t border-slate-100/50">
                            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-inner">
                              <div className="grid grid-cols-2 bg-slate-50/50 px-6 py-3 border-b border-slate-100">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rincian Akun</span>
                                <div className="grid grid-cols-2">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Debit</span>
                                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Kredit</span>
                                </div>
                              </div>
                              <div className="divide-y divide-slate-50">
                                {t.journal_lines.map((line: any) => (
                                  <div key={line.id} className="grid grid-cols-2 px-6 py-4 items-center">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                                        <Wallet className="w-4 h-4 text-slate-400" />
                                      </div>
                                      <div>
                                        <p className="text-xs font-bold text-secondary">{line.chart_of_accounts.name}</p>
                                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">{line.chart_of_accounts.code}</p>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2">
                                      <p className="text-xs font-bold text-right text-slate-600">{line.debit > 0 ? formatCurrency(line.debit) : '-'}</p>
                                      <p className="text-xs font-bold text-right text-slate-600">{line.credit > 0 ? formatCurrency(line.credit) : '-'}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
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
  );
}
