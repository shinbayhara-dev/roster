# 🏥 CSSD Roster Pro - Backend API

> **Backend API untuk Aplikasi Jadwal Unit Kerja CSSD (Central Sterile Supply Department)**

Backend ini dibangun menggunakan **Node.js**, **Express.js**, dan **PostgreSQL** dengan fitur lengkap untuk manajemen jadwal kerja karyawan CSSD.

---

## 📚 Dokumentasi Lengkap

| Dokumen | Deskripsi |
|---------|-----------|
| [README.md](README.md) | Dokumentasi API lengkap dengan semua endpoints |
| [SETUP.md](SETUP.md) | Panduan setup step-by-step |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Arsitektur sistem dan technical details |

---

## ⚡ Quick Start

### Windows
```bash
# Jalankan setup otomatis
setup.bat
```

### Manual
```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env

# 3. Edit .env dan sesuaikan konfigurasi database

# 4. Jalankan migrasi
npm run migrate

# 5. Start server
npm run dev
```

---

## 🎯 Fitur Utama

### ✅ Authentication & Authorization
- JWT-based authentication
- Role-based access control (Admin, Supervisor, Staff)
- Password hashing dengan bcrypt
- Secure token management

### 👥 User Management
- CRUD karyawan CSSD
- Profile management
- User statistics
- Role assignment

### 🏢 Unit Management
- Kelola unit kerja CSSD
- Dekontaminasi, Packing, Sterilisasi, Distribusi
- Custom color coding

### ⏰ Shift Management
- Atur shift kerja (Pagi, Siang, Malam)
- Flexible time configuration
- Shift templates

### 📅 Schedule Management
- Buat jadwal kerja karyawan
- Bulk schedule creation
- Filter by date, user, unit, shift
- Schedule status tracking

### 🔄 Shift Swap (Coming Soon)
- Request shift swap
- Approval workflow
- Notification system

### 🏖️ Leave Management (Coming Soon)
- Cuti tahunan, sakit, emergency
- Approval workflow
- Leave balance tracking

---

## 🗄️ Database Schema

### Tabel Utama

| Tabel | Deskripsi | Relasi |
|-------|-----------|--------|
| **users** | Data karyawan CSSD | - |
| **units** | Unit kerja CSSD | - |
| **shifts** | Jenis shift kerja | - |
| **schedules** | Jadwal kerja | users, units, shifts |
| **shift_swaps** | Permintaan tukar shift | users, schedules |
| **leave_requests** | Permintaan cuti/izin | users |

---

## 🔐 Security

- ✅ Password hashing (bcrypt)
- ✅ JWT authentication
- ✅ Role-based authorization
- ✅ SQL injection prevention (parameterized queries)
- ✅ CORS protection
- ✅ Input validation (express-validator)

---

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/register       - Register user baru
POST   /api/auth/login          - Login user
GET    /api/auth/me             - Get current user
PUT    /api/auth/profile        - Update profile
PUT    /api/auth/change-password - Change password
```

### Users
```
GET    /api/users               - Get all users
GET    /api/users/:id           - Get user by ID
PUT    /api/users/:id           - Update user
DELETE /api/users/:id           - Delete user
GET    /api/users/stats/summary - Get statistics
```

### Units
```
GET    /api/units               - Get all units
POST   /api/units               - Create unit
PUT    /api/units/:id           - Update unit
DELETE /api/units/:id           - Delete unit
```

### Shifts
```
GET    /api/shifts              - Get all shifts
POST   /api/shifts              - Create shift
PUT    /api/shifts/:id          - Update shift
DELETE /api/shifts/:id          - Delete shift
```

### Schedules
```
GET    /api/schedules           - Get all schedules
GET    /api/schedules/my-schedule - Get my schedule
POST   /api/schedules           - Create schedule
POST   /api/schedules/bulk      - Bulk create schedules
PUT    /api/schedules/:id       - Update schedule
DELETE /api/schedules/:id       - Delete schedule
```

---

## 🧪 Testing

### Postman Collection
Import file `CSSD_Roster_API.postman_collection.json` ke Postman untuk testing.

### Default Admin Account
```
Email: admin@cssd.com
Password: admin123
```

⚠️ **Ganti password setelah login pertama!**

---

## 📦 Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | v18+ | Runtime environment |
| Express.js | ^4.18 | Web framework |
| PostgreSQL | v14+ | Database |
| pg | ^8.11 | PostgreSQL client |
| bcryptjs | ^2.4 | Password hashing |
| jsonwebtoken | ^9.0 | JWT authentication |
| express-validator | ^7.0 | Input validation |
| cors | ^2.8 | CORS middleware |
| dotenv | ^16.3 | Environment variables |

---

## 📁 Struktur Folder

```
backend/
├── config/              # Database configuration
├── middleware/          # Express middleware
├── migrations/          # Database migrations
├── routes/              # API routes
├── .env.example         # Environment template
├── server.js            # Main server file
├── package.json         # Dependencies
└── README.md            # Documentation
```

---

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Environment Variables
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cssd_roster
DB_USER=postgres
DB_PASSWORD=your_password
PORT=3001
JWT_SECRET=your_secret_key
```

---

## 🔧 Troubleshooting

### Database Connection Error
- Pastikan PostgreSQL berjalan
- Cek kredensial di `.env`
- Pastikan database `cssd_roster` sudah dibuat

### Port Already in Use
- Ubah PORT di `.env`
- Atau matikan aplikasi yang menggunakan port tersebut

### JWT Token Invalid
- Token mungkin expired
- Login ulang untuk mendapatkan token baru

---

## 📈 Roadmap

- [x] Authentication & Authorization
- [x] User Management
- [x] Unit Management
- [x] Shift Management
- [x] Schedule Management
- [ ] Shift Swap Feature
- [ ] Leave Management
- [ ] Notification System
- [ ] Report Generation
- [ ] Dashboard Analytics
- [ ] Mobile App API

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

Untuk bantuan atau pertanyaan:
1. Baca dokumentasi lengkap di folder `backend/`
2. Cek troubleshooting guide di `SETUP.md`
3. Review arsitektur di `ARCHITECTURE.md`

---

**Happy Coding! 🚀**
