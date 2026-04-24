import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
    {
        name: 'Sarah Chen',
        role: 'Product Analyst @ TechFlow',
        content: 'Vizassistant transformed our monthly reporting. What used to take 4 hours now takes 10 minutes with the AI insights.',
        avatar: 'https://i.pravatar.cc/150?u=sarah',
        rating: 5
    },
    {
        name: 'Marcus Thorne',
        role: 'Marketing Director',
        content: 'The charts are gorgeous, but the AI sidebar is the real game-changer. It spots trends our team missed for months.',
        avatar: 'https://i.pravatar.cc/150?u=marcus',
        rating: 5
    },
    {
        name: 'Elena Rodriguez',
        role: 'Financial Consultant',
        content: 'Finally a tool that understands CSV data context. The PDF reports are professional enough for my C-suite clients.',
        avatar: 'https://i.pravatar.cc/150?u=elena',
        rating: 5
    }
];

const Testimonials = () => {
    return (
        <section className="py-24 relative overflow-hidden bg-[#050508]">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-black uppercase tracking-widest mb-4"
                    >
                        <Star className="h-3 w-3 fill-violet-400" />
                        Social Proof
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-black text-white mb-4"
                    >
                        Trusted by modern <br />
                        <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">data teams.</span>
                    </motion.h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="glass-card p-8 relative group hover:border-violet-500/30 transition-all duration-500"
                        >
                            <Quote className="absolute top-6 right-8 h-12 w-12 text-white/5 group-hover:text-violet-500/10 transition-colors" />
                            <div className="flex gap-1 mb-6">
                                {[...Array(t.rating)].map((_, i) => (
                                    <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                                ))}
                            </div>
                            <p className="text-white/70 italic mb-8 leading-loose relative z-10">
                                "{t.content}"
                            </p>
                            <div className="flex items-center gap-4">
                                <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full border border-white/10" />
                                <div>
                                    <h4 className="text-white font-bold">{t.name}</h4>
                                    <p className="text-white/40 text-xs">{t.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Background Gradients */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-violet-600/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-600/5 blur-[120px] rounded-full pointer-events-none" />
        </section>
    );
};

export default Testimonials;
