import express from 'express';
const router = express.Router();
import db from '../db/index.js';
import { protect } from '../middleware/auth.js';

// @route   GET /api/v1/search
// @desc    Global search across Users, Jobs, and Events
router.get('/', protect, async (req, res) => {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
        return res.json({ success: true, users: [], jobs: [], events: [] });
    }

    try {
        const query = `%${q}%`;

        // 1. Search Users (Alumni & Students)
        const userResults = await db.query(
            `SELECT id, name, role, avatar_url 
             FROM users 
             WHERE name ILIKE $1 
             LIMIT 5`,
            [query]
        );

        // 2. Search Jobs
        const jobResults = await db.query(
            `SELECT id, title, company, type 
             FROM jobs 
             WHERE title ILIKE $1 OR company ILIKE $1 
             LIMIT 5`,
            [query]
        );

        // 3. Search Events
        const eventResults = await db.query(
            `SELECT id, title, event_type, venue 
             FROM events 
             WHERE title ILIKE $1 
             LIMIT 5`,
            [query]
        );

        res.json({
            success: true,
            results: {
                users: userResults.rows,
                jobs: jobResults.rows,
                events: eventResults.rows
            }
        });
    } catch (err) {
        console.error("Global Search Error:", err);
        res.status(500).json({ success: false, error: "Search protocol failed" });
    }
});

export default router;
