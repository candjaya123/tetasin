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
  XCircle
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import Link from 'next/link';
import { promoService } from '@/lib/api/promoService';

export default function PromosPage() {
  const [promos, setPromos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // Form States
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
      const data = await promoService.getPromos();
      if (data) setPromos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await promoService.createPromo({
        name,
        type,
        value: Number(value),
        min_purchase: Number(minPurchase),
        start_date: startDate,
        end_date: endDate,
        is_active: true
      });
      setIsAdding(false);
      resetForm();
      fetchPromos();
    } catch (err) {
      alert("Gagal menyimpan promo");
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
        <Button className="flex gap-2" onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? <ChevronLeft className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {isAdding ? 'Batal' : 'Buat Promo Baru'}
        </Button>
      </div>

      {isAdding && (
        <Card className="border-none shadow-lg bg-primary/5 border border-primary/10">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-primary" />
              Konfigurasi Aturan Promo
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
                <Select value={type} onValueChange={(val) => setType(val || '')}>
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
            <div className="mt-8 flex justify-end">
              <Button className="w-full md:w-auto px-10 h-12 font-bold" onClick={handleSave}>Simpan & Aktifkan Promo</Button>
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
                      {p.type === 'percentage' ? `${p.value}%` : `Rp ${p.value.toLocaleString()}`}
                    </TableCell>
                    <TableCell>Rp {p.min_purchase?.toLocaleString() || 0}</TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {p.start_date ? new Date(p.start_date).toLocaleDateString() : '-'} s/d {p.end_date ? new Date(p.end_date).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      {p.is_active ? (
                        <span className="flex items-center gap-1 text-green-600 font-bold text-xs"><CheckCircle2 size={12}/> Aktif</span>
                      ) : (
                        <span className="flex items-center gap-1 text-slate-400 font-bold text-xs"><XCircle size={12}/> Non-aktif</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button variant="ghost" size="icon" className="text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
