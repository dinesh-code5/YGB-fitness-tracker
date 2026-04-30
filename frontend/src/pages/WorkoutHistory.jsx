import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { workoutAPI } from '../utils/api';
import { FiClock, FiZap, FiFilter, FiChevronRight } from 'react-icons/fi';
import { GiMuscleUp } from 'react-icons/gi';
import toast from 'react-hot-toast';

const TYPE_COLORS = {
  push: 'badge-accent', pull: 'badge-brand', legs: 'badge-warning',
  full_body: 'badge-success', custom: 'badge bg-[#2A2A3A] text-muted border-0'
};

export default function WorkoutHistory() {
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const params = { limit: 10, page };
      if (filter !== 'all') params.type = filter;
      const { data } = await workoutAPI.getAll(params);
      setWorkouts(data.workouts || []);
      setPagination(data.pagination);
    } catch { toast.error('Failed to load workouts'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter, page]);

  const FILTERS = ['all', 'push', 'pull', 'legs', 'upper', 'lower', 'full_body', 'cardio', 'custom'];

  const MOOD_EMOJI = { great: '🔥', good: '💪', okay: '😐', bad: '😞' };

  return (
    <div className="page-container max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl tracking-wider text-brand">TRAINING LOG</h1>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mt-1">Review your past sessions</p>
        </div>
        {pagination && <div className="card px-3 py-1.5 rounded-lg border-brand/20 bg-brand/5 text-[10px] font-black text-brand uppercase">{pagination.total} Workouts</div>}
      </div>

      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
        <div className="bg-[var(--surface-elevated)] p-1 rounded-xl border border-[var(--surface-border)] flex gap-1">
          {FILTERS.map(f => (
            <button key={f} onClick={() => { setFilter(f); setPage(1); }}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === f ? 'bg-brand text-[#0F0F14] shadow-glow-sm' : 'text-muted hover:text-[var(--text-primary)] hover:bg-[var(--surface-card)]'
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
          <p className="text-muted font-bold">No {filter !== 'all' ? filter : ''} sessions found.</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {workouts.map((w, i) => (
              <button key={w.id} onClick={() => navigate(`/workout/${w.id}`)}
                className="w-full card overflow-hidden hover:border-brand/40 transition-all text-left group animate-fade-in"
                style={{ animationDelay: `${i * 50}ms` }}>
                <div className="flex items-stretch h-full">
                  {/* Mood side bar */}
                  <div className={`w-1 ${
                    w.mood === 'great' ? 'bg-brand shadow-[0_0_10px_rgba(0,212,255,0.5)]' : 
                    w.mood === 'good' ? 'bg-green-500' : 
                    w.mood === 'okay' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  
                  <div className="flex-1 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-xl">{MOOD_EMOJI[w.mood] || '💪'}</span>
                          <h3 className="font-bold text-[var(--text-primary)] group-hover:text-brand transition-colors truncate">{w.name}</h3>
                        </div>
                        <p className="text-[10px] text-muted font-black uppercase tracking-wider flex items-center gap-2">
                          <span className="text-brand">{new Date(w.date).toLocaleDateString('en-IN', { day:'2-digit', month:'short' })}</span>
                          <span className="w-1 h-1 rounded-full bg-[var(--surface-border)]" />
                          <span>{new Date(w.date).toLocaleDateString('en-IN', { weekday: 'long' })}</span>
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`${TYPE_COLORS[w.workoutType] || TYPE_COLORS.custom} !text-[9px] !px-2 !py-0.5`}>
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
                        <span key={i} className="tag border-brand/5 bg-brand/5 text-[9px] text-brand/70">{ex.name}</span>
                      ))}
                      {w.exercises?.length > 5 && <span className="tag text-[9px]">+{w.exercises.length - 5} MORE</span>}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
                className="btn-secondary text-sm py-1.5 px-3 disabled:opacity-40">Prev</button>
              <span className="text-sm text-muted">{page} / {pagination.pages}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={page === pagination.pages}
                className="btn-secondary text-sm py-1.5 px-3 disabled:opacity-40">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// export default function WorkoutHistory() {
//   const [workouts, setWorkouts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [filter, setFilter] = useState('all');
//   const [page, setPage] = useState(1);
//   const [pagination, setPagination] = useState(null);

//   const load = async () => {
//     setLoading(true);
//     try {
//       const params = { limit: 10, page };
//       if (filter !== 'all') params.type = filter;
//       const { data } = await workoutAPI.getAll(params);
//       setWorkouts(data.workouts);
//       setPagination(data.pagination);
//     } catch {
//       toast.error('Failed to load workouts');
//     }
//     setLoading(false);
//   };

//   useEffect(() => { load(); }, [filter, page]);

//   const handleDelete = async (id) => {
//     if (!window.confirm('Delete this workout?')) return;
//     try {
//       await workoutAPI.delete(id);
//       toast.success('Workout deleted');
//       load();
//     } catch {
//       toast.error('Failed to delete');
//     }
//   };

//   const FILTERS = ['all', 'push', 'pull', 'legs', 'upper', 'lower', 'full_body', 'cardio', 'custom'];

//   return (
//     <div className="page-container">
//       <div className="flex items-center justify-between mb-6">
//         <h1 className="font-display text-3xl tracking-wider">WORKOUT HISTORY</h1>
//         {pagination && (
//           <span className="text-sm text-muted">{pagination.total} total</span>
//         )}
//       </div>

//       {/* Filter */}
//       <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-2">
//         <FiFilter className="text-muted flex-shrink-0" />
//         {FILTERS.map(f => (
//           <button key={f} onClick={() => { setFilter(f); setPage(1); }}
//             className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filter === f ? 'bg-brand text-[#0F0F14]' : 'bg-[#1E1E2A] text-muted hover:text-[#F0F0F5]'}`}>
//             {f.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
//           </button>
//         ))}
//       </div>

//       {loading ? (
//         <div className="text-center py-12 text-muted">
//           <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-3" />
//           Loading workouts...
//         </div>
//       ) : workouts.length === 0 ? (
//         <div className="card p-12 text-center">
//           <GiMuscleUp className="text-brand/20 text-6xl mx-auto mb-3" />
//           <p className="text-muted">No workouts found.</p>
//         </div>
//       ) : (
//         <>
//           <div className="space-y-3">
//             {workouts.map(w => (
//               <div key={w._id} className="card p-4 hover:border-[#3A3A4A] transition-all">
//                 <div className="flex items-start justify-between gap-3">
//                   <div className="flex-1 min-w-0">
//                     <div className="flex items-center gap-2 flex-wrap mb-1">
//                       <h3 className="font-semibold text-[#F0F0F5] text-sm">{w.name}</h3>
//                       <span className={TYPE_COLORS[w.workoutType] || TYPE_COLORS.custom + ' badge text-xs'}>
//                         {w.workoutType?.replace('_', ' ')}
//                       </span>
//                     </div>
//                     <p className="text-xs text-muted mb-2">
//                       {new Date(w.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
//                     </p>
//                     <div className="flex items-center gap-4 text-xs text-muted mb-2">
//                       {w.duration > 0 && <span className="flex items-center gap-1"><FiClock />{w.duration} min</span>}
//                       {w.totalVolume > 0 && <span className="flex items-center gap-1"><FiZap />{w.totalVolume.toLocaleString()} kg total</span>}
//                       {w.totalSets > 0 && <span>{w.totalSets} sets</span>}
//                     </div>
//                     {w.exercises?.length > 0 && (
//                       <div className="flex flex-wrap gap-1">
//                         {w.exercises.map((ex, i) => (
//                           <span key={i} className="tag text-xs">{ex.name}</span>
//                         ))}
//                       </div>
//                     )}
//                     {w.notes && <p className="text-xs text-muted mt-2 italic">"{w.notes}"</p>}
//                   </div>
//                   <button onClick={() => handleDelete(w._id)} className="text-muted hover:text-red-400 p-1 flex-shrink-0">
//                     <FiTrash2 className="text-sm" />
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Pagination */}
//           {pagination && pagination.pages > 1 && (
//             <div className="flex items-center justify-center gap-2 mt-6">
//               <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
//                 className="btn-secondary text-sm py-1.5 px-3 disabled:opacity-40">Prev</button>
//               <span className="text-sm text-muted">{page} / {pagination.pages}</span>
//               <button onClick={() => setPage(p => p + 1)} disabled={page === pagination.pages}
//                 className="btn-secondary text-sm py-1.5 px-3 disabled:opacity-40">Next</button>
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   );
// }
