'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package,
  MapPin,
  ArrowRightLeft,
  ClipboardCheck,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Search,
  X,
  LayoutGrid,
  List,
  Tag,
  Barcode,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from 'next/link';
import { productService } from '@/lib/api/productService';
import { AddProductModal } from '@/components/inventory/AddProductModal';
import { useToast } from "@/hooks/use-toast";

type ViewMode = 'list' | 'grid';

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const { toast } = useToast();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await productService.getProducts();
      if (data) setProducts(data);
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(p =>
      (p.name || '').toLowerCase().includes(q) ||
      (p.barcode || '').toLowerCase().includes(q) ||
      (p.sku || '').toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setIsAddModalOpen(true);
  };

  const handleModalClose = () => {
    setIsAddModalOpen(false);
    setEditingProduct(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await productService.deleteProduct(deleteTarget.id);
      toast({ title: "Berhasil", description: "Produk berhasil dihapus" });
      setDeleteTarget(null);
      fetchProducts();
    } catch (err: any) {
      toast({ title: "Gagal", description: err.message || "Gagal menghapus produk", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">Manajemen Inventaris</h1>
          <p className="text-sm sm:text-base text-slate-500 font-medium">Kelola stok barang dan resep produk jualan Anda.</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Link
            href="/tenant/inventory/transfer"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "flex-grow sm:flex-grow-0 flex gap-2 rounded-xl border-slate-200 font-bold text-xs sm:text-sm h-10 sm:h-11 items-center justify-center"
            )}
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span className="hidden xs:inline">Transfer</span>
            <span className="xs:hidden">Tf</span>
          </Link>
          <Link
            href="/tenant/inventory/warehouses"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "flex-grow sm:flex-grow-0 flex gap-2 rounded-xl border-slate-200 font-bold text-xs sm:text-sm h-10 sm:h-11 items-center justify-center"
            )}
          >
            <MapPin className="w-4 h-4" />
            Gudang
          </Link>
          <Link
            href="/tenant/inventory/opname"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "flex-grow sm:flex-grow-0 flex gap-2 rounded-xl border-slate-200 font-bold text-xs sm:text-sm h-10 sm:h-11 items-center justify-center"
            )}
          >
            <ClipboardCheck className="w-4 h-4" />
            Opname
          </Link>
          <Button
            className="flex-grow sm:flex-grow-0 flex gap-2 bg-primary hover:bg-primary/90 rounded-xl font-bold shadow-lg text-xs sm:text-sm h-10 sm:h-11"
            onClick={() => { setEditingProduct(null); setIsAddModalOpen(true); }}
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

      <Card className="border-none shadow-sm">
        <CardHeader className="bg-white border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 sm:p-6">
          <CardTitle className="text-base sm:text-lg font-black text-slate-800">Daftar Barang & Produk</CardTitle>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Cari nama, barcode, atau SKU..."
                className="pl-10 h-10 bg-slate-50 border-none rounded-xl text-sm font-bold focus-visible:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex items-center bg-slate-100 rounded-xl p-1 shrink-0">
              <button
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                onClick={() => setViewMode('list')}
                title="Tampilan daftar"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                onClick={() => setViewMode('grid')}
                title="Tampilan grid"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-400">Memuat data...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-10" />
              <p className="font-bold">{searchQuery ? 'Produk tidak ditemukan' : 'Belum ada produk terdaftar.'}</p>
              {!searchQuery && (
                <Button
                  variant="link"
                  className="text-primary font-bold mt-2"
                  onClick={() => { setEditingProduct(null); setIsAddModalOpen(true); }}
                >
                  Klik untuk tambah produk pertama
                </Button>
              )}
            </div>
          ) : viewMode === 'list' ? (
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="border-none">
                  <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[9px] sm:text-[10px] pl-4 sm:pl-6">Nama Produk</TableHead>
                  <TableHead className="hidden xs:table-cell font-black text-slate-400 uppercase tracking-widest text-[9px] sm:text-[10px]">Barcode</TableHead>
                  <TableHead className="hidden sm:table-cell font-black text-slate-400 uppercase tracking-widest text-[9px] sm:text-[10px]">Resep</TableHead>
                  <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[9px] sm:text-[10px] text-right">Harga Jual</TableHead>
                  <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[9px] sm:text-[10px] text-right pr-4 sm:pr-6">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((p) => (
                  <TableRow key={p.id} className="hover:bg-slate-50/50 transition-colors border-slate-50">
                    <TableCell className="py-3 sm:py-4 pl-4 sm:pl-6">
                      <Link href={`/tenant/inventory/${p.id}`} className="flex flex-col hover:text-primary transition-colors">
                        <span className="font-bold text-slate-700 text-xs sm:text-sm">{p.name}</span>
                        <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-tight">{p.category || 'General'}</span>
                      </Link>
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
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 hover:bg-blue-50 hover:text-blue-600 rounded-lg"
                          onClick={() => handleEdit(p)}
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 hover:bg-red-50 hover:text-red-600 rounded-lg"
                          onClick={() => setDeleteTarget(p)}
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 sm:p-6">
              {filteredProducts.map((p) => (
                <Link key={p.id} href={`/tenant/inventory/${p.id}`} className="block group">
                  <Card className="border-none shadow-sm hover:shadow-lg hover:ring-2 hover:ring-primary/20 transition-all rounded-2xl bg-white overflow-hidden">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                          <Package className="w-5 h-5 text-primary" />
                        </div>
                        {p.product_recipes?.length > 0 && (
                          <span className="text-[9px] font-black uppercase tracking-widest bg-green-100 text-green-700 px-2 py-1 rounded-lg">
                            Resep
                          </span>
                        )}
                      </div>
                      <h3 className="font-black text-slate-800 text-sm group-hover:text-primary transition-colors truncate">
                        {p.name}
                      </h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">
                        {p.category || 'General'}
                      </p>
                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="font-black text-slate-700 text-sm">
                          Rp {p.selling_price?.toLocaleString() || p.price?.toLocaleString() || 0}
                        </span>
                        <span className="text-[9px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded">
                          {p.barcode || 'N/A'}
                        </span>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-8 rounded-lg text-[10px] font-bold border-slate-100"
                          onClick={(e) => { e.preventDefault(); handleEdit(p); }}
                        >
                          <Pencil className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 rounded-lg border-slate-100 text-red-400 hover:text-red-600 hover:bg-red-50"
                          onClick={(e) => { e.preventDefault(); setDeleteTarget(p); }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={handleModalClose}
        onSuccess={fetchProducts}
        editingProduct={editingProduct}
      />

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Produk</DialogTitle>
            <DialogDescription>
              Yakin ingin menghapus <strong>{deleteTarget?.name}</strong>? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Batal</Button>
            <Button onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700">
              {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
