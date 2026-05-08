'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  Target,
  AlertCircle,
  Loader2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Edit2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createClient } from '@/lib/supabase/client';
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format, addMonths, subMonths, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

export default function PersonalBudgetPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const { toast } = useToast();
  const supabase = createClient();

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [limitAmount, setLimitAmount] = useState('');

  const currentMonthStr = format(currentDate, 'yyyy-MM');

  const fetchBudgets = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/finance/budgets?month=${currentMonthStr}`, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      const data = await response.json();
      setBudgets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch budgets:', error);
      toast({ title: "Gagal memuat anggaran", variant: "destructive" });
    }
  };

  const fetchAccounts = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/finance/coa`, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      const data = await response.json();
      // Filter for expense accounts (usually starts with 6 in COA)
      setAccounts(data.filter((a: any) => 
        a.type?.toLowerCase().includes('expense') || 
        a.type?.toLowerCase().includes('beban') ||
        a.code?.startsWith('6')
      ));
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchBudgets(), fetchAccounts()]).finally(() => setLoading(false));
  }, [currentMonthStr]);

  const handleSaveBudget = async () => {
    if (!selectedAccount || !limitAmount) return;
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/finance/budgets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          account_id: selectedAccount,
          limit_amount: parseFloat(limitAmount),
          period_month: currentMonthStr
        })
      });

      if (!response.ok) throw new Error('Gagal menyimpan anggaran');

      toast({ 
        title: editingId ? "Anggaran Diperbarui!" : "Anggaran Dibuat!", 
        description: "Batas pengeluaran Anda telah disimpan." 
      });
      setOpen(false);
      resetForm();
      fetchBudgets();
    } catch (error) {
      toast({ title: "Gagal", description: "Terjadi kesalahan sistem", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBudget = async (id: string) => {
    if (!confirm('Hapus anggaran ini?')) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/finance/budgets/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });

      if (!response.ok) throw new Error('Gagal menghapus');
      
      toast({ title: "Dihapus", description: "Anggaran berhasil dihapus." });
      fetchBudgets();
    } catch (error) {
      toast({ title: "Gagal", description: "Tidak dapat menghapus anggaran", variant: "destructive" });
    }
  };

  const handleEdit = (budget: any) => {
    setEditingId(budget.id);
    setSelectedAccount(budget.account_id);
    setLimitAmount(budget.limit_amount.toString());
    setOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setSelectedAccount('');
    setLimitAmount('');
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  const nextMonth = () => setCurrentDate(prev => addMonths(prev, 1));
  const prevMonth = () => setCurrentDate(prev => subMonths(prev, 1));
  const goToToday = () => setCurrentDate(new Date());

  const totalBudget = budgets.reduce((acc, b) => acc + (Number(b.limit_amount) || 0), 0);
  const totalSpent = budgets.reduce((acc, b) => acc + (Number(b.current_spent) || 0), 0);
  const efficiency = totalBudget > 0 ? Math.max(0, 100 - (totalSpent / totalBudget * 100)) : 0;

  if (loading && budgets.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-secondary tracking-tight">Anggaran Bulanan</h2>
          <div className="flex items-center gap-4 mt-2">
             <Button variant="outline" size="icon" onClick={prevMonth} className="rounded-full h-8 w-8">
                <ChevronLeft className="w-4 h-4" />
             </Button>
             <span className="font-black text-secondary min-w-[140px] text-center capitalize">
                {format(currentDate, 'MMMM yyyy', { locale: id })}
             </span>
             <Button variant="outline" size="icon" onClick={nextMonth} className="rounded-full h-8 w-8">
                <ChevronRight className="w-4 h-4" />
             </Button>
             {currentMonthStr !== format(new Date(), 'yyyy-MM') && (
               <Button variant="ghost" size="sm" onClick={goToToday} className="text-xs font-bold text-primary">
                  Bulan Ini
               </Button>
             )}
          </div>
        </div>
        
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if(!v) resetForm(); }}>
          <DialogTrigger render={
            <Button className="h-14 px-8 rounded-2xl bg-secondary hover:bg-secondary/90 text-white font-black shadow-xl shadow-secondary/10 flex items-center gap-3" />
          }>
            <Plus className="w-5 h-5" /> Atur Anggaran
          </DialogTrigger>
          <DialogContent className="rounded-[2rem] p-10 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black">{editingId ? 'Edit Anggaran' : 'Atur Batas Anggaran'}</DialogTitle>
              <CardDescription>Pilih kategori pengeluaran dan tentukan batas maksimalnya.</CardDescription>
            </DialogHeader>
            <div className="space-y-6 mt-6">
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-widest text-slate-400">Kategori Pengeluaran</Label>
                <select 
                  className="w-full h-14 px-4 rounded-xl border-2 border-slate-100 font-bold focus:border-primary outline-none transition-colors"
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                  disabled={!!editingId}
                >
                  <option value="">Pilih Kategori...</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name} ({acc.code})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-widest text-slate-400">Batas Maksimal (Rp)</Label>
                <Input 
                  type="number" 
                  placeholder="Contoh: 1500000" 
                  className="h-14 font-bold rounded-xl border-2 border-slate-100 focus:border-primary"
                  value={limitAmount}
                  onChange={(e) => setLimitAmount(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleSaveBudget} 
                disabled={saving}
                className="w-full h-14 rounded-xl bg-primary text-white font-black mt-4 hover:scale-[1.02] active:scale-[0.98] transition-transform"
              >
                {saving ? <Loader2 className="animate-spin" /> : (editingId ? 'Simpan Perubahan' : 'Simpan Anggaran')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {budgets.length === 0 ? (
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
              <CardContent className="p-8 md:p-10 flex flex-col items-center justify-center min-h-[350px] text-center">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <Target className="w-12 h-12 text-slate-200" />
                </div>
                <p className="text-slate-400 font-bold text-lg">Belum ada anggaran di bulan ini.</p>
                <p className="text-slate-300 font-medium max-w-xs mt-2">Mulai dengan kategori seperti Makan atau Transportasi.</p>
              </CardContent>
            </Card>
          ) : (
            budgets.map((b, i) => (
              <Card key={b.id || i} className={`border-none shadow-sm hover:shadow-md transition-all rounded-3xl bg-white p-8 group relative ${b.percentage_used >= 100 ? 'ring-2 ring-red-500/20' : ''}`}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h4 className="font-black text-xl text-secondary flex items-center gap-2">
                       {b.category_name}
                       {b.percentage_used >= 100 && <AlertCircle className="w-5 h-5 text-red-500 animate-pulse" />}
                    </h4>
                    <p className="text-sm font-bold text-slate-400">Sisa Anggaran: {formatCurrency(Math.max(0, b.limit_amount - b.current_spent))}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs font-black uppercase tracking-widest text-slate-300 mb-1">Terpakai</p>
                      <p className="font-black text-lg">{formatCurrency(b.current_spent)} <span className="text-slate-300 text-sm">/ {formatCurrency(b.limit_amount)}</span></p>
                    </div>
                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary" onClick={() => handleEdit(b)}>
                          <Edit2 className="w-4 h-4" />
                       </Button>
                       <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500" onClick={() => handleDeleteBudget(b.id)}>
                          <Trash2 className="w-4 h-4" />
                       </Button>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Progress 
                    value={Math.min(100, b.percentage_used)} 
                    className={`h-3 rounded-full ${
                      b.percentage_used >= 100 ? 'bg-red-100' : 
                      b.percentage_used >= 80 ? 'bg-amber-100' : 'bg-slate-100'
                    }`}
                    indicatorClassName={
                      b.percentage_used >= 100 ? 'bg-red-500' : 
                      b.percentage_used >= 80 ? 'bg-amber-500' : 'bg-primary'
                    }
                  />
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className={b.percentage_used >= 100 ? 'text-red-500' : 'text-slate-400'}>
                      {b.percentage_used.toFixed(1)}% Digunakan
                    </span>
                    {b.percentage_used >= 100 && <span className="text-red-600 font-black animate-pulse">OVER BUDGET!</span>}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        <div className="space-y-8">
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-secondary text-white p-8 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white/50 mb-4">Total Anggaran</h4>
            <p className="text-4xl font-black mb-2">{formatCurrency(totalBudget)}</p>
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10">
               <div className="flex-grow">
                  <p className="text-[10px] font-bold text-white/40 uppercase mb-1">Total Terpakai</p>
                  <p className="font-black">{formatCurrency(totalSpent)}</p>
               </div>
               <div className="text-right">
                  <p className="text-[10px] font-bold text-white/40 uppercase mb-1">Efisiensi</p>
                  <p className="font-black text-primary">{efficiency.toFixed(0)}%</p>
               </div>
            </div>
          </Card>

          <Card className="border-none shadow-xl rounded-[2.5rem] bg-amber-50 border border-amber-100 p-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-500 rounded-2xl text-white">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-amber-900 text-lg">Tips Cerdas</h4>
                <p className="text-amber-800/70 font-medium text-sm mt-1 leading-relaxed">
                  {totalSpent > totalBudget 
                    ? "Anggaran Anda sudah bocor bulan ini. Segera kurangi pengeluaran tidak mendesak untuk menyeimbangkan keuangan Anda." 
                    : totalSpent > totalBudget * 0.8 
                    ? "Waspada! Pengeluaran Anda hampir mencapai batas. Cek kembali daftar belanja Anda."
                    : "Luar biasa! Pengeluaran Anda masih terkendali. Pertahankan efisiensi ini hingga akhir bulan."}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
