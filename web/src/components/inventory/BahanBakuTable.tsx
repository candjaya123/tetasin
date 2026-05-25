'use client';

import React from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, AlertTriangle } from "lucide-react";
import type { RawMaterial } from '@/types';

interface BahanBakuTableProps {
  items: RawMaterial[];
  onEdit: (item: RawMaterial) => void;
  onDelete: (item: RawMaterial) => void;
}

const formatter = new Intl.NumberFormat('id-ID');

export function BahanBakuTable({ items, onEdit, onDelete }: BahanBakuTableProps) {
  if (items.length === 0) {
    return (
      <div className="bg-slate-50 rounded-2xl p-8 text-center border border-dashed border-slate-200">
        <AlertTriangle className="w-8 h-8 text-slate-300 mx-auto mb-3" />
        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Belum Ada Bahan Baku</p>
        <p className="text-xs text-slate-400 mt-1">Tambahkan bahan baku pertama Anda.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-100 overflow-hidden bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/50">
            <TableHead className="text-xs font-black uppercase tracking-widest text-slate-400">Nama Bahan</TableHead>
            <TableHead className="text-xs font-black uppercase tracking-widest text-slate-400">Satuan</TableHead>
            <TableHead className="text-xs font-black uppercase tracking-widest text-slate-400 text-right">Harga Satuan</TableHead>
            <TableHead className="text-xs font-black uppercase tracking-widest text-slate-400 text-right">Stok</TableHead>
            <TableHead className="text-xs font-black uppercase tracking-widest text-slate-400 text-right">ROP</TableHead>
            <TableHead className="text-xs font-black uppercase tracking-widest text-slate-400 text-center">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const isLowStock = item.reorder_point != null && item.current_stock <= item.reorder_point;
            return (
              <TableRow key={item.id} className="hover:bg-slate-50/50">
                <TableCell className="font-bold text-slate-700">{item.name}</TableCell>
                <TableCell className="text-slate-500">{item.unit}</TableCell>
                <TableCell className="text-right font-medium text-slate-700">
                  Rp {formatter.format(item.unit_price)}
                </TableCell>
                <TableCell className="text-right font-bold text-slate-700">{item.current_stock}</TableCell>
                <TableCell className="text-right">
                  {item.reorder_point != null ? (
                    <span className={isLowStock ? 'text-red-500 font-bold' : 'text-slate-500'}>
                      {item.reorder_point}
                      {isLowStock && (
                        <AlertTriangle className="w-3.5 h-3.5 inline ml-1 text-red-500" />
                      )}
                    </span>
                  ) : (
                    <span className="text-slate-300">-</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-primary"
                      onClick={() => onEdit(item)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-red-500"
                      onClick={() => onDelete(item)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
