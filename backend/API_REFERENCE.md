# API Quick Reference - CSSD Roster Pro

## Base URL
```
http://localhost:3001
```

## Authentication
Semua endpoint (kecuali login & register) memerlukan JWT token di header:
```
Authorization: Bearer <your_token_here>
```

---

## 🔐 Authentication Endpoints

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@cssd.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "user": { "id": 1, "name": "Administrator", "role": "admin" },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "nip": "STAFF001",
  "name": "John Doe",
  "email": "john@cssd.com",
  "password": "password123",
  "phone": "081234567890",
  "role": "staff",
  "position": "Staff CSSD"
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe Updated",
  "phone": "081234567890"
}
```

### Change Password
```http
PUT /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

---

## 👥 Users Endpoints

### Get All Users (Admin/Supervisor only)
```http
GET /api/users
Authorization: Bearer <token>

# Query params (optional):
?role=staff
?isActive=true
```

### Get User by ID
```http
GET /api/users/1
Authorization: Bearer <token>
```

### Update User (Admin only)
```http
PUT /api/users/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "role": "supervisor",
  "isActive": true
}
```

### Delete User (Admin only)
```http
DELETE /api/users/1
Authorization: Bearer <token>
```

### Get User Statistics (Admin/Supervisor only)
```http
GET /api/users/stats/summary
Authorization: Bearer <token>
```

---

## 🏢 Units Endpoints

### Get All Units
```http
GET /api/units
Authorization: Bearer <token>

# Query params (optional):
?isActive=true
```

### Create Unit (Admin only)
```http
POST /api/units
Authorization: Bearer <token>
Content-Type: application/json

{
  "code": "QUALITY",
  "name": "Quality Control",
  "description": "Area quality control",
  "color": "#8B5CF6"
}
```

### Update Unit (Admin only)
```http
PUT /api/units/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Quality Control Updated",
  "color": "#9333EA"
}
```

### Delete Unit (Admin only)
```http
DELETE /api/units/1
Authorization: Bearer <token>
```

---

## ⏰ Shifts Endpoints

### Get All Shifts
```http
GET /api/shifts
Authorization: Bearer <token>

# Query params (optional):
?isActive=true
```

### Create Shift (Admin only)
```http
POST /api/shifts
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Shift Custom",
  "code": "CUSTOM",
  "startTime": "08:00",
  "endTime": "16:00",
  "color": "#F59E0B"
}
```

### Update Shift (Admin only)
```http
PUT /api/shifts/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Shift Pagi Updated",
  "startTime": "07:30"
}
```

### Delete Shift (Admin only)
```http
DELETE /api/shifts/1
Authorization: Bearer <token>
```

---

## 📅 Schedules Endpoints

### Get All Schedules
```http
GET /api/schedules
Authorization: Bearer <token>

# Query params (optional):
?startDate=2026-01-01
?endDate=2026-01-31
?userId=1
?unitId=2
?shiftId=1
```

### Get My Schedule
```http
GET /api/schedules/my-schedule
Authorization: Bearer <token>

# Query params (optional):
?startDate=2026-01-01
?endDate=2026-01-31
```

### Create Schedule (Admin/Supervisor only)
```http
POST /api/schedules
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": 1,
  "unitId": 1,
  "shiftId": 1,
  "date": "2026-01-02",
  "status": "scheduled",
  "notes": "Jadwal shift pagi"
}
```

### Bulk Create Schedules (Admin/Supervisor only)
```http
POST /api/schedules/bulk
Authorization: Bearer <token>
Content-Type: application/json

{
  "schedules": [
    {
      "userId": 1,
      "unitId": 1,
      "shiftId": 1,
      "date": "2026-01-02"
    },
    {
      "userId": 2,
      "unitId": 2,
      "shiftId": 2,
      "date": "2026-01-02"
    }
  ]
}
```

### Update Schedule (Admin/Supervisor only)
```http
PUT /api/schedules/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "unitId": 2,
  "shiftId": 2,
  "status": "completed",
  "notes": "Updated notes"
}
```

### Delete Schedule (Admin/Supervisor only)
```http
DELETE /api/schedules/1
Authorization: Bearer <token>
```

---

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operasi berhasil",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Pesan error",
  "errors": [
    {
      "field": "email",
      "message": "Email tidak valid"
    }
  ]
}
```

---

## 🔑 User Roles

| Role | Permissions |
|------|-------------|
| **admin** | Full access - semua operasi CRUD |
| **supervisor** | Manage schedules, view all data |
| **staff** | View own schedule, request shift swap/leave |

---

## 📋 Status Values

### Schedule Status
- `scheduled` - Jadwal terjadwal
- `completed` - Selesai
- `cancelled` - Dibatalkan
- `absent` - Tidak hadir
- `leave` - Cuti/Izin

### Shift Swap Status
- `pending` - Menunggu persetujuan
- `approved` - Disetujui
- `rejected` - Ditolak
- `cancelled` - Dibatalkan

### Leave Request Status
- `pending` - Menunggu persetujuan
- `approved` - Disetujui
- `rejected` - Ditolak
- `cancelled` - Dibatalkan

---

## 🧪 Testing dengan cURL

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cssd.com","password":"admin123"}'
```

### Get Schedules
```bash
curl -X GET http://localhost:3001/api/schedules \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Create Schedule
```bash
curl -X POST http://localhost:3001/api/schedules \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "unitId": 1,
    "shiftId": 1,
    "date": "2026-01-02"
  }'
```

---

## 🚨 Common HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request berhasil |
| 201 | Created - Resource berhasil dibuat |
| 400 | Bad Request - Input tidak valid |
| 401 | Unauthorized - Token tidak ada/invalid |
| 403 | Forbidden - Tidak memiliki akses |
| 404 | Not Found - Resource tidak ditemukan |
| 500 | Internal Server Error - Error server |

---

## 💡 Tips

1. **Simpan Token**: Setelah login, simpan token untuk request selanjutnya
2. **Token Expiry**: Token berlaku 7 hari, login ulang jika expired
3. **Pagination**: Untuk data besar, gunakan query params untuk filter
4. **Bulk Operations**: Gunakan bulk endpoints untuk efisiensi
5. **Error Handling**: Selalu cek response status dan message

---

**Last Updated:** 1 Januari 2026
