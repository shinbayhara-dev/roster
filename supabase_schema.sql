-- Database Schema untuk CSSD Roster Pro (Supabase Compatible)

-- 1. Tabel Users (Karyawan CSSD)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    nip VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL DEFAULT 'staff',
    position VARCHAR(50),
    photo_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_role CHECK (role IN ('admin', 'supervisor', 'staff'))
);

-- 2. Tabel Units (Unit Kerja CSSD)
CREATE TABLE IF NOT EXISTS units (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabel Shifts (Jenis Shift)
CREATE TABLE IF NOT EXISTS shifts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    color VARCHAR(7) DEFAULT '#10B981',
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabel Schedules (Jadwal Kerja)
CREATE TABLE IF NOT EXISTS schedules (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    unit_id INTEGER REFERENCES units(id) ON DELETE CASCADE,
    shift_id INTEGER REFERENCES shifts(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled',
    notes TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_status CHECK (status IN ('scheduled', 'completed', 'cancelled', 'absent', 'leave')),
    UNIQUE(user_id, date)
);

-- 5. Tabel Shift Swaps (Tukar Shift)
CREATE TABLE IF NOT EXISTS shift_swaps (
    id SERIAL PRIMARY KEY,
    requester_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    requester_schedule_id INTEGER NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
    target_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_schedule_id INTEGER NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending',
    reason TEXT,
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_swap_status CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled'))
);

-- 6. Tabel Leave Requests (Cuti/Izin)
CREATE TABLE IF NOT EXISTS leave_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    leave_type VARCHAR(20) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMP,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_leave_type CHECK (leave_type IN ('annual', 'sick', 'emergency', 'unpaid')),
    CONSTRAINT check_leave_status CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled'))
);

-- 7. Indexes
CREATE INDEX IF NOT EXISTS idx_schedules_user_date ON schedules(user_id, date);
CREATE INDEX IF NOT EXISTS idx_schedules_date ON schedules(date);
CREATE INDEX IF NOT EXISTS idx_schedules_unit ON schedules(unit_id);
CREATE INDEX IF NOT EXISTS idx_shift_swaps_status ON shift_swaps(status);
CREATE INDEX IF NOT EXISTS idx_leave_requests_user ON leave_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_dates ON leave_requests(start_date, end_date);

-- 8. Default Data

-- Default Units
INSERT INTO units (code, name, description, color) VALUES
('DEKONTAMINASI', 'Dekontaminasi', 'Area dekontaminasi dan pencucian alat', '#EF4444'),
('PACKING', 'Packing', 'Area packing dan pengemasan alat steril', '#3B82F6'),
('STERILISASI', 'Sterilisasi', 'Area sterilisasi dengan autoclave', '#10B981'),
('DISTRIBUSI', 'Distribusi', 'Area distribusi alat steril', '#F59E0B')
ON CONFLICT (code) DO NOTHING;

-- Default Shifts
INSERT INTO shifts (name, code, start_time, end_time, color) VALUES
('Shift Pagi', 'PAGI', '07:00', '14:00', '#10B981'),
('Shift Siang', 'SIANG', '14:00', '21:00', '#3B82F6'),
('Shift Malam', 'MALAM', '21:00', '07:00', '#6366F1'),
('Libur', 'OFF', '00:00', '00:00', '#EF4444')
ON CONFLICT (code) DO NOTHING;

-- Default Admin User (Password: admin123 -> Hash: $2a$10$oXWgR3erTFbgXOeqQxD5U6BCJRBSlB2M9eIdbGJ0TPuge)
-- Note: Replace this hash if you want a different default password. This one is for 'admin123'
INSERT INTO users (nip, name, email, password, role, position) VALUES
('ADMIN001', 'Administrator', 'admin@cssd.com', '$2a$10$oXWgR3erTFbgXOeqQxD5U6BCJRBSlB2M9eIdbGJ0TPuge', 'admin', 'Kepala CSSD')
ON CONFLICT (nip) DO NOTHING;
