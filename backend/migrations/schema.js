import { query } from '../config/database.js';
import bcrypt from 'bcryptjs';

/**
 * Database Schema untuk CSSD Roster Pro
 * 
 * Tabel-tabel:
 * 1. users - Data pengguna/karyawan CSSD
 * 2. units - Unit kerja di CSSD
 * 3. shifts - Jenis shift kerja
 * 4. schedules - Jadwal kerja karyawan
 * 5. shift_swaps - Permintaan tukar shift
 * 6. leave_requests - Permintaan cuti/izin
 */

export async function runMigrations() {
  console.log('🚀 Memulai migrasi database...');

  try {
    // 1. Tabel Users (Karyawan CSSD)
    await query(`
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
    `);
    console.log('✅ Tabel users berhasil dibuat');

    // 2. Tabel Units (Unit Kerja CSSD)
    await query(`
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
    `);
    console.log('✅ Tabel units berhasil dibuat');

    // 3. Tabel Shifts (Jenis Shift)
    await query(`
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
    `);
    console.log('✅ Tabel shifts berhasil dibuat');

    // 4. Tabel Schedules (Jadwal Kerja)
    await query(`
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
    `);
    console.log('✅ Tabel schedules berhasil dibuat');

    // 5. Tabel Shift Swaps (Tukar Shift)
    await query(`
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
    `);
    console.log('✅ Tabel shift_swaps berhasil dibuat');

    // 6. Tabel Leave Requests (Cuti/Izin)
    await query(`
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
    `);
    console.log('✅ Tabel leave_requests berhasil dibuat');

    // 7. Create indexes untuk performa
    await query(`
      CREATE INDEX IF NOT EXISTS idx_schedules_user_date ON schedules(user_id, date);
      CREATE INDEX IF NOT EXISTS idx_schedules_date ON schedules(date);
      CREATE INDEX IF NOT EXISTS idx_schedules_unit ON schedules(unit_id);
      CREATE INDEX IF NOT EXISTS idx_shift_swaps_status ON shift_swaps(status);
      CREATE INDEX IF NOT EXISTS idx_leave_requests_user ON leave_requests(user_id);
      CREATE INDEX IF NOT EXISTS idx_leave_requests_dates ON leave_requests(start_date, end_date);
    `);
    console.log('✅ Indexes berhasil dibuat');

    // 8. Insert data default
    await insertDefaultData();

    console.log('✅ Migrasi database selesai!');
  } catch (error) {
    console.error('❌ Error saat migrasi:', error);
    throw error;
  }
}

async function insertDefaultData() {
  console.log('📝 Memasukkan data default...');

  // Default Units
  await query(`
    INSERT INTO units (code, name, description, color) VALUES
    ('DEKONTAMINASI', 'Dekontaminasi', 'Area dekontaminasi dan pencucian alat', '#EF4444'),
    ('PACKING', 'Packing', 'Area packing dan pengemasan alat steril', '#3B82F6'),
    ('STERILISASI', 'Sterilisasi', 'Area sterilisasi dengan autoclave', '#10B981'),
    ('DISTRIBUSI', 'Distribusi', 'Area distribusi alat steril', '#F59E0B')
    ON CONFLICT (code) DO NOTHING;
  `);

  // Default Shifts
  await query(`
    INSERT INTO shifts (name, code, start_time, end_time, color) VALUES
    ('Shift Pagi', 'PAGI', '07:00', '14:00', '#10B981'),
    ('Shift Siang', 'SIANG', '14:00', '21:00', '#3B82F6'),
    ('Shift Malam', 'MALAM', '21:00', '07:00', '#6366F1'),
    ('Libur', 'OFF', '00:00', '00:00', '#EF4444')
    ON CONFLICT (code) DO NOTHING;
  `);

  // Default Admin User (password: admin123)
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await query(`
    INSERT INTO users (nip, name, email, password, role, position) VALUES
    ('ADMIN001', 'Administrator', 'admin@cssd.com', $1, 'admin', 'Kepala CSSD')
    ON CONFLICT (nip) DO NOTHING;
  `, [hashedPassword]);

  console.log('✅ Data default berhasil dimasukkan');
}

// Jalankan migrasi jika file ini dijalankan langsung
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const entryFile = process.argv[1];

// Normalisasi path untuk perbandingan yang akurat di Windows
if (path.resolve(entryFile) === path.resolve(__filename)) {
  runMigrations()
    .then(() => {
      console.log('✅ Migrasi selesai');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migrasi gagal:', error);
      process.exit(1);
    });
}
