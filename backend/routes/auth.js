import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { query } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

import { rateLimit } from 'express-rate-limit';

const router = express.Router();

// Rate limiter khusus untuk login: Maksimal 5 percobaan dalam 15 menit
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 5, // Batas 5 percobaan
    message: {
        success: false,
        message: 'Terlalu banyak percobaan login gagal. Demi keamanan, silakan tunggu 15 menit sebelum mencoba lagi.'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * @route   POST /api/auth/register
 * @desc    Register user baru
 * @access  Public (bisa dibatasi hanya admin yang bisa register)
 */
router.post('/register', [
    body('nip').notEmpty().withMessage('NIP wajib diisi'),
    body('name').notEmpty().withMessage('Nama wajib diisi'),
    body('email').isEmail().withMessage('Email tidak valid'),
    body('password').isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
    body('role').optional().isIn(['admin', 'supervisor', 'staff']).withMessage('Role tidak valid')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { nip, name, email, password, phone, role, position } = req.body;

        // Cek apakah user sudah ada
        const existingUser = await query(
            'SELECT id FROM users WHERE nip = $1 OR email = $2',
            [nip, email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'NIP atau Email sudah terdaftar'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user baru
        const result = await query(
            `INSERT INTO users (nip, name, email, password, phone, role, position)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, nip, name, email, role, position, created_at`,
            [nip, name, email, hashedPassword, phone || null, role || 'staff', position || null]
        );

        res.status(201).json({
            success: true,
            message: 'Registrasi berhasil',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error register:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', loginLimiter, [
    body('nip').notEmpty().withMessage('NIP wajib diisi'),
    body('password').notEmpty().withMessage('Password wajib diisi')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { nip, password } = req.body;

        // Cari user berdasarkan NIP
        const result = await query(
            'SELECT * FROM users WHERE nip = $1 AND is_active = true',
            [nip]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'NIP atau password salah'
            });
        }

        const user = result.rows[0];

        // Verifikasi password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'NIP atau password salah'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user.id,
                nip: user.nip,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        // Hapus password dari response
        delete user.password;

        res.json({
            success: true,
            message: 'Login berhasil',
            data: {
                user,
                token
            }
        });
    } catch (error) {
        console.error('Error login:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user info
 * @access  Private
 */
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const result = await query(
            'SELECT id, nip, name, email, phone, role, position, photo_url, created_at FROM users WHERE id = $1',
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User tidak ditemukan'
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error get user:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
});

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const { name, phone, photo_url } = req.body;

        const result = await query(
            `UPDATE users 
       SET name = COALESCE($1, name),
           phone = COALESCE($2, phone),
           photo_url = COALESCE($3, photo_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING id, nip, name, email, phone, role, position, photo_url`,
            [name, phone, photo_url, req.user.id]
        );

        res.json({
            success: true,
            message: 'Profile berhasil diupdate',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error update profile:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
});

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change password
 * @access  Private
 */
router.put('/change-password', authenticateToken, [
    body('currentPassword').notEmpty().withMessage('Password lama wajib diisi'),
    body('newPassword').isLength({ min: 6 }).withMessage('Password baru minimal 6 karakter')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { currentPassword, newPassword } = req.body;

        // Get current user
        const userResult = await query('SELECT password FROM users WHERE id = $1', [req.user.id]);
        const user = userResult.rows[0];

        // Verify current password
        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: 'Password lama tidak sesuai'
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await query(
            'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [hashedPassword, req.user.id]
        );

        res.json({
            success: true,
            message: 'Password berhasil diubah'
        });
    } catch (error) {
        console.error('Error change password:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
});

export default router;
