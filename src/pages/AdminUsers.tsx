import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Users, Trash2, Mail, Shield } from 'lucide-react';
import { fetchWithAuth } from '../services/api';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchWithAuth('/admin/users')
      .then(data => setUsers(data))
      .catch((err) => console.error('Failed to fetch users:', err));
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await fetchWithAuth(`/admin/users/${id}`, { method: 'DELETE' });
      setUsers(users.filter(u => u.id !== id));
      alert('User deleted.');
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-display font-black text-white uppercase tracking-widest mb-1 shadow-neon-glow">User Management</h1>
        <p className="text-indigo-300 font-mono uppercase tracking-wider text-sm">Reviewing System Access</p>
      </div>

      <div className="glass-panel overflow-hidden border-white/10">
        <table className="w-full text-left font-mono text-sm">
          <thead className="bg-white/5 text-neon-cyan uppercase tracking-widest text-[10px]">
            <tr>
              <th className="p-4 border-b border-white/10">Name</th>
              <th className="p-4 border-b border-white/10">Role</th>
              <th className="p-4 border-b border-white/10">Email</th>
              <th className="p-4 border-b border-white/10 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <motion.tr 
                key={u.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="border-b border-white/5 hover:bg-white/5 transition-colors group"
              >
                <td className="p-4 text-white font-bold">{u.name}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-[10px] uppercase font-black ${
                    u.role === 'administrator' ? 'bg-neon-purple/20 text-neon-purple' :
                    u.role === 'alumni' ? 'bg-neon-cyan/20 text-neon-cyan' :
                    'bg-zinc-800 text-zinc-400'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="p-4 text-zinc-400 flex items-center gap-2">
                  <Mail size={12} /> {u.email}
                </td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => handleDelete(u.id)}
                    className="text-zinc-600 hover:text-red-500 transition-colors p-2"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
