import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

async function testDirect() {
    console.log("Testing DIRECT connection (Modified)...");
    let connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error("NO DATABASE_URL FOUND!");
        process.exit(1);
    }

    // Remove sslmode=require if present
    connectionString = connectionString.replace('?sslmode=require', '').replace('&sslmode=require', '');
    console.log("Modified String:", connectionString.substring(0, 50) + "...");

    const pool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const res = await pool.query('SELECT version()');
        console.log("✅ SUCCESS:", res.rows[0].version);
    } catch (e) {
        console.error("❌ FAILED:", e.message);
    }
    await pool.end();
}

testDirect();
