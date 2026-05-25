'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  FileText,
  User,
  Building2,
  Calendar,
  Loader2,
  CheckCircle2,
  Clock,
  Send,
  AlertCircle,
  CreditCard,
  ShoppingCart,
  Package,
  Truck,
  CheckCheck,
  XCircle,
  Ban,
  Receipt,
} from "lucide-react";
import { orderService } from '@/lib/api/orderService';

const ORDER_STATUSES = [
  { key: 'draft', label: 'Draft', icon: FileText },
  { key: 'pending', label: 'Menunggu', icon: Clock },
  { key: 'confirmed', label: 'Dikonfirmasi', icon: CheckCircle2 },
  { key: 'processing', label: 'Diproses', icon: Package },
  { key: 'packed', label: 'Dikemas', icon: ShoppingCart },
  { key: 'shipped', label: 'Dikirim', icon: Send },
  { key: 'delivered', label: 'Terkirim', icon: Truck },
  { key: 'completed', label: 'Selesai', icon: CheckCheck },
  { key: 'cancelled', label: 'Dibatalkan', icon: XCircle },
];

function getStatusIndex(status: string) {
  return ORDER_STATUSES.findIndex(s => s.key === status);
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const data = await orderService.getOrderById(id);
      setOrder(data);
    } catch (err) {
      console.error('Failed to fetch order', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20 text-slate-400">
        <FileText className="w-16 h-16 mx-auto mb-4 opacity-20" />
        <p className="font-bold text-lg">Pesanan tidak ditemukan</p>
        <Button variant="link" onClick={() => router.push('/tenant/orders')} className="mt-2">
          Kembali ke daftar pesanan
        </Button>
      </div>
    );
  }

  const currentIdx = getStatusIndex(order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
              #{order.order_number || order.id?.slice(0, 8).toUpperCase()}
            </h1>
            <Badge variant={order.status === 'completed' ? 'default' : order.status === 'cancelled' ? 'destructive' : 'secondary'}>
              {ORDER_STATUSES.find(s => s.key === order.status)?.label || order.status}
            </Badge>
          </div>
          <p className="text-sm text-slate-500 font-medium flex items-center gap-2 mt-1">
            <User className="w-3.5 h-3.5" />
            {order.entity_name || order.customer_name || '-'}
            {order.entity_type && (
              <>
                <span className="text-slate-300">|</span>
                <Building2 className="w-3.5 h-3.5" />
                {order.entity_type}
              </>
            )}
          </p>
        </div>
      </div>

      <Card className="border-none shadow-sm bg-white rounded-[1.5rem] overflow-hidden">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400">Status Pesanan</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="relative">
            <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-slate-100" />
            <div className="space-y-6 relative">
              {ORDER_STATUSES.map((s, idx) => {
                const Icon = s.icon;
                const isPast = !isCancelled && idx <= currentIdx;
                const isCurrent = !isCancelled && idx === currentIdx;

                if (isCancelled && s.key === 'cancelled') {
                  return (
                    <div key={s.key} className="flex items-start gap-4 relative">
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 z-10">
                        <XCircle className="w-5 h-5 text-red-600" />
                      </div>
                      <div className="pt-1.5">
                        <p className="font-black text-red-600 text-sm">{s.label}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{order.cancelled_reason || 'Pesanan dibatalkan'}</p>
                      </div>
                    </div>
                  );
                }

                if (isCancelled) return null;

                return (
                  <div key={s.key} className="flex items-start gap-4 relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-all ${
                      isPast ? 'bg-primary text-white' : isCurrent ? 'bg-primary/10 text-primary ring-2 ring-primary/30' : 'bg-slate-50 text-slate-300'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="pt-1.5">
                      <p className={`font-black text-sm ${isPast || isCurrent ? 'text-slate-800' : 'text-slate-300'}`}>{s.label}</p>
                      {isCurrent && order.updated_at && (
                        <p className="text-xs text-slate-400 mt-0.5">
                          {new Date(order.updated_at).toLocaleString('id-ID')}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Informasi Pesanan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No. Pesanan</p>
                <p className="font-bold text-slate-800 mt-1">#{order.order_number || '-'}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tanggal</p>
                <p className="font-bold text-slate-800 mt-1">
                  {order.created_at ? new Date(order.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-'}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pelanggan</p>
                <p className="font-bold text-slate-800 mt-1">{order.entity_name || order.customer_name || '-'}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tipe</p>
                <p className="font-bold text-slate-800 mt-1">{order.type === 'PO' ? 'Purchase Order' : 'Sales Order'}</p>
              </div>
            </div>

            {order.notes && (
              <div className="pt-4 border-t border-slate-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Catatan</p>
                <p className="text-sm text-slate-600">{order.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Divisi Terkait
            </CardTitle>
          </CardHeader>
          <CardContent>
            {order.division_notes && order.division_notes.length > 0 ? (
              <div className="space-y-3">
                {order.division_notes.map((dn: any, i: number) => (
                  <div key={i} className="bg-slate-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-bold text-sm text-slate-700">{dn.division_name || dn.division}</p>
                      {dn.status && (
                        <Badge variant="outline" className="text-[9px]">{dn.status}</Badge>
                      )}
                    </div>
                    {dn.notes && <p className="text-sm text-slate-500">{dn.notes}</p>}
                    {dn.assigned_to && (
                      <p className="text-[10px] text-slate-400 mt-2 font-medium">Ditugaskan ke: {dn.assigned_to}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <Building2 className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-xs font-bold">Belum ada catatan divisi.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {order.transaction && (
        <Card className="border-none shadow-sm bg-blue-50/50 rounded-[1.5rem]">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase tracking-widest text-blue-600 flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Transaksi Terkait
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Total</p>
                <p className="font-black text-blue-800 mt-1">
                  Rp {(order.transaction.total_amount || order.transaction.total || 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Metode</p>
                <p className="font-bold text-blue-700 mt-1">{order.transaction.payment_method || '-'}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Status</p>
                <p className="font-bold text-blue-700 mt-1">{order.transaction.status || '-'}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Tanggal</p>
                <p className="font-bold text-blue-700 mt-1">
                  {order.transaction.date ? new Date(order.transaction.date).toLocaleDateString('id-ID') : '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {order.items && order.items.length > 0 && (
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Item Pesanan
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="border-none">
                  <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[10px] pl-6">Item</TableHead>
                  <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[10px] text-right">Qty</TableHead>
                  <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[10px] text-right">Harga</TableHead>
                  <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[10px] text-right pr-6">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item: any, i: number) => (
                  <TableRow key={item.id || i} className="border-slate-50">
                    <TableCell className="pl-6">
                      <div>
                        <p className="font-bold text-slate-700 text-sm">{item.name || item.product_name}</p>
                        {item.variant && <p className="text-[10px] text-slate-400">{item.variant}</p>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold text-slate-600">{item.quantity}</TableCell>
                    <TableCell className="text-right font-bold text-slate-600">Rp {(item.price || 0).toLocaleString()}</TableCell>
                    <TableCell className="text-right pr-6 font-black text-slate-700">
                      Rp {(item.subtotal || item.total || 0).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
