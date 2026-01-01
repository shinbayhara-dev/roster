import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/database.js';

// Import routes
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import unitsRoutes from './routes/units.js';
import shiftsRoutes from './routes/shifts.js';
import schedulesRoutes from './routes/schedules.js';
import swapsRoutes from './routes/swaps.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Debugging Environment Variables di Vercel
if (process.env.VERCEL === '1') {
    console.log('🌐 Running on Vercel');
    console.log('📡 DB_HOST:', process.env.DB_HOST ? 'Present' : 'MISSING');
    console.log('📡 DB_USER:', process.env.DB_USER ? 'Present' : 'MISSING');
    console.log('📡 DB_NAME:', process.env.DB_NAME ? 'Present' : 'MISSING');
    console.log('📡 DB_SSL:', process.env.DB_SSL ? 'Present' : 'MISSING');
}

// Middleware
app.use(cors({
    origin: [
        'http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://localhost:5174',
        'http://192.168.1.1:5173', 'http://192.168.1.1:5174', 'capacitor://localhost', 'http://localhost'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'CSSD Roster API is running',
        timestamp: new Date().toISOString()
    });
});

// Ping endpoint for keep-alive cron jobs
app.get('/api/ping', (req, res) => {
    res.json({
        success: true,
        message: 'PONG',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/units', unitsRoutes);
app.use('/api/shifts', shiftsRoutes);
app.use('/api/schedules', schedulesRoutes);
app.use('/api/swaps', swapsRoutes);

// Serve static files from frontend build
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the 'dist' directory (now in root)
app.use(express.static(path.join(__dirname, 'dist')));

// Handle API 404s specifically
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint API tidak ditemukan'
    });
});

// For any other route (SPA client-side routing), serve index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);

    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Terjadi kesalahan server',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Start server only if not on Vercel
if (process.env.VERCEL !== '1') {
    app.listen(PORT, () => {
        console.log('='.repeat(50));
        console.log('🏥 CSSD Roster Pro - Backend API');
        console.log('='.repeat(50));
        console.log(`🚀 Server berjalan di: http://localhost:${PORT}`);
        console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🗄️  Database: ${process.env.DB_NAME}`);
        console.log('='.repeat(50));
    });
}

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: closing HTTP server');
    await pool.end();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT signal received: closing HTTP server');
    await pool.end();
    process.exit(0);
});

export default app;
