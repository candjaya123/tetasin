# Tugas Implementasi: Pemisahan Ekstrem Personal vs Bisnis

Dokumen ini berisi SOP (*Standard Operating Procedure*) untuk memisahkan secara total struktur data, akses UI, dan *endpoint* AI antara akun Personal dan Bisnis. Ikuti instruksi di bawah ini dengan persis.

---

## FASE 1: Isolasi Struktur COA (Backend)

**1. Rombak Logika Pembuatan COA**
*   **File Target:** `backend/src/modules/accounting/services/accounting.service.ts`
*   **Fungsi:** `initializeCOA()`
*   **Aksi:**
    Di baris paling atas dari fungsi (setelah log awal), tambahkan blok kondisional `if (accountType === 'personal')`. Jika benar, **JANGAN** lakukan *query* ke `master_chart_of_accounts`. Langsung *insert* daftar akun *hardcoded* berikut ke `chart_of_accounts`, lalu `return;` (keluar dari fungsi).
    *   **Daftar Akun Hardcode (Wajib):**
        *   `1-10000`: Kas Tunai (Aset, Debit)
        *   `1-10001`: Rekening Bank Utama (Aset, Debit)
        *   `1-10002`: E-Wallet (Aset, Debit)
        *   `2-20000`: Kartu Kredit (Kewajiban, Kredit)
        *   `2-20001`: Cicilan / Paylater (Kewajiban, Kredit)
        *   `3-30000`: Saldo Awal (Ekuitas, Kredit)
        *   `4-40000`: Gaji Pokok (Pendapatan, Kredit)
        *   `4-40001`: Bonus / THR (Pendapatan, Kredit)
        *   `4-40002`: Pendapatan Lainnya (Pendapatan, Kredit)
        *   `6-60000`: Beban Makan & Minum (Beban, Debit)
        *   `6-60001`: Beban Transportasi (Beban, Debit)
        *   `6-60002`: Tagihan & Utilitas (Beban, Debit)
        *   `6-60003`: Belanja Bulanan (Beban, Debit)
        *   `6-60004`: Hiburan & Lifestyle (Beban, Debit)
        *   `6-60005`: Kesehatan (Beban, Debit)
        *   `6-60006`: Tabungan & Investasi (Beban, Debit)

## FASE 2: Pemisahan Otak AI (Backend)

**1. Pecah Endpoint Chat AI**
*   **File Target:** `backend/src/modules/ai/ai.controller.ts`
*   **Aksi:**
    *   Ubah fungsi `@Post('chat')` yang ada menjadi `@Post('business/chat')`. Hapus semua logika terkait `account_type === 'personal'` beserta kode *fetch budget* di dalamnya. Jadikan murni untuk "CFO Virtual Bisnis".
    *   Buat fungsi baru `@Post('personal/chat')`. Pindahkan logika persona "Asisten Perencana Keuangan Pribadi" dan *fetching budget context* ke dalam fungsi ini. Endpoint ini eksklusif untuk data personal.

## FASE 3: Isolasi Frontend Web (Next.js)

**1. Keamanan Routing (Route Guard)**
*   **File Target:** `web/src/app/tenant/layout.tsx`
*   **Aksi:** Di dalam `useEffect` pengecekan *auth/tenant*, tambahkan proteksi:
    Jika `tenantData.account_type === 'personal'` dan rute saat ini (`pathname`) mengandung `/pos`, `/inventory`, `/staff`, atau `/drafts`, otomatis arahkan pengguna (`router.push`) kembali ke `/tenant/budget` atau `/tenant`.

**2. Pemisahan Komponen Chat Widget**
*   **File Target:** `web/src/components/ai/ChatWidget.tsx` (Ganti isi sepenuhnya menjadi penyeleksi).
*   **Aksi:** 
    *   Buat `PersonalAiWidget.tsx` yang secara spesifik menembak API `POST /api/v1/ai/personal/chat`. Desain ikon menggunakan ikon dompet/bintang dengan warna yang berbeda (misal warna sekunder).
    *   Buat `BusinessAiWidget.tsx` (berasal dari ChatWidget lama) yang menembak API `POST /api/v1/ai/business/chat`.
    *   Ubah `layout.tsx` di mana Widget AI dipanggil menjadi conditonal render: `isPersonal ? <PersonalAiWidget /> : <BusinessAiWidget />`.

