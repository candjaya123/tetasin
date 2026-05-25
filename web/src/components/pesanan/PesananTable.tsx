'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, MoreHorizontal, Pencil } from "lucide-react";
import type { SalesOrder } from "@/types";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-gray-100 text-gray-700' },
  confirmed: { label: 'Dikonfirmasi', className: 'bg-blue-100 text-blue-700' },
  processing: { label: 'Diproses', className: 'bg-orange-100 text-orange-700' },
  ready: { label: 'Siap', className: 'bg-cyan-100 text-cyan-700' },
  fulfilled: { label: 'Selesai', className: 'bg-green-100 text-green-700' },
  invoiced: { label: 'Invoice', className: 'bg-purple-100 text-purple-700' },
  paid: { label: 'Dibayar', className: 'bg-emerald-100 text-emerald-700' },
  cancelled: { label: 'Dibatalkan', className: 'bg-red-100 text-red-700' },
  voided: { label: 'Void', className: 'bg-rose-100 text-rose-700' },
};

interface PesananTableProps {
  pesananList: SalesOrder[];
  onViewDetail: (pesanan: SalesOrder) => void;
  onUpdateStatus: (pesanan: SalesOrder) => void;
}

export function PesananTable({ pesananList, onViewDetail, onUpdateStatus }: PesananTableProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead>No. Pesanan</TableHead>
            <TableHead>Pelanggan</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Sumber</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Tanggal</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pesananList.map((pesanan) => {
            const cfg = STATUS_CONFIG[pesanan.status] || STATUS_CONFIG.draft;
            return (
              <TableRow key={pesanan.id}>
                <TableCell className="font-medium text-slate-700">
                  {pesanan.pesanan_number}
                </TableCell>
                <TableCell className="text-slate-600">
                  {pesanan.customer_name || '—'}
                </TableCell>
                <TableCell>
                  <Badge variant="ghost" className={cfg.className}>
                    {cfg.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-slate-500 text-xs uppercase tracking-wide">
                  {pesanan.source}
                </TableCell>
                <TableCell className="text-right font-bold text-slate-800">
                  {formatCurrency(pesanan.total_amount)}
                </TableCell>
                <TableCell className="text-slate-500 text-xs">
                  {formatDate(pesanan.created_at)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onViewDetail(pesanan)}
                    >
                      <Eye className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onUpdateStatus(pesanan)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
          {pesananList.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-slate-400">
                Belum ada pesanan.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
