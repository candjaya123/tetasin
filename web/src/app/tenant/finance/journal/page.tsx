"use client";

import React, { useState, useEffect } from 'react';
import { reportService } from '@/lib/api/reportService';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Calendar, Filter, ArrowRight } from 'lucide-react';

export default function JournalPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await reportService.getJournalEntries(startDate, endDate);
      setData(res as any[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Jurnal Umum</h1>
          <p className="text-slate-500 font-medium">Riwayat seluruh entri akuntansi (Double-Entry).</p>
        </div>

        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
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
      ) : data.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50 rounded-[2rem]">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-4">
              <FileText className="w-8 h-8" />
            </div>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Belum ada entri jurnal pada periode ini</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {data.map((entry) => (
            <Card key={entry.id} className="border-none shadow-sm bg-white rounded-[2rem] overflow-hidden">
              <div className="bg-slate-50 px-8 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{new Date(entry.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                  <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-secondary">{entry.reference_number || 'No Ref'}</span>
                </div>
                <p className="text-sm font-bold text-slate-900">{entry.description}</p>
              </div>
              <CardContent className="p-0">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50">
                      <th className="px-8 py-4">Akun</th>
                      <th className="px-8 py-4 text-right">Debit</th>
                      <th className="px-8 py-4 text-right">Kredit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {entry.journal_lines.map((line: any) => (
                      <tr key={line.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-4">
                          <div className={line.credit > 0 ? "pl-8" : ""}>
                            <p className="text-sm font-bold text-slate-700">{line.chart_of_accounts?.name}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{line.chart_of_accounts?.code}</p>
                          </div>
                        </td>
                        <td className="px-8 py-4 text-right font-black text-slate-900">
                          {Number(line.debit) > 0 ? formatCurrency(line.debit) : '-'}
                        </td>
                        <td className="px-8 py-4 text-right font-black text-slate-900">
                          {Number(line.credit) > 0 ? formatCurrency(line.credit) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
