import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Briefcase, MapPin, DollarSign, Calendar, 
    Search, Plus, Filter, ArrowRight, X, Sparkles, Zap, Trash2
} from 'lucide-react';
import PostJobModal from '../components/PostJobModal';

const JobBoard = () => {
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [myApps, setMyApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [filters, setFilters] = useState({ type: 'All', search: '' });

    const fetchData = async () => {
        try {
            const [jobsRes, appsRes] = await Promise.all([
                client.get('/jobs'),
                user?.role === 'student' ? client.get('/jobs/my-applications') : Promise.resolve({ data: [] })
            ]);
            setJobs(jobsRes.data || []);
            // Backend returns array of integer job_ids directly
            setMyApps(appsRes.data || []);
        } catch (err) {
            console.error("Failed to load jobs", err);
            setJobs([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleApply = async (jobId) => {
        try {
            await client.post(`/jobs/${jobId}/apply`, { cover_letter: "I am interested in this position." });
            fetchData();
        } catch (err) {
            alert(err.error || "Application failed. Please try again.");
        }
    };

    const handleDelete = async (jobId) => {
        if (!window.confirm("Delete this job posting permanently?")) return;
        try {
            await client.delete(`/jobs/${jobId}`);
            fetchData();
        } catch (err) {
            alert("Failed to delete job posting. Please try again.");
        }
    };

    const filteredJobs = jobs.filter(job => {
        const typeMap = {
            'All': 'All',
            'Full-Time': 'full_time',
            'Part-Time': 'part_time',
            'Internship': 'internship',
            'Contract': 'contract'
        };
        const targetType = typeMap[filters.type];
        
        let matchesType = true;
        if (filters.type === 'Remote') {
            matchesType = job.is_remote === true;
        } else if (targetType !== 'All') {
            matchesType = job.type === targetType;
        }

        const matchesSearch = (job.title || '').toLowerCase().includes(filters.search.toLowerCase()) || 
                             (job.company || '').toLowerCase().includes(filters.search.toLowerCase());
        return matchesType && matchesSearch;
    });

    return (
        <div className="space-y-16 pb-24 relative">
            <div className="scan-line"></div>
            
            {/* Page Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-5 quantum-card p-5 md:p-6 rounded-3xl border-4 border-white/5 shadow-2xl bg-black/40">
                <div className="space-y-4">
                    <h2 className="font-display text-4xl md:text-2xl md:text-3xl font-black text-white mb-2 tracking-normaler uppercase leading-none drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">Job Board</h2>
                    <p className="font-mono text-xl text-[#00FFD1] uppercase tracking-normal font-black">{filteredJobs.length} Career opportunities detected.</p>
                </div>
                {(user?.role === 'alumni' || user?.role === 'admin' || user?.role === 'mentor') && (
                    <button 
                        onClick={() => setShowModal(true)}
                        className="dimension-btn gap-4 !px-12 !py-6 text-xl font-black uppercase tracking-normal shadow-2xl active:scale-95"
                    >
                        <Plus size={32} />
                        <span>POST JOB</span>
                    </button>
                )}
            </header>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-8 items-center bg-black/40 p-6 rounded-2xl border-4 border-white/5 shadow-2xl">
                {['All', 'Full-Time', 'Part-Time', 'Remote', 'Internship', 'Contract'].map(type => (
                    <button
                        key={type}
                        onClick={() => setFilters({ ...filters, type })}
                        className={`px-12 py-5 rounded-2xl font-mono text-sm tracking-normal uppercase transition-all font-black border-4 ${
                            filters.type === type 
                            ? 'bg-white text-black border-white shadow-[0_0_30px_rgba(255,255,255,0.2)] scale-105' 
                            : 'bg-transparent text-white/30 border-white/5 hover:border-[#00FFD1] hover:text-[#00FFD1]'
                        }`}
                    >
                        {type}
                    </button>
                ))}
            </div>

            {/* Job Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-16 md:py-20">
                    <div className="w-16 h-16 md:w-20 md:h-20 portal-ring mb-5 md:mb-6 flex items-center justify-center">
                         <div className="w-12 h-12 bg-[#00FFD1] rounded-full animate-pulse shadow-[0_0_20px_#00FFD1]"></div>
                    </div>
                    <span className="font-mono text-2xl text-[#00FFD1] animate-pulse uppercase tracking-normal font-black">Scanning Opportunities...</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:p-6">
                    <AnimatePresence>
                        {filteredJobs.map((job, i) => {
                            const isApplied = myApps.includes(job.id);
                            return (
                                <motion.div 
                                    key={job.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="quantum-card group relative p-5 md:p-6 flex flex-col rounded-3xl transition-all hover:shadow-[0_20px_60px_rgba(0,255,209,0.15)] border-2 border-white/5 shadow-2xl bg-black/40"
                                >
                                    <div className="flex justify-between items-start mb-5 md:mb-6">
                                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-black border-4 border-white/10 overflow-hidden shadow-2xl group-hover:border-[#00FFD1]/50 transition-all">
                                            <div className="w-full h-full flex items-center justify-center font-display text-2xl md:text-3xl font-black text-white/10">
                                                {job.company.charAt(0)}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-6">
                                            <div className="px-8 py-2.5 rounded-2xl border-2 border-[#BF00FF]/30 bg-[#BF00FF]/10 font-mono text-sm text-[#BF00FF] uppercase font-black tracking-normal shadow-lg">
                                                {job.type}
                                            </div>
                                            {isApplied && (
                                                <div className="px-6 py-2 rounded-xl bg-[#00FFD1]/10 text-[#00FFD1] font-mono text-sm border-2 border-[#00FFD1]/30 uppercase font-black tracking-normal shadow-lg">
                                                    SUBMITTED
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <h3 className="font-display text-4xl font-black text-white mb-6 group-hover:text-[#00FFD1] transition-colors leading-tight uppercase tracking-normal">
                                        {job.title}
                                    </h3>
                                    <div className="font-mono text-base text-white/50 mb-5 md:mb-6 flex flex-col gap-4 font-black uppercase tracking-normal">
                                        <div className="flex items-center gap-4 text-[#00FFD1]">
                                            <Sparkles size={20} />
                                            <span>{job.company}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <MapPin size={20} className="text-white/20" />
                                            <span>{job.location}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-12 border-t-2 border-white/5 mt-auto">
                                        <div className="font-mono text-xl text-white font-black tracking-normal shadow-xl px-6 py-2 rounded-2xl bg-white/5 border-2 border-white/10">
                                            {job.salary_range || 'COMPETITIVE'}
                                        </div>
                                        <div className="flex gap-6">
                                            {user?.role === 'admin' && (
                                                <button 
                                                    onClick={() => handleDelete(job.id)}
                                                    className="p-5 rounded-[1.5rem] border-4 border-red-500/10 text-red-500/40 hover:bg-red-500/20 hover:text-red-500 transition-all shadow-xl active:scale-95"
                                                >
                                                    <Trash2 size={28} />
                                                </button>
                                            )}
                                            {user?.role === 'student' && (
                                                <button 
                                                    onClick={() => !isApplied && handleApply(job.id)}
                                                    disabled={isApplied}
                                                    className={`dimension-btn !px-10 !py-5 !text-lg gap-6 font-black uppercase tracking-normal shadow-2xl active:scale-95 ${isApplied ? '!opacity-30 !cursor-not-allowed !bg-white/5 !text-white/20 !border-white/5' : ''}`}
                                                >
                                                    <span>{isApplied ? 'SUBMITTED' : 'APPLY'}</span>
                                                    {!isApplied && <ArrowRight size={28} />}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}

            {/* Empty State */}
            {!loading && filteredJobs.length === 0 && (
                <div className="quantum-card flex flex-col items-center justify-center py-64 text-center bg-black/40 rounded-3xl border-dashed border-4 border-white/5 shadow-2xl">
                    <div className="w-40 h-40 bg-white/5 rounded-full flex items-center justify-center mb-6 md:mb-8 relative shadow-inner">
                        <Zap size={80} className="text-white/10" />
                    </div>
                    <h3 className="font-display text-2xl md:text-3xl text-white/20 mb-8 uppercase tracking-normal font-black">No Opportunities</h3>
                    <p className="font-mono text-xl text-white/10 max-w-xl font-black uppercase tracking-normal leading-relaxed">System scan complete. No matching openings detected.</p>
                </div>
            )}

            <PostJobModal 
                isOpen={showModal} 
                onClose={() => setShowModal(false)} 
                onSuccess={fetchData} 
            />
        </div>
    );
};

export default JobBoard;
