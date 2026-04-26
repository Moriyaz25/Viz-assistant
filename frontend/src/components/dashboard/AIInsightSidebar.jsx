import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X, Send, Loader2, ChevronRight } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { useAuth } from '../../context/AuthContext'
import { db } from '../../services/firebase'
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore'
import { askAI } from '../../services/aiService'
import { Link } from 'react-router-dom'

const AMB = '#F59E0B'

const AIInsightSidebar = ({ isOpen, onClose }) => {
    const { user } = useAuth()
    const [insight, setInsight] = useState(null)
    const [loading, setLoading] = useState(true)
    const [chatQuery, setChatQuery] = useState('')
    const [chatLoading, setChatLoading] = useState(false)
    const [latestDataset, setLatestDataset] = useState(null)

    useEffect(() => {
        if (!isOpen || !user) return
        const fetch = async () => {
            setLoading(true)
            try {
                const dsQ = query(collection(db, 'datasets'), where('user_id', '==', user.uid), orderBy('upload_date', 'desc'), limit(1))
                const dsSnap = await getDocs(dsQ)
                if (!dsSnap.empty) {
                    const ds = { id: dsSnap.docs[0].id, ...dsSnap.docs[0].data() }
                    setLatestDataset(ds)
                    const insQ = query(collection(db, 'insights'), where('dataset_id', '==', ds.id), limit(1))
                    const insSnap = await getDocs(insQ)
                    if (!insSnap.empty) setInsight(insSnap.docs[0].data().summary_text)
                }
            } catch {}
            finally { setLoading(false) }
        }
        fetch()
    }, [isOpen, user])

    const handleAsk = async e => {
        e.preventDefault()
        if (!chatQuery.trim() || !latestDataset) return
        setChatLoading(true)
        try {
            const resp = await askAI(chatQuery, latestDataset.raw_data || [])
            setInsight(`### Q: ${chatQuery}\n\n${resp}`)
            setChatQuery('')
        } catch {}
        finally { setChatLoading(false) }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 md:hidden"
                        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
                        onClick={onClose} />

                    <motion.div
                        initial={{ x: '100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 380, damping: 38 }}
                        className="fixed right-0 top-0 bottom-0 z-50 flex flex-col w-full max-w-sm shadow-2xl"
                        style={{ background: 'hsl(30 8% 7%)', borderLeft: '1px solid hsl(30 8% 14%)' }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 shrink-0"
                            style={{ borderBottom: '1px solid hsl(30 8% 13%)' }}>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                                    style={{ background: 'hsl(38 95% 50% / 0.15)', border: '1px solid hsl(38 95% 50% / 0.25)' }}>
                                    <Sparkles className="h-4 w-4" style={{ color: AMB }} />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-white">AI Assistant</p>
                                    <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'hsl(30 8% 40%)' }}>
                                        {latestDataset ? latestDataset.file_name : 'No dataset loaded'}
                                    </p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-1.5 rounded-lg transition-colors"
                                style={{ color: 'hsl(30 8% 45%)' }}
                                onMouseEnter={e => e.currentTarget.style.color = 'white'}
                                onMouseLeave={e => e.currentTarget.style.color = 'hsl(30 8% 45%)'}>
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center h-full gap-3">
                                    <Loader2 className="h-8 w-8 animate-spin" style={{ color: AMB }} />
                                    <p className="text-xs font-bold" style={{ color: 'hsl(30 8% 42%)' }}>Loading insights...</p>
                                </div>
                            ) : insight ? (
                                <div className="prose prose-sm max-w-none"
                                    style={{ '--tw-prose-body': 'hsl(40 15% 75%)', '--tw-prose-headings': 'white', '--tw-prose-bold': 'hsl(40 15% 90%)' }}>
                                    <ReactMarkdown>{insight}</ReactMarkdown>
                                </div>
                            ) : latestDataset ? (
                                <div className="text-center py-10">
                                    <Sparkles className="h-10 w-10 mx-auto mb-3 opacity-20" style={{ color: AMB }} />
                                    <p className="text-sm font-bold text-white mb-1">No insights yet</p>
                                    <p className="text-xs mb-4" style={{ color: 'hsl(30 8% 42%)' }}>Generate AI analysis for this dataset first</p>
                                    <Link to={`/dashboard/insights?id=${latestDataset.id}`} onClick={onClose}
                                        className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl"
                                        style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: 'hsl(30 10% 5%)' }}>
                                        Analyze Now <ChevronRight className="h-3 w-3" />
                                    </Link>
                                </div>
                            ) : (
                                <div className="text-center py-10">
                                    <Sparkles className="h-10 w-10 mx-auto mb-3 opacity-20" style={{ color: AMB }} />
                                    <p className="text-sm font-bold text-white mb-1">No datasets found</p>
                                    <p className="text-xs mb-4" style={{ color: 'hsl(30 8% 42%)' }}>Upload a dataset to get started</p>
                                    <Link to="/dashboard/upload" onClick={onClose}
                                        className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl"
                                        style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: 'hsl(30 10% 5%)' }}>
                                        Upload Data <ChevronRight className="h-3 w-3" />
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Chat input */}
                        <div className="p-4 shrink-0" style={{ borderTop: '1px solid hsl(30 8% 13%)' }}>
                            <form onSubmit={handleAsk} className="flex gap-2">
                                <input value={chatQuery} onChange={e => setChatQuery(e.target.value)}
                                    placeholder="Ask about your data..."
                                    disabled={!latestDataset || chatLoading}
                                    className="flex-1 px-3 py-2.5 rounded-xl text-sm text-white outline-none transition-all"
                                    style={{ background: 'hsl(30 8% 11%)', border: '1px solid hsl(30 8% 18%)' }}
                                    onFocus={e => e.target.style.borderColor = 'hsl(38 95% 50% / 0.4)'}
                                    onBlur={e => e.target.style.borderColor = 'hsl(30 8% 18%)'}
                                />
                                <button type="submit" disabled={!chatQuery.trim() || !latestDataset || chatLoading}
                                    className="p-2.5 rounded-xl transition-all disabled:opacity-40"
                                    style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: 'black' }}>
                                    {chatLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

export default AIInsightSidebar