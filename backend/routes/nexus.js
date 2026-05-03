import express from 'express';
const router = express.Router();
import db from '../db/index.js';
import { protect } from '../middleware/auth.js';

// @route   GET /api/v1/nexus/history
// @desc    Get historical events for "This Day in History" banner
router.get('/history', protect, async (req, res) => {
    try {
        // Find users who registered on this day in previous years
        // Or find alumni who graduated on this year/day
        const today = new Date();
        const month = today.getMonth() + 1;
        const day = today.getDate();

        const historyQuery = `
            SELECT name, role, created_at, 
            EXTRACT(YEAR FROM created_at) as year
            FROM users 
            WHERE EXTRACT(MONTH FROM created_at) = $1 
            AND EXTRACT(DAY FROM created_at) = $2
            AND EXTRACT(YEAR FROM created_at) < EXTRACT(YEAR FROM CURRENT_TIMESTAMP)
            LIMIT 3
        `;
        
        const result = await db.query(historyQuery, [month, day]);
        
        const events = result.rows.map(row => ({
            type: 'anniversary',
            title: `${row.name} joined the Nexus`,
            desc: `On this day in ${row.year}, a new ${row.role} entity was synthesized.`,
            year: row.year
        }));

        // Add a fallback if no events found
        if (events.length === 0) {
            events.push({
                type: 'system',
                title: 'Nexus Stability Optimal',
                desc: 'No historical anomalies detected for this temporal coordinate.',
                year: today.getFullYear()
            });
        }

        res.json({ success: true, data: events });
    } catch (err) {
        console.error("Nexus History Error:", err);
        res.status(500).json({ success: false, error: "Temporal sync failed" });
    }
});

// @route   GET /api/v1/nexus/ticker
// @desc    Get recent activities for the global ticker
router.get('/ticker', protect, async (req, res) => {
    try {
        const jobs = await db.query('SELECT title, company FROM job_postings ORDER BY created_at DESC LIMIT 2');
        const users = await db.query('SELECT name, role FROM users ORDER BY created_at DESC LIMIT 2');
        
        const tickerData = [
            ...jobs.rows.map(j => `NEW PORTAL: ${j.title} at ${j.company}`),
            ...users.rows.map(u => `ENTITY DETECTED: ${u.name} initialized as ${u.role.toUpperCase()}`),
            "NEXUS STATUS: ALL SYSTEMS NOMINAL",
            "SIGNAL ENCRYPTION: 100% SECURE"
        ];

        res.json({ success: true, data: tickerData });
    } catch (err) {
        res.status(500).json({ success: false, error: "Ticker feed failure" });
    }
});

export default router;
