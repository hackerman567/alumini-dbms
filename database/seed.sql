-- Dimensional Seed Data for Parallel Universe DBMS
-- All passwords are 'password123' hashed with bcrypt

INSERT INTO users (name, email, password, role) VALUES
('Xera Prime', 'admin@parallel.com', '$2b$10$nXBeeFaKkoEJdYDP4GtRgeiztA0bBjg7YgurUpJwrvGthhmHTvp6O', 'admin'),
('Nova Rayne', 'alumni@parallel.com', '$2b$10$nXBeeFaKkoEJdYDP4GtRgeiztA0bBjg7YgurUpJwrvGthhmHTvp6O', 'alumni'),
('Ion Kael', 'student@parallel.com', '$2b$10$nXBeeFaKkoEJdYDP4GtRgeiztA0bBjg7YgurUpJwrvGthhmHTvp6O', 'student'),
('Dr. Lyra Vox', 'faculty@parallel.com', '$2b$10$nXBeeFaKkoEJdYDP4GtRgeiztA0bBjg7YgurUpJwrvGthhmHTvp6O', 'faculty'),
('Mentor Sage', 'mentor@parallel.com', '$2b$10$nXBeeFaKkoEJdYDP4GtRgeiztA0bBjg7YgurUpJwrvGthhmHTvp6O', 'mentor');

INSERT INTO profiles (user_id, graduation_year, department, company, position, bio, skills) VALUES
(1, 2015, 'Temporal Systems', 'Omnicorp Dynamics', 'System Architect', 'Overseeing dimensional stability and database integrity.', 'PostgreSQL, Node.js, Quantum Computing'),
(2, 2018, 'Neural Engineering', 'Synapse Labs', 'Principal Researcher', 'Researching neural interfaces and reactive backgrounds.', 'React, Framer Motion, AI'),
(3, 2026, 'Cybernetics', 'N/A', 'Student', 'Learning to navigate the parallel development universe.', 'TypeScript, CSS, Lucide'),
(4, 2010, 'Quantum Informatics', 'Parallel University', 'Head of Department', 'Lecturing on the fundamentals of agentic coding and DBMS.', 'SQL, DBMS, Theory');

INSERT INTO events (title, description, date, location, created_by) VALUES
('Quantum Networking Gala', 'A high-frequency gathering for alumni to synchronize career trajectories.', '2026-06-15 18:00:00+00', 'The Void Pavilion', 1),
('Neural UI Workshop', 'Deep dive into reactive canvas backgrounds and immersive transitions.', '2026-07-20 10:00:00+00', 'Sector 7 Hub', 2),
('Cybernetic Career Fair', 'Discover new job rifts and career paths in the current sector.', '2026-08-05 09:00:00+00', 'Virtual Nexus', 1);

INSERT INTO jobs (title, company, location, description, posted_by) VALUES
('Dimensional Architect', 'Omnicorp Dynamics', 'Mars Sector 4', 'Lead the design of multi-verse database systems.', 1),
('Neural Interface Developer', 'Synapse Labs', 'Remote (Dimension X)', 'Create immersive UI experiences for neural-linked users.', 2),
('Security Protocol Officer', 'Parallel University', 'Local Node', 'Ensure system defense remains active across all sectors.', 4);

INSERT INTO mentorships (mentor_id, mentee_id, status) VALUES
(2, 3, 'pending');
