import { Moon, Sun, User, Bell, Menu, Sparkles } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom'
import ThemeToggle from '../ui/ThemeToggle'

const DashboardNavbar = ({ onMenuClick }) => {
    const { user } = useAuth()

    const firstName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'User'

    return (
        <header className="h-16 bg-card/80 border-b border-border backdrop-blur-2xl sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 shrink-0">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="md:hidden p-2 rounded-xl bg-muted text-muted-foreground hover:text-foreground hover:bg-muted border border-border transition-all"
                >
                    <Menu className="h-5 w-5" />
                </button>

                {/* Mobile logo */}
                <Link to="/" className="md:hidden flex items-center gap-2">
                    <div className="h-7 w-7 flex items-center justify-center rounded-lg bg-violet-500/15 border border-violet-500/20">
                        <Sparkles className="h-3.5 w-3.5 text-violet-500" />
                    </div>
                    <span className="text-base font-black tracking-tighter text-foreground">
                        Vizassistance
                    </span>
                </Link>

                {/* Desktop breadcrumb */}
                <div className="hidden md:flex items-center gap-2">
                    <span className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">Workspace</span>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-xs font-bold text-foreground/60 capitalize">
                        {firstName}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {/* Premium animated theme toggle */}
                <ThemeToggle size="sm" />

                {/* Notifications */}
                <button className="relative p-2.5 rounded-xl bg-muted hover:bg-muted/80 border border-border text-muted-foreground hover:text-foreground transition-all">
                    <Bell className="h-4 w-4" />
                    <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-violet-500 rounded-full border-2 border-card shadow-[0_0_6px_rgba(139,92,246,0.8)]" />
                </button>

                <div className="h-7 w-px bg-border mx-1" />

                {/* Profile */}
                <Link
                    to="/dashboard/profile"
                    className="flex items-center gap-3 group cursor-pointer"
                >
                    <div className="hidden sm:block text-right">
                        <p className="text-sm font-bold text-foreground group-hover:text-violet-500 transition-colors leading-none mb-1">
                            {firstName}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-medium">Free Plan</p>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 p-[1.5px] shadow-lg shadow-violet-500/25 group-hover:scale-110 transition-transform duration-300">
                        <div className="w-full h-full rounded-[10px] bg-card flex items-center justify-center overflow-hidden">
                            {user?.photoURL ? (
                                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-sm font-black text-violet-500">
                                    {firstName[0].toUpperCase()}
                                </span>
                            )}
                        </div>
                    </div>
                </Link>
            </div>
        </header>
    )
}

export default DashboardNavbar
