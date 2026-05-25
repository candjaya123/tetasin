'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { SourceBadge } from "./SourceBadge";
import { EyeIcon } from "lucide-react";

interface TransaksiTableProps {
  transactions: Array<{
    id: string;
    transaction_date: string;
    source_type: string;
    description?: string;
    total_amount: number;
    status: string;
  }>;
  onViewDetail: (id: string) => void;
}

const rp = new Intl.NumberFormat('id-ID');

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

function statusVariant(status: string): "default" | "secondary" | "destructive" | "outline" | "ghost" {
  switch (status) {
    case 'posted': return 'secondary';
    case 'voided': return 'destructive';
    case 'draft': return 'outline';
    default: return 'default';
  }
}

export function TransaksiTable({ transactions, onViewDetail }: TransaksiTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tanggal</TableHead>
          <TableHead>Tipe</TableHead>
          <TableHead>Deskripsi</TableHead>
          <TableHead>Jumlah</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
              Belum ada transaksi
            </TableCell>
          </TableRow>
        )}
        {transactions.map((tx) => (
          <TableRow key={tx.id}>
            <TableCell>{formatDate(tx.transaction_date)}</TableCell>
            <TableCell>
              <SourceBadge sourceType={tx.source_type} />
            </TableCell>
            <TableCell className="max-w-[200px] truncate">{tx.description || '-'}</TableCell>
            <TableCell className={tx.status === 'voided' ? 'text-red-600 line-through' : 'font-medium'}>
              Rp {rp.format(Math.abs(tx.total_amount))}
            </TableCell>
            <TableCell>
              <Badge variant={statusVariant(tx.status)}>{tx.status}</Badge>
            </TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onViewDetail(tx.id)}
              >
                <EyeIcon className="size-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
