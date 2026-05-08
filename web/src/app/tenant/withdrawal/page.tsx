"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Wallet, 
  ArrowUpRight, 
  History, 
  Clock, 
  CheckCircle2, 
  XCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { createClient } from '@/lib/supabase/client';

export default function WithdrawalPage() {
  const [amount, setAmount] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [balance, setBalance] = useState<number>(0);
  const [totalWithdrawn, setTotalWithdrawn] = useState<number>(0);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
        const headers = {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        };

        const res = await fetch(`${BACKEND_URL}/api/v1/payouts`, { headers });
        if (res.ok) {
          const payouts = await res.json();
          setHistory(payouts || []);

          // Hitung total yang sudah ditarik (status success/completed)
          const withdrawn = (payouts || [])
            .filter((p: any) => p.status === 'success' || p.status === 'completed')
            .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
          setTotalWithdrawn(withdrawn);
        }

        // Fetch current balance (saldo bersih dari income statement)
        const now = new Date();
        const startOf = new Date(now.getFullYear(), now.getMonth() - 11, 1);
        const incomeRes = await fetch(
          `${BACKEND_URL}/api/v1/reports/income-statement?startDate=${startOf.toISOString()}&endDate=${now.toISOString()}`,
          { headers }
        );
        if (incomeRes.ok) {
          const income = await incomeRes.json();
          setBalance(Math.max(0, income.net_profit || 0));
        }
      } catch (err) {
        console.error('Error fetching withdrawal data:', err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Sesi tidak ditemukan');

      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
      const [bankName, ...accountParts] = bankAccount.split('-').map(s => s.trim());

      const res = await fetch(`${BACKEND_URL}/api/v1/payouts/execute`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Number(amount),
          bank_name: bankName || bankAccount,
          bank_account: accountParts.join('-') || bankAccount,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Gagal membuat permintaan penarikan');
      }

      setSuccess(true);
      setAmount('');
      // Refresh history
      const payoutsRes = await fetch(`${BACKEND_URL}/api/v1/payouts`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        }
      });
      if (payoutsRes.ok) {
        const updatedPayouts = await payoutsRes.json();
        setHistory(updatedPayouts || []);
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'success':
      case 'completed':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3" /> Berhasil</span>;
      case 'processing':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"><Clock className="w-3 h-3" /> Diproses</span>;
      case 'pending':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800"><Clock className="w-3 h-3" /> Pending</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3" /> Ditolak</span>;
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Penarikan Dana</h1>
        <p className="text-slate-500">Tarik penghasilan Anda langsung ke rekening bank terdaftar.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Balance & Form Card */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm bg-gradient-to-br from-primary to-teal-700 text-primary-foreground overflow-hidden relative">
            <div className="absolute right-0 bottom-0 opacity-10">
              <Wallet className="w-48 h-48 -mr-12 -mb-12" />
            </div>
            <CardContent className="pt-8">
              <p className="text-white/60 text-sm font-medium mb-2">Saldo Bersih Tersedia</p>
              {loadingData ? (
                <div className="flex items-center gap-2 mb-6">
                  <Loader2 className="w-5 h-5 animate-spin text-white/60" />
                  <span className="text-white/60 text-sm">Memuat saldo...</span>
                </div>
              ) : (
                <h2 className="text-4xl font-bold mb-6">{formatCurrency(balance)}</h2>
              )}
              <div className="flex gap-4">
                <div className="flex-1 p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                  <p className="text-white/50 text-xs mb-1">Total Ditarik</p>
                  <p className="font-bold">{loadingData ? '...' : formatCurrency(totalWithdrawn)}</p>
                </div>
                <div className="flex-1 p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                  <p className="text-white/50 text-xs mb-1">Total Pengajuan</p>
                  <p className="font-bold">{loadingData ? '...' : `${history.length} kali`}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Buat Permintaan Penarikan</CardTitle>
              <CardDescription>Dana akan diproses dalam waktu maksimal 1x24 jam kerja.</CardDescription>
            </CardHeader>
            <CardContent>
              {success && (
                <div className="mb-6 bg-primary/10 border border-primary/30 text-primary/90 p-4 rounded-xl flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 mt-0.5" />
                  <div>
                    <p className="font-bold">Permintaan Berhasil Dikirim!</p>
                    <p className="text-sm">Silakan tunggu konfirmasi admin dan pengecekan oleh sistem Midtrans.</p>
                  </div>
                  <button onClick={() => setSuccess(false)} className="ml-auto text-primary/50 hover:text-primary">
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              )}

              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-bold">Gagal</p>
                    <p className="text-sm">{error}</p>
                  </div>
                  <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Jumlah Penarikan (Rp)</Label>
                    <Input 
                      id="amount" 
                      type="number" 
                      placeholder="Contoh: 1000000" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                      min={50000}
                    />
                    <p className="text-[10px] text-slate-400">Minimal penarikan Rp 50.000</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bank">Rekening Tujuan</Label>
                    <Input 
                      id="bank" 
                      placeholder="Contoh: BCA - 1234567890" 
                      value={bankAccount}
                      onChange={(e) => setBankAccount(e.target.value)}
                      required
                    />
                    <p className="text-[10px] text-slate-400">Format: Nama Bank - Nomor Rekening</p>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3 text-amber-800 text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p>Pastikan data rekening sudah benar. Kesalahan input rekening dapat menyebabkan dana tidak terkirim atau tertunda.</p>
                </div>

                <Button className="w-full bg-primary hover:bg-primary/90 h-12 text-lg" disabled={submitting || !amount || !bankAccount}>
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <ArrowUpRight className="w-5 h-5 mr-2" />}
                  Tarik Dana Sekarang
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                Riwayat Terbaru
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingData ? (
                <div className="flex items-center justify-center py-8 gap-2 text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Memuat riwayat...</span>
                </div>
              ) : history.length === 0 ? (
                <p className="text-center text-sm text-slate-400 py-8 italic">Belum ada riwayat penarikan</p>
              ) : (
                <div className="space-y-4">
                  {history.slice(0, 5).map((item) => (
                    <div key={item.id} className="p-4 rounded-xl border border-slate-100 space-y-2 hover:bg-background transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-foreground">{formatCurrency(item.amount)}</p>
                          <p className="text-[10px] text-slate-400">
                            {item.id?.slice(0, 8).toUpperCase()} • {new Date(item.created_at).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                        {getStatusBadge(item.status)}
                      </div>
                      {(item.bank_name || item.bank_account) && (
                        <p className="text-xs text-slate-500 truncate">
                          {item.bank_name}{item.bank_name && item.bank_account ? ' - ' : ''}{item.bank_account}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-sm bg-secondary text-primary-foreground">
            <CardContent className="pt-6">
              <h3 className="font-bold mb-2">Butuh Bantuan?</h3>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Jika Anda mengalami masalah dengan penarikan dana, silakan hubungi tim support kami melalui tombol di bawah.
              </p>
              <Button variant="outline" className="w-full border-slate-700 hover:bg-slate-800 text-primary-foreground">
                Hubungi Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
