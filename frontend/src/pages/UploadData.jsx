import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, CheckCircle2, Loader2, AlertCircle, Database, ArrowRight, Table as TableIcon, RefreshCw, Sparkles, CloudUpload } from 'lucide-react'
import FileUpload from '../components/dashboard/FileUpload'
import { parseFile } from '../utils/fileParser'
import { db } from '../services/firebase'
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, limit } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import DataVersionDiff from '../components/features/DataVersionDiff'

const AMB = '#F59E0B'

const UploadData = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [file, setFile] = useState(null)
    const [data, setData] = useState(null)
    const [preview, setPreview] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [isSaving, setIsSaving] = useState(false)
    const [previousData, setPreviousData] = useState(null)
    const [checkingVersion, setCheckingVersion] = useState(false)

    const handleFileSelect = async selectedFile => {
        setLoading(true); setError(null); setPreviousData(null)
        try {
            const result = await parseFile(selectedFile)
            setFile(selectedFile); setData(result.data); setPreview(result.data.slice(0, 5))
            if (user) {
                setCheckingVersion(true)
                try {
                    const q = query(collection(db, 'datasets'), where('user_id', '==', user.uid), where('file_name', '==', selectedFile.name), orderBy('upload_date', 'desc'), limit(1))
                    const snap = await getDocs(q)
                    if (!snap.empty) {
                        const prev = snap.docs[0].data()
                        if (prev.raw_data?.length > 0) setPreviousData(prev.raw_data)
                    }
                } catch {}
                finally { setCheckingVersion(false) }
            }
        } catch (err) { setError(err.message || 'Failed to parse file') }
        finally { setLoading(false) }
    }

    const handleConfirmUpload = async () => {
        if (!user || !file || !data) return
        setIsSaving(true)
        try {
            const docRef = await addDoc(collection(db, 'datasets'), {
                user_id: user.uid, file_name: file.name,
                upload_date: serverTimestamp(),
                row_count: data.length,
                column_count: Object.keys(data[0] || {}).length,
                raw_data: data
            })
            navigate(`/dashboard/insights?id=${docRef.id}`)
        } catch (err) { setError(err.message || 'Failed to save dataset') }
        finally { setIsSaving(false) }
    }

    const reset = () => { setFile(null); setData(null); setPreview([]); setError(null); setPreviousData(null) }
    const cols = data ? Object.keys(data[0] || {}) : []
    const isNumeric = val => typeof val === 'number' || (!isNaN(parseFloat(val)) && isFinite(val))

    return (
        <div className="space-y-6 animate-in pb-10">
            <header>
                <h1 className="font-black text-white" style={{ fontSize: 26, letterSpacing: '-0.03em' }}>Upload Dataset</h1>
                <p className="text-sm font-medium mt-1" style={{ color: 'hsl(30 8% 42%)' }}>Import CSV or Excel — AI will analyze it instantly</p>
            </header>

            {!file ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl flex flex-col items-center justify-center text-center p-16 transition-all"
                    style={{ background: 'hsl(30 8% 9%)', border: '2px dashed hsl(30 8% 18%)' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'hsl(38 95% 50% / 0.35)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'hsl(30 8% 18%)'}>
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                        style={{ background: 'hsl(38 95% 50% / 0.12)', border: '1px solid hsl(38 95% 50% / 0.22)' }}>
                        <CloudUpload className="h-8 w-8" style={{ color: AMB }} />
                    </div>
                    <FileUpload onFileSelect={handleFileSelect} />
                    {loading && (
                        <div className="mt-8 flex flex-col items-center gap-2">
                            <Loader2 className="h-8 w-8 animate-spin" style={{ color: AMB }} />
                            <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'hsl(30 8% 45%)' }}>Parsing data...</p>
                        </div>
                    )}
                    {error && (
                        <div className="mt-6 flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm"
                            style={{ background: 'hsl(0 75% 55% / 0.1)', border: '1px solid hsl(0 75% 55% / 0.2)', color: 'hsl(0 75% 65%)' }}>
                            <AlertCircle className="h-4 w-4 shrink-0" />{error}
                        </div>
                    )}
                    <div className="mt-8 flex items-center gap-3">
                        {['CSV', 'XLSX', 'XLS'].map(fmt => (
                            <span key={fmt} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
                                style={{ background: 'hsl(30 8% 12%)', border: '1px solid hsl(30 8% 18%)', color: 'hsl(30 8% 50%)' }}>
                                <FileText className="h-3 w-3" style={{ color: AMB }} />{fmt}
                            </span>
                        ))}
                    </div>
                </motion.div>
            ) : (
                <div className="space-y-5">
                    {checkingVersion && (
                        <div className="flex items-center gap-2.5 p-4 rounded-xl text-sm"
                            style={{ background: 'hsl(30 8% 10%)', border: '1px solid hsl(30 8% 17%)' }}>
                            <Loader2 className="h-4 w-4 animate-spin shrink-0" style={{ color: AMB }} />
                            <span style={{ color: 'hsl(30 8% 50%)' }}>Checking for previous version...</span>
                        </div>
                    )}
                    {previousData && !checkingVersion && (
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                            <DataVersionDiff currentData={data} previousData={previousData} fileName={file.name} />
                        </motion.div>
                    )}

                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                        className="rounded-2xl overflow-hidden"
                        style={{ background: 'hsl(30 8% 9%)', border: '1px solid hsl(30 8% 15%)' }}>
                        <div className="h-[2px]" style={{ background: `linear-gradient(90deg, ${AMB}60, transparent)` }} />

                        <div className="p-6">
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                                        style={{ background: 'hsl(38 95% 50% / 0.12)', border: '1px solid hsl(38 95% 50% / 0.22)' }}>
                                        <FileText className="h-6 w-6" style={{ color: AMB }} />
                                    </div>
                                    <div>
                                        <p className="font-black text-white text-base">{file.name}</p>
                                        <p className="text-xs mt-0.5" style={{ color: 'hsl(30 8% 42%)' }}>
                                            {data.length.toLocaleString()} rows · {cols.length} columns · {(file.size / 1024).toFixed(1)} KB
                                        </p>
                                    </div>
                                </div>
                                <button onClick={reset} className="text-xs font-bold px-3 py-2 rounded-lg transition-all"
                                    style={{ color: 'hsl(30 8% 45%)', background: 'hsl(30 8% 12%)', border: '1px solid hsl(30 8% 18%)' }}
                                    onMouseEnter={e => e.currentTarget.style.color = 'white'}
                                    onMouseLeave={e => e.currentTarget.style.color = 'hsl(30 8% 45%)'}>
                                    Replace
                                </button>
                            </div>

                            <div className="mb-5">
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-2" style={{ color: 'hsl(30 8% 38%)' }}>Detected Columns</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {cols.map(col => {
                                        const val = data.find(r => r[col] !== null && r[col] !== undefined)?.[col]
                                        const num = isNumeric(val)
                                        return (
                                            <span key={col} className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                                                style={num
                                                    ? { background: 'hsl(38 95% 50% / 0.12)', color: AMB, border: '1px solid hsl(38 95% 50% / 0.2)' }
                                                    : { background: 'hsl(260 70% 55% / 0.1)', color: '#A78BFA', border: '1px solid hsl(260 70% 55% / 0.2)' }
                                                }>{col}</span>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="rounded-xl overflow-hidden mb-5" style={{ border: '1px solid hsl(30 8% 15%)' }}>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead style={{ background: 'hsl(30 8% 12%)', borderBottom: '1px solid hsl(30 8% 17%)' }}>
                                            <tr>
                                                {cols.map(h => (
                                                    <th key={h} className="px-3 py-2.5 text-[9px] font-black uppercase tracking-[0.15em] whitespace-nowrap"
                                                        style={{ color: 'hsl(30 8% 45%)' }}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {preview.map((row, i) => (
                                                <tr key={i} style={{ borderBottom: '1px solid hsl(30 8% 13%)' }}>
                                                    {Object.values(row).map((val, j) => (
                                                        <td key={j} className="px-3 py-2.5 text-xs font-medium whitespace-nowrap"
                                                            style={{ color: isNumeric(val) ? '#FCD34D' : 'hsl(40 15% 78%)' }}>
                                                            {String(val ?? '—')}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button onClick={handleConfirmUpload} disabled={isSaving}
                                    className="flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-black text-sm transition-all disabled:opacity-50"
                                    style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: 'hsl(30 10% 5%)', boxShadow: '0 0 24px hsl(38 95% 50% / 0.35)' }}
                                    onMouseEnter={e => { if (!isSaving) e.currentTarget.style.boxShadow = '0 0 36px hsl(38 95% 50% / 0.55)' }}
                                    onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 24px hsl(38 95% 50% / 0.35)'}>
                                    {isSaving
                                        ? <><Loader2 className="h-4 w-4 animate-spin" />Processing...</>
                                        : <><Sparkles className="h-4 w-4" />Analyze with AI<ArrowRight className="h-4 w-4" /></>
                                    }
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: 'Rows', val: data.length.toLocaleString(), icon: Database, color: AMB },
                            { label: 'Columns', val: cols.length, icon: TableIcon, color: '#8B5CF6' },
                            { label: 'Status', val: previousData ? 'Updated' : 'Ready', icon: previousData ? RefreshCw : CheckCircle2, color: previousData ? AMB : '#10B981' },
                        ].map(({ label, val, icon: Icon, color }) => (
                            <div key={label} className="rounded-xl p-4 flex items-center gap-3"
                                style={{ background: 'hsl(30 8% 10%)', border: '1px solid hsl(30 8% 15%)' }}>
                                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                                    style={{ background: `${color}18`, border: `1px solid ${color}28` }}>
                                    <Icon className="h-4 w-4" style={{ color }} />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-wider" style={{ color: 'hsl(30 8% 40%)' }}>{label}</p>
                                    <p className="font-black text-white text-lg" style={{ letterSpacing: '-0.02em' }}>{val}</p>
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