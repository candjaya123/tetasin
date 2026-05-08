"use client";

import React, { useState, useEffect } from 'react';
import { 
  Check, 
  Zap, 
  Crown, 
  CreditCard, 
  History, 
  Download,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { profileService } from '@/lib/api/profileService';

export default function SubscriptionPage() {
  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);

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

  const displayTiers = isPersonal ? [
    {
      name: 'Tumbuhin Trial',
      id: 'trial',
      price: '0',
      description: 'Pencatatan keuangan dasar untuk individu.',
      features: [
        'Input Pemasukan & Pengeluaran',
        'Laporan Ringkasan Bulanan',
        'Katalog Aset Dasar',
        'Akses Mobile App'
      ],
      notIncluded: [
        'Analisa Kekayaan AI',
        'Anggaran Tak Terbatas',
        'Export Laporan Excel/PDF',
        'Bebas Iklan & Prioritas Support'
      ],
      color: 'slate',
      icon: Zap
    },
    {
      name: 'Tumbuhin Full',
      id: 'full',
      price: '29.000',
      description: 'Manajemen kekayaan cerdas dengan asisten AI.',
      features: [
        'Semua fitur Trial',
        'Analisa Kekayaan AI (CFO Personal)',
        'Sistem Anggaran (Budgeting) Pintar',
        'Export Laporan Lengkap',
        'Sinkronisasi Cloud Real-time',
        'Bebas Iklan'
      ],
      notIncluded: [],
      color: 'primary',
      icon: Crown,
      popular: true
    }
  ] : [
    {
      name: 'Tumbuhin Trial',
      id: 'trial',
      price: '0',
      description: 'Solusi kasir dasar untuk UMKM baru.',
      features: [
        'Point of Sale (POS) Standar',
        'Manajemen 1 Gudang',
        'Katalog Produk & Stok',
        'Laporan Penjualan Harian'
      ],
      notIncluded: [
        'Multi-Gudang & Transfer Stok',
        'Manajemen Staf (RBAC)',
        'Sistem Akuntansi Otomatis',
        'AI Business Assistant Chat'
      ],
      color: 'slate',
      icon: Zap
    },
    {
      name: 'Tumbuhin Full',
      id: 'full',
      price: '99.000',
      description: 'ERP otonom komprehensif untuk bisnis berkembang.',
      features: [
        'Semua fitur Trial',
        'Multi-Gudang & Stock Transfer',
        'Manajemen Staf & RBAC',
        'Accounting Engine Otomatis',
        'Laporan Laba Rugi & Neraca',
        'AI Business Analyst (Interactive)'
      ],
      notIncluded: [],
      color: 'primary',
      icon: Crown,
      popular: true
    }
  ];

  const mockBillingHistory = [
    { id: 'INV-001', date: '2026-04-03', amount: isPersonal ? 'Rp 29.000' : 'Rp 99.000', status: 'Selesai', tier: 'Full' },
  ];

  const handleUpgrade = (tierId: string) => {
    setUpgrading(tierId);
    // Simulating Midtrans Checkout redirect
    setTimeout(() => {
      alert(`Mengarahkan ke Midtrans untuk pembayaran paket ${tierId.toUpperCase()}...`);
      setUpgrading(null);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const currentTierId = tenant?.tier || 'trial';

  return (
    <div className="space-y-10 pb-20">
      {/* Header & Current Status */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 p-10 opacity-5">
          <ShieldCheck className="w-64 h-64 text-primary" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Status Langganan</h1>
            <p className="text-slate-500">
              {isPersonal ? 'Kelola paket layanan keuangan pribadi Anda.' : 'Kelola paket layanan dan penagihan bisnis Anda.'}
            </p>
          </div>
          
          <div className="bg-primary/5 border border-primary/20 px-6 py-4 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
              {currentTierId === 'full' ? <Crown /> : <Zap />}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">Paket Aktif</p>
              <p className="text-xl font-bold text-slate-900">
                {displayTiers.find(t => t.id === currentTierId)?.name || 'Tumbuhin Trial'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div>
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-900">Pilih Paket yang Sesuai</h2>
          <p className="text-slate-500 mt-2">Dapatkan kekuatan AI untuk {isPersonal ? 'mengelola kekayaan Anda.' : 'mengakselerasi pertumbuhan bisnis Anda.'}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {displayTiers.map((tier) => {
            const isCurrent = tier.id === currentTierId;
            const Icon = tier.icon;
            
            return (
              <div 
                key={tier.id}
                className={`
                  relative flex flex-col bg-white rounded-3xl border transition-all duration-300
                  ${tier.popular ? 'border-primary shadow-xl shadow-primary/5 ring-4 ring-primary/5 scale-105 z-10' : 'border-slate-200 shadow-sm hover:border-primary/50'}
                  ${isCurrent ? 'opacity-80 grayscale-[0.5]' : ''}
                `}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
                    Recomendasi
                  </div>
                )}

                <div className="p-8 pb-0">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 
                    ${tier.color === 'primary' ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-600'}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{tier.name}</h3>
                  <p className="text-slate-500 text-sm mt-2 h-10 line-clamp-2">{tier.description}</p>
                  
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-slate-400 text-sm">Rp</span>
                    <span className="text-4xl font-bold text-slate-900">{tier.price}</span>
                    <span className="text-slate-400 text-sm">/ bulan</span>
                  </div>
                </div>

                <div className="p-8 space-y-4 flex-grow mt-6">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Fitur Utama</div>
                  {tier.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3 text-sm">
                      <div className="mt-0.5 w-4 h-4 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span className="text-slate-700 font-medium">{feature}</span>
                    </div>
                  ))}
                  
                  {tier.notIncluded.length > 0 && (
                    <>
                      <div className="pt-4 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Tidak Termasuk</div>
                      {tier.notIncluded.map((feature) => (
                        <div key={feature} className="flex items-start gap-3 text-sm opacity-40">
                          <div className="mt-0.5 w-4 h-4 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center flex-shrink-0">
                            <AlertCircle className="w-3 h-3" />
                          </div>
                          <span className="text-slate-600">{feature}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>

                <div className="p-8 pt-0 mt-auto">
                  <button
                    disabled={isCurrent || upgrading !== null}
                    onClick={() => handleUpgrade(tier.id)}
                    className={`
                      w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2
                      ${isCurrent 
                        ? 'bg-slate-100 text-slate-400 cursor-default' 
                        : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20'}
                    `}
                  >
                    {isCurrent ? (
                      'Paket Saat Ini'
                    ) : upgrading === tier.id ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        Upgrade Sekarang
                        <ExternalLink className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  {!isCurrent && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
                      <CreditCard className="w-3 h-3" />
                      Pembayaran aman via Midtrans
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Billing History */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
              <History className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Riwayat Penagihan</h3>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Nomor Invoice</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Tanggal</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Tier</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Jumlah</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockBillingHistory.map((bill) => (
                <tr key={bill.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm font-semibold text-slate-600">{bill.id}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{bill.date}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">
                      {bill.tier}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900">{bill.amount}</td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                      {bill.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-primary transition-all">
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
