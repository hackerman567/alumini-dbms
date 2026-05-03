import React, { useEffect, useState, useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import client from '../api/client';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';

const socket = io(import.meta.env.VITE_API_BASE?.replace('/api/v1', '') || 'http://localhost:5000');

const StarField = React.memo(() => {
    const stars = useMemo(() => [...Array(150)].map((_, i) => ({
        id: i,
        size: Math.random() * 2,
        top: Math.random() * 100 + '%',
        left: Math.random() * 100 + '%',
        delay: Math.random() * 5
    })), []);

    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-[#00000A]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(191,0,255,0.05)_0%,transparent_70%)] animate-pulse"></div>
            {stars.map((star) => (
                <motion.div 
                    key={star.id}
                    initial={{ opacity: 0.1 }}
                    animate={{ opacity: [0.1, 0.5, 0.1] }}
                    transition={{ duration: 3 + star.delay, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bg-white rounded-full"
                    style={{
                        width: star.size + 'px',
                        height: star.size + 'px',
                        top: star.top,
                        left: star.left,
                        boxShadow: `0 0 ${star.size * 5}px #fff`
                    }}
                />
            ))}
        </div>
    );
});

const Layout = () => {
    const location = useLocation();
    const [events, setEvents] = useState([]);

    useEffect(() => {
        socket.on('live_event', (data) => {
            setEvents(prev => [data, ...prev].slice(0, 10)); // Keep last 10
        });
        return () => socket.off('live_event');
    }, []);

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            navigator.serviceWorker.register('/sw.js').then(async (registration) => {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    const subscription = await registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY
                    });
                    
                    // Send to backend
                    client.post('/push/subscribe', subscription).catch(err => {
                        console.error('Failed to save push subscription', err);
                    });
                }
            }).catch(err => console.error("Service Worker registration failed: ", err));
        }
    }, []);

    return (
        <div className="flex min-h-screen !cursor-none">
            <StarField />

            {/* Global Scan Line */}
            <div className="scan-line"></div>

            <Sidebar />
            
            <div className="flex-1 flex flex-col min-h-screen relative overflow-hidden">
                <Topbar />
                <main className="flex-1 relative overflow-y-auto custom-scrollbar pb-20">
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={location.pathname} 
                            initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
                            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, scale: 1.02, filter: 'blur(10px)' }}
                            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                            className="p-8 lg:p-5 md:p-6"
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>

            {/* Ticker Bar */}
            <div className="fixed bottom-0 left-0 w-full h-[40px] bg-black/90 border-t border-white/5 flex items-center overflow-hidden z-50">
                <div className="px-4 border-r border-white/10 h-full flex items-center bg-[#080818] z-10 shrink-0">
                    <span className="font-display text-sm text-[#00FFD1] font-bold tracking-normal uppercase">NEXUS FEED</span>
                </div>
                <div className="flex-1 overflow-hidden whitespace-nowrap relative h-full flex items-center px-4">
                    <div className="flex gap-5 md:p-6 items-center animate-[ticker_20s_linear_infinite] hover:[animation-play-state:paused]">
                        {events.map((ev, i) => (
                            <div key={i} className="font-mono text-sm uppercase tracking-normal flex items-center gap-3">
                                <span className="w-1.5 h-1.5 rounded-full" style={{ 
                                    backgroundColor: ev.type === 'job' ? '#00FFD1' : 
                                                    ev.type === 'mentorship' ? '#BF00FF' : 
                                                    ev.type === 'poll' ? '#FFD700' :
                                                    ev.type === 'badge' ? '#FF2D6B' : '#FF8C00' 
                                }}></span>
                                <span className={
                                    ev.type === 'job' ? 'text-[#00FFD1]' : 
                                    ev.type === 'mentorship' ? 'text-[#BF00FF]' : 
                                    ev.type === 'poll' ? 'text-[#FFD700]' :
                                    ev.type === 'badge' ? 'text-[#FF2D6B]' : 'text-[#FF8C00]'
                                }>
                                    {ev.message}
                                </span>
                            </div>
                        ))}
                        {events.length === 0 && <span className="font-mono text-sm text-slate-600 uppercase tracking-normal">SCANNING TIMELINES FOR NEW ACTIVITY...</span>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Layout;
