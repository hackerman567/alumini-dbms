import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Ensure upload directories exist at startup
['uploads/resumes', 'uploads/avatars'].forEach(dir => fs.mkdirSync(dir, { recursive: true }));
import http from 'http';
import { Server } from 'socket.io';

// Routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import alumniRoutes from './routes/alumni.js';
import mentorshipRoutes from './routes/mentorship.js';
import eventRoutes from './routes/events.js';
import jobRoutes from './routes/jobs.js';
import messageRoutes from './routes/messaging.js';
import notificationRoutes from './routes/notifications.js';
import donationRoutes from './routes/donations.js';
import adminRoutes from './routes/admin.js';
import reportRoutes from './routes/reports.js';
import pushRoutes from './routes/push.js';
import capsuleRoutes from './routes/capsules.js';
import achievementsRoutes from './routes/achievements.js';
import pollRoutes from './routes/polls.js';
import nexusRoutes from './routes/nexus.js';
import searchRoutes from './routes/search.js';
import { startCronJobs } from './cron.js';

import { setIo } from './utils/broadcast.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
    process.env.FRONTEND_URL,
    'https://hackerman567.github.io',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
    'http://localhost:8080',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:8080'
].filter(Boolean);

const corsOptions = {
    origin: (origin, callback) => {
        // Allow any localhost or 127.0.0.1 port in development
        if (!origin || 
            allowedOrigins.indexOf(origin) !== -1 || 
            origin.startsWith('http://localhost:') || 
            origin.startsWith('http://127.0.0.1:')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

const io = new Server(server, {
    cors: corsOptions
});

// Initialize broadcast utility
setIo(io);

io.on('connection', (socket) => {
    console.log('⚡ Nexus Socket Connected:', socket.id);

    socket.on('join_room', (roomId) => {
        socket.join(roomId);
        console.log(`User joined room: ${roomId}`);
    });

    socket.on('leave_room', (roomId) => {
        socket.leave(roomId);
        console.log(`User left room: ${roomId}`);
    });

    socket.on('typing', ({ roomId, userName }) => {
        socket.to(roomId).emit('typing_status', { userName, isTyping: true });
    });

    socket.on('stop_typing', ({ roomId }) => {
        socket.to(roomId).emit('typing_status', { isTyping: false });
    });

    socket.on('disconnect', () => {
        console.log('Nexus Socket Disconnected:', socket.id);
    });
});

// Start Cron Jobs
startCronJobs();

// Ensure upload directories exist
const uploadDirs = ['uploads/avatars', 'uploads/resumes'];
uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Security Middleware
app.use(helmet({
    crossOriginResourcePolicy: false, // For local image serving
}));
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10000, // increased for dev
    message: { success: false, error: "Too many requests, please try again later." }
});
app.use('/api/', limiter);

// TEMPORARY SEED ROUTE
app.get('/api/v1/admin/seed-now', async (req, res) => {
    try {
        const db = (await import('./db/index.js')).default;
        const fs = await import('fs');
        const path = await import('path');
        const { fileURLToPath } = await import('url');
        
        const __dirname = path.dirname(fileURLToPath(import.meta.url));
        const schema = fs.readFileSync(path.join(__dirname, 'db/schema.sql'), 'utf8');
        const seed = fs.readFileSync(path.join(__dirname, 'db/seed.sql'), 'utf8');
        
        await db.query(schema);
        await db.query(seed);
        
        res.json({ success: true, message: "DATABASE SYNCHRONIZED AND SEEDED!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Static Folders
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes Initialization
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/alumni', alumniRoutes);
app.use('/api/v1/mentorship', mentorshipRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/jobs', jobRoutes);
app.use('/api/v1/messages', messageRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/donations', donationRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/push', pushRoutes);
app.use('/api/v1/capsules', capsuleRoutes);
app.use('/api/v1/achievements', achievementsRoutes);
app.use('/api/v1/polls', pollRoutes);
app.use('/api/v1/nexus', nexusRoutes);
app.use('/api/v1/search', searchRoutes);


// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || "Internal Server Error"
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 AlumniConnect Active on Port ${PORT}`);
});
