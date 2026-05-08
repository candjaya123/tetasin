# 🗺️ Master Strategi — Tumbuhin (Dual-Purpose Platform)

**Dibuat:** 8 Mei 2026
**Tujuan Dokumen:** Blueprint arsitektur platform Tumbuhin yang beroperasi sebagai sistem ganda: **ERP Bisnis (B2B)** dan **Personal Finance Tracker (B2C)**. Dokumen ini menggantikan strategi lama dan berfokus pada penyederhanaan fitur dan sistem langganan.

---

## 1. Visi Dual-Purpose (Pemisahan Total)

Tumbuhin melayani dua segmentasi pengguna dengan antarmuka dan *flow* yang diisolasi satu sama lain agar tidak membingungkan pengguna.

### A. Tumbuhin Bisnis (B2B)
- **Target:** UMKM, Retail, F&B, Jasa.
- **Fitur Utama:** Kasir (POS), Manajemen Inventaris & Multi-gudang, Manajemen Staf (Role: Kasir, Stok), Laporan Keuangan Lengkap (Neraca, Laba Rugi, Jurnal), CFO Virtual (AI).
- **Struktur Entitas:** Membutuhkan entitas "Toko/Bisnis" (Tenant).

### B. Tumbuhin Personal (B2C)
- **Target:** Individu, Perencana Keuangan Keluarga.
- **Fitur Utama:** Pencatat Pemasukan/Pengeluaran Harian, Budgeting, Laporan Sederhana (Sisa Saldo, Arus Kas), Asisten Keuangan Pribadi (AI).
- **Struktur Entitas:** Entitas bisnis disembunyikan (*background name*: "Personal Workspace"). Tidak ada konsep Staf, Kasir, atau Stok.

---

## 2. Struktur Langganan (Tiering) yang Disederhanakan

Sistem tiering lama (`free`, `business`, `ai`) sepenuhnya DIBUANG. Saat ini, sistem langganan dibuat seragam dan sederhana untuk semua jenis akun.

Setiap akun (Bisnis maupun Personal) hanya memiliki dua kemungkinan status fitur:

### 🌟 1. Trial (Free)
- Berlaku sebagai status bawaan saat mendaftar.
- **Limitasi:**
  - Bisnis: Dibatasi 1 Gudang, fitur CFO AI terkunci, laporan keuangan tingkat lanjut terkunci.
  - Personal: Dibatasi koneksi bank (jika ada), rekomendasi investasi AI terkunci.

### 👑 2. Full (Premium)
- Terbuka penuh tanpa limitasi fungsionalitas.
- **Akses:**
  - Bisnis: Multi-gudang, Analisis Prediktif AI, Laporan Neraca lengkap.
  - Personal: Auto-kategorisasi mutasi canggih, Asisten Keuangan Personal tanpa batas limit harian.

---

## 3. Matriks Basis Data (Supabase & NestJS)

Pemisahan ini dijamin di tingkat *database* dan kontrol akses backend:

| Tabel / Kolom | Mode Bisnis | Mode Personal |
|---|---|---|
| `tenants.account_type` | `'business'` | `'personal'` |
| `tenants.tier` | `'trial'` atau `'full'` | `'trial'` atau `'full'` |
| `tenants.name` | Sesuai input (Misal: "Kopi Tumbuh") | Terkunci ("Personal Workspace") |
| `profiles.role` | `'owner'`, `'manager'`, `'cashier'`, `'warehouse'` | `'personal'` |

---

## 4. Strategi Eksekusi Pengembangan

Setiap pengembangan fitur ke depan wajib mengikuti *checklist* pemisahan ini:

1. **Routing & Visibilitas:**
   Baik di Web (Next.js) maupun Mobile (Flutter), menu "POS" dan "Inventaris" wajib disembunyikan jika `account_type == 'personal'`.
2. **AI Endpoint Separation:**
   - Prompt dan *context* AI untuk bisnis tidak boleh membaca tabel personal.
   - Endpoint backend: `POST /api/v1/ai/business/chat` dan `POST /api/v1/ai/personal/chat`.
3. **Penyederhanaan UI Registrasi:**
   Layar registrasi tidak boleh lagi memaksa pengguna memilih paket yang rumit. Cukup 2 arah: "Personal" atau "Bisnis", yang di dalamnya memilih "Mulai Gratis (Trial)" atau "Beli Akses Penuh (Full)".
