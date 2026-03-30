import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { User, Activity, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchWithAuth } from '../services/api';

export default function Mentorship() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    fetchWithAuth('/mentorship/requests')
      .then(data => setRequests(data))
      .catch((err) => console.error('Failed to fetch requests:', err));
  }, []);

  const handleRespond = async (requestId: number, status: string) => {
    try {
      await fetchWithAuth('/mentorship/respond', {
        method: 'POST',
        body: JSON.stringify({ request_id: requestId, status })
      });
      setRequests(prev => prev.filter(r => r.id !== requestId));
      alert(`Request ${status} successfully!`);
    } catch (err: any) {
      alert(err.message || 'Failed to update request');
    }
  };

  if (user?.role === 'student') {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center space-y-8">
        <motion.div 
          animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="w-32 h-32 mx-auto rounded-full border-4 border-neon-cyan flex items-center justify-center text-neon-cyan shadow-[0_0_40px_rgba(0,240,255,0.4)] bg-neon-cyan/10"
        >
          <Activity size={48} />
        </motion.div>
        <div>
          <h1 className="text-3xl font-display font-black text-white uppercase tracking-widest mb-4">Mentorship Hub</h1>
          <p className="text-indigo-300 font-mono text-sm uppercase max-w-lg mx-auto leading-relaxed border-l border-neon-cyan/50 pl-4 text-left">
            To find a mentor, please visit the <span className="text-neon-cyan font-bold">ALUMNI DIRECTORY</span> and send a mentorship request.
          </p>
        </div>
      </div>
    );
  }

  // Alumni / Mentor View
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-display font-black text-white uppercase tracking-widest mb-1 shadow-[0_0_10px_rgba(79,70,229,0.8)] text-neon-indigo">Mentorship Requests</h1>
        <p className="text-indigo-300 font-mono uppercase tracking-wider text-sm">Pending requests from students</p>
      </div>

      <div className="grid gap-4">
        {requests.map((req, i) => (
          <motion.div
            key={req.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card border-neon-indigo/30 p-6 flex flex-col sm:flex-row items-center justify-between gap-6 relative"
          >
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-space-800 border border-neon-indigo rounded-full flex items-center justify-center text-neon-indigo shadow-[0_0_15px_rgba(79,70,229,0.3)]">
                 <User size={20} />
               </div>
               <div>
                 <h3 className="font-display font-bold text-lg text-white tracking-widest truncate">{req.student_name}</h3>
                 <p className="font-mono text-xs text-zinc-400 flex items-center gap-1 uppercase">
                   <AlertCircle size={10} className="text-amber-400" /> New Mentorship Request
                 </p>
               </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => handleRespond(req.id, 'accepted')}
                className="px-6 py-2 border border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black font-display font-bold tracking-widest rounded transition-all text-xs uppercase shadow-[0_0_10px_rgba(0,240,255,0.2)]"
              >
                Accept
              </button>
              <button 
                onClick={() => handleRespond(req.id, 'rejected')}
                className="px-6 py-2 border border-red-500 text-red-500 hover:bg-red-500 hover:text-black font-display font-bold tracking-widest rounded transition-all text-xs uppercase shadow-[0_0_10px_rgba(239,68,68,0.2)]"
              >
                Deny
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
