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

  const data = {
    labels: last6Weeks.map(l => l.label),
    datasets: [
      {
        label: 'Sessions',
        data: last6Weeks.map(l => l.count),
        backgroundColor: '#00D4FF',
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
        titleColor: '#00D4FF',
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
    <div className="page-container max-w-xl pb-24">
      {/* Back Button */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted hover:text-brand transition-colors mb-8 group">
        <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Back to Community</span>
      </button>

      {/* Profile Header */}
      <div className="flex items-center gap-6 mb-12">
        <div className="w-24 h-24 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-4xl font-light text-brand shadow-glow-sm">
          {profile.name?.charAt(0)}
        </div>
        <div>
          <div className="flex items-center gap-3">
             <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] leading-none">{profile.name}</h1>
             {profile.isCoach && <span className="badge-brand">Coach</span>}
          </div>
          <p className="text-base text-brand font-mono font-medium mt-2">@{profile.username}</p>
        </div>
      </div>

      {/* Bio Section */}
      {profile.bio && (
        <div className="mb-12 px-1">
          <p className="text-sm text-muted leading-relaxed font-light italic">"{profile.bio}"</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-12">
        {[
          { label: 'Current Streak', value: `${profile.currentStreak || 0} Days`, sub: 'Active momentum' },
          { label: 'Personal Best', value: `${profile.longestStreak || 0} Days`, sub: 'Longest streak' },
          { label: 'Training Level', value: profile.experience || 'Beginner', sub: 'Experience' },
          { label: 'Athlete Goal', value: profile.goal || 'Maintain', sub: 'Primary focus' },
        ].map(s => (
          <div key={s.label} className="p-5 rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-card)] hover:bg-brand/5 hover:border-brand/30 hover:shadow-glow-sm transition-all duration-300 group cursor-default">
            <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-1 group-hover:text-brand transition-colors">{s.label}</p>
            <p className="text-lg font-medium text-[var(--text-primary)] tracking-tight capitalize">{s.value}</p>
            <p className="text-[10px] text-muted/60 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Momentum Tracker */}
      <div className="mb-12">
        <h3 className="text-sm font-semibold tracking-tight text-[var(--text-primary)] mb-6 px-1 uppercase flex items-center gap-2">
          <div className="w-1 h-3 bg-brand rounded-full" />
          Training Momentum
        </h3>
        <div className="p-6 rounded-3xl bg-[var(--surface-elevated)]/20 border border-[var(--surface-border)]">
          <WeeklyBlocks workouts={profile.workoutHistory || []} />
        </div>
      </div>

      {/* Weekly Attendance */}
      <div className="mb-12">
        <h3 className="text-sm font-semibold tracking-tight text-[var(--text-primary)] mb-6 px-1 uppercase flex items-center gap-2">
          <div className="w-1 h-3 bg-brand rounded-full" />
          Recent Consistency
        </h3>
        <div className="p-8 rounded-3xl bg-[var(--surface-elevated)]/20 border border-[var(--surface-border)]">
          <GymBarChart workouts={profile.workoutHistory || []} />
        </div>
      </div>

      {/* Evolution / Progress Photos */}
      {profile.progressPhotos && profile.progressPhotos.length > 0 && (
        <div className="mb-12">
          <h3 className="text-sm font-semibold tracking-tight text-[var(--text-primary)] mb-6 px-1 uppercase flex items-center gap-2">
            <div className="w-1 h-3 bg-brand rounded-full" />
            Evolution Journey
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {profile.progressPhotos.slice(0, 9).reverse().map((photo, idx) => (
              <div key={idx} 
                onClick={() => setZoomPhoto(photo)}
                className="aspect-[3/4] rounded-xl bg-[var(--surface-elevated)] overflow-hidden cursor-pointer hover:opacity-80 transition-all border border-[var(--surface-border)]">
                {photo?.imageUrl && (
                  <img src={photo.imageUrl} alt="Progress" className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-500" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Joined Date */}
      <div className="pt-10 border-t border-[var(--surface-border)] text-center">
        <p className="text-[10px] text-muted font-medium uppercase tracking-widest">
          Member Since {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : 'recently'}
        </p>
      </div>

      {/* Photo Zoom Modal */}
      {zoomPhoto && (
        <div className="fixed inset-0 bg-black/95 z-[110] flex items-center justify-center p-6 backdrop-blur-xl" onClick={() => setZoomPhoto(null)}>
          <div className="relative max-w-lg w-full bg-[var(--surface-card)] rounded-3xl overflow-hidden border border-white/10 shadow-2xl" onClick={e => e.stopPropagation()}>
            <img src={zoomPhoto.imageUrl} alt="Zoomed" className="w-full h-auto" />
            <div className="absolute top-6 right-6">
              <button className="w-10 h-10 bg-black/50 hover:bg-black/80 rounded-2xl flex items-center justify-center text-white text-2xl transition-all" onClick={() => setZoomPhoto(null)}>×</button>
            </div>
            {zoomPhoto.weight && (
              <div className="p-6 bg-[var(--surface-card)]">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xl font-semibold text-brand">{zoomPhoto.weight} KG</p>
                  <p className="text-[10px] font-medium text-muted uppercase tracking-widest">{new Date(zoomPhoto.date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</p>
                </div>
                {zoomPhoto.note && <p className="text-sm text-[var(--text-primary)] font-light leading-relaxed">"{zoomPhoto.note}"</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
