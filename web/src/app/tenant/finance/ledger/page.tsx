"use client";

import React, { useState, useEffect } from 'react';
import { reportService } from '@/lib/api/reportService';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Calendar, Filter, ArrowRight, Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function LedgerPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [ledgerData, setLedgerData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await reportService.getAccountingAccounts();
        setAccounts(res);
        if (res.length > 0) setSelectedAccountId(res[0].id);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccountId) fetchLedger();
  }, [selectedAccountId, startDate, endDate]);

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const res = await reportService.getLedger(selectedAccountId, startDate, endDate);
      setLedgerData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectedAccount = accounts.find(a => a.id === selectedAccountId);

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Buku Besar</h1>
          <p className="text-slate-500 font-medium">Detail mutasi dan saldo per akun COA.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <div className="min-w-[200px]">
            <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
              <SelectTrigger className="h-10 rounded-xl bg-slate-50 border-none text-xs font-bold">
                <SelectValue placeholder="Pilih Akun" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border">
                {accounts.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    <span className="font-black text-[10px] text-slate-400 mr-2">{acc.code}</span>
                    {acc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="h-6 w-[1px] bg-slate-100 hidden sm:block"></div>

          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent border-none text-xs font-bold focus:ring-0"
            />
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300" />
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent border-none text-xs font-bold focus:ring-0"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : !ledgerData ? (
        <div className="text-center py-20 text-slate-400">Pilih akun untuk melihat detail buku besar.</div>
      ) : (
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <Card className="border-none shadow-sm bg-white rounded-[2rem]">
               <CardContent className="p-8">
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Saldo Awal</p>
                 <p className="text-2xl font-black text-slate-900">{formatCurrency(ledgerData.opening_balance)}</p>
               </CardContent>
             </Card>
             <Card className="border-none shadow-sm bg-white rounded-[2rem]">
               <CardContent className="p-8">
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Total Mutasi</p>
                 <p className="text-2xl font-black text-slate-900">
                   {formatCurrency(ledgerData.lines.reduce((sum: number, l: any) => sum + (Number(l.debit) - Number(l.credit)), 0))}
                 </p>
               </CardContent>
             </Card>
             <Card className="border-none shadow-sm bg-primary text-primary-foreground rounded-[2rem] shadow-xl shadow-primary/20">
               <CardContent className="p-8">
                 <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Saldo Akhir</p>
                 <p className="text-2xl font-black">{formatCurrency(ledgerData.closing_balance)}</p>
               </CardContent>
             </Card>
          </div>

          <Card className="border-none shadow-sm bg-white rounded-[2rem] overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                      <th className="px-8 py-5">Tanggal</th>
                      <th className="px-8 py-5">Deskripsi</th>
                      <th className="px-8 py-5 text-right">Debit</th>
                      <th className="px-8 py-5 text-right">Kredit</th>
                      <th className="px-8 py-5 text-right">Saldo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    <tr className="bg-slate-50/30">
                      <td className="px-8 py-4 text-xs font-bold text-slate-400 italic">Mulai</td>
                      <td className="px-8 py-4 text-sm font-bold text-slate-500">Saldo Awal</td>
                      <td className="px-8 py-4 text-right">-</td>
                      <td className="px-8 py-4 text-right">-</td>
                      <td className="px-8 py-4 text-right font-black text-slate-900">{formatCurrency(ledgerData.opening_balance)}</td>
                    </tr>
                    {ledgerData.lines.map((line: any) => (
                      <tr key={line.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-5 text-xs font-bold text-secondary">
                          {new Date(line.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                        </td>
                        <td className="px-8 py-5">
                          <p className="text-sm font-bold text-slate-900">{line.description}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{line.reference || '-'}</p>
                        </td>
                        <td className="px-8 py-5 text-right font-black text-emerald-600">
                          {Number(line.debit) > 0 ? formatCurrency(line.debit) : '-'}
                        </td>
                        <td className="px-8 py-5 text-right font-black text-rose-600">
                          {Number(line.credit) > 0 ? formatCurrency(line.credit) : '-'}
                        </td>
                        <td className="px-8 py-5 text-right font-black text-slate-900">
                          {formatCurrency(line.balance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
