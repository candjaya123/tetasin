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
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">Manajemen Inventaris</h1>
          <p className="text-sm sm:text-base text-slate-500 font-medium">Kelola stok barang dan resep produk jualan Anda.</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Link href="/tenant/inventory/transfer" className="flex-grow sm:flex-grow-0">
            <Button variant="outline" className="w-full flex gap-2 rounded-xl border-slate-200 font-bold text-xs sm:text-sm h-10 sm:h-11">
              <ArrowRightLeft className="w-4 h-4" />
              <span className="hidden xs:inline">Transfer</span>
              <span className="xs:hidden">Tf</span>
            </Button>
          </Link>
          <Link href="/tenant/inventory/warehouses" className="flex-grow sm:flex-grow-0">
            <Button variant="outline" className="w-full flex gap-2 rounded-xl border-slate-200 font-bold text-xs sm:text-sm h-10 sm:h-11">
              <MapPin className="w-4 h-4" />
              Gudang
            </Button>
          </Link>
          <Button 
            className="flex-grow sm:flex-grow-0 flex gap-2 bg-primary hover:bg-primary/90 rounded-xl font-bold shadow-lg text-xs sm:text-sm h-10 sm:h-11"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Produk
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <Card className="border-none shadow-sm bg-primary/5 rounded-[1.5rem]">
          <CardContent className="p-5 sm:p-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-1">Total Produk</p>
            <p className="text-2xl sm:text-3xl font-black text-primary">{products.length}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-slate-50 rounded-[1.5rem]">
          <CardContent className="p-5 sm:p-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Produk dg Resep</p>
            <p className="text-2xl sm:text-3xl font-black text-slate-700">
              {products.filter(p => p.product_recipes?.length > 0).length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-slate-50 rounded-[1.5rem]">
          <CardContent className="p-5 sm:p-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Kategori</p>
            <p className="text-2xl sm:text-3xl font-black text-slate-700">
              {new Set(products.map(p => p.category).filter(Boolean)).size || 1}
            </p>
          </CardContent>
        </Card>
      </div>

        <CardHeader className="bg-white border-b border-slate-50 flex flex-row items-center justify-between p-5 sm:p-6">
          <CardTitle className="text-base sm:text-lg font-black text-slate-800">Daftar Barang & Produk</CardTitle>
          <Button variant="ghost" size="sm" className="gap-2 text-slate-400">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-none">
                <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[9px] sm:text-[10px] pl-4 sm:pl-6">Nama Produk</TableHead>
                <TableHead className="hidden xs:table-cell font-black text-slate-400 uppercase tracking-widest text-[9px] sm:text-[10px]">Barcode</TableHead>
                <TableHead className="hidden sm:table-cell font-black text-slate-400 uppercase tracking-widest text-[9px] sm:text-[10px]">Resep</TableHead>
                <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[9px] sm:text-[10px] text-right">Harga Jual</TableHead>
                <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[9px] sm:text-[10px] text-right pr-4 sm:pr-6"></TableHead>
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
                    <TableCell className="py-3 sm:py-4 pl-4 sm:pl-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-700 text-xs sm:text-sm">{p.name}</span>
                        <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-tight">{p.category || 'General'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden xs:table-cell">
                      <code className="text-[9px] sm:text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500 font-mono">
                        {p.barcode || 'N/A'}
                      </code>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${p.product_recipes?.length > 0 ? 'bg-green-500' : 'bg-slate-300'}`} />
                        <span className="text-xs font-bold text-slate-500">
                          {p.product_recipes?.length > 0 ? `${p.product_recipes.length} Bahan` : 'No Recipe'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-black text-slate-700 text-xs sm:text-sm">
                      Rp {p.selling_price?.toLocaleString() || p.price?.toLocaleString() || 0}
                    </TableCell>
                    <TableCell className="text-right pr-4 sm:pr-6">
                      <Button variant="ghost" size="icon" className="hover:bg-slate-100 rounded-lg w-8 h-8 sm:w-10 sm:h-10">
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
