import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { plansAPI, templatesAPI, workoutAPI } from '../utils/api';
import {
  FiChevronDown,
  FiChevronUp,
  FiPlus,
  FiPlay,
  FiTrash2,
  FiCheck ,
  FiEdit2,
  FiSave,
  FiX,
  FiSearch,
  FiClock,
} from 'react-icons/fi';
import { GiMuscleUp } from 'react-icons/gi';
import toast from 'react-hot-toast';

const TYPE_BADGE = {
  push: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  pull: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  legs: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  upper: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  lower: 'bg-green-500/10 text-green-400 border-green-500/20',
  full_body: 'bg-brand/10 text-brand border-brand/20',
  cardio: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  custom: 'bg-[#2A2A3A] text-muted border-[#3A3A4A]',
};

const DIFF_BADGE = {
  beginner: 'bg-green-500/10 text-green-400',
  intermediate: 'bg-yellow-500/10 text-yellow-400',
  advanced: 'bg-red-500/10 text-red-400',
};

const GOAL_LABEL = {
  cut: '🔥 Cut',
  bulk: '💪 Bulk',
  maintain: '⚖️ Maintain',
  general: '⭐ General',
};

const ExerciseGuide = ({ ex, onClose }) => (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center p-4">
    <div className="bg-[#16161E] border border-[#2A2A3A] rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
      <div className="sticky top-0 bg-[#16161E] border-b border-[#2A2A3A] p-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-[#F0F0F5]">{ex.name}</h3>
          <p className="text-xs text-muted">
            {ex.muscleGroup} · {ex.defaultSets} sets × {ex.defaultReps}
          </p>
        </div>
        <button onClick={onClose} className="text-muted text-2xl leading-none">
          ×
        </button>
      </div>

      <div className="p-5 space-y-4">
        <div className="flex flex-wrap gap-1.5">
          {ex.muscles?.map((m) => (
            <span key={m} className="tag">
              {m}
            </span>
          ))}
        </div>

        {ex.description && <p className="text-lg text-muted">{ex.description}</p>}

        {ex.youtubeId && (
          <div className="rounded-xl overflow-hidden bg-[#0F0F14]" style={{ aspectRatio: '16/9' }}>
            <iframe
              src={`https://www.youtube.com/embed/${ex.youtubeId}`}
              className="w-full h-full"
              title={ex.name}
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        )}

        {ex.cues?.length > 0 && (
          <div>
            <p className="text-lg font-semibold text-[#F0F0F5] mb-2">✅ Key Cues</p>
            <ul className="space-y-1.5">
              {ex.cues.map((c, i) => (
                <li key={i} className="flex gap-2 text-lg text-muted">
                  <span className="text-brand">→</span>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}

        {ex.mistakes?.length > 0 && (
          <div>
            <p className="text-lg font-semibold text-[#F0F0F5] mb-2">⚠️ Common Mistakes</p>
            <ul className="space-y-1.5">
              {ex.mistakes.map((m, i) => (
                <li key={i} className="flex gap-2 text-lg text-muted">
                  <span className="text-red-400">✗</span>
                  {m}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  </div>
);

const TemplateCard = ({ template, isSystem, onUse, onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const [selectedEx, setSelectedEx] = useState(null);

  const showGuide = async (ex) => {
    // If we already have full details (description, etc.), use it
    if (ex.description) {
      setSelectedEx(ex);
    } else {
      // Fetch full details
      try {
        const id = ex.exerciseId || ex.id || ex._id;
        const res = await plansAPI.getExercise(id);
        setSelectedEx(res.data.exercise);
      } catch (err) {
        toast.error('Failed to load exercise guide');
      }
    }
  };

  return (
    <>
      <div className="card overflow-hidden hover:border-brand/20 transition-all">
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <span className={`badge border text-xs ${TYPE_BADGE[template.workoutType] || TYPE_BADGE.custom}`}>
                  {(template.workoutType || 'custom').replace('_', ' ')}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DIFF_BADGE[template.difficulty] || DIFF_BADGE.intermediate}`}>
                  {template.difficulty || 'intermediate'}
                </span>
                {template.goal && template.goal !== 'general' && (
                  <span className="text-xs text-muted">{GOAL_LABEL[template.goal]}</span>
                )}
              </div>

              <h3 className="font-black text-[#F0F0F5] text-xl leading-tight uppercase tracking-tight">{template.name}</h3>

              {template.description && (
                <p className="text-xs text-muted mt-1 leading-relaxed">{template.description}</p>
              )}

              <div className="flex items-center gap-3 mt-2 text-xs text-muted flex-wrap">
                <span className="flex items-center gap-1">
                  <FiClock className="text-xs" />
                  {template.estimatedDuration || 60}m
                </span>
                <span>
                  <GiMuscleUp className="inline text-xs mr-1" />
                  {template.exercises?.length || 0} exercises
                </span>
                {template.targetMuscles?.length > 0 && <span>{template.targetMuscles.join(', ')}</span>}
              </div>
            </div>

            <div className="flex flex-col gap-1.5 flex-shrink-0">
              <button
                onClick={() => onUse(template)}
                className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
              >
                <FiPlay className="text-xs" />
                Use
              </button>

              {!isSystem && (
                <div className="flex gap-1">
                  <button
                    onClick={() => onEdit(template)}
                    className="btn-secondary text-xs py-1.5 px-2"
                  >
                    <FiEdit2 className="text-xs" />
                  </button>
                  <button
                    onClick={() => onDelete(template.id || template._id)}
                    className="btn-danger text-xs py-1.5 px-2"
                  >
                    <FiTrash2 className="text-xs" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-muted hover:text-brand transition-colors mt-2"
          >
            {expanded ? <FiChevronUp className="text-xs" /> : <FiChevronDown className="text-xs" />}
            {expanded ? 'Hide exercises' : 'View exercises'}
          </button>
        </div>

        {expanded && (
          <div className="border-t border-[#2A2A3A] p-3 space-y-1.5">
            <p className="text-xs text-muted mb-2">Tap an exercise to see how to do it</p>
            {template.exercises?.map((ex, i) => (
              <button
                key={i}
                onClick={() => showGuide(ex)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl card-elevated hover:border-brand/30 hover:bg-brand/5 transition-all text-left group"
              >
                <div className="w-7 h-7 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-brand">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-medium text-[#F0F0F5] group-hover:text-brand transition-colors truncate">
                    {ex.name}
                  </p>
                  <p className="text-xs text-muted">
                    {ex.defaultSets || ex.sets} sets × {ex.defaultReps || ex.reps}
                  </p>
                </div>
                <span className="text-xs text-muted">{ex.muscleGroup}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedEx && <ExerciseGuide ex={selectedEx} onClose={() => setSelectedEx(null)} />}
    </>
  );
};

const TemplateEditor = ({ template, exercises, onSave, onClose }) => {
  const [name, setName] = useState(template?.name || '');
  const [description, setDescription] = useState(template?.description || '');
  const [workoutType, setWorkoutType] = useState(template?.workoutType || 'custom');
  const [difficulty, setDifficulty] = useState(template?.difficulty || 'intermediate');
  const [goal, setGoal] = useState(template?.goal || 'general');
  const [duration, setDuration] = useState(template?.estimatedDuration || 60);
  const [selectedExercises, setSelectedExercises] = useState(
    template?.exercises?.map((e) => ({
      ...e,
      defaultSets: e.defaultSets || 3,
      defaultReps: e.defaultReps || '10-12',
      restTime: e.restTime || 120,
    })) || []
  );
  const [exSearch, setExSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [guideEx, setGuideEx] = useState(null);

  const WORKOUT_TYPES = ['push', 'pull', 'legs', 'upper', 'lower', 'full_body', 'cardio', 'custom'];

  const filteredEx = exercises
    .filter((e) => e.name.toLowerCase().includes(exSearch.toLowerCase()))
    .slice(0, 15);

  const showGuide = async (e, ex) => {
    e.stopPropagation();
    if (ex.description) {
      setGuideEx(ex);
    } else {
      try {
        const id = ex.exerciseId || ex.id || ex._id;
        const res = await plansAPI.getExercise(id);
        setGuideEx(res.data.exercise);
      } catch (err) {
        toast.error('Failed to load exercise guide');
      }
    }
  };

  const isSelected = (id) => selectedExercises.some((e) => e.exerciseId === id || e.exerciseId === `ex_${id}`);

  const toggleEx = (ex) => {
    if (isSelected(ex.id)) {
      setSelectedExercises((prev) => prev.filter((e) => e.exerciseId !== ex.id));
    } else {
      setSelectedExercises((prev) => [
        ...prev,
        {
          exerciseId: ex.id,
          name: ex.name,
          muscleGroup: ex.muscleGroup,
          muscles: ex.muscles || [],
          defaultSets: 3,
          defaultReps: '10-12',
          restTime: 120,
        },
      ]);
    }
  };

  const updateEx = (i, field, val) => {
    setSelectedExercises((prev) => prev.map((e, idx) => (idx === i ? { ...e, [field]: val } : e)));
  };

  const handleSave = async () => {
    if (!name.trim()) return toast.error('Template name is required');
    if (selectedExercises.length === 0) return toast.error('Add at least one exercise');

    setSaving(true);
    try {
      await onSave({
        name,
        description,
        workoutType,
        difficulty,
        goal,
        estimatedDuration: Number(duration),
        exercises: selectedExercises,
        targetMuscles: [...new Set(selectedExercises.map((e) => e.muscleGroup).filter(Boolean))],
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex justify-center p-4 overflow-y-auto pt-20 md:pt-12">
      <div className="bg-[#16161E] border border-[#2A2A3A] rounded-3xl w-full max-w-xl flex flex-col shadow-2xl h-fit mb-20">
        <div className="flex items-center justify-between p-7 border-b border-[#2A2A3A] flex-shrink-0">
          <h3 className="text-xl font-black tracking-tight text-[#F0F0F5] uppercase tracking-widest">Template Editor</h3>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#1E1E2A] transition-colors text-muted text-2xl">
            <FiX />
          </button>
        </div>

        <div className="p-7 space-y-7">
          <div>
            <label className="text-xs font-black text-brand uppercase tracking-[0.2em] mb-2.5 block">Template Name</label>
            <input
              className="input-field h-14 text-xl font-black"
              placeholder="e.g. MONSTER PUSH DAY"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-black text-brand uppercase tracking-[0.2em] mb-2.5 block">
              Description <span className="text-[10px] font-medium normal-case opacity-40 italic ml-2">(How do we crush this?)</span>
            </label>
            <textarea
              className="input-field text-lg h-24 pt-3.5 resize-none font-medium"
              placeholder="Primary focus, intensity techniques, etc..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-black text-brand uppercase tracking-[0.2em] mb-2.5 block">Focus Type</label>
              <div className="relative">
                <select 
                  className="input-field h-14 text-lg bg-[#1E1E2A] text-white cursor-pointer appearance-none font-black uppercase tracking-widest w-full px-5" 
                  value={workoutType} 
                  onChange={(e) => setWorkoutType(e.target.value)}
                >
                  {WORKOUT_TYPES.map((t) => (
                    <option key={t} value={t} className="bg-[#16161E] text-white py-3 text-base">
                      {t.replace('_', ' ').toUpperCase()}
                    </option>
                  ))}
                </select>
                <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-brand text-xl pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-xs font-black text-brand uppercase tracking-[0.2em] mb-2.5 block">Est. Time (min)</label>
              <input
                type="number"
                className="input-field text-xl h-14 font-black text-center"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-black text-brand uppercase tracking-[0.2em] mb-3 block">Select Exercises</label>
            <div className="relative mb-3.5">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-brand text-lg" />
              <input
                className="input-field pl-11 text-lg h-12 border-brand/20 focus:border-brand/50 font-medium"
                placeholder="Search the arsenal..."
                value={exSearch}
                onChange={(e) => setExSearch(e.target.value)}
              />
            </div>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
              {filteredEx.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => toggleEx(ex)}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-left transition-all border-2 ${
                    isSelected(ex.id) ? 'border-brand bg-brand/10 shadow-glow-sm' : 'border-[#2A2A3A] hover:bg-[#1E1E2A]'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${isSelected(ex.id) ? 'bg-brand' : 'bg-[#2A2A3A]'}`}>
                    {isSelected(ex.id) && <FiCheck className="text-[#0A0A0F] text-xs font-black" />}
                  </div>
                  <div className="flex-1 min-w-0" onClick={(e) => showGuide(e, ex)}>
                    <p className="text-lg font-black text-[#F0F0F5] truncate uppercase tracking-tight">{ex.name}</p>
                    <p className="text-[10px] text-brand font-black uppercase tracking-widest opacity-60">{ex.muscleGroup}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selectedExercises.length > 0 && (
            <div className="pt-6 border-t border-[#2A2A3A]">
              <label className="text-xs font-black text-brand uppercase tracking-[0.2em] mb-5 block">Workout Flow ({selectedExercises.length})</label>
              <div className="space-y-3.5">
                {selectedExercises.map((ex, i) => (
                  <div key={i} className="bg-[var(--surface-elevated)] border-2 border-[#2A2A3A] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1 min-w-0 flex items-center gap-3 cursor-help" onClick={(e) => showGuide(e, ex)}>
                      <div className="w-1.5 h-1.5 rounded-full bg-brand shadow-glow-sm" />
                      <p className="text-lg font-black text-[#F0F0F5] truncate uppercase tracking-tight">{ex.name}</p>
                    </div>
                    <div className="flex items-center gap-4 justify-end">
                      <div className="flex flex-col items-center">
                        <span className="text-[9px] font-black text-muted uppercase tracking-widest mb-1">Sets</span>
                        <input
                          type="number" min="1" max="10"
                          className="w-14 h-10 bg-[#1E1E2A] border-2 border-[#2A2A3A] rounded-lg text-base text-center font-black text-brand focus:border-brand/50 outline-none"
                          value={ex.defaultSets}
                          onChange={(e) => updateEx(i, 'defaultSets', Number(e.target.value))}
                        />
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-[9px] font-black text-muted uppercase tracking-widest mb-1">Reps</span>
                        <input
                          className="w-18 h-10 bg-[#1E1E2A] border-2 border-[#2A2A3A] rounded-lg text-base text-center font-black text-brand focus:border-brand/50 outline-none"
                          value={ex.defaultReps}
                          onChange={(e) => updateEx(i, 'defaultReps', e.target.value)}
                        />
                      </div>
                      <button
                        onClick={() => setSelectedExercises((prev) => prev.filter((_, j) => j !== i))}
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-muted hover:text-red-400 hover:bg-red-400/10 transition-all border border-transparent hover:border-red-400/20"
                      >
                        <FiTrash2 className="text-lg" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-7 border-t border-[#2A2A3A] flex-shrink-0 bg-[#16161E] rounded-b-3xl">
          <button onClick={handleSave} disabled={saving} className="btn-primary w-full h-14 text-lg font-black uppercase tracking-[0.15em] flex items-center justify-center gap-4 shadow-glow">
            {saving ? <div className="w-5 h-5 border-4 border-[#0F0F14] border-t-transparent rounded-full animate-spin" /> : <FiSave className="text-xl" />}
            {template ? 'Update Plan' : 'Establish Plan'}
          </button>
        </div>
      </div>
      {guideEx && <ExerciseGuide ex={guideEx} onClose={() => setGuideEx(null)} />}
    </div>
  );
};

const DayCard = ({ day, onUse }) => {
  const [open, setOpen] = useState(false);
  const [selectedEx, setSelectedEx] = useState(null);

  const showGuide = async (ex) => {
    if (ex.description && ex.youtubeId) {
      setSelectedEx(ex);
    } else {
      try {
        const id = ex.exerciseId || ex.id || ex._id;
        const res = await plansAPI.getExercise(id);
        setSelectedEx(res.data.exercise);
      } catch (err) {
        toast.error('Failed to load exercise guide');
      }
    }
  };

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-[#1E1E2A] transition-colors text-left"
      >
        <div className="flex items-center gap-3 flex-1">
          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex-shrink-0 ${TYPE_BADGE[day.type] || TYPE_BADGE.custom}`}>
            {day.day}
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-black text-xl text-[#F0F0F5] tracking-tight">{day.name}</p>
            <p className="text-xs text-muted">{day.exercises?.length} exercises · tap to expand</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {onUse && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUse(day);
              }}
              className="btn-primary text-xs py-1.5 px-2.5 flex items-center gap-1"
            >
              <FiPlay className="text-xs" />
              Use
            </button>
          )}
          {open ? <FiChevronUp className="text-muted" /> : <FiChevronDown className="text-muted" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-[#2A2A3A] p-4 space-y-2">
          <p className="text-xs text-muted mb-3">Tap an exercise to see how to do it</p>
          {day.exercises?.map((ex, i) => (
            <button
              key={i}
              onClick={() => showGuide(ex)}
              className="w-full flex items-center gap-3 card-elevated px-4 py-3 rounded-xl hover:border-brand/30 hover:bg-brand/5 transition-all text-left group"
            >
              <div className="w-9 h-9 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0 group-hover:bg-brand/20 transition-colors">
                <GiMuscleUp className="text-brand text-lg" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-lg font-medium text-[#F0F0F5] group-hover:text-brand transition-colors">{ex.name}</p>
                <p className="text-xs text-muted">
                  {ex.sets && `${ex.sets} sets`}
                  {ex.reps && ` × ${ex.reps} reps`}
                  {ex.rest && ` · ${ex.rest} rest`}
                </p>
              </div>
              <span className="text-xs text-muted group-hover:text-brand transition-colors">→</span>
            </button>
          ))}
        </div>
      )}

      {selectedEx && <ExerciseGuide ex={selectedEx} onClose={() => setSelectedEx(null)} />}
    </div>
  );
};

export default function WorkoutPlan() {
  const navigate = useNavigate();
  const [systemTemplates, setSystemTemplates] = useState([]);
  const [userTemplates, setUserTemplates] = useState([]);
  const [plan, setPlan] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('recommendations');
  const [filterType, setFilterType] = useState('all');
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  useEffect(() => {
    Promise.all([
      plansAPI.getWorkoutPlan(),
      plansAPI.getExercises(),
      templatesAPI.getAll(),
    ])
      .then(([pRes, exRes, tRes]) => {
        setPlan(pRes.data.plan);
        setSystemTemplates(pRes.data.templates || []);
        setExercises(exRes.data.exercises || []);
        setUserTemplates(tRes.data.userTemplates || []);
      })
      .catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  const handleUseTemplate = async (template) => {
    try {
      const workoutData = {
        name: template.name,
        exercises: template.exercises?.map(ex => {
          const numSets = parseInt(ex.defaultSets) || 3;
          return {
            exerciseId: ex.exerciseId || ex.id,
            name: ex.name,
            muscleGroup: ex.muscleGroup || 'general',
            sets: Array.from({ length: numSets }, (_, i) => ({
              setNumber: i + 1,
              weight: 0,
              reps: parseInt(ex.defaultReps || ex.reps) || 10,
              type: 'normal',
              completed: false
            })),
            workoutType: template.workoutType || 'custom',
            restTime: ex.restTime || 120,
          };
        }) || [],
        workoutType: template.workoutType || 'custom',
        duration: 0,
        mood: 'good',
        startTime: new Date(),
        isCompleted: false,
      };

      const { data } = await workoutAPI.create(workoutData);
      toast.success(`Starting "${template.name}" 💪`);
      navigate(`/workout/log/${data.workout.id}`, { state: { workout: data.workout, template } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start workout');
    }
  };

  const handleUsePPLPlan = async (day) => {
    try {
      const workoutData = {
        name: day.name,
        exercises: day.exercises?.map(ex => {
          const numSets = parseInt(ex.sets) || 3;
          return {
            exerciseId: ex.exerciseId,
            name: ex.name,
            muscleGroup: ex.muscleGroup || 'general',
            sets: Array.from({ length: numSets }, (_, i) => ({
              setNumber: i + 1,
              weight: 0,
              reps: parseInt(ex.reps) || 10,
              type: 'normal',
              completed: false
            })),
            workoutType: day.type || 'custom',
            restTime: 120,
          };
        }) || [],
        workoutType: day.type || 'custom',
        duration: 0,
        mood: 'good',
        startTime: new Date(),
        isCompleted: false,
      };
      
      const { data } = await workoutAPI.create(workoutData);
      toast.success(`Starting "${day.name}" 💪`);
      navigate(`/workout/log/${data.workout.id}`, { state: { workout: data.workout, isPPL: true } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start workout from plan');
    }
  };

  const handleSaveTemplate = async (data) => {
    try {
      if (editingTemplate) {
        const { data: res } = await templatesAPI.update(editingTemplate._id, data);
        setUserTemplates((prev) => prev.map((t) => (t._id === editingTemplate._id ? res.template : t)));
        toast.success('Template updated!');
      } else {
        const { data: res } = await templatesAPI.create(data);
        setUserTemplates((prev) => [res.template, ...prev]);
        toast.success('Template created!');
      }
      setShowEditor(false);
      setEditingTemplate(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
      throw err;
    }
  };

  const handleDeleteTemplate = async (id) => {
    if (!window.confirm('Delete this template?')) return;
    try {
      await templatesAPI.delete(id);
      setUserTemplates((prev) => prev.filter((t) => t._id !== id));
      toast.success('Template deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const FILTER_TYPES = ['all', 'push', 'pull', 'legs', 'upper', 'lower', 'full_body', 'cardio', 'custom'];

  const filteredSystem =
    filterType === 'all' ? systemTemplates : systemTemplates.filter((t) => t.workoutType === filterType);

  return (
    <div className="page-container max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-black uppercase tracking-tight">My Plan</h1>
        <button
          onClick={() => {
            setEditingTemplate(null);
            setShowEditor(true);
          }}
          className="btn-primary flex items-center gap-2 text-lg"
        >
          <FiPlus />
          Create Template
        </button>
      </div>

      <div className="flex gap-2 mb-5">
        {[
          { id: 'recommendations', label: 'YGB Recommendations' },
          { id: 'mine', label: `My Templates (${userTemplates?.length || 0})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 rounded-xl text-base font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id 
                ? 'bg-brand text-white shadow-glow-sm' 
                : 'bg-[#1E1E2A] text-[var(--text-secondary)] hover:text-white border border-transparent hover:border-white/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-muted text-lg">Loading templates...</p>
        </div>
      ) : (
        <div className="relative min-h-[400px]">
          {activeTab === 'recommendations' ? (
            <div className="space-y-6 animate-fade-in">
              {/* Featured PPL Split */}
              {plan ? (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1.5 h-6 bg-brand rounded-full" />
                    <h2 className="text-xl font-black uppercase tracking-widest text-brand">Recommended Split</h2>
                  </div>
                  
                  <div className="card p-6 mb-4 bg-gradient-to-br from-brand/10 to-transparent border-brand/20">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-black text-brand uppercase tracking-tight">{plan.split}</h2>
                        <p className="text-muted text-sm font-black uppercase tracking-widest mt-1 opacity-60">
                          {plan.frequency}× per week · Progressive overload
                        </p>
                      </div>
                      <div className="w-14 h-14 rounded-2xl bg-brand/10 border-2 border-brand/20 flex items-center justify-center">
                        <GiMuscleUp className="text-brand text-3xl" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    {plan.schedule?.map((day, i) => (
                      <DayCard key={i} day={day} onUse={handleUsePPLPlan} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-muted italic">No personalized split available.</div>
              )}

              {/* Other Pre-built templates */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-6 bg-[var(--surface-border)] rounded-full" />
                  <h2 className="text-xl font-black uppercase tracking-widest text-muted">Library Templates</h2>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar">
                  {FILTER_TYPES.map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilterType(f)}
                      className={`flex-shrink-0 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-all border-2 ${
                        filterType === f ? 'bg-brand text-[#b4b4c0] border-brand' : 'border-[#2A2A3A] text-muted'
                      }`}
                    >
                      {f.replace('_', ' ')}
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  {filteredSystem.length === 0 ? (
                    <div className="card p-10 text-center text-muted text-lg font-medium">No templates found in this category.</div>
                  ) : (
                    filteredSystem.map((t) => (
                      <TemplateCard
                        key={t.id || t._id}
                        template={t}
                        isSystem
                        onUse={handleUseTemplate}
                        onEdit={(tmpl) => {
                          setEditingTemplate(tmpl);
                          setShowEditor(true);
                        }}
                        onDelete={() => {}}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-fade-in">
              {userTemplates && userTemplates.length > 0 ? (
                <div className="space-y-4">
                  {userTemplates.map((t) => (
                    <TemplateCard
                      key={t.id || t._id}
                      template={t}
                      isSystem={false}
                      onUse={handleUseTemplate}
                      onEdit={(tmpl) => {
                        setEditingTemplate(tmpl);
                        setShowEditor(true);
                      }}
                      onDelete={handleDeleteTemplate}
                    />
                  ))}
                </div>
              ) : (
                <div className="card p-12 text-center border-dashed border-2">
                  <GiMuscleUp className="text-brand/20 text-6xl mx-auto mb-4" />
                  <p className="text-[#F0F0F5] text-xl font-black uppercase mb-2">Build Your Arsenal</p>
                  <p className="text-muted text-lg mb-6 max-w-xs mx-auto">Create custom workout templates to track your unique training style.</p>
                  <button
                    onClick={() => {
                      setEditingTemplate(null);
                      setShowEditor(true);
                    }}
                    className="btn-primary flex items-center gap-3 mx-auto px-8 py-4 text-xl"
                  >
                    <FiPlus />
                    Create First Template
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {showEditor && (
        <TemplateEditor
          template={editingTemplate}
          exercises={exercises}
          onSave={handleSaveTemplate}
          onClose={() => {
            setShowEditor(false);
            setEditingTemplate(null);
          }}
        />
      )}
    </div>
  );
}
