import express from 'express';
const router = express.Router();
import db from '../db/index.js';
import { protect } from '../middleware/auth.js';

// @route   GET /api/v1/alumni
// @desc    Get all alumni with filters and pagination
router.get('/', protect, async (req, res) => {
    const { 
        page = 1, 
        limit = 20, 
        search = '', 
        department = '', 
        grad_year = '', 
        is_mentor = null 
    } = req.query;

    const offset = (page - 1) * limit;

    try {
        let query = `
            SELECT u.id, u.name, u.avatar_url, ap.job_title, ap.current_company, 
                   ap.graduation_year, ap.department, ap.skills, ap.is_open_to_mentor
            FROM users u
            JOIN alumni_profiles ap ON u.id = ap.user_id
            WHERE u.role = 'alumni' AND u.is_active = true
        `;
        
        const params = [];
        let paramCount = 1;

        if (search) {
            query += ` AND (u.name ILIKE $${paramCount} OR ap.current_company ILIKE $${paramCount} OR ap.job_title ILIKE $${paramCount} OR ap.skills ILIKE $${paramCount})`;
            params.push(`%${search}%`);
            paramCount++;
        }

        if (department) {
            query += ` AND ap.department = $${paramCount}`;
            params.push(department);
            paramCount++;
        }

        if (grad_year) {
            query += ` AND ap.graduation_year = $${paramCount}`;
            params.push(parseInt(grad_year));
            paramCount++;
        }

        if (is_mentor !== null) {
            query += ` AND ap.is_open_to_mentor = $${paramCount}`;
            params.push(is_mentor === 'true');
            paramCount++;
        }

        // Add sorting and pagination
        query += ` ORDER BY ap.graduation_year DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
        params.push(parseInt(limit));
        params.push(offset);

        const result = await db.query(query, params);
        
        // Total count for pagination
        const totalResult = await db.query('SELECT COUNT(*) FROM alumni_profiles');
        const total = parseInt(totalResult.rows[0].count);

        res.json({
            success: true,
            data: result.rows,
            meta: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Error fetching alumni directory" });
    }
});

// @route   GET /api/v1/alumni/:id
router.get('/:id', protect, async (req, res) => {
    try {
        const result = await db.query(`
            SELECT u.id, u.name, u.email, u.avatar_url, ap.*
            FROM users u
            JOIN alumni_profiles ap ON u.id = ap.user_id
            WHERE u.id = $1
        `, [req.params.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: "Alumni not found" });
        }

        // Track profile view
        if (req.user.id !== parseInt(req.params.id)) {
            await db.query('UPDATE alumni_profiles SET profile_views = profile_views + 1 WHERE user_id = $1', [req.params.id]);
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: "Error fetching alumni profile" });
    }
});

export default router;

