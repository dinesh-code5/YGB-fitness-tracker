import React, { useState, useEffect } from 'react';
import { dietAPI } from '../utils/api';
import { FiPlus, FiCoffee, FiSun, FiMoon, FiPieChart, FiZap } from 'react-icons/fi';
import { GiMeal, GiBowlOfRice, GiWeightScale } from 'react-icons/gi';
import { FiActivity, FiUser, FiDroplet } from 'react-icons/fi';
import toast from 'react-hot-toast';

const DIET_TYPES = [
  { v: 'veg',        e: '🥦', l: 'Vegetarian' },
  { v: 'eggetarian', e: '🥚', l: 'Eggetarian' },
  { v: 'nonveg',     e: '🍗', l: 'Non-Veg' },
  { v: 'nowhey',     e: '💊', l: 'No Whey' },
];

const ACTIVITY_OPTS = [
  { v: 'sedentary',  l: 'Sedentary' },
  { v: 'light',      l: 'Light' },
  { v: 'moderate',   l: 'Moderate' },
  { v: 'active',     l: 'Active' },
  { v: 'very_active',l: 'Very Active' },
];

const MEAL_ICONS = { 
  Breakfast: <FiCoffee />, Lunch: <FiSun />, Dinner: <FiMoon />, 
  'Evening Snack': <FiPieChart />, 'Pre/Post Workout Snack': <FiZap />,
  'Snack': <FiPieChart />
};

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
      <p className="text-xs font-black uppercase tracking-tighter text-muted">{label}</p>
      <p className="text-base font-bold text-[var(--text-primary)]">{grams}g</p>
      <p className="text-[10px] font-bold text-muted">{Math.round(pct)}%</p>
    </div>
  </div>
);

