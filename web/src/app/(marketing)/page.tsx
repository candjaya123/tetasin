'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Zap,
  Wallet,
  Target,
  PieChart,
  CreditCard,
  Store,
  LayoutDashboard,
  Package,
  Bot,
  Crown,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Users,
  ChevronRight,
  Menu,
  X,
  BarChart3,
  CheckCircle2,
  Smartphone,
} from "lucide-react";

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen overflow-hidden font-sans" style={{ background: 'rgb(9,9,11)' }}>

      {/* ================================================
          CINEMATIC BACKGROUND — Full-page abstract illustration + mesh
          ================================================ */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Illustration as background layer */}
        <Image
          src="/hero_illustration.png"
          alt=""
          fill
          className="object-cover opacity-[0.12] mix-blend-luminosity"
          priority
        />
        {/* Dark overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/80 via-zinc-950/60 to-zinc-950/90" />
        {/* Ambient mesh orbs */}
        <div className="absolute top-[-15%] left-[-8%] w-[55%] h-[55%] bg-amber-500/25 rounded-full blur-[160px] animate-blob" />
        <div className="absolute top-[5%] right-[-10%] w-[40%] h-[50%] bg-orange-600/15 rounded-full blur-[140px] animate-blob" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-[10%] left-[10%] w-[50%] h-[40%] bg-amber-700/12 rounded-full blur-[160px] animate-blob" style={{ animationDelay: '4s' }} />
        <div className="absolute bottom-[-5%] right-[5%] w-[35%] h-[45%] bg-yellow-500/10 rounded-full blur-[130px] animate-blob" style={{ animationDelay: '6s' }} />
        {/* Noise grain overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '256px 256px',
          }}
        />
      </div>

      {/* ================================================
          NAVIGATION — Dark glass floating navbar
          ================================================ */}
      <nav className="fixed top-3 sm:top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl z-50 rounded-2xl sm:rounded-3xl border border-white/10 backdrop-blur-2xl shadow-lg" style={{ background: 'rgba(24,24,27,0.75)' }}>
        <div className="px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between relative">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-bold text-base sm:text-lg shadow-lg" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff' }}>T</div>
            <span className="text-lg sm:text-xl font-bold text-white tracking-tight">Tetasin</span>
          </div>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1 text-sm font-medium text-zinc-400">
            {[
              { label: 'Personal', href: '#personal' },
              { label: 'Bisnis', href: '#bisnis' },
              { label: 'Harga', href: '#pricing' },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="px-4 py-2 rounded-xl hover:text-white hover:bg-white/8 transition-all duration-200"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="hidden sm:inline-flex font-medium text-zinc-400 hover:text-white text-sm px-4 py-2 rounded-xl hover:bg-white/8 transition-all duration-200"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="hidden sm:inline-flex items-center font-semibold rounded-xl px-4 h-9 sm:h-10 text-xs sm:text-sm transition-all duration-200 shadow-lg shadow-amber-500/20"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff' }}
            >
              Mulai Gratis
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Link>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 hover:bg-white/10 rounded-xl transition-colors cursor-pointer focus:outline-none shrink-0"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-zinc-300 animate-in fade-in spin-in-90 duration-200" />
              ) : (
                <Menu className="w-5 h-5 text-zinc-300 animate-in fade-in duration-200" />
              )}
            </button>

            {isMobileMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-transparent"
                  onClick={() => setIsMobileMenuOpen(false)}
                />
                <div className="absolute left-0 right-0 top-full mt-2 border border-white/10 backdrop-blur-2xl rounded-2xl shadow-2xl p-4 space-y-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200" style={{ background: 'rgba(18,18,20,0.97)' }}>
                  {[
                    { label: 'Personal', href: '#personal' },
                    { label: 'Bisnis', href: '#bisnis' },
                    { label: 'Harga', href: '#pricing' },
                  ].map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-3 rounded-xl text-sm font-semibold text-zinc-400 hover:text-white hover:bg-white/8 transition-all"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <div className="flex gap-2 pt-2 border-t border-white/10">
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex-1 flex items-center justify-center rounded-xl text-sm font-bold h-11 border border-white/15 text-zinc-300 hover:text-white hover:bg-white/8 transition-all"
                    >
                      Masuk
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex-1 flex items-center justify-center rounded-xl text-sm font-bold h-11 shadow-lg shadow-amber-500/20 transition-all"
                      style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff' }}
                    >
                      Mulai Gratis
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-grow relative z-10">

        {/* ================================================
            HERO SECTION — Cinematic dark editorial
            ================================================ */}
        <section className="relative pt-32 sm:pt-44 md:pt-52 pb-20 sm:pb-32">
          <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
            <div className="text-center max-w-4xl mx-auto">

              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-amber-500/30 text-amber-400 text-[11px] sm:text-xs font-semibold tracking-wide mb-6 sm:mb-8 backdrop-blur-sm" style={{ background: 'rgba(245,158,11,0.08)' }}>
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Satu Platform, Dua Solusi</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white mb-4 sm:mb-6 leading-[1.05]">
                Kendalikan{' '}
                <span style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b, #d97706)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  Keuangan &amp; Bisnis
                </span>
                <br />
                Dalam Satu Layar
                <span style={{ color: '#f59e0b' }}>.</span>
              </h1>

              {/* Subheadline */}
              <p className="text-sm sm:text-lg md:text-xl text-zinc-400 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
                Baik Anda mengatur anggaran pribadi atau mengelola operasional UMKM,
                Tetasin memberikan alat yang tepat untuk pertumbuhan finansial Anda.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <Link
                  href="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center h-14 sm:h-16 text-base sm:text-lg px-8 sm:px-12 rounded-2xl font-bold text-white shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-amber-500/40"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 8px 32px rgba(245,158,11,0.35)' }}
                >
                  Coba Sekarang — Gratis!
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <Link
                  href="#pricing"
                  className="w-full sm:w-auto inline-flex items-center justify-center h-14 sm:h-16 text-base sm:text-lg px-8 sm:px-12 rounded-2xl font-semibold text-zinc-200 border border-white/15 backdrop-blur-sm transition-all duration-300 hover:border-white/30 hover:text-white hover:bg-white/5"
                >
                  Lihat Paket
                </Link>
                <Link
                  href="https://github.com/candjaya123/tetasin/releases/download/demo2/tetasin-demo2.apk"
                  className="w-full sm:w-auto inline-flex items-center justify-center h-14 sm:h-16 text-base sm:text-lg px-8 sm:px-12 rounded-2xl font-semibold text-zinc-200 border border-white/15 backdrop-blur-sm transition-all duration-300 hover:border-amber-500/30 hover:text-amber-300 hover:bg-amber-500/5"
                >
                  <Smartphone className="w-5 h-5 mr-2" />
                  Download App
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="mt-14 sm:mt-20 pt-8 sm:pt-12 border-t border-white/8">
                <p className="text-[10px] sm:text-xs font-semibold text-zinc-600 uppercase tracking-widest mb-4 sm:mb-6">
                  Dipercaya oleh pengguna tangguh
                </p>
                <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-10 opacity-25">
                  {['INDIEHACKERS', 'UMKMBISA', 'FINANCE.ID', 'STARTUPINA'].map((name) => (
                    <span key={name} className="font-bold text-base sm:text-xl tracking-tighter text-white">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating stat cards */}
            <div className="mt-20 sm:mt-28 relative">
              {/* Glow behind cards */}
              <div className="absolute inset-0 blur-3xl opacity-20 rounded-3xl" style={{ background: 'radial-gradient(ellipse at center, #f59e0b 0%, transparent 70%)' }} />

              <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto">
                {[
                  { label: 'Total Pengguna', value: '12.4K+', icon: Users, color: '#f59e0b' },
                  { label: 'Transaksi / Hari', value: '80K+', icon: BarChart3, color: '#10b981' },
                  { label: 'Revenue Tercatat', value: 'Rp 4.2B', icon: TrendingUp, color: '#8b5cf6' },
                  { label: 'Uptime', value: '99.9%', icon: ShieldCheck, color: '#3b82f6' },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-white/8 backdrop-blur-xl p-4 sm:p-5 flex flex-col items-center text-center transition-all duration-300 hover:border-white/20 hover:scale-105"
                    style={{ background: 'rgba(255,255,255,0.04)' }}
                  >
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3" style={{ background: `${stat.color}20` }}>
                      <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-[10px] sm:text-xs text-zinc-500 mt-1 font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ================================================
            DUAL-PATH — Personal & Business
            ================================================ */}
        <section className="container mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center mb-10 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 text-zinc-400 text-xs font-semibold tracking-wide mb-4" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Dua Jalur, Satu Platform
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-3 sm:mb-4 tracking-tight">
              Dirancang untuk Tujuan Anda
            </h2>
            <p className="text-sm sm:text-lg text-zinc-400 max-w-2xl mx-auto">
              Pilih jalur Anda. Tetasin beradaptasi dengan kebutuhan Anda,
              memberikan UI dan fitur yang paling relevan.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5 sm:gap-6 max-w-5xl mx-auto">
            {/* Personal Card */}
            <div id="personal" className="group relative rounded-3xl p-6 sm:p-8 border border-white/8 backdrop-blur-xl overflow-hidden transition-all duration-500 hover:border-amber-500/30" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <div className="absolute top-0 right-0 w-56 h-56 rounded-full blur-3xl -mr-16 -mt-16 transition-all duration-700 opacity-0 group-hover:opacity-100" style={{ background: 'rgba(245,158,11,0.12)' }} />
              <div className="absolute inset-0 rounded-3xl transition-opacity duration-500 opacity-0 group-hover:opacity-100" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.04), transparent)' }} />

              <div className="relative z-10">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mb-5 sm:mb-6 border border-amber-500/20" style={{ background: 'rgba(245,158,11,0.1)' }}>
                  <Wallet className="w-6 h-6 sm:w-7 sm:h-7 text-amber-400" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest mb-4 border border-amber-500/20 text-amber-400" style={{ background: 'rgba(245,158,11,0.08)' }}>
                  Personal
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">Personal Money Planner</h3>
                <p className="text-sm sm:text-base text-zinc-400 leading-relaxed mb-6 sm:mb-8">
                  Lacak pengeluaran, buat anggaran bulanan, dan capai target tabungan
                  Anda dengan mudah. Tidak ada istilah akuntansi yang rumit.
                </p>
                <ul className="space-y-3 sm:space-y-4 mb-8 sm:mb-10">
                  {[
                    { icon: PieChart, text: "Analisa Alur Kas Otomatis" },
                    { icon: Target, text: "Manajemen Target Tabungan" },
                    { icon: CreditCard, text: "Pencatatan Transaksi Harian" },
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-zinc-300 font-medium text-sm sm:text-base">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 border border-white/8" style={{ background: 'rgba(245,158,11,0.08)' }}>
                        <item.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                      </div>
                      {item.text}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register?type=personal"
                  className="w-full inline-flex items-center justify-center h-12 sm:h-13 rounded-2xl font-semibold text-sm sm:text-base border border-white/15 text-zinc-200 transition-all duration-300 hover:border-amber-500/40 hover:text-amber-300 hover:bg-amber-500/5"
                >
                  Mulai Personal Tracker
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>

            {/* Business Card — featured */}
            <div id="bisnis" className="group relative rounded-3xl p-6 sm:p-8 border border-amber-500/20 backdrop-blur-xl overflow-hidden transition-all duration-500" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(217,119,6,0.05))' }}>
              <div className="absolute top-0 left-0 w-full h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.6), transparent)' }} />
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -mr-20 -mt-20 transition-all duration-700" style={{ background: 'rgba(245,158,11,0.15)' }} />
              <div className="absolute inset-0 rounded-3xl transition-opacity duration-500 opacity-0 group-hover:opacity-100" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.06), transparent)' }} />

              <div className="relative z-10">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mb-5 sm:mb-6 border border-amber-500/30" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(217,119,6,0.15))' }}>
                  <Store className="w-6 h-6 sm:w-7 sm:h-7 text-amber-400" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest mb-4 border border-amber-500/30 text-amber-300" style={{ background: 'rgba(245,158,11,0.12)' }}>
                  <Crown className="w-3 h-3" /> Business ERP
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">Business ERP &amp; POS</h3>
                <p className="text-sm sm:text-base text-zinc-400 leading-relaxed mb-6 sm:mb-8">
                  Dari kasir hingga laporan laba rugi. Otomatisasi operasional toko
                  Anda dengan sistem ERP kelas enterprise yang disederhanakan.
                </p>
                <ul className="space-y-3 sm:space-y-4 mb-8 sm:mb-10">
                  {[
                    { icon: LayoutDashboard, text: "Sistem Kasir (POS) Offline-first" },
                    { icon: Package, text: "Manajemen Stok & Multi-Gudang" },
                    { icon: Bot, text: "AI Data Analyst & Prediksi Tren" },
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-zinc-300 font-medium text-sm sm:text-base">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 border border-amber-500/20" style={{ background: 'rgba(245,158,11,0.1)' }}>
                        <item.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                      </div>
                      {item.text}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register?type=business"
                  className="w-full inline-flex items-center justify-center h-12 sm:h-13 rounded-2xl font-bold text-sm sm:text-base text-white transition-all duration-300 hover:scale-[1.02] shadow-xl shadow-amber-500/25"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
                >
                  Mulai Manajemen Bisnis
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================
            FEATURES BENTO — Dark glass grid
            ================================================ */}
        <section className="container mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center mb-10 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 text-zinc-400 text-xs font-semibold tracking-wide mb-4" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
              Fitur Unggulan
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-3 sm:mb-4 tracking-tight">
              Semua yang Anda Butuhkan
            </h2>
            <p className="text-sm sm:text-lg text-zinc-400 max-w-2xl mx-auto">
              Tools modern untuk mengelola keuangan dan bisnis dalam satu platform terintegrasi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 max-w-5xl mx-auto">
            {[
              {
                icon: ShieldCheck,
                title: "Keamanan Terjamin",
                desc: "Enkripsi end-to-end dan autentikasi ganda melindungi setiap transaksi Anda.",
                size: "md:col-span-1",
                accent: '#3b82f6',
              },
              {
                icon: TrendingUp,
                title: "Laporan Real-time",
                desc: "Dashboard interaktif dan laporan keuangan yang selalu up-to-date dengan visualisasi data yang indah.",
                size: "md:col-span-2",
                featured: true,
                accent: '#10b981',
              },
              {
                icon: Users,
                title: "Multi-Staf & Peran",
                desc: "Kelola akses tim Anda dengan kontrol berbasis peran yang fleksibel dan audit log yang lengkap.",
                size: "md:col-span-2",
                accent: '#8b5cf6',
              },
              {
                icon: Bot,
                title: "AI CFO Assistant",
                desc: "Analisa keuangan cerdas dan prediksi tren bisnis kapan saja.",
                size: "md:col-span-1",
                accent: '#f59e0b',
                golden: true,
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`group relative rounded-3xl p-6 sm:p-8 border border-white/8 backdrop-blur-xl overflow-hidden transition-all duration-500 hover:border-white/15 hover:scale-[1.01] ${item.size}`}
                style={{ background: item.golden ? 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(217,119,6,0.04))' : 'rgba(255,255,255,0.04)' }}
              >
                {item.featured && (
                  <div className="absolute top-0 left-0 w-full h-px" style={{ background: `linear-gradient(90deg, transparent, ${item.accent}60, transparent)` }} />
                )}
                {item.golden && (
                  <div className="absolute top-0 left-0 w-full h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.7), transparent)' }} />
                )}
                <div
                  className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl -mr-16 -mt-16 transition-all duration-700 opacity-0 group-hover:opacity-100"
                  style={{ background: `${item.accent}20` }}
                />
                <div className="relative z-10">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 border"
                    style={{ background: `${item.accent}15`, borderColor: `${item.accent}30` }}
                  >
                    <item.icon className="w-6 h-6" style={{ color: item.accent }} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================================================
            DOWNLOAD APP SECTION
            ================================================ */}
        <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <div className="rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-12 md:p-16 border border-white/10 backdrop-blur-xl relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <div className="absolute top-0 left-0 w-full h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.7), transparent)' }} />
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none" style={{ background: 'rgba(245,158,11,0.08)' }} />
            <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl -ml-24 -mb-24 pointer-events-none" style={{ background: 'rgba(139,92,246,0.06)' }} />

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 sm:gap-12">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 text-zinc-400 text-xs font-semibold tracking-wide mb-4" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                  Mobile App
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4 tracking-tight">
                  Tetasin di Genggaman Anda
                </h2>
                <p className="text-sm sm:text-lg text-zinc-400 leading-relaxed mb-6 sm:mb-8">
                  Download aplikasi mobile Tetasin dan kelola keuangan bisnis kapan saja,
                  di mana saja. Tersedia di Google Play Store dan Apple App Store.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="https://github.com/candjaya123/tetasin/releases/download/demo2/tetasin-demo2.apk"
                    className="inline-flex items-center justify-center h-12 sm:h-14 font-bold text-sm sm:text-base px-6 sm:px-8 rounded-2xl text-white transition-all duration-300 hover:scale-[1.02] shadow-xl shadow-amber-500/25"
                    style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
                  >
                    Download App
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                  <Link
                    href="https://github.com/candjaya123/tetasin/releases/download/demo2/tetasin-demo2.apk"
                    className="inline-flex items-center justify-center h-12 sm:h-14 font-semibold text-sm sm:text-base px-6 sm:px-8 rounded-2xl border border-white/15 text-zinc-200 transition-all duration-300 hover:border-white/30 hover:text-white hover:bg-white/5"
                  >
                    Info Selengkapnya
                  </Link>
                </div>
              </div>
              <div className="flex-1 flex justify-center">
                <div className="w-48 h-48 sm:w-60 sm:h-60 rounded-3xl border-2 border-dashed border-white/10 flex items-center justify-center relative" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <div className="absolute inset-0 rounded-3xl" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(139,92,246,0.06))' }} />
                  <Smartphone className="w-16 h-16 sm:w-20 sm:h-20 text-amber-400 relative z-10" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================
            PRICING — Premium glass card
            ================================================ */}
        <section id="pricing" className="py-16 sm:py-24 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[150px] pointer-events-none" style={{ background: 'rgba(245,158,11,0.08)' }} />

          <div className="container mx-auto px-4 sm:px-6 max-w-4xl relative z-10">
            <div className="rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-12 md:p-16 border border-white/10 backdrop-blur-xl text-center relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
              {/* Top golden line */}
              <div className="absolute top-0 left-0 w-full h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.7), transparent)' }} />
              <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" style={{ background: 'rgba(245,158,11,0.08)' }} />
              <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" style={{ background: 'rgba(245,158,11,0.06)' }} />

              <div className="relative z-10">
                <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-amber-500/30 text-amber-400 text-[11px] sm:text-xs font-semibold tracking-wide mb-6 sm:mb-8" style={{ background: 'rgba(245,158,11,0.08)' }}>
                  <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Full Access for Everyone</span>
                </div>

                <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-4 sm:mb-6 tracking-tight max-w-2xl mx-auto leading-tight">
                  Satu Platform. Tanpa Batasan.
                  <br />
                  <span style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    Tanpa Biaya Tersembunyi.
                  </span>
                </h2>

                <p className="text-sm sm:text-lg text-zinc-400 max-w-2xl mx-auto mb-8 sm:mb-12 leading-relaxed">
                  Kami percaya alat finansial yang hebat harus bisa diakses oleh siapa saja.
                  Tetasin hadir dengan model <strong className="text-amber-400">Full Access</strong>.
                  Tidak ada lagi fitur yang dikunci di balik paywall.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5 mb-8 sm:mb-12">
                  {[
                    { title: "Semua Fitur Terbuka", desc: "Dari POS hingga Laporan Neraca, semua bisa diakses." },
                    { title: "Tanpa Limit Data", desc: "Input transaksi, produk, dan gudang sebanyak yang Anda butuhkan." },
                    { title: "AI Assistant Gratis", desc: "Konsultasi dengan CFO Virtual tanpa batas harian." },
                  ].map((item, i) => (
                    <div key={i} className="p-4 sm:p-6 rounded-2xl border border-white/8 text-left transition-all duration-300 hover:border-amber-500/20" style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center mb-3" style={{ background: 'rgba(245,158,11,0.15)' }}>
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                      <h4 className="font-semibold text-white mb-1.5 sm:mb-2 text-sm sm:text-base">{item.title}</h4>
                      <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>

                <Link
                  href="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center h-14 sm:h-16 text-base sm:text-lg px-8 sm:px-12 rounded-2xl font-bold text-white transition-all duration-300 hover:scale-[1.02] shadow-2xl"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 8px 40px rgba(245,158,11,0.35)' }}
                >
                  Mulai Gunakan Full Access
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================
            FINAL CTA — Immersive dark editorial
            ================================================ */}
        <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <div className="rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-12 md:p-20 text-center relative overflow-hidden border border-white/8">
            {/* Layered background */}
            <div className="absolute inset-0 rounded-[2rem] sm:rounded-[3rem]" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(9,9,11,0.9), rgba(217,119,6,0.08))' }} />
            <div className="absolute top-0 left-0 w-full h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.5), transparent)' }} />
            <div className="absolute inset-0 backdrop-blur-xl rounded-[2rem] sm:rounded-[3rem]" />

            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4 sm:mb-6 text-white tracking-tight leading-tight">
                Siap Memulai
                <br />
                <span style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  Perjalanan Anda?
                </span>
              </h2>
              <p className="text-sm sm:text-lg text-zinc-400 mb-6 sm:mb-10 leading-relaxed">
                Bergabunglah dengan ribuan pengguna yang telah merasakan kemudahan
                dalam mengatur keuangan dan bisnis bersama Tetasin.
              </p>
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center h-14 sm:h-16 text-base sm:text-lg px-8 sm:px-12 rounded-2xl font-bold text-zinc-900 transition-all duration-300 hover:scale-[1.02] shadow-2xl"
                style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', boxShadow: '0 8px 40px rgba(245,158,11,0.4)' }}
              >
                Daftar Sekarang Secara Gratis
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* ================================================
          FOOTER — Dark minimal
          ================================================ */}
      <footer className="border-t border-white/8 py-8 sm:py-12 relative z-10" style={{ background: 'rgba(9,9,11,0.9)' }}>
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-bold text-base sm:text-lg" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff' }}>T</div>
              <span className="text-lg sm:text-xl font-bold text-white tracking-tight">Tetasin</span>
            </div>
            <div className="flex gap-4 sm:gap-6 text-xs sm:text-sm font-medium text-zinc-500">
              <Link href="#" className="hover:text-zinc-200 transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-zinc-200 transition-colors">Terms of Service</Link>
              <Link href="#" className="hover:text-zinc-200 transition-colors">Contact Us</Link>
            </div>
          </div>
          <div className="text-center text-[10px] sm:text-xs font-medium text-zinc-700">
            &copy; 2026 Tetasin. Dibuat dengan sepenuh hati untuk UMKM dan Individu.
          </div>
        </div>
      </footer>

    </div>
  );
}
