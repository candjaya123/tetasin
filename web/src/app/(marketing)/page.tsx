import React from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowRight, 
  CheckCircle2, 
  BarChart3, 
  Users, 
  Zap, 
  ShieldCheck,
  TrendingUp,
  LayoutDashboard,
  Wallet,
  Target,
  PieChart,
  Bot,
  Package,
  Store,
  CreditCard,
  Crown
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Decorative Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob"></div>
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-yellow-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-[40%] h-[40%] bg-blue-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-blob animation-delay-4000"></div>

      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-xl border-b border-border shadow-sm">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-black text-xl shadow-lg shadow-primary/20">T</div>
            <span className="text-2xl font-black text-secondary tracking-tight">
              Tumbuhin
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-muted-foreground">
            <Link href="#personal" className="hover:text-primary transition-colors">Personal</Link>
            <Link href="#bisnis" className="hover:text-primary transition-colors">Bisnis</Link>
            <Link href="#pricing" className="hover:text-primary transition-colors">Harga</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="font-bold text-muted-foreground hover:text-secondary">Masuk</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold rounded-xl shadow-lg shadow-secondary/20 px-6 h-11">
                Mulai Gratis
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-grow pt-32 pb-20 relative z-10">
        {/* Hero Section */}
        <section className="container mx-auto px-6 py-20 text-center">
          <div className="max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-primary/20 text-secondary text-xs font-black uppercase tracking-widest mb-8 shadow-sm backdrop-blur-md">
              <Zap className="w-4 h-4 fill-primary text-primary" />
              <span>Satu Platform, Dua Solusi</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-secondary mb-8 leading-[1.1]">
              Kendalikan <br className="hidden md:block" />
              <span className="text-primary">
                Keuangan & Bisnis
              </span><br />
              Dalam Satu Layar.
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
              Baik Anda ingin mengatur anggaran bulanan pribadi atau mengelola operasional UMKM, Tumbuhin memberikan alat yang tepat untuk pertumbuhan finansial Anda.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="h-16 px-10 text-lg bg-primary hover:bg-primary/90 font-black rounded-2xl shadow-xl shadow-primary/30 text-primary-foreground transition-all hover:-translate-y-1">
                  Coba Sekarang — Gratis!
                  <ArrowRight className="ml-3 w-6 h-6" />
                </Button>
              </Link>
              <Link href="#pricing">
                <Button size="lg" variant="outline" className="h-16 px-10 text-lg font-bold rounded-2xl bg-white/50 backdrop-blur-md border-border text-secondary hover:bg-white transition-all">
                  Lihat Paket
                </Button>
              </Link>
            </div>
            
            {/* Trust Indicators */}
            <div className="mt-20 pt-10 border-t border-border">
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-6">Dipercaya oleh pengguna tangguh</p>
              <div className="flex flex-wrap justify-center items-center gap-12 grayscale opacity-40">
                <span className="font-black text-2xl tracking-tighter">INDIEHACKERS</span>
                <span className="font-black text-2xl tracking-tighter">UMKMBISA</span>
                <span className="font-black text-2xl tracking-tighter">FINANCE.ID</span>
                <span className="font-black text-2xl tracking-tighter">STARTUPINA</span>
              </div>
            </div>
          </div>
        </section>

        {/* Dual-Path Bento Grid Section */}
        <section className="container mx-auto px-6 py-24 relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-secondary mb-6 tracking-tight">Dirancang untuk Tujuan Anda</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">Pilih jalur Anda. Tumbuhin secara dinamis beradaptasi dengan kebutuhan Anda, memberikan UI dan fitur yang paling relevan.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Personal Path */}
            <div id="personal" className="group relative bg-white rounded-3xl p-8 border border-border shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 transition-all group-hover:bg-primary/10"></div>
              
              <div className="relative z-10">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 border border-primary/20">
                  <Wallet className="w-8 h-8 text-primary-foreground" />
                </div>
                
                <h3 className="text-3xl font-black text-secondary mb-4">Personal Money Planner</h3>
                <p className="text-muted-foreground text-lg font-medium mb-8 leading-relaxed">
                  Lacak pengeluaran, buat anggaran bulanan, dan capai target tabungan Anda dengan mudah. Tidak ada istilah akuntansi yang rumit.
                </p>
                
                <ul className="space-y-4 mb-10">
                  {[
                    { icon: PieChart, text: "Analisa Alur Kas Otomatis" },
                    { icon: Target, text: "Manajemen Target Tabungan" },
                    { icon: CreditCard, text: "Pencatatan Transaksi Harian" }
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-4 text-secondary font-bold">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                        <item.icon className="w-5 h-5 text-primary" />
                      </div>
                      {item.text}
                    </li>
                  ))}
                </ul>
                
                <Link href="/register?type=personal">
                  <Button className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-black h-14 rounded-xl text-lg">
                    Mulai Personal Tracker
                  </Button>
                </Link>
              </div>
            </div>

            {/* Business Path */}
            <div id="bisnis" className="group relative bg-secondary rounded-3xl p-8 border border-white/10 shadow-xl shadow-secondary/50 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20 transition-all group-hover:bg-primary/20"></div>
              
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-8 border border-white/10 backdrop-blur-sm">
                  <Store className="w-8 h-8 text-primary" />
                </div>
                
                <h3 className="text-3xl font-black text-white mb-4">Business ERP & POS</h3>
                <p className="text-slate-400 text-lg font-medium mb-8 leading-relaxed">
                  Dari kasir hingga laporan laba rugi. Otomatisasi operasional toko Anda dengan sistem ERP kelas enterprise yang disederhanakan.
                </p>
                
                <ul className="space-y-4 mb-10">
                  {[
                    { icon: LayoutDashboard, text: "Sistem Kasir (POS) Offline-first" },
                    { icon: Package, text: "Manajemen Stok & Multi-Gudang" },
                    { icon: Bot, text: "AI Data Analyst & Prediksi Tren" }
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-4 text-slate-200 font-bold">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                        <item.icon className="w-5 h-5 text-primary" />
                      </div>
                      {item.text}
                    </li>
                  ))}
                </ul>
                
                <Link href="/register?type=business">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black h-14 rounded-xl text-lg shadow-lg shadow-primary/20">
                    Mulai Manajemen Bisnis
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 relative">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-secondary mb-6 tracking-tight">Harga yang Transparan</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">Investasi terbaik untuk masa depan finansial Anda. Pilih paket yang sesuai dengan kebutuhan Anda.</p>
            </div>

            <div className="space-y-20">
              {/* Personal Pricing */}
              <div>
                <div className="flex items-center gap-4 mb-10 justify-center">
                  <div className="h-px bg-border flex-grow max-w-[100px]"></div>
                  <h3 className="text-2xl font-black text-primary uppercase tracking-[0.2em]">Personal Plan</h3>
                  <div className="h-px bg-border flex-grow max-w-[100px]"></div>
                </div>
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                  <div className="bg-white rounded-3xl p-8 border border-border shadow-xl shadow-slate-200/50 flex flex-col">
                    <div className="mb-8">
                      <h3 className="text-2xl font-black text-secondary">Tumbuhin Trial</h3>
                      <p className="text-sm font-bold text-muted-foreground mt-1 mb-6">Pencatatan Dasar</p>
                      <div className="flex items-end gap-2">
                        <span className="text-5xl font-black text-secondary tracking-tighter">Rp 0</span>
                        <span className="text-muted-foreground font-bold mb-2">Selamanya</span>
                      </div>
                    </div>
                    <div className="flex-grow space-y-4 mb-8">
                      {["Input Pemasukan & Pengeluaran", "Laporan Ringkasan Bulanan", "Katalog Aset Dasar", "Akses Mobile App"].map((f, j) => (
                        <div key={j} className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                          <span className="font-bold text-secondary">{f}</span>
                        </div>
                      ))}
                    </div>
                    <Link href="/register?type=personal&tier=trial">
                      <Button className="w-full h-14 font-black rounded-xl text-lg bg-muted text-secondary hover:bg-muted/80">
                        Mulai Gratis
                      </Button>
                    </Link>
                  </div>
                  <div className="relative bg-white rounded-3xl p-8 border border-primary shadow-2xl shadow-primary/20 flex flex-col">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-sm">
                      Paling Populer
                    </div>
                    <div className="mb-8">
                      <h3 className="text-2xl font-black text-secondary">Tumbuhin Full</h3>
                      <p className="text-sm font-bold text-muted-foreground mt-1 mb-6">Wealth Management AI</p>
                      <div className="flex items-end gap-2">
                        <span className="text-5xl font-black text-secondary tracking-tighter">Rp 29rb</span>
                        <span className="text-muted-foreground font-bold mb-2">/ bulan</span>
                      </div>
                    </div>
                    <div className="flex-grow space-y-4 mb-8">
                      {["Analisa Kekayaan AI", "Sistem Anggaran Pintar", "Export Laporan Lengkap", "Bebas Iklan", "Prioritas Support"].map((f, j) => (
                        <div key={j} className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                          <span className="font-bold text-secondary">{f}</span>
                        </div>
                      ))}
                    </div>
                    <Link href="/register?type=personal&tier=full">
                      <Button className="w-full h-14 font-black rounded-xl text-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/30">
                        Pilih Paket Full
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Business Pricing */}
              <div>
                <div className="flex items-center gap-4 mb-10 justify-center">
                  <div className="h-px bg-border flex-grow max-w-[100px]"></div>
                  <h3 className="text-2xl font-black text-secondary uppercase tracking-[0.2em]">Business Plan</h3>
                  <div className="h-px bg-border flex-grow max-w-[100px]"></div>
                </div>
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                  <div className="bg-white rounded-3xl p-8 border border-border shadow-xl shadow-slate-200/50 flex flex-col">
                    <div className="mb-8">
                      <h3 className="text-2xl font-black text-secondary">Tumbuhin Trial</h3>
                      <p className="text-sm font-bold text-muted-foreground mt-1 mb-6">Operasional Dasar</p>
                      <div className="flex items-end gap-2">
                        <span className="text-5xl font-black text-secondary tracking-tighter">Rp 0</span>
                        <span className="text-muted-foreground font-bold mb-2">Selamanya</span>
                      </div>
                    </div>
                    <div className="flex-grow space-y-4 mb-8">
                      {["Point of Sale (POS) Standar", "Manajemen 1 Gudang", "Katalog Produk & Stok", "Laporan Penjualan Harian"].map((f, j) => (
                        <div key={j} className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                          <span className="font-bold text-secondary">{f}</span>
                        </div>
                      ))}
                    </div>
                    <Link href="/register?type=business&tier=trial">
                      <Button className="w-full h-14 font-black rounded-xl text-lg bg-muted text-secondary hover:bg-muted/80">
                        Mulai Gratis
                      </Button>
                    </Link>
                  </div>
                  <div className="relative bg-secondary rounded-3xl p-8 border border-primary shadow-2xl shadow-primary/20 flex flex-col">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-sm">
                      Solusi Terbaik
                    </div>
                    <div className="mb-8">
                      <h3 className="text-2xl font-black text-white">Tumbuhin Full</h3>
                      <p className="text-sm font-bold text-slate-400 mt-1 mb-6">ERP Otonom & AI Analyst</p>
                      <div className="flex items-end gap-2">
                        <span className="text-5xl font-black text-white tracking-tighter">Rp 99rb</span>
                        <span className="text-slate-400 font-bold mb-2">/ bulan</span>
                      </div>
                    </div>
                    <div className="flex-grow space-y-4 mb-8 text-slate-200">
                      {["Multi-Gudang & Transfer Stok", "Manajemen Staf & RBAC", "Accounting Engine Otomatis", "AI Business Analyst", "Laporan Keuangan Lengkap"].map((f, j) => (
                        <div key={j} className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                          <span className="font-bold">{f}</span>
                        </div>
                      ))}
                    </div>
                    <Link href="/register?type=business&tier=full">
                      <Button className="w-full h-14 font-black rounded-xl text-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/30 border-none">
                        Pilih Paket Full
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="container mx-auto px-6 py-20">
          <div className="bg-secondary rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/20 to-transparent"></div>
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-black mb-8 text-white tracking-tight">Siap Memulai Perjalanan Anda?</h2>
              <p className="text-slate-300 mb-12 text-xl font-medium leading-relaxed">
                Bergabunglah dengan ribuan pengguna lainnya yang telah merasakan kemudahan dalam mengatur keuangan dan bisnis bersama Tumbuhin.
              </p>
              <Link href="/register">
                <Button size="lg" className="bg-white text-secondary hover:bg-slate-50 h-16 px-12 text-xl font-black rounded-2xl shadow-xl transition-all hover:scale-105">
                  Daftar Sekarang Secara Gratis
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 relative z-10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8 pb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-xl">T</div>
              <span className="text-2xl font-black text-slate-900 tracking-tight">Tumbuhin</span>
            </div>
            <div className="flex gap-8 text-sm font-bold text-slate-500">
              <Link href="#" className="hover:text-amber-600 transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-amber-600 transition-colors">Terms of Service</Link>
              <Link href="#" className="hover:text-amber-600 transition-colors">Contact Us</Link>
            </div>
          </div>
          <div className="text-center text-sm font-bold text-slate-400">
            © 2026 Tumbuhin. Dibuat dengan 💚 untuk UMKM dan Individu.
          </div>
        </div>
      </footer>
    </div>
  );
}
