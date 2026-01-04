import express from 'express';
import { body, validationResult } from 'express-validator';
import { query } from '../config/database.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/shifts
 * @desc    Get all shifts
 * @access  Private
 */
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { isActive } = req.query;

        let queryText = 'SELECT * FROM shifts WHERE 1=1';
        const params = [];

        if (isActive !== undefined) {
            queryText += ' AND is_active = $1';
            params.push(isActive === 'true');
        }

        queryText += ' ORDER BY start_time ASC';

        const result = await query(queryText, params);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error get shifts:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
});

/**
 * @route   POST /api/shifts
 * @desc    Create shift baru
 * @access  Private (Admin)
 */
router.post('/', [
    authenticateToken,
    authorizeRoles('admin', 'supervisor'),
    body('name').notEmpty().withMessage('Nama shift wajib diisi'),
    body('code').notEmpty().withMessage('Kode shift wajib diisi'),
    body('startTime').notEmpty().withMessage('Waktu mulai wajib diisi'),
    body('endTime').notEmpty().withMessage('Waktu selesai wajib diisi')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { name, code, startTime, endTime, color, description } = req.body;

        const result = await query(
            `INSERT INTO shifts (name, code, start_time, end_time, color, description)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
            [name, code, startTime, endTime, color || '#10B981', description || null]
        );

        res.status(201).json({
            success: true,
            message: 'Shift berhasil dibuat',
            data: result.rows[0]
        });
    } catch (error) {
        if (error.code === '23505') { // Unique violation
            return res.status(400).json({
                success: false,
                message: 'Kode shift sudah digunakan'
            });
        }
        console.error('Error create shift:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
});

/**
 * @route   PUT /api/shifts/:id
 * @desc    Update shift
 * @access  Private (Admin)
 */
router.put('/:id', [
    authenticateToken,
    authorizeRoles('admin', 'supervisor')
], async (req, res) => {
    try {
        const { id } = req.params;
        const { name, startTime, endTime, color, description, isActive } = req.body;

        const result = await query(
            `UPDATE shifts 
       SET name = COALESCE($1, name),
           start_time = COALESCE($2, start_time),
           end_time = COALESCE($3, end_time),
           color = COALESCE($4, color),
           description = COALESCE($5, description),
           is_active = COALESCE($6, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
            [name, startTime, endTime, color, description, isActive, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Shift tidak ditemukan'
            });
        }

        res.json({
            success: true,
            message: 'Shift berhasil diupdate',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error update shift:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
});

/**
 * @route   DELETE /api/shifts/:id
 * @desc    Delete shift
 * @access  Private (Admin)
 */
router.delete('/:id', [
    authenticateToken,
    authorizeRoles('admin', 'supervisor')
], async (req, res) => {
    try {
        const { id } = req.params;

        const result = await query('DELETE FROM shifts WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Shift tidak ditemukan'
            });
        }

        res.json({
            success: true,
            message: 'Shift berhasil dihapus'
        });
    } catch (error) {
        console.error('Error delete shift:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
});

export default router;
