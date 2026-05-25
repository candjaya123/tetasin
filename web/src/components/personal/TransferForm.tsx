'use client';

import React, { useState } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRightLeft, FileText, AlertCircle } from "lucide-react";

interface AsetAccount {
  id: string;
  code: string;
  name: string;
  type: string;
}

interface TransferFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    sourceAccountId: string;
    destinationAccountId: string;
    amount: number;
    date: string;
    description: string;
  }) => void;
  asetAccounts: AsetAccount[];
}

export function TransferForm({ open, onClose, onSubmit, asetAccounts }: TransferFormProps) {
  const [sourceAccountId, setSourceAccountId] = useState('');
  const [destinationAccountId, setDestinationAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleClose = () => {
    setSourceAccountId('');
    setDestinationAccountId('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setDescription('');
    setError('');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setError('Nominal harus lebih dari 0');
      return;
    }
    if (!sourceAccountId || !destinationAccountId) {
      setError('Pilih akun sumber dan tujuan');
      return;
    }
    if (sourceAccountId === destinationAccountId) {
      setError('Akun sumber dan tujuan tidak boleh sama');
      return;
    }

    onSubmit({
      sourceAccountId,
      destinationAccountId,
      amount: numAmount,
      date,
      description,
    });
    handleClose();
  };

  const filteredDestinations = asetAccounts.filter((acc) => acc.id !== sourceAccountId);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-800 flex items-center gap-2">
              <ArrowRightLeft className="size-5 text-blue-500" />
              Transfer Dana
            </DialogTitle>
            <DialogDescription>
              Pindahkan dana antar akun aset yang Anda miliki.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-sm font-medium text-red-600">
                <AlertCircle className="size-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="sourceAccount" className="text-xs font-black uppercase tracking-widest text-slate-400">
                Akun Sumber
              </Label>
              <Select value={sourceAccountId} onValueChange={(v) => { setSourceAccountId(v ?? ''); setDestinationAccountId(''); setError(''); }}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Pilih akun sumber..." />
                </SelectTrigger>
                <SelectContent>
                  {asetAccounts.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id}>
                      {acc.name} ({acc.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="destinationAccount" className="text-xs font-black uppercase tracking-widest text-slate-400">
                Akun Tujuan
              </Label>
              <Select
                value={destinationAccountId}
                onValueChange={(v) => { setDestinationAccountId(v ?? ''); setError(''); }}
                disabled={!sourceAccountId}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder={sourceAccountId ? "Pilih akun tujuan..." : "Pilih akun sumber dulu"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredDestinations.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id}>
                      {acc.name} ({acc.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-xs font-black uppercase tracking-widest text-slate-400">
                Nominal (Rp)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-black text-muted-foreground">
                  Rp
                </span>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0"
                  className="pl-10 h-12 text-lg font-bold"
                  value={amount}
                  onChange={(e) => { setAmount(e.target.value); setError(''); }}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="text-xs font-black uppercase tracking-widest text-slate-400">
                Tanggal
              </Label>
              <Input
                id="date"
                type="date"
                className="h-12"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-xs font-black uppercase tracking-widest text-slate-400">
                Keterangan
              </Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 size-4 text-slate-300" />
                <textarea
                  id="description"
                  placeholder="Contoh: Transfer ke tabungan..."
                  className="w-full pl-10 pt-3 h-20 rounded-xl border border-input bg-slate-50 text-sm font-medium resize-none outline-none focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:bg-white"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" className="font-bold rounded-xl" onClick={handleClose}>
              Batal
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 rounded-xl shadow-lg"
            >
              Transfer Dana
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