## FASE 4: Isolasi Aplikasi Mobile (Flutter)

**1. Update Endpoint Chat Personal**
*   **File Target:** `tumbuhin_flutter/lib/features/ai/ai_chat_screen.dart`
*   **Aksi:** Ubah tujuan HTTP POST dari `/api/v1/ai/chat` menjadi `/api/v1/ai/personal/chat`.

**2. Update Endpoint Chat Bisnis**
*   **File Target:** `tumbuhin_flutter/lib/shared/widgets/ai_chat_widget.dart` (Asisten AI di dalam layar Kasir POS).
*   **Aksi:** Ubah tujuan HTTP POST dari `/api/v1/ai/chat` menjadi `/api/v1/ai/business/chat`.

**3. Verifikasi Keamanan Shell Navigation**
*   **File Target:** `tumbuhin_flutter/lib/shared/widgets/main_shell.dart`
*   **Aksi:** Pastikan secara absolut (sudah dilakukan, cukup *review*) bahwa tab POS dan Inventory disembunyikan menggunakan pengecekan `if (!isPersonal)` dan pastikan `GoRouter` mengabaikan injeksi path paksa dari luar.

## FASE 5: Pemisahan Entitas Database & Registrasi (Backend & Web) [DONE]

- Fungsi migrasi dan auth enum tier serta `register/page.tsx` sudah dikonfigurasi.

## FASE 6: Penyesuaian Data Model & UI Profil (Flutter)

**1. Update Enum User Role**
*   **File Target:** `tumbuhin_flutter/lib/shared/models/user_profile.dart`
*   **Aksi:** Tambahkan enumerasi `personal` ke dalam `enum UserRole { manager, kasir, stok, personal }` lalu jalankan `dart run build_runner build -d` agar parser (freezed/json_serializable) tidak *error* saat menerima role personal dari backend.

**2. Sembunyikan UI Bisnis di Settings**
*   **File Target:** `tumbuhin_flutter/lib/features/settings/settings_screen.dart`
*   **Aksi:** 
    *   Sembunyikan menu "Kelola Staf" dan blok "Informasi Toko/Tenant" dengan pengecekan kondisi `if (profile.accountType == 'personal')`.
    *   Pastikan tulisan profil dan pengaturan murni bersifat personal, tanpa referensi ke operasional toko.

---

# Tugas Implementasi Baru: Membangun Fitur "Full" Tanpa Limitasi
Instruksi di bawah ini difokuskan untuk mengimplementasikan fungsionalitas inti (Full Features) secara bebas tanpa mempedulikan limitasi tier (Trial/Full) terlebih dahulu.

## FASE 7: Buka Akses Fitur Full & Refactor Tier (Backend & Web)

**1. Bypass Tier Guard & Standardisasi Tier**
*   **File Target:** `backend/src/core/auth/tier.guard.ts`
*   **Aksi:** Di baris pertama dalam fungsi `canActivate`, tambahkan `return true;` untuk mem-bypass keamanan tier secara global. Ini agar proses pengembangan *frontend* fitur-fitur "Full" (seperti Multi-gudang dan Neraca) tidak terkena *error 403 Forbidden*.
*   **File Target:** Semua Controller di backend (`warehouse.controller.ts`, `finance.controller.ts`, dll).
*   **Aksi:** Lakukan pencarian teks `@RequireTier(SubscriptionTier.BUSINESS)` dan `@RequireTier(SubscriptionTier.PRO)`. Ubah semuanya menjadi `@RequireTier(SubscriptionTier.FULL)`.

**2. Buka Akses UI Bisnis di Web**
*   **File Target:** Semua file di `web/src/app/tenant/` dan komponen pendukungnya.
*   **Aksi:** Hapus logika *conditional rendering* yang mengunci UI berdasarkan tier `free` atau `starter` lama (contoh: menyembunyikan tombol gudang atau menu laporan lanjut). Tampilkan semua menu bisnis secara terbuka.

