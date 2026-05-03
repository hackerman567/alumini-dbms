import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Star, ShieldCheck, Hexagon, Zap } from 'lucide-react';
import client from '../api/client';

const HallOfFame = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await client.get('/achievements/leaderboard');
                if (res.success) {
                    setLeaderboard(res.data);
                }
            } catch (err) {
                console.error("Failed to load leaderboard data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    const getRankIcon = (index) => {
        if (index === 0) return <Trophy className="text-[#FFD700]" size={32} />;
        if (index === 1) return <Medal className="text-[#C0C0C0]" size={32} />;
        if (index === 2) return <Medal className="text-[#CD7F32]" size={32} />;
        return <Star className="text-slate-600" size={24} />;
    };

    return (
        <div className="max-w-7xl mx-auto space-y-20 pb-24 relative">
            <div className="scan-line"></div>
            
            <div className="text-center space-y-10">
                <h1 className="text-2xl md:text-3xl md:text-3xl md:text-4xl font-display font-black text-white tracking-normaler uppercase leading-none drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                    Hall of Fame
                </h1>
                <p className="font-mono text-2xl text-[#00FFD1] tracking-normal uppercase font-black">
                    Our Top Contributors & Community Leaders
                </p>
                <div className="w-64 h-3 bg-gradient-to-r from-transparent via-[#00FFD1]/30 to-transparent mx-auto mt-12 rounded-full"></div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-16 md:py-20">
                    <div className="w-16 h-16 md:w-20 md:h-20 portal-ring mb-5 md:mb-6 flex items-center justify-center">
                         <div className="w-12 h-12 bg-[#00FFD1] rounded-full animate-pulse shadow-[0_0_20px_#00FFD1]"></div>
                    </div>
                    <span className="font-mono text-2xl text-[#00FFD1] animate-pulse uppercase tracking-normal font-black">Scanning Leaderboard...</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:p-8">
                    {/* Top 3 Podium */}
                    <div className="lg:col-span-5 space-y-12">
                        <h3 className="font-display text-2xl font-black text-[#BF00FF] tracking-normal uppercase mb-6 md:mb-8 flex items-center gap-6">
                            <Trophy size={36} /> TOP LEADERS
                        </h3>
                        {leaderboard.slice(0, 3).map((alumni, idx) => (
                            <motion.div 
                                key={alumni.id}
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="quantum-card relative flex items-center gap-5 md:p-6 group hover:border-[#BF00FF]/50 !p-14 rounded-3xl border-4 border-white/5 transition-all shadow-2xl hover:shadow-[0_25px_60px_rgba(191,0,255,0.15)] bg-black/40"
                            >
                                <div className="absolute top-10 right-10 drop-shadow-[0_0_15px_rgba(255,215,0,0.3)] scale-125">{getRankIcon(idx)}</div>
                                <div className="w-40 h-40 rounded-2xl overflow-hidden border-4 border-white/10 group-hover:border-[#BF00FF]/50 transition-all shadow-2xl relative">
                                    <img 
                                        src={alumni.avatar_url ? `${import.meta.env.VITE_API_BASE}${alumni.avatar_url}` : `https://ui-avatars.com/api/?name=${alumni.name}&background=000000&color=BF00FF&bold=true`} 
                                        alt={alumni.name}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="font-display text-4xl font-black text-white uppercase tracking-normal group-hover:text-[#BF00FF] transition-colors">{alumni.name}</h4>
                                    <div className="flex items-center gap-5">
                                        <Star size={24} className="text-[#BF00FF] fill-[#BF00FF]" />
                                        <span className="font-mono text-base text-[#BF00FF] uppercase font-black tracking-normal bg-purple-500/10 px-6 py-2 rounded-xl border-2 border-purple-500/30 shadow-lg">{alumni.badge_count} BADGES</span>
                                    </div>
                                    <p className="font-mono text-sm text-white/30 uppercase font-black tracking-normal pt-3 border-t-2 border-white/5">{alumni.role}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Remaining Leaderboard Table */}
                    <div className="lg:col-span-7">
                        <div className="quantum-card !p-0 overflow-hidden border-4 border-white/5 rounded-3xl shadow-2xl bg-black/40">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-black/60 border-b-4 border-white/5">
                                    <tr>
                                        <th className="p-5 md:p-6 font-mono text-sm text-white/20 uppercase tracking-normal font-black">Rank</th>
                                        <th className="p-5 md:p-6 font-mono text-sm text-white/20 uppercase tracking-normal font-black">Member</th>
                                        <th className="p-5 md:p-6 font-mono text-sm text-white/20 uppercase tracking-normal font-black">Badges</th>
                                        <th className="p-5 md:p-6 font-mono text-sm text-white/20 uppercase tracking-normal font-black">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaderboard.slice(3).map((alumni, idx) => (
                                        <tr key={alumni.id} className="border-b-2 border-white/5 hover:bg-white/[0.03] transition-all group">
                                            <td className="p-5 md:p-6">
                                                <span className="font-display text-2xl md:text-3xl font-black text-white/10 group-hover:text-[#00FFD1] transition-colors tracking-normaler">#{idx + 4}</span>
                                            </td>
                                            <td className="p-5 md:p-6">
                                                <div className="flex items-center gap-8">
                                                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-[1.8rem] overflow-hidden border-4 border-white/10 group-hover:border-[#00FFD1]/50 transition-all shadow-xl">
                                                        <img 
                                                            src={alumni.avatar_url ? `${import.meta.env.VITE_API_BASE}${alumni.avatar_url}` : `https://ui-avatars.com/api/?name=${alumni.name}&background=000000&color=00FFD1&bold=true`} 
                                                            alt={alumni.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="font-black text-3xl text-white uppercase tracking-normal group-hover:text-[#00FFD1] transition-colors">{alumni.name}</div>
                                                        <div className="text-sm text-white/20 uppercase font-black tracking-normal">{alumni.role}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5 md:p-6">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center border-4 border-white/5 shadow-lg group-hover:border-[#00FFD1]/30 transition-all">
                                                        <span className="text-white font-mono text-2xl font-black">{alumni.badge_count}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5 md:p-6">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-4 h-4 rounded-full bg-[#00FFD1] animate-pulse shadow-[0_0_15px_#00FFD1]"></div>
                                                    <span className="font-mono text-sm text-[#00FFD1] uppercase tracking-normal font-black">ACTIVE</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {leaderboard.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="p-40 text-center font-mono text-white/10 uppercase tracking-normal font-black">
                                                <div className="flex flex-col items-center gap-8">
                                                    <Star size={64} className="opacity-10" />
                                                    <span className="text-xl">No leaders discovered yet...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HallOfFame;
