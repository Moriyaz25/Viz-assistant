import { Home, Upload, BarChart3, History, User, LogOut, ChevronRight, GitMerge, GitCompare, Settings } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const links = [
    { name: 'Home',         href: '/dashboard',          icon: Home },
    { name: 'Upload Data',  href: '/dashboard/upload',   icon: Upload },
    { name: 'Data Modeler', href: '/dashboard/modeler',  icon: GitMerge },
    { name: 'Insights',     href: '/dashboard/insights', icon: BarChart3 },
    { name: 'Compare',      href: '/dashboard/compare',  icon: GitCompare, badge: 'New' },
    { name: 'History',      href: '/dashboard/history',  icon: History },
    { name: 'Settings',     href: '/dashboard/settings', icon: Settings },
    { name: 'Profile',      href: '/dashboard/profile',  icon: User },
]

const Sidebar = ({ isOpen, setIsOpen }) => {
    const location = useLocation()
    const { signOut, user } = useAuth()
    const firstName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'User'

    return (
        <aside
            className="fixed md:static inset-y-0 left-0 z-50 flex flex-col w-60 transition-transform duration-300 md:translate-x-0 shrink-0"
            style={{ background: 'hsl(30 8% 7%)', borderRight: '1px solid hsl(30 8% 14%)', transform: isOpen ? 'translateX(0)' : undefined }}
        >
            {/* Logo */}
            <div className="h-14 flex items-center justify-between px-4 shrink-0" style={{ borderBottom: '1px solid hsl(30 8% 13%)' }}>
                <Link to="/" className="flex items-center gap-2.5 group">
                    <svg viewBox="0 0 28 28" fill="none" className="w-7 h-7 group-hover:scale-110 transition-transform duration-300">
                        <rect x="2" y="16" width="5" height="10" rx="1" fill="#F59E0B" opacity="0.45"/>
                        <rect x="9" y="10" width="5" height="16" rx="1" fill="#F59E0B" opacity="0.7"/>
                        <rect x="16" y="4" width="5" height="22" rx="1" fill="#F59E0B"/>
                        <circle cx="23" cy="4" r="2.5" fill="#FCD34D" opacity="0.85"/>
                    </svg>
                    <span className="text-sm font-black tracking-tight text-white group-hover:text-amber-400 transition-colors">
                        Vizassistance
                    </span>
                </Link>
                <button onClick={() => setIsOpen(false)} className="md:hidden p-1 rounded-lg text-white/30 hover:text-white transition-colors">
                    <ChevronRight className="h-4 w-4 rotate-180" />
                </button>
            </div>

            {/* User pill */}
            <div className="px-3 py-3 shrink-0">
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl" style={{ background: 'hsl(30 8% 12%)' }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-black shrink-0"
                        style={{ background: 'linear-gradient(135deg, #F59E0B, #FCD34D)' }}>
                        {firstName[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate leading-tight">{firstName}</p>
                        <p className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: 'hsl(38 95% 50%)' }}>Free Plan</p>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto px-3 py-1 space-y-0.5 custom-scrollbar">
                <p className="px-2 text-[9px] font-black uppercase tracking-[0.2em] mb-2" style={{ color: 'hsl(30 8% 35%)' }}>
                    Navigation
                </p>
                {links.map(link => {
                    const isActive = location.pathname === link.href
                    return (
                        <Link key={link.name} to={link.href}
                            className="group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
                            style={isActive ? {
                                background: 'linear-gradient(135deg, hsl(38 95% 50% / 0.18), hsl(38 80% 40% / 0.08))',
                                border: '1px solid hsl(38 95% 50% / 0.22)',
                                color: 'hsl(38 95% 62%)',
                            } : { color: 'hsl(30 8% 50%)', border: '1px solid transparent' }}
                            onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color = 'hsl(40 15% 88%)'; e.currentTarget.style.background = 'hsl(30 8% 13%)' } }}
                            onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color = 'hsl(30 8% 50%)'; e.currentTarget.style.background = 'transparent' } }}
                        >
                            <div className="flex items-center gap-3">
                                <link.icon className="h-4 w-4 shrink-0" />
                                <span>{link.name}</span>
                            </div>
                            {link.badge && !isActive && (
                                <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full"
                                    style={{ background: 'hsl(38 95% 50% / 0.15)', color: 'hsl(38 95% 58%)', border: '1px solid hsl(38 95% 50% / 0.25)' }}>
                                    {link.badge}
                                </span>
                            )}
                            {isActive && <ChevronRight className="h-3.5 w-3.5 opacity-60 shrink-0" />}
                        </Link>
                    )
                })}
            </nav>

            {/* Logout */}
            <div className="p-3 shrink-0" style={{ borderTop: '1px solid hsl(30 8% 13%)' }}>
                <button onClick={() => signOut()}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-bold transition-all"
                    style={{ color: 'hsl(0 75% 55% / 0.65)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'hsl(0 75% 55% / 0.08)'; e.currentTarget.style.color = 'hsl(0 75% 60%)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'hsl(0 75% 55% / 0.65)' }}
                >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    )
}

export default Sidebar