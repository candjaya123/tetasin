'use client';

import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Loader2,
  Receipt,
  Wallet,
  FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createClient } from '@/lib/supabase/client';
import { journalService } from '@/lib/api/journalService';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddExpenseModal({ isOpen, onClose, onSuccess }: AddExpenseModalProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [expenseAccountId, setExpenseAccountId] = useState('');
  const [paymentAccountId, setPaymentAccountId] = useState('');
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    if (isOpen) {
      fetchAccounts();
    }
  }, [isOpen]);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('chart_of_accounts')
        .select('*')
        .order('code', { ascending: true });
        
      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !expenseAccountId || !paymentAccountId) {
      toast({
        title: "Gagal",
        description: "Lengkapi semua data yang diperlukan",
        variant: "destructive"
      });
      return;
    }

    const numAmount = parseFloat(amount);
    if (numAmount <= 0) {
      toast({
        title: "Gagal",
        description: "Nominal harus lebih dari 0",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];

      const payload = {
        reference_number: `EXP-${now.getTime()}`,
        description: description || 'Pengeluaran Manual',
        date: dateStr,
        lines: [
          {
            account_id: expenseAccountId,
            debit: numAmount,
            credit: 0,
          },
          {
            account_id: paymentAccountId,
            debit: 0,
            credit: numAmount,
          },
        ],
      };

      await journalService.createExpense(payload);

      toast({
        title: "Berhasil",
        description: "Pengeluaran berhasil dicatat",
      });
      
      onSuccess();
      handleClose();
    } catch (error: any) {
      toast({
        title: "Gagal",
        description: error.message || "Terjadi kesalahan saat mencatat pengeluaran",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setAmount('');
    setDescription('');
    setExpenseAccountId('');
    setPaymentAccountId('');
    onClose();
  };

  // Filter accounts
  const expenseAccounts = accounts.filter(a => a.type.toLowerCase() === 'expense' || a.type.toLowerCase() === 'beban' || a.code.startsWith('6-') || a.code.startsWith('5-'));
  const paymentAccounts = accounts.filter(a => (a.type.toLowerCase() === 'asset' || a.type.toLowerCase() === 'aset') && (a.code.startsWith('1-10') || a.code.startsWith('1-11')));

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-white border-none shadow-2xl rounded-3xl overflow-hidden">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="p-6 bg-slate-50/50">
            <DialogTitle className="text-2xl font-black text-slate-800 flex items-center gap-2">
              <Receipt className="w-6 h-6 text-primary" />
              Catat Pengeluaran
            </DialogTitle>
            <DialogDescription className="font-medium text-slate-500">
              Catat pengeluaran operasional atau biaya bisnis lainnya.
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 space-y-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-xs font-black uppercase tracking-widest text-slate-400">Nominal (Rp)</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                    <span className="text-sm font-black text-slate-400">Rp</span>
                  </div>
                  <Input 
                    id="amount" 
                    type="number" 
                    placeholder="0" 
                    className="pl-10 h-12 bg-slate-50 border-none rounded-xl focus-visible:ring-primary font-bold text-lg"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expenseAccount" className="text-xs font-black uppercase tracking-widest text-slate-400">Kategori Pengeluaran</Label>
                <select 
                  id="expenseAccount"
                  className="w-full h-12 bg-slate-50 border-none rounded-xl text-sm font-bold px-3 focus:ring-2 focus:ring-primary outline-none"
                  value={expenseAccountId}
                  onChange={(e) => setExpenseAccountId(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Pilih Kategori...</option>
                  {expenseAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>{acc.name} ({acc.code})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentAccount" className="text-xs font-black uppercase tracking-widest text-slate-400">Sumber Dana</Label>
                <select 
                  id="paymentAccount"
                  className="w-full h-12 bg-slate-50 border-none rounded-xl text-sm font-bold px-3 focus:ring-2 focus:ring-primary outline-none"
                  value={paymentAccountId}
                  onChange={(e) => setPaymentAccountId(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Pilih Akun Pembayaran...</option>
                  {paymentAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>{acc.name} ({acc.code})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-xs font-black uppercase tracking-widest text-slate-400">Keterangan</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-300" />
                  <textarea 
                    id="description" 
                    placeholder="Contoh: Bayar listrik bulanan..." 
                    className="w-full pl-10 pt-3 h-20 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary font-medium text-sm resize-none outline-none"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>

            </div>
          </div>

          <DialogFooter className="p-6 bg-slate-50/50">
            <Button 
              type="button" 
              variant="ghost" 
              className="font-bold text-slate-500 rounded-xl"
              onClick={handleClose}
            >
              Batal
            </Button>
            <Button 
              type="submit" 
              className="bg-black hover:bg-slate-800 text-primary font-bold px-8 rounded-xl shadow-lg transition-transform active:scale-95"
              disabled={isSubmitting || loading}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  Simpan Pengeluaran
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
