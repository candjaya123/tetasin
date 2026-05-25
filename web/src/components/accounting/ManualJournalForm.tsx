'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusIcon, Trash2Icon, CheckCircleIcon } from "lucide-react";

interface JournalLineData {
  id: string;
  accountId: string;
  debit: string;
  credit: string;
  description: string;
}

interface ManualJournalFormProps {
  onSubmit: (data: {
    description: string;
    lines: Array<{ account_id: string; debit: number; credit: number; description?: string }>;
  }) => void | Promise<void>;
  onCancel: () => void;
}

const rp = new Intl.NumberFormat('id-ID');

let lineCounter = 0;
function nextId() {
  lineCounter++;
  return `line-${Date.now()}-${lineCounter}`;
}

const emptyLine = (): JournalLineData => ({
  id: nextId(),
  accountId: '',
  debit: '',
  credit: '',
  description: '',
});

export function ManualJournalForm({ onSubmit, onCancel }: ManualJournalFormProps) {
  const [journalDescription, setJournalDescription] = useState('');
  const [lines, setLines] = useState<JournalLineData[]>([emptyLine()]);
  const [submitting, setSubmitting] = useState(false);

  const parseAmount = (val: string): number => {
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
  };

  const totalDebit = lines.reduce((sum, l) => sum + parseAmount(l.debit), 0);
  const totalCredit = lines.reduce((sum, l) => sum + parseAmount(l.credit), 0);
  const balance = totalDebit - totalCredit;
  const isBalanced = balance === 0 && lines.some(l => parseAmount(l.debit) > 0 || parseAmount(l.credit) > 0);

  const addLine = () => {
    setLines(prev => [...prev, emptyLine()]);
  };

  const removeLine = (id: string) => {
    if (lines.length <= 1) return;
    setLines(prev => prev.filter(l => l.id !== id));
  };

  const updateLine = (id: string, field: keyof JournalLineData, value: string) => {
    setLines(prev => prev.map(l => {
      if (l.id !== id) return l;

      const updated = { ...l, [field]: value };

      if (field === 'debit' && value !== '' && parseAmount(value) > 0) {
        updated.credit = '';
      } else if (field === 'credit' && value !== '' && parseAmount(value) > 0) {
        updated.debit = '';
      }

      return updated;
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const data = {
        description: journalDescription,
        lines: lines
          .filter(l => parseAmount(l.debit) > 0 || parseAmount(l.credit) > 0)
          .map(l => ({
            account_id: l.accountId,
            debit: parseAmount(l.debit),
            credit: parseAmount(l.credit),
            description: l.description || undefined,
          })),
      };
      await onSubmit(data);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="journal-desc">Deskripsi Jurnal</Label>
        <Input
          id="journal-desc"
          placeholder="Deskripsi jurnal..."
          value={journalDescription}
          onChange={(e) => setJournalDescription(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {lines.map((line, idx) => (
          <div key={line.id} className="grid grid-cols-12 gap-2 items-start p-3 bg-slate-50 rounded-xl">
            <div className="col-span-5 space-y-1">
              <Label className="text-xs">Akun</Label>
              <Input
                placeholder="ID Akun"
                value={line.accountId}
                onChange={(e) => updateLine(line.id, 'accountId', e.target.value)}
              />
            </div>
            <div className="col-span-2 space-y-1">
              <Label className="text-xs">Debit</Label>
              <Input
                type="number"
                placeholder="0"
                value={line.debit}
                onChange={(e) => updateLine(line.id, 'debit', e.target.value)}
              />
            </div>
            <div className="col-span-2 space-y-1">
              <Label className="text-xs">Kredit</Label>
              <Input
                type="number"
                placeholder="0"
                value={line.credit}
                onChange={(e) => updateLine(line.id, 'credit', e.target.value)}
              />
            </div>
            <div className="col-span-2 space-y-1">
              <Label className="text-xs">Deskripsi</Label>
              <Input
                placeholder="Ket."
                value={line.description}
                onChange={(e) => updateLine(line.id, 'description', e.target.value)}
              />
            </div>
            <div className="col-span-1 pt-5">
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => removeLine(line.id)}
                disabled={lines.length <= 1}
              >
                <Trash2Icon className="size-3 text-red-500" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Button variant="outline" size="sm" onClick={addLine}>
        <PlusIcon className="size-4" />
        Tambah Baris
      </Button>

      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total Debit</span>
          <span className="font-medium">Rp {rp.format(totalDebit)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total Kredit</span>
          <span className="font-medium">Rp {rp.format(totalCredit)}</span>
        </div>
        <div className="flex justify-between text-sm font-bold">
          <span>Selisih</span>
          <span className={balance === 0 ? 'text-green-600' : 'text-red-600'}>
            Rp {rp.format(Math.abs(balance))} {balance !== 0 && '(tidak seimbang)'}
          </span>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={submitting}>
          Batal
        </Button>
        <Button onClick={handleSubmit} disabled={!isBalanced || submitting}>
          {isBalanced && <CheckCircleIcon className="size-4" />}
          Simpan Jurnal
        </Button>
      </div>
    </div>
  );
}
