'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Package,
  Barcode,
  DollarSign,
  Boxes,
  Hash,
  Loader2,
  FlaskConical,
  Palette,
  Puzzle,
  Pencil,
  Trash2,
} from "lucide-react";
import { apiGet } from '@/lib/api/client';
import { productService } from '@/lib/api/productService';
import { AddProductModal } from '@/components/inventory/AddProductModal';
import { useToast } from "@/hooks/use-toast";

const TABS = [
  { key: 'recipe', label: 'Resep', icon: FlaskConical },
  { key: 'variants', label: 'Varian', icon: Palette },
  { key: 'addons', label: 'Addon', icon: Puzzle },
];

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('recipe');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (id) fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const data = await apiGet(`/api/v1/inventory/products/${id}`);
      setProduct(data);
    } catch (err) {
      console.error('Failed to fetch product', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await productService.deleteProduct(id);
      toast({ title: "Berhasil", description: "Produk berhasil dihapus" });
      router.push('/tenant/inventory');
    } catch (err: any) {
      toast({ title: "Gagal", description: err.message || "Gagal menghapus produk", variant: "destructive" });
    } finally {
      setDeleting(false);
      setDeleteConfirmOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20 text-slate-400">
        <Package className="w-16 h-16 mx-auto mb-4 opacity-20" />
        <p className="font-bold text-lg">Produk tidak ditemukan</p>
        <Button variant="link" onClick={() => router.back()} className="mt-2">
          Kembali
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">{product.name}</h1>
          <p className="text-sm text-slate-500 font-medium">{product.category || 'General'}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={product.product_recipes?.length > 0 ? 'default' : 'secondary'} className="text-xs">
            {product.product_recipes?.length > 0 ? 'Produk Resep' : 'Barang Jadi'}
          </Badge>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setIsEditModalOpen(true)}>
            <Pencil className="w-4 h-4" /> Edit
          </Button>
          <Button variant="outline" size="sm" className="gap-2 text-red-600 border-red-200 hover:bg-red-50" onClick={() => setDeleteConfirmOpen(true)}>
            <Trash2 className="w-4 h-4" /> Hapus
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm bg-primary/5 rounded-[1.5rem]">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center gap-2 text-primary/60 mb-1">
              <DollarSign className="w-4 h-4" />
              <p className="text-[10px] font-black uppercase tracking-widest">Harga Jual</p>
            </div>
            <p className="text-2xl font-black text-primary">
              Rp {(product.selling_price || product.price || 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-slate-50 rounded-[1.5rem]">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Boxes className="w-4 h-4" />
              <p className="text-[10px] font-black uppercase tracking-widest">Stok</p>
            </div>
            <p className="text-2xl font-black text-slate-700">{product.current_stock ?? 'N/A'}</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-slate-50 rounded-[1.5rem]">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Hash className="w-4 h-4" />
              <p className="text-[10px] font-black uppercase tracking-widest">SKU</p>
            </div>
            <p className="text-lg font-black text-slate-700 font-mono">{product.sku || 'N/A'}</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-slate-50 rounded-[1.5rem]">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Barcode className="w-4 h-4" />
              <p className="text-[10px] font-black uppercase tracking-widest">Barcode</p>
            </div>
            <p className="text-lg font-black text-slate-700 font-mono">{product.barcode || 'N/A'}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="border-b border-slate-100 p-0">
          <div className="flex">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-5 py-4 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${
                    activeTab === tab.key
                      ? 'border-primary text-primary'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {activeTab === 'recipe' && (
            <div>
              {product.product_recipes?.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Bahan</TableHead>
                      <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[10px] text-right">Qty</TableHead>
                      <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[10px] text-right">Biaya</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {product.product_recipes.map((recipe: any, i: number) => (
                      <TableRow key={recipe.id || i}>
                        <TableCell className="font-bold text-slate-700">{recipe.material_name || recipe.name}</TableCell>
                        <TableCell className="text-right font-bold text-slate-600">{recipe.quantity} {recipe.unit}</TableCell>
                        <TableCell className="text-right font-bold text-slate-600">
                          Rp {(recipe.cost || 0).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-10 text-slate-400">
                  <FlaskConical className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="font-bold">Tidak ada resep untuk produk ini.</p>
                  <p className="text-xs text-slate-400 mt-1">Produk ini tidak memerlukan bahan baku.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'variants' && (
            <div>
              {product.variants?.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Varian</TableHead>
                      <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[10px] text-right">Harga</TableHead>
                      <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[10px] text-right">Stok</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {product.variants.map((v: any) => (
                      <TableRow key={v.id}>
                        <TableCell className="font-bold text-slate-700">{v.name}</TableCell>
                        <TableCell className="text-right font-bold text-slate-600">Rp {(v.price || 0).toLocaleString()}</TableCell>
                        <TableCell className="text-right font-bold text-slate-600">{v.stock ?? '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-10 text-slate-400">
                  <Palette className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="font-bold">Tidak ada varian.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'addons' && (
            <div>
              {product.addons?.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Addon</TableHead>
                      <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[10px] text-right">Harga Tambahan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {product.addons.map((a: any) => (
                      <TableRow key={a.id}>
                        <TableCell className="font-bold text-slate-700">{a.name}</TableCell>
                        <TableCell className="text-right font-bold text-slate-600">Rp {(a.price || 0).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-10 text-slate-400">
                  <Puzzle className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="font-bold">Tidak ada addon.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <AddProductModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={() => { setIsEditModalOpen(false); fetchProduct(); }}
        editingProduct={product}
      />

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Produk</DialogTitle>
            <DialogDescription>
              Yakin ingin menghapus <strong>{product.name}</strong>? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>Batal</Button>
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
