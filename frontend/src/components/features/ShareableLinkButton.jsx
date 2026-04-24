import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link2, Copy, CheckCircle2, Loader2, Globe, Lock, X, Eye } from 'lucide-react'
import { db } from '../../services/firebase'
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore'

/**
 * Feature 9: Shareable Public Dashboard Link
 * Creates a read-only public share link for any analysis
 */

const ShareableLinkButton = ({ dataset, insights, chartConfig }) => {
    const [loading, setLoading] = useState(false)
    const [shareUrl, setShareUrl] = useState(null)
    const [copied, setCopied] = useState(false)
    const [showPanel, setShowPanel] = useState(false)
    const [error, setError] = useState(null)

    const handleCreateLink = async () => {
        setLoading(true)
        setError(null)
        try {
            // Store a public snapshot in Firestore
            const shareDoc = await addDoc(collection(db, 'public_shares'), {
                dataset_name: dataset?.file_name || 'Dataset',
                row_count: dataset?.raw_data?.length || 0,
                column_count: dataset?.column_count || 0,
                insights_text: insights || '',
                chart_config: chartConfig || null,
                // Store only a sample of raw data for public view (first 500 rows)
                preview_data: (dataset?.raw_data || []).slice(0, 500),
                created_at: serverTimestamp(),
                view_count: 0,
                is_active: true,
            })

            const url = `${window.location.origin}/share/${shareDoc.id}`
            setShareUrl(url)
            setShowPanel(true)
        } catch (err) {
            setError('Failed to create share link. Please try again.')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleCopy = async () => {
        if (!shareUrl) return
        await navigator.clipboard.writeText(shareUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <>
            <button
                onClick={shareUrl ? () => setShowPanel(true) : handleCreateLink}
                disabled={loading || !dataset}
                className="flex items-center gap-2 text-sm font-bold px-4 py-2.5 bg-card border border-border rounded-xl hover:bg-muted transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
                {loading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Creating link...</>
                ) : shareUrl ? (
                    <><Globe className="h-4 w-4 text-emerald-400" /> Share Link</>
                ) : (
                    <><Link2 className="h-4 w-4" /> Share</>
                )}
            </button>

            <AnimatePresence>
                {showPanel && shareUrl && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={e => e.target === e.currentTarget && setShowPanel(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-card border border-border rounded-3xl p-6 w-full max-w-md shadow-2xl"
                        >
                            <div className="flex items-start justify-between mb-5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-emerald-500/10 rounded-xl">
                                        <Globe className="h-5 w-5 text-emerald-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-lg">Public Share Link</h3>
                                        <p className="text-xs text-muted-foreground">Anyone with this link can view (read-only)</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowPanel(false)} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {/* What's included */}
                            <div className="bg-muted/30 rounded-2xl p-4 mb-4 space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">What's shared</p>
                                {[
                                    { icon: Eye, label: 'AI Insights & Analysis', included: !!insights },
                                    { icon: Globe, label: 'Interactive Chart (if configured)', included: true },
                                    { icon: Database, label: 'Dataset Preview (first 500 rows)', included: true },
                                    { icon: Lock, label: 'Your account & personal data', included: false, isExcluded: true },
                                ].map(({ icon: Icon, label, included, isExcluded }) => (
                                    <div key={label} className="flex items-center gap-2">
                                        <Icon className={`h-3.5 w-3.5 shrink-0 ${included ? 'text-emerald-400' : 'text-muted-foreground'}`} />
                                        <span className={`text-xs ${isExcluded ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{label}</span>
                                        {!isExcluded && (
                                            <CheckCircle2 className={`h-3 w-3 ml-auto ${included ? 'text-emerald-400' : 'text-muted-foreground'}`} />
                                        )}
                                        {isExcluded && <Lock className="h-3 w-3 ml-auto text-muted-foreground" />}
                                    </div>
                                ))}
                            </div>

                            {/* Link box */}
                            <div className="flex gap-2">
                                <div className="flex-1 bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-xs font-mono text-muted-foreground truncate">
                                    {shareUrl}
                                </div>
                                <button
                                    onClick={handleCopy}
                                    className={`shrink-0 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                                        copied
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-primary text-white hover:bg-primary/90'
                                    }`}
                                >
                                    {copied ? (
                                        <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> Copied!</span>
                                    ) : (
                                        <span className="flex items-center gap-1"><Copy className="h-4 w-4" /> Copy</span>
                                    )}
                                </button>
                            </div>

                            <p className="text-[10px] text-muted-foreground mt-3 text-center">
                                This link will remain active. You can delete the dataset to revoke access.
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
        </>
    )
}

export default ShareableLinkButton
