import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import {
    TrendingUp, Loader2, AlertTriangle, Sparkles, Database, MessageSquare,
    Send, ArrowLeft, Download, FileText, Image, FileDown, ChevronDown,
    Wand2, AlertCircle, Target, Eraser, GitCompare
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { motion, AnimatePresence } from 'framer-motion'
import { generateInsights, askAI } from '../services/aiService'
import { db } from '../services/firebase'
import { doc, getDoc, collection, query as firestoreQuery, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'
import ChartGenerator from '../components/charts/ChartGenerator'
import { downloadChartAsPNG, exportFullReportAsPDF, exportDataAsCSV, exportInsightsAsTxt } from '../utils/downloadUtils'
import NLChartInput from '../components/features/NLChartInput'
import AnomalyHighlighter from '../components/features/AnomalyHighlighter'
import DataStoryButton from '../components/features/DataStoryButton'
import ColumnProfiler from '../components/features/ColumnProfiler'
import DataCleaner from '../components/features/DataCleaner'
import GoalTracker from '../components/features/GoalTracker'
import ShareableLinkButton from '../components/features/ShareableLinkButton'

const BarChart2Icon = ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="3" y="12" width="4" height="9" strokeWidth={2}/><rect x="10" y="7" width="4" height="14" strokeWidth={2}/><rect x="17" y="4" width="4" height="17" strokeWidth={2}/></svg>

const TABS = [
    { id: 'insights', label: 'AI Insights', icon: Sparkles },
    { id: 'profile', label: 'Column Profile', icon: BarChart2Icon },
    { id: 'anomalies', label: 'Anomalies', icon: AlertCircle },
    { id: 'clean', label: 'Clean Data', icon: Eraser },
    { id: 'goals', label: 'Goals', icon: Target },
]

const InsightsPage = () => {
    const [searchParams] = useSearchParams()
    const datasetId = searchParams.get('id')
    const [dataset, setDataset] = useState(null)
    const [workingData, setWorkingData] = useState(null)
    const [insights, setInsights] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [activeTab, setActiveTab] = useState('insights')
    const [chartConfig, setChartConfig] = useState(null)
    const [goals, setGoals] = useState([])
    const [downloading, setDownloading] = useState(false)
    const [showDownloadMenu, setShowDownloadMenu] = useState(false)
    const downloadMenuRef = useRef(null)

    // ✅ Renamed from 'query' to 'chatQuery' to avoid conflict with Firestore's query import
    const [chatQuery, setChatQuery] = useState('')
    const [chatHistory, setChatHistory] = useState([])
    const [chatLoading, setChatLoading] = useState(false)

    useEffect(() => {
        const h = (e) => { if (downloadMenuRef.current && !downloadMenuRef.current.contains(e.target)) setShowDownloadMenu(false) }
        document.addEventListener('mousedown', h)
        return () => document.removeEventListener('mousedown', h)
    }, [])

    useEffect(() => {
        const fetchDataset = async (id) => {
            setLoading(true); setError(null)
            try {
                const docRef = doc(db, 'datasets', id)
                const docSnap = await getDoc(docRef)
                if (!docSnap.exists()) { setError("Dataset not found."); setLoading(false); return }
                const data = { id: docSnap.id, ...docSnap.data() }
                setDataset(data)
                setWorkingData(data.raw_data || [])

                // ✅ Using renamed firestoreQuery to avoid conflict
                const q = firestoreQuery(collection(db, 'insights'), where('dataset_id', '==', id))
                const snap = await getDocs(q)
                if (!snap.empty) setInsights(snap.docs[0].data().summary_text)
                else if (data?.raw_data) handleGenerateInsights(data.raw_data)
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load dataset")
            } finally { setLoading(false) }
        }
        if (datasetId) fetchDataset(datasetId)
    }, [datasetId])

    const handleDownload = async (type) => {
        setShowDownloadMenu(false); setDownloading(true)
        try {
            const name = dataset?.file_name?.replace(/\.[^.]+$/, '') || 'analysis'
            if (type === 'png') await downloadChartAsPNG('chart-capture', `${name}_chart.png`)
            else if (type === 'pdf') await exportFullReportAsPDF('chart-capture', insights, name)
            else if (type === 'csv') exportDataAsCSV(workingData || [], `${name}.csv`)
            else if (type === 'txt') exportInsightsAsTxt(insights, `${name}_insights.txt`)
        } finally { setDownloading(false) }
    }

    const handleGenerateInsights = useCallback(async (dataToAnalyze) => {
        if (!dataToAnalyze || dataToAnalyze.length === 0) return
        setLoading(true); setError(null)
        try {
            const aiResult = await generateInsights(dataToAnalyze)
            if (aiResult?.startsWith("QUOTA_EXCEEDED:")) { setInsights(aiResult.replace("QUOTA_EXCEEDED: ", "")); setError("AI Quota exceeded") }
            else if (aiResult?.startsWith("AI_UNAVAILABLE:")) { setInsights(null); setError("AI Service Unavailable: Missing API Key") }
            else if (aiResult?.startsWith("ERROR:")) { setInsights(null); setError(aiResult.replace("ERROR: ", "")) }
            else {
                setInsights(aiResult)
                try {
                    await addDoc(collection(db, 'insights'), {
                        dataset_id: datasetId,
                        summary_text: aiResult,
                        created_at: serverTimestamp()
                    })
                } catch {}
            }
        } catch { setError("AI analysis failed.") }
        finally { setLoading(false) }
    }, [datasetId])

    const handleAskAI = async (e) => {
        e.preventDefault()
        if (!chatQuery.trim() || !dataset) return

        // ✅ Using chatQuery instead of query
        setChatHistory(prev => [...prev, { role: 'user', content: chatQuery }])
        setChatQuery(''); setChatLoading(true)
        try {
            const response = await askAI(chatQuery, workingData || [])
            setChatHistory(prev => [...prev, { role: 'assistant', content: response }])
        } catch {
            setChatHistory(prev => [...prev, { role: 'assistant', content: "Sorry, I couldn't process that." }])
        } finally { setChatLoading(false) }
    }

    const numericColumns = workingData && workingData.length > 0
        ? Object.keys(workingData[0]).filter(col => {
            const val = workingData.find(r => r[col] !== null && r[col] !== undefined)?.[col]
            return typeof val === 'number' || (!isNaN(parseFloat(val)) && isFinite(val))
        }) : []

    if (!datasetId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
                <div className="bg-primary/10 p-6 rounded-3xl"><Database className="h-12 w-12 text-primary" /></div>
                <div>
                    <h2 className="text-2xl font-bold">No Dataset Selected</h2>
                    <p className="text-zinc-500 max-w-sm mx-auto mt-2">Please upload a dataset or select one from your history.</p>
                </div>
                <Link to="/dashboard/upload" className="bg-primary text-white px-8 py-3 rounded-2xl font-bold">Go to Upload</Link>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link to="/dashboard/history" className="p-2 hover:bg-muted rounded-xl transition-colors"><ArrowLeft className="h-5 w-5" /></Link>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">AI Intelligence</h1>
                        <p className="text-zinc-500 font-medium">Analyzing: {dataset?.file_name || 'Loading...'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-500 rounded-full text-xs font-bold uppercase tracking-widest">
                        <Sparkles className="h-3 w-3" />Groq AI Active
                    </div>
                    <DataStoryButton data={workingData} insights={insights} fileName={dataset?.file_name?.replace(/\.[^.]+$/, '') || 'Dataset'} />
                    <ShareableLinkButton dataset={dataset} insights={insights} chartConfig={chartConfig} />
                    <div className="relative" ref={downloadMenuRef}>
                        <button onClick={() => setShowDownloadMenu(v => !v)} disabled={downloading || !dataset}
                            className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all disabled:opacity-50">
                            {downloading ? <><Loader2 className="h-4 w-4 animate-spin" /> Exporting...</> : <><Download className="h-4 w-4" /> Export <ChevronDown className="h-3 w-3" /></>}
                        </button>
                        <AnimatePresence>
                            {showDownloadMenu && (
                                <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.95 }}
                                    className="absolute right-0 top-full mt-2 w-52 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-50">
                                    {[
                                        { type: 'pdf', icon: FileText, label: 'Full Report', sub: 'Chart + AI insights (PDF)', color: 'text-red-400' },
                                        { type: 'png', icon: Image, label: 'Chart Image', sub: 'High-res PNG', color: 'text-blue-400' },
                                        { type: 'csv', icon: FileDown, label: 'Cleaned Data', sub: 'Current data as CSV', color: 'text-green-400' },
                                        { type: 'txt', icon: FileText, label: 'AI Insights', sub: 'Plain text report', color: 'text-purple-400' },
                                    ].map(item => (
                                        <button key={item.type} onClick={() => handleDownload(item.type)} disabled={item.type === 'txt' && !insights}
                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/60 transition-colors text-left group disabled:opacity-40">
                                            <div className="p-1.5 rounded-lg bg-muted group-hover:scale-110 transition-transform">
                                                <item.icon className={`h-4 w-4 ${item.color}`} />
                                            </div>
                                            <div><p className="text-sm font-bold">{item.label}</p><p className="text-[10px] text-zinc-500">{item.sub}</p></div>
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </header>

            {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center justify-between gap-4 text-red-500">
                    <div className="flex items-center gap-3"><AlertTriangle className="h-5 w-5 shrink-0" /><p className="text-sm font-bold">{error}</p></div>
                    <button onClick={() => dataset && handleGenerateInsights(workingData || [])}
                        className="text-xs font-black uppercase tracking-widest bg-red-500/10 hover:bg-red-500/20 px-4 py-2 rounded-lg">Retry AI</button>
                </motion.div>
            )}

            {/* Feature 1: NL Chart */}
            <div className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 bg-violet-500/10 rounded-lg"><Wand2 className="h-4 w-4 text-violet-400" /></div>
                    <h3 className="font-bold text-sm">Natural Language Chart Builder</h3>
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 bg-violet-500/20 text-violet-400 rounded-full border border-violet-500/30">AI</span>
                </div>
                <NLChartInput data={workingData} onChartConfig={setChartConfig} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <motion.div id="chart-capture" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                        <ChartGenerator data={workingData || []} externalConfig={chartConfig} goals={goals} />
                    </motion.div>

                    {/* Feature tabs */}
                    <div className="bg-card border border-border rounded-2xl overflow-hidden">
                        <div className="flex border-b border-border overflow-x-auto">
                            {TABS.map(tab => (
                                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold whitespace-nowrap transition-colors border-b-2 ${
                                        activeTab === tab.id ? 'text-primary border-primary bg-primary/5' : 'text-muted-foreground border-transparent hover:text-foreground'
                                    }`}>
                                    <tab.icon className="h-3.5 w-3.5" />{tab.label}
                                </button>
                            ))}
                        </div>
                        <div className="p-6">
                            {activeTab === 'insights' && (
                                loading ? (
                                    <div className="flex flex-col items-center justify-center py-16">
                                        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                                        <h3 className="text-lg font-bold">Generating Insights...</h3>
                                    </div>
                                ) : insights ? (
                                    <div>
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="bg-primary/10 p-2 rounded-xl"><TrendingUp className="h-5 w-5 text-primary" /></div>
                                            <h2 className="text-xl font-black">Strategic Report</h2>
                                        </div>
                                        <div className="prose dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:font-black">
                                            <ReactMarkdown>{insights}</ReactMarkdown>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-16">
                                        <Sparkles className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
                                        <h3 className="text-xl font-bold">No Insights Yet</h3>
                                        <button onClick={() => handleGenerateInsights(workingData || [])} className="text-primary font-bold mt-4 hover:underline">Generate Now</button>
                                    </div>
                                )
                            )}
                            {activeTab === 'profile' && <ColumnProfiler data={workingData} />}
                            {activeTab === 'anomalies' && <AnomalyHighlighter data={workingData} />}
                            {activeTab === 'clean' && <DataCleaner data={workingData} onDataChange={setWorkingData} />}
                            {activeTab === 'goals' && <GoalTracker data={workingData} numericColumns={numericColumns} onGoalsChange={setGoals} />}
                        </div>
                    </div>
                </div>

                {/* AI Chat sidebar */}
                <div className="space-y-4">
                    <div className="bg-card border border-border rounded-[2.5rem] flex flex-col h-[600px] shadow-xl">
                        <div className="p-6 border-b border-border flex items-center gap-3">
                            <div className="bg-purple-500/10 p-2 rounded-xl text-purple-500"><MessageSquare className="h-5 w-5" /></div>
                            <h3 className="font-bold">Natural Query</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                            {chatHistory.length === 0 && (
                                <div className="text-center py-10">
                                    <p className="text-sm text-zinc-500 italic">Ask anything about this dataset...</p>
                                    <div className="mt-4 flex flex-wrap gap-2 justify-center">
                                        {["Top 3 trends?", "Data outliers?", "Future forecast?"].map(tip => (
                                            <button key={tip} onClick={() => setChatQuery(tip)}
                                                className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-muted rounded-lg hover:bg-muted/80">
                                                {tip}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {chatHistory.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-muted rounded-tl-none'}`}>
                                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                                    </div>
                                </div>
                            ))}
                            {chatLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-muted px-4 py-3 rounded-2xl rounded-tl-none">
                                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ✅ Using chatQuery instead of query everywhere below */}
                        <form onSubmit={handleAskAI} className="p-4 border-t border-border bg-muted/30">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={chatQuery}
                                    onChange={e => setChatQuery(e.target.value)}
                                    placeholder="Type your question..."
                                    className="w-full bg-card border border-border rounded-xl pl-4 pr-12 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                />
                                <button type="submit" disabled={!chatQuery.trim() || chatLoading}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary hover:bg-primary/10 rounded-lg disabled:opacity-50">
                                    <Send className="h-4 w-4" />
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Feature 6 quick link */}
                    <div className="bg-card border border-border rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <GitCompare className="h-4 w-4 text-blue-400" />
                            <p className="font-bold text-sm">Compare Datasets</p>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">Side-by-side comparison with another dataset</p>
                        <Link to="/dashboard/compare"
                            className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl text-xs font-bold hover:bg-blue-500/20 transition-colors">
                            <GitCompare className="h-3.5 w-3.5" />Open Comparison Tool
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default InsightsPage