import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { initCsrf } from './utils/api';

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

// App shell with responsive navigation
const AppShell = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
      <MobileSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="flex-1 transition-all duration-300 pt-20 pb-10 md:pb-0 overflow-x-hidden flex flex-col">
        <div className="flex-1">
          {children}
        </div>
        <Footer />
      </main>
    </div>
  );
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />

      {/* Protected routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute><AppShell><Dashboard /></AppShell></ProtectedRoute>
      } />
      <Route path="/workout/log/:id?" element={
        <ProtectedRoute><AppShell><WorkoutLogger /></AppShell></ProtectedRoute>
      } />
      <Route path="/workout/history" element={
        <ProtectedRoute><AppShell><WorkoutHistory /></AppShell></ProtectedRoute>
      } />
      <Route path="/workout/:id" element={
        <ProtectedRoute><AppShell><WorkoutDetail /></AppShell></ProtectedRoute>
      } />
      <Route path="/progress" element={
        <ProtectedRoute><AppShell><Progress /></AppShell></ProtectedRoute>
      } />
      <Route path="/progress/photos" element={
        <ProtectedRoute><AppShell><ProgressPhotos /></AppShell></ProtectedRoute>
      } />
      <Route path="/diet" element={
        <ProtectedRoute><AppShell><DietCalculator /></AppShell></ProtectedRoute>
      } />
      <Route path="/food-library" element={
        <ProtectedRoute><AppShell><FoodLibrary /></AppShell></ProtectedRoute>
      } />
      <Route path="/plan" element={
        <ProtectedRoute><AppShell><WorkoutPlan /></AppShell></ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute><AppShell><Profile /></AppShell></ProtectedRoute>
      } />
      <Route path="/social" element={
        <ProtectedRoute><AppShell><Social /></AppShell></ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default function App() {
  useEffect(() => {
    initCsrf();
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="bg-glow" />
        <BrowserRouter>
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
