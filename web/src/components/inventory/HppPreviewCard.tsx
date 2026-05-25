'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Beaker, Coins } from "lucide-react";

interface HppItem {
  name: string;
  quantity_needed: number;
  unit: string;
  unit_price: number;
  cost?: number;
}

interface HppPreviewCardProps {
  mode: 'recipe' | 'direct';
  items: HppItem[];
  productName: string;
  sellingPrice?: number;
}

const formatter = new Intl.NumberFormat('id-ID');

export function HppPreviewCard({ mode, items, productName, sellingPrice }: HppPreviewCardProps) {
  const totalHpp = items.reduce((sum, item) => {
    const itemCost = item.cost ?? (item.unit_price * item.quantity_needed);
    return sum + itemCost;
  }, 0);

  const grossMargin = sellingPrice != null && sellingPrice > 0
    ? ((sellingPrice - totalHpp) / sellingPrice) * 100
    : null;

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-black text-slate-800">
          {mode === 'recipe' ? (
            <Beaker className="w-5 h-5 text-emerald-500" />
          ) : (
            <Coins className="w-5 h-5 text-blue-500" />
          )}
          HPP: {productName}
        </CardTitle>
      </CardHeader>

      <CardContent className="px-0">
        {items.length === 0 ? (
          <div className="px-6 text-sm text-slate-400 font-medium">
            Tidak ada data bahan untuk ditampilkan.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Bahan Baku</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Qty/Unit</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Harga Satuan</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, i) => {
                const itemCost = item.cost ?? (item.unit_price * item.quantity_needed);
                return (
                  <TableRow key={i} className="hover:bg-slate-50/50">
                    <TableCell className="font-bold text-slate-700 text-sm">{item.name}</TableCell>
                    <TableCell className="text-center text-slate-500 text-sm">
                      {item.quantity_needed} {item.unit}
                    </TableCell>
                    <TableCell className="text-right text-slate-700 text-sm">
                      Rp {formatter.format(item.unit_price)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-slate-700 text-sm">
                      Rp {formatter.format(itemCost)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-2">
        <div className="flex items-center justify-between w-full">
          <span className="font-black text-slate-600 text-sm">Total HPP per Unit</span>
          <span className="font-black text-primary text-lg">
            Rp {formatter.format(totalHpp)}
          </span>
        </div>
        {grossMargin !== null && (
          <div className="flex items-center justify-between w-full pt-1 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-400">Margin Kotor</span>
            <span className={`text-sm font-black ${grossMargin >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {grossMargin.toFixed(1)}%
            </span>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
