# Arsitektur Backend CSSD Roster Pro

## 📐 Struktur Folder

```
backend/
├── config/
│   └── database.js              # Konfigurasi koneksi PostgreSQL
│
├── middleware/
│   └── auth.js                  # JWT authentication & authorization
│
├── migrations/
│   ├── schema.js                # Database schema & migrations
│   └── create_database.sql      # SQL script untuk create database
│
├── routes/
│   ├── auth.js                  # Authentication endpoints
│   ├── users.js                 # User management endpoints
│   ├── units.js                 # Unit management endpoints
│   ├── shifts.js                # Shift management endpoints
│   └── schedules.js             # Schedule management endpoints
│
├── .env.example                 # Template environment variables
├── .gitignore                   # Git ignore rules
├── package.json                 # Dependencies & scripts
├── server.js                    # Main Express server
├── README.md                    # API documentation
├── SETUP.md                     # Setup guide
└── CSSD_Roster_API.postman_collection.json  # Postman collection
```

## 🏗️ Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│                    http://localhost:5173                     │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP/REST API
                           │ JWT Token
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Express.js Backend API                     │
│                    http://localhost:3001                     │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Routes     │  │  Middleware  │  │   Config     │      │
│  │              │  │              │  │              │      │
│  │ • auth.js    │  │ • auth.js    │  │ • database   │      │
│  │ • users.js   │  │ • CORS       │  │              │      │
│  │ • units.js   │  │ • JSON       │  │              │      │
│  │ • shifts.js  │  │ • Logging    │  │              │      │
│  │ • schedules  │  │              │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└──────────────────────────┬──────────────────────────────────┘
                           │ SQL Queries
                           │ pg (node-postgres)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   PostgreSQL Database                        │
│                      cssd_roster                             │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    users     │  │    units     │  │   shifts     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  schedules   │  │ shift_swaps  │  │leave_requests│      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## 🔐 Authentication Flow

```
┌─────────┐                                    ┌─────────┐
│ Client  │                                    │ Server  │
└────┬────┘                                    └────┬────┘
     │                                              │
     │  POST /api/auth/login                        │
     │  { email, password }                         │
     ├─────────────────────────────────────────────>│
     │                                              │
     │                                    ┌─────────▼────────┐
     │                                    │ Verify Password  │
     │                                    │ (bcrypt.compare) │
     │                                    └─────────┬────────┘
     │                                              │
     │                                    ┌─────────▼────────┐
     │                                    │  Generate JWT    │
     │                                    │  (jsonwebtoken)  │
     │                                    └─────────┬────────┘
     │                                              │
     │  { success, user, token }                    │
     │<─────────────────────────────────────────────┤
     │                                              │
     │  GET /api/schedules                          │
     │  Header: Authorization: Bearer <token>       │
     ├─────────────────────────────────────────────>│
     │                                              │
     │                                    ┌─────────▼────────┐
     │                                    │  Verify JWT      │
     │                                    │  (middleware)    │
     │                                    └─────────┬────────┘
     │                                              │
     │                                    ┌─────────▼────────┐
     │                                    │  Query Database  │
     │                                    └─────────┬────────┘
     │                                              │
     │  { success, data: [...schedules] }           │
     │<─────────────────────────────────────────────┤
     │                                              │
```

## 🗄️ Database Schema Relationships

```
┌─────────────────┐
│     users       │
│─────────────────│
│ • id (PK)       │
│ • nip           │◄────────┐
│ • name          │         │
│ • email         │         │
│ • password      │         │
│ • role          │         │
└────────┬────────┘         │
         │                  │
         │ created_by       │ user_id
         │                  │
         │        ┌─────────┴────────┐
         │        │   schedules      │
         │        │──────────────────│
         └───────►│ • id (PK)        │
                  │ • user_id (FK)   │
                  │ • unit_id (FK)   │◄───────┐
                  │ • shift_id (FK)  │◄──┐    │
                  │ • date           │   │    │
                  │ • status         │   │    │
                  └──────────────────┘   │    │
                                         │    │
         ┌───────────────────────────────┘    │
         │                                    │
┌────────┴────────┐              ┌───────────┴──────┐
│    shifts       │              │      units       │
│─────────────────│              │──────────────────│
│ • id (PK)       │              │ • id (PK)        │
│ • name          │              │ • code           │
│ • code          │              │ • name           │
│ • start_time    │              │ • description    │
│ • end_time      │              │ • color          │
└─────────────────┘              └──────────────────┘
```

