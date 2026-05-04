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
    legend: { 
      position: 'top', 
      align: 'end',
      labels: { 
        color: '#8888AA', 
        font: { size: 10, weight: 'bold' },
        usePointStyle: true,
        padding: 15
      } 
    },
    tooltip: { 
      mode: 'index', 
      intersect: false,
      backgroundColor: 'rgba(18, 18, 26, 0.95)',
      titleFont: { size: 12, weight: 'bold' },
      bodyFont: { size: 12 },
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      padding: 12,
      displayColors: true,
      cornerRadius: 8
    },
  },
  scales: {
    x: { 
      ticks: { color: '#8888AA', font: { size: 10 } }, 
      grid: { display: false } 
    },
    y: { 
      ticks: { color: '#8888AA', font: { size: 10 } }, 
      grid: { color: 'rgba(156, 163, 175, 0.05)', drawBorder: false } 
    },
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
  }, [days]); // Removed user?.isPremium check as requested by UI needs

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

  const themeColor = getComputedStyle(document.documentElement).getPropertyValue('--theme-color').trim() || '#F59E0B';

  const volumeChart = {
    labels: stats?.volumeData?.map(d => d.date) || [],
    datasets: [{
      label: 'Volume (kg)',
      data: stats?.volumeData?.map(d => d.volume) || [],
      borderColor: themeColor,
      backgroundColor: `${themeColor}15`,
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: themeColor,
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

  const weightChart = weightHistory.length > 0 ? {
    labels: weightHistory.slice(-30).map(w => new Date(w.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })),
    datasets: [{
      label: 'Weight (kg)',
      data: weightHistory.slice(-30).map(w => w.weight),
      borderColor: themeColor,
      backgroundColor: `${themeColor}15`,
      borderWidth: 3,
      fill: true,
      tension: 0.3,
      pointBackgroundColor: themeColor,
    }]
  } : null;

  const durationChart = {
    labels: stats?.volumeData?.map(d => d.date) || [],
    datasets: [{
      label: 'Duration (min)',
      data: stats?.volumeData?.map(d => d.duration || 0) || [],
      borderColor: '#9B59FF',
      backgroundColor: 'rgba(155, 89, 255, 0.1)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
    }]
  };

  const muscleChart = {
    labels: stats?.muscleDistribution ? Object.keys(stats.muscleDistribution) : [],
    datasets: [{
      label: 'Sets',
      data: stats?.muscleDistribution ? Object.values(stats.muscleDistribution) : [],
      backgroundColor: [
        'rgba(0, 212, 255, 0.6)',
        'rgba(245, 158, 11, 0.6)',
        'rgba(155, 89, 255, 0.6)',
        'rgba(34, 197, 94, 0.6)',
        'rgba(239, 68, 68, 0.6)',
        'rgba(236, 72, 153, 0.6)',
      ],
      borderWidth: 0,
      borderRadius: 4,
    }]
  };

  const firstWeight = weightHistory[0]?.weight;
  const lastWeight = weightHistory[weightHistory.length - 1]?.weight;
  const weightDiff = (lastWeight && firstWeight) ? (lastWeight - firstWeight).toFixed(1) : null;
  const weightTrendColor = user?.goal === 'cut' 
    ? (Number(weightDiff) <= 0 ? 'text-green-400' : 'text-red-400')
    : (Number(weightDiff) >= 0 ? 'text-green-400' : 'text-red-400');

  return (
    <div className="page-container max-w-5xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-4xl tracking-widest text-brand leading-none">PROGRESS ANALYTICS</h1>
          <p className="text-[10px] font-black text-muted uppercase tracking-[0.3em] mt-2">Personal performance dashboard</p>
        </div>
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
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { l: 'Workouts', v: stats?.totalWorkouts ?? 0, i: '🏋️', c: 'text-brand' },
              { l: 'Consistency', v: `${stats?.consistency ?? 0}%`, i: '📈', c: 'text-green-400' },
              { l: 'Volume', v: stats?.totalVolume ? `${(stats.totalVolume / 1000).toFixed(1)}t` : '0', i: '⚡', c: 'text-orange-400' },
              { l: 'Avg Time', v: stats?.avgDuration ? `${stats.avgDuration}m` : '—', i: '⏱️', c: 'text-purple-400' },
            ].map(s => (
              <div key={s.l} className="card p-5 text-center group hover:border-brand/30 transition-all">
                <span className="text-2xl mb-2 block bounce-subtle">{s.i}</span>
                <p className={`text-2xl font-black ${s.c}`}>{s.v}</p>
                <p className="text-[9px] font-black text-muted uppercase tracking-widest mt-1">{s.l}</p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-5 bg-brand rounded-full" />
                <h2 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-widest">Training Volume</h2>
              </div>
              <div className="h-64"><Line data={volumeChart} options={CHART_OPTS} /></div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-5 bg-accent rounded-full" />
                  <h2 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-widest">Strength PRs</h2>
                </div>
                <select className="bg-[var(--surface-elevated)] border border-[var(--surface-border)] rounded-lg text-[10px] py-1 px-2 font-black uppercase text-brand outline-none"
                  value={selectedExercise} onChange={e => setSelectedExercise(e.target.value)}>
                  {Object.keys(stats?.strengthProgress || {}).length > 0 ? 
                    Object.keys(stats.strengthProgress).map(ex => <option key={ex} value={ex}>{ex}</option>) :
                    <option>No data</option>
                  }
                </select>
              </div>
              <div className="h-64">{strengthChart ? <Line data={strengthChart} options={CHART_OPTS} /> : <div className="h-full flex items-center justify-center text-muted text-[10px] font-black uppercase tracking-widest">No strength data yet</div>}</div>
            </div>

            <div className="card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-5 bg-purple-500 rounded-full" />
                <h2 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-widest">Session Duration</h2>
              </div>
              <div className="h-64"><Line data={durationChart} options={CHART_OPTS} /></div>
            </div>

            <div className="card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-5 bg-green-500 rounded-full" />
                <h2 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-widest">Muscle Focus</h2>
              </div>
              <div className="h-64">
                {stats?.muscleDistribution ? 
                  <Line 
                    data={{
                      labels: Object.keys(stats.muscleDistribution),
                      datasets: [{
                        label: 'Sets per muscle',
                        data: Object.values(stats.muscleDistribution),
                        borderColor: '#22C55E',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                      }]
                    }} 
                    options={CHART_OPTS} 
                  /> : 
                  <div className="h-full flex items-center justify-center text-muted text-[10px] font-black uppercase tracking-widest">No distribution data</div>
                }
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-1 h-5 bg-brand rounded-full" />
                <h2 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-widest">Weight Journey</h2>
              </div>
              <div className="flex items-center gap-4">
                {weightDiff !== null && (
                  <span className={`text-xs font-black uppercase tracking-widest ${weightTrendColor}`}>
                    {Number(weightDiff) > 0 ? '+' : ''}{weightDiff}kg Total
                  </span>
                )}
                <button onClick={() => setLogWeightOpen(!logWeightOpen)} className="btn-primary py-1.5 px-4 text-[10px] uppercase font-black tracking-widest">Log Weight</button>
              </div>
            </div>
            {logWeightOpen && (
              <div className="flex gap-2 mb-6 animate-slide-up">
                <input type="number" className="input-field text-lg font-black h-12" placeholder="e.g. 75.0"
                  value={weightForm} onChange={e => setWeightForm(e.target.value)} autoFocus />
                <button onClick={handleLogWeight} className="btn-primary px-8 h-12 font-black">SAVE</button>
              </div>
            )}
            <div className="h-80">
              {weightChart ? <Line data={weightChart} options={CHART_OPTS} /> : <div className="h-full flex items-center justify-center text-muted text-[10px] font-black uppercase tracking-widest">Log weight to see trend</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
