import express from 'express';
const router = express.Router();
import db from '../db/index.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { broadcast } from '../utils/broadcast.js';
import { sendPushNotification } from './push.js';

// @route   POST /api/v1/mentorship/request
router.post('/request', protect, authorize('student'), async (req, res) => {
    const { alumni_id, message } = req.body;

    try {
        // Check if a request already exists
        const check = await db.query(
            'SELECT * FROM mentorship_requests WHERE student_id = $1 AND alumni_id = $2 AND status = $3',
            [req.user.id, alumni_id, 'pending']
        );

        if (check.rows.length > 0) {
            return res.status(400).json({ success: false, error: "A pending request already exists for this mentor." });
        }

        const result = await db.query(
            'INSERT INTO mentorship_requests (student_id, alumni_id, message) VALUES ($1, $2, $3) RETURNING id',
            [req.user.id, alumni_id, message]
        );

        // Notify alumni (simple table insert for now)
        await db.query(
            'INSERT INTO notifications (user_id, type, title, body, reference_id, reference_type) VALUES ($1, $2, $3, $4, $5, $6)',
            [alumni_id, 'mentorship_request', 'New Mentorship Request', 'A student has requested your mentorship.', result.rows[0].id, 'mentorship_request']
        );

        res.status(201).json({ success: true, message: "Mentorship request sent successfully." });
    } catch (err) {
        res.status(500).json({ success: false, error: "Error sending request" });
    }
});

// @route   GET /api/v1/mentorship/requests
router.get('/requests', protect, async (req, res) => {
    try {
        let query;
        let params = [req.user.id];

        if (req.user.role === 'alumni') {
            query = `
                SELECT r.*, u.name as student_name, u.avatar_url as student_avatar
                FROM mentorship_requests r
                JOIN users u ON r.student_id = u.id
                WHERE r.alumni_id = $1
                ORDER BY r.created_at DESC
            `;
        } else {
            query = `
                SELECT r.*, u.name as mentor_name, u.avatar_url as mentor_avatar
                FROM mentorship_requests r
                JOIN users u ON r.alumni_id = u.id
                WHERE r.student_id = $1
                ORDER BY r.created_at DESC
            `;
        }

        const result = await db.query(query, params);
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, error: "Error fetching requests" });
    }
});

// @route   PUT /api/v1/mentorship/respond/:id
router.put('/respond/:id', protect, authorize('alumni', 'admin'), async (req, res) => {
    const { status, session_notes } = req.body;

    try {
        const request = await db.query('SELECT * FROM mentorship_requests WHERE id = $1', [req.params.id]);
        if (request.rows.length === 0) return res.status(404).json({ success: false, error: "Request not found" });

        await db.query(
            'UPDATE mentorship_requests SET status = $1, responded_at = NOW(), session_notes = $2 WHERE id = $3',
            [status, session_notes, req.params.id]
        );

        // Notify student
        await db.query(
            'INSERT INTO notifications (user_id, type, title, body, reference_id, reference_type) VALUES ($1, $2, $3, $4, $5, $6)',
            [request.rows[0].student_id, 'mentorship_response', `Mentorship Request ${status}`, `Your mentor has ${status} your request.`, req.params.id, 'mentorship_request']
        );

        if (status === 'accepted') {
            broadcast('live_event', {
                type: 'mentorship',
                message: `◈ CONNECTION FORGED: A new mentorship link was established across the Nexus`,
                time: new Date()
            });
        }

        sendPushNotification(request.rows[0].student_id, {
            title: "NEXUS SIGNAL",
            body: `Your mentor has ${status} your request.`,
            icon: "/favicon.ico",
            url: "/mentorship"
        });

        res.json({ success: true, message: `Request ${status} successfully.` });
    } catch (err) {
        res.status(500).json({ success: false, error: "Error responding to request" });
    }
});

// @route   GET /api/v1/mentorship/mentors
router.get('/mentors', protect, async (req, res) => {
    try {
        const result = await db.query(`
            SELECT u.id, u.name, u.avatar_url, ap.job_title, ap.current_company, ap.skills, ap.department
            FROM users u
            JOIN alumni_profiles ap ON u.id = ap.user_id
            WHERE u.role = 'alumni'
            ORDER BY u.name ASC
        `);
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, error: "Error fetching mentors" });
    }
});

export default router;

