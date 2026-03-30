import React, { useEffect, useState } from 'react';
import { Users, Calendar, Briefcase, Activity, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { fetchWithAuth } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total_users: 0, total_events: 0, total_jobs: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'administrator') {
      fetchWithAuth('/admin/reports')
        .then(data => {
          setStats(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      // For non-admins, fetch public data like events
      fetchWithAuth('/events')
        .then(events => {
          setStats(prev => ({ ...prev, total_events: events.length }));
          return fetchWithAuth('/jobs');
        })
        .then(jobs => {
          setStats(prev => ({ ...prev, total_jobs: jobs.length }));
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [user]);

  const statCards = user?.role === 'administrator' ? [
    { title: 'Total Platform Users', value: stats.total_users, icon: Users, color: 'text-neon-cyan', border: 'border-neon-cyan' },
    { title: 'Total Active Events', value: stats.total_events, icon: Calendar, color: 'text-neon-purple', border: 'border-neon-purple' },
    { title: 'Current Job Postings', value: stats.total_jobs, icon: Briefcase, color: 'text-neon-green', border: 'border-neon-green' },
  ] : [
    { title: 'Upcoming Events', value: stats.total_events, icon: Calendar, color: 'text-neon-purple', border: 'border-neon-purple' },
    { title: 'Job Opportunities', value: stats.total_jobs, icon: Briefcase, color: 'text-neon-green', border: 'border-neon-green' },
    { title: 'My Community Rank', value: 'Silver', icon: Star, color: 'text-amber-400', border: 'border-amber-400' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-display font-black text-white uppercase tracking-widest mb-1 shadow-neon-glow">Dashboard</h1>
        <p className="text-indigo-300 font-mono uppercase tracking-wider text-sm">System Overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`glass-card p-6 border-t-4 ${stat.border} relative overflow-hidden group`}
          >
            <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:scale-110 transition-transform">
              <stat.icon size={120} />
            </div>
            <div className={`mb-4 ${stat.color} drop-shadow-[0_0_8px_currentColor]`}>
              <stat.icon size={32} />
            </div>
            <p className="text-zinc-400 font-mono uppercase tracking-widest text-xs mb-1">{stat.title}</p>
            <p className="text-5xl font-display font-black text-white">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 glass-card p-6 border-white/10"
        >
          <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
            <Activity className="text-neon-cyan" />
            <h2 className="font-display font-bold uppercase tracking-widest text-lg">Recent Activity</h2>
          </div>
          
          <div className="space-y-4 font-mono text-sm">
            {[
              { log: 'User Sarah logged in.', time: '02:44:11' },
              { log: 'New Event "Tech Meetup" created.', time: '02:31:05' },
              { log: 'Database backup completed.', time: '01:50:00' },
              { log: 'New job posted by Administrator.', time: '01:10:48' },
              { log: 'System health check successful.', time: '00:00:15' }
            ].map((entry, i) => (
              <div key={i} className="flex gap-4 p-3 hover:bg-white/5 rounded-lg border border-transparent hover:border-white/10 transition-colors">
                <span className="text-indigo-400">[{entry.time}]</span>
                <span className="text-green-400 uppercase">INFO</span>
                <span className="text-zinc-300">{entry.log}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6 border-white/10 flex flex-col items-center justify-center text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neon-indigo/20 via-transparent to-transparent opacity-50 animate-pulse-slow"></div>
          <div className="w-32 h-32 rounded-full border border-neon-cyan/30 flex items-center justify-center mb-6 relative">
             <div className="absolute inset-0 border-r-2 border-neon-cyan rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
             <div className="absolute inset-2 border-l-2 border-neon-purple rounded-full animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>
             <p className="font-display font-black text-2xl text-neon-cyan">98%</p>
          </div>
          <h3 className="font-display font-bold text-white uppercase tracking-widest mb-2">System Status</h3>
          <p className="text-indigo-300 font-mono text-xs">All systems are running smoothly.</p>
        </motion.div>
      </div>
    </div>
  );
}
