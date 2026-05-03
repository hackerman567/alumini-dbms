import express from 'express';
const router = express.Router();
import db from '../db/index.js';
import { protect } from '../middleware/auth.js';
import { broadcast } from '../utils/broadcast.js';

// @route   GET /api/v1/messages/conversations
// @desc    Get all conversations for the logged in user
router.get('/conversations', protect, async (req, res) => {
    try {
        const result = await db.query(`
            SELECT c.*, 
                   u.name as participant_name, u.avatar_url as participant_avatar, u.role as participant_role,
                   m.body as last_message, m.sent_at as last_message_time
            FROM conversations c
            JOIN users u ON (c.user1_id = u.id AND c.user2_id = $1) OR (c.user2_id = u.id AND c.user1_id = $1)
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

// @route   POST /api/v1/messages
// @desc    Send a message
router.post('/', protect, async (req, res) => {
    const { receiver_id, body } = req.body;
    if (!receiver_id || !body) return res.status(400).json({ success: false, error: "Incomplete signal data" });

    try {
        // 1. Find or create conversation
        let convResult = await db.query(
            'SELECT id FROM conversations WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1)',
            [req.user.id, receiver_id]
        );

        let conversationId;
        if (convResult.rows.length === 0) {
            const newConv = await db.query(
                'INSERT INTO conversations (user1_id, user2_id) VALUES ($1, $2) RETURNING id',
                [req.user.id, receiver_id]
            );
            conversationId = newConv.rows[0].id;
        } else {
            conversationId = convResult.rows[0].id;
        }

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
        broadcast(`chat_${conversationId}`, newMessage);
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
