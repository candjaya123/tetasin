'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Plus, 
  MapPin, 
  ChevronLeft, 
  Trash2, 
  Edit2 
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
import { warehouseService } from '@/lib/api/warehouseService';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<any>(null);
  
  // Form States
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');

  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const data = await warehouseService.getWarehouses();
      if (data) setWarehouses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const handleSave = async () => {
    try {
      if (editingWarehouse) {
        await warehouseService.updateWarehouse(editingWarehouse.id, { name, location });
      } else {
        await warehouseService.createWarehouse({ name, location });
      }
      setIsModalOpen(false);
      resetForm();
      fetchWarehouses();
    } catch (err) {
      alert("Gagal menyimpan gudang");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus gudang ini?")) return;
    try {
      await warehouseService.deleteWarehouse(id);
      fetchWarehouses();
    } catch (err) {
      alert("Gagal menghapus gudang");
    }
  };

  const resetForm = () => {
    setName('');
    setLocation('');
    setEditingWarehouse(null);
  };

  const openEdit = (w: any) => {
    setEditingWarehouse(w);
    setName(w.name);
    setLocation(w.location || '');
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/tenant/inventory">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Kelola Gudang</h1>
            <p className="text-slate-500">Daftar lokasi penyimpanan barang Anda.</p>
          </div>
        </div>
        
        <Dialog open={isModalOpen} onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger>
            <Button className="flex gap-2">
              <Plus className="w-4 h-4" />
              Tambah Gudang
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingWarehouse ? 'Edit Gudang' : 'Tambah Gudang Baru'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Gudang</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: Gudang Pusat" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Lokasi / Alamat</Label>
                <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Alamat lengkap" />
              </div>
              <Button className="w-full" onClick={handleSave}>Simpan Gudang</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="col-span-full text-center py-10 text-slate-400">Memuat daftar gudang...</p>
        ) : warehouses.length === 0 ? (
          <p className="col-span-full text-center py-10 text-slate-400">Belum ada gudang terdaftar.</p>
        ) : (
          warehouses.map((w) => (
            <Card key={w.id} className="border-none shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary" onClick={() => openEdit(w)}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600" onClick={() => handleDelete(w.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <CardHeader className="pb-2">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-lg">{w.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-500 line-clamp-2">{w.location || 'Tidak ada alamat'}</p>
                <div className="mt-4 pt-4 border-t flex justify-between items-center text-xs font-semibold text-slate-400 uppercase">
                  <span>ID: {w.id.slice(0,8)}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
