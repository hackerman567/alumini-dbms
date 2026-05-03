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
            setEvents(res.data || []);
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
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-5 md:p-6 quantum-card p-5 md:p-6 rounded-3xl border-4 border-white/5 shadow-2xl bg-black/40">
                <div className="space-y-6">
                    <h2 className="font-display text-4xl md:text-2xl md:text-3xl font-black text-white mb-4 tracking-normaler uppercase leading-none drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">Events</h2>
                    <p className="font-mono text-xl text-[#00FFD1] uppercase tracking-normal font-black">{events.length} Professional gatherings scheduled.</p>
                </div>
                {(user?.role === 'admin' || user?.role === 'faculty') && (
                    <button onClick={() => alert('Event Scheduling Portal is under construction.')} className="dimension-btn flex items-center gap-4 !px-12 !py-8 rounded-xl text-xl font-black uppercase tracking-normal shadow-2xl active:scale-95 transition-all">
                        <Plus size={32} />
                        <span>SCHEDULE EVENT</span>
                    </button>
                )}
            </header>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-16 md:py-20">
                    <div className="w-16 h-16 md:w-20 md:h-20 portal-ring mb-5 md:mb-6 flex items-center justify-center">
                         <div className="w-12 h-12 bg-[#00FFD1] rounded-full animate-pulse shadow-[0_0_20px_#00FFD1]"></div>
                    </div>
                    <span className="font-mono text-2xl text-[#00FFD1] animate-pulse uppercase tracking-normal font-black">Scanning Schedule...</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:p-6">
                    {events.map(event => (
                        <div key={event.id} className="quantum-card group relative p-5 md:p-6 flex flex-col rounded-3xl transition-all hover:shadow-[0_30px_60px_rgba(0,255,209,0.15)] bg-black/40 border-4 border-white/5">
                            <div className="flex justify-between items-start mb-5 md:mb-6">
                                <div className="px-8 py-3 rounded-2xl border-2 border-[#BF00FF]/30 bg-[#BF00FF]/10 font-mono text-sm text-[#BF00FF] uppercase font-black tracking-normal shadow-lg">
                                    {event.event_type}
                                </div>
                                <div className="text-right bg-black p-6 rounded-xl border-4 border-white/10 shadow-2xl">
                                    <div className="text-2xl md:text-3xl font-display font-black text-white leading-none tracking-normaler">
                                        {new Date(event.start_time).getDate()}
                                    </div>
                                    <div className="font-mono text-sm text-[#00FFD1] uppercase font-black mt-3 tracking-normal">
                                        {new Date(event.start_time).toLocaleString('default', { month: 'short' })}
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1">
                                <h3 className="font-display text-4xl font-black text-white mb-8 group-hover:text-[#00FFD1] transition-colors uppercase leading-tight tracking-normal">
                                    {event.title}
                                </h3>
                                
                                <div className="space-y-6 mb-5 md:mb-6 bg-black border-4 border-white/5 p-8 rounded-xl shadow-inner">
                                    <div className="flex items-center gap-5 text-base text-white/50 font-black uppercase tracking-normal">
                                        <Calendar size={28} className="text-[#00FFD1]" />
                                        <span>{new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <div className="flex items-center gap-5 text-base text-white/50 font-black uppercase tracking-normal">
                                        {event.event_type === 'webinar' ? <Video size={28} className="text-[#BF00FF]" /> : <MapPin size={28} className="text-[#BF00FF]" />}
                                        <span className="truncate">{event.venue || 'Online'}</span>
                                    </div>
                                    <div className="flex items-center gap-5 text-base text-white/50 font-black uppercase tracking-normal">
                                        <Users size={28} className="text-white/20" />
                                        <span>Capacity: {event.capacity || 'Unlimited'}</span>
                                    </div>
                                </div>
                                
                                <p className="font-mono text-sm text-white/20 mb-6 md:mb-8 line-clamp-3 font-black uppercase tracking-normal leading-relaxed">
                                    {event.description}
                                </p>
                            </div>

                            <button onClick={() => handleRegister(event.id)} className="dimension-btn w-full !py-8 rounded-2xl flex items-center justify-center shadow-2xl active:scale-95 text-xl font-black uppercase tracking-normal">
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
