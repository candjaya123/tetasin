# 🚀 Tumbuhin - SaaS ERP & Intelligent Accounting Platform

![Tumbuhin Banner](https://via.placeholder.com/1200x400/FDB827/ffffff?text=Tumbuhin+ERP+Platform)

**Tumbuhin** adalah platform **Multi-Tenant SaaS Enterprise Resource Planning (ERP)** terpadu yang dirancang untuk mendigitalkan seluruh siklus operasional UMKM Indonesia. Dari manajemen kasir (POS), inventaris multi-gudang, pengadaan (procurement), hingga pencatatan akuntansi otomatis (*double-entry bookkeeping*) yang didukung oleh kecerdasan buatan (AI).

---

## 🏗️ Arsitektur & Teknologi

Tumbuhin dibangun dengan prinsip **Modular Monolith** dan **Clean Architecture** untuk menjamin skalabilitas tanpa kompleksitas mikroservis yang berlebihan di tahap awal.

### ⚙️ Backend (NestJS)
- **Framework**: NestJS (TypeScript)
- **Pola**: Service-Repository Pattern (Strict Separation)
- **Database**: PostgreSQL (via Supabase) + Drizzle/Raw SQL for complex aggregations.
- **Queue**: BullMQ + Redis for asynchronous background jobs (AI Processing, Reports).
- **Precision**: `Decimal.js` untuk seluruh kalkulasi finansial (Mencegah floating point errors).

### 💻 Web Dashboard (Next.js)
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + Shadcn UI
- **State**: React Query + Server Actions
- **Roles**: Multi-tier dashboards (Owner, Manager, Cashier, Stock).

### 📱 Mobile App (Flutter)
- **Framework**: Flutter (Dart)
- **State Management**: Riverpod
- **Pattern**: Clean Architecture (Layered: Data -> Domain -> Presentation)
- **Features**: POS, Receipt Scanner, Real-time stock updates.

### 🧠 AI Engine (Google Gemini)
- **Model**: Gemini 2.5 Flash
- **Capabilities**: OCR Receipt Scanning, Natural Language Financial Chat (CFO), Intelligent restock recommendations.

---

## 📂 Struktur Proyek

```text
tumbuhin/
├── backend/           # ⚙️ NestJS - Business Logic, Accounting Engine, AI RAG
├── web/               # 💻 Next.js - Admin & Manager Dashboard (ERP Hub)
├── tumbuhin_flutter/  # 📱 Flutter - Mobile POS & Operational App
└── docs/              # 📚 Technical Blueprints & Architectural Decisions
```

---

## 🌟 Fitur Utama (Core Domains)

### 1. 🛒 Omnichannel POS
Sistem kasir yang sinkron antara Web dan Mobile.
- **Auto-Journaling**: Penjualan otomatis mencatat Debit (Kas) dan Kredit (Pendapatan/Persediaan).
- **Tax & Promo**: Perhitungan pajak (PPN 11%) dan diskon secara deterministik.

### 2. 📦 Inventaris & Produksi (BOM)
- **Multi-Warehouse**: Pelacakan stok di berbagai lokasi fisik.
- **Product Recipes (BOM)**: Penjualan produk jadi otomatis memotong stok bahan baku berdasarkan resep.
- **Stock Opname & Transfer**: Alur validasi pergerakan barang yang ketat.

### 3. ⚖️ Akuntansi Double-Entry Standar ERP
- **Engine Akuntansi**: Sistem Jurnal Umum, Buku Besar (Ledger), dan Neraca Saldo.
- **Laporan Otomatis**: Laba Rugi, Neraca, dan Arus Kas dihasilkan secara real-time.
- **Tenant Isolation**: Isolasi data berbasis `tenant_id` dan Supabase Row Level Security (RLS).

### 4. 🤖 AI Virtual CFO
- **"Upload Receipt → Journal"**: Scan struk fisik dan biarkan AI mengekstraksi data menjadi draft jurnal.
- **Financial Advisory**: Analisis kesehatan bisnis berdasarkan data historis melalui chat.

---

## 👥 Profil Pengguna: Personal vs Bisnis

Platform ini mendukung dua mode penggunaan utama dalam satu basis kode:
- **Mode Personal**: Fokus pada pelacakan pengeluaran sederhana, anggaran, dan arus kas pribadi.
- **Mode Bisnis**: Full ERP suite termasuk inventaris, POS, dan akuntansi B2B lengkap.

---

## 🛡️ Aturan Pengembangan (Strict Rules)

Bagi pengembang yang bergabung, wajib mematuhi aturan berikut (Detail di `docs/ai_rules.md`):

1. **Service-Repository Pattern**: Controller dilarang memanggil Repository secara langsung. Gunakan Service sebagai orkestrator.
2. **Database Isolation**: Seluruh kueri wajib menyertakan filter `tenant_id`. Data leak antar tenant adalah pelanggaran keamanan fatal.
3. **Deterministic Calculations**: Jangan biarkan AI menghitung angka. Gunakan `Decimal.js` di backend untuk seluruh operasi matematika.
4. **API First**: Mobile dan Web tidak boleh menulis langsung ke database (Bypass API). Seluruh mutasi data harus melalui Backend NestJS.

---

## 🚀 Instalasi Cepat

### Prerequisites
- Node.js v18+
- Flutter SDK v3.10+
- Redis (atau gunakan `USE_MOCK_REDIS=true` di .env)
- Supabase Account

### Setup
1. **Backend**: `cd backend && npm install && npm run start:dev`
2. **Web**: `cd web && npm install && npm run dev`
3. **Mobile**: `cd tumbuhin_flutter && flutter pub get && flutter run`

*Pastikan seluruh file `.env` sudah dikonfigurasi berdasarkan template di masing-masing folder.*

---

## 🗺️ Roadmap & Status

- [x] Phase 1: Core Modular Architecture
- [x] Phase 2: Accounting Engine & Journaling
- [x] Phase 3: AI CFO Integration (Gemini)
- [x] Phase 4: Inventory BOM & Multi-Warehouse
- [x] Phase 5: Personal vs Business Profile Split
- [/] Phase 6: Final End-to-End Testing & Polish

---
*Dibuat untuk merevolusi UMKM Indonesia dengan teknologi Enterprise yang terjangkau.* 🇮🇩
