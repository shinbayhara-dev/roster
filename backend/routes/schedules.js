import express from 'express';
import { body, validationResult } from 'express-validator';
import { query } from '../config/database.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/schedules
 * @desc    Get all schedules dengan filter
 * @access  Private
 * @query   startDate, endDate, userId, unitId, shiftId
 */
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { startDate, endDate, userId, unitId, shiftId } = req.query;

        let queryText = `
      SELECT 
        s.id, to_char(s.date, 'YYYY-MM-DD') as date, s.status, s.notes, s.created_at,
        json_build_object(
          'id', u.id,
          'nip', u.nip,
          'name', u.name,
          'position', u.position
        ) as user,
        json_build_object(
          'id', un.id,
          'code', un.code,
          'name', un.name,
          'color', un.color
        ) as unit,
        json_build_object(
          'id', sh.id,
          'code', sh.code,
          'name', sh.name,
          'start_time', sh.start_time,
          'end_time', sh.end_time,
          'color', sh.color
        ) as shift
      FROM schedules s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN units un ON s.unit_id = un.id
      LEFT JOIN shifts sh ON s.shift_id = sh.id
      WHERE 1=1
    `;

        const params = [];
        let paramCount = 1;

        if (startDate) {
            queryText += ` AND s.date >= $${paramCount}`;
            params.push(startDate);
            paramCount++;
        }

        if (endDate) {
            queryText += ` AND s.date <= $${paramCount}`;
            params.push(endDate);
            paramCount++;
        }

        if (userId) {
            queryText += ` AND s.user_id = $${paramCount}`;
            params.push(userId);
            paramCount++;
        }

        if (unitId) {
            queryText += ` AND s.unit_id = $${paramCount}`;
            params.push(unitId);
            paramCount++;
        }

        if (shiftId) {
            queryText += ` AND s.shift_id = $${paramCount}`;
            params.push(shiftId);
            paramCount++;
        }

        queryText += ' ORDER BY s.date DESC, u.name ASC';

        const result = await query(queryText, params);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error get schedules:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
});

/**
 * @route   GET /api/schedules/my-schedule
 * @desc    Get jadwal user yang sedang login
 * @access  Private
 */
router.get('/my-schedule', authenticateToken, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        let queryText = `
      SELECT 
        s.id, to_char(s.date, 'YYYY-MM-DD') as date, s.status, s.notes,
        json_build_object(
          'id', un.id,
          'code', un.code,
          'name', un.name,
          'color', un.color
        ) as unit,
        json_build_object(
          'id', sh.id,
          'code', sh.code,
          'name', sh.name,
          'start_time', sh.start_time,
          'end_time', sh.end_time,
          'color', sh.color
        ) as shift
      FROM schedules s
      LEFT JOIN units un ON s.unit_id = un.id
      LEFT JOIN shifts sh ON s.shift_id = sh.id
      WHERE s.user_id = $1
    `;

        const params = [req.user.id];
        let paramCount = 2;

        if (startDate) {
            queryText += ` AND s.date >= $${paramCount}`;
            params.push(startDate);
            paramCount++;
        }

        if (endDate) {
            queryText += ` AND s.date <= $${paramCount}`;
            params.push(endDate);
            paramCount++;
        }

        queryText += ' ORDER BY s.date ASC';

        const result = await query(queryText, params);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error get my schedule:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
});

/**
 * @route   POST /api/schedules
 * @desc    Create jadwal baru
 * @access  Private (Admin/Supervisor)
 */
router.post('/', [
    authenticateToken,
    authorizeRoles('admin', 'supervisor'),
    body('userId').isInt().withMessage('User ID wajib diisi'),
    body('unitId').optional({ nullable: true }).isInt(),
    body('shiftId').optional({ nullable: true }).isInt(),
    body('date').isDate().withMessage('Tanggal tidak valid'),
    body('status').optional().isIn(['scheduled', 'completed', 'cancelled', 'absent', 'leave'])
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array(),
                message: errors.array()[0].msg // Provide a message for frontend
            });
        }

        const { userId, unitId, shiftId, date, status, notes } = req.body;

        const result = await query(
            `INSERT INTO schedules (user_id, unit_id, shift_id, date, status, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (user_id, date) 
       DO UPDATE SET
         unit_id = EXCLUDED.unit_id,
         shift_id = EXCLUDED.shift_id,
         status = EXCLUDED.status,
         notes = EXCLUDED.notes,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
            [userId, unitId || null, shiftId || null, date, status || 'scheduled', notes || null, req.user.id]
        );

        res.status(200).json({ // Changed to 200 as it might be update
            success: true,
            message: 'Jadwal berhasil disimpan',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error create schedule:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
});

/**
 * @route   POST /api/schedules/bulk
 * @desc    Create multiple schedules sekaligus
 * @access  Private (Admin/Supervisor)
 */
router.post('/bulk', [
    authenticateToken,
    authorizeRoles('admin', 'supervisor')
], async (req, res) => {
    try {
        const { schedules } = req.body; // Array of {userId, unitId, shiftId, date}

        if (!Array.isArray(schedules) || schedules.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Data schedules harus berupa array dan tidak boleh kosong'
            });
        }

        const results = [];
        const errors = [];

        for (const schedule of schedules) {
            try {
                const { userId, unitId, shiftId, date, status, notes } = schedule;

                const result = await query(
                    `INSERT INTO schedules (user_id, unit_id, shift_id, date, status, notes, created_by)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (user_id, date) 
           DO UPDATE SET
             unit_id = EXCLUDED.unit_id,
             shift_id = EXCLUDED.shift_id,
             status = EXCLUDED.status,
             notes = EXCLUDED.notes,
             updated_at = CURRENT_TIMESTAMP
           RETURNING *`,
                    [userId, unitId || null, shiftId || null, date, status || 'scheduled', notes || null, req.user.id]
                );

                results.push(result.rows[0]);
            } catch (err) {
                errors.push({ schedule, error: err.message });
            }
        }

        res.status(201).json({
            success: true,
            message: `${results.length} jadwal berhasil dibuat`,
            data: results,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (error) {
        console.error('Error bulk create schedules:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
});

/**
 * @route   PUT /api/schedules/:id
 * @desc    Update jadwal
 * @access  Private (Admin/Supervisor)
 */
router.put('/:id', [
    authenticateToken,
    authorizeRoles('admin', 'supervisor')
], async (req, res) => {
    try {
        const { id } = req.params;
        const { unitId, shiftId, status, notes } = req.body;

        const result = await query(
            `UPDATE schedules 
       SET unit_id = COALESCE($1, unit_id),
           shift_id = COALESCE($2, shift_id),
           status = COALESCE($3, status),
           notes = COALESCE($4, notes),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
            [unitId, shiftId, status, notes, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Jadwal tidak ditemukan'
            });
        }

        res.json({
            success: true,
            message: 'Jadwal berhasil diupdate',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error update schedule:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
});

/**
 * @route   DELETE /api/schedules/:id
 * @desc    Delete jadwal
 * @access  Private (Admin/Supervisor)
 */
router.delete('/:id', [
    authenticateToken,
    authorizeRoles('admin', 'supervisor')
], async (req, res) => {
    try {
        const { id } = req.params;

        const result = await query('DELETE FROM schedules WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Jadwal tidak ditemukan'
            });
        }

        res.json({
            success: true,
            message: 'Jadwal berhasil dihapus'
        });
    } catch (error) {
        console.error('Error delete schedule:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
});

export default router;
