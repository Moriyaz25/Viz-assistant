import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, MessageSquare, Send, ChevronRight, Zap, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/firebase';
import { collection, query as firestoreQuery, where, getDocs, limit } from 'firebase/firestore';
import { askAI } from '../../services/aiService';

const AIInsightSidebar = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const [insight, setInsight] = useState(null);
    const [loading, setLoading] = useState(false); // ✅ false, not true
    const [chatQuery, setChatQuery] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const [latestDataset, setLatestDataset] = useState(null);

    useEffect(() => {
        const fetchLatestInsight = async () => {
            if (!user) return;
            setLoading(true);
            try {
                // ✅ Removed orderBy to avoid composite index requirement
                // Sorting client-side by upload_date instead
                const datasetsQ = firestoreQuery(
                    collection(db, 'datasets'),
                    where('user_id', '==', user.uid),
                    limit(10)
                );
                const datasetsSnap = await getDocs(datasetsQ);

                if (!datasetsSnap.empty) {
                    const docs = datasetsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

                    // ✅ Client-side sort to get the latest dataset
                    const ds = docs.sort((a, b) =>
                        (b.upload_date?.seconds || 0) - (a.upload_date?.seconds || 0)
                    )[0];

                    setLatestDataset(ds);

                    // Get latest insight for this dataset
                    const insightsQ = firestoreQuery(
                        collection(db, 'insights'),
                        where('dataset_id', '==', ds.id),
                        limit(1)
                    );
                    const insightsSnap = await getDocs(insightsQ);
                    if (!insightsSnap.empty) {
                        setInsight(insightsSnap.docs[0].data().summary_text);
                    }
                }
            } catch (err) {
                console.error('Error fetching sidebar insights:', err);
            } finally {
                setLoading(false);
            }
        };

        if (isOpen) {
            fetchLatestInsight();
        }
    }, [isOpen, user]);

    const handleQuickAsk = async (e) => {
        e.preventDefault();
        if (!chatQuery.trim() || !latestDataset) return;

        setChatLoading(true);
        try {
            const resp = await askAI(chatQuery, latestDataset.raw_data || []);
            setInsight(`### Q: ${chatQuery}\n\n${resp}`);
            setChatQuery('');
        } catch (err) {
            console.error(err);
        } finally {
            setChatLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-[#0d0d12] border-l border-white/10 z-[70] shadow-2xl flex flex-col"
                    >
                        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                            <div className="flex items-center gap-3">
                                <div className="bg-violet-500/20 p-2 rounded-xl">
                                    <Sparkles className="h-5 w-5 text-violet-400" />
                                </div>
                                <div>
                                    <h3 className="font-black text-white">AI Copilot</h3>
                                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Intelligent Assistant</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                                <X className="h-5 w-5 text-white/40" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {loading ? (
                                <div className="space-y-4">
                                    <div className="h-4 w-1/2 bg-white/5 animate-pulse rounded" />
                                    <div className="h-32 w-full bg-white/5 animate-pulse rounded-2xl" />
                                    <div className="h-32 w-full bg-white/5 animate-pulse rounded-2xl" />
                                </div>
                            ) : insight ? (
                                <div className="space-y-6">
                                    <div className="glass-card bg-violet-600/5 border-violet-500/20 p-5 rounded-2xl relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-2 opacity-10">
                                            <Zap className="h-12 w-12" />
                                        </div>
                                        <h4 className="text-xs font-black text-violet-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <Zap className="h-3 w-3" />
                                            Latest Analysis
                                        </h4>
                                        <div className="prose prose-invert prose-sm max-w-none text-white/70 leading-relaxed font-medium">
                                            <ReactMarkdown>{insight}</ReactMarkdown>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <h4 className="text-xs font-black text-white/40 uppercase tracking-widest pl-1">Suggested Questions</h4>
                                        {['Identify anomalies', 'Summarize key trends', 'Predict next period'].map((q) => (
                                            <button
                                                key={q}
                                                onClick={() => setChatQuery(q)}
                                                className="w-full text-left p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-violet-500/30 hover:bg-white/[0.05] transition-all text-xs text-white/60 font-medium flex items-center justify-between group"
                                            >
                                                {q}
                                                <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center px-4 space-y-4">
                                    <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10">
                                        <MessageSquare className="h-8 w-8 text-white/10" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold">No data context yet</h4>
                                        <p className="text-white/30 text-xs mt-2">Upload a dataset to start chatting with your data.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-white/10 bg-white/[0.01]">
                            <form onSubmit={handleQuickAsk} className="relative group">
                                <input
                                    type="text"
                                    value={chatQuery}
                                    onChange={(e) => setChatQuery(e.target.value)}
                                    placeholder="Ask your data anything..."
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-5 pr-12 py-4 text-sm text-white placeholder:text-white/20 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={chatLoading || !chatQuery.trim() || !latestDataset}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-violet-600 text-white rounded-xl shadow-lg shadow-violet-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
                                >
                                    {chatLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                </button>
                            </form>
                            <p className="text-[10px] text-white/20 text-center mt-4 font-medium uppercase tracking-[0.2em]">Powered by Groq AI</p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default AIInsightSidebar;