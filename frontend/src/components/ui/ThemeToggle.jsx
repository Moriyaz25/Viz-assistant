import { motion } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

/**
 * Beautiful animated pill theme toggle.
 * Props:
 *   size?: 'sm' | 'md'  (default 'md')
 */
const ThemeToggle = ({ size = 'md' }) => {
    const { theme, toggleTheme } = useTheme()
    const isDark = theme === 'dark'

    const pill = size === 'sm'
        ? { w: 'w-14', h: 'h-7', knob: 'w-5 h-5', icon: 'h-3 w-3', translate: 28 }
        : { w: 'w-16', h: 'h-8', knob: 'w-6 h-6', icon: 'h-3.5 w-3.5', translate: 32 }

    return (
        <button
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
            className={`
                relative inline-flex items-center ${pill.w} ${pill.h} rounded-full
                transition-all duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500
                ${isDark
                    ? 'bg-[#1a1040] border border-violet-500/30 shadow-[0_0_14px_rgba(124,58,237,0.35)]'
                    : 'bg-amber-50 border border-amber-300/60 shadow-[0_0_14px_rgba(251,191,36,0.3)]'
                }
            `}
        >
            {/* Track icons */}
            <span className="absolute left-1.5 flex items-center text-violet-400 opacity-70">
                <Moon className={pill.icon} />
            </span>
            <span className="absolute right-1.5 flex items-center text-amber-400 opacity-70">
                <Sun className={pill.icon} />
            </span>

            {/* Sliding knob */}
            <motion.span
                layout
                animate={{
                    x: isDark ? 2 : pill.translate - 2,
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                className={`
                    absolute ${pill.knob} rounded-full flex items-center justify-center
                    shadow-md z-10
                    ${isDark
                        ? 'bg-gradient-to-br from-violet-500 to-purple-600 shadow-violet-500/40'
                        : 'bg-gradient-to-br from-amber-300 to-yellow-400 shadow-amber-400/40'
                    }
                `}
            >
                <motion.span
                    animate={{ rotate: isDark ? 0 : 180 }}
                    transition={{ duration: 0.4 }}
                >
                    {isDark
                        ? <Moon className={`${pill.icon} text-white`} />
                        : <Sun className={`${pill.icon} text-white`} />
                    }
                </motion.span>
            </motion.span>
        </button>
    )
}

export default ThemeToggle
