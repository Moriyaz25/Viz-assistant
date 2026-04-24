import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Database, Calendar, Trash2, ArrowRight, Loader2, Search, FileText, ChevronRight } from 'lucide-react'
import { db } from '../services/firebase'
import { collection, query, where, getDocs, deleteDoc, doc, writeBatch } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'

const History = () => {
    const { user } = useAuth()
    const [datasets, setDatasets] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        if (user) {
            fetchHistory()
        }
    }, [user])

    const fetchHistory = async () => {
        setLoading(true)
        try {
            const q = query(
                collection(db, 'datasets'),
                where('user_id', '==', user.uid)
            )
            const querySnapshot = await getDocs(q)
            const data = querySnapshot.docs
                .map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    upload_date: doc.data().upload_date?.toDate?.()?.toISOString() || new Date().toISOString()
                }))
                .sort((a, b) => new Date(b.upload_date) - new Date(a.upload_date))
            setDatasets(data)
        } catch (err) {
            console.error('Error fetching history:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this dataset? All associated insights and charts will be lost.')) return

        try {
            const batch = writeBatch(db)

            // Delete insights
            const insightsQuery = query(collection(db, 'insights'), where('dataset_id', '==', id))
            const insightsSnap = await getDocs(insightsQuery)
            insightsSnap.forEach(doc => batch.delete(doc.ref))

            // Delete charts
            const chartsQuery = query(collection(db, 'charts'), where('dataset_id', '==', id))
            const chartsSnap = await getDocs(chartsQuery)
            chartsSnap.forEach(doc => batch.delete(doc.ref))

            // Delete dataset
            batch.delete(doc(db, 'datasets', id))

            await batch.commit()
            setDatasets(datasets.filter(d => d.id !== id))
        } catch (err) {
            console.error('Delete error:', err)
            alert(`Failed to delete: ${err.message || 'Unknown error'}`)
        }
    }

    const filteredDatasets = datasets.filter(d =>
        d.file_name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-foreground">Dataset History</h1>
                    <p className="text-zinc-500 mt-1 font-medium">Manage and revisit your previously analyzed data.</p>
                </div>
                <div className="relative w-full md:w-72 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search datasets..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-card border border-border rounded-2xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                    />
                </div>
            </header>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-[2.5rem]">
                    <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Retrieving Arvhives...</p>
                </div>
            ) : filteredDatasets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {filteredDatasets.map((ds) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                key={ds.id}
                                className="bg-card border border-border rounded-[2rem] p-6 hover:shadow-xl hover:shadow-primary/5 transition-all group overflow-hidden relative"
                            >
                                <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                                    <Database className="h-24 w-24 text-primary" />
                                </div>

                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
                                        <FileText className="h-6 w-6" />
                                    </div>
                                    <button
                                        onClick={() => handleDelete(ds.id)}
                                        className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>

                                <h3 className="text-lg font-bold text-foreground mb-1 truncate pr-8">{ds.file_name}</h3>
                                <div className="flex items-center gap-4 text-xs text-zinc-500 font-medium mb-6">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(ds.upload_date).toLocaleDateString()}
                                    </span>
                                    <span>{ds.row_count} rows</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Link
                                        to={`/dashboard/insights?id=${ds.id}`}
                                        className="flex-1 flex items-center justify-center gap-2 bg-muted text-foreground py-3 rounded-xl font-bold text-sm hover:bg-primary hover:text-white transition-all"
                                    >
                                        View Analysis
                                        <ChevronRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="text-center py-24 bg-card border-2 border-dashed border-border rounded-[2.5rem]">
                    <div className="bg-zinc-100 dark:bg-zinc-800 p-6 rounded-3xl inline-block mb-6">
                        <Database className="h-12 w-12 text-zinc-400" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">No Datasets Found</h3>
                    <p className="text-zinc-500 max-w-sm mx-auto mb-8">
                        {searchTerm ? "No results match your search query." : "You haven't uploaded any data yet. Start your journey by importing a file."}
                    </p>
                    <Link to="/dashboard/upload" className="bg-primary text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20">
                        Upload Your First Dataset
                    </Link>
                </div>
            )}
        </div>
    )
}

export default History
