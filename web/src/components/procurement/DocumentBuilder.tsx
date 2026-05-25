'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  FileText, 
  Trash2, 
  Plus, 
  Send, 
  Download,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

interface DraftItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
}

interface DocumentBuilderProps {
  draft: {
    id: string;
    reference: string;
    vendor_name: string;
    items: DraftItem[];
  };
  onApprove: (data: any) => void;
  onCancel: () => void;
}

export function DocumentBuilder({ draft, onApprove, onCancel }: DocumentBuilderProps) {
  const [items, setItems] = useState<DraftItem[]>(draft.items);
  const [isApproving, setIsApproving] = useState(false);

  const updateQty = (id: string, qty: number) => {
    setItems(items.map(item => item.id === id ? { ...item, quantity: Math.max(0, qty) } : item));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.11;
  const total = subtotal + tax;

  const handlePrint = () => {
    window.print();
  };

  const handleApprove = async () => {
    setIsApproving(true);
    // Simulasi delay
    setTimeout(() => {
      onApprove({
        ...draft,
        items,
        total_amount: total
      });
      setIsApproving(false);
    }, 1000);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Review Purchase Order (PO)</h2>
            <p className="text-xs text-slate-400 font-medium">Draft otomatis oleh Tetasin AI • Ref: {draft.reference}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>Batalkan</Button>
          <Button 
            onClick={handleApprove} 
            disabled={isApproving || items.length === 0}
            className="bg-primary hover:bg-primary/90 shadow-lg"
          >
            {isApproving ? 'Memproses...' : 'Setujui & Terbitkan'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:hidden">
        <Card className="lg:col-span-2 border-none shadow-sm bg-white overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400">Rincian Barang</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 border-b">
                <tr>
                  <th className="px-6 py-4">Nama Produk</th>
                  <th className="px-6 py-4 w-32">Jumlah (QTY)</th>
                  <th className="px-6 py-4 text-right">Harga Satuan</th>
                  <th className="px-6 py-4 text-right">Subtotal</th>
                  <th className="px-6 py-4 w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-800">{item.product_name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <Input 
                        type="number" 
                        value={item.quantity} 
                        onChange={(e) => updateQty(item.id, parseInt(e.target.value))}
                        className="h-9 text-center font-bold"
                      />
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-slate-500">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-800">
                      {formatCurrency(item.price * item.quantity)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="bg-slate-50/50 border-b">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400">Ringkasan Dokumen</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Vendor</span>
                <span className="font-bold text-slate-800">{draft.vendor_name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-bold text-slate-800">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">PPN (11%)</span>
                <span className="font-bold text-slate-800">{formatCurrency(tax)}</span>
              </div>
              <div className="pt-4 border-t flex justify-between">
                <span className="text-lg font-black text-slate-800">Total Tagihan</span>
                <span className="text-lg font-black text-primary">{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100 flex gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
              <p className="text-[10px] text-yellow-700 font-medium leading-relaxed">
                Purchase Order ini dirakit secara otomatis berdasarkan tren penjualan dan sisa stok gudang Anda. Mohon tinjau kembali jumlah QTY sebelum menerbitkan dokumen.
              </p>
            </div>

            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2 h-11" onClick={handlePrint}>
                <Download className="w-4 h-4" />
                Cetak / Simpan PDF
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-2 h-11 text-slate-400">
                <Send className="w-4 h-4" />
                Kirim via Email
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Printable PO View (Hidden by default, shown only in print) */}
      <div className="hidden print:block p-12 bg-white text-black font-sans min-h-screen">
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8 mb-8">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-primary">TUMBUHIN</h1>
            <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-widest">Sistem ERP Cerdas</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-black text-slate-800">PURCHASE ORDER</h2>
            <p className="text-sm font-bold text-slate-400">No: {draft.reference}</p>
            <p className="text-sm text-slate-400" suppressHydrationWarning>Tanggal: {new Date().toLocaleDateString('id-ID')}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-12 mb-12">
          <div>
            <p className="text-xs font-black uppercase text-slate-400 mb-2">Vendor / Supplier:</p>
            <p className="text-lg font-bold text-slate-800">{draft.vendor_name}</p>
            <p className="text-sm text-slate-500 mt-1">Gudang Supplier Utama</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-black uppercase text-slate-400 mb-2">Dikirim Ke:</p>
            <p className="text-lg font-bold text-slate-800">Tetasin Central Warehouse</p>
            <p className="text-sm text-slate-500 mt-1">Jl. Ekonomi No. 123, Jakarta</p>
          </div>
        </div>

        <table className="w-full mb-12 border-collapse">
          <thead>
            <tr className="bg-slate-50 border-y-2 border-slate-900">
              <th className="px-4 py-4 text-left font-black text-xs uppercase">Deskripsi Barang</th>
              <th className="px-4 py-4 text-center font-black text-xs uppercase">Jumlah</th>
              <th className="px-4 py-4 text-right font-black text-xs uppercase">Harga Satuan</th>
              <th className="px-4 py-4 text-right font-black text-xs uppercase">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y border-b border-slate-200">
            {items.map((item, idx) => (
              <tr key={idx}>
                <td className="px-4 py-6 font-bold text-slate-800">{item.product_name}</td>
                <td className="px-4 py-6 text-center">{item.quantity} Unit</td>
                <td className="px-4 py-6 text-right">{formatCurrency(item.price)}</td>
                <td className="px-4 py-6 text-right font-bold">{formatCurrency(item.price * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="w-72 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-bold">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Pajak (11%)</span>
              <span className="font-bold">{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between text-xl border-t-2 border-slate-900 pt-4">
              <span className="font-black text-slate-800">TOTAL</span>
              <span className="font-black text-primary">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-2 gap-20 text-center">
          <div>
            <div className="border-b border-slate-300 h-24 mb-2"></div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Disiapkan Oleh (AI System)</p>
          </div>
          <div>
            <div className="border-b border-slate-300 h-24 mb-2"></div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Disetujui Oleh (Manager)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
