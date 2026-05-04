import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { initCsrf } from './utils/api';
import { ARCHETYPES } from './utils/archetypes';
import { motion, AnimatePresence } from 'framer-motion';
import ScrollToTop from './components/ScrollToTop';

// Layout
import Navbar from './components/layout/Navbar';
import MobileSidebar from './components/layout/MobileSidebar';
import Footer from './components/layout/Footer';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import WorkoutLogger from './pages/WorkoutLogger';
import WorkoutHistory from './pages/WorkoutHistory';
import WorkoutDetail from './pages/WorkoutDetail';
import Progress from './pages/Progress';
import DietCalculator from './pages/DietCalculator';
import WorkoutPlan from './pages/WorkoutPlan';
import Profile from './pages/Profile';
import Social from './pages/Social';
import UserProfile from './pages/UserProfile';
import ProgressPhotos from './pages/ProgressPhotos';
import FoodLibrary from './pages/FoodLibrary';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};

// Component to synchronize theme with user archetype
const ThemeSynchronizer = () => {
  const { user } = useAuth();
  const { setThemeColor } = useTheme();
  useEffect(() => {
    if (user?.archetype) {
      const arch = ARCHETYPES.find(a => a.id === user.archetype);
      if (arch) {
        setThemeColor(arch.color);
      }
    }
  }, [user?.archetype, setThemeColor]);

  return null;
};

// App shell with responsive navigation
const AppShell = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
      <MobileSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="flex-1 transition-all duration-300 pt-24 pb-10 md:pb-0 overflow-x-hidden flex flex-col">
        <div className="flex-1">
          {children}
        </div>
        <Footer />
      </main>
    </div>
  );
};

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3, ease: "easeInOut" }}
    className="min-h-full"
  >
    {children}
  </motion.div>
);

const AppRoutes = () => {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public routes */}
        <Route path="/" element={
          <PageWrapper>{user ? <Navigate to="/dashboard" /> : <Landing />}</PageWrapper>
        } />
        <Route path="/login" element={
          <PageWrapper>{user ? <Navigate to="/dashboard" /> : <Login />}</PageWrapper>
        } />
        <Route path="/register" element={
          <PageWrapper>{user ? <Navigate to="/dashboard" /> : <Register />}</PageWrapper>
        } />

        {/* Protected routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <AppShell>
              <PageWrapper><Dashboard /></PageWrapper>
            </AppShell>
          </ProtectedRoute>
        } />
        <Route path="/workout/log/:id?" element={
          <ProtectedRoute>
            <AppShell>
              <PageWrapper><WorkoutLogger /></PageWrapper>
            </AppShell>
          </ProtectedRoute>
        } />
        <Route path="/workout/history" element={
          <ProtectedRoute>
            <AppShell>
              <PageWrapper><WorkoutHistory /></PageWrapper>
            </AppShell>
          </ProtectedRoute>
        } />
        <Route path="/workout/:id" element={
          <ProtectedRoute>
            <AppShell>
              <PageWrapper><WorkoutDetail /></PageWrapper>
            </AppShell>
          </ProtectedRoute>
        } />
        <Route path="/progress" element={
          <ProtectedRoute>
            <AppShell>
              <PageWrapper><Progress /></PageWrapper>
            </AppShell>
          </ProtectedRoute>
        } />
        <Route path="/progress/photos" element={
          <ProtectedRoute>
            <AppShell>
              <PageWrapper><ProgressPhotos /></PageWrapper>
            </AppShell>
          </ProtectedRoute>
        } />
        <Route path="/diet" element={
          <ProtectedRoute>
            <AppShell>
              <PageWrapper><DietCalculator /></PageWrapper>
            </AppShell>
          </ProtectedRoute>
        } />
        <Route path="/food-library" element={
          <ProtectedRoute>
            <AppShell>
              <PageWrapper><FoodLibrary /></PageWrapper>
            </AppShell>
          </ProtectedRoute>
        } />
        <Route path="/plan" element={
          <ProtectedRoute>
            <AppShell>
              <PageWrapper><WorkoutPlan /></PageWrapper>
            </AppShell>
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <AppShell>
              <PageWrapper><Profile /></PageWrapper>
            </AppShell>
          </ProtectedRoute>
        } />
        <Route path="/social" element={
          <ProtectedRoute>
            <AppShell>
              <PageWrapper><Social /></PageWrapper>
            </AppShell>
          </ProtectedRoute>
        } />
        <Route path="/u/:username" element={
          <ProtectedRoute>
            <AppShell>
              <PageWrapper><UserProfile /></PageWrapper>
            </AppShell>
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

export default function App() {
  useEffect(() => {
    initCsrf();
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <ThemeSynchronizer />
        <div className="bg-glow" />
        <BrowserRouter>
          <ScrollToTop />
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'var(--surface-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--surface-border)',
                borderRadius: '12px',
                fontSize: '14px'
              },
              success: { iconTheme: { primary: 'var(--brand)', secondary: 'var(--surface)' } },
              error: { iconTheme: { primary: 'var(--danger)', secondary: 'var(--surface)' } }
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
