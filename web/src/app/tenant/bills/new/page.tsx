'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { billTrackerService } from '@/lib/api/billTrackerService';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft } from "lucide-react";
import type { Bill } from '@/types';

const REMINDER_OPTIONS = [
  { value: 7, label: '7 hari' },
  { value: 3, label: '3 hari' },
  { value: 1, label: '1 hari' },
] as const;

export default function NewBillPage() {
  const { toast } = useToast();
  const router = useRouter();

  const [billType, setBillType] = useState<'hutang' | 'piutang'>('hutang');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [coaAccountId, setCoaAccountId] = useState('');
  const [paymentAccountId, setPaymentAccountId] = useState('');
  const [reminderDays, setReminderDays] = useState<number[]>([]);
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const toggleReminder = (day: number) => {
    setReminderDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || !dueDate) return;
    setSaving(true);
    try {
      await billTrackerService.createBill({
        title,
        amount: Number(amount),
        bill_type: billType,
        due_date: dueDate,
        contact_name: contactName || undefined,
        contact_phone: contactPhone || undefined,
        coa_account_id: coaAccountId || undefined,
        payment_account_id: paymentAccountId || undefined,
        reminder_days: reminderDays,
        description,
      });
      toast({ title: 'Tagihan berhasil dibuat' });
      router.push('/tenant/bills');
    } catch (err: any) {
      toast({ title: 'Gagal membuat tagihan', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-secondary tracking-tight">Buat Tagihan Baru</h1>
        <Button variant="outline" onClick={() => router.back()} className="rounded-xl">
          <ArrowLeft className="h-4 w-4 mr-2" /> Batal
        </Button>
      </div>

      <Card className="border-none shadow-md rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Detail Tagihan</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label className="mb-2 block">Tipe Tagihan</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={billType === 'hutang' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setBillType('hutang')}
                >
                  Hutang
                </Button>
                <Button
                  type="button"
                  variant={billType === 'piutang' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setBillType('piutang')}
                >
                  Piutang
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Judul Tagihan</Label>
                <Input
                  id="title"
                  placeholder="Contoh: Pembayaran supplier"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Jumlah (Rp)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Tanggal Jatuh Tempo</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactName">Nama Kontak (opsional)</Label>
                <Input
                  id="contactName"
                  placeholder="Nama vendor/debitur"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Telepon (opsional)</Label>
                <Input
                  id="contactPhone"
                  placeholder="08xxxxxxxxxx"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Pengingat (opsional)</Label>
              <div className="flex flex-wrap gap-2">
                {REMINDER_OPTIONS.map((opt) => {
                  const isActive = reminderDays.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => toggleReminder(opt.value)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                      )}
                    >
                      {opt.label} sebelum
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi (opsional)</Label>
              <Textarea
                id="description"
                placeholder="Catatan tambahan..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.back()}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={saving || !title || !amount || !dueDate}
              >
                {saving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                Buat Tagihan
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
