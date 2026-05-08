-- AlumniConnect: Realistic "Live" Starting Data
-- All passwords hashed for: Admin@123, Alumni@123, Student@123, Faculty@123

INSERT INTO users (name, email, password_hash, role, is_verified) VALUES
('System Administrator', 'admin@alumni.edu', '$2b$12$Zvj0sfJrwgvUruYXd3e.MegBJpL5bZ8kg/TM36bjiIn5nT86aNX0G', 'admin', true),
('Dr. Aris Thorne', 'faculty@alumni.edu', '$2b$12$JXMnRwmqxn4jrTnBB8H7V.2oGFHODQGjHS0ot.fB4dCxwzTrLODqe', 'faculty', true),
('Sarah Jenkins', 'sarah.j@techcorp.com', '$2b$12$qrbMtoVBA1oYll/gp3Sr6.rGwbCE5vv/Wka5etm4MwiThvpWCahjm', 'alumni', true),
('David Chen', 'd.chen@innovate.io', '$2b$12$qrbMtoVBA1oYll/gp3Sr6.rGwbCE5vv/Wka5etm4MwiThvpWCahjm', 'alumni', true),
('Emily Rodriguez', 'emily.r@globaldesign.com', '$2b$12$qrbMtoVBA1oYll/gp3Sr6.rGwbCE5vv/Wka5etm4MwiThvpWCahjm', 'alumni', true),
('Jason Bourne', 'jason.b@security.net', '$2b$12$qrbMtoVBA1oYll/gp3Sr6.rGwbCE5vv/Wka5etm4MwiThvpWCahjm', 'alumni', true),
('Alice Wonderland', 'alice@student.edu', '$2b$12$RxNU.iJnm7c6PpdGKiKjmuOX6oschG1/t/whRKw6L9o./0fzRuCXS', 'student', true),
('Bob Builder', 'bob@student.edu', '$2b$12$RxNU.iJnm7c6PpdGKiKjmuOX6oschG1/t/whRKw6L9o./0fzRuCXS', 'student', true);

-- Alumni Profiles
INSERT INTO alumni_profiles (user_id, graduation_year, department, current_company, job_title, industry, is_open_to_mentor, skills) VALUES
(3, 2018, 'Computer Science', 'TechCorp', 'Senior Engineer', 'Software', true, ARRAY['React', 'Node.js', 'PostgreSQL']),
(4, 2015, 'Mechanical Engineering', 'Innovate IO', 'Product Manager', 'Manufacturing', true, ARRAY['Agile', 'CAD', 'Leadership']),
(5, 2020, 'Digital Arts', 'Global Design', 'UI/UX Lead', 'Design', true, ARRAY['Figma', 'User Research', 'Adobe Suite']),
(6, 2012, 'Cyber Security', 'Security.net', 'CTO', 'Defense', false, ARRAY['Pen-testing', 'CISO', 'Blockchain']);

-- Student Profiles
INSERT INTO student_profiles (user_id, enrollment_year, department, current_semester, cgpa, career_interests) VALUES
(7, 2022, 'Computer Science', 6, 3.85, ARRAY['Web Development', 'AI']),
(8, 2023, 'Mechanical Engineering', 4, 3.60, ARRAY['Robotics', 'Automotive']);

-- Events
INSERT INTO events (title, description, event_type, venue, start_time, end_time, capacity, created_by, status) VALUES
('Annual Alumni Meetup 2026', 'Networking dinner for all batches.', 'meetup', 'Grand Ballroom', '2026-06-15 18:00:00', '2026-06-15 22:00:00', 200, 1, 'upcoming'),
('Tech Webinar: React 19', 'Deep dive into the latest React features.', 'webinar', 'Zoom Link', '2026-05-10 14:00:00', '2026-05-10 16:00:00', 500, 2, 'upcoming');

-- Job Postings
INSERT INTO job_postings (posted_by, title, company, description, type, location, is_remote, salary_range) VALUES
(3, 'Full Stack Developer', 'TechCorp', 'Join our core team building scalable solutions.', 'full_time', 'San Francisco', true, '$120k - $150k'),
(5, 'UI Design Intern', 'Global Design', 'Great opportunity for students to learn modern UX.', 'internship', 'New York', false, '$25/hr');

