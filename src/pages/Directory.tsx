import React, { useEffect, useState } from 'react';
import { fetchWithAuth } from '../services/api';
import { motion } from 'motion/react';
import { Cpu, Maximize } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Directory() {
  const [alumni, setAlumni] = useState<any[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchWithAuth('/profile/alumni')
      .then(data => setAlumni(data))
      .catch((err) => console.error('Failed to fetch alumni:', err));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-display font-black text-white uppercase tracking-widest mb-1 shadow-neon-glow">Alumni Directory</h1>
        <p className="text-indigo-300 font-mono uppercase tracking-wider text-sm">Connect with alumni and mentors</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {alumni.map((node, i) => (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card hover:bg-neon-cyan/5 border-white/10 overflow-hidden group hover:border-neon-cyan/50 relative cursor-pointer"
          >
            {/* Holographic scanning effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neon-cyan/10 to-transparent -translate-y-[200%] group-hover:animate-scanline pointer-events-none" />
            
            <div className="p-6 relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-space-800 border border-white/20 rounded-xl flex items-center justify-center group-hover:border-neon-cyan transition-colors shadow-[0_0_10px_transparent] group-hover:shadow-neon-cyan/50 text-white font-display font-bold">
                  {node.name.substring(0, 2).toUpperCase()}
                </div>
                <Cpu className="text-zinc-600 group-hover:text-neon-cyan transition-colors" size={20} />
              </div>
              
              <h3 className="text-white font-display font-bold tracking-wider truncate mb-1">{node.name}</h3>
              <p className="text-indigo-300 font-mono text-xs truncate mb-6">{node.email}</p>
              
              <button 
                onClick={() => alert(`Sending mentorship request to ${node.name}...`)}
                className="w-full bg-space-900 border border-neon-cyan/30 text-neon-cyan font-mono text-xs uppercase tracking-widest py-2 rounded-lg hover:bg-neon-cyan hover:text-space-900 transition-all shadow-[0_0_5px_transparent] hover:shadow-[0_0_15px_#00f0ff]"
              >
                {user?.role === 'student' ? 'Request Mentorship' : 'View Profile'}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
