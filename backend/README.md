# CSSD Roster Pro - Backend API

Backend API untuk aplikasi jadwal unit kerja CSSD (Central Sterile Supply Department) menggunakan Node.js, Express, dan PostgreSQL.

## 🚀 Fitur

- ✅ **Autentikasi & Autorisasi** - JWT-based authentication dengan role-based access control
- 👥 **Manajemen User** - CRUD karyawan CSSD dengan role (Admin, Supervisor, Staff)
- 🏢 **Manajemen Unit** - Kelola unit kerja CSSD (Dekontaminasi, Packing, Sterilisasi, Distribusi)
- ⏰ **Manajemen Shift** - Atur shift kerja (Pagi, Siang, Malam)
- 📅 **Penjadwalan** - Buat dan kelola jadwal kerja karyawan
- 🔄 **Tukar Shift** - Sistem permintaan tukar shift antar karyawan
- 🏖️ **Cuti/Izin** - Manajemen permintaan cuti dan izin

## 📋 Prerequisites

- Node.js (v18 atau lebih baru)
- PostgreSQL (v14 atau lebih baru)
- npm atau yarn

## 🛠️ Instalasi

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Setup Database PostgreSQL

Pastikan PostgreSQL sudah terinstall dan berjalan. Buat database baru:

```sql
CREATE DATABASE cssd_roster;
```

### 3. Konfigurasi Environment

Salin file `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

Edit file `.env` dan sesuaikan dengan konfigurasi Anda:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cssd_roster
DB_USER=postgres
DB_PASSWORD=your_password_here

# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Secret (ganti dengan secret key yang aman)
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

### 4. Jalankan Migrasi Database

```bash
npm run migrate
```

Atau jalankan manual:

```bash
node migrations/schema.js
```

### 5. Jalankan Server

**Development mode (dengan auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server akan berjalan di `http://localhost:3001`

## 📚 API Endpoints

### Authentication

| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| POST | `/api/auth/register` | Register user baru | Public |
| POST | `/api/auth/login` | Login user | Public |
| GET | `/api/auth/me` | Get current user | Private |
| PUT | `/api/auth/profile` | Update profile | Private |
| PUT | `/api/auth/change-password` | Ubah password | Private |

### Users

| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| GET | `/api/users` | Get all users | Admin/Supervisor |
| GET | `/api/users/:id` | Get user by ID | Private |
| PUT | `/api/users/:id` | Update user | Admin |
| DELETE | `/api/users/:id` | Delete user | Admin |
| GET | `/api/users/stats/summary` | Get user statistics | Admin/Supervisor |

### Units

| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| GET | `/api/units` | Get all units | Private |
| POST | `/api/units` | Create unit | Admin |
| PUT | `/api/units/:id` | Update unit | Admin |
| DELETE | `/api/units/:id` | Delete unit | Admin |

### Shifts

| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| GET | `/api/shifts` | Get all shifts | Private |
| POST | `/api/shifts` | Create shift | Admin |
| PUT | `/api/shifts/:id` | Update shift | Admin |
| DELETE | `/api/shifts/:id` | Delete shift | Admin |

### Schedules

| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| GET | `/api/schedules` | Get all schedules | Private |
| GET | `/api/schedules/my-schedule` | Get jadwal user login | Private |
| POST | `/api/schedules` | Create schedule | Admin/Supervisor |
| POST | `/api/schedules/bulk` | Create multiple schedules | Admin/Supervisor |
| PUT | `/api/schedules/:id` | Update schedule | Admin/Supervisor |
| DELETE | `/api/schedules/:id` | Delete schedule | Admin/Supervisor |

## 🗄️ Database Schema

### Tabel Users
```sql
- id (SERIAL PRIMARY KEY)
- nip (VARCHAR UNIQUE)
- name (VARCHAR)
- email (VARCHAR UNIQUE)
- password (VARCHAR)
- phone (VARCHAR)
- role (VARCHAR) - admin, supervisor, staff
- position (VARCHAR)
- photo_url (TEXT)
- is_active (BOOLEAN)
- created_at, updated_at (TIMESTAMP)
```

