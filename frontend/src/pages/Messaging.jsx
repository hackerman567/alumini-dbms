import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Send, User, Search, Phone, Video, MoreVertical, 
    CheckCheck, Shield, Radio, Terminal, Cpu, Zap
} from 'lucide-react';

const socket = io(import.meta.env.VITE_API_BASE?.replace('/api/v1', '') || 'http://localhost:5000');

const Messaging = () => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [selectedConv, setSelectedConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        if (selectedConv) {
            fetchMessages(selectedConv.id);
            const channel = `chat_${selectedConv.id}`;
            socket.on(channel, (msg) => {
                setMessages(prev => [...prev, msg]);
                scrollToBottom();
            });
            return () => socket.off(channel);
        }
    }, [selectedConv]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchConversations = async () => {
        try {
            const res = await client.get('/messages/conversations');
            const convs = res.data || [];
            setConversations(convs);
            if (convs.length > 0 && !selectedConv) {
                setSelectedConv(convs[0]);
            }
        } catch (err) {
            console.error("Failed to load conversations", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (id) => {
        try {
            const res = await client.get(`/messages/${id}`);
            setMessages(res.data || []);
        } catch (err) {
            console.error("Failed to load messages", err);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConv) return;

        try {
            const receiverId = selectedConv.user1_id === user.id ? selectedConv.user2_id : selectedConv.user1_id;
            await client.post('/messages', {
                receiver_id: receiverId,
                body: newMessage
            });
            setNewMessage('');
        } catch (err) {
            console.error("Failed to send message", err);
            alert("Failed to send message. Please try again.");
        }
    };

    return (
        <div className="h-[calc(100vh-200px)] flex gap-5 md:p-6 pb-12 relative">
            <div className="scan-line"></div>
            
            {/* Sidebar Conversation List */}
            <div className="w-[30rem] flex flex-col gap-4 md:gap-5 h-full">
                <div className="quantum-card p-5 md:p-6 flex flex-col h-full overflow-hidden rounded-3xl border-4 border-white/5 shadow-2xl bg-black/40">
                    <div className="flex items-center justify-between mb-6 md:mb-8">
                        <div className="space-y-4">
                            <h3 className="font-display text-4xl font-black tracking-normal text-white uppercase leading-none">Inbox</h3>
                            <p className="font-mono text-sm text-white/20 uppercase tracking-normal font-black">Active Conversations</p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-cyan-500/10 border-4 border-white/5 flex items-center justify-center">
                             <div className="w-4 h-4 bg-[#00FFD1] rounded-full animate-pulse shadow-[0_0_15px_#00FFD1]"></div>
                        </div>
                    </div>

                    <div className="relative mb-5 md:mb-6">
                        <Search size={32} className="absolute left-8 top-1/2 -translate-y-1/2 text-white/10" />
                        <input 
                            className="w-full bg-black border-4 border-white/5 rounded-2xl py-8 pl-20 pr-10 text-xl text-white font-mono uppercase tracking-normal focus:border-[#00FFD1]/30 transition-all placeholder:text-slate-900 shadow-inner"
                            placeholder="SEARCH REGISTRY..."
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar pr-4">
                        {conversations.map((conv) => (
                            <button 
                                key={conv.id}
                                onClick={() => setSelectedConv(conv)}
                                className={`w-full p-8 rounded-2xl border-4 transition-all flex items-center gap-8 group ${selectedConv?.id === conv.id ? 'bg-cyan-500/5 border-[#00FFD1]/30 text-white shadow-2xl scale-102' : 'bg-black border-white/5 text-white/20 hover:border-white/10 hover:bg-white/[0.02]'}`}
                            >
                                <div className="relative shrink-0">
                                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-3xl bg-black border-4 border-white/5 flex items-center justify-center font-display text-3xl font-black text-white overflow-hidden shadow-2xl group-hover:scale-110 transition-transform duration-500">
                                        {conv.participant_avatar ? <img src={`${import.meta.env.VITE_API_BASE}${conv.participant_avatar}`} className="w-full h-full object-cover" /> : conv.participant_name.charAt(0)}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#00FFD1] border-4 border-black rounded-full shadow-[0_0_15px_#00FFD1]"></div>
                                </div>
                                <div className="flex-1 text-left min-w-0 space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xl font-black truncate tracking-normal uppercase group-hover:text-white transition-colors">{conv.participant_name}</span>
                                        <span className="text-sm font-mono text-white/20 font-black">{conv.last_message_time ? new Date(conv.last_message_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</span>
                                    </div>
                                    <p className="text-sm font-mono truncate opacity-40 uppercase font-black tracking-normal">{conv.last_message || 'SECURE CHANNEL OPENED'}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Chat Interface */}
            <div className="flex-1 flex flex-col gap-4 md:gap-5 h-full">
                {selectedConv ? (
                    <>
                        {/* Chat Header */}
                        <div className="quantum-card p-5 md:p-6 flex items-center justify-between rounded-3xl border-4 border-white/5 shadow-2xl bg-black/40">
                            <div className="flex items-center gap-5 md:p-6">
                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-black border-4 border-white/5 flex items-center justify-center font-display text-2xl md:text-3xl font-black text-[#00FFD1] shadow-[0_15px_35px_rgba(0,0,0,0.8)] transition-transform hover:scale-110 duration-500">
                                    {selectedConv.participant_name.charAt(0)}
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-8">
                                        <h3 className="text-3xl md:text-4xl font-black text-white tracking-normaler uppercase leading-none drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">{selectedConv.participant_name}</h3>
                                        <span className="px-8 py-3 rounded-2xl bg-[#BF00FF]/10 text-[#BF00FF] font-mono text-sm uppercase font-black border-4 border-[#BF00FF]/30 shadow-xl">{selectedConv.participant_role}</span>
                                    </div>
                                    <div className="flex items-center gap-5">
                                        <div className="w-4 h-4 rounded-full bg-[#00FFD1] animate-pulse shadow-[0_0_15px_#00FFD1]"></div>
                                        <span className="text-sm font-mono text-[#00FFD1] uppercase tracking-normal font-black">Active Now</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-8">
                                <button className="p-6 rounded-[1.5rem] bg-black border-4 border-white/5 text-white/20 hover:text-[#00FFD1] hover:border-[#00FFD1]/30 transition-all shadow-2xl hover:scale-110 active:scale-95"><Phone size={36} /></button>
                                <button className="p-6 rounded-[1.5rem] bg-black border-4 border-white/5 text-white/20 hover:text-[#BF00FF] hover:border-[#BF00FF]/30 transition-all shadow-2xl hover:scale-110 active:scale-95"><Video size={36} /></button>
                                <button className="p-6 rounded-[1.5rem] bg-black border-4 border-white/5 text-white/20 hover:text-white transition-all shadow-2xl hover:scale-110 active:scale-95"><MoreVertical size={36} /></button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 quantum-card p-6 md:p-8 overflow-y-auto custom-scrollbar bg-black/40 rounded-3xl border-4 border-white/5 shadow-inner relative">
                            <div className="space-y-16">
                                <div className="flex flex-col items-center gap-4 md:gap-5 mb-24 opacity-10">
                                    <Shield size={120} className="text-white" strokeWidth={0.5} />
                                    <p className="font-mono text-sm text-white uppercase tracking-[0.5em] font-black">End-to-End Encrypted Comms</p>
                                </div>

                                {messages.map((msg, i) => {
                                    const isMe = msg.sender_id === user.id;
                                    return (
                                        <motion.div 
                                            key={msg.id}
                                            initial={{ opacity: 0, y: 30, x: isMe ? 50 : -50 }}
                                            animate={{ opacity: 1, y: 0, x: 0 }}
                                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`max-w-[75%] group relative space-y-4`}>
                                                <div className={`p-10 px-12 rounded-3xl border-4 transition-all shadow-[0_20px_50px_rgba(0,0,0,0.8)] ${
                                                    isMe 
                                                    ? 'bg-black border-[#00FFD1]/20 text-white rounded-tr-none' 
                                                    : 'bg-black/80 border-white/5 text-white/60 rounded-tl-none'
                                                }`}>
                                                    <p className="text-3xl font-black uppercase tracking-normal leading-relaxed">{msg.body}</p>
                                                </div>
                                                <div className={`flex items-center gap-5 font-mono text-sm ${isMe ? 'justify-end' : 'justify-start'} text-white/20 font-black tracking-normal`}>
                                                    {new Date(msg.sent_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                    {isMe && <CheckCheck size={24} className="text-[#00FFD1] drop-shadow-[0_0_10px_#00FFD1]" />}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSendMessage} className="quantum-card !p-10 flex gap-4 md:gap-5 items-center rounded-3xl border-4 border-white/5 shadow-2xl bg-black/40">
                            <div className="p-5 text-white/10 hover:text-[#00FFD1] transition-all cursor-pointer hover:scale-110 active:scale-95 group">
                                <Zap size={44} className="group-hover:drop-shadow-[0_0_10px_#00FFD1]" />
                            </div>
                            <input 
                                className="bg-transparent border-none p-0 text-3xl flex-1 font-black uppercase tracking-normal text-white focus:outline-none placeholder:text-slate-900"
                                placeholder="TYPE MESSAGE COMMAND..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                            />
                            <button 
                                type="submit"
                                className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white text-black flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-[0_15px_45px_rgba(255,255,255,0.2)] shrink-0"
                            >
                                <Send size={44} />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 quantum-card flex flex-col items-center justify-center text-center !p-32 rounded-[5rem] border-4 border-white/5 shadow-2xl bg-black/40">
                        <div className="w-56 h-56 rounded-full border-8 border-dashed border-white/5 flex items-center justify-center mb-6 md:mb-8 animate-[spin_60s_linear_infinite]">
                            <Terminal size={100} className="text-white/5" />
                        </div>
                        <h3 className="font-display text-2xl md:text-3xl md:text-3xl md:text-4xl text-white/10 mb-8 tracking-normaler uppercase font-black">Select Chat</h3>
                        <p className="font-mono text-white/20 max-w-xl text-xl font-black uppercase tracking-normal leading-relaxed">Choose an identity from the registry to initiate secure communication.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Messaging;
