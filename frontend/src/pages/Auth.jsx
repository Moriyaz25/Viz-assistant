import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock, User, ArrowRight, Github, Chrome, AlertCircle, CheckCircle2 } from 'lucide-react'

const Auth = () => {
    const { signIn, signUp, signInWithGoogle, user } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [isLogin, setIsLogin] = useState(location.pathname === '/login' || !location.pathname.includes('signup'))
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: ''
    })

    useEffect(() => {
        if (user) {
            navigate('/dashboard')
        }
    }, [user, navigate])

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        setError('')
    }

    const validateForm = () => {
        if (!formData.email || !formData.password) {
            setError('Please fill in all fields')
            return false
        }
        if (!isLogin && !formData.fullName) {
            setError('Please enter your full name')
            return false
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters')
            return false
        }
        return true
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validateForm()) return

        setLoading(true)
        setError('')
        setSuccess('')

        try {
            if (isLogin) {
                const { error: signInError } = await signIn({
                    email: formData.email,
                    password: formData.password
                })
                if (signInError) throw signInError
                navigate('/dashboard')
            } else {
                const { error: signUpError } = await signUp({
                    email: formData.email,
                    password: formData.password,
                    options: {
                        data: {
                            full_name: formData.fullName
                        }
                    }
                })
                if (signUpError) throw signUpError
                setSuccess('Account created! Please check your email to verify.')
            }
        } catch (err) {
            setError(err.message || 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleSignIn = async () => {
        try {
            await signInWithGoogle()
        } catch (err) {
            setError(err.message || 'Google sign in failed')
        }
    }

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse animation-delay-2000" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md z-10"
            >
                {/* Logo */}
                <Link to="/" className="flex items-center justify-center space-x-2 mb-8 group">
                    <div className="bg-primary p-2 rounded-xl group-hover:scale-110 transition-transform">
                        <CheckCircle2 className="h-8 w-8 text-white" />
                    </div>
                    <span className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                        Vizasistance
                    </span>
                </Link>

                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative">
                    {/* Tabs */}
                    <div className="flex bg-white/5 p-1 rounded-2xl mb-8 relative">
                        <motion.div
                            animate={{ x: isLogin ? 0 : '100%' }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="absolute inset-y-1 left-1 w-[calc(50%-4px)] bg-primary rounded-xl"
                        />
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`relative z-10 flex-1 py-3 text-sm font-semibold transition-colors ${isLogin ? 'text-white' : 'text-zinc-400 hover:text-white'}`}
                        >
                            Log In
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`relative z-10 flex-1 py-3 text-sm font-semibold transition-colors ${!isLogin ? 'text-white' : 'text-zinc-400 hover:text-white'}`}
                        >
                            Sign Up
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <AnimatePresence mode="wait">
                            {!isLogin && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-2"
                                >
                                    <label className="text-sm font-medium text-zinc-300 ml-1">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                                        <input
                                            type="text"
                                            name="fullName"
                                            placeholder="John Doe"
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-zinc-600"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300 ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="name@example.com"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-zinc-600"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300 ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-zinc-600"
                                />
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3 text-red-500 text-sm"
                            >
                                <AlertCircle className="h-5 w-5 shrink-0" />
                                <span>{error}</span>
                            </motion.div>
                        )}

                        {success && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 flex items-center gap-3 text-green-500 text-sm"
                            >
                                <CheckCircle2 className="h-5 w-5 shrink-0" />
                                <span>{success}</span>
                            </motion.div>
                        )}

                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            disabled={loading}
                            type="submit"
                            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    {isLogin ? 'Sign In' : 'Create Account'}
                                    <ArrowRight className="h-5 w-5" />
                                </>
                            )}
                        </motion.button>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[#0a0a0a] px-4 text-zinc-500">Or continue with</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={handleGoogleSignIn}
                            className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl py-3 text-sm font-medium text-white transition-all"
                        >
                            <Chrome className="h-5 w-5" />
                            Google
                        </button>
                        <button className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl py-3 text-sm font-medium text-white transition-all">
                            <Github className="h-5 w-5" />
                            GitHub
                        </button>
                    </div>

                    <p className="mt-8 text-center text-sm text-zinc-500">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-primary hover:underline font-semibold"
                        >
                            {isLogin ? 'Sign up' : 'Log in'}
                        </button>
                    </p>
                </div>
            </motion.div>
        </div>
    )
}

export default Auth
