import { useAuth } from '../context/AuthContext'
import { User, Mail, Shield, Zap, LogOut, Clock, Database, BarChart3 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { db } from '../services/firebase'
import { collection, query, where, getCountFromServer } from 'firebase/firestore'
import { getAuth, updateProfile as firebaseUpdateProfile } from 'firebase/auth'
import LogoutConfirmDialog from '../components/ui/LogoutConfirmDialog'
import { useNavigate } from 'react-router-dom'

const Profile = () => {
    const { user, signOut } = useAuth()
    const navigate = useNavigate()
    const auth = getAuth()

    const [isEditing, setIsEditing] = useState(false)
    const [fullName, setFullName] = useState('')
    const [saving, setSaving] = useState(false)
    const [saveMsg, setSaveMsg] = useState('')
    const [showLogoutDialog, setShowLogoutDialog] = useState(false)
    const [stats, setStats] = useState({ datasets: 0, charts: 0, memberSince: 'Loading...' })

    // ── Check if user logged in via Google ───────────────────────────
    const isGoogleUser = user?.providerData?.some(p => p.providerId === 'google.com')

    useEffect(() => {
        if (user) {
            setFullName(user.displayName || user.email?.split('@')[0] || '')
            fetchUserStats()
        }
    }, [user])

    const fetchUserStats = async () => {
        try {
            const dsQuery = query(collection(db, 'datasets'), where('user_id', '==', user.uid))
            const dsSnap = await getCountFromServer(dsQuery)

            const insightQuery = query(collection(db, 'insights'), where('dataset_id', '==', user.uid))
            const insightSnap = await getCountFromServer(insightQuery)

            setStats({
                datasets: dsSnap.data().count || 0,
                charts: insightSnap.data().count || 0,
                memberSince: user.metadata?.creationTime
                    ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                    : 'N/A'
            })
        } catch (err) {
            console.error(err)
        }
    }

    // ── Save name via Firebase Auth updateProfile ─────────────────────
    const handleSave = async () => {
        if (!fullName.trim()) return
        setSaving(true)
        setSaveMsg('')
        try {
            await firebaseUpdateProfile(auth.currentUser, { displayName: fullName.trim() })
            setSaveMsg('✅ Profile updated!')
            setIsEditing(false)
        } catch (err) {
            setSaveMsg('❌ Failed: ' + err.message)
        } finally {
            setSaving(false)
            setTimeout(() => setSaveMsg(''), 3000)
        }
    }

    const handleLogoutConfirmed = async () => {
        await signOut()
        setShowLogoutDialog(false)
        navigate('/')
    }

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-foreground">User Account</h1>
                    <p className="text-zinc-500 mt-1 font-medium">Manage your personal settings and platform usage.</p>
                </div>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-6 py-2.5 bg-primary/10 text-primary rounded-xl font-bold hover:bg-primary hover:text-white transition-all"
                    >
                        Edit Profile
                    </button>
                ) : (
                    <div className="flex gap-3">
                        <button
                            onClick={() => { setIsEditing(false); setFullName(user?.displayName || '') }}
                            className="px-6 py-2.5 bg-muted text-foreground rounded-xl font-bold hover:bg-muted/80 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                )}
            </header>

            {saveMsg && (
                <div className={`px-4 py-3 rounded-2xl text-sm font-bold ${saveMsg.startsWith('✅') ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                    {saveMsg}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <User className="h-32 w-32 text-primary" />
                        </div>

                        <div className="flex items-center gap-6 mb-8">
                            <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-primary to-blue-600 p-1 shadow-lg shadow-primary/20 overflow-hidden">
                                <div className="w-full h-full rounded-[1.8rem] bg-card flex items-center justify-center overflow-hidden">
                                    {user?.photoURL ? (
                                        <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="h-10 w-10 text-primary" />
                                    )}
                                </div>
                            </div>
                            <div className="flex-1">
                                {isEditing ? (
                                    <div className="space-y-1">
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="w-full bg-muted border border-border rounded-xl px-4 py-2 font-bold text-xl text-foreground focus:ring-2 focus:ring-primary outline-none"
                                            placeholder="Full Name"
                                        />
                                        {/* ✅ Show hint if Google user */}
                                        {isGoogleUser && (
                                            <p className="text-xs text-zinc-500">
                                                ℹ️ Google account — naam change hoga sirf is app mein
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <h2 className="text-2xl font-black text-foreground">
                                        {user?.displayName || user?.email?.split('@')[0]}
                                    </h2>
                                )}
                                <p className="text-zinc-500 font-medium flex items-center gap-2 mt-1">
                                    <Mail className="h-4 w-4" />
                                    {user?.email}
                                </p>
                                {/* ✅ Show login provider badge */}
                                <span className={`mt-2 inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${isGoogleUser ? 'bg-blue-500/10 text-blue-400' : 'bg-primary/10 text-primary'}`}>
                                    {isGoogleUser ? '🔵 Google Account' : '📧 Email Account'}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-muted px-6 py-4 rounded-2xl border border-border">
                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-1">Status</p>
                                <div className="text-sm font-bold text-green-500 flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    Active Account
                                </div>
                            </div>
                            <div className="bg-muted px-6 py-4 rounded-2xl border border-border">
                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-1">Member Since</p>
                                <p className="text-sm font-bold text-foreground">{stats.memberSince}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-[2.5rem] p-8">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Shield className="h-5 w-5 text-primary" />
                            Security & Settings
                        </h3>
                        <div className="space-y-4">
                            {/* ✅ Logout with confirmation dialog */}
                            <button
                                onClick={() => setShowLogoutDialog(true)}
                                className="w-full text-left px-6 py-4 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 rounded-2xl transition-all flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-4">
                                    <LogOut className="h-5 w-5 text-red-500" />
                                    <span className="font-bold text-sm text-red-500">Sign Out</span>
                                </div>
                                <Zap className="h-4 w-4 text-red-500" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Usage Card */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-primary to-blue-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-primary/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Zap className="h-24 w-24" />
                        </div>
                        <h3 className="text-lg font-bold mb-2">Free Plan</h3>
                        <p className="text-white/70 text-sm mb-6">You're currently on the free trial.</p>

                        <div className="space-y-4 mb-8">
                            <div>
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1">
                                    <span>Datasets</span>
                                    <span>{stats.datasets} / 10</span>
                                </div>
                                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-white transition-all" style={{ width: `${Math.min((stats.datasets / 10) * 100, 100)}%` }} />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1">
                                    <span>AI Queries</span>
                                    <span>{stats.charts} / 25</span>
                                </div>
                                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-white transition-all" style={{ width: `${Math.min((stats.charts / 25) * 100, 100)}%` }} />
                                </div>
                            </div>
                        </div>

                        <button className="w-full bg-white text-primary font-black py-4 rounded-2xl hover:scale-105 transition-transform shadow-xl">
                            Upgrade to Pro
                        </button>
                    </div>

                    <div className="bg-card border border-border rounded-[2.5rem] p-6">
                        <h4 className="font-bold text-sm mb-4">Quick Stats</h4>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                                    <Database className="h-4 w-4" />
                                </div>
                                <div className="text-xs">
                                    <p className="font-bold">{stats.datasets}</p>
                                    <p className="text-zinc-500">Total Uploads</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                                    <BarChart3 className="h-4 w-4" />
                                </div>
                                <div className="text-xs">
                                    <p className="font-bold">{stats.charts}</p>
                                    <p className="text-zinc-500">AI Insights</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ✅ Logout confirmation dialog */}
            <LogoutConfirmDialog
                isOpen={showLogoutDialog}
                onConfirm={handleLogoutConfirmed}
                onCancel={() => setShowLogoutDialog(false)}
            />
        </div>
    )
}

export default Profile