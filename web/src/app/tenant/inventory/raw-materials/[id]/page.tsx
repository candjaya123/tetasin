'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BahanBakuForm } from '@/components/inventory/BahanBakuForm';
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Package,
  DollarSign,
  Boxes,
  AlertTriangle,
  Loader2,
  Pencil,
  Beaker,
  TrendingDown,
} from "lucide-react";
import { apiGet } from '@/lib/api/client';
import { updateRawMaterial } from '@/lib/api/inventoryService';
import type { Product, RawMaterial } from '@/types';

const formatter = new Intl.NumberFormat('id-ID');

export default function RawMaterialDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [material, setMaterial] = useState<RawMaterial | null>(null);
  const [loading, setLoading] = useState(true);
  const [usedInProducts, setUsedInProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { toast } = useToast();

  const fetchMaterial = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGet('/api/v1/inventory/raw-materials', { id });
      const materialData = Array.isArray(data) ? data[0] : data;
      setMaterial(materialData);
    } catch (err) {
      console.error('Failed to fetch raw material', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchUsedInProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      const data = await apiGet('/api/v1/inventory/products');
      const allProducts = (Array.isArray(data) ? data : []) as Product[];
      const filtered = allProducts.filter((p) =>
        p.product_recipes?.some((r) => r.raw_material_id === id)
      );
      setUsedInProducts(filtered);
    } catch (err) {
      console.error('Failed to fetch products using this material', err);
    } finally {
      setProductsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchMaterial();
      fetchUsedInProducts();
    }
  }, [id, fetchMaterial, fetchUsedInProducts]);

  const handleEditSubmit = async (data: {
    name: string;
    unit: string;
    unit_price: number;
    current_stock: number;
    reorder_point: number;
    coa_account_id?: string;
  }) => {
    try {
      await updateRawMaterial(id, data);
      toast({ title: "Berhasil", description: "Bahan baku berhasil diperbarui" });
      setIsEditModalOpen(false);
      fetchMaterial();
    } catch (err: any) {
      toast({ title: "Gagal", description: err.message || "Gagal memperbarui bahan baku", variant: "destructive" });
    }
  };

  const isLowStock = material &&
    material.reorder_point != null &&
    material.current_stock <= material.reorder_point;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!material) {
    return (
      <div className="text-center py-20 text-slate-400">
        <Package className="w-16 h-16 mx-auto mb-4 opacity-20" />
        <p className="font-bold text-lg">Bahan baku tidak ditemukan</p>
        <Button variant="link" onClick={() => router.back()} className="mt-2">
          Kembali
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/tenant/inventory/raw-materials')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">{material.name}</h1>
          <p className="text-sm text-slate-500 font-medium">Detail Bahan Baku</p>
        </div>
        <div className="flex items-center gap-2">
          {isLowStock && (
            <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200 gap-1 px-2 py-0.5 text-[10px] font-bold">
              <AlertTriangle className="w-3 h-3" />
              Stok Rendah
            </Badge>
          )}
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setIsEditModalOpen(true)}>
            <Pencil className="w-4 h-4" /> Edit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm bg-emerald-50/50 rounded-[1.5rem]">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center gap-2 text-emerald-600/60 mb-1">
              <DollarSign className="w-4 h-4" />
              <p className="text-[10px] font-black uppercase tracking-widest">Harga Satuan</p>
            </div>
            <p className="text-2xl font-black text-emerald-700">
              Rp {formatter.format(material.unit_price || 0)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-slate-50 rounded-[1.5rem]">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Boxes className="w-4 h-4" />
              <p className="text-[10px] font-black uppercase tracking-widest">Stok Saat Ini</p>
            </div>
            <p className={`text-2xl font-black ${isLowStock ? 'text-red-500' : 'text-slate-700'}`}>
              {material.current_stock ?? 0}
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-slate-50 rounded-[1.5rem]">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <TrendingDown className="w-4 h-4" />
              <p className="text-[10px] font-black uppercase tracking-widest">Harga Beli Terakhir</p>
            </div>
            <p className="text-2xl font-black text-slate-700">
              {material.last_purchase_price != null
                ? `Rp ${formatter.format(material.last_purchase_price)}`
                : 'N/A'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm bg-slate-50 rounded-[1.5rem]">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Package className="w-4 h-4" />
              <p className="text-[10px] font-black uppercase tracking-widest">Satuan</p>
            </div>
            <code className="text-lg font-black text-slate-700 bg-slate-100 px-2 py-1 rounded font-mono uppercase">
              {material.unit || 'pcs'}
            </code>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-slate-50 rounded-[1.5rem]">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <AlertTriangle className="w-4 h-4" />
              <p className="text-[10px] font-black uppercase tracking-widest">Reorder Point</p>
            </div>
            <p className="text-2xl font-black text-slate-700">
              {material.reorder_point != null ? material.reorder_point : 'N/A'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-slate-50 rounded-[1.5rem]">
          <CardContent className="p-5 sm:p-6 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status Stok</p>
              <p className="text-lg font-black text-slate-700 mt-1">
                {isLowStock ? 'Perlu Restock' : 'Aman'}
              </p>
            </div>
            <div className={`w-3 h-3 rounded-full ${isLowStock ? 'bg-red-400' : 'bg-emerald-400'}`} />
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="border-b border-slate-100 p-5 sm:p-6">
          <CardTitle className="text-base sm:text-lg font-black text-slate-800 flex items-center gap-2">
            <Beaker className="w-5 h-5 text-primary" />
            Digunakan dalam Resep
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {productsLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : usedInProducts.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Beaker className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="font-bold">Tidak digunakan dalam resep manapun.</p>
              <p className="text-xs text-slate-400 mt-1">Bahan baku ini belum menjadi bagian dari resep produk.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="border-none">
                  <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[10px] pl-6">Produk</TableHead>
                  <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Kategori</TableHead>
                  <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[10px] text-right">Qty Dibutuhkan</TableHead>
                  <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[10px] text-right pr-6">Unit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usedInProducts.map((p) => {
                  const recipe = p.product_recipes?.find((r) => r.raw_material_id === id);
                  return (
                    <TableRow key={p.id} className="hover:bg-slate-50/50 transition-colors border-slate-50 cursor-pointer" onClick={() => router.push(`/tenant/inventory/${p.id}`)}>
                      <TableCell className="py-3 sm:py-4 pl-6">
                        <span className="font-bold text-slate-700 text-sm">{p.name}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-slate-400">{p.category || 'General'}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-bold text-slate-600 text-sm">{recipe?.quantity_needed ?? '-'}</span>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <code className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500 font-mono uppercase">
                          {material.unit}
                        </code>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <BahanBakuForm
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        initialData={material}
      />
    </div>
  );
}
