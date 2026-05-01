import React, { useState, useEffect } from 'react';
import { dietAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import LockedFeature from '../components/LockedFeature';
import { 
  FiInfo,FiPlus , FiTarget, FiActivity, FiUser, 
  FiDroplet, FiZap, FiCheckCircle, FiChevronRight,
  FiPieChart, FiCoffee, FiSun, FiMoon
} from 'react-icons/fi';
import { GiMeal, GiBowlOfRice, GiWeightScale } from 'react-icons/gi';
import toast from 'react-hot-toast';

const DIET_TYPES = [
  { v: 'veg',        e: '🥦', l: 'Vegetarian',   desc: 'No meat/eggs' },
  { v: 'eggetarian', e: '🥚', l: 'Eggetarian',    desc: 'Veg + eggs' },
  { v: 'nonveg',     e: '🍗', l: 'Non-Veg',       desc: 'Chicken/fish' },
  { v: 'nowhey',     e: '💊', l: 'No Whey',        desc: 'No supplements' },
];

const ACTIVITY_OPTS = [
  { v: 'sedentary',  l: 'Sedentary',          d: 'Little to no exercise' },
  { v: 'light',      l: 'Light',              d: '1-3 days/week' },
  { v: 'moderate',   l: 'Moderate',           d: '3-5 days/week' },
  { v: 'active',     l: 'Active',             d: '6-7 days/week' },
  { v: 'very_active',l: 'Very Active',        d: 'Physical job / Athlete' },
];

const MacroRing = ({ label, grams, pct, color, icon: Icon }) => (
  <div className="flex flex-col items-center gap-2 p-4 card-elevated rounded-2xl flex-1 min-w-[120px]">
    <div className="relative w-16 h-16">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="16" fill="none" className="stroke-[var(--surface-border)]" strokeWidth="3" />
        <circle cx="18" cy="18" r="16" fill="none" stroke={color} strokeWidth="3"
          strokeDasharray="100 100" strokeDashoffset={100 - pct}
          strokeLinecap="round" className="transition-all duration-1000 ease-out" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <Icon className="text-lg" style={{ color }} />
      </div>
    </div>
    <div className="text-center">
      <p className="text-[10px] font-black uppercase tracking-tighter text-muted">{label}</p>
      <p className="text-sm font-bold text-[var(--text-primary)]">{grams}g</p>
      <p className="text-[9px] font-bold text-muted">{Math.round(pct)}%</p>
    </div>
  </div>
);

export default function DietCalculator() {
  const { user } = useAuth();
  
  const [form, setForm] = useState({
    weight: user?.weight || '',
    height: user?.height || '',
    age: user?.age || '',
    gender: user?.gender || 'male',
    activityLevel: user?.activityLevel || 'moderate',
    goal: user?.goal || 'maintain',
    dietType: 'nonveg',
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    if (!user?.isPremium) {
      setFetching(false);
      return;
    }
    dietAPI.get()
      .then(r => {
        if (r.data.dietPlan) setResult(r.data.dietPlan);
      })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [user?.isPremium]);

  const handleCalculate = async () => {
    const { weight, height, age } = form;
    if (!weight || !height || !age) return toast.error('Please fill all profile fields');
    setLoading(true);
    try {
      const res = await dietAPI.calculate({
        ...form, weight: Number(weight), height: Number(height), age: Number(age)
      });
      setResult(res.data.dietPlan);
      toast.success('Your plan is ready! 🥗');
    } catch (err) {
      toast.error('Calculation failed. Try again.');
    }
    setLoading(false);
  };

  const MEAL_ICONS = { 
    Breakfast: <FiCoffee />, Lunch: <FiSun />, Dinner: <FiMoon />, 
    'Evening Snack': <FiPieChart />, 'Pre/Post Workout Snack': <FiZap />,
    'Snack': <FiPieChart />
  };

  const [loggingMeal, setLoggingMeal] = useState(null);
  const [todaysTotal, setTodaysTotal] = useState({ calories: 0, protein: 0, carbs: 0, fats: 0 });
  const [selectedOptions, setSelectedOptions] = useState({});

  useEffect(() => {
    if (result?.mealPlan) {
      const initial = {};
      Object.keys(result.mealPlan).forEach(key => {
        initial[key] = 0; // Default to first option
      });
      setSelectedOptions(initial);
    }
  }, [result]);

  useEffect(() => {
    fetchTodaysLogs();
    window.addEventListener('dietUpdated', fetchTodaysLogs);
    return () => window.removeEventListener('dietUpdated', fetchTodaysLogs);
  }, []);

  const fetchTodaysLogs = async () => {
    try {
      const { data } = await dietAPI.getTodaysLog();
      const totals = data.logs.reduce((acc, curr) => ({
        calories: acc.calories + Number(curr.calories),
        protein: acc.protein + Number(curr.protein),
        carbs: acc.carbs + (Number(curr.carbs) || 0),
        fats: acc.fats + Number(curr.fats)
      }), { calories: 0, protein: 0, carbs: 0, fats: 0 });
      setTodaysTotal(totals);
    } catch (err) {
      console.error('Failed to fetch today\'s logs:', err);
    }
  };

  const handleLogOption = async (mealKey, meal, optionName, optionIndex) => {
    const logKey = `${mealKey}-${optionName}`;
    setLoggingMeal(logKey);
    setSelectedOptions(prev => ({ ...prev, [mealKey]: optionIndex }));
    try {
      await dietAPI.logMeal({
        name: optionName,
        calories: meal.macros?.cal || 0,
        protein: meal.macros?.protein || 0,
        carbs: Math.round((meal.macros?.cal * 0.45) / 4) || 0,
        fats: Math.round((meal.macros?.cal * 0.25) / 9) || 0,
      });
      window.dispatchEvent(new CustomEvent('dietUpdated'));
      toast.success('Meal logged! 🥗');
    } catch (err) {
      toast.error('Failed to log meal');
    } finally {
      setLoggingMeal(null);
    }
  };

  if (!user?.isPremium) return <LockedFeature title="Diet Master" feature="diet" />;

  const remaining = result ? {
    calories: Math.max(0, result.targetCalories - todaysTotal.calories),
    protein: Math.max(0, result.macros.protein - todaysTotal.protein),
    carbs: Math.max(0, result.macros.carbs - todaysTotal.carbs),
    fats: Math.max(0, result.macros.fats - todaysTotal.fats)
  } : null;

  if (fetching) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="page-container">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div>
          <h1 className="font-display text-5xl tracking-widest text-brand">DIET MASTER</h1>
          <p className="text-muted text-sm font-medium mt-1">Smart nutritional planning for your fitness journey</p>
        </div>
        {result && (
          <div className="flex flex-col gap-2">
            <div className="bg-brand/10 border border-brand/20 p-4 rounded-2xl flex items-center gap-6 px-8 backdrop-blur-sm shadow-glow-sm">
              <div className="text-center">
                <p className="text-[10px] font-black text-brand uppercase tracking-widest">Daily Goal</p>
                <p className="text-3xl font-display text-[var(--text-primary)]">{result.targetCalories} <span className="text-sm font-body text-muted uppercase">kcal</span></p>
              </div>
              <div className="w-px h-10 bg-brand/20" />
              <div className="text-center">
                <p className="text-[10px] font-black text-brand uppercase tracking-widest">Water</p>
                <p className="text-3xl font-display text-[var(--text-primary)]">{result.waterIntake}<span className="text-sm font-body text-muted uppercase ml-1">L</span></p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid xl:grid-cols-3 gap-8 items-start">
        {/* Profile Settings - Sticky on Desktop */}
        <div className="xl:col-span-1 space-y-6 xl:sticky xl:top-6">
          {remaining && (
             <div className="card p-6 bg-gradient-to-br from-brand/10 to-transparent border-brand/30 shadow-glow-sm animate-fade-in">
                <h3 className="text-xs font-black text-brand uppercase tracking-[0.2em] mb-4">Remaining Today</h3>
                <div className="grid grid-cols-2 gap-4">
                   <div className="flex flex-col">
                      <span className="text-2xl font-display text-[var(--text-primary)]">{Math.round(remaining.calories)}</span>
                      <span className="text-[10px] font-bold text-muted uppercase">Calories (kcal)</span>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-2xl font-display text-[var(--text-primary)]">{Math.round(remaining.protein)}g</span>
                      <span className="text-[10px] font-bold text-muted uppercase">Protein</span>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-2xl font-display text-[var(--text-primary)]">{Math.round(remaining.carbs)}g</span>
                      <span className="text-[10px] font-bold text-muted uppercase">Carbs</span>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-2xl font-display text-[var(--text-primary)]">{Math.round(remaining.fats)}g</span>
                      <span className="text-[10px] font-bold text-muted uppercase">Fats</span>
                   </div>
                </div>
                <div className="mt-4 pt-4 border-t border-brand/10">
                   <div className="w-full h-1.5 bg-[var(--surface-elevated)] rounded-full overflow-hidden">
                      <div 
                         className="h-full bg-brand transition-all duration-500" 
                         style={{ width: `${Math.min(100, (todaysTotal.calories / result.targetCalories) * 100)}%` }}
                      />
                   </div>
                   <p className="text-[9px] font-bold text-muted mt-2 uppercase tracking-widest">
                      {Math.round((todaysTotal.calories / result.targetCalories) * 100)}% Consumed
                   </p>
                </div>
             </div>
          )}
          <div className="card p-6 border-brand/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand to-accent" />
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <FiUser className="text-brand"/> CONFIGURATION
            </h2>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { l: 'Weight (kg)', k: 'weight', i: <GiWeightScale /> },
                  { l: 'Height (cm)', k: 'height', i: <FiActivity /> },
                  { l: 'Age', k: 'age', i: null },
                ].map(f => (
                  <div key={f.k} className={f.k === 'age' ? '' : ''}>
                    <label className="label text-[10px]">{f.l}</label>
                    <div className="relative">
                      {f.i && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">{f.i}</span>}
                      <input type="number" className={`input-field text-sm ${f.i ? 'pl-9' : ''}`} value={form[f.k]} onChange={e => set(f.k, e.target.value)} />
                    </div>
                  </div>
                ))}
                <div>
                  <label className="label text-[10px]">Gender</label>
                  <select className="input-field text-sm" value={form.gender} onChange={e => set('gender', e.target.value)}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label text-[10px]">Lifestyle</label>
                <select className="input-field text-sm" value={form.activityLevel} onChange={e => set('activityLevel', e.target.value)}>
                  {ACTIVITY_OPTS.map(a => <option key={a.v} value={a.v}>{a.l}</option>)}
                </select>
              </div>

              <div>
                <label className="label text-[10px] mb-3">Dietary Preference</label>
                <div className="grid grid-cols-2 gap-2">
                  {DIET_TYPES.map(d => (
                    <button key={d.v} onClick={() => set('dietType', d.v)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        form.dietType === d.v ? 'border-brand bg-brand/5 ring-1 ring-brand/20' : 'border-[var(--surface-border)] bg-[var(--surface-card)]'
                      }`}>
                      <span className="text-xl block mb-1">{d.e}</span>
                      <p className="text-[10px] font-bold uppercase truncate">{d.l}</p>
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={handleCalculate} disabled={loading}
                className="btn-primary w-full py-4 flex items-center justify-center gap-3">
                {loading ? <span className="w-5 h-5 border-2 border-[#0F0F14] border-t-transparent rounded-full animate-spin" /> : <><FiZap /> RECALCULATE PLAN</>}
              </button>
            </div>
          </div>
        </div>

        {/* Results Area */}
        <div className="xl:col-span-2 space-y-8">
          {!result ? (
            <div className="card p-20 text-center flex flex-col items-center">
              <GiBowlOfRice className="text-6xl text-brand/20 mb-4" />
              <h3 className="text-2xl font-bold mb-2">Build Your Nutrition Base</h3>
              <p className="text-muted max-w-sm">Complete your profile to generate a detailed meal plan aligned with your fitness goals.</p>
            </div>
          ) : (
            <div className="animate-fade-in space-y-8">
              {/* Macros Ring Stats */}
              <div className="flex flex-wrap gap-4">
                <MacroRing label="Protein" grams={result.macros.protein} pct={(result.macros.protein * 4 / result.targetCalories) * 100} color="var(--brand)" icon={FiZap} />
                <MacroRing label="Carbs" grams={result.macros.carbs} pct={(result.macros.carbs * 4 / result.targetCalories) * 100} color="#F59E0B" icon={GiBowlOfRice} />
                <MacroRing label="Fats" grams={result.macros.fats} pct={(result.macros.fats * 9 / result.targetCalories) * 100} color="var(--accent)" icon={FiDroplet} />
              </div>

              {/* Water Recommendation Banner */}
              <div className="bg-gradient-to-r from-blue-500/20 to-brand/5 border border-brand/20 rounded-[2rem] p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 shadow-glow-sm">
                <div className="w-16 h-16 rounded-2xl bg-brand/20 flex items-center justify-center text-3xl text-brand flex-shrink-0 animate-pulse">
                  <FiDroplet />
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">Optimize Your Hydration</h3>
                  <p className="text-sm text-muted mt-1 leading-relaxed">
                    Based on your activity level, aim for <span className="text-brand font-bold">{result.waterIntake} - {Math.round((result.waterIntake + 1) * 10) / 10} Liters</span> of water daily. 
                    Proper hydration increases metabolism by up to 30% and significantly improves muscle recovery.
                  </p>
                </div>
              </div>

              {/* Meal Plan Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(result.mealPlan).map(([key, meal], i) => {
                  const mealName = meal.label?.split('(')[0]?.trim() || key;
                  return (
                    <div key={key} className="card overflow-hidden hover:border-brand/30 transition-all group">
                      <div className="p-4 bg-[var(--surface-elevated)] border-b border-[var(--surface-border)] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center text-brand">
                            {MEAL_ICONS[mealName] || <GiMeal />}
                          </div>
                          <h4 className="font-bold text-xs uppercase tracking-widest">{mealName}</h4>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black text-muted group-hover:text-brand transition-colors">{meal.macros?.cal} KCAL</span>
                        </div>
                      </div>
                      <div className="p-4 space-y-3">
                        <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Suggested Options:</p>
                        {meal.options?.slice(0, 3).map((opt, j) => {
                          const logKey = `${key}-${opt}`;
                          const isLogging = loggingMeal === logKey;
                          const isSelected = selectedOptions[key] === j;
                          
                          return (
                            <div 
                              key={j} 
                              onClick={() => setSelectedOptions(prev => ({ ...prev, [key]: j }))}
                              className={`flex items-start justify-between gap-3 p-3 rounded-xl border group/opt transition-all cursor-pointer hover:border-brand/30 ${isSelected ? 'bg-brand/5 border-brand/20' : 'border-transparent'}`}
                            >
                              <div className="flex gap-3">
                                <div className={`mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-brand' : 'bg-muted'}`} />
                                <p className={`text-xs leading-relaxed ${isSelected ? 'text-[var(--text-primary)] font-bold' : 'text-muted'}`}>{opt}</p>
                              </div>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleLogOption(key, meal, opt, j); }}
                                disabled={!!loggingMeal}
                                className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                                  isLogging 
                                    ? 'bg-brand' 
                                    : 'bg-[var(--surface-elevated)] text-muted hover:bg-brand hover:text-[#0F0F14] hover:shadow-glow-sm'
                                }`}
                                title="Log this choice"
                              >
                                {isLogging ? (
                                  <div className="w-3 h-3 border-2 border-[#0F0F14] border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <FiPlus className="text-sm" />
                                )}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Health Stats Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { l: 'BMR', v: result.bmr, s: 'Basal Metabolism' },
                  { l: 'TDEE', v: result.tdee, s: 'Daily Burn' },
                  { l: 'BMI', v: result.bmi, s: 'Body Mass Index' },
                  { l: 'WATER', v: `${result.waterIntake}L`, s: 'Optimal Hydration' }
                ].map(s => (
                  <div key={s.l} className="card p-4 text-center">
                    <p className="text-[10px] font-black text-brand tracking-widest">{s.l}</p>
                    <p className="text-xl font-display my-1">{s.v}</p>
                    <p className="text-[8px] text-muted uppercase font-bold">{s.s}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
