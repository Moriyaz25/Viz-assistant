import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Loader2, AlertCircle, Sparkles, Database, Eye, Share2 } from 'lucide-react'
import { db } from '../services/firebase'
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore'
import ChartGenerator from '../components/charts/ChartGenerator'
import ReactMarkdown from 'react-markdown'
import { motion } from 'framer-motion'

/**
 * Feature 9: Public Share View
 * Read-only view of a shared analysis — no login required
 */
const PublicShareView = () => {
    const { shareId } = useParams()
    const [shareData, setShareData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (shareId) fetchShare()
    }, [shareId])

    const fetchShare = async () => {
        try {
            const docRef = doc(db, 'public_shares', shareId)
            const snap = await getDoc(docRef)

            if (!snap.exists() || !snap.data().is_active) {
                setError('This share link is invalid or has been revoked.')
                return
            }

            setShareData({ id: snap.id, ...snap.data() })

            // Increment view count (fire-and-forget)
            updateDoc(docRef, { view_count: increment(1) }).catch(() => {})
        } catch (err) {
            setError('Could not load this shared analysis.')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
                    <p className="text-muted-foreground font-bold">Loading shared analysis...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-4 max-w-sm">
                    <AlertCircle className="h-12 w-12 text-red-400 mx-auto" />
                    <h2 className="text-xl font-black">Link Not Found</h2>
                    <p className="text-muted-foreground">{error}</p>
                    <Link to="/" className="inline-block px-6 py-3 bg-primary text-white rounded-2xl font-bold text-sm">
                        Go to Vizassistance
                    </Link>
                </div>
            </div>
        )
    }

    const createdAt = shareData.created_at?.toDate?.()
    const dateStr = createdAt ? createdAt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recently'

    return (
        <div className="min-h-screen bg-background">
            {/* Header bar */}
            <div className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                            <Sparkles className="h-4 w-4 text-violet-400" />
                        </div>
                        <span className="font-black text-sm">Vizassistance</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Eye className="h-3.5 w-3.5" />
                            {(shareData.view_count || 0) + 1} views
                        </div>
                        <div className="h-4 w-px bg-border" />
                        <Link
                            to="/signup"
                            className="text-xs font-bold px-3 py-1.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
                        >
                            Create Your Own →
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
                {/* Title */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="flex items-start gap-3">
                        <div className="p-3 bg-primary/10 rounded-2xl">
                            <Share2 className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black">{shareData.dataset_name?.replace(/\.[^.]+$/, '')}</h1>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Database className="h-3 w-3" />
                                    {shareData.row_count?.toLocaleString()} rows · {shareData.column_count} columns
                                </span>
                                <span className="text-xs text-muted-foreground">Shared on {dateStr}</span>
                            </div>
                        </div>
                    </div>

                    {/* Read-only banner */}
                    <div className="mt-4 flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2.5 text-xs font-bold text-amber-400 w-fit">
                        <Eye className="h-3.5 w-3.5" />
                        Read-only view · No account required
                    </div>
                </motion.div>

                {/* Chart */}
                {shareData.preview_data && shareData.preview_data.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <ChartGenerator data={shareData.preview_data} />
                    </motion.div>
                )}

                {/* AI Insights */}
                {shareData.insights_text && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-card border border-border rounded-[2.5rem] p-8 shadow-xl"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-primary/10 p-2 rounded-xl">
                                <Sparkles className="h-5 w-5 text-primary" />
                            </div>
                            <h2 className="text-xl font-black">AI Strategic Report</h2>
                        </div>
                        <div className="prose dark:prose-invert max-w-none prose-p:leading-relaxed">
                            <ReactMarkdown>{shareData.insights_text}</ReactMarkdown>
                        </div>
                    </motion.div>
                )}

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-r from-violet-600/20 to-purple-600/20 border border-violet-500/30 rounded-3xl p-8 text-center space-y-4"
                >
                    <Sparkles className="h-10 w-10 text-violet-400 mx-auto" />
                    <h3 className="text-2xl font-black">Analyze Your Own Data</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto">
                        Upload CSV or Excel files and get instant AI-powered insights for free.
                    </p>
                    <Link
                        to="/signup"
                        className="inline-block px-8 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl font-black shadow-lg shadow-violet-500/20 hover:-translate-y-0.5 transition-all"
                    >
                        Get Started Free →
                    </Link>
                </motion.div>
            </div>
        </div>
    )
}

export default PublicShareView
