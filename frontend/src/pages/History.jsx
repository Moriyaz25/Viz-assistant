import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Database, Calendar, Trash2, ArrowRight, Loader2, Search, FileText, ChevronRight, AlertTriangle, X } from 'lucide-react'
import { db } from '../services/firebase'
import { collection, query, where, getDocs, deleteDoc, doc, writeBatch } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'

// ── Delete Confirmation Dialog ────────────────────────────────────────
const DeleteConfirmDialog = ({ isOpen, fileName, onConfirm, onCancel }) => (
    <AnimatePresence>
        {isOpen && (
            <>
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={onCancel}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="fixed inset-0 z-[101] flex items-center justify-center p-4"
                >
                    <div className="bg-card border border-border rounded-[2rem] p-8 w-full max-w-sm shadow-2xl">
                        <div className="flex justify-center mb-6">
                            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl">
                                <Trash2 className="h-8 w-8 text-red-400" />
                            </div>
                        </div>
                        <div className="text-center mb-8">
                            <h3 className="text-xl font-black text-foreground mb-2">Delete Dataset?</h3>
                            <p className="text-zinc-500 text-sm">
                                <span className="font-bold text-foreground">"{fileName}"</span> aur uske saare insights
                                permanently delete ho jayenge. Ye action undo nahi ho sakta.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={onCancel}
                                className="flex-1 py-3 rounded-2xl border border-border bg-muted hover:bg-muted/80 text-foreground font-bold text-sm transition-all flex items-center justify-center gap-2"
                            >
                                <X className="h-4 w-4" /> Cancel
                            </button>
                            <button
                                onClick={onConfirm}
                                className="flex-1 py-3 rounded-2xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-500 font-bold text-sm transition-all flex items-center justify-center gap-2"
                            >
                                <Trash2 className="h-4 w-4" /> Delete
                            </button>
                        </div>
                    </div>
                </motion.div>
            </>
        )}
    </AnimatePresence>
)

const History = () => {
    const { user } = useAuth()
    const [datasets, setDatasets] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, fileName: '' })
    const [deleting, setDeleting] = useState(false)

    useEffect(() => {
        if (user) fetchHistory()
    }, [user])

    const fetchHistory = async () => {
        setLoading(true)
        try {
            const q = query(collection(db, 'datasets'), where('user_id', '==', user.uid))
            const querySnapshot = await getDocs(q)
            const data = querySnapshot.docs
                .map(d => ({
                    id: d.id,
                    ...d.data(),
                    upload_date: d.data().upload_date?.toDate?.()?.toISOString() || new Date().toISOString()
                }))
                .sort((a, b) => new Date(b.upload_date) - new Date(a.upload_date))
            setDatasets(data)
        } catch (err) {
            console.error('Error fetching history:', err)
        } finally {
            setLoading(false)
        }
    }

    const openDeleteDialog = (id, fileName) => {
        setDeleteDialog({ open: true, id, fileName })
    }

    const handleDeleteConfirmed = async () => {
        setDeleting(true)
        const id = deleteDialog.id
        try {
            const batch = writeBatch(db)

            // Delete insights
            const insightsSnap = await getDocs(query(collection(db, 'insights'), where('dataset_id', '==', id)))
            insightsSnap.forEach(d => batch.delete(d.ref))

            // Delete charts
            const chartsSnap = await getDocs(query(collection(db, 'charts'), where('dataset_id', '==', id)))
            chartsSnap.forEach(d => batch.delete(d.ref))

            // Delete dataset
            batch.delete(doc(db, 'datasets', id))

            await batch.commit()
            setDatasets(prev => prev.filter(d => d.id !== id))
            setDeleteDialog({ open: false, id: null, fileName: '' })
        } catch (err) {
            console.error('Delete error:', err)
            alert(`Failed to delete: ${err.message || 'Unknown error'}`)
        } finally {
            setDeleting(false)
        }
    }

    const filteredDatasets = datasets.filter(d =>
        d.file_name?.toLowerCase().includes(searchTerm.toLowerCase())
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
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Retrieving Archives...</p>
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
                                    {/* ✅ Fixed delete button — now opens confirmation dialog */}
                                    <button
                                        onClick={() => openDeleteDialog(ds.id, ds.file_name)}
                                        className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer z-10"
                                        title="Delete dataset"
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

            {/* ✅ Delete confirmation dialog */}
            <DeleteConfirmDialog
                isOpen={deleteDialog.open}
                fileName={deleteDialog.fileName}
                onConfirm={handleDeleteConfirmed}
                onCancel={() => !deleting && setDeleteDialog({ open: false, id: null, fileName: '' })}
            />
        </div>
    )
}

export default History