# 🏥 CSSD Roster Pro

> **Aplikasi Manajemen Jadwal Unit Kerja CSSD (Central Sterile Supply Department)**

Sistem lengkap untuk mengelola jadwal kerja karyawan CSSD dengan fitur penjadwalan shift, manajemen unit kerja, dan sistem approval untuk tukar shift dan cuti.

---

## 🚀 Fitur Utama

### ✅ Backend API (PostgreSQL)
- **Authentication & Authorization** - JWT-based dengan role-based access control
- **User Management** - Kelola karyawan CSSD (Admin, Supervisor, Staff)
- **Unit Management** - Dekontaminasi, Packing, Sterilisasi, Distribusi
- **Shift Management** - Shift Pagi, Siang, Malam
- **Schedule Management** - Penjadwalan otomatis dan manual
- **Shift Swap** - Sistem permintaan tukar shift (Coming Soon)
- **Leave Management** - Manajemen cuti dan izin (Coming Soon)

### 🎨 Frontend (React + TypeScript)
- Modern UI dengan design system
- Real-time schedule updates
- Responsive design
- Interactive calendar view

---

## 📋 Prerequisites

- **Node.js** v18+ ([Download](https://nodejs.org/))
- **PostgreSQL** v14+ ([Download](https://www.postgresql.org/download/))
- **npm** (included with Node.js)

---

## 🛠️ Installation

### 1. Clone Repository

```bash
git clone <repository-url>
cd cssd-roster-pro
```

### 2. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
copy .env.example .env

# Edit .env dan sesuaikan konfigurasi database PostgreSQL Anda

# Buat database PostgreSQL
# Opsi 1: Menggunakan psql
psql -U postgres -c "CREATE DATABASE cssd_roster;"

# Opsi 2: Menggunakan pgAdmin (GUI)
# Buat database baru dengan nama: cssd_roster

# Jalankan migrasi database
npm run migrate

# Start backend server
npm run dev
```

Backend akan berjalan di: `http://localhost:3001`

**Default Admin Login:**
- Email: `admin@cssd.com`
- Password: `admin123`

⚠️ **Ganti password setelah login pertama!**

### 3. Setup Frontend

```bash
# Kembali ke root directory
cd ..

# Install dependencies
npm install

# Set Gemini API Key (optional, untuk fitur AI)
# Edit .env.local dan tambahkan:
# GEMINI_API_KEY=your_api_key_here

# Start frontend
npm run dev
```

Frontend akan berjalan di: `http://localhost:5173`

---

## 📚 Dokumentasi

### Backend Documentation
- [📖 README.md](backend/README.md) - API documentation lengkap
- [🚀 SETUP.md](backend/SETUP.md) - Setup guide step-by-step
- [🏗️ ARCHITECTURE.md](backend/ARCHITECTURE.md) - Arsitektur sistem
- [⚡ API_REFERENCE.md](backend/API_REFERENCE.md) - Quick API reference
- [📊 INDEX.md](backend/INDEX.md) - Overview & summary

### Database Schema
![Database Schema](backend/database_schema_diagram.png)

### Postman Collection
Import file `backend/CSSD_Roster_API.postman_collection.json` untuk testing API.

---

## 🗄️ Database Schema

### Tabel Utama

| Tabel | Deskripsi |
|-------|-----------|
| **users** | Data karyawan CSSD dengan role (admin, supervisor, staff) |
| **units** | Unit kerja CSSD (Dekontaminasi, Packing, Sterilisasi, Distribusi) |
| **shifts** | Jenis shift kerja (Pagi, Siang, Malam, Libur) |
| **schedules** | Jadwal kerja karyawan dengan relasi ke users, units, dan shifts |
| **shift_swaps** | Permintaan tukar shift antar karyawan |
| **leave_requests** | Permintaan cuti dan izin karyawan |

---

## 🔐 Security Features

- ✅ Password hashing dengan bcrypt
- ✅ JWT authentication
- ✅ Role-based authorization
- ✅ SQL injection prevention
- ✅ CORS protection
- ✅ Input validation

---

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/login          - Login user
POST   /api/auth/register       - Register user baru
GET    /api/auth/me             - Get current user
PUT    /api/auth/profile        - Update profile
```

### Schedules
```
GET    /api/schedules           - Get all schedules
GET    /api/schedules/my-schedule - Get jadwal user login
POST   /api/schedules           - Create schedule
POST   /api/schedules/bulk      - Bulk create schedules
PUT    /api/schedules/:id       - Update schedule
DELETE /api/schedules/:id       - Delete schedule
```

### Users, Units, Shifts
```
GET    /api/users               - Get all users
GET    /api/units               - Get all units
GET    /api/shifts              - Get all shifts
```

Lihat [API_REFERENCE.md](backend/API_REFERENCE.md) untuk dokumentasi lengkap.

---

## 🧪 Testing

### Test Backend API

1. **Health Check**
   ```bash
   curl http://localhost:3001/health
   ```

2. **Login**
   ```bash
   curl -X POST http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@cssd.com","password":"admin123"}'
   ```

3. **Menggunakan Postman**
   - Import `backend/CSSD_Roster_API.postman_collection.json`
   - Test semua endpoints

---

## 📦 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing

### Frontend
- **React** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Lucide React** - Icons

---

## 📁 Project Structure

```
cssd-roster-pro/
├── backend/                    # Backend API
│   ├── config/                 # Database configuration
│   ├── middleware/             # Express middleware
│   ├── migrations/             # Database migrations
│   ├── routes/                 # API routes
│   ├── server.js               # Main server
│   └── package.json            # Backend dependencies
│
├── components/                 # React components
├── utils/                      # Utility functions
├── App.tsx                     # Main React app
├── index.tsx                   # Entry point
├── package.json                # Frontend dependencies
└── README.md                   # This file
```

---

## 🔧 Troubleshooting

### Backend Issues

**Database connection error:**
- Pastikan PostgreSQL berjalan
- Cek kredensial di `backend/.env`
- Pastikan database `cssd_roster` sudah dibuat

**Port already in use:**
- Ubah PORT di `backend/.env`
- Default: 3001

**Migration failed:**
- Cek koneksi database
- Pastikan PostgreSQL version 14+

### Frontend Issues

**Cannot connect to backend:**
- Pastikan backend berjalan di port 3001
- Cek CORS configuration

---

## 🚀 Deployment

### Backend Production
```bash
cd backend
npm start
```

### Frontend Production
```bash
npm run build
npm run preview
```

---

## 📈 Roadmap

- [x] Backend API dengan PostgreSQL
- [x] Authentication & Authorization
- [x] Schedule Management
- [ ] Frontend Integration
- [ ] Shift Swap Feature
- [ ] Leave Management
- [ ] Notification System
- [ ] Report Generation
- [ ] Mobile App

---

## 🤝 Contributing

Untuk kontribusi atau bug report, silakan hubungi tim development.

---

## 📄 License

MIT License

---

## 👨‍💻 Developer

Dibuat untuk **CSSD (Central Sterile Supply Department)**

**Tanggal:** 1 Januari 2026

---

## 📞 Support

Untuk bantuan:
1. Baca dokumentasi di folder `backend/`
2. Cek troubleshooting guide
3. Review API documentation

---

**Happy Coding! 🚀**



