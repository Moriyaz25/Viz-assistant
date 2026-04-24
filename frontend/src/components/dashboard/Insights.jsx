import { useState, useEffect } from 'react'
import { Lightbulb, TrendingUp, AlertTriangle, Sparkles, Loader2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { generateInsights } from '../../services/aiService'

const Insights = ({ data }) => {
    const [aiInsights, setAiInsights] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [lastProcessedData, setLastProcessedData] = useState(null)

    useEffect(() => {
        if (data && data.length > 0 && JSON.stringify(data.slice(0, 50)) !== JSON.stringify(lastProcessedData)) {
            handleGenerateInsights()
        }
    }, [data])

    const handleGenerateInsights = async () => {
        if (loading) return

        setLoading(true)
        setError(null)
        try {
            const insights = await generateInsights(data)

            if (insights.startsWith("QUOTA_EXCEEDED:")) {
                setError("Quota Exceeded")
                setAiInsights(insights.replace("QUOTA_EXCEEDED: ", ""))
            } else {
                setAiInsights(insights)
                setLastProcessedData(data.slice(0, 50))
            }
        } catch (error) {
            console.error("Error in component generating insights:", error)
            setError("General Error")
            setAiInsights("Failed to load AI insights. Please try again later.")
        } finally {
            setLoading(false)
        }
    }

    if (!data || data.length === 0) return null

    // Helper to find basic stats
    const keys = Object.keys(data[0])
    const numericKeys = keys.filter(key => typeof data[0][key] === 'number')
    const catKey = keys.find(key => typeof data[0][key] === 'string') || keys[0]

    const renderStats = () => {
        if (numericKeys.length === 0) return null

        const keyMetric = numericKeys[0]
        const maxItem = data.reduce((prev, current) => (prev[keyMetric] > current[keyMetric]) ? prev : current)
        const total = data.reduce((sum, item) => sum + (item[keyMetric] || 0), 0)
        const average = total / data.length

        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <div className="flex items-center space-x-2 text-primary mb-2">
                        <TrendingUp className="h-5 w-5" />
                        <h4 className="font-semibold text-sm uppercase tracking-wider">Top Performer</h4>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">
                        Highest {keyMetric}
                    </p>
                    <p className="text-xl font-bold text-foreground truncate">
                        {maxItem[catKey]}: {maxItem[keyMetric]}
                    </p>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <div className="flex items-center space-x-2 text-blue-500 mb-2">
                        <Lightbulb className="h-5 w-5" />
                        <h4 className="font-semibold text-sm uppercase tracking-wider">Average</h4>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">
                        Average {keyMetric}
                    </p>
                    <p className="text-xl font-bold text-foreground">
                        {average.toFixed(2)}
                    </p>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <div className="flex items-center space-x-2 text-amber-500 mb-2">
                        <AlertTriangle className="h-5 w-5" />
                        <h4 className="font-semibold text-sm uppercase tracking-wider">Dataset Size</h4>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">
                        Total Records
                    </p>
                    <p className="text-xl font-bold text-foreground">
                        {data.length}
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {renderStats()}

            <div className="bg-secondary/20 border border-primary/20 rounded-xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Sparkles className="h-24 w-24 text-primary" />
                </div>

                <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className="flex items-center space-x-2">
                        <Sparkles className={`h-5 w-5 ${error === "Quota Exceeded" ? "text-amber-500" : "text-primary"}`} />
                        <h3 className="text-lg font-bold">
                            {error === "Quota Exceeded" ? "AI Usage Limit" : "Deep AI Analysis"}
                        </h3>
                    </div>
                    <button
                        onClick={handleGenerateInsights}
                        disabled={loading}
                        className={`text-xs font-medium flex items-center transition-colors ${loading ? 'text-muted-foreground' : 'text-primary hover:underline'}`}
                    >
                        {loading ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : null}
                        {error ? "Retry Analysis" : "Regenerate"}
                    </button>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-3">
                        <Loader2 className="h-8 w-8 text-primary animate-spin" />
                        <p className="text-sm text-muted-foreground animate-pulse">Consulting the AI analyst...</p>
                    </div>
                ) : (
                    <div className={`prose prose-sm prose-invert max-w-none text-foreground leading-relaxed ${error === "Quota Exceeded" ? "bg-amber-500/5 p-4 rounded-lg border border-amber-500/20" : ""}`}>
                        {error === "Quota Exceeded" && (
                            <div className="flex items-center space-x-2 text-amber-500 mb-2">
                                <AlertTriangle className="h-4 w-4" />
                                <span className="font-semibold text-xs uppercase">Rate Limit Reached</span>
                            </div>
                        )}
                        <ReactMarkdown>{aiInsights}</ReactMarkdown>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Insights
