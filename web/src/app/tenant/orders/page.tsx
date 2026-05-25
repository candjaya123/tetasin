'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText, 
  Plus, 
  Search, 
  Filter,
  CheckCircle2,
  Clock,
  Send,
  AlertCircle
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import Link from 'next/link';
import { orderService } from '@/lib/api/orderService';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await orderService.getOrders();
      if (data) setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><CheckCircle2 size={12}/> Selesai</span>;
      case 'sent': return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><Send size={12}/> Dikirim</span>;
      case 'pending': return <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><Clock size={12}/> Menunggu</span>;
      default: return <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><AlertCircle size={12}/> {status}</span>;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pengadaan (SO/PO)</h1>
          <p className="text-slate-500">Manajemen pesanan penjualan dan pembelian.</p>
        </div>
        <Link
          href="/tenant/orders/new"
          className={cn(
            buttonVariants(),
            "flex gap-2 items-center"
          )}
        >
          <Plus className="w-4 h-4" />
          Buat Pesanan Baru
        </Link>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            className="pl-10" 
            placeholder="Cari nomor pesanan atau nama supplier/pelanggan..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" className="flex gap-2">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">No. Pesanan</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Pelanggan / Supplier</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-6">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-slate-400">Memuat data pesanan...</TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-slate-400">Belum ada pesanan.</TableCell>
                </TableRow>
              ) : (
                orders.map((o) => (
                  <TableRow key={o.id} className="cursor-pointer hover:bg-slate-50 transition-colors">
                    <TableCell className="pl-6 font-bold text-primary">#{o.order_number || o.id.slice(0, 8).toUpperCase()}</TableCell>
                    <TableCell>
                      <span className={`text-xs font-black uppercase ${o.type === 'SO' ? 'text-blue-600' : 'text-amber-600'}`}>
                        {o.type === 'SO' ? 'Sales Order' : 'Purchase Order'}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">{o.entity_name || '-'}</TableCell>
                    <TableCell className="text-slate-500">{new Date(o.created_at).toLocaleDateString('id-ID')}</TableCell>
                    <TableCell>{getStatusBadge(o.status)}</TableCell>
                    <TableCell className="text-right pr-6 font-bold">Rp {o.total_amount?.toLocaleString()}</TableCell>
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
