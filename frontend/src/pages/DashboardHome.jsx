import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Database, BarChart3, Sparkles, Clock, ArrowUpRight, Plus, FileText, TrendingUp } from 'lucide-react'
import { db } from '../services/firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

const AMB = '#F59E0B'

const MetricCard = ({ title, value, icon: Icon, color, label, suffix, loading }) => (
    <motion.div
        whileHover={{ y: -2 }}
        className="rounded-xl p-5 relative overflow-hidden"
        style={{ background: 'hsl(30 8% 9%)', border: '1px solid hsl(30 8% 16%)' }}
    >
        <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-xl"
            style={{ background: `linear-gradient(90deg, ${color}70, transparent)` }} />

        <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: `${color}18`, border: `1px solid ${color}28` }}>
                <Icon className="h-5 w-5" style={{ color }} />
            </div>
            <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                style={{ background: 'hsl(142 70% 45% / 0.12)', color: '#10B981', border: '1px solid hsl(142 70% 45% / 0.2)' }}>
                <TrendingUp className="h-2.5 w-2.5" />Live
            </div>
        </div>

        <p className="text-[10px] font-black uppercase tracking-[0.15em] mb-1.5" style={{ color: 'hsl(30 8% 45%)' }}>{label}</p>

        {loading ? (
            <div className="h-8 w-16 rounded-lg animate-pulse" style={{ background: 'hsl(30 8% 15%)' }} />
        ) : (
            <p className="font-black leading-none" style={{ fontSize: 30, color: 'hsl(40 15% 95%)', letterSpacing: '-0.04em' }}>
                {value ?? 0}{suffix && <span className="text-base ml-1" style={{ color: 'hsl(30 8% 45%)' }}>{suffix}</span>}
            </p>
        )}

        <p className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: 'hsl(30 8% 35%)' }}>{title}</p>
    </motion.div>
)

