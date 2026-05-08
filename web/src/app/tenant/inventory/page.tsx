'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Package, 
  MapPin, 
  ArrowRightLeft, 
  Plus, 
  MoreHorizontal,
  Loader2,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { AddProductModal } from '@/components/inventory/AddProductModal';

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const supabase = createClient();

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('products')
      .select(`
        *,
        product_recipes (
          raw_material_id,
          quantity_needed
        )
      `)
      .order('name');
    
    if (data) setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Manajemen Inventaris</h1>
          <p className="text-slate-500 font-medium">Kelola stok barang dan resep produk jualan Anda.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/tenant/inventory/transfer">
            <Button variant="outline" className="flex gap-2 rounded-xl border-slate-200 font-bold">
              <ArrowRightLeft className="w-4 h-4" />
              Transfer
            </Button>
          </Link>
          <Link href="/tenant/inventory/warehouses">
            <Button variant="outline" className="flex gap-2 rounded-xl border-slate-200 font-bold">
              <MapPin className="w-4 h-4" />
              Gudang
            </Button>
          </Link>
          <Button 
            className="flex gap-2 bg-primary hover:bg-primary/90 rounded-xl font-bold shadow-lg"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Tambah Produk
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-primary/5">
          <CardContent className="p-6">
            <p className="text-xs font-black uppercase tracking-widest text-primary/60 mb-1">Total Produk</p>
            <p className="text-3xl font-black text-primary">{products.length}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-slate-50">
          <CardContent className="p-6">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Produk dg Resep</p>
            <p className="text-3xl font-black text-slate-700">
              {products.filter(p => p.product_recipes?.length > 0).length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-slate-50">
          <CardContent className="p-6">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Total Kategori</p>
            <p className="text-3xl font-black text-slate-700">
              {new Set(products.map(p => p.category).filter(Boolean)).size || 1}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden">
        <CardHeader className="bg-white border-b border-slate-50 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-black text-slate-800">Daftar Barang & Produk</CardTitle>
          <Button variant="ghost" size="sm" className="gap-2 text-slate-400">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-none">
                <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[10px] pl-6">Nama Produk</TableHead>
                <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Barcode</TableHead>
                <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Resep</TableHead>
                <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[10px] text-right">Harga Jual</TableHead>
                <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[10px] text-right pr-6"></TableHead>
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
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20 text-slate-400">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-10" />
                    <p className="font-bold">Belum ada produk terdaftar.</p>
                    <Button 
                      variant="link" 
                      className="text-primary font-bold mt-2"
                      onClick={() => setIsAddModalOpen(true)}
                    >
                      Klik untuk tambah produk pertama
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                products.map((p) => (
                  <TableRow key={p.id} className="hover:bg-slate-50/50 transition-colors border-slate-50">
                    <TableCell className="py-4 pl-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-700">{p.name}</span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-tight">{p.category || 'General'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500 font-mono">
                        {p.barcode || 'N/A'}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${p.product_recipes?.length > 0 ? 'bg-green-500' : 'bg-slate-300'}`} />
                        <span className="text-xs font-bold text-slate-500">
                          {p.product_recipes?.length > 0 ? `${p.product_recipes.length} Bahan` : 'No Recipe'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-black text-slate-700">
                      Rp {p.selling_price?.toLocaleString() || p.price?.toLocaleString() || 0}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button variant="ghost" size="icon" className="hover:bg-slate-100 rounded-lg">
                        <MoreHorizontal className="w-4 h-4 text-slate-400" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AddProductModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchProducts}
      />
    </div>
  );
}
