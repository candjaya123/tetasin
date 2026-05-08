# Strategi Implementasi Chart of Accounts (COA) Tumbuhin

Dokumen ini merencanakan integrasi penuh Chart of Accounts (COA) standar—berbasis file `akun.csv`—ke dalam seluruh ekosistem Tumbuhin (Backend, Web Dashboard, dan Flutter Mobile App). COA ini akan menjadi tulang punggung (*backbone*) dari seluruh pencatatan transaksi, jurnal otomatis (double-entry), dan laporan keuangan.

---

## 1. Struktur Standar COA (Berdasarkan `akun.csv`)

Sistem akan menggunakan hierarki numerik 5 digit untuk kemudahan klasifikasi dan pelaporan:

*   **1-XXXXX (ASET)**: Kas Tangan, Kas Bank, E-Wallet, Piutang Usaha, Persediaan (Bahan Baku, WIP, Barang Jadi/Dagang), Peralatan, Akumulasi Penyusutan (Saldo Normal: Debit).
*   **2-XXXXX (KEWAJIBAN)**: Hutang Usaha, Hutang Bank, Pendapatan Diterima di Muka (Saldo Normal: Kredit).
*   **3-XXXXX (EKUITAS)**: Modal, Prive (Saldo Normal: Kredit).
*   **4-XXXXX (PENDAPATAN)**: Penjualan Produk, Penjualan Jasa, Pendapatan Lain-lain, Diskon, Retur (Saldo Normal: Kredit).
*   **5-XXXXX (HPP)**: Harga Pokok Penjualan (Saldo Normal: Debit).
*   **6-XXXXX (BEBAN OPERASIONAL)**: Biaya Admin, Listrik/Air, Marketing, Gaji, Sewa, Penyusutan, Distribusi (Saldo Normal: Debit).

---

## 2. Strategi Penggunaan COA Berdasarkan Tier

COA akan disesuaikan secara dinamis agar pengguna pemula tidak kebingungan, namun tetap memberikan kebebasan bagi entitas bisnis yang lebih kompleks.

### 🥉 Free (Personal / Starter)
*   **Visibilitas**: Disembunyikan dari UI utama pengguna. Pengguna hanya melihat antarmuka "Pemasukan" dan "Pengeluaran" sederhana.
*   **Struktur COA**: Menggunakan *Template Dasar* (Kas Tangan, Kas Bank, E-Wallet, Penjualan Jasa/Produk, dan Biaya Ops umum). Akun kompleks seperti Persediaan WIP atau Akumulasi Penyusutan tidak ditampilkan/digunakan.
*   **Aturan**: Tidak bisa menambah akun kustom (Custom COA). Jurnal double-entry berjalan otomatis di *background* tanpa intervensi pengguna.

### 🥈 Pro (Business)
*   **Visibilitas**: Pengguna memiliki akses ke menu "Chart of Accounts" di Web Dashboard dan Settings di Flutter.
*   **Struktur COA**: Menggunakan *Template Lengkap UMKM* (Termasuk Hutang, Piutang, HPP, Persediaan Lengkap).
*   **Aturan**: Diizinkan membuat **Custom COA** (menambah akun cabang di bawah kategori utama). Dapat menggunakan fitur Jurnal Manual (*Manual Journal Entry*) untuk penyesuaian akhir bulan.

### 🥇 Max (AI / ERP)
*   **Visibilitas**: Akses penuh dengan fitur Analisa AI.
*   **Struktur COA**: Sama dengan Pro, namun didukung oleh modul *Cost Center* (Pusat Biaya) atau klasifikasi multi-cabang.
*   **Aturan**: AI dapat **menyarankan pembuatan akun baru** secara dinamis saat melakukan *scanning* nota/struk pengeluaran jika tidak menemukan klasifikasi yang tepat. Pemetaan COA sepenuhnya otomatis dikerjakan oleh agen AI. tapi harus selalu menanyakan persetujuan user/manusia

---

## 3. Sistem Input & Alur Proses

