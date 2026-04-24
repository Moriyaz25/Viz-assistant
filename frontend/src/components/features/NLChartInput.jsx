import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Sparkles, Wand2, CheckCircle2, AlertCircle, RotateCcw } from 'lucide-react'
import { nlToChart } from '../../services/nlChartService'

/**
 * Feature 1: Natural Language to Chart
 * User types "show monthly sales" → auto-configures chart
 */
const NLChartInput = ({ data, onChartConfig }) => {
    const [query, setQuery] = useState('')
    const [loading, setLoading] = useState(false)
    const [lastResult, setLastResult] = useState(null)
    const [error, setError] = useState(null)

    const columns = data && data.length > 0 ? Object.keys(data[0]) : []

    const examples = [
        'Show sales by region',
        'Which category has highest revenue?',
        'Trend over time',
        'Top 5 products by quantity',
        'Distribution of values',
    ]

    const handleSubmit = async (q) => {
        const question = q || query
        if (!question.trim() || !data || data.length === 0) return

        setLoading(true)
        setError(null)
        setLastResult(null)
        try {
            const config = await nlToChart(question, columns, data)
            if (config && config.chartType && config.xAxisKey && config.yAxisKey) {
                setLastResult(config)
                onChartConfig(config)
            } else {
                setError("Couldn't understand that. Try being more specific.")
            }
        } catch {
            setError('AI chart generation failed')
        } finally {
            setLoading(false)
            setQuery('')
        }
    }

    return (
        <div className="space-y-3">
            {/* Input */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Wand2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                        placeholder="Describe the chart you want..."
                        disabled={loading}
                        className="w-full bg-muted/50 border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all disabled:opacity-50"
                    />
                </div>
                <button
                    onClick={() => handleSubmit()}
                    disabled={loading || !query.trim()}
                    className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-1.5"
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    {loading ? '' : 'Build'}
                </button>
            </div>

            {/* Quick example chips */}
            <div className="flex flex-wrap gap-1.5">
                {examples.map(ex => (
                    <button
                        key={ex}
                        onClick={() => handleSubmit(ex)}
                        disabled={loading}
                        className="text-[10px] font-bold px-2.5 py-1 bg-muted hover:bg-muted/80 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                    >
                        {ex}
                    </button>
                ))}
            </div>

            {/* Result feedback */}
            <AnimatePresence>
                {lastResult && (
                    <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-start gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3"
                    >
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs font-bold text-emerald-400">{lastResult.title}</p>
                            <p className="text-[10px] text-muted-foreground">{lastResult.reasoning}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                                → {lastResult.chartType} chart · X: <span className="font-bold">{lastResult.xAxisKey}</span> · Y: <span className="font-bold">{lastResult.yAxisKey}</span>
                            </p>
                        </div>
                    </motion.div>
                )}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3"
                    >
                        <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                        <p className="text-xs text-red-400">{error}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default NLChartInput