export default function DietAIPlan({ user, result, refreshLogs }) {
  const [form, setForm] = useState({
    weight: user?.weight || '',
    height: user?.height || '',
    age: user?.age || '',
    gender: user?.gender || 'male',
    activityLevel: user?.activityLevel || 'moderate',
    goal: user?.goal || 'maintain',
    dietType: 'nonveg',
  });
  const [loading, setLoading] = useState(false);
  const [loggingMeal, setLoggingMeal] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});

  useEffect(() => {
    if (result?.mealPlan) {
      const initial = {};
      Object.keys(result.mealPlan).forEach(key => {
        initial[key] = 0; 
      });
      setSelectedOptions(initial);
    }
  }, [result]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleCalculate = async () => {
    const { weight, height, age } = form;
    if (!weight || !height || !age) return toast.error('Please fill all profile fields');
    setLoading(true);
    try {
      await dietAPI.calculate({
        ...form, weight: Number(weight), height: Number(height), age: Number(age)
      });
      refreshLogs();
      toast.success('Your plan is ready! 🥗');
    } catch (err) {
      toast.error('Calculation failed. Try again.');
    }
    setLoading(false);
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
      refreshLogs();
      toast.success('Meal logged! 🥗');
    } catch (err) {
      toast.error('Failed to log meal');
    } finally {
      setLoggingMeal(null);
    }
  };

  return (
    <div className="grid xl:grid-cols-3 gap-8 animate-fade-in">
      {/* Configuration */}
      <div className="xl:col-span-1 space-y-6">
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
                <div key={f.k}>
                  <label className="text-xs font-black uppercase tracking-widest text-brand mb-2 block">{f.l}</label>
                  <div className="relative">
                    {f.i && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">{f.i}</span>}
                    <input type="number" className={`input-field text-2xl font-black ${f.i ? 'pl-10' : ''}`} value={form[f.k]} onChange={e => set(f.k, e.target.value)} />
                  </div>
                </div>
              ))}
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-brand mb-2 block">Gender</label>
                <select className="input-field text-2xl font-black" value={form.gender} onChange={e => set('gender', e.target.value)}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-widest text-brand mb-2 block">Lifestyle</label>
              <select className="input-field text-2xl font-black" value={form.activityLevel} onChange={e => set('activityLevel', e.target.value)}>
                {ACTIVITY_OPTS.map(a => <option key={a.v} value={a.v}>{a.l}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-widest text-brand mb-3 block">Dietary Preference</label>
              <div className="grid grid-cols-2 gap-3">
                {DIET_TYPES.map(d => (
                  <button key={d.v} onClick={() => set('dietType', d.v)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      form.dietType === d.v ? 'border-brand bg-brand/10 shadow-glow-sm' : 'border-[var(--surface-border)] bg-[var(--surface-card)]'
                    }`}>
                    <span className="text-2xl block mb-1">{d.e}</span>
                    <p className="text-xs font-black uppercase truncate">{d.l}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button onClick={handleCalculate} disabled={loading}
                className="btn-primary w-full py-4 flex items-center justify-center gap-3">
                {loading ? <span className="w-5 h-5 border-2 border-[#0F0F14] border-t-transparent rounded-full animate-spin" /> : <><FiZap /> RECALCULATE</>}
              </button>
              
              <button 
                onClick={async () => {
                  const { weight, height, age } = form;
                  if (!weight || !height || !age) return toast.error('Please fill all profile fields');
                  setLoading(true);
                  try {
                    await dietAPI.generateAi({
                      ...form, weight: Number(weight), height: Number(height), age: Number(age)
                    });
                    refreshLogs();
                    toast.success('AI Plan Generated! 🤖🥗');
                  } catch (err) {
                    toast.error(err.response?.data?.message || 'AI Generation failed');
                  }
                  setLoading(false);
                }} 
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand/20 to-accent/20 border border-brand/30 hover:border-brand transition-all flex items-center justify-center gap-3 font-black uppercase tracking-widest text-sm"
              >
                {loading ? <span className="w-5 h-5 border-2 border-brand border-t-transparent rounded-full animate-spin" /> : <><FiZap className="text-brand" /> Generate with AI</>}
              </button>
            </div>
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
          <div className="space-y-8">
            {/* Macros Ring Stats */}
            <div className="flex flex-wrap gap-4">
              <MacroRing label="Protein" grams={result.macros.protein} pct={(result.macros.protein * 4 / result.targetCalories) * 100} color="var(--brand)" icon={FiZap} />
              <MacroRing label="Carbs" grams={result.macros.carbs} pct={(result.macros.carbs * 4 / result.targetCalories) * 100} color="var(--brand)" icon={GiBowlOfRice} />
              <MacroRing label="Fats" grams={result.macros.fats} pct={(result.macros.fats * 9 / result.targetCalories) * 100} color="var(--accent)" icon={FiDroplet} />
            </div>

            {/* Meal Plan Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(result.mealPlan).map(([key, meal], i) => {
                const mealName = meal.label?.split('(')?.[0]?.trim() || key;
                return (
                  <div key={key} className="card overflow-hidden hover:border-brand/30 transition-all group">
                    <div className="p-4 bg-[var(--surface-elevated)] border-b border-[var(--surface-border)] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center text-brand">
                          {MEAL_ICONS[mealName] || <GiMeal />}
                        </div>
                        <h4 className="font-bold text-xs uppercase tracking-widest">{mealName}</h4>
                      </div>
                      <span className="text-[10px] font-black text-muted">{meal.macros?.cal} KCAL</span>
                    </div>
                    <div className="p-4 space-y-3">
                      {meal.options?.slice(0, 3).map((opt, j) => {
                        const logKey = `${key}-${opt}`;
                        const isLogging = loggingMeal === logKey;
                        const isSelected = selectedOptions[key] === j;
                        
                        return (
                          <div key={j} className={`flex items-start justify-between gap-3 p-3 rounded-xl border transition-all ${isSelected ? 'bg-brand/5 border-brand/20' : 'border-transparent hover:border-brand/10'}`}>
                            <p className={`text-xs leading-relaxed ${isSelected ? 'text-[var(--text-primary)] font-bold' : 'text-muted'}`}>{opt}</p>
                            <button 
                              onClick={() => handleLogOption(key, meal, opt, j)}
                              disabled={!!loggingMeal}
                              className="flex-shrink-0 w-7 h-7 rounded-lg bg-[var(--surface-elevated)] text-muted hover:bg-brand hover:text-[#0F0F14] flex items-center justify-center transition-all"
                            >
                              {isLogging ? <div className="w-3 h-3 border-2 border-[#0F0F14] border-t-transparent rounded-full animate-spin" /> : <FiPlus />}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
