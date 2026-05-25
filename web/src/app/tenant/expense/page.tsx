'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowDownRight, 
  Plus, 
  Search, 
  Wallet,
  Loader2,
  TrendingDown,
  History,
  AlertCircle
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { createClient } from '@/lib/supabase/client';
import { journalService } from '@/lib/api/journalService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function ExpensePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [coa, setCoa] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  // Form State
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedAssetAccount, setSelectedAssetAccount] = useState(''); // Paid from (e.g. Cash)
  const [selectedExpenseAccount, setSelectedExpenseAccount] = useState(''); // Category (e.g. Food)

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Fetch COA
      const coaRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/accounting/coa`, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      const coaData = await coaRes.json();
      setCoa(coaData);

      // Fetch Expense Transactions
      const transData = await journalService.getTransactions({ type: 'expense' });
      setTransactions(transData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast({ title: "Gagal memuat data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleSave = async () => {
    if (!amount || !selectedAssetAccount || !selectedExpenseAccount) {
      toast({ title: "Mohon lengkapi data", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const val = parseFloat(amount.replaceAll('.', '').replace(',', '.'));
      
      // Debit Expense (Beban), Credit Asset (Kas/Bank)
      const payload = {
        reference_number: `EXP-${Date.now()}`,
        description: description || 'Pengeluaran',
        date: new Date().toISOString(),
        lines: [
          { account_id: selectedExpenseAccount, debit: val, credit: 0 },
          { account_id: selectedAssetAccount, debit: 0, credit: val }
        ]
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Gagal menyimpan');

      toast({ title: "Pengeluaran dicatat!", description: "Data Anda telah diperbarui." });
      setOpen(false);
      resetForm();
      fetchInitialData();
    } catch (error) {
      toast({ title: "Gagal menyimpan", description: "Terjadi kesalahan sistem", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setAmount('');
    setDescription('');
    setSelectedAssetAccount('');
    setSelectedExpenseAccount('');
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  const assetAccounts = coa.filter(a => ['asset', 'aktiva'].includes(a.type?.toLowerCase()) || a.code?.startsWith('1'));
  const expenseAccounts = coa.filter(a => ['expense', 'beban'].includes(a.type?.toLowerCase()) || a.code?.startsWith('6'));

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-secondary tracking-tight flex items-center gap-3">
             <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-600">
                <ArrowDownRight className="w-6 h-6" />
             </div>
             Pengeluaran
          </h2>
          <p className="text-muted-foreground font-medium mt-1">Pantau ke mana uang Anda mengalir.</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={
            <Button className="h-14 px-8 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black shadow-xl shadow-red-100 flex items-center gap-3" />
          }>
            <Plus className="w-5 h-5" /> Catat Pengeluaran
          </DialogTrigger>
          <DialogContent className="rounded-[2rem] p-10 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-red-600">Tambah Pengeluaran</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 mt-6">
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-widest text-slate-400">Nominal (Rp)</Label>
                <Input 
                  type="number" 
                  placeholder="Contoh: 150000" 
                  className="h-14 font-black text-2xl border-2 border-slate-100 rounded-xl focus:border-red-500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-widest text-slate-400">Bayar Menggunakan</Label>
                <select 
                  className="w-full h-14 px-4 rounded-xl border-2 border-slate-100 font-bold outline-none focus:border-red-500"
                  value={selectedAssetAccount}
                  onChange={(e) => setSelectedAssetAccount(e.target.value)}
                >
                  <option value="">Pilih Akun Pembayaran...</option>
                  {assetAccounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-widest text-slate-400">Kategori Pengeluaran</Label>
                <select 
                  className="w-full h-14 px-4 rounded-xl border-2 border-slate-100 font-bold outline-none focus:border-red-500"
                  value={selectedExpenseAccount}
                  onChange={(e) => setSelectedExpenseAccount(e.target.value)}
                >
                  <option value="">Pilih Kategori...</option>
                  {expenseAccounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-widest text-slate-400">Keterangan (Opsional)</Label>
                <Input 
                  placeholder="Contoh: Makan Siang di Warteg" 
                  className="h-14 font-medium border-2 border-slate-100 rounded-xl focus:border-red-500"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="w-full h-14 rounded-xl bg-red-600 text-white font-black mt-4 hover:bg-red-700"
              >
                {saving ? <Loader2 className="animate-spin" /> : 'Simpan Transaksi'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1 space-y-6">
           <Card className="border-none bg-red-600 text-white rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-4">Total Pengeluaran</h4>
              <p className="text-3xl font-black">
                 {formatCurrency(transactions.reduce((acc, t) => acc + (Number(t.total_amount) || 0), 0))}
              </p>
              <div className="mt-6 flex items-center gap-2">
                 <TrendingDown className="w-4 h-4 text-white/60" />
                 <span className="text-xs font-bold text-white/60">Bulan Ini</span>
              </div>
           </Card>

           <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                 <History className="w-4 h-4" /> Riwayat Cepat
              </h4>
              <div className="space-y-6">
                 {transactions.slice(0, 5).map((t, i) => (
                   <div key={i} className="flex justify-between items-start border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                      <div>
                         <p className="text-xs font-black text-secondary">{t.description}</p>
                         <p className="text-[10px] font-bold text-slate-400">{new Date(t.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</p>
                      </div>
                      <p className="text-xs font-black text-red-600">-{formatCurrency(t.total_amount)}</p>
                   </div>
                 ))}
                 {transactions.length === 0 && <p className="text-xs font-bold text-slate-300 text-center py-4 italic">Belum ada data</p>}
              </div>
           </div>
        </div>

        <div className="md:col-span-3">
          <Card className="border border-border bg-white rounded-[2.5rem] shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
               <h3 className="font-black text-secondary">Daftar Pengeluaran Terakhir</h3>
               <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <Input placeholder="Cari..." className="pl-10 h-10 rounded-xl bg-slate-50 border-none text-xs font-bold" />
               </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Tanggal</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Keterangan</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Akun</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Nominal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr><td colSpan={4} className="py-20 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-200" /></td></tr>
                  ) : transactions.length === 0 ? (
                    <tr><td colSpan={4} className="py-20 text-center text-slate-300 font-bold uppercase text-[10px] tracking-widest">Tidak ada data</td></tr>
                  ) : (
                    transactions.map((t, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-6 text-sm font-bold text-secondary">
                          {new Date(t.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </td>
                        <td className="px-8 py-6 text-sm font-black text-secondary">{t.description}</td>
                        <td className="px-8 py-6">
                           <span className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                             {t.journal_lines[0]?.chart_of_accounts?.name || 'Kas'}
                           </span>
                        </td>
                        <td className="px-8 py-6 text-right font-black text-red-600">
                          {formatCurrency(t.total_amount)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
