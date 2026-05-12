"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Camera, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { receiptService } from "@/lib/api/receiptService";
import { useToast } from "@/hooks/use-toast";

export default function ReceiptDashboard() {
  const [drafts, setDrafts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDrafts();
  }, []);

  const fetchDrafts = async () => {
    try {
      const data = await receiptService.getDrafts();
      setDrafts(data);
    } catch (err) {
      console.error("Failed to fetch drafts", err);
      toast({
        title: "Error",
        description: "Gagal memuat daftar draft struk.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ready":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-700">Perlu Review</Badge>;
      case "approved":
        return <Badge variant="secondary" className="bg-green-100 text-green-700">Disetujui</Badge>;
      case "rejected":
        return <Badge variant="destructive">Ditolak</Badge>;
      case "processing":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">Memproses...</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Receipt Center</h1>
          <p className="text-muted-foreground text-sm">Kelola struk dan pengeluaran dengan bantuan AI Gemini.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button asChild variant="outline" className="flex-1 md:flex-none">
            <Link href="/tenant/receipt/manual">
              <Plus className="mr-2 h-4 w-4" /> Entri Manual
            </Link>
          </Button>
          <Button asChild className="flex-1 md:flex-none">
            <Link href="/tenant/receipt/scan">
              <Camera className="mr-2 h-4 w-4" /> Scan Struk
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">Draft Perlu Review</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{drafts.filter(d => d.status === 'ready').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Berhasil Disetujui</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{drafts.filter(d => d.status === 'approved').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status AI</CardTitle>
            <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600">Gemini 2.0 Flash</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">High precision extraction ready</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Draft Transaksi</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Merchant</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">Memuat draft...</TableCell>
                </TableRow>
              ) : drafts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">Belum ada struk yang diunggah.</TableCell>
                </TableRow>
              ) : drafts.map((draft) => (
                <TableRow key={draft.id}>
                  <TableCell>{draft.transaction_date ? format(new Date(draft.transaction_date), 'dd MMM yyyy', { locale: id }) : '-'}</TableCell>
                  <TableCell className="font-medium">{draft.merchant_name || 'Tidak Terdeteksi'}</TableCell>
                  <TableCell>{draft.category || '-'}</TableCell>
                  <TableCell className="text-right">Rp {Number(draft.total_amount).toLocaleString()}</TableCell>
                  <TableCell>{getStatusBadge(draft.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="sm" variant={draft.status === 'ready' ? 'default' : 'outline'}>
                      <Link href={`/tenant/receipt/${draft.id}`}>
                        {draft.status === 'ready' ? 'Review' : 'Detail'}
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
