import { Home, LayoutDashboard, Upload, BarChart3, History, User, LogOut, ChevronRight, GitMerge, Sparkles, GitCompare } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { cn } from '../../utils/cn'
import ThemeToggle from '../ui/ThemeToggle'

const Sidebar = ({ isOpen, setIsOpen }) => {
    const location = useLocation()
    const { signOut, user } = useAuth()

    const links = [
        { name: 'Home', href: '/', icon: Home },
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Upload Data', href: '/dashboard/upload', icon: Upload },
        { name: 'Data Modeler', href: '/dashboard/modeler', icon: GitMerge },
        { name: 'Insights', href: '/dashboard/insights', icon: BarChart3 },
        { name: 'Compare', href: '/dashboard/compare', icon: GitCompare, badge: 'New' },
        { name: 'History', href: '/dashboard/history', icon: History },
        { name: 'Profile', href: '/dashboard/profile', icon: User },
    ]

    return (
        <aside className={cn(
            "fixed md:static inset-y-0 left-0 z-50 flex flex-col w-64 bg-card border-r border-border backdrop-blur-2xl transition-transform duration-300 md:translate-x-0",
            isOpen ? "translate-x-0" : "-translate-x-full"
        )}>
            <div className="h-16 flex items-center px-5 border-b border-border justify-between">
                <Link to="/" className="flex items-center space-x-3 group">
                    <div className="relative h-9 w-9 flex items-center justify-center rounded-xl bg-violet-500/10 border border-violet-500/20 group-hover:scale-110 transition-transform duration-300">
                        <Sparkles className="h-4 w-4 text-violet-400" />
                        <div className="absolute inset-0 bg-violet-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl" />
                    </div>
                    <span className="text-lg font-black tracking-tighter text-foreground group-hover:text-violet-500 transition-colors duration-300">
                        Vizassistance
                    </span>
                </Link>
                <button
                    onClick={() => setIsOpen(false)}
                    className="md:hidden p-2 -mr-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ChevronRight className="h-5 w-5 rotate-180" />
                </button>
            </div>

            {user && (
                <div className="mx-4 mt-4 p-3 bg-muted rounded-2xl border border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shrink-0 text-sm font-black text-white shadow-lg shadow-violet-500/20">
                            {(user?.displayName || user?.email || '?')[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-black text-foreground truncate leading-none mb-1">
                                {user?.displayName || user?.email?.split('@')[0]}
                            </p>
                            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Free Tier</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-y-auto py-5 px-4 space-y-1">
                <p className="px-3 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3">
                    Navigation
                </p>
                {links.map((link) => {
                    const isActive = location.pathname === link.href
                    return (
                        <Link
                            key={link.name}
                            to={link.href}
                            className={cn(
                                "group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200",
                                isActive
                                    ? "bg-gradient-to-r from-violet-600/80 to-purple-600/60 text-white shadow-lg shadow-violet-500/20 border border-violet-500/30"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <link.icon className={cn(
                                    "h-4 w-4 transition-colors",
                                    isActive ? "text-white" : "group-hover:text-violet-500"
                                )} />
                                <span>{link.name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                {link.badge && !isActive && (
                                    <span className="text-[8px] font-black uppercase px-1.5 py-0.5 bg-violet-500/20 text-violet-400 rounded-full border border-violet-500/30">
                                        {link.badge}
                                    </span>
                                )}
                                {isActive && (
                                    <motion.div layoutId="sidebar-active-indicator">
                                        <ChevronRight className="h-4 w-4 text-white/60" />
                                    </motion.div>
                                )}
                            </div>
                        </Link>
                    )
                })}
            </div>

            <div className="p-4 border-t border-border space-y-3">
                <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-xs font-bold text-muted-foreground">Theme</span>
                    <ThemeToggle size="sm" />
                </div>
                <button
                    onClick={() => signOut()}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-bold text-red-500/70 hover:bg-red-500/10 hover:text-red-500 transition-all"
                >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    )
}

export default Sidebar
