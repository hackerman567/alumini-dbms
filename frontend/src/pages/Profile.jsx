import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    User, Mail, Briefcase, GraduationCap, 
    Save, Camera, Shield, Zap, Globe, Github, Linkedin,
    Hexagon, Activity, Cpu, Code
} from 'lucide-react';

const Profile = () => {
    const { user, updateProfile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ ...user });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [achievements, setAchievements] = useState([]);
    const [allBadges, setAllBadges] = useState([]);

    useEffect(() => {
        const fetchAchievements = async () => {
            try {
                const res = await client.get('/achievements/me');
                if (res.data.success) {
                    setAchievements(res.data.data);
                    setAllBadges(res.data.all_badges);
                }
            } catch (err) {
                console.error("Failed to load achievements", err);
            }
        };
        fetchAchievements();
    }, []);

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const data = new FormData();
        data.append('avatar', file);

        try {
            const res = await client.post('/users/avatar', data);
            updateProfile({ ...user, avatar_url: res.data.avatar_url });
        } catch (err) {
            alert("Failed to upload avatar. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await client.put('/users/profile/update', formData);
            if (res.data.success) {
                const fresh = await client.get('/users/profile/me');
                updateProfile(fresh.data.data);
                setIsEditing(false);
            }
        } catch (err) {
            alert("Failed to update profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-16 pb-24 relative">
            <div className="scan-line"></div>
            
            {/* Profile Header */}
            <header className="relative quantum-card !p-0 overflow-hidden border-4 border-white/5 bg-black/40 rounded-[4rem] shadow-2xl">
                <div className="p-16 flex flex-col md:flex-row items-center gap-16 relative z-10">
                    {/* Avatar Selection */}
                    <div className="relative group">
                        <div className="w-56 h-56 rounded-[3rem] p-1.5 bg-gradient-to-tr from-[#00FFD1] via-[#BF00FF] to-[#00FFD1] shadow-2xl transition-transform duration-500 hover:rotate-2">
                            <div className="w-full h-full rounded-[2.8rem] bg-black overflow-hidden flex items-center justify-center relative">
                                {user.avatar_url ? (
                                    <img 
                                        src={`${import.meta.env.VITE_API_BASE}${user.avatar_url}`} 
                                        alt="Profile" 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                    />
                                ) : (
                                    <span className="font-display text-8xl font-black text-white opacity-10">{user.name.charAt(0)}</span>
                                )}
                                
                                <label className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-xl">
                                    <Camera size={48} className="text-[#00FFD1] mb-4" />
                                    <span className="font-mono text-xs text-white font-black uppercase tracking-widest">{uploading ? 'UPLOADING...' : 'CHANGE PHOTO'}</span>
                                    <input type="file" className="hidden" onChange={handleAvatarUpload} />
                                </label>
                            </div>
                        </div>
                        {uploading && (
                            <div className="absolute -inset-3 border-4 border-[#00FFD1] border-t-transparent rounded-[4rem] animate-spin"></div>
                        )}
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-10">
                        <div className="space-y-4">
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="inline-flex items-center gap-4 px-6 py-2 rounded-xl bg-cyan-500/5 border-2 border-white/5 font-mono text-xs text-[#00FFD1] tracking-widest uppercase font-black"
                            >
                                <Shield size={16} /> VERIFIED ACCOUNT
                            </motion.div>
                            <motion.h1 
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-8xl font-display font-black text-white leading-none tracking-tighter uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                            >
                                {user.name}
                            </motion.h1>
                        </div>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-8">
                            <span className="px-8 py-3 rounded-2xl bg-[#BF00FF]/10 border-2 border-[#BF00FF]/30 font-mono text-sm text-[#BF00FF] font-black uppercase tracking-widest shadow-lg">
                                {user.role}
                            </span>
                            <span className="font-mono text-xl text-white/40 flex items-center gap-4 font-black uppercase tracking-tight">
                                <GraduationCap size={28} className="text-white/20" />
                                BATCH: {user.graduation_year || user.enrollment_year} • {user.department}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-8">
                        <button 
                            onClick={() => setIsEditing(!isEditing)}
                            className={`dimension-btn ${isEditing ? '!border-red-500/40 !text-red-500' : ''} !px-16 !py-6 text-xl font-black uppercase tracking-widest shadow-2xl active:scale-95`}
                        >
                            {isEditing ? 'CANCEL' : 'EDIT PROFILE'}
                        </button>
                    </div>
                </div>

                <div className="absolute right-0 bottom-0 p-16 opacity-5 rotate-12">
                    <Activity size={320} strokeWidth={0.5} className="text-white" />
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
                        className="quantum-card space-y-16 !p-16 rounded-[4rem] border-4 border-white/5 shadow-2xl bg-black/40"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                            <div className="space-y-12">
                                <InputField label="FULL NAME" icon={<User />} value={formData.name} onChange={(val) => setFormData({...formData, name: val})} />
                                <InputField label="EMAIL ADDRESS" icon={<Mail />} value={formData.email} onChange={(val) => setFormData({...formData, email: val})} />
                            </div>
                            <div className="space-y-12">
                                <InputField label="CURRENT ORGANIZATION" icon={<Briefcase />} value={formData.company || ''} placeholder="Company / Startup" onChange={(val) => setFormData({...formData, company: val})} />
                                <InputField label="DEPARTMENT / STREAM" icon={<Code />} value={formData.department} onChange={(val) => setFormData({...formData, department: val})} />
                            </div>
                        </div>

                        <div className="pt-16 border-t-4 border-white/5">
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="dimension-btn w-full !py-8 gap-8 text-2xl font-black uppercase tracking-widest shadow-2xl active:scale-95"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-10 h-10 portal-ring flex items-center justify-center">
                                            <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
                                        </div>
                                        <span>SYNCHRONIZING...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save size={32} />
                                        <span>SAVE CHANGES</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.form>
                ) : (
                    <motion.div 
                        key="view"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-12"
                    >
                        <div className="lg:col-span-4 space-y-12">
                            <section className="quantum-card !p-12 rounded-[3.5rem] border-4 border-white/5 shadow-2xl bg-black/40">
                                <h3 className="font-mono text-xs text-white/20 uppercase tracking-widest mb-12 font-black">Social Connections</h3>
                                <div className="space-y-10">
                                    <SocialLink icon={<Globe />} label="Website" value="praveen.me" color="#00FFD1" />
                                    <SocialLink icon={<Github />} label="GitHub" value="github.com/praveen" color="#ffffff" />
                                    <SocialLink icon={<Linkedin />} label="LinkedIn" value="linkedin.com/praveen" color="#00A0DC" />
                                </div>
                            </section>

                            <section className="quantum-card bg-cyan-500/5 border-4 border-white/5 !p-12 rounded-[3.5rem] shadow-2xl">
                                <h3 className="font-display text-xs font-black text-[#00FFD1] uppercase tracking-widest mb-8">Profile Strength</h3>
                                <div className="flex items-end gap-4">
                                    <div className="text-7xl font-display font-black text-white leading-none">98.4</div>
                                    <div className="font-mono text-2xl text-[#00FFD1] mb-2 font-black">%</div>
                                </div>
                                <div className="mt-10 w-full h-5 bg-black border-4 border-white/5 rounded-full overflow-hidden p-1 shadow-inner">
                                    <div className="w-[98%] h-full bg-gradient-to-r from-[#00FFD1] via-[#BF00FF] to-[#00FFD1] rounded-full shadow-[0_0_20px_#00FFD1]"></div>
                                </div>
                            </section>
                        </div>

                        <div className="lg:col-span-8 space-y-12">
                            <section className="quantum-card !p-16 rounded-[4.5rem] border-4 border-white/5 shadow-2xl bg-black/40">
                                <h3 className="font-mono text-xs text-white/20 uppercase tracking-widest mb-16 font-black">Account Overview</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                                    <SpecItem label="Display Name" value={user.name} />
                                    <SpecItem label="Primary Email" value={user.email} />
                                    <SpecItem label="Stream & Batch" value={`${user.department} • Class of ${user.graduation_year || user.enrollment_year}`} />
                                    <SpecItem label="Current Organization" value={user.company || 'Private'} />
                                    <SpecItem label="Account Type" value={user.role.toUpperCase()} />
                                    <SpecItem label="Sync Status" value="Profile Verified" />
                                </div>
                            </section>

                            <section className="quantum-card !p-16 rounded-[4.5rem] border-4 border-white/5 shadow-2xl bg-black/40">
                                <div className="flex justify-between items-center mb-16">
                                    <div className="space-y-4">
                                        <h3 className="font-display text-4xl font-black text-white uppercase tracking-tight leading-none group-hover:text-[#00FFD1] transition-colors">Platform Badges</h3>
                                        <p className="font-mono text-xs text-white/20 uppercase tracking-[0.2em] font-black">Your community milestones</p>
                                    </div>
                                    <div className="px-8 py-3 rounded-2xl bg-cyan-500/5 border-4 border-white/5 font-mono text-2xl text-[#00FFD1] font-black shadow-xl">{achievements.length} / {allBadges.length}</div>
                                </div>
                                
                                <div className="grid grid-cols-3 md:grid-cols-5 gap-16">
                                    {allBadges.map((badge) => {
                                        const isUnlocked = achievements.some(a => a.badge_key === badge.key);
                                        return (
                                            <div key={badge.key} className="flex flex-col items-center group relative">
                                                <div className={`w-28 h-28 relative transition-all duration-500 ${isUnlocked ? 'hover:scale-110' : 'opacity-10 grayscale blur-[1px]'}`}>
                                                    <Hexagon size={112} className={`absolute inset-0 ${isUnlocked ? 'text-[#00FFD1] fill-cyan-500/5' : 'text-white/10'}`} strokeWidth={1.5} />
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <Zap size={40} className={isUnlocked ? 'text-[#00FFD1] drop-shadow-[0_0_10px_#00FFD1]' : 'text-white/10'} />
                                                    </div>
                                                </div>
                                                <span className={`mt-8 font-mono text-[11px] font-black uppercase tracking-widest text-center ${isUnlocked ? 'text-white/40' : 'text-white/10'}`}>
                                                    {isUnlocked ? badge.name : 'LOCKED'}
                                                </span>

                                                <div className="absolute bottom-full mb-8 w-72 p-10 quantum-card opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50 scale-90 group-hover:scale-100 border-4 border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.8)] rounded-[2.5rem] bg-black backdrop-blur-xl">
                                                    <div className="text-sm font-black text-[#00FFD1] mb-4 uppercase tracking-widest">{isUnlocked ? badge.name : 'HIDDEN'}</div>
                                                    <p className="text-xs text-white/40 font-black font-mono uppercase tracking-tighter leading-relaxed">{isUnlocked ? badge.desc : 'Continue contributing to unlock this badge.'}</p>
                                                </div>
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
        <label className="font-mono text-xs text-white/20 uppercase tracking-[0.4em] font-black group-focus-within:text-[#00FFD1] transition-colors">{label}</label>
        <div className="relative">
            <div className="absolute left-8 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-[#00FFD1] transition-all group-focus-within:scale-110">
                {React.cloneElement(icon, { size: 28 })}
            </div>
            <input 
                className="w-full bg-black border-4 border-white/5 rounded-[2rem] py-8 pl-24 pr-10 text-xl text-white font-black uppercase tracking-tight focus:border-[#00FFD1]/30 focus:outline-none transition-all placeholder:text-slate-900 shadow-inner"
                value={value}
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    </div>
);

const SpecItem = ({ label, value }) => (
    <div className="group space-y-4">
        <div className="font-mono text-xs text-white/20 uppercase tracking-[0.3em] font-black group-hover:text-[#BF00FF] transition-colors">{label}</div>
        <div className="text-white font-display text-3xl font-black group-hover:translate-x-3 transition-transform duration-500 uppercase tracking-tight group-hover:text-[#00FFD1]">{value}</div>
    </div>
);

const SocialLink = ({ icon, label, value, color }) => (
    <div className="flex items-center gap-8 group cursor-pointer">
        <div className="w-16 h-16 rounded-2xl bg-black border-4 border-white/5 flex items-center justify-center text-white/10 group-hover:text-[var(--s-color)] group-hover:border-[var(--s-color)]/30 group-hover:scale-110 transition-all shadow-xl" style={{ '--s-color': color }}>
            {React.cloneElement(icon, { size: 32 })}
        </div>
        <div className="space-y-1">
            <div className="font-mono text-[10px] text-white/20 uppercase tracking-[0.3em] font-black">{label}</div>
            <div className="text-xl text-white/40 group-hover:text-white transition-colors font-black font-mono uppercase tracking-tighter">{value}</div>
        </div>
    </div>
);

export default Profile;
