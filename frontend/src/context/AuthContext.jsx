import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('ygb_token');
    const stored = localStorage.getItem('ygb_user');
    const storedWorkout = localStorage.getItem('ygb_active_workout');
    
    if (token && stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.clear();
      }
    }

    if (storedWorkout) {
      try {
        setActiveWorkout(JSON.parse(storedWorkout));
      } catch {}
    }

    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    // await initCsrf();
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('ygb_token', data.token);
    localStorage.setItem('ygb_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  }, []);

  const register = useCallback(async (formData) => {
    // await initCsrf();
    const { data } = await authAPI.register(formData);
    localStorage.setItem('ygb_token', data.token);
    localStorage.setItem('ygb_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    // Clear all session data
    localStorage.removeItem('ygb_token');
    localStorage.removeItem('ygb_user');
    localStorage.removeItem('ygb_active_workout');
    
    // Reset local state
    setUser(null);
    setActiveWorkout(null);

    // Hard redirect to ensure clean break from SPA state
    // This prevents "stuck" animations or router sync issues during logout
    window.location.href = '/';
  }, []);

  const updateUser = useCallback((updates) => {
    setUser(prev => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('ygb_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateActiveWorkout = useCallback((workout) => {
    setActiveWorkout(workout);
    if (workout) {
      localStorage.setItem('ygb_active_workout', JSON.stringify(workout));
    } else {
      localStorage.removeItem('ygb_active_workout');
    }
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, loading, login, register, logout, updateUser, 
      activeWorkout, updateActiveWorkout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
