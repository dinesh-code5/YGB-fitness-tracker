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
      <p className="text-sm font-bold text-[var(--text-primary)] group-hover:text-brand transition-colors">{label}</p>
      <p className="text-xs text-muted mt-0.5">{sub}</p>
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

const MOTIVATIONAL_QUOTES = [
  { text: "The only bad workout is the one that didn't happen.", author: "Unknown" },
  { text: "Your body can stand almost anything. It’s your mind that you have to convince.", author: "Unknown" },
  { text: "Fitness is not about being better than someone else. It's about being better than you were yesterday.", author: "Unknown" },
  { text: "The pain you feel today will be the strength you feel tomorrow.", author: "Unknown" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
  { text: "Doubt kills more dreams than failure ever will.", author: "Karim Seddiki" },
  { text: "Success starts with self-discipline.", author: "Unknown" },
  { text: "Progressive overload is key — aim to add 2.5kg or 1 more rep each week.", author: "YGB Team" }
];

export default function Dashboard() {
  const { user, dashboardData, refreshGlobalData } = useAuth();
  const { recentWorkouts, allWorkouts30d, stats, isRefreshing } = dashboardData;
  const loading = !stats && isRefreshing;
  const [quoteIdx, setQuoteIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIdx(prev => (prev + 1) % MOTIVATIONAL_QUOTES.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Only fetch if we don't have data yet or if it's been a while (optional)
    if (!stats) {
      refreshGlobalData();
    }
  }, [stats, refreshGlobalData]);

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
      <div className="card mb-6 p-4 relative overflow-hidden border-brand/15 bg-gradient-to-r from-brand/5 via-transparent to-transparent animate-slide-in-left">
        <div className="absolute right-0 top-0 bottom-0 w-48 bg-gradient-to-l from-brand/5 to-transparent pointer-events-none" />
        <div className="flex items-center gap-3">
          <span className="text-3xl bounce-subtle">{emoji}</span>
          <div>
            <p className="text-base text-[var(--text-secondary)] font-medium uppercase tracking-wider">{greeting}</p>
            <p className="text-lg font-black text-[var(--text-primary)] leading-tight">{line}</p>
          </div>
          {user?.currentStreak > 0 && (
            <div className="ml-auto flex items-center gap-1.5 badge bg-brand/10 text-brand border border-brand/20 py-1 text-[10px]">
              🔥 {user.currentStreak} day streak
            </div>
          )}
        </div>
      </div>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div className="overflow-hidden">
          {/* Animated letter-by-letter name — dramatic pop */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl tracking-wider leading-none flex flex-wrap">
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
            <span className="badge-brand text-[10px] px-2.5 py-0.5 capitalize">{user?.goal?.replace(/_/g, ' ')}</span>
            <span className="tag text-[10px] px-2.5 py-0.5 capitalize">{user?.experience}</span>
          </div>
        </div>
        <Link to="/workout/log" className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 text-sm py-3 px-6 shadow-glow">
          <FiPlusSquare className="text-lg" /> Start Workout
        </Link>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {STAT_ITEMS.map((s, i) => (
          <div
            key={s.label}
            className={`stat-card p-4 sm:p-5 ${s.border} animate-slide-up`}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <span className="text-xl sm:text-2xl">{s.icon}</span>
            <p className={`text-lg sm:text-2xl font-black mt-1.5 ${s.color === 'text-brand' ? 'text-brand' : s.color}`}>{s.value}</p>
            <p className="text-[9px] sm:text-[10px] text-muted font-bold uppercase tracking-widest mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Main Grid ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Quick Actions + Recent Workouts */}
        <div className="lg:col-span-2 space-y-6">

          {/* Quick Actions */}
          <div>
            <h2 className="text-xl font-display tracking-wider mb-4 flex items-center gap-3 text-[var(--text-primary)]">
              <div className="w-1 h-5 bg-brand rounded-full" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {QUICK_ACTIONS.map((a, i) => (
                <div key={a.to} className="animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
                  <QuickCard {...a} />
                </div>
              ))}
            </div>
          </div>

          {/* Motivational Quote - Rotating Banner */}
          <div className="card p-5 border-brand/10 bg-gradient-to-r from-brand/5 to-transparent flex flex-col sm:flex-row items-center sm:items-start gap-4 animate-fade-in text-center sm:text-left transition-all duration-500 min-h-[100px]">
            <div className="w-12 h-12 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center flex-shrink-0">
              <FiAward className="text-brand text-2xl" />
            </div>
            <div key={quoteIdx} className="animate-fade-in">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand mb-1">Momentum Boost</p>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed italic">
                "{MOTIVATIONAL_QUOTES[quoteIdx].text}"
              </p>
              <p className="text-[10px] font-bold text-white/20 mt-1 uppercase tracking-tighter">— {MOTIVATIONAL_QUOTES[quoteIdx].author}</p>
            </div>
          </div>

          {/* Recent Workouts */}
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-xl font-display tracking-wider flex items-center gap-3 text-[var(--text-primary)]">
                <div className="w-1 h-5 bg-brand rounded-full" />
                Recent Activity
              </h2>
              <Link to="/workout/history" className="text-brand text-[10px] font-black uppercase tracking-widest hover:underline flex items-center gap-1.5">
                Full Log <FiChevronRight className="text-sm" />
              </Link>
            </div>

            {loading ? (
              <div className="card p-12 text-center text-muted">
                <div className="w-10 h-10 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-base uppercase font-black tracking-widest text-xs">Fetching activity...</p>
              </div>
            ) : recentWorkouts.length === 0 ? (
              <div className="card p-12 text-center bg-gradient-to-br from-brand/5 to-transparent border-dashed border-brand/20">
                <GiMuscleUp className="text-brand/30 text-6xl mx-auto mb-4 bounce-subtle" />
                <p className="text-muted text-lg mb-8 font-medium">No workouts logged yet. Start today! 💪</p>
                <Link to="/workout/log" className="btn-primary inline-flex items-center gap-3 text-base py-4 px-10 shadow-glow uppercase font-black tracking-widest">
                  <FiPlusSquare className="text-xl" /> Start First Workout
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentWorkouts.map((w, i) => (
                  <Link
                    key={w.id}
                    to={`/workout/${w.id}`}
                    className="card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-brand/40 hover:bg-brand/5 hover:translate-x-1 transition-all duration-300 border-l-4 border-l-brand group"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-base sm:text-lg text-[var(--text-primary)] group-hover:text-brand transition-colors truncate">{w.name}</p>
                      <div className="flex items-center gap-2.5 mt-1 text-muted">
                        <FiCalendar className="text-brand" />
                        <p className="text-xs font-bold uppercase tracking-wider">
                          {new Date(w.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      {w.duration > 0 && (
                        <div className="bg-[#1A1A26] px-3 py-2 rounded-xl border border-white/5 flex flex-col items-center min-w-[60px] shadow-inner">
                          <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.15em] leading-none mb-1">Time</span>
                          <span className="text-sm sm:text-base font-black text-white leading-none">{w.duration}<span className="text-[10px] opacity-40 ml-0.5 font-bold">m</span></span>
                        </div>
                      )}
                      {w.totalVolume > 0 && (
                        <div className="bg-[#1A1A26] px-3 py-2 rounded-xl border border-white/5 flex flex-col items-center min-w-[75px] shadow-inner">
                          <span className="text-[9px] font-black text-brand/40 uppercase tracking-[0.15em] leading-none mb-1">Volume</span>
                          <span className="text-sm sm:text-base font-black text-white leading-none">{(w.totalVolume/1000).toFixed(1)}<span className="text-[10px] opacity-40 ml-0.5 font-bold">t</span></span>
                        </div>
                      )}
                      <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 group-hover:border-brand/40 transition-colors">
                        <FiChevronRight className="text-brand" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Diet + Tips */}
        <div className="lg:col-span-1 space-y-5">
          <DailyDietTracker />

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
                      const hasWorkout = allWorkouts30d?.some(w => new Date(w.date).toDateString() === d.toDateString());
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
