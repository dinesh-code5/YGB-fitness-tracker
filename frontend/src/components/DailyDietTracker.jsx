import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiPlus, FiZap } from 'react-icons/fi';

export default function DailyDietTracker() {
  const { user, dashboardData } = useAuth();
  const entries = dashboardData?.todayLogs || [];
  const dietPlan = dashboardData?.dietPlan;

  const total = entries.reduce((acc, curr) => ({
    calories: acc.calories + Number(curr.calories),
    protein: acc.protein + Number(curr.protein),
    carbs: acc.carbs + Number(curr.carbs || 0),
    fats: acc.fats + Number(curr.fats)
  }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

  const targets = dietPlan || { calories: 2000, protein: 150, carbs: 250, fats: 70 };
  const targetCal = targets.targetCalories || targets.calories;

  const calPct = Math.min(100, Math.round((total.calories / targetCal) * 100));

  return (
    <div className="card p-6 space-y-6 hover:border-brand/40 transition-all group/diet">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="section-title text-lg group-hover/diet:text-brand transition-colors mb-1">Today's Nutrition</h3>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">Fueling your {user?.goal || 'progress'}</p>
        </div>
        <FiZap className="text-brand animate-pulse" />
      </div>

      {/* Progress Bar */}
      <div className="space-y-3">
        <div className="flex justify-between items-end">
          <div className="flex flex-col">
            <p className="text-3xl font-black text-brand leading-none mb-1">
              {Math.round(total.calories)} <span className="text-xs font-bold text-muted uppercase tracking-widest">kcal</span>
            </p>
            <p className="text-[10px] font-black text-muted uppercase tracking-widest">Total Energy</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-black text-[var(--text-primary)] leading-none mb-1">
              {entries.length === 0 ? 77 : calPct}%
            </p>
            <p className="text-[10px] text-muted font-bold uppercase tracking-widest">Consumed</p>
          </div>
        </div>
        <div className="w-full h-4 bg-[var(--surface-elevated)] rounded-xl overflow-hidden border border-white/5 p-[2px] relative">
          <div 
            className="h-full bg-gradient-to-r from-brand to-accent rounded-lg transition-all duration-1000 shadow-[0_0_15px_rgba(0,212,255,0.3)] relative overflow-hidden" 
            style={{ width: `${entries.length === 0 ? 77 : calPct}%` }}
          >
            <div className="absolute inset-0 bg-white/10 animate-pulse" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {/* Macros */}
        {[
          { l: 'Protein', v: total.protein, c: 'text-brand', b: 'border-brand/20' },
          { l: 'Carbs', v: total.carbs, c: 'text-blue-400', b: 'border-blue-400/20' },
          { l: 'Fats', v: total.fats, c: 'text-accent', b: 'border-accent/20' },
        ].map(m => (
          <div key={m.l} className={`p-3 bg-[var(--surface-elevated)] rounded-xl border ${m.b}`}>
            <p className="text-[9px] font-black uppercase tracking-tighter text-muted mb-1">{m.l}</p>
            <p className={`text-base font-bold ${m.c}`}>{Math.round(m.v)}g</p>
          </div>
        ))}
      </div>

      <div className="pt-2">
        <Link to="/diet" className="w-full btn-primary py-4 text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-glow">
          <FiPlus className="text-lg" /> Log Meal
        </Link>
      </div>
    </div>
  );
}
