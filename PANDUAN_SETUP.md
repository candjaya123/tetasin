# 🚀 Panduan Setup & Menjalankan Proyek Tumbuhin

Berikut adalah panduan lengkap untuk melakukan setup database dan menjalankan seluruh layanan (Backend, Web, dan Mobile) pada proyek Tumbuhin.

## 🗄️ 1. Setup Database (Supabase PostgreSQL)

Sistem Tumbuhin menggunakan **Supabase (PostgreSQL)**. Semua tabel, relasi, fungsi RPC, dan Row Level Security (RLS) diatur melalui migrasi SQL.

Terdapat dua cara untuk mengeksekusi *query* setup database ini:

### Opsi A: Menggunakan Query SQL Lengkap (Manual di SQL Editor)
Saya telah menggabungkan seluruh *query* migrasi ke dalam satu file SQL yang utuh dan berurutan untuk menghindari *error*.
File ini telah disiapkan di lokasi berikut:
🔗 **`database_setup_query.sql`** (berada di root folder `e:\tumbuhin\database_setup_query.sql`)

**Langkah eksekusi:**
1. Buka [Supabase Dashboard](https://app.supabase.com/) proyek Anda.
2. Masuk ke menu **SQL Editor**.
3. Buka file `database_setup_query.sql` yang ada di lokal komputer Anda, lalu *Copy* seluruh isinya.
4. *Paste* ke dalam SQL Editor di Supabase.
5. Klik tombol **Run**. Tunggu hingga semua *query* berhasil dieksekusi tanpa *error*.

### Opsi B: Menggunakan Supabase CLI (Direkomendasikan)
Jika Anda sudah menginstal Supabase CLI, jalankan perintah berikut dari root direktori proyek (`e:\tumbuhin\app`):
```bash
cd app
supabase link --project-ref [YOUR_PROJECT_ID]
supabase db push
```

---

## 🛠️ 2. Prasyarat Sistem (Prerequisites)
Pastikan mesin Anda telah terinstal perangkat lunak berikut sebelum melanjutkan:
- **Node.js** (v18.x atau v20.x)
- **npm**, **yarn**, atau **pnpm**
- Akun **Supabase** (beserta *URL*, *Anon Key*, dan *Service Role Key*)
- **Redis** berjalan di *background* (digunakan oleh Backend BullMQ)
- **Expo CLI** (jika ingin menjalankan app di HP via Expo Go)

---

## 🚀 3. Langkah Teknis Menjalankan Proyek

Sistem Tumbuhin merupakan *Modular Monolith* yang terdiri dari 3 pilar. **WAJIB** menjalankan **Backend** terlebih dahulu karena Web dan Mobile bergantung padanya.

### Langkah 1: Menjalankan Backend API (NestJS)
Backend merupakan pusat seluruh logika transaksi dan validasi (Source of Truth).

1. Buka terminal baru dan masuk ke folder `backend`:
   ```bash
   cd backend
   npm install
   ```
2. Siapkan file *environment*:
   ```bash
   cp .env.example .env
   ```
3. Buka file `.env` dan isi kredensial berikut:
   ```env
   SUPABASE_URL="https://[YOUR_PROJECT_ID].supabase.co"
   SUPABASE_SERVICE_ROLE_KEY="eyJ..." # Gunakan Service Role Key dari Supabase
   SUPABASE_JWT_SECRET="your-jwt-secret"
   REDIS_HOST="localhost"
   REDIS_PORT="6379"
   ```
4. Jalankan *server* backend:
   ```bash
   npm run start:dev
   ```
   *Backend akan berjalan di `http://localhost:3000`*

### Langkah 2: Menjalankan Web Dashboard (Next.js)
Web Dashboard digunakan untuk Admin & Management Tenant.

1. Buka terminal baru dan masuk ke folder `web`:
   ```bash
   cd web
   npm install
   ```
2. Siapkan file *environment*:
   ```bash
   cp .env.example .env.local
   ```
3. Buka file `.env.local` dan isi kredensial berikut:
   ```env
   NEXT_PUBLIC_SUPABASE_URL="https://[YOUR_PROJECT_ID].supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..." # Gunakan Anon Key dari Supabase
   NEXT_PUBLIC_BACKEND_URL="http://localhost:3000"
   ```
4. Jalankan aplikasi web:
   ```bash
   npm run dev
   ```
   *Web Dashboard akan berjalan di `http://localhost:3001` (atau 3000 jika backend diubah).*

### Langkah 3: Menjalankan Mobile App POS (React Native / Expo)
Aplikasi mobile difokuskan untuk Point of Sales (POS) dan operasional kasir.

1. Buka terminal baru dan masuk ke folder `app`:
   ```bash
   cd app
   npm install
   ```
2. Buat file `.env` di folder `app` (jika belum ada) dan isi kredensial berikut:
   ```env
   EXPO_PUBLIC_SUPABASE_URL="https://[YOUR_PROJECT_ID].supabase.co"
   EXPO_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
   # PENTING: Gunakan IP Lokal komputer Anda (contoh: 192.168.x.x) 
   # BUKAN localhost, jika Anda ingin mengetes di HP fisik.
   EXPO_PUBLIC_BACKEND_URL="http://[IP-LOKAL-ANDA]:3000" 
   ```
3. Jalankan server Expo:
   ```bash
   npx expo start
   ```
4. Anda bisa melakukan *scan barcode* Expo menggunakan aplikasi **Expo Go** (di iOS/Android) atau menekan `a` untuk membuka Android Emulator.

---
> **Catatan Penting Untuk Akun Dev / Superadmin:**
> Skrip SQL yang dieksekusi di Langkah 1 sudah menyertakan *Seed User* utama. Anda dapat *login* di Web atau Mobile menggunakan akun berikut untuk mengetes platform:
> - **Email**: `dev@tumbuhin.com`
> - **Password**: `password123`
