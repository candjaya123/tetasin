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
  History,
  Calendar,
  Wallet,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  ShoppingCart,
  FileText,
} from "lucide-react";
import { apiGet } from '@/lib/api/client';

export default function TransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [transaction, setTransaction] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  useEffect(() => {
    if (id) fetchTransaction();
  }, [id]);

  const fetchTransaction = async () => {
    setLoading(true);
    try {
      const data = await apiGet(`/api/v1/transactions/${id}`);
      setTransaction(data);
    } catch (err) {
      console.error('Failed to fetch transaction', err);
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

  if (!transaction) {
    return (
      <div className="text-center py-20 text-slate-400">
        <History className="w-16 h-16 mx-auto mb-4 opacity-20" />
        <p className="font-bold text-lg">Transaksi tidak ditemukan</p>
        <Button variant="link" onClick={() => router.push('/tenant/transactions')} className="mt-2">
          Kembali ke riwayat transaksi
        </Button>
      </div>
    );
  }

  const totalDebit = transaction.journal_lines?.reduce((sum: number, l: any) => sum + (l.debit || 0), 0) || 0;
  const totalKredit = transaction.journal_lines?.reduce((sum: number, l: any) => sum + (l.credit || 0), 0) || 0;
  const isIncome = transaction.journal_lines?.some(
    (l: any) => l.chart_of_accounts && ['income', 'pendapatan', 'revenue'].includes(l.chart_of_accounts.type?.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
              {transaction.description || 'Detail Transaksi'}
            </h1>
            <Badge variant={isIncome ? 'default' : 'destructive'}>
              {isIncome ? 'Pemasukan' : 'Pengeluaran'}
            </Badge>
          </div>
          <p className="text-sm text-slate-500 font-medium flex items-center gap-2 mt-1">
            <Calendar className="w-3.5 h-3.5" />
            {transaction.date ? new Date(transaction.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-'}
            {transaction.reference_doc && (
              <>
                <span className="text-slate-300">|</span>
                <FileText className="w-3.5 h-3.5" />
                {transaction.reference_doc}
              </>
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={`border-none shadow-sm rounded-[1.5rem] ${isIncome ? 'bg-green-50' : 'bg-red-50'}`}>
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-1">
              {isIncome ? (
                <ArrowUpRight className="w-4 h-4 text-green-600" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-600" />
              )}
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total</p>
            </div>
            <p className={`text-2xl font-black ${isIncome ? 'text-green-700' : 'text-red-700'}`}>
              {formatCurrency(transaction.total_amount || 0)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-slate-50 rounded-[1.5rem]">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <CreditCard className="w-4 h-4" />
              <p className="text-[10px] font-black uppercase tracking-widest">Pembayaran</p>
            </div>
            <p className="text-lg font-black text-slate-700">{transaction.payment_method || 'N/A'}</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-slate-50 rounded-[1.5rem]">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Wallet className="w-4 h-4" />
              <p className="text-[10px] font-black uppercase tracking-widest">Sumber</p>
            </div>
            <p className="text-lg font-black text-slate-700">{transaction.source_type || transaction.type || 'N/A'}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="border-b border-slate-50">
          <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            Jurnal Akuntansi
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-none">
                <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[10px] pl-6">Akun</TableHead>
                <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Kode</TableHead>
                <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[10px] text-right">Debit</TableHead>
                <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[10px] text-right pr-6">Kredit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transaction.journal_lines && transaction.journal_lines.length > 0 ? (
                transaction.journal_lines.map((line: any) => (
                  <TableRow key={line.id} className="border-slate-50 hover:bg-slate-50/50">
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                          <Wallet className="w-4 h-4 text-slate-400" />
                        </div>
                        <span className="font-bold text-slate-700 text-sm">
                          {line.chart_of_accounts?.name || line.account_name || '-'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-[9px] bg-slate-100 px-2 py-1 rounded text-slate-500 font-mono">
                        {line.chart_of_accounts?.code || line.account_code || '-'}
                      </code>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-bold text-green-600">
                        {line.debit > 0 ? formatCurrency(line.debit) : '-'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <span className="font-bold text-red-600">
                        {line.credit > 0 ? formatCurrency(line.credit) : '-'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10 text-slate-400">
                    Tidak ada jurnal lines.
                  </TableCell>
                </TableRow>
              )}
              {(totalDebit > 0 || totalKredit > 0) && (
                <TableRow className="bg-slate-50 border-t-2 border-slate-200">
                  <TableCell className="pl-6 font-black text-slate-700">Total</TableCell>
                  <TableCell />
                  <TableCell className="text-right font-black text-green-700">{formatCurrency(totalDebit)}</TableCell>
                  <TableCell className="text-right pr-6 font-black text-red-700">{formatCurrency(totalKredit)}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {transaction.sale_items && transaction.sale_items.length > 0 && (
        <Card className="border-none shadow-sm">
          <CardHeader className="border-b border-slate-50">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Item Penjualan
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="border-none">
                  <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[10px] pl-6">Produk</TableHead>
                  <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[10px] text-right">Qty</TableHead>
                  <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[10px] text-right">Harga</TableHead>
                  <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[10px] text-right pr-6">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transaction.sale_items.map((item: any, i: number) => (
                  <TableRow key={item.id || i} className="border-slate-50 hover:bg-slate-50/50">
                    <TableCell className="pl-6">
                      <div>
                        <p className="font-bold text-slate-700 text-sm">{item.name || item.product_name}</p>
                        {item.variant && <p className="text-[10px] text-slate-400">{item.variant}</p>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold text-slate-600">{item.quantity}</TableCell>
                    <TableCell className="text-right font-bold text-slate-600">
                      Rp {(item.price || 0).toLocaleString()}
                    </TableCell>
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

      {transaction.notes && (
        <Card className="border-none shadow-sm bg-slate-50 rounded-[1.5rem]">
          <CardContent className="p-5 sm:p-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Catatan</p>
            <p className="text-sm text-slate-600">{transaction.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
