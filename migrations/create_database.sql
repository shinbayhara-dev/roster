-- CSSD Roster Pro Database Setup
-- Jalankan script ini di PostgreSQL untuk membuat database

-- 1. Buat database (jalankan sebagai postgres superuser)
CREATE DATABASE cssd_roster
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- 2. Koneksi ke database cssd_roster
\c cssd_roster

-- Setelah ini, jalankan: npm run migrate
-- atau: node migrations/schema.js
