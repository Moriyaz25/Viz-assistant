import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Database, Calendar, Trash2, ArrowRight, Loader2, Search, FileText } from 'lucide-react'
import { db } from '../services/firebase'
import { collection, query, where, getDocs, doc, writeBatch } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'

const AMB = '#F59E0B'

const History = () => {
    const { user } = useAuth()
    const [datasets, setDatasets] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => { if (user) fetchHistory() }, [user])

    const fetchHistory = async () => {
        setLoading(true)
        try {
            const q = query(collection(db, 'datasets'), where('user_id', '==', user.uid))
            const snap = await getDocs(q)
            const data = snap.docs.map(d => ({
                id: d.id, ...d.data(),
                upload_date: d.data().upload_date?.toDate?.()?.toISOString() || new Date().toISOString()
            })).sort((a, b) => new Date(b.upload_date) - new Date(a.upload_date))
            setDatasets(data)
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }

    const handleDelete = async id => {
        if (!confirm('Delete this dataset and all its insights?')) return
        try {
            const batch = writeBatch(db)
            ;['insights','charts'].forEach(async coll => {
                const snap = await getDocs(query(collection(db, coll), where('dataset_id', '==', id)))
                snap.forEach(d => batch.delete(d.ref))
            })
            batch.delete(doc(db, 'datasets', id))
            await batch.commit()
            setDatasets(prev => prev.filter(d => d.id !== id))
        } catch (err) { alert(`Failed to delete: ${err.message}`) }
    }

    const filtered = datasets.filter(d => d.file_name.toLowerCase().includes(searchTerm.toLowerCase()))

    return (
        <div className="space-y-6 animate-in">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="font-black text-white" style={{ fontSize: 26, letterSpacing: '-0.03em' }}>Dataset History</h1>
                    <p className="text-sm font-medium mt-1" style={{ color: 'hsl(30 8% 42%)' }}>
                        {datasets.length} dataset{datasets.length !== 1 ? 's' : ''} · Click any to re-analyze
                    </p>
                </div>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'hsl(30 8% 40%)' }} />
                    <input type="text" placeholder="Search datasets..." value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                        style={{ background: 'hsl(30 8% 10%)', border: '1px solid hsl(30 8% 17%)', color: 'hsl(40 15% 90%)' }}
                        onFocus={e => e.target.style.borderColor = 'hsl(38 95% 50% / 0.4)'}
                        onBlur={e => e.target.style.borderColor = 'hsl(30 8% 17%)'}
                    />
                </div>
            </header>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 rounded-2xl"
                    style={{ background: 'hsl(30 8% 9%)', border: '1px solid hsl(30 8% 15%)' }}>
                    <Loader2 className="h-8 w-8 animate-spin mb-3" style={{ color: AMB }} />
                    <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'hsl(30 8% 40%)' }}>Loading History...</p>
                </div>
            ) : filtered.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence>
                        {filtered.map((ds, i) => (
                            <motion.div key={ds.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }} exit={{ opacity: 0, scale: 0.95 }}
                                className="rounded-xl overflow-hidden transition-all"
                                style={{ background: 'hsl(30 8% 9%)', border: '1px solid hsl(30 8% 15%)' }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = 'hsl(38 95% 50% / 0.28)'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = 'hsl(30 8% 15%)'}>

                                <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, ${AMB}50, transparent)` }} />

                                <div className="p-5">
                                    <div className="flex items-start gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                                            style={{ background: 'hsl(38 95% 50% / 0.12)', border: '1px solid hsl(38 95% 50% / 0.2)' }}>
                                            <FileText className="h-5 w-5" style={{ color: AMB }} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-white text-sm truncate">{ds.file_name}</p>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <Calendar className="h-3 w-3" style={{ color: 'hsl(30 8% 38%)' }} />
                                                <p className="text-[10px] font-semibold" style={{ color: 'hsl(30 8% 38%)' }}>
                                                    {new Date(ds.upload_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 mb-4">
                                        {[
                                            { label: 'Rows', val: ds.row_count?.toLocaleString() ?? '—' },
                                            { label: 'Columns', val: ds.column_count ?? '—' },
                                        ].map(({ label, val }) => (
                                            <div key={label} className="rounded-lg p-2.5 text-center"
                                                style={{ background: 'hsl(30 8% 12%)', border: '1px solid hsl(30 8% 17%)' }}>
                                                <p className="font-black text-white text-base">{val}</p>
                                                <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'hsl(30 8% 40%)' }}>{label}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Link to={`/dashboard/insights?id=${ds.id}`}
                                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-black transition-all"
                                            style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: 'hsl(30 10% 5%)' }}
                                            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 20px hsl(38 95% 50% / 0.4)'}
                                            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                                            View Insights <ArrowRight className="h-3.5 w-3.5" />
                                        </Link>
                                        <button onClick={() => handleDelete(ds.id)}
                                            className="p-2 rounded-lg transition-all"
                                            style={{ background: 'hsl(0 75% 55% / 0.08)', border: '1px solid hsl(0 75% 55% / 0.15)', color: 'hsl(0 75% 55% / 0.5)' }}
                                            onMouseEnter={e => { e.currentTarget.style.color = 'hsl(0 75% 60%)'; e.currentTarget.style.background = 'hsl(0 75% 55% / 0.15)' }}
                                            onMouseLeave={e => { e.currentTarget.style.color = 'hsl(0 75% 55% / 0.5)'; e.currentTarget.style.background = 'hsl(0 75% 55% / 0.08)' }}>
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-24 rounded-2xl"
                    style={{ background: 'hsl(30 8% 9%)', border: '1px solid hsl(30 8% 15%)' }}>
                    <Database className="h-12 w-12 mb-4 opacity-20" style={{ color: AMB }} />
                    <h3 className="text-lg font-black text-white mb-2">
                        {searchTerm ? 'No results found' : 'No datasets yet'}
                    </h3>
                    <p className="text-sm mb-6" style={{ color: 'hsl(30 8% 42%)' }}>
                        {searchTerm ? `Nothing matched "${searchTerm}"` : 'Upload your first dataset to get started'}
                    </p>
                    {!searchTerm && (
                        <Link to="/dashboard/upload"
                            className="px-6 py-2.5 rounded-xl text-sm font-black"
                            style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: 'hsl(30 10% 5%)' }}>
                            Upload Now
                        </Link>
                    )}
                </div>
            )}
        </div>
    )
}

export default History