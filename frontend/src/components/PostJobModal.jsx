import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Briefcase, MapPin, DollarSign, Send, Sparkles } from 'lucide-react';
import client from '../api/client';

const PostJobModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        title: '',
        company: '',
        location: '',
        type: 'full_time',
        salary_range: '',
        description: '',
        is_remote: false
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await client.post('/jobs', formData);
            onSuccess();
            onClose();
            setFormData({ title: '', company: '', location: '', type: 'full_time', salary_range: '', description: '', is_remote: false });
        } catch (err) {
            alert("Portal Transmission Failed: " + (err.error || "Network Unstable"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
                    {/* Dimensional Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-[#00000A]/80 backdrop-blur-md"
                    />
                    
                    {/* The Portal Card */}
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0, rotateX: 20 }}
                        animate={{ scale: 1, opacity: 1, rotateX: 0 }}
                        exit={{ scale: 0.8, opacity: 0, rotateX: -20 }}
                        className="quantum-card w-full max-w-2xl relative z-10 !bg-[#0D0D2B]/90 border-[#00FFD1]/30 shadow-[0_0_100px_rgba(0,255,209,0.15)]"
                    >
                        <button 
                            onClick={onClose}
                            className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
                        >
                            <X size={24} />
                        </button>

                        <div className="mb-10">
                            <h3 className="font-display text-2xl font-bold text-white flex items-center gap-4">
                                <div className="w-8 h-8 portal-ring"></div>
                                <span>INITIALIZE NEW PORTAL</span>
                            </h3>
                            <p className="font-mono text-sm text-[#00FFD1] opacity-60 uppercase tracking-normal mt-2">Broadcasting vacancy across all known timelines</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="font-mono text-sm text-slate-500 uppercase tracking-normal">Job Vector (Title)</label>
                                    <div className="relative">
                                        <Briefcase size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <input 
                                            required
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:border-[#00FFD1]/50 focus:outline-none transition-all"
                                            placeholder="Lead Neural Engineer"
                                            value={formData.title}
                                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="font-mono text-sm text-slate-500 uppercase tracking-normal">Dimension (Company)</label>
                                    <input 
                                        required
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:border-[#00FFD1]/50 focus:outline-none transition-all"
                                        placeholder="Cyberdyne Systems"
                                        value={formData.company}
                                        onChange={(e) => setFormData({...formData, company: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="font-mono text-sm text-slate-500 uppercase tracking-normal">Location Node</label>
                                    <div className="relative">
                                        <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <input 
                                            required
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:border-[#00FFD1]/50 focus:outline-none transition-all"
                                            placeholder="Neo-Tokyo"
                                            value={formData.location}
                                            onChange={(e) => setFormData({...formData, location: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="font-mono text-sm text-slate-500 uppercase tracking-normal">Salary Flux</label>
                                    <div className="relative">
                                        <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <input 
                                            required
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:border-[#00FFD1]/50 focus:outline-none transition-all"
                                            placeholder="120k - 180k"
                                            value={formData.salary_range}
                                            onChange={(e) => setFormData({...formData, salary_range: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="font-mono text-sm text-slate-500 uppercase tracking-normal">Shift Protocol</label>
                                    <select 
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:border-[#00FFD1]/50 focus:outline-none transition-all"
                                        value={formData.type}
                                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                                    >
                                        <option value="full_time">Full-Time</option>
                                        <option value="part_time">Part-Time</option>
                                        <option value="internship">Internship</option>
                                        <option value="contract">Contract</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 bg-white/[0.03] border border-white/10 rounded-xl py-4 px-6">
                                <label className="font-mono text-sm text-slate-500 uppercase tracking-normal flex-1">Remote-Enabled Transmission</label>
                                <input 
                                    type="checkbox"
                                    className="w-6 h-6 rounded-lg bg-black border-2 border-white/10 text-[#00FFD1] focus:ring-0 transition-all cursor-pointer"
                                    checked={formData.is_remote}
                                    onChange={(e) => setFormData({...formData, is_remote: e.target.checked})}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="font-mono text-sm text-slate-500 uppercase tracking-normal">Portal Specs (Description)</label>
                                <textarea 
                                    required
                                    rows="4"
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:border-[#00FFD1]/50 focus:outline-none transition-all resize-none"
                                    placeholder="Describe the neural requirements for this timeline..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="dimension-btn w-full !py-5 gap-3 group"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 portal-ring"></div>
                                        <span>TRANSMITTING...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        <span>CONFIRM ACROSS ALL TIMELINES</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default PostJobModal;
