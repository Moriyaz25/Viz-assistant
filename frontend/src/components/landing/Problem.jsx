import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, Sparkles } from 'lucide-react'

const rawRows = [
    ['#NULL!', '23.7', '', 'N/A', '??', '0'],
    ['text', '0', '#DIV/0!', '–', '999', ''],
    ['', '–', 'error', '0.0', '#REF!', 'NA'],
    ['abc', '#N/A', '', '12.3', '', '#NAME?'],
]

const cleanRows = [
    ['Q1', 'Revenue', 'Region', 'Growth', 'Units', 'Status'],
    ['84.2K', '+23.1%', 'APAC', '↑ High', '2,400', '✓'],
    ['61.5K', '+11.3%', 'EMEA', '↑ Mid', '1,820', '✓'],
    ['42.1K', '+5.8%', 'AMER', '→ Stable', '1,200', '✓'],
]

const Problem = () => {
    return (
        <section className="py-16 sm:py-24 relative overflow-hidden bg-[#0a0a0a]">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Section header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-xs font-bold text-red-400 tracking-[0.12em] uppercase mb-5"
                    >
                        <AlertTriangle className="h-3 w-3" />
                        The Problem
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-6xl font-black tracking-[-0.03em] text-white mb-5 leading-tight"
                    >
                        Raw Data Is{' '}
                        <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent" style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}>
                            Overwhelming.
                        </span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-white/50 text-lg leading-relaxed"
                    >
                        Most analysts spend 80% of their time cleaning data — not gaining insights. We fix that.
                    </motion.p>
                </div>

                {/* Before / After visual */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center max-w-5xl mx-auto">
                    {/* BEFORE — Messy */}
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="relative"
                    >
                        <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-red-500/30 to-orange-500/10" />
                        <div className="relative glass-card p-6 border-red-500/20 overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500/60 to-orange-500/40 rounded-t-3xl" />
                            <div className="flex items-center gap-2 mb-5">
                                <div className="h-7 w-7 rounded-xl bg-red-500/15 flex items-center justify-center">
                                    <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                                </div>
                                <span className="text-sm font-black text-red-400 tracking-wide">BEFORE — Raw Chaos</span>
                            </div>

                            <div className="overflow-hidden rounded-xl border border-white/5 font-mono text-xs">
                                {rawRows.map((row, ri) => (
                                    <div key={ri} className="flex divide-x divide-white/5 border-b border-white/5 last:border-0">
                                        {row.map((cell, ci) => (
                                            <div
                                                key={ci}
                                                className={`flex-1 px-2.5 py-2 truncate ${cell.includes('#') || cell === 'N/A' || cell === '??' || cell === 'error'
                                                    ? 'text-red-400/80 bg-red-500/5'
                                                    : cell === ''
                                                        ? 'text-white/10 bg-white/[0.01]'
                                                        : 'text-white/40'
                                                    }`}
                                            >
                                                {cell || '—'}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                                {['24 null values', '8 formula errors', '3 type mismatches'].map(tag => (
                                    <span key={tag} className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-1 rounded-full font-bold">
                                        ⚠ {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Arrow */}
                    <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 z-10 items-center justify-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.5 }}
                            className="glass h-12 w-12 rounded-2xl border border-violet-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                        >
                            <Sparkles className="h-5 w-5 text-violet-400" />
                        </motion.div>
                    </div>

                    {/* AFTER — Clean */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="relative"
                    >
                        <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-teal-500/20 to-cyan-500/10" />
                        <div className="relative glass-card p-6 border-teal-500/20 overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500/60 to-cyan-500/40 rounded-t-3xl" />
                            <div className="flex items-center gap-2 mb-5">
                                <div className="h-7 w-7 rounded-xl bg-teal-500/15 flex items-center justify-center">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-teal-400" />
                                </div>
                                <span className="text-sm font-black text-teal-400 tracking-wide">AFTER — AI Clarity</span>
                            </div>

                            <div className="overflow-hidden rounded-xl border border-white/5 font-mono text-xs">
                                {cleanRows.map((row, ri) => (
                                    <div
                                        key={ri}
                                        className={`flex divide-x divide-white/5 border-b border-white/5 last:border-0 ${ri === 0 ? 'bg-white/[0.03]' : ''}`}
                                    >
                                        {row.map((cell, ci) => (
                                            <div
                                                key={ci}
                                                className={`flex-1 px-2.5 py-2 truncate ${ri === 0
                                                    ? 'text-white/50 font-bold text-[10px] uppercase tracking-wider'
                                                    : ci === 0
                                                        ? 'text-violet-300 font-bold'
                                                        : 'text-teal-300/80'
                                                    }`}
                                            >
                                                {cell}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                                {['100% clean', 'Type-safe', 'AI-validated'].map(tag => (
                                    <span key={tag} className="text-[10px] bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2.5 py-1 rounded-full font-bold">
                                        ✓ {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}

export default Problem
