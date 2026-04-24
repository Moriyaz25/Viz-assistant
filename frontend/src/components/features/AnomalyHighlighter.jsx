import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, TrendingUp, TrendingDown, Loader2, ChevronDown, ChevronUp, Zap, Eye } from 'lucide-react'
import { detectAnomalies } from '../../services/nlChartService'

/**
 * Feature 2: Anomaly Highlighter
 * Detects and explains statistical outliers in the dataset
 */
const AnomalyHighlighter = ({ data }) => {
    const [anomalies, setAnomalies] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [expanded, setExpanded] = useState({})
    const [showAll, setShowAll] = useState(false)

    const numericColumns = data && data.length > 0
        ? Object.keys(data[0]).filter(col => {
            const val = data.find(r => r[col] !== null && r[col] !== undefined)?.[col]
            return typeof val === 'number' || (!isNaN(parseFloat(val)) && isFinite(val))
        })
        : []

    useEffect(() => {
        if (data && data.length > 5 && numericColumns.length > 0) {
            handleDetect()
        }
    }, [data])

    const handleDetect = async () => {
        setLoading(true)
        setError(null)
        try {
            const result = await detectAnomalies(data, numericColumns)
            setAnomalies(result)
        } catch {
            setError('Failed to detect anomalies')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-3">
                <Loader2 className="h-5 w-5 text-amber-400 animate-spin" />
                <div>
                    <p className="font-bold text-sm">Scanning for anomalies...</p>
                    <p className="text-xs text-muted-foreground">Running Z-score analysis on {numericColumns.length} numeric columns</p>
                </div>
            </div>
        )
    }

    if (!anomalies || anomalies.length === 0) {
        return (
            <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-xl">
                    <Zap className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                    <p className="font-bold text-sm">No significant anomalies detected</p>
                    <p className="text-xs text-muted-foreground">All values within 2.5 standard deviations · Data looks clean!</p>
                </div>
            </div>
        )
    }

    const displayed = showAll ? anomalies : anomalies.slice(0, 4)

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-amber-500/10 rounded-lg">
                        <AlertTriangle className="h-4 w-4 text-amber-400" />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm">Anomaly Report</h4>
                        <p className="text-[10px] text-muted-foreground">{anomalies.length} outliers found via Z-score analysis</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black px-2 py-1 bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20">
                        {anomalies.filter(a => a.severity === 'high').length} High
                    </span>
                    <span className="text-[10px] font-black px-2 py-1 bg-orange-500/10 text-orange-400 rounded-full border border-orange-500/20">
                        {anomalies.filter(a => a.severity !== 'high').length} Medium
                    </span>
                </div>
            </div>

            {/* Anomaly cards */}
            <div className="space-y-2">
                {displayed.map((anomaly, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`border rounded-xl overflow-hidden ${
                            anomaly.severity === 'high'
                                ? 'border-red-500/30 bg-red-500/5'
                                : 'border-amber-500/20 bg-amber-500/5'
                        }`}
                    >
                        <button
                            onClick={() => setExpanded(e => ({ ...e, [i]: !e[i] }))}
                            className="w-full flex items-center justify-between p-3 text-left hover:bg-white/5 transition-colors"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div className={`p-1 rounded-lg ${anomaly.direction === 'HIGH' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                    {anomaly.direction === 'HIGH'
                                        ? <TrendingUp className="h-3.5 w-3.5" />
                                        : <TrendingDown className="h-3.5 w-3.5" />
                                    }
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold truncate">
                                        Row {anomaly.rowIndex} · <span className="text-primary">{anomaly.column}</span>
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">
                                        Value: <span className="font-bold text-foreground">{Number(anomaly.value).toLocaleString()}</span>
                                        {' '}(Z={anomaly.zScore}, {anomaly.direction} outlier)
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                                    anomaly.severity === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                                }`}>
                                    {anomaly.severity}
                                </span>
                                {expanded[i] ? <ChevronUp className="h-3 w-3 text-muted-foreground" /> : <ChevronDown className="h-3 w-3 text-muted-foreground" />}
                            </div>
                        </button>

                        <AnimatePresence>
                            {expanded[i] && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="px-3 pb-3 space-y-2 border-t border-border/50">
                                        {/* AI explanation */}
                                        <p className="text-xs text-muted-foreground pt-2">
                                            <span className="font-bold text-foreground">AI Analysis: </span>
                                            {anomaly.explanation}
                                        </p>

                                        {/* Stats */}
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { label: 'Value', val: Number(anomaly.value).toLocaleString() },
                                                { label: 'Column Mean', val: Number(anomaly.mean).toLocaleString() },
                                                { label: 'Z-Score', val: anomaly.zScore },
                                            ].map(({ label, val }) => (
                                                <div key={label} className="bg-background/30 rounded-lg p-2 text-center">
                                                    <p className="text-xs font-black">{val}</p>
                                                    <p className="text-[9px] text-muted-foreground">{label}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Row data preview */}
                                        {anomaly.rowData && (
                                            <div className="bg-background/30 rounded-lg p-2">
                                                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Row Data</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {Object.entries(anomaly.rowData).slice(0, 6).map(([k, v]) => (
                                                        <span key={k} className="text-[10px] px-1.5 py-0.5 bg-muted rounded">
                                                            <span className="text-muted-foreground">{k}:</span> {String(v ?? '—')}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </div>

            {anomalies.length > 4 && (
                <button
                    onClick={() => setShowAll(s => !s)}
                    className="w-full py-2 text-xs font-bold text-primary hover:bg-primary/5 rounded-xl transition-colors flex items-center justify-center gap-1"
                >
                    <Eye className="h-3.5 w-3.5" />
                    {showAll ? 'Show less' : `Show ${anomalies.length - 4} more anomalies`}
                </button>
            )}
        </div>
    )
}

export default AnomalyHighlighter
