"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useDrafts } from "@/hooks/use-receipt";

export default function ReceiptDashboard() {
  const { drafts, loading, error } = useDrafts();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ready":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-700">Perlu Review</Badge>;
      case "approved":
        return <Badge variant="secondary" className="bg-green-100 text-green-700">Disetujui</Badge>;
      case "rejected":
        return <Badge variant="destructive">Ditolak</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Receipt Center</h1>
          <p className="text-muted-foreground text-sm">Kelola pengeluaran dan catat transaksi secara manual.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Link
            href="/tenant/receipt/manual"
            className={cn(
              buttonVariants(),
              "flex-1 md:flex-none flex items-center justify-center gap-2"
            )}
          >
            <Plus className="h-4 w-4" /> Entri Manual
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">Draft Perlu Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{drafts.filter(d => d.status === 'ready').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Berhasil Disetujui</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{drafts.filter(d => d.status === 'approved').length}</div>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">Memuat draft...</TableCell>
                </TableRow>
              ) : drafts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">Belum ada draft transaksi.</TableCell>
                </TableRow>
              ) : drafts.map((draft) => (
                <TableRow key={draft.id}>
                  <TableCell>{draft.transaction_date ? format(new Date(draft.transaction_date), 'dd MMM yyyy', { locale: id }) : '-'}</TableCell>
                  <TableCell className="font-medium">{draft.merchant_name || 'Tidak Terdeteksi'}</TableCell>
                  <TableCell>{draft.category || '-'}</TableCell>
                  <TableCell className="text-right">Rp {Number(draft.total_amount).toLocaleString()}</TableCell>
                  <TableCell>{getStatusBadge(draft.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
