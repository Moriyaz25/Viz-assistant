import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useRef, useState, useEffect } from 'react'
import Navbar from '../components/layout/Navbar'
import Problem from '../components/landing/Problem'
import Testimonials from '../components/landing/Testimonials'
import FAQ from '../components/landing/FAQ'
import Footer from '../components/landing/Footer'

/* ─── Typewriter ─────────────────────────────────────────────────────── */
const WORDS = ['Revenue trends.', 'Hidden anomalies.', 'Instant clarity.', 'Smarter decisions.']
function useTypewriter(words, speed = 65, pause = 2000) {
    const [idx, setIdx] = useState(0)
    const [text, setText] = useState('')
    const [del, setDel] = useState(false)
    useEffect(() => {
        const cur = words[idx]
        let t
        if (!del && text.length < cur.length) t = setTimeout(() => setText(cur.slice(0, text.length + 1)), speed)
        else if (!del && text.length === cur.length) t = setTimeout(() => setDel(true), pause)
        else if (del && text.length > 0) t = setTimeout(() => setText(cur.slice(0, text.length - 1)), speed / 2)
        else { setDel(false); setIdx(i => (i + 1) % words.length) }
        return () => clearTimeout(t)
    }, [text, del, idx, words, speed, pause])
    return text
}

/* ─── Animated counter ───────────────────────────────────────────────── */
function Counter({ target, suffix = '', duration = 2000 }) {
    const [count, setCount] = useState(0)
    const ref = useRef(null)
    const started = useRef(false)
    useEffect(() => {
        const obs = new IntersectionObserver(([e]) => {
            if (e.isIntersecting && !started.current) {
                started.current = true
                const start = Date.now()
                const tick = () => {
                    const pct = Math.min((Date.now() - start) / duration, 1)
                    const ease = 1 - Math.pow(1 - pct, 4)
                    setCount(Math.round(ease * target))
                    if (pct < 1) requestAnimationFrame(tick)
                }
                requestAnimationFrame(tick)
            }
        }, { threshold: 0.5 })
        if (ref.current) obs.observe(ref.current)
        return () => obs.disconnect()
    }, [target, duration])
    return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

/* ─── Live Terminal ticker ───────────────────────────────────────────── */
const TICKS = [
    { label: 'ANOMALY', val: 'Row 47 · Revenue +312%', color: '#f59e0b' },
    { label: 'TREND', val: 'Q3 sales ↑ 23.1%', color: '#34d399' },
    { label: 'INSIGHT', val: '3 correlated variables', color: '#818cf8' },
    { label: 'CLEAN', val: '14 null rows removed', color: '#38bdf8' },
    { label: 'FORECAST', val: 'Next quarter +8.4%', color: '#f472b6' },
    { label: 'COMPARE', val: 'Dataset v2 vs v1 diff', color: '#fb923c' },
]

function Terminal() {
    const [lines, setLines] = useState([TICKS[0]])
    useEffect(() => {
        let i = 1
        const id = setInterval(() => {
            setLines(prev => [...prev.slice(-4), TICKS[i % TICKS.length]])
            i++
        }, 1800)
        return () => clearInterval(id)
    }, [])
    return (
        <div className="font-mono text-xs space-y-1.5 p-4 bg-black/40 rounded-xl border border-white/10 min-h-[120px]">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
                <div className="flex gap-1.5">
                    {['#f87171','#fbbf24','#4ade80'].map(c => <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />)}
                </div>
                <span className="text-white/30 text-[10px] tracking-widest uppercase">Vizassistance · AI Engine</span>
            </div>
            <AnimatePresence>
                {lines.map((line, i) => (
                    <motion.div
                        key={i + line.label}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2"
                    >
                        <span className="text-[9px] font-black tracking-widest px-1.5 py-0.5 rounded" style={{ background: line.color + '25', color: line.color }}>
                            {line.label}
                        </span>
                        <span className="text-white/50">{line.val}</span>
                    </motion.div>
                ))}
            </AnimatePresence>
            <motion.div
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="flex items-center gap-1"
            >
                <span className="text-emerald-400">▶</span>
                <span className="text-white/20">_</span>
            </motion.div>
        </div>
    )
}

/* ─── Feature cards ──────────────────────────────────────────────────── */
const FEATURES = [
    {
        num: '01', title: 'Natural Language Charts',
        desc: 'Type "show monthly revenue by region" and watch the perfect chart build itself. No dropdowns, no configuration.',
        tag: 'NEW', tagColor: '#f59e0b',
        detail: 'Powered by Groq LLaMA · <100ms response',
    },
    {
        num: '02', title: 'Anomaly Detection',
        desc: 'Statistical Z-score analysis across every numeric column. Outliers surface with plain-English explanations.',
        tag: 'AI', tagColor: '#818cf8',
        detail: 'Z-score > 2.5 flagged automatically',
    },
    {
        num: '03', title: 'Data Story Mode',
        desc: '5 slides generated from your analysis — headline, findings, anomalies, opportunity, and next steps.',
        tag: 'UNIQUE', tagColor: '#34d399',
        detail: 'Export as PDF presentation',
    },
    {
        num: '04', title: 'Column Profiler',
        desc: 'Every column gets a health score, distribution shape, null %, outlier count, and AI formula suggestions.',
        tag: 'DEEP', tagColor: '#38bdf8',
        detail: 'Includes formula suggestion engine',
    },
    {
        num: '05', title: 'Conversational Cleaning',
        desc: '"Remove rows where Age is blank" — AI parses the instruction and applies it instantly to your data.',
        tag: 'SMART', tagColor: '#f472b6',
        detail: '8 cleaning operations supported',
    },
    {
        num: '06', title: 'Shareable Public Link',
        desc: 'One click creates a read-only public URL. Anyone can view your analysis — no account needed.',
        tag: 'SHARE', tagColor: '#fb923c',
        detail: 'Zero-friction collaboration',
    },
]

function FeatureCard({ feature, index }) {
    const [hov, setHov] = useState(false)
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.07 }}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            className="relative group border border-white/8 rounded-2xl p-6 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 cursor-default overflow-hidden"
        >
            {/* Hover glow */}
            <motion.div
                animate={{ opacity: hov ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{ background: `radial-gradient(circle at 50% 0%, ${feature.tagColor}12 0%, transparent 70%)` }}
            />

            {/* Top row */}
            <div className="flex items-start justify-between mb-5">
                <span className="text-[40px] font-black leading-none select-none" style={{ color: 'rgba(255,255,255,0.04)' }}>
                    {feature.num}
                </span>
                <span className="text-[9px] font-black tracking-[0.2em] px-2 py-0.5 rounded-full border"
                    style={{ color: feature.tagColor, borderColor: feature.tagColor + '40', background: feature.tagColor + '15' }}>
                    {feature.tag}
                </span>
            </div>

            <h3 className="text-base font-black text-white mb-2 tracking-tight">{feature.title}</h3>
            <p className="text-white/40 text-sm leading-relaxed mb-4">{feature.desc}</p>

            {/* Bottom detail */}
            <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase"
                style={{ color: feature.tagColor + 'aa' }}>
                <div className="w-1 h-1 rounded-full" style={{ background: feature.tagColor }} />
                {feature.detail}
            </div>

            {/* Bottom line accent */}
            <motion.div
                animate={{ scaleX: hov ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="absolute bottom-0 left-0 right-0 h-[1px] origin-left"
                style={{ background: `linear-gradient(90deg, ${feature.tagColor}, transparent)` }}
            />
        </motion.div>
    )
}

/* ─── Workflow step ──────────────────────────────────────────────────── */
const STEPS = [
    { n: '1', title: 'Upload', body: 'CSV or Excel. Drag, drop, done. Instant column detection and type inference.' },
    { n: '2', title: 'AI Analyzes', body: 'Groq LLaMA scans your data in seconds. Trends, outliers, patterns — all surfaced.' },
    { n: '3', title: 'Visualize', body: 'Interactive charts auto-generated. Or tell the AI what you want to see.' },
    { n: '4', title: 'Act', body: 'Export a PDF report, share a link, or clean the data. Decisions made faster.' },
]

/* ─── Main Landing ───────────────────────────────────────────────────── */
const Landing = () => {
    const { user } = useAuth()
    const typed = useTypewriter(WORDS)
    const heroRef = useRef(null)
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
    const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])
    const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])

    return (
        <div className="min-h-screen selection:bg-amber-400/30 selection:text-white" style={{ background: '#080808', color: 'white', fontFamily: "'DM Sans', 'Inter', sans-serif" }}>

            {/* Scroll progress */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-[2px] z-[100] origin-left"
                style={{ scaleX: scrollYProgress, background: 'linear-gradient(90deg, #f59e0b, #fcd34d)' }}
            />

            <Navbar />

            {/* ── HERO ─────────────────────────────────────────────── */}
            <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-24">

                {/* Background — noise + radial */}
                <div className="absolute inset-0 pointer-events-none">
                    <div style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -10%, #1a1206 0%, #080808 70%)' }} className="absolute inset-0" />
                    {/* Amber orb */}
                    <motion.div
                        animate={{ scale: [1, 1.08, 1], opacity: [0.12, 0.2, 0.12] }}
                        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full"
                        style={{ background: 'radial-gradient(ellipse, #d97706 0%, transparent 70%)', filter: 'blur(80px)' }}
                    />
                    {/* Fine grid */}
                    <div style={{
                        backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
                        backgroundSize: '48px 48px'
                    }} className="absolute inset-0" />
                    {/* Vignette */}
                    <div style={{ background: 'radial-gradient(ellipse 100% 80% at 50% 50%, transparent 40%, #080808 100%)' }} className="absolute inset-0" />
                </div>

                <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center">

                    {/* Eyebrow badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2.5 mb-8 px-4 py-2 rounded-full border text-xs font-bold tracking-[0.12em] uppercase"
                        style={{ borderColor: '#d9770640', background: '#d9770612', color: '#fbbf24' }}
                    >
                        <motion.span
                            animate={{ opacity: [1, 0.2, 1] }}
                            transition={{ duration: 1.4, repeat: Infinity }}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: '#f59e0b', boxShadow: '0 0 8px #f59e0b' }}
                        />
                        AI Data Intelligence · Now with 10 unique features
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                        className="font-black tracking-[-0.04em] text-white mb-3 w-full"
                        style={{ fontSize: 'clamp(2.4rem, 8vw, 5.5rem)', lineHeight: 1.06, letterSpacing: '-0.04em' }}
                    >
                        Your data reveals
                    </motion.h1>
                    <motion.h1
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="font-black tracking-[-0.04em] mb-8 w-full"
                        style={{ fontSize: 'clamp(2.4rem, 8vw, 5.5rem)', lineHeight: 1.06, letterSpacing: '-0.04em', minHeight: '1.15em' }}
                    >
                        <span style={{
                            background: 'linear-gradient(135deg, #f59e0b 0%, #fcd34d 50%, #f59e0b 100%)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
                        }}>
                            {typed || '\u00A0'}
                        </span>
                        <motion.span
                            animate={{ opacity: [1, 0, 1] }}
                            transition={{ duration: 0.7, repeat: Infinity }}
                            className="inline-block ml-1 rounded-sm align-middle"
                            style={{ width: 3, height: '0.75em', background: '#f59e0b', marginBottom: 4 }}
                        />
                    </motion.h1>

                    {/* Subline */}
                    <motion.p
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.35 }}
                        className="text-lg md:text-xl mb-10 max-w-xl mx-auto font-medium"
                        style={{ color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}
                    >
                        Upload a CSV or Excel file. AI generates insights, charts, anomaly reports, and a shareable presentation — in seconds.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.5 }}
                        className="flex flex-col sm:flex-row items-center gap-3 mb-16"
                    >
                        {user ? (
                            <Link to="/dashboard"
                                className="group relative inline-flex items-center gap-2 px-8 py-4 rounded-xl font-black text-sm overflow-hidden transition-all duration-300"
                                style={{ background: '#f59e0b', color: '#080808', boxShadow: '0 0 40px #f59e0b60' }}>
                                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                    style={{ background: 'linear-gradient(135deg, #fcd34d, #f59e0b)' }} />
                                <span className="relative">Go to Dashboard →</span>
                            </Link>
                        ) : (
                            <>
                                <Link to="/signup"
                                    className="group relative inline-flex items-center gap-2 px-8 py-4 rounded-xl font-black text-sm overflow-hidden transition-all duration-300"
                                    style={{ background: '#f59e0b', color: '#080808', boxShadow: '0 0 40px #f59e0b50' }}>
                                    <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                        style={{ background: 'linear-gradient(135deg, #fcd34d, #f59e0b)' }} />
                                    <span className="relative">Start for free →</span>
                                </Link>
                                <Link to="/login"
                                    className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-sm transition-all duration-300"
                                    style={{ color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}
                                    onMouseEnter={e => { e.target.style.color = 'white'; e.target.style.borderColor = 'rgba(255,255,255,0.25)' }}
                                    onMouseLeave={e => { e.target.style.color = 'rgba(255,255,255,0.5)'; e.target.style.borderColor = 'rgba(255,255,255,0.1)' }}
                                >
                                    Sign in
                                </Link>
                            </>
                        )}
                    </motion.div>

                    {/* Two-panel preview */}
                    <motion.div
                        initial={{ opacity: 0, y: 60 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.1, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
                        className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4 text-left"
                    >
                        {/* Left: Terminal */}
                        <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: '#0d0d0d' }}>
                            <Terminal />
                        </div>

                        {/* Right: Mini chart preview */}
                        <div className="rounded-2xl border border-white/10 p-4 flex flex-col gap-3" style={{ background: '#0d0d0d' }}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Revenue vs Month</p>
                                    <p className="text-lg font-black text-white mt-0.5">$84.2K <span className="text-emerald-400 text-xs font-bold">+23.1%</span></p>
                                </div>
                                <div className="flex gap-1">
                                    {['bar','line','pie'].map(t => (
                                        <div key={t} className="w-6 h-6 rounded-md flex items-center justify-center text-[8px] font-black text-white/30 border border-white/10">
                                            {t[0].toUpperCase()}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Animated bar chart */}
                            <div className="flex items-end gap-1.5 h-24 mt-auto pt-2">
                                {[42,68,55,88,63,95,71,84,59,92,76,100].map((h, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ scaleY: 0 }}
                                        animate={{ scaleY: 1 }}
                                        transition={{ duration: 0.6, delay: 0.8 + i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                                        className="flex-1 rounded-t origin-bottom"
                                        style={{
                                            height: `${h}%`,
                                            background: i === 11
                                                ? 'linear-gradient(to top, #d97706, #fbbf24)'
                                                : i === 7 || i === 9
                                                    ? 'rgba(245,158,11,0.4)'
                                                    : 'rgba(255,255,255,0.08)'
                                        }}
                                    />
                                ))}
                            </div>
                            <div className="flex justify-between text-[9px] text-white/20 font-bold">
                                {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map(m => (
                                    <span key={m}>{m[0]}</span>
                                ))}
                            </div>

                            {/* Goal line annotation */}
                            <div className="flex items-center gap-2 text-[10px] font-bold" style={{ color: '#f59e0b' }}>
                                <div className="flex-1 h-px border-t border-dashed border-amber-500/40" />
                                <span>🎯 Q4 target</span>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Scroll nudge */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.5 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
                >
                    <span className="text-[10px] font-black tracking-[0.25em] uppercase text-white/20">Scroll</span>
                    <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.4, repeat: Infinity }}>
                        <div className="w-5 h-8 rounded-full border border-white/15 flex items-start justify-center pt-1.5">
                            <div className="w-1 h-1.5 rounded-full bg-white/30" />
                        </div>
                    </motion.div>
                </motion.div>
            </section>

            {/* ── STATS STRIP ──────────────────────────────────────── */}
            <section className="border-y border-white/8 py-12" style={{ background: '#0c0c0c' }}>
                <div className="max-w-5xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { val: 2400, suffix: '+', label: 'Datasets Analyzed' },
                            { val: 98, suffix: '%', label: 'AI Accuracy Rate' },
                            { val: 10, suffix: '', label: 'Unique AI Features' },
                            { val: 3, suffix: 's', label: 'Avg. Insight Time' },
                        ].map(({ val, suffix, label }, i) => (
                            <motion.div
                                key={label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.08 }}
                                className="text-center"
                            >
                                <p className="font-black text-3xl md:text-4xl mb-1" style={{ color: '#f59e0b' }}>
                                    <Counter target={val} suffix={suffix} />
                                </p>
                                <p className="text-xs font-bold tracking-widest uppercase text-white/30">{label}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FEATURES ─────────────────────────────────────────── */}
            <section id="features" className="py-20 md:py-32" style={{ background: '#080808' }}>
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    {/* Header */}
                    <div className="max-w-2xl mb-16">
                        <motion.p
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="text-xs font-black tracking-[0.25em] uppercase mb-4"
                            style={{ color: '#f59e0b' }}
                        >
                            What makes Vizassistance different
                        </motion.p>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="font-black text-white leading-tight"
                            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '-0.03em' }}
                        >
                            Not just charts.{' '}
                            <span style={{ color: 'rgba(255,255,255,0.3)' }}>An entire intelligence layer.</span>
                        </motion.h2>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {FEATURES.map((f, i) => <FeatureCard key={f.num} feature={f} index={i} />)}
                    </div>

                    {/* Remaining 4 features as a compact row */}
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                            { icon: '📊', label: 'Goal Tracker', desc: 'Set targets, chart shows dashed target line' },
                            { icon: '🔀', label: 'Dataset Compare', desc: 'Side-by-side AI comparison of 2 datasets' },
                            { icon: '🔔', label: 'Version Diff', desc: 'Re-upload same file → see exact changes' },
                            { icon: '🤖', label: 'AI Chat', desc: 'Ask anything about your data in plain English' },
                        ].map((item, i) => (
                            <motion.div
                                key={item.label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.06 }}
                                className="border border-white/8 rounded-xl p-4 hover:border-white/15 transition-colors duration-300"
                                style={{ background: '#0d0d0d' }}
                            >
                                <div className="text-2xl mb-2">{item.icon}</div>
                                <p className="font-black text-white text-sm mb-1">{item.label}</p>
                                <p className="text-[11px] text-white/35 leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── HOW IT WORKS ─────────────────────────────────────── */}
            <section id="workflow" className="py-20 md:py-28 border-t border-white/8" style={{ background: '#0a0a0a' }}>
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="text-center mb-16">
                        <motion.p
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="text-xs font-black tracking-[0.25em] uppercase mb-4"
                            style={{ color: '#f59e0b' }}
                        >
                            How it works
                        </motion.p>
                        <motion.h2
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="font-black text-white"
                            style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', letterSpacing: '-0.03em' }}
                        >
                            From file to insight in under 30 seconds.
                        </motion.h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-0 relative">
                        {/* Connector line */}
                        <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-px"
                            style={{ background: 'linear-gradient(90deg, transparent, #f59e0b30, #f59e0b50, #f59e0b30, transparent)' }} />

                        {STEPS.map((step, i) => (
                            <motion.div
                                key={step.n}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.12 }}
                                className="flex flex-col items-center text-center px-4 py-6 md:py-0 relative"
                            >
                                {/* Step circle */}
                                <div className="w-16 h-16 rounded-full border-2 flex items-center justify-center mb-5 font-black text-xl relative z-10"
                                    style={{ borderColor: '#f59e0b40', background: '#0a0a0a', color: '#f59e0b' }}>
                                    {step.n}
                                    <motion.div
                                        animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3] }}
                                        transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                                        className="absolute inset-0 rounded-full"
                                        style={{ border: '1px solid #f59e0b', filter: 'blur(3px)' }}
                                    />
                                </div>
                                <h3 className="font-black text-white text-base mb-2">{step.title}</h3>
                                <p className="text-sm text-white/35 leading-relaxed max-w-[160px]">{step.body}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── PROBLEM SECTION (existing) ───────────────────────── */}
            <Problem />

            {/* ── TESTIMONIALS (existing) ──────────────────────────── */}
            <Testimonials />

            {/* ── FAQ (existing) ───────────────────────────────────── */}
            <FAQ />

            {/* ── CTA ──────────────────────────────────────────────── */}
            <section className="py-20 md:py-32 relative overflow-hidden" style={{ background: '#080808' }}>
                <div className="absolute inset-0 pointer-events-none">
                    <motion.div
                        animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.18, 0.1] }}
                        transition={{ duration: 10, repeat: Infinity }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] rounded-full"
                        style={{ background: 'radial-gradient(ellipse, #d97706, transparent)', filter: 'blur(100px)' }}
                    />
                </div>
                <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <p className="text-xs font-black tracking-[0.25em] uppercase mb-5" style={{ color: '#f59e0b' }}>
                            {user ? 'Your workspace is ready' : 'Get started today'}
                        </p>
                        <h2 className="font-black text-white mb-5 leading-tight"
                            style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', letterSpacing: '-0.03em' }}>
                            {user
                                ? <>Welcome back.<br /><span style={{ color: 'rgba(255,255,255,0.3)' }}>Your data is waiting.</span></>
                                : <>Stop guessing.<br /><span style={{ color: 'rgba(255,255,255,0.3)' }}>Start knowing.</span></>
                            }
                        </h2>
                        <p className="text-white/40 text-base mb-10 max-w-md mx-auto">
                            {user
                                ? `Continue where you left off, ${user?.displayName || user?.email?.split('@')[0]}.`
                                : 'No credit card. No configuration. Just upload your data and the AI does the rest.'
                            }
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                            <Link
                                to={user ? '/dashboard' : '/signup'}
                                className="group relative inline-flex items-center gap-2 px-10 py-4 rounded-xl font-black text-base overflow-hidden transition-all duration-300"
                                style={{ background: '#f59e0b', color: '#080808', boxShadow: '0 0 50px #f59e0b50' }}
                            >
                                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                    style={{ background: 'linear-gradient(135deg, #fcd34d, #f59e0b)' }} />
                                <span className="relative">{user ? 'Open Dashboard' : 'Analyze my data'} →</span>
                            </Link>
                            {!user && (
                                <Link to="/login" className="text-sm font-bold text-white/35 hover:text-white/60 transition-colors">
                                    Already have an account? Sign in
                                </Link>
                            )}
                        </div>
                        {!user && (
                            <p className="mt-5 text-[11px] font-bold tracking-widest uppercase text-white/20">
                                Free · No credit card · CSV & Excel supported
                            </p>
                        )}
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    )
}

export default Landing
