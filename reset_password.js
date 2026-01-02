import { query } from './config/database.js';
import bcrypt from 'bcryptjs';

async function resetPassword() {
    const nip = process.argv[2];
    const plainPassword = process.argv[3] || '123456';

    if (!nip) {
        console.log("Usage: node reset_password.js <NIP> [new_password]");
        process.exit(1);
    }

    try {
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        const res = await query(
            'UPDATE users SET password = $1 WHERE nip = $2 RETURNING id, name, email',
            [hashedPassword, nip]
        );

        if (res.rowCount === 0) {
            console.log(`❌ User dengan NIP ${nip} tidak ditemukan.`);
        } else {
            console.log(`✅ Password untuk user ${res.rows[0].name} (NIP: ${nip}) berhasil direset menjadi: ${plainPassword}`);
        }

    } catch (err) {
        console.error('Error:', err);
    }
    process.exit();
}

resetPassword();
