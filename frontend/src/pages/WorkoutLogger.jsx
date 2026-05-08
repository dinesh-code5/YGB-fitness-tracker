import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { workoutAPI, plansAPI, authAPI } from '../utils/api';
import {FiPlus, FiTrash2, FiCheck, FiClock, FiZap,
  FiChevronDown, FiChevronUp, FiX, FiPlay,
  FiAlertCircle, FiExternalLink
} from 'react-icons/fi';
import { GiMuscleUp } from 'react-icons/gi';
import toast from 'react-hot-toast';
import LiquidRestTimer from '../components/LiquidRestTimer';
import { useAuth } from "../context/AuthContext";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const WORKOUT_TYPES = ['push','pull','legs','upper','lower','full_body','cardio','custom'];
const MOODS = [
  { v:'great',e:'🔥',l:'Great' },
  { v:'good', e:'💪',l:'Good'  },
  { v:'okay', e:'😐',l:'Okay'  },
  { v:'bad',  e:'😞',l:'Bad'   }
];

const SET_TYPES = [
  { v:'normal',   l:'Normal',   color:'text-[var(--text-primary)]',  bg:'bg-[var(--surface-elevated)]' },
  { v:'warmup',   l:'Warm-up',  color:'text-yellow-400',             bg:'bg-yellow-500/15' },
  { v:'dropset',  l:'Drop Set', color:'text-orange-400',             bg:'bg-orange-500/15' },
  { v:'failure',  l:'Failure',  color:'text-red-400',                bg:'bg-red-500/15' },
];

