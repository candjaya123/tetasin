'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { billTrackerService } from '@/lib/api/billTrackerService';
import { apiGet } from '@/lib/api/client';
import { Plus, Receipt, Loader2, AlertCircle, Search, Filter, Landmark } from "lucide-react";
import type { Bill, BillSummary, ChartOfAccount } from '@/types';
import { useRouter } from 'next/navigation';

export default function BillsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [bills, setBills] = useState<Bill[]>([]);
  const [summary, setSummary] = useState<BillSummary | null>(null);
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [billType, setBillType] = useState('hutang');
  const [dueDate, setDueDate] = useState('');
  const [contactName, setContactName] = useState('');
  const [coaAccountId, setCoaAccountId] = useState('');
  const [paymentAccountId, setPaymentAccountId] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [search, filterStatus, filterType]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filterStatus) params.status = filterStatus;
      if (filterType) params.bill_type = filterType;
      if (search) params.search = search;

      const [billsData, summaryData, coaData] = await Promise.all([
        billTrackerService.getBills(Object.keys(params).length > 0 ? params : undefined),
        billTrackerService.getSummary(),
        apiGet<ChartOfAccount[]>('/api/v1/accounting/coa'),
      ]);
      setBills(billsData as any);
      setSummary(summaryData as any);
      setAccounts((coaData as any));
    } catch (err: any) {
      toast({ title: 'Gagal memuat data', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!title || !amount || !dueDate) return;
    setSaving(true);
    try {
      await billTrackerService.createBill({
        title, amount: Number(amount), bill_type: billType, due_date: dueDate,
        contact_name: contactName || undefined, coa_account_id: coaAccountId || undefined,
        payment_account_id: paymentAccountId || undefined,
      });
      toast({ title: 'Tagihan berhasil dibuat' });
      setShowForm(false);
      setTitle('');
      setAmount('');
      setDueDate('');
      setContactName('');
      setCoaAccountId('');
      setPaymentAccountId('');
      loadData();
    } catch (err: any) {
      toast({ title: 'Gagal', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  const statusColor: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    partial: 'bg-blue-100 text-blue-700',
    paid: 'bg-green-100 text-green-700',
    overdue: 'bg-red-100 text-red-700',
    cancelled: 'bg-gray-100 text-gray-500',
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-secondary tracking-tight">Tagihan</h1>
        <Button onClick={() => setShowForm(!showForm)} className="rounded-xl">
          <Plus className="h-4 w-4 mr-2" /> Tagihan Baru
        </Button>
      </div>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-none shadow-md rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-1"><Landmark className="h-4 w-4" /><span className="text-sm">Hutang</span></div>
              <p className="text-2xl font-bold">{formatCurrency(summary.hutang.outstanding_amount)}</p>
              <p className="text-xs opacity-70">{summary.hutang.overdue_count} jatuh tempo dari {summary.hutang.total} tagihan</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md rounded-2xl bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-1"><Landmark className="h-4 w-4" /><span className="text-sm">Piutang</span></div>
              <p className="text-2xl font-bold">{formatCurrency(summary.piutang.outstanding_amount)}</p>
              <p className="text-xs opacity-70">{summary.piutang.overdue_count} jatuh tempo dari {summary.piutang.total} tagihan</p>
            </CardContent>
          </Card>
        </div>
      )}

      {showForm && (
        <Card className="border-none shadow-md rounded-2xl">
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Judul</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Tagihan PLN Mei" />
              </div>
              <div className="space-y-2">
                <Label>Jumlah</Label>
                <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Rp" />
              </div>
              <div className="space-y-2">
                <Label>Tipe</Label>
                <Select value={billType} onValueChange={(v) => setBillType(v || '')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hutang">Hutang (saya bayar)</SelectItem>
                    <SelectItem value="piutang">Piutang (saya terima)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Jatuh Tempo</Label>
                <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Kontak (opsional)</Label>
                <Input value={contactName} onChange={e => setContactName(e.target.value)} placeholder="Nama vendor/debitur" />
              </div>
              <div className="space-y-2">
                <Label>Akun COA (opsional)</Label>
                <Select value={coaAccountId} onValueChange={(v) => setCoaAccountId(v || '')}>
                  <SelectTrigger><SelectValue placeholder="Pilih akun" /></SelectTrigger>
                  <SelectContent>
                    {accounts.map(a => (
                      <SelectItem key={a.id} value={a.id}>{a.code} - {a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Akun Pembayaran (opsional)</Label>
                <Select value={paymentAccountId} onValueChange={(v) => setPaymentAccountId(v || '')}>
                  <SelectTrigger><SelectValue placeholder="Pilih akun" /></SelectTrigger>
                  <SelectContent>
                    {accounts.map(a => (
                      <SelectItem key={a.id} value={a.id}>{a.code} - {a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={handleCreate} disabled={saving || !title || !amount || !dueDate} className="w-full">
                  {saving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null} Buat Tagihan
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input className="pl-9" placeholder="Cari tagihan..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v || '')}>
          <SelectTrigger className="w-[140px]"><Filter className="h-4 w-4 mr-2" /> Status</SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="paid">Lunas</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={(v) => setFilterType(v || '')}>
          <SelectTrigger className="w-[140px]"><Filter className="h-4 w-4 mr-2" /> Tipe</SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            <SelectItem value="hutang">Hutang</SelectItem>
            <SelectItem value="piutang">Piutang</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8 text-blue-500" /></div>
      ) : bills.length === 0 ? (
        <Card className="border-none shadow-md rounded-2xl">
          <CardContent className="p-12 text-center text-gray-400">
            <Receipt className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Belum ada tagihan.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bills.map(bill => {
            const remaining = bill.amount - bill.amount_paid;
            const isOverdue = bill.status === 'overdue';
            return (
              <Card
                key={bill.id}
                className={`border-none shadow-md rounded-2xl cursor-pointer hover:shadow-lg transition-shadow ${isOverdue ? 'ring-2 ring-red-300' : ''}`}
                onClick={() => router.push(`/tenant/bills/${bill.id}`)}
              >
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">{bill.title}</p>
                      <p className="text-xs text-gray-400">{bill.contact_name || '—'}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[bill.status] || ''}`}>
                      {bill.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-end mt-3">
                    <div>
                      <p className="text-sm text-gray-500">{bill.bill_type === 'hutang' ? 'Hutang' : 'Piutang'} · Jatuh tempo {new Date(bill.due_date).toLocaleDateString('id-ID')}</p>
                      {bill.status !== 'paid' && bill.status !== 'cancelled' && (
                        <p className="text-xs text-gray-400">Sisa: {formatCurrency(remaining)}</p>
                      )}
                    </div>
                    <p className="text-xl font-bold">{formatCurrency(bill.amount)}</p>
                  </div>
                  {isOverdue && (
                    <div className="flex items-center gap-2 mt-2 text-red-600 text-xs">
                      <AlertCircle className="h-3 w-3" /> Terlambat!
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
