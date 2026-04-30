import React, { useEffect, useState } from 'react';
import { workoutAPI, userAPI } from '../utils/api';
import LockedFeature from '../components/LockedFeature';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { FiTrendingUp, FiZap } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const CHART_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top', labels: { color: '#8888AA', font: { size: 10 } } },
    tooltip: { mode: 'index', intersect: false },
  },
  scales: {
    x: { ticks: { color: '#8888AA', font: { size: 10 } }, grid: { display: false } },
    y: { ticks: { color: '#8888AA', font: { size: 10 } }, grid: { color: 'rgba(156, 163, 175, 0.1)' } },
  },
};

export default function Progress() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [weightHistory, setWeightHistory] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [weightForm, setWeightForm] = useState('');
  const [logWeightOpen, setLogWeightOpen] = useState(false);

  useEffect(() => {
    if (!user?.isPremium) {
      setLoading(false);
      return;
    }
    const load = async () => {
      setLoading(true);
      try {
        const [sRes, wRes] = await Promise.all([
          workoutAPI.getStats(days),
          userAPI.getWeightHistory()
        ]);
        setStats(sRes.data.stats);
        setWeightHistory(wRes.data.weightHistory || []);
        const exNames = Object.keys(sRes.data.stats?.strengthProgress || {});
        if (exNames.length > 0 && !selectedExercise) setSelectedExercise(exNames[0]);
      } catch (err) {
        console.error('Progress load error:', err);
        toast.error('Failed to load progress data');
      }
      setLoading(false);
    };
    load();
  }, [days, user?.isPremium]);

  const handleLogWeight = async () => {
    if (!weightForm) return;
    try {
      await userAPI.logWeight(Number(weightForm));
      toast.success('Weight logged!');
      setWeightForm('');
      setLogWeightOpen(false);
      const [sRes, wRes] = await Promise.all([
        workoutAPI.getStats(days),
        userAPI.getWeightHistory()
      ]);
      setStats(sRes.data.stats);
      setWeightHistory(wRes.data.weightHistory || []);
    } catch { toast.error('Failed to log weight'); }
  };

  const volumeChart = {
    labels: stats?.volumeData?.map(d => d.date) || [],
    datasets: [{
      label: 'Volume (kg)',
      data: stats?.volumeData?.map(d => d.volume) || [],
      borderColor: '#00D4FF',
      backgroundColor: 'rgba(0,212,255,0.08)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#00D4FF',
    }]
  };

  const strengthChart = selectedExercise && stats?.strengthProgress?.[selectedExercise] ? {
    labels: stats.strengthProgress[selectedExercise].map(d => d.date),
    datasets: [{
      label: 'Max Weight (kg)',
      data: stats.strengthProgress[selectedExercise].map(d => d.weight),
      borderColor: '#FF6B35',
      backgroundColor: 'rgba(255,107,53,0.08)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#FF6B35',
    }]
  } : null;

  const weightChart = weightHistory.length > 1 ? {
    labels: weightHistory.slice(-30).map(w => new Date(w.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })),
    datasets: [{
      label: 'Weight (kg)',
      data: weightHistory.slice(-30).map(w => w.weight),
      borderColor: '#22C55E',
      backgroundColor: 'rgba(34,197,94,0.05)',
      borderWidth: 3,
      fill: true,
      tension: 0.3,
      pointBackgroundColor: '#22C55E',
    }]
  } : null;

  const firstWeight = weightHistory[0]?.weight;
  const lastWeight = weightHistory[weightHistory.length - 1]?.weight;
  const weightDiff = (lastWeight && firstWeight) ? (lastWeight - firstWeight).toFixed(1) : null;
  const weightTrendColor = user?.goal === 'cut' 
    ? (Number(weightDiff) <= 0 ? 'text-green-400' : 'text-red-400')
    : (Number(weightDiff) >= 0 ? 'text-green-400' : 'text-red-400');

  if (!user?.isPremium) return <LockedFeature title="Performance Tracking" feature="progress" />;

  return (
    <div className="page-container max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-4xl tracking-widest text-brand">PROGRESS ANALYTICS</h1>
        <div className="bg-[var(--surface-elevated)] p-1 rounded-xl flex gap-1 border border-[var(--surface-border)]">
          {[7, 30, 90].map(d => (
            <button key={d} onClick={() => setDays(d)}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${days === d ? 'bg-brand text-[#0F0F14] shadow-glow-sm' : 'text-muted hover:text-[var(--text-primary)]'}`}>
              {d}D
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">Syncing Analytics...</p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { l: 'Workouts', v: stats?.totalWorkouts ?? 0, i: '🏋️' },
              { l: 'Consistency', v: `${stats?.consistency ?? 0}%`, i: '📈' },
              { l: 'Volume', v: stats?.totalVolume ? `${(stats.totalVolume / 1000).toFixed(1)}t` : '0', i: '⚡' },
              { l: 'Avg Time', v: stats?.avgDuration ? `${stats.avgDuration}m` : '—', i: '⏱️' },
            ].map(s => (
              <div key={s.l} className="card p-5 text-center">
                <span className="text-2xl mb-2 block">{s.i}</span>
                <p className="text-xl font-black text-[var(--text-primary)]">{s.v}</p>
                <p className="text-[9px] font-bold text-muted uppercase tracking-widest">{s.l}</p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-6">
                <FiZap className="text-brand text-xl" />
                <h2 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-widest">Training Volume</h2>
              </div>
              <div className="h-64"><Line data={volumeChart} options={CHART_OPTS} /></div>
            </div>
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <FiTrendingUp className="text-accent text-xl" />
                  <h2 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-widest">Strength PRs</h2>
                </div>
                <select className="input-field text-[10px] py-1 w-24 font-black uppercase"
                  value={selectedExercise} onChange={e => setSelectedExercise(e.target.value)}>
                  {Object.keys(stats?.strengthProgress || {}).map(ex => <option key={ex} value={ex}>{ex}</option>)}
                </select>
              </div>
              <div className="h-64">{strengthChart ? <Line data={strengthChart} options={CHART_OPTS} /> : <p className="text-muted text-xs text-center pt-20">No data</p>}</div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-widest">Weight Journey</h2>
              <button onClick={() => setLogWeightOpen(!logWeightOpen)} className="btn-primary py-1.5 text-[10px] uppercase font-black">Log Weight</button>
            </div>
            {logWeightOpen && (
              <div className="flex gap-2 mb-6 animate-slide-up">
                <input type="number" className="input-field text-sm font-bold" placeholder="72.5"
                  value={weightForm} onChange={e => setWeightForm(e.target.value)} autoFocus />
                <button onClick={handleLogWeight} className="btn-primary px-6">SAVE</button>
              </div>
            )}
            <div className="h-80"><Line data={weightChart || { datasets: [] }} options={CHART_OPTS} /></div>
          </div>
        </div>
      )}
    </div>
  );
}
