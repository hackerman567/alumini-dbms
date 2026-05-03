import express from 'express';
const router = express.Router();
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db/index.js';
import dotenv from 'dotenv';
import { broadcast } from '../utils/broadcast.js';
dotenv.config();

// @route   POST /api/v1/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
    const { name, email, password, role, department, graduation_year, enrollment_year } = req.body;

    try {
        // 1. Check if user exists
        const userCheck = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ success: false, error: "User already exists" });
        }

        // 2. Hash password
        const salt = await bcrypt.genSalt(12);
        const password_hash = await bcrypt.hash(password, salt);

        // 3. Insert User
        const newUser = await db.query(
            'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
            [name, email, password_hash, role || 'student']
        );

        const userId = newUser.rows[0].id;

        // 4. Create Profile based on role
        if (role === 'alumni') {
            const gradYear = graduation_year ? parseInt(graduation_year) : null;
            await db.query(
                'INSERT INTO alumni_profiles (user_id, graduation_year, department) VALUES ($1, $2, $3)',
                [userId, gradYear, department]
            );
        } else if (role === 'student') {
            const enrollYear = enrollment_year ? parseInt(enrollment_year) : null;
            await db.query(
                'INSERT INTO student_profiles (user_id, enrollment_year, department) VALUES ($1, $2, $3)',
                [userId, enrollYear, department]
            );
        }

        // 5. Generate Token
        const token = jwt.sign(
            { id: userId, role: newUser.rows[0].role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        broadcast('live_event', {
            type: 'user',
            message: `◈ NEW IDENTITY: ${name} (${(role || 'USER').toUpperCase()}) just joined the Nexus`,
            time: new Date()
        });

        res.status(201).json({
            success: true,
            token,
            user: newUser.rows[0]
        });

    } catch (err) {
        console.error("REGISTRATION ERROR DETECTED:", err);
        res.status(500).json({
            success: false,
            error: "Server Error during registration",
            details: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});

// @route   POST /api/v1/auth/login
// @desc    Login user & get token
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = userResult.rows[0];

        if (!user) {
            return res.status(401).json({ success: false, error: "Invalid Credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: "Invalid Credentials" });
        }

        // Update last login
        await db.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        // Set Cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 15 * 60 * 1000 // 15 mins
        });

        res.json({
            success: true,
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });

    } catch (err) {
        res.status(500).json({ success: false, error: "Server Error during login" });
    }
});

// @route   POST /api/v1/auth/logout
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ success: true, message: "Logged out successfully" });
});

export default router;