## FASE 8: Implementasi Fitur Full Personal (Flutter)

Fitur utama Personal adalah bisa mencatat pemasukan dan pengeluaran secara kilat. Saat ini hanya ada layar untuk *melihat* (TransactionsScreen) namun belum ada fitur *input*.

**1. Tambahkan Tombol Input Kilat (FAB)**
*   **File Target:** `tumbuhin_flutter/lib/features/transactions/transactions_screen.dart`
*   **Aksi:** Tambahkan `FloatingActionButton` besar (misalnya warna kuning primary) dengan ikon `+`. Saat di-*tap*, tombol ini akan memanggil `showModalBottomSheet` yang menampilkan form `AddTransactionBottomSheet`.

**2. Buat Form Pencatatan Personal**
*   **File Target:** `tumbuhin_flutter/lib/features/transactions/widgets/add_transaction_bottom_sheet.dart` (BUAT BARU)
*   **Aksi:** Implementasikan sebuah BottomSheet UI.
    *   Tambahkan *SegmentedButton* atau *Toggle* untuk memilih jenis: **Pemasukan** atau **Pengeluaran**.
    *   Tambahkan *TextField* bertipe angka untuk Nominal (`Rp`).
    *   Tambahkan *TextField* bertipe teks untuk Catatan/Deskripsi.
    *   Tambahkan *Dropdown* Kategori (Pilih salah satu dari hardcode COA Fase 1 di atas, misalnya "6-60000: Beban Makan & Minum").
    *   Tambahkan tombol **"Simpan"** yang memicu *JournalRepository* untuk mengirim data transaksi ke backend. Abaikan pengecekan limit harian atau kuota AI. Asumsikan akun ini adalah akun Full.

## FASE 9: Buka Akses Fitur Full Bisnis (Flutter)

**1. Hapus Gembok Tier di UI Inventory & Laporan**
*   **File Target:** `tumbuhin_flutter/lib/features/inventory/inventory_screen.dart` dan `tumbuhin_flutter/lib/features/reports/reports_screen.dart`
*   **Aksi:** Cari logika UI yang menyembunyikan tombol (misal: "Multi-Gudang" atau "Transfer Stok") atau *Tab* (misal: "Neraca Lanjut") berdasarkan kondisi tier tertentu. Hapus kondisi tersebut sehingga semua fitur "Full" Bisnis tampil secara *default*. Ini memastikan fungsionalitas utama bisa dites tanpa harus repot mengatur status *subscription* di *database* saat pengembangan.

---

## FASE 10: Standardisasi Tier "Trial vs Full" & Pembersihan Akun Lama [DONE]

**1. Keamanan & Logika Backend (Restored)**
- [x] Hapus bypass `return true;` di `tier.guard.ts`.
- [x] Perbarui `TIER_HIERARCHY` di `tier.guard.ts` (Hanya TRIAL & FULL).
- [x] Perbarui enum `SubscriptionTier` di `tier.enum.ts` (Hapus legacy tiers).
- [x] Update seluruh Controller menggunakan `@RequireTier(SubscriptionTier.FULL)`.

**2. UI Web (Next.js)**
- [x] Gunakan logika `isFull = tenant?.tier === 'full'` secara ketat di `layout.tsx` dan `page.tsx`.
- [x] Ganti nama menu `/tenant/drafts` menjadi "Validasi Transaksi AI".
- [x] Rombak total `app/tenant/subscription/page.tsx` (Tampilan dinamis Personal vs Bisnis).
- [x] Hapus badge tier di halaman POS.

**3. UI Mobile (Flutter)**
- [x] Perbarui kartu membership di `settings_screen.dart` menjadi Trial vs Full.
- [x] Hapus bypass `isPremium = true` di `inventory_screen.dart`.
- [x] Aktifkan batasan ekspor di `reports_screen.dart` untuk pengguna non-Full.

**4. Sistem Registrasi & Guest**
- [x] Update `register/page.tsx` untuk menggunakan tier Trial/Full sejak awal.
- [x] Update `auth_provider.dart` (Flutter) untuk tier Guest Default.

