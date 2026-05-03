import express from 'express';
const router = express.Router();
import webpush from 'web-push';
import db from '../db/index.js';
import { protect } from '../middleware/auth.js';
import dotenv from 'dotenv';
dotenv.config();

webpush.setVapidDetails(
    'mailto:test@example.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

// @route   POST /api/v1/push/subscribe
// @desc    Subscribe user to push notifications
router.post('/subscribe', protect, async (req, res) => {
    const subscription = req.body;

    try {
        await db.query(
            'INSERT INTO push_subscriptions (user_id, subscription_json) VALUES ($1, $2)',
            [req.user.id, subscription]
        );
        res.status(201).json({ success: true, message: "Subscribed to push notifications" });
    } catch (err) {
        console.error("Push subscription error:", err);
        res.status(500).json({ success: false, error: "Failed to subscribe" });
    }
});

// Utility function to send push notifications
export const sendPushNotification = async (userId, payload) => {
    try {
        const subs = await db.query('SELECT subscription_json FROM push_subscriptions WHERE user_id = $1', [userId]);
        
        const promises = subs.rows.map(sub => {
            return webpush.sendNotification(sub.subscription_json, JSON.stringify(payload)).catch(err => {
                if (err.statusCode === 404 || err.statusCode === 410) {
                    // Subscription has expired or is no longer valid, we should delete it
                    console.log('Subscription has expired or is no longer valid: ', err);
                    // db.query('DELETE FROM push_subscriptions WHERE user_id = $1 AND subscription_json = $2', [userId, sub.subscription_json]);
                } else {
                    throw err;
                }
            });
        });

        await Promise.all(promises);
    } catch (err) {
        console.error("Error sending push notification:", err);
    }
};

export default router;
