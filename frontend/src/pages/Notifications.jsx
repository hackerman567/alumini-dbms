import React, { useEffect, useState } from 'react';
import client from '../api/client';
import { Bell, CheckCircle, Clock, Trash2, Zap, ShieldAlert, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const res = await client.get('/notifications');
            setNotifications(res.data);
        } catch (err) {
            console.error("Failed to load notifications", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAllRead = async () => {
        try {
            await client.put('/notifications/read-all');
            fetchNotifications();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-16 pb-24 relative">
            <div className="scan-line"></div>
            
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-5 quantum-card p-5 md:p-6 rounded-3xl border-4 border-white/5 shadow-2xl bg-black/40">
                <div className="space-y-4">
                    <h2 className="font-display text-3xl md:text-4xl font-black text-white mb-3 tracking-normaler flex items-center gap-8 uppercase leading-none drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                        <Radio size={48} className="text-[#00FFD1] animate-pulse drop-shadow-[0_0_15px_#00FFD1]" />
                        Notifications
                    </h2>
                    <p className="font-mono text-base text-[#00FFD1] uppercase tracking-normal font-black">Stay updated with the latest community activities</p>
                </div>
                
                <button 
                    onClick={markAllRead} 
                    className="dimension-btn px-10 py-5 text-base font-black uppercase tracking-normal shadow-2xl active:scale-95 transition-all"
                >
                    <CheckCircle size={24} className="mr-4" />
                    <span>Mark all as read</span>
                </button>
            </header>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-16 md:py-20">
                    <div className="w-14 h-14 md:w-16 md:h-16 portal-ring mb-10 flex items-center justify-center">
                         <div className="w-10 h-10 bg-[#00FFD1] rounded-full animate-pulse shadow-[0_0_20px_#00FFD1]"></div>
                    </div>
                    <span className="font-mono text-base text-[#00FFD1] animate-pulse uppercase tracking-normal font-black">Synchronizing Feed...</span>
                </div>
            ) : notifications.length === 0 ? (
                <div className="quantum-card flex flex-col items-center justify-center py-60 text-center p-6 md:p-8 rounded-3xl border-4 border-dashed border-white/5 bg-black/40">
                    <div className="p-5 md:p-6 rounded-full bg-white/5 border-4 border-dashed border-white/10 mb-10 shadow-2xl">
                        <ShieldAlert size={96} className="text-white/10" />
                    </div>
                    <h3 className="font-display text-4xl text-white/20 uppercase tracking-normal font-black">No Notifications</h3>
                    <p className="font-mono text-white/10 max-w-md mt-6 text-xl font-black uppercase tracking-normaler">System scan complete. Your activity feed is currently clear.</p>
                </div>
            ) : (
                <div className="space-y-8 max-w-6xl">
                    <AnimatePresence>
                        {notifications.map((note, i) => (
                            <motion.div 
                                key={note.id}
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className={`quantum-card group relative p-5 md:p-6 flex items-start gap-5 md:p-6 rounded-3xl border-4 transition-all duration-500 ${note.is_read ? 'opacity-30 border-white/5 hover:border-white/10 hover:opacity-60 bg-black/40' : 'bg-black border-[#00FFD1]/30 shadow-2xl hover:shadow-[0_0_50px_rgba(0,255,209,0.15)]'}`}
                            >
                                <div className={`p-6 rounded-3xl border-4 transition-all ${note.is_read ? 'bg-white/5 border-white/10 text-white/20' : 'bg-[#00FFD1]/10 border-[#00FFD1]/20 text-[#00FFD1] animate-pulse shadow-lg shadow-cyan-500/5'}`}>
                                    <Bell size={40} />
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h4 className={`text-3xl font-black uppercase tracking-normal transition-colors ${note.is_read ? 'text-white/40' : 'text-white group-hover:text-[#00FFD1]'}`}>{note.title}</h4>
                                        <div className="flex items-center gap-4 font-mono text-sm text-white/20 uppercase font-black tracking-normal bg-white/5 px-6 py-2 rounded-2xl border-2 border-white/5">
                                            <Clock size={20} />
                                            {new Date(note.created_at).toLocaleString()}
                                        </div>
                                    </div>
                                    <p className={`text-xl font-black uppercase tracking-normal leading-relaxed transition-colors ${note.is_read ? 'text-white/20' : 'text-white/60 group-hover:text-white/80'}`}>{note.body}</p>
                                </div>
                                {!note.is_read && (
                                    <div className="absolute top-0 right-0 w-3 h-full bg-gradient-to-b from-[#00FFD1] to-transparent rounded-r-[3.5rem] shadow-[0_0_20px_#00FFD1]"></div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default Notifications;
