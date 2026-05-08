'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowRightLeft, 
  ChevronLeft, 
  Package, 
  ArrowRight,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from 'next/link';
import { warehouseService } from '@/lib/api/warehouseService';
import { createClient } from '@/lib/supabase/client';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export default function TransferPage() {
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  // Form States
  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [wData, { data: pData }] = await Promise.all([
          warehouseService.getWarehouses(),
          supabase.from('products').select('*').order('name')
        ]);
        if (wData) setWarehouses(wData);
        if (pData) setProducts(pData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleTransfer = async () => {
    if (!fromId || !toId || !productId || !quantity) {
      alert("Harap isi semua kolom wajib.");
      return;
    }
    if (fromId === toId) {
      alert("Gudang asal dan tujuan tidak boleh sama.");
      return;
    }

    setIsSubmitting(true);
    try {
      await warehouseService.transferStock({
        from_id: fromId,
        to_id: toId,
        product_id: productId,
        quantity: Number(quantity),
        notes
      });
      alert("Transfer stok berhasil!");
      window.location.href = '/tenant/inventory';
    } catch (err: any) {
      alert(err.message || "Gagal melakukan transfer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedProduct = products.find(p => p.id === productId);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/tenant/inventory">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Transfer Stok</h1>
          <p className="text-slate-500">Pindahkan barang antar lokasi penyimpanan.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-primary" />
                Detail Perpindahan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Gudang Asal</Label>
                  <Select value={fromId} onValueChange={(v) => setFromId(v || '')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Gudang Asal" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.map(w => (
                        <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 text-center md:text-left flex items-end">
                  <div className="hidden md:flex flex-1 items-center justify-center pb-3">
                    <ArrowRight className="text-slate-300" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label>Gudang Tujuan</Label>
                    <Select value={toId} onValueChange={(v) => setToId(v || '')}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Gudang Tujuan" />
                      </SelectTrigger>
                      <SelectContent>
                        {warehouses.map(w => (
                          <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Pilih Produk</Label>
                <Select value={productId} onValueChange={(v) => setProductId(v || '')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Produk" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name} (Tersedia: {p.stock})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Jumlah Pindah</Label>
                  <Input 
                    type="number" 
                    value={quantity} 
                    onChange={(e) => setQuantity(e.target.value)} 
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Keterangan (Opsional)</Label>
                  <Input 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)} 
                    placeholder="Contoh: Restok cabang"
                  />
                </div>
              </div>

              <Button 
                className="w-full h-12 text-lg font-bold" 
                onClick={handleTransfer}
                disabled={isSubmitting || loading}
              >
                {isSubmitting ? 'Memproses...' : 'Konfirmasi Transfer'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-slate-50 border border-slate-100">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-wider text-slate-400">Ringkasan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Produk</span>
                <span className="font-bold">{selectedProduct?.name || '-'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Jumlah</span>
                <span className="font-bold">{quantity || 0} unit</span>
              </div>
              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <Info className="w-4 h-4 text-amber-600 mt-0.5" />
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Pastikan stok fisik tersedia di gudang asal sebelum melakukan konfirmasi. Transfer stok akan langsung memperbarui saldo di kedua lokasi.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
