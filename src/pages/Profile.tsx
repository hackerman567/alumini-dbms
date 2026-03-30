import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchWithAuth } from '../services/api';
import { Cpu, TerminalSquare, Settings2, Shield } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    fetchWithAuth('/profile/me')
      .then(data => {
        setProfile(data);
        setFormData(data);
      })
      .catch((err) => console.error('Failed to fetch profile:', err));
  }, []);

  const handleSave = async () => {
    try {
      await fetchWithAuth('/profile/update', {
        method: 'PUT',
        body: JSON.stringify(formData)
      });
      setProfile(formData);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    }
  };

  return (
    <div className="max-w-4xl mx-auto font-mono">
      {/* Immersive Cover */}
      <div className="h-64 rounded-t-3xl border border-white/10 relative overflow-hidden flex items-center justify-center">
        {/* Animated gradient + noise texture behind */}
        <div className="absolute inset-0 bg-gradient-to-br from-space-900 via-neon-indigo/20 to-neon-purple/20"></div>
        <div className="absolute inset-0 z-0 opacity-20 mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        
        <div className="z-10 text-center relative w-full">
          <Shield size={64} className="mx-auto mb-4 text-white opacity-20" />
          <h1 className="text-5xl font-display font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 tracking-widest uppercase">
            {user?.name || 'USER'}
          </h1>
          <p className="text-neon-cyan mt-2 tracking-[0.3em] text-xs uppercase">ROLE: {user?.role}</p>

          <button 
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className="absolute top-0 right-8 px-4 py-2 border border-white/20 hover:border-neon-cyan text-white/50 hover:text-neon-cyan transition-all text-[10px] uppercase tracking-[0.2em] rounded"
          >
            {isEditing ? 'SYNC CHANGES' : 'INTERFACE_EDIT'}
          </button>
        </div>
      </div>

      <div className="glass-panel border-t-0 rounded-b-3xl p-8 relative -top-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="space-y-6">
            <div className="border border-white/5 p-4 rounded-xl relative overflow-hidden group hover:border-neon-cyan/30 transition-colors">
              <div className="absolute top-0 left-0 w-1 h-full bg-neon-cyan"></div>
              <h3 className="text-white font-bold flex items-center gap-2 mb-4 uppercase tracking-widest text-sm">
                <Settings2 size={16} className="text-neon-cyan" /> Personal Info
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between border-b border-white/5 pb-2 items-center">
                  <span className="text-zinc-500 uppercase text-xs">Department</span>
                  {isEditing ? (
                    <input 
                      className="bg-white/5 border border-white/10 text-zinc-300 text-sm px-2 py-1 rounded"
                      value={formData.department || ''} 
                      onChange={e => setFormData({...formData, department: e.target.value})}
                    />
                  ) : (
                    <span className="text-zinc-300 text-sm">{profile?.department}</span>
                  )}
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2 items-center">
                  <span className="text-zinc-500 uppercase text-xs">Batch Year</span>
                  {isEditing ? (
                    <input 
                      type="number"
                      className="bg-white/5 border border-white/10 text-zinc-300 text-sm px-2 py-1 rounded w-24"
                      value={formData.batch_year || ''} 
                      onChange={e => setFormData({...formData, batch_year: parseInt(e.target.value)})}
                    />
                  ) : (
                    <span className="text-zinc-300 text-sm tracking-widest">{profile?.batch_year}</span>
                  )}
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2 items-center">
                  <span className="text-zinc-500 uppercase text-xs">Phone</span>
                  {isEditing ? (
                    <input 
                      className="bg-white/5 border border-white/10 text-zinc-300 text-sm px-2 py-1 rounded"
                      value={formData.phone || ''} 
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                  ) : (
                    <span className="text-zinc-300 text-sm">{profile?.phone || 'N/A'}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="border border-white/5 p-4 rounded-xl relative overflow-hidden group hover:border-neon-purple/30 transition-colors">
              <div className="absolute top-0 left-0 w-1 h-full bg-neon-purple"></div>
              <h3 className="text-white font-bold flex items-center gap-2 mb-4 uppercase tracking-widest text-sm">
                <TerminalSquare size={16} className="text-neon-purple" /> About Me
              </h3>
              {isEditing ? (
                <textarea 
                  className="w-full bg-white/5 border border-white/10 text-zinc-400 text-sm p-2 rounded h-24"
                  value={formData.bio || ''} 
                  onChange={e => setFormData({...formData, bio: e.target.value})}
                />
              ) : (
                <p className="text-zinc-400 text-sm leading-relaxed">{profile?.bio}</p>
              )}
            </div>
          </div>

          <div>
             <div className="border border-white/5 p-4 rounded-xl h-full relative overflow-hidden hover:border-neon-green/30 transition-colors">
              <div className="absolute top-0 left-0 w-1 h-full bg-neon-green"></div>
              <h3 className="text-white font-bold flex items-center gap-2 mb-4 uppercase tracking-widest text-sm">
                <Cpu size={16} className="text-neon-green" /> Current Position
              </h3>
              
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] text-zinc-500 uppercase block mb-1">Company</label>
                    <input 
                      className="w-full bg-white/5 border border-white/10 text-zinc-300 text-sm px-2 py-1 rounded"
                      value={formData.company || ''} 
                      onChange={e => setFormData({...formData, company: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500 uppercase block mb-1">Job Title</label>
                    <input 
                      className="w-full bg-white/5 border border-white/10 text-zinc-300 text-sm px-2 py-1 rounded"
                      value={formData.job_title || ''} 
                      onChange={e => setFormData({...formData, job_title: e.target.value})}
                    />
                  </div>
                </div>
              ) : profile?.company ? (
                <div className="flex flex-col h-[70%] justify-center items-center text-center p-6 bg-space-900 border border-white/5 rounded-lg shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] mt-4">
                  <span className="text-neon-green font-display font-black text-2xl tracking-widest mb-2 leading-tight">
                    {profile.job_title}
                  </span>
                  <span className="text-indigo-300 text-sm uppercase">@ {profile.company}</span>
                </div>
              ) : (
                <div className="h-[70%] flex items-center justify-center text-zinc-600 font-bold uppercase tracking-widest text-sm mt-4">
                  No current job listed
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
