import React, { useEffect, useState } from 'react';
import client from '../api/client';
import { Heart, TrendingUp, Users, DollarSign } from 'lucide-react';

const Donations = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCampaigns = async () => {
        try {
            const res = await client.get('/donations/campaigns');
            setCampaigns(res.data);
        } catch (err) {
            console.error("Failed to load campaigns", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const handleDonate = async (campaignId) => {
        const amount = prompt("Enter donation amount (INR):", "1000");
        if (!amount) return;

        try {
            await client.post('/donations/donate', {
                campaign_id: campaignId,
                amount: parseFloat(amount),
                message: "A contribution for the community.",
                is_anonymous: false,
                payment_ref: "REF-" + Math.random().toString(36).substr(2, 9).toUpperCase()
            });
            alert("Thank you for your generous contribution!");
            fetchCampaigns();
        } catch (err) {
            alert("Donation failed. Please try again.");
        }
    };

    return (
        <div className="space-y-20 pb-24 max-w-8xl mx-auto px-8 relative">
            <div className="scan-line"></div>
            
            {/* Page Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-5 md:p-6 quantum-card p-6 md:p-8 rounded-3xl border-4 border-white/5 shadow-2xl bg-black/40">
                <div className="space-y-6">
                    <h2 className="font-display text-2xl md:text-3xl md:text-3xl md:text-4xl font-black text-white mb-4 tracking-normaler uppercase leading-none drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">Contribution Registry</h2>
                    <p className="font-mono text-xl text-[#00FFD1] uppercase tracking-[0.3em] font-black">Support the structural growth and future of our community through specialized funds.</p>
                </div>
            </header>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-16 md:py-20">
                    <div className="w-32 h-32 portal-ring flex items-center justify-center mb-6 md:mb-8">
                        <div className="w-12 h-12 bg-[#00FFD1] rounded-full animate-pulse shadow-[0_0_30px_#00FFD1]"></div>
                    </div>
                    <span className="font-mono text-2xl text-white/20 animate-pulse uppercase tracking-[0.5em] font-black">Scanning Campaigns...</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:p-8">
                    {campaigns.map(camp => {
                        const progress = (camp.raised_amount / camp.goal_amount) * 100;
                        return (
                            <div key={camp.id} className="quantum-card group bg-black/40 p-6 md:p-8 flex flex-col rounded-3xl border-4 border-white/5 transition-all duration-500 hover:border-[#FF2D6B]/50 hover:shadow-[0_30px_80px_rgba(255,45,107,0.3)] shadow-2xl hover:-translate-y-4">
                                <div className="flex gap-4 md:gap-5 items-center mb-6 md:mb-8">
                                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-black border-4 border-[#FF2D6B]/20 flex items-center justify-center text-[#FF2D6B] group-hover:scale-110 group-hover:border-[#FF2D6B]/50 transition-all duration-500 shadow-xl shadow-pink-500/10">
                                        <Heart size={48} className="drop-shadow-[0_0_10px_#FF2D6B]" />
                                    </div>
                                    <h3 className="font-display text-4xl font-black text-white uppercase leading-tight tracking-normal group-hover:text-[#FF2D6B] transition-colors">{camp.title}</h3>
                                </div>

                                <div className="flex-1">
                                    <p className="font-mono text-sm text-white/20 mb-6 md:mb-8 line-clamp-3 font-black uppercase tracking-normal leading-relaxed">
                                        {camp.description}
                                    </p>

                                    <div className="space-y-10 mb-6 md:mb-8">
                                        <div className="flex justify-between items-end font-mono text-lg font-black uppercase tracking-normal">
                                            <span className="text-[#00FFD1] bg-black px-8 py-3 rounded-2xl border-4 border-white/5 shadow-2xl">₹{parseFloat(camp.raised_amount).toLocaleString()} RAISED</span>
                                            <span className="text-white text-4xl drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">{Math.round(progress)}%</span>
                                        </div>
                                        <div className="h-8 w-full bg-black rounded-full overflow-hidden border-4 border-white/5 p-1.5 shadow-inner">
                                            <div 
                                                className="h-full bg-gradient-to-r from-[#FF2D6B] via-[#BF00FF] to-[#FF2D6B] transition-all duration-1000 rounded-full shadow-[0_0_30px_#FF2D6B]" 
                                                style={{ width: `${Math.min(progress, 100)}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex justify-between font-mono text-sm text-white/10 uppercase font-black tracking-[0.3em]">
                                            <span>MIN_REQ: ₹100</span>
                                            <span>GOAL: ₹{parseFloat(camp.goal_amount).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => handleDonate(camp.id)} 
                                    className="dimension-btn w-full !py-10 rounded-2xl flex items-center justify-center gap-8 text-2xl font-black uppercase tracking-normal shadow-2xl active:scale-95"
                                >
                                    <DollarSign size={40} />
                                    <span>Initiate Transfer</span>
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Donations;
