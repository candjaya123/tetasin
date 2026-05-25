"use client";

import React, { useEffect, useState } from 'react';
import { reportService } from '@/lib/api/reportService';
import { 
  Package, 
  Search, 
  ArrowLeft,
  Download,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function StockReportPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchStock = async () => {
      try {
        const res = await reportService.getStockReport();
        setData(res as any[]);
      } catch (error) {
        console.error('Error fetching stock report:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStock();
  }, []);

  const formatCurrency = (val: string | number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(Number(val));
  };

  const filteredData = data.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalValue = data.reduce((sum, item) => sum + Number(item.total_value), 0);

  const handleExportCSV = () => {
    const headers = ["Nama Produk", "SKU", "Stok Saat Ini", "Harga Satuan", "Total Nilai"];
    const rows = filteredData.map(item => [
      item.name,
      item.sku || '-',
      item.current_stock,
      item.unit_price,
      item.total_value
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_Stok_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link href="/tenant/finance">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100">
              <ArrowLeft className="w-6 h-6 text-slate-600" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Laporan Stok</h1>
            <p className="text-slate-500 font-medium">Status inventaris dan valuasi aset produk.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="rounded-xl font-bold h-11 border-slate-200 hover:bg-slate-50"
            onClick={handleExportCSV}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm rounded-3xl bg-white p-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Total Produk</p>
          <p className="text-3xl font-black text-slate-900">{data.length}</p>
        </Card>
        <Card className="border-none shadow-sm rounded-3xl bg-secondary text-white p-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Total Nilai Inventaris</p>
          <p className="text-3xl font-black">{formatCurrency(totalValue)}</p>
        </Card>
        <Card className="border-none shadow-sm rounded-3xl bg-rose-50 text-rose-600 p-6 border border-rose-100">
          <p className="text-[10px] font-black uppercase tracking-widest text-rose-400 mb-2">Produk Stok Rendah</p>
          <p className="text-3xl font-black">{data.filter(i => Number(i.current_stock) < 10).length}</p>
        </Card>
      </div>

      <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
        <CardHeader className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="text-xl font-black text-slate-900">Rincian Inventaris</CardTitle>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Cari produk atau SKU..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 h-12 bg-slate-50 border-none rounded-2xl font-medium focus-visible:ring-primary"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50">
                  <th className="px-8 py-5">Produk</th>
                  <th className="px-8 py-5">SKU</th>
                  <th className="px-8 py-5 text-right">Stok</th>
                  <th className="px-8 py-5 text-right">Harga Satuan</th>
                  <th className="px-8 py-5 text-right">Total Nilai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                      <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Memuat Data...</p>
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center text-slate-400 font-bold italic">
                      Tidak ada data ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                            <Package className="w-5 h-5" />
                          </div>
                          <span className="font-black text-slate-900 group-hover:text-primary transition-colors">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-wider">
                          {item.sku || '-'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right font-black">
                        <span className={Number(item.current_stock) < 10 ? 'text-rose-600' : 'text-slate-700'}>
                          {item.current_stock}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right font-bold text-slate-500">
                        {formatCurrency(item.unit_price)}
                      </td>
                      <td className="px-8 py-6 text-right font-black text-slate-900">
                        {formatCurrency(item.total_value)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
