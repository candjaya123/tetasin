'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Smartphone,
  Zap,
  Shield,
  BarChart3,
  QrCode,
  Apple,
  Play,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export default function DownloadPage() {
  return (
    <div className="flex flex-col min-h-screen overflow-hidden font-sans" style={{ background: 'rgb(9,9,11)' }}>

      {/* ================================================
          CINEMATIC BACKGROUND
          ================================================ */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <Image
          src="/hero_illustration.png"
          alt=""
          fill
          className="object-cover opacity-[0.12] mix-blend-luminosity"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/80 via-zinc-950/60 to-zinc-950/90" />
        <div className="absolute top-[-15%] left-[-8%] w-[55%] h-[55%] bg-amber-500/25 rounded-full blur-[160px] animate-blob" />
        <div className="absolute top-[5%] right-[-10%] w-[40%] h-[50%] bg-orange-600/15 rounded-full blur-[140px] animate-blob" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-[10%] left-[10%] w-[50%] h-[40%] bg-amber-700/12 rounded-full blur-[160px] animate-blob" style={{ animationDelay: '4s' }} />
        <div className="absolute bottom-[-5%] right-[5%] w-[35%] h-[45%] bg-yellow-500/10 rounded-full blur-[130px] animate-blob" style={{ animationDelay: '6s' }} />
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
          NAVIGATION
          ================================================ */}
      <nav className="fixed top-3 sm:top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl z-50 rounded-2xl sm:rounded-3xl border border-white/10 backdrop-blur-2xl shadow-lg" style={{ background: 'rgba(24,24,27,0.75)' }}>
        <div className="px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between relative">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-bold text-base sm:text-lg shadow-lg transition-transform group-hover:scale-105" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff' }}>T</div>
            <span className="text-lg sm:text-xl font-bold text-white tracking-tight">Tetasin</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-zinc-400 hover:text-white px-4 py-2 rounded-xl hover:bg-white/8 transition-all duration-200"
          >
            Kembali
            <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>
      </nav>

      <main className="flex-grow relative z-10">

        {/* ================================================
            HERO — Download focus
            ================================================ */}
        <section className="relative pt-32 sm:pt-44 md:pt-52 pb-16 sm:pb-24">
          <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
            <div className="text-center max-w-3xl mx-auto">

              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-amber-500/30 text-amber-400 text-[11px] sm:text-xs font-semibold tracking-wide mb-6 sm:mb-8 backdrop-blur-sm" style={{ background: 'rgba(245,158,11,0.08)' }}>
                <Smartphone className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Mobile App</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-white mb-4 sm:mb-6 leading-[1.05]">
                Bawa{' '}
                <span style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b, #d97706)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  Bisnis Anda
                </span>
                <br />
                Dalam Genggaman
                <span style={{ color: '#f59e0b' }}>.</span>
              </h1>

              <p className="text-sm sm:text-lg md:text-xl text-zinc-400 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
                Pantau keuangan, kelola stok, dan proses transaksi kapan saja, di mana saja.
                Aplikasi mobile Tetasin memberi Anda kendali penuh dari ponsel Anda.
              </p>

              {/* Store Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-10">
                <a
                  href="https://github.com/candjaya123/tetasin/releases/download/demo2/tetasin-demo2.apk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 h-14 sm:h-16 px-8 sm:px-10 rounded-2xl font-semibold text-white border border-white/10 transition-all duration-300 hover:scale-[1.02] hover:border-white/30 hover:bg-white/5"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                >
                  <Apple className="w-5 h-5 sm:w-6 sm:h-6" />
                  <div className="text-left">
                    <div className="text-[10px] leading-none text-zinc-500">Download on the</div>
                    <div className="text-sm sm:text-base font-bold">App Store</div>
                  </div>
                </a>
                <a
                  href="https://github.com/candjaya123/tetasin/releases/download/demo2/tetasin-demo2.apk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 h-14 sm:h-16 px-8 sm:px-10 rounded-2xl font-bold text-white transition-all duration-300 hover:scale-[1.02] shadow-xl shadow-amber-500/25"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
                >
                  <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-white text-white" />
                  <div className="text-left">
                    <div className="text-[10px] leading-none text-amber-200">GET IT ON</div>
                    <div className="text-sm sm:text-base font-bold">Google Play</div>
                  </div>
                </a>
              </div>

              {/* QR Code placeholder */}
              <div className="inline-flex flex-col items-center gap-4 p-6 sm:p-8 rounded-3xl border border-white/8 backdrop-blur-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-2 border-dashed border-white/10 flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <QrCode className="w-12 h-12 sm:w-16 sm:h-16 text-zinc-600" />
                </div>
                <p className="text-xs sm:text-sm text-zinc-500 font-medium">
                  Scan QR code untuk download langsung
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================
            APP FEATURES
            ================================================ */}
        <section className="container mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center mb-10 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 text-zinc-400 text-xs font-semibold tracking-wide mb-4" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Kenapa Mobile App?
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-3 sm:mb-4 tracking-tight">
              Keuangan Anda, Di Mana Saja
            </h2>
            <p className="text-sm sm:text-lg text-zinc-400 max-w-2xl mx-auto">
              Semua fitur Tetasin kini tersedia di genggaman Anda. Ringan, cepat, dan aman.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 max-w-5xl mx-auto">
            {[
              {
                icon: Zap,
                title: "Cepat & Ringan",
                desc: "Aplikasi mobile kami dioptimalkan untuk performa. Cepat dibuka, minim penggunaan data, dan baterai.",
                accent: '#f59e0b',
              },
              {
                icon: Shield,
                title: "Keamanan Maksimal",
                desc: "Enkripsi end-to-end dan autentikasi biometrik menjaga data finansial Anda tetap terlindungi.",
                accent: '#3b82f6',
              },
              {
                icon: BarChart3,
                title: "Laporan Real-time",
                desc: "Dashboard interaktif dan notifikasi real-time untuk setiap transaksi dan laporan keuangan Anda.",
                accent: '#10b981',
              },
              {
                icon: Smartphone,
                title: "Offline-First POS",
                desc: "Sistem kasir tetap berfungsi tanpa internet. Sinkronisasi otomatis saat koneksi tersedia kembali.",
                accent: '#8b5cf6',
              },
              {
                icon: QrCode,
                title: "QRIS & Scan",
                desc: "Terima pembayaran QRIS dan scan barcode produk langsung dari kamera ponsel Anda.",
                accent: '#f59e0b',
              },
              {
                icon: Zap,
                title: "Multi-Perangkat",
                desc: "Sinkronisasi real-time antara web dan mobile. Lanjutkan pekerjaan di perangkat mana pun.",
                accent: '#ec4899',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="group relative rounded-3xl p-6 sm:p-8 border border-white/8 backdrop-blur-xl overflow-hidden transition-all duration-500 hover:border-white/15 hover:scale-[1.01]"
                style={{ background: 'rgba(255,255,255,0.04)' }}
              >
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
            DEVICE SHOWCASE
            ================================================ */}
        <section className="container mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-12 md:p-16 border border-white/10 backdrop-blur-xl text-center relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <div className="absolute top-0 left-0 w-full h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.7), transparent)' }} />
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" style={{ background: 'rgba(245,158,11,0.08)' }} />

            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6 tracking-tight">
                Cara Download
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-left">
                {[
                  { step: '1', title: 'Pilih Toko', desc: 'Buka Google Play Store atau Apple App Store di ponsel Anda.' },
                  { step: '2', title: 'Cari "Tetasin"', desc: 'Ketik "Tetasin" di kolom pencarian dan temukan aplikasi resmi kami.' },
                  { step: '3', title: 'Install & Mulai', desc: 'Unduh aplikasi, login dengan akun Anda, dan mulai mengelola bisnis.' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-3 sm:gap-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-white" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-sm sm:text-base mb-1">{item.title}</h4>
                      <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ================================================
            FINAL CTA
            ================================================ */}
        <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <div className="rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-12 md:p-20 text-center relative overflow-hidden border border-white/8">
            <div className="absolute inset-0 rounded-[2rem] sm:rounded-[3rem]" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(9,9,11,0.9), rgba(217,119,6,0.08))' }} />
            <div className="absolute top-0 left-0 w-full h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.5), transparent)' }} />
            <div className="absolute inset-0 backdrop-blur-xl rounded-[2rem] sm:rounded-[3rem]" />

            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4 sm:mb-6 text-white tracking-tight leading-tight">
                Siap Bawa Bisnis
                <br />
                <span style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  Di Genggaman Anda?
                </span>
              </h2>
              <p className="text-sm sm:text-lg text-zinc-400 mb-6 sm:mb-10 leading-relaxed">
                Download aplikasi Tetasin sekarang dan kelola keuangan bisnis dari mana saja.
              </p>
              <a
                href="https://github.com/candjaya123/tetasin/releases/download/demo2/tetasin-demo2.apk"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center h-14 sm:h-16 text-base sm:text-lg px-8 sm:px-12 rounded-2xl font-bold text-zinc-900 transition-all duration-300 hover:scale-[1.02] shadow-2xl"
                style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', boxShadow: '0 8px 40px rgba(245,158,11,0.4)' }}
              >
                Download Sekarang
                <ArrowRight className="w-5 h-5 ml-2" />
              </a>
            </div>
          </div>
        </section>

      </main>

      {/* ================================================
          FOOTER
          ================================================ */}
      <footer className="border-t border-white/8 py-8 sm:py-12 relative z-10" style={{ background: 'rgba(9,9,11,0.9)' }}>
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-bold text-base sm:text-lg transition-transform group-hover:scale-105" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff' }}>T</div>
              <span className="text-lg sm:text-xl font-bold text-white tracking-tight">Tetasin</span>
            </Link>
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
