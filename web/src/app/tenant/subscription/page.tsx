"use client";

import React, { useState, useEffect } from 'react';
import { 
  Check, 
  Zap, 
  Crown, 
  ShieldCheck,
  Sparkles,
  Info
} from 'lucide-react';
import { profileService } from '@/lib/api/profileService';
import { Card, CardContent } from '@/components/ui/card';

export default function SubscriptionPage() {
  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTenant = async () => {
      try {
        const data = await profileService.getTenant();
        setTenant(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTenant();
  }, []);

  const isPersonal = tenant?.account_type === 'personal';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header & Current Status */}
      <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
          <ShieldCheck className="w-64 h-64 text-primary" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20">
              <Sparkles className="w-3 h-3" />
              Tumbuhin Full Access
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Status Keanggotaan</h1>
            <p className="text-slate-500 font-medium max-w-md">
              {isPersonal 
                ? 'Nikmati kebebasan mengelola keuangan pribadi Anda dengan seluruh fitur premium aktif tanpa batasan.' 
                : 'Bisnis Anda kini didukung penuh oleh infrastruktur ERP Tumbuhin tanpa batasan fitur.'}
            </p>
          </div>
          
          <div className="bg-secondary p-8 rounded-[2rem] text-white shadow-2xl shadow-secondary/20 min-w-[300px] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            <div className="flex items-center gap-5 relative z-10">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                <Crown className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Status Akun</p>
                <p className="text-2xl font-black tracking-tight uppercase">FULL ACCESS</p>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Masa Berlaku</span>
              <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-lg">Selamanya</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Announcement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-none shadow-sm bg-white rounded-[2.5rem] overflow-hidden">
          <CardContent className="p-10">
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
              <Zap className="w-5 h-5 text-primary" />
              Fitur yang Terbuka
            </h3>
            <div className="space-y-4">
              {[
                isPersonal ? 'Input Pemasukan & Pengeluaran Kilat' : 'Point of Sale (POS) & Multi-Gudang',
                isPersonal ? 'Sistem Anggaran (Budgeting) Pintar' : 'Accounting Engine & Jurnal Otomatis',
                isPersonal ? 'Analisa Kekayaan AI (CFO Personal)' : 'AI Business Analyst (Interactive)',
                'Seluruh Laporan Keuangan Hierarkis',
                'Sinkronisasi Cloud Real-time',
                'Ekspor Laporan PDF & Excel'
              ].map((f) => (
                <div key={f} className="flex items-center gap-4 group">
                  <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center border border-emerald-100 group-hover:scale-110 transition-transform">
                    <Check className="w-3.5 h-3.5 stroke-[4]" />
                  </div>
                  <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">{f}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-slate-900 text-white rounded-[2.5rem] overflow-hidden relative">
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/10 rounded-full -mr-32 -mb-32 blur-3xl"></div>
          <CardContent className="p-10 relative z-10">
            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10">
              <Info className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-black mb-4">Kebijakan Baru Tumbuhin</h3>
            <p className="text-slate-400 text-sm font-medium leading-relaxed mb-6">
              Kami telah menghapus sistem langganan berjenjang. Tumbuhin kini tersedia secara penuh untuk mendukung pertumbuhan Anda tanpa hambatan biaya bulanan yang membingungkan.
            </p>
            <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Penting</p>
              <p className="text-xs text-slate-300 leading-relaxed">
                Anda tetap bisa berpindah antara mode Personal dan Bisnis melalui menu Pengaturan Profil tanpa kehilangan data.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
