import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock, User, ArrowRight, Chrome, AlertCircle, CheckCircle2 } from 'lucide-react'

const Auth = () => {
    const { signIn, signUp, signInWithGoogle, user } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [isLogin, setIsLogin] = useState(!location.pathname.includes('signup'))
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [formData, setFormData] = useState({ email: '', password: '', fullName: '' })

    useEffect(() => { if (user) navigate('/dashboard') }, [user, navigate])

    const handleChange = e => { setFormData({ ...formData, [e.target.name]: e.target.value }); setError('') }

    const validate = () => {
        if (!formData.email || !formData.password) { setError('Please fill in all fields'); return false }
        if (!isLogin && !formData.fullName) { setError('Please enter your full name'); return false }
        if (formData.password.length < 6) { setError('Password must be at least 6 characters'); return false }
        return true
    }

    const handleSubmit = async e => {
        e.preventDefault()
        if (!validate()) return
        setLoading(true); setError(''); setSuccess('')
        try {
            if (isLogin) {
                const { error: err } = await signIn({ email: formData.email, password: formData.password })
                if (err) throw err
                navigate('/dashboard')
            } else {
                const { error: err } = await signUp({ email: formData.email, password: formData.password, options: { data: { full_name: formData.fullName } } })
                if (err) throw err
                setSuccess('Account created! Please check your email to verify.')
            }
        } catch (err) { setError(err.message || 'An error occurred') }
        finally { setLoading(false) }
    }

    const handleGoogle = async () => {
        try { await signInWithGoogle() } catch (err) { setError(err.message || 'Google sign in failed') }
    }

    const inputStyle = {
        width: '100%', background: 'hsl(30 8% 11%)',
        border: '1px solid hsl(30 8% 18%)', borderRadius: 12,
        padding: '12px 16px 12px 44px', color: 'hsl(40 15% 92%)',
        fontSize: 14, outline: 'none', transition: 'border-color 0.2s',
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
            style={{ background: 'hsl(30 8% 5%)' }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(ellipse, hsl(38 95% 50% / 0.08) 0%, transparent 70%)', filter: 'blur(60px)' }} />
            <div className="absolute inset-0 pointer-events-none" style={{
                backgroundImage: 'linear-gradient(hsl(30 8% 100% / 0.02) 1px, transparent 1px), linear-gradient(90deg, hsl(30 8% 100% / 0.02) 1px, transparent 1px)',
                backgroundSize: '40px 40px'
            }} />

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }} className="w-full max-w-[400px] z-10">

                <Link to="/" className="flex items-center justify-center gap-3 mb-8 group">
                    <svg viewBox="0 0 28 28" fill="none" className="w-8 h-8 group-hover:scale-110 transition-transform">
                        <rect x="2" y="16" width="5" height="10" rx="1" fill="#F59E0B" opacity="0.45"/>
                        <rect x="9" y="10" width="5" height="16" rx="1" fill="#F59E0B" opacity="0.7"/>
                        <rect x="16" y="4" width="5" height="22" rx="1" fill="#F59E0B"/>
                        <circle cx="23" cy="4" r="2.5" fill="#FCD34D" opacity="0.85"/>
                    </svg>
                    <span className="text-xl font-black tracking-tight text-white group-hover:text-amber-400 transition-colors">
                        Vizassistance
                    </span>
                </Link>

                <div className="rounded-2xl p-7 shadow-2xl"
                    style={{ background: 'hsl(30 8% 8%)', border: '1px solid hsl(30 8% 15%)' }}>

                    <div className="flex p-1 rounded-xl mb-7 relative" style={{ background: 'hsl(30 8% 11%)' }}>
                        <motion.div
                            animate={{ x: isLogin ? 0 : '100%' }}
                            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                            className="absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-lg"
                            style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}
                        />
                        {['Log In', 'Sign Up'].map((label, i) => (
                            <button key={label} onClick={() => { setIsLogin(i === 0); setError(''); setSuccess('') }}
                                className="relative z-10 flex-1 py-2.5 text-sm font-bold transition-colors rounded-lg"
                                style={{ color: (i === 0 ? isLogin : !isLogin) ? 'hsl(30 10% 5%)' : 'hsl(30 8% 45%)' }}>
                                {label}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <AnimatePresence mode="wait">
                            {!isLogin && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                                    <label className="block text-xs font-bold mb-1.5" style={{ color: 'hsl(30 8% 50%)' }}>Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'hsl(30 8% 40%)' }} />
                                        <input type="text" name="fullName" placeholder="John Doe" value={formData.fullName}
                                            onChange={handleChange} style={inputStyle}
                                            onFocus={e => e.target.style.borderColor = '#F59E0B'}
                                            onBlur={e => e.target.style.borderColor = 'hsl(30 8% 18%)'} />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {[
                            { label: 'Email Address', name: 'email', type: 'email', placeholder: 'name@example.com', Icon: Mail },
                            { label: 'Password', name: 'password', type: 'password', placeholder: '••••••••', Icon: Lock },
                        ].map(({ label, name, type, placeholder, Icon }) => (
                            <div key={name}>
                                <label className="block text-xs font-bold mb-1.5" style={{ color: 'hsl(30 8% 50%)' }}>{label}</label>
                                <div className="relative">
                                    <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'hsl(30 8% 40%)' }} />
                                    <input type={type} name={name} placeholder={placeholder} value={formData[name]}
                                        onChange={handleChange} style={inputStyle}
                                        onFocus={e => e.target.style.borderColor = '#F59E0B'}
                                        onBlur={e => e.target.style.borderColor = 'hsl(30 8% 18%)'} />
                                </div>
                            </div>
                        ))}

                        {error && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="flex items-center gap-2.5 p-3 rounded-xl text-sm"
                                style={{ background: 'hsl(0 75% 55% / 0.1)', border: '1px solid hsl(0 75% 55% / 0.2)', color: 'hsl(0 75% 65%)' }}>
                                <AlertCircle className="h-4 w-4 shrink-0" />{error}
                            </motion.div>
                        )}
                        {success && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="flex items-center gap-2.5 p-3 rounded-xl text-sm"
                                style={{ background: 'hsl(142 70% 45% / 0.1)', border: '1px solid hsl(142 70% 45% / 0.2)', color: 'hsl(142 70% 55%)' }}>
                                <CheckCircle2 className="h-4 w-4 shrink-0" />{success}
                            </motion.div>
                        )}

                        <button type="submit" disabled={loading}
                            className="w-full py-3 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: 'hsl(30 10% 5%)', boxShadow: '0 0 24px hsl(38 95% 50% / 0.35)' }}
                            onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow = '0 0 36px hsl(38 95% 50% / 0.55)' }}
                            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 24px hsl(38 95% 50% / 0.35)' }}>
                            {loading
                                ? <div className="h-4 w-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                : <>{isLogin ? 'Sign In' : 'Create Account'}<ArrowRight className="h-4 w-4" /></>
                            }
                        </button>
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full" style={{ borderTop: '1px solid hsl(30 8% 15%)' }} />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="px-3 text-xs font-bold uppercase tracking-wider"
                                style={{ background: 'hsl(30 8% 8%)', color: 'hsl(30 8% 35%)' }}>
                                or continue with
                            </span>
                        </div>
                    </div>

                    <button onClick={handleGoogle}
                        className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-sm font-bold transition-all"
                        style={{ background: 'hsl(30 8% 11%)', border: '1px solid hsl(30 8% 18%)', color: 'hsl(40 15% 80%)' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'hsl(38 95% 50% / 0.3)'; e.currentTarget.style.color = 'white' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'hsl(30 8% 18%)'; e.currentTarget.style.color = 'hsl(40 15% 80%)' }}>
                        <Chrome className="h-4 w-4" />Google
                    </button>

                    <p className="mt-6 text-center text-xs" style={{ color: 'hsl(30 8% 40%)' }}>
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess('') }}
                            className="font-bold transition-colors" style={{ color: '#F59E0B' }}
                            onMouseEnter={e => e.target.style.textDecoration = 'underline'}
                            onMouseLeave={e => e.target.style.textDecoration = 'none'}>
                            {isLogin ? 'Sign up' : 'Log in'}
                        </button>
                    </p>
                </div>
            </motion.div>
        </div>
    )
}

export default Auth