import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dietAPI } from '../utils/api';
import { FiPlus, FiTrash2, FiSave, FiCoffee, FiSun, FiMoon, FiPieChart, FiZap, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function DailyDietTracker() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
    window.addEventListener('dietUpdated', fetchLogs);
    return () => window.removeEventListener('dietUpdated', fetchLogs);
  }, []);

  const fetchLogs = async () => {
    try {
      const { data } = await dietAPI.getTodaysLog();
      setEntries(data.logs);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await dietAPI.deleteLog(id);
      setEntries(entries.filter(e => e.id !== id));
      window.dispatchEvent(new CustomEvent('dietUpdated'));
      toast.success('Log removed');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const total = entries.reduce((acc, curr) => ({
    calories: acc.calories + Number(curr.calories),
    protein: acc.protein + Number(curr.protein),
    carbs: acc.carbs + Number(curr.carbs || 0),
    fats: acc.fats + Number(curr.fats)
  }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

  return (
    <div className="card p-6 space-y-6 hover:border-brand/40 hover:shadow-glow-sm transition-all duration-300 group/diet">
      <div className="flex items-center justify-between">
        <h3 className="section-title group-hover/diet:text-brand transition-colors">Today's Nutrition</h3>
        <Link to="/food-library" className="text-[10px] font-black text-brand uppercase tracking-widest flex items-center gap-1 hover:underline">
          Log Meal <FiArrowRight />
        </Link>
      </div>
      
      {/* Totals Summary */}
      <div className="grid grid-cols-4 gap-2">
        {[ 
          {l:'Calories', v:Math.round(total.calories), u: 'kcal'}, 
          {l:'Protein', v:Math.round(total.protein), u: 'g'},
          {l:'Carbs', v:Math.round(total.carbs), u: 'g'},
          {l:'Fats', v:Math.round(total.fats), u: 'g'} 
        ].map(s => (
          <div key={s.l} className="card-elevated p-3 text-center border-brand/10">
            <p className="text-brand font-black text-xl">{s.v}</p>
            <p className="text-[8px] uppercase font-bold text-muted">{s.l}</p>
          </div>
        ))}
      </div>

      {/* Water Tip */}
      <div className="bg-brand/5 border border-brand/20 rounded-xl p-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-brand/20 flex items-center justify-center text-brand flex-shrink-0">
          <FiZap />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase text-brand tracking-widest">Hydration Goal</p>
          <p className="text-[11px] text-[var(--text-primary)] font-medium">Drink at least 3-4L of water today for optimal recovery.</p>
        </div>
      </div>

      {/* List */}
      <div className="space-y-2">
        {loading ? (
          <div className="py-8 text-center"><div className="w-5 h-5 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto"/></div>
        ) : entries.length === 0 ? (
          <div className="py-8 text-center border border-dashed border-[var(--surface-border)] rounded-2xl">
            <p className="text-xs text-muted">No meals logged today</p>
          </div>
        ) : entries.map(e => (
          <div key={e.id} className="flex items-center justify-between p-3 bg-[var(--surface-elevated)] rounded-xl border border-[var(--surface-border)]">
            <div>
              <p className="text-sm font-bold text-[var(--text-primary)]">{e.name}</p>
              <p className="text-[10px] text-muted font-bold">
                {Math.round(e.calories)} kcal | P: {Math.round(e.protein)}g | C: {Math.round(e.carbs || 0)}g | F: {Math.round(e.fats)}g
              </p>
            </div>
            <button onClick={() => handleDelete(e.id)} className="text-muted hover:text-red-400 p-2 transition-colors"><FiTrash2 /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
