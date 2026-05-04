import express from 'express';
const router = express.Router();
import db from '../db/index.js';
import { protect } from '../middleware/auth.js';
import { broadcast, broadcastToRoom } from '../utils/broadcast.js';

// @route   GET /api/v1/messages/conversations
// @desc    Get all conversations for the logged in user
router.get('/conversations', protect, async (req, res) => {
    try {
        const result = await db.query(`
            SELECT 
                c.id, c.user1_id, c.user2_id, c.updated_at,
                CASE WHEN c.user1_id = $1 THEN u2.name ELSE u1.name END as participant_name,
                CASE WHEN c.user1_id = $1 THEN u2.avatar_url ELSE u1.avatar_url END as participant_avatar,
                CASE WHEN c.user1_id = $1 THEN u2.role ELSE u1.role END as participant_role,
                CASE WHEN c.user1_id = $1 THEN c.user2_id ELSE c.user1_id END as participant_id,
                m.body as last_message, m.sent_at as last_message_time
            FROM conversations c
            JOIN users u1 ON c.user1_id = u1.id
            JOIN users u2 ON c.user2_id = u2.id
            LEFT JOIN messages m ON c.last_message_id = m.id
            WHERE c.user1_id = $1 OR c.user2_id = $1
            ORDER BY c.updated_at DESC
        `, [req.user.id]);
        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error("Fetch conversations error:", err);
        res.status(500).json({ success: false, error: "Error fetching conversations" });
    }
});

// @route   GET /api/v1/messages/:conversationId
// @desc    Get all messages in a conversation
router.get('/:conversationId', protect, async (req, res) => {
    try {
        // Verify user is part of the conversation
        const convCheck = await db.query(
            'SELECT * FROM conversations WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)',
            [req.params.conversationId, req.user.id]
        );
        if (convCheck.rows.length === 0) return res.status(403).json({ success: false, error: "Access denied" });

        const result = await db.query(`
            SELECT m.*, u.name as sender_name
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            WHERE m.conversation_id = $1
            ORDER BY m.sent_at ASC
        `, [req.params.conversationId]);
        
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, error: "Error fetching messages" });
    }
});

// @route   PUT /api/v1/messages/read/:conversationId
// @desc    Mark all messages in a conversation as read
router.put('/read/:conversationId', protect, async (req, res) => {
    try {
        await db.query(
            'UPDATE messages SET is_read = true WHERE conversation_id = $1 AND receiver_id = $2',
            [req.params.conversationId, req.user.id]
        );
        res.json({ success: true, message: "Signal acknowledged" });
    } catch (err) {
        res.status(500).json({ success: false, error: "Read receipt failed" });
    }
});

// @route   POST /api/v1/messages
// @desc    Send a message
router.post('/', protect, async (req, res) => {
    const { receiver_id, body } = req.body;
    if (!receiver_id || !body) return res.status(400).json({ success: false, error: "Incomplete signal data" });

    try {
        // 1. Find or create conversation (use LEAST/GREATEST to ensure consistent ordering)
        const u1 = Math.min(req.user.id, parseInt(receiver_id));
        const u2 = Math.max(req.user.id, parseInt(receiver_id));

        // Upsert pattern: avoids race condition duplicate key errors
        await db.query(
            'INSERT INTO conversations (user1_id, user2_id) VALUES ($1, $2) ON CONFLICT (user1_id, user2_id) DO NOTHING',
            [u1, u2]
        );

        let convResult = await db.query(
            'SELECT id FROM conversations WHERE user1_id = $1 AND user2_id = $2',
            [u1, u2]
        );

        let conversationId = convResult.rows[0].id;

        // 2. Insert message
        const msgResult = await db.query(
            'INSERT INTO messages (conversation_id, sender_id, receiver_id, body) VALUES ($1, $2, $3, $4) RETURNING *',
            [conversationId, req.user.id, receiver_id, body]
        );
        const newMessage = msgResult.rows[0];

        // 3. Update conversation last_message_id
        await db.query(
            'UPDATE conversations SET last_message_id = $1, updated_at = NOW() WHERE id = $2',
            [newMessage.id, conversationId]
        );

        // 4. Real-time broadcast
        broadcastToRoom(`chat_${conversationId}`, 'chat_msg', newMessage);
        broadcast(`inbox_${receiver_id}`, {
            conversation_id: conversationId,
            sender_name: req.user.name,
            last_message: body
        });

        res.status(201).json({ success: true, data: newMessage });
    } catch (err) {
        console.error("Send message error:", err);
        res.status(500).json({ success: false, error: "Signal transmission failed" });
    }
});

export default router;
