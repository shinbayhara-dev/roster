import { query } from './config/database.js';

async function testConnection() {
    console.log("⏳ Testing Database Connection...");
    console.log("Target String (masked):", process.env.DATABASE_URL ? process.env.DATABASE_URL.replace(/:[^:]*@/, ':****@') : "UNDEFINED");

    try {
        const res = await query('SELECT current_database(), current_user, version()');
        console.log("✅ Connection SUCCESS!");
        console.log("----------------------------------------");
        console.log("Database:", res.rows[0].current_database);
        console.log("User:", res.rows[0].current_user);
        console.log("Version:", res.rows[0].version);
        console.log("----------------------------------------");

        // Check for our specific table to be sure
        const userCount = await query('SELECT count(*) FROM users');
        console.log(`Total Users in Table: ${userCount.rows[0].count}`);

    } catch (err) {
        console.error("❌ Connection FAILED:", err.message);
    }
    process.exit();
}

testConnection();
