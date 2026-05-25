'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Wallet } from "lucide-react";
import type { ChartOfAccount } from "@/types";

interface PaymentSheetProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { amount: number; paymentDate: string; paymentAccountId: string; notes: string }) => void;
  bill: { remaining: number } | null;
  paymentAccounts: ChartOfAccount[];
}

export function PaymentSheet({ open, onClose, onSubmit, bill, paymentAccounts }: PaymentSheetProps) {
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentAccountId, setPaymentAccountId] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const remaining = bill?.remaining || 0;
  const numAmount = parseFloat(amount) || 0;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (numAmount <= 0) {
      setError('Jumlah harus lebih dari 0');
      return;
    }

    if (numAmount > remaining) {
      setError('Jumlah melebihi sisa tagihan');
      return;
    }

    if (!paymentAccountId) {
      setError('Pilih akun pembayaran');
      return;
    }

    setError('');
    onSubmit({
      amount: numAmount,
      paymentDate,
      paymentAccountId,
      notes,
    });
  };

  const handleClose = () => {
    setAmount('');
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setPaymentAccountId('');
    setNotes('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[420px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="size-5 text-primary" />
              Catat Pembayaran
            </DialogTitle>
          </DialogHeader>

          <div className="py-4 space-y-5">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4 border border-slate-100">
              <span className="text-sm text-slate-500">Sisa Tagihan</span>
              <span className="text-lg font-black text-slate-800">
                {formatCurrency(remaining)}
              </span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentAmount">Jumlah Pembayaran (Rp)</Label>
              <Input
                id="paymentAmount"
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
              {numAmount > 0 && numAmount <= remaining && (
                <p className="text-xs text-slate-400">
                  Sisa setelah bayar: {formatCurrency(remaining - numAmount)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentDate">Tanggal Pembayaran</Label>
              <Input
                id="paymentDate"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentAccount">Akun Pembayaran</Label>
              <select
                id="paymentAccount"
                className="w-full h-10 rounded-xl border border-input bg-slate-50 px-3.5 text-sm outline-none focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20"
                value={paymentAccountId}
                onChange={(e) => setPaymentAccountId(e.target.value)}
                required
              >
                <option value="">Pilih akun...</option>
                {paymentAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentNotes">Catatan</Label>
              <Textarea
                id="paymentNotes"
                placeholder="Catatan pembayaran..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 font-medium">{error}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={handleClose}>
              Batal
            </Button>
            <Button type="submit">
              Bayar {numAmount > 0 ? formatCurrency(numAmount) : ''}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
