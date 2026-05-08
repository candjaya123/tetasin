# 🚀 Tumbuhin - SaaS ERP & Intelligent Accounting Platform

![Tumbuhin Banner](https://via.placeholder.com/1200x400/FDB827/ffffff?text=Tumbuhin+ERP+Platform)

Tumbuhin adalah platform **SaaS Enterprise Resource Planning (ERP)** terpadu yang dirancang untuk mendigitalkan dan mengotomatiskan operasional bisnis UMKM. Mulai dari Point of Sales (POS), manajemen inventaris multi-gudang, pengadaan (procurement), hingga pencatatan akuntansi (*double-entry bookkeeping*) yang didukung oleh kecerdasan buatan (AI).

Visi utama dari Tumbuhin adalah **"Upload kwitansi → Otomatis jadi jurnal akuntansi"** dengan fitur *Business Health Score* dan sistem operasional yang sepenuhnya tersentralisasi.

---

## 🏗️ Arsitektur Sistem

Tumbuhin menggunakan arsitektur **Modular Monolith** dengan pendekatan **Clean Architecture**. Memisahkan logika bisnis inti di backend untuk memastikan konsistensi data di semua platform (Web & Mobile).

*   **⚙️ Backend API**: NestJS (TypeScript) + BullMQ + PostgreSQL (Supabase)
*   **💻 Web Dashboard**: Next.js 14 (App Router) + Tailwind CSS + Shadcn UI
*   **📱 Mobile App**: Flutter (Dart) + Riverpod/Bloc + Clean Architecture
*   **🧠 AI Engine**: Google Gemini 1.5 Flash (OCR & Financial Insights)
*   **🗄️ Database & Auth**: Supabase (PostgreSQL + JWT Auth + RLS)
*   **💳 Payment**: Midtrans Integration

---

## 📂 Struktur Direktori

Proyek ini terbagi menjadi tiga komponen utama:

```text
tumbuhin/
├── backend/           # ⚙️ NestJS - Sentralisasi Logika Bisnis & Transaksi
├── web/               # 💻 Next.js - Web Dashboard untuk Management & Reporting
└── tumbuhin_flutter/  # 📱 Flutter - Aplikasi Mobile untuk POS & Operasional
```

---

## 🌟 Fitur Utama

### 1. 🛒 Point of Sales (POS)
Sistem kasir cerdas yang terintegrasi langsung dengan inventaris dan akuntansi.
*   **Multi-Payment:** Tunai, QRIS, dan transfer.
*   **Auto-Journaling:** Penjualan otomatis mencatat jurnal Debit/Kredit secara real-time.

### 2. 📦 Manajemen Inventaris
Kontrol pergerakan barang antar gudang.
*   **Multi-Gudang:** Kelola stok di berbagai lokasi.
*   **BOM (Bill of Materials):** Manajemen resep dan bahan baku otomatis.

### 3. 📈 Akuntansi Otomatis
Sistem double-entry bookkeeping tingkat enterprise tanpa input manual rumit.
*   **Laporan Real-time:** Neraca, Laba Rugi, dan Arus Kas tersedia seketika.
*   **Akurasi Tinggi:** Validasi deterministik untuk memastikan balance.

### 4. 🤖 AI Assistant & OCR
Virtual CFO untuk membantu menganalisis kesehatan bisnis Anda.
*   **Smart OCR:** Foto kwitansi dan biarkan AI membuat draf jurnalnya.
*   **Business Insights:** Tanya jawab dengan data keuangan Anda melalui AI Chat.

---

---

## 🚀 Panduan Instalasi & Konfigurasi

### 1. Setup Backend (NestJS)
Backend bertindak sebagai pusat logika bisnis dan pengolahan data.

**Langkah-langkah:**
1. Masuk ke direktori backend: `cd backend`
2. Instal dependensi: `npm install`
3. Buat file `.env` dan sesuaikan variabel berikut:

```env
PORT=8080
# Supabase Configuration
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
SUPABASE_JWT_SECRET="your-jwt-secret"

# Database Direct Connection
DATABASE_URL="postgresql://postgres:password@db.your-project.supabase.co:5432/postgres"

# AI & External Services
GEMINI_API_KEY="your-gemini-api-key"
MIDTRANS_SERVER_KEY="your-midtrans-server-key"
MIDTRANS_CLIENT_KEY="your-midtrans-client-key"

# Queue Configuration (Redis)
USE_MOCK_REDIS=true # Set false jika menggunakan Redis asli
```

4. Jalankan dalam mode pengembangan: `npm run start:dev`

---

### 2. Setup Web Dashboard (Next.js)
Dashboard manajemen untuk owner dan admin tenant.

**Langkah-langkah:**
1. Masuk ke direktori web: `cd web`
2. Instal dependensi: `npm install`
3. Buat file `.env.local` dan sesuaikan variabel berikut:

```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
NEXT_PUBLIC_BACKEND_URL="http://localhost:8080" # URL Backend API
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY="your-midtrans-client-key"
```

4. Jalankan dashboard: `npm run dev`

---

### 3. Setup Mobile App (Flutter)
Aplikasi mobile untuk operasional kasir (POS) dan scan inventaris.

**Langkah-langkah:**
1. Pastikan Flutter SDK sudah terinstal (v3.x+).
2. Masuk ke direktori: `cd tumbuhin_flutter`
3. Instal dependensi: `flutter pub get`
4. Buat file `.env` di root folder `tumbuhin_flutter/` (pastikan terdaftar di `assets` pada `pubspec.yaml`):

```env
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
BACKEND_URL="http://[IP_LOKAL_ANDA]:8080" # Gunakan IP lokal jika running di HP fisik
```

5. Jalankan aplikasi:
   *   Chrome (Web): `flutter run -d chrome`
   *   Android/iOS: `flutter run`

---

---

## 🛡️ Aturan Pengembangan (PENTING!)

1.  **API Centralization**: Seluruh operasi penulisan data (CUD) **WAJIB** melalui Backend API. Mobile dan Web dilarang menulis langsung ke Database Supabase.
2.  **Deterministic Logic**: Logika perhitungan keuangan dan stok harus dikelola oleh kode (deterministik), AI hanya digunakan untuk ekstraksi data dan wawasan.
3.  **Clean Code**: Ikuti pola Clean Architecture yang sudah diterapkan di masing-masing modul.

---
*Dibangun untuk merevolusi operasional UMKM Indonesia.* 🇮🇩
