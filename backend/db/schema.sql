-- AlumniConnect: Centralized Data Management Schema
-- Production Ready | PostgreSQL

-- 1. ENUMS & EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('student', 'alumni', 'faculty', 'admin', 'mentor');
    CREATE TYPE mentorship_status AS ENUM ('pending', 'accepted', 'rejected', 'completed');
    CREATE TYPE session_status AS ENUM ('upcoming', 'done', 'cancelled');
    CREATE TYPE event_type AS ENUM ('meetup', 'webinar', 'workshop', 'hackathon', 'career_fair', 'networking');
    CREATE TYPE event_status AS ENUM ('upcoming', 'live', 'completed', 'cancelled');
    CREATE TYPE job_type AS ENUM ('full_time', 'part_time', 'internship', 'contract');
    CREATE TYPE job_status AS ENUM ('open', 'closed');
    CREATE TYPE application_status AS ENUM ('applied', 'shortlisted', 'rejected', 'hired');
    CREATE TYPE achievement_type AS ENUM ('award', 'publication', 'promotion', 'startup', 'patent');
    CREATE TYPE campaign_status AS ENUM ('active', 'closed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- 3. ALUMNI PROFILES
CREATE TABLE IF NOT EXISTS alumni_profiles (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    graduation_year INTEGER NOT NULL,
    department VARCHAR(100) NOT NULL,
    degree VARCHAR(100),
    gpa NUMERIC(3,2),
    current_company VARCHAR(255),
    job_title VARCHAR(255),
    industry VARCHAR(100),
    city VARCHAR(100),
    country VARCHAR(100),
    linkedin_url TEXT,
    github_url TEXT,
    website_url TEXT,
    bio TEXT,
    skills TEXT[],
    achievements TEXT,
    resume_url TEXT,
    is_open_to_mentor BOOLEAN DEFAULT TRUE,
    profile_views INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. STUDENT PROFILES
CREATE TABLE IF NOT EXISTS student_profiles (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    enrollment_year INTEGER NOT NULL,
    department VARCHAR(100) NOT NULL,
    current_semester INTEGER,
    cgpa NUMERIC(3,2),
    career_interests TEXT[],
    skills TEXT[],
    resume_url TEXT
);

-- 5. MENTORSHIP REQUESTS
CREATE TABLE IF NOT EXISTS mentorship_requests (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    alumni_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    message TEXT,
    status mentorship_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP WITH TIME ZONE,
    session_notes TEXT
);

-- 6. MENTORSHIP SESSIONS
CREATE TABLE IF NOT EXISTS mentorship_sessions (
    id SERIAL PRIMARY KEY,
    request_id INTEGER REFERENCES mentorship_requests(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_mins INTEGER DEFAULT 30,
    meeting_link TEXT,
    student_feedback TEXT,
    alumni_feedback TEXT,
    status session_status DEFAULT 'upcoming'
);

-- 7. EVENTS
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type event_type NOT NULL,
    venue TEXT,
    meeting_link TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    capacity INTEGER,
    cover_image_url TEXT,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    status event_status DEFAULT 'upcoming',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. EVENT REGISTRATIONS
CREATE TABLE IF NOT EXISTS event_registrations (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    attended BOOLEAN DEFAULT FALSE,
    feedback TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    UNIQUE(event_id, user_id)
);

-- 9. JOB POSTINGS
CREATE TABLE IF NOT EXISTS job_postings (
    id SERIAL PRIMARY KEY,
    posted_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    description TEXT,
    requirements TEXT,
    type job_type NOT NULL,
    location VARCHAR(255),
    is_remote BOOLEAN DEFAULT FALSE,
    salary_range VARCHAR(100),
    deadline TIMESTAMP WITH TIME ZONE,
    status job_status DEFAULT 'open',
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. JOB APPLICATIONS
CREATE TABLE IF NOT EXISTS job_applications (
    id SERIAL PRIMARY KEY,
    job_id INTEGER REFERENCES job_postings(id) ON DELETE CASCADE,
    applicant_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    cover_letter TEXT,
    resume_url TEXT,
    status application_status DEFAULT 'applied',
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(job_id, applicant_id)
);

-- 11. MESSAGES
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    conversation_id UUID,
    sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(255),
    body TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    parent_id INTEGER REFERENCES messages(id),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_by_sender BOOLEAN DEFAULT FALSE,
    deleted_by_receiver BOOLEAN DEFAULT FALSE
);

-- 12. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT,
    reference_id INTEGER,
    reference_type VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. DONATION CAMPAIGNS
CREATE TABLE IF NOT EXISTS donation_campaigns (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    goal_amount NUMERIC(15,2) NOT NULL,
    raised_amount NUMERIC(15,2) DEFAULT 0,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP WITH TIME ZONE,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    status campaign_status DEFAULT 'active'
);

-- 14. DONATIONS
CREATE TABLE IF NOT EXISTS donations (
    id SERIAL PRIMARY KEY,
    donor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    campaign_id INTEGER REFERENCES donation_campaigns(id) ON DELETE CASCADE,
    amount NUMERIC(15,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    message TEXT,
    is_anonymous BOOLEAN DEFAULT FALSE,
    payment_ref VARCHAR(255),
    donated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    actor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id INTEGER,
    old_value JSONB,
    new_value JSONB,
    ip_address VARCHAR(45),
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. ALUMNI ACHIEVEMENTS
CREATE TABLE IF NOT EXISTS alumni_achievements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    achievement_type achievement_type NOT NULL,
    year INTEGER NOT NULL,
    verified_by_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 17. BATCH GROUPS & MEMBERS
CREATE TABLE IF NOT EXISTS batch_groups (
    id SERIAL PRIMARY KEY,
    graduation_year INTEGER NOT NULL,
    department VARCHAR(100) NOT NULL,
    group_name VARCHAR(255) NOT NULL,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS batch_members (
    batch_id INTEGER REFERENCES batch_groups(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (batch_id, user_id)
);

-- 18. ACHIEVEMENTS SYSTEM
CREATE TABLE IF NOT EXISTS achievements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    badge_key VARCHAR(100) NOT NULL,
    badge_name VARCHAR(255) NOT NULL,
    badge_desc TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, badge_key)
);

-- 19. TIMELINE CAPSULES
CREATE TABLE IF NOT EXISTS capsules (
    id SERIAL PRIMARY KEY,
    author_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    image_url TEXT,
    unlock_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_public BOOLEAN DEFAULT TRUE,
    is_revealed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 20. CONSENSUS NEXUS (POLLS)
CREATE TABLE IF NOT EXISTS polls (
    id SERIAL PRIMARY KEY,
    creator_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS poll_options (
    id SERIAL PRIMARY KEY,
    poll_id INTEGER REFERENCES polls(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS poll_votes (
    id SERIAL PRIMARY KEY,
    poll_id INTEGER REFERENCES polls(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    option_id INTEGER REFERENCES poll_options(id) ON DELETE CASCADE,
    voted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(poll_id, user_id)
);

-- 21. COMMS ENHANCEMENTS (CONVERSATIONS)
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user1_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    user2_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    last_message_id INTEGER,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user1_id, user2_id)
);

-- 22. AVAILABILITY & BOOKINGS
CREATE TABLE IF NOT EXISTS availability (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL, -- 0-6
    start_time TIME NOT NULL,
    end_time TIME NOT NULL
);

CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    mentor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    meeting_link TEXT
);

-- 23. PUSH SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL UNIQUE,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 24. YEARBOOK ENTRIES
CREATE TABLE IF NOT EXISTS yearbook_entries (
    id SERIAL PRIMARY KEY,
    batch_year INTEGER NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    quote TEXT,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 18. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_alumni_profiles_grad_year ON alumni_profiles(graduation_year);
CREATE INDEX IF NOT EXISTS idx_alumni_profiles_dept ON alumni_profiles(department);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_job_postings_deadline ON job_postings(deadline);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_polls_ends_at ON polls(ends_at);
CREATE INDEX IF NOT EXISTS idx_capsules_unlock_date ON capsules(unlock_date);