-- Donation Campaigns
INSERT INTO donation_campaigns (title, description, goal_amount, created_by) VALUES
('New Library Wing', 'Help us build a state-of-the-art learning center.', 500000.00, 1),
('Student Scholarship 2026', 'Supporting underprivileged bright minds.', 100000.00, 1);

-- Achievements
INSERT INTO achievements (user_id, badge_key, badge_name, badge_desc) VALUES
(3, 'PORTAL_PIONEER', 'Portal Pioneer', 'Opened your first Opportunity Portal (Job).'),
(3, 'NEXUS_NODE', 'Nexus Node', 'Established 5 successful connections.'),
(3, 'TIMELINE_ANCHOR', 'Timeline Anchor', 'Completed your profile to 100%.'),
(4, 'PORTAL_PIONEER', 'Portal Pioneer', 'Opened your first Opportunity Portal (Job).'),
(4, 'TIMELINE_ANCHOR', 'Timeline Anchor', 'Completed your profile to 100%.'),
(5, 'TIMELINE_ANCHOR', 'Timeline Anchor', 'Completed your profile to 100%.'),
(7, 'SIGNAL_MASTER', 'Signal Master', 'Sent 10 mentorship requests.'),
(8, 'VOID_EXPLORER', 'Void Explorer', 'Logged in 30 days straight.');

-- Polls & Options
INSERT INTO polls (id, creator_id, question, ends_at) VALUES 
(1, 1, 'Should we organize a virtual hackathon next month?', '2026-12-31 23:59:59'),
(2, 6, 'What technology should we focus on for the next webinar?', '2026-12-31 23:59:59');

INSERT INTO poll_options (poll_id, option_text) VALUES 
(1, 'Yes, absolutely!'), (1, 'No, maybe next semester.'),
(2, 'React & Next.js'), (2, 'Machine Learning & AI'), (2, 'Cybersecurity Basics');

-- Time Capsules
INSERT INTO capsules (author_id, title, body, unlock_date, is_public, is_revealed) VALUES 
(3, 'To the Batch of 2030', 'Always keep learning and adapting. The tech world moves fast!', '2030-01-01 00:00:00', true, false),
(7, 'My Freshman Year', 'Survived the first year! Hoping to get a great internship soon.', '2028-06-01 00:00:00', true, false);

-- Mentorship Requests
INSERT INTO mentorship_requests (student_id, alumni_id, message, status) VALUES 
(7, 3, 'Hi Sarah, Id love to get your advice on becoming a Full Stack Developer.', 'pending'),
(8, 4, 'Hello David, your career in manufacturing is inspiring. Can we chat?', 'accepted');

-- Messages & Conversations
DO $$ 
DECLARE 
    conv1_id UUID;
    conv2_id UUID;
BEGIN
    -- Conversation between Sarah (3) and Alice (7)
    INSERT INTO conversations (user1_id, user2_id) VALUES (3, 7) RETURNING id INTO conv1_id;
    INSERT INTO messages (conversation_id, sender_id, receiver_id, body) VALUES 
    (conv1_id, 3, 7, 'Hi Alice! Sure, I would love to chat. Let us schedule a call next week.');
    
    -- Conversation between Admin (1) and Bob (8)
    INSERT INTO conversations (user1_id, user2_id) VALUES (1, 8) RETURNING id INTO conv2_id;
    INSERT INTO messages (conversation_id, sender_id, receiver_id, body) VALUES 
    (conv2_id, 1, 8, 'Hello Bob, welcome to AlumniConnect! Explore the job board for opportunities.');
    
    -- Update last_message_id
    UPDATE conversations SET last_message_id = (SELECT id FROM messages WHERE conversation_id = conv1_id ORDER BY sent_at DESC LIMIT 1) WHERE id = conv1_id;
    UPDATE conversations SET last_message_id = (SELECT id FROM messages WHERE conversation_id = conv2_id ORDER BY sent_at DESC LIMIT 1) WHERE id = conv2_id;
END $$;

-- Notifications
INSERT INTO notifications (user_id, type, title, body) VALUES 
(7, 'mentorship', 'Mentorship Accepted', 'Sarah Jenkins has accepted your mentorship request.'),
(3, 'system', 'Profile Verified', 'Your alumni profile has been verified by the administrator.');
