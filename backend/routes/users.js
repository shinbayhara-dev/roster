import express from 'express';
import { query } from '../config/database.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Private (Admin/Supervisor)
 */
router.get('/', [
    authenticateToken,
    authorizeRoles('admin', 'supervisor')
], async (req, res) => {
    try {
        const { role, isActive } = req.query;

        let queryText = `
      SELECT id, nip, name, email, phone, role, position, photo_url, is_active, created_at
      FROM users 
      WHERE 1=1
    `;
        const params = [];
        let paramCount = 1;

        if (role) {
            queryText += ` AND role = $${paramCount}`;
            params.push(role);
            paramCount++;
        }

        if (isActive !== undefined) {
            queryText += ` AND is_active = $${paramCount}`;
            params.push(isActive === 'true');
            paramCount++;
        }

        queryText += ' ORDER BY name ASC';

        const result = await query(queryText, params);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error get users:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
});

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private
 */
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await query(
            `SELECT id, nip, name, email, phone, role, position, photo_url, is_active, created_at
       FROM users WHERE id = $1`,
            [id]
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
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Private (Admin)
 */
router.put('/:id', [
    authenticateToken,
    authorizeRoles('admin')
], async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, role, position, isActive } = req.body;

        const result = await query(
            `UPDATE users 
       SET name = COALESCE($1, name),
           phone = COALESCE($2, phone),
           role = COALESCE($3, role),
           position = COALESCE($4, position),
           is_active = COALESCE($5, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING id, nip, name, email, phone, role, position, is_active`,
            [name, phone, role, position, isActive, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User tidak ditemukan'
            });
        }

        res.json({
            success: true,
            message: 'User berhasil diupdate',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error update user:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
});

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user (soft delete)
 * @access  Private (Admin)
 */
router.delete('/:id', [
    authenticateToken,
    authorizeRoles('admin')
], async (req, res) => {
    try {
        const { id } = req.params;

        // Soft delete - set is_active to false
        const result = await query(
            'UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User tidak ditemukan'
            });
        }

        res.json({
            success: true,
            message: 'User berhasil dinonaktifkan'
        });
    } catch (error) {
        console.error('Error delete user:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
});

/**
 * @route   GET /api/users/stats/summary
 * @desc    Get user statistics
 * @access  Private (Admin/Supervisor)
 */
router.get('/stats/summary', [
    authenticateToken,
    authorizeRoles('admin', 'supervisor')
], async (req, res) => {
    try {
        const result = await query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(*) FILTER (WHERE is_active = true) as active_users,
        COUNT(*) FILTER (WHERE role = 'admin') as admin_count,
        COUNT(*) FILTER (WHERE role = 'supervisor') as supervisor_count,
        COUNT(*) FILTER (WHERE role = 'staff') as staff_count
      FROM users
    `);

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error get user stats:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
});

export default router;
