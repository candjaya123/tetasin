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
import { 
  Plus, 
  Trash2, 
  Package, 
  Barcode, 
  ListPlus,
  Loader2,
  AlertCircle,
  RefreshCw,
  Pencil
} from "lucide-react";
import { productService } from '@/lib/api/productService';
import { useToast } from "@/hooks/use-toast";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingProduct?: any;
}

export function AddProductModal({ isOpen, onClose, onSuccess, editingProduct }: AddProductModalProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [barcode, setBarcode] = useState('');
  const [recipe, setRecipe] = useState<{ materialId: string, quantity: number }[]>([]);
  const [rawMaterials, setRawMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const isEditing = !!editingProduct;

  useEffect(() => {
    if (isOpen) {
      fetchRawMaterials();
      if (editingProduct) {
        setName(editingProduct.name || '');
        setPrice(String(editingProduct.selling_price || editingProduct.price || ''));
        setBarcode(editingProduct.barcode || '');
      }
    }
  }, [isOpen, editingProduct]);

  useEffect(() => {
    if (!isOpen) {
      setName('');
      setPrice('');
      setBarcode('');
      setRecipe([]);
    }
  }, [isOpen]);

  const fetchRawMaterials = async () => {
    try {
      setLoading(true);
      const data = await productService.getRawMaterials();
      setRawMaterials(data as any[]);
    } catch (error) {
      console.error('Error fetching raw materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const addRecipeItem = () => {
    setRecipe([...recipe, { materialId: '', quantity: 1 }]);
  };

  const removeRecipeItem = (index: number) => {
    setRecipe(recipe.filter((_, i) => i !== index));
  };

  const generateBarcode = () => {
    const random = Math.floor(100000000000 + Math.random() * 900000000000);
    setBarcode(random.toString());
    toast({
      title: "Barcode Dihasilkan",
      description: `Barcode baru: ${random}`,
    });
  };

  const updateRecipeItem = (index: number, field: string, value: any) => {
    const newRecipe = [...recipe];
    newRecipe[index] = { ...newRecipe[index], [field]: value };
    setRecipe(newRecipe);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) {
      toast({
        title: "Gagal",
        description: "Nama dan harga wajib diisi",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing) {
        await productService.updateProduct(editingProduct.id, {
          name,
          selling_price: parseFloat(price),
          barcode: barcode || undefined,
        });
        toast({ title: "Berhasil", description: "Produk berhasil diperbarui" });
      } else {
        await productService.createProduct({
          p_name: name,
          p_selling_price: parseFloat(price),
          p_barcode: barcode || undefined,
          p_recipe: recipe.filter(r => r.materialId && r.quantity > 0)
        });
        toast({ title: "Berhasil", description: "Produk berhasil ditambahkan" });
      }
      
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: "Gagal",
        description: error.message || "Terjadi kesalahan",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white border-none shadow-2xl rounded-3xl overflow-hidden">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="p-6 bg-slate-50/50">
            <DialogTitle className="text-2xl font-black text-slate-800 flex items-center gap-2">
              {isEditing ? <Pencil className="w-6 h-6 text-primary" /> : <Package className="w-6 h-6 text-primary" />}
              {isEditing ? 'Edit Produk' : 'Tambah Produk Baru'}
            </DialogTitle>
            <DialogDescription className="font-medium text-slate-500">
              {isEditing ? 'Perbarui informasi produk Anda.' : 'Daftarkan produk jualan Anda ke dalam sistem inventaris.'}
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 space-y-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-slate-400">Nama Produk</Label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <Input 
                    id="name" 
                    placeholder="Contoh: Kopi Susu Gula Aren" 
                    className="pl-10 h-12 bg-slate-50 border-none rounded-xl focus-visible:ring-primary font-bold"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-xs font-black uppercase tracking-widest text-slate-400">Harga Jual</Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                      <span className="text-sm font-black text-slate-400">Rp</span>
                    </div>
                    <Input 
                      id="price" 
                      type="number" 
                      placeholder="0" 
                      className="pl-10 h-12 bg-slate-50 border-none rounded-xl focus-visible:ring-primary font-bold"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="barcode" className="text-xs font-black uppercase tracking-widest text-slate-400">Barcode (Opsional)</Label>
                <div className="relative flex gap-2">
                  <div className="relative flex-grow">
                    <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <Input 
                      id="barcode" 
                      placeholder="Scan atau ketik..." 
                      className="pl-10 h-12 bg-slate-50 border-none rounded-xl focus-visible:ring-primary font-bold"
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                    />
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="h-12 w-12 rounded-xl border-none bg-slate-100 hover:bg-slate-200 text-primary p-0"
                    onClick={generateBarcode}
                    title="Generate Barcode Acak"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </Button>
                </div>
                </div>
              </div>
            </div>

            {!isEditing && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Resep / Bahan Baku (Opsional)</Label>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 text-xs font-bold text-primary hover:text-primary/80"
                  onClick={addRecipeItem}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Tambah Bahan
                </Button>
              </div>

              {recipe.length === 0 ? (
                <div className="bg-slate-50 rounded-2xl p-4 text-center border border-dashed border-slate-200">
                  <AlertCircle className="w-5 h-5 text-slate-300 mx-auto mb-2" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tanpa Resep</p>
                  <p className="text-[9px] text-slate-400">Produk ini akan dianggap barang jadi tanpa pemotongan stok bahan baku.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2">
                  {recipe.map((item, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <select 
                        className="flex-grow h-10 bg-slate-50 border-none rounded-xl text-xs font-bold px-3 focus:ring-2 focus:ring-primary outline-none"
                        value={item.materialId}
                        onChange={(e) => updateRecipeItem(index, 'materialId', e.target.value)}
                      >
                        <option value="">Pilih Bahan...</option>
                        {rawMaterials.map((rm) => (
                          <option key={rm.id} value={rm.id}>{rm.name} ({rm.unit})</option>
                        ))}
                      </select>
                      <Input 
                        type="number" 
                        placeholder="Qty" 
                        className="w-20 h-10 bg-slate-50 border-none rounded-xl font-bold text-xs"
                        value={item.quantity}
                        onChange={(e) => updateRecipeItem(index, 'quantity', parseFloat(e.target.value))}
                      />
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="h-10 w-10 text-slate-300 hover:text-red-500"
                        onClick={() => removeRecipeItem(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            )}
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
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <ListPlus className="w-4 h-4 mr-2" />
                  {isEditing ? 'Simpan Perubahan' : 'Simpan Produk'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
