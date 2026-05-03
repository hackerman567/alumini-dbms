import express from 'express';
const router = express.Router();
import db from '../db/index.js';
import { protect } from '../middleware/auth.js';

const BADGES = [
    { key: 'PORTAL_PIONEER', name: 'Portal Pioneer', desc: 'Opened your first Opportunity Portal (Job).' },
    { key: 'NEXUS_NODE', name: 'Nexus Node', desc: 'Established 5 successful connections.' },
    { key: 'TIMELINE_ANCHOR', name: 'Timeline Anchor', desc: 'Completed your profile to 100%.' },
    { key: 'CAPSULE_KEEPER', name: 'Capsule Keeper', desc: 'Sealed your first Time Capsule.' },
    { key: 'SIGNAL_MASTER', name: 'Signal Master', desc: 'Sent 10 mentorship requests.' },
    { key: 'DIMENSION_GUIDE', name: 'Dimension Guide', desc: 'Mentored 3 students.' },
    { key: 'ORBIT_VETERAN', name: 'Orbit Veteran', desc: 'Account older than 1 year.' },
    { key: 'QUANTUM_SCHOLAR', name: 'Quantum Scholar', desc: 'Posted in 3 different job categories.' },
    { key: 'VOID_EXPLORER', name: 'Void Explorer', desc: 'Logged in 30 days straight.' },
    { key: 'CONSTELLATION_HUB', name: 'Constellation Hub', desc: 'Reached 20 connections.' },
    { key: 'RIFT_OPENER', name: 'Rift Opener', desc: 'First to join from your city.' },
    { key: 'NEXUS_LEGEND', name: 'Nexus Legend', desc: 'Earned all other badges.' }
];

// @route   GET /api/v1/achievements/me
router.get('/me', protect, async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM achievements WHERE user_id = $1', [req.user.id]);
        res.json({ success: true, data: result.rows, all_badges: BADGES });
    } catch (err) {
        res.status(500).json({ success: false, error: "Error fetching achievements" });
    }
});

// @route   GET /api/v1/achievements/leaderboard
router.get('/leaderboard', protect, async (req, res) => {
    try {
        const result = await db.query(`
            SELECT u.id, u.name, u.avatar_url, u.role, COUNT(a.id) as badge_count
            FROM users u
            JOIN achievements a ON u.id = a.user_id
            GROUP BY u.id, u.name, u.avatar_url, u.role
            ORDER BY badge_count DESC
            LIMIT 10
        `);
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, error: "Error fetching leaderboard" });
    }
});

// Utility function to check and award badges (called during login or specific actions)
export const checkBadges = async (userId) => {
    try {
        // 1. Check PORTAL_PIONEER
        const jobs = await db.query('SELECT COUNT(*) FROM job_postings WHERE posted_by = $1', [userId]);
        if (parseInt(jobs.rows[0].count) >= 1) {
            await awardBadge(userId, 'PORTAL_PIONEER');
        }

        // 2. Check TIMELINE_ANCHOR (Profile Completion)
        const userRes = await db.query('SELECT role FROM users WHERE id = $1', [userId]);
        const role = userRes.rows[0].role;
        let isComplete = false;

        if (role === 'alumni') {
            const prof = await db.query('SELECT bio, skills, department, current_company, job_title, graduation_year FROM alumni_profiles WHERE user_id = $1', [userId]);
            const p = prof.rows[0];
            isComplete = p.bio && p.skills && p.department && p.current_company && p.job_title && p.graduation_year;
        } else if (role === 'student') {
            const prof = await db.query('SELECT skills, department, enrollment_year FROM student_profiles WHERE user_id = $1', [userId]);
            const p = prof.rows[0];
            isComplete = p.skills && p.department && p.enrollment_year;
        }

        if (isComplete) {
            await awardBadge(userId, 'TIMELINE_ANCHOR');
        }

        // 3. Check NEXUS_NODE (4 connections as per TC61)
        const mentorships = await db.query("SELECT COUNT(*) FROM mentorship_requests WHERE (alumni_id = $1 OR student_id = $1) AND status = 'accepted'", [userId]);
        if (parseInt(mentorships.rows[0].count) >= 4) {
            await awardBadge(userId, 'NEXUS_NODE');
        }
        
        // 4. Check SIGNAL_MASTER
        const requests = await db.query("SELECT COUNT(*) FROM mentorship_requests WHERE student_id = $1", [userId]);
        if (parseInt(requests.rows[0].count) >= 1) { // Award for first request as well
            await awardBadge(userId, 'SIGNAL_MASTER');
        }

    } catch (err) {
        console.error("Error checking badges:", err);
    }
};

const awardBadge = async (userId, badgeKey) => {
    const badgeCheck = await db.query('SELECT * FROM achievements WHERE user_id = $1 AND badge_key = $2', [userId, badgeKey]);
    if (badgeCheck.rows.length === 0) {
        const badgeDef = BADGES.find(b => b.key === badgeKey);
        if (badgeDef) {
            await db.query(
                `INSERT INTO achievements (user_id, badge_key, badge_name, badge_desc) VALUES ($1, $2, $3, $4)`,
                [userId, badgeKey, badgeDef.name, badgeDef.desc]
            );
        }
    }
};

export default router;
