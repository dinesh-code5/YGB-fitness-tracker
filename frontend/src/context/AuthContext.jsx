import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, workoutAPI, dietAPI, plansAPI, templatesAPI, userAPI } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Global Data Cache
  const [dashboardData, setDashboardData] = useState({
    stats: null,
    recentWorkouts: [],
    historyWorkouts: [],
    allWorkouts30d: [], // For Heatmap and local filtering
    todayLogs: [],
    dietPlan: null,
    workoutPlan: null,
    systemTemplates: [],
    userTemplates: [],
    weightHistory: [],
    isRefreshing: false,
    lastFetched: null
  });

  const refreshGlobalData = useCallback(async (silent = false) => {
    const token = localStorage.getItem('ygb_token');
    if (!token) return;

    if (!silent) {
      setDashboardData(prev => ({ ...prev, isRefreshing: true }));
    }

    try {
      // Fetch everything in parallel for maximum speed
      const [wRes, sRes, dRes, pRes, tRes, userSRes, uWeightRes, dpRes] = await Promise.all([
        workoutAPI.getAll({ limit: 50 }), // Fetch more for history/heatmap
        workoutAPI.getStats(30),
        dietAPI.getTodaysLog(),
        plansAPI.getWorkoutPlan(),
        templatesAPI.getAll(),
        workoutAPI.getStats(90), // Fetch longer stats for progress
        userAPI.getWeightHistory(),
        dietAPI.get() // Fetch diet plan
      ]);

      setDashboardData({
        recentWorkouts: wRes.data.workouts?.slice(0, 5) || [],
        historyWorkouts: wRes.data.workouts || [],
        allWorkouts30d: wRes.data.workouts || [], // Used for heatmap
        stats: sRes.data.stats || null,
        stats90d: userSRes.data.stats || null,
        todayLogs: dRes.data.logs || [],
        dietPlan: dpRes.data.dietPlan || null,
        workoutPlan: pRes.data.plan || null,
        systemTemplates: pRes.data.templates || [],
        userTemplates: tRes.data.userTemplates || [],
        weightHistory: uWeightRes.data.weightHistory || [],
        isRefreshing: false,
        lastFetched: Date.now()
      });
    } catch (err) {
      console.error('Failed to pre-fetch global data:', err);
      setDashboardData(prev => ({ ...prev, isRefreshing: false }));
    }
  }, []);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('ygb_token');
    const stored = localStorage.getItem('ygb_user');
    const storedWorkout = localStorage.getItem('ygb_active_workout');
    
    if (token && stored) {
      try {
        setUser(JSON.parse(stored));
        // Pre-fetch data immediately if we have a token
        refreshGlobalData();
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
  }, [refreshGlobalData]);

  const login = useCallback(async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('ygb_token', data.token);
    localStorage.setItem('ygb_user', JSON.stringify(data.user));
    setUser(data.user);
    // Fetch data immediately after login
    refreshGlobalData();
    return data;
  }, [refreshGlobalData]);

  const register = useCallback(async (formData) => {
    const { data } = await authAPI.register(formData);
    localStorage.setItem('ygb_token', data.token);
    localStorage.setItem('ygb_user', JSON.stringify(data.user));
    setUser(data.user);
    // Fetch data immediately after registration
    refreshGlobalData();
    return data;
  }, [refreshGlobalData]);

  const logout = useCallback(() => {
    localStorage.removeItem('ygb_token');
    localStorage.removeItem('ygb_user');
    localStorage.removeItem('ygb_active_workout');
    setUser(null);
    setActiveWorkout(null);
    setDashboardData({
      stats: null,
      recentWorkouts: [],
      todayLogs: [],
      isRefreshing: false
    });
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
      activeWorkout, updateActiveWorkout,
      dashboardData, refreshGlobalData
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
