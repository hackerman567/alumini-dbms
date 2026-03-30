import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, MapPin, Target } from 'lucide-react';
import { fetchWithAuth } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    fetchWithAuth('/events')
      .then(data => setEvents(data))
      .catch((err) => console.error('Failed to fetch events:', err));
  }, []);

  const handleRegister = async (eventId: number) => {
    try {
      await fetchWithAuth(`/events/${eventId}/register`, { method: 'POST' });
      alert('Successfully registered for the event!');
    } catch (err: any) {
      alert(err.message || 'Failed to register');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end border-b border-white/10 pb-4">
        <div>
          <h1 className="text-4xl font-display font-black text-white uppercase tracking-widest mb-1 shadow-neon-glow">Events</h1>
          <p className="text-indigo-300 font-mono uppercase tracking-wider text-sm">Upcoming Gatherings</p>
        </div>
        {(user?.role === 'administrator' || user?.role === 'faculty') && (
          <button className="bg-neon-purple/20 border border-neon-purple text-neon-purple px-4 py-2 font-mono text-xs uppercase tracking-widest rounded-lg hover:bg-neon-purple hover:text-white transition-all shadow-[0_0_10px_rgba(176,38,255,0.2)] hover:shadow-[0_0_20px_rgba(176,38,255,0.6)]">
            Create Event
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {events.map((evt, i) => {
          const dt = new Date(evt.date);
          return (
            <motion.div
              key={evt.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex group"
            >
              {/* Event Date Neon Block */}
              <div className="w-24 bg-neon-purple border border-neon-purple/50 rounded-l-2xl flex flex-col items-center justify-center shadow-[0_0_20px_rgba(176,38,255,0.3)] relative overflow-hidden group-hover:shadow-[0_0_30px_rgba(176,38,255,0.6)] transition-all">
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="font-display font-black text-3xl text-white">{dt.getDate()}</span>
                <span className="font-mono text-xs font-bold text-space-900 uppercase tracking-widest">{dt.toLocaleString('default', { month: 'short' })}</span>
              </div>
              
              {/* Event Details Plate */}
              <div className="flex-1 glass-card rounded-none rounded-r-2xl border-l-0 border-white/10 p-6 relative">
                <div className="absolute top-4 right-4 text-neon-purple/40 group-hover:text-neon-purple/80 transition-colors animate-pulse">
                  <Target size={24} />
                </div>
                
                <h3 className="font-display font-bold text-xl text-white tracking-wider mb-2">{evt.title}</h3>
                <p className="text-sm font-mono text-zinc-400 mb-4 line-clamp-2">{evt.description}</p>
                
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-2 text-indigo-300 font-mono text-xs">
                    <MapPin size={14} className="text-neon-cyan" />
                    {evt.location}
                  </div>
                  <button 
                    onClick={() => handleRegister(evt.id)}
                    className="text-neon-cyan text-sm font-display font-bold uppercase tracking-widest hover:text-white transition-colors relative"
                  >
                    Register
                    <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-neon-cyan transition-all group-hover:w-full"></span>
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
