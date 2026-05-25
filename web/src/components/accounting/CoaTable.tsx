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
import { PencilIcon, Trash2Icon, LockIcon } from "lucide-react";

interface ChartOfAccount {
  id: string;
  code: string;
  name: string;
  type: string;
  kategori?: string;
  normal_balance: 'debit' | 'credit';
  is_system?: boolean;
}

interface CoaTableProps {
  accounts: ChartOfAccount[];
  onEdit?: (account: ChartOfAccount) => void;
  onDelete?: (account: ChartOfAccount) => void;
}

const kategoriColors: Record<string, { className: string; label: string }> = {
  ASET:       { className: "bg-blue-100 text-blue-700 hover:bg-blue-100",   label: "ASET" },
  KEWAJIBAN:  { className: "bg-orange-100 text-orange-700 hover:bg-orange-100", label: "KEWAJIBAN" },
  EKUITAS:    { className: "bg-purple-100 text-purple-700 hover:bg-purple-100", label: "EKUITAS" },
  PENDAPATAN: { className: "bg-green-100 text-green-700 hover:bg-green-100",  label: "PENDAPATAN" },
  HPP:        { className: "bg-red-100 text-red-700 hover:bg-red-100",      label: "HPP" },
  BEBAN:      { className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100", label: "BEBAN" },
};

export function CoaTable({ accounts, onEdit, onDelete }: CoaTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[120px]">Kode</TableHead>
          <TableHead>Nama Akun</TableHead>
          <TableHead>Kategori</TableHead>
          <TableHead className="w-[100px] text-center">Normal Balance</TableHead>
          <TableHead className="w-[100px] text-center">System</TableHead>
          <TableHead className="w-[80px]">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {accounts.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
              Belum ada akun
            </TableCell>
          </TableRow>
        )}
        {accounts.map((account) => {
          const kat = kategoriColors[account.kategori ?? account.type?.toUpperCase() ?? ''] ?? { className: "bg-gray-100 text-gray-700 hover:bg-gray-100", label: account.kategori ?? account.type ?? '-' };

          return (
            <TableRow key={account.id}>
              <TableCell className="font-mono font-medium">{account.code}</TableCell>
              <TableCell>{account.name}</TableCell>
              <TableCell>
                <Badge variant="default" className={kat.className}>
                  {kat.label}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant={account.normal_balance === 'debit' ? 'secondary' : 'outline'}>
                  {account.normal_balance === 'debit' ? 'D' : 'K'}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                {account.is_system ? (
                  <LockIcon className="size-3.5 text-muted-foreground mx-auto" />
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>
                {!account.is_system && (
                  <div className="flex gap-1">
                    {onEdit && (
                      <Button variant="ghost" size="icon-xs" onClick={() => onEdit(account)}>
                        <PencilIcon className="size-3" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button variant="ghost" size="icon-xs" onClick={() => onDelete(account)}>
                        <Trash2Icon className="size-3 text-red-500" />
                      </Button>
                    )}
                  </div>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
