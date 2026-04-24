import { useState } from 'react'
import Sidebar from '../dashboard/Sidebar'
import DashboardNavbar from '../dashboard/DashboardNavbar'
import AIInsightSidebar from '../dashboard/AIInsightSidebar'
import { Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

const DashboardLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isAIOpen, setIsAIOpen] = useState(false)

    return (
        <div className="min-h-screen bg-background flex overflow-hidden font-sans">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
                <DashboardNavbar onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="flex-1 p-6 md:p-8 overflow-y-auto w-full max-w-7xl mx-auto custom-scrollbar">
                    {children}
                </main>

                {/* AI Floating Toggle */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsAIOpen(true)}
                    className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-tr from-violet-600 to-purple-500 rounded-full flex items-center justify-center shadow-xl shadow-violet-500/20 z-50 border border-white/10 group"
                >
                    <Sparkles className="h-6 w-6 text-white group-hover:rotate-12 transition-transform" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#0a0a0f] animate-pulse" />
                </motion.button>

                <AIInsightSidebar isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />
            </div>
        </div>
    )
}

export default DashboardLayout


