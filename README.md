# AlumniConnect: Parallel Universe 🌌

[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/Build-Stable-brightgreen.svg)]()
[![Aesthetic](https://img.shields.io/badge/Design-Parallel_Universe-blueviolet.svg)]()

**AlumniConnect: Parallel Universe** is a state-of-the-art, high-fidelity professional networking portal designed to bridge the gap between students, faculty, and alumni. Built with a futuristic "Parallel" aesthetic, it utilizes glassmorphism, high-contrast neon accents, and real-time synchronization to provide a premium user experience.

---

## 🚀 Core Dimensions (12 Modules)

1.  **Access Gateway (Auth)**: Secure JWT-based authentication with role-specific entry (Admin, Alumni, Student, Faculty).
2.  **Nexus Core (Dashboard)**: A high-density visual hub with real-time stats and the "Nexus" global activity ticker.
3.  **Identity Matrix (Profile)**: Dynamic user profiles with avatar customization and professional history tracking.
4.  **Opportunity Portals (Job Board)**: A comprehensive marketplace for job postings, internship tracking, and one-click applications.
5.  **Connection Nexus (Mentorship)**: Intelligent mentor-mentee matching with request/approval workflows.
6.  **Oversight Nexus (Admin Console)**: Full-spectrum moderation tools, audit logs, and user verification systems.
7.  **WebSocket Ticker Feed**: Real-time platform pulse powered by Socket.io, broadcasting events as they happen across the timeline.
8.  **Alumni Time Capsule**: A unique temporal feature allowing alumni to seal messages to be revealed on future milestone dates.
9.  **Achievement Badge System**: Dynamic gamification that awards badges (e.g., *Portal Pioneer*, *Nexus Node*) for community contribution.
10. **AI Resume Skill Gap Analyzer**: A drag-and-drop PDF analyzer that provides instant professional feedback and skill alignment scores.
11. **Direct Encrypted Messaging**: Real-time communication channels with typing indicators and read receipts.
12. **Consensus & Funding**: Integrated community polls for faculty decision-making and donation campaign tracking.

---

## 🛠️ Tech Stack

*   **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion, Lucide React.
*   **Backend**: Node.js, Express.js, Socket.io.
*   **Database**: PostgreSQL.
*   **Security**: JWT (JSON Web Tokens), Bcrypt (Password Hashing).

---

## 📦 Installation & Setup

### Prerequisites
*   Node.js (v18+)
*   PostgreSQL

### 1. Clone the Repository
```bash
git clone https://github.com/darsan1234/alumini-dbms.git
cd alumini-dbms
```

### 2. Configure Backend
```bash
cd backend
npm install
# Copy .env.example to .env and update your PostgreSQL credentials
cp .env.example .env
```

### 3. Initialize Database
```bash
# This will wipe the current DB, apply the schema, and inject all 12 modules' test data
node reset-db.js
```

### 4. Configure Frontend
```bash
cd ../frontend
npm install
```

---

## 🚦 Running the Platform

### Start Backend
```bash
cd backend
node server.js
```

### Start Frontend
```bash
cd frontend
npm run dev
```

---

## 🧪 Testing & Audit
This platform has been rigorously tested against **89+ individual test cases** covering every module. To perform an audit:
1. Log in using the seeded credentials found in `backend/db/seed.sql`.
2. Navigate through the 12 portals to verify data synchronization.
3. Check the **Hall of Fame** to verify the Badge System's real-time leaderboard.

---

## 🌌 Design Philosophy
AlumniConnect uses the **Parallel Visual System**:
*   **Max Contrast**: Pure black backgrounds for zero distraction.
*   **Quantum Cards**: 24px blurred glassmorphism with neon borders.
*   **Micro-Animations**: Framer Motion powered transitions that make the portal feel "alive."

---
*Created by [Praveen Ramesh](https://github.com/hackerman567)*
