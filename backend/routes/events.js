import express from 'express';
const router = express.Router();
import db from '../db/index.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

// @route   GET /api/v1/events
router.get('/', protect, async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM events ORDER BY start_time ASC');
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, error: "Error fetching events" });
    }
});

// @route   POST /api/v1/events
router.post('/', protect, authorize('admin', 'faculty', 'alumni'), async (req, res) => {
    const { title, description, event_type, venue, meeting_link, start_time, end_time, capacity } = req.body;

    try {
        const result = await db.query(
            `INSERT INTO events (title, description, event_type, venue, meeting_link, start_time, end_time, capacity, created_by) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [title, description, event_type, venue, meeting_link, start_time, end_time, capacity, req.user.id]
        );
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: "Error creating event" });
    }
});

// @route   POST /api/v1/events/:id/register
router.post('/:id/register', protect, async (req, res) => {
    try {
        const event = await db.query('SELECT * FROM events WHERE id = $1', [req.params.id]);
        if (event.rows.length === 0) return res.status(404).json({ success: false, error: "Event not found" });

        // Check capacity
        const registrations = await db.query('SELECT COUNT(*) FROM event_registrations WHERE event_id = $1', [req.params.id]);
        if (event.rows[0].capacity && registrations.rows[0].count >= event.rows[0].capacity) {
            return res.status(400).json({ success: false, error: "Event is at full capacity" });
        }

        await db.query(
            'INSERT INTO event_registrations (event_id, user_id) VALUES ($1, $2)',
            [req.params.id, req.user.id]
        );

        res.json({ success: true, message: "Registered successfully" });
    } catch (err) {
        if (err.code === '23505') return res.status(400).json({ success: false, error: "Already registered" });
        res.status(500).json({ success: false, error: "Registration failed" });
    }
});

export default router;

