import { Outlet, useLocation } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import PageTransition from '../components/layout/PageTransition'
import { AnimatePresence } from 'framer-motion'

const Dashboard = () => {
    const location = useLocation();

    return (
        <DashboardLayout>
            <AnimatePresence mode="wait">
                <PageTransition key={location.pathname}>
                    <Outlet />
                </PageTransition>
            </AnimatePresence>
        </DashboardLayout>
    )
}

export default Dashboard
