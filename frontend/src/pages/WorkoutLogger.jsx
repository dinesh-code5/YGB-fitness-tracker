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
import { useAuth } from "../context/AuthContext"; // adjust path
const WORKOUT_TYPES = ['push','pull','legs','upper','lower','full_body','cardio','custom'];
const MOODS = [
  { v:'great',e:'🔥',l:'Great' },
  { v:'good', e:'💪',l:'Good'  },
  { v:'okay', e:'😐',l:'Okay'  },
  { v:'bad',  e:'😞',l:'Bad'   }
];

const SET_TYPES = [
  { v:'normal',   l:'Normal',   color:'text-[#F0F0F5]',     bg:'bg-[#2A2A3A]' },
  { v:'warmup',   l:'Warm-up',  color:'text-yellow-400',    bg:'bg-yellow-500/15' },
  { v:'dropset',  l:'Drop Set', color:'text-orange-400',    bg:'bg-orange-500/15' },
  { v:'failure',  l:'Failure',  color:'text-red-400',       bg:'bg-red-500/15' },
];

// ── Audio Alarm ────────────────────────────────────────────
function playAlarm() {
  try {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.play().catch(() => console.log('Audio blocked'));
  } catch (err) {
    console.error('Alarm error:', err);
  }
}

// ── Exercise Detail + History Modal ────────────────────────
const ExerciseDetailModal = ({ exercise: initialEx, pastWorkouts, onClose }) => {
  const [exercise, setExercise] = useState(initialEx);
  const [loading, setLoading] = useState(!initialEx.description);

  useEffect(() => {
    if (!initialEx.description || !initialEx.youtubeId) {
      const fetchDetails = async () => {
        try {
          const id = initialEx.exerciseId || initialEx.id || initialEx._id;
          const { data } = await plansAPI.getExercise(id);
          setExercise(prev => ({ ...prev, ...data.exercise }));
        } catch (err) {
          console.error('Failed to fetch exercise details', err);
        } finally {
          setLoading(false);
        }
      };
      fetchDetails();
    }
  }, [initialEx]);

  // Find all past instances of this exercise across workouts
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

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-[#16161E] border border-[#2A2A3A] rounded-2xl w-full max-w-lg max-h-[88vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#16161E] border-b border-[#2A2A3A] p-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-[#F0F0F5]">{exercise.name}</h3>
            <p className="text-xs text-muted">{exercise.muscleGroup || exercise.muscles?.join(', ')}</p>
          </div>
          <button onClick={onClose} className="text-muted hover:text-[#F0F0F5] text-2xl leading-none">×</button>
        </div>

        <div className="p-5 space-y-5">
          {loading ? (
            <div className="py-10 text-center">
              <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-muted">Loading guide...</p>
            </div>
          ) : (
            <>
              {/* Muscles */}
              <div className="flex flex-wrap gap-1.5">
                {exercise.muscles?.map(m => <span key={m} className="tag">{m}</span>)}
              </div>

              {/* Description */}
              {exercise.description && (
                <p className="text-sm text-muted leading-relaxed">{exercise.description}</p>
              )}

              {/* YouTube */}
              {exercise.youtubeId && (
                <div>
                  <p className="text-sm font-semibold text-[#F0F0F5] mb-2">📺 How to do it</p>
                  <div className="rounded-xl overflow-hidden bg-[#0F0F14]" style={{ aspectRatio: '16/9' }}>
                    <iframe
                      src={`https://www.youtube.com/embed/${exercise.youtubeId}`}
                      className="w-full h-full" title={exercise.name} allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </div>
                </div>
              )}

              {/* Cues */}
              {exercise.cues?.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-[#F0F0F5] mb-2">✅ Key Cues</p>
                  <ul className="space-y-1.5">
                    {exercise.cues.map((c, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted">
                        <span className="text-brand flex-shrink-0 mt-0.5">→</span>{c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Mistakes */}
              {exercise.mistakes?.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-[#F0F0F5] mb-2">⚠️ Common Mistakes</p>
                  <ul className="space-y-1.5">
                    {exercise.mistakes.map((m, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted">
                        <span className="text-red-400 flex-shrink-0 mt-0.5">✗</span>{m}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          {/* Past history */}
          {history.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-[#F0F0F5] mb-3">📊 History in past workouts</p>
              <div className="space-y-3">
                {history.slice(0, 5).map((h, i) => (
                  <div key={i} className="card-elevated rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-[#F0F0F5]">{h.workoutName}</p>
                      <p className="text-xs text-muted">
                        {new Date(h.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="space-y-1">
                      {h.sets.filter(s => s.completed).map((s, si) => (
                        <div key={si} className="flex items-center justify-between text-xs">
                          <span className="text-muted">Set {s.setNumber}
                            {s.type && s.type !== 'normal' && (
                              <span className={`ml-1 px-1 rounded text-[10px] ${SET_TYPES.find(t => t.v === s.type)?.bg || ''
                                } ${SET_TYPES.find(t => t.v === s.type)?.color || ''}`}>
                                {SET_TYPES.find(t => t.v === s.type)?.l}
                              </span>
                            )}
                          </span>
                          <span className="font-mono font-bold text-brand">{s.weight} kg × {s.reps}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
      

// ── Custom Exercise Modal ──────────────────────────────────
const CustomExerciseModal = ({ muscleGroups, onAdd, onClose }) => {
  const [form, setForm] = useState({ name:'', muscleGroup:'', description:'' });
  const set = (k,v) => setForm(p=>({...p,[k]:v}));
  const handleAdd = () => {
    if (!form.name.trim()) return toast.error('Exercise name is required');
    if (!form.muscleGroup) return toast.error('Target muscle group is required');
    onAdd({
      id: `custom_${Date.now()}`,
      name: form.name.trim(),
      muscleGroup: form.muscleGroup,
      muscles: [form.muscleGroup],
      description: form.description.trim(),
      isCustom: true, cues:[], mistakes:[], youtubeId:null
    });
    onClose();
  };
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center p-4">
      <div className="bg-[#16161E] border border-[#2A2A3A] rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-[#2A2A3A]">
          <h3 className="font-semibold text-[#F0F0F5]">Create Custom Exercise</h3>
          <button onClick={onClose} className="text-muted text-xl leading-none">×</button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="label">Name <span className="text-red-400">*</span></label>
            <input className="input-field text-sm" placeholder="e.g. Cable Lateral Raise"
              value={form.name} onChange={e => set('name', e.target.value)} autoFocus />
          </div>
          <div>
            <label className="label">Target Muscle Group <span className="text-red-400">*</span></label>
            <select className="input-field text-sm" value={form.muscleGroup}
              onChange={e => set('muscleGroup', e.target.value)}>
              <option value="">Select muscle group...</option>
              {muscleGroups.map(mg => <option key={mg} value={mg}>{mg}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Description <span className="text-xs text-muted">(optional)</span></label>
            <textarea className="input-field text-sm h-20 resize-none"
              placeholder="How to perform this exercise..."
              value={form.description} onChange={e => set('description', e.target.value)} />
          </div>
          <button onClick={handleAdd} className="btn-primary w-full">Add to Workout</button>
        </div>
      </div>
    </div>
  );
};

// ── Exercise Picker ────────────────────────────────────────
const MG_COLOR = {
  Chest:'bg-red-500/10 text-red-400', Back:'bg-blue-500/10 text-blue-400',
  Shoulders:'bg-purple-500/10 text-purple-400', Biceps:'bg-green-500/10 text-green-400',
  Triceps:'bg-orange-500/10 text-orange-400', Forearms:'bg-yellow-500/10 text-yellow-400',
  Abs:'bg-cyan-500/10 text-cyan-400', Quads:'bg-pink-500/10 text-pink-400',
  Hamstrings:'bg-amber-500/10 text-amber-400', Glutes:'bg-rose-500/10 text-rose-400',
  Calves:'bg-teal-500/10 text-teal-400', Cardio:'bg-brand/10 text-brand',
  'Full Body':'bg-[#2A2A3A] text-muted'
};

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
      }).finally(() => setLoading(false));
  }, []);

  const filtered = exercises.filter(e =>
    (selectedMG === 'All' || e.muscleGroup === selectedMG) &&
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-4">
        <div className="bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-3xl w-full max-w-md flex flex-col shadow-2xl animate-slide-up" style={{maxHeight:'90vh'}}>
          <div className="flex items-center justify-between p-5 border-b border-[var(--surface-border)] flex-shrink-0">
            <h3 className="font-display text-xl tracking-wider text-[var(--text-primary)]">ADD EXERCISE</h3>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowCustom(true)}
                className="btn-secondary text-[10px] py-1.5 px-3 flex items-center gap-1 uppercase font-black">
                <FiPlus/> Custom
              </button>
              <button onClick={onClose} className="text-muted hover:text-[var(--text-primary)] p-1"><FiX className="text-xl"/></button>
            </div>
          </div>

          <div className="px-4 pt-3 pb-2 flex-shrink-0">
            <input className="input-field text-sm" placeholder="Search exercises..."
              value={search} onChange={e => setSearch(e.target.value)} autoFocus/>
          </div>

          <div className="flex gap-1.5 overflow-x-auto px-4 pb-2 flex-shrink-0" style={{scrollbarWidth:'none'}}>
            {muscleGroups.map(mg => (
              <button key={mg} onClick={() => setSelectedMG(mg)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                  selectedMG === mg
                    ? 'bg-brand text-[#0F0F14] border-brand'
                    : 'border-[#2A2A3A] text-muted hover:border-brand/40'
                }`}>{mg}</button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1.5 min-h-0">
            {loading ? (
              <div className="text-center py-10">
                <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto"/>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-10 text-muted text-sm">No exercises found</div>
            ) : filtered.map(ex => (
              <button key={ex.id} onClick={() => { onSelect(ex); onClose(); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#1E1E2A] transition-colors text-left border border-transparent hover:border-[#2A2A3A]">
                <div className="w-9 h-9 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0">
                  <GiMuscleUp className="text-brand text-sm"/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#F0F0F5] truncate">{ex.name}</p>
                  <p className="text-xs text-muted truncate">{ex.muscles?.join(', ')}</p>
                </div>
                <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-md font-medium ${MG_COLOR[ex.muscleGroup] || 'bg-[#2A2A3A] text-muted'}`}>
                  {ex.muscleGroup}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
      {showCustom && (
        <CustomExerciseModal
          muscleGroups={muscleGroups.filter(m => m !== 'All')}
          onAdd={(ex) => { onSelect(ex); onClose(); }}
          onClose={() => setShowCustom(false)}
        />
      )}
    </>
  );
};

// ── Set Type Selector ──────────────────────────────────────
const SetTypeBadge = ({ type, onChange }) => {
  const [open, setOpen] = useState(false);
  const current = SET_TYPES.find(t => t.v === type) || SET_TYPES[0];
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className={`text-[10px] px-1.5 py-0.5 rounded font-medium whitespace-nowrap ${current.bg} ${current.color}`}>
        {current.l} ▾
      </button>
      {open && (
        <div className="absolute bottom-full mb-1 left-0 bg-[#1E1E2A] border border-[#2A2A3A] rounded-xl shadow-card z-10 overflow-hidden w-28">
          {SET_TYPES.map(t => (
            <button key={t.v}
              onClick={() => { onChange(t.v); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-xs transition-colors hover:bg-[#2A2A3A] ${t.color} ${type === t.v ? 'font-semibold' : ''}`}>
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
      sets: exercise.sets.filter((_,i) => i !== si).map((s,i) => ({...s, setNumber: i+1}))
    });
  };

  const completeSet = (si) => {
    const nowDone = !exercise.sets[si].completed;
    updateSet(si, 'completed', nowDone);
    if (nowDone) {
      startTimer(exercise.restTime || 120);
    }
  };

  const completedCount = exercise.sets.filter(s => s.completed).length;

  return (
    <>
      <div className="card rounded-xl overflow-hidden border-[#2A2A3A] hover:border-[#3A3A4A] transition-all">
        <div className="flex items-center gap-3 p-4 bg-[#1E1E2A]">
          <button
            onClick={() => setShowDetail(true)}
            className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0 hover:bg-brand/25 transition-colors">
            <GiMuscleUp className="text-brand text-sm"/>
          </button>
          <button onClick={() => setShowDetail(true)} className="flex-1 min-w-0 text-left">
            <p className="font-semibold text-[#F0F0F5] text-sm truncate hover:text-brand transition-colors">
              {exercise.name}
            </p>
            <p className="text-[10px] text-muted font-medium uppercase tracking-wider">
              {exercise.muscleGroup || exercise.muscles?.slice(0,2).join(', ')}
              {completedCount > 0 && <span className="text-brand ml-2">· {completedCount}/{exercise.sets.length} SETS DONE</span>}
            </p>
          </button>
          <button onClick={() => setCollapsed(!collapsed)} className="text-muted hover:text-[#F0F0F5] p-1 transition-transform" style={{ transform: collapsed ? 'rotate(0deg)' : 'rotate(0deg)' }}>
            {collapsed ? <FiChevronDown/> : <FiChevronUp/>}
          </button>
          <button onClick={() => onRemove(idx)} className="text-muted hover:text-red-400 p-1">
            <FiTrash2 className="text-sm"/>
          </button>
        </div>

        {!collapsed && (
          <div className="p-4 space-y-2">
            {/* Header row */}
            <div className="grid grid-cols-12 gap-1 text-[10px] font-bold text-muted uppercase tracking-tighter px-1 mb-1">
              <span className="col-span-1 text-center">#</span>
              <span className="col-span-3">Type</span>
              <span className="col-span-2">Prev</span>
              <span className="col-span-2 text-center">kg</span>
              <span className="col-span-2 text-center">Reps</span>
              <span className="col-span-2 text-center">Done</span>
            </div>

            {exercise.sets.map((set, si) => {
              // Find prev set from past workouts
              let prevStr = '—';
              for (const w of pastWorkouts) {
                const found = w.exercises?.find(e => e.name === exercise.name);
                if (found?.sets?.[si]) {
                  const ps = found.sets[si];
                  prevStr = `${ps.weight}×${ps.reps}`;
                  break;
                }
              }
              const setType = SET_TYPES.find(t => t.v === (set.type || 'normal')) || SET_TYPES[0];

              return (
                <div key={si} className={`grid grid-cols-12 gap-1 items-center rounded-lg px-1 py-1.5 transition-colors ${set.completed ? 'bg-brand/10' : ''}`}>
                  <span className="col-span-1 text-xs text-muted font-mono text-center">{si+1}</span>
                  <div className="col-span-3">
                    <SetTypeBadge
                      type={set.type || 'normal'}
                      onChange={(v) => updateSet(si, 'type', v)}
                    />
                  </div>
                  <span className="col-span-2 text-[10px] text-muted font-mono truncate">{prevStr}</span>
                  <div className="col-span-2">
                    <input
                      type="number" min="0" step="0.5"
                      className="input-field text-center text-sm py-1.5 px-0.5 w-full font-bold"
                      value={set.weight}
                      onFocus={e => e.target.select()}
                      onChange={e => updateSet(si, 'weight', Number(e.target.value))}
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number" min="1"
                      className="input-field text-center text-sm py-1.5 px-0.5 w-full font-bold"
                      value={set.reps}
                      onFocus={e => e.target.select()}
                      onChange={e => updateSet(si, 'reps', Number(e.target.value))}
                    />
                  </div>
                  <div className="col-span-2 flex items-center justify-center gap-1">
                    <button onClick={() => completeSet(si)}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                        set.completed ? 'bg-brand text-[#0F0F14] shadow-glow-sm scale-105' : 'bg-[#2A2A3A] text-muted hover:bg-[#3A3A4A]'
                      }`}>
                      <FiCheck className="text-xs"/>
                    </button>
                    {exercise.sets.length > 1 && (
                      <button onClick={() => removeSet(si)}
                        className="w-5 h-5 rounded flex items-center justify-center text-muted hover:text-red-400 transition-colors">
                        <FiX className="text-[10px]"/>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            <div className="flex items-center gap-2 mt-2">
              <button onClick={addSet} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1 flex-1 justify-center">
                <FiPlus/> Add Set
              </button>
              <div className="relative flex-[2]">
                <input
                  className="input-field text-xs py-1.5 pl-3"
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
  const { updateUser, activeWorkout: globalActiveWorkout, updateActiveWorkout } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [view, setView] = useState('start');
  const [workoutId, setWorkoutId] = useState(null);
  const [checking, setChecking] = useState(true);

  const [name, setName] = useState(
    `Workout — ${new Date().toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short' })}`
  );
  const [workoutType, setWorkoutType] = useState('custom');
  const [mood, setMood] = useState('good');
  const [notes, setNotes] = useState('');
  const [exercises, setExercises] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const [showExModal, setShowExModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [pastWorkouts, setPastWorkouts] = useState([]);
  const [elapsed, setElapsed] = useState(0);

  // Centralized Timer State
  const [rest, setRest] = useState({ active: false, time: 0, startTime: 0 });

  const startTimeRef = useRef(null);
  const autoSaveRef = useRef(null);

  const startTimer = (seconds) => {
    setRest({ active: true, time: seconds, startTime: Date.now() });
  };

  useEffect(() => {
    const init = async () => {
      try {
        // If ID in URL, try to load that specific workout
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

        // Check if there's a global active workout first
        if (globalActiveWorkout && !globalActiveWorkout.isCompleted) {
          resumeWorkout(globalActiveWorkout);
        } else {
          // Fallback to backend check
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
        const updatedData = { 
          exercises, 
          name, 
          mood, 
          notes, 
          workoutType,
          isCompleted: false 
        };
        await workoutAPI.update(workoutId, updatedData);
        // Sync with global state
        updateActiveWorkout({ ...updatedData, id: workoutId, startTime: startTimeRef.current });
      } catch {}
    }, 15000);
    return () => clearInterval(autoSaveRef.current);
  }, [view, workoutId, exercises, name, mood, notes, workoutType, updateActiveWorkout]);

  // Prevent accidental navigation while workout is in progress
  useEffect(() => {
    if (view !== 'logging' || !workoutId || exercises.length === 0) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'You have an active workout. Your workout will be saved.';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
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
        name, exercises:[], workoutType, mood,
        startTime: new Date(), isCompleted: false
      });
      setWorkoutId(data.workout.id);
      updateActiveWorkout(data.workout);
      setView('logging');
    } catch (err) {
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
      sets: [{ setNumber:1, weight:0, reps:10, type:'normal', completed:false }]
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
      
      // Discard incomplete sets and then discard exercises with no sets left
      finalExercises = exercises
        .map(ex => ({
          ...ex,
          sets: ex.sets.filter(s => s.completed)
        }))
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
      
      // Refresh user profile to get new streak
      try {
        const userRes = await authAPI.getMe();
        updateUser(userRes.data.user);
      } catch (err) {
        console.error('Failed to refresh user stats:', err);
      }
      
      updateActiveWorkout(null);
      toast.success('Workout saved! 💪');
      navigate('/dashboard');
    } catch { toast.error('Failed to save workout'); }
    finally { setSaving(false); }
  };

  const handleDiscard = async () => {
    if (!window.confirm('Discard and delete this workout?')) return;
    clearInterval(autoSaveRef.current);
    if (workoutId) { try { await workoutAPI.delete(workoutId); } catch {} }
    updateActiveWorkout(null);
    setView('start'); setExercises([]); setWorkoutId(null);
  };

  const totalVolume = exercises.reduce((acc, ex) =>
    acc + ex.sets.filter(s => s.completed).reduce((a, s) => a + s.weight * s.reps, 0), 0);
  const completedSets = exercises.reduce((acc, ex) =>
    acc + ex.sets.filter(s => s.completed).length, 0);

  // ── START SCREEN ──────────────────────────────────────────
  if (view === 'start' && !checking) {
    return (
      <div className="page-container max-w-md">
        <div className="text-center mb-10 mt-4">
          <GiMuscleUp className="text-brand text-6xl mx-auto mb-4"/>
          <h1 className="font-display text-4xl tracking-wider text-[#F0F0F5] mb-2">WORKOUT LOGGER</h1>
          <p className="text-muted text-sm">Track every set. Every rep. Every PR.</p>
        </div>

        {globalActiveWorkout && (
          <div className="card border-brand/30 bg-brand/5 p-4 mb-5 rounded-xl animate-fade-in">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-brand font-medium mb-0.5 flex items-center gap-1">
                  <FiAlertCircle className="text-xs"/> Workout in progress
                </p>
                <p className="font-semibold text-[#F0F0F5] text-sm">{globalActiveWorkout.name}</p>
                <p className="text-xs text-muted mt-0.5">
                  Started {new Date(globalActiveWorkout.startTime || globalActiveWorkout.date).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })}
                  {' · '}{globalActiveWorkout.exercises?.length || 0} exercises
                </p>
              </div>
              <button onClick={handleResume} className="btn-primary text-sm py-2 px-4 flex-shrink-0">
                Resume
              </button>
            </div>
          </div>
        )}

        <button onClick={handleStartNew}
          className="btn-primary w-full py-4 text-base flex items-center justify-center gap-3 rounded-xl">
          <FiPlay className="text-xl"/> Start New Workout
        </button>
        <p className="text-center text-xs text-muted mt-4 flex items-center justify-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"/>
          Auto-saves every 15s — resume any time
        </p>
      </div>
    );
  }

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── LOGGING SCREEN ────────────────────────────────────────
  const currentMood = MOODS.find(m => m.v === mood) || MOODS[1];

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="page-container max-w-2xl">
      <div className="flex items-start justify-between mb-8 gap-3">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-3xl shadow-glow-sm">
            {currentMood.e}
          </div>
          <div>
            <h1 className="font-display text-3xl tracking-wider leading-none">IN PROGRESS</h1>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              {startTimeRef.current && (
                <span className="text-xs text-muted flex items-center gap-1 font-bold">
                  <FiClock className="text-xs text-brand"/>
                  {new Date(startTimeRef.current).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })}
                </span>
              )}
              <span className="text-xs text-brand font-black animate-pulse bg-brand/10 px-2 py-0.5 rounded flex items-center gap-1">
                <FiZap className="text-[10px]"/>
                STARTED: {formatTime(elapsed)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={handleDiscard} className="btn-secondary !text-red-400 !border-red-500/20 hover:!bg-red-500/10 text-xs py-2 px-3">Discard</button>
          <button onClick={handleFinish} disabled={saving}
            className="btn-primary flex items-center gap-2 text-sm shadow-glow-sm">
            {saving
              ? <span className="w-4 h-4 border-2 border-[#0F0F14] border-t-transparent rounded-full animate-spin"/>
              : <FiCheck/>}
            Finish
          </button>
        </div>
      </div>

      {/* Workout meta */}
      <div className="card p-5 mb-6 space-y-4 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-brand group-hover:w-1.5 transition-all" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label text-[10px]">Workout Session Name</label>
            <input className="input-field text-sm font-black tracking-tight"
              value={name} onChange={e => setName(e.target.value)}/>
          </div>
          <div>
            <label className="label text-[10px]">Current Vibe / Mood</label>
            <div className="flex gap-1.5">
              {MOODS.map(m => (
                <button
                  key={m.v}
                  onClick={() => setMood(m.v)}
                  className={`flex-1 py-2.5 rounded-xl border transition-all text-xl flex items-center justify-center ${
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

      {/* Centralized Rest Timer */}
      <LiquidRestTimer 
        duration={rest.time} 
        isActive={rest.active}
        startTime={rest.startTime}
        onComplete={() => {
          setRest({ active: false, time: 0, startTime: 0 });
          if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        }}
        onClose={() => setRest({ active: false, time: 0, startTime: 0 })}
      />

      {/* Exercise list */}
      <div className="space-y-3 mb-4">
        {exercises.length === 0 && (
          <div className="card p-8 text-center border-dashed">
            <GiMuscleUp className="text-brand/20 text-5xl mx-auto mb-2"/>
            <p className="text-muted text-sm">Add your first exercise below</p>
            <p className="text-xs text-muted mt-1">Tap the exercise name or icon to see how to do it + past records</p>
          </div>
        )}
        {exercises.map((ex, idx) => (
          <ExerciseCard
            key={`${ex.exerciseId}-${idx}`}
            exercise={ex}
            idx={idx}
            onChange={(u) => setExercises(prev => prev.map((e,i) => i === idx ? u : e))}
            onRemove={(i) => setExercises(prev => prev.filter((_,j) => j !== i))}
            pastWorkouts={pastWorkouts}
            startTimer={startTimer}
          />
        ))}
      </div>

      <button onClick={() => setShowPicker(true)}
        className="w-full card p-4 border-dashed hover:border-brand/40 hover:bg-brand/5 transition-all flex items-center justify-center gap-2 text-muted hover:text-brand">
        <FiPlus className="text-xl"/><span className="font-medium">Add Exercise</span>
      </button>

      <div className="mt-4">
        <label className="label text-xs">Notes (optional)</label>
        <textarea className="input-field text-sm h-20 resize-none"
          placeholder="PRs hit? How did it feel? Notes for next session..."
          value={notes} onChange={e => setNotes(e.target.value)}/>
      </div>

      <p className="text-center text-xs text-muted mt-3 flex items-center justify-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block"/>
        Auto-saving every 30 seconds
      </p>

      {showPicker && <ExercisePicker onSelect={addExercise} onClose={() => setShowPicker(false)}/>}
    </div>
  );
}
