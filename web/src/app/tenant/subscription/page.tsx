"use client";

import React, { useState, useEffect } from 'react';
import { 
  Check, 
  Zap, 
  Crown, 
  ShieldCheck, 
  Sparkles,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { profileService } from '@/lib/api/profileService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';

const PERSONAL_TIERS = [
  {
    id: 'free',
    name: 'Personal Gratis',
    price: 0,
    features: [
      'Pemasukan & Pengeluaran (100/bulan)',
      '3 Kategori Anggaran',
      '2 Target Keuangan',
      'Ringkasan Bulanan',
      'Riwayat 3 bulan',
    ],
    cardClass: 'bg-white border-2 border-slate-100',
    headerClass: 'text-slate-800',
    iconClass: 'bg-slate-100 text-slate-500',
    buttonClass: 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-none',
  },
  {
    id: 'premium',
    name: 'Personal Premium',
    price: 49000,
    period: '/bulan',
    features: [
      'Pencatatan Unlimited',
      'Anggaran Unlimited',
      'Target Keuangan Unlimited',
      'Transaksi Berulang',
      'Ekspor CSV + PDF',
      'Riwayat Unlimited',
    ],
    cardClass: 'bg-primary text-primary-foreground shadow-2xl shadow-primary/30 scale-105 z-10 border-none relative overflow-hidden',
    headerClass: 'text-primary-foreground',
    iconClass: 'bg-white/20 text-white',
    buttonClass: 'bg-white text-primary hover:bg-white/90 shadow-lg',
    popular: true,
  },
];

const BUSINESS_TIERS = [
  {
    id: 'free',
    name: 'Bisnis Gratis',
    price: 0,
    features: [
      'POS (100 transaksi/bulan)',
      '1 Gudang',
      'Inventory dasar',
      'Riwayat 30 hari',
      'Owner only',
    ],
    cardClass: 'bg-white border-2 border-slate-100',
    headerClass: 'text-slate-800',
    iconClass: 'bg-slate-100 text-slate-500',
    buttonClass: 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-none',
  },
  {
    id: 'pro',
    name: 'Bisnis Pro',
    price: 99000,
    period: '/bulan',
    features: [
      'POS Unlimited',
      'Multi-gudang',
      'AI Chat + OCR',
      'Full Accounting',
      'Staff RBAC',
      'Semua laporan keuangan',
      'HPP & Resep Produk',
      'Riwayat Unlimited',
    ],
    cardClass: 'bg-primary text-primary-foreground shadow-2xl shadow-primary/30 scale-105 z-10 border-none relative overflow-hidden',
    headerClass: 'text-primary-foreground',
    iconClass: 'bg-white/20 text-white',
    buttonClass: 'bg-white text-primary hover:bg-white/90 shadow-lg',
    popular: true,
  },
  {
    id: 'franchise',
    name: 'Bisnis Franchise',
    price: 499000,
    period: '/bulan',
    features: [
      'Semua fitur Pro',
      'Multi-cabang',
      'Laporan konsolidasi',
      'Manajemen franchise',
      'Ekspor CSV + PDF + API',
      'Per-branch RBAC',
    ],
    cardClass: 'bg-secondary text-secondary-foreground border-none',
    headerClass: 'text-white',
    iconClass: 'bg-white/10 text-white',
    buttonClass: 'bg-white/10 text-white hover:bg-white/20 border-none',
  },
];

export default function SubscriptionPage() {
  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOnboarding = searchParams.get('onboarding') === 'true';

  useEffect(() => {
    const fetchTenant = async () => {
      try {
        const data = await profileService.getTenant();
        setTenant(data);
      } catch {
        toast({ title: 'Error', description: 'Gagal memuat data langganan.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchTenant();
  }, [toast]);

  const isPersonal = tenant?.account_type === 'personal';
  const currentTier = tenant?.tier || 'free';

  const handleUpgrade = async (tierId: string) => {
    setUpgrading(tierId);
    try {
      await profileService.updateTenant({ tier: tierId });
      toast({ title: 'Berhasil 🚀', description: `Sistem diaktifkan dengan paket ${getTierBadge(tierId)}!` });
      setTenant({ ...tenant, tier: tierId });
      
      // If they just finished onboarding, redirect them to the dashboard now
      router.push('/tenant');
      router.refresh();
    } catch (err: any) {
      toast({ title: 'Waduh, ada masalah!', description: err.message || 'Gagal mengubah langganan.', variant: 'destructive' });
    } finally {
      setUpgrading(null);
    }
  };

  const getTierBadge = (tierId: string) => {
    const labels: Record<string, string> = { free: 'Gratis', premium: 'Premium', pro: 'Pro', franchise: 'Franchise' };
    return labels[tierId] || tierId;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
        <p className="font-black tracking-tight text-slate-800 animate-pulse">Memuat Paket...</p>
      </div>
    );
  }

  const tiers = isPersonal ? PERSONAL_TIERS : BUSINESS_TIERS;
  const validTiers = isPersonal ? ['free', 'premium'] : ['free', 'pro', 'franchise'];

  return (
    <div className="space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Card */}
      <div className="bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.04)] border-none relative overflow-hidden">
        <div className="bg-secondary p-10 md:p-14 text-white relative">
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/20 text-primary-foreground rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-inner backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5" />
                Langkah Terakhir
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight">Pilih Paket Sistem</h1>
              <p className="text-slate-300 font-medium text-lg max-w-xl leading-relaxed">
                {isPersonal 
                  ? 'Sistem keuangan personal Anda sudah siap. Pilih paket untuk mulai mencatat.' 
                  : 'Struktur buku besar dan modul bisnis telah dikonfigurasi AI. Pilih kapasitas sistem Anda.'}
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-[2rem] border border-white/20 shadow-2xl min-w-[220px]">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 mb-1">Status Saat Ini</p>
              <p className="text-3xl font-black tracking-tight text-white uppercase">{getTierBadge(currentTier)}</p>
              {tenant?.subscription_end_date && (
                <p className="text-xs text-slate-300 mt-2 font-medium">Aktif s/d {new Date(tenant.subscription_end_date).toLocaleDateString()}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-2 md:px-0 mt-8 items-center">
        {tiers.map((tier) => {
          const isCurrent = currentTier === tier.id;
          return (
            <Card key={tier.id} className={`rounded-[2.5rem] transition-all duration-300 ${tier.cardClass} ${isCurrent && tier.id !== 'pro' ? 'ring-4 ring-primary/20' : ''}`}>
              {tier.popular && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              )}
              
              <CardContent className="p-8 md:p-10 relative z-10">
                {tier.popular && (
                  <div className="inline-block px-4 py-1.5 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-[0.2em] mb-6 backdrop-blur-md border border-white/20 shadow-inner">
                    Pilihan Utama
                  </div>
                )}
                
                <div className="flex items-center gap-4 mb-8">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${tier.iconClass} shadow-inner`}>
                    {tier.id === 'free' ? <ShieldCheck className="w-7 h-7" /> : tier.id === 'pro' ? <Zap className="w-7 h-7" /> : <Crown className="w-7 h-7" />}
                  </div>
                  <div>
                    <h3 className={`text-xl font-black tracking-tight ${tier.headerClass}`}>{tier.name}</h3>
                    <div className="flex items-end gap-1 mt-1">
                      <span className={`text-3xl font-black tracking-tighter ${tier.headerClass}`}>
                        {tier.price > 0 ? `Rp ${(tier.price / 1000).toFixed(0)}k` : 'Gratis'}
                      </span>
                      {tier.price > 0 && <span className={`text-sm font-bold mb-1 opacity-80 ${tier.headerClass}`}>{tier.period}</span>}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mb-10">
                  {tier.features.map((f) => (
                    <div key={f} className={`flex items-center gap-3 ${tier.headerClass}`}>
                      <div className="p-1 rounded-full bg-current/10">
                        <Check className="w-4 h-4 flex-shrink-0" />
                      </div>
                      <span className="font-bold text-sm opacity-90">{f}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => handleUpgrade(tier.id)}
                  disabled={upgrading === tier.id}
                  className={`w-full h-14 rounded-2xl text-base font-black uppercase tracking-wide transition-all active:scale-[0.98] ${tier.buttonClass}`}
                >
                  {upgrading === tier.id ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : isCurrent ? (
                    'Sedang Aktif'
                  ) : (
                    <span className="flex items-center gap-2">
                      {tier.price > 0 ? 'Pilih Paket' : 'Gunakan Gratis'}
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
