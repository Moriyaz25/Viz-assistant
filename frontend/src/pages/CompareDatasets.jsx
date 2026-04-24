import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GitCompare, Loader2, Database, Plus, ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { db } from '../services/firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import { generateInsights } from '../services/aiService'
import ReactMarkdown from 'react-markdown'

/**
 * Feature 6: Multi-Dataset Comparison Mode
 * Select 2 datasets, compare stats + AI analysis side-by-side
 */

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
    const pctDiff = isNum && n1 !== 0 ? ((diff / Math.abs(n1)) * 100).toFixed(1) : null

    return (
        <div className="grid grid-cols-7 gap-2 items-center py-2 border-b border-border/50 last:border-0">
            <div className="col-span-2 text-xs font-bold text-muted-foreground truncate">{label}</div>
            <div className="col-span-2 text-xs font-black text-center bg-blue-500/10 rounded-lg py-1 px-2">{val1 ?? '—'}</div>
            <div className="col-span-1 flex items-center justify-center">
                {diff !== null ? (
                    <span className={`text-[10px] font-black ${diff > 0 ? 'text-emerald-400' : diff < 0 ? 'text-red-400' : 'text-muted-foreground'}`}>
                        {diff > 0 ? <TrendingUp className="h-3 w-3" /> : diff < 0 ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                    </span>
                ) : <ArrowRight className="h-3 w-3 text-muted-foreground" />}
            </div>
            <div className="col-span-2 text-xs font-black text-center bg-violet-500/10 rounded-lg py-1 px-2">{val2 ?? '—'}</div>
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

            // AI comparison
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
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black">Compare Datasets</h1>
                <p className="text-muted-foreground">Select two datasets to compare side-by-side with AI analysis</p>
            </div>

            {/* Dataset selectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[0, 1].map(idx => (
                    <div key={idx} className={`bg-card border rounded-2xl p-5 ${idx === 0 ? 'border-blue-500/30' : 'border-violet-500/30'}`}>
                        <div className="flex items-center gap-2 mb-3">
                            <div className={`w-3 h-3 rounded-full ${idx === 0 ? 'bg-blue-500' : 'bg-violet-500'}`} />
                            <p className="font-bold text-sm">Dataset {idx + 1}</p>
                        </div>
                        <select
                            value={selected[idx]?.id || ''}
                            onChange={e => handleSelect(idx, e.target.value)}
                            className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                        >
                            <option value="">Select a dataset...</option>
                            {datasets
                                .filter(d => d.id !== selected[idx === 0 ? 1 : 0]?.id)
                                .map(d => (
                                    <option key={d.id} value={d.id}>{d.file_name}</option>
                                ))}
                        </select>
                        {selected[idx] && (
                            <div className="mt-2 flex gap-2 text-[10px] text-muted-foreground">
                                <span>{selected[idx].row_count?.toLocaleString()} rows</span>
                                <span>·</span>
                                <span>{selected[idx].column_count} columns</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <button
                onClick={handleCompare}
                disabled={!selected[0] || !selected[1] || comparing}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-2xl font-bold shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
                {comparing ? <Loader2 className="h-5 w-5 animate-spin" /> : <GitCompare className="h-5 w-5" />}
                {comparing ? 'Comparing...' : 'Compare Datasets'}
            </button>

            {/* Comparison results */}
            {comparison && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    {/* Overview stats */}
                    <div className="bg-card border border-border rounded-2xl overflow-hidden">
                        <div className="p-4 border-b border-border bg-muted/20">
                            <div className="grid grid-cols-7 gap-2">
                                <div className="col-span-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Metric</div>
                                <div className="col-span-2 text-center text-[10px] font-black uppercase tracking-widest text-blue-400 truncate">
                                    {selected[0]?.file_name}
                                </div>
                                <div className="col-span-1" />
                                <div className="col-span-2 text-center text-[10px] font-black uppercase tracking-widest text-violet-400 truncate">
                                    {selected[1]?.file_name}
                                </div>
                            </div>
                        </div>
                        <div className="p-4">
                            <StatCompareRow label="Total Rows" val1={comparison.s1.rowCount} val2={comparison.s2.rowCount} />
                            <StatCompareRow label="Total Columns" val1={comparison.s1.colCount} val2={comparison.s2.colCount} />
                            {commonCols.slice(0, 8).map(col => {
                                const c1 = comparison.s1.columns[col]
                                const c2 = comparison.s2.columns[col]
                                if (c1.type === 'numeric') {
                                    return (
                                        <StatCompareRow key={col + '_mean'} label={`${col} (avg)`} val1={c1.mean} val2={c2.mean} />
                                    )
                                }
                                return (
                                    <StatCompareRow key={col + '_unique'} label={`${col} (unique)`} val1={c1.unique} val2={c2.unique} />
                                )
                            })}
                        </div>
                    </div>

                    {/* AI Comparative Insights */}
                    {(aiLoading || aiComparison) && (
                        <div className="bg-card border border-border rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-primary/10 p-2 rounded-xl">
                                    <TrendingUp className="h-5 w-5 text-primary" />
                                </div>
                                <h3 className="font-black">AI Comparative Analysis</h3>
                            </div>
                            {aiLoading ? (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span className="text-sm">Generating comparative insights...</span>
                                </div>
                            ) : (
                                <div className="prose dark:prose-invert max-w-none prose-p:leading-relaxed text-sm">
                                    <ReactMarkdown>{aiComparison}</ReactMarkdown>
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
