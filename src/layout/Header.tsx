import React, { useState } from 'react';
import { Menu, Activity, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header({ toggleSidebar }: { toggleSidebar: () => void }) {
  const { user } = useAuth();
  
  return (
    <header className="h-20 glass-panel border-b border-white/5 flex items-center justify-between px-8 sticky top-0 z-30">
      <div className="flex items-center gap-6">
        <button 
          onClick={toggleSidebar}
          className="text-indigo-200 hover:text-neon-cyan transition-colors"
        >
          <Menu size={24} />
        </button>
        
        {/* Decorative Waveform */}
        <div className="hidden md:flex gap-1 h-6 items-end">
          {[4, 8, 5, 10, 3, 7, 4].map((h, i) => (
            <div 
              key={i} 
              className="w-1 bg-neon-cyan/50 rounded-t-sm"
              style={{ height: `${h * 10}%`, animation: `pulse-slow ${Math.random() * 2 + 1}s infinite alternate` }}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative text-indigo-200 hover:text-neon-cyan transition-colors p-2">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-neon-cyan rounded-full shadow-[0_0_8px_#00f0ff] animate-ping" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-neon-cyan rounded-full" />
        </button>
        
        <div className="flex items-center gap-4 border-l border-white/10 pl-6">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-white tracking-wide">{user?.name}</p>
            <p className="text-[10px] text-neon-cyan uppercase tracking-widest flex items-center justify-end gap-1">
              <Activity size={10} /> {user?.role}
            </p>
          </div>
          <div className="w-10 h-10 border border-neon-cyan/50 bg-neon-cyan/10 rounded-lg flex items-center justify-center text-neon-cyan font-display font-bold shadow-[inset_0_0_10px_rgba(0,240,255,0.2)]">
            {user?.name?.[0]?.toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
