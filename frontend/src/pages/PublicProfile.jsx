import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../api/client';
import { motion } from 'framer-motion';
import { 
    User, Mail, Briefcase, GraduationCap, 
    Shield, Globe, Github, Linkedin,
    Hexagon, Activity, Code, MessageSquare, ChevronLeft
} from 'lucide-react';

const PublicProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [alumni, setAlumni] = useState(null);
    const [loading, setLoading] = useState(true);
    const [achievements, setAchievements] = useState([]);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await client.get(`/alumni/${id}`);
                if (res.success) {
                    setAlumni(res.data);
                    
                    // Also fetch their achievements from leaderboard
                    try {
                        const achRes = await client.get('/achievements/leaderboard');
                        const leaderboard = Array.isArray(achRes?.data) ? achRes.data : [];
                        const myAch = leaderboard.find(u => u.id === parseInt(id));
                        setAchievements(myAch ? Array(parseInt(myAch.badge_count) || 0).fill({ name: 'Badge' }) : []);
                    } catch (achErr) {
                        console.warn("Could not fetch achievements for this entity", achErr);
                        setAchievements([]);
                    }
                }
            } catch (err) {
                console.error("Failed to load profile", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [id]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-56">
            <div className="w-16 h-16 md:w-20 md:h-20 portal-ring mb-5 md:mb-6 flex items-center justify-center">
                <div className="w-12 h-12 bg-[#00FFD1] rounded-full animate-pulse shadow-[0_0_20px_#00FFD1]"></div>
            </div>
            <span className="font-mono text-2xl text-[#00FFD1] animate-pulse uppercase tracking-normal font-black">Decrypting Identity...</span>
        </div>
    );

    if (!alumni) return (
        <div className="flex flex-col items-center justify-center py-56 text-center">
            <div className="w-32 h-32 rounded-full border-4 border-dashed border-white/10 flex items-center justify-center mb-8">
                <span className="font-display text-5xl text-white/10">?</span>
            </div>
            <h3 className="font-display text-3xl text-white/20 uppercase tracking-normal font-black mb-4">Identity Not Found</h3>
            <p className="font-mono text-white/10 text-lg uppercase tracking-normal font-black">This profile does not exist in the nexus.</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-16 pb-24 relative">
            <div className="scan-line"></div>
            
            <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-4 text-white/40 hover:text-[#00FFD1] transition-colors font-mono text-sm font-black uppercase tracking-normal mb-8"
            >
                <ChevronLeft size={20} /> RETURN TO DIRECTORY
            </button>

            {/* Profile Header */}
            <header className="relative quantum-card !p-0 overflow-hidden border-4 border-white/5 bg-black/40 rounded-3xl shadow-2xl">
                <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 md:p-8 relative z-10">
                    <div className="relative group">
                        <div className="w-56 h-56 rounded-2xl p-1.5 bg-gradient-to-tr from-[#00FFD1] via-[#BF00FF] to-[#00FFD1] shadow-2xl">
                            <div className="w-full h-full rounded-[2.8rem] bg-black overflow-hidden flex items-center justify-center">
                                {alumni.avatar_url ? (
                                    <img 
                                        src={alumni.avatar_url.startsWith('http') ? alumni.avatar_url : `${import.meta.env.VITE_API_BASE || ''}${alumni.avatar_url.startsWith('/') ? '' : '/'}${alumni.avatar_url}`} 
                                        alt="Profile" 
                                        className="w-full h-full object-cover" 
                                    />
                                ) : (
                                    <span className="font-display text-2xl md:text-3xl md:text-3xl md:text-4xl font-black text-white opacity-10">{alumni.name.charAt(0)}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-10">
                        <div className="space-y-4">
                            <div className={`inline-flex items-center gap-4 px-6 py-2 rounded-xl bg-white/5 border-2 border-white/5 font-mono text-sm tracking-normal uppercase font-black ${
                                alumni.role === 'mentor' ? 'text-amber-500 border-amber-500/20' : 
                                alumni.role === 'faculty' ? 'text-blue-500 border-blue-500/20' : 
                                'text-[#00FFD1] border-[#00FFD1]/20'
                            }`}>
                                <Shield size={16} /> {alumni.role} REGISTRY
                            </div>
                            <h1 className="text-2xl md:text-3xl lg:text-4xl font-display font-black text-white leading-none tracking-normaler uppercase">
                                {alumni.name}
                            </h1>
                        </div>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-8">
                            <span className="px-8 py-3 rounded-2xl bg-[#BF00FF]/10 border-2 border-[#BF00FF]/30 font-mono text-sm text-[#BF00FF] font-black uppercase tracking-normal shadow-lg">
                                {alumni.job_title} @ {alumni.current_company}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-8">
                        <button 
                            onClick={() => navigate(`/messages?user=${alumni.user_id}`)}
                            className="dimension-btn !px-16 !py-6 text-xl font-black uppercase tracking-normal shadow-2xl active:scale-95 flex items-center gap-4"
                        >
                            <MessageSquare size={24} />
                            <span>INITIATE SIGNAL</span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:p-6">
                <div className="lg:col-span-4 space-y-12">
                    <section className="quantum-card p-5 md:p-6 rounded-3xl border-4 border-white/5 shadow-2xl bg-black/40">
                        <h3 className="font-mono text-sm text-white/20 uppercase tracking-normal mb-5 md:mb-6 font-black">Professional Specs</h3>
                        <div className="space-y-10">
                            <SpecItem label="Department" value={alumni.department} />
                            <SpecItem label="Graduation" value={`Class of ${alumni.graduation_year}`} />
                            <SpecItem label="Profile Views" value={alumni.profile_views || 0} />
                        </div>
                    </section>
                </div>

                <div className="lg:col-span-8 space-y-12">
                    <section className="quantum-card p-6 md:p-8 rounded-[4.5rem] border-4 border-white/5 shadow-2xl bg-black/40">
                        <h3 className="font-mono text-sm text-white/20 uppercase tracking-normal mb-6 md:mb-8 font-black">Professional Biography</h3>
                        <p className="text-white/60 font-mono text-lg leading-relaxed uppercase tracking-normal font-black">
                            {alumni.bio || "This entity has not yet transmitted a professional biography to the Nexus."}
                        </p>
                    </section>

                    <section className="quantum-card p-6 md:p-8 rounded-[4.5rem] border-4 border-white/5 shadow-2xl bg-black/40">
                        <h3 className="font-mono text-sm text-white/20 uppercase tracking-normal mb-6 md:mb-8 font-black">Skill Matrix</h3>
                        <div className="flex flex-wrap gap-4">
                            {(Array.isArray(alumni.skills) ? alumni.skills : (alumni.skills || "").split(',')).filter(s => s && s.trim()).map(skill => (
                                <span key={skill} className="px-8 py-3 rounded-2xl bg-[#00FFD1]/5 border-2 border-[#00FFD1]/20 font-mono text-sm text-[#00FFD1] font-black uppercase tracking-normal shadow-lg">
                                    {skill.trim()}
                                </span>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

const SpecItem = ({ label, value }) => (
    <div className="group space-y-4">
        <div className="font-mono text-sm text-white/20 uppercase tracking-[0.3em] font-black group-hover:text-[#BF00FF] transition-colors">{label}</div>
        <div className="text-white font-display text-3xl font-black group-hover:translate-x-3 transition-transform duration-500 uppercase tracking-normal group-hover:text-[#00FFD1]">{value}</div>
    </div>
);

export default PublicProfile;
