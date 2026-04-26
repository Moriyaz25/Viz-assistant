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
        <div className="min-h-screen flex overflow-hidden font-sans" style={{ background: 'hsl(30 8% 6%)' }}>
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            {isSidebarOpen && (
                <div className="fixed inset-0 z-40 md:hidden"
                    style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
                    onClick={() => setIsSidebarOpen(false)} />
            )}

            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
                <DashboardNavbar onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="flex-1 p-5 md:p-7 overflow-y-auto w-full max-w-7xl mx-auto custom-scrollbar">
                    {children}
                </main>

                <motion.button
                    whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                    onClick={() => setIsAIOpen(true)}
                    className="fixed bottom-7 right-7 rounded-full flex items-center justify-center z-50 group"
                    style={{
                        background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                        boxShadow: '0 0 32px hsl(38 95% 50% / 0.45)',
                        width: 52, height: 52,
                        border: '1px solid hsl(38 95% 60% / 0.3)',
                    }}
                >
                    <Sparkles className="h-5 w-5 text-black group-hover:rotate-12 transition-transform" />
                    <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 animate-pulse"
                        style={{ borderColor: 'hsl(30 8% 6%)' }} />
                </motion.button>

                <AIInsightSidebar isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />
            </div>
        </div>
    )
}

export default DashboardLayout