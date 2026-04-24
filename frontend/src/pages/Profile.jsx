import { useAuth } from '../context/AuthContext'
import { User, Mail, Shield, Zap, LogOut, Clock, Database, BarChart3, Upload } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { db } from '../services/firebase'
import { collection, query, where, getCountFromServer } from 'firebase/firestore'

const Profile = () => {
    const { user, signOut, updateProfile } = useAuth()
    const [isEditing, setIsEditing] = useState(false)
    const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '')
    const [uploading, setUploading] = useState(false)
    const [stats, setStats] = useState({
        datasets: 0,
        charts: 0,
        memberSince: 'Loading...'
    })

    useEffect(() => {
        if (user) {
            fetchUserStats()
            setFullName(user?.user_metadata?.full_name || '')
        }
    }, [user])

    const handleSave = async () => {
        try {
            await updateProfile({ full_name: fullName })
            setIsEditing(false)
        } catch (err) {
            alert('Failed to update profile')
        }
    }

    const fetchUserStats = async () => {
        try {
            const dsQuery = query(collection(db, 'datasets'), where('user_id', '==', user.uid))
            const dsSnap = await getCountFromServer(dsQuery)

            const insightQuery = query(collection(db, 'insights'), where('user_id', '==', user.uid))
            const insightSnap = await getCountFromServer(insightQuery)

            setStats({
                datasets: dsSnap.data().count || 0,
                charts: insightSnap.data().count || 0,
                memberSince: new Date(user.metadata.creationTime).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric'
                })
            })
        } catch (err) {
            console.error(err)
        }
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
                            onClick={() => setIsEditing(false)}
                            className="px-6 py-2.5 bg-muted text-foreground rounded-xl font-bold hover:bg-muted/80 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                        >
                            Save Changes
                        </button>
                    </div>
                )}
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <User className="h-32 w-32 text-primary" />
                        </div>

                        <div className="flex items-center gap-6 mb-8">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-primary to-blue-600 p-1 shadow-lg shadow-primary/20 overflow-hidden">
                                    <div className="w-full h-full rounded-[1.8rem] bg-card flex items-center justify-center overflow-hidden">
                                        {user?.user_metadata?.avatar_url ? (
                                            <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="h-10 w-10 text-primary" />
                                        )}
                                    </div>
                                </div>
                                {isEditing && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-[10px] text-white font-bold text-center px-2">Storage disabled on Free Plan</p>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full bg-muted border border-border rounded-xl px-4 py-2 font-bold text-xl text-foreground focus:ring-2 focus:ring-primary outline-none"
                                        placeholder="Full Name"
                                    />
                                ) : (
                                    <h2 className="text-2xl font-black text-foreground">
                                        {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                                    </h2>
                                )}
                                <p className="text-zinc-500 font-medium flex items-center gap-2 mt-1">
                                    <Mail className="h-4 w-4" />
                                    {user?.email}
                                </p>
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
                            <button className="w-full text-left px-6 py-4 bg-muted hover:bg-emphasis border border-border rounded-2xl transition-all flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <Shield className="h-5 w-5 text-zinc-500 group-hover:text-primary transition-colors" />
                                    <span className="font-bold text-sm">Update Password</span>
                                </div>
                                <Clock className="h-4 w-4 text-zinc-400" />
                            </button>
                            <button
                                onClick={() => signOut()}
                                className="w-full text-left px-6 py-4 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 rounded-2xl transition-all flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-4">
                                    <LogOut className="h-5 w-5 text-red-500" />
                                    <span className="font-bold text-sm text-red-500">Sign Out of All Devices</span>
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
                                    <div className="h-full bg-white" style={{ width: `${(stats.datasets / 10) * 100}%` }} />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1">
                                    <span>AI Queries</span>
                                    <span>{stats.charts} / 25</span>
                                </div>
                                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-white" style={{ width: `${(stats.charts / 25) * 100}%` }} />
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
                                    <p className="text-zinc-500">AI Visuals</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Profile
