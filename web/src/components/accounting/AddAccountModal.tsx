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
import { BookOpenIcon, Loader2 } from "lucide-react";

const KATEGORI_OPTIONS = [
  { value: 'ASET', label: 'ASET' },
  { value: 'KEWAJIBAN', label: 'KEWAJIBAN' },
  { value: 'EKUITAS', label: 'EKUITAS' },
  { value: 'PENDAPATAN', label: 'PENDAPATAN' },
  { value: 'HPP', label: 'HPP / BIAYA LANGSUNG' },
  { value: 'BEBAN', label: 'BEBAN OPERASIONAL' },
];

export interface AddAccountFormData {
  code: string;
  name: string;
  kategori: string;
  normal_balance: 'debit' | 'credit';
}

interface AddAccountModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AddAccountFormData) => void | Promise<void>;
  existingCodes: string[];
}

export function AddAccountModal({ open, onClose, onSubmit, existingCodes }: AddAccountModalProps) {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [kategori, setKategori] = useState('');
  const [normalBalance, setNormalBalance] = useState<'debit' | 'credit'>('debit');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setCode('');
      setName('');
      setKategori('');
      setNormalBalance('debit');
      setError('');
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!code.trim() || !name.trim() || !kategori) {
      setError('Semua field wajib diisi');
      return;
    }

    if (existingCodes.includes(code.trim())) {
      setError('Kode akun sudah digunakan');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ code: code.trim(), name: name.trim(), kategori, normal_balance: normalBalance });
      onClose();
    } catch (err: any) {
      setError(err?.message ?? 'Gagal menyimpan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[440px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpenIcon className="size-5" />
              Tambah Akun Baru
            </DialogTitle>
            <DialogDescription>
              Buat akun baru dalam Chart of Accounts.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="coa-code">Kode Akun</Label>
              <Input
                id="coa-code"
                placeholder="mis. 1-1000"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coa-name">Nama Akun</Label>
              <Input
                id="coa-name"
                placeholder="mis. Kas Besar"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coa-kategori">Kategori</Label>
              <select
                id="coa-kategori"
                className="w-full h-10 rounded-xl border border-input bg-slate-50 px-3.5 text-sm outline-none focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:bg-white"
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
              >
                <option value="">Pilih Kategori...</option>
                {KATEGORI_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Normal Balance</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="normalBalance"
                    value="debit"
                    checked={normalBalance === 'debit'}
                    onChange={() => setNormalBalance('debit')}
                    className="size-4 accent-primary"
                  />
                  Debit (D)
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="normalBalance"
                    value="credit"
                    checked={normalBalance === 'credit'}
                    onChange={() => setNormalBalance('credit')}
                    className="size-4 accent-primary"
                  />
                  Kredit (K)
                </label>
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive font-medium">{error}</p>
            )}
          </div>

          <DialogFooter showCloseButton>
            <Button type="button" variant="outline" onClick={handleClose} disabled={submitting}>
              Batal
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Simpan'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
