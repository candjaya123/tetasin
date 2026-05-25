"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  BookOpen,
  TableProperties,
  ArrowDownUp,
  Scale,
  TrendingUp,
  Package,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { profileService } from '@/lib/api/profileService';

interface Report {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export default function FinanceReportsHub() {
  const [isPersonal, setIsPersonal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const detectAccountType = async () => {
      try {
        const tenant = await profileService.getTenant();
        setIsPersonal(tenant?.account_type === 'personal');
      } catch {
        setIsPersonal(false);
      } finally {
        setLoading(false);
      }
    };
    detectAccountType();
  }, []);

  const personalReports: Report[] = [
    {
      title: "Ringkasan Bulanan",
      description: "Pemasukan vs pengeluaran bulanan Anda.",
      href: "/tenant/finance/income-statement",
      icon: TrendingUp,
      color: "bg-emerald-50 text-emerald-600 border-emerald-100"
    },
    {
      title: "Kekayaan Bersih",
      description: "Total aset dikurangi total hutang Anda.",
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
    }
  ];

  const businessReports: Report[] = [
    {
      title: "Laporan Laba Rugi",
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
      title: "Neraca Saldo",
      description: "Saldo agregat debit/kredit seluruh akun.",
      href: "/tenant/finance/trial-balance",
      icon: TableProperties,
      color: "bg-rose-50 text-rose-600 border-rose-100"
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
      title: "Laporan Stok",
      description: "Kuantitas produk dan valuasi inventaris.",
      href: "/tenant/finance/stock",
      icon: Package,
      color: "bg-orange-50 text-orange-600 border-orange-100"
    }
  ];

  const reports = isPersonal ? personalReports : businessReports;

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-10 pb-8 sm:pb-20">
      <div>
        <h1 className="text-xl sm:text-3xl font-bold text-foreground tracking-tight">
          {isPersonal ? 'Laporan Keuangan Pribadi' : 'Pusat Laporan Keuangan'}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
          {isPersonal
            ? 'Pantau kesehatan finansial pribadi Anda.'
            : 'Akses seluruh data finansial bisnis Anda dengan standar ERP.'}
        </p>
      </div>

      {/* 2-column grid on mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
        {reports.map((report) => (
          <Link href={report.href} key={report.title} className="group">
            <Card variant="elevated" className="h-full rounded-3xl">
              <CardContent className="p-4 sm:p-8">
                <div className={`w-10 h-10 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl flex items-center justify-center border mb-4 sm:mb-6 transition-transform group-hover:scale-110 duration-300 ${
                  report.color
                }`}>
                  <report.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="text-sm sm:text-lg font-semibold text-foreground mb-1 sm:mb-2">{report.title}</h3>
                <p className="text-[11px] sm:text-sm text-muted-foreground leading-relaxed line-clamp-2">{report.description}</p>
                <div className="mt-4 sm:mt-6 flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-semibold text-primary uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all duration-300">
                  Buka Laporan
                  <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
