import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchWithAuth } from '../services/api';
import { motion } from 'motion/react';
import NeuralBackground from '../components/NeuralBackground';
import Cursor from '../components/Cursor';
import { Hexagon } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const data = await fetchWithAuth(endpoint, {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      // Delay for cinematic effect
      setTimeout(() => {
        login(data.user, data.token);
      }, 1000);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-space-900 justify-center items-center">
      <NeuralBackground />
      <Cursor />
      
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="w-full max-w-md w-[80%] z-10"
      >
        <div className="glass-panel rounded-3xl p-10 border border-neon-cyan/20 shadow-[0_0_50px_rgba(0,240,255,0.1)] relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-cyan to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
          
          <div className="flex justify-center mb-8">
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="text-neon-cyan drop-shadow-[0_0_15px_#00f0ff]"
            >
              <Hexagon size={64} strokeWidth={1} />
            </motion.div>
          </div>

          <h1 className="text-3xl font-display font-black text-center text-white tracking-widest mb-2 uppercase">Welcome Back</h1>
          <p className="text-indigo-200 text-center text-sm mb-8 font-mono tracking-widest uppercase opacity-60">Sign in to continue</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-xs font-bold text-neon-cyan uppercase tracking-widest mb-2 font-mono">Full Name</label>
                <input 
                  required
                  type="text"
                  className="w-full bg-space-800/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-neon-cyan transition-colors"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
            )}
            
            <div>
              <label className="block text-xs font-bold text-neon-cyan uppercase tracking-widest mb-2 font-mono">Email Address</label>
              <input 
                required
                type="email"
                className="w-full bg-space-800/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-neon-cyan transition-colors"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-neon-cyan uppercase tracking-widest mb-2 font-mono">Password</label>
              <input 
                required
                type="password"
                className="w-full bg-space-800/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-neon-cyan transition-colors"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-xs font-bold text-neon-cyan uppercase tracking-widest mb-2 font-mono">Account Role</label>
                <select 
                  className="w-full bg-space-800/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-neon-cyan transition-colors appearance-none"
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value})}
                >
                  <option value="student">Student</option>
                  <option value="alumni">Alumni</option>
                  <option value="mentor">Mentor</option>
                  <option value="administrator">Administrator</option>
                </select>
              </div>
            )}

            {error && <p className="text-red-400 text-sm font-mono text-center">ERROR: {error}</p>}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-neon-cyan text-space-900 font-display font-bold text-lg tracking-widest py-4 rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_30px_rgba(0,240,255,0.7)] transition-all magnetic-hover disabled:opacity-50"
            >
              {loading ? 'PLEASE WAIT...' : isLogin ? 'LOGIN' : 'REGISTER'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button 
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-indigo-300 font-mono text-xs uppercase tracking-widest hover:text-neon-cyan transition-colors"
            >
              {isLogin ? 'Register New User' : 'Back to Login'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
