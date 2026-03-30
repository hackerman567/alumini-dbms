export interface User {
  id: number;
  name: string;
  email: string;
  role: 'alumni' | 'student' | 'faculty' | 'admin';
}

export interface Profile extends User {
  user_id: number;
  graduation_year: number | null;
  department: string | null;
  company: string | null;
  position: string | null;
  bio: string | null;
  skills: string | null;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  created_by: number;
}

export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  description: string;
  posted_by: number;
  created_at: string;
}

export interface MentorshipRequest {
  id: number;
  mentor_id: number;
  mentee_id: number;
  mentee_name: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}
