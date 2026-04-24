import { motion } from 'framer-motion'
import { Check, Sparkles, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const plans = [
    {
        name: 'Starter',
        price: 'Free',
        description: 'Perfect for individual analysts and small projects.',
        features: [
            'Up to 3 Data Uploads/mo',
            'Basic AI Insights',
            'Standard Chart Types',
            'CSV Export only',
            'Community Support',
        ],
        buttonText: 'Get Started',
        highlight: false,
        buttonLink: '/signup',
        accentColor: 'border-white/8',
    },
    {
        name: 'Professional',
        price: '$29',
        priceSuffix: '/mo',
        description: 'Advanced features for scaling data teams.',
        features: [
            'Unlimited Data Uploads',
            'Advanced AI Predictor',
            'Custom Chart Architect',
            'PDF & PNG High-Res Export',
            'Priority Email Support',
            'Early Access Features',
        ],
        buttonText: 'Go Pro',
        highlight: true,
        buttonLink: '/signup',
        accentColor: 'border-violet-500/50',
    },
    {
        name: 'Enterprise',
        price: 'Custom',
        description: 'Dedicated infrastructure for large organizations.',
        features: [
            'Custom AI Model Training',
            'White-label Reports',
            'SSO & Advanced Security',
            'Dedicated Account Manager',
            '24/7 Phone Support',
            'SLA Guarantee',
        ],
        buttonText: 'Contact Sales',
        highlight: false,
        buttonLink: 'mailto:sales@vizassistance.ai',
        accentColor: 'border-white/8',
    },
]

const Pricing = () => {
    const { user } = useAuth()

    return (
        <section id="pricing" className="py-24 relative overflow-hidden bg-[#0a0a0f]">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-violet-600/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-bold text-violet-300 tracking-[0.12em] uppercase mb-5"
                    >
                        <Sparkles className="h-3 w-3" />
                        Flexible Plans
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-6xl font-black text-white mb-4 tracking-[-0.03em] leading-tight"
                    >
                        Pricing that Scales{' '}
                        <br />
                        <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
                            With Your Data.
                        </span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-base text-white/50 leading-relaxed"
                    >
                        Start free and upgrade as your team grows. No hidden fees.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            whileHover={{ y: -6 }}
                            className={`relative glass-card flex flex-col ${plan.accentColor} transition-all duration-500 ${plan.highlight
                                    ? 'scale-[1.03] shadow-[0_0_60px_rgba(139,92,246,0.2)]'
                                    : 'hover:border-white/15'
                                }`}
                        >
                            {/* Pro shimmer border */}
                            {plan.highlight && (
                                <>
                                    <div className="absolute -inset-px rounded-3xl bg-gradient-to-r from-violet-500/50 via-cyan-400/30 to-violet-500/50 -z-10 animate-[shimmer_4s_linear_infinite] bg-[length:200%_100%]" />
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-5 py-1.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-violet-500/30">
                                        <Zap className="h-3 w-3" />
                                        Most Popular
                                    </div>
                                </>
                            )}

                            {/* Top accent line */}
                            {plan.highlight && (
                                <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-violet-500/0 via-violet-400 to-violet-500/0" />
                            )}

                            <div className="p-8 flex flex-col flex-grow">
                                <div className="mb-7">
                                    <h3 className="text-xs font-black text-white/40 tracking-[0.15em] uppercase mb-3">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1 mb-3">
                                        <span className="text-5xl font-black text-white tracking-tight">{plan.price}</span>
                                        {plan.priceSuffix && <span className="text-white/40 font-bold text-base">{plan.priceSuffix}</span>}
                                    </div>
                                    <p className="text-white/40 text-sm leading-relaxed">{plan.description}</p>
                                </div>

                                <div className="space-y-3 mb-8 flex-grow">
                                    {plan.features.map((feature) => (
                                        <div key={feature} className="flex items-center gap-3">
                                            <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${plan.highlight ? 'bg-violet-500/20' : 'bg-white/5'}`}>
                                                <Check className={`h-3 w-3 ${plan.highlight ? 'text-violet-400' : 'text-white/40'}`} />
                                            </div>
                                            <span className="text-white/65 text-sm">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <Link
                                    to={user && plan.highlight ? '/dashboard' : plan.buttonLink}
                                    className={`w-full py-4 rounded-2xl text-center font-black transition-all duration-300 text-sm relative overflow-hidden group ${plan.highlight
                                            ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/50'
                                            : 'glass text-white hover:bg-white/8 border border-white/8'
                                        }`}
                                >
                                    {plan.highlight && (
                                        <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                                    )}
                                    {user && plan.highlight ? 'Upgrade Plan' : plan.buttonText}
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Pricing
