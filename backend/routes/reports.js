import express from 'express';
const router = express.Router();
import db from '../db/index.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

router.use(protect);
// Admin only for specific reports, but stats are public for dashboard parity
// router.use(authorize('admin'));

// @route   GET /api/v1/reports/stats
router.get('/stats', async (req, res) => {
    try {
        const stats = {};
        
        // Users count by role
        const roleRes = await db.query('SELECT role, COUNT(*) FROM users GROUP BY role');
        stats.usersByRole = roleRes.rows;

        // Mentorship stats
        const mentorRes = await db.query('SELECT status, COUNT(*) FROM mentorship_requests GROUP BY status');
        stats.mentorship = mentorRes.rows;

        // Job stats
        const jobRes = await db.query('SELECT COUNT(*) FROM job_postings WHERE status = $1', ['open']);
        stats.openJobs = parseInt(jobRes.rows[0].count);

        res.json({ success: true, data: stats });
    } catch (err) {
        res.status(500).json({ success: false, error: "Error generating report" });
    }
});

// @route   GET /api/v1/reports/audit-logs
router.get('/audit-logs', async (req, res) => {
    try {
        const logs = await db.query(`
            SELECT a.*, u.name as user_name 
            FROM audit_logs a 
            LEFT JOIN users u ON a.user_id = u.id 
            ORDER BY a.created_at DESC 
            LIMIT 50
        `);
        res.json({ success: true, data: logs.rows });
    } catch (err) {
        res.status(500).json({ success: false, error: "Error fetching audit logs" });
    }
});

export default router;

