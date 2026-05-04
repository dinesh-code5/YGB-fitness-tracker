import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { workoutAPI } from '../utils/api';
import {
  FiPlusSquare, FiTrendingUp, FiCalendar, FiShoppingBag,
  FiActivity, FiClock, FiZap, FiTarget, FiAward, FiChevronRight
} from 'react-icons/fi';
import { GiMuscleUp } from 'react-icons/gi';
import toast from 'react-hot-toast';
import DailyDietTracker from '../components/DailyDietTracker';

/* ── Quick Action Card ────────────────────────────────────────────────── */
const QuickCard = ({ to, icon: Icon, label, sub, color = 'text-brand', bg = 'bg-brand/10 border-brand/20' }) => (
  <Link to={to} className="quick-card group p-5">
    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center flex-shrink-0 transition-all duration-200 group-hover:scale-110 ${bg}`}>
      <Icon className={`${color} text-2xl`} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-base font-bold text-[var(--text-primary)] group-hover:text-brand transition-colors">{label}</p>
      <p className="text-lg text-muted mt-0.5">{sub}</p>
    </div>
    <FiChevronRight className="text-[var(--text-secondary)] group-hover:text-brand transition-all duration-200 group-hover:translate-x-0.5 text-lg" />
  </Link>
);

/* ── Motivational banner copy ─────────────────────────────────────────── */
const getMotivation = (hour, streak) => {
  if (streak > 7)   return { emoji: '🔥', line: `${streak}-day streak. You're on fire!` };
  if (hour >= 4 && hour < 7)   return { emoji: '🌅', line: 'Early bird gets the gains.' };
  if (hour >= 7 && hour < 12)  return { emoji: '💪', line: 'Morning grind hits different.' };
  if (hour >= 12 && hour < 17) return { emoji: '⚡', line: 'Afternoon power session?' };
  if (hour >= 17 && hour < 22) return { emoji: '🌙', line: 'Evening gains are still gains.' };
  return { emoji: '🦉', line: 'Night owl mode. Respect.' };
};

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
        setRecentWorkouts(wRes.data.workouts || []);
        setStats(sRes.data.stats || null);
      } catch (err) {
        console.error('Dashboard load error:', err);
        toast.error('Failed to load dashboard data');
      }
      setLoading(false);
    };
    load();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour >= 4 && hour < 12 ? 'Good Morning' : hour >= 12 && hour < 17 ? 'Good Afternoon' : hour >= 17 && hour < 22 ? 'Good Evening' : 'Good Night';
  const { emoji, line } = getMotivation(hour, user?.currentStreak || 0);

  const bmi = user?.weight && user?.height
    ? (user.weight / ((user.height / 100) ** 2)).toFixed(1)
    : null;

  const STAT_ITEMS = [
    { label: 'Weight',         value: user?.weight ? `${user.weight} kg` : '—', icon: '⚖️', color: 'text-blue-400',   border: 'hover:border-blue-400/30' },
    { label: 'BMI',            value: bmi || '—',                               icon: '📊', color: 'text-purple-400',  border: 'hover:border-purple-400/30' },
    { label: 'Workouts (30d)', value: loading ? '...' : stats?.totalWorkouts ?? 0, icon: '🏋️', color: 'text-brand',   border: 'hover:border-brand/30' },
    { label: 'Consistency',    value: loading ? '...' : stats ? `${stats.consistency}%` : '—', icon: '📈', color: 'text-green-400', border: 'hover:border-green-400/30' },
  ];

  const QUICK_ACTIONS = [
    { to: '/workout/log',     icon: FiPlusSquare,  label: 'Log Workout',     sub: "Track today's session",   color: 'text-brand',    bg: 'bg-brand/10 border-brand/20' },
    { to: '/plan',            icon: FiCalendar,    label: 'My Workout Plan', sub: 'View your PPL split',     color: 'text-brand', bg: 'bg-brand/10 border-brand/20' },
    { to: '/diet',            icon: FiShoppingBag, label: 'Diet Calculator', sub: 'Calories & macros',       color: 'text-brand', bg: 'bg-brand/10 border-brand/20' },
    { to: '/progress',        icon: FiTrendingUp,  label: 'Progress',        sub: 'Strength & weight charts', color: 'text-brand', bg: 'bg-brand/10 border-brand/20' },
  ];

  return (
    <div className="page-container relative">
      {/* Subtle top-right ambient glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-brand/4 rounded-full blur-[100px] -z-10 pointer-events-none" />

      {/* ── Motivational Banner ─────────────────────────────────────────── */}
      <div className="card mb-6 p-5 relative overflow-hidden border-brand/15 bg-gradient-to-r from-brand/5 via-transparent to-transparent animate-slide-in-left">
        <div className="absolute right-0 top-0 bottom-0 w-48 bg-gradient-to-l from-brand/5 to-transparent pointer-events-none" />
        <div className="flex items-center gap-3">
          <span className="text-4xl bounce-subtle">{emoji}</span>
          <div>
            <p className="text-lg text-[var(--text-secondary)] font-medium uppercase tracking-wider">{greeting}</p>
            <p className="text-xl font-black text-[var(--text-primary)] leading-tight">{line}</p>
          </div>
          {user?.currentStreak > 0 && (
            <div className="ml-auto flex items-center gap-1.5 badge bg-brand/10 text-brand border border-brand/20">
              🔥 {user.currentStreak} day streak
            </div>
          )}
        </div>
      </div>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-end justify-between mb-10">
        <div>
          {/* Animated letter-by-letter name — dramatic pop */}
          <h1 className="font-display text-6xl md:text-7xl tracking-wider leading-none flex">
            {(user?.name?.split(' ')?.[0]?.toUpperCase() || '').split('').map((letter, i) => (
              <span
                key={i}
                className="inline-block"
                style={{
                  animation: `letterPop 0.5s cubic-bezier(0.34,1.56,0.64,1) both`,
                  animationDelay: `${i * 70}ms`,
                  background: 'linear-gradient(160deg, #ffffff 0%, var(--theme-color) 60%, var(--theme-color) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  display: 'inline-block',
                  textShadow: 'none',
                }}
              >
                {letter}
              </span>
            ))}
          </h1>
          <div className="flex items-center gap-3 mt-4 flex-wrap animate-slide-up" style={{ animationDelay: '300ms' }}>
            <span className="badge-brand text-xs px-3 py-1 capitalize">{user?.goal?.replace(/_/g, ' ')}</span>
            <span className="tag text-xs px-3 py-1 capitalize">{user?.experience}</span>
          </div>
        </div>
        <Link to="/workout/log" className="btn-primary hidden sm:flex items-center gap-2 text-base py-3 px-6 shimmer">
          <FiPlusSquare /> Log Workout
        </Link>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {STAT_ITEMS.map((s, i) => (
          <div
            key={s.label}
            className={`stat-card p-4 sm:p-6 ${s.border} animate-slide-up`}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <span className="text-2xl sm:text-3xl">{s.icon}</span>
            <p className={`text-2xl sm:text-3xl font-black mt-2 ${s.color === 'text-brand' ? 'text-brand' : s.color}`}>{s.value}</p>
            <p className="text-[10px] sm:text-[11px] text-muted font-bold uppercase tracking-widest mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Main Grid ───────────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Quick Actions + Recent Workouts */}
        <div className="lg:col-span-2 space-y-6">

          {/* Quick Actions */}
          <div>
            <h2 className="text-2xl md:text-3xl font-display tracking-wider mb-5 flex items-center gap-3">
              <div className="w-1.5 h-6 bg-brand rounded-full" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {QUICK_ACTIONS.map((a, i) => (
                <div key={a.to} className="text-xl animate-slide-up " style={{ animationDelay: `${i * 60}ms` }}>
                  <QuickCard {...a} />
                </div>
              ))}
            </div>
          </div>

          {/* Pro Tip - Horizontal Banner */}
          <div className="card p-5 border-brand/10 bg-gradient-to-r from-brand/5 to-transparent flex items-center gap-5 animate-fade-in">
            <div className="w-12 h-12 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center flex-shrink-0">
              <FiAward className="text-brand text-xl" />
            </div>
            <div>
              <p className="text-[14 px] font-black uppercase tracking-[0.2em] text-brand mb-1">Pro Tip of the day</p>
              <p className="text-base text-[var(--text-secondary)] leading-relaxed">
                Progressive overload is key — aim to add <span className="text-[var(--text-primary)] font-semibold">2.5kg or 1 more rep</span> each week on your main lifts.
              </p>
            </div>
          </div>

          {/* Recent Workouts */}
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-display tracking-wider flex items-center gap-3">
                <div className="w-1.5 h-6 bg-brand rounded-full" />
                Recent Workouts
              </h2>
              <Link to="/workout/history" className="text-brand text-l font-bold uppercase hover:underline flex items-center gap-1">
                View All <FiChevronRight className="text-lg" />
              </Link>
            </div>

            {loading ? (
              <div className="card p-12 text-center text-muted">
                <div className="w-10 h-10 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-base">Fetching your activity...</p>
              </div>
            ) : recentWorkouts.length === 0 ? (
              <div className="card p-12 text-center bg-gradient-to-br from-brand/5 to-transparent border-dashed border-brand/20">
                <GiMuscleUp className="text-brand/30 text-6xl mx-auto mb-4 bounce-subtle" />
                <p className="text-muted text-base mb-6 font-medium">No workouts logged yet. Time to start! 💪</p>
                <Link to="/workout/log" className="btn-primary inline-flex items-center gap-2 text-base py-3 px-8 shimmer">
                  <FiPlusSquare /> Start Your Journey
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentWorkouts.map((w, i) => {
                  const type = w.workoutType?.toLowerCase();
                  
                  return (
                    <Link
                      key={w.id}
                      to={`/workout/${w.id}`}
                      className={`card p-5 flex items-center justify-between
                        hover:border-brand/35 hover:bg-gradient-to-r hover:from-brand/5 hover:to-transparent
                        hover:shadow-glow-sm hover:-translate-y-0.5
                        transition-all duration-300 border-l-4 border-l-brand animate-slide-up group`}
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-base text-[var(--text-primary)] group-hover:text-brand transition-colors truncate">{w.name}</p>
                        <p className="text-l text-muted mt-1 flex items-center gap-2 font-medium">
                          <FiCalendar className="text-l" />
                          {new Date(w.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        {w.duration > 0 && (
                          <span className="flex items-center gap-1.5 text-l font-bold text-muted bg-[var(--surface-elevated)] px-3 py-1.5 rounded-lg">
                            <FiClock className="text-[10px]" /> {w.duration}m
                          </span>
                        )}
                        {w.totalVolume > 0 && (
                          <span className={`flex items-center gap-1.5 text-l font-bold text-brand bg-[var(--surface-elevated)] px-3 py-1.5 rounded-lg`}>
                            <FiZap className="text-[10px]" /> {w.totalVolume.toLocaleString()}kg
                          </span>
                        )}
                        <span className="badge-brand text-l px-2.5 py-1 capitalize">{w.workoutType?.replace('_', ' ')}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Diet + Tips */}
        <div className="lg:col-span-1 space-y-5">
          {/* ── Activity Heatmap ─────────────────────────────────────────────── */}
          <div className="card p-5 relative overflow-hidden hover:border-brand/30 hover:shadow-glow-sm transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand/4 rounded-full blur-2xl pointer-events-none" />
            
            {(() => {
              const [dateView, setDateView] = useState(new Date());
              const month = dateView.getMonth();
              const year = dateView.getFullYear();
              
              const daysInMonth = new Date(year, month + 1, 0).getDate();
              const days = [...Array(daysInMonth)].map((_, i) => new Date(year, month, i + 1));
              
              const changeMonth = (offset) => setDateView(new Date(year, month + offset, 1));

              return (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[19px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] flex items-center gap-2">
                      <FiCalendar className="text-brand" />
                      Activity Heatmap
                    </h2>
                    <div className="flex items-center gap-2">
                      <button onClick={() => changeMonth(-1)} className="text-white/40 hover:text-white">◀</button>
                      <span className="text-sm font-bold text-white/50 w-24 text-center">
                        {dateView.toLocaleString('default', { month: 'short', year: 'numeric' })}
                      </span>
                      <button onClick={() => changeMonth(1)} disabled={month === new Date().getMonth() && year === new Date().getFullYear()} className="text-white/40 hover:text-white disabled:opacity-20">▶</button>
                    </div>
                  </div>

                  <div className="w-full grid grid-cols-7 gap-1.5">
                    {days.map((d, i) => {
                      const hasWorkout = recentWorkouts.some(w => new Date(w.date).toDateString() === d.toDateString());
                      const isToday = d.toDateString() === new Date().toDateString();
                      return (
                        <div
                          key={i}
                          title={d.toDateString()}
                          className={`aspect-square rounded-lg transition-all duration-300 flex items-center justify-center text-xs font-bold cursor-default
                            ${hasWorkout
                              ? 'bg-brand text-[#f5e4e4] shadow-glow-sm'
                              : isToday
                                ? 'bg-[var(--surface-elevated)] border border-brand/50 text-brand'
                                : 'bg-[var(--surface-elevated)] text-muted hover:bg-brand/20 hover:text-brand'
                            } animate-scale-in`}
                          style={{ animationDelay: `${i * 18}ms` }}
                        >
                          {d.getDate()}
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })()}
          </div>

          <DailyDietTracker />

          {/* Quick links */}
          <div className="card p-4 space-y-1">
            <p className="text-xl font-black uppercase tracking-widest text-[var(--text-secondary)] mb-3 ">More</p>
            {[
              { to: '/progress/photos', label: 'Progress Photos', icon: FiActivity },
              { to: '/social',          label: 'Community Feed',  icon: FiZap },
              { to: '/profile',         label: 'My Profile',      icon: FiTarget },
            ].map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--surface-elevated)] transition-colors group"
              >
                <Icon className="text-[var(--text-secondary)] group-hover:text-brand text-lg transition-colors" />
                <span className="text-l text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] font-medium transition-colors">{label}</span>
                <FiChevronRight className="ml-auto text-[var(--text-secondary)] group-hover:text-brand text-xs transition-all group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
