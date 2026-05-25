'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { personalFinanceService } from '@/lib/api/personalFinanceService';
import { useParams, useRouter } from 'next/navigation';
import { GoalProgressRing } from '@/components/personal/GoalProgressRing';
import { ArrowLeft, TrendingUp, CheckCircle2, Loader2, CalendarDays, PiggyBank, Landmark } from "lucide-react";
import type { FinancialGoal } from '@/types';

interface Contribution {
  id: string;
  amount: number;
  date: string;
  notes?: string;
}

export default function GoalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const goalId = params.id as string;

  const [goal, setGoal] = useState<FinancialGoal | null>(null);
  const [contributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeposit, setShowDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositDate, setDepositDate] = useState(new Date().toISOString().split('T')[0]);
  const [depositNotes, setDepositNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goalId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const goalData = await personalFinanceService.getGoalDetail(goalId);
      setGoal(goalData as FinancialGoal);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan';
      toast({ title: 'Gagal memuat data', description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount) return;
    setSaving(true);
    try {
      await personalFinanceService.updateGoalProgress(goalId, {
        amount: Number(depositAmount),
        notes: depositNotes || undefined,
      });
      toast({ title: 'Setoran berhasil dicatat' });
      setShowDeposit(false);
      setDepositAmount('');
      setDepositDate(new Date().toISOString().split('T')[0]);
      setDepositNotes('');
      loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan';
      toast({ title: 'Gagal mencatat setoran', description: message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleAchieve = async () => {
    try {
      await personalFinanceService.updateGoalProgress(goalId, {
        amount: goal ? goal.target_amount - goal.current_amount : 0,
        notes: 'Tercapai',
      });
      toast({ title: 'Target ditandai tercapai' });
      loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan';
      toast({ title: 'Gagal', description: message, variant: 'destructive' });
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  const goalTypeLabels: Record<string, string> = {
    savings: 'Tabungan',
    debt_payoff: 'Bayar Hutang',
    investment: 'Investasi',
    emergency_fund: 'Dana Darurat',
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Button variant="ghost" onClick={() => router.push('/tenant/personal/goals')} className="rounded-xl">
          <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
        </Button>
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
        </div>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Button variant="ghost" onClick={() => router.push('/tenant/personal/goals')} className="rounded-xl">
          <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
        </Button>
        <Card className="border-none shadow-md rounded-2xl">
          <CardContent className="p-12 text-center text-gray-400">
            <PiggyBank className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Target tidak ditemukan</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isActive = goal.status === 'active';
  const hasContributions = contributions.length > 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Button variant="ghost" onClick={() => router.push('/tenant/personal/goals')} className="rounded-xl">
        <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
      </Button>

      <div className="flex justify-center">
        <div className="w-full max-w-md">
          <GoalProgressRing
            goalName={goal.name}
            currentAmount={goal.current_amount}
            targetAmount={goal.target_amount}
            targetDate={goal.target_date}
            status={goal.status}
          />
        </div>
      </div>

      <Card className="border-none shadow-md rounded-2xl">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800">{goal.name}</h2>
              <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full mt-1 inline-block">
                {goalTypeLabels[goal.goal_type] || goal.goal_type}
              </span>
            </div>
            {goal.status !== 'active' && (
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                goal.status === 'achieved'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {goal.status === 'achieved' ? 'Tercapai' : 'Dibatalkan'}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <p className="text-xs text-slate-500">Terkumpul</p>
              <p className="text-lg font-bold text-blue-700">{formatCurrency(goal.current_amount)}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-500">Target</p>
              <p className="text-lg font-bold text-slate-700">{formatCurrency(goal.target_amount)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-500">
            <CalendarDays className="h-4 w-4" />
            Target: {goal.target_date
              ? new Date(goal.target_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
              : 'Tidak ada batas waktu'}
          </div>

          {goal.linked_account_id && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Landmark className="h-4 w-4" />
              Akun: {goal.linked_account_id}
            </div>
          )}

          {isActive && (
            <div className="flex gap-3 pt-2">
              <Button onClick={() => setShowDeposit(true)} className="rounded-xl flex-1">
                <TrendingUp className="h-4 w-4 mr-2" /> Tambah Setoran
              </Button>
              <Button
                variant="outline"
                onClick={handleAchieve}
                className="rounded-xl"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" /> Tandai Tercapai
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-3">Setoran</h3>
        {!hasContributions ? (
          <Card className="border-none shadow-md rounded-2xl">
            <CardContent className="p-8 text-center text-gray-400">
              <TrendingUp className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>Belum ada setoran</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {contributions.map((c) => (
              <Card key={c.id} className="border-none shadow-sm rounded-2xl">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm text-slate-800">{formatCurrency(c.amount)}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(c.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    {c.notes && <p className="text-xs text-slate-500 mt-1">{c.notes}</p>}
                  </div>
                  <div className="p-2 bg-green-100 rounded-full">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showDeposit} onOpenChange={() => { setShowDeposit(false); setDepositAmount(''); setDepositNotes(''); }}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-800">Tambah Setoran</DialogTitle>
            <DialogDescription>
              Catat setoran untuk target &quot;{goal.name}&quot;.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Jumlah (Rp)</Label>
              <Input
                type="number"
                placeholder="0"
                value={depositAmount}
                onChange={e => setDepositAmount(e.target.value)}
                className="h-12 text-lg font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Tanggal</Label>
              <Input
                type="date"
                value={depositDate}
                onChange={e => setDepositDate(e.target.value)}
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Catatan</Label>
              <Textarea
                placeholder="Catatan setoran..."
                value={depositNotes}
                onChange={e => setDepositNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" className="font-bold rounded-xl" onClick={() => { setShowDeposit(false); setDepositAmount(''); setDepositNotes(''); }}>
              Batal
            </Button>
            <Button
              onClick={handleDeposit}
              disabled={saving || !depositAmount}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 rounded-xl"
            >
              {saving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
