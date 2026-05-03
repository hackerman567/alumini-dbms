import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, LogIn, AlertCircle, Hexagon } from 'lucide-react';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await client.post('/auth/login', formData);
            if (res.success) {
                login(res.user, res.token);
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.error || 'Identity Verification Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden px-6 font-display">
            <div className="scan-line"></div>
            
            <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[540px] quantum-card p-6 md:p-8 rounded-3xl border-4 border-white/5 relative z-10 shadow-[0_40px_80px_rgba(0,0,0,0.8)] bg-black/40"
            >
                <div className="text-center mb-6 md:mb-8">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-black border-4 border-white/10 flex items-center justify-center mx-auto mb-10 shadow-2xl transition-transform hover:scale-110">
                        <Hexagon size={48} className="text-[#00FFD1] drop-shadow-[0_0_10px_#00FFD1]" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-normaler uppercase leading-none drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">ALUMNI<span className="text-[#00FFD1]">CONNECT</span></h1>
                    <p className="font-mono text-sm text-white/20 uppercase tracking-[0.4em] font-black">Official Member Portal</p>
                </div>

                <form className="space-y-10" onSubmit={handleSubmit}>
                    <AnimatePresence>
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="p-8 bg-red-500/10 border-4 border-red-500/20 rounded-xl flex items-center gap-6 text-red-500 text-sm font-mono overflow-hidden shadow-2xl"
                            >
                                <AlertCircle size={32} />
                                <span className="font-black uppercase tracking-normal">IDENTITY ERROR: {error}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="space-y-6">
                        <label className="font-mono text-sm text-white/20 uppercase tracking-[0.3em] font-black ml-4">Email Address</label>
                        <div className="relative group">
                            <Mail size={28} className="absolute left-8 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-[#00FFD1] transition-all group-focus-within:scale-110" />
                            <input 
                                className="w-full bg-black border-4 border-white/5 rounded-2xl py-8 pl-20 pr-8 text-xl text-white font-mono uppercase tracking-normaler focus:border-[#00FFD1]/50 focus:bg-black/60 focus:outline-none transition-all placeholder:text-slate-900 shadow-inner"
                                type="email" required 
                                placeholder="NAME@UNIVERSITY.EDU"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex justify-between items-center ml-4">
                            <label className="font-mono text-sm text-white/20 uppercase tracking-[0.3em] font-black">Account Password</label>
                            <Link to="/forgot-password" title="Forgot Password" className="font-mono text-sm text-[#BF00FF] hover:text-[#00FFD1] transition-all uppercase tracking-normal font-black decoration-2 underline-offset-4 hover:underline">RECOVER KEY</Link>
                        </div>
                        <div className="relative group">
                            <Lock size={28} className="absolute left-8 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-[#00FFD1] transition-all group-focus-within:scale-110" />
                            <input 
                                className="w-full bg-black border-4 border-white/5 rounded-2xl py-8 pl-20 pr-8 text-xl text-white font-mono focus:border-[#00FFD1]/50 focus:bg-black/60 focus:outline-none transition-all placeholder:text-slate-900 shadow-inner"
                                type="password" required 
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="pt-10">
                        <button 
                            type="submit" 
                            className="dimension-btn w-full !py-8 rounded-2xl flex items-center justify-center gap-6 text-2xl font-black uppercase tracking-normal shadow-2xl active:scale-95 transition-all disabled:opacity-50" 
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <div className="w-10 h-10 portal-ring flex items-center justify-center">
                                         <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
                                    </div>
                                    <span>SYNCHRONIZING...</span>
                                </>
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <LogIn size={36} />
                                </>
                            )}
                        </button>
                    </div>
                </form>

                <div className="mt-16 text-center border-t-4 border-white/5 pt-12">
                    <p className="font-mono text-sm text-white/20 uppercase tracking-[0.3em] font-black">
                        New Member? <Link to="/register" className="text-[#00FFD1] hover:text-white transition-all ml-4 underline decoration-2 underline-offset-8">Join Community</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
