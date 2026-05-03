import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { userAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { 
  FiArrowLeft, FiActivity, FiGlobe, 
  FiChevronRight, FiCheck, FiCamera, FiZap
} from 'react-icons/fi';
import { GiMuscleUp } from 'react-icons/gi';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import toast from 'react-hot-toast';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Reuse components from Profile.jsx logic
const WeeklyBlocks = ({ workouts }) => {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const getMonday = (d) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff)).setHours(0,0,0,0);
  };
  
  const monday = getMonday(new Date());
  const weekDates = [...Array(7)].map((_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return d.toDateString();
  });

  const workoutDates = new Set(workouts.map(w => new Date(w.createdAt).toDateString()));

  return (
    <div className="flex justify-between gap-2">
      {days.map((day, i) => {
        const active = workoutDates.has(weekDates[i]);
        const isToday = weekDates[i] === new Date().toDateString();
        return (
          <div key={i} className="flex flex-col items-center gap-2 flex-1">
            <div className={`w-full aspect-square rounded-lg flex items-center justify-center border transition-all duration-300 ${
              active 
                ? 'bg-brand/20 border-brand/50 text-brand' 
                : isToday ? 'border-brand/40 bg-brand/5' : 'border-[var(--surface-border)] bg-[var(--surface-elevated)]/30'
            }`}>
              {active && <FiCheck className="text-xs" />}
            </div>
            <span className={`text-[10px] font-medium tracking-tight ${active || isToday ? 'text-brand' : 'text-muted'}`}>
              {day}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const GymBarChart = ({ workouts }) => {
  const getWeekNumber = (d) => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return weekNo;
  };

  const last6Weeks = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - (i * 7));
    last6Weeks.push({
      week: getWeekNumber(d),
      year: d.getFullYear(),
      label: i === 0 ? 'This Week' : `${i}w ago`,
      count: 0
    });
  }

  workouts.forEach(w => {
    const d = new Date(w.createdAt);
    const wn = getWeekNumber(d);
    const yr = d.getFullYear();
    const weekObj = last6Weeks.find(l => l.week === wn && l.year === yr);
    if (weekObj) weekObj.count++;
  });

  const themeColor = getComputedStyle(document.documentElement).getPropertyValue('--theme-color').trim() || '#F59E0B';

  const data = {
    labels: last6Weeks.map(l => l.label),
    datasets: [
      {
        label: 'Sessions',
        data: last6Weeks.map(l => l.count),
        backgroundColor: themeColor,
        borderRadius: 8,
        barThickness: 20,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1A1A24',
        titleColor: themeColor,
        bodyColor: '#fff',
        padding: 12,
        cornerRadius: 12,
        displayColors: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
        ticks: { color: '#8888AA', stepSize: 1, font: { size: 10 } }
      },
      x: {
        grid: { display: false, drawBorder: false },
        ticks: { color: '#8888AA', font: { size: 10 } }
      }
    }
  };

  return (
    <div className="h-48 w-full">
      <Bar data={data} options={options} />
    </div>
  );
};

export default function UserProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [zoomPhoto, setZoomPhoto] = useState(null);

  useEffect(() => {
    setLoading(true);
    userAPI.getPublicProfile(username)
      .then(r => setProfile(r.data.user))
      .catch(() => {
        toast.error('Profile not found');
        navigate('/social');
      })
      .finally(() => setLoading(false));
  }, [username, navigate]);

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!profile) return null;

  return (
    <div className="pb-24 animate-fade-in space-y-8">
      {/* ── Back Button ────────────────────────────────────────── */}
      <div className="max-w-xl mx-auto px-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted hover:text-brand transition-all group">
          <div className="w-8 h-8 rounded-lg bg-[var(--surface-elevated)] border border-[var(--surface-border)] flex items-center justify-center group-hover:border-brand/40">
            <FiArrowLeft className="group-hover:-translate-x-0.5 transition-transform" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">Community</span>
        </button>
      </div>

      {/* ── Profile Header ────────────────────────────────────────── */}
      <div className="relative px-4">
        <div className="max-w-xl mx-auto">
          <div className="card p-8 relative overflow-hidden group border-brand/10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full blur-3xl -mr-16 -mt-16" />
            
            <div className="relative z-10 flex flex-col items-center text-center">
              {/* Avatar Section */}
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-brand/20 rounded-full blur-2xl" />
                <div className="relative w-28 h-28 rounded-full flex items-center justify-center text-5xl font-black text-brand transition-all duration-500
                  bg-[var(--surface-elevated)] border-2 border-brand shadow-xl">
                  {profile.name?.charAt(0)}
                </div>
              </div>

              {/* User Identity */}
              <div className="space-y-1 mb-6">
                 <div className="flex items-center justify-center gap-3">
                   <h1 className="font-display text-4xl tracking-wider text-[var(--text-primary)] leading-tight">{profile.name}</h1>
                   {profile.isCoach && (
                     <span className="px-2 py-0.5 rounded bg-brand text-[#0A0A0F] text-[8px] font-black uppercase tracking-tighter">Coach</span>
                   )}
                 </div>
                 <p className="text-xs text-brand font-black uppercase tracking-[0.25em]">@{profile.username}</p>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap justify-center gap-2">
                <span className="px-3 py-1 rounded-lg bg-brand/10 border border-brand/20 text-[10px] font-black uppercase text-brand tracking-widest">{profile.goal}</span>
                <span className="px-3 py-1 rounded-lg bg-[var(--surface-elevated)] border border-[var(--surface-border)] text-[10px] font-black uppercase text-muted tracking-widest">{profile.experience}</span>
                {profile.currentStreak > 0 && (
                  <span className="px-3 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20 text-[10px] font-black uppercase text-orange-400 tracking-widest flex items-center gap-1.5">
                    <FiZap className="text-[10px]" /> {profile.currentStreak} Day Streak
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content Body ────────────────────────────────────────────────── */}
      <div className="page-container max-w-xl pt-0">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          {[
            { label: 'Current Streak', value: `${profile.currentStreak || 0}d`, icon: '🔥' },
            { label: 'All-Time Best', value: `${profile.longestStreak || 0}d`, icon: '🏆' },
            { label: 'Training Level', value: profile.experience || 'Beginner', icon: '💪' },
            { label: 'Primary Goal', value: profile.goal || 'Maintain', icon: '🎯' },
          ].map(s => (
            <div key={s.label} className="card p-5 group hover:border-brand/30 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg">{s.icon}</span>
                <span className="text-[9px] font-black uppercase text-muted tracking-widest">{s.label}</span>
              </div>
              <p className="text-xl font-black text-[var(--text-primary)] group-hover:text-brand transition-colors capitalize">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Bio Section */}
        {profile.bio && (
          <div className="mb-10 card p-6 border-dashed bg-transparent">
             <div className="flex items-center gap-2 mb-3 text-muted">
               <FiUser className="text-xs" />
               <span className="text-[10px] font-black uppercase tracking-widest">About Athlete</span>
             </div>
             <p className="text-lg text-[var(--text-secondary)] leading-relaxed italic">"{profile.bio}"</p>
          </div>
        )}

        {/* Training Consistency */}
        <div className="mb-10">
          <h3 className="section-title mb-5 flex items-center gap-2">
            <div className="heading-accent" />
            Training Momentum
          </h3>
          <div className="card p-6 bg-gradient-to-b from-[var(--surface-elevated)]/20 to-transparent">
            <WeeklyBlocks workouts={profile.workoutHistory || []} />
          </div>
        </div>

        {/* Activity Chart */}
        <div className="mb-10">
          <h3 className="section-title mb-5 flex items-center gap-2">
            <div className="heading-accent" />
            Recent Consistency
          </h3>
          <div className="card p-6">
            <GymBarChart workouts={profile.workoutHistory || []} />
          </div>
        </div>

        {/* Evolution Journey */}
        {profile.progressPhotos && profile.progressPhotos.length > 0 && (
          <div className="mb-10">
            <h3 className="section-title mb-5 flex items-center gap-2">
              <div className="heading-accent" />
              Evolution Journey
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {profile.progressPhotos.slice(0, 9).reverse().map((photo, idx) => (
                <div key={idx} 
                  onClick={() => setZoomPhoto(photo)}
                  className="aspect-[3/4] rounded-xl bg-[var(--surface-elevated)] overflow-hidden cursor-pointer hover:scale-[1.02] transition-all border border-[var(--surface-border)] group">
                  {photo?.imageUrl && (
                    <img src={photo.imageUrl} alt="Progress" className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Joined Date */}
        <div className="pt-10 border-t border-[var(--surface-border)] text-center">
          <p className="text-[9px] text-muted font-black uppercase tracking-[0.2em] opacity-40">
            Member Since {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : 'recently'}
          </p>
        </div>

      </div>

      {/* ── Photo Zoom Modal ────────────────────────────────────────── */}
      {zoomPhoto && (
        <div className="fixed inset-0 bg-[#0A0A0F]/95 z-[110] flex items-center justify-center p-6 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setZoomPhoto(null)}>
          <div className="relative max-w-lg w-full bg-[var(--surface-card)] rounded-3xl overflow-hidden border border-white/5 shadow-2xl" onClick={e => e.stopPropagation()}>
            <img src={zoomPhoto.imageUrl} alt="Zoomed" className="w-full h-auto" />
            <button className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/80 rounded-2xl flex items-center justify-center text-white text-xl transition-all" onClick={() => setZoomPhoto(null)}>
              <FiX />
            </button>
            {zoomPhoto.weight && (
              <div className="p-8">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-2xl font-black text-brand tracking-tighter">{zoomPhoto.weight} KG</p>
                  <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">{new Date(zoomPhoto.date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</p>
                </div>
                {zoomPhoto.note && <p className="text-lg text-[var(--text-primary)] font-light leading-relaxed italic opacity-80">"{zoomPhoto.note}"</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
