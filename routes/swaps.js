
import express from 'express';
import { body, validationResult } from 'express-validator';
import pool, { query } from '../config/database.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Get Exchange Requests
// Staff: Get my requests (sent or received)
// Admin/Supervisor: Get all pending requests (or all)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;
        const { status } = req.query;

        let sql = `
            SELECT 
                s.id, s.status, s.reason, s.created_at,
                r.name as requester_name, r.nip as requester_nip,
                t.name as target_name, t.nip as target_nip,
                sc_req.date as requester_date, sh_req.name as requester_shift_name, sh_req.code as requester_shift_code,
                sc_target.date as target_date, sh_target.name as target_shift_name, sh_target.code as target_shift_code
            FROM shift_swaps s
            JOIN users r ON s.requester_id = r.id
            JOIN users t ON s.target_id = t.id
            JOIN schedules sc_req ON s.requester_schedule_id = sc_req.id
            LEFT JOIN shifts sh_req ON sc_req.shift_id = sh_req.id
            JOIN schedules sc_target ON s.target_schedule_id = sc_target.id
            LEFT JOIN shifts sh_target ON sc_target.shift_id = sh_target.id
            WHERE 1=1
        `;

        const params = [];

        if (role === 'staff') {
            sql += ` AND (s.requester_id = $1 OR s.target_id = $1)`;
            params.push(userId);
        } else {
            // Admin/Supervisor sees all
            // Optional: filter by status if provided
            if (status) {
                sql += ` AND s.status = $1`;
                params.push(status);
            }
        }

        sql += ` ORDER BY s.created_at DESC`;

        const result = await query(sql, params);
        res.json({ success: true, data: result.rows });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// Create Exchange Request
router.post('/', authenticateToken, [
    body('targetUserId').isInt(),
    body('myScheduleId').isInt(),
    body('targetScheduleId').isInt(),
    body('reason').optional().isString()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const { targetUserId, myScheduleId, targetScheduleId, reason } = req.body;
        const requesterId = req.user.id;

        // Validation: Verify existence and ownership
        const myScheRes = await client.query('SELECT * FROM schedules WHERE id = $1 AND user_id = $2', [myScheduleId, requesterId]);
        if (myScheRes.rows.length === 0) throw new Error("Jadwal anda tidak valid/ditemukan");

        const targetScheRes = await client.query('SELECT * FROM schedules WHERE id = $1 AND user_id = $2', [targetScheduleId, targetUserId]);
        if (targetScheRes.rows.length === 0) throw new Error("Jadwal target tidak valid/ditemukan");

        // Create Request
        await client.query(`
            INSERT INTO shift_swaps (requester_id, requester_schedule_id, target_id, target_schedule_id, reason, status)
            VALUES ($1, $2, $3, $4, $5, 'pending')
        `, [requesterId, myScheduleId, targetUserId, targetScheduleId, reason || '']);

        await client.query('COMMIT');
        res.json({ success: true, message: 'Permintaan tukar jadwal berhasil dibuat' });

    } catch (error) {
        await client.query('ROLLBACK');
        res.status(400).json({ success: false, message: error.message });
    } finally {
        client.release();
    }
});

