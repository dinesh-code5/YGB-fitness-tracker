import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiClock, FiZap, FiChevronRight } from 'react-icons/fi';
import { GiMuscleUp } from 'react-icons/gi';

const TYPE_COLORS = {
  push: 'badge-accent', pull: 'badge-brand', legs: 'badge-warning',
  full_body: 'badge-success', custom: 'badge bg-[#2A2A3A] text-muted border-0'
};

export default function WorkoutHistory() {
  const navigate = useNavigate();
  const { dashboardData, refreshGlobalData } = useAuth();
  const { historyWorkouts = [], isRefreshing } = dashboardData;
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    // Background refresh if history is empty
    if (historyWorkouts.length === 0) {
      refreshGlobalData();
    }
  }, [historyWorkouts.length, refreshGlobalData]);

  const filteredWorkouts = historyWorkouts.filter(w => 
    filter === 'all' || w.workoutType === filter
  );

  const totalPages = Math.ceil(filteredWorkouts.length / itemsPerPage);
  const workouts = filteredWorkouts.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const loading = historyWorkouts.length === 0 && isRefreshing;

  const FILTERS = ['all', 'push', 'pull', 'legs', 'upper', 'lower', 'full_body', 'cardio', 'custom'];

  const MOOD_EMOJI = { great: '🔥', good: '💪', okay: '😐', bad: '😞' };

  return (
    <div className="page-container max-w-4xl px-3 md:px-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-display text-4xl tracking-wider text-brand">TRAINING LOG</h1>
          <p className="text-muted text-sm font-bold uppercase tracking-widest mt-1">Review your past sessions</p>
        </div>
        <div className="inline-flex card px-4 py-2 rounded-xl border-brand/20 bg-brand/5 text-sm font-black text-brand uppercase self-start md:self-center tracking-widest">
          {filteredWorkouts.length} Workouts
        </div>
      </div>

      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
        <div className="bg-[var(--surface-elevated)] p-1 rounded-xl border border-[var(--surface-border)] flex gap-1">
          {FILTERS.map(f => (
            <button key={f} onClick={() => { setFilter(f); setPage(1); }}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                filter === f ? 'bg-brand text-[#efeff2] shadow-glow-sm' : 'text-muted hover:text-[var(--text-primary)] hover:bg-[var(--surface-card)]'
              }`}>
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-3 border-brand border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">Syncing History...</p>
        </div>
      ) : workouts.length === 0 ? (
        <div className="card p-20 text-center border-dashed border-brand/20 bg-brand/5">
          <GiMuscleUp className="text-brand/20 text-7xl mx-auto mb-4" />
          <p className="text-muted font-bold uppercase tracking-widest text-xs">No {filter !== 'all' ? filter : ''} sessions found.</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {workouts.map((w, i) => (
              <button key={w.id} onClick={() => navigate(`/workout/${w.id}`)}
                className="w-full card overflow-hidden hover:border-brand/40 transition-all text-left group animate-fade-in"
                style={{ animationDelay: `${i * 50}ms` }}>
                <div className="flex items-stretch h-full min-h-[100px]">
                  {/* Mood side bar */}
                  <div className={`w-1.5 ${
                    w.mood === 'great' ? 'bg-brand shadow-glow-sm' : 
                    w.mood === 'good' ? 'bg-green-500' : 
                    w.mood === 'okay' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  
                  <div className="flex-1 p-4 md:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 md:gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-xl">{MOOD_EMOJI[w.mood] || '💪'}</span>
                          <h3 className="font-bold text-[var(--text-primary)] group-hover:text-brand transition-colors truncate text-sm md:text-base">{w.name}</h3>
                        </div>
                        <p className="text-[10px] text-muted font-black uppercase tracking-wider flex items-center gap-2">
                          <span className="text-brand">{new Date(w.date).toLocaleDateString('en-IN', { day:'2-digit', month:'short' })}</span>
                          <span className="w-1 h-1 rounded-full bg-[var(--surface-border)]" />
                          <span>{new Date(w.date).toLocaleDateString('en-IN', { weekday: 'long' })}</span>
                        </p>
                      </div>
                      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2">
                        <span className={`${TYPE_COLORS[w.workoutType] || TYPE_COLORS.custom} !text-[8px] !px-2 !py-0.5 font-black uppercase tracking-widest`}>
                          {w.workoutType?.replace('_', ' ')}
                        </span>
                        <div className="flex items-center gap-3 text-[10px] font-black text-muted uppercase">
                          {w.duration > 0 && <span className="flex items-center gap-1"><FiClock className="text-brand"/>{w.duration}M</span>}
                          {w.totalVolume > 0 && <span className="flex items-center gap-1"><FiZap className="text-brand"/>{w.totalVolume.toLocaleString()} KG</span>}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {w.exercises?.slice(0, 5).map((ex, i) => (
                        <span key={i} className="tag border-brand/10 bg-brand/5 text-[9px] text-brand/80 font-bold px-2 py-1 uppercase">{ex.name}</span>
                      ))}
                      {w.exercises?.length > 5 && <span className="tag text-[9px] px-2 py-1 font-bold">+{w.exercises.length - 5} MORE</span>}
                      <FiChevronRight className="ml-auto text-muted group-hover:text-brand transition-all group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-10">
              <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
                className="btn-secondary !text-xs !py-2 !px-4 disabled:opacity-40 font-black uppercase tracking-widest">Prev</button>
              <span className="text-xs font-black text-muted uppercase tracking-widest">{page} / {totalPages}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages}
                className="btn-secondary !text-xs !py-2 !px-4 disabled:opacity-40 font-black uppercase tracking-widest">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
