import express from 'express';
import { body, validationResult } from 'express-validator';
import { query } from '../config/database.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/units
 * @desc    Get all units
 * @access  Private
 */
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { isActive } = req.query;

        let queryText = 'SELECT * FROM units WHERE 1=1';
        const params = [];

        if (isActive !== undefined) {
            queryText += ' AND is_active = $1';
            params.push(isActive === 'true');
        }

        queryText += ' ORDER BY name ASC';

        const result = await query(queryText, params);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error get units:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
});

/**
 * @route   POST /api/units
 * @desc    Create unit baru
 * @access  Private (Admin)
 */
router.post('/', [
    authenticateToken,
    authorizeRoles('admin'),
    body('code').notEmpty().withMessage('Kode unit wajib diisi'),
    body('name').notEmpty().withMessage('Nama unit wajib diisi')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { code, name, description, color } = req.body;

        const result = await query(
            `INSERT INTO units (code, name, description, color)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
            [code, name, description || null, color || '#3B82F6']
        );

        res.status(201).json({
            success: true,
            message: 'Unit berhasil dibuat',
            data: result.rows[0]
        });
    } catch (error) {
        if (error.code === '23505') { // Unique violation
            return res.status(400).json({
                success: false,
                message: 'Kode unit sudah digunakan'
            });
        }
        console.error('Error create unit:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
});

/**
 * @route   PUT /api/units/:id
 * @desc    Update unit
 * @access  Private (Admin)
 */
router.put('/:id', [
    authenticateToken,
    authorizeRoles('admin')
], async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, color, isActive } = req.body;

        const result = await query(
            `UPDATE units 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           color = COALESCE($3, color),
           is_active = COALESCE($4, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
            [name, description, color, isActive, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Unit tidak ditemukan'
            });
        }

        res.json({
            success: true,
            message: 'Unit berhasil diupdate',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error update unit:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
});

/**
 * @route   DELETE /api/units/:id
 * @desc    Delete unit
 * @access  Private (Admin)
 */
router.delete('/:id', [
    authenticateToken,
    authorizeRoles('admin')
], async (req, res) => {
    try {
        const { id } = req.params;

        const result = await query('DELETE FROM units WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Unit tidak ditemukan'
            });
        }

        res.json({
            success: true,
            message: 'Unit berhasil dihapus'
        });
    } catch (error) {
        console.error('Error delete unit:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
});

export default router;
