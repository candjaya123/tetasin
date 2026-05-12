"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, XCircle, Save, Loader2, AlertTriangle, Eye } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { receiptService } from "@/lib/api/receiptService";
import { journalService } from "@/lib/api/journalService";
import { useToast } from "@/hooks/use-toast";

export default function DraftReview() {
  const params = useParams();
  const draftId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [draft, setDraft] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (draftId) fetchData();
  }, [draftId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [draftData, accountsData] = await Promise.all([
        receiptService.getDraft(draftId),
        journalService.getCOA()
      ]);
      setDraft(draftData);
      setAccounts(accountsData);
      setFormData({
        merchant_name: draftData.merchant_name || "",
        transaction_date: draftData.transaction_date ? draftData.transaction_date.slice(0, 10) : "",
        total_amount: draftData.total_amount || 0,
        category: draftData.category || "",
        notes: draftData.notes || "",
        debit_account_id: draftData.debit_account_id || "",
        credit_account_id: draftData.credit_account_id || "",
      });
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Gagal memuat data draft.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await receiptService.updateDraft(draftId, {
        ...formData,
        total_amount: Number(formData.total_amount),
      });
      toast({ title: "Berhasil", description: "Draft berhasil diperbarui." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Gagal memperbarui draft.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async () => {
    if (!formData.debit_account_id || !formData.credit_account_id) {
      toast({ title: "Peringatan", description: "Mohon pilih akun debit dan kredit terlebih dahulu.", variant: "destructive" });
      return;
    }

    setApproving(true);
    try {
      // First save any changes
      await receiptService.updateDraft(draftId, {
        ...formData,
        total_amount: Number(formData.total_amount),
      });
      
      // Then approve
      await receiptService.approveDraft(draftId);
      
      toast({ title: "Berhasil", description: "Transaksi telah disetujui dan dicatat di buku besar." });
      router.push("/tenant/receipt");
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Gagal menyetujui draft.", variant: "destructive" });
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    const reason = window.prompt("Alasan penolakan:");
    if (reason === null) return;

    setRejecting(true);
    try {
      await receiptService.rejectDraft(draftId, reason);
      toast({ title: "Berhasil", description: "Draft telah ditolak." });
      router.push("/tenant/receipt");
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Gagal menolak draft.", variant: "destructive" });
    } finally {
      setRejecting(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Memuat data review...</div>;
  if (!draft) return <div className="p-10 text-center text-red-500 font-bold text-xl">Draft Tidak Ditemukan</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/tenant/receipt">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Review Draft Transaksi</h1>
          {draft.status === 'ready' && <Badge className="bg-blue-500 ml-2">Perlu Review</Badge>}
          {draft.status === 'approved' && <Badge className="bg-green-500 ml-2">Telah Disetujui</Badge>}
          {draft.status === 'rejected' && <Badge variant="destructive" className="ml-2">Ditolak</Badge>}
        </div>
        <div className="flex gap-2">
          {draft.status === 'ready' && (
            <>
              <Button variant="outline" onClick={handleReject} disabled={rejecting || approving}>
                {rejecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />} Tolak
              </Button>
              <Button variant="outline" onClick={handleUpdate} disabled={saving || approving || rejecting}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Simpan
              </Button>
              <Button onClick={handleApprove} disabled={approving || rejecting || saving}>
                {approving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />} Setujui & Catat
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Data Transaksi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="merchant_name">Nama Merchant / Vendor</Label>
              <Input
                id="merchant_name"
                name="merchant_name"
                value={formData.merchant_name}
                onChange={handleChange}
                disabled={draft.status !== 'ready'}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="transaction_date">Tanggal</Label>
                <Input
                  id="transaction_date"
                  name="transaction_date"
                  type="date"
                  value={formData.transaction_date}
                  onChange={handleChange}
                  disabled={draft.status !== 'ready'}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="total_amount">Total Nominal (Rp)</Label>
                <Input
                  id="total_amount"
                  name="total_amount"
                  type="number"
                  value={formData.total_amount}
                  onChange={handleChange}
                  disabled={draft.status !== 'ready'}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Kategori Pengeluaran</Label>
              <Select 
                value={formData.category} 
                onValueChange={(v) => handleSelectChange("category", v)}
                disabled={draft.status !== 'ready'}
              >
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

            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Pemetaan Akun (Accounting)</h3>
              <div className="space-y-2">
                <Label htmlFor="debit_account_id">Akun Debit (Beban)</Label>
                <Select 
                  value={formData.debit_account_id} 
                  onValueChange={(v) => handleSelectChange("debit_account_id", v)}
                  disabled={draft.status !== 'ready'}
                >
                  <SelectTrigger className={!formData.debit_account_id && draft.status === 'ready' ? "border-orange-300 bg-orange-50 text-orange-800" : ""}>
                    <SelectValue placeholder="Pilih akun beban" />
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
                <Select 
                  value={formData.credit_account_id} 
                  onValueChange={(v) => handleSelectChange("credit_account_id", v)}
                  disabled={draft.status !== 'ready'}
                >
                  <SelectTrigger className={!formData.credit_account_id && draft.status === 'ready' ? "border-orange-300 bg-orange-50 text-orange-800" : ""}>
                    <SelectValue placeholder="Pilih akun aset" />
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
              <Label htmlFor="notes">Catatan</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Keterangan tambahan..."
                disabled={draft.status !== 'ready'}
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2 uppercase tracking-widest text-muted-foreground">
                <Eye className="h-4 w-4" /> Bukti Struk
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-[3/4] overflow-hidden rounded-lg border bg-slate-100 flex items-center justify-center">
                 {draft.receipt_scan_id ? (
                   <img 
                    src={draft.receipt_scans?.image_url || "/api/placeholder/400/600"} 
                    alt="Receipt" 
                    className="object-contain w-full h-full" 
                   />
                 ) : (
                   <div className="text-muted-foreground flex flex-col items-center">
                     <AlertTriangle className="h-8 w-8 mb-2 opacity-20" />
                     <p className="text-xs">Tidak ada lampiran gambar (Entri Manual)</p>
                   </div>
                 )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-100">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-blue-800">
                <AlertTriangle className="h-4 w-4 text-blue-500" /> AI Insights & Confidence
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-4 text-blue-900">
              <div className="flex justify-between items-center">
                <span>AI Confidence:</span>
                <Badge variant="outline" className="border-blue-300 text-blue-700">
                  {Math.round((draft.ai_recommendations?.confidence_score || 0) * 100)}%
                </Badge>
              </div>
              
              {draft.ai_recommendations?.duplicate_warning?.is_duplicate && (
                <div className="bg-red-50 text-red-700 p-3 rounded-md border border-red-100 flex gap-2 animate-pulse">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  <p><b>Peringatan Duplikat:</b> Transaksi serupa ditemukan di buku besar.</p>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-[10px] text-blue-500 uppercase font-bold">Item Terdeteksi:</p>
                <div className="bg-white/50 rounded p-2 space-y-1">
                  {(draft.line_items || []).map((item: any, i: number) => (
                    <div key={i} className="flex justify-between text-xs">
                      <span>{item.name} x{item.quantity}</span>
                      <span className="font-medium">Rp {Number(item.total).toLocaleString()}</span>
                    </div>
                  ))}
                  {(!draft.line_items || draft.line_items.length === 0) && <p className="text-xs text-muted-foreground">Tidak ada item detail.</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
