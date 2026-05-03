import express from 'express';
const router = express.Router();
import db from '../db/index.js';
import { protect } from '../middleware/auth.js';

// @route   GET /api/v1/notifications
router.get('/', protect, async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
            [req.user.id]
        );
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, error: "Error fetching notifications" });
    }
});

// @route   PUT /api/v1/notifications/:id/read
router.put('/:id/read', protect, async (req, res) => {
    try {
        await db.query(
            'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2',
            [req.params.id, req.user.id]
        );
        res.json({ success: true, message: "Notification marked as read" });
    } catch (err) {
        res.status(500).json({ success: false, error: "Error updating notification" });
    }
});

// @route   PUT /api/v1/notifications/read-all
router.put('/read-all', protect, async (req, res) => {
    try {
        await db.query(
            'UPDATE notifications SET is_read = true WHERE user_id = $1',
            [req.user.id]
        );
        res.json({ success: true, message: "All notifications marked as read" });
    } catch (err) {
        res.status(500).json({ success: false, error: "Error updating notifications" });
    }
});

export default router;

