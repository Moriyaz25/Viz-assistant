import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GitCompare, Loader2, TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react'
import { db } from '../services/firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import { generateInsights } from '../services/aiService'
import ReactMarkdown from 'react-markdown'

const AMB = '#F59E0B'

function computeStats(data) {
    if (!data || data.length === 0) return {}
    const cols = Object.keys(data[0])
    const stats = { rowCount: data.length, colCount: cols.length, columns: {} }

    cols.forEach(col => {
        const vals = data.map(r => Number(r[col])).filter(v => !isNaN(v))
        if (vals.length > data.length * 0.5) {
            const mean = vals.reduce((a, b) => a + b, 0) / vals.length
            stats.columns[col] = {
                type: 'numeric',
                mean: mean.toFixed(2),
                min: Math.min(...vals),
                max: Math.max(...vals),
                sum: vals.reduce((a, b) => a + b, 0).toFixed(2)
            }
        } else {
            const unique = new Set(data.map(r => r[col])).size
            stats.columns[col] = { type: 'categorical', unique }
        }
    })
    return stats
}

const StatCompareRow = ({ label, val1, val2 }) => {
    const n1 = Number(val1)
    const n2 = Number(val2)
    const isNum = !isNaN(n1) && !isNaN(n2) && val1 !== undefined && val2 !== undefined
    const diff = isNum ? n2 - n1 : null

    return (
        <div className="grid grid-cols-7 gap-2 items-center py-2.5"
            style={{ borderBottom: '1px solid hsl(30 8% 13%)' }}>
            <div className="col-span-2 text-[11px] font-bold truncate" style={{ color: 'hsl(30 8% 45%)' }}>{label}</div>
            <div className="col-span-2 text-xs font-black text-center py-1.5 px-2 rounded-lg"
                style={{ background: 'hsl(38 95% 50% / 0.1)', color: AMB, border: '1px solid hsl(38 95% 50% / 0.2)' }}>
                {val1 ?? '—'}
            </div>
            <div className="col-span-1 flex items-center justify-center">
                {diff !== null ? (
                    diff > 0
                        ? <TrendingUp className="h-3.5 w-3.5" style={{ color: '#10B981' }} />
                        : diff < 0
                            ? <TrendingDown className="h-3.5 w-3.5" style={{ color: '#F87171' }} />
                            : <Minus className="h-3.5 w-3.5" style={{ color: 'hsl(30 8% 40%)' }} />
                ) : (
                    <ArrowRight className="h-3.5 w-3.5" style={{ color: 'hsl(30 8% 40%)' }} />
                )}
            </div>
            <div className="col-span-2 text-xs font-black text-center py-1.5 px-2 rounded-lg"
                style={{ background: 'hsl(270 70% 60% / 0.1)', color: '#A78BFA', border: '1px solid hsl(270 70% 60% / 0.2)' }}>
                {val2 ?? '—'}
            </div>
        </div>
    )
}

