'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Plus, 
  Search,
  Loader2,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Receipt
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { journalService } from '@/lib/api/journalService';
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { AddExpenseModal } from '@/components/finance/AddExpenseModal';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const data = await journalService.getExpenses();
      if (data) setExpenses(data);
    } catch (err) {
      console.error('Failed to fetch expenses', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const filteredExpenses = expenses.filter(ex => 
    ex.journal_entries?.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ex.accounts?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Pengeluaran & Biaya</h1>
          <p className="text-slate-500 font-medium">Pantau dan catat semua pengeluaran operasional bisnis Anda.</p>
        </div>
        <div className="flex gap-3">
          <Button 
            className="flex gap-2 bg-black hover:bg-slate-800 text-white rounded-xl font-bold shadow-lg"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="w-4 h-4 text-primary" />
            Catat Pengeluaran
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-red-50">
          <CardContent className="p-6 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-1">Total Biaya Bulan Ini</p>
            <p className="text-3xl font-black text-red-600">
              Rp {expenses.reduce((sum, ex) => sum + Number(ex.debit), 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-slate-50">
          <CardContent className="p-6 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Jumlah Transaksi</p>
            <p className="text-3xl font-black text-slate-700">{expenses.length}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-slate-50">
          <CardContent className="p-6 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Kategori Terbanyak</p>
            <p className="text-xl font-black text-slate-700 uppercase">Gaji & Upah</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden">
        <CardHeader className="bg-white border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="text-lg font-black text-slate-800">Riwayat Pengeluaran</CardTitle>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Cari deskripsi atau kategori..." 
              className="pl-10 rounded-xl border-slate-100 bg-slate-50/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-none">
                <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[10px] pl-6">Tanggal</TableHead>
                <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Kategori (COA)</TableHead>
                <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Deskripsi</TableHead>
                <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[10px] text-right">Nominal</TableHead>
                <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[10px] text-right pr-6"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-400">Memuat riwayat biaya...</p>
                  </TableCell>
                </TableRow>
              ) : filteredExpenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20 text-slate-400">
                    <Receipt className="w-12 h-12 mx-auto mb-4 opacity-10" />
                    <p className="font-bold text-slate-600">Belum ada catatan pengeluaran.</p>
                    <p className="text-xs">Klik "Catat Pengeluaran" untuk mulai mendata biaya bisnis.</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredExpenses.map((ex) => (
                  <TableRow key={ex.id} className="hover:bg-slate-50/50 transition-colors border-slate-50">
                    <TableCell className="py-4 pl-6 text-xs font-bold text-slate-500">
                      {format(new Date(ex.journal_entries?.date || ex.created_at), 'dd MMM yyyy', { locale: id })}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-700">{ex.accounts?.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono tracking-tighter">{ex.accounts?.code}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-slate-600 italic">"{ex.journal_entries?.description}"</span>
                    </TableCell>
                    <TableCell className="text-right font-black text-red-500">
                      Rp {Number(ex.debit).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button variant="ghost" size="icon" className="hover:bg-slate-100 rounded-lg">
                        <ArrowUpRight className="w-4 h-4 text-slate-300" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AddExpenseModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchExpenses}
      />
    </div>
  );
}