## 🔄 Request/Response Flow

### 1. Client Request
```javascript
fetch('http://localhost:3001/api/schedules', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    'Content-Type': 'application/json'
  }
})
```

### 2. Middleware Chain
```
Request → CORS → JSON Parser → Auth Middleware → Route Handler
```

### 3. Route Handler
```javascript
router.get('/', authenticateToken, async (req, res) => {
  // Query database
  const result = await query('SELECT * FROM schedules...');
  
  // Return response
  res.json({ success: true, data: result.rows });
});
```

### 4. Database Query
```sql
SELECT 
  s.id, s.date, s.status,
  json_build_object('id', u.id, 'name', u.name) as user,
  json_build_object('id', un.id, 'name', un.name) as unit
FROM schedules s
JOIN users u ON s.user_id = u.id
JOIN units un ON s.unit_id = un.id
```

### 5. Response
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "date": "2026-01-02",
      "status": "scheduled",
      "user": { "id": 1, "name": "Administrator" },
      "unit": { "id": 1, "name": "Dekontaminasi" }
    }
  ]
}
```

## 🛡️ Security Features

### 1. Password Hashing
```javascript
// Registration
const hashedPassword = await bcrypt.hash(password, 10);

// Login
const isValid = await bcrypt.compare(password, user.password);
```

### 2. JWT Authentication
```javascript
// Generate token
const token = jwt.sign(
  { id: user.id, email: user.email, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

// Verify token
jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
  if (err) return res.status(403).json({ message: 'Invalid token' });
  req.user = user;
  next();
});
```

### 3. Role-Based Access Control
```javascript
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};

// Usage
router.post('/schedules', authenticateToken, authorizeRoles('admin', 'supervisor'), ...);
```

### 4. SQL Injection Prevention
```javascript
// ✅ SAFE - Parameterized query
await query('SELECT * FROM users WHERE email = $1', [email]);

// ❌ UNSAFE - String concatenation
await query(`SELECT * FROM users WHERE email = '${email}'`);
```

## 📊 Performance Optimizations

### 1. Database Indexes
```sql
CREATE INDEX idx_schedules_user_date ON schedules(user_id, date);
CREATE INDEX idx_schedules_date ON schedules(date);
CREATE INDEX idx_schedules_unit ON schedules(unit_id);
```

### 2. Connection Pooling
```javascript
const pool = new Pool({
  max: 20,                      // Maximum clients in pool
  idleTimeoutMillis: 30000,     // Close idle clients after 30s
  connectionTimeoutMillis: 2000 // Timeout after 2s
});
```

### 3. JSON Aggregation
```sql
-- Instead of multiple queries, use JSON aggregation
SELECT 
  s.*,
  json_build_object('id', u.id, 'name', u.name) as user
FROM schedules s
JOIN users u ON s.user_id = u.id
```

## 🧪 Testing Strategy

### 1. Unit Tests (Future)
- Test individual functions
- Mock database connections
- Test authentication logic

### 2. Integration Tests (Future)
- Test API endpoints
- Test database operations
- Test authentication flow

### 3. Manual Testing (Current)
- Use Postman collection
- Test all endpoints
- Verify responses

## 🚀 Deployment Considerations

### Development
- Use `.env` for local configuration
- Enable detailed error logging
- Use `npm run dev` for auto-reload

### Production
- Use environment variables (not `.env` file)
- Disable detailed error messages
- Use process manager (PM2)
- Enable HTTPS
- Set up database backups
- Monitor performance

## 📈 Scalability

### Horizontal Scaling
- Use load balancer (nginx)
- Multiple backend instances
- Shared PostgreSQL database
- Redis for session storage

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Add database read replicas
- Implement caching

---

**Dokumentasi ini menjelaskan arsitektur lengkap backend CSSD Roster Pro.**
