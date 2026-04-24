import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, CheckCircle2, Loader2, AlertCircle, Database, ArrowRight, Table as TableIcon, RefreshCw, Sparkles } from 'lucide-react'
import FileUpload from '../components/dashboard/FileUpload'
import { parseFile } from '../utils/fileParser'
import { db } from '../services/firebase'
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, limit } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import DataVersionDiff from '../components/features/DataVersionDiff'

const UploadData = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [file, setFile] = useState(null)
    const [data, setData] = useState(null)
    const [preview, setPreview] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [isSaving, setIsSaving] = useState(false)

    // Feature 10: previous version of same-named file
    const [previousData, setPreviousData] = useState(null)
    const [checkingVersion, setCheckingVersion] = useState(false)

    const handleFileSelect = async (selectedFile) => {
        setLoading(true)
        setError(null)
        setPreviousData(null)
        try {
            const result = await parseFile(selectedFile)
            setFile(selectedFile)
            setData(result.data)
            setPreview(result.data.slice(0, 5))

            // Feature 10: Check if same filename was uploaded before
            if (user) {
                setCheckingVersion(true)
                try {
                    const q = query(
                        collection(db, 'datasets'),
                        where('user_id', '==', user.uid),
                        where('file_name', '==', selectedFile.name),
                        orderBy('upload_date', 'desc'),
                        limit(1)
                    )
                    const snap = await getDocs(q)
                    if (!snap.empty) {
                        const prev = snap.docs[0].data()
                        if (prev.raw_data && prev.raw_data.length > 0) {
                            setPreviousData(prev.raw_data)
                        }
                    }
                } catch {
                    // Version check is non-critical, ignore errors
                } finally {
                    setCheckingVersion(false)
                }
            }
        } catch (err) {
            setError(err.message || "Failed to parse file")
        } finally {
            setLoading(false)
        }
    }

    const handleConfirmUpload = async () => {
        if (!user || !file || !data) return
        setIsSaving(true)
        try {
            const docRef = await addDoc(collection(db, 'datasets'), {
                user_id: user.uid,
                file_name: file.name,
                upload_date: serverTimestamp(),
                row_count: data.length,
                column_count: Object.keys(data[0] || {}).length,
                raw_data: data
            })
            navigate(`/dashboard/insights?id=${docRef.id}`)
        } catch (err) {
            setError(err.message || "Failed to save dataset")
        } finally {
            setIsSaving(false)
        }
    }

    const reset = () => {
        setFile(null)
        setData(null)
        setPreview([])
        setError(null)
        setPreviousData(null)
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header>
                <h1 className="text-3xl font-black tracking-tight text-foreground">Upload Dataset</h1>
                <p className="text-zinc-500 mt-1 font-medium">Import CSV or Excel files to generate AI-powered insights.</p>
            </header>

            {!file ? (
                <div className="bg-card border-2 border-dashed border-border rounded-[2.5rem] p-16 flex flex-col items-center justify-center text-center hover:bg-muted/30 transition-all group">
                    <FileUpload onFileSelect={handleFileSelect} />
                    {loading && (
                        <div className="mt-8 flex flex-col items-center gap-3">
                            <Loader2 className="h-10 w-10 text-primary animate-spin" />
                            <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Parsing Data...</p>
                        </div>
                    )}
                    {error && (
                        <div className="mt-8 bg-red-500/10 border border-red-500/20 px-6 py-3 rounded-2xl flex items-center gap-2 text-red-500 text-sm">
                            <AlertCircle className="h-5 w-5" />{error}
                        </div>
                    )}

                    {/* Supported formats info */}
                    <div className="mt-8 flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-full border border-border">
                            <FileText className="h-3 w-3 text-green-400" /> CSV
                        </span>
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-full border border-border">
                            <FileText className="h-3 w-3 text-blue-400" /> XLSX
                        </span>
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-full border border-border">
                            <FileText className="h-3 w-3 text-amber-400" /> XLS
                        </span>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Feature 10: Version Diff Alert — shown at top if same file uploaded again */}
                    {checkingVersion && (
                        <div className="flex items-center gap-2 bg-card border border-border rounded-2xl p-4 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            Checking for previous version of this file...
                        </div>
                    )}

                    {previousData && !checkingVersion && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                            <DataVersionDiff
                                currentData={data}
                                previousData={previousData}
                                fileName={file.name}
                            />
                        </motion.div>
                    )}

                    {/* Preview Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-xl"
                    >
                        <div className="p-8 border-b border-border flex items-center justify-between bg-muted/30">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                    <FileText className="h-7 w-7" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-foreground">{file.name}</h3>
                                    <p className="text-sm text-zinc-500 font-medium">
                                        {data.length.toLocaleString()} rows · {Object.keys(data[0] || {}).length} columns · {(file.size / 1024).toFixed(1)} KB
                                    </p>
                                </div>
                            </div>
                            <button onClick={reset} className="px-6 py-2 rounded-xl text-sm font-bold text-zinc-500 hover:bg-muted transition-colors">
                                Replace File
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            {/* Column badges */}
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Detected Columns</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {Object.keys(data[0] || {}).map(col => {
                                        const val = data.find(r => r[col] !== null && r[col] !== undefined)?.[col]
                                        const isNum = typeof val === 'number' || (!isNaN(parseFloat(val)) && isFinite(val))
                                        return (
                                            <span key={col} className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                                                isNum
                                                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                    : 'bg-violet-500/10 text-violet-400 border-violet-500/20'
                                            }`}>
                                                {col}
                                            </span>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-foreground font-bold">
                                <TableIcon className="h-5 w-5 text-primary" />
                                Preview (First 5 Rows)
                            </div>

                            <div className="overflow-x-auto rounded-2xl border border-border">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-muted/50 border-b border-border">
                                        <tr>
                                            {Object.keys(data[0] || {}).map(header => (
                                                <th key={header} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-500 whitespace-nowrap">
                                                    {header}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {preview.map((row, i) => (
                                            <tr key={i} className="hover:bg-muted/30 transition-colors">
                                                {Object.values(row).map((val, j) => (
                                                    <td key={j} className="px-4 py-3 text-sm text-foreground/80 font-medium whitespace-nowrap">
                                                        {String(val ?? '—')}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={handleConfirmUpload}
                                    disabled={isSaving}
                                    className="flex items-center gap-3 bg-primary text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 transition-all disabled:opacity-50"
                                >
                                    {isSaving ? (
                                        <><Loader2 className="h-5 w-5 animate-spin" />Processing...</>
                                    ) : (
                                        <><Sparkles className="h-5 w-5" />Analyze & Visualize<ArrowRight className="h-5 w-5" /></>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { label: 'Row Count', value: data.length.toLocaleString(), icon: Database, color: 'bg-blue-500/10 text-blue-500' },
                            { label: 'Columns', value: Object.keys(data[0] || {}).length, icon: TableIcon, color: 'bg-purple-500/10 text-purple-500' },
                            { label: 'Status', value: previousData ? 'Updated' : 'Ready', icon: previousData ? RefreshCw : CheckCircle2, color: previousData ? 'bg-amber-500/10 text-amber-500' : 'bg-green-500/10 text-green-500' },
                        ].map(({ label, value, icon: Icon, color }) => (
                            <div key={label} className="bg-muted/50 p-6 rounded-3xl border border-border flex items-center gap-4">
                                <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
                                    <Icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-1">{label}</p>
                                    <p className="text-xl font-black">{value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default UploadData