const CompareDatasets = () => {
    const { user } = useAuth()
    const [datasets, setDatasets] = useState([])
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState([null, null])
    const [comparing, setComparing] = useState(false)
    const [comparison, setComparison] = useState(null)
    const [aiComparison, setAiComparison] = useState(null)
    const [aiLoading, setAiLoading] = useState(false)

    useEffect(() => {
        if (user) fetchDatasets()
    }, [user])

    const fetchDatasets = async () => {
        try {
            const q = query(collection(db, 'datasets'), where('user_id', '==', user.uid))
            const snap = await getDocs(q)
            setDatasets(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        } finally {
            setLoading(false)
        }
    }

    const handleSelect = (idx, datasetId) => {
        const ds = datasets.find(d => d.id === datasetId)
        setSelected(s => { const n = [...s]; n[idx] = ds; return n })
        setComparison(null)
        setAiComparison(null)
    }

    const handleCompare = async () => {
        if (!selected[0] || !selected[1]) return
        setComparing(true)
        try {
            const s1 = computeStats(selected[0].raw_data)
            const s2 = computeStats(selected[1].raw_data)
            setComparison({ s1, s2 })

            setAiLoading(true)
            const combinedData = [
                ...((selected[0].raw_data || []).slice(0, 50).map(r => ({ _source: selected[0].file_name, ...r }))),
                ...((selected[1].raw_data || []).slice(0, 50).map(r => ({ _source: selected[1].file_name, ...r }))),
            ]
            const aiResult = await generateInsights(combinedData)
            setAiComparison(aiResult)
        } finally {
            setComparing(false)
            setAiLoading(false)
        }
    }

    const commonCols = comparison
        ? Object.keys(comparison.s1.columns || {}).filter(c => comparison.s2.columns?.[c])
        : []

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[40vh]">
                <Loader2 className="h-8 w-8 animate-spin" style={{ color: AMB }} />
            </div>
        )
    }

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <motion.header initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="font-black text-white" style={{ fontSize: 28, letterSpacing: '-0.03em' }}>
                    Compare Datasets
                </h1>
                <p className="text-sm font-medium mt-1" style={{ color: 'hsl(30 8% 42%)' }}>
                    Select two datasets to compare side-by-side with AI analysis
                </p>
            </motion.header>

            {/* Dataset selectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[0, 1].map(idx => {
                    const accentColor = idx === 0 ? AMB : '#A78BFA'
                    const accentBg = idx === 0 ? 'hsl(38 95% 50% / 0.08)' : 'hsl(270 70% 60% / 0.08)'
                    const accentBorder = idx === 0 ? 'hsl(38 95% 50% / 0.25)' : 'hsl(270 70% 60% / 0.25)'

                    return (
                        <div key={idx} className="rounded-xl p-5"
                            style={{ background: 'hsl(30 8% 9%)', border: `1px solid ${accentBorder}` }}>
                            {/* Top accent line */}
                            <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-xl"
                                style={{ background: `linear-gradient(90deg, ${accentColor}60, transparent)` }} />

                            <div className="flex items-center gap-2.5 mb-4">
                                <div className="w-3 h-3 rounded-full" style={{ background: accentColor, boxShadow: `0 0 8px ${accentColor}80` }} />
                                <p className="text-sm font-black text-white">Dataset {idx + 1}</p>
                            </div>

                            <select
                                value={selected[idx]?.id || ''}
                                onChange={e => handleSelect(idx, e.target.value)}
                                className="w-full rounded-xl px-3 py-2.5 text-sm font-bold outline-none transition-all"
                                style={{
                                    background: 'hsl(30 8% 13%)',
                                    border: `1px solid ${selected[idx] ? accentBorder : 'hsl(30 8% 18%)'}`,
                                    color: selected[idx] ? 'hsl(40 15% 90%)' : 'hsl(30 8% 45%)',
                                }}
                            >
                                <option value="">Select a dataset...</option>
                                {datasets
                                    .filter(d => d.id !== selected[idx === 0 ? 1 : 0]?.id)
                                    .map(d => (
                                        <option key={d.id} value={d.id}>{d.file_name}</option>
                                    ))}
                            </select>

                            {selected[idx] && (
                                <div className="mt-3 flex items-center gap-2">
                                    <span className="text-[10px] font-bold px-2 py-1 rounded-full"
                                        style={{ background: accentBg, color: accentColor, border: `1px solid ${accentBorder}` }}>
                                        {selected[idx].row_count?.toLocaleString()} rows
                                    </span>
                                    <span className="text-[10px] font-bold px-2 py-1 rounded-full"
                                        style={{ background: accentBg, color: accentColor, border: `1px solid ${accentBorder}` }}>
                                        {selected[idx].column_count} cols
                                    </span>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Compare button */}
            <button
                onClick={handleCompare}
                disabled={!selected[0] || !selected[1] || comparing}
                className="flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-black transition-all disabled:opacity-40 disabled:pointer-events-none"
                style={{
                    background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                    color: 'hsl(30 10% 5%)',
                    boxShadow: '0 0 20px hsl(38 95% 50% / 0.28)',
                }}
                onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.boxShadow = '0 0 32px hsl(38 95% 50% / 0.5)' }}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 20px hsl(38 95% 50% / 0.28)'}
            >
                {comparing
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <GitCompare className="h-4 w-4" />}
                {comparing ? 'Comparing...' : 'Compare Datasets'}
            </button>

            {/* Comparison results */}
            {comparison && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

                    {/* Stats table */}
                    <div className="rounded-xl overflow-hidden"
                        style={{ background: 'hsl(30 8% 9%)', border: '1px solid hsl(30 8% 15%)' }}>

                        {/* Table header */}
                        <div className="grid grid-cols-7 gap-2 px-5 py-3"
                            style={{ background: 'hsl(30 8% 11%)', borderBottom: '1px solid hsl(30 8% 14%)' }}>
                            <div className="col-span-2 text-[9px] font-black uppercase tracking-[0.2em]"
                                style={{ color: 'hsl(30 8% 38%)' }}>Metric</div>
                            <div className="col-span-2 text-center text-[9px] font-black uppercase tracking-[0.15em] truncate"
                                style={{ color: AMB }}>
                                {selected[0]?.file_name?.replace(/\.[^.]+$/, '')}
                            </div>
                            <div className="col-span-1" />
                            <div className="col-span-2 text-center text-[9px] font-black uppercase tracking-[0.15em] truncate"
                                style={{ color: '#A78BFA' }}>
                                {selected[1]?.file_name?.replace(/\.[^.]+$/, '')}
                            </div>
                        </div>

                        <div className="px-5 py-2">
                            <StatCompareRow label="Total Rows"    val1={comparison.s1.rowCount} val2={comparison.s2.rowCount} />
                            <StatCompareRow label="Total Columns" val1={comparison.s1.colCount} val2={comparison.s2.colCount} />
                            {commonCols.slice(0, 8).map(col => {
                                const c1 = comparison.s1.columns[col]
                                const c2 = comparison.s2.columns[col]
                                return c1.type === 'numeric'
                                    ? <StatCompareRow key={col + '_mean'}   label={`${col} (avg)`}    val1={c1.mean}   val2={c2.mean} />
                                    : <StatCompareRow key={col + '_unique'} label={`${col} (unique)`} val1={c1.unique} val2={c2.unique} />
                            })}
                        </div>
                    </div>

                    {/* AI Comparative Insights */}
                    {(aiLoading || aiComparison) && (
                        <div className="rounded-xl p-6"
                            style={{ background: 'hsl(30 8% 9%)', border: '1px solid hsl(38 95% 50% / 0.18)' }}>

                            {/* Top glow line */}
                            <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-xl"
                                style={{ background: `linear-gradient(90deg, ${AMB}60, transparent)` }} />

                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                                    style={{ background: 'hsl(38 95% 50% / 0.12)', border: '1px solid hsl(38 95% 50% / 0.2)' }}>
                                    <TrendingUp className="h-4.5 w-4.5 h-[18px] w-[18px]" style={{ color: AMB }} />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-white">AI Comparative Analysis</p>
                                    <p className="text-[10px] font-bold" style={{ color: 'hsl(30 8% 42%)' }}>
                                        Powered by Gemini
                                    </p>
                                </div>
                                <div className="ml-auto flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-full"
                                    style={{ background: 'hsl(142 70% 45% / 0.12)', color: '#10B981', border: '1px solid hsl(142 70% 45% / 0.2)' }}>
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                                    Live
                                </div>
                            </div>

                            {aiLoading ? (
                                <div className="flex items-center gap-3 py-4" style={{ color: 'hsl(30 8% 45%)' }}>
                                    <Loader2 className="h-4 w-4 animate-spin" style={{ color: AMB }} />
                                    <span className="text-sm font-bold">Generating comparative insights...</span>
                                </div>
                            ) : (
                                <div className="text-sm font-medium leading-relaxed"
                                    style={{ color: 'hsl(40 12% 80%)' }}>
                                    <ReactMarkdown
                                        components={{
                                            p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                                            strong: ({ children }) => (
                                                <strong className="font-black" style={{ color: 'hsl(40 15% 92%)' }}>{children}</strong>
                                            ),
                                            ul: ({ children }) => <ul className="space-y-1.5 ml-4 mb-3">{children}</ul>,
                                            li: ({ children }) => (
                                                <li className="flex items-start gap-2">
                                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: AMB }} />
                                                    <span>{children}</span>
                                                </li>
                                            ),
                                            h3: ({ children }) => (
                                                <h3 className="text-sm font-black mb-2 mt-4 first:mt-0" style={{ color: AMB }}>{children}</h3>
                                            ),
                                        }}
                                    >
                                        {aiComparison}
                                    </ReactMarkdown>
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    )
}

export default CompareDatasets