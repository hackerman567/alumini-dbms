import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database("alumni.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT CHECK(role IN ('alumni', 'student', 'faculty', 'admin')) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS profiles (
    user_id INTEGER PRIMARY KEY,
    graduation_year INTEGER,
    department TEXT,
    company TEXT,
    position TEXT,
    bio TEXT,
    skills TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    date DATETIME NOT NULL,
    location TEXT,
    created_by INTEGER,
    FOREIGN KEY(created_by) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT,
    description TEXT,
    posted_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(posted_by) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS mentorships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mentor_id INTEGER,
    mentee_id INTEGER,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(mentor_id) REFERENCES users(id),
    FOREIGN KEY(mentee_id) REFERENCES users(id)
  );
`);

// Seed Data
const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as any;
if (userCount.count === 0) {
  const insertUser = db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)");
  const insertProfile = db.prepare("INSERT INTO profiles (user_id, graduation_year, department, company, position, bio) VALUES (?, ?, ?, ?, ?, ?)");
  
  const alumni1 = insertUser.run("Sarah Jenkins", "sarah@example.com", "password", "alumni").lastInsertRowid;
  insertProfile.run(alumni1, 2018, "Computer Science", "Google", "Senior Software Engineer", "Passionate about building scalable web applications and mentoring the next generation of developers.");
  
  const alumni2 = insertUser.run("Michael Chen", "michael@example.com", "password", "alumni").lastInsertRowid;
  insertProfile.run(alumni2, 2020, "Mechanical Engineering", "Tesla", "Product Designer", "Focusing on sustainable energy solutions and industrial design.");

  const admin = insertUser.run("Admin User", "admin@example.com", "admin123", "admin").lastInsertRowid;
  insertProfile.run(admin, null, "Administration", null, "System Admin", "Platform administrator.");

  db.prepare("INSERT INTO events (title, description, date, location, created_by) VALUES (?, ?, ?, ?, ?)")
    .run("Annual Alumni Meet 2026", "Join us for the biggest networking event of the year. Reconnect with old friends and meet industry leaders.", "2026-03-15 18:00:00", "Main Auditorium", admin);
  
  db.prepare("INSERT INTO events (title, description, date, location, created_by) VALUES (?, ?, ?, ?, ?)")
    .run("Tech Innovation Workshop", "A hands-on workshop on the latest trends in AI and Machine Learning.", "2026-04-10 10:00:00", "Innovation Hub, Room 402", admin);

  db.prepare("INSERT INTO jobs (title, company, location, description, posted_by) VALUES (?, ?, ?, ?, ?)")
    .run("Frontend Developer", "Meta", "Remote", "Looking for a React expert to join our design systems team.", alumni1);
  
  db.prepare("INSERT INTO jobs (title, company, location, description, posted_by) VALUES (?, ?, ?, ?, ?)")
    .run("Data Analyst", "Amazon", "Seattle, WA", "Help us derive insights from massive datasets to improve customer experience.", alumni2);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API Routes ---

  // Auth
  app.post("/api/auth/register", (req, res) => {
    const { name, email, password, role } = req.body;
    try {
      const stmt = db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)");
      const result = stmt.run(name, email, password, role);
      const userId = result.lastInsertRowid;
      
      // Create empty profile
      db.prepare("INSERT INTO profiles (user_id) VALUES (?)").run(userId);
      
      res.json({ id: userId, name, email, role });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ? AND password = ?").get(email, password) as any;
    if (user) {
      res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  // Profiles
  app.get("/api/profiles/:userId", (req, res) => {
    const profile = db.prepare(`
      SELECT u.name, u.email, u.role, p.* 
      FROM users u 
      JOIN profiles p ON u.id = p.user_id 
      WHERE u.id = ?
    `).get(req.params.userId);
    res.json(profile);
  });

  app.get("/api/alumni", (req, res) => {
    const alumni = db.prepare(`
      SELECT u.id, u.name, p.department, p.graduation_year, p.company, p.position
      FROM users u
      JOIN profiles p ON u.id = p.user_id
      WHERE u.role = 'alumni'
    `).all();
    res.json(alumni);
  });

  app.put("/api/profiles/:userId", (req, res) => {
    const { graduation_year, department, company, position, bio, skills } = req.body;
    db.prepare(`
      UPDATE profiles 
      SET graduation_year = ?, department = ?, company = ?, position = ?, bio = ?, skills = ?
      WHERE user_id = ?
    `).run(graduation_year, department, company, position, bio, skills, req.params.userId);
    res.json({ success: true });
  });

  // Events
  app.get("/api/events", (req, res) => {
    const events = db.prepare("SELECT * FROM events ORDER BY date ASC").all();
    res.json(events);
  });

  app.post("/api/events", (req, res) => {
    const { title, description, date, location, created_by } = req.body;
    db.prepare("INSERT INTO events (title, description, date, location, created_by) VALUES (?, ?, ?, ?, ?)")
      .run(title, description, date, location, created_by);
    res.json({ success: true });
  });

  // Jobs
  app.get("/api/jobs", (req, res) => {
    const jobs = db.prepare("SELECT * FROM jobs ORDER BY created_at DESC").all();
    res.json(jobs);
  });

  app.post("/api/jobs", (req, res) => {
    const { title, company, location, description, posted_by } = req.body;
    db.prepare("INSERT INTO jobs (title, company, location, description, posted_by) VALUES (?, ?, ?, ?, ?)")
      .run(title, company, location, description, posted_by);
    res.json({ success: true });
  });

  // Mentorship
  app.post("/api/mentorship/request", (req, res) => {
    const { mentor_id, mentee_id } = req.body;
    db.prepare("INSERT INTO mentorships (mentor_id, mentee_id) VALUES (?, ?)")
      .run(mentor_id, mentee_id);
    res.json({ success: true });
  });

  app.get("/api/mentorship/requests/:userId", (req, res) => {
    const requests = db.prepare(`
      SELECT m.*, u.name as mentee_name
      FROM mentorships m
      JOIN users u ON m.mentee_id = u.id
      WHERE m.mentor_id = ? AND m.status = 'pending'
    `).all(req.params.userId);
    res.json(requests);
  });

  app.put("/api/mentorship/status", (req, res) => {
    const { id, status } = req.body;
    db.prepare("UPDATE mentorships SET status = ? WHERE id = ?").run(status, id);
    res.json({ success: true });
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
