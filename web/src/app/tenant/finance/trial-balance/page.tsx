"use client";

import React, { useState, useEffect } from 'react';
import { reportService } from '@/lib/api/reportService';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { TableProperties, Calendar, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default function TrialBalancePage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchData();
  }, [endDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await reportService.getTrialBalance(endDate);
      setData(res as any[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalDebit = data.reduce((sum, item) => sum + Number(item.debit), 0);
  const totalCredit = data.reduce((sum, item) => sum + Number(item.credit), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Neraca Saldo</h1>
          <p className="text-slate-500 font-medium">Rekap saldo akhir seluruh akun per tanggal tertentu.</p>
        </div>

        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-500 mr-1">Per Tanggal:</span>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent border-none text-xs font-bold focus:ring-0"
            />
          </div>
        </div>
      </div>

      <div className={`p-6 rounded-[2rem] border flex items-center justify-between gap-6 transition-all duration-500 ${isBalanced ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isBalanced ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-rose-500 text-white shadow-lg shadow-rose-200'}`}>
            {isBalanced ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
          </div>
          <div>
            <p className={`text-xl font-black ${isBalanced ? 'text-emerald-900' : 'text-rose-900'}`}>
              {isBalanced ? 'Status: SEIMBANG (BALANCED)' : 'Status: TIDAK SEIMBANG'}
            </p>
            <p className={`text-sm font-medium ${isBalanced ? 'text-emerald-600' : 'text-rose-600'}`}>
              {isBalanced ? 'Total Debit dan Kredit sudah sesuai.' : 'Terdapat selisih antara Total Debit dan Total Kredit.'}
            </p>
          </div>
        </div>
        <div className="hidden sm:block text-right">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Selisih</p>
          <p className={`text-xl font-black ${isBalanced ? 'text-emerald-600' : 'text-rose-600'}`}>
            {formatCurrency(Math.abs(totalDebit - totalCredit))}
          </p>
        </div>
      </div>

      <Card className="border-none shadow-sm bg-white rounded-[2rem] overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                    <th className="px-8 py-5">Kode Akun</th>
                    <th className="px-8 py-5">Nama Akun</th>
                    <th className="px-8 py-5 text-right">Debit</th>
                    <th className="px-8 py-5 text-right">Kredit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.map((item) => (
                    <tr key={item.code} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-5 font-black text-secondary text-xs">{item.code}</td>
                      <td className="px-8 py-5 text-sm font-bold text-slate-700">{item.name}</td>
                      <td className="px-8 py-5 text-right font-black text-slate-900">
                        {Number(item.debit) > 0 ? formatCurrency(item.debit) : '-'}
                      </td>
                      <td className="px-8 py-5 text-right font-black text-slate-900">
                        {Number(item.credit) > 0 ? formatCurrency(item.credit) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-900 text-white font-black">
                    <td colSpan={2} className="px-8 py-6 text-sm uppercase tracking-widest">Total Keseluruhan</td>
                    <td className="px-8 py-6 text-right text-lg">{formatCurrency(totalDebit)}</td>
                    <td className="px-8 py-6 text-right text-lg">{formatCurrency(totalCredit)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
