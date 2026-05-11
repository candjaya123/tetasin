"use client";

import React from 'react';
import Link from 'next/link';
import { 
  FileText, 
  BookOpen, 
  TableProperties, 
  BarChart3, 
  ArrowDownUp, 
  Scale,
  TrendingUp,
  Package
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function FinanceReportsHub() {
  const reports = [
    {
      title: "Laba Rugi",
      description: "Pendapatan vs Beban untuk periode tertentu.",
      href: "/tenant/finance/income-statement",
      icon: TrendingUp,
      color: "bg-emerald-50 text-emerald-600 border-emerald-100"
    },
    {
      title: "Neraca",
      description: "Posisi aset, liabilitas, dan ekuitas bisnis.",
      href: "/tenant/finance/balance-sheet",
      icon: Scale,
      color: "bg-blue-50 text-blue-600 border-blue-100"
    },
    {
      title: "Arus Kas",
      description: "Laporan uang masuk dan keluar (Kas & Bank).",
      href: "/tenant/finance/cash-flow",
      icon: ArrowDownUp,
      color: "bg-amber-50 text-amber-600 border-amber-100"
    },
    {
      title: "Jurnal Umum",
      description: "Riwayat seluruh entri transaksi akuntansi.",
      href: "/tenant/finance/journal",
      icon: FileText,
      color: "bg-slate-50 text-slate-600 border-slate-100"
    },
    {
      title: "Buku Besar",
      description: "Mutasi dan saldo per masing-masing akun COA.",
      href: "/tenant/finance/ledger",
      icon: BookOpen,
      color: "bg-indigo-50 text-indigo-600 border-indigo-100"
    },
    {
      title: "Neraca Saldo",
      description: "Saldo agregat debit/kredit seluruh akun.",
      href: "/tenant/finance/trial-balance",
      icon: TableProperties,
      color: "bg-rose-50 text-rose-600 border-rose-100"
    },
    {
      title: "Laporan Stok",
      description: "Kuantitas produk dan valuasi inventaris.",
      href: "/tenant/finance/stock",
      icon: Package,
      color: "bg-orange-50 text-orange-600 border-orange-100"
    }
  ];

  return (
    <div className="space-y-10 pb-20">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Pusat Laporan Keuangan</h1>
        <p className="text-slate-500 font-medium">Akses seluruh data finansial bisnis Anda dengan standar ERP.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <Link href={report.href} key={report.title} className="group">
            <Card className="h-full border-none shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 rounded-[2rem] overflow-hidden group-hover:-translate-y-1">
              <CardContent className="p-8">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border mb-6 transition-transform group-hover:scale-110 duration-300 ${report.color}`}>
                  <report.icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-2">{report.title}</h3>
                <p className="text-sm font-medium text-slate-500 leading-relaxed">{report.description}</p>
                <div className="mt-6 flex items-center gap-2 text-xs font-black text-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  Buka Laporan
                  <ArrowDownUp className="w-3 h-3 rotate-90" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
