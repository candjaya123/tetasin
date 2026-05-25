'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { billTrackerService } from '@/lib/api/billTrackerService';
import { apiGet } from '@/lib/api/client';
import { Loader2, ArrowLeft, CheckCircle2, XCircle, History } from "lucide-react";
import type { Bill, ChartOfAccount } from '@/types';
import { useParams, useRouter } from 'next/navigation';

export default function BillDetailPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const [bill, setBill] = useState<Bill | null>(null);
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [payAmount, setPayAmount] = useState('');
  const [payAccountId, setPayAccountId] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (params?.id) loadData();
  }, [params?.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [billData, coaData] = await Promise.all([
        billTrackerService.getBillDetail(params!.id as string),
        apiGet<ChartOfAccount[]>('/api/v1/accounting/coa'),
      ]);
      setBill(billData as any);
      setAccounts((coaData as any));
    } catch (err: any) {
      toast({ title: 'Gagal memuat data', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    if (!payAmount) return;
    setSaving(true);
    try {
      await billTrackerService.payBill(params!.id as string, {
        amount: Number(payAmount),
        payment_account_id: payAccountId || undefined,
        notes: payNotes || undefined,
      });
      toast({ title: 'Pembayaran berhasil' });
      setPayAmount('');
      setPayNotes('');
      loadData();
    } catch (err: any) {
      toast({ title: 'Gagal', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    try {
      await billTrackerService.cancelBill(params!.id as string);
      toast({ title: 'Tagihan dibatalkan' });
      loadData();
    } catch (err: any) {
      toast({ title: 'Gagal', description: err.message, variant: 'destructive' });
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin h-8 w-8 text-blue-500" /></div>;
  }

  if (!bill) {
    return <div className="text-center py-20 text-gray-400">Tagihan tidak ditemukan</div>;
  }

  const remaining = bill.amount - bill.amount_paid;
  const canPay = bill.status !== 'paid' && bill.status !== 'cancelled';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
      <Button variant="ghost" onClick={() => router.push('/tenant/bills')} className="mb-2">
        <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
      </Button>

      <Card className="border-none shadow-lg rounded-3xl">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{bill.title}</CardTitle>
              <p className="text-sm text-gray-400 mt-1">{bill.bill_type === 'hutang' ? 'Hutang' : 'Piutang'}</p>
            </div>
            <span className={`text-sm px-3 py-1 rounded-full ${
              bill.status === 'paid' ? 'bg-green-100 text-green-700' :
              bill.status === 'overdue' ? 'bg-red-100 text-red-700' :
              bill.status === 'cancelled' ? 'bg-gray-100 text-gray-500' :
              bill.status === 'partial' ? 'bg-blue-100 text-blue-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>{bill.status}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400">Total</p>
              <p className="text-3xl font-bold">{formatCurrency(bill.amount)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Telah Dibayar</p>
              <p className="text-3xl font-bold text-green-600">{formatCurrency(bill.amount_paid)}</p>
            </div>
          </div>

          {bill.status !== 'paid' && bill.status !== 'cancelled' && (
            <div className="bg-yellow-50 p-4 rounded-xl">
              <p className="text-sm text-yellow-700">Sisa pembayaran: <strong>{formatCurrency(remaining)}</strong></p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-gray-400">Jatuh tempo:</span> <span className="font-medium">{new Date(bill.due_date).toLocaleDateString('id-ID')}</span></div>
            <div><span className="text-gray-400">Kontak:</span> <span className="font-medium">{bill.contact_name || '—'}</span></div>
          </div>

          {bill.description && <p className="text-sm text-gray-500">{bill.description}</p>}
        </CardContent>
      </Card>

      {canPay && (
        <Card className="border-none shadow-md rounded-2xl">
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-600" /> Bayar Tagihan</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Jumlah Pembayaran</Label>
              <Input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)} placeholder="Rp" max={remaining} />
            </div>
            <div className="space-y-2">
              <Label>Akun Pembayaran</Label>
              <select className="w-full rounded-xl border p-2" value={payAccountId} onChange={e => setPayAccountId(e.target.value)}>
                <option value="">Pilih akun</option>
                {accounts.filter(a => a.normal_balance === 'debit').map(a => (
                  <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Catatan (opsional)</Label>
              <Input value={payNotes} onChange={e => setPayNotes(e.target.value)} placeholder="Pembayaran via transfer" />
            </div>
            <div className="flex gap-2">
              <Button onClick={handlePay} disabled={saving || !payAmount} className="flex-1">
                {saving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                Bayar {payAmount ? formatCurrency(Number(payAmount)) : ''}
              </Button>
              <Button variant="outline" onClick={handleCancel}><XCircle className="h-4 w-4 mr-1" /> Batalkan</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {bill.payments && bill.payments.length > 0 && (
        <Card className="border-none shadow-md rounded-2xl">
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><History className="h-5 w-5" /> Riwayat Pembayaran</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {bill.payments.map(p => (
              <div key={p.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-green-600">+ {formatCurrency(p.amount)}</p>
                  <p className="text-xs text-gray-400">{new Date(p.payment_date).toLocaleDateString('id-ID')}</p>
                </div>
                {p.notes && <p className="text-sm text-gray-500">{p.notes}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
