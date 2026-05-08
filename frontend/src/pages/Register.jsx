import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, BookOpen, GraduationCap, ArrowRight, AlertCircle, ChevronLeft, Hexagon } from 'lucide-react';

const Register = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', role: 'student',
        department: '', graduation_year: '', enrollment_year: '', job_title: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await client.post('/auth/register', formData);
            if (res.success) {
                login(res.user, res.token);
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.error || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden px-6 py-20 font-display">
            <div className="scan-line"></div>
            
            <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[640px] quantum-card p-6 md:p-8 rounded-3xl border-4 border-white/5 relative z-10 shadow-[0_40px_80px_rgba(0,0,0,0.8)] bg-black/40"
            >
                <div className="text-center mb-6 md:mb-8">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-black border-4 border-white/10 flex items-center justify-center mx-auto mb-10 shadow-2xl transition-transform hover:scale-110">
                        <Hexagon size={48} className="text-[#00FFD1] drop-shadow-[0_0_10px_#00FFD1]" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-normaler uppercase leading-none drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">CREATE<span className="text-[#00FFD1]">ACCOUNT</span></h1>
                    <div className="flex items-center justify-center gap-6 mt-12">
                        <div className={`h-2 rounded-full transition-all duration-700 ${step === 1 ? 'w-24 bg-[#00FFD1] shadow-[0_0_15px_#00FFD1]' : 'w-12 bg-white/5'}`}></div>
                        <div className={`h-2 rounded-full transition-all duration-700 ${step === 2 ? 'w-24 bg-[#00FFD1] shadow-[0_0_15px_#00FFD1]' : 'w-12 bg-white/5'}`}></div>
                        <span className="font-mono text-sm text-white/20 font-black uppercase tracking-[0.4em] ml-6">STATUS: {step}/2</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-10">
                    <AnimatePresence mode="wait">
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

                        {step === 1 ? (
                            <motion.div 
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-12"
                            >
                                <div className="space-y-6">
                                    <label className="font-mono text-sm text-white/20 uppercase tracking-[0.3em] font-black ml-4">Full Legal Name</label>
                                    <div className="relative group">
                                        <User size={28} className="absolute left-8 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-[#00FFD1] transition-all group-focus-within:scale-110" />
                                        <input 
                                            className="w-full bg-black border-4 border-white/5 rounded-2xl py-8 pl-20 pr-8 text-xl text-white font-mono uppercase tracking-normaler focus:border-[#00FFD1]/50 focus:bg-black/60 focus:outline-none transition-all placeholder:text-slate-900 shadow-inner"
                                            type="text" required 
                                            placeholder="JOHNATHAN DOE"
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <label className="font-mono text-sm text-white/20 uppercase tracking-[0.3em] font-black ml-4">Institutional Email</label>
                                    <div className="relative group">
                                        <Mail size={28} className="absolute left-8 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-[#00FFD1] transition-all group-focus-within:scale-110" />
                                        <input 
                                            className="w-full bg-black border-4 border-white/5 rounded-2xl py-8 pl-20 pr-8 text-xl text-white font-mono uppercase tracking-normaler focus:border-[#00FFD1]/50 focus:bg-black/60 focus:outline-none transition-all placeholder:text-slate-900 shadow-inner"
                                            type="email" required 
                                            placeholder="J.DOE@UNIVERSITY.EDU"
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <label className="font-mono text-sm text-white/20 uppercase tracking-[0.3em] font-black ml-4">Secure Password</label>
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

                                <div className="grid grid-cols-3 gap-6 pt-6">
                                    <button 
                                        type="button"
                                        onClick={() => setFormData({...formData, role: 'student'})}
                                        className={`p-8 rounded-xl border-4 flex flex-col items-center gap-6 transition-all duration-500 shadow-2xl ${formData.role === 'student' ? 'border-[#00FFD1] bg-black text-[#00FFD1] scale-110 shadow-[0_0_50px_rgba(0,255,209,0.2)]' : 'border-white/5 bg-black text-white/10 hover:border-white/10'}`}
                                    >
                                        <BookOpen size={36} />
                                        <span className="font-mono text-sm font-black uppercase tracking-[0.4em]">Student</span>
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setFormData({...formData, role: 'alumni'})}
                                        className={`p-8 rounded-xl border-4 flex flex-col items-center gap-6 transition-all duration-500 shadow-2xl ${formData.role === 'alumni' ? 'border-[#BF00FF] bg-black text-[#BF00FF] scale-110 shadow-[0_0_50px_rgba(191,0,255,0.2)]' : 'border-white/5 bg-black text-white/10 hover:border-white/10'}`}
                                    >
                                        <GraduationCap size={36} />
                                        <span className="font-mono text-sm font-black uppercase tracking-[0.4em]">Alumni</span>
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setFormData({...formData, role: 'mentor'})}
                                        className={`p-8 rounded-xl border-4 flex flex-col items-center gap-6 transition-all duration-500 shadow-2xl ${formData.role === 'mentor' ? 'border-amber-500 bg-black text-amber-500 scale-110 shadow-[0_0_50px_rgba(245,158,11,0.2)]' : 'border-white/5 bg-black text-white/10 hover:border-white/10'}`}
                                    >
                                        <User size={36} />
                                        <span className="font-mono text-sm font-black uppercase tracking-[0.4em]">Mentor</span>
                                    </button>
                                </div>

                                <button 
                                    type="button" 
                                    className="dimension-btn w-full !py-8 rounded-2xl flex items-center justify-center gap-6 text-2xl font-black uppercase tracking-normal shadow-2xl active:scale-95 transition-all mt-10" 
                                    onClick={() => {
                                        if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
                                            setError('Please fill in all fields before proceeding.');
                                            return;
                                        }
                                        if (formData.password.length < 6) {
                                            setError('Password must be at least 6 characters.');
                                            return;
                                        }
                                        setError('');
                                        setStep(2);
                                    }}
                                >
                                    <span>Proceed</span>
                                    <ArrowRight size={36} />
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-12"
                            >
                                <div className="space-y-6">
                                    <label className="font-mono text-sm text-white/20 uppercase tracking-[0.3em] font-black ml-4">Academic Department</label>
                                    <select 
                                        required 
                                        className="w-full bg-black border-4 border-white/5 rounded-2xl py-8 px-10 text-xl text-white font-mono uppercase tracking-normal focus:border-[#00FFD1]/50 focus:outline-none transition-all shadow-inner appearance-none group hover:border-white/10"
                                        value={formData.department}
                                        onChange={(e) => setFormData({...formData, department: e.target.value})}
                                    >
                                        <option value="" className="bg-black">SELECT REGISTRY...</option>
                                        <option value="Computer Science" className="bg-black">COMPUTER SCIENCE</option>
                                        <option value="Mechanical Engineering" className="bg-black">MECHANICAL ENGINEERING</option>
                                        <option value="Business Administration" className="bg-black">BUSINESS ADMINISTRATION</option>
                                        <option value="Digital Arts" className="bg-black">DIGITAL ARTS</option>
                                    </select>
                                </div>

                                {(formData.role === 'alumni' || formData.role === 'mentor') && (
                                    <div className="space-y-12">
                                        <div className="space-y-6">
                                            <label className="font-mono text-sm text-white/20 uppercase tracking-[0.3em] font-black ml-4">Year of Graduation</label>
                                            <input 
                                                className="w-full bg-black border-4 border-white/5 rounded-2xl py-8 px-10 text-xl text-white font-mono uppercase tracking-normaler focus:border-[#00FFD1]/50 focus:outline-none transition-all placeholder:text-slate-900 shadow-inner"
                                                type="number" required 
                                                placeholder="E.G. 2023"
                                                value={formData.graduation_year}
                                                onChange={(e) => setFormData({...formData, graduation_year: e.target.value})}
                                            />
                                        </div>
                                        {formData.role === 'mentor' && (
                                            <div className="space-y-6">
                                                <label className="font-mono text-sm text-white/20 uppercase tracking-[0.3em] font-black ml-4">Professional Job Title</label>
                                                <input 
                                                    className="w-full bg-black border-4 border-white/5 rounded-2xl py-8 px-10 text-xl text-white font-mono uppercase tracking-normaler focus:border-[#00FFD1]/50 focus:outline-none transition-all placeholder:text-slate-900 shadow-inner"
                                                    type="text" required 
                                                    placeholder="E.G. SENIOR SOFTWARE ENGINEER"
                                                    value={formData.job_title}
                                                    onChange={(e) => setFormData({...formData, job_title: e.target.value})}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                                {formData.role === 'student' && (
                                    <div className="space-y-6">
                                        <label className="font-mono text-sm text-white/20 uppercase tracking-[0.3em] font-black ml-4">Year of Enrollment</label>
                                        <input 
                                            className="w-full bg-black border-4 border-white/5 rounded-2xl py-8 px-10 text-xl text-white font-mono focus:border-[#00FFD1]/50 focus:outline-none transition-all placeholder:text-slate-900 shadow-inner"
                                            type="number" required min="2010" max="2026"
                                            placeholder="E.G. 2022"
                                            value={formData.enrollment_year}
                                            onChange={(e) => setFormData({...formData, enrollment_year: e.target.value})}
                                        />
                                    </div>
                                )}

                                <div className="flex gap-8 pt-10">
                                    <button 
                                        type="button" 
                                        className="p-10 rounded-2xl border-4 border-white/5 bg-black text-white/20 hover:text-white hover:border-white/10 transition-all shadow-2xl active:scale-95"
                                        onClick={() => setStep(1)}
                                    >
                                        <ChevronLeft size={40} />
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="dimension-btn flex-1 !py-8 rounded-2xl flex items-center justify-center gap-6 text-2xl font-black uppercase tracking-normal shadow-2xl active:scale-95 transition-all disabled:opacity-50" 
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-10 h-10 portal-ring flex items-center justify-center">
                                                     <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
                                                </div>
                                                <span>GENERATING...</span>
                                            </>
                                        ) : (
                                            'Confirm & Join'
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </form>

                <div className="mt-16 text-center border-t-4 border-white/5 pt-12">
                    <p className="font-mono text-sm text-white/20 uppercase tracking-[0.3em] font-black">
                        Existing Member? <Link to="/login" className="text-[#00FFD1] hover:text-white transition-all ml-4 underline decoration-2 underline-offset-8">Sign In Here</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
