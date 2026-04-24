import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, LayoutDashboard, LogOut } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'

const Navbar = () => {
    const [open, setOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const { user, signOut } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        const h = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', h)
        return () => window.removeEventListener('scroll', h)
    }, [])

    const handleLogout = async () => {
        try { await signOut(); navigate('/') } catch {}
    }

    return (
        <nav
            className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
            style={{
                background: scrolled ? 'rgba(8,8,8,0.9)' : 'transparent',
                backdropFilter: scrolled ? 'blur(20px)' : 'none',
                borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
            }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="relative w-8 h-8">
                            {/* Viz-style logo mark */}
                            <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8 group-hover:scale-110 transition-transform duration-300">
                                <rect x="2" y="18" width="6" height="12" rx="1.5" fill="#f59e0b" opacity="0.5"/>
                                <rect x="10" y="10" width="6" height="20" rx="1.5" fill="#f59e0b" opacity="0.75"/>
                                <rect x="18" y="4" width="6" height="26" rx="1.5" fill="#f59e0b"/>
                                <circle cx="25" cy="4" r="3" fill="#fcd34d" opacity="0.8"/>
                            </svg>
                        </div>
                        <span className="text-lg font-black tracking-tight text-white group-hover:text-amber-400 transition-colors duration-300">
                            Vizassistance
                        </span>
                    </Link>

                    {/* Desktop nav */}
                    <div className="hidden md:flex items-center gap-8">
                        {!user && (
                            <>
                                <a href="/#features" className="text-sm font-bold text-white/45 hover:text-white/80 transition-colors duration-200">Features</a>
                                <a href="/#workflow" className="text-sm font-bold text-white/45 hover:text-white/80 transition-colors duration-200">How it works</a>
                            </>
                        )}

                        {user ? (
                            <div className="flex items-center gap-3">
                                <Link to="/dashboard"
                                    className="flex items-center gap-1.5 text-sm font-bold text-white/50 hover:text-white transition-colors"
                                >
                                    <LayoutDashboard className="h-4 w-4" />
                                    Dashboard
                                </Link>
                                <button onClick={handleLogout}
                                    className="flex items-center gap-1.5 text-sm font-bold px-4 py-2.5 rounded-xl border transition-all"
                                    style={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.1)' }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'white' }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }}
                                >
                                    <LogOut className="h-4 w-4" />
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link to="/login" className="text-sm font-bold text-white/45 hover:text-white/80 transition-colors">
                                    Sign in
                                </Link>
                                <Link to="/signup"
                                    className="group relative text-sm font-black px-6 py-3 rounded-xl overflow-hidden transition-all duration-300"
                                    style={{ background: '#f59e0b', color: '#080808', boxShadow: '0 0 24px #f59e0b40' }}
                                >
                                    <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                        style={{ background: 'linear-gradient(135deg, #fcd34d, #f59e0b)' }} />
                                    <span className="relative">Get started</span>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile toggle */}
                    <button
                        onClick={() => setOpen(o => !o)}
                        className="md:hidden p-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white transition-colors"
                    >
                        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{ background: '#0c0c0c', borderBottom: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}
                    >
                        <div className="px-5 py-6 space-y-3">
                            {!user && (
                                <>
                                    <a href="/#features" onClick={() => setOpen(false)} className="block py-3 text-base font-bold text-white/50 hover:text-white transition-colors">Features</a>
                                    <a href="/#workflow" onClick={() => setOpen(false)} className="block py-3 text-base font-bold text-white/50 hover:text-white transition-colors">How it works</a>
                                </>
                            )}
                            <div className="pt-3 space-y-3 border-t border-white/8">
                                {user ? (
                                    <>
                                        <Link to="/dashboard" onClick={() => setOpen(false)}
                                            className="block w-full text-center py-3.5 rounded-xl font-bold text-sm border border-white/10 text-white/70 hover:text-white transition-colors">
                                            Dashboard
                                        </Link>
                                        <button onClick={() => { handleLogout(); setOpen(false) }}
                                            className="block w-full text-center py-3.5 rounded-xl font-bold text-sm text-white/40 hover:text-white transition-colors">
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link to="/login" onClick={() => setOpen(false)}
                                            className="block w-full text-center py-3.5 rounded-xl font-bold text-sm border border-white/10 text-white/70 hover:text-white transition-colors">
                                            Sign in
                                        </Link>
                                        <Link to="/signup" onClick={() => setOpen(false)}
                                            className="block w-full text-center py-3.5 rounded-xl font-black text-sm"
                                            style={{ background: '#f59e0b', color: '#080808' }}>
                                            Get started free
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    )
}

export default Navbar
