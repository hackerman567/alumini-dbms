import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import { User, Shield, CheckCircle, XCircle, Search } from 'lucide-react';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const res = await client.get('/admin/users');
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const toggleStatus = async (id, currentStatus) => {
        try {
            await client.put(`/admin/users/${id}/status`, { is_active: !currentStatus });
            fetchUsers();
        } catch (err) {
            alert("Update failed");
        }
    };

    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(search.toLowerCase()) || 
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-12 pb-24 relative">
            <div className="scan-line"></div>
            
            <div className="quantum-card p-6 md:p-8 rounded-3xl border-4 border-white/5 shadow-2xl bg-black/40">
                <div className="flex flex-col md:flex-row justify-between items-center gap-5 md:p-6">
                    <div>
                        <h2 className="text-4xl md:text-2xl md:text-3xl font-black text-white uppercase tracking-normaler mb-4 leading-none drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">User Management</h2>
                        <p className="text-xl text-[#00FFD1] font-black uppercase tracking-normal">Administrative access control and member validation</p>
                    </div>
                    <div className="relative flex-1 max-w-xl group">
                        <Search size={32} className="absolute left-8 top-1/2 -translate-y-1/2 text-[#00FFD1] group-focus-within:scale-110 transition-transform" />
                        <input 
                            type="text" 
                            placeholder="SEARCH REGISTRY..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-black border-4 border-white/5 rounded-2xl py-8 pl-24 pr-12 text-xl font-mono text-white placeholder:text-slate-800 focus:outline-none focus:border-[#00FFD1]/30 transition-all uppercase tracking-normal shadow-inner"
                        />
                    </div>
                </div>
            </div>

            <div className="quantum-card !p-0 rounded-3xl border-4 border-white/5 overflow-hidden shadow-2xl bg-black/40">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16 md:py-20">
                        <div className="w-16 h-16 md:w-20 md:h-20 portal-ring mb-5 md:mb-6 flex items-center justify-center">
                            <div className="w-12 h-12 bg-[#00FFD1] rounded-full animate-pulse shadow-[0_0_20px_#00FFD1]"></div>
                        </div>
                        <span className="font-mono text-2xl text-[#00FFD1] animate-pulse uppercase tracking-normal font-black">Synchronizing Registry...</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-black/60 border-b-4 border-white/5">
                                    <th className="p-5 md:p-6 text-sm font-black uppercase tracking-normal text-white/20">Member Identity</th>
                                    <th className="p-5 md:p-6 text-sm font-black uppercase tracking-normal text-white/20">Access Level</th>
                                    <th className="p-5 md:p-6 text-sm font-black uppercase tracking-normal text-white/20">Authentication Status</th>
                                    <th className="p-5 md:p-6 text-sm font-black uppercase tracking-normal text-white/20">Last Activity</th>
                                    <th className="p-5 md:p-6 text-sm font-black uppercase tracking-normal text-white/20 text-right">Administrative Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-2 divide-white/5">
                                {filteredUsers.map(u => (
                                    <tr key={u.id} className="hover:bg-white/[0.03] transition-colors duration-300 group">
                                        <td className="p-5 md:p-6">
                                            <div className="flex items-center gap-8">
                                                <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-black flex items-center justify-center text-white text-3xl font-black border-4 border-white/10 group-hover:border-[#00FFD1]/50 transition-all shadow-xl">
                                                    {u.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <span className="text-3xl font-black text-white uppercase block leading-none group-hover:text-[#00FFD1] transition-colors tracking-normal">{u.name}</span>
                                                    <span className="text-sm font-mono text-white/30 block font-black mt-2 uppercase tracking-normaler">{u.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5 md:p-6">
                                            <span className={`px-6 py-2 rounded-xl text-sm font-black uppercase tracking-normal border-2 shadow-lg ${u.role === 'admin' ? 'bg-red-500/10 text-red-500 border-red-500/30' : 'bg-[#00FFD1]/10 text-[#00FFD1] border-[#00FFD1]/30'}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="p-5 md:p-6">
                                            <span className={`flex items-center gap-4 text-sm font-black uppercase tracking-normal ${u.is_active ? 'text-[#00FFD1]' : 'text-red-500'}`}>
                                                <div className={`w-4 h-4 rounded-full shadow-lg ${u.is_active ? 'bg-[#00FFD1] animate-pulse shadow-cyan-500/30' : 'bg-red-500 shadow-red-500/30'}`}></div>
                                                {u.is_active ? 'Authorized' : 'Suspended'}
                                            </span>
                                        </td>
                                        <td className="p-5 md:p-6 text-lg font-mono text-white/50 font-black uppercase tracking-normal">
                                            {u.last_login ? new Date(u.last_login).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'No Activity'}
                                        </td>
                                        <td className="p-5 md:p-6 text-right">
                                            <div className="flex justify-end gap-6">
                                                <button 
                                                    onClick={() => toggleStatus(u.id, u.is_active)}
                                                    className={`p-6 rounded-[1.5rem] border-4 transition-all shadow-xl active:scale-95 ${u.is_active ? 'border-red-500/10 text-red-500/40 hover:bg-red-500/20 hover:text-red-500' : 'border-[#00FFD1]/10 text-[#00FFD1]/40 hover:bg-[#00FFD1]/20 hover:text-[#00FFD1]'}`}
                                                    title={u.is_active ? 'Revoke Access' : 'Grant Access'}
                                                >
                                                    {u.is_active ? <XCircle size={32} /> : <CheckCircle size={32} />}
                                                </button>
                                                <button className="p-6 rounded-[1.5rem] border-4 border-white/5 text-white/10 hover:bg-white/10 hover:text-white transition-all shadow-xl active:scale-95" title="Manage Permissions">
                                                    <Shield size={32} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserManagement;
