import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, User, Hexagon, Check, Terminal, Cpu, Briefcase, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import client from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';

const Topbar = ({ onToggleSidebar }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState(null);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (!user) return;
        client.get('/notifications').then(res => {
            if (res?.success) setNotifications(res.data || []);
            else if (Array.isArray(res?.data)) setNotifications(res.data);
        }).catch(err => console.error('Topbar notification fetch:', err));
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Global Search Debounce
    useEffect(() => {
        if (searchQuery.length < 2) {
            setSearchResults(null);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setIsSearching(true);
            try {
                const res = await client.get(`/search?q=${searchQuery}`);
                if (res.success) setSearchResults(res.results);
            } catch (err) {
                console.error("Search failed:", err);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const markAllRead = () => {
        client.put('/notifications/read-all').then(() => {
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        });
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const getPageName = () => {
        const path = location.pathname.split('/')[1] || 'Dashboard';
        return path.replace('-', ' ').toUpperCase();
    };

    return (
        <header className="h-20 lg:h-28 px-6 lg:px-16 flex items-center justify-between bg-[#050510]/60 backdrop-blur-3xl border-b border-white/5 sticky top-0 z-[150] gap-4">
            {/* Mobile Toggle & Path */}
            <div className="flex items-center gap-4 lg:gap-6 shrink-0">
                <button 
                    onClick={onToggleSidebar}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 text-white lg:hidden active:scale-95 transition-all"
                >
                    <Terminal size={20} />
                </button>
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-white/[0.03] border-2 border-white/10 flex items-center justify-center text-[#00FFD1] shadow-lg">
                    <User size={20} />
                </div>
                <div className="space-y-0.5 hidden sm:block">
                    <div className="font-mono text-[10px] lg:text-sm text-slate-500 uppercase tracking-normal font-black">CURRENT LOCATION</div>
                    <div className="font-display text-base lg:text-lg font-black tracking-normal text-white flex items-center gap-2 lg:gap-3">
                        HOME <span className="text-white/20">/</span> <span className="text-[#00FFD1]">{getPageName()}</span>
                    </div>
                </div>
            </div>

            {/* Global Search */}
            <div className="flex-1 max-w-3xl hidden md:block relative">
                <div className="relative group">
                    <Search size={24} className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-[#00FFD1] transition-colors" />
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search members, professional opportunities, or events..." 
                        className="w-full bg-black/40 border-2 border-white/5 rounded-xl py-5 pl-20 pr-10 text-base font-mono text-white placeholder:text-slate-700 focus:outline-none focus:border-[#00FFD1]/30 focus:bg-white/[0.04] transition-all shadow-inner"
                    />
                    {isSearching && (
                        <div className="absolute right-24 top-1/2 -translate-y-1/2">
                            <div className="w-6 h-6 border-2 border-[#00FFD1] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-xl bg-white/5 border border-white/10 font-mono text-sm text-slate-600 font-black tracking-normal">SEARCH</div>
                </div>

                <AnimatePresence>
                    {searchResults && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute top-full left-0 right-0 mt-4 bg-[#080818]/95 backdrop-blur-3xl border-2 border-white/10 rounded-2xl shadow-[0_40px_80px_rgba(0,0,0,0.8)] overflow-hidden z-[200] max-h-[600px] overflow-y-auto custom-scrollbar"
                        >
                            {/* Users Section */}
                            {searchResults.users?.length > 0 && (
                                <div className="p-6">
                                    <div className="font-mono text-xs text-white/20 uppercase tracking-widest mb-4">MEMBERS</div>
                                    <div className="space-y-4">
                                        {searchResults.users.map(u => (
                                            <div key={u.id} onClick={() => { navigate(`/profile/${u.id}`); setSearchQuery(''); }} className="flex items-center gap-5 p-4 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group">
                                                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-display text-lg text-white">
                                                    {u.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="text-white font-black uppercase tracking-normal group-hover:text-[#00FFD1] transition-colors">{u.name}</div>
                                                    <div className="font-mono text-xs text-slate-500 uppercase">{u.role}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Jobs Section */}
                            {searchResults.jobs?.length > 0 && (
                                <div className="p-6 border-t border-white/5">
                                    <div className="font-mono text-xs text-white/20 uppercase tracking-widest mb-4">OPPORTUNITIES</div>
                                    <div className="space-y-4">
                                        {searchResults.jobs.map(j => (
                                            <div key={j.id} onClick={() => { navigate('/jobs'); setSearchQuery(''); }} className="flex items-center gap-5 p-4 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group">
                                                <div className="w-12 h-12 rounded-xl bg-[#BF00FF]/10 border border-[#BF00FF]/30 flex items-center justify-center text-[#BF00FF]">
                                                    <Briefcase size={20} />
                                                </div>
                                                <div>
                                                    <div className="text-white font-black uppercase tracking-normal group-hover:text-[#BF00FF] transition-colors">{j.title}</div>
                                                    <div className="font-mono text-xs text-slate-500 uppercase">{j.company} • {j.type}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Events Section */}
                            {searchResults.events?.length > 0 && (
                                <div className="p-6 border-t border-white/5">
                                    <div className="font-mono text-xs text-white/20 uppercase tracking-widest mb-4">TIMELINE EVENTS</div>
                                    <div className="space-y-4">
                                        {searchResults.events.map(e => (
                                            <div key={e.id} onClick={() => { navigate('/events'); setSearchQuery(''); }} className="flex items-center gap-5 p-4 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group">
                                                <div className="w-12 h-12 rounded-xl bg-[#00FFD1]/10 border border-[#00FFD1]/30 flex items-center justify-center text-[#00FFD1]">
                                                    <Calendar size={20} />
                                                </div>
                                                <div>
                                                    <div className="text-white font-black uppercase tracking-normal group-hover:text-[#00FFD1] transition-colors">{e.title}</div>
                                                    <div className="font-mono text-xs text-slate-500 uppercase">{e.event_type} @ {e.venue}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {searchResults.users.length === 0 && searchResults.jobs.length === 0 && searchResults.events.length === 0 && (
                                <div className="p-20 text-center">
                                    <div className="font-mono text-sm text-slate-600 uppercase font-black">NO RESULTS DETECTED IN THIS TIMELINE</div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-4 md:gap-5">
                <div className="relative" ref={dropdownRef}>
                    <button 
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="relative p-5 rounded-2xl bg-white/[0.03] border-2 border-white/5 text-slate-400 hover:text-[#00FFD1] hover:border-[#00FFD1]/20 transition-all focus:outline-none shadow-xl"
                    >
                        <Bell size={24} />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-6 h-6 bg-[#FF2D6B] rounded-full border-2 border-[#050510] flex items-center justify-center text-sm font-black text-white shadow-lg">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    <AnimatePresence>
                        {showDropdown && (
                            <motion.div 
                                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                                className="absolute right-0 mt-6 w-[450px] bg-slate-900 border-2 border-white/10 rounded-2xl p-0 shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden"
                            >
                                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                                    <h3 className="font-display text-xl text-white font-black tracking-normal uppercase">Notifications</h3>
                                    {unreadCount > 0 && (
                                        <button onClick={markAllRead} className="text-[#00FFD1] hover:text-white transition-colors p-2 bg-cyan-500/10 rounded-xl" title="Mark All Read">
                                            <Check size={24} />
                                        </button>
                                    )}
                                </div>
                                <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                                    {notifications.length === 0 ? (
                                        <div className="p-20 text-center">
                                            <Bell size={48} className="mx-auto text-slate-800 mb-6 opacity-20" />
                                            <p className="font-mono text-sm text-slate-600 uppercase tracking-normal font-black">No new notifications</p>
                                        </div>
                                    ) : (
                                        notifications.map(notif => (
                                            <div key={notif.id} className={`p-8 border-b border-white/5 transition-all hover:bg-white/[0.02] cursor-pointer ${!notif.is_read ? 'bg-[#00FFD1]/5' : ''}`}>
                                                <div className="flex items-start justify-between mb-4">
                                                    <span className={`font-black text-sm font-display tracking-normal uppercase ${notif.type.includes('mentorship') ? 'text-[#BF00FF]' : 'text-[#00FFD1]'}`}>
                                                        {notif.title}
                                                    </span>
                                                    <span className="font-mono text-sm text-slate-600 font-black">{new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                                <p className="text-base text-slate-400 font-body leading-relaxed font-medium">{notif.body}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                
                <div 
                    onClick={() => navigate('/profile')}
                    className="flex items-center gap-4 md:gap-5 pl-10 border-l-2 border-white/5 cursor-pointer group hover:opacity-80 transition-all"
                >
                    <div className="text-right hidden sm:block">
                        <div className="text-lg font-black text-white font-display tracking-normal uppercase">{user?.name}</div>
                        <div className="text-sm font-mono text-slate-500 uppercase tracking-normal flex items-center justify-end gap-3 font-black mt-1">
                            <span className="w-2 h-2 rounded-full bg-[#BF00FF] animate-pulse shadow-[0_0_8px_#BF00FF]"></span>
                            {user?.role} ACCOUNT
                        </div>
                    </div>
                    
                    <div className="relative group p-1.5">
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#00FFD1] to-[#BF00FF] rounded-xl opacity-20 blur group-hover:opacity-50 transition-opacity"></div>
                        <div className="w-16 h-16 rounded-[1.8rem] bg-[#05070a] border-2 border-white/10 relative overflow-hidden flex items-center justify-center p-1 shadow-2xl">
                            {user?.avatar_url ? (
                                <img 
                                    src={user.avatar_url.startsWith('http') ? user.avatar_url : `${import.meta.env.VITE_API_BASE || ''}${user.avatar_url}`} 
                                    alt="profile" 
                                    className="w-full h-full object-cover rounded-[1.4rem]" 
                                />
                            ) : (
                                <span className="text-3xl font-black text-white font-display">{user?.name?.charAt(0)}</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Topbar;
