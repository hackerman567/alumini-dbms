import express from 'express';
const router = express.Router();
import db from '../db/index.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

// @route   GET /api/v1/jobs
router.get('/', protect, async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM job_postings WHERE status = $1 ORDER BY created_at DESC', ['open']);
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, error: "Error fetching jobs" });
    }
});

import { broadcast } from '../utils/broadcast.js';

// @route   POST /api/v1/jobs
router.post('/', protect, authorize('alumni', 'admin'), async (req, res) => {
    const { title, company, description, requirements, type, location, is_remote, salary_range, deadline } = req.body;

    try {
        const result = await db.query(
            `INSERT INTO job_postings (posted_by, title, company, description, requirements, type, location, is_remote, salary_range, deadline) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
            [req.user.id, title, company, description, requirements, type, location, is_remote, salary_range, deadline]
        );
        
        broadcast('live_event', {
            type: 'job',
            message: `◈ NEW PORTAL DETECTED: ${req.user.name} opened a gateway to ${company}`,
            time: new Date()
        });

        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: "Error posting job" });
    }
});

// @route   POST /api/v1/jobs/:id/apply
router.post('/:id/apply', protect, authorize('student'), async (req, res) => {
    const { cover_letter } = req.body;

    try {
        // Get user resume_url from profile
        const profile = await db.query('SELECT resume_url FROM student_profiles WHERE user_id = $1', [req.user.id]);
        
        await db.query(
            'INSERT INTO job_applications (job_id, applicant_id, cover_letter, resume_url) VALUES ($1, $2, $3, $4)',
            [req.params.id, req.user.id, cover_letter, profile.rows[0]?.resume_url]
        );

        res.json({ success: true, message: "Applied successfully" });
    } catch (err) {
        if (err.code === '23505') return res.status(400).json({ success: false, error: "Already applied" });
        res.status(500).json({ success: false, error: "Application failed" });
    }
});

// @route   GET /api/v1/jobs/my-applications
router.get('/my-applications', protect, authorize('student'), async (req, res) => {
    try {
        const result = await db.query('SELECT job_id FROM job_applications WHERE applicant_id = $1', [req.user.id]);
        res.json({ success: true, data: result.rows.map(r => r.job_id) });
    } catch (err) {
        res.status(500).json({ success: false, error: "Error fetching applications" });
    }
});

// @route   DELETE /api/v1/jobs/:id
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        await db.query('DELETE FROM job_postings WHERE id = $1', [req.params.id]);
        res.json({ success: true, message: "Portal closed permanently" });
    } catch (err) {
        res.status(500).json({ success: false, error: "Closure sequence failed" });
    }
});

export default router;

