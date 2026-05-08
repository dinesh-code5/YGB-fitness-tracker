import React from 'react';
import { FiTrash2, FiZap, FiPlus, FiDroplet } from 'react-icons/fi';
import { GiMeal } from 'react-icons/gi';
import { useAuth } from '../context/AuthContext';
import { dietAPI } from '../utils/api';
import toast from 'react-hot-toast';

export default function DietToday({ todaysTotal, result, onAddMeal }) {
  const { dashboardData, refreshGlobalData } = useAuth();
  const [selectedDate, setSelectedDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [historyLogs, setHistoryLogs] = React.useState([]);
  const [fetchingHistory, setFetchingHistory] = React.useState(false);

  const entries = selectedDate === new Date().toISOString().split('T')[0] 
    ? (dashboardData?.todayLogs || []) 
    : historyLogs;
    
  const loading = fetchingHistory || (!dashboardData?.stats && dashboardData?.isRefreshing);

  React.useEffect(() => {
    if (selectedDate !== new Date().toISOString().split('T')[0]) {
      fetchHistory();
    }
  }, [selectedDate]);

  const fetchHistory = async () => {
    setFetchingHistory(true);
    try {
      const { data } = await dietAPI.getTodaysLog(selectedDate);
      setHistoryLogs(data.logs);
    } catch {
      toast.error('Failed to fetch history');
    }
    setFetchingHistory(false);
  };

  const changeDate = (days) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleDelete = async (id) => {
    try {
      await dietAPI.deleteLog(id);
      if (selectedDate === new Date().toISOString().split('T')[0]) {
        refreshGlobalData(true);
      } else {
        fetchHistory();
      }
      toast.success('Log removed');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const currentTotal = entries.reduce((acc, curr) => ({
    calories: acc.calories + Number(curr.calories),
    protein: acc.protein + Number(curr.protein),
    carbs: acc.carbs + Number(curr.carbs || 0),
    fats: acc.fats + Number(curr.fats)
  }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

  const remaining = result ? {
    calories: Math.max(0, result.targetCalories - currentTotal.calories),
    protein: Math.max(0, result.macros.protein - currentTotal.protein),
    carbs: Math.max(0, result.macros.carbs - currentTotal.carbs),
    fats: Math.max(0, result.macros.fats - currentTotal.fats)
  } : null;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Remaining Macros Card */}
      {remaining && (
        <div className="card p-8 bg-gradient-to-br from-brand/15 to-transparent border-brand/30 shadow-glow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-full blur-3xl -mr-20 -mt-20" />
          
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-l font-black text-brand uppercase tracking-[0.2em]">
              {selectedDate === new Date().toISOString().split('T')[0] ? 'Consumed Today' : `Stats for ${selectedDate}`}
            </h3>
            <div className="flex items-center gap-2 bg-[var(--surface-elevated)] p-1 rounded-xl border border-brand/10">
              <button onClick={() => changeDate(-1)} className="p-2 hover:text-brand transition-colors"><FiZap className="rotate-180" /></button>
              <span className="text-[10px] font-black uppercase tracking-widest px-2">{selectedDate === new Date().toISOString().split('T')[0] ? 'Today' : selectedDate}</span>
              <button onClick={() => changeDate(1)} className="p-2 hover:text-brand transition-colors"><FiZap /></button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { l: 'Calories', v: Math.round(currentTotal.calories), t: result.targetCalories, u: 'kcal', color: 'text-[var(--text-primary)]' },
              { l: 'Protein', v: Math.round(currentTotal.protein), t: result.macros.protein, u: 'g', color: 'text-brand' },
              { l: 'Carbs', v: Math.round(currentTotal.carbs), t: result.macros.carbs, u: 'g', color: 'text-brand' },
              { l: 'Fats', v: Math.round(currentTotal.fats), t: result.macros.fats, u: 'g', color: 'text-accent' }
            ].map(s => (
              <div key={s.l} className="flex flex-col">
                <span className={`text-4xl font-display ${s.color}`}>{s.v}<span className="text-sm font-body text-muted ml-1 uppercase">{s.u}</span></span>
                <span className="text-m font-bold text-muted uppercase tracking-widest mt-1">{s.l}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-6 border-t border-brand/10">
            <div className="flex items-center justify-between mb-3">
               <div className="flex flex-col">
                  <p className="text-2xl font-black text-brand uppercase tracking-tighter">
                     {entries.length === 0 && selectedDate === new Date().toISOString().split('T')[0] ? 77 : Math.round((currentTotal.calories / result.targetCalories) * 100)}%
                  </p>
                  <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">Consumed</p>
               </div>
               <div className="text-right">
                  <p className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest">
                     Goal: {result.targetCalories} kcal
                  </p>
                  <p className="text-[10px] font-bold text-brand uppercase tracking-widest">
                     {Math.round(result.targetCalories - currentTotal.calories)} kcal {result.targetCalories - currentTotal.calories > 0 ? 'left' : 'over'}
                  </p>
               </div>
            </div>
            <div className="w-full h-6 bg-[var(--surface-elevated)] rounded-2xl overflow-hidden border border-brand/20 p-1 relative">
              <div 
                className="h-full bg-gradient-to-r from-brand to-accent rounded-xl transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(0,212,255,0.4)] relative overflow-hidden" 
                style={{ width: `${entries.length === 0 && selectedDate === new Date().toISOString().split('T')[0] ? 77 : Math.min(100, (currentTotal.calories / result.targetCalories) * 100)}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Row */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display tracking-widest text-[var(--text-primary)] uppercase">Today's Logs</h2>
        <button onClick={onAddMeal} className="btn-primary py-2.5 px-6 flex items-center gap-2 text-sm shimmer">
          <FiPlus /> Add Meal
        </button>
      </div>

      {/* List of Meals */}
      <div className="grid gap-4">
        {loading ? (
          <div className="py-20 text-center"><div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto"/></div>
        ) : entries.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-[var(--surface-border)] rounded-[2rem] bg-[var(--surface-card)]">
            <GiMeal className="text-6xl text-muted/20 mx-auto mb-4" />
            <p className="text-xl text-muted font-medium">No meals logged for today yet.</p>
            <p className="text-sm text-muted/60 mt-1">Start by adding a meal from the library or AI plan.</p>
          </div>
        ) : entries.map(e => (
          <div key={e.id} className="card p-5 flex items-center justify-between hover:border-brand/40 transition-all group">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center text-brand text-xl transition-all">
                <GiMeal />
              </div>
              <div>
                <p className="text-lg font-bold text-[var(--text-primary)] uppercase tracking-tight">{e.name}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs font-black text-brand uppercase tracking-widest">{Math.round(e.calories)} kcal</span>
                  <span className="w-1 h-1 rounded-full bg-muted/40" />
                  <span className="text-[11px] text-muted font-bold uppercase">P: {Math.round(e.protein)}g | C: {Math.round(e.carbs || 0)}g | F: {Math.round(e.fats)}g</span>
                </div>
              </div>
            </div>
            <button onClick={() => handleDelete(e.id)} className="w-10 h-10 rounded-xl flex items-center justify-center text-muted hover:text-red-400 hover:bg-red-400/10 transition-all">
              <FiTrash2 className="text-lg" />
            </button>
          </div>
        ))}
      </div>

      {/* Water Tracking Reminder */}
      <div className="bg-gradient-to-r from-blue-500/20 to-brand/5 border border-brand/20 rounded-[2rem] p-8 flex flex-col md:flex-row items-center gap-6 shadow-glow-sm">
        <div className="w-16 h-16 rounded-2xl bg-brand/20 flex items-center justify-center text-3xl text-brand flex-shrink-0 animate-pulse">
          <FiDroplet />
        </div>
        <div>
          <h3 className="text-xl font-bold text-[var(--text-primary)] uppercase tracking-widest">Hydration Reminder</h3>
          <p className="text-lg text-muted mt-2 leading-relaxed">
            Don't forget to drink at least <span className="text-brand font-bold">{result?.waterIntake || '3-4'} Liters</span> of water today for optimal performance and recovery.
          </p>
        </div>
      </div>
    </div>
  );
}
