import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    User, Mail, Briefcase, GraduationCap, 
    Save, Camera, Shield, Zap, Globe, Github, Linkedin,
    Hexagon, Activity, Cpu, Code, BookOpen
} from 'lucide-react';

const Profile = () => {
    const { user, updateProfile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [achievements, setAchievements] = useState([]);
    const [allBadges, setAllBadges] = useState([]);

    // API URL Resolver for Avatars
    const getAvatarSrc = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        const base = import.meta.env.VITE_API_BASE || '';
        return `${base}${path}`;
    };

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                bio: user.profile?.bio || '',
                skills: user.profile?.skills || [],
                department: user.profile?.department || '',
                current_company: user.profile?.current_company || user.profile?.company || '',
                job_title: user.profile?.job_title || '',
                graduation_year: user.profile?.graduation_year || '',
                enrollment_year: user.profile?.enrollment_year || ''
            });
        }
    }, [user]);

    useEffect(() => {
        const fetchAchievements = async () => {
            try {
                const res = await client.get('/achievements/me');
                if (res && res.success) {
                    setAchievements(res.data || []);
                    setAllBadges(res.data?.all_badges || []);
                }
            } catch (err) {
                console.error("Failed to load achievements", err);
            }
        };
        if (user) fetchAchievements();
    }, [user]);

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // TC24 & TC25 Validation
        if (file.size > 2 * 1024 * 1024) {
            return alert("Error: 'File size must be under 2MB.'");
        }
        if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type.toLowerCase())) {
            return alert("Error: 'Only JPG and PNG files are accepted.'");
        }

        setUploading(true);
        const data = new FormData();
        data.append('avatar', file);

        try {
            // Note: client (axios) is configured to return res.data directly
            const res = await client.post('/users/avatar', data);
            
            if (res && (res.success || res.avatar_url)) {
                // Fetch fresh profile to ensure state is consistent
                const fresh = await client.get('/users/profile/me');
                if (fresh && fresh.success) {
                    updateProfile(fresh.data);
                    alert("Success: Profile picture updated across timelines.");
                }
            }
        } catch (err) {
            console.error("Avatar Upload Error:", err);
            alert("Failed to upload avatar. Please check file type and try again.");
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        
        // TC23: Email Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            return alert("Error: 'Invalid email format.'");
        }

        setLoading(true);
        try {
            const res = await client.put('/users/profile/update', formData);
            if (res && (res.success || res.message)) {
                const fresh = await client.get('/users/profile/me');
                if (fresh && fresh.success) {
                    updateProfile(fresh.data);
                    setIsEditing(false);
                    alert("Success alert shown. Updated values persist after page refresh.");
                }
            }
        } catch (err) {
            console.error("Save Error:", err);
            alert("Failed to update profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!user || !user.role) return (
        <div className="flex flex-col items-center justify-center py-56">
            <div className="w-16 h-16 md:w-20 md:h-20 portal-ring mb-5 md:mb-6 flex items-center justify-center">
                <div className="w-12 h-12 bg-[#BF00FF] rounded-full animate-pulse shadow-[0_0_20px_#BF00FF]"></div>
            </div>
            <span className="font-mono text-2xl text-[#BF00FF] animate-pulse uppercase tracking-normal font-black">Syncing Identity...</span>
        </div>
    );

    const getStrength = () => {
        try {
            const role = user.role?.toLowerCase() || 'student';
            const prof = user.profile || {};
            const fields = (role === 'alumni' || role === 'mentor')
                ? ['name', 'email', 'avatar_url', 'bio', 'skills', 'department', 'graduation_year', 'current_company', 'job_title']
                : ['name', 'email', 'avatar_url', 'skills', 'department', 'enrollment_year'];
            
            const data = { ...user, ...prof };
            const filled = fields.filter(f => {
                const val = data[f];
                if (!val) return false;
                if (Array.isArray(val)) return val.length > 0;
                if (typeof val === 'string') return val.trim().length > 0;
                return true;
            }).length;
            return Math.round((filled / (fields.length || 1)) * 100);
        } catch (e) {
            return 0;
        }
    };

    const strength = getStrength();

    return (
        <div className="max-w-7xl mx-auto space-y-16 pb-24 relative">
            <div className="scan-line"></div>
            
            {/* Profile Header */}
            <header className="relative quantum-card !p-0 overflow-hidden border-4 border-white/5 bg-black/40 rounded-3xl shadow-2xl">
                <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 md:p-8 relative z-10">
                    <div className="relative group">
                        <div className="w-56 h-56 rounded-2xl p-1.5 bg-gradient-to-tr from-[#00FFD1] via-[#BF00FF] to-[#00FFD1] shadow-2xl transition-transform duration-500 hover:rotate-2">
                            <div className="w-full h-full rounded-[2.8rem] bg-black overflow-hidden flex items-center justify-center relative">
                                {user.avatar_url ? (
                                    <img 
                                        src={getAvatarSrc(user.avatar_url)} 
                                        alt="Profile" 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                    />
                                ) : (
                                    <span className="font-display text-2xl md:text-3xl md:text-4xl font-black text-white opacity-10">{(user.name || 'U').charAt(0)}</span>
                                )}
                                
                                <label className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-xl">
                                    <Camera size={48} className="text-[#00FFD1] mb-4" />
                                    <span className="font-mono text-sm text-white font-black uppercase tracking-normal">{uploading ? 'UPLOADING...' : 'CHANGE PHOTO'}</span>
                                    <input type="file" className="hidden" onChange={handleAvatarUpload} />
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-10">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-4 px-6 py-2 rounded-xl bg-cyan-500/5 border-2 border-white/5 font-mono text-sm text-[#00FFD1] tracking-normal uppercase font-black">
                                <Shield size={16} /> VERIFIED ACCOUNT
                            </div>
                            <h1 className="text-2xl md:text-3xl md:text-4xl font-display font-black text-white leading-none tracking-normaler uppercase">
                                {user.name || 'ANONYMOUS USER'}
                            </h1>
                        </div>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-8">
                            <span className="px-8 py-3 rounded-2xl bg-[#BF00FF]/10 border-2 border-[#BF00FF]/30 font-mono text-sm text-[#BF00FF] font-black uppercase tracking-normal shadow-lg">
                                {user.role?.toUpperCase()}
                            </span>
                            <span className="font-mono text-xl text-white/40 flex items-center gap-4 font-black uppercase tracking-normal">
                                <GraduationCap size={28} className="text-white/20" />
                                BATCH: {user.profile?.graduation_year || user.profile?.enrollment_year || 'N/A'} • {user.profile?.department || 'GENERAL'}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-8">
                        <button 
                            onClick={() => setIsEditing(!isEditing)}
                            className={`dimension-btn ${isEditing ? '!border-red-500/40 !text-red-500' : ''} !px-16 !py-6 text-xl font-black uppercase tracking-normal shadow-2xl active:scale-95`}
                        >
                            {isEditing ? 'CANCEL' : 'EDIT PROFILE'}
                        </button>
                    </div>
                </div>
            </header>

            <AnimatePresence mode="wait">
                {isEditing ? (
                    <motion.form 
                        key="edit"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        onSubmit={handleSave}
                        className="quantum-card space-y-16 p-6 md:p-8 rounded-3xl border-4 border-white/5 shadow-2xl bg-black/40"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:p-8">
                            <div className="space-y-12">
                                <InputField label="FULL NAME" icon={<User />} value={formData.name || ''} onChange={(val) => setFormData({...formData, name: val})} />
                                <InputField label="EMAIL ADDRESS" icon={<Mail />} value={formData.email || ''} onChange={(val) => setFormData({...formData, email: val})} />
                            </div>
                            <div className="space-y-12">
                                <InputField label="CURRENT ORGANIZATION" icon={<Briefcase />} value={formData.current_company || ''} placeholder="Company / Startup" onChange={(val) => setFormData({...formData, current_company: val})} />
                                <InputField label="DEPARTMENT / STREAM" icon={<Code />} value={formData.department || ''} onChange={(val) => setFormData({...formData, department: val})} />
                            </div>
                        </div>

                        <div className="px-8 space-y-4">
                            <label className="font-mono text-sm text-white/20 uppercase tracking-[0.4em] font-black">BIO / MISSION DATA</label>
                            <textarea 
                                className="w-full bg-black border-4 border-white/5 rounded-xl p-8 text-xl text-white font-mono uppercase tracking-normal focus:border-[#BF00FF]/30 focus:outline-none transition-all h-32"
                                value={formData.bio || ''}
                                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                placeholder="Enter your mission summary..."
                            />
                        </div>

                        <div className="px-8 space-y-8">
                            <label className="font-mono text-sm text-white/20 uppercase tracking-[0.4em] font-black">SKILL PARAMETERS</label>
                            <div className="flex flex-wrap gap-4">
                                {(Array.isArray(formData.skills) ? formData.skills : (formData.skills || "").split(',')).filter(s => s && s.trim()).map(skill => (
                                    <div key={skill} className="flex items-center gap-3 px-6 py-3 rounded-xl bg-[#00FFD1]/10 border-2 border-[#00FFD1]/20 text-[#00FFD1] font-mono font-black">
                                        {skill.trim()}
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                const currentSkills = Array.isArray(formData.skills) ? formData.skills : (formData.skills || "").split(',').filter(s => s.trim());
                                                const newSkills = currentSkills.filter(s => s.trim() !== skill.trim()).join(',');
                                                setFormData({...formData, skills: newSkills});
                                            }}
                                            className="hover:text-red-500 transition-colors"
                                        >
                                            X
                                        </button>
                                    </div>
                                ))}
                                <button 
                                    type="button"
                                    onClick={() => {
                                        const newSkill = prompt("ENTER NEW PARAMETER:");
                                        if (newSkill) {
                                            const currentSkills = Array.isArray(formData.skills) ? formData.skills : (formData.skills || "").split(',').filter(s => s.trim());
                                            const newSkills = [...currentSkills, newSkill].join(',');
                                            setFormData({...formData, skills: newSkills});
                                        }
                                    }}
                                    className="px-6 py-3 rounded-xl border-2 border-dashed border-white/10 text-white/40 hover:border-[#00FFD1]/40 hover:text-[#00FFD1] transition-all font-mono font-black uppercase text-sm"
                                >
                                    + ADD PARAMETER
                                </button>
                            </div>
                        </div>

                        <div className="pt-16 border-t-4 border-white/5">
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="dimension-btn w-full !py-8 gap-8 text-2xl font-black uppercase tracking-normal shadow-2xl active:scale-95"
                            >
                                {loading ? <span>SYNCHRONIZING...</span> : <span>SYNC ACROSS TIMELINES</span>}
                            </button>
                        </div>
                    </motion.form>
                ) : (
                    <motion.div 
                        key="view"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:p-6"
                    >
                        <div className="lg:col-span-4 space-y-12">
                            <section className="quantum-card p-5 md:p-6 rounded-3xl border-4 border-white/5 shadow-2xl bg-black/40">
                                <h3 className="font-mono text-sm text-white/20 uppercase tracking-normal mb-5 md:mb-6 font-black">Social Connections</h3>
                                <div className="space-y-10">
                                    <SocialLink icon={<Globe />} label="Website" value="praveen.me" color="#00FFD1" />
                                    <SocialLink icon={<Github />} label="GitHub" value="github.com/praveen" color="#ffffff" />
                                    <SocialLink icon={<Linkedin />} label="LinkedIn" value="linkedin.com/praveen" color="#00A0DC" />
                                </div>
                            </section>

                            <section className="quantum-card p-5 md:p-6 rounded-3xl border-4 border-white/5 shadow-2xl bg-black/40">
                                <h3 className="font-mono text-sm text-white/20 uppercase tracking-normal mb-5 md:mb-6 font-black flex items-center gap-4">
                                    <BookOpen size={16} /> Identity Summary
                                </h3>
                                <p className="text-xl text-white/60 font-mono uppercase tracking-normal leading-relaxed">
                                    {user.profile?.bio || 'No mission summary recorded yet.'}
                                </p>
                            </section>

                            <section className="quantum-card bg-cyan-500/5 border-4 border-white/5 p-5 md:p-6 rounded-3xl shadow-2xl">
                                <h3 className="font-display text-sm font-black text-[#00FFD1] uppercase tracking-normal mb-8">Profile Strength</h3>
                                <div className="flex items-end gap-4">
                                    <div className="text-4xl md:text-3xl font-display font-black text-white leading-none">{strength}</div>
                                    <div className="font-mono text-2xl text-[#00FFD1] mb-2 font-black">%</div>
                                </div>
                                <div className="mt-10 w-full h-5 bg-black border-4 border-white/5 rounded-full overflow-hidden p-1 shadow-inner">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${strength}%` }}
                                        className="h-full bg-gradient-to-r from-[#00FFD1] via-[#BF00FF] to-[#00FFD1] rounded-full shadow-[0_0_20px_#00FFD1]"
                                    ></motion.div>
                                </div>
                            </section>
                        </div>

                        <div className="lg:col-span-8 space-y-12">
                            <section className="quantum-card p-6 md:p-8 rounded-[4.5rem] border-4 border-white/5 shadow-2xl bg-black/40">
                                <h3 className="font-mono text-sm text-white/20 uppercase tracking-normal mb-6 md:mb-8 font-black">Account Overview</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:p-8">
                                    <SpecItem label="Display Name" value={user.name || 'N/A'} />
                                    <SpecItem label="Primary Email" value={user.email || 'N/A'} />
                                    <SpecItem label="Stream & Batch" value={`${user.profile?.department || 'GENERAL'} • Class of ${user.profile?.graduation_year || user.profile?.enrollment_year || 'N/A'}`} />
                                    <SpecItem label="Current Organization" value={user.profile?.current_company || user.profile?.company || 'Private'} />
                                    <SpecItem label="Account Type" value={(user.role || 'USER').toUpperCase()} />
                                    <SpecItem label="Sync Status" value="Profile Verified" />
                                </div>
                            </section>

                            <section className="quantum-card p-6 md:p-8 rounded-[4.5rem] border-4 border-white/5 shadow-2xl bg-black/40">
                                <div className="flex justify-between items-center mb-6 md:mb-8">
                                    <div className="space-y-4">
                                        <h3 className="font-display text-4xl font-black text-white uppercase tracking-normal leading-none group-hover:text-[#00FFD1] transition-colors">Platform Badges</h3>
                                        <p className="font-mono text-sm text-white/20 uppercase tracking-normal font-black">Your community milestones</p>
                                    </div>
                                    <div className="px-8 py-3 rounded-2xl bg-cyan-500/5 border-4 border-white/5 font-mono text-2xl text-[#00FFD1] font-black shadow-xl">{(achievements || []).length} / {(allBadges || []).length}</div>
                                </div>
                                
                                <div className="grid grid-cols-3 md:grid-cols-5 gap-6 md:p-8">
                                    {(allBadges || []).map((badge) => {
                                        const isUnlocked = (achievements || []).some(a => a.badge_key === badge.key);
                                        return (
                                            <div key={badge.key} className="flex flex-col items-center group relative">
                                                <div className={`w-28 h-28 relative transition-all duration-500 ${isUnlocked ? 'hover:scale-110' : 'opacity-10 grayscale blur-[1px]'}`}>
                                                    <Hexagon size={112} className={`absolute inset-0 ${isUnlocked ? 'text-[#00FFD1] fill-cyan-500/5' : 'text-white/10'}`} strokeWidth={1.5} />
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <Zap size={40} className={isUnlocked ? 'text-[#00FFD1] drop-shadow-[0_0_10px_#00FFD1]' : 'text-white/10'} />
                                                    </div>
                                                </div>
                                                <span className={`mt-8 font-mono text-sm font-black uppercase tracking-normal text-center ${isUnlocked ? 'text-white/40' : 'text-white/10'}`}>
                                                    {isUnlocked ? badge.name : 'LOCKED'}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const InputField = ({ label, icon, value, placeholder, onChange }) => (
    <div className="space-y-4 group">
        <label className="font-mono text-sm text-white/20 uppercase tracking-[0.4em] font-black group-focus-within:text-[#00FFD1] transition-colors">{label}</label>
        <div className="relative">
            <div className="absolute left-8 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-[#00FFD1] transition-all group-focus-within:scale-110">
                {React.cloneElement(icon, { size: 28 })}
            </div>
            <input 
                className="w-full bg-black border-4 border-white/5 rounded-xl py-8 pl-24 pr-10 text-xl text-white font-black uppercase tracking-normal focus:border-[#00FFD1]/30 focus:outline-none transition-all placeholder:text-slate-900 shadow-inner"
                value={value}
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    </div>
);

const SpecItem = ({ label, value }) => (
    <div className="group space-y-4">
        <div className="font-mono text-sm text-white/20 uppercase tracking-[0.3em] font-black group-hover:text-[#BF00FF] transition-colors">{label}</div>
        <div className="text-white font-display text-3xl font-black group-hover:translate-x-3 transition-transform duration-500 uppercase tracking-normal group-hover:text-[#00FFD1]">{value}</div>
    </div>
);

const SocialLink = ({ icon, label, value, color }) => (
    <div className="flex items-center gap-8 group cursor-pointer">
        <div className="w-16 h-16 rounded-2xl bg-black border-4 border-white/5 flex items-center justify-center text-white/10 group-hover:text-[var(--s-color)] group-hover:border-[var(--s-color)]/30 group-hover:scale-110 transition-all shadow-xl" style={{ '--s-color': color }}>
            {React.cloneElement(icon, { size: 32 })}
        </div>
        <div className="space-y-1">
            <div className="font-mono text-sm text-white/20 uppercase tracking-[0.3em] font-black">{label}</div>
            <div className="text-xl text-white/40 group-hover:text-white transition-colors font-black font-mono uppercase tracking-normaler">{value}</div>
        </div>
    </div>
);

export default Profile;
