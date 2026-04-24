import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import DashboardHome from './pages/DashboardHome'
import UploadData from './pages/UploadData'
import InsightsPage from './pages/InsightsPage'
import History from './pages/History'
import Profile from './pages/Profile'
import DataModeler from './pages/DataModeler'
import CompareDatasets from './pages/CompareDatasets'
import PublicShareView from './pages/PublicShareView'
import ProtectedRoute from './components/ProtectedRoute'
import PageTransition from './components/layout/PageTransition'
import PWAInstallPrompt from './components/ui/PWAInstallPrompt'
import { AnimatePresence } from 'framer-motion'

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Landing /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Auth /></PageTransition>} />
        <Route path="/signup" element={<PageTransition><Auth /></PageTransition>} />
        {/* Feature 9: Public share page - no auth required */}
        <Route path="/share/:shareId" element={<PageTransition><PublicShareView /></PageTransition>} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />}>
            <Route index element={<DashboardHome />} />
            <Route path="upload" element={<UploadData />} />
            <Route path="insights" element={<InsightsPage />} />
            <Route path="history" element={<History />} />
            <Route path="profile" element={<Profile />} />
            <Route path="modeler" element={<DataModeler />} />
            {/* Feature 6: Compare datasets */}
            <Route path="compare" element={<CompareDatasets />} />
          </Route>
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AnimatedRoutes />
          <PWAInstallPrompt />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
