'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScaleIcon } from "lucide-react";

interface JournalLine {
  id: string;
  account_id: string;
  debit: number;
  credit: number;
  description?: string;
  chart_of_accounts?: {
    code: string;
    name: string;
  };
}

interface JournalEntry {
  id: string;
  date: string;
  description?: string;
  status: string;
  reference_type?: string;
  reference_id?: string;
  journal_lines?: JournalLine[];
}

interface JournalLinesDrawerProps {
  open: boolean;
  onClose: () => void;
  journalEntry: JournalEntry | null;
}

const rp = new Intl.NumberFormat('id-ID');

export function JournalLinesDrawer({ open, onClose, journalEntry }: JournalLinesDrawerProps) {
  if (!journalEntry) return null;

  const lines = journalEntry.journal_lines ?? [];
  const totalDebit = lines.reduce((sum, l) => sum + (l.debit || 0), 0);
  const totalCredit = lines.reduce((sum, l) => sum + (l.credit || 0), 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScaleIcon className="size-5" />
            Detail Jurnal
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            <div className="text-muted-foreground">Tanggal</div>
            <div className="font-medium">{new Date(journalEntry.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
            <div className="text-muted-foreground">Status</div>
            <div>
              <Badge variant={journalEntry.status === 'posted' ? 'secondary' : journalEntry.status === 'voided' ? 'destructive' : 'outline'}>
                {journalEntry.status}
              </Badge>
            </div>
            {journalEntry.description && (
              <>
                <div className="text-muted-foreground">Deskripsi</div>
                <div className="font-medium">{journalEntry.description}</div>
              </>
            )}
            {journalEntry.reference_type && (
              <>
                <div className="text-muted-foreground">Referensi</div>
                <div className="font-medium">{journalEntry.reference_type}{journalEntry.reference_id ? ` #${journalEntry.reference_id}` : ''}</div>
              </>
            )}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Akun</TableHead>
                <TableHead className="text-right">Debit (Rp)</TableHead>
                <TableHead className="text-right">Kredit (Rp)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lines.map((line) => (
                <TableRow key={line.id}>
                  <TableCell>
                    <span className="font-medium">{line.chart_of_accounts?.code ?? line.account_id}</span>
                    {line.chart_of_accounts?.name && (
                      <span className="text-muted-foreground ml-1.5 text-xs">{line.chart_of_accounts.name}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">{line.debit > 0 ? `Rp ${rp.format(line.debit)}` : '-'}</TableCell>
                  <TableCell className="text-right">{line.credit > 0 ? `Rp ${rp.format(line.credit)}` : '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex justify-between border-t pt-3 text-sm font-medium">
            <span>Total</span>
            <span className="space-x-6">
              <span>Debit: Rp {rp.format(totalDebit)}</span>
              <span>Kredit: Rp {rp.format(totalCredit)}</span>
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
