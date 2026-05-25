'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { apiGet } from '@/lib/api/client';
import { profileService } from '@/lib/api/profileService';
import { RecurringCard } from '@/components/personal/RecurringCard';
import { PremiumGate } from '@/components/personal/PremiumGate';
import { Plus, Repeat, Loader2 } from "lucide-react";
import type { RecurringTransaction, ChartOfAccount } from '@/types';

export default function PersonalRecurringPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<RecurringTransaction[]>([]);
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);
  const [tier, setTier] = useState<string>('free');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [direction, setDirection] = useState<'income' | 'expense'>('expense');
  const [debitAccountId, setDebitAccountId] = useState('');
  const [creditAccountId, setCreditAccountId] = useState('');
  const [frequency, setFrequency] = useState('monthly');
  const [dayOfPeriod, setDayOfPeriod] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<RecurringTransaction | null>(null);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [recurringData, coaData, tenantData] = await Promise.all([
        personalFinanceService.getRecurring().catch(() => [] as RecurringTransaction[]),
        apiGet<ChartOfAccount[]>('/api/v1/accounting/coa'),
        profileService.getTenant().catch(() => ({ tier: 'free' })),
      ]);
      setItems(Array.isArray(recurringData) ? recurringData : []);
      setAccounts(coaData as ChartOfAccount[]);
      setTier((tenantData as { tier?: string })?.tier || 'free');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan';
      toast({ title: 'Gagal memuat data', description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setAmount('');
    setDirection('expense');
    setDebitAccountId('');
    setCreditAccountId('');
    setFrequency('monthly');
    setDayOfPeriod('');
    setEditingItem(null);
  };

  const handleSave = async () => {
    if (!name || !amount || !debitAccountId || !creditAccountId) return;
    setSaving(true);
    const nextDue = new Date();
    if (dayOfPeriod) {
      const d = parseInt(dayOfPeriod);
      if (!isNaN(d) && d > 0) {
        nextDue.setDate(d);
        if (nextDue <= new Date()) nextDue.setMonth(nextDue.getMonth() + 1);
      }
    }

    try {
      if (editingItem) {
        await personalFinanceService.updateRecurring(editingItem.id, {
          name,
          amount: Number(amount),
          direction,
          debit_account_id: debitAccountId,
          credit_account_id: creditAccountId,
          frequency: frequency as RecurringTransaction['frequency'],
          day_of_period: dayOfPeriod ? Number(dayOfPeriod) : undefined,
        });
        toast({ title: 'Transaksi berulang diperbarui' });
      } else {
        await personalFinanceService.createRecurring({
          name,
          amount: Number(amount),
          direction,
          debit_account_id: debitAccountId,
          credit_account_id: creditAccountId,
          frequency,
          day_of_period: dayOfPeriod ? Number(dayOfPeriod) : undefined,
          next_due_date: nextDue.toISOString().split('T')[0],
        });
        toast({ title: 'Transaksi berulang dibuat' });
      }
      setShowForm(false);
      resetForm();
      loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan';
      toast({ title: 'Gagal menyimpan', description: message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleTrigger = async (item: RecurringTransaction) => {
    try {
      await personalFinanceService.triggerRecurring(item.id);
      toast({ title: 'Transaksi dicatat' });
      loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan';
      toast({ title: 'Gagal', description: message, variant: 'destructive' });
    }
  };

  const handleEdit = (item: RecurringTransaction) => {
    setEditingItem(item);
    setName(item.name);
    setAmount(String(item.amount));
    setDirection(item.direction);
    setDebitAccountId(item.debit_account_id);
    setCreditAccountId(item.credit_account_id);
    setFrequency(item.frequency);
    setDayOfPeriod(item.day_of_period ? String(item.day_of_period) : '');
    setShowForm(true);
  };

  const handleDelete = async (item: RecurringTransaction) => {
    if (!confirm('Hapus transaksi berulang ini?')) return;
    try {
      await personalFinanceService.deactivateRecurring(item.id);
      toast({ title: 'Transaksi berulang dihapus' });
      loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan';
      toast({ title: 'Gagal menghapus', description: message, variant: 'destructive' });
    }
  };

  const frequencyLabels: Record<string, string> = {
    daily: 'Harian',
    weekly: 'Mingguan',
    monthly: 'Bulanan',
    yearly: 'Tahunan',
  };

  const isFree = tier === 'free';

  const recurringListContent = (
    <>
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8 text-blue-500" /></div>
      ) : items.length === 0 ? (
        <Card className="border-none shadow-md rounded-2xl">
          <CardContent className="p-12 text-center text-gray-400">
            <Repeat className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Belum ada transaksi berulang</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <RecurringCard
              key={item.id}
              item={{
                name: item.name,
                amount: item.amount,
                direction: item.direction,
                frequency: item.frequency,
                next_due_date: item.next_due_date,
                is_active: item.is_active,
              }}
              tier={tier}
              onTrigger={() => handleTrigger(item)}
              onEdit={() => handleEdit(item)}
              onDelete={() => handleDelete(item)}
            />
          ))}
        </div>
      )}
    </>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-secondary tracking-tight">Transaksi Berulang</h1>
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="rounded-xl">
          <Plus className="h-4 w-4 mr-2" /> Tambah Berulang
        </Button>
      </div>

      {isFree ? (
        <PremiumGate featureName="Transaksi Berulang" requiredTier="premium">
          <div className="blur-sm select-none pointer-events-none">
            {recurringListContent}
          </div>
        </PremiumGate>
      ) : (
        recurringListContent
      )}

      <Dialog
        open={showForm}
        onOpenChange={() => { setShowForm(false); resetForm(); }}
      >
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-800">
              {editingItem ? 'Edit Transaksi Berulang' : 'Tambah Transaksi Berulang'}
            </DialogTitle>
            <DialogDescription>
              Atur transaksi yang otomatis berulang setiap periode.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Nama</Label>
              <Input
                placeholder="Contoh: Gaji Bulanan"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Jumlah (Rp)</Label>
              <Input
                type="number"
                placeholder="0"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="h-12 text-lg font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Arah</Label>
              <Select value={direction} onValueChange={(v) => setDirection(v as 'income' | 'expense')}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Pemasukan</SelectItem>
                  <SelectItem value="expense">Pengeluaran</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Akun Debit</Label>
              <Select value={debitAccountId} onValueChange={(v) => setDebitAccountId(v || '')}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Pilih akun debit" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map(a => (
                    <SelectItem key={a.id} value={a.id}>{a.code} - {a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Akun Kredit</Label>
              <Select value={creditAccountId} onValueChange={(v) => setCreditAccountId(v || '')}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Pilih akun kredit" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map(a => (
                    <SelectItem key={a.id} value={a.id}>{a.code} - {a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Frekuensi</Label>
              <Select value={frequency} onValueChange={(v) => setFrequency(v || '')}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(frequencyLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Hari/Tanggal Periode</Label>
              <Input
                type="number"
                placeholder="Contoh: 1 (tanggal 1)"
                value={dayOfPeriod}
                onChange={e => setDayOfPeriod(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" className="font-bold rounded-xl" onClick={() => { setShowForm(false); resetForm(); }}>
              Batal
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !name || !amount || !debitAccountId || !creditAccountId}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 rounded-xl"
            >
              {saving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
              {editingItem ? 'Perbarui' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
