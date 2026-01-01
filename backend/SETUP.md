# Setup Guide - CSSD Roster Pro Backend

Panduan lengkap untuk setup backend CSSD Roster Pro dengan PostgreSQL.

## 📋 Prerequisites

Pastikan sudah terinstall:
- ✅ Node.js v18+ ([Download](https://nodejs.org/))
- ✅ PostgreSQL v14+ ([Download](https://www.postgresql.org/download/))
- ✅ npm (sudah include dengan Node.js)

## 🚀 Langkah-langkah Setup

### 1. Cek Instalasi PostgreSQL

Buka terminal/command prompt dan jalankan:

```bash
psql --version
```

Jika muncul versi PostgreSQL, berarti sudah terinstall dengan benar.

### 2. Buat Database

**Opsi A: Menggunakan pgAdmin (GUI)**
1. Buka pgAdmin
2. Klik kanan pada "Databases" → Create → Database
3. Nama database: `cssd_roster`
4. Owner: `postgres`
5. Klik Save

**Opsi B: Menggunakan psql (Command Line)**

```bash
# Login ke PostgreSQL
psql -U postgres

# Buat database
CREATE DATABASE cssd_roster;

# Keluar dari psql
\q
```

**Opsi C: Menggunakan SQL Script**

```bash
psql -U postgres -f migrations/create_database.sql
```

### 3. Install Dependencies

```bash
cd backend
npm install
```

### 4. Konfigurasi Environment Variables

Buat file `.env` di folder `backend/`:

```bash
# Di Windows
copy .env.example .env

# Di Linux/Mac
cp .env.example .env
```

Edit file `.env` dan sesuaikan dengan konfigurasi PostgreSQL Anda:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cssd_roster
DB_USER=postgres
DB_PASSWORD=your_postgres_password_here

# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Secret (ganti dengan secret key yang aman)
JWT_SECRET=cssd_roster_secret_key_2026_change_in_production
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

⚠️ **PENTING**: Ganti `DB_PASSWORD` dengan password PostgreSQL Anda!

### 5. Jalankan Migrasi Database

```bash
npm run migrate
```

Atau:

```bash
node migrations/schema.js
```

Jika berhasil, Anda akan melihat output seperti ini:

```
🚀 Memulai migrasi database...
✅ Database PostgreSQL terhubung
✅ Tabel users berhasil dibuat
✅ Tabel units berhasil dibuat
✅ Tabel shifts berhasil dibuat
✅ Tabel schedules berhasil dibuat
✅ Tabel shift_swaps berhasil dibuat
✅ Tabel leave_requests berhasil dibuat
✅ Indexes berhasil dibuat
📝 Memasukkan data default...
✅ Data default berhasil dimasukkan
✅ Migrasi database selesai!
```

### 6. Jalankan Server

**Development Mode (dengan auto-reload):**

```bash
npm run dev
```

**Production Mode:**

```bash
npm start
```

Server akan berjalan di: `http://localhost:3001`

### 7. Test API

Buka browser atau Postman dan akses:

```
http://localhost:3001/health
```

Response yang benar:

```json
{
  "success": true,
  "message": "CSSD Roster API is running",
  "timestamp": "2026-01-01T08:18:05.000Z"
}
```

### 8. Test Login dengan Admin Default

**Endpoint:** `POST http://localhost:3001/api/auth/login`

**Request Body:**
```json
{
  "email": "admin@cssd.com",
  "password": "admin123"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "user": {
      "id": 1,
      "nip": "ADMIN001",
      "name": "Administrator",
      "email": "admin@cssd.com",
      "role": "admin",
      "position": "Kepala CSSD"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## 🔧 Troubleshooting

### Error: "password authentication failed"

**Solusi:**
- Pastikan password di `.env` sesuai dengan password PostgreSQL Anda
- Cek username PostgreSQL (default: `postgres`)

### Error: "database does not exist"

**Solusi:**
- Pastikan database `cssd_roster` sudah dibuat
- Jalankan: `psql -U postgres -c "CREATE DATABASE cssd_roster;"`

### Error: "ECONNREFUSED"

**Solusi:**
- Pastikan PostgreSQL service sedang berjalan
- Windows: Cek di Services → PostgreSQL
- Linux: `sudo systemctl status postgresql`
- Mac: `brew services list`

### Error: "Port 3001 already in use"

**Solusi:**
- Ubah PORT di file `.env` menjadi port lain (misal: 3002)
- Atau matikan aplikasi yang menggunakan port 3001

### Error: "Cannot find module"

**Solusi:**
- Hapus folder `node_modules`
- Jalankan `npm install` lagi

## 📊 Verifikasi Database

Untuk memastikan semua tabel berhasil dibuat:

```bash
psql -U postgres -d cssd_roster
```

Kemudian jalankan:

```sql
-- Lihat semua tabel
\dt

-- Lihat struktur tabel users
\d users

-- Lihat data default
SELECT * FROM units;
SELECT * FROM shifts;
SELECT * FROM users;
```

## 🎯 Next Steps

Setelah backend berhasil berjalan:

1. ✅ Test semua endpoint dengan Postman/Thunder Client
2. ✅ Ganti password admin default
3. ✅ Buat user baru untuk testing
4. ✅ Integrasikan dengan frontend
5. ✅ Setup production environment

## 📚 Dokumentasi API

Lihat file `README.md` untuk dokumentasi lengkap API endpoints.

## 🆘 Butuh Bantuan?

Jika mengalami masalah:
1. Cek log error di terminal
2. Pastikan semua prerequisites sudah terinstall
3. Verifikasi konfigurasi `.env`
4. Cek koneksi database PostgreSQL

---

**Selamat! Backend CSSD Roster Pro sudah siap digunakan! 🎉**
