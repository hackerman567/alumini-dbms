import React, { useEffect, useState } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Calendar, MapPin, Users, Video, Plus, Check } from 'lucide-react';

const Events = () => {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchEvents = async () => {
        try {
            const res = await client.get('/events');
            setEvents(res.data.data || []);
        } catch (err) {
            console.error("Failed to load events", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleRegister = async (eventId) => {
        try {
            await client.post(`/events/${eventId}/register`);
            alert("Registration successful!");
            fetchEvents();
        } catch (err) {
            alert(err.error || "Registration failed.");
        }
    };

    return (
        <div className="space-y-20 pb-24 relative">
            <div className="scan-line"></div>
            
            {/* Page Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-12 quantum-card !p-12 rounded-[4rem] border-4 border-white/5 shadow-2xl bg-black/40">
                <div className="space-y-6">
                    <h2 className="font-display text-7xl font-black text-white mb-4 tracking-tighter uppercase leading-none drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">Events</h2>
                    <p className="font-mono text-xl text-[#00FFD1] uppercase tracking-widest font-black">{events.length} Professional gatherings scheduled.</p>
                </div>
                {(user?.role === 'admin' || user?.role === 'faculty') && (
                    <button onClick={() => alert('Event Scheduling Portal is under construction.')} className="dimension-btn flex items-center gap-4 !px-12 !py-8 rounded-[2rem] text-xl font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all">
                        <Plus size={32} />
                        <span>SCHEDULE EVENT</span>
                    </button>
                )}
            </header>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-48">
                    <div className="w-24 h-24 portal-ring mb-12 flex items-center justify-center">
                         <div className="w-12 h-12 bg-[#00FFD1] rounded-full animate-pulse shadow-[0_0_20px_#00FFD1]"></div>
                    </div>
                    <span className="font-mono text-2xl text-[#00FFD1] animate-pulse uppercase tracking-widest font-black">Scanning Schedule...</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {events.map(event => (
                        <div key={event.id} className="quantum-card group relative !p-12 flex flex-col rounded-[4rem] transition-all hover:shadow-[0_30px_60px_rgba(0,255,209,0.15)] bg-black/40 border-4 border-white/5">
                            <div className="flex justify-between items-start mb-12">
                                <div className="px-8 py-3 rounded-2xl border-2 border-[#BF00FF]/30 bg-[#BF00FF]/10 font-mono text-sm text-[#BF00FF] uppercase font-black tracking-widest shadow-lg">
                                    {event.event_type}
                                </div>
                                <div className="text-right bg-black p-6 rounded-[2rem] border-4 border-white/10 shadow-2xl">
                                    <div className="text-5xl font-display font-black text-white leading-none tracking-tighter">
                                        {new Date(event.start_time).getDate()}
                                    </div>
                                    <div className="font-mono text-sm text-[#00FFD1] uppercase font-black mt-3 tracking-widest">
                                        {new Date(event.start_time).toLocaleString('default', { month: 'short' })}
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1">
                                <h3 className="font-display text-4xl font-black text-white mb-8 group-hover:text-[#00FFD1] transition-colors uppercase leading-tight tracking-tight">
                                    {event.title}
                                </h3>
                                
                                <div className="space-y-6 mb-12 bg-black border-4 border-white/5 p-8 rounded-[2rem] shadow-inner">
                                    <div className="flex items-center gap-5 text-base text-white/50 font-black uppercase tracking-tight">
                                        <Calendar size={28} className="text-[#00FFD1]" />
                                        <span>{new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <div className="flex items-center gap-5 text-base text-white/50 font-black uppercase tracking-tight">
                                        {event.event_type === 'webinar' ? <Video size={28} className="text-[#BF00FF]" /> : <MapPin size={28} className="text-[#BF00FF]" />}
                                        <span className="truncate">{event.venue || 'Online'}</span>
                                    </div>
                                    <div className="flex items-center gap-5 text-base text-white/50 font-black uppercase tracking-tight">
                                        <Users size={28} className="text-white/20" />
                                        <span>Capacity: {event.capacity || 'Unlimited'}</span>
                                    </div>
                                </div>
                                
                                <p className="font-mono text-xs text-white/20 mb-16 line-clamp-3 font-black uppercase tracking-widest leading-relaxed">
                                    {event.description}
                                </p>
                            </div>

                            <button onClick={() => handleRegister(event.id)} className="dimension-btn w-full !py-8 rounded-[2.5rem] flex items-center justify-center shadow-2xl active:scale-95 text-xl font-black uppercase tracking-widest">
                                <span>Register Now</span>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Events;
