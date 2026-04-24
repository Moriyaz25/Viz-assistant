import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Eraser, CheckCircle2, AlertCircle, RotateCcw, Trash2, Wand2, ChevronDown, ChevronUp } from 'lucide-react'
import { parseCleaningInstruction } from '../../services/nlChartService'

/**
 * Feature 5: Conversational Data Cleaning
 * User says "remove blank rows" or "fill nulls in Age with 0" → applies operation
 */

// Apply a cleaning operation to data
function applyCleaningOp(data, op) {
    if (!op || !data) return data
    let result = [...data]

    switch (op.operation) {
        case 'remove_nulls':
            if (op.column) {
                result = result.filter(row => row[op.column] !== null && row[op.column] !== undefined && row[op.column] !== '')
            } else {
                const cols = Object.keys(data[0] || {})
                result = result.filter(row => cols.every(col => row[col] !== null && row[col] !== undefined && row[col] !== ''))
            }
            break

        case 'fill_nulls':
            result = result.map(row => {
                if (op.column) {
                    const isNull = row[op.column] === null || row[op.column] === undefined || row[op.column] === ''
                    if (isNull) {
                        // Special fill values
                        if (op.params?.fillValue === 'mean' || op.params?.fillValue === 'average') {
                            const vals = data.map(r => Number(r[op.column])).filter(v => !isNaN(v))
                            const mean = vals.reduce((a, b) => a + b, 0) / (vals.length || 1)
                            return { ...row, [op.column]: Number(mean.toFixed(2)) }
                        }
                        return { ...row, [op.column]: op.params?.fillValue ?? 0 }
                    }
                }
                return row
            })
            break

        case 'remove_duplicates':
            const seen = new Set()
            result = result.filter(row => {
                const key = op.column ? String(row[op.column]) : JSON.stringify(row)
                if (seen.has(key)) return false
                seen.add(key)
                return true
            })
            break

        case 'filter_rows':
            if (op.column && op.params?.filterCondition && op.params?.filterValue !== undefined) {
                const fv = Number(op.params.filterValue)
                result = result.filter(row => {
                    const rv = Number(row[op.column])
                    switch (op.params.filterCondition) {
                        case 'gt': return rv > fv
                        case 'lt': return rv < fv
                        case 'eq': return String(row[op.column]) === String(op.params.filterValue)
                        case 'neq': return String(row[op.column]) !== String(op.params.filterValue)
                        default: return true
                    }
                })
            }
            break

        case 'replace_value':
            if (op.column && op.params?.fromValue !== undefined) {
                result = result.map(row => {
                    if (String(row[op.column]) === String(op.params.fromValue)) {
                        return { ...row, [op.column]: op.params.toValue ?? '' }
                    }
                    return row
                })
            }
            break

        case 'trim_whitespace':
            result = result.map(row => {
                const newRow = { ...row }
                const cols = op.column ? [op.column] : Object.keys(row)
                cols.forEach(col => {
                    if (typeof newRow[col] === 'string') {
                        newRow[col] = newRow[col].trim()
                    }
                })
                return newRow
            })
            break

        case 'remove_outliers':
            if (op.column) {
                const vals = data.map(r => Number(r[op.column])).filter(v => !isNaN(v))
                const mean = vals.reduce((a, b) => a + b, 0) / (vals.length || 1)
                const std = Math.sqrt(vals.reduce((a, b) => a + (b - mean) ** 2, 0) / (vals.length || 1))
                result = result.filter(row => {
                    const v = Number(row[op.column])
                    return isNaN(v) || Math.abs((v - mean) / (std || 1)) <= 3
                })
            }
            break

        default:
            break
    }

    return result
}

const DataCleaner = ({ data, onDataChange }) => {
    const [query, setQuery] = useState('')
    const [loading, setLoading] = useState(false)
    const [history, setHistory] = useState([]) // [{op, description, beforeCount, afterCount}]
    const [error, setError] = useState(null)
    const [showHistory, setShowHistory] = useState(false)

    const columns = data && data.length > 0 ? Object.keys(data[0]) : []

    const suggestions = [
        'Remove rows with blank values',
        'Remove duplicate rows',
        'Fill empty values with 0',
        'Remove outliers in numeric columns',
        'Trim whitespace from all text',
    ]

    const handleClean = async (q) => {
        const instruction = q || query
        if (!instruction.trim() || !data || data.length === 0) return

        setLoading(true)
        setError(null)
        try {
            const op = await parseCleaningInstruction(instruction, columns, data)
            if (!op) { setError('Could not understand the instruction'); setLoading(false); return }

            const beforeCount = data.length
            const cleaned = applyCleaningOp(data, op)
            const afterCount = cleaned.length

            setHistory(h => [{
                instruction,
                description: op.description,
                operation: op.operation,
                beforeCount,
                afterCount,
                rowsRemoved: beforeCount - afterCount,
                timestamp: new Date().toLocaleTimeString()
            }, ...h])

            onDataChange(cleaned)
            setQuery('')
        } catch (e) {
            setError('Cleaning failed: ' + e.message)
        } finally {
            setLoading(false)
        }
    }

    const handleUndo = () => {
        // Note: full undo would require storing data snapshots
        // For now, remove last history entry and inform user
        setHistory(h => h.slice(1))
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-500/10 rounded-lg">
                        <Eraser className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm">Data Cleaner</h4>
                        <p className="text-[10px] text-muted-foreground">
                            {data?.length?.toLocaleString()} rows · Describe what to clean
                        </p>
                    </div>
                </div>
                {history.length > 0 && (
                    <button
                        onClick={() => setShowHistory(s => !s)}
                        className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                        {history.length} ops {showHistory ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </button>
                )}
            </div>

            {/* Input */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Wand2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleClean()}
                        placeholder='e.g. "remove blank rows" or "fill nulls in Age with 0"'
                        disabled={loading}
                        className="w-full bg-muted/50 border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:opacity-50"
                    />
                </div>
                <button
                    onClick={() => handleClean()}
                    disabled={loading || !query.trim()}
                    className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-1.5 shrink-0"
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eraser className="h-4 w-4" />}
                    {loading ? '' : 'Clean'}
                </button>
            </div>

            {/* Quick suggestions */}
            <div className="flex flex-wrap gap-1.5">
                {suggestions.map(s => (
                    <button
                        key={s}
                        onClick={() => handleClean(s)}
                        disabled={loading}
                        className="text-[10px] font-bold px-2.5 py-1 bg-muted hover:bg-muted/80 border border-border rounded-lg text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                    >
                        {s}
                    </button>
                ))}
            </div>

            {/* Error */}
            <AnimatePresence>
                {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                        <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                        <p className="text-xs text-red-400">{error}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Operation history */}
            <AnimatePresence>
                {showHistory && history.length > 0 && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="space-y-2 pt-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Operation History</p>
                            {history.map((h, i) => (
                                <div key={i} className="flex items-start justify-between gap-2 bg-muted/30 rounded-xl p-3 border border-border">
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-foreground truncate">{h.description}</p>
                                        <p className="text-[10px] text-muted-foreground">
                                            {h.beforeCount} → {h.afterCount} rows
                                            {h.rowsRemoved > 0 && <span className="text-amber-400 ml-1">(-{h.rowsRemoved})</span>}
                                            {h.rowsRemoved === 0 && <span className="text-emerald-400 ml-1"> (values modified)</span>}
                                            · {h.timestamp}
                                        </p>
                                    </div>
                                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default DataCleaner
