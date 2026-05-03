import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Users, Briefcase, Calendar, MessageSquare, 
    TrendingUp, Award, Clock, ArrowUpRight, Activity, Zap,
    Cpu, Globe, Shield, Radio
} from 'lucide-react';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, historyRes] = await Promise.all([
                    client.get(user.role === 'admin' ? '/reports/stats' : '/reports/stats'), // Using reports for all for parity
                    client.get('/nexus/history')
                ]);
                setStats(statsRes.data);
                setHistory(historyRes.data);
            } catch (err) {
                console.error("Error loading dashboard data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user.role]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="w-16 h-16 md:w-20 md:h-20 border-8 border-cyan-500/30 border-t-[#00FFD1] rounded-full mb-5 md:mb-6 animate-spin shadow-[0_0_30px_rgba(0,255,209,0.3)]"></div>
            <div className="font-mono text-xl text-[#00FFD1] animate-pulse uppercase tracking-normal font-black">Loading Dashboard...</div>
        </div>
    );

    const dashboardStats = [
        { label: 'TOTAL USERS', value: stats?.usersByRole?.reduce((a,b) => a + parseInt(b.count), 0) || '2.4K', icon: Users, color: '#00FFD1' },
        { label: 'OPEN JOBS', value: stats?.openJobs || '156', icon: Briefcase, color: '#BF00FF' },
        { label: 'MENTORSHIP SESSIONS', value: stats?.mentorship?.find(m => m.status === 'accepted')?.count || '842', icon: MessageSquare, color: '#FFD700' },
        { label: 'PLATFORM STATUS', value: 'ACTIVE', icon: Activity, color: '#FF2D6B' }
    ];

    return (
        <div className="space-y-16 pb-24 relative">
            <div className="scan-line"></div>
            
            {/* Anniversary Ticker */}
            {history.length > 0 && history[0].type === 'anniversary' && (
                <motion.div 
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="relative group cursor-crosshair"
                >
                    <div className="absolute -inset-2 bg-gradient-to-r from-[#00FFD1] to-[#BF00FF] rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                    <div className="relative bg-black/80 rounded-2xl p-5 md:p-6 flex items-center justify-between border-4 border-white/10 shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                        <div className="flex items-center gap-5 md:p-6">
                            <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-white/5 flex items-center justify-center text-white shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                                <Clock size={40} className="animate-spin-slow" />
                            </div>
                            <div>
                                <h4 className="font-display text-2xl font-black text-white uppercase tracking-normal">{history[0].title}</h4>
                                <p className="font-mono text-lg text-[#00FFD1] uppercase mt-2 font-black">{history[0].desc}</p>
                            </div>
                        </div>
                        <div className="px-10 py-4 rounded-2xl border-2 border-white/20 bg-black/40 font-mono text-2xl text-white font-black shadow-inner">
                            EST. {history[0].year}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Main Welcome Header */}
            <header className="relative quantum-card rounded-3xl border-4 border-white/5 p-0 overflow-hidden shadow-2xl">
                {/* Background removed to be less annoying */}
                
                <div className="p-20 md:p-24 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 md:p-8">
                    <div className="space-y-12 text-center md:text-left">
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-5 px-8 py-3 rounded-2xl bg-white/5 border-2 border-white/10 font-mono text-sm text-[#00FFD1] tracking-normal uppercase font-black shadow-[0_0_20px_rgba(0,255,209,0.2)]"
                        >
                            <span className="w-4 h-4 rounded-full bg-[#00FFD1] animate-pulse shadow-[0_0_10px_#00FFD1]"></span>
                            SYSTEM STATUS: ACTIVE
                        </motion.div>
                        <motion.h1 
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-2xl md:text-3xl md:text-3xl md:text-4xl md:text-9xl font-display font-black text-white leading-none tracking-normaler"
                        >
                            {user?.role?.toUpperCase() || 'ALUMNI'} <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FFD1] to-[#BF00FF]">DASHBOARD</span>
                        </motion.h1>
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="font-mono text-xl text-white uppercase tracking-normal max-w-2xl mx-auto md:mx-0 leading-relaxed font-black"
                        >
                            Welcome back, {user.name}. Portal synchronization complete.
                        </motion.p>
                    </div>

                    <div className="relative group w-64 h-64 md:w-80 md:h-80 rounded-3xl overflow-hidden border-4 border-white/10 shadow-[0_0_40px_rgba(0,255,209,0.2)]">
                        <img 
                            src="/alumni_network.png" 
                            alt="Alumni Network Illustration" 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#00FFD1]/20 to-[#BF00FF]/20 mix-blend-overlay"></div>
                    </div>
                </div>
            </header>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-5">
                {dashboardStats.map((stat, i) => (
                    <StatsCard key={stat.label} {...stat} index={i} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:p-6">
                {/* Recent Activity */}
                <section className="lg:col-span-7 quantum-card rounded-3xl border-4 border-white/5 h-full p-6 md:p-8 shadow-2xl">
                    <div className="flex items-center justify-between mb-20">
                        <div className="space-y-4">
                            <h3 className="font-display text-4xl font-black tracking-normal text-white uppercase">Activity Feed</h3>
                            <p className="font-mono text-sm text-[#00FFD1] uppercase tracking-normal font-black">Live Pulse</p>
                        </div>
                        <Activity className="text-[#00FFD1] animate-pulse drop-shadow-[0_0_15px_#00FFD1]" size={40} />
                    </div>

                    <div className="space-y-12">
                        <LogEntry icon={<Users />} title="NEW MEMBER" desc="Sarah Chen just joined the community" time="04:21 PM" color="#00FFD1" />
                        <LogEntry icon={<Briefcase />} title="JOB POSTED" desc="New Opportunity: Senior Software Engineer at TechCorp" time="03:45 PM" color="#BF00FF" />
                        <LogEntry icon={<Shield />} title="SECURITY UPDATE" desc="Platform security layers have been reinforced" time="01:12 PM" color="#FF2D6B" />
                        <LogEntry icon={<Globe />} title="NEW CONNECTION" desc="A new mentorship connection was established" time="Yesterday" color="#FFD700" />
                    </div>
                </section>

                {/* Quick Actions */}
                <div className="lg:col-span-5 space-y-12">
                    <section className="quantum-card rounded-3xl border-4 border-white/10 group hover:border-[#BF00FF]/40 p-6 md:p-8 shadow-2xl transition-all duration-500">
                        <div className="flex items-center gap-4 md:gap-5 mb-5 md:mb-6">
                            <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-[#BF00FF]/10 flex items-center justify-center text-[#BF00FF] group-hover:scale-110 transition-transform duration-500 shadow-[0_0_20px_rgba(191,0,255,0.3)]">
                                <Award size={40} />
                            </div>
                            <h3 className="font-display text-3xl font-black text-white uppercase tracking-normal">Profile Boost</h3>
                        </div>
                        <p className="font-mono text-xl text-slate-400 mb-6 md:mb-8 leading-relaxed font-black uppercase">Increase your visibility to the community and get noticed by top members.</p>
                        <button onClick={() => alert('Profile Boosted! Visibility increased by 200% in the dimensional rift.')} className="dimension-btn w-full !py-8 rounded-xl !bg-[#BF00FF] !text-white hover:!bg-[#A000D0] transition-colors text-2xl font-black uppercase tracking-normal shadow-[0_20px_50px_rgba(191,0,255,0.3)] active:scale-95">
                            Boost Signal
                        </button>
                    </section>

                    <section className="quantum-card rounded-3xl border-4 border-white/5 p-6 md:p-8 shadow-2xl">
                        <h3 className="font-mono text-sm text-[#00FFD1] uppercase tracking-normal mb-6 md:mb-8 font-black">System Diagnostics</h3>
                        <div className="space-y-12">
                            <StatusItem label="Data Core" status="STABLE" />
                            <StatusItem label="Network Bridge" status="ACTIVE" />
                            <StatusItem label="Platform Sync" status="SYNCHRONIZED" />
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

const StatsCard = ({ icon: Icon, label, value, color, index }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 + (index * 0.1) }}
        className="bg-slate-900 rounded-2xl border-4 border-white/5 flex flex-col items-center text-center group hover:-translate-y-2 p-5 md:p-6 transition-all duration-500 hover:shadow-2xl relative overflow-hidden"
    >
        <div className="p-6 rounded-xl bg-white/[0.03] border-2 border-white/5 mb-10 group-hover:border-[var(--orb-color)] transition-all duration-500 shadow-xl" style={{ '--orb-color': color }}>
            <Icon size={48} style={{ color }} />
        </div>
        <div className="text-3xl md:text-4xl font-display font-black text-white mb-4 tracking-normaler">{value}</div>
        <div className="font-mono text-sm text-slate-500 uppercase tracking-normal font-black">{label}</div>
        
        {/* Glow Shadow */}
        <div className="absolute inset-x-0 -bottom-12 h-24 bg-[var(--orb-color)] opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500" style={{ '--orb-color': color }}></div>
    </motion.div>
);

const LogEntry = ({ icon, title, desc, time, color }) => (
    <div className="flex gap-4 md:gap-5 group cursor-pointer">
        <div className="w-16 h-16 rounded-xl bg-white/[0.02] border-2 border-white/5 flex items-center justify-center shrink-0 group-hover:bg-[var(--entry-color)]/10 group-hover:border-[var(--entry-color)]/30 transition-all duration-500 shadow-lg" style={{ '--entry-color': color }}>
            {React.cloneElement(icon, { size: 28, style: { color } })}
        </div>
        <div className="flex-1 pb-12 border-b-2 border-white/5 group-last:border-none">
            <div className="flex justify-between items-start mb-4">
                <span className="font-mono text-sm font-black tracking-normal uppercase" style={{ color }}>{title}</span>
                <span className="font-mono text-sm text-slate-500 font-black tracking-normal">{time}</span>
            </div>
            <p className="font-body text-lg text-slate-400 group-hover:text-slate-200 transition-colors duration-300 leading-relaxed font-medium">{desc}</p>
        </div>
    </div>
);

const StatusItem = ({ label, status }) => (
    <div className="flex items-center justify-between">
        <span className="text-lg font-body text-slate-400 font-bold">{label}</span>
        <div className="flex items-center gap-4">
            <div className="w-3 h-3 rounded-full bg-[#00FFD1] animate-pulse shadow-[0_0_10px_#00FFD1]"></div>
            <span className="font-mono text-sm text-[#00FFD1] font-black tracking-normal uppercase">{status}</span>
        </div>
    </div>
);

export default Dashboard;

