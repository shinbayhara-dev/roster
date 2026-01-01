# 🚀 Quick Start Guide - CSSD Roster Pro

Panduan cepat untuk menjalankan aplikasi CSSD Roster Pro dalam 5 menit!

---

## ⚡ Langkah Cepat

### 1️⃣ Persiapan (2 menit)

**Pastikan sudah terinstall:**
- ✅ Node.js v18+ → [Download](https://nodejs.org/)
- ✅ PostgreSQL v14+ → [Download](https://www.postgresql.org/download/)

**Cek instalasi:**
```bash
node --version
psql --version
```

---

### 2️⃣ Setup Database (1 menit)

**Buat database PostgreSQL:**

```bash
# Login ke PostgreSQL
psql -U postgres

# Buat database
CREATE DATABASE cssd_roster;

# Keluar
\q
```

**Atau gunakan pgAdmin (GUI):**
1. Buka pgAdmin
2. Klik kanan "Databases" → Create → Database
3. Nama: `cssd_roster`
4. Save

---

### 3️⃣ Setup Backend (1 menit)

```bash
cd backend

# Install dependencies
npm install

# Copy .env
copy .env.example .env

# PENTING: Edit .env dan isi DB_PASSWORD dengan password PostgreSQL Anda!
# Gunakan notepad atau editor favorit:
notepad .env

# Jalankan migrasi
npm run migrate

# Start server
npm run dev
```

✅ Backend berjalan di: **http://localhost:3001**

---

### 4️⃣ Setup Frontend (1 menit)

**Buka terminal baru:**

```bash
# Kembali ke root folder
cd ..

# Install dependencies
npm install

# Start frontend
npm run dev
```

✅ Frontend berjalan di: **http://localhost:5173**

---

## 🎉 Selesai!

### Test Backend

Buka browser: **http://localhost:3001/health**

Jika muncul:
```json
{
  "success": true,
  "message": "CSSD Roster API is running"
}
```

✅ **Backend berhasil!**

### Test Frontend

Buka browser: **http://localhost:5173**

✅ **Frontend berhasil!**

---

## 🔑 Login Pertama

**Default Admin:**
- Email: `admin@cssd.com`
- Password: `admin123`

⚠️ **Ganti password setelah login!**

---

## 📝 Langkah Selanjutnya

### 1. Test API dengan Postman

```bash
# Import collection
backend/CSSD_Roster_API.postman_collection.json
```

### 2. Buat User Baru

**POST** `http://localhost:3001/api/auth/register`

```json
{
  "nip": "STAFF001",
  "name": "John Doe",
  "email": "john@cssd.com",
  "password": "password123",
  "role": "staff",
  "position": "Staff CSSD"
}
```

### 3. Buat Unit Baru (Admin only)

**POST** `http://localhost:3001/api/units`

```json
{
  "code": "QUALITY",
  "name": "Quality Control",
  "description": "Area quality control",
  "color": "#8B5CF6"
}
```

### 4. Buat Jadwal

**POST** `http://localhost:3001/api/schedules`

```json
{
  "userId": 1,
  "unitId": 1,
  "shiftId": 1,
  "date": "2026-01-02",
  "status": "scheduled"
}
```

---

## 🆘 Troubleshooting Cepat

### ❌ Error: "password authentication failed"
**Solusi:** Edit `backend/.env` dan pastikan `DB_PASSWORD` sesuai dengan password PostgreSQL Anda

### ❌ Error: "database does not exist"
**Solusi:** Buat database dengan: `psql -U postgres -c "CREATE DATABASE cssd_roster;"`

### ❌ Error: "Port 3001 already in use"
**Solusi:** Edit `backend/.env` dan ubah `PORT=3002`

### ❌ Error: "ECONNREFUSED"
**Solusi:** Pastikan PostgreSQL service berjalan
- Windows: Services → PostgreSQL
- Linux: `sudo systemctl start postgresql`

---

## 📚 Dokumentasi Lengkap

| Dokumen | Link |
|---------|------|
| API Documentation | [backend/README.md](backend/README.md) |
| Setup Guide | [backend/SETUP.md](backend/SETUP.md) |
| Architecture | [backend/ARCHITECTURE.md](backend/ARCHITECTURE.md) |
| API Reference | [backend/API_REFERENCE.md](backend/API_REFERENCE.md) |

---

## 🎯 Default Data

Setelah migrasi, database memiliki:

**Units:**
- Dekontaminasi
- Packing
- Sterilisasi
- Distribusi

**Shifts:**
- Shift Pagi (07:00 - 14:00)
- Shift Siang (14:00 - 21:00)
- Shift Malam (21:00 - 07:00)
- Libur

**Admin User:**
- Email: admin@cssd.com
- Password: admin123

---

## ✨ Tips

1. **Gunakan Postman** untuk testing API
2. **Simpan JWT token** setelah login
3. **Baca dokumentasi** di folder `backend/`
4. **Ganti password admin** setelah setup
5. **Backup database** secara berkala

---

**Selamat menggunakan CSSD Roster Pro! 🎉**

Jika ada pertanyaan, lihat dokumentasi lengkap atau hubungi tim development.
