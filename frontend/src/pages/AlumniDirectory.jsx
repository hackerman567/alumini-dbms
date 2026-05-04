import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { 
    Search, Filter, Briefcase, GraduationCap, 
    MapPin, ChevronLeft, ChevronRight, User, 
    MessageSquare, Zap, Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AlumniDirectory = () => {
    const navigate = useNavigate();
    const [alumni, setAlumni] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({ search: '', department: '', grad_year: '', is_mentor: false });

    const fetchAlumni = async () => {
        setLoading(true);
        try {
            const params = { ...filters, page, limit: 12 };
            const res = await client.get('/alumni', { params });
            setAlumni(res.data);
        } catch (err) {
            console.error("Failed to load alumni directory", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => fetchAlumni(), 300);
        return () => clearTimeout(timer);
    }, [filters, page]);

    return (
        <div className="space-y-20 pb-24 relative">
            <div className="scan-line"></div>
            
            {/* Page Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-5 md:p-6 quantum-card p-5 md:p-6 rounded-3xl border-4 border-white/5 shadow-2xl bg-black/40">
                <div className="space-y-6">
                    <h2 className="font-display text-4xl md:text-2xl md:text-3xl font-black text-white mb-4 tracking-normaler uppercase leading-none drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">Alumni Directory</h2>
                    <p className="font-mono text-xl text-[#00FFD1] uppercase tracking-normal font-black">{alumni.length} Professionals verified in your network.</p>
                </div>
                
                <div className="flex flex-col md:flex-row gap-8 w-full md:w-auto">
                    <div className="relative w-full md:w-[32rem] group">
                        <Search size={32} className="absolute left-8 top-1/2 -translate-y-1/2 text-[#00FFD1] group-focus-within:scale-110 transition-transform" />
                        <input 
                            className="w-full bg-black/50 border-4 border-white/5 rounded-2xl py-6 pl-24 pr-10 text-xl text-white font-black uppercase tracking-normal focus:border-[#00FFD1]/50 transition-all placeholder:text-slate-800 shadow-inner"
                            placeholder="SEARCH BY NAME OR SKILLS..."
                            value={filters.search}
                            onChange={(e) => setFilters({...filters, search: e.target.value})}
                        />
                    </div>
                    <select 
                        className="w-full md:w-80 bg-black/50 border-4 border-white/5 rounded-2xl py-6 px-10 text-lg text-white font-black uppercase tracking-normal focus:border-[#00FFD1]/50 transition-all cursor-pointer shadow-inner appearance-none"
                        value={filters.department}
                        onChange={(e) => setFilters({...filters, department: e.target.value})}
                    >
                        <option value="">ALL DEPARTMENTS</option>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Mechanical Engineering">Mechanical Engineering</option>
                        <option value="Business Administration">Business Administration</option>
                    </select>
                </div>
            </header>

            {/* Directory Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-16 md:py-20">
                    <div className="w-16 h-16 md:w-20 md:h-20 portal-ring mb-5 md:mb-6 flex items-center justify-center">
                         <div className="w-12 h-12 bg-[#00FFD1] rounded-full animate-pulse shadow-[0_0_20px_#00FFD1]"></div>
                    </div>
                    <span className="font-mono text-2xl text-[#00FFD1] animate-pulse uppercase tracking-normal font-black">Syncing Network...</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 md:p-6">
                    <AnimatePresence>
                        {alumni.map((person, i) => (
                            <motion.div 
                                key={person.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className="quantum-card group relative p-5 md:p-6 flex flex-col rounded-3xl transition-all duration-500 hover:shadow-[0_30px_60px_rgba(0,255,209,0.15)] bg-black/40"
                            >
                                <div className="absolute top-8 right-8 z-10">
                                    {person.is_open_to_mentor && (
                                        <div className="flex items-center gap-3 px-6 py-2 rounded-2xl bg-white/5 text-[#00FFD1] border-2 border-[#00FFD1]/20 font-mono text-sm font-black uppercase tracking-normal shadow-xl shadow-cyan-500/10 backdrop-blur-md">
                                            <Target size={18} /> MENTOR
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col items-center text-center mt-4">
                                    <div className="w-40 h-40 rounded-2xl bg-black border-4 border-white/10 p-1 mb-10 group-hover:scale-110 group-hover:border-[#00FFD1]/50 transition-all duration-500 shadow-2xl relative">
                                        <div className="w-full h-full rounded-[2.8rem] overflow-hidden bg-black flex items-center justify-center relative">
                                            {person.avatar_url ? (
                                                <img src={person.avatar_url} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="font-display text-4xl md:text-2xl md:text-3xl font-black text-white/10">{person.name.charAt(0)}</span>
                                            )}
                                        </div>
                                    </div>

                                    <h3 className="font-display text-3xl font-black text-white mb-4 group-hover:text-[#00FFD1] transition-colors uppercase tracking-normal leading-tight px-4">{person.name}</h3>
                                    <p className="font-mono text-sm text-[#BF00FF] uppercase tracking-normal mb-10 font-black bg-purple-500/10 px-6 py-2 rounded-2xl border-2 border-purple-500/20 shadow-lg">BATCH {person.graduation_year}</p>
                                    
                                    <div className="space-y-6 mb-5 md:mb-6 w-full px-4 border-t-2 border-white/5 pt-8">
                                        <div className="flex items-center justify-center gap-5 text-base text-slate-400 font-black uppercase tracking-normal">
                                            <Briefcase size={24} className="text-white/20" />
                                            <span className="truncate max-w-[220px]">{person.job_title || 'Member'}</span>
                                        </div>
                                        <div className="flex items-center justify-center gap-5 text-base text-slate-400 font-black uppercase tracking-normal">
                                            <MapPin size={24} className="text-white/20" />
                                            <span className="truncate max-w-[220px]">{person.department}</span>
                                        </div>
                                    </div>

                                    <div className="w-full grid grid-cols-2 gap-6 mt-auto">
                                        <button 
                                            onClick={() => navigate(`/profile/${person.id}`)}
                                            className="dimension-btn !p-6 rounded-xl !bg-white/5 !text-white border-4 border-white/10 hover:!text-[#00FFD1] hover:!border-[#00FFD1]/30 transition-all flex items-center justify-center shadow-xl active:scale-95" 
                                            title="View Profile"
                                        >
                                            <User size={32} />
                                        </button>
                                        <button 
                                            onClick={() => window.location.href = `/messaging?user=${person.id}`}
                                            className="dimension-btn !p-6 rounded-xl !bg-white/5 !text-white border-4 border-white/10 hover:!text-[#BF00FF] hover:!border-[#BF00FF]/30 transition-all flex items-center justify-center shadow-xl active:scale-95" 
                                            title="Send Message"
                                        >
                                            <MessageSquare size={32} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Pagination Controls */}
            <div className="flex justify-center items-center gap-6 md:p-8 pt-24">
                <button 
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="p-8 rounded-xl bg-black border-4 border-white/10 text-white disabled:opacity-30 hover:border-[#00FFD1] transition-all shadow-2xl hover:scale-110 active:scale-95 disabled:hover:scale-100"
                >
                    <ChevronLeft size={40} />
                </button>
                <div className="font-mono text-xl text-white uppercase tracking-normal font-black bg-black px-12 py-5 rounded-xl border-4 border-white/10 shadow-2xl flex items-center gap-4">
                    PAGE <span className="text-[#00FFD1] text-3xl">{page}</span>
                </div>
                <button 
                    onClick={() => setPage(p => p + 1)}
                    className="p-8 rounded-xl bg-black border-4 border-white/10 text-white hover:border-[#00FFD1] transition-all shadow-2xl hover:scale-110 active:scale-95"
                >
                    <ChevronRight size={40} />
                </button>
            </div>
        </div>
    );
};

export default AlumniDirectory;
