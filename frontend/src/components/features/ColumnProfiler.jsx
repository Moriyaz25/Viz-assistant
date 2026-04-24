import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart2, Hash, Type, Calendar, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Percent, TrendingUp, Layers } from 'lucide-react'
import { suggestFormulas } from '../../services/nlChartService'
import ReactMarkdown from 'react-markdown'

/**
 * Feature 4: Smart Column Profiler
 * Shows per-column stats, data quality, and formula suggestions
 */

function computeProfile(data, col) {
    const vals = data.map(r => r[col])
    const total = vals.length
    const nulls = vals.filter(v => v === null || v === undefined || v === '').length
    const unique = new Set(vals.map(v => String(v ?? ''))).size
    const nullPct = ((nulls / total) * 100).toFixed(1)
    const uniquePct = ((unique / total) * 100).toFixed(1)

    // Detect type
    const nonNullVals = vals.filter(v => v !== null && v !== undefined && v !== '')
    const numericVals = nonNullVals.map(v => Number(v)).filter(v => !isNaN(v))
    const isNumeric = numericVals.length > nonNullVals.length * 0.8

    let stats = {}
    let distribution = 'unknown'

    if (isNumeric && numericVals.length > 0) {
        const sorted = [...numericVals].sort((a, b) => a - b)
        const mean = numericVals.reduce((a, b) => a + b, 0) / numericVals.length
        const median = sorted[Math.floor(sorted.length / 2)]
        const std = Math.sqrt(numericVals.reduce((a, b) => a + (b - mean) ** 2, 0) / numericVals.length)
        const skewness = numericVals.reduce((a, b) => a + ((b - mean) / (std || 1)) ** 3, 0) / numericVals.length

        // Outlier count (Z > 2.5)
        const outliers = numericVals.filter(v => Math.abs((v - mean) / (std || 1)) > 2.5).length

        stats = {
            min: sorted[0],
            max: sorted[sorted.length - 1],
            mean: mean.toFixed(2),
            median: median.toFixed(2),
            std: std.toFixed(2),
            outliers
        }

        if (Math.abs(skewness) < 0.5) distribution = 'normal'
        else if (skewness > 0.5) distribution = 'right-skewed'
        else distribution = 'left-skewed'
    }

    // Frequency for categorical
    let topValues = []
    if (!isNumeric) {
        const freq = {}
        nonNullVals.forEach(v => { freq[String(v)] = (freq[String(v)] || 0) + 1 })
        topValues = Object.entries(freq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([val, count]) => ({ val, count, pct: ((count / total) * 100).toFixed(1) }))
    }

    return {
        col, total, nulls, nullPct, unique, uniquePct,
        isNumeric, stats, distribution, topValues,
        quality: nullPct < 5 ? 'good' : nullPct < 20 ? 'fair' : 'poor'
    }
}

