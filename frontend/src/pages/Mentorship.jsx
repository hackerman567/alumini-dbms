import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, UserCheck, UserX, Clock, Send, ShieldCheck, Sparkles, Zap, Activity, Search } from 'lucide-react';

const Mentorship = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [mentors, setMentors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState((user.role === 'alumni' || user.role === 'mentor') ? 'incoming' : 'discover'); // 'incoming', 'active', 'discover'
    const [search, setSearch] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [reqRes, mentRes] = await Promise.all([
                client.get('/mentorship/requests'),
                user.role === 'student' ? client.get('/mentorship/mentors') : Promise.resolve({ data: [] })
            ]);
            setRequests(reqRes.data || []);
            setMentors(mentRes.data || []);
        } catch (err) {
            console.error("Error fetching mentorship data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleResponse = async (id, status) => {
        try {
            await client.put(`/mentorship/respond/${id}`, { status });
            fetchData();
        } catch (err) {
            alert("Action failed. Please try again.");
        }
    };

    const handleSendRequest = async (mentorId) => {
        const message = prompt("ENTER YOUR MESSAGE:");
        if (!message) return;
        try {
            await client.post('/mentorship/request', { alumni_id: mentorId, message });
            alert("Mentorship request sent successfully!");
            fetchData();
        } catch (err) {
            alert(err.error || "Failed to send request");
        }
    };

    const pendingRequests = requests.filter(r => r.status === 'pending');
    const activeConnections = requests.filter(r => r.status === 'accepted');
    const filteredMentors = mentors.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.job_title?.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-20 pb-24 relative">
            <div className="scan-line"></div>

            {/* Page Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-5 md:p-6 quantum-card p-5 md:p-6 rounded-3xl border-4 border-white/5 shadow-2xl bg-black/40">
                <div className="space-y-8">
                    <h2 className="font-display text-4xl md:text-2xl md:text-3xl font-black text-white mb-4 tracking-normaler uppercase leading-none drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">Mentorship Hub</h2>
                    <p className="font-mono text-xl text-[#00FFD1] uppercase tracking-normal font-black">Professional guidance and career development network.</p>

                    <div className="flex flex-wrap items-center gap-6 mt-12">
                        {user.role === 'student' && (
                            <button
                                onClick={() => setActiveTab('discover')}
                                className={`font-mono text-sm font-black tracking-normal uppercase px-10 py-5 rounded-2xl border-4 transition-all duration-300 ${activeTab === 'discover' ? 'bg-[#00FFD1] border-[#00FFD1] text-black shadow-[0_15px_40px_rgba(0,255,209,0.3)] scale-105' : 'bg-black border-white/5 text-white/20 hover:border-white/20 hover:text-white'}`}
                            >
                                Find Mentors
                            </button>
                        )}
                        <button
                            onClick={() => setActiveTab('incoming')}
                            className={`font-mono text-sm font-black tracking-normal uppercase px-10 py-5 rounded-2xl border-4 transition-all duration-300 ${activeTab === 'incoming' ? 'bg-[#BF00FF] border-[#BF00FF] text-white shadow-[0_15px_40px_rgba(191,0,255,0.3)] scale-105' : 'bg-black border-white/5 text-white/20 hover:border-white/20 hover:text-white'}`}
                        >
                            {(user.role === 'alumni' || user.role === 'mentor') ? 'Requests' : 'My Applications'} ({pendingRequests.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('active')}
                            className={`font-mono text-sm font-black tracking-normal uppercase px-10 py-5 rounded-2xl border-4 transition-all duration-300 ${activeTab === 'active' ? 'bg-[#FF2D6B] border-[#FF2D6B] text-white shadow-[0_15px_40px_rgba(255,45,107,0.3)] scale-105' : 'bg-black border-white/5 text-white/20 hover:border-white/20 hover:text-white'}`}
                        >
                            Active Connections ({activeConnections.length})
                        </button>
                    </div>
                </div>

                {user.role === 'student' && activeTab === 'discover' && (
                    <div className="relative w-full md:w-[32rem] group">
                        <Search size={32} className="absolute left-8 top-1/2 -translate-y-1/2 text-[#00FFD1] group-focus-within:scale-110 transition-transform" />
                        <input
                            className="w-full bg-black border-4 border-white/5 rounded-2xl py-8 pl-24 pr-10 text-xl text-white font-black uppercase tracking-normal focus:border-[#00FFD1]/50 transition-all placeholder:text-slate-800 shadow-inner"
                            placeholder="SEARCH REGISTRY..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                )}
            </header>

            <div className="relative min-h-[600px]">
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-56"
                        >
                            <div className="w-16 h-16 md:w-20 md:h-20 portal-ring mb-5 md:mb-6 flex items-center justify-center">
                                <div className="w-12 h-12 bg-[#00FFD1] rounded-full animate-pulse shadow-[0_0_20px_#00FFD1]"></div>
                            </div>
                            <span className="font-mono text-2xl text-[#00FFD1] animate-pulse uppercase tracking-normal font-black">Updating Network...</span>
                        </motion.div>
                    ) : activeTab === 'discover' ? (
                        <motion.div
                            key="discover"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:p-8"
                        >
                            {filteredMentors.map((m, i) => (
                                <MentorCard key={m.id} mentor={m} onSendRequest={handleSendRequest} />
                            ))}
                        </motion.div>
                    ) : activeTab === 'incoming' ? (
                        <motion.div
                            key="incoming"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-20"
                        >
                            {pendingRequests.length === 0 ? (
                                <EmptyState message="No Pending Requests" sub="The registry is currently clear of incoming mentorship applications." />
                            ) : (
                                pendingRequests.map((req, i) => (
                                    <RequestCard key={req.id} req={req} index={i} onRespond={handleResponse} isAlumni={user.role === 'alumni' || user.role === 'mentor'} />
                                ))
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="active"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:p-8"
                        >
                            {activeConnections.length === 0 ? (
                                <EmptyState message="No Active Mentorships" sub="Your active professional connection log is currently empty." />
                            ) : (
                                activeConnections.map((req, i) => (
                                    <ConnectionCard key={req.id} req={req} index={i} isAlumni={user.role === 'alumni' || user.role === 'mentor'} />
                                ))
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const MentorCard = ({ mentor, onSendRequest }) => (
    <motion.div
        layout
        className="quantum-card group relative p-5 md:p-6 flex flex-col h-full rounded-3xl border-4 border-white/5 transition-all duration-500 hover:shadow-[0_30px_60px_rgba(0,255,209,0.15)] bg-black/40"
    >
        <div className="flex gap-4 md:gap-5 items-center mb-5 md:mb-6">
            <div className="w-32 h-32 rounded-2xl bg-black border-4 border-white/10 flex items-center justify-center font-display text-3xl md:text-4xl font-black text-white overflow-hidden shadow-2xl group-hover:scale-110 group-hover:border-[#00FFD1]/50 transition-all duration-500">
                {mentor.avatar_url ? (
                    <img
                        src={mentor.avatar_url.startsWith('http') ? mentor.avatar_url : `${import.meta.env.VITE_API_BASE || ''}${mentor.avatar_url}`}
                        className="w-full h-full object-cover"
                        alt={mentor.name}
                    />
                ) : mentor.name.charAt(0)}
            </div>
            <div>
                <h4 className="text-4xl font-black text-white mb-4 uppercase tracking-normal leading-tight group-hover:text-[#00FFD1] transition-colors">{mentor.name}</h4>
                <p className="font-mono text-sm text-[#00FFD1] uppercase tracking-normal font-black bg-cyan-500/10 px-6 py-2 rounded-2xl border-2 border-cyan-500/20 shadow-lg">{mentor.job_title} @ {mentor.current_company || 'Technology'}</p>
            </div>
        </div>
        <div className="flex-1">
            <div className="flex flex-wrap gap-4 mb-5 md:mb-6 px-2">
                {(Array.isArray(mentor.skills) ? mentor.skills : (mentor.skills || '').split(',')).slice(0, 3).map(skill => (
                    <span key={skill} className="px-6 py-3 rounded-2xl bg-white/5 border-2 border-white/5 font-mono text-sm text-white/20 uppercase font-black tracking-normal group-hover:text-white/40 transition-colors">{skill.trim()}</span>
                ))}
            </div>
        </div>
        <button
            onClick={() => onSendRequest(mentor.id)}
            className="dimension-btn w-full !py-8 rounded-xl flex items-center justify-center text-xl font-black uppercase tracking-normal shadow-2xl active:scale-95 transition-all"
        >
            <Send size={28} className="mr-4" /> SEND REQUEST
        </button>
    </motion.div>
);

const RequestCard = ({ req, index, onRespond, isAlumni }) => (
    <motion.div
        initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className={`flex flex-col md:flex-row items-center gap-6 md:p-8 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
    >
        <div className="flex-1 w-full quantum-card group relative p-6 md:p-8 rounded-3xl border-4 border-white/5 transition-all duration-500 shadow-2xl hover:shadow-[0_30px_60px_rgba(191,0,255,0.15)] bg-black/40">

            <div className="flex gap-5 md:p-6 items-start mb-5 md:mb-6">
                <div className="relative p-2 rounded-3xl bg-gradient-to-br from-[#BF00FF] to-[#00FFD1] shadow-2xl">
                    <div className="w-36 h-36 rounded-2xl bg-black flex items-center justify-center font-display text-4xl md:text-2xl md:text-3xl font-black text-white">
                        {(isAlumni ? req.student_name : req.mentor_name)?.charAt(0)}
                    </div>
                </div>
                <div className="pt-4">
                    <h4 className="font-display text-2xl md:text-3xl font-black text-white mb-6 uppercase tracking-normal leading-none group-hover:text-[#BF00FF] transition-colors">
                        {isAlumni ? req.student_name : req.mentor_name}
                    </h4>
                    <div className="font-mono text-lg text-[#BF00FF] uppercase tracking-normal font-black bg-purple-500/10 px-8 py-3 rounded-2xl border-2 border-purple-500/20 inline-block shadow-xl">
                        {isAlumni ? `ENROLLED: ${req.student_batch || 'N/A'}` : `CLASS OF: ${req.mentor_batch || 'N/A'}`}
                    </div>
                </div>
            </div>

            <div className="p-5 md:p-6 bg-black border-4 border-white/5 rounded-3xl mb-5 md:mb-6 relative overflow-hidden shadow-inner">
                <p className="font-mono text-xl text-white/30 uppercase tracking-normaler leading-relaxed font-black">"{req.message}"</p>
            </div>

            {isAlumni && req.status === 'pending' && (
                <div className="grid grid-cols-2 gap-4 md:gap-5">
                    <button
                        onClick={() => onRespond(req.id, 'accepted')}
                        className="dimension-btn !py-8 rounded-xl font-black uppercase tracking-normal shadow-2xl active:scale-95 transition-all text-xl flex items-center justify-center gap-4"
                    >
                        <UserCheck size={32} />
                        <span>ACCEPT</span>
                    </button>
                    <button
                        onClick={() => onRespond(req.id, 'rejected')}
                        className="py-8 rounded-xl bg-black border-4 border-red-500/10 text-red-500/40 hover:bg-red-500/20 hover:text-red-500 hover:border-red-500/30 transition-all text-xl font-black uppercase tracking-normal flex items-center justify-center gap-4 shadow-xl active:scale-95"
                    >
                        <UserX size={32} />
                        <span>DECLINE</span>
                    </button>
                </div>
            )}

            <div className="mt-12 flex items-center justify-between font-mono text-sm text-white/10 uppercase tracking-normal font-black pt-10 border-t-4 border-white/5">
                <span>SENT: {new Date(req.created_at).toLocaleDateString()}</span>
                <span className="text-[#BF00FF] bg-purple-500/10 px-8 py-2 rounded-2xl border-2 border-purple-500/20">{req.status.toUpperCase()}</span>
            </div>
        </div>

        <div className="hidden md:flex w-28 h-28 rounded-full bg-black border-4 border-[#00FFD1]/30 items-center justify-center relative z-20 shadow-[0_0_60px_rgba(0,255,209,0.2)]">
            <div className="w-10 h-10 rounded-full bg-[#00FFD1] animate-pulse shadow-[0_0_25px_#00FFD1]"></div>
        </div>

        <div className="flex-1 hidden md:block"></div>
    </motion.div>
);

const ConnectionCard = ({ req, index, isAlumni }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.1 }}
        className="quantum-card group p-5 md:p-6 flex flex-col h-full rounded-3xl border-4 border-white/5 transition-all duration-500 hover:shadow-[0_30px_60px_rgba(0,255,209,0.15)] bg-black/40"
    >
        <div className="flex gap-4 md:gap-5 items-center mb-5 md:mb-6">
            <div className="w-28 h-28 rounded-2xl bg-gradient-to-tr from-[#00FFD1] to-[#BF00FF] p-1 shadow-2xl transition-transform group-hover:scale-110 duration-500">
                <div className="w-full h-full rounded-[2.2rem] bg-black flex items-center justify-center font-display text-2xl md:text-3xl font-black text-white">
                    {(isAlumni ? req.student_name : req.mentor_name)?.charAt(0)}
                </div>
            </div>
            <div>
                <h4 className="font-display text-3xl font-black text-white group-hover:text-[#00FFD1] transition-colors uppercase tracking-normal leading-tight">
                    {isAlumni ? req.student_name : req.mentor_name}
                </h4>
                <div className="font-mono text-sm text-white/10 uppercase tracking-normal mt-4 font-black bg-white/5 px-6 py-2 rounded-xl border border-white/10">CONNECTED</div>
            </div>
        </div>

        <div className="flex-1"></div>

        <button className="dimension-btn w-full !py-8 rounded-2xl flex items-center justify-center gap-6 shadow-2xl active:scale-95 transition-all text-xl font-black uppercase tracking-normal">
            <MessageSquare size={36} />
            <span>MESSAGE</span>
        </button>
    </motion.div>
);

const EmptyState = ({ message, sub }) => (
    <div className="quantum-card flex flex-col items-center justify-center py-64 text-center !p-20 rounded-3xl border-dashed border-4 border-white/5 bg-black/40 shadow-inner">
        <div className="w-36 h-36 rounded-full bg-white/5 border-4 border-dashed border-white/10 flex items-center justify-center mb-5 md:mb-6 shadow-2xl">
            <Activity size={72} className="text-white/10 animate-pulse" />
        </div>
        <h3 className="font-display text-2xl md:text-3xl text-white/20 mb-8 uppercase tracking-normal font-black">{message}</h3>
        <p className="font-mono text-xl text-white/10 max-w-2xl font-black uppercase tracking-normaler leading-relaxed">{sub}</p>
    </div>
);

export default Mentorship;
