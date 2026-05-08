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
// @route   PUT /api/v1/users/profile/update
router.put('/profile/update', protect, async (req, res) => {
    // Handle both flat and nested structures (from frontend { ...user, profile })
    const body = req.body;
    const profile = body.profile || {};
    
    let name = body.name || profile.name;
    let bio = body.bio || profile.bio;
    let skills = body.skills || profile.skills;
    let department = body.department || profile.department;
    let current_company = body.current_company || body.company || profile.current_company || profile.company;
    let job_title = body.job_title || profile.job_title;
    let graduation_year = body.graduation_year || profile.graduation_year;
    let enrollment_year = body.enrollment_year || profile.enrollment_year;

    // Data Sanitization & Casting
    const parseYear = (yr) => {
        if (!yr) return null;
        const n = parseInt(yr);
        return isNaN(n) ? null : n;
    };

    const gYear = parseYear(graduation_year);
    const eYear = parseYear(enrollment_year);

    // Normalize skills to array for PostgreSQL
    let skillArray = null;
    if (skills !== undefined) {
        if (Array.isArray(skills)) {
            skillArray = skills;
        } else if (typeof skills === 'string') {
            skillArray = skills.split(',').map(s => s.trim()).filter(s => s !== '');
        } else {
            skillArray = [];
        }
    }

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
                [bio, skillArray, department, current_company, job_title, gYear, req.user.id]
            );
        } else if (req.user.role === 'student') {
            await db.query(
                `UPDATE student_profiles SET 
                 skills = COALESCE($1, skills), 
                 department = COALESCE($2, department),
                 enrollment_year = COALESCE($3, enrollment_year)
                 WHERE user_id = $4`,
                [skillArray, department, eYear, req.user.id]
            );
        }

        // Trigger Achievement Check
        try {
            const { checkBadges } = await import('./achievements.js');
            await checkBadges(req.user.id);
        } catch (badgeErr) {
            console.error("Badge check failed:", badgeErr);
        }

        res.json({ success: true, message: "Profile updated successfully" });
    } catch (err) {
        console.error("Update Error:", err);
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
const pdf = require('pdf-parse');
import Groq from 'groq-sdk';
import fs from 'fs';

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

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
        const pdfData = await pdf(dataBuffer);
        const resumeText = pdfData.text;

        // 2. Query Groq
        console.log(`🧠 Analyzing resume for role: ${role}`);
        console.log(`📄 Extracted Text Length: ${resumeText.length}`);

        const prompt = `
            Analyze this resume for the role of "${role}".
            Resume Text: ${resumeText}
            
            Return a JSON object with:
            - score (0-100)
            - strengths (array of strings)
            - gaps (array of strings)
            - roadmap (array of 3 objects with {title, desc})
            - courses (array of 3 objects with {title, platform, link})
            - recommended_alumni (array of 3 objects with {name, role, user_id})
            
            For recommended_alumni, provide realistic names and roles. 
            Return ONLY the JSON.
        `;

        if (!groq) {
            return res.status(503).json({ success: false, error: "AI Services currently offline. Please contact administrator." });
        }

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a professional career advisor. Return analysis in JSON format."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            model: "llama3-8b-8192",
            response_format: { type: "json_object" }
        });

        const rawContent = completion.choices[0].message.content;
        console.log(`🤖 AI Response: ${rawContent.substring(0, 100)}...`);

        let analysis;
        try {
            analysis = JSON.parse(rawContent);
        } catch (parseErr) {
            console.error("JSON Parse Error:", parseErr);
            // Fallback: try to find JSON in the string
            const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                analysis = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error("Could not parse AI response as JSON");
            }
        }

        // Clean up temp file
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.json({ success: true, analysis });
    } catch (err) {
        console.error("AI Analysis Error:", err);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ success: false, error: err.message || "Neural link failed" });
    }
});

export default router;

