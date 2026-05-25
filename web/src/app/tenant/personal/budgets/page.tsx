'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { personalFinanceService } from '@/lib/api/personalFinanceService';
import { apiGet } from '@/lib/api/client';
import { Plus, Target, AlertCircle, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import type { PersonalBudget, ChartOfAccount } from '@/types';

export default function PersonalBudgetsPage() {
  const { toast } = useToast();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [budgets, setBudgets] = useState<PersonalBudget[]>([]);
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [accountId, setAccountId] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [month, year]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [budgetData, coaData] = await Promise.all([
        personalFinanceService.getBudgets(month, year),
        apiGet<ChartOfAccount[]>('/api/v1/accounting/coa'),
      ]);
      setBudgets(budgetData as any);
      setAccounts((coaData as any).filter((a: ChartOfAccount) => a.kategori === 'BEBAN OPERASIONAL'));
    } catch (err: any) {
      toast({ title: 'Gagal memuat data', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!accountId || !budgetAmount) return;
    setSaving(true);
    try {
      await personalFinanceService.upsertBudget({
        account_id: accountId,
        month,
        year,
        budget_amount: Number(budgetAmount),
      });
      toast({ title: 'Anggaran disimpan' });
      setShowForm(false);
      setAccountId('');
      setBudgetAmount('');
      loadData();
    } catch (err: any) {
      toast({ title: 'Gagal menyimpan', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  const prevMonth = () => { if (month === 1) { setMonth(12); setYear(year - 1); } else setMonth(month - 1); };
  const nextMonth = () => { if (month === 12) { setMonth(1); setYear(year + 1); } else setMonth(month + 1); };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-secondary tracking-tight">Anggaran</h1>
        <Button onClick={() => setShowForm(!showForm)} className="rounded-xl">
          <Plus className="h-4 w-4 mr-2" /> Atur Anggaran
        </Button>
      </div>

      <div className="flex items-center justify-center gap-2">
        <Button variant="outline" size="sm" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
        <span className="font-semibold min-w-[120px] text-center text-lg">{monthNames[month - 1]} {year}</span>
        <Button variant="outline" size="sm" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
      </div>

      {showForm && (
        <Card className="border-none shadow-md rounded-2xl">
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Select value={accountId} onValueChange={(v) => setAccountId(v || '')}>
                  <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                  <SelectContent>
                    {accounts.map(a => (
                      <SelectItem key={a.id} value={a.id}>{a.code} - {a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Jumlah Anggaran</Label>
                <Input type="number" value={budgetAmount} onChange={e => setBudgetAmount(e.target.value)} placeholder="Rp" />
              </div>
              <div className="flex items-end">
                <Button onClick={handleSave} disabled={saving || !accountId || !budgetAmount} className="w-full">
                  {saving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                  Simpan
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8 text-blue-500" /></div>
      ) : budgets.length === 0 ? (
        <Card className="border-none shadow-md rounded-2xl">
          <CardContent className="p-12 text-center text-gray-400">
            <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Belum ada anggaran. Atur anggaran untuk melacak pengeluaran.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(budgets as any[]).map((b: any) => {
            const pct = b.budget_amount > 0 ? Math.min(100, Math.round((b.actual || 0) / b.budget_amount * 100)) : 0;
            return (
              <Card key={b.id} className="border-none shadow-md rounded-2xl">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">{b.chart_of_accounts?.name || '—'}</p>
                      <p className="text-xs text-gray-400">{b.chart_of_accounts?.code || ''}</p>
                    </div>
                    <p className={`text-sm font-bold ${pct >= 100 ? 'text-red-600' : pct >= 80 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {pct}%
                    </p>
                  </div>
                  <Progress value={pct} className={`h-2 ${pct >= 100 ? 'bg-red-200' : pct >= 80 ? 'bg-yellow-200' : 'bg-green-200'}`} />
                  <div className="flex justify-between mt-2 text-sm text-gray-500">
                    <span>{formatCurrency(b.actual || 0)}</span>
                    <span>{formatCurrency(b.budget_amount)}</span>
                  </div>
                  {pct >= 100 && (
                    <div className="flex items-center gap-2 mt-2 text-red-600 text-xs">
                      <AlertCircle className="h-3 w-3" /> Melebihi anggaran
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