### Tabel Units
```sql
- id (SERIAL PRIMARY KEY)
- code (VARCHAR UNIQUE)
- name (VARCHAR)
- description (TEXT)
- color (VARCHAR)
- is_active (BOOLEAN)
- created_at, updated_at (TIMESTAMP)
```

### Tabel Shifts
```sql
- id (SERIAL PRIMARY KEY)
- name (VARCHAR)
- code (VARCHAR UNIQUE)
- start_time (TIME)
- end_time (TIME)
- color (VARCHAR)
- description (TEXT)
- is_active (BOOLEAN)
- created_at, updated_at (TIMESTAMP)
```

### Tabel Schedules
```sql
- id (SERIAL PRIMARY KEY)
- user_id (INTEGER FK -> users)
- unit_id (INTEGER FK -> units)
- shift_id (INTEGER FK -> shifts)
- date (DATE)
- status (VARCHAR) - scheduled, completed, cancelled, absent, leave
- notes (TEXT)
- created_by (INTEGER FK -> users)
- created_at, updated_at (TIMESTAMP)
```

### Tabel Shift Swaps
```sql
- id (SERIAL PRIMARY KEY)
- requester_id (INTEGER FK -> users)
- requester_schedule_id (INTEGER FK -> schedules)
- target_id (INTEGER FK -> users)
- target_schedule_id (INTEGER FK -> schedules)
- status (VARCHAR) - pending, approved, rejected, cancelled
- reason (TEXT)
- approved_by (INTEGER FK -> users)
- approved_at (TIMESTAMP)
- created_at, updated_at (TIMESTAMP)
```

### Tabel Leave Requests
```sql
- id (SERIAL PRIMARY KEY)
- user_id (INTEGER FK -> users)
- leave_type (VARCHAR) - annual, sick, emergency, unpaid
- start_date (DATE)
- end_date (DATE)
- reason (TEXT)
- status (VARCHAR) - pending, approved, rejected, cancelled
- approved_by (INTEGER FK -> users)
- approved_at (TIMESTAMP)
- rejection_reason (TEXT)
- created_at, updated_at (TIMESTAMP)
```

## 🔐 Authentication

API menggunakan JWT (JSON Web Token) untuk autentikasi. Setelah login, Anda akan menerima token yang harus disertakan di header setiap request:

```
Authorization: Bearer <your_token_here>
```

## 👥 User Roles

- **Admin** - Akses penuh ke semua fitur
- **Supervisor** - Dapat mengelola jadwal dan melihat data
- **Staff** - Dapat melihat jadwal sendiri dan mengajukan tukar shift/cuti

## 📝 Default Data

Setelah migrasi, database akan memiliki data default:

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
- Password: admin123 (ganti setelah login pertama!)

## 🧪 Testing

Gunakan tools seperti Postman atau Thunder Client untuk testing API.

### Contoh Request Login:

```bash
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "email": "admin@cssd.com",
  "password": "admin123"
}
```

### Contoh Response:

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
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## 🚨 Error Handling

API mengembalikan response dengan format standar:

**Success:**
```json
{
  "success": true,
  "message": "Operasi berhasil",
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Pesan error",
  "errors": [ ... ]
}
```

## 📦 Struktur Folder

```
backend/
├── config/
│   └── database.js          # Konfigurasi koneksi PostgreSQL
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── migrations/
│   └── schema.js            # Database schema & migrations
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── users.js             # User management routes
│   ├── units.js             # Unit management routes
│   ├── shifts.js            # Shift management routes
│   └── schedules.js         # Schedule management routes
├── .env.example             # Environment variables template
├── package.json             # Dependencies
├── server.js                # Main server file
└── README.md                # Dokumentasi
```

## 🔧 Troubleshooting

### Database connection error
- Pastikan PostgreSQL berjalan
- Cek kredensial di file `.env`
- Pastikan database sudah dibuat

### Port already in use
- Ubah PORT di file `.env`
- Atau matikan aplikasi yang menggunakan port tersebut

### JWT token invalid
- Token mungkin sudah expired
- Login ulang untuk mendapatkan token baru

## 📄 License

MIT

## 👨‍💻 Developer

Dibuat untuk CSSD (Central Sterile Supply Department)
