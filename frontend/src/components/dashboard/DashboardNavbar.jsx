import { Bell, Menu } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { Link, useLocation } from 'react-router-dom'

const PAGE_TITLES = {
    '/dashboard': 'Dashboard',
    '/dashboard/upload': 'Upload Data',
    '/dashboard/insights': 'AI Insights',
    '/dashboard/history': 'History',
    '/dashboard/profile': 'Profile',
    '/dashboard/modeler': 'Data Modeler',
    '/dashboard/compare': 'Compare',
    '/dashboard/settings': 'Settings',
}

const DashboardNavbar = ({ onMenuClick }) => {
    const { user } = useAuth()
    const location = useLocation()
    const firstName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'User'
    const pageTitle = PAGE_TITLES[location.pathname] || 'Dashboard'

    return (
        <header className="h-14 flex items-center justify-between px-5 md:px-7 shrink-0 sticky top-0 z-30"
            style={{ background: 'hsl(30 8% 7% / 0.92)', borderBottom: '1px solid hsl(30 8% 13%)', backdropFilter: 'blur(16px)' }}>
            <div className="flex items-center gap-4">
                <button onClick={onMenuClick} className="md:hidden p-2 rounded-lg transition-colors"
                    style={{ background: 'hsl(30 8% 12%)', color: 'hsl(30 8% 55%)' }}>
                    <Menu className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-white">{pageTitle}</span>
                    <span style={{ color: 'hsl(30 8% 30%)' }}>/</span>
                    <span className="text-xs font-semibold" style={{ color: 'hsl(30 8% 45%)' }}>{firstName}</span>
                </div>
            </div>

            <div className="flex items-center gap-2.5">
                <button className="relative p-2 rounded-xl transition-colors"
                    style={{ background: 'hsl(30 8% 12%)', border: '1px solid hsl(30 8% 16%)', color: 'hsl(30 8% 50%)' }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'hsl(40 15% 88%)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'hsl(30 8% 50%)' }}>
                    <Bell className="h-4 w-4" />
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                        style={{ background: '#F59E0B', boxShadow: '0 0 6px #F59E0B' }} />
                </button>

                <div className="w-px h-6" style={{ background: 'hsl(30 8% 15%)' }} />

                <Link to="/dashboard/profile" className="flex items-center gap-2.5 group">
                    <div className="hidden sm:block text-right">
                        <p className="text-xs font-bold text-white leading-tight group-hover:text-amber-400 transition-colors">{firstName}</p>
                        <p className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: 'hsl(30 8% 40%)' }}>Free Plan</p>
                    </div>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-black group-hover:scale-105 transition-transform"
                        style={{ background: 'linear-gradient(135deg, #F59E0B, #FCD34D)', boxShadow: '0 0 12px hsl(38 95% 50% / 0.3)' }}>
                        {firstName[0].toUpperCase()}
                    </div>
                </Link>
            </div>
        </header>
    )
}

export default DashboardNavbar