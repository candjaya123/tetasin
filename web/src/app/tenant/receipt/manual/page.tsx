"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { receiptService } from "@/lib/api/receiptService";
import { journalService } from "@/lib/api/journalService";
import { useToast } from "@/hooks/use-toast";

export default function ManualDraft() {
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    merchant_name: "",
    transaction_date: new Date().toISOString().slice(0, 10),
    total_amount: "",
    category: "",
    notes: "",
    debit_account_id: "",
    credit_account_id: "",
  });
  
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const data = await journalService.getCOA();
      setAccounts(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await receiptService.createManualDraft({
        ...formData,
        total_amount: Number(formData.total_amount),
      });
      toast({
        title: "Berhasil",
        description: "Draft transaksi manual berhasil dibuat.",
      });
      router.push("/tenant/receipt");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Gagal membuat draft.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/tenant/receipt">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Entri Transaksi Manual</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Detail Transaksi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="merchant_name">Nama Merchant / Vendor</Label>
                <Input
                  id="merchant_name"
                  name="merchant_name"
                  value={formData.merchant_name}
                  onChange={handleChange}
                  placeholder="Contoh: Indomaret, PLN, dll"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="transaction_date">Tanggal</Label>
                <Input
                  id="transaction_date"
                  name="transaction_date"
                  type="date"
                  value={formData.transaction_date}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="total_amount">Total Nominal (Rp)</Label>
                <Input
                  id="total_amount"
                  name="total_amount"
                  type="number"
                  value={formData.total_amount}
                  onChange={handleChange}
                  placeholder="0"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Kategori Pengeluaran</Label>
                <Select onValueChange={(v) => handleSelectChange("category", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Operasional">Operasional</SelectItem>
                    <SelectItem value="Gaji">Gaji & Upah</SelectItem>
                    <SelectItem value="Peralatan">Peralatan</SelectItem>
                    <SelectItem value="Pemasaran">Pemasaran</SelectItem>
                    <SelectItem value="Lainnya">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="debit_account_id">Akun Debit (Beban)</Label>
                <Select onValueChange={(v) => handleSelectChange("debit_account_id", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih akun" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.filter(a => ['expense', 'beban', 'hpp', 'cost of sales'].includes(a.type.toLowerCase())).map(acc => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.code} - {acc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="credit_account_id">Akun Kredit (Sumber Dana)</Label>
                <Select onValueChange={(v) => handleSelectChange("credit_account_id", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih akun" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.filter(a => ['asset', 'aset'].includes(a.type.toLowerCase())).map(acc => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.code} - {acc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Catatan (Opsional)</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Tambahkan keterangan tambahan..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/tenant/receipt">Batal</Link>
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Simpan Draft
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
