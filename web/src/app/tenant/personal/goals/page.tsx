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
import { Plus, PiggyBank, Target, Loader2, CheckCircle2, XCircle, TrendingUp } from "lucide-react";
import type { FinancialGoal, ChartOfAccount } from '@/types';

export default function PersonalGoalsPage() {
  const { toast } = useToast();
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDeposit, setShowDeposit] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);
  const [name, setName] = useState('');
  const [goalType, setGoalType] = useState('savings');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [linkedAccountId, setLinkedAccountId] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [goalData, coaData] = await Promise.all([
        personalFinanceService.getGoals(),
        apiGet<ChartOfAccount[]>('/api/v1/accounting/coa'),
      ]);
      setGoals(goalData as any);
      setAccounts((coaData as any).filter((a: ChartOfAccount) => a.normal_balance === 'debit'));
    } catch (err: any) {
      toast({ title: 'Gagal memuat data', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!name || !targetAmount) return;
    setSaving(true);
    try {
      await personalFinanceService.createGoal({
        name,
        goal_type: goalType,
        target_amount: Number(targetAmount),
        target_date: targetDate || undefined,
        linked_account_id: linkedAccountId || undefined,
      });
      toast({ title: 'Target berhasil dibuat' });
      setShowForm(false);
      setName('');
      setTargetAmount('');
      setTargetDate('');
      setLinkedAccountId('');
      loadData();
    } catch (err: any) {
      toast({ title: 'Gagal membuat target', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeposit = async (goalId: string) => {
    if (!depositAmount) return;
    setSaving(true);
    try {
      await personalFinanceService.updateGoalProgress(goalId, { amount: Number(depositAmount) });
      toast({ title: 'Setoran berhasil' });
      setShowDeposit(null);
      setDepositAmount('');
      loadData();
    } catch (err: any) {
      toast({ title: 'Gagal', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async (goalId: string) => {
    try {
      await personalFinanceService.cancelGoal(goalId);
      toast({ title: 'Target dibatalkan' });
      loadData();
    } catch (err: any) {
      toast({ title: 'Gagal', description: err.message, variant: 'destructive' });
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  const goalTypeNames: Record<string, string> = {
    savings: 'Tabungan', debt_payoff: 'Bayar Hutang', investment: 'Investasi', emergency_fund: 'Dana Darurat',
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-secondary tracking-tight">Target Keuangan</h1>
        <Button onClick={() => setShowForm(!showForm)} className="rounded-xl">
          <Plus className="h-4 w-4 mr-2" /> Target Baru
        </Button>
      </div>

      {showForm && (
        <Card className="border-none shadow-md rounded-2xl">
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Nama Target</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Contoh: Liburan Bali" />
              </div>
              <div className="space-y-2">
                <Label>Jenis</Label>
                <Select value={goalType} onValueChange={(v) => setGoalType(v || '')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(goalTypeNames).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Target Nominal</Label>
                <Input type="number" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} placeholder="Rp" />
              </div>
              <div className="space-y-2">
                <Label>Target Tanggal (opsional)</Label>
                <Input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Akun Tabungan (opsional)</Label>
                <Select value={linkedAccountId} onValueChange={(v) => setLinkedAccountId(v || '')}>
                  <SelectTrigger><SelectValue placeholder="Pilih akun" /></SelectTrigger>
                  <SelectContent>
                    {accounts.map(a => (
                      <SelectItem key={a.id} value={a.id}>{a.code} - {a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={handleCreate} disabled={saving || !name || !targetAmount} className="w-full">
                  {saving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null} Buat Target
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8 text-blue-500" /></div>
      ) : goals.length === 0 ? (
        <Card className="border-none shadow-md rounded-2xl">
          <CardContent className="p-12 text-center text-gray-400">
            <PiggyBank className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Belum ada target keuangan. Buat target untuk mulai menabung.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map(goal => {
            const pct = goal.target_amount > 0 ? Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100)) : 0;
            const isActive = goal.status === 'active';
            return (
              <Card key={goal.id} className={`border-none shadow-md rounded-2xl ${!isActive ? 'opacity-60' : ''}`}>
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">{goal.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                          {goalTypeNames[goal.goal_type] || goal.goal_type}
                        </span>
                        {goal.status === 'achieved' && (
                          <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Tercapai
                          </span>
                        )}
                        {goal.status === 'cancelled' && (
                          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">Dibatalkan</span>
                        )}
                      </div>
                    </div>
                    <p className="text-lg font-bold">{pct}%</p>
                  </div>
                  <Progress value={pct} className="h-2" />
                  <div className="flex justify-between mt-2 text-sm text-gray-500">
                    <span>{formatCurrency(goal.current_amount)}</span>
                    <span>{formatCurrency(goal.target_amount)}</span>
                  </div>
                  {goal.target_date && (
                    <p className="text-xs text-gray-400 mt-2">Target: {new Date(goal.target_date).toLocaleDateString('id-ID')}</p>
                  )}
                  {isActive && (
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="default" className="rounded-lg" onClick={() => setShowDeposit(showDeposit === goal.id ? null : goal.id)}>
                        <TrendingUp className="h-3 w-3 mr-1" /> Setor
                      </Button>
                      <Button size="sm" variant="outline" className="rounded-lg" onClick={() => handleCancel(goal.id)}>
                        <XCircle className="h-3 w-3 mr-1" /> Batalkan
                      </Button>
                    </div>
                  )}
                  {showDeposit === goal.id && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                      <Input type="number" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} placeholder="Jumlah setoran" />
                      <Button size="sm" onClick={() => handleDeposit(goal.id)} disabled={saving || !depositAmount}>
                        {saving ? <Loader2 className="animate-spin h-3 w-3" /> : 'Simpan'}
                      </Button>
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
