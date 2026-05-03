import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { PieChart, Pie } from 'recharts';
import { Vote, Plus, Clock, Users, BarChart3, ChevronRight } from 'lucide-react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_BASE?.replace('/api/v1', '') || 'http://localhost:5000');

const Polls = () => {
    const { user } = useAuth();
    const [polls, setPolls] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    // New Poll Form
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);

    useEffect(() => {
        fetchPolls();
    }, []);

    const fetchPolls = async () => {
        try {
            const res = await client.get('/polls');
            if (res.success) setPolls(res.data);
        } catch (err) {
            console.error("Failed to load polls", err);
        } finally {
            setLoading(false);
        }
    };

    const handleVote = async (pollId, optionId) => {
        try {
            await client.post(`/polls/${pollId}/vote`, { option_id: optionId });
        } catch (err) {
            alert(err.response?.data?.error || "Failed to submit your vote. Please try again.");
        }
    };

    const handleCreatePoll = async (e) => {
        e.preventDefault();
        try {
            await client.post('/polls', { 
                question, 
                options: options.filter(o => o.trim() !== ''),
                ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week
            });
            setIsModalOpen(false);
            setQuestion('');
            setOptions(['', '']);
            fetchPolls();
        } catch (err) {
            console.error("Failed to create poll", err);
            alert(err.response?.data?.error || "Failed to create the poll. Please try again.");
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-20 pb-24 relative">
            <div className="scan-line"></div>
            
            <div className="flex flex-col md:flex-row justify-between items-end gap-4 md:gap-5 quantum-card p-5 md:p-6 rounded-3xl border-4 border-white/5 shadow-2xl bg-black/40">
                <div className="space-y-6">
                    <h1 className="text-4xl md:text-2xl md:text-3xl font-display font-black text-white tracking-normaler flex items-center gap-4 md:gap-5 uppercase leading-none drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                        <Vote className="text-[#BF00FF] drop-shadow-[0_0_20px_rgba(191,0,255,0.4)]" size={80} /> COMMUNITY POLLS
                    </h1>
                    <p className="font-mono text-xl text-[#00FFD1] tracking-normal uppercase font-black">Share your opinion & shape the community network</p>
                </div>
                {(user.role === 'alumni' || user.role === 'admin' || user.role === 'mentor') && (
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="dimension-btn !px-16 !py-6 text-xl font-black uppercase tracking-normal shadow-2xl active:scale-95"
                    >
                        <Plus size={32} className="mr-4" /> CREATE POLL
                    </button>
                )}
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-16 md:py-20">
                    <div className="w-14 h-14 md:w-16 md:h-16 portal-ring mb-10 flex items-center justify-center">
                        <div className="w-10 h-10 bg-[#00FFD1] rounded-full animate-pulse shadow-[0_0_20px_#00FFD1]"></div>
                    </div>
                    <span className="font-mono text-base text-[#00FFD1] animate-pulse uppercase tracking-normal font-black">Scanning Network Feedback...</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:p-8">
                    {polls.map((poll) => (
                        <PollCard key={poll.id} poll={poll} onVote={handleVote} userId={user.id} />
                    ))}
                </div>
            )}

            {/* Create Poll Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[100] flex items-center justify-center p-10"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 50 }}
                            className="bg-black border-4 border-white/10 rounded-3xl w-full max-w-3xl p-6 md:p-8 relative shadow-[0_0_120px_rgba(191,0,255,0.1)] overflow-hidden"
                        >
                            <div className="scan-line !top-0"></div>
                            <h2 className="text-2xl md:text-3xl font-display font-black text-white mb-5 md:mb-6 uppercase tracking-normal">New Community Poll</h2>
                            <form onSubmit={handleCreatePoll} className="space-y-12 relative z-10">
                                <div className="space-y-6">
                                    <label className="block text-sm font-mono text-[#BF00FF] mb-3 uppercase tracking-normal font-black">Question</label>
                                    <input 
                                        type="text" 
                                        value={question}
                                        onChange={(e) => setQuestion(e.target.value)}
                                        className="w-full bg-black border-4 border-white/5 rounded-3xl p-8 text-white focus:border-[#BF00FF] transition-all text-2xl font-black uppercase tracking-normal shadow-inner"
                                        placeholder="What would you like to ask?"
                                        required
                                    />
                                </div>
                                <div className="space-y-8">
                                    <label className="block text-sm font-mono text-[#BF00FF] mb-3 uppercase tracking-normal font-black">Answer Options</label>
                                    <div className="space-y-6">
                                        {options.map((opt, i) => (
                                            <input 
                                                key={i}
                                                type="text" 
                                                value={opt}
                                                onChange={(e) => {
                                                    const newOpts = [...options];
                                                    newOpts[i] = e.target.value;
                                                    setOptions(newOpts);
                                                }}
                                                className="w-full bg-black border-4 border-white/5 rounded-xl p-6 text-white focus:border-[#BF00FF] transition-all text-xl font-black uppercase tracking-normal shadow-inner"
                                                placeholder={`Option ${i+1}`}
                                                required
                                            />
                                        ))}
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => setOptions([...options, ''])}
                                        className="text-sm font-mono text-white/50 hover:text-[#BF00FF] uppercase tracking-normal font-black flex items-center gap-4 mt-6 transition-colors bg-white/5 px-6 py-3 rounded-2xl border-2 border-white/5 shadow-lg"
                                    >
                                        <Plus size={22} /> Add Another Option
                                    </button>
                                </div>
                                <div className="flex gap-4 md:gap-5 pt-12">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-10 py-6 rounded-xl border-4 border-white/5 text-white/30 font-mono text-base uppercase font-black hover:text-white hover:border-white/20 transition-all">Cancel</button>
                                    <button type="submit" className="flex-1 dimension-btn !py-6 text-xl font-black uppercase tracking-normal shadow-2xl active:scale-95">Create Poll</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const PollCard = ({ poll, onVote, userId }) => {
    const [results, setResults] = useState(poll.options);
    const [voted, setVoted] = useState(!!poll.user_voted_option_id);

    useEffect(() => {
        socket.on(`poll_update_${poll.id}`, (data) => {
            setResults(data);
        });
        return () => socket.off(`poll_update_${poll.id}`);
    }, [poll.id]);

    const COLORS = ['#00FFD1', '#BF00FF', '#FF2D6B', '#FFD700', '#0077B5'];

    return (
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="quantum-card space-y-16 p-6 md:p-8 rounded-3xl border-2 border-white/5 shadow-2xl transition-all hover:shadow-[0_20px_50px_rgba(191,0,255,0.1)]"
        >
            <div className="flex justify-between items-start gap-4 md:gap-5">
                <div className="space-y-6">
                    <h3 className="font-display text-3xl font-black text-white tracking-normal uppercase leading-tight">{poll.question}</h3>
                    <div className="flex items-center gap-4">
                         <p className="font-mono text-sm text-slate-500 uppercase tracking-normal font-black bg-white/5 px-4 py-1.5 rounded-xl border border-white/10">Created by: {poll.creator_name}</p>
                         <p className="font-mono text-sm text-[#00FFD1] uppercase tracking-normal font-black bg-cyan-500/5 px-4 py-1.5 rounded-xl border border-cyan-500/20">{poll.total_votes} Votes</p>
                    </div>
                </div>
                <div className="p-6 rounded-xl bg-slate-900 border-2 border-white/10 text-[#BF00FF] shadow-2xl transition-transform hover:scale-110">
                    <BarChart3 size={48} />
                </div>
            </div>

            <div className="flex flex-col gap-5 md:p-6">
                {/* Options / Voting */}
                <div className="space-y-6">
                    {results.map((opt, i) => (
                        <button
                            key={opt.id}
                            disabled={voted}
                            onClick={() => {
                                onVote(poll.id, opt.id);
                                setVoted(true);
                            }}
                            className={`w-full group relative p-8 rounded-xl border-2 transition-all text-left flex items-center justify-between ${voted ? 'border-white/5 bg-white/[0.01] cursor-default' : 'border-white/10 hover:border-[#BF00FF] cursor-pointer hover:bg-purple-500/5 hover:scale-[1.02] active:scale-95 shadow-xl'}`}
                        >
                            <span className={`text-xl font-mono uppercase tracking-normal font-black ${voted && poll.user_voted_option_id === opt.id ? 'text-[#BF00FF]' : 'text-slate-400 group-hover:text-white'}`}>
                                {opt.option_text}
                            </span>
                            <div className="flex items-center gap-6">
                                <span className="text-lg font-mono text-slate-600 font-black">{opt.vote_count}</span>
                                <ChevronRight size={28} className={`transition-transform ${voted ? 'hidden' : 'group-hover:translate-x-2 text-[#BF00FF]'}`} />
                            </div>
                        </button>
                    ))}
                </div>

                {/* Visualization */}
                <div className="h-64 quantum-card !p-10 rounded-2xl border-2 border-white/5 bg-slate-900/40">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={results} layout="vertical">
                            <XAxis type="number" hide />
                            <YAxis dataKey="option_text" type="category" hide />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#050510', border: '4px solid rgba(191,0,255,0.2)', borderRadius: '24px', fontSize: '18px', color: '#fff', textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: '900', padding: '20px' }}
                                cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                            />
                            <Bar dataKey="vote_count" radius={[0, 12, 12, 0]}>
                                {results.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </motion.div>
    );
};

export default Polls;
