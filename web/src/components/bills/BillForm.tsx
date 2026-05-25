'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { Bill, ChartOfAccount } from "@/types";

const REMINDER_OPTIONS = [
  { value: 7, label: '7 hari' },
  { value: 3, label: '3 hari' },
  { value: 1, label: '1 hari' },
] as const;

interface BillFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Bill>) => void;
  initialData?: Partial<Bill> | null;
  coaAccounts: ChartOfAccount[];
  paymentAccounts: ChartOfAccount[];
}

export function BillForm({
  open,
  onClose,
  onSubmit,
  initialData,
  coaAccounts,
  paymentAccounts,
}: BillFormProps) {
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

  useEffect(() => {
    if (open && initialData) {
      setBillType(initialData.bill_type || 'hutang');
      setTitle(initialData.title || '');
      setAmount(initialData.amount ? String(initialData.amount) : '');
      setDueDate(initialData.due_date || '');
      setContactName(initialData.contact_name || '');
      setContactPhone(initialData.contact_phone || '');
      setCoaAccountId(initialData.coa_account_id || '');
      setPaymentAccountId(initialData.payment_account_id || '');
      setReminderDays(initialData.reminder_days || []);
      setDescription(initialData.description || '');
    }
  }, [open, initialData]);

  useEffect(() => {
    if (!open) {
      setBillType('hutang');
      setTitle('');
      setAmount('');
      setDueDate('');
      setContactName('');
      setContactPhone('');
      setCoaAccountId('');
      setPaymentAccountId('');
      setReminderDays([]);
      setDescription('');
    }
  }, [open]);

  const toggleReminder = (day: number) => {
    setReminderDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      bill_type: billType,
      title,
      amount: parseFloat(amount) || 0,
      due_date: dueDate,
      contact_name: contactName,
      contact_phone: contactPhone,
      coa_account_id: coaAccountId || undefined,
      payment_account_id: paymentAccountId || undefined,
      reminder_days: reminderDays,
      description,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {initialData ? 'Edit Tagihan' : 'Tambah Tagihan Baru'}
            </DialogTitle>
            <DialogDescription>
              Isi detail tagihan di bawah ini.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactName">Nama Kontak</Label>
                <Input
                  id="contactName"
                  placeholder="Nama"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Telepon</Label>
                <Input
                  id="contactPhone"
                  placeholder="08xxxxxxxxxx"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="coaAccount">Akun COA</Label>
                <select
                  id="coaAccount"
                  className="w-full h-10 rounded-xl border border-input bg-slate-50 px-3.5 text-sm outline-none focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20"
                  value={coaAccountId}
                  onChange={(e) => setCoaAccountId(e.target.value)}
                >
                  <option value="">Pilih akun...</option>
                  {coaAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.code})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentAccount">Akun Pembayaran</Label>
                <select
                  id="paymentAccount"
                  className="w-full h-10 rounded-xl border border-input bg-slate-50 px-3.5 text-sm outline-none focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20"
                  value={paymentAccountId}
                  onChange={(e) => setPaymentAccountId(e.target.value)}
                >
                  <option value="">Pilih akun...</option>
                  {paymentAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Pengingat</Label>
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
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                placeholder="Catatan tambahan..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit">
              {initialData ? 'Simpan Perubahan' : 'Tambah Tagihan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
