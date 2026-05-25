'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package, Loader2, Save, Beaker } from "lucide-react";
import type { RawMaterial } from '@/types';

interface BahanBakuFormData {
  name: string;
  unit: string;
  unit_price: number;
  current_stock: number;
  reorder_point: number;
  coa_account_id?: string;
}

interface BahanBakuFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: BahanBakuFormData) => void;
  initialData?: RawMaterial;
  coaAccounts?: { id: string; name: string; code: string }[];
}

const UNITS = ['ml', 'gram', 'liter', 'kg', 'pcs', 'lembar'] as const;

export function BahanBakuForm({ open, onClose, onSubmit, initialData, coaAccounts = [] }: BahanBakuFormProps) {
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('pcs');
  const [unitPrice, setUnitPrice] = useState('');
  const [currentStock, setCurrentStock] = useState('');
  const [reorderPoint, setReorderPoint] = useState('');
  const [coaAccountId, setCoaAccountId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!initialData;

  useEffect(() => {
    if (open && initialData) {
      setName(initialData.name || '');
      setUnit(initialData.unit || 'pcs');
      setUnitPrice(String(initialData.unit_price || ''));
      setCurrentStock(String(initialData.current_stock || ''));
      setReorderPoint(String(initialData.reorder_point ?? ''));
      setCoaAccountId(initialData.coa_account_id || '');
    }
  }, [open, initialData]);

  useEffect(() => {
    if (!open) {
      setName('');
      setUnit('pcs');
      setUnitPrice('');
      setCurrentStock('');
      setReorderPoint('');
      setCoaAccountId('');
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !unitPrice) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        name,
        unit,
        unit_price: parseFloat(unitPrice),
        current_stock: parseFloat(currentStock) || 0,
        reorder_point: parseFloat(reorderPoint) || 0,
        coa_account_id: coaAccountId || undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] bg-white border-none shadow-2xl rounded-3xl overflow-hidden">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="p-6 bg-slate-50/50">
            <DialogTitle className="text-2xl font-black text-slate-800 flex items-center gap-2">
              {isEditing ? <Beaker className="w-6 h-6 text-primary" /> : <Package className="w-6 h-6 text-primary" />}
              {isEditing ? 'Edit Bahan Baku' : 'Tambah Bahan Baku'}
            </DialogTitle>
            <DialogDescription className="font-medium text-slate-500">
              {isEditing ? 'Perbarui informasi bahan baku.' : 'Daftarkan bahan baku baru ke dalam sistem.'}
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 space-y-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="bb-name" className="text-xs font-black uppercase tracking-widest text-slate-400">Nama Bahan</Label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <Input
                    id="bb-name"
                    placeholder="Contoh: Tepung Terigu"
                    className="pl-10 h-12 bg-slate-50 border-none rounded-xl focus-visible:ring-primary font-bold"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bb-unit" className="text-xs font-black uppercase tracking-widest text-slate-400">Satuan</Label>
                  <select
                    id="bb-unit"
                    className="w-full h-12 bg-slate-50 border-none rounded-xl text-sm font-bold px-4 focus:ring-2 focus:ring-primary outline-none"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                  >
                    {UNITS.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bb-price" className="text-xs font-black uppercase tracking-widest text-slate-400">Harga Satuan</Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                      <span className="text-sm font-black text-slate-400">Rp</span>
                    </div>
                    <Input
                      id="bb-price"
                      type="number"
                      placeholder="0"
                      className="pl-10 h-12 bg-slate-50 border-none rounded-xl focus-visible:ring-primary font-bold"
                      value={unitPrice}
                      onChange={(e) => setUnitPrice(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bb-stock" className="text-xs font-black uppercase tracking-widest text-slate-400">Stok Saat Ini</Label>
                  <Input
                    id="bb-stock"
                    type="number"
                    placeholder="0"
                    className="h-12 bg-slate-50 border-none rounded-xl focus-visible:ring-primary font-bold"
                    value={currentStock}
                    onChange={(e) => setCurrentStock(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bb-rop" className="text-xs font-black uppercase tracking-widest text-slate-400">Reorder Point</Label>
                  <Input
                    id="bb-rop"
                    type="number"
                    placeholder="0"
                    className="h-12 bg-slate-50 border-none rounded-xl focus-visible:ring-primary font-bold"
                    value={reorderPoint}
                    onChange={(e) => setReorderPoint(e.target.value)}
                  />
                </div>
              </div>

              {coaAccounts.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="bb-coa" className="text-xs font-black uppercase tracking-widest text-slate-400">Akun COA (Opsional)</Label>
                  <select
                    id="bb-coa"
                    className="w-full h-12 bg-slate-50 border-none rounded-xl text-sm font-bold px-4 focus:ring-2 focus:ring-primary outline-none"
                    value={coaAccountId}
                    onChange={(e) => setCoaAccountId(e.target.value)}
                  >
                    <option value="">Tidak ada</option>
                    {coaAccounts.map((a) => (
                      <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="p-6 bg-slate-50/50">
            <Button
              type="button"
              variant="ghost"
              className="font-bold text-slate-500 rounded-xl"
              onClick={onClose}
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 font-bold px-8 rounded-xl shadow-lg transition-transform active:scale-95"
              disabled={isSubmitting || !name || !unitPrice}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditing ? 'Simpan Perubahan' : 'Simpan Bahan'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