// Approve Exchange (Admin/Supervisor)
router.put('/:id/approve', authenticateToken, authorizeRoles('admin', 'supervisor'), async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const swapId = req.params.id;
        const approverId = req.user.id;

        // Get Swap Details
        const swapRes = await client.query('SELECT * FROM shift_swaps WHERE id = $1 FOR UPDATE', [swapId]);
        if (swapRes.rows.length === 0) throw new Error("Request tidak ditemukan");
        const swap = swapRes.rows[0];

        if (swap.status !== 'pending') throw new Error("Request sudah diproses");

        // Fetch Schedule Records involved
        // RA1: Requester @ Date1
        const RA1Res = await client.query('SELECT * FROM schedules WHERE id = $1', [swap.requester_schedule_id]);
        const RA1 = RA1Res.rows[0];

        // RB2: Target @ Date2
        const RB2Res = await client.query('SELECT * FROM schedules WHERE id = $1', [swap.target_schedule_id]);
        const RB2 = RB2Res.rows[0];

        if (!RA1 || !RB2) throw new Error("Jadwal terkait sudah tidak ada");

        const date1 = RA1.date; // Use raw Date object or string from driver
        const date2 = RB2.date;

        // Find Implicit Swaps if Date1 != Date2
        // We need RB1 (Target @ Date1) and RA2 (Requester @ Date2)
        // If they don't exist, we assume they are 'OFF' (no record), but for simplified logic, 
        // if no record exists, we CREATE one or just move the existing one if allowed.
        // However, the cleanest database state is to ensure records exist or handle nulls.
        // For robustness, let's fetch or fallback.

        // Actually, simpler logic:
        // We want Requester (A) to work on Date2 with RB2's details.
        // We want Target (B) to work on Date1 with RA1's details.

        // Step 1: Handle Date 1 Swap (A and B on Date 1)
        // Find B's schedule on Date 1 (RB1)
        const RB1Res = await client.query('SELECT * FROM schedules WHERE user_id = $1 AND date = $2', [swap.target_id, date1]);
        const RB1 = RB1Res.rows[0];

        // Step 2: Handle Date 2 Swap (A and B on Date 2)
        // Find A's schedule on Date 2 (RA2)
        const RA2Res = await client.query('SELECT * FROM schedules WHERE user_id = $1 AND date = $2', [swap.requester_id, date2]);
        const RA2 = RA2Res.rows[0];

        // PERFORM SWAPS
        // Helper to get payload
        const getPayload = (record) => ({
            unit_id: record ? record.unit_id : null, // If null, maybe default or handle?
            shift_id: record ? record.shift_id : null,
            status: record ? record.status : 'scheduled', // default
            notes: record ? record.notes : ''
        });

        const pRA1 = getPayload(RA1);
        const pRB2 = getPayload(RB2);
        const pRB1 = RB1 ? getPayload(RB1) : { unit_id: null, shift_id: null, status: 'leave', notes: '' }; // Assume Off
        const pRA2 = RA2 ? getPayload(RA2) : { unit_id: null, shift_id: null, status: 'leave', notes: '' }; // Assume Off

        // Date 1: A becomes RB1-like, B becomes RA1-like
        // Update A on Date 1 (RA1) -> take pRB1
        // Update B on Date 1 (RB1) -> take pRA1 (If RB1 missing, create it)

        // Update RA1
        await client.query('UPDATE schedules SET unit_id=$1, shift_id=$2, status=$3, notes=$4, updated_at=NOW() WHERE id=$5',
            [pRB1.unit_id, pRB1.shift_id, pRB1.status, pRB1.notes, RA1.id]);

        // Update RB1 (Upsert)
        if (RB1) {
            await client.query('UPDATE schedules SET unit_id=$1, shift_id=$2, status=$3, notes=$4, updated_at=NOW() WHERE id=$5',
                [pRA1.unit_id, pRA1.shift_id, pRA1.status, pRA1.notes, RB1.id]);
        } else {
            // Create RB1 with pRA1 data
            await client.query('INSERT INTO schedules (user_id, unit_id, shift_id, date, status, notes) VALUES ($1, $2, $3, $4, $5, $6)',
                [swap.target_id, pRA1.unit_id, pRA1.shift_id, date1, pRA1.status, pRA1.notes]);
        }

        // Only do Date 2 swap if dates are different
        // Check equality: date objects might be tricky. Convert to string YYYY-MM-DD
        const d1Str = new Date(date1).toISOString().substring(0, 10);
        const d2Str = new Date(date2).toISOString().substring(0, 10);

        if (d1Str !== d2Str) {
            // Date 2: A becomes RB2-like, B becomes RA2-like
            // Update A on Date 2 (RA2) -> take pRB2 (Upsert)
            // Update B on Date 2 (RB2) -> take pRA2

            // Update RB2
            await client.query('UPDATE schedules SET unit_id=$1, shift_id=$2, status=$3, notes=$4, updated_at=NOW() WHERE id=$5',
                [pRA2.unit_id, pRA2.shift_id, pRA2.status, pRA2.notes, RB2.id]);

            // Update RA2 (Upsert)
            if (RA2) {
                await client.query('UPDATE schedules SET unit_id=$1, shift_id=$2, status=$3, notes=$4, updated_at=NOW() WHERE id=$5',
                    [pRB2.unit_id, pRB2.shift_id, pRB2.status, pRB2.notes, RA2.id]);
            } else {
                await client.query('INSERT INTO schedules (user_id, unit_id, shift_id, date, status, notes) VALUES ($1, $2, $3, $4, $5, $6)',
                    [swap.requester_id, pRB2.unit_id, pRB2.shift_id, date2, pRB2.status, pRB2.notes]);
            }
        }

        // Update Swap Status
        await client.query('UPDATE shift_swaps SET status=$1, approved_by=$2, approved_at=NOW() WHERE id=$3',
            ['approved', approverId, swapId]);

        await client.query('COMMIT');
        res.json({ success: true, message: 'Permintaan disetujui, jadwal telah diperbarui' });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        res.status(400).json({ success: false, message: error.message });
    } finally {
        client.release();
    }
});

// Reject Exchange
router.put('/:id/reject', authenticateToken, authorizeRoles('admin', 'supervisor'), async (req, res) => {
    try {
        const swapId = req.params.id;
        const approverId = req.user.id;

        await query('UPDATE shift_swaps SET status=$1, approved_by=$2, approved_at=NOW() WHERE id=$3',
            ['rejected', approverId, swapId]);

        res.json({ success: true, message: 'Permintaan ditolak' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
