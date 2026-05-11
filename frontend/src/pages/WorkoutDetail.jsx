import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { workoutAPI, plansAPI } from '../utils/api';
import {
  FiArrowLeft, FiShare2, FiDownload, FiClock, FiZap,FiTrendingUp ,
  FiTrash2, FiEdit2, FiSave, FiX, FiPlus, FiCheck
} from 'react-icons/fi';

import { GiMuscleUp } from 'react-icons/gi';
import toast from 'react-hot-toast';

const WORKOUT_TYPES = ['push','pull','legs','upper','lower','full_body','cardio','custom'];
const MOODS = [{v:'great',e:'🔥'},{v:'good',e:'💪'},{v:'okay',e:'😐'},{v:'bad',e:'😞'}];

const SET_TYPE_INFO = {
  normal:  { label: null,   color: null },
  warmup:  { label: 'W',    color: '#F59E0B' },
  dropset: { label: 'D',    color: '#F97316' },
  failure: { label: 'F',    color: '#EF4444' },
};

// ── Polished Share Card matching reference image ───────────
const ShareCard = ({ workout, themeColor }) => {
  const duration = workout.duration || 0;
  const h = Math.floor(duration / 60), m = duration % 60;
  const durationStr = h > 0 ? `${h}h ${m}m` : `${m}m`;

  const startTime = workout.startTime
    ? new Date(workout.startTime).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', hour12:true })
    : null;

  const totalReps = (workout.exercises || []).reduce((acc, ex) =>
    acc + (ex.sets || []).filter(s => s.completed).reduce((a, s) => a + (s.reps || 0), 0), 0);

  const moodEmoji = MOODS.find(m => m.v === workout.mood)?.e || '💪';

  return (
    <div id="share-card" style={{
      width: '360px',
      background: 'rgba(12,12,20,0.88)',
      borderRadius: '20px',
      border: `1px solid ${themeColor}33`,
      overflow: 'hidden',
      fontFamily: "'DM Sans', system-ui, sans-serif",
      color: '#F0F0F5',
      position: 'relative',
    }}>
      {/* Top accent line */}
      <div style={{ height: 3, background: `linear-gradient(90deg, ${themeColor}, #0066FF)` }} />

      {/* Header */}
      <div style={{ padding: '18px 20px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 6 }}>
          <div style={{ display:'flex', alignItems:'center', gap: 6 }}>
            <span style={{ fontSize: 14, color: themeColor }}>💪</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: themeColor, letterSpacing: 2 }}>YGB</span>
          </div>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
            {new Date(workout.date).toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
          </span>
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, lineHeight: 1.2 }}>{workout.name}</h2>
        {startTime && (
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '4px 0 0' }}>{startTime}</p>
        )}
      </div>

      {/* Stats grid — exactly like reference */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap: 1, background: 'rgba(255,255,255,0.04)', margin: 0 }}>
        {[
          { label: 'Duration', value: durationStr, icon: '⏱' },
          { label: 'Volume', value: `${(workout.totalVolume||0) >= 1000 ? ((workout.totalVolume||0)/1000).toFixed(1)+'T' : (workout.totalVolume||0)+'KG'}`, icon: '⚡' },
          { label: 'Sets', value: workout.totalSets || 0, icon: null },
          { label: 'Reps', value: totalReps || 0, icon: null },
        ].map((s, i) => (
          <div key={i} style={{
            background: 'rgba(0,0,0,0.3)',
            padding: '12px 8px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: themeColor }}>
              {s.icon && <span style={{ marginRight: 3, fontSize: 12 }}>{s.icon}</span>}
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Type / Mood / Time row */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap: 1, background: 'rgba(255,255,255,0.04)' }}>
        {[
          { label: 'Type', value: (workout.workoutType || 'Custom').replace('_',' ').toUpperCase() },
          { label: 'Mood', value: moodEmoji },
          { label: 'Time', value: startTime || '—' },
        ].map((s, i) => (
          <div key={i} style={{
            background: 'rgba(0,0,0,0.2)',
            padding: '12px 8px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#F0F0F5' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Exercises — like reference image */}
      <div style={{ padding: '16px 20px' }}>
        <div style={{ display:'flex', alignItems:'center', gap: 8, marginBottom: 14 }}>
          <span style={{ fontSize: 16 }}>🏋️</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#F0F0F5', letterSpacing: '0.5px' }}>
            Exercises ({workout.exercises?.length || 0})
          </span>
        </div>

        {(workout.exercises || []).map((ex, ei) => {
          const doneSets = (ex.sets || []).filter(s => s.completed);
          return (
            <div key={ei} style={{
              background: 'rgba(255,255,255,0.04)',
              borderRadius: 12,
              overflow: 'hidden',
              marginBottom: 10,
              border: '1px solid rgba(255,255,255,0.08)'
            }}>
              {/* Exercise header */}
              <div style={{
                display:'flex', alignItems:'center', justifyBetween:'space-between',
                padding: '10px 14px',
                background: `${themeColor}12`,
                borderBottom: doneSets.length > 0 ? '1px solid rgba(255,255,255,0.08)' : 'none'
              }}>
                <span style={{ fontSize: 15, fontWeight: 700 }}>{ex.name}</span>
                <span style={{
                  fontSize: 12, fontWeight: 800,
                  background: `${themeColor}33`,
                  color: themeColor,
                  padding: '3px 10px', borderRadius: 99
                }}>
                  {doneSets.length}/{(ex.sets||[]).length}
                </span>
              </div>

              {/* Sets — exactly like reference */}
              {doneSets.map((set, si) => {
                const typeInfo = SET_TYPE_INFO[set.type || 'normal'];
                return (
                  <div key={si} style={{
                    display:'flex', alignItems:'center', justifyContent:'space-between',
                    padding: '8px 14px',
                    background: si % 2 === 0 ? `${themeColor}0D` : 'transparent',
                    borderBottom: si < doneSets.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none'
                  }}>
                    <div style={{ display:'flex', alignItems:'center', gap: 12 }}>
                      {typeInfo.label
                        ? <span style={{ fontSize: 12, fontWeight: 800, color: typeInfo.color, minWidth: 16 }}>{typeInfo.label}</span>
                        : <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', minWidth: 16 }}>{si + 1}</span>
                      }
                      <span style={{ fontSize: 16, color: '#E0E0E8', fontWeight: 600 }}>
                        {set.weight > 0 ? `${set.weight}kg` : 'BW'} × {set.reps} reps
                      </span>
                    </div>
                    <span style={{ fontSize: 16, color: themeColor, fontWeight: 800 }}>✓</span>
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* Notes */}
        {workout.notes && (
          <div style={{
            marginTop: 8, padding: '10px 12px',
            background: `${themeColor}0D`,
            border: `1px solid ${themeColor}26`,
            borderRadius: 10
          }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 3 }}>Notes</div>
            <div style={{ fontSize: 12, color: '#C0C0D0', fontStyle:'italic' }}>{workout.notes}</div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '10px 16px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        textAlign:'center',
        fontSize: 10,
        color: 'rgba(255,255,255,0.2)'
      }}>
        ygb.app · Your Gym Buddy
      </div>
    </div>
  );
};

// ── Edit Exercise Card ─────────────────────────────────────
const EditExerciseCard = ({ exercise, idx, onChange, onRemove }) => {
  const updateSet = (si, field, val) => {
    const sets = [...exercise.sets];
    sets[si] = { ...sets[si], [field]: val };
    onChange({ ...exercise, sets });
  };

  const addSet = () => {
    const prev = exercise.sets[exercise.sets.length - 1] || {};
    onChange({
      ...exercise,
      sets: [...exercise.sets, {
        setNumber: exercise.sets.length + 1,
        weight: prev.weight || 0,
        reps: prev.reps || 10,
        type: 'normal',
        completed: true
      }]
    });
  };

  const removeSet = (si) => {
    if (exercise.sets.length <= 1) return;
    onChange({ ...exercise, sets: exercise.sets.filter((_, i) => i !== si).map((s,i) => ({...s, setNumber:i+1})) });
  };

  return (
    <div className="card rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 p-3 bg-[#1E1E2A]">
        <div className="w-7 h-7 rounded-lg bg-brand/10 flex items-center justify-center text-xs font-bold text-brand flex-shrink-0">
          {idx + 1}
        </div>
        <p className="flex-1 font-semibold text-[#F0F0F5] text-lg truncate">{exercise.name}</p>
        <button onClick={() => onRemove(idx)} className="text-muted hover:text-red-400 p-1">
          <FiTrash2 className="text-xs" />
        </button>
      </div>
      <div className="p-3 space-y-1.5">
        <div className="grid grid-cols-12 gap-1 text-base text-muted px-1 mb-1">
          <span className="col-span-1">#</span>
          <span className="col-span-4 text-center">kg</span>
          <span className="col-span-4 text-center">Reps</span>
          <span className="col-span-2 text-center">Done</span>
          <span className="col-span-1" />
        </div>
        {exercise.sets.map((set, si) => (
          <div key={si} className="grid grid-cols-12 gap-1 items-center">
            <span className="col-span-1 text-base text-muted text-center">{si + 1}</span>
            <div className="col-span-4">
              <input type="number" min="0" step="2.5"
                className="input-field text-center text-lg py-1.5 px-1 w-full"
                value={set.weight}
                onFocus={e => e.target.select()}
                onChange={e => updateSet(si, 'weight', Number(e.target.value))} />
            </div>
            <div className="col-span-4">
              <input type="number" min="1"
                className="input-field text-center text-lg py-1.5 px-1 w-full"
                value={set.reps}
                onFocus={e => e.target.select()}
                onChange={e => updateSet(si, 'reps', Number(e.target.value))} />
            </div>
            <div className="col-span-2 flex justify-center">
              <button onClick={() => updateSet(si, 'completed', !set.completed)}
                className={`w-6 h-6 rounded flex items-center justify-center transition-all ${
                  set.completed ? 'bg-brand text-[#0F0F14]' : 'bg-[#2A2A3A] text-muted'
                }`}>
                <FiCheck className="text-[10px]" />
              </button>
            </div>
            <div className="col-span-1 flex justify-center">
              {exercise.sets.length > 1 && (
                <button onClick={() => removeSet(si)} className="text-muted hover:text-red-400">
                  <FiX className="text-xs" />
                </button>
              )}
            </div>
          </div>
        ))}
        <button onClick={addSet} className="btn-secondary text-xs py-1 mt-1 flex items-center gap-1">
          <FiPlus className="text-xs" /> Add Set
        </button>
      </div>
    </div>
  );
};

// ── Add Exercise mini-picker ───────────────────────────────
const QuickExercisePicker = ({ onSelect, onClose }) => {
  const [exercises, setExercises] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    plansAPI.getExercises().then(r => setExercises(r.data.exercises || [])).finally(() => setLoading(false));
  }, []);

  const filtered = exercises.filter(e => e.name.toLowerCase().includes(search.toLowerCase())).slice(0, 20);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-[#16161E] border border-[#2A2A3A] rounded-2xl w-full max-w-md flex flex-col" style={{maxHeight:'70vh'}}>
        <div className="flex items-center justify-between p-4 border-b border-[#2A2A3A] flex-shrink-0">
          <h3 className="font-semibold text-[#F0F0F5]">Add Exercise</h3>
          <button onClick={onClose} className="text-muted"><FiX /></button>
        </div>
        <div className="px-4 pt-3 pb-2 flex-shrink-0">
          <input className="input-field text-lg" placeholder="Search..." autoFocus
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1 min-h-0">
          {loading ? (
            <div className="text-center py-6"><div className="w-5 h-5 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto" /></div>
          ) : filtered.map(ex => (
            <button key={ex.id} onClick={() => { onSelect(ex); onClose(); }}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#1E1E2A] transition-colors text-left">
              <GiMuscleUp className="text-brand text-lg flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-lg font-medium text-[#F0F0F5] truncate">{ex.name}</p>
                <p className="text-xs text-muted">{ex.muscleGroup}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Main Page ──────────────────────────────────────────────
export default function WorkoutDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { themeColor } = useTheme();
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showExPicker, setShowExPicker] = useState(false);

  // Edit state
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState('custom');
  const [editMood, setEditMood] = useState('good');
  const [editNotes, setEditNotes] = useState('');
  const [editExercises, setEditExercises] = useState([]);
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');

  useEffect(() => {
    workoutAPI.getOne(id)
      .then(r => {
        const w = r.data.workout;
        setWorkout(w);
        // Populate edit state
        setEditName(w.name || '');
        setEditType(w.workoutType || 'custom');
        setEditMood(w.mood || 'good');
        setEditNotes(w.notes || '');
        setEditExercises(JSON.parse(JSON.stringify(w.exercises || [])));
        setEditStartTime(w.startTime ? new Date(w.startTime).toISOString().slice(0,16) : '');
        setEditEndTime(w.endTime ? new Date(w.endTime).toISOString().slice(0,16) : '');
      })
      .catch(() => toast.error('Workout not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name: editName,
        workoutType: editType,
        mood: editMood,
        notes: editNotes,
        exercises: editExercises,
        startTime: editStartTime ? new Date(editStartTime) : undefined,
        endTime: editEndTime ? new Date(editEndTime) : undefined,
      };
      // Recalculate duration from times
      if (editStartTime && editEndTime) {
        const start = new Date(editStartTime), end = new Date(editEndTime);
        payload.duration = Math.max(Math.round((end - start) / 60000), 1);
      }
      const { data } = await workoutAPI.update(id, payload);
      setWorkout(data.workout);
      setEditing(false);
      toast.success('Workout updated!');
    } catch { toast.error('Failed to save changes'); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this workout permanently?')) return;
    try {
      await workoutAPI.delete(id);
      toast.success('Deleted');
      navigate('/workout/history');
    } catch { toast.error('Failed to delete'); }
  };

  const addExerciseToEdit = (ex) => {
    setEditExercises(prev => [...prev, {
      exerciseId: ex.id,
      name: ex.name,
      muscleGroup: ex.muscleGroup || '',
      muscles: ex.muscles || [],
      sets: [{ setNumber:1, weight:0, reps:10, type:'normal', completed:true }]
    }]);
  };

  const handleDownload = () => {
    if (window.html2canvas) {
      downloadCanvas();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    script.onload = downloadCanvas;
    document.head.appendChild(script);
  };

  const downloadCanvas = async () => {
    const el = document.getElementById('share-card');
    if (!el) return;
    try {
      const canvas = await window.html2canvas(el, {
        backgroundColor: null, scale: 2.5, useCORS: true,
        logging: false, allowTaint: true
      });
      const link = document.createElement('a');
      link.download = `${workout?.name || 'workout'}-YGB.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('Downloaded! Share on Instagram Stories 🔥');
    } catch (err) {
      console.error('Download error:', err);
      toast.error('Download failed. Try screenshot instead.');
    }
  };

  if (loading) return (
    <div className="page-container flex items-center justify-center min-h-64">
      <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!workout) return (
    <div className="page-container text-center py-16 text-muted">Workout not found</div>
  );

  const duration = workout.duration || 0;
  const h = Math.floor(duration / 60), m = duration % 60;
  const totalReps = (workout.exercises || []).reduce((acc, ex) =>
    acc + (ex.sets || []).filter(s => s.completed).reduce((a, s) => a + (s.reps || 0), 0), 0);

  return (
    <div className="page-container max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 gap-2">
        <button onClick={() => navigate(-1)} className="btn-secondary p-2.5 flex-shrink-0">
          <FiArrowLeft />
        </button>
        <div className="flex gap-2">
          {editing ? (
            <>
              <button onClick={() => setEditing(false)} className="btn-secondary text-lg py-2 px-3 flex items-center gap-1">
                <FiX className="text-xs" /> Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="btn-primary text-lg flex items-center gap-1.5">
                {saving ? <span className="w-3.5 h-3.5 border-2 border-[#0F0F14] border-t-transparent rounded-full animate-spin" /> : <FiSave className="text-xs" />}
                Save
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setShowShare(true)} className="btn-secondary flex items-center gap-1.5 text-lg">
                <FiShare2 className="text-xs" /> Share
              </button>
              <button onClick={() => setEditing(true)} className="btn-secondary flex items-center gap-1.5 text-lg">
                <FiEdit2 className="text-xs" /> Edit
              </button>
              <button onClick={handleDelete} className="btn-danger p-2.5">
                <FiTrash2 className="text-lg" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── VIEW MODE ── */}
      {!editing && (
        <>
          <div className="card p-5 mb-4">
            <h1 className="text-2xl font-bold text-[#F0F0F5] mb-1">{workout.name}</h1>
            <p className="text-lg text-muted mb-4">
              {new Date(workout.date).toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
              {workout.startTime && (
                <span className="ml-2">
                  · {new Date(workout.startTime).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })}
                  {workout.endTime && ` → ${new Date(workout.endTime).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })}`}
                </span>
              )}
            </p>

            {/* Stats — 4 boxes like reference image */}
            <div className="grid grid-cols-4 gap-2 text-center mb-3">
              {[
                { label:'Duration', value: h > 0 ? `${h}h ${m}m` : `${m}m`, icon:<FiClock className="text-brand text-xs mb-1 mx-auto" /> },
                { label:'Volume',   value: `${(workout.totalVolume||0).toLocaleString()}KG`, icon:<FiZap className="text-brand text-xs mb-1 mx-auto" /> },
                { label:'Sets',     value: workout.totalSets || 0, icon: null },
                { label:'Reps',     value: totalReps, icon: null },
              ].map(s => (
                <div key={s.label} className="card-elevated rounded-xl py-3">
                  {s.icon}
                  <p className="font-bold text-[#F0F0F5] text-base">{s.value}</p>
                  <p className="text-[10px] text-muted">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Type / Mood / Time */}
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label:'Type', value: (workout.workoutType||'custom').replace('_',' ').toUpperCase() },
                { label:'Mood', value: MOODS.find(m=>m.v===workout.mood)?.e || '💪' },
                { label:'Time', value: workout.startTime ? new Date(workout.startTime).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',hour12:true}) : '—' },
              ].map(s => (
                <div key={s.label} className="card-elevated rounded-xl py-2.5">
                  <p className="font-semibold text-[#F0F0F5] text-lg">{s.value}</p>
                  <p className="text-[10px] text-muted">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Exercises */}
          <div className="mb-2">
            <div className="flex items-center gap-2 mb-3">
              <GiMuscleUp className="text-brand" />
              <h2 className="section-title">Exercises ({workout.exercises?.length || 0})</h2>
            </div>
            <div className="space-y-3">
              {workout.exercises?.map((ex, ei) => {
                const doneSets = ex.sets?.filter(s => s.completed) || [];
                const best = doneSets.length ? Math.max(...doneSets.map(s => s.weight)) : 0;
                const vol = doneSets.reduce((a, s) => a + s.weight * s.reps, 0);
                const est1RM = best > 0
                  ? Math.round(best * (1 + (doneSets.find(s=>s.weight===best)?.reps||0)/30))
                  : 0;

                return (
                  <div key={ei} className="card rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 bg-[#1E1E2A]">
                      <div>
                        <p className="font-semibold text-[#F0F0F5] text-lg">{ex.name}</p>
                        <p className="text-xs text-muted">{ex.muscles?.join(', ') || ex.muscleGroup}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted">{doneSets.length}/{ex.sets?.length} sets</span>
                        {est1RM > 0 && <span className="badge-brand text-xs">1RM ~{est1RM}kg</span>}
                      </div>
                    </div>

                    <div className="px-4 pb-3">
                      {/* Column headers */}
                      <div className="grid grid-cols-12 gap-1 text-[10px] text-muted px-1 pt-3 pb-1">
                        <span className="col-span-1">#</span>
                        <span className="col-span-5">Weight × Reps</span>
                        <span className="col-span-3 text-right">Vol</span>
                        <span className="col-span-3 text-right">1RM</span>
                      </div>
                      {ex.sets?.map((set, si) => {
                        const info = SET_TYPE_INFO[set.type||'normal'];
                        const setVol = set.weight * set.reps;
                        const setRM = set.reps > 0 && set.weight > 0 ? Math.round(set.weight*(1+set.reps/30)) : 0;
                        return (
                          <div key={si} className={`grid grid-cols-12 gap-1 items-center px-1 py-2 rounded-lg text-lg ${
                            set.completed ? (si%2===0?'bg-brand/5':'') : 'opacity-35'
                          }`}>
                            <div className="col-span-1">
                              {info.label
                                ? <span className="text-xs font-bold" style={{color:info.color}}>{info.label}</span>
                                : <span className="text-xs text-muted">{si+1}</span>}
                            </div>
                            <div className="col-span-5 font-medium text-[#F0F0F5]">
                              {set.weight > 0 ? `${set.weight}kg × ${set.reps}` : `BW × ${set.reps}`}
                            </div>
                            <div className="col-span-3 text-right text-xs text-muted">
                              {set.completed && setVol > 0 ? setVol : '—'}
                            </div>
                            <div className="col-span-3 text-right text-xs text-muted">
                              {set.completed && setRM > 0 ? setRM : '—'}
                            </div>
                          </div>
                        );
                      })}

                      {doneSets.length > 0 && (
                        <div className="flex gap-3 pt-2 mt-1 border-t border-[#2A2A3A] text-xs text-muted">
                          <span>Best: <strong className="text-brand">{best}kg</strong></span>
                          <span>Vol: <strong className="text-[#F0F0F5]">{vol.toLocaleString()}kg</strong></span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {workout.notes && (
            <div className="card p-4 mt-3 border-brand/20 bg-brand/5">
              <p className="text-xs text-muted mb-1">Notes</p>
              <p className="text-lg text-[#F0F0F5] italic">"{workout.notes}"</p>
            </div>
          )}
        </>
      )}

      {/* ── EDIT MODE ── */}
      {editing && (
        <div className="space-y-4 animate-fade-in">
          <div className="card p-4 space-y-3">
            <h3 className="section-title">Edit Workout</h3>
            <div>
              <label className="label text-xs">Workout Name</label>
              <input className="input-field text-lg" value={editName} onChange={e => setEditName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label text-xs">Start Time</label>
                <input type="datetime-local" className="input-field text-lg"
                  value={editStartTime} onChange={e => setEditStartTime(e.target.value)} />
              </div>
              <div>
                <label className="label text-xs">End Time</label>
                <input type="datetime-local" className="input-field text-lg"
                  value={editEndTime} onChange={e => setEditEndTime(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label text-xs">Type</label>
                <select className="input-field text-lg" value={editType} onChange={e => setEditType(e.target.value)}>
                  {WORKOUT_TYPES.map(t => (
                    <option key={t} value={t}>{t.replace('_',' ').replace(/\b\w/g,c=>c.toUpperCase())}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label text-xs">Mood</label>
                <div className="flex gap-1">
                  {MOODS.map(m => (
                    <button key={m.v} onClick={() => setEditMood(m.v)}
                      className={`flex-1 py-2 rounded-lg text-center text-base transition-all ${editMood===m.v?'bg-brand/15 border border-brand/30':'bg-[#1E1E2A]'}`}>
                      {m.e}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label className="label text-xs">Notes</label>
              <textarea className="input-field text-lg h-16 resize-none"
                value={editNotes} onChange={e => setEditNotes(e.target.value)} />
            </div>
          </div>

          {/* Edit exercises */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="section-title">Exercises</h3>
              <button onClick={() => setShowExPicker(true)}
                className="btn-secondary text-xs py-1.5 flex items-center gap-1">
                <FiPlus /> Add Exercise
              </button>
            </div>
            <div className="space-y-3">
              {editExercises.map((ex, idx) => (
                <EditExerciseCard
                  key={idx}
                  exercise={ex}
                  idx={idx}
                  onChange={(u) => setEditExercises(prev => prev.map((e,i) => i===idx ? u : e))}
                  onRemove={(i) => setEditExercises(prev => prev.filter((_,j) => j!==i))}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShare && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#16161E] border border-[#2A2A3A] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-[#2A2A3A]">
              <h3 className="font-semibold text-[#F0F0F5]">Share Activity</h3>
              <button onClick={() => setShowShare(false)} className="text-muted text-xl">×</button>
            </div>
            <div className="p-5">
              {/* Card preview on dark bg like Strava */}
              <div className="rounded-xl overflow-hidden mb-5 flex justify-center"
                style={{ background: 'linear-gradient(135deg, #0a0a12 0%, #0d1a2e 100%)', padding: 24 }}>
                <ShareCard workout={workout} themeColor={themeColor} />
              </div>

              <div className="flex gap-3">
                <button onClick={handleDownload}
                  className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <FiDownload /> Save Image
                </button>
                <button onClick={() => setShowShare(false)} className="btn-secondary px-4">
                  Close
                </button>
              </div>

              <div className="mt-3 p-3 card-elevated rounded-xl">
                <p className="text-xs text-muted text-center leading-relaxed">
                  🔲 Transparent background · Perfect for Instagram Stories &amp; WhatsApp Status<br/>
                  <span className="text-muted/60">Save → Add to Story → Set background in Instagram</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showExPicker && (
        <QuickExercisePicker
          onSelect={addExerciseToEdit}
          onClose={() => setShowExPicker(false)}
        />
      )}
    </div>
  );
}
