# 📋 Panduan Testing Lengkap — POS & Inventaris

> **Untuk:** Tester — Non Programmer  
> **Platform:** 🌐 Web (Browser) + 📱 Mobile App (Android/iOS)  
> **Tujuan:** Memastikan semua fitur berjalan benar sebelum rilis  
> **Cara pakai:** Ikuti langkah demi langkah. Centang ✅ jika berhasil, ❌ jika gagal, ➖ jika tidak relevan.

---

## 📖 DAFTAR ISI

- [Glossary Istilah](#-glossary-istilah)
- [Persiapan Testing](#-persiapan-testing)
- [🌐 WEB: Testing Back-Office & Manajemen](#-web-testing-back-office--manajemen)
  - [W1: Registrasi & Login — Web](#w1-registrasi--login--web)
  - [W2: Akun Keuangan (COA) — Web](#w2-akun-keuangan-coa--web)
  - [W3: Bahan Baku — Web](#w3-bahan-baku--web)
  - [W4: Produk — Web](#w4-produk--web)
  - [W5: Gudang — Web](#w5-gudang--web)
  - [W6: Pembelian (Purchase Order) — Web](#w6-pembelian-purchase-order--web)
  - [W7: Transfer & Opname Stok — Web](#w7-transfer--opname-stok--web)
  - [W8: Promosi — Web](#w8-promosi--web)
  - [W9: OCR Scan Struk — Web](#w9-ocr-scan-struk--web)
  - [W10: Keuangan Pribadi — Web](#w10-keuangan-pribadi--web)
  - [W11: Tagihan (Bills) — Web](#w11-tagihan-bills--web)
  - [W12: Payout (Penarikan Saldo) — Web](#w12-payout-penarikan-saldo--web)
  - [W13: Notifikasi & Log — Web](#w13-notifikasi--log--web)
  - [W14: Aset — Web](#w14-aset--web)
  - [W15: Laporan & Dashboard — Web](#w15-laporan--dashboard--web)
  - [W16: Upload File & Storage — Web](#w16-upload-file--storage--web)
  - [W17: Superadmin & Pengaturan — Web](#w17-superadmin--pengaturan--web)
  - [W18: Keamanan & RLS — Web](#w18-keamanan--rls--web)
- [📱 MOBILE APP: Testing POS & Kasir](#-mobile-app-testing-pos--kasir)
  - [M1: Instalasi & Awal — Mobile](#m1-instalasi--awal--mobile)
  - [M2: Login & Sesi — Mobile](#m2-login--sesi--mobile)
  - [M3: POS / Kasir — Mobile](#m3-pos--kasir--mobile)
  - [M4: Void / Batalkan Transaksi — Mobile](#m4-void--batalkan-transaksi--mobile)
  - [M5: Cek Stok — Mobile](#m5-cek-stok--mobile)
  - [M6: Riwayat Transaksi — Mobile](#m6-riwayat-transaksi--mobile)
  - [M7: Notifikasi — Mobile](#m7-notifikasi--mobile)
  - [M8: Profil & Setting — Mobile](#m8-profil--setting--mobile)
  - [M9: Gesture & Navigasi — Mobile](#m9-gesture--navigasi--mobile)
  - [M10: Orientasi Layar & Kompatibilitas — Mobile](#m10-orientasi-layar--kompatibilitas--mobile)
  - [M11: Performance Mobile](#m11-performance-mobile)
  - [M12: Keamanan Mobile](#m12-keamanan-mobile)
- [🔗 CROSS-PLATFORM: Sinkronisasi Web + Mobile](#-cross-platform-sinkronisasi-web--mobile)
  - [X1: Sinkron Data Web ↔ App](#x1-sinkron-data-web--app)
  - [X2: Regresi Bug Fix](#x2-regresi-bug-fix)
- [Ringkasan Akhir](#-ringkasan-akhir)
- [Kriteria Lulus / Gagal](#-kriteria-lulus--gagal)
- [Template Laporan Bug](#-template-laporan-bug)

---

## 📖 GLOSSARY ISTILAH

| Istilah | Arti | Dipakai di |
|---------|------|------------|
| **Tenant** | Akun toko/bisnis — setiap pendaftaran membuat 1 tenant baru | Web + App |
| **COA / Chart of Accounts** | Daftar akun keuangan (Kas, Hutang, Modal, dll) — 31 akun untuk bisnis, 7 untuk pribadi | Web only |
| **Manager** | Pemilik toko — bisa melakukan semua operasi, termasuk void | Web + App |
| **Kasir** | Karyawan kasir — hanya bisa transaksi POS, tidak bisa void | Web + App |
| **Stok** | Karyawan gudang — hanya bisa kelola bahan baku & stok | Web only (bisa login app terbatas) |
| **Produk Fisik** | Barang biasa dengan stok — contoh: Air Mineral Botol | Web + App |
| **Produk Resep (Composite)** | Produk dari bahan baku — contoh: Kopi Susu = Kopi + Susu + Gula | Web (setup) + App (jual) |
| **Produk Jasa** | Layanan, tanpa stok — contoh: Jasa Konsultasi | Web + App |
| **HPP / COGS** | Harga Pokok Penjualan — modal dari produk | Web + App |
| **Resep / BOM** | Bill of Materials — daftar bahan baku & jumlah untuk membuat 1 produk | Web only |
| **Varian** | Pilihan produk — contoh: Ukuran Small / Large | Web (setup) + App (pilih) |
| **Addon** | Tambahan produk — contoh: Topping Boba / Whipped Cream | Web (setup) + App (pilih) |
| **Jurnal** | Catatan akuntansi double-entry (debit = kredit) — setiap transaksi menghasilkan jurnal | Web only |
| **PO** | Purchase Order — pesanan pembelian ke supplier | Web only |
| **Void** | Membatalkan transaksi yang sudah selesai — stok kembali, jurnal reversal | Web + App |
| **RLS** | Row Level Security — data antar toko terisolasi total | Web + App |
| **Idempotency Key** | Kode unik cegah transaksi ganda kalau tombol bayar diklik 2x | Web + App |
| **Split Payment** | Bayar dengan 2 metode sekaligus — contoh: Tunai Rp20rb + QRIS Rp22rb | App only |
| **Scan Barcode** | Pindai kode batang produk pakai kamera HP | App only |
| **Bluetooth Printer** | Printer struk kecil yang connect via Bluetooth | App only |
| **Drag & Drop** | Seret file ke area upload — khusus Web | Web only |

---

## 🛠️ PERSIAPAN TESTING

### Persiapan Bersama (Web + App)

| # | Persiapan | Sudah? |
|---|-----------|--------|
| 1 | Siapkan **3 akun email** berbeda: | |
| | `test-web-a@email.com` — untuk Toko A (Web) | ☐ |
| | `test-web-b@email.com` — untuk Toko B (Web, test isolasi) | ☐ |
| | `test-app-kasir@email.com` — untuk Role Kasir (App) | ☐ |
| | `test-app-manager@email.com` — untuk Role Manager (App) | ☐ |
| 2 | Siapkan **password seragam**: `Test123!` | ☐ |
| 3 | Siapkan **1 foto struk belanja** (JPG/PNG, maks 5MB) | ☐ |
| 4 | Siapkan **1 file PDF** untuk upload dokumen | ☐ |
| 5 | Siapkan **1 file gambar** (avatar) | ☐ |
| 6 | Siapkan **produk fisik dengan barcode yang jelas** (atau cetak barcode) | ☐ |
| 7 | Siapkan **stopwatch / timer** (HP) | ☐ |
| 8 | Pastikan **koneksi internet stabil** | ☐ |

### Persiapan Khusus Web

| # | Persiapan Web | Sudah? |
|---|---------------|--------|
| 1 | Browser terinstall: Chrome / Firefox / Edge (versi terbaru) | ☐ |
| 2 | Buka **2 tab/ window berbeda** untuk test multi-tenant | ☐ |
| 3 | Buka **1 tab Incognito/Private** untuk test public access | ☐ |
| 4 | Buka **DevTools** (F12) → tab Console — catat error JavaScript | ☐ (programmer) |

### Persiapan Khusus Mobile App

| # | Persiapan Mobile | Sudah? |
|---|------------------|--------|
| 1 | Install aplikasi di HP (Android / iOS) | ☐ |
| 2 | **Aktifkan izin:** Kamera ☐ Bluetooth ☐ Notifikasi ☐ Lokasi ☐ Penyimpanan ☐ | ☐ |
| 3 | Siapkan **printer Bluetooth** (jika ada) + kertas struk | ☐ |
| 4 | HP minimal: Android 8.0 / iOS 14 | ☐ |
| 5 | Pastikan **baterai > 50%** | ☐ |
| 6 | Siapkan HP kedua untuk test kompatibilitas (jika ada) | ☐ |

### Persiapan Data (Dilakukan Operator/Programmer Sebelum Testing)

| # | Data yang Harus Siap | Sudah? |
|---|----------------------|--------|
| 1 | 5+ produk dengan barcode berbeda | ☐ |
| 2 | 1 produk resep (Kopi Susu + 3 bahan baku) | ☐ |
| 3 | 1 produk dengan varian (Ukuran: Small/Large) | ☐ |
| 4 | 1 produk dengan addon (Topping: Boba/Cream) | ☐ |
| 5 | 1 produk jasa (tanpa stok) | ☐ |
| 6 | Stok bahan baku cukup untuk testing | ☐ |
| 7 | 1 produk dengan stok = 0 (untuk test stok habis) | ☐ |
| 8 | 1 promo aktif | ☐ |
| 9 | 2 gudang (Utama + Cabang) | ☐ |
| 10 | 1 Purchase Order (draft) | ☐ |

---

# 🌐 WEB: Testing Back-Office & Manajemen

> **Platform:** Browser (Chrome / Firefox / Edge) — Laptop/PC  
> **Tester harus:** Bisa menggunakan mouse, keyboard, dan drag & drop  
> **Icon legend:** ✅ = centang | ❌ = silang | 👨‍💻 = perlu programmer

---

## W1: REGISTRASI & LOGIN — WEB

### W1.1: Daftar Akun Bisnis Baru

**Tujuan:** Setiap pengguna baru langsung mendapat toko + 31 akun keuangan lengkap

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Buka `https://app.tumbuhin.com/daftar` | Form dengan field: Nama Toko, Nama Lengkap, Email, Password | | |
| 2 | Isi **Nama Toko:** `Toko ABC Web` | Terisi | | |
| 3 | Isi **Nama Lengkap:** `Budi Web` | Terisi | | |
| 4 | Isi **Email:** `test-web-a@email.com` | Terisi | | |
| 5 | Isi **Password:** `Test123!` | Tersembunyi •••••• | | |
| 6 | Klik **Daftar / Buat Akun** | Loading → redirect ke `/dashboard` | | |
| 7 | Cek pojok kiri atas — **"Toko ABC Web"** ✅ | Nama toko sesuai | | |
| 8 | 👨‍💻 Cek tabel `tenants`: name='Toko ABC Web', tier='free' ✅ | Ada | | |
| 9 | 👨‍💻 Cek tabel `profiles`: full_name='Budi Web', role='manager' ✅ | Ada | | |
| 10 | 👨‍💻 Cek tabel `chart_of_accounts`: **31 akun** ✅ | 31 baris | | |
| 11 | 👨‍💻 Cek tabel `tenant_notification_configs`: 3 baris ✅ | 3 role | | |
| 12 | 👨‍💻 Cek tabel `tenant_balances`: balance = 0 ✅ | Saldo 0 | | |

**Jika gagal:** Cek koneksi. Coba email lain jika sudah terdaftar. 👨‍💻 Cek trigger handle_new_user().

### W1.2: Daftar Akun Pribadi

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Logout → buka halaman daftar | Form daftar | | |
| 2 | Pilih **Tipe Akun: Pribadi** | Ada opsi Pribadi | | |
| 3 | Isi Nama Toko: `Keuangan Saya`, Email: `test-web-personal@email.com`, Password | Terisi | | |
| 4 | Klik **Daftar** | Masuk dashboard | | |
| 5 | Buka **Akuntansi → Chart of Accounts** | Hanya **7 akun** (bukan 31) ✅ | | |

### W1.3: Login & Logout

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Klik profil → **Logout** | Kembali ke halaman login | | |
| 2 | Login dengan `test-web-a@email.com` / `Test123!` | Dashboard Toko A ✅ | | |
| 3 | Buka tab **Incognito**, login `test-web-b@email.com` (Toko B) | Dashboard Toko B ✅ | | |
| 4 | Bandingkan data — harus **berbeda** ✅ | Isolasi | | |
| 5 | Refresh tab Toko A — data masih utuh ✅ | Utuh | | |

**Jika data Toko A muncul di Toko B = ❌ KEAMANAN GAGAL — STOP TESTING**

### W1.4: Role-Based Dashboard

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | 👨‍💻 Buat user role **Kasir** via register_staff_profile() | Role kasir siap | | |
| 2 | Login sebagai **Manager** | **Semua menu** muncul (Akuntansi, Produk, Bahan Baku, POS, Laporan, dll) ✅ | | |
| 3 | Login sebagai **Kasir** | Hanya menu: POS, Riwayat Transaksi ✅ | | |
| 4 | Login sebagai **Stok** | Hanya menu: Bahan Baku, Stok, Produk ✅ | | |
| 5 | Kasir coba akses URL Akuntansi langsung | Error: 403 / redirect ✅ | | |
| 6 | Stok coba akses URL POS langsung | Error: 403 / redirect ✅ | | |

---

## W2: AKUN KEUANGAN (COA) — WEB

### W2.1: Verifikasi Chart of Accounts

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Buka **Akuntansi → Chart of Accounts** | Tabel dengan 31 baris | | |
| 2 | Cek 6 kategori: ASET, KEWAJIBAN, EKUITAS, PENDAPATAN, HPP / BIAYA LANGSUNG, BEBAN OPERASIONAL ✅ | 6 kategori | | |
| 3 | Cari `4-40000 Penjualan Produk` — normal_balance = **credit** ✅ | Sesuai | | |
| 4 | Cari `5-50000 Harga Pokok Penjualan` — normal_balance = **debit** ✅ | Sesuai | | |
| 5 | Cari `1-10000 Kas Tangan` — normal_balance = **debit** ✅ | Sesuai | | |

### W2.2: Tambah Akun Baru

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Klik **+ Tambah Akun** | Modal muncul | | |
| 2 | Isi Kode: `9-99999`, Nama: `Akun Test Web` | Terisi | | |
| 3 | Kategori: **ASET**, Normal Balance: **debit** | Terisi | | |
| 4 | Klik **Simpan** | Akun muncul ✅ | | |
| 5 | Tambah lagi dengan kode `9-99999` (sama) | Error: "Kode sudah ada" ✅ | | |
| 6 | Kategori **INVESTASI** (tidak valid) | Error: kategori tidak valid ✅ | | |
| 7 | Normal Balance **saldo** (tidak valid) | Error ✅ | | |
| 8 | Kode kosong | Error ✅ | | |

---

## W3: BAHAN BAKU — WEB

### W3.1: Tambah Bahan Baku

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Buka **Inventaris → Bahan Baku** | Tabel daftar | | |
| 2 | Klik **+ Tambah Baru** | Form: Nama, Satuan, Harga Satuan, Stok Awal, Reorder Point | | |
| 3 | Isi `Kopi Bubuk`, Satuan=`gram`, Harga=`500`, Stok=`5000`, Reorder=`1000` | Terisi | | |
| 4 | Klik **Simpan** | Muncul di tabel ✅ | | |
| 5 | Tambah bahan berikut: | | | |
| | `Susu Cair` — ml — 200 — 10000 — 2000 ✅ | | | |
| | `Gula Pasir` — gram — 100 — 5000 — 1000 ✅ | | | |
| | `Kopi Hitam` — gram — 400 — 3000 — 500 ✅ | | | |
| | `Es Batu` — butir — 50 — 2000 — 500 ✅ | | | |
| 6 | Total 5 bahan baku di tabel ✅ | 5 baris | | |

### W3.2: Edit & Hapus Bahan Baku

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Klik `Kopi Bubuk` → ubah Stok `3000` → **Simpan** | Stok berubah ✅ | | |
| 2 | Ubah Harga `500` → `550` → **Simpan** | Harga berubah ✅ | | |
| 3 | Hapus bahan yang **belum** dipakai resep | Berhasil hapus ✅ | | |
| 4 | Hapus bahan yang **sudah** dipakai resep | Error: tidak bisa hapus ✅ | | |

---

## W4: PRODUK — WEB

### W4.1: Tambah Produk Fisik

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Buka **Produk → Daftar Produk** | Tabel + tombol Tambah | | |
| 2 | Klik **+ Tambah Produk** | Form dengan tab: Informasi, Resep, Varian, Addon | | |
| 3 | Tab **Informasi**: | | | |
| | Nama: `Air Mineral Botol 600ml` ✅ | | | |
| | SKU: `AM-001` ✅ | | | |
| | Barcode: `8991234567890` ✅ | | | |
| | Harga Jual: `5000` ✅ | | | |
| | Harga Modal: `3000` ✅ | | | |
| | Tipe: **Fisik** ✅ | | | |
| | Stok: `100`, Satuan: `pcs` ✅ | | | |
| | Kategori: `Minuman` ✅ | | | |
| | Aktif: ✅ centang ✅ | | | |
| 4 | Klik **Simpan** | Produk muncul ✅ | | |

### W4.2: Validasi SKU & Barcode

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Tambah produk dengan SKU `AM-001` (sama) | Error: "SKU sudah digunakan" ✅ | | |
| 2 | Tambah produk dengan Barcode `8991234567890` (sama) | Error: "Barcode sudah digunakan" ✅ | | |
| 3 | Tambah produk dengan SKU sama tapi **toko berbeda** (Toko B) | **Berhasil** — SKU unik per toko ✅ | | |

### W4.3: Tambah Produk Resep (Composite)

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | **+ Tambah Produk** | Form produk | | |
| 2 | Tab **Informasi**: Nama=`Kopi Susu`, SKU=`KS-001`, Harga Jual=`15000`, Harga Modal=`0` (biarkan 0 — otomatis), Tipe=**Composite** | Terisi | | |
| 3 | Klik **Simpan** → pindah ke tab **Resep** | Produk tersimpan ✅ | | |
| 4 | Klik **+ Tambah Bahan**: | | | |
| | Pilih `Kopi Bubuk`, Jumlah=`10`, Satuan=`gram` ✅ | | | |
| | Pilih `Susu Cair`, Jumlah=`200`, ml ✅ | | | |
| | Pilih `Gula Pasir`, Jumlah=`15`, gram ✅ | | | |
| 5 | Klik **Simpan Resep** | Resep tersimpan ✅ | | |
| 6 | Klik **🔍 Preview HPP** — popup muncul: | | | |
| | HPP Mode: **Recipe** ✅ | | | |
| | HPP per unit: **Rp 9.500** (10×500 + 200×200 + 15×100) ✅ | | | |
| | Margin Kotor: **36,67%** ✅ | | | |
| 7 | 👨‍💻 Cek tabel `product_recipes` — 3 baris ✅ | 3 baris | | |

### W4.4: Tambah Varian Produk

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Buka `Kopi Susu` → tab **Varian** | Tab varian | | |
| 2 | **+ Tambah Grup Varian**: | | | |
| | Nama: `Ukuran` ✅ | | | |
| | ✅ Wajib Pilih, ❌ Boleh Pilih Banyak, Urutan=`1` ✅ | | | |
| 3 | **+ Tambah Opsi**: Nama=`Small`, Delta Harga=`0` ✅ | Opsi 1 ✅ | | |
| 4 | **+ Tambah Opsi**: Nama=`Large`, Delta Harga=`3000` ✅ | Opsi 2 ✅ | | |
| 5 | **+ Tambah Grup Varian** lagi: | | | |
| | Nama: `Level` ✅ | | | |
| | ❌ Wajib Pilih, ✅ Boleh Pilih Banyak ✅ | | | |
| 6 | Opsi: `Less Ice`, `No Ice` — tanpa delta harga ✅ | 2 opsi | | |

### W4.5: Tambah Addon Produk

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Buka `Kopi Susu` → tab **Addon** | Tab addon | | |
| 2 | **+ Tambah Grup Addon**: Nama=`Topping`, Min=`0`, Max=`3`, ✅ Promo | Grup ✅ | | |
| 3 | **+ Tambah Addon**: Nama=`Boba`, Harga=`3000`, Stok=`1000` ✅ | Addon ✅ | | |
| 4 | **+ Tambah Addon**: Nama=`Whipped Cream`, Harga=`2000` (unlimited) ✅ | Addon ✅ | | |

### W4.6: Upload Gambar Produk

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Buka produk → tombol **Upload Gambar** | File picker | | |
| 2 | Pilih file gambar | Thumbnail muncul ✅ | | |
| 3 | **Simpan** — gambar tersimpan ✅ | Tersimpan | | |

### W4.7: Produk Tambahan untuk Testing POS

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Tambah: Nama=`Jasa Konsultasi`, Tipe=**Jasa**, Harga Jual=`100000`, Harga Modal=`0` | Produk jasa ✅ | | |
| 2 | Tambah: Nama=`Snack Ringan`, Tipe=**Fisik**, Harga Jual=`10000`, Harga Modal=`6000`, Stok=`100` | Produk tanpa resep ✅ | | |

---

## W5: GUDANG — WEB

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Buka **Pengaturan → Gudang** | Daftar gudang (default: 1 gudang utama) | | |
| 2 | **+ Tambah Gudang**: Nama=`Gudang Cabang`, Alamat=`Jl. Merdeka No.10` | Gudang baru ✅ | | |
| 3 | ✅ **Jadikan Default** | Default berubah ✅ | | |
| 4 | Cek ada 2 gudang ✅ | 2 gudang | | |

---

## W6: PEMBELIAN (PURCHASE ORDER) — WEB

### W6.1: Buat PO

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Buka **Pembelian → Purchase Order** | Daftar PO kosong | | |
| 2 | **+ Buat PO Baru** | Form PO | | |
| 3 | Vendor: `PT Suplai Makmur`, No. Referensi: `PO-2026-001` | Terisi | | |
| 4 | **+ Tambah Item**: `Kopi Bubuk`, 10000, Rp450 ✅ | Item 1 | | |
| 5 | **+ Tambah Item**: `Susu Cair`, 20000, Rp180 ✅ | Item 2 | | |
| 6 | **+ Tambah Item**: `Gula Pasir`, 10000, Rp90 ✅ | Item 3 | | |
| 7 | Total otomatis = **Rp 9.000.000** ✅ | Sesuai | | |
| 8 | Klik **Simpan PO** | Status: **Draft** ✅ | | |

### W6.2: Alur PO Lengkap

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Klik **Kirim ke Supplier** | Status: **Sent / Dikirim** ✅ | | |
| 2 | Klik **Terima Barang** | Form penerimaan | | |
| 3 | Kopi Bubuk: terima `10000` ✅, Susu: terima `20000` ✅, Gula: terima `5000` (sebagian) ✅ | | | |
| 4 | Klik **Konfirmasi** | Status: **Partially Received** ✅ | | |
| 5 | Cek stok: Kopi Bubuk +10000, Susu +20000, Gula +5000 ✅ | Stok bertambah | | |
| 6 | 👨‍💻 Cek tabel `purchase_order_items.received_qty` | Terisi ✅ | | |

---

## W7: TRANSFER & OPNAME STOK — WEB

### W7.1: Transfer Antar Gudang

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Buka **Stok → Transfer Stok** | Form transfer | | |
| 2 | Dari: `Gudang Utama`, Ke: `Gudang Cabang` | Terpilih | | |
| 3 | Produk: `Air Mineral Botol 600ml`, Jumlah: `20` | Terisi | | |
| 4 | Klik **Transfer** | Berhasil ✅ | | |
| 5 | Cek stok Gudang Utama: -20 ✅, Gudang Cabang: +20 ✅ | Sesuai | | |
| 6 | Transfer 10 lagi — Gudang Cabang jadi +30 ✅ | Accumulate | | |
| 7 | Transfer dari gudang tanpa stok | Error: "Produk tidak ditemukan" ✅ | | |

### W7.2: Opname Stok

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Buka **Stok → Opname** | Form opname | | |
| 2 | Gudang: `Gudang Utama`, Produk: `Kopi Bubuk` | Terpilih | | |
| 3 | Stok Sistem: (misal) 12980 | Terlihat | | |
| 4 | Stok Fisik: `13000`, Catatan: `Ada sisa produksi` | Terisi | | |
| 5 | Klik **Simpan Opname** | Stok berubah jadi 13000 ✅ | | |
| 6 | 👨‍💻 Cek `stock_opname_items`: system=12980, physical=13000, diff=+20 ✅ | Sesuai | | |

---

## W8: PROMOSI — WEB

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Buka **Promosi → Daftar Promosi** | Halaman promosi | | |
| 2 | **+ Tambah Promosi**: | | | |
| | Nama: `Promo Akhir Pekan` ✅ | | | |
| | Tipe: **Diskon Persen** ✅ | | | |
| | Aturan: `{ "diskon_persen": 10, "min_belanja": 50000 }` ✅ | | | |
| | Mulai: hari ini ✅, Selesai: +7 hari ✅ | | | |
| | ✅ Aktif | | | |
| 3 | Klik **Simpan** | Promosi tersimpan ✅ | | |
| 4 | ❌ Nonaktifkan → ✅ Aktifkan lagi | Toggle ✅ | | |

---

## W9: OCR SCAN STRUK — WEB

### W9.1: Upload Struk

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Buka **OCR → Scan Struk** | Area drag & drop | | |
| 2 | **Drag** file foto struk ke area | Preview muncul ✅ | | |
| 3 | Atau **Klik** area → pilih file dari komputer ✅ | File terpilih | | |
| 4 | Tunggu proses OCR (5-15 detik) | Progress bar ✅ | | |
| 5 | Hasil OCR muncul: Nama Merchant ✅, Tanggal ✅, Total ✅, Line Items ✅ | Data terisi | | |
| 6 | Edit manual jika data kurang tepat ✅ | Edit | | |

### W9.2: Approve Draft OCR

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Buka **OCR → Draft Transaksi** | Daftar draft **Pending** | | |
| 2 | Klik draft → detail: Merchant, Tanggal, Total ✅ | Detail | | |
| 3 | Akun Debit: `6-60000 Biaya Admin` ✅ | Terpilih | | |
| 4 | Akun Kredit: `1-10000 Kas Tangan` ✅ | Terpilih | | |
| 5 | Klik **Setujui** | Status: **Approved** ✅ | | |
| 6 | 👨‍💻 Cek `journal_entries` — jurnal baru terbuat ✅ | Ada | | |
| 7 | Klik **Tolak** pada draft lain | Status: **Rejected** ✅ | | |
| 8 | Draft Approved/Rejected tidak muncul di daftar Pending ✅ | Filter | | |

---

## W10: KEUANGAN PRIBADI — WEB

### W10.1: Anggaran (Budget)

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Buka **Anggaran** | Halaman anggaran | | |
| 2 | **+ Buat Anggaran**: Akun=`6-60000 Biaya Admin`, Periode=**Mei 2026**, Batas=**Rp 1.000.000** | Tersimpan ✅ | | |
| 3 | Buat lagi dengan akun + periode **sama** | Error: duplikat ✅ | | |
| 4 | Buat: Akun=`6-60100 Beban Gaji`, Batas=**Rp 5.000.000** | Tersimpan ✅ | | |

### W10.2: Target Keuangan

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Buka **Target Keuangan** | Halaman target | | |
| 2 | **+ Target Baru**: Tipe=**Tabungan**, Nama=`Beli Laptop Baru`, Target=**Rp 15.000.000**, Target Tanggal=`31 Des 2026` | Tersimpan ✅ | | |
| 3 | **+ Tambah Dana**: Rp 500.000 → Terkumpul Rp 500.000 ✅ | | |
| 4 | **+ Tambah Dana**: Rp 500.000 → Terkumpul Rp 1.000.000 ✅ | | |
| 5 | Ubah status: **Active** → **Achieved** ✅ | Tercapai | | |
| 6 | Ubah status: **Cancelled** ✅ | Batal | | |
| 7 | Target Cancelled tidak muncul di filter Active ✅ | Filter | | |

### W10.3: Transaksi Berulang (Recurring)

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Buka **Transaksi Berulang** | Halaman recurring | | |
| 2 | **+ Tambah**: Nama=`Bayar Sewa Toko`, Jumlah=**Rp 5.000.000**, Arah=**Pengeluaran**, Frekuensi=**Bulanan**, Tanggal=`1`, Aktif ✅ | Tersimpan ✅ | | |
| 3 | Klik **Proses Sekarang** (simulasi) | Jurnal terbuat ✅ | | |
| 4 | ❌ Nonaktifkan → tidak diproses ✅ | Skip | | |

---

## W11: TAGIHAN (BILLS) — WEB

### W11.1: Buat Tagihan Hutang

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Buka **Tagihan → Hutang** | Halaman hutang | | |
| 2 | **+ Tagihan Baru**: Judul=`Sewa Toko Juni 2026`, Jumlah=**Rp 5.000.000**, Tipe=**Hutang**, Jatuh Tempo=`30 Juni 2026`, Akun Biaya=`6-60400 Beban Sewa` | Tersimpan — status **Pending** ✅ | | |

### W11.2: Buat Tagihan Piutang

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Buka **Tagihan → Piutang** | Halaman piutang | | |
| 2 | **+ Tagihan Baru**: Judul=`Piutang Toko Sejahtera`, Jumlah=**Rp 2.500.000**, Tipe=**Piutang**, Jatuh Tempo=`15 Juni 2026` | Tersimpan ✅ | | |

### W11.3: Bayar Tagihan Bertahap

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Buka tagihan `Sewa Toko Juni 2026` | Detail | | |
| 2 | **Bayar**: Rp 2.000.000 ✅ | Status: **Partial** | | |
| 3 | **Bayar** lagi: sisa Rp 3.000.000 ✅ | Status: **Lunas** ✅ | | |
| 4 | 👨‍💻 Cek jurnal — 2 jurnal pembayaran ✅ | 2 jurnal | | |

---

## W12: PAYOUT (PENARIKAN SALDO) — WEB

### W12.1: Payout Request

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Buka **Penarikan Saldo** | Saldo + riwayat | | |
| 2 | **Ajukan Penarikan**: Jumlah=**Rp 50.000**, Bank=`BCA 123456 a/n Toko ABC` | Status: **Pending** ✅ | | |

### W12.2: Approve/Reject (Superadmin)

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Login sebagai **Superadmin** | Dashboard superadmin | | |
| 2 | **Penarikan → Semua Request** | Semua request ✅ | | |
| 3 | **Setujui** request Toko ABC Rp 50.000 | Status: **Success** ✅ | | |
| 4 | Saldo Toko ABC berkurang Rp 50.000 ✅ | Berkurang | | |
| 5 | **Tolak** request lain | Status: **Failed** ✅ | | |
| 6 | Setujui request yang sudah success | Error: "Payout sudah diproses" ✅ | | |

---

## W13: NOTIFIKASI & LOG — WEB

### W13.1: Smart Alerts

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Buka **Notifikasi** | Daftar alert | | |
| 2 | Ada alert: "Stok Kopi Bubuk menipis" ✅ | Alert muncul | | |
| 3 | **Tandai Dibaca** → pindah ke tab "Sudah Dibaca" ✅ | Berpindah | | |
| 4 | Hanya alert toko sendiri ✅ | Isolasi | | |

### W13.2: Log Aktivitas

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Buka **Log Aktivitas** | Tabel: Waktu, User, Aksi, Detail | | |
| 2 | Ada log login ✅, buat produk ✅, transaksi POS ✅ | Tercatat | | |
| 3 | Login **Kasir** → buka Log Aktivitas | **Kosong** (tidak bisa lihat) ✅ | | |
| 4 | Login **Manager** → Semua log terlihat ✅ | Full access | | |

---

## W14: ASET — WEB

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Buka **Aset** | Halaman aset | | |
| 2 | **+ Aset Baru**: | | | |
| | Nama=`Meja Kantor 6 Set`, Harga Beli=**Rp 2.000.000** ✅ | | | |
| | Nilai Saat Ini=**Rp 2.000.000** ✅ | | | |
| | Tanggal Beli=**1 Jan 2026** ✅ | | | |
| | Lokasi=`Ruang Kantor Utama` ✅ | | | |
| | Upload foto ✅ | | | |
| | Akun=`1-15000 Peralatan` ✅ | | | |
| | Depresiasi=**10%** ✅ | | | |
| 3 | **Simpan** — aset tersimpan ✅ | Tersimpan | | |

---

## W15: LAPORAN & DASHBOARD — WEB

### W15.1: Laba Rugi

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Buka **Laporan → Laba Rugi** | Grafik + tabel | | |
| 2 | Pilih **Bulan Ini** | Data muncul | | |
| 3 | Total Pendapatan > 0 ✅ | > 0 | | |
| 4 | Total HPP/Biaya Langsung > 0 ✅ | > 0 | | |
| 5 | **Laba Bersih = Pendapatan - (HPP + Beban)** ✅ | **PASTIKAN BENAR** | | |
| 6 | Export PDF/Excel (jika ada) ✅ | Download | | |

> ⚠️ **Jika Laba Bersih = Pendapatan (biaya 0):** Ada bug — HPP tidak masuk hitungan. 👨‍💻 Programmer cek function refresh_ledger_analytics().

### W15.2: Dashboard

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Buka **Dashboard** | Kartu-kartu metrik | | |
| 2 | Penjualan Hari Ini ✅ | Ada | | |
| 3 | Total Pendapatan Bulan Ini ✅ | Ada | | |
| 4 | Produk Terlaris ✅ | Ada | | |
| 5 | Stok Menipis ✅ | Ada | | |
| 6 | Grafik Penjualan 7 Hari ✅ | Ada | | |
| 7 | Refresh — data konsisten ✅ | Konsisten | | |

---

## W16: UPLOAD FILE & STORAGE — WEB

### W16.1: Avatar

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | **Profil → Edit Profil** → klik avatar | Pilih file | | |
| 2 | Upload gambar | Preview ✅ | | |
| 3 | **Simpan** — avatar berubah ✅ | Berubah | | |
| 4 | Buka profil di tab **Incognito** — avatar **tetap muncul** ✅ | Public | | |

### W16.2: Dokumen Inventaris

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | **Dokumen → Upload** — drag & drop PDF | Upload ✅ | | |
| 2 | Klik link file — terbuka di tab baru ✅ | Bisa akses | | |
| 3 | Buka URL di tab Incognito — bisa diakses ✅ | Public | | |

---

## W17: SUPERADMIN & PENGATURAN — WEB

### W17.1: Notifikasi Config

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | **Pengaturan → Notifikasi** | 3 baris: manager, kasir, stok | | |
| 2 | Semua toggle default **ON** ✅ | ON | | |
| 3 | Matikan "Notif Stok Menipis" untuk Stok ✅ | OFF | | |
| 4 | **Simpan** — tersimpan ✅ | | | |

### W17.2: System Mode (Superadmin)

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Login **Superadmin** → **Pengaturan Sistem** | Halaman system | | |
| 2 | System Mode: **NORMAL** ✅ | NORMAL | | |
| 3 | Ubah ke **MAINTENANCE** — user biasa blocked ✅ | Blocked | | |
| 4 | Kembalikan ke **NORMAL** ✅ | Normal | | |

---

## W18: KEAMANAN & RLS — WEB

### W18.1: Isolasi Data Antar Toko

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Tab 1: Login **Toko A** → catat nama produk | Nama produk A | | |
| 2 | Tab 2 (Incognito): Login **Toko B** | Dashboard B | | |
| 3 | Buka Produk di Toko B — cari nama produk A | **Tidak muncul** ✅ | | |
| 4 | Buka Laporan Toko A — hanya data A ✅ | Data A | | |
| 5 | Buka Laporan Toko B — hanya data B ✅ | Data B | | |
| 6 | Coba akses langsung: `/produk/edit?id=PRODUK-A` dari Toko B | Error 403 ✅ | | |

> ❌ **Jika ada data Toko A di Toko B = KEAMANAN GAGAL — HENTIKAN TESTING, LAPOR PROGRAMMER**

### W18.2: Role Access

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | **Kasir** — buka Akuntansi | Error / menu hilang ✅ | | |
| 2 | **Kasir** — buka Bahan Baku | Error / menu hilang ✅ | | |
| 3 | **Kasir** — buka POS | **Bisa** ✅ | | |
| 4 | **Stok** — buka Akuntansi | Error ✅ | | |
| 5 | **Stok** — buka Bahan Baku | **Bisa** ✅ | | |
| 6 | **Stok** — buka POS | Error ✅ | | |
| 7 | **Manager** — **semua** menu bisa ✅ | Full access | | |

### W18.3: Validasi COA Role

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | **Manager** — bisa tambah akun baru ✅ | Bisa | | |
| 2 | **Kasir** — coba tambah akun | Error ✅ | | |
| 3 | **Stok** — coba tambah akun | Error ✅ | | |

---

# 📱 MOBILE APP: Testing POS & Kasir

> **Platform:** Smartphone/Tablet — Android atau iOS (bukan browser)  
> **Tester harus:** Bisa menggunakan touch screen, kamera, dan Bluetooth  
> **Icon legend:** ✅ = centang | ❌ = silang | 📱 = fitur spesifik HP

---

## M1: INSTALASI & AWAL — MOBILE

### M1.1: Install App

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Buka Play Store / App Store | Store terbuka | | |
| 2 | Cari `Tumbuhin POS` | Aplikasi muncul | | |
| 3 | Klik **Install** | Proses install | | |
| 4 | Buka app yang sudah terinstall | **Splash Screen** (logo Tumbuhin — 2-3 detik) ✅ | | |
| 5 | Setelah splash → halaman **Login** | Field: Email, Password, tombol Masuk ✅ | | |

**Jika gagal:** App force close → cek RAM HP. Cek versi OS minimum (Android 8 / iOS 14).

### M1.2: Halaman Login — Tampilan

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Cek elemen login: | | | |
| | Logo di tengah atas ✅ | | | |
| | Field **Email** placeholder `Masukkan email` ✅ | | | |
| | Field **Password** placeholder `Masukkan password` ✅ | | | |
| | Tombol **Masuk** warna primer ✅ | | | |
| | Link **Lupa Password?** ✅ | | | |
| | Link **Daftar Akun Baru** ✅ | | | |
| 2 | Tap field Email — **keyboard muncul** ✅ | Keyboard | | |
| 3 | Tap field Password — karakter tersembunyi ***** ✅ | Hidden | | |
| 4 | Tap 👁 icon — password **terlihat** ✅ | Toggle | | |
| 5 | Tap **Lupa Password?** — buka halaman reset di browser ✅ | Reset | | |
| 6 | Tap **Daftar Akun Baru** — buka registrasi di browser ✅ | Daftar | | |

---

## M2: LOGIN & SESI — MOBILE

### M2.1: Login Berhasil

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Email: `test-app-kasir@email.com`, Password: `Test123!` | Terisi | | |
| 2 | Tap **Masuk** | Loading spinner (max 5 detik) ✅ | | |
| 3 | Masuk **Dashboard Kasir Mobile** ✅ | Dashboard | | |
| 4 | Cek elemen dashboard: | | | |
| | Nama toko di pojok atas ✅ | | | |
| | Tombol **🛒 POS / Kasir** (paling besar) ✅ | | | |
| | Tombol **📋 Riwayat Transaksi** ✅ | | | |
| | Tombol **📦 Cek Stok** ✅ | | | |
| | Tombol **🔔 Notifikasi** ✅ | | | |
| 5 | **Bottom Navigation**: 🏠 Beranda, 🛒 POS, 📋 Riwayat, 🔔 Notif, 👤 Profil ✅ | Bottom nav | | |
| 6 | **Swipe dari kiri** — sidebar drawer (jika ada) ✅ | Sidebar | | |

### M2.2: Login Gagal — Validasi

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Kosong semua → tap **Masuk** | Error: "Email wajib diisi" ✅ | | |
| 2 | Email saja, password kosong | Error: "Password wajib diisi" ✅ | | |
| 3 | Email `abc`, password `Test123!` | Error: "Format email tidak valid" ✅ | | |
| 4 | Email benar, password salah | Error: "Email atau password salah" ✅ | | |
| 5 | Email belum terdaftar | Error: "Akun tidak ditemukan" ✅ | | |

### M2.3: Session & Auto-Login

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Login berhasil | Dashboard | | |
| 2 | **Minimize** app (tekan Home) → **Buka lagi** | **Tetap login** ✅ | | |
| 3 | **Tutup app** (swipe dari recent) → **Buka lagi** | **Langsung masuk** (splash → dashboard) ✅ | | |
| 4 | Tunggu 1 jam tanpa aktivitas → buka app | **Halaman login** (token expired) ✅ | | |

### M2.4: Logout

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Tap 👤 **Profil** → scroll → **Logout** | Konfirmasi: "Yakin ingin keluar?" ✅ | | |
| 2 | Tap **Ya, Keluar** | Kembali ke halaman Login ✅ | | |
| 3 | Tap tombol **Back** HP — **tidak bisa** balik ke dashboard ✅ | Aman | | |

> ❌ **Jika setelah logout masih bisa balik ke dashboard = BUG**

---

## M3: POS / KASIR — MOBILE

**INi adalah fitur PALING PENTING dari seluruh aplikasi. Fokus testing di sini.**

### M3.1: Buka Halaman POS

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Tap **🛒 POS** (tombol besar atau bottom nav) | Halaman POS terbuka ✅ | | |
| 2 | Layout: | | | |
| | Atas: **Daftar Produk** (grid/list) ✅ | | | |
| | Bawah: **Keranjang** (swipe up drawer) ✅ | | | |
| | Search bar 🔍 di atas ✅ | | | |
| 3 | Swipe kiri/kanan — scroll horizontal kategori ✅ | Scroll | | |
| 4 | Scroll vertikal — semua produk ✅ | Scroll | | |

### M3.2: Pilih Produk ke Keranjang

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Tap **Air Mineral Botol 600ml** | Masuk keranjang, total Rp 5.000 ✅ | | |
| 2 | Tap **Air Mineral** lagi | Qty = 2, total Rp 10.000 ✅ | | |
| 3 | Tap **Kopi Susu** (Rp 15.000) | Masuk keranjang, total = Rp 25.000 ✅ | | |

### M3.3: Ubah Quantity di Keranjang

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | **Swipe UP** keranjang | Keranjang terbuka penuh ✅ | | |
| 2 | Tap **+** Air Mineral (qty 2 → 3) | Qty = 3 ✅ | | |
| 3 | Total: (3×5000) + 15000 = **Rp 30.000** ✅ | Update | | |
| 4 | Tap **−** Air Mineral (qty 3 → 2) | Qty = 2 ✅ | | |
| 5 | Tap **−** terus sampai qty = 0 | Item **hilang** dari keranjang ✅ | | |
| 6 | Total kembali Rp 15.000 ✅ | Update | | |

### M3.4: Pilih Varian di HP

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Tap **Kopi Susu** | **Modal Varian** muncul (karena wajib) ✅ | | |
| 2 | Opsi: **Small (Rp0)** / **Large (+Rp3.000)** ✅ | 2 opsi | | |
| 3 | Pilih **Large** → tap **Tambah ke Keranjang** | Harga: 15.000 + 3.000 = **Rp 18.000** ✅ | | |
| 4 | Tap Kopi Susu lagi → pilih **Small** | Harga: Rp 15.000 ✅ | | |

### M3.5: Pilih Addon di HP

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Tap **Kopi Susu** → pilih varian dulu | Modal varian | | |
| 2 | Setelah varian → **Modal Addon** muncul ✅ | Opsi: Boba (+3.000), Cream (+2.000) | | |
| 3 | Centang **Boba** (+3.000) | Harga naik ✅ | | |
| 4 | Centang **Cream** (+2.000) — boleh multi ✅ | Multi-select ✅ | | |
| 5 | Tap **Tambah ke Keranjang** | Produk + addon masuk ✅ | | |

### M3.6: 📱 Scan Barcode (Kamera)

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Tap **📷 Scan Barcode** | **Kamera belakang** aktif ✅ | | |
| 2 | Arahkan ke barcode produk | Garis scan merah / kotak fokus ✅ | | |
| 3 | Barcode terbaca — **BEEP** atau vibrasi ✅ | Bunyi | | |
| 4 | Produk **langsung masuk keranjang** ✅ | Otomatis | | |
| 5 | Scan barcode **tidak terdaftar** | Error: "Produk tidak ditemukan" ✅ | | |
| 6 | Tap **X** atau Back — kamera tertutup ✅ | Kembali | | |

> **Jika gagal:** Izin kamera ON? Lensa bersih? Barcode tidak buram?

### M3.7: Cari Produk (Search)

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Tap **🔍 Search Bar** | Keyboard muncul ✅ | | |
| 2 | Ketik `kopi` | Produk **Kopi Susu** muncul ✅ | | |
| 3 | Ketik `AM-001` (SKU) | Air Mineral muncul ✅ | | |
| 4 | Hapus text — semua produk kembali ✅ | Reset | | |
| 5 | Ketik kata tidak ada | "Produk tidak ditemukan" ✅ | | |

### M3.8: Metode Pembayaran

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Tap **Bayar** | Halaman Pembayaran ✅ | | |
| 2 | Ringkasan: **Total: Rp XX.XXX** ✅ | Total | | |
| 3 | Pilih metode: 💵 Tunai ✅ / 📱 QRIS ✅ / 💳 Transfer ✅ / 💳 Kartu ✅ | Semua bisa | | |
| 4 | Pilih **Tunai** → field **Jumlah Dibayar** muncul | Input ✅ | | |
| 5 | Ketik jumlah bayar (misal 50.000, total 42.000) | **Kembalian: Rp 8.000** ✅ | | |
| 6 | Tap **Konfirmasi Bayar** | Loading... | | |

### M3.9: Transaksi Berhasil + Struk

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Konfirmasi → **Animasi sukses** (ceklis hijau) ✅ | Animasi | | |
| 2 | Layar **Transaksi Berhasil**: | | | |
| | Nomor Pesanan: ORD-2026-XXXXX ✅ | | | |
| | Total: Rp 42.000 ✅ | | | |
| | Metode: Tunai ✅ | | | |
| | Kembalian: Rp 8.000 ✅ | | | |
| | Tanggal ✅ | | | |
| 3 | Tombol: **🖨 Cetak Struk** ✅ / **💰 Transaksi Baru** ✅ / **📋 Detail** ✅ | 3 tombol | | |
| 4 | Tap **Transaksi Baru** → POS, keranjang **kosong** ✅ | Reset | | |

### M3.10: 📱 Cetak Struk Bluetooth

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Tap **🖨 Cetak Struk** | Daftar perangkat Bluetooth ✅ | | |
| 2 | Pilih printer (misal: XP-POS Printer) | Connecting... | | |
| 3 | Struk **mulai cetak** ✅ | Cetak | | |
| 4 | Cek struk: Nama Toko ✅, Tgl ✅, Item ✅, Total ✅, Bayar ✅, Kembali ✅, Terima kasih ✅ | Lengkap | | |
| 5 | Tap **Cetak Ulang** — cetak lagi ✅ | Ulang | | |

> **Jika gagal cetak:** Bluetooth ON? Printer sudah pairing? Kertas ada?

### M3.11: Transaksi Cepat (Quick Sale)

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Tap produk → **Bayar** → isi nominal → **Konfirmasi** | **Ukur waktu: < 10 detik** ✅ | | |

### M3.12: 📱 Split Payment (Bayar 2 Metode)

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Di halaman bayar, tap **Split / Multi Payment** | Form split ✅ | | |
| 2 | Metode 1: **Tunai** — Rp 20.000 ✅ | | | |
| 3 | Metode 2: **QRIS** — Rp 22.000 (sisa) ✅ | | | |
| 4 | Total: 20.000 + 22.000 = **42.000** ✅ | Balance | | |
| 5 | Tap **Konfirmasi** — transaksi sukses ✅ | Sukses | | |

### M3.13: Stok Habis

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Jual produk stok **0** | Error: "Stok tidak mencukupi" ✅ | | |
| 2 | Jual produk resep jumlah besar | Error: "Bahan baku tidak cukup" ✅ | | |
| 3 | Transaksi **GAGAL** — keranjang tetap ada ✅ | Aman | | |

### M3.14: Cegah Transaksi Ganda

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Tap **Bayar** — loading | Tombol **disabled** ✅ | | |
| 2 | Coba tap Bayar lagi | Error: "Sedang diproses" ✅ | | |
| 3 | Cek riwayat — **1 transaksi** ✅ | 1 transaksi | | |

---

## M4: VOID / BATALKAN TRANSAKSI — MOBILE

### M4.1: Void Transaksi

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Tap **📋 Riwayat** | Daftar transaksi | | |
| 2 | Tap transaksi terakhir | **Detail Transaksi** ✅ | | |
| 3 | Tap **Void / Batalkan** | Konfirmasi: "Yakin batalkan?" ✅ | | |
| 4 | Tap **Ya, Batalkan** | Status: **Batal (Voided)** ✅ | | |
| 5 | Ada badge merah **DIBATALKAN** di daftar ✅ | Badge | | |

### M4.2: Void = Stok Kembali

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Catat stok Kopi Bubuk | Stok awal | | |
| 2 | Jual Kopi Susu 1 gelas | Berhasil ✅ | | |
| 3 | Cek stok — **berkurang** ✅ | Berkurang | | |
| 4 | **Void** transaksi tsb | Berhasil ✅ | | |
| 5 | Cek stok — **kembali ke awal** ✅ | **PASTIKAN KEMBALI** | | |

> ❌ **Jika stok tidak kembali = BUG KRITIS**

### M4.3: Void Role Check

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Login **Kasir** → tap Void | Error: "Hanya manager" ✅ | | |
| 2 | Login **Manager** → tap Void | **Berhasil** ✅ | | |

### M4.4: Void Transaksi Sudah Void

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Buka transaksi void — tombol Void **hilang/disabled** ✅ | Hilang | | |
| 2 | (Jika masih ada) tap Void | Error: "Transaksi sudah dibatalkan" ✅ | | |

---

## M5: CEK STOK — MOBILE

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Tap **📦 Cek Stok** | Halaman stok ✅ | | |
| 2 | Tampilan: Grid (gambar) / List (tabel) ✅ | Pilihan | | |
| 3 | Setiap kartu: Nama, Stok, Harga ✅ | Info | | |
| 4 | Search `kopi` → filter ✅ | Search | | |
| 5 | Tap produk → **Detail Stok** (termasuk bahan baku untuk produk resep) ✅ | Detail | | |
| 6 | **Pull-to-refresh** (tarik ke bawah) → reload ✅ | Reload | | |
| 7 | Tap tab **Bahan Baku** — daftar bahan baku ✅ | Bahan baku | | |
| 8 | Indikator warna: 🟢 Hijau (aman) / 🟡 Kuning (mendekati reorder) / 🔴 Merah (di bawah reorder) ✅ | Warna | | |

---

## M6: RIWAYAT TRANSAKSI — MOBILE

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Tap **📋 Riwayat** | Daftar transaksi, **terbaru di atas** ✅ | | |
| 2 | Setiap baris: Nomor ✅, Tanggal ✅, Total ✅, Status (hijau sukses / merah void) ✅ | Info | | |
| 3 | Pull-to-refresh ✅ | Reload | | |
| 4 | Scroll ke bawah — **Load More** ✅ | Infinite scroll | | |
| 5 | Tap **Filter** — Hari Ini ✅ / 7 Hari ✅ / Bulan Ini ✅ / Status ✅ | Filter | | |
| 6 | Reset filter — semua kembali ✅ | Reset | | |
| 7 | Search cari `ORD-2026` ✅ | Cari | | |
| 8 | Tap transaksi → **Detail**: Nomor, Tgl, Jam, Metode, Pelanggan, Item, Total, Status, Kasir ✅ | Detail lengkap | | |
| 9 | Tap **Bagikan / Share** — struk bisa dishare WA ✅ | Share | | |
| 10 | Tap **Cetak Ulang** — cetak struk ✅ | Cetak | | |

---

## M7: NOTIFIKASI — MOBILE

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Tap **🔔 Notifikasi** | Daftar notif ✅ | | |
| 2 | Notif menampilkan: Icon (🟢/🟡/🔴) ✅, Pesan ✅, Tanggal ✅, Status baca/belum (bold) ✅ | Info | | |
| 3 | Tap notif — **masuk ke halaman terkait** ✅ | Navigasi | | |
| 4 | Tap **Tandai Semua Dibaca** — semua terbaca ✅ | Dibaca | | |
| 5 | Pull-to-refresh ✅ | Reload | | |
| 6 | 📱 **Push notif** (app background): | | | |
| | Minimalkan app → trigger notif dari server 🔔 | | | |
| | Notif muncul di **notification bar** ✅ | | | |
| | Tap notif — app terbuka ke halaman terkait ✅ | | | |
| | Lock screen — notif muncul ✅ | | | |

---

## M8: PROFIL & SETTING — MOBILE

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Tap 👤 **Profil** | Halaman profil ✅ | | |
| 2 | Info: Foto ✅, Nama ✅, Email ✅, Role ✅, Nama Toko ✅, Versi App ✅ | Lengkap | | |
| 3 | **Edit Profil** — ganti foto & nama ✅ | Edit | | |
| 4 | **Logout** — konfirmasi → keluar ✅ | Logout | | |
| 5 | **Tentang** — info aplikasi ✅ | About | | |
| 6 | **Tampilan** — 🌙 Dark / ☀️ Light / 📱 Ikuti Sistem ✅ | Tema | | |
| 7 | Pilih **Dark** — semua halaman berubah gelap, POS tetap terbaca ✅ | Dark mode | | |
| 8 | Kembali ke **Light** ✅ | Light | | |

---

## M9: GESTURE & NAVIGASI — MOBILE

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | **Swipe kiri** item riwayat → tombol **Detail** ✅ | Gesture | | |
| 2 | **Swipe kanan** item keranjang → **Hapus** ✅ | Gesture | | |
| 3 | **Long press** produk di POS → **info cepat** (harga, stok) ✅ | Gesture | | |
| 4 | **Double tap** qty di keranjang → edit via keyboard ✅ | Gesture | | |
| 5 | **Swipe down** di POS → **refresh** ✅ | Gesture | | |

---

## M10: ORIENTASI LAYAR & KOMPATIBILITAS — MOBILE

### M10.1: Orientasi

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Buka app **Portrait** (tegak) — layout optimal ✅ | Optimal | | |
| 2 | Putar **Landscape** (miring) — layout adaptasi ✅ | Adaptif | | |
| 3 | POS di Landscape — produk lebih lebar ✅ | Lebar | | |
| 4 | Riwayat di Landscape — tabel lebih terbaca ✅ | Terbaca | | |
| 5 | Kembali ke Portrait — normal ✅ | Normal | | |

### M10.2: Ukuran Layar

| # | Ukuran | Contoh HP | Expected | ✅/❌ |
|---|--------|-----------|----------|-------|
| 1 | **< 5" (Kecil)** | iPhone SE, Redmi 4A | Layout tidak terpotong | |
| 2 | **5"-6" (Sedang)** | iPhone 13, Samsung A52 | Optimal | |
| 3 | **6"+ (Besar)** | iPhone Pro Max, Samsung S24 | Landscape nyaman | |
| 4 | **10"+ (Tablet)** | iPad, Samsung Tab | Split view / side panel | |

### M10.3: Versi OS

| # | OS | Versi | Expected | ✅/❌ |
|---|----|-------|----------|-------|
| 1 | Android | **8.0 (Oreo)** — minimal | Install & running | |
| 2 | Android | **14 / 15** — terbaru | Semua fitur jalan | |
| 3 | iOS | **14** — minimal | Install & running | |
| 4 | iOS | **18** — terbaru | Semua fitur jalan | |

---

## M11: PERFORMANCE MOBILE

### M11.1: Kecepatan

| # | Langkah | Target | ✅/❌ | Catatan |
|---|---------|--------|-------|---------|
| 1 | Tap icon app → splash | **< 3 detik** | | |
| 2 | Splash → dashboard siap | **< 5 detik total** | | |
| 3 | Buka POS → produk muncul | **< 2 detik** | | |
| 4 | Tap produk → bayar → selesai | **< 15 detik** | | |

### M11.2: Baterai & Suhu

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | POS 30 menit nonstop | HP **tidak panas** ✅ | | |
| 2 | Scan barcode 50x | Kamera **tidak force close** ✅ | | |
| 3 | Cetak struk 10x | Bluetooth **stabil** ✅ | | |
| 4 | Battery drain — normal ✅ | Normal | | |

### M11.3: RAM & Memory

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Gonta-ganti POS, Riwayat, Stok, Notif — 10x cepat | **Tidak lag** ✅ | | |
| 2 | POS dengan 100+ produk | **Scroll smooth** ✅ | | |
| 3 | Riwayat dengan 1000+ transaksi | **Load < 5 detik** ✅ | | |

---

## M12: KEAMANAN MOBILE

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Screenshot halaman POS | Bisa screenshot ✅ | | |
| 2 | Screen record | Bisa rekam ✅ | | |
| 3 | (Jika ada root detection) App di HP **root/jailbreak** | Warning: "Perangkat tidak aman" ✅ | | |
| 4 | Biarkan app terbuka **30 menit** tanpa sentuh | Auto-logout / minta PIN ✅ | | |
| 5 | Coba transaksi setelah timeout | Harus login ulang ✅ | | |

---

# 🔗 CROSS-PLATFORM: Sinkronisasi Web + Mobile

## X1: SINKRON DATA WEB ↔ APP

**Tujuan:** Data yang dibuat di Web harus muncul di App, dan sebaliknya.

### X1.1: Web → App

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Dari **Web**: tambah produk baru `Es Teh Manis`, harga 5.000 | Produk tersimpan | | |
| 2 | Buka **App HP** → POS → **pull-to-refresh** | `Es Teh Manis` **muncul** ✅ | | |
| 3 | Dari **Web**: update harga `Es Teh Manis` jadi 6.000 | Harga berubah | | |
| 4 | **App HP**: refresh POS → harga 6.000 ✅ | Sinkron | | |
| 5 | Dari **Web**: nonaktifkan produk `Es Teh Manis` | is_active = false | | |
| 6 | **App HP**: refresh POS → produk **hilang** ✅ (atau ada badge "Tidak Aktif") | Sinkron | | |

### X1.2: App → Web

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Dari **App HP**: lakukan transaksi POS | Transaksi sukses | | |
| 2 | Buka **Web** → **Riwayat Transaksi** | Transaksi dari HP **muncul** ✅ | | |
| 3 | Dari **App HP**: void transaksi | Status: voided | | |
| 4 | **Web**: refresh riwayat → status **Batal** ✅ | Sinkron | | |
| 5 | **Web**: cek **Laporan Laba Rugi** — pendapatan & HPP sudah termasuk transaksi dari HP ✅ | Sinkron | | |

### X1.3: Konflik Data

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | **Web** + **App HP** buka bersamaan — edit produk yg sama | Last-write-wins ✅ (tidak ada data korup) | | |
| 2 | **App HP** transaksi saat koneksi PUTUS | (Offline mode — jika ada) | | |

---

## X2: REGRESI BUG FIX

**Tujuan:** Memastikan bug yang sudah diperbaiki sebelumnya tidak muncul lagi.

### X2.1: Produk Tanpa Resep = Mode Direct (Bukan Recipe)

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Buat produk `Snack Ringan`, Harga Jual 10.000, Harga Modal 6.000 — **tanpa resep** | Produk siap | | |
| 2 | Klik **Preview HPP** — harus: Mode **Direct**, bukan Recipe ✅ | Direct | | |
| 3 | Jual di Web atau App — 👨‍💻 cek `sale_items.hpp_mode` = `direct` ✅ | Direct | | |
| 4 | 👨‍💻 Cek jurnal: ada baris DEBIT 5-50000 ✅ | Ada | | |

### X2.2: Void = Stok Kembali

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Catat stok sebelum jual | Stok awal | | |
| 2 | Jual produk resep (Web atau App) | Stok berkurang | | |
| 3 | **Void** transaksi (Web atau App) | Stok **kembali ke awal** ✅ | | |

### X2.3: Laba Bersih = Pendapatan - Biaya

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | Pastikan ada transaksi dengan HPP | Ada penjualan | | |
| 2 | Buka **Laporan → Laba Rugi** — refresh | **Laba Bersih = Pendapatan - Biaya** ✅ | | |

### X2.4: Trigger Registrasi — Graceful Fallback

| # | Langkah | Hasil yang Diharapkan | ✅/❌ | Catatan |
|---|---------|----------------------|-------|---------|
| 1 | 👨‍💻 Jalankan SQL via **koneksi client** (bukan SQL Editor) | **Tidak error** — hanya warning ✅ | | |
| 2 | Daftar user baru — user tetap bisa daftar ✅ | Bisa daftar | | |

---

## 📋 RINGKASAN AKHIR

### Ringkasan Web

| Bagian | Nama | Total Test | ✅ Lulus | ❌ Gagal | ➖ Skip |
|--------|------|:----------:|:--------:|:--------:|:-------:|
| W1 | Registrasi & Login | 26 | | | |
| W2 | Akun Keuangan (COA) | 8 | | | |
| W3 | Bahan Baku | 11 | | | |
| W4 | Produk | 17 | | | |
| W5 | Gudang | 4 | | | |
| W6 | Pembelian (PO) | 14 | | | |
| W7 | Transfer & Opname | 13 | | | |
| W8 | Promosi | 4 | | | |
| W9 | OCR Scan Struk | 14 | | | |
| W10 | Keuangan Pribadi | 13 | | | |
| W11 | Tagihan (Bills) | 10 | | | |
| W12 | Payout | 6 | | | |
| W13 | Notifikasi & Log | 6 | | | |
| W14 | Aset | 3 | | | |
| W15 | Laporan & Dashboard | 9 | | | |
| W16 | Upload File | 5 | | | |
| W17 | Superadmin & Setting | 7 | | | |
| W18 | Keamanan (RLS) | 16 | | | |
| | **Total Web** | **~186** | | | |

### Ringkasan Mobile

| Bagian | Nama | Total Test | ✅ Lulus | ❌ Gagal | ➖ Skip |
|--------|------|:----------:|:--------:|:--------:|:-------:|
| M1 | Instalasi & Awal | 11 | | | |
| M2 | Login & Sesi | 16 | | | |
| M3 | POS / Kasir | 22 | | | |
| M4 | Void Transaksi | 7 | | | |
| M5 | Cek Stok | 8 | | | |
| M6 | Riwayat Transaksi | 10 | | | |
| M7 | Notifikasi | 8 | | | |
| M8 | Profil & Setting | 8 | | | |
| M9 | Gesture & Navigasi | 5 | | | |
| M10 | Orientasi & Kompatibilitas | 9 | | | |
| M11 | Performance | 7 | | | |
| M12 | Keamanan Mobile | 5 | | | |
| | **Total Mobile** | **~116** | | | |

### Ringkasan Cross-Platform

| Bagian | Nama | Total Test | ✅ Lulus | ❌ Gagal | ➖ Skip |
|--------|------|:----------:|:--------:|:--------:|:-------:|
| X1 | Sinkronisasi Data | 10 | | | |
| X2 | Regresi Bug Fix | 6 | | | |
| | **Total Cross** | **~16** | | | |

---

### Grand Total

| Platform | Test | ✅ Lulus | ❌ Gagal | ➖ Skip |
|----------|:----:|:--------:|:--------:|:-------:|
| 🌐 Web | ~186 | | | |
| 📱 Mobile | ~116 | | | |
| 🔗 Cross | ~16 | | | |
| **TOTAL** | **~318** | | | |

---

## 🚨 KRITERIA LULUS / GAGAL

### ✅ LULUS jika:

| No | Kriteria | Platform | Wajib? |
|----|----------|----------|--------|
| 1 | **W18 (Keamanan RLS)** — NOL data bocor antar toko | Web | **WAJIB 100%** |
| 2 | **M3 (POS / Kasir)** — semua flow transaksi berhasil | App | **WAJIB 100%** |
| 3 | Setiap transaksi balance (debit = kredit) | Web + App | **WAJIB** |
| 4 | Void mengembalikan stok dengan benar | Web + App | **WAJIB** |
| 5 | Scan barcode berhasil di berbagai kondisi cahaya | App | **WAJIB** |
| 6 | Data sinkron antara Web dan App | Cross | **WAJIB** |
| 7 | Transaksi cepat: POS < 15 detik | App | Target |
| 8 | App tidak crash / force close | App | **WAJIB** |
| 9 | Role-based access berfungsi (Kasir/Stok/Manager) | Web + App | **WAJIB** |
| 10 | Transaksi ganda bisa dicegah (idempotency) | Web + App | **WAJIB** |

### ❌ GAGAL TOTAL jika:

| No | Kriteria | Dampak |
|----|----------|--------|
| 1 | **Data antar toko bocor** | **HENTIKAN TESTING — KEAMANAN FAIL** |
| 2 | **Transaksi tidak balance** | Data keuangan korup |
| 3 | **Stok bisa minus tanpa error** | Overselling — rugi |
| 4 | **Void tidak mengembalikan stok** | Selisih inventaris |
| 5 | **App crash setiap buka POS** | Tidak bisa dipakai |
| 6 | **Tombol Bayar menghasilkan 2+ transaksi** | Kehilangan uang |
| 7 | **User bisa akses fitur di luar role** | Keamanan bobol |

---

## 🐞 TEMPLATE LAPORAN BUG

Jika menemukan bug, laporkan dengan format berikut:

```
## LAPORAN BUG

**Platform:** 🌐 Web / 📱 Mobile / 🔗 Cross
**Bagian:** [W3.2 / M3.6 / dll]
**Judul:** [Singkat, jelas]

**Langkah reproduksi:**
1. Buka [halaman/posisi]
2. Klik/tap [tombol/field]
3. Isi [data]
4. Lihat hasil

**Yang terjadi:** [jelaskan apa yang muncul — error message, salah tampil, dll]
**Yang diharapkan:** [jelaskan yang seharusnya terjadi]

**Perangkat:**
- Web: [Chrome 120 / Firefox 110]
- Mobile: [Samsung A52 / iPhone 13]
- OS: [Android 14 / iOS 17 / Windows 11]

**Screenshot / Screen record:** [lampirkan]

**Keparahan:** 🔴 Critical / 🟡 Major / 🟢 Minor
```

---

*Selamat testing! Fokus utama: 🛒 POS lancar, 🔒 data aman, ↩️ void benar, 📱 scan cepat!*
