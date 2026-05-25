'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { personalFinanceService } from '@/lib/api/personalFinanceService';
import { apiGet } from '@/lib/api/client';
import { TransferForm } from '@/components/personal/TransferForm';
import { ArrowRightLeft, Loader2, ArrowRight } from "lucide-react";
import type { ChartOfAccount } from '@/types';

interface TransferItem {
  id: string;
  amount: number;
  from_account: string;
  to_account: string;
  from_name: string;
  to_name: string;
  notes?: string;
  created_at: string;
}

export default function PersonalTransferPage() {
  const { toast } = useToast();
  const [transfers, setTransfers] = useState<TransferItem[]>([]);
  const [asetAccounts, setAsetAccounts] = useState<ChartOfAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [coaData, transferData] = await Promise.all([
        apiGet<ChartOfAccount[]>('/api/v1/accounting/coa'),
        apiGet<TransferItem[]>('/api/v1/personal/transfers').catch(() => []),
      ]);
      setAsetAccounts((coaData as ChartOfAccount[]).filter((a: ChartOfAccount) => a.normal_balance === 'debit'));
      setTransfers(Array.isArray(transferData) ? transferData : []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan';
      toast({ title: 'Gagal memuat data', description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async (data: {
    sourceAccountId: string;
    destinationAccountId: string;
    amount: number;
    date: string;
    description: string;
  }) => {
    try {
      await personalFinanceService.transfer({
        amount: data.amount,
        from_account_id: data.sourceAccountId,
        to_account_id: data.destinationAccountId,
        notes: data.description,
      });
      toast({ title: 'Transfer berhasil' });
      setShowForm(false);
      loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan';
      toast({ title: 'Transfer gagal', description: message, variant: 'destructive' });
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  const getAccountName = (accountId: string) => {
    const acc = asetAccounts.find(a => a.id === accountId);
    return acc ? `${acc.name} (${acc.code})` : accountId;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-secondary tracking-tight">Transfer Antar Akun</h1>
        <Button onClick={() => setShowForm(true)} className="rounded-xl" disabled={asetAccounts.length === 0}>
          <ArrowRightLeft className="h-4 w-4 mr-2" /> Transfer Baru
        </Button>
      </div>

      <TransferForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleTransfer}
        asetAccounts={asetAccounts.map(a => ({
          id: a.id,
          code: a.code,
          name: a.name,
          type: a.type,
        }))}
      />

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8 text-blue-500" /></div>
      ) : transfers.length === 0 ? (
        <Card className="border-none shadow-md rounded-2xl">
          <CardContent className="p-12 text-center text-gray-400">
            <ArrowRightLeft className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Belum ada transfer</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {transfers.map((t) => (
            <Card key={t.id} className="border-none shadow-md rounded-2xl">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <ArrowRightLeft className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-800">
                      {t.from_name || getAccountName(t.from_account)}{' '}
                      <ArrowRight className="h-3 w-3 inline text-slate-400" />{' '}
                      {t.to_name || getAccountName(t.to_account)}
                    </p>
                    {t.notes && <p className="text-xs text-slate-400">{t.notes}</p>}
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(t.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <p className="text-lg font-bold text-slate-800">{formatCurrency(t.amount)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
