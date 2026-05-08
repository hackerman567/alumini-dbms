import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Clock, Plus, Shield, Send } from 'lucide-react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

const Capsule = () => {
    const { user } = useAuth();
    const [capsules, setCapsules] = useState([]);
    const [myCapsules, setMyCapsules] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [view, setView] = useState('vault'); // 'vault' or 'mine'
    const [loading, setLoading] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [unlockDate, setUnlockDate] = useState('');

    useEffect(() => {
        fetchCapsules();
    }, [view]);

    const fetchCapsules = async () => {
        setLoading(true);
        try {
            if (view === 'vault') {
                const res = await client.get('/capsules');
                setCapsules(res.data || []);
            } else {
                const res = await client.get('/capsules/me');
                setMyCapsules(res.data || []);
            }
        } catch (err) {
            console.error("Failed to load capsules", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSeal = async (e) => {
        e.preventDefault();
        try {
            const res = await client.post('/capsules', {
                title, 
                body, 
                unlock_date: unlockDate, 
                is_public: true,
                image_url: null // Explicitly null to prevent pg driver issues
            });
            if (res.success) {
                setIsModalOpen(false);
                fetchCapsules();
                setTitle(''); setBody(''); setUnlockDate('');
            }
        } catch (err) {
            console.error("Failed to create capsule", err);
            alert(err.error || "Failed to create the capsule. Please try again.");
        }
    };

    const calculateTimeLeft = (targetDate) => {
        const difference = new Date(targetDate) - new Date();
        if (difference <= 0) return "AVAILABLE";

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);

        return `${days}D ${hours}H ${minutes}M`;
    };

    return (
        <div className="max-w-7xl mx-auto space-y-20 pb-24 relative">
            <div className="scan-line"></div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-5 p-6 md:p-10 quantum-card rounded-3xl border-4 border-white/5 bg-black/40 shadow-2xl">
                <div className="space-y-4">
                    <h1 className="text-3xl md:text-5xl font-display font-black text-white mb-4 flex items-center gap-5 uppercase tracking-normaler leading-none drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                        <Clock className="animate-pulse text-[#00FFD1] drop-shadow-[0_0_20px_rgba(0,255,209,0.5)]" size={64} /> Time Capsule
                    </h1>
                    <p className="text-white/20 font-mono tracking-[0.3em] text-sm md:text-base font-black uppercase">Archive your collective memory for future generations</p>
                </div>
                
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex p-2 bg-black rounded-2xl border-4 border-white/5 shadow-2xl">
                        <button 
                            onClick={() => setView('vault')}
                            className={`font-mono text-xs md:text-sm font-black uppercase px-6 md:px-10 py-3 md:py-4 rounded-xl transition-all tracking-normal ${view === 'vault' ? 'bg-white text-black shadow-[0_10px_40px_rgba(255,255,255,0.3)] scale-105' : 'text-white/20 hover:text-white'}`}
                        >
                            Public Vault
                        </button>
                        <button 
                            onClick={() => setView('mine')}
                            className={`font-mono text-xs md:text-sm font-black uppercase px-6 md:px-10 py-3 md:py-4 rounded-xl transition-all tracking-normal ${view === 'mine' ? 'bg-[#BF00FF] text-white shadow-[0_10px_40px_rgba(191,0,255,0.3)] scale-105' : 'text-white/20 hover:text-white'}`}
                        >
                            My Archive
                        </button>
                    </div>
                    <button 
                        onClick={fetchCapsules}
                        className="dimension-btn !px-6 !py-5 shadow-2xl active:scale-95 bg-white/5 border-white/10 text-white/40 hover:text-[#00FFD1]"
                    >
                        <Clock size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="dimension-btn !px-10 !py-5 text-lg font-black uppercase tracking-normal shadow-2xl active:scale-95"
                    >
                        <Plus size={24} className="mr-3" /> NEW CAPSULE
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:p-8">
                <AnimatePresence mode="popLayout">
                    {(view === 'vault' ? capsules : myCapsules).map((capsule) => {
                        const isRevealed = capsule.is_revealed;
                        const timeLeft = calculateTimeLeft(capsule.unlock_date);
                        
                        return (
                            <motion.div
                                key={capsule.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className={`quantum-card group !p-8 flex flex-col rounded-3xl border-4 transition-all duration-500 shadow-2xl ${!isRevealed ? 'border-dashed border-white/5 bg-black/40 hover:border-white/10' : 'border-[#00FFD1]/20 bg-black/60 hover:border-[#00FFD1]/50 hover:shadow-[0_40px_100px_rgba(0,255,209,0.2)]'}`}
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-700 shadow-2xl ${isRevealed ? 'bg-black text-[#00FFD1] border-2 border-[#00FFD1]/20 shadow-[0_15px_40px_rgba(0,255,209,0.2)] group-hover:scale-110' : 'bg-black text-white/10 border-2 border-white/5'}`}>
                                            {isRevealed ? <Unlock size={28} className="drop-shadow-[0_0_15px_#00FFD1]" /> : <Lock size={28} />}
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="font-display font-black tracking-normal text-xl text-white uppercase leading-none group-hover:text-[#00FFD1] transition-colors">
                                                {isRevealed ? capsule.title : 'ARCHIVE_LOCKED'}
                                            </h3>
                                            <div className="flex flex-wrap gap-4">
                                                 <p className="text-sm font-mono text-white/20 uppercase font-black tracking-normal bg-white/5 px-4 py-2 rounded-xl border-2 border-white/5">
                                                    {view === 'vault' ? `FROM: ${capsule.author_name}` : `UNLOCKS: ${new Date(capsule.unlock_date).toLocaleDateString()}`}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 min-h-[180px] relative flex items-center justify-center border-4 border-white/5 rounded-2xl bg-black/50 overflow-hidden mb-6 transition-all group-hover:border-white/10 shadow-inner group-hover:bg-black/20">
                                    {isRevealed ? (
                                        <p className="p-6 text-xl font-black uppercase tracking-normal text-white leading-tight text-center italic drop-shadow-xl">"{capsule.body}"</p>
                                    ) : (
                                        <div className="text-center p-6 space-y-6">
                                            <div className="flex justify-center">
                                                <div className="w-16 h-16 portal-ring flex items-center justify-center">
                                                    <div className="w-6 h-6 bg-[#BF00FF] rounded-full animate-pulse shadow-[0_0_20px_#BF00FF]"></div>
                                                </div>
                                            </div>
                                            <p className="font-mono text-xs text-[#BF00FF] tracking-[0.4em] font-black uppercase">TEMPORAL_LOCK</p>
                                            <p className="font-display text-xl text-white font-black tracking-normal tabular-nums drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">{timeLeft}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="p-6 border-t-2 border-white/5 mt-auto flex items-center gap-4 bg-white/[0.02] rounded-b-3xl">
                                    <div className="w-10 h-10 rounded-full border-2 border-white/10 overflow-hidden shadow-lg">
                                        <img 
                                            src={capsule.author_avatar ? (capsule.author_avatar.startsWith('http') ? capsule.author_avatar : `${import.meta.env.VITE_API_BASE || ''}${capsule.author_avatar}`) : `https://ui-avatars.com/api/?name=${capsule.author_name}&background=random`} 
                                            alt={capsule.author_name} 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-mono text-xs text-white/40 uppercase tracking-normal font-black">TRANSMITTED_BY</p>
                                        <p className="font-display text-sm text-white font-black uppercase tracking-normal">{capsule.author_name}</p>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Seal Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/98 backdrop-blur-3xl z-[100] flex items-center justify-center p-5 md:p-6 overflow-y-auto"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 100 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 100 }}
                            className="bg-black border-4 border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-[0_0_100px_rgba(0,255,209,0.1)] relative"
                        >
                            <div className="p-8 md:p-12 relative z-10">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00FFD1] to-transparent animate-scan-slow opacity-20"></div>
                                
                                <button 
                                    onClick={() => setIsModalOpen(false)}
                                    className="absolute top-8 right-8 text-white/10 hover:text-white transition-all hover:scale-125 active:scale-95"
                                >
                                    <Plus className="rotate-45" size={48} />
                                </button>
                                
                                <h2 className="text-2xl md:text-3xl font-display font-black text-white mb-6 uppercase tracking-normaler flex items-center gap-4 leading-none">
                                    <Shield className="text-[#00FFD1] drop-shadow-[0_0_25px_#00FFD1]" size={48} />
                                    SEAL CAPSULE
                                </h2>
                                <p className="text-sm font-mono text-white/20 mb-10 font-black uppercase tracking-[0.3em] leading-relaxed">This record will be encrypted in the quantum archive until the designated timestamp.</p>

                                <form onSubmit={handleSeal} className="space-y-8">
                                    <div className="space-y-4 group">
                                        <label className="block text-xs font-mono text-white/20 group-focus-within:text-[#00FFD1] transition-colors mb-2 uppercase tracking-[0.4em] font-black ml-2">Archive Identifier</label>
                                        <input 
                                            type="text" 
                                            required
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="w-full bg-black border-2 border-white/5 rounded-xl p-6 text-white focus:border-[#00FFD1]/50 focus:outline-none transition-all text-xl font-black uppercase tracking-normal shadow-inner placeholder:text-white/5"
                                            placeholder="ARCHIVE_TITLE"
                                        />
                                    </div>
                                    
                                    <div className="space-y-4 group">
                                        <label className="block text-xs font-mono text-white/20 group-focus-within:text-[#00FFD1] transition-colors mb-2 uppercase tracking-[0.4em] font-black ml-2">Collective Memory Content</label>
                                        <textarea 
                                            required
                                            value={body}
                                            onChange={(e) => setBody(e.target.value)}
                                            rows="4"
                                            className="w-full bg-black border-2 border-white/5 rounded-xl p-6 text-white focus:border-[#00FFD1]/50 focus:outline-none transition-all text-lg font-black uppercase tracking-normal leading-tight shadow-inner placeholder:text-white/5 resize-none"
                                            placeholder="ARCHIVE_DATA_PAYLOAD..."
                                        ></textarea>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4 group">
                                            <label className="block text-xs font-mono text-white/20 group-focus-within:text-[#00FFD1] transition-colors mb-2 uppercase tracking-[0.4em] font-black ml-2">Reveal Timestamp</label>
                                            <input 
                                                type="date" 
                                                required
                                                value={unlockDate}
                                                onChange={(e) => setUnlockDate(e.target.value)}
                                                min={new Date().toISOString().split('T')[0]}
                                                className="w-full bg-black border-2 border-white/5 rounded-xl p-6 text-white focus:border-[#00FFD1]/50 focus:outline-none transition-all text-lg font-black [color-scheme:dark] shadow-inner"
                                            />
                                        </div>
                                        
                                        <div className="flex items-end pb-1">
                                            <button 
                                                type="submit"
                                                className="dimension-btn w-full !py-6 !rounded-xl flex items-center justify-center gap-4 text-xl font-black uppercase tracking-normal shadow-2xl active:scale-95"
                                            >
                                                <Send size={24} /> SEAL ARCHIVE
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Capsule;
