import { query } from './config/database.js';

async function listUsers() {
    try {
        const res = await query('SELECT id, nip, name, email FROM users ORDER BY id ASC');
        console.log("--- USERS LIST ---");
        res.rows.forEach(u => {
            console.log(`ID: ${u.id} | NIP: ${u.nip} | Name: ${u.name} | Email: ${u.email}`);
        });
        console.log("------------------");
    } catch (err) {
        console.error(err);
    }
    process.exit();
}

listUsers();
