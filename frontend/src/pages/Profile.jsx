import { useAuth } from '../context/AuthContext'
import { User, Mail, Shield, LogOut, Clock, Database, BarChart3, Edit2, Check, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { db } from '../services/firebase'
import { collection, query, where, getCountFromServer } from 'firebase/firestore'

const AMB = '#F59E0B'

const Profile = () => {
    const { user, signOut, updateProfile } = useAuth()
    const [isEditing, setIsEditing] = useState(false)
    const [fullName, setFullName] = useState(user?.displayName || user?.user_metadata?.full_name || '')
    const [saving, setSaving] = useState(false)
    const [stats, setStats] = useState({ datasets: 0, charts: 0, memberSince: '—' })

    useEffect(() => {
        if (user) { fetchStats(); setFullName(user?.displayName || user?.user_metadata?.full_name || '') }
    }, [user])

    const fetchStats = async () => {
        try {
            const dsQ = query(collection(db, 'datasets'), where('user_id', '==', user.uid))
            const dsSnap = await getCountFromServer(dsQ)
            const insQ = query(collection(db, 'insights'), where('user_id', '==', user.uid))
            const insSnap = await getCountFromServer(insQ)
            setStats({
                datasets: dsSnap.data().count || 0,
                charts: insSnap.data().count || 0,
                memberSince: user?.metadata?.creationTime
                    ? new Date(user.metadata.creationTime).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
                    : '—'
            })
        } catch {}
    }

    const handleSave = async () => {
        setSaving(true)
        try { await updateProfile({ full_name: fullName }); setIsEditing(false) }
        catch { alert('Failed to update profile') }
        finally { setSaving(false) }
    }

    const firstName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'User'

    const Card = ({ children }) => (
        <div className="rounded-xl p-6" style={{ background: 'hsl(30 8% 9%)', border: '1px solid hsl(30 8% 15%)' }}>
            {children}
        </div>
    )

    return (
        <div className="max-w-3xl mx-auto space-y-5 animate-in pb-10">
            <header>
                <h1 className="font-black text-white" style={{ fontSize: 26, letterSpacing: '-0.03em' }}>Profile</h1>
                <p className="text-sm font-medium mt-1" style={{ color: 'hsl(30 8% 42%)' }}>Manage your account settings</p>
            </header>

            <Card>
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                    <div className="relative shrink-0">
                        <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black text-black"
                            style={{ background: 'linear-gradient(135deg, #F59E0B, #FCD34D)', boxShadow: '0 0 32px hsl(38 95% 50% / 0.35)' }}>
                            {firstName[0].toUpperCase()}
                        </div>
                        <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-400 border-2 animate-pulse"
                            style={{ borderColor: 'hsl(30 8% 9%)' }} />
                    </div>

                    <div className="flex-1 min-w-0 text-center sm:text-left">
                        {isEditing ? (
                            <div className="flex items-center gap-2 mb-2">
                                <input value={fullName} onChange={e => setFullName(e.target.value)}
                                    className="flex-1 px-3 py-2 rounded-lg text-sm font-bold text-white outline-none"
                                    style={{ background: 'hsl(30 8% 13%)', border: '1px solid hsl(38 95% 50% / 0.4)' }} autoFocus />
                                <button onClick={handleSave} disabled={saving} className="p-2 rounded-lg"
                                    style={{ background: 'hsl(38 95% 50% / 0.15)', color: AMB }}>
                                    {saving ? <div className="w-4 h-4 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" /> : <Check className="h-4 w-4" />}
                                </button>
                                <button onClick={() => setIsEditing(false)} className="p-2 rounded-lg"
                                    style={{ background: 'hsl(30 8% 13%)', color: 'hsl(30 8% 50%)' }}>
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 mb-1 justify-center sm:justify-start">
                                <h2 className="text-xl font-black text-white">{fullName || firstName}</h2>
                                <button onClick={() => setIsEditing(true)} className="p-1 rounded-lg"
                                    style={{ color: 'hsl(30 8% 40%)' }}
                                    onMouseEnter={e => e.currentTarget.style.color = AMB}
                                    onMouseLeave={e => e.currentTarget.style.color = 'hsl(30 8% 40%)'}>
                                    <Edit2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        )}
                        <p className="text-sm mb-3" style={{ color: 'hsl(30 8% 45%)' }}>{user?.email}</p>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
                            style={{ background: 'hsl(38 95% 50% / 0.12)', color: AMB, border: '1px solid hsl(38 95% 50% / 0.22)' }}>
                            <Shield className="h-2.5 w-2.5" />Free Plan · Active
                        </div>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-3 gap-3">
                {[
                    { icon: Database,  label: 'Datasets',     val: stats.datasets,   color: AMB },
                    { icon: BarChart3, label: 'Analyses',     val: stats.charts,     color: '#8B5CF6' },
                    { icon: Clock,     label: 'Member Since', val: stats.memberSince, color: '#10B981', small: true },
                ].map(({ icon: Icon, label, val, color, small }) => (
                    <div key={label} className="rounded-xl p-4 text-center"
                        style={{ background: 'hsl(30 8% 9%)', border: '1px solid hsl(30 8% 15%)' }}>
                        <Icon className="h-5 w-5 mx-auto mb-2" style={{ color }} />
                        <p className={`font-black text-white ${small ? 'text-sm' : 'text-2xl'}`}>{val}</p>
                        <p className="text-[9px] font-bold uppercase tracking-wider mt-0.5" style={{ color: 'hsl(30 8% 40%)' }}>{label}</p>
                    </div>
                ))}
            </div>

            <Card>
                <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-3" style={{ color: 'hsl(30 8% 38%)' }}>Account Details</p>
                    {[
                        { icon: User,   label: 'Display Name', val: fullName || firstName },
                        { icon: Mail,   label: 'Email Address', val: user?.email },
                        { icon: Shield, label: 'Account Type',  val: 'Free Plan' },
                        { icon: Clock,  label: 'Member Since',  val: stats.memberSince },
                    ].map(({ icon: Icon, label, val }) => (
                        <div key={label} className="flex items-center gap-4 py-3" style={{ borderBottom: '1px solid hsl(30 8% 13%)' }}>
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                style={{ background: 'hsl(38 95% 50% / 0.1)', border: '1px solid hsl(38 95% 50% / 0.18)' }}>
                                <Icon className="h-4 w-4" style={{ color: AMB }} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'hsl(30 8% 40%)' }}>{label}</p>
                                <p className="text-sm font-bold text-white truncate">{val || '—'}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            <button onClick={() => signOut()}
                className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-sm font-bold transition-all"
                style={{ background: 'hsl(0 75% 55% / 0.08)', border: '1px solid hsl(0 75% 55% / 0.18)', color: 'hsl(0 75% 55% / 0.7)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'hsl(0 75% 55% / 0.15)'; e.currentTarget.style.color = 'hsl(0 75% 62%)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'hsl(0 75% 55% / 0.08)'; e.currentTarget.style.color = 'hsl(0 75% 55% / 0.7)' }}>
                <LogOut className="h-4 w-4" />Sign Out
            </button>
        </div>
    )
}

export default Profile