const QualityBadge = ({ quality }) => {
    const map = {
        good: { color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', label: 'Good' },
        fair: { color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', label: 'Fair' },
        poor: { color: 'text-red-400 bg-red-500/10 border-red-500/20', label: 'Poor' }
    }
    const { color, label } = map[quality] || map.fair
    return (
        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${color}`}>
            {label}
        </span>
    )
}

const DistributionBar = ({ pct, color }) => (
    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
        <div
            className={`h-full rounded-full transition-all duration-700 ${color}`}
            style={{ width: `${Math.min(pct, 100)}%` }}
        />
    </div>
)

const ColumnCard = ({ profile, allColumns, sampleData, onApplyFormula }) => {
    const [expanded, setExpanded] = useState(false)
    const [formulaLoading, setFormulaLoading] = useState(false)
    const [formulas, setFormulas] = useState(null)
    const [formulaError, setFormulaError] = useState(null)

    const handleLoadFormulas = async () => {
        if (formulas) return
        setFormulaLoading(true)
        setFormulaError(null)
        try {
            const result = await suggestFormulas(profile.col, allColumns, sampleData)
            setFormulas(result)
        } catch {
            setFormulaError('Could not load suggestions')
        } finally {
            setFormulaLoading(false)
        }
    }

    const Icon = profile.isNumeric ? Hash : (profile.unique === profile.total ? Type : Layers)
    const typeLabel = profile.isNumeric ? 'Numeric' : (profile.unique / profile.total > 0.9 ? 'Text/ID' : 'Categorical')

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 transition-colors"
        >
            {/* Header */}
            <button
                onClick={() => setExpanded(e => !e)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
            >
                <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-lg ${profile.isNumeric ? 'bg-blue-500/10 text-blue-400' : 'bg-violet-500/10 text-violet-400'}`}>
                        <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                        <p className="font-bold text-sm truncate">{profile.col}</p>
                        <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{typeLabel}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                    <QualityBadge quality={profile.quality} />
                    {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
            </button>

            {/* Quick stats row */}
            <div className="px-4 pb-3 grid grid-cols-3 gap-2">
                <div className="text-center">
                    <p className="text-xs font-black text-foreground">{profile.unique.toLocaleString()}</p>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Unique</p>
                </div>
                <div className="text-center">
                    <p className={`text-xs font-black ${Number(profile.nullPct) > 10 ? 'text-amber-400' : 'text-foreground'}`}>{profile.nullPct}%</p>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Nulls</p>
                </div>
                <div className="text-center">
                    <p className="text-xs font-black text-foreground">{profile.total.toLocaleString()}</p>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Total</p>
                </div>
            </div>

            {/* Null bar */}
            <div className="px-4 pb-3">
                <DistributionBar
                    pct={100 - Number(profile.nullPct)}
                    color={Number(profile.nullPct) > 20 ? 'bg-red-500' : Number(profile.nullPct) > 5 ? 'bg-amber-500' : 'bg-emerald-500'}
                />
                <p className="text-[9px] text-muted-foreground mt-1">{(100 - Number(profile.nullPct)).toFixed(1)}% complete</p>
            </div>

            {/* Expanded details */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden border-t border-border"
                    >
                        <div className="p-4 space-y-4">
                            {/* Numeric stats */}
                            {profile.isNumeric && profile.stats.mean !== undefined && (
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Statistics</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { label: 'Min', val: profile.stats.min },
                                            { label: 'Mean', val: profile.stats.mean },
                                            { label: 'Max', val: profile.stats.max },
                                            { label: 'Median', val: profile.stats.median },
                                            { label: 'Std Dev', val: profile.stats.std },
                                            { label: 'Outliers', val: profile.stats.outliers, highlight: profile.stats.outliers > 0 },
                                        ].map(({ label, val, highlight }) => (
                                            <div key={label} className="bg-muted/50 rounded-lg p-2 text-center">
                                                <p className={`text-xs font-black ${highlight ? 'text-amber-400' : 'text-foreground'}`}>
                                                    {typeof val === 'number' ? val.toLocaleString() : val}
                                                </p>
                                                <p className="text-[9px] text-muted-foreground">{label}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-2 flex items-center gap-2">
                                        <TrendingUp className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-[10px] text-muted-foreground">
                                            Distribution: <span className="font-bold text-foreground capitalize">{profile.distribution}</span>
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Categorical top values */}
                            {!profile.isNumeric && profile.topValues.length > 0 && (
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Top Values</p>
                                    <div className="space-y-1.5">
                                        {profile.topValues.map(({ val, count, pct }) => (
                                            <div key={val} className="flex items-center gap-2">
                                                <span className="text-xs text-muted-foreground w-4">{pct}%</span>
                                                <div className="flex-1 h-4 bg-muted rounded overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary/40 rounded"
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-semibold truncate max-w-[100px]">{val}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Feature 8: Formula Suggestions */}
                            {profile.isNumeric && (
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">AI Formula Suggestions</p>
                                        {!formulas && (
                                            <button
                                                onClick={handleLoadFormulas}
                                                disabled={formulaLoading}
                                                className="text-[10px] font-black text-primary hover:underline uppercase tracking-wider disabled:opacity-50"
                                            >
                                                {formulaLoading ? 'Loading...' : 'Suggest →'}
                                            </button>
                                        )}
                                    </div>
                                    {formulaError && <p className="text-xs text-red-400">{formulaError}</p>}
                                    {formulas && (
                                        <div className="space-y-2">
                                            {formulas.map((f, i) => (
                                                <div key={i} className="bg-muted/50 rounded-xl p-3 border border-border">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="min-w-0">
                                                            <p className="text-xs font-bold text-primary truncate">{f.newColumnName}</p>
                                                            <p className="text-[10px] text-muted-foreground">{f.formula}</p>
                                                            <p className="text-[10px] text-foreground/70 mt-0.5">{f.useCase}</p>
                                                        </div>
                                                        <button
                                                            onClick={() => onApplyFormula && onApplyFormula(f, profile.col)}
                                                            className="shrink-0 text-[9px] font-black uppercase tracking-wider px-2 py-1 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                                                        >
                                                            Apply
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

const ColumnProfiler = ({ data, onApplyFormula }) => {
    const columns = data && data.length > 0 ? Object.keys(data[0]) : []
    const profiles = useMemo(() => columns.map(col => computeProfile(data, col)), [data, columns])

    const goodCols = profiles.filter(p => p.quality === 'good').length
    const poorCols = profiles.filter(p => p.quality === 'poor').length

    if (!data || data.length === 0) return null

    return (
        <div className="space-y-6">
            {/* Summary header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-black">Column Profiler</h3>
                    <p className="text-sm text-muted-foreground">{columns.length} columns · {data.length.toLocaleString()} rows</p>
                </div>
                <div className="flex gap-2">
                    <span className="text-xs font-bold px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {goodCols} Good
                    </span>
                    {poorCols > 0 && (
                        <span className="text-xs font-bold px-2 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
                            {poorCols} Poor
                        </span>
                    )}
                </div>
            </div>

            {/* Overall quality bar */}
            <div className="bg-card border border-border rounded-2xl p-4">
                <div className="flex justify-between text-xs mb-2">
                    <span className="font-bold text-muted-foreground">Overall Data Quality</span>
                    <span className="font-black">{((goodCols / columns.length) * 100).toFixed(0)}%</span>
                </div>
                <DistributionBar pct={(goodCols / columns.length) * 100} color="bg-gradient-to-r from-emerald-500 to-primary" />
            </div>

            {/* Column cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {profiles.map(profile => (
                    <ColumnCard
                        key={profile.col}
                        profile={profile}
                        allColumns={columns}
                        sampleData={data}
                        onApplyFormula={onApplyFormula}
                    />
                ))}
            </div>
        </div>
    )
}

export default ColumnProfiler
