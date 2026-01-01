# Panduan Deployment (Vercel + Supabase)

## 1. Persiapan Database (Supabase)
1. Buka [Supabase](https://supabase.com) dan buat akun/project baru.
2. Masuk ke menu **SQL Editor**.
3. Buka file `supabase_schema.sql` yang ada di folder proyek ini.
4. Copy semua isinya dan Paste ke SQL Editor Supabase.
5. Klik **RUN** untuk membuat tabel dan data awal.
6. Masuk ke menu **Project Settings > Database**.
7. Salin detail koneksi berikut untuk nanti dimasukkan ke Vercel:
   - `Host`
   - `Database Name`
   - `User`
   - `Port`
   - `Password` (password database yang Anda buat saat setup project)

## 2. Persiapan Deployment (Vercel)
1. Buka [Vercel](https://vercel.com) dan buat akun (bisa login via GitHub).
2. Install Vercel CLI di terminal komputer Anda (jika belum):
   ```bash
   npm install -g vercel
   ```
3. Login ke Vercel via terminal:
   ```bash
   vercel login
   ```
4. Jalankan perintah deploy di folder proyek:
   ```bash
   vercel
   ```
5. Ikuti instruksi di terminal (pilih default Yes untuk sebagian besar pertanyaan).

## 3. Konfigurasi Environment Variables (Vercel)
Setelah proses deploy awal selesai (mungkin akan error karena belum ada koneksi DB), Anda perlu mengatur variabel lingkungan di Dashboard Vercel.

1. Buka Dashboard proyek Anda di Vercel.
2. Masuk ke menu **Settings > Environment Variables**.
3. Tambahkan variabel berikut (ambil nilainya dari Supabase tadi):
   - `DB_USER`: (User database Supabase, biasanya 'postgres')
   - `DB_HOST`: (Host database Supabase)
   - `DB_NAME`: (Nama database, biasanya 'postgres')
   - `DB_PASSWORD`: (Password database Anda)
   - `DB_PORT`: (Port, biasanya 5432)
   - `JWT_SECRET`: (Buat string acak yang panjang dan aman)

4. Setelah menyimpan variable, kembali ke terminal dan jalankan deploy ulang untuk menerapkan perubahan:
   ```bash
   vercel --prod
   ```

## 4. Selesai!
Aplikasi Anda sekarang aktif di URL yang diberikan Vercel (misal: `https://cssd-roster-pro.vercel.app`).
Admin bisa login menggunakan:
- **NIP**: ADMIN001
- **Password**: admin123
