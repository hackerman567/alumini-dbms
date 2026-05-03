import express from 'express';
const router = express.Router();
import db from '../db/index.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

// All routes here are admin only
router.use(protect);
router.use(authorize('admin'));

// @route   GET /api/v1/admin/users
router.get('/users', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT id, name, email, role, is_active, created_at, last_login FROM users ORDER BY created_at DESC'
        );
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, error: "Error fetching users" });
    }
});

// @route   PUT /api/v1/admin/users/:id/status
router.put('/users/:id/status', async (req, res) => {
    const { is_active } = req.body;
    try {
        await db.query('UPDATE users SET is_active = $1 WHERE id = $2', [is_active, req.params.id]);
        
        // Audit Log
        await db.query(
            'INSERT INTO audit_logs (user_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
            [req.user.id, is_active ? 'VERIFY' : 'SUSPEND', 'USER', req.params.id, `User status changed to ${is_active}`]
        );

        res.json({ success: true, message: "User status updated" });
    } catch (err) {
        res.status(500).json({ success: false, error: "Error updating status" });
    }
});

// @route   DELETE /api/v1/admin/users/:id
router.delete('/users/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM users WHERE id = $1', [req.params.id]);

        // Audit Log
        await db.query(
            'INSERT INTO audit_logs (user_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
            [req.user.id, 'DELETE', 'USER', req.params.id, `User permanently removed from timeline`]
        );

        res.json({ success: true, message: "Identity terminated" });
    } catch (err) {
        res.status(500).json({ success: false, error: "Termination sequence failed" });
    }
});

export default router;

