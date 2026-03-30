import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Briefcase, Terminal, ArrowRight, Plus } from 'lucide-react';
import { fetchWithAuth } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Jobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    fetchWithAuth('/jobs')
      .then(data => setJobs(data))
      .catch((err) => console.error('Failed to fetch jobs:', err));
  }, []);

  const handleApply = async (jobId: number) => {
    try {
      await fetchWithAuth(`/jobs/${jobId}/apply`, { method: 'POST' });
      alert('Application submitted successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to apply');
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center py-6">
        <div>
          <h1 className="text-4xl font-display font-black text-white uppercase tracking-widest mb-2 shadow-neon-glow inline-block">Job Board</h1>
          <p className="text-indigo-300 font-mono uppercase tracking-wider text-sm">Discover career opportunities.</p>
        </div>
        {(user?.role === 'alumni' || user?.role === 'administrator') && (
          <button className="bg-neon-green/20 border border-neon-green text-neon-green px-4 py-2 font-mono text-xs uppercase tracking-widest rounded-lg hover:bg-neon-green hover:text-black transition-all shadow-[0_0_10px_rgba(57,255,20,0.2)] hover:shadow-[0_0_20px_rgba(57,255,20,0.6)] flex items-center gap-2">
            <Plus size={16} /> Post Job
          </button>
        )}
      </div>

      <div className="space-y-4">
        {jobs.map((job, i) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group glass-card border border-white/5 hover:border-neon-green/50 p-6 flex flex-col md:flex-row items-center gap-6 cursor-pointer relative overflow-hidden"
          >
            {/* Background scanline sweep */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-green/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
            
            <div className="w-16 h-16 bg-space-900 border border-neon-green/30 rounded-2xl flex items-center justify-center text-neon-green shadow-[inset_0_0_15px_rgba(57,255,20,0.1)] relative z-10">
              <Terminal size={28} />
            </div>
            
            <div className="flex-1 text-center md:text-left relative z-10 w-full">
              <h3 className="text-xl font-display font-bold text-white tracking-widest mb-1 group-hover:text-neon-green transition-colors">{job.title}</h3>
              <p className="text-indigo-300 font-mono text-sm uppercase tracking-widest flex items-center justify-center md:justify-start gap-2">
                <Briefcase size={14} /> {job.company}
              </p>
            </div>
            
            <div className="flex flex-col items-center md:items-end gap-3 w-full md:w-auto relative z-10">
              <span className="text-zinc-500 font-mono text-xs">POSTED: {new Date(job.created_at).toLocaleDateString()}</span>
              <button className="flex items-center gap-2 bg-neon-green/10 border border-neon-green text-neon-green px-6 py-2 rounded-lg font-display font-bold uppercase tracking-widest text-sm hover:bg-neon-green hover:text-black transition-all shadow-[0_0_10px_transparent] group-hover:shadow-[0_0_15px_rgba(57,255,20,0.4)]">
                Apply <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
