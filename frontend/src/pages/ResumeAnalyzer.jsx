import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Cpu, Target, AlertCircle, CheckCircle2, ArrowRight, Upload, Brain } from 'lucide-react';
import client from '../api/client';

const ResumeAnalyzer = () => {
    const [file, setFile] = useState(null);
    const [targetRole, setTargetRole] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [report, setReport] = useState(null);

    const handleFileUpload = (e) => {
        setFile(e.target.files[0]);
    };

    const runAnalysis = async () => {
        if (!file || !targetRole) return;
        setAnalyzing(true);
        
        const formData = new FormData();
        formData.append('resume', file);
        formData.append('role', targetRole);

        try {
            const res = await client.post('/users/resume-analyze', formData);
            if (res.data.success) {
                setReport(res.data.analysis);
            }
        } catch (err) {
            console.error("AI analysis failed:", err);
            alert("Connection failed. Please try again.");
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-16 pb-24 relative">
            <div className="scan-line"></div>
            
            <div className="text-center space-y-8">
                <h1 className="text-7xl font-display font-black text-white tracking-tighter uppercase flex items-center justify-center gap-10 leading-none drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                    <Brain size={80} className="text-[#00FFD1] drop-shadow-[0_0_20px_rgba(0,255,209,0.5)]" /> RESUME ANALYZER
                </h1>
                <p className="font-mono text-lg text-[#00FFD1] tracking-widest uppercase font-black">AI-Powered Career Matching & Insights</p>
                <div className="w-48 h-2 bg-gradient-to-r from-transparent via-[#00FFD1]/30 to-transparent mx-auto mt-10"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                {/* Input Panel */}
                <div className="lg:col-span-4 space-y-12">
                    <section className="quantum-card space-y-12 !p-12 rounded-[3.5rem] border-2 border-white/5 shadow-2xl bg-black/40">
                        <div className="space-y-6">
                            <label className="block font-mono text-xs text-[#00FFD1] uppercase tracking-widest font-black">Target Job Role</label>
                            <input 
                                type="text" 
                                value={targetRole}
                                onChange={(e) => setTargetRole(e.target.value)}
                                placeholder="e.g. Software Engineer"
                                className="w-full bg-black border-4 border-white/5 rounded-[2rem] p-6 text-white focus:border-[#00FFD1] transition-all text-xl font-black uppercase tracking-tight shadow-inner"
                            />
                        </div>

                        <div className="space-y-6">
                            <label className="block font-mono text-xs text-[#00FFD1] uppercase tracking-widest font-black">Upload Resume (PDF)</label>
                            <div className="relative group">
                                <label className={`flex flex-col items-center justify-center w-full h-72 border-4 border-dashed rounded-[3rem] cursor-pointer transition-all ${file ? 'border-[#00FFD1] bg-[#00FFD1]/10' : 'border-white/10 hover:border-[#00FFD1]/30 bg-black'}`}>
                                    <div className="flex flex-col items-center justify-center pt-8 pb-10">
                                        {file ? (
                                            <>
                                                <CheckCircle2 className="text-[#00FFD1] mb-6 drop-shadow-[0_0_15px_rgba(0,255,209,0.4)]" size={64} />
                                                <p className="text-base font-mono text-white truncate max-w-[250px] font-black uppercase tracking-tight">{file.name}</p>
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="text-white/20 group-hover:text-[#00FFD1] transition-all mb-6" size={64} />
                                                <p className="text-xs font-mono text-white/40 uppercase font-black tracking-widest group-hover:text-white transition-colors">Choose PDF File</p>
                                            </>
                                        )}
                                    </div>
                                    <input type="file" className="hidden" accept=".pdf" onChange={handleFileUpload} />
                                </label>
                            </div>
                        </div>

                        <button 
                            onClick={runAnalysis}
                            disabled={analyzing || !file || !targetRole}
                            className="dimension-btn w-full !py-8 flex items-center justify-center gap-6 disabled:opacity-20 disabled:cursor-not-allowed text-xl font-black uppercase tracking-widest shadow-2xl active:scale-95"
                        >
                            {analyzing ? (
                                <>
                                    <div className="w-8 h-8 portal-ring animate-spin-slow"></div>
                                    <span>ANALYZING...</span>
                                </>
                            ) : (
                                <>
                                    <Cpu size={28} />
                                    <span>START ANALYSIS</span>
                                </>
                            )}
                        </button>
                    </section>
                </div>

                {/* Analysis Results */}
                <div className="lg:col-span-8">
                    <AnimatePresence mode="wait">
                        {report ? (
                            <motion.div 
                                key="report"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-12"
                            >
                                {/* Match Score */}
                                <div className="quantum-card flex items-center justify-between !p-12 rounded-[4rem] border-2 border-white/5 shadow-2xl bg-black/40">
                                    <div className="flex items-center gap-10">
                                        <div className="relative w-40 h-40">
                                            <svg className="w-full h-full" viewBox="0 0 36 36">
                                                <path
                                                    className="text-white/5"
                                                    stroke="currentColor"
                                                    strokeWidth="2.5"
                                                    fill="none"
                                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                />
                                                <path
                                                    className="text-[#00FFD1] drop-shadow-[0_0_15px_#00FFD1]"
                                                    strokeDasharray={`${report.score}, 100`}
                                                    stroke="currentColor"
                                                    strokeWidth="2.5"
                                                    strokeLinecap="round"
                                                    fill="none"
                                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex items-center justify-center font-display text-5xl font-black text-white tracking-tighter">
                                                {report.score}%
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <h3 className="font-display text-4xl font-black text-white uppercase tracking-tight leading-none">Match Score</h3>
                                            <p className="font-mono text-xs text-[#00FFD1] uppercase tracking-widest font-black bg-cyan-500/10 px-6 py-2 rounded-xl border border-cyan-500/20 inline-block">ROLE: {targetRole}</p>
                                        </div>
                                    </div>
                                    <Target className="text-white opacity-5" size={120} />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    {/* Key Strengths */}
                                    <section className="quantum-card space-y-10 !p-12 rounded-[3rem] border-2 border-white/5 shadow-2xl bg-black/40">
                                        <h4 className="font-mono text-xs text-[#00FFD1] uppercase tracking-widest flex items-center gap-4 font-black">
                                            <CheckCircle2 size={24} /> Key Strengths
                                        </h4>
                                        <div className="flex flex-wrap gap-4">
                                            {report.strengths.map((s, i) => (
                                                <span key={i} className="px-6 py-3 bg-white/5 border-2 border-white/10 rounded-2xl text-sm text-white font-black uppercase tracking-tight shadow-lg">{s}</span>
                                            ))}
                                        </div>
                                    </section>

                                    {/* Skill Gaps */}
                                    <section className="quantum-card space-y-10 !p-12 rounded-[3rem] border-2 border-white/5 shadow-2xl bg-black/40">
                                        <h4 className="font-mono text-xs text-[#FF2D6B] uppercase tracking-widest flex items-center gap-4 font-black">
                                            <AlertCircle size={24} /> Skill Gaps
                                        </h4>
                                        <div className="flex flex-wrap gap-4">
                                            {report.gaps.map((g, i) => (
                                                <span key={i} className="px-6 py-3 bg-white/5 border-2 border-white/10 rounded-2xl text-sm text-white font-black uppercase tracking-tight shadow-lg">{g}</span>
                                            ))}
                                        </div>
                                    </section>
                                </div>

                                {/* Roadmap */}
                                <section className="quantum-card !p-16 rounded-[4rem] border-2 border-white/5 shadow-2xl relative overflow-hidden bg-black/40">
                                    <div className="absolute top-0 right-0 p-16 opacity-5 rotate-12">
                                        <ArrowRight size={160} />
                                    </div>
                                    <h4 className="font-mono text-xs text-[#00FFD1] uppercase tracking-widest mb-16 font-black flex items-center gap-4">
                                        Career Roadmap
                                    </h4>
                                    <div className="space-y-12">
                                        {report.roadmap.map((step, i) => (
                                            <div key={i} className="flex gap-10 items-start group">
                                                <div className="w-16 h-16 rounded-3xl border-4 border-white/10 flex items-center justify-center text-xl font-mono text-white group-hover:border-[#00FFD1] group-hover:text-[#00FFD1] transition-all shrink-0 font-black shadow-xl">0{i+1}</div>
                                                <div className="space-y-4 pt-2">
                                                    <p className="text-2xl text-white font-black group-hover:text-[#00FFD1] transition-colors uppercase tracking-tight leading-none">{step.title}</p>
                                                    <p className="text-lg text-white/50 font-black font-mono uppercase tracking-tight leading-relaxed max-w-2xl">{step.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </motion.div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center !p-32 border-4 border-dashed border-white/5 rounded-[4rem] bg-black/40">
                                <FileText size={120} className="text-white/5 mb-12" />
                                <h3 className="font-display text-4xl text-white/40 uppercase tracking-widest font-black">Ready for Analysis</h3>
                                <p className="text-xs font-mono text-white/20 mt-6 uppercase font-black tracking-widest max-w-sm leading-loose">Upload your resume to receive AI-powered career feedback and job matching.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default ResumeAnalyzer;
