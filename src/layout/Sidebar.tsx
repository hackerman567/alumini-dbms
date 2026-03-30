import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, Search, Calendar, Briefcase, MessageSquare, User as UserIcon, LogOut, Hexagon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  view: string;
  setView: (v: string) => void;
  isOpen: boolean;
}

export default function Sidebar({ view, setView, isOpen }: SidebarProps) {
  const { logout, user } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Users, roles: ['student', 'alumni', 'mentor', 'administrator'] },
    { id: 'users', label: 'User Management', icon: Users, roles: ['administrator'] },
    { id: 'directory', label: 'Alumni Directory', icon: Search, roles: ['student', 'alumni', 'mentor', 'administrator'] },
    { id: 'events', label: 'Events', icon: Calendar, roles: ['student', 'alumni', 'mentor', 'administrator'] },
    { id: 'jobs', label: 'Job Board', icon: Briefcase, roles: ['student', 'alumni', 'administrator'] },
    { id: 'mentorship', label: 'Mentorship', icon: MessageSquare, roles: ['student', 'alumni', 'mentor', 'administrator'] },
    { id: 'profile', label: 'My Profile', icon: UserIcon, roles: ['student', 'alumni', 'mentor', 'administrator'] },
  ].filter(item => item.roles.includes(user?.role || ''));

  return (
    <motion.aside 
      animate={{ width: isOpen ? 256 : 80 }}
      className="h-screen glass-panel flex flex-col border-r border-neon-cyan/20 relative z-40 overflow-hidden"
    >
      <div className="p-6 flex items-center gap-4">
        <div className="w-10 h-10 bg-neon-cyan/20 border border-neon-cyan rounded-xl flex items-center justify-center text-neon-cyan shadow-[0_0_15px_rgba(0,240,255,0.4)]">
          <Hexagon size={24} />
        </div>
        <AnimatePresence>
          {isOpen && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="font-display font-bold text-lg tracking-widest text-white neon-text-cyan flex-shrink-0"
            >
              ALUMNI CONNECT
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2 relative">
        {menuItems.map((item) => {
          const active = view === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 relative group overflow-hidden ${
                active ? 'text-neon-cyan bg-neon-cyan/10' : 'text-indigo-200 hover:text-white hover:bg-white/5'
              }`}
            >
              {active && (
                <motion.div 
                  layoutId="active-nav"
                  className="absolute left-0 top-0 w-1 h-full bg-neon-cyan shadow-[0_0_10px_#00f0ff]"
                />
              )}
              <item.icon size={20} className={active ? 'drop-shadow-[0_0_8px_#00f0ff]' : ''} />
              
              <AnimatePresence>
                {isOpen && (
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="font-medium tracking-wide whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Hover sweep effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[scanline_1.5s_linear_infinite]" />
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <button 
          onClick={logout}
          className="w-full flex items-center gap-4 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all group"
        >
          <LogOut size={20} className="group-hover:drop-shadow-[0_0_8px_#f87171]" />
          <AnimatePresence>
            {isOpen && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-bold tracking-wide"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}
