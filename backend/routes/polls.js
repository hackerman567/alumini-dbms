import express from 'express';
const router = express.Router();
import db from '../db/index.js';
import { protect } from '../middleware/auth.js';
import { broadcast } from '../utils/broadcast.js';

// @route   POST /api/v1/polls
// @desc    Create a new poll (Admin/Alumni only)
router.post('/', protect, async (req, res) => {
    const { question, options, ends_at } = req.body;
    if (!question || !options || options.length < 2) {
        return res.status(400).json({ success: false, error: "Question and at least 2 options required" });
    }

    try {
        const pollResult = await db.query(
            'INSERT INTO polls (creator_id, question, ends_at) VALUES ($1, $2, $3) RETURNING id',
            [req.user.id, question, ends_at]
        );
        const pollId = pollResult.rows[0].id;

        for (const option of options) {
            await db.query(
                'INSERT INTO poll_options (poll_id, option_text) VALUES ($1, $2)',
                [pollId, option]
            );
        }

        broadcast('live_event', {
            type: 'poll',
            message: `◈ NEW CONSENSUS SOUGHT: ${question}`,
            time: new Date()
        });

        res.status(201).json({ success: true, poll_id: pollId });
    } catch (err) {
        console.error("Poll creation error:", err);
        res.status(500).json({ success: false, error: "Failed to broadcast poll" });
    }
});

// @route   GET /api/v1/polls
// @desc    Get all active polls with results
router.get('/', protect, async (req, res) => {
    try {
        const pollsResult = await db.query(`
            SELECT p.*, u.name as creator_name,
                   (SELECT COUNT(*) FROM poll_votes WHERE poll_id = p.id) as total_votes,
                   (SELECT id FROM poll_votes WHERE poll_id = p.id AND user_id = $1) as user_voted_option_id
            FROM polls p
            JOIN users u ON p.creator_id = u.id
            ORDER BY p.created_at DESC
        `, [req.user.id]);

        const polls = [];
        for (const poll of pollsResult.rows) {
            const optionsResult = await db.query(`
                SELECT o.*, 
                       (SELECT COUNT(*) FROM poll_votes WHERE option_id = o.id) as vote_count
                FROM poll_options o
                WHERE o.poll_id = $1
            `, [poll.id]);
            poll.options = optionsResult.rows;
            polls.push(poll);
        }

        res.json({ success: true, data: polls });
    } catch (err) {
        res.status(500).json({ success: false, error: "Error fetching polls" });
    }
});

// @route   POST /api/v1/polls/:id/vote
// @desc    Cast a vote
router.post('/:id/vote', protect, async (req, res) => {
    const { option_id } = req.body;
    const poll_id = req.params.id;

    try {
        // 1. Check if user already voted
        const voteCheck = await db.query('SELECT * FROM poll_votes WHERE poll_id = $1 AND user_id = $2', [poll_id, req.user.id]);
        if (voteCheck.rows.length > 0) return res.status(400).json({ success: false, error: "Signal already cast" });

        // 2. Cast vote
        await db.query(
            'INSERT INTO poll_votes (poll_id, user_id, option_id) VALUES ($1, $2, $3)',
            [poll_id, req.user.id, option_id]
        );

        // 3. Broadcast updated results
        const optionsResult = await db.query(`
            SELECT o.id, o.option_text, COUNT(v.id) as vote_count
            FROM poll_options o
            LEFT JOIN poll_votes v ON o.id = v.option_id
            WHERE o.poll_id = $1
            GROUP BY o.id
        `, [poll_id]);

        broadcast(`poll_update_${poll_id}`, optionsResult.rows);

        res.json({ success: true, message: "Vote synchronized" });
    } catch (err) {
        console.error("Voting error:", err);
        res.status(500).json({ success: false, error: "Signal interruption" });
    }
});

export default router;
