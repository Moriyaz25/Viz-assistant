import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Database, BarChart3, Sparkles, Clock, ArrowUpRight, Plus, FileText, ChevronRight, TrendingUp } from 'lucide-react'
import { db } from '../services/firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import DashboardGrid, { DashboardWidget } from '../components/dashboard/DashboardGrid'
import { Settings2, Save, X } from 'lucide-react'

const statCards = [
    { key: 'datasets', title: 'Datasets', icon: Database, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'hover:border-blue-500/30', glow: 'group-hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]', label: 'Connected sources', accent: 'from-blue-500/20' },
    { key: 'insights', title: 'Intelligence', icon: Sparkles, color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'hover:border-violet-500/30', glow: 'group-hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]', label: 'AI generated patterns', accent: 'from-violet-500/20' },
    { key: 'charts', title: 'Charts', icon: BarChart3, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'hover:border-cyan-500/30', glow: 'group-hover:shadow-[0_0_30px_rgba(34,211,238,0.15)]', label: 'Active visualizations', accent: 'from-cyan-500/20' },
    { key: 'timeSaved', title: 'Time Saved', icon: Clock, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'hover:border-emerald-500/30', glow: 'group-hover:shadow-[0_0_30px_rgba(52,211,153,0.15)]', label: 'Manual hours reduced', accent: 'from-emerald-500/20', suffix: 'h' },
]

const MetricCard = ({ title, value, icon: Icon, color, bg, border, glow, label, accent, suffix }) => (
    <motion.div
        whileHover={{ y: -4 }}
        className={`relative glass-card overflow-hidden group border-white/5 ${border} ${glow} transition-all duration-500`}
    >
        {/* Top accent line */}
        <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${accent} to-transparent`} />

        <div className="flex items-start justify-between mb-5">
            <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform duration-500`}>
                <Icon className={`h-5.5 w-5.5 ${color}`} />
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-1 rounded-full">
                <TrendingUp className="h-3 w-3" />
                Live
            </div>
        </div>

        <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-1">{label}</p>
        <p className="text-3xl font-black text-white">
            {value}
            {suffix && <span className="text-lg ml-0.5 text-white/40">{suffix}</span>}
        </p>
        <p className="text-white/30 text-xs font-bold mt-1 uppercase tracking-[0.1em]">{title}</p>
    </motion.div>
)

import { Skeleton, CardSkeleton } from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'

