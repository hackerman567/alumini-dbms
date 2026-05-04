import express from 'express';
const router = express.Router();
import db from '../db/index.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

// @route   GET /api/v1/donations/campaigns
router.get('/campaigns', protect, async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM donation_campaigns WHERE status = $1', ['active']);
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, error: "Error fetching campaigns" });
    }
});

// @route   POST /api/v1/donations/donate
router.post('/donate', protect, async (req, res) => {
    const { campaign_id, amount, message, is_anonymous, payment_ref } = req.body;

    const client = await db.getClient();
    try {
        await client.query('BEGIN');

        // 1. Record Donation
        await client.query(
            'INSERT INTO donations (donor_id, campaign_id, amount, message, is_anonymous, payment_ref) VALUES ($1, $2, $3, $4, $5, $6)',
            [req.user.id, campaign_id, amount, message, is_anonymous, payment_ref]
        );

        // 2. Update Campaign Total
        await client.query(
            'UPDATE donation_campaigns SET raised_amount = raised_amount + $1 WHERE id = $2',
            [amount, campaign_id]
        );

        await client.query('COMMIT');

        // 3. Notify Donor
        await db.query(
            'INSERT INTO notifications (user_id, type, title, body, reference_id, reference_type) VALUES ($1, $2, $3, $4, $5, $6)',
            [req.user.id, 'donation', 'CONTRIBUTION SYNCHRONIZED', `Your donation of $${amount} has been received. Thank you for supporting the Nexus!`, campaign_id, 'donation']
        );

        // 4. Broadcast to Community
        import('../utils/broadcast.js').then(({ broadcast }) => {
            broadcast('live_event', {
                type: 'donation',
                message: `◈ NEURAL OVERFLOW: ${is_anonymous ? 'Anonymous Entity' : req.user.name} contributed $${amount} to the community fund`,
                time: new Date()
            });
        });

        // 5. Check achievements
        import('./achievements.js').then(m => m.checkBadges(req.user.id));

        res.json({ success: true, message: "Thank you for your donation!" });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ success: false, error: "Donation processing failed" });
    } finally {
        client.release();
    }
});

export default router;

