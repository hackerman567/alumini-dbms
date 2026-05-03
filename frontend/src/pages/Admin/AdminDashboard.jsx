import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import client from '../../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Users, Briefcase, MessageSquare, ShieldAlert, 
    Database, Activity, Trash2, CheckCircle, RefreshCw, 
    Search, Filter, ShieldCheck, Terminal, XCircle,
    Server, Cpu, HardDrive, Lock
} from 'lucide-react';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('registry'); // registry, logs, system
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsRes, usersRes, logsRes] = await Promise.all([
                client.get('/reports/stats'),
                client.get('/admin/users'),
                client.get('/reports/audit-logs')
            ]);
            setStats(statsRes.data);
            setUsers(usersRes.data);
            setLogs(logsRes.data);
        } catch (err) {
            console.error("Admin Data Fetch Failed", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const toggleStatus = async (id, currentStatus) => {
        try {
            await client.put(`/admin/users/${id}/status`, { is_active: !currentStatus });
            fetchData();
        } catch (err) {
            console.error("User Status Update Failed", err);
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm("DELETE THIS USER PERMANENTLY?")) return;
        try {
            await client.delete(`/admin/users/${id}`);
            fetchData();
        } catch (err) {
            console.error("User Deletion Failed", err);
        }
    };

    const adminStats = [
        { label: 'TOTAL USERS', value: users.length, icon: Users, color: '#00FFD1' },
        { label: 'ACTIVE JOBS', value: stats?.openJobs || 0, icon: Briefcase, color: '#BF00FF' },
        { label: 'SECURITY HEALTH', value: '99.9%', icon: Activity, color: '#FFD700' },
        { label: 'SERVER UPTIME', value: '448h', icon: Cpu, color: '#FF2D6B' }
    ];

    return (
        <div className="space-y-16 pb-24 max-w-8xl mx-auto px-8">
            {/* Header */}
            <header className="relative bg-slate-900 p-16 overflow-hidden rounded-[4rem] border-4 border-red-500/20 shadow-2xl">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(239,68,68,0.1),transparent)]"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                    <div>
                        <div className="inline-flex items-center gap-4 px-6 py-2 rounded-2xl bg-red-500/10 border-2 border-red-500/20 font-mono text-xs text-red-500 tracking-[0.2em] uppercase mb-8 font-black shadow-lg">
                            <ShieldAlert size={18} className="animate-pulse" />
                            ADMINISTRATION PORTAL
                        </div>
                        <h1 className="text-7xl font-display font-black text-white tracking-tighter uppercase leading-none drop-shadow-lg">
                            Admin <br />
                            <span className="text-red-500">Overview</span>
                        </h1>
                    </div>

                    <div className="flex gap-8">
                        <button onClick={fetchData} className="flex items-center gap-4 px-12 py-8 rounded-[2rem] bg-white/5 border-4 border-white/10 text-white hover:border-[#00FFD1] hover:text-[#00FFD1] transition-all text-xl font-black uppercase tracking-widest shadow-2xl active:scale-95">
                            <RefreshCw size={28} className={`${loading ? 'animate-spin' : ''}`} />
                            <span>REFRESH SYSTEM</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                {adminStats.map((stat, i) => (
                    <motion.div 
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-slate-900 p-12 rounded-[4rem] border-4 border-white/5 hover:border-[var(--stat-color)]/30 transition-all duration-500 group shadow-2xl"
                        style={{ '--stat-color': stat.color }}
                    >
                        <div className="flex justify-between items-start mb-8">
                            <div className="font-mono text-sm text-slate-500 tracking-[0.2em] font-black uppercase">{stat.label}</div>
                            <stat.icon size={28} style={{ color: stat.color }} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="text-5xl font-display font-black text-white tracking-tight">{stat.value}</div>
                        <div className="mt-6 w-full h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5 shadow-inner">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: '70%' }}
                                className="h-full bg-[var(--stat-color)] rounded-full shadow-lg"
                                style={{ '--stat-color': stat.color }}
                            ></motion.div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                {/* Navigation Sidebar */}
                <div className="lg:col-span-3 space-y-8">
                    <button 
                        onClick={() => setActiveTab('registry')}
                        className={`w-full text-left p-10 rounded-[3rem] border-4 transition-all duration-300 flex items-center gap-8 ${activeTab === 'registry' ? 'bg-[#00FFD1]/10 border-[#00FFD1]/30 text-white shadow-xl scale-105' : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/20'}`}
                    >
                        <Users size={32} />
                        <span className="font-display text-lg font-black tracking-widest uppercase">Users</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('logs')}
                        className={`w-full text-left p-10 rounded-[3rem] border-4 transition-all duration-300 flex items-center gap-8 ${activeTab === 'logs' ? 'bg-[#BF00FF]/10 border-[#BF00FF]/30 text-white shadow-xl scale-105' : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/20'}`}
                    >
                        <MessageSquare size={32} />
                        <span className="font-display text-lg font-black tracking-widest uppercase">Logs</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('system')}
                        className={`w-full text-left p-10 rounded-[3rem] border-4 transition-all duration-300 flex items-center gap-8 ${activeTab === 'system' ? 'bg-[#FF2D6B]/10 border-[#FF2D6B]/30 text-white shadow-xl scale-105' : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/20'}`}
                    >
                        <Activity size={32} />
                        <span className="font-display text-lg font-black tracking-widest uppercase">Health</span>
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-9">
                    <AnimatePresence mode="wait">
                        {activeTab === 'registry' && (
                            <motion.div 
                                key="registry"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="bg-slate-900 rounded-[4rem] border-4 border-white/5 overflow-hidden shadow-2xl"
                            >
                                <div className="p-12 border-b-4 border-white/5 flex items-center justify-between gap-12 bg-white/[0.01]">
                                    <h3 className="font-display text-3xl font-black tracking-widest text-white uppercase">Member Directory</h3>
                                    <div className="relative flex-1 max-w-md">
                                        <Search size={28} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" />
                                        <input 
                                            type="text"
                                            placeholder="SEARCH DIRECTORY..."
                                            className="w-full bg-black/40 border-2 border-white/10 rounded-2xl py-4 pl-16 pr-8 text-sm font-mono text-white placeholder:text-slate-800 focus:border-[#00FFD1]/40 transition-all uppercase tracking-widest"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b-4 border-white/5 bg-white/[0.03]">
                                                <th className="p-10 font-mono text-xs text-slate-500 uppercase tracking-widest font-black">User Profile</th>
                                                <th className="p-10 font-mono text-xs text-slate-500 uppercase tracking-widest font-black">Designation</th>
                                                <th className="p-10 font-mono text-xs text-slate-500 uppercase tracking-widest font-black">Current Status</th>
                                                <th className="p-10 font-mono text-xs text-slate-500 uppercase tracking-widest font-black text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y-2 divide-white/5">
                                            {users.filter(u => u.name.toLowerCase().includes(search.toLowerCase())).map((u) => (
                                                <tr key={u.id} className="group hover:bg-white/[0.02] transition-colors duration-300">
                                                    <td className="p-10">
                                                        <div className="flex items-center gap-8">
                                                            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center font-display text-2xl text-[#00FFD1] border-2 border-white/10 group-hover:border-[#00FFD1]/40 transition-all shadow-xl">
                                                                {u.name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <div className="text-xl font-black text-white uppercase tracking-tight">{u.name}</div>
                                                                <div className="text-xs font-mono text-slate-600 font-bold mt-1">{u.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-10">
                                                        <span className={`px-6 py-2 rounded-xl font-mono text-xs font-black tracking-widest shadow-md ${u.role === 'admin' ? 'bg-red-500/10 text-red-500 border-2 border-red-500/20' : 'bg-blue-500/10 text-blue-500 border-2 border-blue-500/20'}`}>
                                                            {u.role.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="p-10">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-3 h-3 rounded-full shadow-lg ${u.is_active ? 'bg-[#00FFD1] animate-pulse shadow-cyan-500/30' : 'bg-red-500 shadow-red-500/30'}`}></div>
                                                            <span className={`font-mono text-sm font-black tracking-widest ${u.is_active ? 'text-[#00FFD1]' : 'text-red-500'}`}>
                                                                {u.is_active ? 'ONLINE' : 'OFFLINE'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="p-10 text-right space-x-4">
                                                        <button 
                                                            onClick={() => toggleStatus(u.id, u.is_active)}
                                                            className={`p-4 rounded-2xl border-2 transition-all shadow-lg ${u.is_active ? 'border-red-500/20 text-red-500/60 hover:bg-red-500 hover:text-white' : 'border-[#00FFD1]/20 text-[#00FFD1]/60 hover:bg-[#00FFD1] hover:text-black'}`}
                                                            title={u.is_active ? 'Suspend' : 'Activate'}
                                                        >
                                                            {u.is_active ? <XCircle size={24} /> : <CheckCircle size={24} />}
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteUser(u.id)}
                                                            className="p-4 rounded-2xl border-2 border-white/10 text-slate-700 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-lg"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={24} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'logs' && (
                            <motion.div 
                                key="logs"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="bg-slate-900 rounded-[4rem] border-4 border-white/5 p-16 shadow-2xl"
                            >
                                <div className="flex items-center justify-between mb-12">
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border-2 border-red-500/20 flex items-center justify-center text-red-500">
                                            <MessageSquare size={28} />
                                        </div>
                                        <h3 className="font-display text-3xl font-black tracking-widest uppercase text-white">Security Audit Stream</h3>
                                    </div>
                                    <span className="font-mono text-xs text-slate-600 font-black uppercase tracking-[0.2em] bg-black/40 px-6 py-2 rounded-xl">Real-time Monitoring</span>
                                </div>

                                <div className="space-y-8 max-h-[700px] overflow-y-auto pr-8 custom-scrollbar">
                                    {logs.map((log, i) => (
                                        <motion.div 
                                            key={log.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="p-8 border-2 border-white/5 rounded-[2.5rem] bg-black/30 font-mono text-sm hover:border-red-500/30 transition-all group shadow-inner"
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <span className={`font-black uppercase tracking-widest px-4 py-1 rounded-lg ${log.action === 'DELETE' ? 'bg-red-500/10 text-red-500' : 'bg-[#00FFD1]/10 text-[#00FFD1]'}`}>[{log.action}]</span>
                                                <span className="text-slate-600 text-xs uppercase font-black">{new Date(log.created_at).toLocaleString()}</span>
                                            </div>
                                            <div className="text-slate-400 group-hover:text-white transition-colors text-lg leading-relaxed font-medium">{log.details}</div>
                                            <div className="mt-6 text-[10px] text-slate-700 font-black uppercase tracking-[0.2em] pt-4 border-t border-white/5">
                                                ID: {log.user_name} <span className="mx-4 text-white/5">|</span> SCOPE: {log.target_type}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'system' && (
                            <motion.div 
                                key="system"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-12"
                            >
                                <div className="bg-slate-900 p-16 rounded-[4rem] border-4 border-[#00FFD1]/20 shadow-2xl">
                                    <h3 className="font-display text-xl font-black text-[#00FFD1] uppercase tracking-[0.2em] mb-12">Database Integrity</h3>
                                    <div className="space-y-12">
                                        <HealthIndicator label="Primary Storage" status="STABLE" val={98} color="#00FFD1" />
                                        <HealthIndicator label="Memory Cache" status="OPTIMAL" val={100} color="#BF00FF" />
                                        <HealthIndicator label="Query Response" status="EXCELLENT" val={12} color="#FFD700" suffix="ms" />
                                    </div>
                                </div>
                                <div className="bg-slate-900 p-16 rounded-[4rem] border-4 border-red-500/20 shadow-2xl">
                                    <h3 className="font-display text-xl font-black text-red-500 uppercase tracking-[0.2em] mb-12">Resource Management</h3>
                                    <div className="space-y-12">
                                        <HealthIndicator label="Processor Load" status="NORMAL" val={45} color="#FF2D6B" />
                                        <HealthIndicator label="Disk Utilization" status="STABLE" val={82} color="#FF8C00" />
                                        <HealthIndicator label="Traffic Throughput" status="NORMAL" val={94} color="#00FFD1" />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

const HealthIndicator = ({ label, status, val, color, suffix = '%' }) => (
    <div className="space-y-3">
        <div className="flex justify-between text-[11px] font-mono font-black uppercase">
            <span className="text-slate-500 tracking-widest">{label}</span>
            <span style={{ color }}>{status}</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${val}%` }}
                className="h-full"
                style={{ backgroundColor: color }}
            ></motion.div>
        </div>
    </div>
);

export default AdminDashboard;
