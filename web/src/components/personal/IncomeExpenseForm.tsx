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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, FileText } from "lucide-react";

interface CoaAccount {
  id: string;
  code: string;
  name: string;
  type: string;
}

interface IncomeExpenseFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    direction: 'income' | 'expense';
    amount: number;
    accountId: string;
    date: string;
    description: string;
  }) => void;
  coaAccounts: CoaAccount[];
}

export function IncomeExpenseForm({ open, onClose, onSubmit, coaAccounts }: IncomeExpenseFormProps) {
  const [direction, setDirection] = useState<'income' | 'expense'>('income');
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (open) {
      setAccountId('');
    }
  }, [open, direction]);

  const filteredAccounts = coaAccounts.filter((acc) => {
    if (direction === 'income') {
      return acc.type.toUpperCase().includes('PENDAPATAN');
    }
    return acc.type.toUpperCase().includes('BEBAN OPERASIONAL');
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0 || !accountId || !date) return;

    onSubmit({
      direction,
      amount: numAmount,
      accountId,
      date,
      description,
    });

    setAmount('');
    setAccountId('');
    setDate(new Date().toISOString().split('T')[0]);
    setDescription('');
  };

  const toggleDirection = (dir: 'income' | 'expense') => {
    setDirection(dir);
    setAccountId('');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-800 flex items-center gap-2">
              {direction === 'income' ? (
                <TrendingUp className="size-5 text-emerald-500" />
              ) : (
                <TrendingDown className="size-5 text-red-500" />
              )}
              Transaksi Baru
            </DialogTitle>
            <DialogDescription>
              Catat pemasukan atau pengeluaran ke dalam buku kas.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            <div className="flex rounded-xl bg-muted p-1 gap-1">
              <button
                type="button"
                onClick={() => toggleDirection('income')}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-bold transition-all ${
                  direction === 'income'
                    ? 'bg-white text-emerald-600 shadow-sm'
                    : 'text-muted-foreground hover:text-slate-700'
                }`}
              >
                <TrendingUp className="size-4" />
                Pemasukan
              </button>
              <button
                type="button"
                onClick={() => toggleDirection('expense')}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-bold transition-all ${
                  direction === 'expense'
                    ? 'bg-white text-red-600 shadow-sm'
                    : 'text-muted-foreground hover:text-slate-700'
                }`}
              >
                <TrendingDown className="size-4" />
                Pengeluaran
              </button>
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
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="account" className="text-xs font-black uppercase tracking-widest text-slate-400">
                Akun COA
              </Label>
              <Select value={accountId} onValueChange={(v) => setAccountId(v ?? '')}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Pilih akun..." />
                </SelectTrigger>
                <SelectContent>
                  {filteredAccounts.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id}>
                      {acc.name} ({acc.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  placeholder="Contoh: Penjualan produk..."
                  className="w-full pl-10 pt-3 h-20 rounded-xl border border-input bg-slate-50 text-sm font-medium resize-none outline-none focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:bg-white"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" className="font-bold rounded-xl" onClick={onClose}>
              Batal
            </Button>
            <Button
              type="submit"
              className={`font-bold px-8 rounded-xl shadow-lg ${
                direction === 'income'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {direction === 'income' ? 'Catat Pemasukan' : 'Catat Pengeluaran'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
