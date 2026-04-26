import { Home, Upload, BarChart3, History, User, LogOut, ChevronRight, GitMerge, GitCompare, Settings, X } from 'lucide-react'
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

// Bottom nav shows only 5 most important links on mobile
const bottomNavLinks = [
    { name: 'Home',     href: '/dashboard',          icon: Home },
    { name: 'Upload',   href: '/dashboard/upload',   icon: Upload },
    { name: 'Insights', href: '/dashboard/insights', icon: BarChart3 },
    { name: 'History',  href: '/dashboard/history',  icon: History },
    { name: 'Profile',  href: '/dashboard/profile',  icon: User },
]

const Sidebar = ({ isOpen, setIsOpen }) => {
    const location = useLocation()
    const { signOut, user } = useAuth()
    const firstName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'User'

    return (
        <>
            {/* ── DESKTOP SIDEBAR ── */}
            <aside
                className="hidden md:flex flex-col w-60 shrink-0"
                style={{
                    background: 'hsl(30 8% 7%)',
                    borderRight: '1px solid hsl(30 8% 14%)',
                    minHeight: '100vh',
                    position: 'sticky',
                    top: 0,
                    height: '100vh',
                    overflowY: 'auto',
                }}
            >
                {/* Logo */}
                <div className="h-14 flex items-center px-4 shrink-0" style={{ borderBottom: '1px solid hsl(30 8% 13%)' }}>
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
                <nav className="flex-1 overflow-y-auto px-3 py-1 space-y-0.5">
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

            {/* ── MOBILE: SLIDE-IN DRAWER ── */}
            <>
                {/* Backdrop */}
                {isOpen && (
                    <div
                        className="fixed inset-0 z-40 md:hidden"
                        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }}
                        onClick={() => setIsOpen(false)}
                    />
                )}

                {/* Drawer */}
                <aside
                    className="fixed inset-y-0 left-0 z-50 flex flex-col w-72 md:hidden transition-transform duration-300 ease-in-out"
                    style={{
                        background: 'hsl(30 8% 7%)',
                        borderRight: '1px solid hsl(30 8% 14%)',
                        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
                        boxShadow: isOpen ? '8px 0 32px rgba(0,0,0,0.5)' : 'none',
                    }}
                >
                    {/* Drawer header */}
                    <div className="h-14 flex items-center justify-between px-4 shrink-0" style={{ borderBottom: '1px solid hsl(30 8% 13%)' }}>
                        <Link to="/" className="flex items-center gap-2.5" onClick={() => setIsOpen(false)}>
                            <svg viewBox="0 0 28 28" fill="none" className="w-7 h-7">
                                <rect x="2" y="16" width="5" height="10" rx="1" fill="#F59E0B" opacity="0.45"/>
                                <rect x="9" y="10" width="5" height="16" rx="1" fill="#F59E0B" opacity="0.7"/>
                                <rect x="16" y="4" width="5" height="22" rx="1" fill="#F59E0B"/>
                                <circle cx="23" cy="4" r="2.5" fill="#FCD34D" opacity="0.85"/>
                            </svg>
                            <span className="text-sm font-black tracking-tight text-white">Vizassistance</span>
                        </Link>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 rounded-xl transition-colors"
                            style={{ color: 'hsl(30 8% 45%)', background: 'hsl(30 8% 12%)' }}
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* User pill */}
                    <div className="px-4 py-3 shrink-0">
                        <div className="flex items-center gap-3 px-3 py-3 rounded-xl" style={{ background: 'hsl(30 8% 12%)' }}>
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black text-black shrink-0"
                                style={{ background: 'linear-gradient(135deg, #F59E0B, #FCD34D)' }}>
                                {firstName[0].toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-white truncate">{firstName}</p>
                                <p className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: 'hsl(38 95% 50%)' }}>Free Plan</p>
                            </div>
                        </div>
                    </div>

                    {/* Nav */}
                    <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
                        <p className="px-2 text-[9px] font-black uppercase tracking-[0.2em] mb-3" style={{ color: 'hsl(30 8% 35%)' }}>
                            Navigation
                        </p>
                        {links.map(link => {
                            const isActive = location.pathname === link.href
                            return (
                                <Link
                                    key={link.name}
                                    to={link.href}
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all"
                                    style={isActive ? {
                                        background: 'linear-gradient(135deg, hsl(38 95% 50% / 0.18), hsl(38 80% 40% / 0.08))',
                                        border: '1px solid hsl(38 95% 50% / 0.22)',
                                        color: 'hsl(38 95% 62%)',
                                    } : {
                                        color: 'hsl(30 8% 55%)',
                                        border: '1px solid transparent',
                                    }}
                                >
                                    <div className="flex items-center gap-3.5">
                                        <link.icon className="h-4.5 w-4.5 h-[18px] w-[18px] shrink-0" />
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
                    <div className="p-4 shrink-0" style={{ borderTop: '1px solid hsl(30 8% 13%)' }}>
                        <button
                            onClick={() => { signOut(); setIsOpen(false) }}
                            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-bold transition-all"
                            style={{ color: 'hsl(0 75% 55% / 0.7)', background: 'hsl(0 75% 55% / 0.06)', border: '1px solid hsl(0 75% 55% / 0.12)' }}
                        >
                            <LogOut className="h-4 w-4" />
                            <span>Logout</span>
                        </button>
                    </div>
                </aside>
            </>

            {/* ── MOBILE: BOTTOM NAV BAR ── */}
            <nav
                className="fixed bottom-0 left-0 right-0 z-30 md:hidden flex items-center justify-around px-2 pb-safe"
                style={{
                    background: 'hsl(30 8% 7%)',
                    borderTop: '1px solid hsl(30 8% 14%)',
                    paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
                    paddingTop: '8px',
                    boxShadow: '0 -4px 24px rgba(0,0,0,0.4)',
                }}
            >
                {bottomNavLinks.map(link => {
                    const isActive = location.pathname === link.href
                    return (
                        <Link
                            key={link.name}
                            to={link.href}
                            className="flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all"
                            style={{ minWidth: 52 }}
                        >
                            <div
                                className="w-10 h-10 flex items-center justify-center rounded-xl transition-all"
                                style={isActive ? {
                                    background: 'linear-gradient(135deg, hsl(38 95% 50% / 0.2), hsl(38 80% 40% / 0.1))',
                                    border: '1px solid hsl(38 95% 50% / 0.25)',
                                } : {
                                    background: 'transparent',
                                }}
                            >
                                <link.icon
                                    className="h-[18px] w-[18px]"
                                    style={{ color: isActive ? 'hsl(38 95% 62%)' : 'hsl(30 8% 45%)' }}
                                />
                            </div>
                            <span
                                className="text-[9px] font-bold uppercase tracking-wide"
                                style={{ color: isActive ? 'hsl(38 95% 62%)' : 'hsl(30 8% 40%)' }}
                            >
                                {link.name}
                            </span>
                        </Link>
                    )
                })}
            </nav>
        </>
    )
}

export default Sidebar