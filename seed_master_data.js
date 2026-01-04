import { query } from './config/database.js';

async function seedMasterData() {
    console.log("🚀 Starting Master Data Synchronization to Supabase...");

    const units = [
        { code: 'ST', name: 'Ruang Penyimpanan Steril', color: '#10b981' },
        { code: 'DS', name: 'Distribusi', color: '#a855f7' },
        { code: 'DSS', name: 'Distribusi Steril', color: '#f472b6' },
        { code: 'DSK', name: 'Distribusi Kotor', color: '#78716c' },
        { code: 'PC', name: 'Pencucian', color: '#22d3ee' },
        { code: 'BMHP', name: 'Proses Pencucian & Sterilisasi BMHP', color: '#2dd4bf' },
        { code: 'PS', name: 'Pengemasan', color: '#38bdf8' },
        { code: 'PSS', name: 'Pengemasan Single Set', color: '#0ea5e9' },
        { code: 'PSP', name: 'Pengemasan Perawatan', color: '#7dd3fc' },
        { code: 'PL', name: 'Pelipatan', color: '#f472b6' },
        { code: 'PK', name: 'Plastik', color: '#fb7185' },
        { code: 'K', name: 'Kasa', color: '#fb923c' },
        { code: 'QCSP', name: 'QC Pengemasan Single Use', color: '#facc15' },
        { code: 'OP', name: 'Operator', color: '#94a3b8' },
        { code: 'R', name: 'Revisi Panduan & SOP', color: '#e2e8f0' }
    ];

    const shifts = [
        { code: 'PAGI', name: 'Dinas Pagi', start: '07:00', end: '14:00', color: '#ffffff' },
        { code: 'SIANG', name: 'Dinas Sore', start: '14:00', end: '21:00', color: '#3b82f6' },
        { code: 'MALAM', name: 'Dinas Malam', start: '21:00', end: '07:00', color: '#111827' },
        { code: 'PS/S', name: 'Dinas Pagi Sore', start: '07:00', end: '21:00', color: '#8b5cf6' },
        { code: 'SM', name: 'Sore Malam', start: '14:00', end: '07:00', color: '#4c1d95' },
        { code: 'OFF', name: 'Libur', start: '00:00', end: '00:00', color: '#ef4444' },
        { code: 'CUTI', name: 'Cuti', start: '00:00', end: '00:00', color: '#fde047' }
    ];

    try {
        // Insert Units (Tasks)
        for (const u of units) {
            await query(
                `INSERT INTO units (code, name, color) VALUES ($1, $2, $3) 
                 ON CONFLICT (code) DO UPDATE SET name = $2, color = $3`,
                [u.code, u.name, u.color]
            );
            console.log(`✅ Unit sync: ${u.code}`);
        }

        // Insert Shifts
        for (const s of shifts) {
            await query(
                `INSERT INTO shifts (code, name, start_time, end_time, color) VALUES ($1, $2, $3, $4, $5) 
                 ON CONFLICT (code) DO UPDATE SET name = $2, start_time = $3, end_time = $4, color = $5`,
                [s.code, s.name, s.start, s.end, s.color]
            );
            console.log(`✅ Shift sync: ${s.code}`);
        }

        console.log("\n✨ All master data synchronized successfully!");
    } catch (err) {
        console.error("❌ Synchronization failed:", err.message);
    } finally {
        process.exit();
    }
}

seedMasterData();
