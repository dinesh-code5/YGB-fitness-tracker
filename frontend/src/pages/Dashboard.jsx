import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { workoutAPI } from '../utils/api';
import { FiPlusSquare, FiTrendingUp, FiCalendar, FiShoppingBag, FiActivity, FiClock, FiZap } from 'react-icons/fi';
import { GiMuscleUp } from 'react-icons/gi';
import toast from 'react-hot-toast';

import DailyDietTracker from '../components/DailyDietTracker';

const QuickCard = ({ to, icon: Icon, label, sub }) => (
  <Link to={to} className="card p-4 hover:border-brand/30 transition-all duration-200 group flex items-center gap-4">
    <div className={`w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center group-hover:bg-brand/20 transition-colors`}>
      <Icon className="text-brand text-lg" />
    </div>
    <div>
      <p className="text-sm font-semibold text-[var(--text-primary)]">{label}</p>
      <p className="text-xs text-muted">{sub}</p>
    </div>
  </Link>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [wRes, sRes] = await Promise.all([
          workoutAPI.getAll({ limit: 5 }),
          workoutAPI.getStats(30)
        ]);
        setRecentWorkouts(wRes.data.workouts);
        setStats(sRes.data.stats);
      } catch (err) {
        console.error('Dashboard load error:', err);
        toast.error('Failed to load dashboard data');
      }
      setLoading(false);
    };
    load();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const bmi = user?.weight && user?.height
    ? (user.weight / ((user.height / 100) ** 2)).toFixed(1)
    : null;

  return (
    <div className="page-container relative">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-full blur-[100px] -z-10 animate-pulse" />
      
      {/* Header */}
      <div className="flex items-start justify-between mb-8 group">
        <div className="flex-1">
          <p className="text-muted text-sm mb-1">{greeting} 👋</p>
          <h1 className="font-display text-4xl md:text-5xl tracking-wider text-[var(--text-primary)] bg-gradient-to-r from-[var(--text-primary)] to-brand bg-clip-text text-transparent">
            {user?.name?.split(' ')[0]?.toUpperCase()}
          </h1>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="badge-brand capitalize">{user?.goal}</span>
            <span className="tag capitalize">{user?.experience}</span>
            {user?.currentStreak > 0 && (
              <span className="badge bg-orange-500/10 text-orange-400 border border-orange-500/20 animate-bounce-subtle">
                🔥 {user.currentStreak} day streak
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Weight', value: user?.weight ? `${user.weight} kg` : '—', icon: '⚖️', color: 'text-blue-400' },
          { label: 'BMI', value: bmi || '—', icon: '📊', color: 'text-purple-400' },
          { label: 'Workouts (30d)', value: loading ? '...' : stats?.totalWorkouts ?? 0, icon: '🏋️', color: 'text-brand' },
          { label: 'Consistency', value: loading ? '...' : stats ? `${stats.consistency}%` : '—', icon: '📈', color: 'text-green-400' },
        ].map((s, i) => (
          <div key={s.label} className="stat-card hover:border-brand/30 hover:shadow-glow-sm transition-all duration-300 animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
            <span className="text-xl">{s.icon}</span>
            <p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-muted font-bold uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Activity Heatmap Style Calendar */}
      <div className="card p-6 mb-8 relative overflow-hidden hover:border-brand/30 hover:shadow-glow-sm transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title flex items-center gap-2">
            <FiCalendar className="text-brand" />
            Activity Heatmap
          </h2>
          <div className="flex items-center gap-1.5">
             <span className="text-[10px] text-muted font-bold uppercase mr-1">Intensity</span>
             <div className="w-2.5 h-2.5 rounded bg-[var(--surface-elevated)]" />
             <div className="w-2.5 h-2.5 rounded bg-brand/30" />
             <div className="w-2.5 h-2.5 rounded bg-brand/60" />
             <div className="w-2.5 h-2.5 rounded bg-brand" />
          </div>
        </div>
        
        <div className="flex justify-between gap-1 overflow-x-auto no-scrollbar pb-2">
          {[...Array(28)].map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (27 - i));
            const hasWorkout = recentWorkouts.some(w => 
              new Date(w.date).toDateString() === date.toDateString()
            );
            return (
              <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0 min-w-[32px]">
                <div className={`w-8 h-8 rounded-lg transition-all duration-500 flex items-center justify-center text-[10px] font-bold ${
                  hasWorkout ? 'bg-brand text-[#0F0F14] shadow-glow-sm' : 'bg-[var(--surface-elevated)] text-muted'
                }`}>
                  {date.getDate()}
                </div>
                <span className="text-[8px] font-black uppercase text-muted">
                  {date.toLocaleDateString('en-IN', { weekday: 'narrow' })}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Quick actions */}
          <div>
            <h2 className="section-title mb-4 flex items-center gap-2">
              <div className="w-1 h-5 bg-brand rounded-full" />
              Quick Actions
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <QuickCard to="/workout/log" icon={FiPlusSquare} label="Log Workout" sub="Track today's session" />
              <QuickCard to="/plan" icon={FiCalendar} label="My Workout Plan" sub="View your PPL split" />
              <QuickCard to="/diet" icon={FiShoppingBag} label="Diet Calculator" sub="Calories & macros" />
              <QuickCard to="/progress" icon={FiTrendingUp} label="Progress" sub="Strength & weight charts" />
            </div>
          </div>
          
          {/* Recent workouts */}
          <div className="animate-fade-in delay-300">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title flex items-center gap-2">
                <div className="w-1 h-5 bg-brand rounded-full" />
                Recent Workouts
              </h2>
              <Link to="/workout/history" className="text-brand text-xs font-bold uppercase hover:underline">View All</Link>
            </div>

            {loading ? (
              <div className="card p-10 text-center text-muted">
                <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                Fetching your activity...
              </div>
            ) : recentWorkouts.length === 0 ? (
              <div className="card p-10 text-center bg-brand/5 border-dashed border-brand/20">
                <GiMuscleUp className="text-brand/30 text-5xl mx-auto mb-3 animate-pulse" />
                <p className="text-muted text-sm mb-4">You haven't logged any workouts yet.</p>
                <Link to="/workout/log" className="btn-primary inline-flex items-center gap-2 text-sm">
                  <FiPlusSquare /> Start Your Journey
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentWorkouts.map((w, i) => (
                  <Link key={w.id} to={`/workout/${w.id}`} className="card p-4 hover:border-brand/40 bg-gradient-to-r hover:from-brand/5 hover:to-transparent hover:shadow-glow-sm transition-all duration-300 flex items-center justify-between animate-slide-up" style={{ animationDelay: `${i * 150}ms` }}>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[var(--text-primary)] text-sm group-hover:text-brand transition-colors">{w.name}</p>
                      <p className="text-[10px] text-muted mt-0.5 flex items-center gap-1.5 font-medium">
                        <FiCalendar className="text-[10px]" />
                        {new Date(w.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <div className="flex items-center gap-3 text-[10px] text-muted font-bold">
                        {w.duration > 0 && (
                          <span className="flex items-center gap-1 bg-[var(--surface-elevated)] px-1.5 py-0.5 rounded"><FiClock /> {w.duration}m</span>
                        )}
                        {w.totalVolume > 0 && (
                          <span className="flex items-center gap-1 bg-[var(--surface-elevated)] px-1.5 py-0.5 rounded text-brand"><FiZap /> {w.totalVolume.toLocaleString()} kg</span>
                        )}
                      </div>
                      <span className="badge-brand text-[9px] px-1.5 py-0 capitalize">{w.workoutType?.replace('_', ' ')}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <DailyDietTracker />
        </div>
      </div>
    </div>
  );
}