### A. Backend (NestJS)
1.  **Tenant Initialization (Seeder)**: 
    *   Saat tenant baru mendaftar, trigger `AccountingService.initializeCOA(tenantId, tier)`.
    *   Sistem membaca file JSON/CSV basis, lalu memasukkan akun-akun default ke tabel `chart_of_accounts` dengan `tenant_id` bersangkutan.
2.  **Transaction Engine (Double-Entry Guard)**:
    *   Semua endpoint mutasi finansial (POS, Pembelian, Expense) harus memanggil fungsi yang membangun `JournalEntry` (berisi kumpulan `JournalLine`).
    *   Sistem validasi ketat: `Total Debit == Total Kredit` sebelum disimpan ke database.
3.  **Mapping Jurnal Otomatis (Use Cases)**:
    *   *Penjualan POS Tunai*: (Debit: Kas/Bank/E-Wallet, Kredit: Penjualan Produk).
    *   *Penjualan POS dengan Inventory Aktif*: Menambah jurnal HPP (Debit: HPP, Kredit: Persediaan Barang Dagang).
    *   *Pencatatan Biaya (Expense)*: (Debit: [Akun 6-XXXXX pilihan pengguna], Kredit: Kas/Bank).

### B. Tumbuhin Web (Admin Dashboard)
1.  **Menu Manajemen COA (Master Data)**: 
    *   Tampilan berbentuk *Tree View* atau tabel yang dikelompokkan berdasarkan Prefix (1-, 2-, dst).
    *   Hanya untuk tier Pro/Max. Memungkinkan CRUD nama dan kode akun (selain akun *system locked* seperti Kas Tangan atau Penjualan Utama).
2.  **Jurnal Manual (Adjustment)**:
    *   UI untuk memasukkan debit/kredit secara manual.
    *   Berguna untuk pencatatan depresiasi aset di akhir bulan atau koreksi stok.
3.  **Laporan Keuangan Real-Time**:
    *   *Buku Besar*: Men-query `journal_lines` berdasarkan `account_id`.
    *   *Neraca*: Menggabungkan saldo berjalan untuk prefix `1-`, `2-`, `3-`.
    *   *Laba Rugi*: Menggabungkan mutasi untuk prefix `4-`, `5-`, `6-`.

### C. Tumbuhin Flutter (Mobile App)
1.  **POS Mapping (Kasir)**:
    *   Saat *checkout*, pilihan metode pembayaran (Tunai, EDC, QRIS) langsung di-map ke `account_id` yang spesifik (1-10000, 1-10002, 1-10003).
2.  **Input Pengeluaran Cepat (Quick Expense)**:
    *   Dropdown untuk memilih kategori pengeluaran hanya menampilkan COA ber-prefix `6-` (Beban) dan `1-10400` (Perlengkapan) atau `1-15000` (Peralatan).
    *   Pengguna tidak dihadapkan pada tabel Jurnal yang membingungkan.
3.  **Laporan Dashboard**:
    *   Menampilkan ringkasan yang datanya diambil dari kalkulasi COA di backend.

---

## 4. Rencana Eksekusi (Roadmap Integrasi)

1.  **Tahap 1: Database & Seeder (Backend)**
    *   Buat tabel `chart_of_accounts` dengan relasi ke `tenant_id`.
    *   Buat script seeder membaca struktur `akun.csv`.
    *   Modifikasi alur registrasi untuk memicu seeder COA.
2.  **Tahap 2: Transisi Transaction Engine (Backend)**
    *   Ubah fungsi `SalesController` dan `InventoryController` untuk memanggil `JournalService.recordTransaction()`.
    *   Terapkan rule *Double-Entry* secara wajib.
3.  **Tahap 3: Update API Frontend (Web & Flutter)**
    *   Ubah input form "Tambah Pengeluaran" di Flutter dan Web agar menarik daftar pilihan dari endpoint `/api/v1/accounting/accounts?type=expense`.
    *   Implementasi menu Manajemen COA di panel Web.
4.  **Tahap 4: AI & Reporting Automation**
    *   Hubungkan *prompt* Gemini di modul AI agar mengembalikan response JSON yang memetakan item struk langsung ke `account_code` spesifik di COA.
    *   Finalisasi query laporan (Laba/Rugi, Neraca) berdasarkan mapping COA baru.
