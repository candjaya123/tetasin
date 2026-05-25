'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Tag,
  Trash2,
  ChevronLeft,
  Calendar,
  Settings2,
  CheckCircle2,
  XCircle,
  Pencil,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { promoService } from '@/lib/api/promoService';
import { useToast } from '@/hooks/use-toast';

export default function PromosPage() {
  const { toast } = useToast();
  const [promos, setPromos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);

  const [deleting, setDeleting] = useState<any | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const [name, setName] = useState('');
  const [type, setType] = useState('percentage');
  const [value, setValue] = useState('');
  const [minPurchase, setMinPurchase] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchPromos();
  }, []);

  const fetchPromos = async () => {
    try {
      const data = await promoService.getPromos() as any[];
      if (data) setPromos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAddForm = () => {
    setEditingPromo(null);
    resetForm();
    setIsFormOpen(true);
  };

  const openEditForm = (promo: any) => {
    setEditingPromo(promo);
    setName(promo.name || '');
    setType(promo.type || 'percentage');
    setValue(String(promo.value ?? ''));
    setMinPurchase(String(promo.min_purchase ?? ''));
    setStartDate(promo.start_date ? promo.start_date.slice(0, 10) : '');
    setEndDate(promo.end_date ? promo.end_date.slice(0, 10) : '');
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name,
        type,
        value: Number(value),
        min_purchase: Number(minPurchase),
        start_date: startDate,
        end_date: endDate,
      };

      if (editingPromo) {
        await promoService.updatePromo(editingPromo.id, payload);
        toast({ title: 'Berhasil', description: 'Promo berhasil diperbarui' });
      } else {
        await promoService.createPromo({ ...payload, is_active: true });
        toast({ title: 'Berhasil', description: 'Promo baru berhasil dibuat' });
      }
      setIsFormOpen(false);
      resetForm();
      setEditingPromo(null);
      fetchPromos();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Gagal', description: err.message || 'Gagal menyimpan promo' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setConfirmingDelete(true);
    try {
      await promoService.deletePromo(deleting.id);
      toast({ title: 'Berhasil', description: 'Promo berhasil dihapus' });
      setDeleting(null);
      fetchPromos();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Gagal', description: err.message || 'Gagal menghapus promo' });
    } finally {
      setConfirmingDelete(false);
    }
  };

  const resetForm = () => {
    setName('');
    setType('percentage');
    setValue('');
    setMinPurchase('');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Promo & Diskon</h1>
          <p className="text-slate-500">Buat aturan diskon dinamis untuk meningkatkan penjualan.</p>
        </div>
        <Button className="flex gap-2" onClick={openAddForm}>
          <Plus className="w-4 h-4" />
          Buat Promo Baru
        </Button>
      </div>

      {isFormOpen && (
        <Card className="border-none shadow-lg bg-primary/5 border border-primary/10">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-primary" />
              {editingPromo ? 'Edit Promo' : 'Konfigurasi Aturan Promo'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Nama Promo</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Cth: Diskon Ramadhan" />
              </div>
              <div className="space-y-2">
                <Label>Tipe Diskon</Label>
                <Select value={type} onValueChange={(val: string | null) => setType(val || '')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Persentase (%)</SelectItem>
                    <SelectItem value="fixed">Nominal Tetap (Rp)</SelectItem>
                    <SelectItem value="bogo">Beli X Gratis Y</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nilai Diskon</Label>
                <Input type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Cth: 10 atau 5000" />
              </div>
              <div className="space-y-2">
                <Label>Minimal Pembelian (Rp)</Label>
                <Input type="number" value={minPurchase} onChange={(e) => setMinPurchase(e.target.value)} placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label>Tanggal Mulai</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Tanggal Berakhir</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <Button variant="outline" onClick={() => { setIsFormOpen(false); setEditingPromo(null); resetForm(); }}>
                Batal
              </Button>
              <Button className="px-10 h-12 font-bold" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {editingPromo ? 'Perbarui Promo' : 'Simpan & Aktifkan Promo'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Nama Promo</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Nilai</TableHead>
                <TableHead>Syarat Min.</TableHead>
                <TableHead>Periode</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-6"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-slate-400">Memuat data promo...</TableCell>
                </TableRow>
              ) : promos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-slate-400">Belum ada promo aktif.</TableCell>
                </TableRow>
              ) : (
                promos.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="pl-6 font-bold flex items-center gap-2">
                      <Tag className="w-3 h-3 text-primary" />
                      {p.name}
                    </TableCell>
                    <TableCell className="capitalize">{p.type}</TableCell>
                    <TableCell className="font-bold">
                      {p.type === 'percentage' ? `${p.value}%` : `Rp ${p.value?.toLocaleString()}`}
                    </TableCell>
                    <TableCell>Rp {p.min_purchase?.toLocaleString() || 0}</TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {p.start_date ? new Date(p.start_date).toLocaleDateString() : '-'} s/d {p.end_date ? new Date(p.end_date).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      {p.is_active ? (
                        <span className="flex items-center gap-1 text-green-600 font-bold text-xs"><CheckCircle2 size={12} /> Aktif</span>
                      ) : (
                        <span className="flex items-center gap-1 text-slate-400 font-bold text-xs"><XCircle size={12} /> Non-aktif</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary" onClick={() => openEditForm(p)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-600" onClick={() => setDeleting(p)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!deleting} onOpenChange={(open: boolean) => { if (!open) setDeleting(null); }}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Hapus Promo
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus promo <strong>{deleting?.name}</strong>? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleting(null)} className="rounded-xl font-bold">
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={confirmingDelete} className="rounded-xl font-bold">
              {confirmingDelete ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
