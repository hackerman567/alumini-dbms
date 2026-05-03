import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    LayoutDashboard, Users, MessageSquare, Briefcase, 
    Calendar, Heart, Bell, ShieldCheck, LogOut, Clock, Trophy, Vote, Cpu,
    GraduationCap
} from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const menuItems = [
        { name: 'DASHBOARD', path: '/dashboard', icon: LayoutDashboard, color: '#00FFD1', roles: ['student', 'alumni', 'admin', 'faculty', 'mentor'] },
        { name: 'ACHIEVEMENTS', path: '/hall-of-fame', icon: Trophy, color: '#FFD700', roles: ['student', 'alumni', 'admin', 'faculty'] },
        { name: 'TIME CAPSULE', path: '/capsule', icon: Clock, color: '#BF00FF', roles: ['student', 'alumni', 'admin', 'faculty'] },
        { name: 'DIRECTORY', path: '/directory', icon: Users, color: '#00BFFF', roles: ['student', 'alumni', 'admin', 'faculty'] },
        { name: 'MENTORSHIP', path: '/mentorship', icon: GraduationCap, color: '#FF8C00', roles: ['student', 'alumni', 'mentor', 'admin'] },
        { name: 'MESSAGES', path: '/messages', icon: MessageSquare, color: '#00FFD1', roles: ['student', 'alumni', 'admin', 'mentor'] },
        { name: 'POLLS', path: '/polls', icon: Vote, color: '#BF00FF', roles: ['student', 'alumni', 'admin', 'faculty'] },
        { name: 'RESUME ANALYZER', path: '/resume-analyzer', icon: Cpu, color: '#00FFD1', roles: ['student', 'alumni', 'admin'] },
        { name: 'JOB BOARD', path: '/jobs', icon: Briefcase, color: '#8A2BE2', roles: ['student', 'alumni', 'admin'] },
        { name: 'EVENTS', path: '/events', icon: Calendar, color: '#FFD700', roles: ['student', 'alumni', 'admin', 'faculty'] },
        { name: 'DONATIONS', path: '/donations', icon: Heart, color: '#FF2D6B', roles: ['alumni', 'admin'] },
        { name: 'NOTIFICATIONS', path: '/notifications', icon: Bell, color: '#00FF7F', roles: ['student', 'alumni', 'admin', 'faculty'] },
        { name: 'ADMIN PANEL', path: '/admin', icon: ShieldCheck, color: '#FF0000', roles: ['admin'] },
    ];

    const filteredItems = menuItems.filter(item => item.roles.includes(user?.role));

    return (
        <aside className="w-[300px] h-screen bg-[#050510]/80 backdrop-blur-3xl border-r border-white/5 flex flex-col sticky top-0 z-[100] overflow-hidden shrink-0">
            {/* Logo Area */}
            <div className="p-10 border-b border-white/5 relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-[#00FFD1]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex items-center gap-6 relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-[#00FFD1]/10 border-2 border-[#00FFD1]/30 flex items-center justify-center p-1 shadow-lg shadow-cyan-500/10">
                        <div className="w-full h-full rounded-xl bg-[#00000A] flex items-center justify-center font-display font-black text-[#00FFD1] text-lg">AC</div>
                    </div>
                    <div>
                        <h1 className="font-display text-xl font-black tracking-tight text-white uppercase leading-none">Alumni <br/><span className="text-[#00FFD1]">Connect</span></h1>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="w-2 h-2 rounded-full bg-[#00FFD1] animate-pulse"></span>
                            <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest font-black">System Online</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto custom-scrollbar">
                {filteredItems.map(item => (
                    <NavLink 
                        key={item.path} 
                        to={item.path} 
                        className={({ isActive }) => `
                            flex items-center gap-5 px-6 py-4 rounded-2xl transition-all duration-300 group relative
                            ${isActive ? 'bg-white/[0.05] border border-white/5' : 'hover:bg-white/[0.02]'}
                        `}
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon 
                                    size={22} 
                                    className={`transition-all duration-300 ${isActive ? 'scale-110' : 'opacity-40 group-hover:opacity-100 group-hover:scale-110'}`} 
                                    style={{ color: isActive ? item.color : 'currentColor' }} 
                                                                />
                                <span className={`font-mono text-[12px] font-bold tracking-[0.1em] transition-colors ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}>
                                    {item.name}
                                </span>
                                {isActive && (
                                    <motion.div 
                                        layoutId="sidebar-active"
                                        className="absolute left-0 w-1 h-6 bg-[var(--item-color)] rounded-r-full"
                                        style={{ '--item-color': item.color }}
                                    />
                                )}
                                {item.roles.includes('admin') && !isActive && <div className="w-1 h-1 rounded-full bg-red-500 ml-auto opacity-40"></div>}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Sidebar Footer */}
            <div className="p-10 border-t border-white/5 bg-black/20">
                <div className="mb-8 space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-slate-600 uppercase tracking-widest">Local Time</span>
                        <div className="w-1 h-1 rounded-full bg-[#00FFD1] animate-ping"></div>
                    </div>
                    <div className="font-mono text-2xl text-white font-black tracking-widest">
                        {time.toLocaleTimeString([], { hour12: false })}
                    </div>
                </div>
                
                <button 
                    onClick={logout} 
                    className="flex items-center gap-4 text-slate-500 hover:text-red-400 transition-all duration-300 w-full group py-2"
                >
                    <div className="p-2 rounded-lg bg-white/5 group-hover:bg-red-400/10 transition-colors">
                        <LogOut size={18} />
                    </div>
                    <span className="font-mono text-[11px] font-bold tracking-widest uppercase">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
