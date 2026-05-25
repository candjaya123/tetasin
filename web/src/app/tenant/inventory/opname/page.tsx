'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ClipboardCheck, Loader2, Save, Package } from "lucide-react";
import { useRouter } from "next/navigation";
import { productService } from '@/lib/api/productService';
import { warehouseService } from '@/lib/api/warehouseService';
import { useToast } from "@/hooks/use-toast";

export default function StockOpnamePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [notes, setNotes] = useState('');
  const [physicalQtys, setPhysicalQtys] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsData, warehousesData] = await Promise.all([
        productService.getProducts(),
        warehouseService.getWarehouses()
      ]);
      setProducts(productsData || []);
      setWarehouses(warehousesData || []);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWarehouse) {
      toast({ title: "Gagal", description: "Pilih gudang terlebih dahulu", variant: "destructive" });
      return;
    }

    const items = products
      .filter(p => physicalQtys[p.id] !== undefined && physicalQtys[p.id] !== '')
      .map(p => ({
        product_id: p.id,
        system_quantity: p.current_stock || 0,
        physical_quantity: parseFloat(physicalQtys[p.id]) || 0,
      }));

    if (items.length === 0) {
      toast({ title: "Gagal", description: "Isi stok fisik untuk setidaknya satu produk", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      await warehouseService.createOpname({
        warehouse_id: selectedWarehouse,
        notes: notes || undefined,
        items,
      });
      toast({ title: "Berhasil", description: "Stok opname berhasil dicatat" });
      router.push('/tenant/inventory');
    } catch (err: any) {
      toast({ title: "Gagal", description: err.message || "Gagal menyimpan opname", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">Stok Opname</h1>
          <p className="text-sm text-slate-500 font-medium">Catat stok fisik aktual untuk rekonsiliasi.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-black text-slate-700">Pilih Gudang</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedWarehouse} onValueChange={(v) => setSelectedWarehouse(v || '')}>
              <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl">
                <SelectValue placeholder="Pilih gudang..." />
              </SelectTrigger>
              <SelectContent>
                {warehouses.map((w) => (
                  <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-xs font-black uppercase tracking-widest text-slate-400">Catatan (Opsional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tambahkan keterangan..."
                className="bg-slate-50 border-none rounded-xl"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-black text-slate-700">Daftar Produk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Produk</th>
                    <th className="text-right py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Stok Sistem</th>
                    <th className="text-right py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 w-40">Stok Fisik</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center py-10 text-slate-400">
                        <Package className="w-8 h-8 mx-auto mb-2 opacity-20" />
                        <p className="font-bold text-sm">Belum ada produk</p>
                      </td>
                    </tr>
                  ) : products.map((p) => (
                    <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="py-3">
                        <span className="font-bold text-slate-700 text-sm">{p.name}</span>
                        <span className="ml-2 text-[10px] text-slate-400">{p.sku || ''}</span>
                      </td>
                      <td className="text-right py-3">
                        <span className="font-bold text-slate-600">{p.current_stock ?? 0}</span>
                      </td>
                      <td className="text-right py-3">
                        <Input
                          type="number"
                          placeholder={String(p.current_stock ?? 0)}
                          className="w-full h-10 bg-slate-50 border-none rounded-xl text-right font-bold"
                          value={physicalQtys[p.id] ?? ''}
                          onChange={(e) => setPhysicalQtys({ ...physicalQtys, [p.id]: e.target.value })}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push('/tenant/inventory')}>Batal</Button>
          <Button type="submit" disabled={submitting} className="bg-primary hover:bg-primary/90">
            {submitting ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...</>
            ) : (
              <><Save className="w-4 h-4 mr-2" /> Simpan Opname</>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