// ── Exercise Detail + History Modal ────────────────────────
const ExerciseDetailModal = ({ exercise: initialEx, pastWorkouts, onClose }) => {
  const [exercise, setExercise] = useState(initialEx);
  const [loading, setLoading] = useState(!initialEx.description);
  const [activeTab, setActiveTab] = useState('description');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const id = initialEx.exerciseId || initialEx.id || initialEx._id;
        const [exRes, statsRes] = await Promise.all([
          plansAPI.getExercise(id),
          workoutAPI.getStats(365) // Get full year for graph
        ]);
        setExercise(prev => ({ ...prev, ...exRes.data.exercise }));
        if (statsRes.data.success) {
          setStats(statsRes.data.stats.strengthProgress[initialEx.name] || []);
        }
      } catch (err) {
        console.error('Failed to fetch details/stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [initialEx]);

  const history = [];
  pastWorkouts.forEach(w => {
    const found = w.exercises?.find(e =>
      e.name === exercise.name || e.exerciseId === exercise.exerciseId
    );
    if (found) {
      history.push({
        workoutName: w.name,
        date: w.date,
        workoutId: w.id,
        sets: found.sets || []
      });
    }
  });

  // 1RM Calculation (Brzycki Formula)
  const calculate1RM = (weight, reps) => {
    if (!weight || !reps || reps === 0) return 0;
    if (reps === 1) return weight;
    return weight / (1.0278 - (0.0278 * reps));
  };

  const getBest1RM = (sets) => {
    const ones = sets.map(s => calculate1RM(s.weight, s.reps));
    return ones.length > 0 ? Math.max(...ones) : 0;
  };

  const chartData = {
    labels: stats?.map(s => s.date) || [],
    datasets: [
      {
        label: 'Max Weight (kg)',
        data: stats?.map(s => s.weight) || [],
        borderColor: '#00D4FF',
        backgroundColor: 'rgba(0, 212, 255, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#00D4FF',
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: '#16161E',
        titleColor: '#00D4FF',
        bodyColor: '#FFFFFF',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        padding: 10,
      }
    },
    scales: {
      y: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 10 } }
      },
      x: {
        grid: { display: false },
        ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 10 } }
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-start justify-center p-2 sm:p-4 pt-2 sm:pt-4 overflow-y-auto">
      <div className="bg-[#11111A] border border-white/10 rounded-3xl w-full max-w-lg max-h-[95vh] flex flex-col shadow-2xl overflow-hidden animate-scale-in my-2 sm:my-0">
        {/* Header */}
        <div className="bg-[#16161E] border-b border-white/5 p-5 sm:p-6 flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tight">{exercise.name}</h3>
            <p className="text-sm font-bold text-brand uppercase tracking-[0.2em] mt-1">
              {exercise.muscleGroup || exercise.muscles?.join(', ')}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 transition-all"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-[#16161E] border-b border-white/5 p-1">
          {[
            { id: 'description', label: 'Guide', icon: FiPlay },
            { id: 'history', label: 'History', icon: FiClock },
            { id: 'graph', label: 'Progress', icon: FiTrendingUp }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id ? 'bg-brand text-[#0A0A0F] shadow-glow-sm' : 'text-white/30 hover:text-white'
              }`}
            >
              <tab.icon className="text-sm" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-8 custom-scrollbar">
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm font-black text-white/20 uppercase tracking-widest">Accessing Guide...</p>
            </div>
          ) : (
            <>
              {activeTab === 'description' && (
                <div className="space-y-8 animate-fade-in">
                  <div className="flex flex-wrap gap-2">
                    {exercise.muscles?.map(m => (
                      <span key={m} className="px-3 py-1.5 bg-brand/5 border border-brand/10 text-brand text-xs font-black uppercase tracking-widest rounded-lg">
                        {m}
                      </span>
                    ))}
                  </div>

                  {exercise.description && (
                    <div>
                      <h4 className="text-xs font-black text-white/30 uppercase tracking-[0.2em] mb-3">Technique Overview</h4>
                      <p className="text-lg text-white/70 leading-relaxed font-medium">{exercise.description}</p>
                    </div>
                  )}

                  {exercise.youtubeId && (
                    <div>
                      <h4 className="text-xs font-black text-white/30 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                        <FiPlay className="text-brand" /> Visual Execution
                      </h4>
                      <div className="rounded-2xl overflow-hidden bg-black border border-white/5 shadow-2xl" style={{ aspectRatio: '16/9' }}>
                        <iframe
                          src={`https://www.youtube.com/embed/${exercise.youtubeId}`}
                          className="w-full h-full" title={exercise.name} allowFullScreen
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {exercise.cues?.length > 0 && (
                      <div>
                        <h4 className="text-xs font-black text-green-400/50 uppercase tracking-[0.2em] mb-3">Key Cues</h4>
                        <ul className="space-y-2.5">
                          {exercise.cues.map((c, i) => (
                            <li key={i} className="flex items-start gap-3 text-base text-white/60 font-medium">
                              <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
                              {c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {exercise.mistakes?.length > 0 && (
                      <div>
                        <h4 className="text-xs font-black text-red-400/50 uppercase tracking-[0.2em] mb-3">Common Pitfalls</h4>
                        <ul className="space-y-2.5">
                          {exercise.mistakes.map((m, i) => (
                            <li key={i} className="flex items-start gap-3 text-base text-white/60 font-medium">
                              <span className="text-red-400 mt-0.5 flex-shrink-0">✗</span>
                              {m}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h4 className="text-xs font-black text-white/30 uppercase tracking-[0.2em] mb-4 flex items-center justify-between">
                      Recent Performance History
                      <span className="bg-white/5 px-2 py-0.5 rounded text-[10px]">{history.length} Sessions</span>
                    </h4>
                    
                    {history.length > 0 ? (
                      <div className="space-y-3">
                        {history.slice(0, 5).map((h, i) => {
                          const completedSets = h.sets.filter(s => s.completed);
                          const est1RM = Math.round(getBest1RM(completedSets));
                          return (
                            <div key={i} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-all">
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <p className="font-black text-white/80 uppercase tracking-tight text-base">{h.workoutName}</p>
                                  <p className="text-xs font-bold text-white/20 uppercase mt-0.5">
                                    {new Date(h.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                  </p>
                                </div>
                                {est1RM > 0 && (
                                  <div className="text-right">
                                    <p className="text-[10px] font-black text-brand uppercase tracking-tighter">Est. 1RM</p>
                                    <p className="text-base font-black text-white">{est1RM}<span className="text-[10px] opacity-40 ml-0.5">kg</span></p>
                                  </div>
                                )}
                              </div>
                              
                              <div className="space-y-1.5">
                                <div className="grid grid-cols-4 text-[9px] font-black text-white/10 uppercase tracking-widest px-1">
                                  <span>Set</span>
                                  <span className="text-center">Weight</span>
                                  <span className="text-center">Reps</span>
                                  <span className="text-right">1RM</span>
                                </div>
                                {completedSets.map((s, si) => {
                                  const set1RM = Math.round(calculate1RM(s.weight, s.reps));
                                  return (
                                    <div key={si} className="grid grid-cols-4 bg-black/40 border border-white/5 rounded-lg px-2 py-1.5 items-center">
                                      <span className="text-[10px] font-black text-white/20">S{s.setNumber}</span>
                                      <span className="text-xs font-black text-brand text-center">{s.weight}<span className="text-[8px] opacity-40 ml-0.5">kg</span></span>
                                      <span className="text-xs font-black text-white text-center">{s.reps}<span className="text-[8px] opacity-40 ml-0.5">r</span></span>
                                      <span className="text-[10px] font-black text-white/40 text-right">{set1RM}k</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-12 text-center bg-white/[0.01] border border-dashed border-white/5 rounded-2xl">
                        <GiMuscleUp className="text-white/5 text-4xl mx-auto mb-3" />
                        <p className="text-sm font-bold text-white/20 uppercase tracking-widest">No previous data found</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'graph' && (
                <div className="space-y-6 animate-fade-in h-full">
                   <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4">Weight Progress Trend</h4>
                   <div className="h-64 w-full bg-white/[0.01] border border-white/5 rounded-2xl p-4">
                     {stats && stats.length > 1 ? (
                       <Line data={chartData} options={chartOptions} />
                     ) : (
                       <div className="h-full flex flex-col items-center justify-center text-center px-6">
                         <FiTrendingUp className="text-white/5 text-4xl mb-3" />
                         <p className="text-xs font-bold text-white/20 uppercase tracking-widest leading-relaxed">
                           Complete at least 2 sessions of this exercise to visualize your progress.
                         </p>
                       </div>
                     )}
                   </div>
                   {stats && stats.length > 0 && (
                     <div className="grid grid-cols-2 gap-3">
                       <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                         <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">All-Time PR</p>
                         <p className="text-xl font-black text-brand">{Math.max(...stats.map(s => s.weight))}<span className="text-[10px] opacity-40 ml-1">kg</span></p>
                       </div>
                       <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                         <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Sessions</p>
                         <p className="text-xl font-black text-white">{stats.length}</p>
                       </div>
                     </div>
                   )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#16161E] border-t border-white/5 p-4 flex-shrink-0">
          <button 
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-xs font-black uppercase tracking-widest transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Custom Exercise Modal ──────────────────────────────────
const CustomExerciseModal = ({ muscleGroups, onAdd, onClose }) => {
  const [form, setForm] = useState({ name: '', muscleGroup: '', description: '' });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleAdd = () => {
    if (!form.name.trim()) return toast.error('Exercise name is required');
    if (!form.muscleGroup) return toast.error('Target muscle group is required');
    // onAdd handles closing — do NOT call onClose here
    onAdd({
      id: `custom_${Date.now()}`,
      name: form.name.trim(),
      muscleGroup: form.muscleGroup,
      muscles: [form.muscleGroup],
      description: form.description.trim(),
      isCustom: true,
      cues: [],
      mistakes: [],
      youtubeId: null
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-end sm:items-center justify-center p-4">
      <div className="bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-[var(--surface-border)]">
          <h3 className="font-semibold text-[var(--text-primary)]">Create Custom Exercise</h3>
          <button onClick={onClose} className="text-muted hover:text-[var(--text-primary)] text-xl leading-none">×</button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="label">Name <span className="text-red-400">*</span></label>
            <input
              className="input-field text-lg"
              placeholder="e.g. Cable Lateral Raise"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <label className="label">Target Muscle Group <span className="text-red-400">*</span></label>
            <select
              className="input-field text-lg"
              value={form.muscleGroup}
              onChange={e => set('muscleGroup', e.target.value)}
            >
              <option value="">Select muscle group...</option>
              {muscleGroups.map(mg => <option key={mg} value={mg}>{mg}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Description <span className="text-xs text-muted">(optional)</span></label>
            <textarea
              className="input-field text-lg h-20 resize-none"
              placeholder="How to perform this exercise..."
              value={form.description}
              onChange={e => set('description', e.target.value)}
            />
          </div>
          <button onClick={handleAdd} className="btn-primary w-full">Add to Workout</button>
        </div>
      </div>
    </div>
  );
};

// ── Muscle Group Colors ────────────────────────────────────
const MG_COLOR = {
  Chest: 'bg-red-500/10 text-red-400',
  Back: 'bg-blue-500/10 text-blue-400',
  Shoulders: 'bg-purple-500/10 text-purple-400',
  Biceps: 'bg-green-500/10 text-green-400',
  Triceps: 'bg-orange-500/10 text-orange-400',
  Forearms: 'bg-yellow-500/10 text-yellow-400',
  Abs: 'bg-cyan-500/10 text-cyan-400',
  Quads: 'bg-pink-500/10 text-pink-400',
  Hamstrings: 'bg-amber-500/10 text-amber-400',
  Glutes: 'bg-rose-500/10 text-rose-400',
  Calves: 'bg-teal-500/10 text-teal-400',
  Cardio: 'bg-brand/10 text-brand',
  'Full Body': 'bg-[#2A2A3A] text-muted'
};

// ── Exercise Picker ────────────────────────────────────────
const ExercisePicker = ({ onSelect, onClose }) => {
  const [exercises, setExercises] = useState([]);
  const [muscleGroups, setMuscleGroups] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedMG, setSelectedMG] = useState('All');
  const [loading, setLoading] = useState(true);
  const [showCustom, setShowCustom] = useState(false);

  useEffect(() => {
    Promise.all([plansAPI.getMuscleGroups(), plansAPI.getExercises()])
      .then(([mgRes, exRes]) => {
        setMuscleGroups(['All', ...mgRes.data.muscleGroups]);
        setExercises(exRes.data.exercises);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = exercises.filter(e =>
    (selectedMG === 'All' || e.muscleGroup === selectedMG) &&
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-4">
        <div
          className="bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-3xl w-full max-w-md flex flex-col shadow-2xl animate-slide-up"
          style={{ maxHeight: '90vh' }}
        >
          {/* HEADER */}
          <div className="flex items-center justify-between p-5 border-b border-[var(--surface-border)] flex-shrink-0">
            <h3 className="font-display text-xl tracking-wider text-[var(--text-primary)]">
              ADD EXERCISE
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCustom(true)}
                className="btn-secondary text-[10px] py-1.5 px-3 flex items-center gap-1 uppercase font-black"
              >
                <FiPlus /> Custom
              </button>
              <button
                onClick={onClose}
                className="text-muted hover:text-[var(--text-primary)] p-1"
              >
                <FiX className="text-xl" />
              </button>
            </div>
          </div>

          {/* SEARCH */}
          <div className="px-4 pt-3 pb-2 flex-shrink-0">
            <input
              className="input-field text-lg"
              placeholder="Search exercises..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
          </div>

          {/* MUSCLE GROUP FILTER */}
          <div className="flex gap-1.5 overflow-x-auto px-4 pb-2 flex-shrink-0" style={{ scrollbarWidth: 'none' }}>
            {muscleGroups.map(mg => (
              <button
                key={mg}
                onClick={() => setSelectedMG(mg)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                  selectedMG === mg
                    ? 'bg-brand text-[#0F0F14] border-brand'
                    : 'border-[#2A2A3A] text-muted hover:border-brand/40'
                }`}
              >
                {mg}
              </button>
            ))}
          </div>

          {/* EXERCISE LIST */}
          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1.5 min-h-0">
            {loading ? (
              <div className="text-center py-10">
                <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-10 text-muted text-lg">No exercises found</div>
            ) : (
              filtered.map(ex => (
                <button
                  key={ex.id}
                  onClick={() => { onSelect(ex); onClose(); }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#1E1E2A] transition-colors text-left border border-transparent hover:border-[#2A2A3A]"
                >
                  <div className="w-9 h-9 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0">
                    <GiMuscleUp className="text-brand text-lg" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-medium text-[#F0F0F5] truncate">{ex.name}</p>
                    <p className="text-xs text-muted truncate">{ex.muscles?.join(', ')}</p>
                  </div>
                  <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-md font-medium ${MG_COLOR[ex.muscleGroup] || 'bg-[#2A2A3A] text-muted'}`}>
                    {ex.muscleGroup}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* CUSTOM EXERCISE MODAL — rendered inside picker so muscleGroups is available */}
      {showCustom && (
        <CustomExerciseModal
          muscleGroups={muscleGroups.filter(m => m !== 'All')}
          onAdd={(ex) => {
            onSelect(ex);        // add to workout
            setShowCustom(false); // close custom modal
            onClose();            // close picker
          }}
          onClose={() => setShowCustom(false)}
        />
      )}
    </>
  );
};

// ── Set Type Badge ─────────────────────────────────────────
const SetTypeBadge = ({ type, onChange }) => {
  const [open, setOpen] = useState(false);
  const current = SET_TYPES.find(t => t.v === type) || SET_TYPES[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`text-xs px-3 py-2 rounded-xl font-medium whitespace-nowrap ${current.bg} ${current.color}`}
      >
        {current.l} ▾
      </button>
      {open && (
        <div className="absolute bottom-full mb-1 left-0 bg-[#1E1E2A] border border-[#2A2A3A] rounded-xl shadow-card z-10 overflow-hidden w-28">
          {SET_TYPES.map(t => (
            <button
              key={t.v}
              onClick={() => { onChange(t.v); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-xs transition-colors hover:bg-[#2A2A3A] ${t.color} ${type === t.v ? 'font-semibold' : ''}`}
            >
              {t.l}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Exercise Card ──────────────────────────────────────────
const ExerciseCard = ({ exercise, idx, onChange, onRemove, pastWorkouts, startTimer }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const updateSet = (si, field, val) => {
    const sets = [...exercise.sets];
    sets[si] = { ...sets[si], [field]: val };
    onChange({ ...exercise, sets });
  };

  const addSet = () => {
    const prev = exercise.sets[exercise.sets.length - 1];
    onChange({
      ...exercise,
      sets: [...exercise.sets, {
        setNumber: exercise.sets.length + 1,
        weight: prev?.weight || 0,
        reps: prev?.reps || 10,
        type: 'normal',
        completed: false
      }]
    });
  };

  const removeSet = (si) => {
    if (exercise.sets.length <= 1) return;
    onChange({
      ...exercise,
      sets: exercise.sets.filter((_, i) => i !== si).map((s, i) => ({ ...s, setNumber: i + 1 }))
    });
  };

  const completeSet = (si) => {
    const nowDone = !exercise.sets[si].completed;
    updateSet(si, 'completed', nowDone);
    if (nowDone) startTimer(exercise.restTime || 120);
  };

  const completedCount = exercise.sets.filter(s => s.completed).length;

  return (
    <>
      <div className="card rounded-2xl overflow-hidden border-[#2A2A3A] hover:border-[#3A3A4A] transition-all">
        {/* Card Header */}
        <div className="flex items-center gap-3 p-3 md:p-5 bg-[#1E1E2A]">
          <button
            onClick={() => setShowDetail(true)}
            className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-brand/10 flex items-center justify-center flex-shrink-0 hover:bg-brand/25 transition-colors"
          >
            <GiMuscleUp className="text-brand text-lg md:text-xl" />
          </button>

          <button onClick={() => setShowDetail(true)} className="flex-1 min-w-0 text-left">
            <p className="font-bold text-[#F0F0F5] text-sm md:text-base truncate hover:text-brand transition-colors">
              {exercise.name}
            </p>
            <p className="text-[10px] md:text-xs text-muted font-medium uppercase tracking-wider mt-0.5">
              {exercise.muscleGroup || exercise.muscles?.slice(0, 2).join(', ')}
              {completedCount > 0 && (
                <span className="text-brand ml-2">· {completedCount}/{exercise.sets.length} DONE</span>
              )}
            </p>
          </button>

          <div className="flex items-center">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="text-muted hover:text-[#F0F0F5] p-2 transition-colors"
            >
              {collapsed ? <FiChevronDown className="text-lg md:text-xl" /> : <FiChevronUp className="text-lg md:text-xl" />}
            </button>
            <button onClick={() => onRemove(idx)} className="text-muted hover:text-red-400 p-2">
              <FiTrash2 className="text-lg md:text-xl" />
            </button>
          </div>
        </div>

        {/* Sets */}
        {!collapsed && (
          <div className="p-2 md:p-4 space-y-2">
            {/* Column headers */}
            <div className="grid grid-cols-12 gap-1 md:gap-2 text-[9px] md:text-[10px] font-black text-muted uppercase tracking-widest px-2 mb-1">
              <span className="col-span-1 text-center">#</span>
              <span className="col-span-3">Type</span>
              <span className="col-span-2">Prev</span>
              <span className="col-span-2 text-center">kg</span>
              <span className="col-span-2 text-center">Reps</span>
              <span className="col-span-2 text-center">Done</span>
            </div>

            {exercise.sets.map((set, si) => {
              let prevStr = '—';
              for (const w of pastWorkouts) {
                const found = w.exercises?.find(e => e.name === exercise.name);
                if (found?.sets?.[si]) {
                  const ps = found.sets[si];
                  prevStr = `${ps.weight}×${ps.reps}`;
                  break;
                }
              }

              return (
                <div
                  key={si}
                  className={`grid grid-cols-12 gap-1 md:gap-2 items-center rounded-xl px-1 py-1.5 md:px-2 md:py-2 transition-colors ${set.completed ? 'bg-brand/10' : ''}`}
                >
                  <span className="col-span-1 text-[10px] text-muted font-black text-center">{si + 1}</span>

                  <div className="col-span-3">
                    <SetTypeBadge
                      type={set.type || 'normal'}
                      onChange={(v) => updateSet(si, 'type', v)}
                    />
                  </div>

                  <span className="col-span-2 text-[9px] md:text-[10px] text-muted font-black font-mono truncate">{prevStr}</span>

                  <div className="col-span-2">
                    <input
                      type="number" min="0" step="0.5"
                      className="w-full bg-[#2A2A3A] border border-brand/30 rounded-lg text-center text-sm md:text-base py-2 font-black text-[var(--text-primary)] focus:border-brand/50 outline-none shadow-inner"
                      value={set.weight}
                      onFocus={e => e.target.select()}
                      onChange={e => updateSet(si, 'weight', Number(e.target.value))}
                    />
                  </div>

                  <div className="col-span-2">
                    <input
                      type="number" min="1"
                      className="w-full bg-[#2A2A3A] border border-brand/30 rounded-lg text-center text-sm md:text-base py-2 font-black text-[var(--text-primary)] focus:border-brand/50 outline-none shadow-inner"
                      value={set.reps}
                      onFocus={e => e.target.select()}
                      onChange={e => updateSet(si, 'reps', Number(e.target.value))}
                    />
                  </div>

                  <div className="col-span-2 flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => completeSet(si)}
                      className={`w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center transition-all ${
                        set.completed
                          ? 'bg-brand text-[#0F0F14] shadow-glow-sm scale-105'
                          : 'bg-[#2A2A3A] text-muted hover:bg-[#3A3A4A] border border-[#3A3A4A]'
                      }`}
                    >
                      <FiCheck className="text-sm md:text-base" />
                    </button>
                    {exercise.sets.length > 1 && (
                      <button
                        onClick={() => removeSet(si)}
                        className="w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center text-muted hover:text-red-400 transition-colors bg-white/5 border border-white/5"
                      >
                        <FiX className="text-[10px] md:text-sm" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
              <button onClick={addSet} className="btn-secondary text-[11px] py-3 px-4 flex items-center gap-2 justify-center font-black uppercase tracking-widest h-full">
                <FiPlus className="text-base" /> Add Set
              </button>
              <div className="md:col-span-2">
                <textarea
                  className="w-full bg-[#1A1A26] border border-[#2A2A3A] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] placeholder-muted outline-none focus:border-brand/50 transition-all min-h-[50px] md:min-h-[80px] resize-none"
                  placeholder="Note for this exercise..."
                  value={exercise.notes || ''}
                  onChange={e => onChange({ ...exercise, notes: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {showDetail && (
        <ExerciseDetailModal
          exercise={exercise}
          pastWorkouts={pastWorkouts}
          onClose={() => setShowDetail(false)}
        />
      )}
    </>
  );
};

// ── Main Page ──────────────────────────────────────────────
export default function WorkoutLogger() {
  const { updateUser, activeWorkout: globalActiveWorkout, updateActiveWorkout, refreshGlobalData } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const [view, setView] = useState('start');
  const [workoutId, setWorkoutId] = useState(null);
  const [checking, setChecking] = useState(true);
  const [name, setName] = useState(
    `Workout — ${new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}`
  );
  const [workoutType, setWorkoutType] = useState('custom');
  const [mood, setMood] = useState('good');
  const [notes, setNotes] = useState('');
  const [exercises, setExercises] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pastWorkouts, setPastWorkouts] = useState([]);
  const [elapsed, setElapsed] = useState(0);
  const [rest, setRest] = useState({ active: false, time: 0, startTime: 0 });

  const startTimeRef = useRef(null);
  const autoSaveRef = useRef(null);

  const startTimer = (seconds) => {
    setRest({ active: true, time: seconds, startTime: Date.now() });
  };

  useEffect(() => {
    const init = async () => {
      try {
        if (id) {
          if (location.state?.workout) {
            resumeWorkout(location.state.workout);
          } else {
            const { data } = await workoutAPI.getOne(id);
            if (data.workout && !data.workout.isCompleted) {
              resumeWorkout(data.workout);
            } else {
              toast.error('Workout not found or already completed');
            }
          }
          return;
        }

        if (globalActiveWorkout && !globalActiveWorkout.isCompleted) {
          resumeWorkout(globalActiveWorkout);
        } else {
          const r = await workoutAPI.getAll({ limit: 5 });
          const inProg = r.data.workouts?.find(w => !w.isCompleted);
          if (inProg) {
            resumeWorkout(inProg);
          }
          setPastWorkouts(r.data.workouts?.filter(w => w.isCompleted) || []);
        }
      } catch (err) {
        console.error('Error fetching workouts:', err);
      } finally {
        setChecking(false);
      }
    };
    init();
  }, [id, location.state]);

  useEffect(() => {
    if (view !== 'logging') return;
    const t = setInterval(() => {
      if (startTimeRef.current) {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }
    }, 1000);
    return () => clearInterval(t);
  }, [view]);

  useEffect(() => {
    if (view !== 'logging' || !workoutId) return;
    autoSaveRef.current = setInterval(async () => {
      try {
        const updatedData = { exercises, name, mood, notes, workoutType, isCompleted: false };
        await workoutAPI.update(workoutId, updatedData);
        updateActiveWorkout({ ...updatedData, id: workoutId, startTime: startTimeRef.current });
      } catch {}
    }, 15000);
    return () => clearInterval(autoSaveRef.current);
  }, [view, workoutId, exercises, name, mood, notes, workoutType, updateActiveWorkout]);

  useEffect(() => {
    if (view !== 'logging' || !workoutId || exercises.length === 0) return;
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'You have an active workout. Your workout will be saved.';
      return e.returnValue;
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [view, workoutId, exercises.length]);

  const resumeWorkout = (w) => {
    startTimeRef.current = new Date(w.startTime || w.date).getTime();
    setWorkoutId(w.id);
    setName(w.name);
    setExercises(w.exercises || []);
    setWorkoutType(w.workoutType || 'custom');
    setMood(w.mood || 'good');
    setNotes(w.notes || '');
    setElapsed(Math.floor((Date.now() - new Date(w.startTime || w.date).getTime()) / 1000));
    updateActiveWorkout(w);
    setView('logging');
  };

  const handleStartNew = async () => {
    startTimeRef.current = Date.now();
    try {
      const { data } = await workoutAPI.create({
        name, exercises: [], workoutType, mood,
        startTime: new Date(), isCompleted: false
      });
      setWorkoutId(data.workout.id);
      updateActiveWorkout(data.workout);
      setView('logging');
    } catch {
      toast.error('Failed to start workout');
    }
  };

  const handleResume = () => {
    if (!globalActiveWorkout) return;
    resumeWorkout(globalActiveWorkout);
  };

  const addExercise = (ex) => {
    setExercises(prev => [...prev, {
      exerciseId: ex.id,
      name: ex.name,
      muscleGroup: ex.muscleGroup || '',
      muscles: ex.muscles || [],
      description: ex.description || '',
      restTime: 120,
      youtubeId: ex.youtubeId || null,
      cues: ex.cues || [],
      mistakes: ex.mistakes || [],
      isCustom: ex.isCustom || false,
      notes: '',
      sets: [{ setNumber: 1, weight: 0, reps: 10, type: 'normal', completed: false }]
    }]);
  };

  const handleFinish = async () => {
    if (exercises.length === 0) return toast.error('Add at least one exercise');

    const incompleteSets = exercises.reduce((acc, ex) =>
      acc + ex.sets.filter(s => !s.completed).length, 0);

    let finalExercises = exercises;
    if (incompleteSets > 0) {
      const confirmDiscard = window.confirm(
        `You have ${incompleteSets} incomplete set(s). They will be discarded. Finish anyway?`
      );
      if (!confirmDiscard) return;
      finalExercises = exercises
        .map(ex => ({ ...ex, sets: ex.sets.filter(s => s.completed) }))
        .filter(ex => ex.sets.length > 0);
    }

    if (finalExercises.length === 0) {
      return toast.error('No completed sets to save. Use discard if you want to cancel.');
    }

    setSaving(true);
    clearInterval(autoSaveRef.current);
    const endTime = new Date();
    const duration = Math.max(Math.floor((Date.now() - startTimeRef.current) / 60000), 1);

    try {
      if (workoutId) {
        await workoutAPI.update(workoutId, {
          name, exercises: finalExercises, workoutType, mood, notes,
          duration, endTime, isCompleted: true
        });
      } else {
        await workoutAPI.create({
          name, exercises: finalExercises, workoutType, mood, notes,
          duration, startTime: new Date(startTimeRef.current), endTime, isCompleted: true
        });
      }

      try {
        const userRes = await authAPI.getMe();
        updateUser(userRes.data.user);
        // Refresh global dashboard data silently
        refreshGlobalData(true);
      } catch (err) {
        console.error('Failed to refresh user stats:', err);
      }

      updateActiveWorkout(null);
      toast.success('Workout saved! 💪');
      navigate('/dashboard');
    } catch {
      toast.error('Failed to save workout');
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = async () => {
    if (!window.confirm('Discard and delete this workout?')) return;
    clearInterval(autoSaveRef.current);
    if (workoutId) { try { await workoutAPI.delete(workoutId); } catch {} }
    updateActiveWorkout(null);
    setView('start');
    setExercises([]);
    setWorkoutId(null);
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // ── LOADING ───────────────────────────────────────────────
  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── START SCREEN ──────────────────────────────────────────
  if (view === 'start') {
    return (
      <div className="page-container max-w-md px-4">
        <div className="text-center mb-10 mt-4">
          <GiMuscleUp className="text-brand text-6xl mx-auto mb-4" />
          <h1 className="font-display text-4xl tracking-wider text-[#F0F0F5] mb-2">WORKOUT LOGGER</h1>
          <p className="text-muted text-lg">Track every set. Every rep. Every PR.</p>
        </div>

        {globalActiveWorkout && (
          <div className="card border-brand/30 bg-brand/5 p-4 mb-5 rounded-xl animate-fade-in">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-brand font-medium mb-0.5 flex items-center gap-1">
                  <FiAlertCircle className="text-xs" /> Workout in progress
                </p>
                <p className="font-semibold text-[#F0F0F5] text-lg">{globalActiveWorkout.name}</p>
                <p className="text-xs text-muted mt-0.5">
                  Started {new Date(globalActiveWorkout.startTime || globalActiveWorkout.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  {' · '}{globalActiveWorkout.exercises?.length || 0} exercises
                </p>
              </div>
              <button onClick={handleResume} className="btn-primary text-sm py-2 px-4 flex-shrink-0">
                Resume
              </button>
            </div>
          </div>
        )}

        <button
          onClick={handleStartNew}
          className="btn-primary w-full py-4 text-base flex items-center justify-center gap-3 rounded-xl"
        >
          <FiPlay className="text-xl" /> Start New Workout
        </button>
        <p className="text-center text-xs text-muted mt-4 flex items-center justify-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
          Auto-saves every 15s — resume any time
        </p>
      </div>
    );
  }

  // ── LOGGING SCREEN ────────────────────────────────────────
  const currentMood = MOODS.find(m => m.v === mood) || MOODS[1];

  return (
    <div className="page-container max-w-3xl px-3 md:px-6">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center text-xl shadow-glow-sm">
            {currentMood.e}
          </div>
          <div>
            <h1 className="font-display text-xl md:text-2xl tracking-wider leading-none mb-1">IN PROGRESS</h1>
            <div className="flex items-center gap-2 text-[10px] md:text-xs">
              <span className="text-brand font-black animate-pulse bg-brand/10 px-2 py-0.5 rounded flex items-center gap-1.5">
                <FiZap className="text-[10px]" />
                {formatTime(elapsed)}
              </span>
              {startTimeRef.current && (
                <span className="text-muted font-medium">
                  Started {new Date(startTimeRef.current).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button onClick={handleDiscard} className="flex-1 md:flex-none btn-secondary !text-red-400 !border-red-500/20 hover:!bg-red-500/10 text-[10px] py-2.5 px-4 font-black uppercase tracking-widest">
            Discard
          </button>
          <button onClick={handleFinish} disabled={saving} className="flex-[2] md:flex-none btn-primary flex items-center justify-center gap-2 text-[10px] py-2.5 px-6 shadow-glow-sm font-black uppercase tracking-widest">
            {saving
              ? <span className="w-4 h-4 border-2 border-[#0F0F14] border-t-transparent rounded-full animate-spin" />
              : <FiCheck className="text-sm" />}
            Finish Workout
          </button>
        </div>
      </div>

      {/* Workout Meta */}
      <div className="card p-4 md:p-7 mb-6 md:mb-7 space-y-4 md:space-y-6 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 md:w-1.5 h-full bg-brand group-hover:w-2 transition-all" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted mb-2 block">Workout Session Name</label>
            <input
              className="w-full bg-[#1A1A26] border border-[#2A2A3A] rounded-xl px-4 py-3 text-base md:text-xl font-black tracking-tight outline-none focus:border-brand/50"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted mb-2 block">Session Vibe</label>
            <div className="flex gap-1.5">
              {MOODS.map(m => (
                <button
                  key={m.v}
                  onClick={() => setMood(m.v)}
                  className={`flex-1 py-2 md:py-3 rounded-xl md:rounded-2xl border transition-all text-2xl md:text-3xl flex items-center justify-center ${
                    mood === m.v
                      ? 'border-brand bg-brand/10 shadow-glow-sm'
                      : 'border-[var(--surface-border)] bg-[var(--surface-card)] grayscale opacity-60 hover:grayscale-0 hover:opacity-100'
                  }`}
                  title={m.l}
                >
                  {m.e}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Rest Timer */}
      <LiquidRestTimer
        duration={rest.time}
        isActive={rest.active}
        startTime={rest.startTime}
        onComplete={() => {
          setRest({ active: false, time: 0, startTime: 0 });
          if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
          toast.success('Rest over! Time for the next set.', { icon: '💪', duration: 4000 });
        }}
        onClose={() => setRest({ active: false, time: 0, startTime: 0 })}
      />

      {/* Exercise List */}
      <div className="space-y-3 mb-4">
        {exercises.length === 0 && (
          <div className="card p-8 text-center border-dashed">
            <GiMuscleUp className="text-brand/20 text-5xl mx-auto mb-2" />
            <p className="text-muted text-base">Add your first exercise below</p>
            <p className="text-[10px] text-muted mt-1 uppercase tracking-widest">Tap exercise name to see form guide</p>
          </div>
        )}
        {exercises.map((ex, idx) => (
          <ExerciseCard
            key={`${ex.exerciseId}-${idx}`}
            exercise={ex}
            idx={idx}
            onChange={(u) => setExercises(prev => prev.map((e, i) => i === idx ? u : e))}
            onRemove={(i) => setExercises(prev => prev.filter((_, j) => j !== i))}
            pastWorkouts={pastWorkouts}
            startTimer={startTimer}
          />
        ))}
      </div>

      {/* Add Exercise Button */}
      <button
        onClick={() => setShowPicker(true)}
        className="w-full card p-4 border-dashed border-brand/20 hover:border-brand/40 hover:bg-brand/5 transition-all flex items-center justify-center gap-2 text-muted hover:text-brand"
      >
        <FiPlus className="text-xl" /><span className="font-bold uppercase tracking-widest text-xs">Add Exercise</span>
      </button>

      {/* Notes */}
      <div className="mt-6">
        <label className="text-[10px] font-black uppercase tracking-widest text-muted mb-2 block">Overall Workout Notes (optional)</label>
        <textarea
          className="w-full bg-[#1A1A26] border border-[#2A2A3A] rounded-xl px-4 py-3 text-sm md:text-lg h-24 resize-none outline-none focus:border-brand/50"
          placeholder="PRs hit? How did it feel? Notes for next session..."
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
      </div>

      <p className="text-center text-[10px] text-muted mt-4 flex items-center justify-center gap-1.5 font-bold uppercase tracking-widest">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
        Auto-saving every 15 seconds
      </p>

      {/* Exercise Picker Modal */}
      {showPicker && (
        <ExercisePicker
          onSelect={addExercise}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}