const DashboardHome = () => {
    const { user } = useAuth()
    const [stats, setStats] = useState({ datasets: 0, charts: 0, insights: 0, timeSaved: 0 })
    const [recentDatasets, setRecentDatasets] = useState([])
    const [loading, setLoading] = useState(true)
    const firstName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'User'

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return
            setLoading(true)
            try {
                const dsQ = query(collection(db, 'datasets'), where('user_id', '==', user.uid))
                const dsSnap = await getDocs(dsQ)
                const all = dsSnap.docs.map(d => ({ id: d.id, ...d.data() }))

                const recent = [...all]
                    .sort((a, b) => {
                        const da = a.upload_date?.toDate?.() || new Date(a.upload_date || 0)
                        const db_ = b.upload_date?.toDate?.() || new Date(b.upload_date || 0)
                        return db_ - da
                    })
                    .slice(0, 5)

                const insQ = query(collection(db, 'insights'), where('user_id', '==', user.uid))
                const insSnap = await getDocs(insQ).catch(() => ({ size: 0 }))

                setStats({
                    datasets: all.length,
                    charts: Math.max(insSnap.size || 0, 0),
                    insights: insSnap.size || 0,
                    timeSaved: parseFloat(((all.length * 0.5) + ((insSnap.size || 0) * 0.2)).toFixed(1))
                })
                setRecentDatasets(recent)
            } catch (err) {
                console.error('Dashboard fetch error:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [user])

    const STAT_CARDS = [
        { key: 'datasets',  title: 'Datasets',   icon: Database,  color: AMB,       label: 'Uploaded files' },
        { key: 'insights',  title: 'Analyses',   icon: Sparkles,  color: '#8B5CF6', label: 'AI analyses done' },
        { key: 'charts',    title: 'Charts',     icon: BarChart3, color: '#38BDF8', label: 'Visualizations' },
        { key: 'timeSaved', title: 'Time Saved', icon: Clock,     color: '#10B981', label: 'Hours saved', suffix: 'h' },
    ]

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <motion.span
                            animate={{ opacity: [1, 0.3, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-2 h-2 rounded-full"
                            style={{ background: '#10B981', boxShadow: '0 0 8px #10B981' }}
                        />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: '#10B981aa' }}>
                            Live Workspace
                        </span>
                    </div>
                    <h2 className="font-black text-white" style={{ fontSize: 28, letterSpacing: '-0.03em' }}>
                        Welcome back,{' '}
                        <span style={{
                            background: 'linear-gradient(135deg, #F59E0B, #FCD34D)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
                        }}>
                            {firstName}
                        </span>
                    </h2>
                    <p className="text-xs font-medium mt-1" style={{ color: 'hsl(30 8% 42%)' }}>
                        Your AI data intelligence workspace
                    </p>
                </div>

                <Link to="/dashboard/upload"
                    className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-black transition-all self-start"
                    style={{
                        background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                        color: 'hsl(30 10% 5%)',
                        boxShadow: '0 0 20px hsl(38 95% 50% / 0.28)'
                    }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 32px hsl(38 95% 50% / 0.5)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 20px hsl(38 95% 50% / 0.28)'}
                >
                    <Plus className="h-4 w-4" />Upload Data
                </Link>
            </motion.header>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {STAT_CARDS.map((card, i) => {
                    const { key, ...cardProps } = card  // ✅ key alag karo spread se
                    return (
                        <motion.div key={key}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.06 }}
                        >
                            <MetricCard
                                {...cardProps}
                                value={key === 'timeSaved' ? stats.timeSaved : stats[key]}
                                loading={loading}
                            />
                        </motion.div>
                    )
                })}
            </div>

            {/* Recent Datasets */}
            <div className="rounded-xl overflow-hidden" style={{ background: 'hsl(30 8% 9%)', border: '1px solid hsl(30 8% 15%)' }}>
                <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid hsl(30 8% 13%)' }}>
                    <p className="text-sm font-black text-white">Recent Datasets</p>
                    <Link to="/dashboard/history" className="text-[10px] font-black uppercase tracking-widest transition-colors"
                        style={{ color: 'hsl(30 8% 40%)' }}
                        onMouseEnter={e => e.currentTarget.style.color = AMB}
                        onMouseLeave={e => e.currentTarget.style.color = 'hsl(30 8% 40%)'}>
                        View All →
                    </Link>
                </div>

                <div className="p-4 space-y-2">
                    {loading ? (
                        [1, 2, 3].map(i => (
                            <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: 'hsl(30 8% 12%)' }} />
                        ))
                    ) : recentDatasets.length > 0 ? (
                        recentDatasets.map(ds => {
                            const dateStr = ds.upload_date?.toDate
                                ? ds.upload_date.toDate().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                                : new Date(ds.upload_date || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

                            return (
                                <div key={ds.id}
                                    className="flex items-center justify-between px-4 py-3 rounded-xl transition-all"
                                    style={{ background: 'hsl(30 8% 12%)', border: '1px solid hsl(30 8% 16%)' }}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = 'hsl(38 95% 50% / 0.3)'}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = 'hsl(30 8% 16%)'}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                                            style={{ background: 'hsl(38 95% 50% / 0.12)', border: '1px solid hsl(38 95% 50% / 0.2)' }}>
                                            <FileText className="h-4 w-4" style={{ color: AMB }} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white truncate max-w-[200px]">{ds.file_name}</p>
                                            <p className="text-[10px]" style={{ color: 'hsl(30 8% 40%)' }}>
                                                {dateStr} · {ds.row_count?.toLocaleString() ?? '—'} rows
                                            </p>
                                        </div>
                                    </div>
                                    <Link to={`/dashboard/insights?id=${ds.id}`}
                                        className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                                        style={{ background: 'hsl(38 95% 50% / 0.1)', color: AMB, border: '1px solid hsl(38 95% 50% / 0.2)' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'hsl(38 95% 50% / 0.2)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'hsl(38 95% 50% / 0.1)'}>
                                        Analyze <ArrowUpRight className="h-3 w-3" />
                                    </Link>
                                </div>
                            )
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <Database className="h-10 w-10 mb-3 opacity-20" style={{ color: AMB }} />
                            <p className="text-sm font-bold text-white mb-1">No datasets yet</p>
                            <p className="text-xs mb-4" style={{ color: 'hsl(30 8% 42%)' }}>Upload your first CSV or Excel file</p>
                            <Link to="/dashboard/upload"
                                className="px-5 py-2.5 rounded-xl text-xs font-black"
                                style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: 'hsl(30 10% 5%)' }}>
                                Upload Now
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* AI Tip card */}
            <div className="rounded-xl p-5 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, hsl(38 80% 30% / 0.3), hsl(38 60% 20% / 0.15))', border: '1px solid hsl(38 95% 50% / 0.2)' }}>
                <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full pointer-events-none"
                    style={{ background: 'radial-gradient(circle, hsl(38 95% 50% / 0.12), transparent)' }} />
                <Sparkles className="absolute top-4 right-4 h-8 w-8 opacity-10" style={{ color: AMB }} />
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full mb-3"
                        style={{ background: 'hsl(38 95% 50% / 0.15)', color: AMB, border: '1px solid hsl(38 95% 50% / 0.25)' }}>
                        <Sparkles className="h-2.5 w-2.5" />AI Insight
                    </div>
                    <p className="text-sm font-bold leading-relaxed text-white">
                        Analysts using AI-powered platforms are{' '}
                        <span style={{ color: '#FCD34D' }}>40% faster</span>{' '}
                        at spotting trends and making decisions.
                    </p>
                    <Link to="/dashboard/insights"
                        className="inline-flex items-center gap-1.5 text-xs font-bold mt-3 transition-colors"
                        style={{ color: 'hsl(30 8% 45%)' }}
                        onMouseEnter={e => e.currentTarget.style.color = AMB}
                        onMouseLeave={e => e.currentTarget.style.color = 'hsl(30 8% 45%)'}>
                        Explore Insights <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default DashboardHome