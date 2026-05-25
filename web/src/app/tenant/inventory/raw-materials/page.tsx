'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Package,
  AlertTriangle,
  Loader2,
  ChevronLeft,
  FlaskConical,
  Plus,
} from "lucide-react";
import Link from 'next/link';
import { productService } from '@/lib/api/productService';
import { createRawMaterial } from '@/lib/api/inventoryService';
import { BahanBakuForm } from '@/components/inventory/BahanBakuForm';
import { useToast } from '@/hooks/use-toast';

export default function RawMaterialsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const data = await productService.getRawMaterials();
      if (data) setMaterials(data as any[]);
    } catch (err) {
      console.error('Failed to fetch raw materials', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleAddMaterial = async (data: any) => {
    try {
      await createRawMaterial(data);
      toast({ title: 'Bahan baku berhasil ditambahkan!' });
      setIsFormOpen(false);
      fetchMaterials();
    } catch (err: any) {
      console.error('Failed to create raw material', err);
      toast({ title: err.message || 'Gagal menambahkan bahan baku', variant: 'destructive' });
    }
  };

  const isLowStock = (item: any) =>
    item.reorder_point && item.current_stock <= item.reorder_point;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center gap-4">
        <Link href="/tenant/inventory">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">Bahan Baku</h1>
          <p className="text-sm text-slate-500 font-medium">Kelola stok bahan baku dan material produksi.</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="h-10 text-xs font-bold">
          <Plus className="w-4 h-4 mr-1" />
          Tambah Bahan
        </Button>
      </div>

      <Card className="border-none shadow-sm bg-emerald-50/50 rounded-[1.5rem]">
        <CardContent className="p-5 sm:p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
            <FlaskConical className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600/60">Total Material</p>
            <p className="text-2xl font-black text-emerald-800">{materials.length}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm">
        <CardHeader className="bg-white border-b border-slate-50 p-5 sm:p-6">
          <CardTitle className="text-base sm:text-lg font-black text-slate-800">Daftar Bahan Baku</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-none">
                <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[9px] sm:text-[10px] pl-4 sm:pl-6">Nama Bahan</TableHead>
                <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[9px] sm:text-[10px] text-right">Stok</TableHead>
                <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[9px] sm:text-[10px] text-right">Harga Satuan</TableHead>
                <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[9px] sm:text-[10px] text-right">Satuan</TableHead>
                <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[9px] sm:text-[10px] text-right pr-4 sm:pr-6">Min. Stok</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-400">Memuat data...</p>
                  </TableCell>
                </TableRow>
              ) : materials.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20 text-slate-400">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-10" />
                    <p className="font-bold">Belum ada bahan baku terdaftar.</p>
                  </TableCell>
                </TableRow>
              ) : (
                materials.map((m) => (
                  <TableRow key={m.id} className="hover:bg-slate-50/50 transition-colors border-slate-50 cursor-pointer" onClick={() => router.push(`/tenant/inventory/raw-materials/${m.id}`)}>
                    <TableCell className="py-3 sm:py-4 pl-4 sm:pl-6">
                      <div className="flex items-center gap-3">
                        {isLowStock(m) && (
                          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        )}
                        <div>
                          <span className="font-bold text-slate-700 text-xs sm:text-sm">{m.name}</span>
                          {m.category && (
                            <span className="text-[9px] text-slate-400 uppercase tracking-tight block">{m.category}</span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`font-black text-xs sm:text-sm ${isLowStock(m) ? 'text-red-500' : 'text-slate-700'}`}>
                        {m.current_stock ?? 0}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-black text-slate-700 text-xs sm:text-sm">
                      Rp {(m.unit_price || 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <code className="text-[9px] sm:text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500 font-mono uppercase">
                        {m.unit || 'pcs'}
                      </code>
                    </TableCell>
                    <TableCell className="text-right pr-4 sm:pr-6">
                      <span className="text-xs font-bold text-slate-500">{m.reorder_point ?? '-'}</span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <BahanBakuForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleAddMaterial}
      />
    </div>
  );
}
