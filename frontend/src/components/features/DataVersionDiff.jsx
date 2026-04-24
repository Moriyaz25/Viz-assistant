import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GitCompare, Loader2, Plus, Minus, ArrowRight, CheckCircle2, AlertTriangle, Clock, RefreshCw, TrendingUp, Database } from 'lucide-react'
import { compareDatasetVersions } from '../../services/nlChartService'

/**
 * Feature 10: Data Freshness / Version Diff
 * Shows diff when same-named file is re-uploaded
 */
const DataVersionDiff = ({ currentData, previousData, fileName }) => {
    const [diff, setDiff] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (currentData && previousData) {
            compute()
        }
    }, [currentData, previousData])

    const compute = async () => {
        setLoading(true)
        try {
            const result = await compareDatasetVersions(previousData, currentData, fileName)
            setDiff(result)
        } finally {
            setLoading(false)
        }
    }

    if (!previousData || !currentData) return null

    if (loading) {
        return (
            <div className="flex items-center gap-2 bg-card border border-border rounded-2xl p-4">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <p className="text-sm font-bold">Comparing versions...</p>
            </div>
        )
    }

    if (!diff) return null

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-amber-500/30 rounded-2xl overflow-hidden"
        >
            {/* Header */}
            <div className="flex items-center gap-3 p-4 bg-amber-500/5 border-b border-amber-500/20">
                <div className="p-1.5 bg-amber-500/10 rounded-lg">
                    <RefreshCw className="h-4 w-4 text-amber-400" />
                </div>
                <div>
                    <p className="font-bold text-sm">Data Freshness Alert</p>
                    <p className="text-[10px] text-muted-foreground">New version detected for: <span className="font-bold">{fileName}</span></p>
                </div>
            </div>

            {/* Summary */}
            <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: 'Rows Added', val: diff.addedRows, color: 'text-emerald-400', icon: Plus },
                    { label: 'Rows Removed', val: diff.removedRows, color: 'text-red-400', icon: Minus },
                    { label: 'Values Changed', val: diff.totalChanges, color: 'text-amber-400', icon: RefreshCw },
                    { label: 'New Columns', val: diff.addedColumns.length, color: 'text-blue-400', icon: Database },
                ].map(({ label, val, color, icon: Icon }) => (
                    <div key={label} className="bg-muted/30 rounded-xl p-3 text-center">
                        <Icon className={`h-4 w-4 ${color} mx-auto mb-1`} />
                        <p className={`text-lg font-black ${color}`}>{val}</p>
                        <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{label}</p>
                    </div>
                ))}
            </div>

            {/* Changed values */}
            {diff.changedValues.length > 0 && (
                <div className="px-4 pb-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Sample Changes</p>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar">
                        {diff.changedValues.slice(0, 8).map((change, i) => (
                            <div key={i} className="flex items-center gap-2 bg-muted/20 rounded-lg px-3 py-1.5 text-xs">
                                <span className="text-muted-foreground shrink-0">Row {change.row}</span>
                                <span className="font-bold text-foreground shrink-0">{change.column}:</span>
                                <span className="text-red-400 line-through truncate">{change.oldValue || '(empty)'}</span>
                                <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                                <span className="text-emerald-400 truncate">{change.newValue || '(empty)'}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* New columns */}
            {diff.addedColumns.length > 0 && (
                <div className="px-4 pb-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">New Columns Added</p>
                    <div className="flex flex-wrap gap-1.5">
                        {diff.addedColumns.map(col => (
                            <span key={col} className="text-xs font-bold px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">
                                + {col}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    )
}

export default DataVersionDiff
