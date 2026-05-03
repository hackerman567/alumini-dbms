import express from 'express';
const router = express.Router();
import db from '../db/index.js';
import { protect } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';

// Multer Storage for Avatars
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/avatars/'),
    filename: (req, file, cb) => cb(null, `avatar-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (extname) return cb(null, true);
        cb(new Error("Only images (jpeg, jpg, png) are allowed"));
    }
});

// @route   GET /api/v1/users/profile/me
router.get('/profile/me', protect, async (req, res) => {
    try {
        const userResult = await db.query(
            'SELECT id, name, email, role, avatar_url, is_verified, created_at FROM users WHERE id = $1',
            [req.user.id]
        );
        const user = userResult.rows[0];

        let profile = {};
        if (user.role === 'alumni') {
            const profRes = await db.query('SELECT * FROM alumni_profiles WHERE user_id = $1', [user.id]);
            profile = profRes.rows[0];
        } else if (user.role === 'student') {
            const profRes = await db.query('SELECT * FROM student_profiles WHERE user_id = $1', [user.id]);
            profile = profRes.rows[0];
        }

        res.json({ success: true, data: { ...user, profile } });
    } catch (err) {
        res.status(500).json({ success: false, error: "Error fetching profile" });
    }
});

// @route   PUT /api/v1/users/profile/update
router.put('/profile/update', protect, async (req, res) => {
    const { name, bio, skills, department, current_company, job_title, graduation_year, enrollment_year } = req.body;

    try {
        // Update basic user info
        if (name) {
            await db.query('UPDATE users SET name = $1 WHERE id = $2', [name, req.user.id]);
        }

        if (req.user.role === 'alumni') {
            await db.query(
                `UPDATE alumni_profiles SET 
                 bio = COALESCE($1, bio), 
                 skills = COALESCE($2, skills), 
                 department = COALESCE($3, department),
                 current_company = COALESCE($4, current_company),
                 job_title = COALESCE($5, job_title),
                 graduation_year = COALESCE($6, graduation_year)
                 WHERE user_id = $7`,
                [bio, skills, department, current_company, job_title, graduation_year, req.user.id]
            );
        } else if (req.user.role === 'student') {
            await db.query(
                `UPDATE student_profiles SET 
                 skills = COALESCE($1, skills), 
                 department = COALESCE($2, department),
                 enrollment_year = COALESCE($3, enrollment_year)
                 WHERE user_id = $4`,
                [skills, department, enrollment_year, req.user.id]
            );
        }

        res.json({ success: true, message: "Profile updated successfully" });
    } catch (err) {
        res.status(500).json({ success: false, error: "Error updating profile" });
    }
});

// @route   POST /api/v1/users/avatar
router.post('/avatar', protect, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, error: "No file uploaded" });
        
        const avatarUrl = `/uploads/avatars/${req.file.filename}`;
        await db.query('UPDATE users SET avatar_url = $1 WHERE id = $2', [avatarUrl, req.user.id]);
        
        res.json({ success: true, avatar_url: avatarUrl });
    } catch (err) {
        res.status(500).json({ success: false, error: "Avatar upload failed" });
    }
});

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const pdfUpload = multer({ 
    dest: 'uploads/resumes/',
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// @route   POST /api/v1/users/resume-analyze
router.post('/resume-analyze', protect, pdfUpload.single('resume'), async (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, error: "No PDF signal detected" });
    const { role } = req.body;

    try {
        // 1. Extract text from PDF
        const dataBuffer = fs.readFileSync(req.file.path);
        const pdfData = await pdfParse(dataBuffer);
        const resumeText = pdfData.text;

        // 2. Query Gemini
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `
            Analyze this resume for the role of "${role}".
            Resume Text: ${resumeText}
            
            Return a JSON object with:
            - score (0-100)
            - strengths (array of strings)
            - gaps (array of strings)
            - roadmap (array of 3 objects with {title, desc})
            
            Return ONLY the JSON.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();
        
        // Clean markdown JSON if present
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const analysis = JSON.parse(text);

        // Clean up temp file
        fs.unlinkSync(req.file.path);

        res.json({ success: true, analysis });
    } catch (err) {
        console.error("AI Analysis Error:", err);
        res.status(500).json({ success: false, error: "Neural link failed" });
    }
});

export default router;