const DashboardHome = () => {
    const { user, updateProfile } = useAuth()
    const [isEditing, setIsEditing] = useState(false)
    const [layout, setLayout] = useState([
        { i: 'stats1', x: 0, y: 0, w: 3, h: 2 },
        { i: 'stats2', x: 3, y: 0, w: 3, h: 2 },
        { i: 'stats3', x: 6, y: 0, w: 3, h: 2 },
        { i: 'stats4', x: 9, y: 0, w: 3, h: 2 },
        { i: 'recent', x: 0, y: 2, w: 8, h: 5 },
        { i: 'summary', x: 8, y: 2, w: 4, h: 5 },
    ])
    const [stats, setStats] = useState({ datasets: 0, charts: 0, insights: 0, timeSaved: 0, lastUpload: null })
    const [recentDatasets, setRecentDatasets] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (user?.user_metadata?.dashboard_layout) {
            setLayout(user.user_metadata.dashboard_layout)
        }
    }, [user])

    useEffect(() => {
        const fetchStats = async () => {
            if (!user) return
            try {
                const datasetsQuery = query(collection(db, 'datasets'), where('user_id', '==', user.uid))
                const datasetsSnap = await getDocs(datasetsQuery)
                const allDatasets = datasetsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
                const recentData = [...allDatasets]
                    .sort((a, b) => new Date(b.upload_date) - new Date(a.upload_date))
                    .slice(0, 5)

                const insightsQuery = query(collection(db, 'insights'), where('user_id', '==', user.uid))
                const insightsSnap = await getDocs(insightsQuery)

                setStats({
                    datasets: allDatasets.length,
                    charts: Math.round((insightsSnap.size || 0) * 1.5),
                    insights: insightsSnap.size || 0,
                    timeSaved: parseFloat((allDatasets.length * 0.5 + insightsSnap.size * 0.2).toFixed(1)),
                    lastUpload: recentData?.[0] || null
                })
                setRecentDatasets(recentData)
            } catch (err) {
                console.error('Error fetching stats:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [user])

    const saveLayout = async () => {
        try {
            setSaving(true)
            await updateProfile({ dashboard_layout: layout })
            setIsEditing(false)
        } catch (err) {
            console.error('Error saving layout:', err)
        } finally {
            setSaving(false)
        }
    }

    const firstName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'User'

    return (
        <div className="space-y-8 min-h-full pb-10">
            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-5"
            >
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <motion.div
                            animate={{ opacity: [1, 0.3, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                        />
                        <span className="text-[10px] font-black text-emerald-400/80 uppercase tracking-[0.2em]">Live Workspace</span>
                    </div>
                    {loading ? (
                        <Skeleton className="h-10 w-64 mt-2" />
                    ) : (
                        <h2 className="text-3xl font-black tracking-tight text-white">
                            Welcome back,{' '}
                            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                                {firstName}
                            </span>
                        </h2>
                    )}
                    <p className="text-white/35 mt-1 font-medium text-sm">Customize your data workspace below.</p>
                </div>

                <div className="flex items-center gap-3">
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="inline-flex items-center gap-2 glass text-white/60 hover:text-white px-5 py-3 rounded-2xl font-bold hover:bg-white/8 transition-all border border-white/5 text-sm"
                        >
                            <Settings2 className="h-4.5 w-4.5" />
                            Edit Layout
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="inline-flex items-center gap-2 glass text-white/60 hover:text-white px-4 py-3 rounded-2xl font-bold transition-all text-sm"
                            >
                                <X className="h-4 w-4" />
                                Cancel
                            </button>
                            <button
                                onClick={saveLayout}
                                disabled={saving}
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-5 py-3 rounded-2xl font-bold shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all disabled:opacity-50 text-sm"
                            >
                                <Save className="h-4 w-4" />
                                {saving ? 'Saving...' : 'Save Layout'}
                            </button>
                        </div>
                    )}
                    <Link
                        to="/dashboard/upload"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-violet-500/25 hover:shadow-violet-500/50 hover:-translate-y-0.5 transition-all text-sm"
                    >
                        <Plus className="h-4.5 w-4.5" />
                        Upload
                    </Link>
                </div>
            </motion.header>

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card, i) => (
                    <motion.div
                        key={card.key}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                    >
                        {loading ? (
                            <div className="glass-card flex flex-col gap-2 p-6 h-full">
                                <Skeleton className="h-4 w-12" />
                                <Skeleton className="h-10 w-24" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                        ) : (
                            <MetricCard
                                title={card.title}
                                value={card.key === 'timeSaved' ? stats.timeSaved : stats[card.key]}
                                icon={card.icon}
                                color={card.color}
                                bg={card.bg}
                                border={card.border}
                                glow={card.glow}
                                label={card.label}
                                accent={card.accent}
                                suffix={card.suffix}
                            />
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Dashboard grid */}
            <DashboardGrid
                layout={layout}
                isDraggable={isEditing}
                onLayoutChange={setLayout}
            >
                <div key="stats1"><DashboardWidget id="stats1" title="Datasets" isDraggable={isEditing} className="h-full">{loading ? <CardSkeleton /> : <div className="flex flex-col h-full justify-center"><Database className="h-7 w-7 text-blue-400 mb-2" /><p className="text-3xl font-black text-white">{stats.datasets}</p><p className="text-xs text-white/35">Connected sources</p></div>}</DashboardWidget></div>
                <div key="stats2"><DashboardWidget id="stats2" title="Intelligence" isDraggable={isEditing} className="h-full">{loading ? <CardSkeleton /> : <div className="flex flex-col h-full justify-center"><Sparkles className="h-7 w-7 text-violet-400 mb-2" /><p className="text-3xl font-black text-white">{stats.insights}</p><p className="text-xs text-white/35">AI generated patterns</p></div>}</DashboardWidget></div>
                <div key="stats3"><DashboardWidget id="stats3" title="Charts" isDraggable={isEditing} className="h-full">{loading ? <CardSkeleton /> : <div className="flex flex-col h-full justify-center"><BarChart3 className="h-7 w-7 text-cyan-400 mb-2" /><p className="text-3xl font-black text-white">{stats.charts}</p><p className="text-xs text-white/35">Active reports</p></div>}</DashboardWidget></div>
                <div key="stats4"><DashboardWidget id="stats4" title="Time Saved" isDraggable={isEditing} className="h-full">{loading ? <CardSkeleton /> : <div className="flex flex-col h-full justify-center"><Clock className="h-7 w-7 text-emerald-400 mb-2" /><p className="text-3xl font-black text-white">{`${stats.timeSaved}h`}</p><p className="text-xs text-white/35">Manual effort reduced</p></div>}</DashboardWidget></div>

                <div key="recent" className="h-full">
                    <DashboardWidget id="recent" title="Recent Datasets" isDraggable={isEditing} className="h-full">
                        <div className="space-y-3 h-full">
                            {loading ? (
                                <>
                                    <Skeleton className="h-16 w-full rounded-xl" />
                                    <Skeleton className="h-16 w-full rounded-xl" />
                                    <Skeleton className="h-16 w-full rounded-xl" />
                                </>
                            ) : recentDatasets.length > 0 ? (
                                recentDatasets.map((ds) => (
                                    <div key={ds.id} className="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl border border-white/5 hover:border-violet-500/20 transition-all group">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-xl bg-violet-500/10 flex items-center justify-center border border-white/5">
                                                <FileText className="h-4 w-4 text-violet-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white truncate max-w-[180px]">{ds.file_name}</p>
                                                <p className="text-[10px] text-white/30">{new Date(ds.upload_date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <Link to={`/dashboard/insights?id=${ds.id}`}>
                                            <ArrowUpRight className="h-4 w-4 text-white/20 group-hover:text-violet-400 transition-colors" />
                                        </Link>
                                    </div>
                                ))
                            ) : (
                                <EmptyState
                                    className="h-full py-8 bg-transparent border-0 shadow-none"
                                    title="No datasets yet"
                                    description="Start by uploading your first CSV or Excel file to get insights."
                                    actionLabel="Upload Now"
                                    actionLink="/dashboard/upload"
                                />
                            )}
                        </div>
                    </DashboardWidget>
                </div>

                <div key="summary" className="h-full">
                    <DashboardWidget id="summary" title="AI Summary" isDraggable={isEditing} className="h-full">
                        {loading ? (
                            <Skeleton className="h-full w-full rounded-2xl" />
                        ) : (
                            <div className="relative overflow-hidden rounded-2xl p-5 h-full bg-gradient-to-br from-violet-900/60 via-purple-900/40 to-indigo-900/60 border border-violet-500/20">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/20 rounded-full blur-2xl pointer-events-none" />
                                <Sparkles className="absolute top-3 right-3 h-10 w-10 text-violet-400/10" />
                                <div className="relative z-10">
                                    <div className="inline-flex items-center gap-1.5 text-[9px] font-black text-violet-400 bg-violet-500/15 border border-violet-500/20 px-2 py-1 rounded-full uppercase tracking-wider mb-3">
                                        <Sparkles className="h-2.5 w-2.5" />
                                        AI Tip
                                    </div>
                                    <p className="text-white font-bold text-sm leading-relaxed mb-4">
                                        Customizable dashboards make analysts{' '}
                                        <span className="text-violet-300">40% more efficient</span> at spotting trends.
                                    </p>
                                    <Link
                                        to="/dashboard/insights"
                                        className="inline-flex items-center gap-1.5 text-xs font-bold text-white/60 hover:text-violet-300 transition-colors"
                                    >
                                        View Insights <ArrowUpRight className="h-3.5 w-3.5" />
                                    </Link>
                                </div>
                            </div>
                        )}
                    </DashboardWidget>
                </div>
            </DashboardGrid>
        </div>
    )
}

export default DashboardHome
